/**
 * Cloudflare R2 Service
 * S3-compatible object storage via @aws-sdk/client-s3
 *
 * Required env vars:
 *   R2_ACCOUNT_ID       – Cloudflare account ID
 *   R2_ACCESS_KEY_ID    – R2 API token access key
 *   R2_SECRET_ACCESS_KEY– R2 API token secret
 *   R2_BUCKET_NAME      – bucket name
 *   R2_PUBLIC_URL       – public domain (e.g. https://pub-xxx.r2.dev OR custom domain)
 */

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutBucketCorsCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const stream = require('stream');
const fs = require('fs');

/* ── R2 client ─────────────────────────────────────────────────────────── */
const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || 'campusconnect';
const PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');

/* ── Helpers ────────────────────────────────────────────────────────────── */
function getFolder(mimetype) {
  if (mimetype.startsWith('video/'))       return 'videos';
  if (mimetype.startsWith('image/'))       return 'images';
  if (mimetype === 'application/pdf')      return 'documents';
  if (mimetype.includes('word'))           return 'documents';
  if (mimetype.includes('presentation'))   return 'documents';
  return 'misc';
}

function buildKey(folder, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const safeName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${folder}/${safeName}-${uuidv4().slice(0, 8)}${ext}`;
}

/** Returns the public URL for a stored key */
function publicUrl(key) {
  return `${PUBLIC_URL}/${key}`;
}

/** Upload a Buffer or Readable stream to R2 */
async function uploadBuffer(buffer, mimetype, originalName) {
  const folder = getFolder(mimetype);
  const key    = buildKey(folder, originalName);

  await R2.send(new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         key,
    Body:        buffer,
    ContentType: mimetype,
    // Cache uploaded files for 7 days on CDN
    CacheControl: 'public, max-age=604800',
  }));

  return { key, url: publicUrl(key) };
}

/** Upload a multer file (has .buffer or .path) */
async function uploadMulterFile(file) {
  const { buffer, mimetype, originalname } = file;
  return uploadBuffer(buffer, mimetype, originalname);
}

/** Delete an object from R2 by key */
async function deleteObject(key) {
  try {
    await R2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (err) {
    console.warn('[R2] deleteObject failed:', key, err.message);
  }
}

/** Delete by public URL (extracts key from URL) */
async function deleteByUrl(url) {
  if (!url || !url.startsWith(PUBLIC_URL)) return;
  const key = url.replace(`${PUBLIC_URL}/`, '');
  await deleteObject(key);
}

/** Generate a presigned upload URL (for direct browser uploads if needed) */
async function presignedUpload(folder, filename, mimetype, expiresIn = 3600) {
  const key = buildKey(folder, filename);
  const cmd = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: mimetype });
  const uploadUrl = await getSignedUrl(R2, cmd, { expiresIn });
  return { uploadUrl, key, publicUrl: publicUrl(key) };
}

/** Check if R2 is configured with real (non-placeholder) credentials */
function isConfigured() {
  const id  = process.env.R2_ACCOUNT_ID;
  const key = process.env.R2_ACCESS_KEY_ID;
  const sec = process.env.R2_SECRET_ACCESS_KEY;
  const bkt = process.env.R2_BUCKET_NAME;
  if (!id || !key || !sec || !bkt) return false;
  // Reject obvious placeholder values from the template
  if (id.startsWith('your_') || key.startsWith('your_') || sec.startsWith('your_')) return false;
  return true;
}

/** Stream an object from R2 by key */
async function getObjectStream(key) {
  let cleanKey = key;
  if (!cleanKey) throw new Error('Object key is required');
  if (cleanKey.startsWith('http://') || cleanKey.startsWith('https://')) {
    cleanKey = new URL(cleanKey).pathname.replace(/^\//, '');
  } else {
    cleanKey = cleanKey.replace(/^\//, '');
  }
  try {
    cleanKey = decodeURIComponent(cleanKey);
  } catch (_) {}
  const response = await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: cleanKey }));
  return response.Body; // This is a readable stream (SDK v3 returns a stream for Node.js)
}

/** Fetch an object text content directly from R2 */
async function getObjectText(key) {
  let cleanKey = key;
  if (!cleanKey) throw new Error('Object key is required');
  if (cleanKey.startsWith('http://') || cleanKey.startsWith('https://')) {
    cleanKey = new URL(cleanKey).pathname.replace(/^\//, '');
  } else {
    cleanKey = cleanKey.replace(/^\//, '');
  }
  try {
    cleanKey = decodeURIComponent(cleanKey);
  } catch (_) {}
  const response = await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: cleanKey }));
  if (response.Body && typeof response.Body.transformToString === 'function') {
    return await response.Body.transformToString();
  }
  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

/** Stream an object from R2 by public URL */
async function getObjectStreamByUrl(url) {
  if (!url || !url.startsWith(PUBLIC_URL)) {
    throw new Error('Not an R2 URL');
  }
  const key = url.replace(`${PUBLIC_URL}/`, '');
  return getObjectStream(key);
}

/* ── HLS pipeline helpers ───────────────────────────────────────────────── */

/**
 * Returns a presigned PUT URL for direct browser → R2 upload.
 * Used by the upload-init endpoint so the browser can PUT the raw video
 * directly to R2 without routing the binary through our server.
 *
 * @param {string} key - R2 object key (e.g. "raw/{productId}/{filename}")
 * @param {string} contentType - MIME type (e.g. "video/mp4")
 * @param {number} [expiresIn=3600] - URL lifetime in seconds
 * @returns {Promise<string>} Presigned PUT URL
 */
async function getUploadPresignedUrl(key, contentType, expiresIn = 3600) {
  const cmd = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
  return getSignedUrl(R2, cmd, { expiresIn });
}

/**
 * Uploads a local file from disk to R2. Used by the HLS queue worker
 * to push ffmpeg-generated .ts segments and master.m3u8 to R2.
 *
 * @param {string} localPath - Absolute path to file on disk
 * @param {string} key - Destination R2 key
 * @param {string} [contentType='application/octet-stream']
 * @returns {Promise<void>}
 */
async function uploadFile(localPath, key, contentType = 'application/octet-stream') {
  const body = fs.createReadStream(localPath);
  await R2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
}

/**
 * Lists all object keys under a given prefix, then deletes them in parallel.
 * Used to clean up raw/{productId}/ after successful HLS processing.
 *
 * @param {string} prefix - R2 key prefix to delete (e.g. "raw/{productId}/")
 * @returns {Promise<void>}
 */
async function deletePrefix(prefix) {
  const listed = await listObjects(prefix);
  if (listed.length === 0) return;
  await Promise.all(
    listed.map((key) => R2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))),
  );
  console.log(`[R2] deletePrefix: removed ${listed.length} object(s) under "${prefix}"`);
}

/**
 * Returns a signed GET URL for a single private R2 object.
 * All HLS segments are served via these signed URLs — never via public R2 URLs.
 *
 * NOTE: A signed URL scraped from the rewritten playlist is valid until TTL
 * expiry (default 1200 s / 20 min). This is an accepted tradeoff for lower
 * backend load vs. a live per-segment proxy. Do NOT implement a live proxy
 * for this use-case.
 *
 * @param {string} key - R2 object key
 * @param {number} [expiresInSeconds=1200] - URL lifetime
 * @returns {Promise<string>} Signed GET URL
 */
async function getSignedGetUrl(key, expiresInSeconds = 1200) {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(R2, cmd, { expiresIn: expiresInSeconds });
}

/**
 * Lists all object keys under a given prefix. Used by the streaming
 * controller to enumerate .ts segments and master.m3u8 before signing.
 *
 * @param {string} prefix - R2 key prefix (e.g. "hls/{productId}/")
 * @returns {Promise<string[]>} Array of R2 object keys
 */
async function listObjects(prefix) {
  const keys = [];
  let continuationToken;
  do {
    const response = await R2.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );
    (response.Contents || []).forEach((obj) => {
      if (obj.Key) keys.push(obj.Key);
    });
    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);
  return keys;
}

/** Ensure R2 bucket allows CORS requests for video chunk streaming */
async function ensureBucketCors() {
  try {
    await R2.send(
      new PutBucketCorsCommand({
        Bucket: BUCKET,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'HEAD', 'PUT', 'POST'],
              AllowedOrigins: ['*'],
              MaxAgeSeconds: 86400,
            },
          ],
        },
      })
    );
    console.log(`✅ [R2] Bucket CORS configured successfully for "${BUCKET}"`);
  } catch (err) {
    console.warn('[R2] Bucket CORS setup warning:', err.message);
  }
}

module.exports = {
  R2,
  BUCKET,
  publicUrl,
  uploadBuffer,
  uploadMulterFile,
  deleteObject,
  deleteByUrl,
  presignedUpload,
  isConfigured,
  getObjectStream,
  getObjectText,
  getObjectStreamByUrl,
  // HLS pipeline
  getUploadPresignedUrl,
  uploadFile,
  deletePrefix,
  getSignedGetUrl,
  listObjects,
  ensureBucketCors,
};
