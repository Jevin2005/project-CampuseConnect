const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── Get all colleges (pending and active) ───────────────────────────
async function getColleges(req, res) {
  try {
    const colleges = await prisma.college.findMany({
      include: {
        admins: true,
        _count: { select: { students: true, products: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const pending = [];
    const active = [];

    for (const college of colleges) {
      const firstAdmin = college.admins[0];
      const studentsCount = college._count.students;
      const productsCount = college._count.products;

      // Sum revenue from completed orders in this college
      const revenueAgg = await prisma.order.aggregate({
        _sum: { amount: true },
        where: {
          status: 'COMPLETED',
          product: { collegeId: college.id },
        },
      });
      const revenue = revenueAgg._sum.amount || 0;

      if (!college.isApproved) {
        pending.push({
          id: college.id,
          name: college.name,
          admin: firstAdmin?.name || 'Unknown',
          email: firstAdmin?.email || 'Unknown',
          city: college.city || 'Unknown',
          type: college.type || 'Unknown',
          domain: college.emailDomain,
          code: college.code,
          submitted: college.createdAt,
        });
      } else {
        active.push({
          id: college.id,
          name: college.name,
          city: college.city || 'Unknown',
          type: college.type || 'Unknown',
          code: college.code,
          domain: college.emailDomain,
          students: studentsCount,
          products: productsCount,
          revenue: `₹${revenue.toLocaleString('en-IN')}`,
          revenueRaw: revenue,
          joined: college.createdAt,
        });
      }
    }

    // Compute revenue percentages for active colleges
    const totalRev = active.reduce((s, c) => s + c.revenueRaw, 0);
    active.forEach(c => {
      c.revPct = totalRev > 0 ? Math.round((c.revenueRaw / totalRev) * 100) : 0;
    });

    return res.json({ pending, active });
  } catch (err) {
    console.error('[MasterController.getColleges]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── Approve college ─────────────────────────────────────────────────
async function approveCollege(req, res) {
  try {
    const { collegeId } = req.params;
    await prisma.$transaction(async (tx) => {
      await tx.college.update({ where: { id: collegeId }, data: { isApproved: true } });
      await tx.admin.updateMany({ where: { collegeId }, data: { isApproved: true } });
    });
    return res.json({ message: 'College and admin approved successfully' });
  } catch (err) {
    console.error('[MasterController.approveCollege]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── Reject college ──────────────────────────────────────────────────
async function rejectCollege(req, res) {
  try {
    const { collegeId } = req.params;
    await prisma.$transaction(async (tx) => {
      await tx.admin.deleteMany({ where: { collegeId } });
      await tx.college.delete({ where: { id: collegeId } });
    });
    return res.json({ message: 'College request rejected and removed' });
  } catch (err) {
    console.error('[MasterController.rejectCollege]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── Dashboard Stats ─────────────────────────────────────────────────
async function getDashboardStats(req, res) {
  try {
    const [activeColleges, totalStudents, totalProducts, revenueAgg, recentColleges] =
      await Promise.all([
        prisma.college.count({ where: { isApproved: true } }),
        prisma.student.count({ where: { college: { isApproved: true } } }),
        prisma.product.count({ where: { isApproved: true } }),
        prisma.order.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED' } }),
        // Last 6 months revenue by college
        prisma.college.findMany({
          where: { isApproved: true },
          include: {
            _count: { select: { students: true, products: true } },
          },
          orderBy: { createdAt: 'asc' },
        }),
      ]);

    const totalRevenue = revenueAgg._sum.amount || 0;

    // Per-college revenue breakdown
    const collegeRevenue = await Promise.all(
      recentColleges.map(async (c) => {
        const rev = await prisma.order.aggregate({
          _sum: { amount: true },
          where: { status: 'COMPLETED', product: { collegeId: c.id } },
        });
        return {
          name: c.name,
          amount: rev._sum.amount || 0,
          students: c._count.students,
          products: c._count.products,
        };
      })
    );

    const totalRev = collegeRevenue.reduce((s, c) => s + c.amount, 0);
    const revenueBars = collegeRevenue.map((c) => ({
      name: c.name,
      amount: c.amount,
      pct: totalRev > 0 ? Math.round((c.amount / totalRev) * 100) : 0,
    }));

    // Pending requests count
    const pendingRequests = await prisma.college.count({ where: { isApproved: false } });

    // Recent activity: last 5 college registrations or student registrations
    const recentActivity = await prisma.college.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, isApproved: true, createdAt: true },
    });

    return res.json({
      stats: {
        activeColleges,
        totalStudents,
        totalProducts,
        totalRevenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
        pendingRequests,
      },
      revenueBars,
      recentActivity,
    });
  } catch (err) {
    console.error('[MasterController.getDashboardStats]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── Get all students (with search, college filter, pagination) ──────
async function getStudents(req, res) {
  try {
    const { search = '', collegeId = '', status = '', page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      college: { isApproved: true },
      ...(collegeId ? { collegeId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { enrollmentId: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(status === 'approved' ? { isApproved: true } : {}),
      ...(status === 'pending' ? { isApproved: false } : {}),
    };

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          college: { select: { id: true, name: true } },
          _count: { select: { products: true, purchases: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.student.count({ where }),
    ]);

    const formatted = students.map((s) => ({
      id: s.id,
      name: s.name || 'Unknown',
      email: s.email,
      enrollmentId: s.enrollmentId || '—',
      phone: s.phone || '—',
      college: s.college.name,
      collegeId: s.collegeId,
      isApproved: s.isApproved,
      status: s.isApproved ? 'Active' : 'Pending',
      products: s._count.products,
      purchases: s._count.purchases,
      joined: s.createdAt,
    }));

    return res.json({
      students: formatted,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('[MasterController.getStudents]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── Get all active colleges (for dropdowns) ─────────────────────────
async function getActiveColleges(req, res) {
  try {
    const colleges = await prisma.college.findMany({
      where: { isApproved: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    });
    return res.json({ colleges });
  } catch (err) {
    console.error('[MasterController.getActiveColleges]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── Get Platform Pricing Settings ──────────────────────────────────
async function getPlatformPricing(req, res) {
  try {
    let settings = await prisma.platformSettings.findFirst();
    if (!settings) {
      // Create defaults on first fetch
      settings = await prisma.platformSettings.create({
        data: {
          digitalListingFee: 20,
          digitalBuyerFeePercent: 15,
          digitalSellerCutPercent: 15,
          digitalPayoutDays: 7,
          physicalTiers: [
            { min: 0,    max: 500,  percent: 5 },
            { min: 501,  max: 1000, percent: 4 },
            { min: 1001, max: 2000, percent: 3 },
          ],
        },
      });
    }
    return res.json(settings);
  } catch (err) {
    console.error('[MasterController.getPlatformPricing]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── Update Platform Pricing Settings ────────────────────────────────
async function updatePlatformPricing(req, res) {
  try {
    const {
      digitalListingFee,
      digitalBuyerFeePercent,
      digitalSellerCutPercent,
      digitalPayoutDays,
      physicalTiers,
    } = req.body;

    // Validate physicalTiers
    if (physicalTiers !== undefined) {
      if (!Array.isArray(physicalTiers)) {
        return res.status(400).json({ message: 'physicalTiers must be an array' });
      }
      for (const tier of physicalTiers) {
        if (typeof tier.min !== 'number' || typeof tier.max !== 'number') {
          return res.status(400).json({ message: 'Each tier must have min and max as numbers' });
        }
        const val = typeof tier.value === 'number' ? tier.value : tier.percent;
        const type = tier.type || 'percent';
        if (typeof val !== 'number') {
          return res.status(400).json({ message: 'Each tier must have a numeric value or percent' });
        }
        if (tier.min < 0 || tier.max <= tier.min || val < 0 || (type === 'percent' && val > 100)) {
          return res.status(400).json({ message: 'Invalid tier values' });
        }
      }
    }

    const existing = await prisma.platformSettings.findFirst();

    const data = {
      ...(digitalListingFee !== undefined       && { digitalListingFee: parseFloat(digitalListingFee) }),
      ...(digitalBuyerFeePercent !== undefined  && { digitalBuyerFeePercent: parseFloat(digitalBuyerFeePercent) }),
      ...(digitalSellerCutPercent !== undefined && { digitalSellerCutPercent: parseFloat(digitalSellerCutPercent) }),
      ...(digitalPayoutDays !== undefined       && { digitalPayoutDays: parseInt(digitalPayoutDays) }),
      ...(physicalTiers !== undefined           && { physicalTiers }),
      updatedBy: req.user.email || req.user.id,
    };

    let settings;
    if (existing) {
      settings = await prisma.platformSettings.update({ where: { id: existing.id }, data });
    } else {
      settings = await prisma.platformSettings.create({ data });
    }

    return res.json({ message: 'Platform pricing updated successfully', settings });
  } catch (err) {
    console.error('[MasterController.updatePlatformPricing]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── Get Seller Payouts ───────────────────────────────────────────────
async function getSellerPayouts(req, res) {
  try {
    const { status = '', page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const now = new Date();
    const where = {};
    if (status === 'pending')  where.status = 'pending';
    if (status === 'released') where.status = 'released';
    if (status === 'overdue') {
      where.status = 'pending';
      where.releaseAfter = { lte: now };
    }

    const [payouts, total] = await Promise.all([
      prisma.sellerPayout.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          seller: { select: { id: true, name: true, email: true, college: { select: { name: true } } } },
          order:  { include: { product: { select: { id: true, title: true, productType: true } } } },
        },
      }),
      prisma.sellerPayout.count({ where }),
    ]);

    // Mark overdue status in response
    const formatted = payouts.map((p) => ({
      ...p,
      isOverdue: p.status === 'pending' && new Date(p.releaseAfter) <= now,
    }));

    return res.json({ payouts: formatted, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error('[MasterController.getSellerPayouts]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── Release Overdue Payouts ──────────────────────────────────────────
async function releasePayouts(req, res) {
  try {
    const { payoutIds } = req.body; // optional: specific IDs; if empty release all overdue
    const now = new Date();

    const where = payoutIds?.length
      ? { id: { in: payoutIds }, status: 'pending' }
      : { status: 'pending', releaseAfter: { lte: now } };

    const result = await prisma.sellerPayout.updateMany({
      where,
      data: { status: 'released', releasedAt: now },
    });

    return res.json({ message: `${result.count} payout(s) released successfully`, released: result.count });
  } catch (err) {
    console.error('[MasterController.releasePayouts]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── Get Single College Detail (students, products, revenue) ──────────
async function getCollegeDetail(req, res) {
  try {
    const { collegeId } = req.params;

    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      include: {
        admins: {
          select: { id: true, name: true, email: true, isApproved: true, isEmailVerified: true, createdAt: true },
        },
        _count: { select: { students: true, products: true } },
      },
    });

    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // ── Students ──────────────────────────────────────────────────────────
    const students = await prisma.student.findMany({
      where: { collegeId },
      select: {
        id: true,
        name: true,
        email: true,
        enrollmentId: true,
        phone: true,
        isApproved: true,
        createdAt: true,
        _count: { select: { products: true, purchases: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // ── Products ──────────────────────────────────────────────────────────
    const products = await prisma.product.findMany({
      where: { collegeId },
      include: {
        seller: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // ── Revenue breakdown ─────────────────────────────────────────────────
    const ordersAgg = await prisma.order.aggregate({
      _sum: { amount: true, platformFee: true, sellerCut: true, netSellerAmt: true },
      _count: { id: true },
      where: { status: 'COMPLETED', product: { collegeId } },
    });

    const grossRevenue   = ordersAgg._sum.amount       || 0;
    const platformFees   = ordersAgg._sum.platformFee  || 0;
    const sellerCuts     = ordersAgg._sum.sellerCut    || 0;
    const netSellerTotal = ordersAgg._sum.netSellerAmt || 0;
    const completedOrders = ordersAgg._count.id        || 0;

    // Platform total revenue for % contribution
    const platformTotalAgg = await prisma.order.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    });
    const platformTotal = platformTotalAgg._sum.amount || 0;
    const revPct = platformTotal > 0 ? Math.round((grossRevenue / platformTotal) * 100) : 0;

    // ── Listing fee revenue ───────────────────────────────────────────────
    const listingFeesAgg = await prisma.listingPayment.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: { product: { collegeId }, status: 'completed' },
    });
    const listingFeeRevenue = listingFeesAgg._sum.amount || 0;

    return res.json({
      college: {
        id: college.id,
        name: college.name,
        code: college.code,
        city: college.city || 'Unknown',
        type: college.type || 'Unknown',
        emailDomain: college.emailDomain,
        isApproved: college.isApproved,
        joined: college.createdAt,
        updatedAt: college.updatedAt,
        totalStudents: college._count.students,
        totalProducts: college._count.products,
      },
      admins: college.admins.map(a => ({
        id: a.id,
        name: a.name,
        email: a.email,
        isApproved: a.isApproved,
        isEmailVerified: a.isEmailVerified,
        joined: a.createdAt,
      })),
      students: students.map(s => ({
        id: s.id,
        name: s.name || 'Unknown',
        email: s.email,
        enrollmentId: s.enrollmentId || '—',
        phone: s.phone || '—',
        isApproved: s.isApproved,
        status: s.isApproved ? 'Active' : 'Pending',
        products: s._count.products,
        purchases: s._count.purchases,
        joined: s.createdAt,
      })),
      products: products.map(p => ({
        id: p.id,
        title: p.title,
        type: p.productType,
        subType: p.digitalSubType || null,
        price: `₹${p.price.toLocaleString('en-IN')}`,
        priceRaw: p.price,
        seller: p.seller?.name || 'Unknown',
        sellerEmail: p.seller?.email || '',
        status: p.status,
        isApproved: p.isApproved,
        category: p.category || '—',
        date: new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      })),
      revenue: {
        grossRevenue,
        grossRevenueFormatted: `₹${Math.round(grossRevenue).toLocaleString('en-IN')}`,
        platformFees,
        platformFeesFormatted: `₹${Math.round(platformFees).toLocaleString('en-IN')}`,
        sellerCuts,
        sellerCutsFormatted: `₹${Math.round(sellerCuts).toLocaleString('en-IN')}`,
        netSellerTotal,
        netSellerTotalFormatted: `₹${Math.round(netSellerTotal).toLocaleString('en-IN')}`,
        listingFeeRevenue,
        listingFeeRevenueFormatted: `₹${Math.round(listingFeeRevenue).toLocaleString('en-IN')}`,
        completedOrders,
        revPct,
        platformTotal,
        platformTotalFormatted: `₹${Math.round(platformTotal).toLocaleString('en-IN')}`,
      },
    });
  } catch (err) {
    console.error('[MasterController.getCollegeDetail]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── Get Platform Business Accounting ────────────────────────────────
async function getPlatformAccounting(req, res) {
  try {
    const [listingPayments, orders, ads, payoutsAgg] = await Promise.all([
      prisma.listingPayment.findMany({
        where: { status: 'completed' },
        include: {
          student: { select: { name: true, email: true } },
          product: { select: { title: true, productType: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.findMany({
        where: { status: 'COMPLETED' },
        include: {
          buyer: { select: { name: true, email: true } },
          seller: { select: { name: true, email: true } },
          product: { select: { title: true, productType: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.advertisement.findMany({
        include: {
          admin: { select: { name: true, email: true } },
          college: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.sellerPayout.groupBy({
        by: ['status'],
        _sum: { netAmount: true }
      })
    ]);

    const totalListingFees = listingPayments.reduce((s, p) => s + p.amount, 0);
    const totalBuyerFees   = orders.reduce((s, o) => s + (o.platformFee || 0), 0);
    const totalSellerCuts  = orders.reduce((s, o) => s + (o.sellerCut || 0), 0);
    const totalAdRevenue   = ads.reduce((s, a) => s + (a.cost || 0), 0);
    const totalPlatformRevenue = totalListingFees + totalBuyerFees + totalSellerCuts + totalAdRevenue;

    let pendingPayoutsVal = 0;
    let releasedPayoutsVal = 0;
    payoutsAgg.forEach(p => {
      if (p.status === 'pending') pendingPayoutsVal = p._sum.netAmount || 0;
      if (p.status === 'released') releasedPayoutsVal = p._sum.netAmount || 0;
    });

    const totalSalesVolume = orders.reduce((s, o) => s + o.amount, 0);

    const ledger = [];

    listingPayments.forEach(p => {
      ledger.push({
        id: p.id,
        type: 'LISTING_FEE',
        description: `Listing fee: "${p.product?.title || 'Digital Product'}"`,
        party: p.student?.name || 'Seller',
        email: p.student?.email || '',
        inflow: p.amount,
        listingFee: p.amount,
        buyerFee: 0,
        sellerCut: 0,
        adCost: 0,
        method: p.method || 'upi',
        reference: p.transactionId || `TXN-${p.id.substring(0, 8).toUpperCase()}`,
        date: p.createdAt
      });
    });

    orders.forEach(o => {
      const platformShare = (o.platformFee || 0) + (o.sellerCut || 0);
      if (platformShare > 0) {
        ledger.push({
          id: o.id,
          type: 'TRANSACTION_FEE',
          description: `Order cut/surcharges: "${o.product?.title || 'Product'}"`,
          party: `B: ${o.buyer?.name || 'Student'} | S: ${o.seller?.name || 'Student'}`,
          email: `${o.buyer?.email || ''} / ${o.seller?.email || ''}`,
          inflow: platformShare,
          listingFee: 0,
          buyerFee: o.platformFee || 0,
          sellerCut: o.sellerCut || 0,
          adCost: 0,
          method: 'upi',
          reference: `ORD-${o.id.substring(0, 8).toUpperCase()}`,
          date: o.createdAt
        });
      }
    });

    ads.forEach(a => {
      if (a.cost > 0) {
        ledger.push({
          id: a.id,
          type: 'AD_REVENUE',
          description: `Ad campaign: "${a.title}" (${a.scope} scope, ${a.duration} days)`,
          party: a.admin?.name || 'Admin',
          email: a.admin?.email || '',
          inflow: a.cost,
          listingFee: 0,
          buyerFee: 0,
          sellerCut: 0,
          adCost: a.cost,
          method: 'upi',
          reference: `AD-${a.id.substring(0, 8).toUpperCase()}`,
          date: a.createdAt
        });
      }
    });

    // Sort chronologically (newest first)
    ledger.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return res.json({
      summary: {
        totalListingFees,
        totalBuyerFees,
        totalSellerCuts,
        totalAdRevenue,
        totalPlatformRevenue,
        pendingPayoutsVal,
        releasedPayoutsVal,
        totalSalesVolume
      },
      ledger: ledger.slice(0, 100)
    });
  } catch (err) {
    console.error('[MasterController.getPlatformAccounting]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getColleges,
  approveCollege,
  rejectCollege,
  getDashboardStats,
  getStudents,
  getActiveColleges,
  getCollegeDetail,
  getPlatformPricing,
  updatePlatformPricing,
  getSellerPayouts,
  releasePayouts,
  getPlatformAccounting,
};
