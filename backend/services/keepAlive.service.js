/**
 * KeepAlive Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Prevents cloud-hosted services (Neon PostgreSQL + Upstash Redis) from going
 * idle / sleeping by sending a lightweight ping every few minutes.
 *
 * Why this is needed:
 *  • Neon free tier  → suspends the DB after ~5 min of inactivity → P1001 error
 *  • Upstash Redis   → may close idle TLS connections after inactivity
 *  • Bull VideoQueue → drops its Redis connection when Redis reconnects
 *
 * Strategy:
 *  • DB ping   : `SELECT 1`  every 4 minutes  (Neon wakes in < 1 s after this)
 *  • Redis ping: `PING`      every 3 minutes  (keeps TLS socket warm)
 *  • All errors are swallowed silently — this service must never crash the app
 *  • Log output is minimal (only on first success and on reconnect after failure)
 */

const PING_DB_INTERVAL_MS    = 4 * 60 * 1000; // 4 minutes
const PING_REDIS_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes

// ── Internal state ────────────────────────────────────────────────────────────
let dbWasDown    = false;
let redisWasDown = false;

/**
 * Start the keep-alive pings.
 * Call this once after the server has started.
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {import('ioredis').Redis}               redis
 */
function startKeepAlive(prisma, redis) {

  // ── 1. Database ping (Neon PostgreSQL) ────────────────────────────────────
  setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;

      if (dbWasDown) {
        console.log('[KeepAlive] ✅ Database is back online.');
        dbWasDown = false;
      }
    } catch (err) {
      if (!dbWasDown) {
        console.warn(`[KeepAlive] ⚠️  Database ping failed: ${err.message}`);
        dbWasDown = true;
      }
      // Silently retry next cycle — do NOT crash the app
    }
  }, PING_DB_INTERVAL_MS);

  // ── 2. Redis ping (Upstash) ───────────────────────────────────────────────
  setInterval(async () => {
    try {
      // Only ping when the client thinks it's connected; avoid wasted TLS
      // handshakes when it has already given up retrying.
      if (redis.status !== 'ready') {
        // Attempt to reconnect if the client has permanently stopped
        if (redis.status === 'end' || redis.status === 'close') {
          redis.connect().catch(() => {}); // ioredis handles reconnect internally
        }
        return;
      }

      await redis.ping();

      if (redisWasDown) {
        console.log('[KeepAlive] ✅ Redis is back online.');
        redisWasDown = false;
      }
    } catch (err) {
      if (!redisWasDown) {
        console.warn(`[KeepAlive] ⚠️  Redis ping failed: ${err.message}`);
        redisWasDown = true;
      }
      // Silently retry next cycle — do NOT crash the app
    }
  }, PING_REDIS_INTERVAL_MS);

  console.log('[KeepAlive] 🟢 Started — DB ping every 4 min · Redis ping every 3 min');
}

module.exports = { startKeepAlive };
