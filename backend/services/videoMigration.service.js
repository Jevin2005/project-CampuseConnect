/**
 * Video Migration Service
 * Automatically converts previously uploaded raw video products into 4-second HLS chunk segments.
 */

'use strict';

const { PrismaClient } = require('@prisma/client');
const r2         = require('./r2.service');
const videoQueue = require('../queues/videoProcessing.queue');

const prisma = new PrismaClient();

/**
 * Scans digital video products in PostgreSQL.
 * If a product has a raw video URL in product.images but NO HLS chunks in R2,
 * it enqueues a Bull queue job to transcode the video into HLS chunks.
 */
async function convertLegacyVideosToHLS() {
  try {
    const isVideoFile = (url) => /\.(mp4|webm|mov|mkv)(\?.*)?$/i.test(url);

    const digitalProducts = await prisma.product.findMany({
      where: {
        productType: 'digital',
        status:      { in: ['active', 'PROCESSING'] },
      },
    });

    if (digitalProducts.length === 0) return;

    for (const product of digitalProducts) {
      try {
        const rawVideoUrl = (product.images || []).find(isVideoFile);
        if (!rawVideoUrl) continue;

        // Check if HLS files already exist in R2
        const hlsPrefix = `hls/${product.id}/`;
        const existingKeys = await r2.listObjects(hlsPrefix).catch(() => []);

        if (existingKeys.length === 0) {
          let rawR2Key = rawVideoUrl;
          if (rawVideoUrl.startsWith('http://') || rawVideoUrl.startsWith('https://')) {
            rawR2Key = new URL(rawVideoUrl).pathname.replace(/^\//, '');
          } else {
            rawR2Key = rawVideoUrl.replace(/^\//, '');
          }

          if (videoQueue && typeof videoQueue.add === 'function') {
            console.log(`[VideoMigration] Enqueuing legacy video product ${product.id} ("${product.title}") for HLS chunking...`);
            await videoQueue.add(
              { productId: product.id, rawR2Key },
              { jobId: `video-${product.id}` }
            ).catch((qErr) => {
              console.warn(`[VideoMigration] Could not enqueue video job (Redis/Queue offline):`, qErr.message);
            });
          }
        }
      } catch (prodErr) {
        console.warn(`[VideoMigration] Warning processing product ${product.id}:`, prodErr.message);
      }
    }
  } catch (err) {
    console.warn('[VideoMigration] Legacy check warning:', err.message);
  }
}

module.exports = { convertLegacyVideosToHLS };

