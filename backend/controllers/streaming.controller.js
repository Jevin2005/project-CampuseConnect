/**
 * Streaming Controller — Video DRM (Signed-URL Batch Delivery)
 *
 * Architecture note:
 *   All HLS segment URLs are pre-signed at playlist-request time and embedded
 *   directly into the rewritten master.m3u8.  A URL scraped from the playlist
 *   remains valid until TTL expiry (PLAYLIST_TTL_SECONDS = 1200 s / 20 min).
 *   This is an accepted tradeoff for lower backend load vs. a live per-segment
 *   proxy.  Do NOT implement a live proxy for this use-case.
 *
 * GET  /api/student/content/:orderId
 *   - Verifies buyer owns the order and order.status is PAID or COMPLETED
 *   - Generates a rewritten master.m3u8 with signed segment URLs (TTL 1200 s)
 *   - Increments Product.views once per orderId per calendar day (Redis flag)
 *   - Returns WatchProgress.lastPositionSeconds for resume playback
 *   - Response: { playlistText, buyerUsername, resumeAtSeconds, durationSeconds }
 *
 * PATCH /api/student/content/:orderId/progress
 *   - Upserts WatchProgress { lastPositionSeconds, durationSeconds? }
 *   - Called by the frontend on a THROTTLED interval (~every 15 s).
 *     Frontend devs: do NOT call this on every player timeupdate event —
 *     only call after a meaningful position change (suggested: every 15 s
 *     while playing, and on pause/seek/unload).
 */

'use strict';

const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const r2    = require('../services/r2.service');
const redis = require('../services/redis.service');

const prisma = new PrismaClient();

/** Shared TTL (seconds) for all signed segment URLs issued in one playlist request. */
const PLAYLIST_TTL_SECONDS = 1200; // 20 minutes — long enough for a full lecture watch

/** Redis key prefix for daily view-increment idempotency. */
const VIEW_FLAG_PREFIX = 'viewed';

const DRM_SECRET = process.env.JWT_SECRET || 'campusconnect-drm-secret-key-2026';

function generateSegmentSignature(key, expiresAt) {
  return crypto
    .createHmac('sha256', DRM_SECRET)
    .update(`${key}:${expiresAt}`)
    .digest('hex');
}

function verifySegmentSignature(key, expiresAt, sig) {
  if (!key || !expiresAt || !sig) return false;
  const now = Math.floor(Date.now() / 1000);
  if (parseInt(expiresAt, 10) < now) return false;
  const expectedSig = generateSegmentSignature(key, expiresAt);
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  } catch (_) {
    return false;
  }
}

