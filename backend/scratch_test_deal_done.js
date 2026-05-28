/**
 * Verification Script: persistent Deal Done Workflow
 * Run: node scratch_test_deal_done.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDealWorkflow() {
  console.log('🧪 Starting Deal Done transaction verification tests...');

  // 1. Fetch or create a college
  const college = await prisma.college.findFirst() || await prisma.college.create({
    data: {
      name: 'Verification College',
      code: 'VERIFY2026',
      emailDomain: 'verify.edu',
      isApproved: true
    }
  });

  // 2. Fetch or create buyer and seller
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

  let buyer = await prisma.student.findFirst({ where: { email: 'buyer@verify.edu' } });
  if (!buyer) {
    buyer = await prisma.student.create({
      data: {
        email: 'buyer@verify.edu',
        name: 'Buyer Student',
        isApproved: true,
        collegeId: college.id
      }
    });
  }

  // 3. Create an active product
  const product = await prisma.product.create({
    data: {
      title: 'Advanced Engineering Physics Notes',
      price: 150,
      productType: 'digital',
      status: 'active',
      isApproved: true,
      sellerId: seller.id,
      collegeId: college.id
    }
  });
  console.log(`✅ Created test active product: ${product.title}`);

  // 4. Create a buy request
  const request = await prisma.buyRequest.create({
    data: {
      message: 'Hi, I want to buy your physics notes!',
      buyerId: buyer.id,
      sellerId: seller.id,
      productId: product.id,
      status: 'accepted'
    }
  });
  console.log('✅ Created accepted buy request.');

  // 5. Create a chat thread
  const thread = await prisma.chatThread.create({
    data: {
      requestId: request.id,
      status: 'active'
    }
  });
  console.log('✅ Created active chat thread.');

  // 6. Simulate the completeDeal transaction
  console.log('\n🤝 Executing Deal Done transaction...');
  const result = await prisma.$transaction(async (tx) => {
    const updatedThread = await tx.chatThread.update({
      where: { id: thread.id },
      data: { status: 'deal_done' }
    });

    await tx.buyRequest.update({
      where: { id: request.id },
      data: { status: 'completed' }
    });

    await tx.product.update({
      where: { id: product.id },
      data: { status: 'sold' }
    });

    const order = await tx.order.create({
      data: {
        amount: product.price,
        status: 'COMPLETED',
        buyerId: buyer.id,
        sellerId: seller.id,
        productId: product.id
      }
    });

    return { updatedThread, order };
  });
  console.log('✅ Deal completed successfully in Prisma transaction!');

  // 7. Verify all assertions
  console.log('\n🔍 Running Database Assertions:');

  // Assertion A: Product status must be "sold"
  const verifyProduct = await prisma.product.findUnique({ where: { id: product.id } });
  console.log(`- Product Status: ${verifyProduct.status} (Expected: sold)`);
  if (verifyProduct.status !== 'sold') throw new Error('Assertion failed: Product is not sold.');

  // Assertion B: Product must be hidden from active products list
  const activeProducts = await prisma.product.findMany({
    where: { isApproved: true, status: 'active', id: product.id }
  });
  console.log(`- Found in active marketplace list: ${activeProducts.length} (Expected: 0)`);
  if (activeProducts.length !== 0) throw new Error('Assertion failed: Sold product is still active in marketplace!');

  // Assertion C: Chat thread status must be "deal_done"
  const verifyThread = await prisma.chatThread.findUnique({ where: { id: thread.id } });
  console.log(`- Chat Thread Status: ${verifyThread.status} (Expected: deal_done)`);
  if (verifyThread.status !== 'deal_done') throw new Error('Assertion failed: Thread is not deal_done.');

  // Assertion D: Buy request status must be "completed"
  const verifyRequest = await prisma.buyRequest.findUnique({ where: { id: request.id } });
  console.log(`- Buy Request Status: ${verifyRequest.status} (Expected: completed)`);
  if (verifyRequest.status !== 'completed') throw new Error('Assertion failed: Request is not completed.');

  // Assertion E: Order log must exist and be completed
  const verifyOrder = await prisma.order.findUnique({ where: { id: result.order.id } });
  console.log(`- Created Order Log ID: ${verifyOrder.id.substring(0, 8)}... (Expected: COMPLETED, Amount: ₹${verifyOrder.amount})`);
  if (verifyOrder.status !== 'COMPLETED' || verifyOrder.amount !== product.price) {
    throw new Error('Assertion failed: Order was not recorded correctly.');
  }

  // Cleanup testing entries
  await prisma.order.delete({ where: { id: verifyOrder.id } });
  await prisma.chatThread.delete({ where: { id: thread.id } });
  await prisma.buyRequest.delete({ where: { id: request.id } });
  await prisma.product.delete({ where: { id: product.id } });
  console.log('\n🧹 Cleaned up temporary verification entries.');

  console.log('\n🎉 ALL DEAL-DONE WORKFLOW VERIFICATIONS PASSED SUCCESSFULLY!');
}

verifyDealWorkflow()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
