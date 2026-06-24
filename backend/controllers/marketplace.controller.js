/**
 * Marketplace Controller — v2
 * Full CRUD for products, buy requests, chat, orders, wishlist.
 * Now integrated with Cloudflare R2 for media URLs.
 */

const { PrismaClient } = require('@prisma/client');
const r2 = require('../services/r2.service');
const prisma = new PrismaClient();

/* ─── Helper: extract uploaded file URLs (works with both R2 and disk) ── */
function extractFiles(req) {
  const images = [], videos = [], documents = [];
  if (req.files) {
    (req.files['images'] || []).forEach(f => images.push(f.path));
    (req.files['thumbnails'] || []).forEach(f => images.push(f.path));
    (req.files['videos'] || []).forEach(f => videos.push(f.path));
    (req.files['documents'] || []).forEach(f => documents.push(f.path));
    (req.files['media'] || []).forEach(f => {
      if (f.mimetype.startsWith('video/')) videos.push(f.path);
      else images.push(f.path);
    });
  }
  if (req.file) {
    if (req.file.mimetype?.startsWith('video/')) videos.push(req.file.path);
    else images.push(req.file.path);
  }
  return { images, videos, documents };
}

/* ─── Helper: safe settings fetch ────────────────────────────────────────────── */
async function getPlatformSettings() {
  try {
    // Primary: read from PlatformSettings table (managed by master admin)
    let s = await prisma.platformSettings.findFirst();
    if (!s) {
      // Auto-create defaults on first access
      s = await prisma.platformSettings.create({
        data: {
          digitalListingFee: 20,
          digitalBuyerFeePercent: 15,
          digitalSellerCutPercent: 15,
          digitalPayoutDays: 7,
          physicalTiers: [
            { min: 0, max: 500, type: 'percent', value: 5 },
            { min: 501, max: 1000, type: 'percent', value: 4 },
            { min: 1001, max: 2000, type: 'percent', value: 3 },
          ],
        },
      });
    }
    const normalizedTiers = (Array.isArray(s.physicalTiers) ? s.physicalTiers : []).map(t => ({
      min: typeof t.min === 'number' ? t.min : 0,
      max: typeof t.max === 'number' ? t.max : 999999,
      type: t.type || 'percent',
      value: typeof t.value === 'number' ? t.value : (typeof t.percent === 'number' ? t.percent : 0)
    }));
    return {
      listingFeePhysical: s.digitalListingFee, // kept for backward compat
      listingFeeDigital: s.digitalListingFee,
      platformFeePercent: s.digitalBuyerFeePercent,
      digitalBuyerFeePercent: s.digitalBuyerFeePercent,
      digitalSellerCutPercent: s.digitalSellerCutPercent,
      digitalPayoutDays: s.digitalPayoutDays,
      physicalTiers: normalizedTiers,
    };
  } catch {
    // Fallback to safe defaults if DB not available
    return {
      listingFeePhysical: 49,
      listingFeeDigital: 20,
      platformFeePercent: 15,
      digitalBuyerFeePercent: 15,
      digitalSellerCutPercent: 15,
      digitalPayoutDays: 7,
      physicalTiers: [
        { min: 0, max: 500, type: 'percent', value: 5 },
        { min: 501, max: 1000, type: 'percent', value: 4 },
        { min: 1001, max: 2000, type: 'percent', value: 3 },
      ],
    };
  }
}

/* Helper: calculate physical listing fee from tiers */
function calcPhysicalListingFee(price, tiers) {
  if (!Array.isArray(tiers) || tiers.length === 0) return 0;
  for (const tier of tiers) {
    if (price >= tier.min && price <= tier.max) {
      const type = tier.type || 'percent';
      const val = typeof tier.value === 'number' ? tier.value : (tier.percent || 0);
      return type === 'fixed' ? val : parseFloat(((val / 100) * price).toFixed(2));
    }
  }
  // If beyond all tiers, use last tier's rate/value
  const lastTier = tiers[tiers.length - 1];
  const type = lastTier.type || 'percent';
  const val = typeof lastTier.value === 'number' ? lastTier.value : (lastTier.percent || 0);
  return type === 'fixed' ? val : parseFloat(((val / 100) * price).toFixed(2));
}


/** GET /api/marketplace/settings */
exports.getSettings = async (req, res) => {
  try {
    const settings = await getPlatformSettings();
    return res.json(settings);
  } catch (err) {
    console.error('[getSettings]', err);
    return res.status(500).json({ message: 'Error retrieving platform settings' });
  }
};

/* ═══════════════════════════════ PRODUCTS ═══════════════════════════════ */

