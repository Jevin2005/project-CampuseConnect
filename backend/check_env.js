require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

async function testPostgreSQL() {
  console.log('\n🔵 Testing PostgreSQL (via Prisma)...');
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env!');
    return false;
  }
  const prisma = new PrismaClient();
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    console.log(`✅ PostgreSQL Connected successfully in ${Date.now() - start}ms!`);
    return true;
  } catch (err) {
    console.error('❌ PostgreSQL Connection Failed!');
    console.error(`   Error message: ${err.message}`);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function testRedis() {
  console.log('\n🔴 Testing Redis...');
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  console.log(`   Connecting to: ${redisUrl}`);
  const redis = new Redis(redisUrl, {
    connectTimeout: 3000,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });
  try {
    const start = Date.now();
    const result = await redis.ping();
    console.log(`✅ Redis PING success: "${result}" in ${Date.now() - start}ms!`);
    return true;
  } catch (err) {
    console.error('❌ Redis Connection Failed!');
    console.error(`   Error message: ${err.message}`);
    return false;
  } finally {
    redis.disconnect();
  }
}

async function testCloudflareR2() {
  console.log('\n☁️ Testing Cloudflare R2 Storage...');
  const id = process.env.R2_ACCOUNT_ID;
  const key = process.env.R2_ACCESS_KEY_ID;
  const secret = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME || 'campusconnect';

  if (!id || !key || !secret) {
    console.error('❌ Cloudflare R2 environment variables are missing (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)!');
    return false;
  }

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${id}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: key, secretAccessKey: secret },
  });

  try {
    const start = Date.now();
    // Test connection by listing objects (max 1 key)
    await s3.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 1 }));
    console.log(`✅ Cloudflare R2 Connected and bucket "${bucket}" is accessible in ${Date.now() - start}ms!`);
    return true;
  } catch (err) {
    console.error('❌ Cloudflare R2 Connection Failed!');
    console.error(`   Error message: ${err.message}`);
    return false;
  }
}

async function testRazorpay() {
  console.log('\n💳 Testing Razorpay Gateway...');
  const keyId = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !secret) {
    console.error('❌ Razorpay environment variables are missing (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)!');
    return false;
  }

  const rz = new Razorpay({ key_id: keyId, key_secret: secret });
  try {
    const start = Date.now();
    // Test Razorpay auth by creating a tiny temporary order
    const order = await rz.orders.create({
      amount: 100, // 1 INR in paise
      currency: 'INR',
      receipt: `diagnose_${Date.now()}`
    });
    console.log(`✅ Razorpay API connection verified (Order ID: ${order.id}) in ${Date.now() - start}ms!`);
    return true;
  } catch (err) {
    console.error('❌ Razorpay Verification Failed!');
    console.error(`   Error message: ${err.message}`);
    return false;
  }
}

async function testNodemailer() {
  console.log('\n📧 Testing Nodemailer SMTP Mailer...');
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '587');
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.error('❌ Email sender credentials missing (EMAIL_USER, EMAIL_PASS)!');
    return false;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });

  try {
    const start = Date.now();
    await transporter.verify();
    console.log(`✅ SMTP Connection verified successfully in ${Date.now() - start}ms!`);
    return true;
  } catch (err) {
    console.error('❌ SMTP Server Handshake Failed!');
    console.error(`   Error message: ${err.message}`);
    return false;
  }
}

async function runDiagnostics() {
  console.log('================================================');
  console.log('       CampusConnect .env Connection Diagnostics ');
  console.log('================================================');
  
  const results = {
    PostgreSQL: await testPostgreSQL(),
    Redis: await testRedis(),
    CloudflareR2: await testCloudflareR2(),
    Razorpay: await testRazorpay(),
    Nodemailer: await testNodemailer()
  };

  console.log('\n================================================');
  console.log('               Diagnostic Summary               ');
  console.log('================================================');
  for (const [service, status] of Object.entries(results)) {
    console.log(`${status ? '✅ WORKING   ' : '❌ FAILED    '} - ${service}`);
  }
  console.log('================================================');
}

runDiagnostics();
