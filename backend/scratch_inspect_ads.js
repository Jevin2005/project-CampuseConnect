const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Querying all advertisements in database...');
  const ads = await prisma.advertisement.findMany({
    include: {
      college: { select: { name: true, code: true } }
    }
  });
  console.log(JSON.stringify(ads, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
