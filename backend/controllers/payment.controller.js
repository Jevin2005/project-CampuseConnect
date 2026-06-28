/**
 * Payment Controller
 * Handles Razorpay order creation and payment verification for:
 *   1. listing_fee    — seller pays to list a product
 *   2. digital_purchase — buyer pays to unlock a digital product
 */

const { PrismaClient } = require('@prisma/client');
const { createRazorpayOrder, verifyPaymentSignature } = require('../services/razorpay.service');

const prisma = new PrismaClient();

/* ─── Helper: safe platform settings ───────────────────────────────────────── */
async function getPlatformSettings() {
  try {
    let s = await prisma.platformSettings.findFirst();
    if (!s) {
      s = await prisma.platformSettings.create({
        data: {
          digitalListingFee:       20,
          digitalBuyerFeePercent:  15,
          digitalSellerCutPercent: 15,
          digitalPayoutDays:       7,
          physicalTiers: [
            { min: 0,    max: 500,  percent: 5 },
            { min: 501,  max: 1000, percent: 4 },
            { min: 1001, max: 2000, percent: 3 },
          ],
        },
      });
    }
    return s;
  } catch {
    return {
      digitalListingFee:       20,
      digitalBuyerFeePercent:  15,
      digitalSellerCutPercent: 15,
      digitalPayoutDays:       7,
      physicalTiers: [{ min: 0, max: 999999, percent: 5 }],
    };
  }
}

/* ─── Helper: calculate physical listing fee from tiered config ─────────────── */
function calcPhysicalListingFee(price, tiers) {
  if (!Array.isArray(tiers) || tiers.length === 0) return 0;
  for (const tier of tiers) {
    const pct = tier.percent ?? tier.value ?? 0;
    if (price >= tier.min && price <= tier.max) {
      return parseFloat(((pct / 100) * price).toFixed(2));
    }
  }
  const last = tiers[tiers.length - 1];
  const pct = last.percent ?? last.value ?? 0;
  return parseFloat(((pct / 100) * price).toFixed(2));
}

/* ════════════════════════════════════════════════════════════════════════════
   POST /api/payments/create-order
   Body: { type: 'listing_fee' | 'digital_purchase', productId?, productType?, price? }
   Returns: { razorpayOrderId, amount, currency, keyId }
═══════════════════════════════════════════════════════════════════════════════ */
exports.createOrder = async (req, res) => {
  try {
    const { type, productId, productType, price } = req.body;

    if (!type || !['listing_fee', 'digital_purchase'].includes(type)) {
      return res.status(400).json({ message: 'Invalid payment type.' });
    }

    let amountINR = 0;
    let receipt   = '';
    let notes     = {};
    const settings = await getPlatformSettings();

    /* ── Case 1: Listing Fee ──────────────────────────────────────────── */
    if (type === 'listing_fee') {
      const parsedPrice = parseFloat(price) || 0;

      let baseFee = 0;
      if (productType === 'digital') {
        baseFee = settings.digitalListingFee || 20;
      } else {
        // Physical — tiered listing fee based on product price
        baseFee = calcPhysicalListingFee(parsedPrice, settings.physicalTiers || []);
      }

      const gst        = parseFloat((baseFee * 0.18).toFixed(2));
      const gatewayChg = parseFloat((baseFee * 0.02).toFixed(2));
      amountINR        = parseFloat((baseFee + gst + gatewayChg).toFixed(2));

      // Keep receipt under 40 chars limit for Razorpay (e.g. lst_timestamp_random)
      receipt = `lst_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      notes   = {
        userId:      req.user.id,
        productType: productType || 'unknown',
        baseFee,
        gst,
        gatewayChg,
      };
    }

    /* ── Case 2: Digital Product Purchase ─────────────────────────────── */
    if (type === 'digital_purchase') {
      if (!productId) return res.status(400).json({ message: 'productId is required.' });

      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product)         return res.status(404).json({ message: 'Product not found.' });
      if (!product.isApproved) return res.status(400).json({ message: 'Product not approved.' });
      if (product.productType !== 'digital') {
        return res.status(400).json({ message: 'Only digital products use online payment.' });
      }

      // Prevent duplicate purchases
      const existing = await prisma.order.findFirst({
        where: { buyerId: req.user.id, productId, status: { in: ['PENDING', 'COMPLETED'] } },
      });
      if (existing) {
        return res.status(409).json({ message: 'Already purchased.', orderId: existing.id });
      }

      const platformFeeAmt = parseFloat(
        ((settings.digitalBuyerFeePercent / 100) * product.price).toFixed(2)
      );
      amountINR = parseFloat((product.price + platformFeeAmt).toFixed(2));
      // Keep receipt under 40 chars limit for Razorpay (e.g. pur_timestamp_random)
      receipt   = `pur_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      notes     = {
        userId:      req.user.id,
        productId,
        productTitle: product.title,
        productPrice: product.price,
        platformFee:  platformFeeAmt,
      };
    }

    // Razorpay works in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amountINR * 100);

    if (amountInPaise <= 0) {
      return res.status(400).json({ message: 'Computed amount is zero — check platform settings.' });
    }

    const order = await createRazorpayOrder(amountInPaise, receipt, notes);

    return res.json({
      razorpayOrderId: order.id,
      amount:          order.amount,      // paise
      amountINR:       amountINR,         // human-readable INR
      currency:        order.currency,
      keyId:           process.env.RAZORPAY_KEY_ID,
      receipt:         order.receipt,
    });
  } catch (err) {
    console.error('[createOrder]', err);
    if (err.message?.includes('keys not configured')) {
      return res.status(503).json({ message: 'Payment gateway not configured on server. Contact admin.' });
    }
    return res.status(500).json({
      message: 'Failed to create payment order: ' + err.message,
      details: err
    });
  }
};

