/**
 * CampusConnect Backend Server
 * Express + Prisma + Redis authentication API
 */

require('dotenv').config();

/* ─── Programmatic dependency install for DRM PDF truncation ─── */
try {
  require('pdf-lib');
} catch (e) {
  console.log('📦 Installing pdf-lib for secure DRM preview truncation...');
  try {
    require('child_process').execSync('npm install pdf-lib', { cwd: __dirname, stdio: 'inherit' });
    console.log('✅ pdf-lib installed successfully');
  } catch (err) {
    console.error('❌ Failed to install pdf-lib:', err.message);
  }
}

/* ─── Startup env validation ────────────────────────────────────────── */
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`\n❌ Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('   Check your backend/.env file and add the missing values.\n');
  process.exit(1);
}

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const authRoutes        = require('./routes/auth.routes');
const masterRoutes      = require('./routes/master.routes');
const adminRoutes       = require('./routes/admin.routes');
const marketplaceRoutes = require('./routes/marketplace.routes');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

/* ─── CORS ─────────────────────────────────────────────────────────── */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // needed for HTTP-only cookie
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/* ─── Body & cookies ───────────────────────────────────────────────── */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

/* ─── Static uploads (images & videos served from /uploads) ─────────── */
const path = require('path');
const fs   = require('fs');
const uploadsPath = path.join(__dirname, 'uploads');
['images','videos','thumbnails','banners'].forEach(d => {
  const p = path.join(uploadsPath, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
}, express.static(uploadsPath, { maxAge: '7d' }));

/* ─── Trust proxy (for rate limiting via IP) ───────────────────────── */
app.set('trust proxy', 1);

/* ─── Health check ──────────────────────────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});



/* ─── API routes ───────────────────────────────────────────────────── */
app.use('/api/auth',        authRoutes);
app.use('/api/master',      masterRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/marketplace', marketplaceRoutes);

console.log(`   Marketplace API: http://localhost:${process.env.PORT||5000}/api/marketplace/*`);

/* ─── 404 handler ───────────────────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

/* ─── Error handler ─────────────────────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ message: 'Internal server error' });
});

/* ─── Start ─────────────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n🚀 CampusConnect API running on http://localhost:${PORT}`);
  console.log(`   Auth endpoints: http://localhost:${PORT}/api/auth/*`);
  console.log(`   Health check:   http://localhost:${PORT}/api/health\n`);
});



// Sync database status for physical products with completed orders
async function syncSoldProducts() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        product: { productType: 'physical' }
      },
      select: { productId: true }
    });
    const productIds = orders.map(o => o.productId);
    if (productIds.length > 0) {
      const result = await prisma.product.updateMany({
        where: { id: { in: productIds }, status: { not: 'sold' } },
        data: { status: 'sold' }
      });
      if (result.count > 0) {
        console.log(`✅ [DB Sync] Marked ${result.count} physical products as sold.`);
      }
    }
  } catch (err) {
    console.error('❌ [DB Sync] Error syncing sold physical products:', err.message);
  }
}

syncSoldProducts();

/* ─── Graceful shutdown ─────────────────────────────────────────────── */
process.on('SIGINT', async () => {
  console.log('\n[Server] Shutting down gracefully...');
  await prisma.$disconnect();
  console.log('[Prisma] Disconnected.');
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;

