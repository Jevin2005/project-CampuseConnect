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

module.exports = {
  getColleges,
  approveCollege,
  rejectCollege,
  getDashboardStats,
  getStudents,
  getActiveColleges,
};
