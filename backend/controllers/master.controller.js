const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all colleges (pending and active)
async function getColleges(req, res) {
  try {
    const colleges = await prisma.college.findMany({
      include: {
        admins: true, // we need the admin details for requests
        students: true, // for counts
        products: true, // for counts
      },
      orderBy: { createdAt: 'desc' },
    });

    const pending = [];
    const active = [];

    colleges.forEach(college => {
      const firstAdmin = college.admins[0];
      const adminName = firstAdmin?.name || 'Unknown';
      const adminEmail = firstAdmin?.email || 'Unknown';
      const studentsCount = college.students.length;
      const productsCount = college.products.length;

      // In real scenario we'd calculate revenue from orders, but mock it for now or keep it simple.
      const revenue = 0; // Or logic based on orders
      
      if (!college.isApproved) {
        pending.push({
          id: college.id,
          name: college.name,
          admin: adminName,
          email: adminEmail,
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
          code: college.code,
          students: studentsCount,
          products: productsCount,
          revenue: '₹0', // Placeholder until revenue is implemented
          joined: college.createdAt,
        });
      }
    });

    return res.json({ pending, active });
  } catch (err) {
    console.error('[MasterController.getColleges]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Approve college
async function approveCollege(req, res) {
  try {
    const { collegeId } = req.params;
    
    // We need to approve the college and all its admins
    await prisma.$transaction(async (tx) => {
      await tx.college.update({
        where: { id: collegeId },
        data: { isApproved: true }
      });
      
      await tx.admin.updateMany({
        where: { collegeId: collegeId },
        data: { isApproved: true }
      });
    });

    return res.json({ message: 'College and admin approved successfully' });
  } catch (err) {
    console.error('[MasterController.approveCollege]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Reject college
async function rejectCollege(req, res) {
  try {
    const { collegeId } = req.params;
    
    // Delete admins and college
    await prisma.$transaction(async (tx) => {
      await tx.admin.deleteMany({
        where: { collegeId: collegeId }
      });
      await tx.college.delete({
        where: { id: collegeId }
      });
    });

    return res.json({ message: 'College request rejected and removed' });
  } catch (err) {
    console.error('[MasterController.rejectCollege]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getColleges,
  approveCollege,
  rejectCollege
};
