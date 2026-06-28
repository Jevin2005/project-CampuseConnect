/**
 * Payment Routes
 * POST /api/payments/create-order  — create a Razorpay order
 * POST /api/payments/verify        — verify HMAC signature and settle
 */

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/payment.controller');
const auth    = require('../middleware/auth.middleware');

/* Both endpoints require an authenticated student */
router.post('/create-order', auth, ctrl.createOrder);
router.post('/verify',       auth, ctrl.verifyPayment);

module.exports = router;
