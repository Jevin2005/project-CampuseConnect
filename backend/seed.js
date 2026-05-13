/**
 * Seed Script
 * Creates the MasterAdmin account.
 * Run: node seed.js
 */

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  const masterEmail = process.env.MASTER_EMAIL || 'admin@campusconnect.in';
  const masterPassword = process.env.MASTER_PASSWORD || 'MasterAdmin@2024!';
  const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');

  // Check if master admin already exists
  const existing = await prisma.masterAdmin.findUnique({
    where: { email: masterEmail },
  });

  if (existing) {
    console.log(`✅ Master admin already exists: ${masterEmail}`);
  } else {
    const hashedPassword = await bcrypt.hash(masterPassword, bcryptRounds);

    const master = await prisma.masterAdmin.create({
      data: {
        email: masterEmail,
        password: hashedPassword,
        name: 'Platform Admin',
        tokenVersion: 0,
      },
    });

    console.log(`✅ Master admin created: ${master.email}`);
  }

  // Optional: seed a demo college for local development
  const demoCollegeDomain = 'demo.edu';
  const demoCollege = await prisma.college.findFirst({
    where: { emailDomain: demoCollegeDomain },
  });

  if (!demoCollege) {
    await prisma.college.create({
      data: {
        name: 'Demo College',
        code: 'DEMO2024',
        emailDomain: demoCollegeDomain,
        city: 'Mumbai',
        type: 'Engineering',
        isApproved: true,
      },
    });
    console.log(`✅ Demo college created: DEMO2024 (${demoCollegeDomain})`);
    console.log(`   Students can sign in with any @${demoCollegeDomain} email`);
  } else {
    console.log(`✅ Demo college already exists: ${demoCollege.code}`);
  }

  console.log('\n🎉 Seed complete!');
  console.log(`   Master admin email: ${masterEmail}`);
  console.log(`   Master admin password: ${masterPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