/** GET /api/marketplace/products */
exports.getProducts = async (req, res) => {
  try {
    const { category, type, search, sort = 'newest', page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { isApproved: true, status: 'active' };
    if (req.user && req.user.collegeId) {
      where.collegeId = req.user.collegeId;
    }
    if (category) where.category = category;
    if (type) where.productType = type;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'popular') orderBy = { views: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where, orderBy, skip, take: parseInt(limit),
        include: {
          seller: { select: { id: true, name: true, email: true } },
          college: { select: { name: true } },
          _count: { select: { buyRequests: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ products, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('[getProducts]', err);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

/** GET /api/marketplace/products/:id */
exports.getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        seller: { select: { id: true, name: true, email: true, phone: true } },
        college: { select: { name: true } },
        _count: { select: { buyRequests: true } },
      },
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Security check: restrict cross-college product viewing
    if (req.user && req.user.collegeId && product.collegeId !== req.user.collegeId) {
      return res.status(403).json({ message: 'Access denied: Product belongs to another college.' });
    }

    // Increment view count (fire-and-forget)
    prisma.product.update({ where: { id: req.params.id }, data: { views: { increment: 1 } } }).catch(() => { });

    res.json(product);
  } catch (err) {
    console.error('[getProductById]', err);
    res.status(500).json({ message: 'Error fetching product' });
  }
};

/** POST /api/marketplace/products */
exports.createProduct = async (req, res) => {
  try {
    const { images, videos, documents } = extractFiles(req);
    const {
      title, description, price, originalPrice,
      category, condition, productType, digitalSubType,
    } = req.body;

    if (!title || !price) {
      return res.status(400).json({ message: 'title and price are required' });
    }

    // All media URLs (R2 gives absolute URLs; disk gives relative /uploads/... paths)
    const allMedia = [...images, ...documents, ...videos];

    const settings = await getPlatformSettings();

    const product = await prisma.product.create({
      data: {
        title,
        description: description || '',
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        images: allMedia,
        category: category || 'Other',
        condition: condition || 'Good',
        productType: productType || 'physical',
        digitalSubType: digitalSubType || null,
        status: 'active',
        isApproved: true,
        sellerId: req.user.id,
        collegeId: req.user.collegeId,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('[createProduct]', err);
    res.status(500).json({ message: 'Error creating product', detail: err.message });
  }
};

/** PUT /api/marketplace/products/:id */
exports.updateProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ message: 'Not found' });
    if (product.sellerId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    const { title, description, price, originalPrice, category, condition } = req.body;
    const { images: newImages, videos: newVideos } = extractFiles(req);
    const newMedia = [...newImages, ...newVideos];

    const contentChanged = (title && title !== product.title)
      || (description !== undefined && description !== product.description)
      || newMedia.length > 0;

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(originalPrice !== undefined && { originalPrice: originalPrice ? parseFloat(originalPrice) : null }),
        ...(category && { category }),
        ...(condition && { condition }),
        ...(newMedia.length > 0 && { images: [...product.images, ...newMedia] }),
        ...(contentChanged && { status: 'active', isApproved: true }),
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('[updateProduct]', err);
    res.status(500).json({ message: 'Error updating product' });
  }
};

/** DELETE /api/marketplace/products/:id */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ message: 'Not found' });
    if (product.sellerId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    if (product.productType === 'digital') {
      // Soft-delete digital products to preserve access for existing buyers
      await prisma.product.update({
        where: { id: req.params.id },
        data: { status: 'removed' }
      });
      return res.json({ message: 'Digital product unlisted successfully (status: removed)' });
    }

    // Delete R2 files if they look like R2 URLs
    if (r2.isConfigured()) {
      await Promise.all(product.images.map(url => r2.deleteByUrl(url)));
    }

    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('[deleteProduct]', err);
    res.status(500).json({ message: 'Error deleting product' });
  }
};

/** GET /api/marketplace/my-listings */
exports.getMyListings = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { sellerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { buyRequests: true, orders: true } },
      },
    });
    res.json(products);
  } catch (err) {
    console.error('[getMyListings]', err);
    res.status(500).json({ message: 'Error fetching listings' });
  }
};

/* ═════════════════════════════ BUY REQUESTS ═════════════════════════════ */

/** POST /api/marketplace/products/:id/request */
exports.createBuyRequest = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.sellerId === req.user.id)
      return res.status(400).json({ message: "Can't buy your own product" });

    // Check for any existing active request from this buyer for the same product
    const existingActiveRequest = await prisma.buyRequest.findFirst({
      where: {
        buyerId: req.user.id,
        productId: req.params.id,
        status: { in: ['pending', 'accepted', 'completed'] }
      }
    });

    if (existingActiveRequest) {
      if (existingActiveRequest.status === 'pending') {
        return res.status(400).json({ message: 'You already have a pending request for this product.' });
      }
      if (existingActiveRequest.status === 'accepted') {
        return res.status(400).json({ message: 'Your request for this product has already been accepted. Check your Inbox!' });
      }
      if (existingActiveRequest.status === 'completed') {
        return res.status(400).json({ message: 'The deal for this product has already been completed.' });
      }
    }

    const { message } = req.body;
    const request = await prisma.buyRequest.create({
      data: {
        message: message || 'Interested in buying this product.',
        buyerId: req.user.id,
        sellerId: product.sellerId,
        productId: product.id,
      },
      include: {
        product: { select: { id: true, title: true, price: true, images: true } },
        buyer: { select: { id: true, name: true, email: true } },
      },
    });

    // Notify seller
    const buyerName = request.buyer?.name || 'A student';
    await createNotification(
      product.sellerId,
      `${buyerName} sent a buy request for your product "${product.title}".`,
      'NEW_REQUEST'
    );

    res.status(201).json(request);
  } catch (err) {
    console.error('[createBuyRequest]', err);
    res.status(500).json({ message: 'Error creating request' });
  }
};

