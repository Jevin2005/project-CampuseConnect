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

const AVATAR_COLORS = ['#F7C948','#4F8EF7','#7C3AED','#10B981','#F59E0B','#EF4444','#06B6D4','#EC4899'];
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
      .catch(() => {});

    return res.json({ message: 'Student unsuspended successfully' });
  } catch (err) {
    console.error('[AdminController.unsuspendStudent]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getStudents,
  approveStudent,
  rejectStudent,
  suspendStudent,
  unsuspendStudent,
};
