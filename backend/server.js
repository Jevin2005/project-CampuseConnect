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
const paymentRoutes     = require('./routes/payment.routes');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

/* ─── CORS ─────────────────────────────────────────────────────────── */
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_ALT,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean);

// Also allow any Vercel preview URL for this project
const VERCEL_PROJECT_PATTERN = /^https:\/\/project-campuse-connect.*\.vercel\.app$/;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Render health checks, curl, server-side)
    if (!origin) return callback(null, true);
    // Exact match
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // Allow any vercel preview URL for this project
    if (VERCEL_PROJECT_PATTERN.test(origin)) return callback(null, true);
    console.warn(`[CORS] Blocked origin: ${origin}`);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
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
  const reqOrigin = req.headers.origin;
  const isAllowed = reqOrigin && (
    ALLOWED_ORIGINS.includes(reqOrigin) ||
    VERCEL_PROJECT_PATTERN.test(reqOrigin)
  );
  res.setHeader('Access-Control-Allow-Origin', isAllowed ? reqOrigin : (process.env.FRONTEND_URL || 'http://localhost:3000'));
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

/* ─── /api/run-migration — secure DB setup endpoint ────────────────── */
/* Access: GET /api/run-migration?secret=<first-12-chars-of-JWT_SECRET> */
app.get('/api/run-migration', async (req, res) => {
  const secret   = req.query.secret;
  const expected = (process.env.JWT_SECRET || '').slice(0, 12);
  if (!secret || secret !== expected) {
    return res.status(403).json({ error: 'Forbidden — wrong secret' });
  }

  const report = { steps: [], errors: [] };
  const { execSync } = require('child_process');

  // All migration names in order
  const MIGRATIONS = [
    '20260506175927_init',
    '20260511185004_add_student_password',
    '20260512123636_add_student_auth_fields',
    '20260519162355_add_wishlist_and_orders_v2',
  ];

  const runCmd = (cmd) => execSync(cmd, { cwd: __dirname, stdio: 'pipe' }).toString();

  // ── 1. prisma migrate deploy (auto-baselines on P3005) ──────────────
  try {
    runCmd('npx prisma migrate deploy');
    report.steps.push('✅ prisma migrate deploy — success');
  } catch (e) {
    const output = (e.stderr?.toString() || '') + (e.stdout?.toString() || '') + e.message;

    if (output.includes('P3005')) {
      report.steps.push('⚠️  P3005 detected — DB exists without migration history. Baselining...');

      for (const migration of MIGRATIONS) {
        try {
          runCmd(`npx prisma migrate resolve --applied "${migration}"`);
          report.steps.push(`  ✅ Baselined: ${migration}`);
        } catch (be) {
          const beText = (be.stderr?.toString() || '') + be.message;
          if (beText.includes('already') || beText.includes('recorded')) {
            report.steps.push(`  ✅ Already applied: ${migration}`);
          } else {
            report.errors.push(`  ❌ Baseline failed for ${migration}: ${beText}`);
          }
        }
      }

      // Retry deploy after baseline
      try {
        runCmd('npx prisma migrate deploy');
        report.steps.push('✅ prisma migrate deploy — success after baseline');
      } catch (retryErr) {
        report.errors.push('❌ prisma migrate deploy failed after baseline: ' + retryErr.message);
      }
    } else {
      report.errors.push('❌ prisma migrate deploy failed: ' + output.slice(0, 500));
    }
  }

  // ── 2. prisma generate ───────────────────────────────────────────────
  try {
    runCmd('npx prisma generate');
    report.steps.push('✅ prisma generate — success');
  } catch (e) {
    report.errors.push('❌ prisma generate failed: ' + e.message);
  }

  // ── 3. Seed master admin ─────────────────────────────────────────────
  try {
    const bcrypt = require('bcryptjs');
    const { PrismaClient } = require('@prisma/client');
    const db = new PrismaClient();
    const masterEmail    = process.env.MASTER_EMAIL    || 'admin@campusconnect.in';
    const masterPassword = process.env.MASTER_PASSWORD || 'MasterAdmin@2024!';
    const hashed = await bcrypt.hash(masterPassword, 12);
    const master = await db.masterAdmin.upsert({
      where:  { email: masterEmail },
      update: { password: hashed, name: 'Platform Admin' },
      create: { email: masterEmail, password: hashed, name: 'Platform Admin', tokenVersion: 0 },
    });
    await db.$disconnect();
    report.steps.push(`✅ Master admin upserted — email: ${master.email}`);
  } catch (e) {
    report.errors.push('❌ Seed master admin failed: ' + e.message);
  }

  // ── 4. DB connectivity check ─────────────────────────────────────────
  try {
    const { PrismaClient } = require('@prisma/client');
    const db = new PrismaClient();
    await db.$queryRaw`SELECT 1`;
    const adminCount  = await db.masterAdmin.count();
    const tableCount  = await db.college.count();
    await db.$disconnect();
    report.steps.push(`✅ DB connected — masterAdmins: ${adminCount}, colleges: ${tableCount}`);
  } catch (e) {
    report.errors.push('❌ DB connectivity check failed: ' + e.message);
  }

  // ── 5. SMTP Email connectivity check ─────────────────────────────────
  try {
    const nodemailer = require('nodemailer');
    const testTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    await testTransporter.verify();
    report.steps.push('✅ SMTP Email Transport connected successfully');
  } catch (e) {
    report.errors.push('❌ SMTP Email connection failed: ' + e.message);
  }

  // ── 6. Env var presence check ────────────────────────────────────────
  const REQUIRED = ['DATABASE_URL','JWT_SECRET','JWT_REFRESH_SECRET','MASTER_EMAIL','MASTER_PASSWORD'];
  const OPTIONAL = ['REDIS_URL','R2_ACCOUNT_ID','RAZORPAY_KEY_ID','FRONTEND_URL','NODE_ENV', 'EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
  report.env = {
    required: Object.fromEntries(REQUIRED.map(k => [k, !!process.env[k] ? '✅ set' : '❌ MISSING'])),
    optional: Object.fromEntries(OPTIONAL.map(k => [k, !!process.env[k] ? '✅ set' : '⚠️ not set'])),
  };

  const status = report.errors.length === 0 ? 200 : 207;
  return res.status(status).json({
    success: report.errors.length === 0,
    ...report,
    message: report.errors.length === 0
      ? '🎉 All steps completed. You can now login.'
      : '⚠️ Some steps failed — check errors array.',
  });
});
/* ─── END migration endpoint ─────────────────────────────────────────── */

/* ─── TEMP Seed endpoint (kept for backward compat) ─────────────────── */
app.get('/api/seed-now', async (req, res) => {
  const secret = req.query.secret;
  const expected = (process.env.JWT_SECRET || '').slice(0, 12);
  if (!secret || secret !== expected) {
    return res.status(403).json({ error: 'Forbidden — wrong secret' });
  }
  try {
    const bcrypt = require('bcryptjs');
    const { PrismaClient } = require('@prisma/client');
    const db = new PrismaClient();
    const masterEmail = process.env.MASTER_EMAIL || 'admin@campusconnect.in';
    const masterPassword = process.env.MASTER_PASSWORD || 'MasterAdmin@2024!';
    const hashed = await bcrypt.hash(masterPassword, 12);
    const master = await db.masterAdmin.upsert({
      where: { email: masterEmail },
      update: { password: hashed, name: 'Platform Admin' },
      create: { email: masterEmail, password: hashed, name: 'Platform Admin', tokenVersion: 0 },
    });
    await db.$disconnect();
    return res.json({ success: true, email: master.email, message: '✅ Master admin seeded!' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
/* ─── END TEMP ───────────────────────────────────────────────────────── */




/* ─── API routes ───────────────────────────────────────────────────── */
app.use('/api/auth',        authRoutes);
app.use('/api/master',      masterRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/payments',    paymentRoutes);

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

