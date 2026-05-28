/**
 * Verification Script: Inbox Prisma Query Fix
 * Run: node scratch_test_inbox.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testInboxQuery() {
  console.log('🧪 Starting Inbox Query verification...');

  // 1. Fetch any student to simulate as logged-in user
  const student = await prisma.student.findFirst();
  if (!student) {
    console.log('⚠️ No students exist to test with. Seeding check not possible without student records.');
    return;
  }

  console.log(`🧑 Simulating query for student: ${student.name} (${student.email})`);

  // 2. Perform the getThreads query
  try {
    const threads = await prisma.chatThread.findMany({
      where: {
        OR: [
          { request: { buyerId: student.id } },
          { request: { sellerId: student.id } }
        ]
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        request: {
          include: {
            buyer:   { select: { id: true, name: true, email: true } },
            seller:  { select: { id: true, name: true, email: true } },
            product: { select: { id: true, title: true, price: true, images: true } },
          },
        },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    console.log(`✅ SUCCESS! Found ${threads.length} chat threads for this student.`);
    for (const t of threads) {
      console.log(`- Thread ID: ${t.id}`);
      console.log(`  └ Product: ${t.request.product.title}`);
      console.log(`  └ Buyer: ${t.request.buyer.name}`);
      console.log(`  └ Seller: ${t.request.seller.name}`);
      console.log(`  └ Latest Message: ${t.messages?.[0]?.text || 'None'}`);
    }
  } catch (error) {
    console.error('❌ QUERY ERROR:', error);
    throw error;
  }

  console.log('\n🎉 INBOX QUERY VERIFICATION COMPLETED SUCCESSFULLY!');
}

testInboxQuery()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
