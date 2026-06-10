const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Querying all products in database...');
  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      isApproved: true,
      productType: true,
      price: true
    }
  });
  console.log(JSON.stringify(products, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
