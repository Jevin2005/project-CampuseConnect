/**
 * startup.js — runs before server.js on every Render deploy
 *
 * 1. prisma generate  — ensure client binary matches schema
 * 2. prisma migrate deploy — apply pending migrations
 *    If P3005 (non-empty DB with no migration history) → auto-baseline all
 *    existing migrations, then retry deploy
 * 3. Server boots regardless — errors are logged, not fatal
 */

const { execSync } = require('child_process');

// All migration names in order — add new ones here when you create them
const MIGRATIONS = [
  '20260506175927_init',
  '20260511185004_add_student_password',
  '20260512123636_add_student_auth_fields',
  '20260519162355_add_wishlist_and_orders_v2',
];

function run(cmd) {
  return execSync(cmd, { cwd: __dirname, stdio: 'pipe' }).toString();
}

// ── Step 1: prisma generate ───────────────────────────────────────────
console.log('\n🔧 [Startup] prisma generate...');
try {
  run('npx prisma generate');
  console.log('✅ [Startup] prisma generate — done');
} catch (err) {
  console.error('❌ [Startup] prisma generate failed:', err.stderr?.toString() || err.message);
}

// ── Step 2: prisma migrate deploy (with P3005 auto-baseline) ─────────
console.log('\n🔧 [Startup] prisma migrate deploy...');
try {
  run('npx prisma migrate deploy');
  console.log('✅ [Startup] prisma migrate deploy — done');
} catch (err) {
  const output = (err.stderr?.toString() || '') + (err.stdout?.toString() || '') + err.message;

  if (output.includes('P3005')) {
    // ── Auto-baseline: DB has tables but no migration history ──────────
    console.warn('⚠️  [Startup] P3005 detected — DB exists without migration history.');
    console.warn('   Baselining all migrations as already applied...');

    let baselineOk = true;
    for (const migration of MIGRATIONS) {
      try {
        run(`npx prisma migrate resolve --applied "${migration}"`);
        console.log(`   ✅ Baselined: ${migration}`);
      } catch (e) {
        const errText = (e.stderr?.toString() || '') + e.message;
        // "already recorded" is fine — not an error
        if (errText.includes('already') || errText.includes('recorded')) {
          console.log(`   ✅ Already applied: ${migration}`);
        } else {
          console.error(`   ❌ Failed to baseline ${migration}:`, errText);
          baselineOk = false;
        }
      }
    }

    if (baselineOk) {
      // Retry deploy after baseline
      try {
        run('npx prisma migrate deploy');
        console.log('✅ [Startup] prisma migrate deploy — done after baseline');
      } catch (retryErr) {
        console.error('❌ [Startup] migrate deploy failed after baseline:', retryErr.message);
      }
    }
  } else {
    console.error('❌ [Startup] prisma migrate deploy failed:', output);
  }
}

console.log('\n🚀 [Startup] Starting server...\n');

// Hand off to the actual server
require('./server.js');

