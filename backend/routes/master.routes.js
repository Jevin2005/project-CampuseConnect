const express = require('express');
const masterController = require('../controllers/master.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require master admin authentication
router.use(authMiddleware);
// In a real app we'd add role checking here
router.use((req, res, next) => {
  if (req.user.role !== 'MASTER_ADMIN') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
});

router.get('/colleges', masterController.getColleges);
router.post('/colleges/:collegeId/approve', masterController.approveCollege);
router.post('/colleges/:collegeId/reject', masterController.rejectCollege);

module.exports = router;
