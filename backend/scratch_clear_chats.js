/**
 * Cleanup Script: Clear Chat & Buy Request Database Entries
 * Run: node scratch_clear_chats.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearChats() {
  console.log('🧹 Starting database chat cleanup...');

  // 1. Count items before deleting
  const msgCount = await prisma.chatMessage.count();
  const threadCount = await prisma.chatThread.count();
  const requestCount = await prisma.buyRequest.count();

  console.log(`Current database records:`);
  console.log(`- ChatMessages: ${msgCount}`);
  console.log(`- ChatThreads: ${threadCount}`);
  console.log(`- BuyRequests: ${requestCount}`);

  if (msgCount === 0 && threadCount === 0 && requestCount === 0) {
    console.log('\n✅ Database is already clean. No chat records found!');
    return;
  }

  console.log('\n🗑️ Deleting records in order of dependency constraints...');

  // Delete messages first (depends on thread)
  const delMsgs = await prisma.chatMessage.deleteMany({});
  console.log(`  └ Deleted ${delMsgs.count} ChatMessages`);

  // Delete threads second (depends on buy request)
  const delThreads = await prisma.chatThread.deleteMany({});
  console.log(`  └ Deleted ${delThreads.count} ChatThreads`);

  // Delete buy requests third
  const delRequests = await prisma.buyRequest.deleteMany({});
  console.log(`  └ Deleted ${delRequests.count} BuyRequests`);

  console.log('\n🎉 DATABASE CLEANUP COMPLETED SUCCESSFULLY!');
}

clearChats()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