/** GET /api/marketplace/requests/received */
exports.getReceivedRequests = async (req, res) => {
  try {
    const requests = await prisma.buyRequest.findMany({
      where: { sellerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { select: { id: true, name: true, email: true, enrollmentId: true } },
        product: { select: { id: true, title: true, price: true, images: true, category: true } },
      },
    });
    res.json(requests);
  } catch (err) {
    console.error('[getReceivedRequests]', err);
    res.status(500).json({ message: 'Error fetching requests' });
  }
};

/** GET /api/marketplace/requests/sent */
exports.getSentRequests = async (req, res) => {
  try {
    const requests = await prisma.buyRequest.findMany({
      where: { buyerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        seller: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, title: true, price: true, images: true, productType: true } },
      },
    });
    res.json(requests);
  } catch (err) {
    console.error('[getSentRequests]', err);
    res.status(500).json({ message: 'Error fetching sent requests' });
  }
};

/** PATCH /api/marketplace/requests/:id — accept or reject */
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const request = await prisma.buyRequest.findUnique({ where: { id: req.params.id } });
    if (!request) return res.status(404).json({ message: 'Not found' });
    if (request.sellerId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    const updated = await prisma.buyRequest.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, title: true, price: true } },
      },
    });

    // Auto-create chat thread on accept
    if (status === 'accepted') {
      const existing = await prisma.chatThread.findUnique({ where: { requestId: request.id } });
      if (!existing) {
        await prisma.chatThread.create({ data: { requestId: request.id } });
      }
    }

    // Notify buyer
    const statusLabel = status === 'accepted' ? 'accepted' : 'declined';
    await createNotification(
      updated.buyerId,
      `Your buy request for "${updated.product.title}" has been ${statusLabel} by the seller.`,
      status === 'accepted' ? 'REQUEST_ACCEPTED' : 'REQUEST_REJECTED'
    );

    res.json(updated);
  } catch (err) {
    console.error('[updateRequestStatus]', err);
    res.status(500).json({ message: 'Error updating request' });
  }
};

/* ═══════════════════════════════ ORDERS ════════════════════════════════ */

/** GET /api/marketplace/orders — buyer's purchase history */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { buyerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true, title: true, images: true,
            productType: true, digitalSubType: true, category: true,
          },
        },
        seller: { select: { id: true, name: true, email: true } },
      },
    });
    res.json(orders);
  } catch (err) {
    console.error('[getMyOrders]', err);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

/** POST /api/marketplace/orders — create order on digital purchase */
exports.createOrder = async (req, res) => {
  try {
    const { productId, amount, method = 'upi' } = req.body;
    if (!productId || !amount)
      return res.status(400).json({ message: 'productId and amount required' });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!product.isApproved) return res.status(400).json({ message: 'Product not yet approved' });

    // Prevent duplicate orders for digital products
    if (product.productType === 'digital') {
      const existing = await prisma.order.findFirst({
        where: { buyerId: req.user.id, productId, status: { in: ['PENDING', 'COMPLETED'] } },
      });
      if (existing) return res.status(409).json({ message: 'Already purchased', orderId: existing.id });
    }

    // Load live platform settings for commission splits
    const settings = await getPlatformSettings();
    const productPrice = product.price;

    const platformFeeAmt = parseFloat(((settings.digitalBuyerFeePercent / 100) * productPrice).toFixed(2));
    const sellerCutAmt = parseFloat(((settings.digitalSellerCutPercent / 100) * productPrice).toFixed(2));
    const netSellerAmt = parseFloat((productPrice - sellerCutAmt).toFixed(2));
    const payoutDays = settings.digitalPayoutDays || 7;

    const releaseAfter = new Date();
    releaseAfter.setDate(releaseAfter.getDate() + payoutDays);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create order with full fee breakdown
      const order = await tx.order.create({
        data: {
          amount: productPrice + platformFeeAmt,
          status: 'COMPLETED',
          platformFee: platformFeeAmt,
          sellerCut: sellerCutAmt,
          netSellerAmt: netSellerAmt,
          buyerId: req.user.id,
          sellerId: product.sellerId,
          productId,
        },
        include: {
          product: { select: { id: true, title: true, images: true, productType: true } },
          seller: { select: { id: true, name: true, email: true } },
        },
      });

      // 2. Create SellerPayout record for the student's earnings dashboard
      await tx.sellerPayout.create({
        data: {
          orderId: order.id,
          sellerId: product.sellerId,
          grossAmount: productPrice,
          platformCut: sellerCutAmt,
          netAmount: netSellerAmt,
          status: payoutDays === 0 ? 'released' : 'pending',
          releaseAfter,
          releasedAt: payoutDays === 0 ? new Date() : null,
        }
      });

      // 3. Update product status to sold (only for physical products)
      if (product.productType === 'physical') {
        await tx.product.update({
          where: { id: productId },
          data: { status: 'sold' }
        });
      }

      // 4. Create notifications
      const buyerAmtStr = `₹${(productPrice + platformFeeAmt).toLocaleString('en-IN')}`;
      const sellerAmtStr = `₹${netSellerAmt.toLocaleString('en-IN')}`;

      await tx.notification.create({
        data: {
          studentId: req.user.id,
          text: `Deal completed! You bought "${product.title}" — Total paid: ${buyerAmtStr}.`,
          type: 'DEAL_COMPLETED'
        }
      });

      await tx.notification.create({
        data: {
          studentId: product.sellerId,
          text: `Deal completed! Your product "${product.title}" was sold — Payout: ${sellerAmtStr} (releases in ${payoutDays} days).`,
          type: 'DEAL_COMPLETED'
        }
      });

      // 5. Close other active threads for this product (only for physical products)
      if (product.productType === 'physical') {
        const otherThreads = await tx.chatThread.findMany({
          where: {
            request: { productId },
            status: 'active'
          }
        });

        for (const otherThread of otherThreads) {
          await tx.chatThread.update({ where: { id: otherThread.id }, data: { status: 'closed' } });
          await tx.buyRequest.update({ where: { id: otherThread.requestId }, data: { status: 'rejected' } });
          await tx.chatMessage.create({
            data: {
              text: 'This product is sold out. Sorry!',
              threadId: otherThread.id,
              senderId: product.sellerId
            }
          });
        }
      }

      return order;
    });

    res.status(201).json(result);
  } catch (err) {
    console.error('[createOrder]', err);
    res.status(500).json({ message: 'Error creating order', detail: err.message });
  }
};

