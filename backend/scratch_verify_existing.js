const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration script to verify and approve all existing accounts...');
  
  // Update students
  const studentsResult = await prisma.student.updateMany({
    data: {
      isEmailVerified: true,
      isApproved: true,
    },
  });
  console.log(`Updated ${studentsResult.count} students.`);

  // Update admins
  const adminsResult = await prisma.admin.updateMany({
    data: {
      isEmailVerified: true,
      isApproved: true,
    },
  });
  console.log(`Updated ${adminsResult.count} admins.`);

  // Update colleges (to ensure any existing college is approved)
  const collegesResult = await prisma.college.updateMany({
    data: {
      isApproved: true,
    },
  });
  console.log(`Updated ${collegesResult.count} colleges.`);

  console.log('Done! All existing accounts and colleges are now verified and approved successfully.');
}

main()
  .catch((e) => {
    console.error('Error running verification script:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
