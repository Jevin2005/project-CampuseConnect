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
const jwt   = require('jsonwebtoken');

/**
 * optionalAuth - Extracts student user identity if provided, but does not reject
 * unauthenticated requests so guests and preview users can stream preview content.
 */
function optionalAuth(req, res, next) {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      if (!req.user.id && req.user.userId) req.user.id = req.user.userId;
    } catch (_) {
      // Invalid/expired token - continue as unauthenticated guest for preview mode
    }
  }
  next();
}

// Endpoints requiring a valid student auth token or optional preview auth
router.get('/segment/:productId/v:videoIndex/:filename', ctrl.proxyHlsSegment);
router.get('/segment/:productId/:filename',              ctrl.proxyHlsSegment);
router.get('/segment',                                   ctrl.proxyHlsSegment);
router.get('/product/:productId/status',        optionalAuth, ctrl.getProcessingStatus);
router.get('/product/:productId',               optionalAuth, ctrl.getProductContent);
router.get('/:orderId',                         auth, ctrl.getContent);
router.patch('/:orderId/progress',              auth, ctrl.updateProgress);

module.exports = router;