/* ═══════════════════════════════ WISHLIST ══════════════════════════════ */

/** GET /api/marketplace/wishlist — returns wishlist product IDs for user */
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await prisma.wishlistItem.findMany({
      where: { studentId: req.user.id },
      include: {
        product: {
          include: {
            seller: { select: { id: true, name: true } },
            college: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(wishlist);
  } catch (err) {
    // If wishlist table doesn't exist, return empty
    console.error('[getWishlist]', err.message);
    res.json([]);
  }
};

/** POST /api/marketplace/wishlist */
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const item = await prisma.wishlistItem.upsert({
      where: { studentId_productId: { studentId: req.user.id, productId } },
      create: { studentId: req.user.id, productId },
      update: {},
    });
    res.status(201).json(item);
  } catch (err) {
    console.error('[addToWishlist]', err);
    res.status(500).json({ message: 'Error adding to wishlist' });
  }
};

/** DELETE /api/marketplace/wishlist/:productId */
exports.removeFromWishlist = async (req, res) => {
  try {
    await prisma.wishlistItem.delete({
      where: { studentId_productId: { studentId: req.user.id, productId: req.params.productId } },
    });
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error('[removeFromWishlist]', err);
    res.status(500).json({ message: 'Error removing from wishlist' });
  }
};

/* ════════════════════════════════ CHAT ════════════════════════════════ */

/** GET /api/marketplace/threads */
exports.getThreads = async (req, res) => {
  try {
    const threads = await prisma.chatThread.findMany({
      where: {
        OR: [
          { request: { buyerId: req.user.id } },
          { request: { sellerId: req.user.id } }
        ]
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        request: {
          include: {
            buyer: { select: { id: true, name: true, email: true } },
            seller: { select: { id: true, name: true, email: true } },
            product: { select: { id: true, title: true, price: true, images: true } },
          },
        },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    res.json(threads);
  } catch (err) {
    console.error('[getThreads]', err);
    res.status(500).json({ message: 'Error fetching threads' });
  }
};

/** GET /api/marketplace/threads/:id/messages */
exports.getMessages = async (req, res) => {
  try {
    const thread = await prisma.chatThread.findUnique({
      where: { id: req.params.id },
      include: { request: true },
    });
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    if (thread.request.buyerId !== req.user.id && thread.request.sellerId !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });

    const messages = await prisma.chatMessage.findMany({
      where: { threadId: req.params.id },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true } } },
    });
    res.json(messages);
  } catch (err) {
    console.error('[getMessages]', err);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

/** POST /api/marketplace/threads/:id/messages */
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Message text required' });

    const thread = await prisma.chatThread.findUnique({
      where: { id: req.params.id },
      include: { request: true },
    });
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    if (thread.request.buyerId !== req.user.id && thread.request.sellerId !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });

    if (thread.status !== 'active') {
      return res.status(400).json({ message: 'Cannot send messages in a completed or closed conversation.' });
    }

    const message = await prisma.chatMessage.create({
      data: { text: text.trim(), threadId: req.params.id, senderId: req.user.id },
      include: { sender: { select: { id: true, name: true } } },
    });

    await prisma.chatThread.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });

    // Notify recipient
    const recipientId = thread.request.buyerId === req.user.id ? thread.request.sellerId : thread.request.buyerId;
    await createNotification(
      recipientId,
      `New message from ${message.sender?.name || 'student'} about "${thread.request.product?.title || 'product'}".`,
      'CHAT_MESSAGE'
    );

    res.status(201).json(message);
  } catch (err) {
    console.error('[sendMessage]', err);
    res.status(500).json({ message: 'Error sending message' });
  }
};

