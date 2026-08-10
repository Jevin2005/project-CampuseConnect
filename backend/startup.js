/**
 * startup.js — runs on every Render deploy before server.js
 *
 * Steps (all non-fatal — server starts regardless):
 *   1. prisma generate   — compile Prisma client for this env
 *   2. prisma migrate deploy — apply pending DB migrations
 *      • If P3005 (DB exists but no migration history) → auto-baseline then retry
 *   3. seed.js — upsert MasterAdmin + Demo College so login works on fresh DB
 *   4. Boot server.js
 */

'use strict';

const { execSync, spawnSync } = require('child_process');

// ── Migration names in order (add new ones when you create them) ──────────
const MIGRATIONS = [
  '20260506175927_init',
  '20260511185004_add_student_password',
  '20260512123636_add_student_auth_fields',
  '20260519162355_add_wishlist_and_orders_v2',
];

function run(cmd) {
  const result = spawnSync(cmd, { cwd: __dirname, shell: true, encoding: 'utf8' });
  const out = (result.stdout || '') + (result.stderr || '');
  if (result.status !== 0) {
    const err = new Error(`Command failed: ${cmd}`);
    err.output = out;
    throw err;
  }
  return out;
}

// ── Step 1: prisma generate ───────────────────────────────────────────────
console.log('\n🔧 [Startup] Step 1 — prisma generate...');
try {
  run('npx prisma generate');
  console.log('✅ [Startup] prisma generate — done');
} catch (err) {
  console.error('❌ [Startup] prisma generate failed:', err.output || err.message);
  // Non-fatal — continue to migrate
}

// ── Step 2: prisma migrate deploy ────────────────────────────────────────
console.log('\n🔧 [Startup] Step 2 — prisma migrate deploy...');
try {
  const out = run('npx prisma migrate deploy');
  console.log('✅ [Startup] prisma migrate deploy — done');
  if (out) console.log(out.trim());
} catch (err) {
  const output = err.output || err.message || '';

  if (output.includes('P3005') || output.includes('already exists')) {
    // ── P3005: DB has tables but no migration history — auto-baseline ──
    console.warn('⚠️  [Startup] P3005 detected — DB tables exist but no migration history.');
    console.warn('   Auto-baselining all migrations as already applied...');

    let baselineOk = true;
    for (const migration of MIGRATIONS) {
      try {
        run(`npx prisma migrate resolve --applied "${migration}"`);
        console.log(`   ✅ Baselined: ${migration}`);
      } catch (e) {
        const errText = e.output || e.message || '';
        if (errText.includes('already') || errText.includes('recorded')) {
          console.log(`   ✅ Already applied: ${migration}`);
        } else {
          console.error(`   ❌ Failed to baseline ${migration}:`, errText.slice(0, 200));
          baselineOk = false;
        }
      }
    }

    if (baselineOk) {
      try {
        run('npx prisma migrate deploy');
        console.log('✅ [Startup] prisma migrate deploy — done after baseline');
      } catch (retryErr) {
        console.error('❌ [Startup] migrate deploy failed after baseline:', (retryErr.output || retryErr.message).slice(0, 300));
      }
    }
  } else {
    console.error('❌ [Startup] prisma migrate deploy failed:\n', output.slice(0, 500));
  }
}

// ── Step 3: Seed initial data (async — must be awaited) ───────────────────
console.log('\n🌱 [Startup] Step 3 — seeding database (MasterAdmin + Demo College)...');

async function runSeed() {
  // Load dotenv here too (startup.js runs before server.js which loads it)
  require('dotenv').config();

  const { PrismaClient } = require('@prisma/client');
  const bcrypt = require('bcryptjs');
  const prisma = new PrismaClient();

  try {
    const masterEmail    = process.env.MASTER_EMAIL    || 'admin@campusconnect.in';
    const masterPassword = process.env.MASTER_PASSWORD || 'MasterAdmin@2024!';
    const rounds         = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

    const hashed = await bcrypt.hash(masterPassword, rounds);

    const master = await prisma.masterAdmin.upsert({
      where:  { email: masterEmail },
      update: { password: hashed, name: 'Platform Admin' },
      create: { email: masterEmail, password: hashed, name: 'Platform Admin', tokenVersion: 0 },
    });
    console.log(`   ✅ MasterAdmin ready: ${master.email}`);

    // Ensure RNGPIT College & Admin exist (for testing / deployed site)
    let rngpit = await prisma.college.findFirst({
      where: { OR: [{ code: 'RNGPIT123' }, { emailDomain: 'rngpit.ac.in' }] }
    });
    if (!rngpit) {
      rngpit = await prisma.college.create({
        data: {
          name: 'rngpit',
          code: 'RNGPIT123',
          emailDomain: 'rngpit.ac.in',
          city: 'Surat',
          type: 'Engineering',
          isApproved: true,
        },
      });
      console.log('   ✅ RNGPIT College created (RNGPIT123 / rngpit.ac.in)');
    } else {
      console.log(`   ✅ RNGPIT College exists: ${rngpit.code}`);
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'jevingoti005@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2024!';
    const hashedAdminPassword = await bcrypt.hash(adminPassword, rounds);

    const admin = await prisma.admin.upsert({
      where: { email: adminEmail },
      update: {
        password: hashedAdminPassword,
        isApproved: true,
        isEmailVerified: true,
        collegeId: rngpit.id,
      },
      create: {
        name: 'JEVIN',
        email: adminEmail,
        password: hashedAdminPassword,
        collegeId: rngpit.id,
        isApproved: true,
        isEmailVerified: true,
      },
    });
    console.log(`   ✅ College Admin ready: ${admin.email} (College Code: ${rngpit.code})`);

    // Ensure Student account exists and password is set
    const studentEmail = process.env.STUDENT_EMAIL || 'cse.230840131027@gmail.com';
    const studentPassword = process.env.STUDENT_PASSWORD || 'Student@2024!';
    const hashedStudentPassword = await bcrypt.hash(studentPassword, rounds);

    const student = await prisma.student.upsert({
      where: { email: studentEmail },
      update: {
        password: hashedStudentPassword,
        isApproved: true,
        isEmailVerified: true,
        collegeId: rngpit.id,
      },
      create: {
        name: 'Jevin Goti',
        email: studentEmail,
        password: hashedStudentPassword,
        collegeId: rngpit.id,
        enrollmentId: '230840131027',
        isApproved: true,
        isEmailVerified: true,
      },
    });
    console.log(`   ✅ Student ready: ${student.email}`);

    // Ensure Demo College exists (for testing / first-time login)
    const demoCollege = await prisma.college.findFirst({ where: { emailDomain: 'demo.edu' } });
    if (!demoCollege) {
      await prisma.college.create({
        data: {
          name:        'Demo College',
          code:        'DEMO2024',
          emailDomain: 'demo.edu',
          city:        'Mumbai',
          type:        'Engineering',
          isApproved:  true,
        },
      });
      console.log('   ✅ Demo College created (DEMO2024 / demo.edu)');
    } else {
      console.log(`   ✅ Demo College already exists: ${demoCollege.code}`);
    }

    console.log('✅ [Startup] Seeding complete');
  } catch (e) {
    console.error('⚠️  [Startup] Seeding failed (non-fatal):', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed, then boot server regardless of outcome
runSeed().finally(() => {
  console.log('\n🚀 [Startup] Step 4 — starting server...\n');
  require('./server.js');
});
