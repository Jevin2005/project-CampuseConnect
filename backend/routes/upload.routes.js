/**
 * Upload Routes
 * Handles direct-to-R2 video upload initiation and completion callbacks.
 *
 * POST /api/student/upload/video-init     → initiate presigned PUT URL
 * POST /api/student/upload/video-complete → trigger HLS processing job
 */

'use strict';

const express = require('express');
const router  = express.Router();

const ctrl = require('../controllers/upload.controller');
const auth  = require('../middleware/auth.middleware');

// Both endpoints require a valid student auth token
router.post('/video-init',     auth, ctrl.videoInit);
router.post('/video-complete', auth, ctrl.videoComplete);

module.exports = router;