/** PATCH /api/marketplace/threads/:id/complete */
exports.completeDeal = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch thread
    const thread = await prisma.chatThread.findUnique({
      where: { id },
      include: {
        request: {
          include: {
            product: true
          }
        }
      }
    });

    if (!thread) {
      return res.status(404).json({ message: 'Chat thread not found' });
    }

    // 2. Authorize: ONLY the seller can mark a deal complete
    const isSeller = thread.request.sellerId === req.user.id;
    if (!isSeller) {
      return res.status(403).json({ message: 'Forbidden: Only the seller can mark the deal as done.' });
    }

    // 3. Prevent duplicate completions
    if (thread.status === 'deal_done') {
      return res.status(400).json({ message: 'Deal already completed for this conversation.' });
    }

    // 4. Load live platform settings
    const settings = await getPlatformSettings();
    const productType = thread.request.product.productType || 'physical';
    const productPrice = thread.request.product.price;

    let platformFeeAmt = 0;      // collected from buyer (shown only in billing)
    let sellerCutAmt = 0;        // deducted from seller revenue
    let netSellerAmt = productPrice; // what seller actually receives
    let payoutDays = settings.digitalPayoutDays || 7;

    if (productType === 'digital') {
      platformFeeAmt = parseFloat(((settings.digitalBuyerFeePercent / 100) * productPrice).toFixed(2));
      sellerCutAmt = parseFloat(((settings.digitalSellerCutPercent / 100) * productPrice).toFixed(2));
      netSellerAmt = parseFloat((productPrice - sellerCutAmt).toFixed(2));
    } else {
      // Physical: no buyer surcharge; platform fee = listing fee (already paid)
      // Revenue is passed in full to seller (listing fee was the platform's cut)
      platformFeeAmt = 0;
      sellerCutAmt = 0;
      netSellerAmt = productPrice;
      payoutDays = 0; // physical deals settle immediately
    }

    const releaseAfter = new Date();
    releaseAfter.setDate(releaseAfter.getDate() + payoutDays);

    // 5. Transaction
    const result = await prisma.$transaction(async (tx) => {
      // a. Update chat thread status
      const updatedThread = await tx.chatThread.update({
        where: { id },
        data: { status: 'deal_done' }
      });

      // b. Update buy request status
      await tx.buyRequest.update({
        where: { id: thread.requestId },
        data: { status: 'completed' }
      });

      // c. Update product status to sold (only for physical products)
      if (productType === 'physical') {
        await tx.product.update({
          where: { id: thread.request.productId },
          data: { status: 'sold' }
        });
      }

      // d. Create verified order log with fee breakdown
      const order = await tx.order.create({
        data: {
          amount: productType === 'digital' ? productPrice + platformFeeAmt : productPrice,
          status: 'COMPLETED',
          platformFee: platformFeeAmt,
          sellerCut: sellerCutAmt,
          netSellerAmt: netSellerAmt,
          buyerId: thread.request.buyerId,
          sellerId: thread.request.sellerId,
          productId: thread.request.productId
        }
      });

      // e. Create SellerPayout record
      await tx.sellerPayout.create({
        data: {
          orderId: order.id,
          sellerId: thread.request.sellerId,
          grossAmount: productPrice,
          platformCut: sellerCutAmt,
          netAmount: netSellerAmt,
          status: payoutDays === 0 ? 'released' : 'pending',
          releaseAfter,
          releasedAt: payoutDays === 0 ? new Date() : null,
        }
      });

      // f. Notifications
      const buyerAmt = productType === 'digital' ? `₹${(productPrice + platformFeeAmt).toLocaleString('en-IN')}` : `₹${productPrice.toLocaleString('en-IN')}`;
      const sellerAmt = `₹${netSellerAmt.toLocaleString('en-IN')}`;

      await tx.notification.create({
        data: {
          studentId: thread.request.buyerId,
          text: `Deal completed! You bought "​${thread.request.product.title}" — Total paid: ${buyerAmt}.`,
          type: 'DEAL_COMPLETED'
        }
      });

      await tx.notification.create({
        data: {
          studentId: thread.request.sellerId,
          text: `Deal completed! You sold "​${thread.request.product.title}" — Payout: ${sellerAmt}${payoutDays > 0 ? ` (releases in ${payoutDays} days)` : ''}.`,
          type: 'DEAL_COMPLETED'
        }
      });

      // g. Close other active threads for this product (only for physical products)
      if (productType === 'physical') {
        const otherThreads = await tx.chatThread.findMany({
          where: {
            request: { productId: thread.request.productId },
            id: { not: id },
            status: 'active'
          }
        });

        for (const otherThread of otherThreads) {
          await tx.chatThread.update({ where: { id: otherThread.id }, data: { status: 'closed' } });
          await tx.buyRequest.update({ where: { id: otherThread.requestId }, data: { status: 'rejected' } });
          await tx.chatMessage.create({
            data: {
              text: 'This product is sold out. Sorry!',
              threadId: otherThread.id,
              senderId: thread.request.sellerId
            }
          });
        }
      }

      return { updatedThread, order };
    });

    res.json({
      message: 'Deal successfully completed!',
      thread: result.updatedThread,
      order: result.order,
      billing: {
        productPrice,
        platformFee: platformFeeAmt,
        buyerTotal: productType === 'digital' ? productPrice + platformFeeAmt : productPrice,
        sellerCut: sellerCutAmt,
        sellerPayout: netSellerAmt,
        payoutIn: payoutDays > 0 ? `${payoutDays} days` : 'Immediate',
      }
    });
  } catch (err) {
    console.error('[completeDeal]', err);
    res.status(500).json({ message: 'Error completing deal', detail: err.message });
  }
};