function render404Page(res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(404).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>404 Not Found</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #0b0f19; color: #9ca3af; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 40px; text-align: center; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        h1 { color: #ef4444; font-size: 56px; margin: 0 0 10px 0; font-weight: 800; }
        h2 { color: #f3f4f6; font-size: 20px; margin: 0 0 10px 0; }
        p { font-size: 14px; line-height: 1.5; color: #6b7280; margin: 0 0 20px 0; }
        .badge { font-family: monospace; font-size: 11px; color: #10b981; background: rgba(16,185,129,0.1); padding: 5px 12px; border-radius: 99px; border: 1px solid rgba(16,185,129,0.2); }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>404</h1>
        <h2>Resource Not Found</h2>
        <p>The segment or video manifest requested is unavailable or direct browser access is prohibited.</p>
        <span class="badge">CampusConnect DRM Protected</span>
      </div>
    </body>
    </html>
  `);
}


/* ────────────────────────────────────────────────────────────────────────── */

/**
 * GET /api/student/content/:orderId
 *
 * Returns a rewritten HLS playlist with signed R2 URLs, plus resume position.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
exports.getContent = async (req, res) => {
  try {
    const { orderId } = req.params;

    /* ── 1. Load and authorise order ────────────────────────────────── */
    const order = await prisma.order.findUnique({
      where:   { id: orderId },
      include: {
        product: true,
        buyer:   { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify the requesting user is the buyer
    if (order.buyerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: you are not the buyer for this order' });
    }

    // Accept both legacy 'COMPLETED' and new 'PAID' order statuses
    const VALID_STATUSES = new Set(['PAID', 'COMPLETED']);
    if (!VALID_STATUSES.has(order.status)) {
      return res.status(403).json({
        message: `Content not available — order status is "${order.status}". Only PAID/COMPLETED orders can access content.`,
      });
    }

    const product = order.product;

    /* ── 2. Verify video is ready ───────────────────────────────────── */
    if (product.status !== 'active') {
      return res.status(409).json({
        message: `Video is not ready yet — product status is "${product.status}". Try again shortly.`,
        productStatus: product.status,
      });
    }

    /* ── 3. List + sign all HLS objects (playlists + segments) ──────── */
    const hlsPrefix = `hls/${product.id}/`;
    const allKeys   = await r2.listObjects(hlsPrefix);

    if (allKeys.length === 0) {
      return res.status(404).json({ message: 'HLS content not found in storage. The video may still be processing.' });
    }

    const masterKey = allKeys.find((k) => k.endsWith('master.m3u8'));
    if (!masterKey) {
      return res.status(404).json({ message: 'master.m3u8 not found — video may not have finished processing' });
    }

    // Keys to sign: sub-playlists (.m3u8) and video segments (.ts)
    const keysToSign = allKeys.filter((k) => !k.endsWith('master.m3u8'));

    // Sign all objects with shared TTL
    const signedUrls = await Promise.all(
      keysToSign.map((key) => r2.getSignedGetUrl(key, PLAYLIST_TTL_SECONDS))
    );

    // Build a map from bare filename (e.g. "720p.m3u8" or "segment_720p_000.ts") → signed URL
    /** @type {Map<string, string>} */
    const fileUrlMap = new Map();
    keysToSign.forEach((key, i) => {
      const bare = key.split('/').pop();
      fileUrlMap.set(bare, signedUrls[i]);
    });

    /* ── 4. Fetch and rewrite master.m3u8 ───────────────────────────── */
    const originalMaster = await r2.getObjectText(masterKey);

    // Rewrite every playlist / segment reference line to its signed URL
    const rewrittenLines = originalMaster.split('\n').map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return line;
      const bare = trimmed.split('/').pop();
      const signedUrl = fileUrlMap.get(bare);
      return signedUrl || line;
    });

    const playlistText = rewrittenLines.join('\n');

    /* ── 5. Increment Product.views (once per orderId per calendar day) */
    try {
      const today   = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
      const viewKey = `${VIEW_FLAG_PREFIX}:${orderId}:${today}`;
      const isNew   = await redis.set(viewKey, '1', 'EX', 86400, 'NX'); // NX = only set if not exists
      if (isNew === 'OK') {
        prisma.product.update({
          where: { id: product.id },
          data:  { views: { increment: 1 } },
        }).catch((e) => console.error('[getContent] views increment failed:', e.message));
      }
    } catch (_) {
      // Non-blocking: skip Redis view increment if Redis is offline/unreachable
    }

    /* ── 6. Load or create WatchProgress ───────────────────────────── */
    let watchProgress = order.watchProgress;
    if (!watchProgress) {
      watchProgress = await prisma.watchProgress.upsert({
        where:  { orderId },
        update: {},
        create: {
          orderId,
          lastPositionSeconds: 0,
          durationSeconds:     product.durationSeconds || null,
        },
      });
    }

    /* ── 7. Return response ─────────────────────────────────────────── */
    return res.json({
      playlistText,
      buyerUsername:    order.buyer.name || order.buyer.email,
      resumeAtSeconds:  watchProgress.lastPositionSeconds,
      durationSeconds:  watchProgress.durationSeconds ?? product.durationSeconds ?? null,
    });

  } catch (err) {
    console.error('[getContent]', err);
    return res.status(500).json({ message: 'Error fetching content', detail: err.message });
  }
};

/* ────────────────────────────────────────────────────────────────────────── */

/**
 * GET /api/student/content/product/:productId
 *
 * Returns rewritten HLS playlist with signed segment URLs for:
 * - Product Sellers (preview/playback of their uploaded course)
 * - Buyers with an active PAID/COMPLETED order
 * - Previewers (req.query.preview === 'true')
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
exports.getProductContent = async (req, res) => {
  try {
    const { productId } = req.params;
    let isPreview = req.query.preview === 'true';
    // videoIndex: which video (0-based) in a multi-video course to stream
    const videoIndex = req.query.videoIndex !== undefined ? parseInt(req.query.videoIndex, 10) : 0;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { seller: { select: { id: true, name: true, email: true } } },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const isSeller = product.sellerId === req.user?.id;

    let hasOrder = false;
    let order = null;
    let resumeAtSeconds = 0;
    if (req.user?.id) {
      order = await prisma.order.findFirst({
        where: {
          productId,
          buyerId: req.user.id,
          status: { in: ['PAID', 'COMPLETED'] },
        },
      });
      if (order) {
        hasOrder = true;
        try {
          if (prisma.watchProgress) {
            const wp = await prisma.watchProgress.findUnique({ where: { orderId: order.id } });
            if (wp) resumeAtSeconds = wp.lastPositionSeconds || 0;
          }
        } catch (_) {}
      }
    }

    // Auto-fallback to preview mode for non-buyers
    if (!isSeller && !hasOrder) {
      isPreview = true;
    }

    // ── Resolve which R2 prefix to look in ──────────────────────────────
    // New structure: hls/{productId}/video_{videoIndex}/master.m3u8
    // Legacy structure: hls/{productId}/master.m3u8  (single-video, index 0)
    const newPrefix    = `hls/${product.id}/video_${videoIndex}/`;
    const legacyPrefix = `hls/${product.id}/`;

    let allKeys = await r2.listObjects(newPrefix);
    let activePrefix = newPrefix;

    // Fall back to legacy flat structure for video 0
    if (allKeys.length === 0 && videoIndex === 0) {
      const legacyKeys = await r2.listObjects(legacyPrefix);
      // Only use legacy if it has a master.m3u8 directly (not inside a video_N/ subdir)
      const legacyMaster = legacyKeys.find((k) => k === `${legacyPrefix}master.m3u8`);
      if (legacyMaster) {
        allKeys = legacyKeys.filter((k) => !k.includes('/video_'));
        activePrefix = legacyPrefix;
      }
    }

    const hasMaster = allKeys.some((k) => k.endsWith('master.m3u8'));

    // If master.m3u8 exists, ensure product status is active
    if (hasMaster && videoIndex === 0 && product.status !== 'active') {
      prisma.product.update({
        where: { id: product.id },
        data:  { status: 'active', isApproved: true },
      }).catch(() => {});
    }

    // If no HLS content yet, fallback to signed raw video file proxy with 200 OK
    if (!hasMaster || allKeys.length === 0) {
      const isVideoFile = (url) => /\.(mp4|webm|mov|mkv)(\?.*)?$/i.test(url);
      const videoFiles = (product.images || []).filter(isVideoFile);
      const rawVideoUrl = videoFiles[videoIndex] || videoFiles[0] || '';

      let signedRawUrl = "";
      if (rawVideoUrl) {
        let rawKey = rawVideoUrl;
        if (rawVideoUrl.startsWith('http://') || rawVideoUrl.startsWith('https://')) {
          try {
            rawKey = new URL(rawVideoUrl).pathname.replace(/^\//, '');
          } catch (_) {
            rawKey = rawVideoUrl.replace(/^\//, '');
          }
        } else {
          rawKey = rawVideoUrl.replace(/^\//, '');
        }
        try {
          rawKey = decodeURIComponent(rawKey);
        } catch (_) {}

        const expiresAt = Math.floor(Date.now() / 1000) + 1800;
        const rawSig = generateSegmentSignature(rawKey, expiresAt);
        const segmentBase = `${req.protocol}://${req.get('host')}/api/student/content/segment`;
        signedRawUrl = `${segmentBase}?key=${encodeURIComponent(rawKey)}&exp=${expiresAt}&sig=${rawSig}`;

        if (allKeys.length === 0) {
          try {
            const videoQueue = require('../queues/videoProcessing.queue');
            if (videoQueue && typeof videoQueue.add === 'function') {
              videoQueue.add(
                { productId: product.id, rawR2Key: rawKey, videoIndex },
                { jobId: `video-${product.id}-${videoIndex}` }
              ).catch(() => {});
            }
          } catch (autoErr) {
            console.error('[getProductContent] Auto-transcode trigger failed:', autoErr.message);
          }
        }
      }

      return res.json({
        masterProxyUrl: signedRawUrl || null,
        rawVideoUrl: signedRawUrl || rawVideoUrl,
        buyerUsername: req.user?.name || req.user?.email || 'Student Access',
        resumeAtSeconds,
        durationSeconds: product.durationSeconds || null,
        isSeller,
        isPreview,
        productStatus: product.status,
      });
    }

    const masterKey = allKeys.find((k) => k.endsWith('master.m3u8'));
    if (!masterKey) {
      return res.status(404).json({ message: 'master.m3u8 not found' });
    }

    const segmentBase = `${req.protocol}://${req.get('host')}/api/student/content/segment`;
    const expiresAt = Math.floor(Date.now() / 1000) + 1800;
    const masterSig = generateSegmentSignature(masterKey, expiresAt);
    // Embed the real R2 key so the proxy handler never has to guess it from path params
    const masterProxyUrl = `${segmentBase}?key=${encodeURIComponent(masterKey)}&exp=${expiresAt}&sig=${masterSig}`;

    const originalMaster = await r2.getObjectText(masterKey);

    const rewrittenLines = originalMaster.split('\n').map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return line;
      const bare = trimmed.split('/').pop();
      const fullKey = `${activePrefix}${bare}`;
      const subSig = generateSegmentSignature(fullKey, expiresAt);
      return `${segmentBase}?key=${encodeURIComponent(fullKey)}&exp=${expiresAt}&sig=${subSig}`;
    });

    const playlistText = rewrittenLines.join('\n');

    return res.json({
      masterProxyUrl,
      playlistText,
      buyerUsername: req.user?.name || req.user?.email || 'Student Access',
      resumeAtSeconds,
      durationSeconds: product.durationSeconds || null,
      isSeller,
      isPreview,
    });

  } catch (err) {
    console.error('[getProductContent Error]', err.message, err.stack);
    return res.status(500).json({ message: 'Error fetching content', detail: err.message, stack: err.stack });
  }
};

