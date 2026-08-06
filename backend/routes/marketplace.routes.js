/**
 * Marketplace Routes — v2
 * Products, buy requests, chat, orders, wishlist, profile
 */

const express = require('express');
const router  = express.Router();

const ctrl            = require('../controllers/marketplace.controller');
const auth            = require('../middleware/auth.middleware');
const { checkRole }   = require('../middleware/role.middleware');
const { uploadMedia } = require('../middleware/upload.middleware');
const adCtrl          = require('../controllers/ad.controller');

const requireAdmin = [auth, checkRole('admin', 'master')];

/**
 * Optional auth middleware — attaches req.user if a valid Bearer token is
 * present, but does NOT reject the request if no token is provided.
 * Used for public-browsable endpoints (product listing) so guests can browse
 * while logged-in students get college-scoped results.
 */
const jwt = require('jsonwebtoken');
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      if (!req.user.id && req.user.userId) req.user.id = req.user.userId;
    } catch (_) { /* invalid/expired token — treat as guest */ }
  }
  next();
}

/* ─── Public ─────────────────────────────────────────────────────────── */
router.get('/settings', ctrl.getSettings);

// Public ads endpoint — no auth needed
router.get('/ads',                adCtrl.getPublicAds);
router.get('/ads/:id',            adCtrl.getPublicAdById);
router.post('/ads/:id/view',      adCtrl.trackAdView);
router.post('/ads/:id/click',     adCtrl.trackAdClick);

// Public browsing — no login needed; logged-in users get college-scoped results
router.get('/products',          optionalAuth, ctrl.getProducts);
router.get('/products/:id',      optionalAuth, ctrl.getProductById);
router.get('/products/:id/file', auth,         ctrl.streamProductFile); // file access still requires login

/* ─── Authenticated Student ──────────────────────────────────────────── */

// Profile & stats
router.get('/me', auth, ctrl.getMyProfile);
router.get('/earnings', auth, ctrl.getMyEarnings);

// Listings
router.post(
  '/products',
  auth,
  ...uploadMedia.fields([
    { name: 'images',     maxCount: 10 },
    { name: 'videos',     maxCount: 5  },
    { name: 'documents',  maxCount: 10 },
    { name: 'thumbnails', maxCount: 1  },
  ]),
  ctrl.createProduct
);
router.put(
  '/products/:id',
  auth,
  ...uploadMedia.fields([
    { name: 'images',     maxCount: 10 },
    { name: 'videos',     maxCount: 5  },
    { name: 'documents',  maxCount: 10 },
    { name: 'thumbnails', maxCount: 1  },
  ]),
  ctrl.updateProduct
);
router.delete('/products/:id', auth, ctrl.deleteProduct);
router.get('/my-listings',     auth, ctrl.getMyListings);

// Buy requests
router.post('/products/:id/request', auth, ctrl.createBuyRequest);
router.get('/requests/received',     auth, ctrl.getReceivedRequests);
router.get('/requests/sent',         auth, ctrl.getSentRequests);
router.patch('/requests/:id',        auth, ctrl.updateRequestStatus);

// Orders / purchases
router.get('/orders',  auth, ctrl.getMyOrders);
router.post('/orders', auth, ctrl.createOrder);

// Wishlist
router.get('/wishlist',               auth, ctrl.getWishlist);
router.post('/wishlist',              auth, ctrl.addToWishlist);
router.delete('/wishlist/:productId', auth, ctrl.removeFromWishlist);

// Chat
router.get('/threads',                 auth, ctrl.getThreads);
router.get('/threads/:id/messages',    auth, ctrl.getMessages);
router.post('/threads/:id/messages',   auth, ctrl.sendMessage);
router.patch('/threads/:id/complete',  auth, ctrl.completeDeal);
router.patch('/threads/:id/close',     auth, ctrl.closeThread);

// Notifications
router.get('/notifications',           auth, ctrl.getNotifications);
router.patch('/notifications/read',    auth, ctrl.markNotificationsRead);

/* ─── Admin ──────────────────────────────────────────────────────────── */
router.get('/admin/products',               ...requireAdmin, ctrl.getPendingProducts);
router.patch('/admin/products/:id/approve', ...requireAdmin, ctrl.approveProduct);

module.exports = router;
