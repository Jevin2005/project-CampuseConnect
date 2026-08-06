/**
 * Video Processing Queue
 * Bull queue that transcodes uploaded raw videos to HLS and uploads them to R2.
 *
 * Job payload: { productId: string, rawR2Key: string }
 *
 * Pipeline per job:
 *   1. Download raw file from R2 → /tmp/{productId}/raw.mp4
 *   2. Transcode to HLS via ffmpeg → /tmp/{productId}/hls/
 *   3. Extract poster frame → /tmp/{productId}/poster.jpg
 *   4. Upload all HLS + poster to R2 under hls/{productId}/
 *   5. Delete raw R2 prefix raw/{productId}/ (only on success)
 *   6. rm -rf /tmp/{productId}
 *   7. Update Product: status='active', posterUrl, durationSeconds
 *
 * On failure:
 *   - Set status='PROCESSING_FAILED', log error
 *   - Do NOT delete raw R2 file (allows manual retry)
 *   - Clean up /tmp/{productId} regardless
 */

'use strict';

/* ─── Guard: fail gracefully if 'bull' isn't installed yet ──────────────── */
let Bull;
try {
  Bull = require('bull');
} catch (_) {
  const msg =
    '\n❌  [VideoQueue] The "bull" package is not installed.\n' +
    '    Run:  cd backend && npm install\n' +
    '    Then restart the server.\n';
  console.error(msg);

  // Export a stub so the rest of the app can import this module without crashing.
  // Calling .add() on the stub will throw a clear error at job-dispatch time.
  module.exports = {
    add: () => { throw new Error('"bull" package is not installed. Run npm install in the backend directory.'); },
    process: () => {},
    on: () => {},
  };
  return; // stop executing this file
}

const path   = require('path');
const fs     = require('fs');
const { pipeline } = require('stream/promises');

const { PrismaClient } = require('@prisma/client');
const r2  = require('../services/r2.service');
const hls = require('../services/hls.service');

const prisma = new PrismaClient();

/* ─── MIME helpers ──────────────────────────────────────────────────────── */
function contentTypeForFile(filename) {
  if (filename.endsWith('.m3u8')) return 'application/vnd.apple.mpegurl';
  if (filename.endsWith('.ts'))   return 'video/MP2T';
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}

/* ─── Redis client: Upstash-compatible ioredis with TLS ─────────────────────
 *
 * Why not pass REDIS_URL string directly to Bull?
 * Bull's redis option passes the URL to ioredis under the hood, but ioredis
 * does NOT automatically enable TLS for rediss:// URLs in all versions.
 * Upstash ONLY accepts TLS connections — plain TCP gets ECONNRESET immediately.
 *
 * Fix: build an ioredis instance manually with tls: {} and the Upstash-required
 * options (maxRetriesPerRequest: null, enableReadyCheck: false), then pass it
 * to Bull as a pre-built client via the `createClient` factory.
 * ──────────────────────────────────────────────────────────────────────────── */
const IORedis = require('ioredis');

/**
 * Build a single ioredis client configured for Upstash TLS.
 * @param {object} [extraOpts] - extra ioredis options (e.g. { enableReadyCheck: false })
 */
function createRedisClient(extraOpts = {}) {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const isTls    = redisUrl.startsWith('rediss://');

  return new IORedis(redisUrl, {
    tls:                  isTls ? {} : undefined, // enable TLS for rediss://
    maxRetriesPerRequest: null,   // required by Bull — don't cap retries
    enableReadyCheck:     false,  // Upstash: skip the READY ping handshake
    lazyConnect:          false,
    retryStrategy: (times) => {
      // Backoff reconnect attempts (1s -> 10s max) to prevent log flooding when Redis DNS fails
      return Math.min(times * 1000, 10000);
    },
    ...extraOpts,
  });
}

/** @type {import('bull').Queue} */
const videoQueue = new Bull('video-processing', {
  // Pass a createClient factory so Bull uses our TLS-aware ioredis clients.
  // Bull creates three internal clients: client, subscriber, bclient.
  createClient(type) {
    switch (type) {
      case 'client':
        return createRedisClient();
      case 'subscriber':
        // Subscriber connections must not block on commands
        return createRedisClient({ enableReadyCheck: false });
      case 'bclient':
        // Blocking client used for BLPOP — needs its own connection
        return createRedisClient({ enableReadyCheck: false });
      default:
        return createRedisClient();
    }
  },
  defaultJobOptions: {
    attempts:         3,
    backoff:          { type: 'exponential', delay: 10_000 },
    removeOnComplete: 50,   // keep last 50 completed jobs for inspection
    removeOnFail:     100,
  },
});

/* ─── Job processor ─────────────────────────────────────────────────────── */

