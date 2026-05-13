const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get students for the admin's college
async function getStudents(req, res) {
  try {
    const adminId = req.user.userId; // From auth middleware
    
    // Get admin's college
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: { college: true }
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const students = await prisma.student.findMany({
      where: { collegeId: admin.collegeId },
      include: { products: true }
    });

    const pending = [];
    const approved = [];

    students.forEach(student => {
      // Create initials
      let initials = 'ST';
      if (student.name) {
        const parts = student.name.split(' ');
        if (parts.length > 1) {
          initials = (parts[0][0] + parts[1][0]).toUpperCase();
        } else {
          initials = parts[0].substring(0, 2).toUpperCase();
        }
      }

      const formatted = {
        id: student.id,
        initials,
        name: student.name || 'Unknown',
        email: student.email,
        date: student.createdAt,
        products: student.products.length,
        color: '#10B981', // Default green
        match: student.email.endsWith(admin.college.emailDomain) // Does it match domain?
      };

      if (!student.isApproved) {
        pending.push(formatted);
      } else {
        approved.push(formatted);
      }
    });

    return res.json({ pending, approved });
  } catch (err) {
    console.error('[AdminController.getStudents]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Approve student
async function approveStudent(req, res) {
  try {
    const { email } = req.body;
    const adminId = req.user.userId;

    // Verify admin
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    
    // Ensure student belongs to this admin's college
    const student = await prisma.student.findUnique({ where: { email } });
    if (!student || student.collegeId !== admin.collegeId) {
       return res.status(403).json({ message: 'Unauthorized or student not found' });
    }

    await prisma.student.update({
      where: { email },
      data: { isApproved: true }
    });

    return res.json({ message: 'Student approved successfully' });
  } catch (err) {
    console.error('[AdminController.approveStudent]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Reject student
async function rejectStudent(req, res) {
  try {
    const { email, reason } = req.body;
    const adminId = req.user.userId;

    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    const student = await prisma.student.findUnique({ where: { email } });
    
    if (!student || student.collegeId !== admin.collegeId) {
       return res.status(403).json({ message: 'Unauthorized or student not found' });
    }

    // Usually we might just delete the request or mark as rejected
    // Let's delete the student record for now so they can re-apply if they made a mistake
    await prisma.student.delete({
      where: { email }
    });

    return res.json({ message: 'Student rejected successfully' });
  } catch (err) {
    console.error('[AdminController.rejectStudent]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Suspend student
async function suspendStudent(req, res) {
  try {
    const { email } = req.body;
    const adminId = req.user.userId;

    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    const student = await prisma.student.findUnique({ where: { email } });
    
    if (!student || student.collegeId !== admin.collegeId) {
       return res.status(403).json({ message: 'Unauthorized or student not found' });
    }

    // Set isApproved to false to suspend them
    await prisma.student.update({
      where: { email },
      data: { isApproved: false }
    });

    return res.json({ message: 'Student suspended successfully' });
  } catch (err) {
    console.error('[AdminController.suspendStudent]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getStudents,
  approveStudent,
  rejectStudent,
  suspendStudent
};
