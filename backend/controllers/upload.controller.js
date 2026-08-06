/**
 * Upload Controller — Video DRM Pipeline
 *
 * POST /api/student/upload/video-init
 *   Body: { productId, filename, contentType }
 *   - Verifies the requesting student owns the product and it is a digital video type.
 *   - Returns a presigned PUT URL so the browser can upload directly to R2
 *     under raw/{productId}/{filename}.  The raw file is NEVER stored permanently;
 *     it gets deleted from R2 after the queue worker finishes HLS conversion.
 *
 * POST /api/student/upload/video-complete
 *   Body: { productId, rawR2Key }
 *   - Sets product status to 'PROCESSING'.
 *   - Enqueues a 'video-processing' Bull job.
 *   - Returns { status: 'queued', jobId }.
 */

'use strict';

const { PrismaClient } = require('@prisma/client');
const r2         = require('../services/r2.service');
const videoQueue = require('../queues/videoProcessing.queue');

const prisma = new PrismaClient();

/* ─── Allowed video MIME types ───────────────────────────────────────────── */
const ALLOWED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'video/mpeg',
  'video/ogg',
]);

/* ────────────────────────────────────────────────────────────────────────── */

/**
 * POST /api/student/upload/video-init
 *
 * Returns a presigned PUT URL for direct browser → R2 upload.
 * The raw video is placed at: raw/{productId}/{filename}
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
exports.videoInit = async (req, res) => {
  try {
    const { productId, filename, contentType } = req.body;

    if (!productId || !filename || !contentType) {
      return res.status(400).json({ message: 'productId, filename, and contentType are required' });
    }

    // Validate MIME type
    if (!ALLOWED_VIDEO_TYPES.has(contentType)) {
      return res.status(400).json({
        message: `Unsupported contentType "${contentType}". Allowed: ${[...ALLOWED_VIDEO_TYPES].join(', ')}`,
      });
    }

    // Verify the product exists and the requesting student is the seller
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: you do not own this product' });
    }

    // Must be a digital product (video sub-type)
    if (product.productType !== 'digital') {
      return res.status(400).json({ message: 'Only digital products support video upload' });
    }
    const subType = (product.digitalSubType || '').toLowerCase();
    if (subType !== 'video' && subType !== 'course') {
      return res.status(400).json({ message: 'Product digitalSubType must be "video" or "course"' });
    }

    // Sanitise filename (strip path separators)
    const safeFilename = filename.replace(/[/\\]/g, '_');
    const r2Key = `raw/${productId}/${safeFilename}`;

    const uploadUrl = await r2.getUploadPresignedUrl(r2Key, contentType, 3600);

    return res.json({
      uploadUrl,
      r2Key,
      expiresInSeconds: 3600,
      message: 'PUT the video binary directly to uploadUrl, then call /video-complete',
    });
  } catch (err) {
    console.error('[videoInit]', err);
    return res.status(500).json({ message: 'Error generating upload URL', detail: err.message });
  }
};

/* ────────────────────────────────────────────────────────────────────────── */

/**
 * POST /api/student/upload/video-complete
 *
 * Called after the browser has successfully PUT the raw video to R2.
 * Sets the product status to 'PROCESSING' and enqueues the HLS job.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
exports.videoComplete = async (req, res) => {
  try {
    const { productId, rawR2Key } = req.body;

    if (!productId || !rawR2Key) {
      return res.status(400).json({ message: 'productId and rawR2Key are required' });
    }

    // Re-verify ownership (defensive)
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: you do not own this product' });
    }

    // Validate the R2 key is under raw/{productId}/ to prevent arbitrary key injection
    if (!rawR2Key.startsWith(`raw/${productId}/`)) {
      return res.status(400).json({ message: 'Invalid rawR2Key — must start with raw/{productId}/' });
    }

    // Mark product as processing
    await prisma.product.update({
      where: { id: productId },
      data:  { status: 'PROCESSING', isApproved: false },
    });

    // Enqueue the HLS conversion job
    const job = await videoQueue.add(
      { productId, rawR2Key },
      { jobId: `video-${productId}` },   // idempotent — prevents duplicate jobs per product
    );

    console.log(`[videoComplete] Enqueued job ${job.id} for product ${productId}`);

    return res.json({
      status: 'queued',
      jobId: job.id,
      message: 'Video processing started. Poll the product status field — it will change from PROCESSING to active (or PROCESSING_FAILED).',
    });
  } catch (err) {
    console.error('[videoComplete]', err);
    return res.status(500).json({ message: 'Error queuing video processing', detail: err.message });
  }
};
