const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function activate() {
  try {
    const res = await prisma.product.update({
      where: { id: 'cmrs4a8yx0001g51wi0yt1084' },
      data:  { status: 'active', isApproved: true },
    });
    console.log('✅ Product activated:', res.id, res.title, res.status);
  } catch (err) {
    console.error('Error activating product:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

activate();
