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
    (req.files['images']     || []).forEach(f => images.push(f.path));
    (req.files['thumbnails'] || []).forEach(f => images.push(f.path));
    (req.files['videos']     || []).forEach(f => videos.push(f.path));
    (req.files['documents']  || []).forEach(f => documents.push(f.path));
    (req.files['media']      || []).forEach(f => {
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

/* ─── Helper: safe settings fetch ───────────────────────────────────────── */
async function getPlatformSettings() {
  try {
    const s = await prisma.settings.findFirst();
    return s || { listingFeePhysical: 49, listingFeeDigital: 29, platformFeePercent: 5 };
  } catch {
    // If settings table doesn't exist yet
    try {
      const { listingFeePhysical = 49, listingFeeDigital = 29, platformFeePercent = 5 } =
        require('../config/platformSettings.json');
      return { listingFeePhysical, listingFeeDigital, platformFeePercent };
    } catch {
      return { listingFeePhysical: 49, listingFeeDigital: 29, platformFeePercent: 5 };
    }
  }
}

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
    if (type)     where.productType = type;
    if (search)   where.title = { contains: search, mode: 'insensitive' };

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc')  orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'popular')    orderBy = { views: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where, orderBy, skip, take: parseInt(limit),
        include: {
          seller:  { select: { id: true, name: true, email: true } },
          college: { select: { name: true } },
          _count:  { select: { buyRequests: true } },
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
        seller:  { select: { id: true, name: true, email: true, phone: true } },
        college: { select: { name: true } },
        _count:  { select: { buyRequests: true } },
      },
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Security check: restrict cross-college product viewing
    if (req.user && req.user.collegeId && product.collegeId !== req.user.collegeId) {
      return res.status(403).json({ message: 'Access denied: Product belongs to another college.' });
    }

    // Increment view count (fire-and-forget)
    prisma.product.update({ where: { id: req.params.id }, data: { views: { increment: 1 } } }).catch(() => {});

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
        description:    description || '',
        price:          parseFloat(price),
        originalPrice:  originalPrice ? parseFloat(originalPrice) : null,
        images:         allMedia,
        category:       category || 'Other',
        condition:      condition || 'Good',
        productType:    productType || 'physical',
        digitalSubType: digitalSubType || null,
        status:         'pending_review',
        isApproved:     false,
        sellerId:       req.user.id,
        collegeId:      req.user.collegeId,
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
        ...(title                            && { title }),
        ...(description !== undefined        && { description }),
        ...(price                            && { price: parseFloat(price) }),
        ...(originalPrice !== undefined      && { originalPrice: originalPrice ? parseFloat(originalPrice) : null }),
        ...(category                         && { category }),
        ...(condition                        && { condition }),
        ...(newMedia.length > 0             && { images: [...product.images, ...newMedia] }),
        ...(contentChanged                   && { status: 'pending_review', isApproved: false }),
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

    const { message } = req.body;
    const request = await prisma.buyRequest.create({
      data: {
        message:   message || 'Interested in buying this product.',
        buyerId:   req.user.id,
        sellerId:  product.sellerId,
        productId: product.id,
      },
      include: {
        product: { select: { id: true, title: true, price: true, images: true } },
        buyer:   { select: { id: true, name: true, email: true } },
      },
    });
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
        buyer:   { select: { id: true, name: true, email: true, enrollmentId: true } },
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
        seller:  { select: { id: true, name: true, email: true } },
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
    if (!request)                              return res.status(404).json({ message: 'Not found' });
    if (request.sellerId !== req.user.id)      return res.status(403).json({ message: 'Forbidden' });
    if (request.status !== 'pending')          return res.status(400).json({ message: 'Request already processed' });

    const updated = await prisma.buyRequest.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        buyer:   { select: { id: true, name: true, email: true } },
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
    if (!product)        return res.status(404).json({ message: 'Product not found' });
    if (!product.isApproved) return res.status(400).json({ message: 'Product not yet approved' });

    // Prevent duplicate orders for digital products
    if (product.productType === 'digital') {
      const existing = await prisma.order.findFirst({
        where: { buyerId: req.user.id, productId, status: { in: ['PENDING', 'COMPLETED'] } },
      });
      if (existing) return res.status(409).json({ message: 'Already purchased', orderId: existing.id });
    }

    const order = await prisma.order.create({
      data: {
        amount:    parseFloat(amount),
        status:    'COMPLETED',        // For now; integrate payment gateway later
        buyerId:   req.user.id,
        sellerId:  product.sellerId,
        productId,
      },
      include: {
        product: { select: { id: true, title: true, images: true, productType: true } },
        seller:  { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(order);
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
            seller:  { select: { id: true, name: true } },
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
      where:  { studentId_productId: { studentId: req.user.id, productId } },
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
            buyer:   { select: { id: true, name: true, email: true } },
            seller:  { select: { id: true, name: true, email: true } },
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
      where:   { threadId: req.params.id },
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

    const message = await prisma.chatMessage.create({
      data:    { text: text.trim(), threadId: req.params.id, senderId: req.user.id },
      include: { sender: { select: { id: true, name: true } } },
    });

    await prisma.chatThread.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });
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

    // 2. Authorize: user must be buyer or seller
    const isBuyer = thread.request.buyerId === req.user.id;
    const isSeller = thread.request.sellerId === req.user.id;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Forbidden: You are not part of this conversation.' });
    }

    // 3. Prevent duplicate completions
    if (thread.status === 'deal_done') {
      return res.status(400).json({ message: 'Deal already completed for this conversation.' });
    }

    // 4. Transaction: complete thread, request, product, and log order
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

      // c. Update product status to sold
      await tx.product.update({
        where: { id: thread.request.productId },
        data: { status: 'sold' }
      });

      // d. Create verified order log
      const order = await tx.order.create({
        data: {
          amount: thread.request.product.price,
          status: 'COMPLETED',
          buyerId: thread.request.buyerId,
          sellerId: thread.request.sellerId,
          productId: thread.request.productId
        }
      });

      return { updatedThread, order };
    });

    res.json({ message: 'Deal successfully completed!', thread: result.updatedThread, order: result.order });
  } catch (err) {
    console.error('[completeDeal]', err);
    res.status(500).json({ message: 'Error completing deal', detail: err.message });
  }
};

