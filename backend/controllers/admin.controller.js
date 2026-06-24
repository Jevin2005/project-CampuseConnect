const { PrismaClient } = require('@prisma/client');
const { notifyStudentApproved, notifyStudentRejected } = require('../services/email.service');

const prisma = new PrismaClient();

// ─── Helper: build initials from name ────────────────────────────────
function getInitials(name) {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

const AVATAR_COLORS = ['#F7C948', '#4F8EF7', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];
function avatarColor(str) {
  let h = 0;
  for (const c of (str || '')) h = (h * 31 + c.charCodeAt(0)) & 0xFFFFFF;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ─── GET /api/admin/students ──────────────────────────────────────────
async function getStudents(req, res) {
  try {
    const adminId = req.user.userId;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: { college: true },
    });

    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const students = await prisma.student.findMany({
      where: { collegeId: admin.collegeId },
      include: {
        _count: { select: { products: true, purchases: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const pending = [];
    const approved = [];

    students.forEach(student => {
      const color = avatarColor(student.email);
      const formatted = {
        id: student.id,
        initials: getInitials(student.name),
        color,
        name: student.name || 'Unknown',
        email: student.email,
        phone: student.phone || '—',
        enrollmentId: student.enrollmentId || '—',
        date: student.createdAt,
        products: student._count.products,
        purchases: student._count.purchases,
        // Check if email domain matches college domain
        match: student.email.endsWith('@' + admin.college.emailDomain) ||
          student.email.includes('.' + admin.college.emailDomain),
      };

      if (!student.isApproved) {
        pending.push(formatted);
      } else {
        approved.push(formatted);
      }
    });

    return res.json({ pending, approved, college: { name: admin.college.name, emailDomain: admin.college.emailDomain } });
  } catch (err) {
    console.error('[AdminController.getStudents]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── POST /api/admin/students/approve ────────────────────────────────
async function approveStudent(req, res) {
  try {
    const { studentId } = req.body;
    const adminId = req.user.userId;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: { college: true },
    });

    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student || student.collegeId !== admin.collegeId) {
      return res.status(403).json({ message: 'Unauthorized or student not found' });
    }

    await prisma.student.update({
      where: { id: studentId },
      data: { isApproved: true },
    });

    // Send approval email (non-blocking)
    notifyStudentApproved(student.email, student.name || 'Student', admin.college.name)
      .catch(e => console.error('[Email] Approval notification failed:', e.message));

    return res.json({ message: 'Student approved successfully' });
  } catch (err) {
    console.error('[AdminController.approveStudent]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── POST /api/admin/students/reject ─────────────────────────────────
async function rejectStudent(req, res) {
  try {
    const { studentId, reason } = req.body;
    const adminId = req.user.userId;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: { college: true },
    });

    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student || student.collegeId !== admin.collegeId) {
      return res.status(403).json({ message: 'Unauthorized or student not found' });
    }

    // Send rejection email before deleting
    notifyStudentRejected(student.email, student.name || 'Student', admin.college.name, reason)
      .catch(e => console.error('[Email] Rejection notification failed:', e.message));

    // Delete the student record so they can re-register
    await prisma.student.delete({ where: { id: studentId } });

    return res.json({ message: 'Student rejected successfully' });
  } catch (err) {
    console.error('[AdminController.rejectStudent]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── POST /api/admin/students/suspend ────────────────────────────────
async function suspendStudent(req, res) {
  try {
    const { studentId } = req.body;
    const adminId = req.user.userId;

    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student || student.collegeId !== admin.collegeId) {
      return res.status(403).json({ message: 'Unauthorized or student not found' });
    }

    await prisma.student.update({
      where: { id: studentId },
      data: { isApproved: false },
    });

    return res.json({ message: 'Student suspended successfully' });
  } catch (err) {
    console.error('[AdminController.suspendStudent]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── POST /api/admin/students/unsuspend ──────────────────────────────
async function unsuspendStudent(req, res) {
  try {
    const { studentId } = req.body;
    const adminId = req.user.userId;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: { college: true },
    });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student || student.collegeId !== admin.collegeId) {
      return res.status(403).json({ message: 'Unauthorized or student not found' });
    }

    await prisma.student.update({
      where: { id: studentId },
      data: { isApproved: true },
    });

    // Re-notify student that access is restored
    notifyStudentApproved(student.email, student.name || 'Student', admin.college.name)
      .catch(() => { });

    return res.json({ message: 'Student unsuspended successfully' });
  } catch (err) {
    console.error('[AdminController.unsuspendStudent]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── GET /api/admin/dashboard ─────────────────────────────
async function getDashboard(req, res) {
  try {
    const adminId = req.user.userId;
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: { college: true },
    });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    const cId = admin.collegeId;

    const [totalStudents, pendingStudents, totalProducts, pendingProducts, orders, recentOrders] =
      await Promise.all([
        prisma.student.count({ where: { collegeId: cId, isApproved: true } }),
        prisma.student.count({ where: { collegeId: cId, isApproved: false } }),
        prisma.product.count({ where: { collegeId: cId, isApproved: true } }),
        prisma.product.count({ where: { collegeId: cId, isApproved: false } }),
        prisma.order.findMany({
          where: { product: { collegeId: cId } },
          select: { amount: true },
        }),
        prisma.order.findMany({
          where: { product: { collegeId: cId } },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { buyer: true, seller: true, product: true },
        }),
      ]);

    const totalRevenue = orders.reduce((s, o) => s + o.amount * 0.05, 0);

    const pendingList = await prisma.student.findMany({
      where: { collegeId: cId, isApproved: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true },
    });

    // ── Recent Transactions (replaces pending product review) ───
    const recentTransactions = recentOrders.map(o => ({
      id: o.id,
      productTitle: o.product?.title || 'Unknown Product',
      buyer: o.buyer?.name || 'Unknown',
      seller: o.seller?.name || 'Unknown',
      amount: `₹${o.amount.toLocaleString('en-IN')}`,
      platformCut: `₹${(o.amount * 0.05).toFixed(0)}`,
      date: o.createdAt,
    }));

    // ── NEW: Product breakdown by status ──────────────────
    const [activeProducts, removedProducts, soldProducts] = await Promise.all([
      prisma.product.count({ where: { collegeId: cId, status: 'active' } }),
      prisma.product.count({ where: { collegeId: cId, status: 'removed' } }),
      prisma.product.count({ where: { collegeId: cId, status: 'sold' } }),
    ]);

    // ── NEW: Top sellers by sold count + revenue ──────────
    const topSellerOrders = await prisma.order.groupBy({
      by: ['sellerId'],
      where: { product: { collegeId: cId } },
      _count: { id: true },
      _sum: { amount: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const topSellerIds = topSellerOrders.map(o => o.sellerId);
    const topSellerStudents = topSellerIds.length > 0
      ? await prisma.student.findMany({
        where: { id: { in: topSellerIds } },
        select: { id: true, name: true, email: true },
      })
      : [];

    const topSellers = topSellerOrders.map(o => {
      const student = topSellerStudents.find(s => s.id === o.sellerId);
      return {
        id: o.sellerId,
        name: student?.name || 'Unknown',
        email: student?.email || '',
        initials: getInitials(student?.name),
        color: avatarColor(student?.email || ''),
        soldCount: o._count.id,
        revenue: Math.round(o._sum.amount || 0),
      };
    });

    // ── Recent Listings: newest products posted by students ──
    const recentListings = await prisma.product.findMany({
      where: { collegeId: cId, status: { in: ['active', 'sold'] } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { seller: true },
    });

    return res.json({
      stats: {
        totalStudents,
        pendingStudents,
        totalProducts,
        pendingProducts,
        revenue: Math.round(totalRevenue),
        totalOrders: orders.length,
        soldProducts,
      },
      productBreakdown: {
        active: activeProducts,
        pending: pendingProducts,
        sold: soldProducts,
        removed: removedProducts,
      },
      topSellers,
      pendingRequests: pendingList.map(s => ({
        id: s.id,
        name: s.name || 'Unknown',
        email: s.email,
        initials: getInitials(s.name),
        color: avatarColor(s.email),
        date: s.createdAt,
      })),
      recentTransactions,
      recentListings: recentListings.map(p => ({
        id: p.id,
        title: p.title,
        category: p.category || 'OTHER',
        price: `₹${p.price.toLocaleString('en-IN')}`,
        seller: p.seller?.name || 'Unknown',
        sellerInitials: getInitials(p.seller?.name),
        sellerColor: avatarColor(p.seller?.email || ''),
        status: p.status,
        date: p.createdAt,
      })),
      college: { name: admin.college.name },
      adminName: admin.name,
    });
  } catch (err) {
    console.error('[getDashboard]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── GET /api/admin/products ──────────────────────────────
async function getProducts(req, res) {
  try {
    const adminId = req.user.userId;
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const products = await prisma.product.findMany({
      where: { collegeId: admin.collegeId },
      include: { seller: true, _count: { select: { orders: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(products.map(p => ({
      id: p.id,
      title: p.title,
      seller: p.seller?.name || 'Unknown',
      sellerId: p.sellerId,
      price: `₹${p.price.toLocaleString('en-IN')}`,
      priceRaw: p.price,
      category: p.category || 'OTHER',
      isApproved: p.isApproved,
      status: p.isApproved && p.status !== 'removed' && p.status !== 'sold' ? 'active' : (p.status === 'active' ? 'active' : p.status === 'removed' ? 'removed' : p.status === 'sold' ? 'sold' : 'pending'),
      orders: p._count.orders,
      date: p.createdAt,
      images: p.images || [],
      description: p.description,
    })));
  } catch (err) {
    console.error('[getProducts]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── POST /api/admin/products/:id/approve ─────────────────
async function approveProduct(req, res) {
  try {
    const adminId = req.user.userId;
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product || product.collegeId !== admin.collegeId)
      return res.status(403).json({ message: 'Unauthorized' });
    if (product.status === 'sold')
      return res.status(400).json({ message: 'Cannot approve a sold out product' });
    await prisma.product.update({ where: { id: req.params.id }, data: { isApproved: true, status: 'active' } });
    return res.json({ message: 'Product approved' });
  } catch (err) {
    console.error('[approveProduct]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── POST /api/admin/products/:id/remove ──────────────────
async function removeProduct(req, res) {
  try {
    const adminId = req.user.userId;
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product || product.collegeId !== admin.collegeId)
      return res.status(403).json({ message: 'Unauthorized' });
    if (product.status === 'sold')
      return res.status(400).json({ message: 'Cannot remove a sold out product' });
    await prisma.product.update({ where: { id: req.params.id }, data: { isApproved: false, status: 'removed' } });
    return res.json({ message: 'Product removed' });
  } catch (err) {
    console.error('[removeProduct]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── POST /api/admin/products/:id/restore ─────────────────
async function restoreProduct(req, res) {
  try {
    const adminId = req.user.userId;
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product || product.collegeId !== admin.collegeId)
      return res.status(403).json({ message: 'Unauthorized' });
    if (product.status === 'sold')
      return res.status(400).json({ message: 'Cannot restore a sold out product' });
    await prisma.product.update({ where: { id: req.params.id }, data: { isApproved: true, status: 'active' } });
    return res.json({ message: 'Product restored' });
  } catch (err) {
    console.error('[restoreProduct]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── GET /api/admin/revenue ───────────────────────────────
async function getRevenue(req, res) {
  try {
    const adminId = req.user.userId;
    const admin = await prisma.admin.findUnique({ where: { id: adminId }, include: { college: true } });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const orders = await prisma.order.findMany({
      where: { product: { collegeId: admin.collegeId } },
      include: { buyer: true, seller: true, product: true },
      orderBy: { createdAt: 'desc' },
    });

    const PLATFORM_CUT = 0.05;
    const totalSales = orders.reduce((s, o) => s + o.amount, 0);
    const totalCut = orders.reduce((s, o) => s + o.amount * PLATFORM_CUT, 0);

    // Build 7-day chart data
    const now = new Date();
    const chartData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const dayOrders = orders.filter(o => {
        const od = new Date(o.createdAt);
        return od.getDate() === d.getDate() && od.getMonth() === d.getMonth();
      });
      return {
        day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        v: dayOrders.reduce((s, o) => s + o.amount * PLATFORM_CUT, 0),
      };
    });

    const transactions = orders.slice(0, 20).map(o => ({
      id: o.id,
      product: o.product?.title || 'Unknown',
      buyer: o.buyer?.name || 'Unknown',
      seller: o.seller?.name || 'Unknown',
      price: `₹${o.amount.toLocaleString('en-IN')}`,
      cut: `₹${(o.amount * PLATFORM_CUT).toFixed(2)}`,
      date: new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      rawDate: o.createdAt,
    }));

    return res.json({
      stats: {
        totalSales: `₹${Math.round(totalSales).toLocaleString('en-IN')}`,
        totalCut: `₹${Math.round(totalCut).toLocaleString('en-IN')}`,
        totalOrders: orders.length,
      },
      chartData,
      transactions,
      collegeName: admin.college.name,
    });
  } catch (err) {
    console.error('[getRevenue]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── GET /api/admin/settings ──────────────────────────────
async function getSettings(req, res) {
  try {
    const adminId = req.user.userId;
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: { college: true },
    });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    return res.json({
      admin: { id: admin.id, name: admin.name, email: admin.email },
      college: {
        name: admin.college.name,
        code: admin.college.code,
        emailDomain: admin.college.emailDomain,
        type: admin.college.type,
        city: admin.college.city,
      },
    });
  } catch (err) {
    console.error('[getSettings]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── PUT /api/admin/settings/profile ─────────────────────
async function updateProfile(req, res) {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
    await prisma.admin.update({
      where: { id: req.user.userId },
      data: { name: name.trim() },
    });
    return res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('[updateProfile]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ─── PUT /api/admin/settings/password ────────────────────
async function updatePassword(req, res) {
  try {
    const bcrypt = require('bcryptjs');
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both passwords are required' });
    const admin = await prisma.admin.findUnique({ where: { id: req.user.userId } });
    const valid = await bcrypt.compare(currentPassword, admin.password);
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.admin.update({ where: { id: req.user.userId }, data: { password: hashed } });
    return res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('[updatePassword]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getStudents,
  approveStudent,
  rejectStudent,
  suspendStudent,
  unsuspendStudent,
  getDashboard,
  getProducts,
  approveProduct,
  removeProduct,
  restoreProduct,
  getRevenue,
  getSettings,
  updateProfile,
  updatePassword,
};

