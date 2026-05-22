/**
 * Upload Middleware — multer in-memory + Cloudflare R2 upload
 *
 * Strategy:
 *  1. Multer stores files in memory (memoryStorage) — no disk writes
 *  2. After multer parses, the `uploadToR2` middleware streams each file to R2
 *  3. req.files entries are augmented with { r2Key, r2Url } for use in controllers
 *
 * Falls back to disk storage if R2 is not configured (dev without R2 creds).
 */

const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { v4: uuidv4 } = require('uuid');
const r2      = require('../services/r2.service');

/* ─── Allowed mime types ─────────────────────────────────────────────── */
const ALLOWED_MIMES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

function fileFilter(req, file, cb) {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   R2 PATH (production)
   Multer keeps files in memory; we upload to R2 in a separate middleware
═══════════════════════════════════════════════════════════════════════ */
const memoryStorage = multer.memoryStorage();

const uploadMediaMemory = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
});

/**
 * Express middleware: iterate all uploaded files and push them to R2.
 * Attaches { r2Key, r2Url } to each file entry.
 * Also replaces `file.path` with the R2 URL so existing controllers
 * that read `file.path` get the R2 URL transparently.
 */
async function uploadToR2(req, res, next) {
  if (!req.files && !req.file) return next();

  const allFiles = [];
  if (req.files) {
    // fields mode: req.files is { fieldName: [File,...], ... }
    Object.values(req.files).forEach(arr => arr.forEach(f => allFiles.push(f)));
  }
  if (req.file) allFiles.push(req.file);

  try {
    await Promise.all(
      allFiles.map(async (file) => {
        const { key, url } = await r2.uploadMulterFile(file);
        file.r2Key  = key;
        file.r2Url  = url;
        // Make `file.path` point to R2 URL so existing controller code works
        file.path   = url;
      })
    );
    next();
  } catch (err) {
    console.error('[R2 Upload Error]', err.message);
    res.status(500).json({ message: 'File upload to cloud storage failed', detail: err.message });
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   DISK FALLBACK (dev without R2 credentials)
═══════════════════════════════════════════════════════════════════════ */
const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
['images', 'videos', 'thumbnails', 'documents'].forEach(d => {
  const p = path.join(UPLOAD_ROOT, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

const diskStorage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.mimetype.startsWith('video/')) {
      cb(null, path.join(UPLOAD_ROOT, 'videos'));
    } else if (file.mimetype.startsWith('image/')) {
      cb(null, path.join(UPLOAD_ROOT, 'images'));
    } else if (
      file.mimetype === 'application/pdf' ||
      file.mimetype.includes('msword') ||
      file.mimetype.includes('wordprocessingml') ||
      file.mimetype.includes('presentationml')
    ) {
      cb(null, path.join(UPLOAD_ROOT, 'documents'));
    } else {
      cb(null, UPLOAD_ROOT);
    }
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || '';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const uploadMediaDisk = multer({
  storage: diskStorage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 },
});

/* ─── Path normaliser for disk-saved files ──────────────────────────── */
function diskPathMiddleware(req, res, next) {
  const root = UPLOAD_ROOT;
  const toUrl = (f) => {
    const rel = path.relative(root, f.path).replace(/\\/g, '/');
    f.r2Url = `/uploads/${rel}`;
    f.path  = `/uploads/${rel}`;
  };
  if (req.files) Object.values(req.files).forEach(arr => arr.forEach(toUrl));
  if (req.file) toUrl(req.file);
  next();
}

/* ═══════════════════════════════════════════════════════════════════════
   EXPORTS
   uploadMedia.fields([...]) → array of middleware to use in routes
═══════════════════════════════════════════════════════════════════════ */

const USE_R2 = r2.isConfigured();

if (USE_R2) {
  console.log('[Upload] Using Cloudflare R2 for file storage');
} else {
  console.log('[Upload] R2 not configured — falling back to local disk storage');
}

/**
 * Unified uploadMedia object.
 * Use: router.post('/route', uploadMedia.fields([...]), yourController)
 * Behind the scenes: if R2 is configured it uploads to cloud, else disk.
 */
const uploadMedia = {
  fields(fieldDefs) {
    if (USE_R2) {
      const multerFields = uploadMediaMemory.fields(fieldDefs);
      return [multerFields, uploadToR2];
    }
    const multerFields = uploadMediaDisk.fields(fieldDefs);
    return [multerFields, diskPathMiddleware];
  },
  single(fieldName) {
    if (USE_R2) {
      return [uploadMediaMemory.single(fieldName), uploadToR2];
    }
    return [uploadMediaDisk.single(fieldName), diskPathMiddleware];
  },
  array(fieldName, maxCount) {
    if (USE_R2) {
      return [uploadMediaMemory.array(fieldName, maxCount), uploadToR2];
    }
    return [uploadMediaDisk.array(fieldName, maxCount), diskPathMiddleware];
  },
};

module.exports = { uploadMedia, uploadToR2, r2 };
