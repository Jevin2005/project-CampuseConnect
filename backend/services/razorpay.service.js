/**
 * Razorpay Service
 * Wraps the Razorpay Node SDK with safe singleton initialization.
 */

const Razorpay = require('razorpay');
const crypto  = require('crypto');

let _instance = null;

function getInstance() {
  if (!_instance) {
    const keyId     = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret || keyId.includes('YOUR_KEY')) {
      throw new Error(
        'Razorpay keys not configured. ' +
        'Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env'
      );
    }

    _instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return _instance;
}

/**
 * Create a Razorpay order.
 * @param {number} amountInPaise  — amount in smallest currency unit (paise)
 * @param {string} receipt        — unique receipt reference for your records
 * @param {object} notes          — arbitrary key-value pairs stored on the order
 */
async function createRazorpayOrder(amountInPaise, receipt, notes = {}) {
  const rz = getInstance();
  return rz.orders.create({
    amount:   amountInPaise,
    currency: 'INR',
    receipt,
    notes,
  });
}

/**
 * Verify the HMAC-SHA256 signature returned by Razorpay after payment.
 * See: https://razorpay.com/docs/payments/server-integration/nodejs/payment-gateway/build-integration/#14-verify-payment-signature
 *
 * @param {string} razorpayOrderId   — order_id from Razorpay
 * @param {string} razorpayPaymentId — payment_id from Razorpay (returned after payment)
 * @param {string} signature         — razorpay_signature from Razorpay
 * @returns {boolean}
 */
function verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, signature) {
  const secret  = process.env.RAZORPAY_KEY_SECRET?.trim();
  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const digest  = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return digest === signature;
}

module.exports = { createRazorpayOrder, verifyPaymentSignature };
