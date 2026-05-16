const express = require('express');
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');

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

module.exports = router;