/** PATCH /api/marketplace/threads/:id/close */
exports.closeThread = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch thread
    const thread = await prisma.chatThread.findUnique({
      where: { id },
      include: {
        request: true
      }
    });

    if (!thread) {
      return res.status(404).json({ message: 'Chat thread not found' });
    }

    // 2. Authorize: Only the seller can close the conversation
    const isSeller = thread.request.sellerId === req.user.id;
    if (!isSeller) {
      return res.status(403).json({ message: 'Forbidden: Only the seller can close the conversation.' });
    }

    // 3. Prevent duplicate close
    if (thread.status !== 'active') {
      return res.status(400).json({ message: 'Conversation is not active.' });
    }

    // 4. Update thread status and create seller end conversation message
    const result = await prisma.$transaction(async (tx) => {
      const updatedThread = await tx.chatThread.update({
        where: { id },
        data: { status: 'closed' }
      });

      await tx.buyRequest.update({
        where: { id: thread.requestId },
        data: { status: 'rejected' }
      });

      await tx.chatMessage.create({
        data: {
          text: "The seller has ended this conversation.",
          threadId: id,
          senderId: req.user.id
        }
      });

      return updatedThread;
    });

    res.json({ message: 'Conversation successfully ended!', thread: result });
  } catch (err) {
    console.error('[closeThread]', err);
    res.status(500).json({ message: 'Error closing conversation', detail: err.message });
  }
};

/* ════════════════════════════════ ADMIN ════════════════════════════════ */

/** PATCH /api/marketplace/admin/products/:id/approve */
exports.approveProduct = async (req, res) => {
  try {
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { isApproved: true, status: 'active' },
    });

    // Notify seller
    await createNotification(
      updated.sellerId,
      `Your listing "${updated.title}" has been approved by the college admin and is now live!`,
      'PRODUCT_APPROVED'
    );

    res.json(updated);
  } catch (err) {
    console.error('[approveProduct]', err);
    res.status(500).json({ message: 'Error approving product' });
  }
};

