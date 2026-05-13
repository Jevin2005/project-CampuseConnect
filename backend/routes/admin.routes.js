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

router.get('/students', adminController.getStudents);
router.post('/students/approve', adminController.approveStudent);
router.post('/students/reject', adminController.rejectStudent);
router.post('/students/suspend', adminController.suspendStudent);

module.exports = router;
