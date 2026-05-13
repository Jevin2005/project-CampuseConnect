/**
 * Admin Auth Controller
 * Handles: register, login, logout, check-code
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { sendApprovalEmail, notifyMasterAdminRegistration } = require('../services/email.service');

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  });
}

function setRefreshCookie(res, refreshToken) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

/* ─── GET /api/auth/admin/check-code ──────────────────────────────── */
async function checkCollegeCode(req, res) {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ message: 'Code is required' });

    const existing = await prisma.college.findUnique({
      where: { code: code.toString().toUpperCase() },
    });

    return res.json({ available: !existing });
  } catch (err) {
    console.error('[checkCollegeCode] Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/* ─── POST /api/auth/admin/register ───────────────────────────────── */
async function register(req, res) {
  try {
    const { collegeName, city, emailDomain, collegeCode, collegeType, adminName, adminEmail, password } = req.body;

    if (!collegeName || !emailDomain || !collegeCode || !adminName || !adminEmail || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const normalizedCode = collegeCode.toUpperCase().trim();
    const normalizedEmail = adminEmail.trim().toLowerCase();

    // Validate college code is unique
    const existingCollege = await prisma.college.findUnique({
      where: { code: normalizedCode },
    });
    if (existingCollege) {
      return res.status(409).json({ message: 'College code is already taken. Please choose a different code.' });
    }

    // Validate admin email is not already registered
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingAdmin) {
      return res.status(409).json({ message: 'An admin account with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create College + Admin in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const college = await tx.college.create({
        data: {
          name: collegeName.trim(),
          code: normalizedCode,
          emailDomain: emailDomain.trim().toLowerCase(),
          city: city?.trim(),
          type: collegeType?.trim(),
          isApproved: false,
        },
      });

      const admin = await tx.admin.create({
        data: {
          name: adminName.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          collegeId: college.id,
          isApproved: false,
        },
      });

      return { college, admin };
    });

    // Notify master admin
    await notifyMasterAdminRegistration(result.college.name, result.admin.name, result.admin.email);

    return res.status(201).json({
      message: 'Registration submitted for review. You will receive an email within 24–48 hours.',
    });
  } catch (err) {
    console.error('[adminRegister] Error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}

/* ─── POST /api/auth/admin/login ──────────────────────────────────── */
async function login(req, res) {
  try {
    const { email, collegeCode, password } = req.body;

    if (!email || !collegeCode || !password) {
      return res.status(400).json({ message: 'Email, college code, and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = collegeCode.toUpperCase().trim();

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
      include: { college: true },
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify college code matches admin's college
    if (admin.college.code !== normalizedCode) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if approved
    if (!admin.isApproved || !admin.college.isApproved) {
      return res.status(403).json({
        message: 'Your registration is under review. You will receive an email once approved.',
        status: 'PENDING',
      });
    }

    // Issue tokens
    const accessToken = signAccessToken({
      userId: admin.id,
      role: 'COLLEGE_ADMIN',
      collegeId: admin.collegeId,
      email: admin.email,
    });

    const refreshToken = signRefreshToken({
      userId: admin.id,
      role: 'COLLEGE_ADMIN',
      tokenVersion: admin.tokenVersion,
    });

    setRefreshCookie(res, refreshToken);

    return res.json({
      accessToken,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        collegeId: admin.collegeId,
        collegeName: admin.college.name,
      },
    });
  } catch (err) {
    console.error('[adminLogin] Error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}

/* ─── POST /api/auth/admin/logout ─────────────────────────────────── */
async function logout(req, res) {
  res.clearCookie('refreshToken', { path: '/' });
  return res.json({ message: 'Logged out successfully' });
}

module.exports = { checkCollegeCode, register, login, logout };
