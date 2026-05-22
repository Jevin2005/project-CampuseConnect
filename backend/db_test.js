const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');

async function testDB() {
  console.log('Testing Prisma/PostgreSQL...');
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  try {
    const result = await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Prisma timeout after 3s')), 3000))
    ]);
    console.log('Prisma query success:', result);
  } catch (err) {
    console.error('Prisma query failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function testRedis() {
  console.log('Testing Redis...');
  const redis = new Redis('redis://localhost:6379', {
    connectTimeout: 2000,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // don't retry
  });
  try {
    const result = await Promise.race([
      redis.ping(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout after 3s')), 3000))
    ]);
    console.log('Redis ping success:', result);
  } catch (err) {
    console.error('Redis ping failed:', err.message);
  } finally {
    redis.disconnect();
  }
}

async function main() {
  await testDB();
  await testRedis();
  process.exit(0);
}

main();
