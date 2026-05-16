const express = require('express');
const masterController = require('../controllers/master.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require master admin authentication
router.use(authMiddleware);
router.use((req, res, next) => {
  if (req.user.role !== 'MASTER_ADMIN') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
});

// College management
router.get('/colleges', masterController.getColleges);
router.get('/colleges/active', masterController.getActiveColleges);
router.post('/colleges/:collegeId/approve', masterController.approveCollege);
router.post('/colleges/:collegeId/reject', masterController.rejectCollege);

// Dashboard stats
router.get('/stats', masterController.getDashboardStats);

// Students
router.get('/students', masterController.getStudents);

module.exports = router;
