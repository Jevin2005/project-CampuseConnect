/**
 * Redis Service
 * Uses ioredis for OTP storage, session management, and caching.
 * Includes instant fallback to in-memory store when Redis is offline.
 */

const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  connectTimeout: 500,        // 500ms max connect attempt
  maxRetriesPerRequest: 1,    // Fail requests immediately when disconnected
  enableOfflineQueue: false,  // Don't queue commands when disconnected
  retryStrategy: (times) => {
    if (times >= 2) {
      return null; // Stop retrying quickly to avoid blocking API requests & OTPs
    }
    return 100;
  },
});

let noticeLogged = false;
redis.on('error', (err) => {
  if (!noticeLogged) {
    console.warn('[Redis] Connection offline. OTP and session cache will use instant in-memory fallback.');
    noticeLogged = true;
  }
});

redis.on('connect', () => {
  noticeLogged = false;
  console.log('[Redis] Connected successfully');
});

// Safely wrap async data commands so they reject instantly (< 1ms) if Redis is offline.
// This allows caller try/catch blocks to immediately run in-memory fallbacks without hanging.
const DATA_COMMANDS = ['get', 'set', 'setex', 'del', 'exists', 'expire', 'ttl', 'incr', 'decr', 'hget', 'hset', 'hdel'];

for (const cmd of DATA_COMMANDS) {
  const originalMethod = redis[cmd];
  if (typeof originalMethod === 'function') {
    redis[cmd] = function (...args) {
      if (redis.status !== 'ready') {
        return Promise.reject(new Error(`Redis is offline (status: ${redis.status}). Using in-memory fallback.`));
      }
      return originalMethod.apply(redis, args);
    };
  }
}

module.exports = redis;


