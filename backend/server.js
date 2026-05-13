/**
 * CampusConnect Backend Server
 * Express + Prisma + Redis authentication API
 */

require('dotenv').config();

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

const authRoutes = require('./routes/auth.routes');
const masterRoutes = require('./routes/master.routes');
const adminRoutes = require('./routes/admin.routes');

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

/* ─── Middleware ────────────────────────────────────────────────────── */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ─── Trust proxy (for rate limiting via IP) ───────────────────────── */
app.set('trust proxy', 1);

/* ─── Health check ──────────────────────────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ─── API routes ───────────────────────────────────────────────────── */
app.use('/api/auth', authRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/admin', adminRoutes);

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

