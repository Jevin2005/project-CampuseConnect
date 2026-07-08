/**
 * startup.js — runs before server.js on every Render deploy
 *
 * 1. Runs `prisma generate` to ensure client matches the schema
 * 2. Runs `prisma migrate deploy` to apply any pending DB migrations
 * 3. Passes all errors to console but does NOT crash the server
 *    (better to serve with a stale schema than to be completely down)
 */

const { execSync } = require('child_process');

function run(cmd, label) {
  console.log(`\n🔧 [Startup] Running: ${label}...`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: __dirname });
    console.log(`✅ [Startup] ${label} — done`);
  } catch (err) {
    console.error(`❌ [Startup] ${label} failed:`, err.message);
    // Don't exit — let the server try to boot anyway
  }
}

run('npx prisma generate', 'prisma generate');
run('npx prisma migrate deploy', 'prisma migrate deploy');

console.log('\n🚀 [Startup] Starting server...\n');

// Hand off to the actual server
require('./server.js');
