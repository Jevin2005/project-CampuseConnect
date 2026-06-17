const express = require('express');
const adminController = require('../controllers/admin.controller');
const adController    = require('../controllers/ad.controller');
const authMiddleware  = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require college admin authentication
router.use(authMiddleware);
router.use((req, res, next) => {
  if (req.user.role !== 'COLLEGE_ADMIN') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
});

// ── Students ──────────────────────────────────────────────
router.get('/students', adminController.getStudents);
router.post('/students/approve', adminController.approveStudent);
router.post('/students/reject', adminController.rejectStudent);
router.post('/students/suspend', adminController.suspendStudent);
router.post('/students/unsuspend', adminController.unsuspendStudent);

// ── Dashboard ─────────────────────────────────────────────
router.get('/dashboard', adminController.getDashboard);

// ── Products ──────────────────────────────────────────────
router.get('/products', adminController.getProducts);
router.post('/products/:id/approve', adminController.approveProduct);
router.post('/products/:id/remove', adminController.removeProduct);
router.post('/products/:id/restore', adminController.restoreProduct);

// ── Revenue ───────────────────────────────────────────────
router.get('/revenue', adminController.getRevenue);

// ── Settings ──────────────────────────────────────────────
router.get('/settings', adminController.getSettings);
router.put('/settings/profile', adminController.updateProfile);
router.put('/settings/password', adminController.updatePassword);

// ── Advertisements ────────────────────────────────────────
router.get('/ads',             adController.getMyAds);
router.post('/ads',            adController.createAd);
// IMPORTANT: /ads/upload must be declared BEFORE /ads/:id/* to avoid Express
// treating the literal "upload" string as an :id parameter value.
router.post('/ads/upload',     adController.uploadBannerMiddleware, adController.uploadAdBanner);
router.patch('/ads/:id/end',   adController.endAd);
router.post('/ads/:id/view',   adController.trackAdView);
router.post('/ads/:id/click',  adController.trackAdClick);

module.exports = router;