/** GET /api/marketplace/admin/products */
exports.getPendingProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'pending_review' },
      orderBy: { createdAt: 'desc' },
      include: {
        seller: { select: { name: true, email: true } },
        college: { select: { name: true } },
      },
    });
    res.json(products);
  } catch (err) {
    console.error('[getPendingProducts]', err);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

/* ═══════════════════════════ PROFILE / STATS ════════════════════════════ */

/** GET /api/marketplace/me — current user's marketplace stats */
exports.getMyProfile = async (req, res) => {
  try {
    const [listed, sold, purchased] = await Promise.all([
      prisma.product.count({ where: { sellerId: req.user.id } }),
      prisma.order.count({ where: { sellerId: req.user.id, status: 'COMPLETED' } }),
      prisma.order.count({ where: { buyerId: req.user.id, status: 'COMPLETED' } }),
    ]);

    // Calculate actual net revenue for the seller (excluding platform buyer fee surcharge and including seller commission cuts)
    const completedOrders = await prisma.order.findMany({
      where: { sellerId: req.user.id, status: 'COMPLETED' },
      select: { amount: true, netSellerAmt: true }
    });
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.netSellerAmt ?? o.amount), 0);

    const recentListings = await prisma.product.findMany({
      where: { sellerId: req.user.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, price: true, status: true, views: true, images: true, productType: true },
    });

    const recentPurchases = await prisma.order.findMany({
      where: { buyerId: req.user.id, status: 'COMPLETED' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { id: true, title: true, images: true, productType: true } } },
    });

    res.json({
      stats: {
        listed,
        sold,
        purchased,
        revenue: totalRevenue,
      },
      recentListings,
      recentPurchases,
    });
  } catch (err) {
    console.error('[getMyProfile]', err);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

/** GET /api/marketplace/earnings — current student's digital seller earnings & payouts */
exports.getMyEarnings = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // 1. Fetch all seller payouts for this student, including buyer details from order
    const payouts = await prisma.sellerPayout.findMany({
      where: { sellerId },
      include: {
        order: {
          include: {
            product: {
              select: { id: true, title: true, productType: true }
            },
            buyer: {
              select: { id: true, name: true, email: true, enrollmentId: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    // 2. Aggregate stats
    const totalDigitalSales = payouts.reduce((s, p) => s + p.grossAmount, 0);
    const totalCuts = payouts.reduce((s, p) => s + p.platformCut, 0);
    const totalEarnings = payouts.reduce((s, p) => s + p.netAmount, 0);

    const releasedEarnings = payouts
      .filter(p => p.status === 'released')
      .reduce((s, p) => s + p.netAmount, 0);

    const pendingEarnings = payouts
      .filter(p => p.status === 'pending')
      .reduce((s, p) => s + p.netAmount, 0);

    const overdueCount = payouts.filter(
      p => p.status === 'pending' && new Date(p.releaseAfter) <= now
    ).length;

    // 3. Build 7-day chart data
    const chartData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const dayPayouts = payouts.filter(p => {
        const pd = new Date(p.createdAt);
        return pd.getDate() === d.getDate() && pd.getMonth() === d.getMonth();
      });
      return {
        day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        earnings: Math.round(dayPayouts.reduce((s, p) => s + p.netAmount, 0)),
        sales: Math.round(dayPayouts.reduce((s, p) => s + p.grossAmount, 0)),
      };
    });

    const formattedTimeline = payouts.map(p => ({
      id: p.id,
      orderId: p.orderId,
      productTitle: p.order?.product?.title || 'Unknown Product',
      grossAmount: `₹${p.grossAmount.toLocaleString('en-IN')}`,
      platformCut: `₹${p.platformCut.toLocaleString('en-IN')}`,
      netAmount: `₹${p.netAmount.toLocaleString('en-IN')}`,
      status: p.status,
      isOverdue: p.status === 'pending' && new Date(p.releaseAfter) <= now,
      releaseAfter: new Date(p.releaseAfter).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      releasedAt: p.releasedAt ? new Date(p.releasedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
      date: new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      buyerName: p.order?.buyer?.name || 'Unknown Student',
      buyerEmail: p.order?.buyer?.email || '',
      buyerEnrollment: p.order?.buyer?.enrollmentId || '',
    }));

    return res.json({
      stats: {
        totalDigitalSales: `₹${Math.round(totalDigitalSales).toLocaleString('en-IN')}`,
        totalDigitalSalesRaw: totalDigitalSales,
        totalCuts: `₹${Math.round(totalCuts).toLocaleString('en-IN')}`,
        totalCutsRaw: totalCuts,
        totalEarnings: `₹${Math.round(totalEarnings).toLocaleString('en-IN')}`,
        totalEarningsRaw: totalEarnings,
        releasedEarnings: `₹${Math.round(releasedEarnings).toLocaleString('en-IN')}`,
        releasedEarningsRaw: releasedEarnings,
        pendingEarnings: `₹${Math.round(pendingEarnings).toLocaleString('en-IN')}`,
        pendingEarningsRaw: pendingEarnings,
        overdueCount,
      },
      chartData,
      timeline: formattedTimeline,
    });
  } catch (err) {
    console.error('[getMyEarnings]', err);
    return res.status(500).json({ message: 'Server error fetching earnings' });
  }
};


const { Transform } = require('stream');

class StreamLimitTransform extends Transform {
  constructor(limit) {
    super();
    this.limit = limit;
    this.bytesWritten = 0;
  }
  _transform(chunk, encoding, callback) {
    if (this.bytesWritten >= this.limit) {
      this.destroy();
      return callback();
    }
    const remaining = this.limit - this.bytesWritten;
    if (chunk.length <= remaining) {
      this.bytesWritten += chunk.length;
      this.push(chunk);
    } else {
      this.bytesWritten += remaining;
      this.push(chunk.slice(0, remaining));
      this.destroy();
    }
    callback();
  }
}

async function getTruncatedPdfBuffer(pdfBuffer) {
  try {
    const { PDFDocument } = require('pdf-lib');
    const fullPdfDoc = await PDFDocument.load(pdfBuffer);
    const totalPages = fullPdfDoc.getPageCount();
    if (totalPages <= 2) {
      return pdfBuffer;
    }
    const previewPdfDoc = await PDFDocument.create();
    const copiedPages = await previewPdfDoc.copyPages(
      fullPdfDoc,
      Array.from({ length: 2 }, (_, i) => i)
    );
    copiedPages.forEach(page => previewPdfDoc.addPage(page));
    const truncatedBytes = await previewPdfDoc.save();
    return Buffer.from(truncatedBytes);
  } catch (err) {
    console.error('[truncatePdf Error]', err);
    return pdfBuffer; // fallback to full file if truncation fails
  }
}

async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (chunk) => chunks.push(chunk));
    readableStream.on('end', () => resolve(Buffer.concat(chunks)));
    readableStream.on('error', (err) => reject(err));
  });
}

/** GET /api/marketplace/products/:id/file — Securely stream PDF/video files with auth & DRM check */
exports.streamProductFile = async (req, res) => {
  try {
    const { id } = req.params;
    const isPreview = req.query.preview === 'true';

    // 1. Fetch product
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // 2. Enforce purchase check if not the seller and not previewing
    const isSeller = product.sellerId === req.user.id;
    if (!isSeller && !isPreview) {
      const order = await prisma.order.findFirst({
        where: {
          buyerId: req.user.id,
          productId: id,
          status: 'COMPLETED',
        },
      });
      if (!order) {
        return res.status(403).json({ message: 'Purchase required to view full secure content.' });
      }
    }

    // 3. Find target file (we look for PDFs, docs, videos in product.images)
    const files = product.images || [];
    const isDoc = (url) => {
      const clean = url.split('?')[0].toLowerCase();
      const ext = clean.substring(clean.lastIndexOf('.') + 1);
      return ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'].includes(ext);
    };
    const isVid = (url) => {
      const clean = url.split('?')[0].toLowerCase();
      const ext = clean.substring(clean.lastIndexOf('.') + 1);
      return ['mp4', 'webm', 'mkv', 'mov', 'avi'].includes(ext);
    };

    let targetFile = '';
    if (product.digitalSubType === 'video') {
      targetFile = files.find(isVid);
    } else if (product.digitalSubType === 'notes') {
      targetFile = files.find(isDoc);
    } else {
      // both/bundle/other: find any matching doc or video depending on query or default
      targetFile = files.find(f => isDoc(f) || isVid(f));
    }

    if (!targetFile) {
      return res.status(404).json({ message: 'Secure file attachment not found.' });
    }

    // 4. Stream the file!
    const isR2Url = targetFile.startsWith('http://') || targetFile.startsWith('https://');

    if (isR2Url) {
      // Stream from R2
      try {
        let contentType = 'application/octet-stream';
        if (isDoc(targetFile)) contentType = 'application/pdf';
        else if (isVid(targetFile)) contentType = 'video/mp4';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

        if (isPreview) {
          if (isDoc(targetFile)) {
            // PDF Preview: Truncate to 2 pages
            const stream = await r2.getObjectStreamByUrl(targetFile);
            const fullBuffer = await streamToBuffer(stream);
            const truncatedBuffer = await getTruncatedPdfBuffer(fullBuffer);
            res.setHeader('Content-Length', truncatedBuffer.length);
            res.send(truncatedBuffer);
          } else {
            // Video Preview: limit bytes to 15MB
            const stream = await r2.getObjectStreamByUrl(targetFile);
            const previewLimit = 15 * 1024 * 1024;
            res.setHeader('Content-Length', previewLimit);
            stream.pipe(new StreamLimitTransform(previewLimit)).pipe(res);
          }
        } else {
          // Full access
          const stream = await r2.getObjectStreamByUrl(targetFile);
          stream.pipe(res);
        }
      } catch (err) {
        console.error('[streamProductFile - R2 Error]', err);
        res.status(500).json({ message: 'Error streaming file from cloud storage.' });
      }
    } else {
      // Stream from local disk
      const fs = require('fs');
      const path = require('path');
      const relPath = targetFile.replace(/^\/uploads\//, '');
      const absolutePath = path.join(__dirname, '..', 'uploads', relPath);

      if (!fs.existsSync(absolutePath)) {
        return res.status(404).json({ message: 'Local secure file not found.' });
      }

      const stat = fs.statSync(absolutePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      let contentType = 'application/octet-stream';
      if (isDoc(targetFile)) contentType = 'application/pdf';
      else if (isVid(targetFile)) contentType = 'video/mp4';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

      if (isPreview) {
        if (isDoc(targetFile)) {
          // PDF Preview: Truncate to 2 pages
          const fullBuffer = fs.readFileSync(absolutePath);
          const truncatedBuffer = await getTruncatedPdfBuffer(fullBuffer);
          res.setHeader('Content-Length', truncatedBuffer.length);
          res.send(truncatedBuffer);
        } else {
          // Video Preview: limit bytes to 15MB
          const previewLimit = Math.min(fileSize, 15 * 1024 * 1024);
          if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            if (start >= previewLimit) {
              return res.status(403).json({ message: 'Preview limit reached. Purchase to view full video.' });
            }
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const adjustedEnd = Math.min(end, previewLimit - 1);
            const chunksize = (adjustedEnd - start) + 1;
            const fileStream = fs.createReadStream(absolutePath, { start, end: adjustedEnd });

            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${adjustedEnd}/${previewLimit}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': contentType,
            });
            fileStream.pipe(res);
          } else {
            res.setHeader('Content-Length', previewLimit);
            const fileStream = fs.createReadStream(absolutePath, { start: 0, end: previewLimit - 1 });
            fileStream.pipe(res);
          }
        }
      } else {
        // Full access
        if (range && isVid(targetFile)) {
          const parts = range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunksize = (end - start) + 1;
          const fileStream = fs.createReadStream(absolutePath, { start, end });

          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': contentType,
          });
          fileStream.pipe(res);
        } else {
          res.setHeader('Content-Length', fileSize);
          const fileStream = fs.createReadStream(absolutePath);
          fileStream.pipe(res);
        }
      }
    }
  } catch (err) {
    console.error('[streamProductFile]', err);
    res.status(500).json({ message: 'Internal server error while streaming file.' });
  }
};

/* ── Helper: create database notification ── */
async function createNotification(studentId, text, type = 'INFO') {
  try {
    await prisma.notification.create({
      data: {
        studentId,
        text,
        type,
      },
    });
  } catch (err) {
    console.error('[createNotification] Failed:', err.message);
  }
}

/** GET /api/marketplace/notifications */
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { studentId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(notifications);
  } catch (err) {
    console.error('[getNotifications]', err);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

/** PATCH /api/marketplace/notifications/read */
exports.markNotificationsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { studentId: req.user.id, read: false },
      data: { read: true }
    });
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    console.error('[markNotificationsRead]', err);
    res.status(500).json({ message: 'Error marking notifications as read' });
  }
};