/* ════════════════════════════════════════════════════════════════════════════
   POST /api/payments/verify
   Body: {
     type,
     razorpayOrderId, razorpayPaymentId, razorpaySignature,
     // for listing_fee:
     productData?,      — FormData fields (title, price, etc.)
     // for digital_purchase:
     productId?,
   }
   Returns: { success: true, message, orderId? }
═══════════════════════════════════════════════════════════════════════════════ */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      type,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      // digital purchase extras
      productId,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Missing Razorpay payment fields.' });
    }

    // ── 1. Verify HMAC signature ───────────────────────────────────────────
    const valid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!valid) {
      return res.status(400).json({ message: 'Payment signature verification failed. Possible tampering.' });
    }

    // ── 2. Downstream actions per payment type ────────────────────────────
    if (type === 'listing_fee') {
      // The actual product creation happens in the marketplace controller via
      // a separate POST /api/marketplace/products call from the frontend
      // (after payment is verified). We just confirm payment here.
      return res.json({
        success: true,
        message: 'Listing fee payment verified. Proceed to create product.',
        razorpayPaymentId,
      });
    }

    if (type === 'digital_purchase') {
      if (!productId) return res.status(400).json({ message: 'productId required.' });

      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return res.status(404).json({ message: 'Product not found.' });

      // Prevent duplicate orders
      const existing = await prisma.order.findFirst({
        where: { buyerId: req.user.id, productId, status: { in: ['PENDING', 'COMPLETED'] } },
      });
      if (existing) {
        return res.status(409).json({ message: 'Already purchased.', orderId: existing.id });
      }

      const settings = await getPlatformSettings();
      const productPrice   = product.price;
      const platformFeeAmt = parseFloat(((settings.digitalBuyerFeePercent / 100) * productPrice).toFixed(2));
      const sellerCutAmt   = parseFloat(((settings.digitalSellerCutPercent / 100) * productPrice).toFixed(2));
      const netSellerAmt   = parseFloat((productPrice - sellerCutAmt).toFixed(2));
      const payoutDays     = settings.digitalPayoutDays || 7;

      const releaseAfter = new Date();
      releaseAfter.setDate(releaseAfter.getDate() + payoutDays);

      const result = await prisma.$transaction(async (tx) => {
        // 1. Create order
        const order = await tx.order.create({
          data: {
            amount:        productPrice + platformFeeAmt,
            status:        'COMPLETED',
            platformFee:   platformFeeAmt,
            sellerCut:     sellerCutAmt,
            netSellerAmt,
            buyerId:       req.user.id,
            sellerId:      product.sellerId,
            productId,
            razorpayOrderId,
            razorpayPaymentId,
          },
          include: {
            product: { select: { id: true, title: true, images: true, productType: true } },
            seller:  { select: { id: true, name: true, email: true } },
          },
        });

        // 2. SellerPayout record
        await tx.sellerPayout.create({
          data: {
            orderId:     order.id,
            sellerId:    product.sellerId,
            grossAmount: productPrice,
            platformCut: sellerCutAmt,
            netAmount:   netSellerAmt,
            status:      payoutDays === 0 ? 'released' : 'pending',
            releaseAfter,
            releasedAt:  payoutDays === 0 ? new Date() : null,
          },
        });

        // 3. Notifications
        const buyerAmtStr  = `₹${(productPrice + platformFeeAmt).toLocaleString('en-IN')}`;
        const sellerAmtStr = `₹${netSellerAmt.toLocaleString('en-IN')}`;

        await tx.notification.create({
          data: {
            studentId: req.user.id,
            text:      `Deal completed! You bought "${product.title}" — Total paid: ${buyerAmtStr}.`,
            type:      'DEAL_COMPLETED',
          },
        });
        await tx.notification.create({
          data: {
            studentId: product.sellerId,
            text:      `Deal completed! "${product.title}" was sold — Payout: ${sellerAmtStr} (in ${payoutDays} days).`,
            type:      'DEAL_COMPLETED',
          },
        });

        return order;
      });

      return res.status(201).json({
        success:  true,
        message:  'Payment verified. Access granted.',
        orderId:  result.id,
        product:  result.product,
      });
    }

    return res.status(400).json({ message: 'Unknown payment type.' });
  } catch (err) {
    console.error('[verifyPayment]', err);
    return res.status(500).json({ message: 'Payment verification failed.' });
  }
};
