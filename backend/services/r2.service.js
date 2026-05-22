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
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const stream = require('stream');

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
  return `${folder}/${uuidv4()}${ext}`;
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
};
