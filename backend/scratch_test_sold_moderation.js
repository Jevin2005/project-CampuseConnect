/**
 * Verification Script: College Admin Sold-Out Moderation Rules
 * Run: node scratch_test_sold_moderation.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const adminController = require('./controllers/admin.controller');

async function verifySoldModeration() {
  console.log('🧪 Starting Sold-Out Moderation verification tests...');

  // 1. Fetch or create a college
  const college = await prisma.college.findFirst() || await prisma.college.create({
    data: {
      name: 'Verification College',
      code: 'VERIFY2026',
      emailDomain: 'verify.edu',
      isApproved: true
    }
  });

  // 2. Fetch or create admin
  let admin = await prisma.admin.findFirst({ where: { email: 'admin@verify.edu' } });
  if (!admin) {
    admin = await prisma.admin.create({
      data: {
        email: 'admin@verify.edu',
        name: 'College Admin',
        password: 'dummy_password_hash',
        isApproved: true,
        collegeId: college.id
      }
    });
  }

  // 3. Fetch or create seller
  let seller = await prisma.student.findFirst({ where: { email: 'seller@verify.edu' } });
  if (!seller) {
    seller = await prisma.student.create({
      data: {
        email: 'seller@verify.edu',
        name: 'Seller Student',
        isApproved: true,
        collegeId: college.id
      }
    });
  }

  // 4. Create a test sold out product
  const product = await prisma.product.create({
    data: {
      title: 'Sold Out Physical Textbook',
      price: 299,
      productType: 'physical',
      status: 'sold',
      isApproved: true,
      sellerId: seller.id,
      collegeId: college.id
    }
  });
  console.log(`✅ Created test sold product (status='sold'): ${product.title}`);

  // 5. Test Status Mapping in getProducts
  console.log('\n🔍 Testing status mapping...');
  let mappedCorrectly = false;
  const mockReqGet = { user: { userId: admin.id } };
  const mockResGet = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(data) {
      const p = data.find(item => item.id === product.id);
      if (p) {
        console.log(`- Product found in getProducts list with status: "${p.status}" (Expected: "sold")`);
        if (p.status === 'sold') mappedCorrectly = true;
      }
      return this;
    }
  };
  await adminController.getProducts(mockReqGet, mockResGet);
  if (!mappedCorrectly) throw new Error('Assertion failed: status did not map to "sold"');

  // 6. Helper to test error responses on actions
  const testAction = async (actionFn, actionName) => {
    const mockReq = {
      user: { userId: admin.id },
      params: { id: product.id }
    };
    const mockRes = {
      statusCode: null,
      message: null,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.message = data.message; return this; }
    };

    await actionFn(mockReq, mockRes);
    console.log(`- Action "${actionName}" returned status: ${mockRes.statusCode}, message: "${mockRes.message}"`);
    
    if (mockRes.statusCode !== 400) {
      throw new Error(`Assertion failed: Action "${actionName}" should have been blocked with 400 Bad Request but returned ${mockRes.statusCode}`);
    }
  };

  // 7. Execute moderation action tests
  console.log('\n👮 Testing moderation blocks on sold out product...');
  await testAction(adminController.approveProduct, 'approveProduct');
  await testAction(adminController.removeProduct, 'removeProduct');
  await testAction(adminController.restoreProduct, 'restoreProduct');

  // 8. Cleanup testing entries
  await prisma.product.delete({ where: { id: product.id } });
  console.log('\n🧹 Cleaned up temporary verification entries.');

  console.log('\n🎉 ALL SOLD-OUT MODERATION RULES VERIFICATIONS PASSED SUCCESSFULLY!');
}

verifySoldModeration()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
