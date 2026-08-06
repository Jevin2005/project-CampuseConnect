/**
 * HLS Service
 * Wraps ffmpeg/ffprobe operations needed by the video processing queue.
 *
 * Functions:
 *   processVideoToHLS(inputPath, outputDir) → { filenames, durationSeconds }
 *   generatePoster(inputPath, outputPath)   → void
 */

'use strict';

const ffmpeg = require('fluent-ffmpeg');
const path   = require('path');
const fs     = require('fs');

/* ─── ffmpeg / ffprobe binary paths ──────────────────────────────────────── */
// On Render the binaries are installed system-wide; fluent-ffmpeg will find
// them automatically.  Override via env vars if needed for local dev.
if (process.env.FFMPEG_PATH) ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
if (process.env.FFPROBE_PATH) ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/**
 * Probes a video file and returns its duration in seconds.
 * @param {string} filePath
 * @returns {Promise<number>} duration in seconds (integer)
 */
function probeDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const duration = Math.round(metadata.format?.duration || 0);
      resolve(duration);
    });
  });
}

/**
 * Returns the real duration of a video in seconds.
 * Falls back to 0 on error (non-fatal — duration stored as null in DB).
 * @param {string} filePath
 * @returns {Promise<number>}
 */
async function safeProbeDuration(filePath) {
  try {
    return await probeDuration(filePath);
  } catch (err) {
    console.error('[HLS] ffprobe duration failed:', err.message);
    return 0;
  }
}

/* ─── Exports ────────────────────────────────────────────────────────────── */

/**
 * Rendition config for Adaptive Bitrate Streaming (ABR)
 */
const RENDITIONS = [
  { name: '720p', width: 1280, height: 720,  bv: '2000k', maxrate: '2200k', bufsize: '3000k', ba: '128k' },
  { name: '480p', width: 854,  height: 480,  bv: '1000k', maxrate: '1100k', bufsize: '1500k', ba: '96k' },
  { name: '360p', width: 640,  height: 360,  bv: '500k',  maxrate: '600k',  bufsize: '800k',  ba: '64k' },
];

/**
 * Transcodes a video to Multi-Bitrate Adaptive HLS (720p, 480p, 360p).
 * Generates:
 *   - 720p.m3u8 + segment_720p_XXX.ts
 *   - 480p.m3u8 + segment_480p_XXX.ts
 *   - 360p.m3u8 + segment_360p_XXX.ts
 *   - master.m3u8 (Adaptive Multi-Variant Master Playlist)
 *
 * @param {string} inputPath  - Absolute path to raw video file
 * @param {string} outputDir  - Absolute path to output directory
 * @returns {Promise<{ filenames: string[], durationSeconds: number }>}
 */
