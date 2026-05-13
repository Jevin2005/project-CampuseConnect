/**
 * Redis Service
 * Uses ioredis for OTP storage and session blacklist management.
 */

const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  // No lazyConnect — connect eagerly so errors surface at startup
  retryStrategy: (times) => {
    if (times > 5) {
      console.error('[Redis] Max retries reached. OTP will use in-memory fallback.');
      return null; // stop retrying
    }
    return Math.min(times * 200, 2000);
  },
  enableOfflineQueue: false, // Don't queue commands when disconnected
});

redis.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

redis.on('connect', () => {
  console.log('[Redis] Connected successfully');
});

module.exports = redis;
