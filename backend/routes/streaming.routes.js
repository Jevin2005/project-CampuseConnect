/**
 * Streaming Routes
 * Serves HLS video content with signed R2 URLs for authenticated buyers.
 *
 * GET   /api/student/content/:orderId           → rewritten HLS playlist + resume position
 * PATCH /api/student/content/:orderId/progress  → upsert watch progress
 */

'use strict';

const express = require('express');
const router  = express.Router();

const ctrl = require('../controllers/streaming.controller');
const auth  = require('../middleware/auth.middleware');

// Endpoints requiring a valid student auth token
router.get('/segment/:productId/v:videoIndex/:filename', ctrl.proxyHlsSegment);
router.get('/segment/:productId/:filename',              ctrl.proxyHlsSegment);
router.get('/segment',                                   ctrl.proxyHlsSegment);
router.get('/product/:productId/status',        auth, ctrl.getProcessingStatus);
router.get('/product/:productId',               auth, ctrl.getProductContent);
router.get('/:orderId',                         auth, ctrl.getContent);
router.patch('/:orderId/progress',              auth, ctrl.updateProgress);

module.exports = router;
