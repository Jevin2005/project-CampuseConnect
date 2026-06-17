/**
 * Advertisement Controller
 * Handles ad creation, management, banner upload, and public marketplace delivery.
 */

const { PrismaClient } = require('@prisma/client');
const path  = require('path');
const fs    = require('fs');
const multer = require('multer');

const prisma = new PrismaClient();

/* ─── Multer storage for ad banners ────────────────────────────────── */
const bannersDir = path.join(__dirname, '..', 'uploads', 'banners');
if (!fs.existsSync(bannersDir)) fs.mkdirSync(bannersDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, bannersDir),
  filename:    (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `ad_${Date.now()}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

/* Export multer middleware so route can use it */
const uploadBannerMiddleware = upload.single('banner');

/* ─── Helper: get admin + collegeId ────────────────────────────────── */
async function getAdminWithCollege(adminId) {
  return prisma.admin.findUnique({
    where: { id: adminId },
    include: { college: true },
  });
}

/* ─── Helper: auto-expire ads past their expiresAt ─────────────────── */
async function autoExpireAds(collegeId) {
  await prisma.advertisement.updateMany({
    where: {
      collegeId,
      status: 'active',
      expiresAt: { lt: new Date() },
    },
    data: { status: 'expired' },
  });
}

/* ══════════════════════════════════════════════════════════════
   POST /api/admin/ads/upload
   Multer upload for banner image. Returns { url }.
══════════════════════════════════════════════════════════════ */
async function uploadAdBanner(req, res) {
  // Multer already ran — file is on req.file
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const url = `/uploads/banners/${req.file.filename}`;
  return res.json({ url });
}

/* ══════════════════════════════════════════════════════════════
   POST /api/admin/ads
   Create a new advertisement.
══════════════════════════════════════════════════════════════ */
async function createAd(req, res) {
  try {
    const adminId = req.user.userId;
    const { title, description, scope, duration, bannerUrl, format } = req.body;

    if (!title?.trim() || !description?.trim() || !scope || !duration) {
      return res.status(400).json({ message: 'title, description, scope and duration are required' });
    }
    if (!['own', 'cross'].includes(scope)) {
      return res.status(400).json({ message: 'scope must be "own" or "cross"' });
    }

    const VALID_FORMATS = ['strip', 'banner', 'square', 'portrait', 'card'];
    const adFormat = VALID_FORMATS.includes(format) ? format : 'banner';

    const admin = await getAdminWithCollege(adminId);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const days = parseInt(duration, 10);
    if (![7, 14, 30].includes(days)) {
      return res.status(400).json({ message: 'duration must be 7, 14, or 30 days' });
    }
    // Cross-college ads: only 7 days
    if (scope === 'cross' && days !== 7) {
      return res.status(400).json({ message: 'Cross-college ads are fixed at 7 days' });
    }

    const cost  = scope === 'cross' ? 500 : 0;
    const now   = new Date();
    const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const ad = await prisma.advertisement.create({
      data: {
        title:       title.trim(),
        description: description.trim(),
        bannerUrl:   bannerUrl || null,
        scope,
        format:      adFormat,
        status:      'active',
        duration:    days,
        cost,
        startsAt:    now,
        expiresAt:   expiry,
        adminId,
        collegeId:   admin.collegeId,
      },
    });

    return res.status(201).json({ message: 'Ad created successfully', ad });
  } catch (err) {
    console.error('[AdController.createAd]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/* ══════════════════════════════════════════════════════════════
   GET /api/admin/ads
   Get all ads for the requesting admin's college.
══════════════════════════════════════════════════════════════ */
async function getMyAds(req, res) {
  try {
    const adminId = req.user.userId;
    const admin   = await getAdminWithCollege(adminId);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    // Auto-expire stale ads
    await autoExpireAds(admin.collegeId);

    const ads = await prisma.advertisement.findMany({
      where:   { collegeId: admin.collegeId },
      orderBy: { createdAt: 'desc' },
      include: { admin: { select: { name: true, email: true } } },
    });

    return res.json({ ads, college: { name: admin.college.name } });
  } catch (err) {
    console.error('[AdController.getMyAds]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/* ══════════════════════════════════════════════════════════════
   PATCH /api/admin/ads/:id/end
   Deactivate an ad immediately.
══════════════════════════════════════════════════════════════ */
async function endAd(req, res) {
  try {
    const adminId = req.user.userId;
    const admin   = await getAdminWithCollege(adminId);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const ad = await prisma.advertisement.findUnique({ where: { id: req.params.id } });
    if (!ad || ad.collegeId !== admin.collegeId) {
      return res.status(403).json({ message: 'Unauthorized or ad not found' });
    }
    if (ad.status === 'deactivated') {
      return res.status(400).json({ message: 'Ad is already deactivated' });
    }

    await prisma.advertisement.update({
      where: { id: req.params.id },
      data:  { status: 'deactivated' },
    });

    return res.json({ message: 'Ad ended successfully' });
  } catch (err) {
    console.error('[AdController.endAd]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/* ══════════════════════════════════════════════════════════════
   POST /api/admin/ads/:id/view   (also used by students)
   Increment view count.
══════════════════════════════════════════════════════════════ */
async function trackAdView(req, res) {
  try {
    await prisma.advertisement.updateMany({
      where: { id: req.params.id, status: 'active' },
      data:  { views: { increment: 1 } },
    });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[AdController.trackAdView]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/* ══════════════════════════════════════════════════════════════
   POST /api/admin/ads/:id/click   (also used by students)
   Increment click count.
══════════════════════════════════════════════════════════════ */
async function trackAdClick(req, res) {
  try {
    await prisma.advertisement.updateMany({
      where: { id: req.params.id, status: 'active' },
      data:  { clicks: { increment: 1 } },
    });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[AdController.trackAdClick]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/* ══════════════════════════════════════════════════════════════
   GET /api/marketplace/ads?collegeId=<id>
   Public endpoint: returns active ads relevant to a college.
   - Returns own-college ads for that college
   - Returns all cross-college ads from ALL colleges
   No auth required (students see ads even before login).
══════════════════════════════════════════════════════════════ */
async function getPublicAds(req, res) {
  try {
    const { collegeId } = req.query;

    // Auto-expire any stale ads across all colleges
    await prisma.advertisement.updateMany({
      where: { status: 'active', expiresAt: { lt: new Date() } },
      data:  { status: 'expired' },
    });

    const hasCollege = collegeId && collegeId !== 'undefined' && collegeId !== 'null' && collegeId.trim() !== '';
    const where = hasCollege
      ? {
          status: 'active',
          OR: [
            { scope: 'cross' },
            { scope: 'own', collegeId },
          ],
        }
      : { status: 'active', scope: 'cross' };

    const ads = await prisma.advertisement.findMany({
      where,
      orderBy: [{ scope: 'asc' }, { createdAt: 'desc' }],
      include: {
        college: { select: { name: true, code: true } },
        admin:   { select: { name: true } },
      },
    });

    return res.json({ ads });
  } catch (err) {
    console.error('[AdController.getPublicAds]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/* ══════════════════════════════════════════════════════════════
   GET /api/marketplace/ads/:id
   Public endpoint: returns details for a single active ad.
   No auth required.
   ══════════════════════════════════════════════════════════════ */
async function getPublicAdById(req, res) {
  try {
    const { id } = req.params;

    const ad = await prisma.advertisement.findUnique({
      where: { id },
      include: {
        college: { select: { name: true, code: true } },
        admin:   { select: { name: true, email: true } },
      },
    });

    if (!ad) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }

    // Auto-expire ad check on retrieval
    if (ad.status === 'active' && ad.expiresAt < new Date()) {
      await prisma.advertisement.update({
        where: { id },
        data: { status: 'expired' },
      });
      return res.status(404).json({ message: 'Advertisement has expired' });
    }

    if (ad.status !== 'active') {
      return res.status(404).json({ message: 'Advertisement is no longer active' });
    }

    return res.json({ ad });
  } catch (err) {
    console.error('[AdController.getPublicAdById]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  uploadBannerMiddleware,
  uploadAdBanner,
  createAd,
  getMyAds,
  endAd,
  trackAdView,
  trackAdClick,
  getPublicAds,
  getPublicAdById,
};