videoQueue.process(2 /* concurrency */, async (job) => {
  /** @type {{ productId: string, rawR2Key: string, videoIndex?: number }} */
  const { productId, rawR2Key, videoIndex = 0 } = job.data;

  console.log(`[VideoQueue] Job ${job.id} started — productId: ${productId}, videoIndex: ${videoIndex}`);

  // Each video gets its own isolated tmp dir so parallel jobs don't clash
  const tmpDir    = path.join('/tmp', `${productId}_v${videoIndex}`);
  const rawPath   = path.join(tmpDir, 'raw.mp4');
  const hlsDir    = path.join(tmpDir, 'hls');
  const posterPath = path.join(tmpDir, 'poster.jpg');

  // R2 prefix for this video: hls/{productId}/video_{videoIndex}/
  const hlsR2Prefix = `hls/${productId}/video_${videoIndex}`;

  /* ── Ensure clean tmp dir ──────────────────────────────────────────── */
  fs.mkdirSync(hlsDir, { recursive: true });

  try {
    /* ── Step 1: Download raw video from R2 ─────────────────────────── */
    console.log(`[VideoQueue] Downloading raw file: ${rawR2Key}`);
    const rawStream = await r2.getObjectStream(rawR2Key);
    const writeStream = fs.createWriteStream(rawPath);
    await pipeline(rawStream, writeStream);
    console.log(`[VideoQueue] Downloaded to ${rawPath}`);

    /* ── Step 2: Transcode to HLS ───────────────────────────────────── */
    console.log('[VideoQueue] Starting HLS transcode...');
    const { filenames, durationSeconds } = await hls.processVideoToHLS(rawPath, hlsDir);
    console.log(`[VideoQueue] HLS done — ${filenames.length} files, duration: ${durationSeconds}s`);

    /* ── Step 3: Generate poster frame (only for first video) ───────── */
    if (videoIndex === 0) {
      console.log('[VideoQueue] Generating poster frame...');
      await hls.generatePoster(rawPath, posterPath);
      console.log('[VideoQueue] Poster generated');
    }

    /* ── Step 4: Upload HLS files + poster to R2 ────────────────────── */
    console.log(`[VideoQueue] Uploading HLS files to R2 under ${hlsR2Prefix}/...`);

    // Upload all HLS segment/playlist files under video-specific prefix
    await Promise.all(
      filenames.map((filename) => {
        const localFilePath = path.join(hlsDir, filename);
        const r2Key         = `${hlsR2Prefix}/${filename}`;
        const ct            = contentTypeForFile(filename);
        return r2.uploadFile(localFilePath, r2Key, ct);
      }),
    );

    // Upload poster (first video only)
    if (videoIndex === 0 && fs.existsSync(posterPath)) {
      const posterKey = `hls/${productId}/poster.jpg`;
      await r2.uploadFile(posterPath, posterKey, 'image/jpeg');
    }

    console.log(`[VideoQueue] All files uploaded to R2 under ${hlsR2Prefix}/`);

    /* ── Step 5: Delete raw R2 object ───────────────────────────────── */
    const rawPrefix = rawR2Key.includes('/') ? rawR2Key.substring(0, rawR2Key.lastIndexOf('/') + 1) : `raw/${productId}/`;
    console.log(`[VideoQueue] Deleting raw prefix: ${rawPrefix}`);
    await r2.deletePrefix(rawPrefix);

    /* ── Step 6: Clean up /tmp ──────────────────────────────────────── */
    fs.rmSync(tmpDir, { recursive: true, force: true });
    console.log(`[VideoQueue] Cleaned up ${tmpDir}`);

    /* ── Step 7: Update Product record ─────────────────────────────── */
    await prisma.product.update({
      where: { id: productId },
      data:  {
        status:     'active',
        isApproved: true,
      },
    });

    console.log(`[VideoQueue] Job ${job.id} completed — product ${productId} video_${videoIndex} is now active`);
    return { productId, videoIndex, durationSeconds };

  } catch (err) {
    /* ── Failure handler ─────────────────────────────────────────────── */
    const isMissingKey = err.name === 'NoSuchKey' || (err.message && (err.message.includes('specified key does not exist') || err.message.includes('NotFound')));

    if (isMissingKey) {
      console.warn(`[VideoQueue] ⚠️  Raw video file for product ${productId} ("${rawR2Key}") is not found in R2. Skipping HLS conversion.`);
      try {
        await prisma.product.update({
          where: { id: productId },
          data:  { status: 'active' }, // Restore active status for direct fallback
        });
      } catch (_) {}
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch (_) {}
      return { productId, skipped: true, reason: 'Raw file missing in R2' };
    }

    console.error(`[VideoQueue] Job ${job.id} FAILED for product ${productId}:`, err.message);

    // Mark product as failed in DB
    try {
      await prisma.product.update({
        where: { id: productId },
        data:  { status: 'PROCESSING_FAILED' },
      });
    } catch (dbErr) {
      console.error('[VideoQueue] Could not update product status to PROCESSING_FAILED:', dbErr.message);
    }

    // Always clean up /tmp, even on failure — do NOT delete raw R2 key (allow retry)
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (_) { /* ignore cleanup errors */ }

    // Re-throw so Bull marks the job as failed and triggers retry
    throw err;
  }
});

/* ─── Queue event logging ───────────────────────────────────────────────── */

videoQueue.on('completed', (job, result) => {
  console.log(`[VideoQueue] ✅ Job ${job.id} completed:`, result);
});

videoQueue.on('failed', (job, err) => {
  console.error(`[VideoQueue] ❌ Job ${job.id} failed (attempt ${job.attemptsMade}/${job.opts.attempts}):`, err.message);
});

videoQueue.on('stalled', (job) => {
  console.warn(`[VideoQueue] ⚠️  Job ${job.id} stalled and will be retried`);
});

let lastErrorLogTime = 0;
videoQueue.on('error', (err) => {
  const isTransient = err.message && (
    err.message.includes('ECONNRESET') ||
    err.message.includes('ETIMEDOUT') ||
    err.message.includes('ENOTFOUND')
  );
  if (isTransient) return; // Ignore transient socket reset logs

  const now = Date.now();
  if (now - lastErrorLogTime > 30000) {
    console.warn('[VideoQueue] Queue connection notice (throttled):', err.message);
    lastErrorLogTime = now;
  }
});

module.exports = videoQueue;
