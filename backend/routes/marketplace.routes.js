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

const requireAdmin = [auth, checkRole('admin', 'master')];

/* ─── Public ─────────────────────────────────────────────────────────── */
router.get('/settings', (req, res) => {
  try {
    const settings = require('../config/platformSettings.json');
    res.json(settings);
  } catch {
    res.json({ listingFeePhysical: 49, listingFeeDigital: 29, platformFeePercent: 5 });
  }
});

router.get('/products',     auth, ctrl.getProducts);
router.get('/products/:id', auth, ctrl.getProductById);
router.get('/products/:id/file', auth, ctrl.streamProductFile);

/* ─── Authenticated Student ──────────────────────────────────────────── */

// Profile & stats
router.get('/me', auth, ctrl.getMyProfile);

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

/* ─── Admin ──────────────────────────────────────────────────────────── */
router.get('/admin/products',               ...requireAdmin, ctrl.getPendingProducts);
router.patch('/admin/products/:id/approve', ...requireAdmin, ctrl.approveProduct);

module.exports = router;
