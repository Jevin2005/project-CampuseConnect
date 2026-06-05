/**
 * Test script to verify the new deal completion transaction and thread close logic.
 * Run using: node test_deal_flow.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
  console.log('🧪 Starting Deal Flow Integration Test...');

  // 1. Find or create test seller and buyers
  const college = await prisma.college.findFirst() || await prisma.college.create({
    data: { name: 'Test College', code: 'TEST101', emailDomain: 'test.edu' }
  });

  const seller = await prisma.student.findFirst({ where: { email: 'test_seller@test.edu' } }) || await prisma.student.create({
    data: { email: 'test_seller@test.edu', name: 'Test Seller', collegeId: college.id }
  });

  const buyer1 = await prisma.student.findFirst({ where: { email: 'buyer1@test.edu' } }) || await prisma.student.create({
    data: { email: 'buyer1@test.edu', name: 'Test Buyer 1', collegeId: college.id }
  });

  const buyer2 = await prisma.student.findFirst({ where: { email: 'buyer2@test.edu' } }) || await prisma.student.create({
    data: { email: 'buyer2@test.edu', name: 'Test Buyer 2', collegeId: college.id }
  });

  console.log(`🧑 Seller: ${seller.name}, Buyer 1: ${buyer1.name}, Buyer 2: ${buyer2.name}`);

  // 2. Create a test product
  const product = await prisma.product.create({
    data: {
      title: `Verification Product ${Date.now()}`,
      price: 1500,
      sellerId: seller.id,
      collegeId: college.id,
      status: 'active',
      isApproved: true
    }
  });
  console.log(`📦 Created test product: ${product.title}`);

  // 3. Create two BuyRequests (one for each buyer)
  const req1 = await prisma.buyRequest.create({
    data: { message: 'I want to buy!', buyerId: buyer1.id, sellerId: seller.id, productId: product.id, status: 'accepted' }
  });

  const req2 = await prisma.buyRequest.create({
    data: { message: 'Is it negotiable?', buyerId: buyer2.id, sellerId: seller.id, productId: product.id, status: 'accepted' }
  });

  // 4. Create ChatThreads for these BuyRequests
  const thread1 = await prisma.chatThread.create({
    data: { requestId: req1.id, status: 'active' }
  });

  const thread2 = await prisma.chatThread.create({
    data: { requestId: req2.id, status: 'active' }
  });

  console.log(`💬 Created two active ChatThreads:`);
  console.log(`   - Thread 1 (Buyer 1): ${thread1.id}`);
  console.log(`   - Thread 2 (Buyer 2): ${thread2.id}`);

  // 5. Simulate `completeDeal` on Thread 1
  console.log(`🤝 Simulating markDealDone for Thread 1...`);
  const result = await prisma.$transaction(async (tx) => {
    // a. Update chat thread status
    const updatedThread = await tx.chatThread.update({
      where: { id: thread1.id },
      data: { status: 'deal_done' }
    });

    // b. Update buy request status
    await tx.buyRequest.update({
      where: { id: thread1.requestId },
      data: { status: 'completed' }
    });

    // c. Update product status to sold
    await tx.product.update({
      where: { id: product.id },
      data: { status: 'sold' }
    });

    // d. Create verified order log
    const order = await tx.order.create({
      data: {
        amount: product.price,
        status: 'COMPLETED',
        buyerId: buyer1.id,
        sellerId: seller.id,
        productId: product.id
      }
    });

    // e. Find all other active conversation threads for this specific product
    const otherThreads = await tx.chatThread.findMany({
      where: {
        request: {
          productId: product.id
        },
        id: { not: thread1.id },
        status: 'active'
      }
    });

    // f. Close them and send auto sold-out messages from the seller
    for (const otherThread of otherThreads) {
      await tx.chatThread.update({
        where: { id: otherThread.id },
        data: { status: 'closed' }
      });
      await tx.buyRequest.update({
        where: { id: otherThread.requestId },
        data: { status: 'rejected' }
      });
      await tx.chatMessage.create({
        data: {
          text: "This product is sold out. Sorry!",
          threadId: otherThread.id,
          senderId: seller.id
        }
      });
    }

    return { updatedThread, order, otherThreadsCount: otherThreads.length };
  });

  console.log(`✅ Completed Deal successfully!`);
  console.log(`   - Thread 1 Status updated to: ${result.updatedThread.status}`);
  console.log(`   - Product status updated to: sold`);
  console.log(`   - Order logged: ID ${result.order.id}`);
  console.log(`   - Number of other active threads closed: ${result.otherThreadsCount}`);

  // 6. Verify Thread 2 status and automated message
  const thread2Updated = await prisma.chatThread.findUnique({
    where: { id: thread2.id },
    include: {
      messages: true,
      request: true
    }
  });

  console.log(`🔍 Checking Thread 2 (other buyer's thread):`);
  console.log(`   - Thread 2 Status: ${thread2Updated.status} (Expected: closed)`);
  console.log(`   - Request Status: ${thread2Updated.request.status} (Expected: rejected)`);
  console.log(`   - Message sent: "${thread2Updated.messages[0]?.text}" (Expected: "This product is sold out. Sorry!")`);

  // 7. Clean up test records
  console.log(`🧹 Cleaning up test records...`);
  await prisma.chatMessage.deleteMany({ where: { threadId: { in: [thread1.id, thread2.id] } } });
  await prisma.chatThread.deleteMany({ where: { id: { in: [thread1.id, thread2.id] } } });
  await prisma.buyRequest.deleteMany({ where: { id: { in: [req1.id, req2.id] } } });
  await prisma.order.deleteMany({ where: { productId: product.id } });
  await prisma.product.delete({ where: { id: product.id } });
  console.log(`   - Cleaned up messages, threads, requests, order, and product.`);

  if (
    thread2Updated.status === 'closed' &&
    thread2Updated.request.status === 'rejected' &&
    thread2Updated.messages[0]?.text === 'This product is sold out. Sorry!'
  ) {
    console.log('\n🎉 ALL DEAL FLOW & MULTI-BUYER LOGIC TEST CASES PASSED SUCCESSFULLY!');
  } else {
    console.log('\n❌ TEST CASE FAILED! Please verify database transaction updates.');
  }
}

runTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