/**
 * GET /api/student/content/segment/:productId/:filename?exp=...&sig=...
 * Proxies HLS sub-playlists and 4-second .ts chunks from Cloudflare R2 through Express.
 * Clean segment path displays "segment_720p_002.ts" directly in Network tab.
 * Direct browser tab clicks return 404 HTML Page (Apna College behavior).
 * Invalid or expired HMAC signatures return 404 HTML Page.
 */
exports.proxyHlsSegment = async (req, res) => {
  try {
    let { key, exp, sig } = req.query;

    // key is always provided as a query param now (embedded by getProductContent)
    // Path-param fallback only for very old legacy requests
    if (!key && req.params.productId && req.params.filename) {
      key = `hls/${req.params.productId}/${req.params.filename}`;
    }

    // 1. Direct browser address bar navigation check
    const dest = req.headers['sec-fetch-dest'];
    const mode = req.headers['sec-fetch-mode'];
    const accept = req.headers['accept'] || '';

    const isDirectBrowserDoc = (dest === 'document' || mode === 'navigate' || (accept.startsWith('text/html') && !accept.includes('application/x-mpegURL')));

    if (isDirectBrowserDoc) {
      return render404Page(res);
    }

    // 2. HMAC Signature & Expiry check
    const ALLOWED_KEY_PREFIXES = ['hls/', 'videos/', 'raw/', 'uploads/'];
    const isAllowedPrefix = ALLOWED_KEY_PREFIXES.some(prefix => typeof key === 'string' && key.startsWith(prefix));

    if (!key || typeof key !== 'string' || !isAllowedPrefix || !verifySegmentSignature(key, exp, sig)) {
      return render404Page(res);
    }

    const ext = key.split('.').pop()?.toLowerCase() || '';
    const segmentBase = `${req.protocol}://${req.get('host')}/api/student/content/segment`;

    if (ext === 'm3u8') {
      const text = await r2.getObjectText(key);
      // Determine the directory prefix from the key so sub-playlist segment keys stay correct
      const keyDir = key.substring(0, key.lastIndexOf('/') + 1); // e.g. "hls/{id}/video_0/" or "hls/{id}/"
      const lines = text.split('\n').map((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return line;
        const segmentFilename = trimmed.split('/').pop();
        const segmentKey = `${keyDir}${segmentFilename}`;
        const chunkSig = generateSegmentSignature(segmentKey, exp);
        return `${segmentBase}?key=${encodeURIComponent(segmentKey)}&exp=${exp}&sig=${chunkSig}`;
      });
      res.setHeader('Content-Type', 'application/x-mpegURL');
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      return res.send(lines.join('\n'));
    }

    const objStream = await r2.getObjectStream(key);
    const contentType = ext === 'mp4' ? 'video/mp4' : (ext === 'webm' ? 'video/webm' : 'video/mp2t');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return objStream.pipe(res);
  } catch (err) {
    console.error('[proxyHlsSegment Error]', req.query?.key || req.params?.filename, err.message);
    return render404Page(res);
  }
};