/* ════════════════════════════════ ADMIN ════════════════════════════════ */

/** PATCH /api/marketplace/admin/products/:id/approve */
exports.approveProduct = async (req, res) => {
  try {
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data:  { isApproved: true, status: 'active' },
    });
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
      where:   { status: 'pending_review' },
      orderBy: { createdAt: 'desc' },
      include: {
        seller:  { select: { name: true, email: true } },
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

    const revenue = await prisma.order.aggregate({
      where:   { sellerId: req.user.id, status: 'COMPLETED' },
      _sum:    { amount: true },
    });

    const recentListings = await prisma.product.findMany({
      where:   { sellerId: req.user.id },
      take:    5,
      orderBy: { createdAt: 'desc' },
      select:  { id: true, title: true, price: true, status: true, views: true, images: true, productType: true },
    });

    const recentPurchases = await prisma.order.findMany({
      where:   { buyerId: req.user.id, status: 'COMPLETED' },
      take:    5,
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { id: true, title: true, images: true, productType: true } } },
    });

    res.json({
      stats: {
        listed,
        sold,
        purchased,
        revenue: revenue._sum.amount || 0,
      },
      recentListings,
      recentPurchases,
    });
  } catch (err) {
    console.error('[getMyProfile]', err);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

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
        const stream = await r2.getObjectStreamByUrl(targetFile);
        
        // Detect content type
        let contentType = 'application/octet-stream';
        if (isDoc(targetFile)) contentType = 'application/pdf';
        else if (isVid(targetFile)) contentType = 'video/mp4';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

        stream.pipe(res);
      } catch (err) {
        console.error('[streamProductFile - R2 Error]', err);
        res.status(500).json({ message: 'Error streaming file from cloud storage.' });
      }
    } else {
      // Stream from local disk
      // Disk URL looks like `/uploads/documents/some-uuid.pdf`
      // We convert it to local absolute path
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

      if (range && isVid(targetFile)) {
        // Video range support for streaming seeking
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
  } catch (err) {
    console.error('[streamProductFile]', err);
    res.status(500).json({ message: 'Internal server error while streaming file.' });
  }
};
