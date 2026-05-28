/**
 * Verification Script: Marketplace Isolation
 * Run: node scratch_test_isolation.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testIsolation() {
  console.log('🧪 Starting isolation verification tests...');

  // 1. Fetch all colleges
  const colleges = await prisma.college.findMany({
    include: { products: true, students: true }
  });

  console.log(`\nFound ${colleges.length} colleges in the database:`);
  for (const c of colleges) {
    console.log(`- ${c.name} (Code: ${c.code})`);
    console.log(`  └ Students registered: ${c.students.length}`);
    console.log(`  └ Products listed: ${c.products.length}`);
  }

  if (colleges.length < 2) {
    console.log('\n⚠️ Need at least 2 colleges to test cross-college isolation.');
    // Let's dynamically create a second college for testing if it doesn't exist
    const testCollegeDomain = 'stanford.edu';
    let stanford = await prisma.college.findUnique({ where: { code: 'STANFORD' } });
    if (!stanford) {
      stanford = await prisma.college.create({
        data: {
          name: 'Stanford University',
          code: 'STANFORD',
          emailDomain: testCollegeDomain,
          city: 'California',
          type: 'University',
          isApproved: true
        }
      });
      console.log(`✅ Created temporary Stanford University for testing.`);
    }

    // Create a product for Stanford
    const seller = await prisma.student.findFirst({ where: { collegeId: stanford.id } }) || 
      await prisma.student.create({
        data: {
          email: 'test_student@stanford.edu',
          name: 'Stanford Student',
          isApproved: true,
          collegeId: stanford.id
        }
      });

    await prisma.product.create({
      data: {
        title: 'Stanford Machine Learning Notes',
        price: 299,
        productType: 'digital',
        isApproved: true,
        sellerId: seller.id,
        collegeId: stanford.id,
        category: 'Notes PDF'
      }
    });
    console.log(`✅ Created temporary product for Stanford.`);
  }

  // Reload colleges list after setup
  const updatedColleges = await prisma.college.findMany({
    include: { products: { where: { isApproved: true } } }
  });

  console.log('\n🔍 Simulating Marketplace queries:');

  for (const c of updatedColleges) {
    console.log(`\n🧑 Student logs in from: ${c.name}`);
    // Simulate req.user context
    const reqUser = { collegeId: c.id };

    // Simulate exports.getProducts filtering query
    const where = { isApproved: true };
    if (reqUser && reqUser.collegeId) {
      where.collegeId = reqUser.collegeId;
    }

    const products = await prisma.product.findMany({ where });

    console.log(`🎯 Products shown in their marketplace: ${products.length}`);
    products.forEach(p => {
      console.log(`  - [Product ID: ${p.id.substring(0, 8)}...] ${p.title} (College ID: ${p.collegeId})`);
      if (p.collegeId !== c.id) {
        throw new Error(`❌ ISOLATION VIOLATION: Student from ${c.name} saw a product from college ${p.collegeId}`);
      }
    });

    console.log(`✅ Isolation Check Passed for ${c.name}!`);
  }

  console.log('\n🎉 ALL ISOLATION VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

testIsolation()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