/* ────────────────────────────────────────────────────────────────────────── */

/**
 * PATCH /api/student/content/:orderId/progress
 *
 * Upserts the buyer's watch position.
 *
 * FRONTEND CONTRACT:
 *   Call this endpoint on a THROTTLED interval of approximately every 15 seconds
 *   while the video is playing.  Also call it on pause, seek, and page unload.
 *   Do NOT call this on every 'timeupdate' event from the HTML5 video / HLS.js
 *   player — that fires ~4× per second and would flood the API.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
exports.updateProgress = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { positionSeconds, durationSeconds } = req.body;

    if (positionSeconds === undefined || typeof positionSeconds !== 'number') {
      return res.status(400).json({ message: 'positionSeconds (number) is required' });
    }

    /* ── Verify buyer owns the order ─────────────────────────────────── */
    const order = await prisma.order.findUnique({
      where:  { id: orderId },
      select: { buyerId: true, status: true },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.buyerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: you are not the buyer for this order' });
    }

    const VALID_STATUSES = new Set(['PAID', 'COMPLETED']);
    if (!VALID_STATUSES.has(order.status)) {
      return res.status(403).json({ message: 'Order is not in a purchasable state' });
    }

    /* ── Upsert WatchProgress ────────────────────────────────────────── */
    const progress = await prisma.watchProgress.upsert({
      where:  { orderId },
      create: {
        orderId,
        lastPositionSeconds: Math.max(0, Math.round(positionSeconds)),
        durationSeconds:     durationSeconds != null ? Math.round(durationSeconds) : undefined,
      },
      update: {
        lastPositionSeconds: Math.max(0, Math.round(positionSeconds)),
        ...(durationSeconds != null && { durationSeconds: Math.round(durationSeconds) }),
      },
    });

    return res.json({
      lastPositionSeconds: progress.lastPositionSeconds,
      durationSeconds:     progress.durationSeconds,
    });

  } catch (err) {
    console.error('[updateProgress]', err);
    return res.status(500).json({ message: 'Error updating progress', detail: err.message });
  }
};