function processVideoToHLS(inputPath, outputDir) {
  return new Promise(async (resolve, reject) => {
    fs.mkdirSync(outputDir, { recursive: true });

    const durationSeconds = await safeProbeDuration(inputPath);

    // Helper to transcode one rendition
    const transcodeRendition = (r) => {
      return new Promise((resR, rejR) => {
        const playlistPath = path.join(outputDir, `${r.name}.m3u8`);
        const segmentPattern = path.join(outputDir, `segment_${r.name}_%03d.ts`);

        ffmpeg(inputPath)
          .videoCodec('libx264')
          .addOption('-vf', `scale=${r.width}:${r.height}:force_original_aspect_ratio=decrease,pad=${r.width}:${r.height}:(ow-iw)/2:(oh-ih)/2`)
          .addOption('-profile:v', 'main')
          .addOption('-b:v', r.bv)
          .addOption('-maxrate', r.maxrate)
          .addOption('-bufsize', r.bufsize)
          .addOption('-g', '48')
          .addOption('-keyint_min', '48')
          .addOption('-sc_threshold', '0')
          .addOption('-preset', 'fast')
          .audioCodec('aac')
          .addOption('-b:a', r.ba)
          .addOption('-ac', '2')
          .addOption('-f', 'hls')
          .addOption('-hls_time', '4')
          .addOption('-hls_list_size', '0')
          .addOption('-hls_segment_filename', segmentPattern)
          .addOption('-hls_playlist_type', 'vod')
          .output(playlistPath)
          .on('start', (cmd) => console.log(`[HLS ${r.name}] ffmpeg started`))
          .on('error', (err) => {
            console.error(`[HLS ${r.name}] error:`, err.message);
            rejR(err);
          })
          .on('end', () => {
            console.log(`[HLS ${r.name}] completed`);
            resR();
          })
          .run();
      });
    };

    try {
      // Run transcoding for renditions
      console.log('[HLS] Starting Adaptive Multi-Bitrate transcode...');
      for (const r of RENDITIONS) {
        await transcodeRendition(r);
      }

      // Generate master.m3u8 multi-variant playlist
      const masterContent = [
        '#EXTM3U',
        '#EXT-X-VERSION:3',
        '#EXT-X-STREAM-INF:BANDWIDTH=2200000,RESOLUTION=1280x720,NAME="720p"',
        '720p.m3u8',
        '#EXT-X-STREAM-INF:BANDWIDTH=1100000,RESOLUTION=854x480,NAME="480p"',
        '480p.m3u8',
        '#EXT-X-STREAM-INF:BANDWIDTH=600000,RESOLUTION=640x360,NAME="360p"',
        '360p.m3u8',
      ].join('\n');

      const masterPath = path.join(outputDir, 'master.m3u8');
      fs.writeFileSync(masterPath, masterContent, 'utf-8');

      console.log('[HLS] Adaptive Master Playlist generated successfully');

      const filenames = fs.readdirSync(outputDir);
      resolve({ filenames, durationSeconds });

    } catch (err) {
      console.error('[HLS] Adaptive transcode failed, falling back to single 720p profile:', err.message);
      // Fallback to single 720p profile if multi-rendition transcode fails
      try {
        const masterPlaylist = path.join(outputDir, 'master.m3u8');
        ffmpeg(inputPath)
          .videoCodec('libx264')
          .addOption('-vf', 'scale=-2:720')
          .addOption('-preset', 'fast')
          .audioCodec('aac')
          .addOption('-f', 'hls')
          .addOption('-hls_time', '4')
          .addOption('-hls_list_size', '0')
          .addOption('-hls_segment_filename', path.join(outputDir, 'segment_%03d.ts'))
          .output(masterPlaylist)
          .on('end', async () => {
            const filenames = fs.readdirSync(outputDir);
            resolve({ filenames, durationSeconds });
          })
          .on('error', (fallbackErr) => reject(fallbackErr))
          .run();
      } catch (fbErr) {
        reject(fbErr);
      }
    }
  });
}

/**
 * Extracts a single poster frame from a video as a JPG (~1280px wide).
 * Tries frame at 00:00:03 first; falls back to 00:00:01 for short videos.
 *
 * @param {string} inputPath  - Absolute path to the raw video file
 * @param {string} outputPath - Absolute path where the JPG should be written
 * @returns {Promise<void>}
 */
function generatePoster(inputPath, outputPath) {
  const outputDir      = path.dirname(outputPath);
  const outputFilename = path.basename(outputPath);

  /**
   * @param {string} timemark - ffmpeg timemark (e.g. "00:00:03")
   * @returns {Promise<void>}
   */
  function extractAt(timemark) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .on('error', reject)
        .on('end', resolve)
        .screenshots({
          timestamps:  [timemark],
          filename:    outputFilename,
          folder:      outputDir,
          size:        '1280x?',   // 1280px wide, height auto-calculated
        });
    });
  }

  return extractAt('00:00:03').catch(() => {
    console.warn('[HLS] Poster at 00:00:03 failed, falling back to 00:00:01');
    return extractAt('00:00:01');
  });
}

module.exports = { processVideoToHLS, generatePoster };