/**
 * GET /api/student/content/product/:productId/status
 *
 * Lightweight polling endpoint — returns current product processing status.
 * Used by the video-processing page to poll until status becomes "active".
 */
exports.getProcessingStatus = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, title: true, status: true, digitalSubType: true, images: true },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const allFiles = product.images || [];
    const isDoc = (url) => /\.(pdf|doc|docx|ppt|pptx|txt)(\?.*)?$/i.test(url);
    const isVid = (url) => /\.(mp4|webm|mov|mkv|avi)(\?.*)?$/i.test(url);
    const videoFiles = allFiles.filter(isVid);
    const totalVideos = videoFiles.length;

    // Check R2 for HLS readiness: every video_N must have its own master.m3u8
    // Also support legacy flat structure (single-video products)
    let doneCount = 0;
    let hlsReady = false;
    try {
      if (totalVideos === 0) {
        hlsReady = true; // doc-only product
      } else {
        // Check new per-index structure first
        for (let vIdx = 0; vIdx < totalVideos; vIdx++) {
          const vKeys = await r2.listObjects(`hls/${product.id}/video_${vIdx}/`);
          if (vKeys.some((k) => k.endsWith('master.m3u8'))) doneCount++;
        }

        if (doneCount === 0) {
          // Legacy fallback: flat structure (single video processed before multi-video support)
          const legacyKeys = await r2.listObjects(`hls/${product.id}/`);
          const hasLegacyMaster = legacyKeys.some(
            (k) => k === `hls/${product.id}/master.m3u8`
          );
          if (hasLegacyMaster) doneCount = Math.min(totalVideos, 1);
        }

        hlsReady = doneCount === totalVideos;
      }
    } catch (_) {}

    // If all HLS is ready but status isn't updated yet, auto-fix it
    if (hlsReady && product.status !== 'active') {
      await prisma.product.update({
        where: { id: product.id },
        data:  { status: 'active', isApproved: true },
      }).catch(() => {});
    }

    const effectiveStatus = hlsReady ? 'active' : product.status;

    let vCount = 0;
    let dCount = 0;

    const items = allFiles.map((fileUrl, index) => {
      const isVideo = isVid(fileUrl);
      const isDocument = isDoc(fileUrl);
      const type = isVideo ? 'video' : isDocument ? 'document' : 'media';

      if (isVideo) vCount++;
      if (isDocument) dCount++;

      const videoLocalIdx = isVideo ? vCount - 1 : -1;

      const cleanUrl = fileUrl.split('?')[0];
      const rawName = cleanUrl.substring(cleanUrl.lastIndexOf('/') + 1);
      let fileName = decodeURIComponent(rawName);
      fileName = fileName.replace(/^(documents|videos|images|media|file|thumbnail|thumbnails)[-_]/i, '');
      fileName = fileName.replace(/^(\d+[-_]|file[-\d]+[-_])/, '');
      const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(baseName);
      if (isUuid) {
        fileName = type === 'video' ? `Video Lecture ${vCount}` : `Study Document ${dCount}`;
      } else {
        fileName = fileName.replace(/_/g, ' ').trim();
      }

      // Per-video HLS readiness: check if this specific video's index is done
      const thisVideoDone = isVideo ? videoLocalIdx < doneCount : true;
      const itemHlsReady = isVideo ? thisVideoDone : true;

      return {
        id: index + 1,
        fileName,
        type,
        url: fileUrl,
        status: itemHlsReady ? 'done' : (effectiveStatus === 'PROCESSING' ? 'transcoding' : 'queued'),
      };
    });

    return res.json({
      productId:  product.id,
      title:      product.title,
      status:     effectiveStatus,
      hlsReady,
      items,
    });
  } catch (err) {
    console.error('[getProcessingStatus]', err);
    return res.status(500).json({ message: 'Error checking processing status' });
  }
};

module.exports = {
  getContent:           exports.getContent,
  getProductContent:    exports.getProductContent,
  proxyHlsSegment:      exports.proxyHlsSegment,
  updateProgress:       exports.updateProgress,
  getProcessingStatus:  exports.getProcessingStatus,
};
