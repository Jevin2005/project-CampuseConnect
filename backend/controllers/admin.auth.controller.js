/**
 * Admin Auth Controller
 * Handles: register, login, logout, check-code
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { sendApprovalEmail, notifyMasterAdminRegistration, sendRegisterVerificationEmail } = require('../services/email.service');

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
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,                      // must be true when sameSite='none'
    sameSite: isProd ? 'none' : 'lax',  // 'none' = cross-domain; 'lax' = local dev
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

    // Validate admin email is not already registered and verified
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
      include: { college: true },
    });

    if (existingAdmin && existingAdmin.isEmailVerified) {
      return res.status(409).json({ message: 'An admin account with this email already exists.' });
    }

    // Validate college code is unique (excluding the unverified college we might be updating)
    const existingCollege = await prisma.college.findUnique({
      where: { code: normalizedCode },
    });

    if (existingCollege) {
      // If the college code is taken, but not by the unverified registration of this admin, error.
      if (!existingAdmin || existingAdmin.collegeId !== existingCollege.id) {
        return res.status(409).json({ message: 'College code is already taken. Please choose a different code.' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    let result;
    if (existingAdmin) {
      // Update existing unverified Admin and their associated College
      result = await prisma.$transaction(async (tx) => {
        const college = await tx.college.update({
          where: { id: existingAdmin.collegeId },
          data: {
            name: collegeName.trim(),
            code: normalizedCode,
            emailDomain: emailDomain.trim().toLowerCase(),
            city: city?.trim() || null,
            type: collegeType?.trim() || null,
            isApproved: false,
          },
        });

        const admin = await tx.admin.update({
          where: { id: existingAdmin.id },
          data: {
            name: adminName.trim(),
            password: hashedPassword,
            isApproved: false,
          },
        });

        return { college, admin };
      });
    } else {
      // Create College + Admin in a transaction
      result = await prisma.$transaction(async (tx) => {
        const college = await tx.college.create({
          data: {
            name: collegeName.trim(),
            code: normalizedCode,
            emailDomain: emailDomain.trim().toLowerCase(),
            city: city?.trim() || null,
            type: collegeType?.trim() || null,
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
            isEmailVerified: false,
          },
        });

        return { college, admin };
      });
    }

    // Generate Verification OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bcrypt.hash(otp, 10);

    const redis = require('../services/redis.service');
    // Store in Redis / memory fallback
    try {
      await redis.setex(`reg-otp:${normalizedEmail}`, 600, hashedOtp);
    } catch (err) {
      console.warn('[Reg-OTP] Redis unavailable, using memory store:', err.message);
      global._regOtpStore = global._regOtpStore || {};
      global._regOtpStore[normalizedEmail] = {
        hash: hashedOtp,
        expires: Date.now() + 600 * 1000,
      };
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n[DEV] Admin Reg OTP for ${normalizedEmail}: ${otp}\n`);
    }

    // Send verification email
    await sendRegisterVerificationEmail(normalizedEmail, result.admin.name || 'Admin', otp);

    const maskEmail = (email) => {
      const [local, domain] = email.split('@');
      const masked = local.slice(0, 3) + '***';
      return `${masked}@${domain}`;
    };

    return res.status(200).json({
      status: 'VERIFICATION_REQUIRED',
      message: 'A verification OTP has been sent to your email. Please verify your email to complete college registration.',
      maskedEmail: maskEmail(normalizedEmail),
      email: normalizedEmail,
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

    // Check if email verified
    if (!admin.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email address first.',
        status: 'EMAIL_UNVERIFIED',
      });
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
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
  return res.json({ message: 'Logged out successfully' });
}

/* ─── POST /api/auth/admin/register/verify ──────────────────────────── */
async function verifyRegisterOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const redis = require('../services/redis.service');
    // Retrieve OTP hash from Redis or global store
    let storedHash = null;
    try {
      storedHash = await redis.get(`reg-otp:${normalizedEmail}`);
    } catch {
      const stored = global._regOtpStore?.[normalizedEmail];
      if (stored && stored.expires > Date.now()) {
        storedHash = stored.hash;
      }
    }

    if (!storedHash) {
      return res.status(400).json({ message: 'Verification OTP expired or not found. Please request a new one.' });
    }

    const isValid = await bcrypt.compare(otp.toString(), storedHash);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid verification OTP. Please try again.' });
    }

    // Delete OTP
    try {
      await redis.del(`reg-otp:${normalizedEmail}`);
    } catch {
      if (global._regOtpStore) delete global._regOtpStore[normalizedEmail];
    }

    // Find admin and college
    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
      include: { college: true },
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin registration record not found.' });
    }

    // Update email as verified
    await prisma.admin.update({
      where: { email: normalizedEmail },
      data: { isEmailVerified: true },
    });

    // Notify master admin
    await notifyMasterAdminRegistration(admin.college.name, admin.name, admin.email);

    return res.status(200).json({
      message: 'Email verified successfully! Your college registration has been submitted for review.',
    });
  } catch (err) {
    console.error('[adminVerifyRegisterOtp] Error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}

/* ─── POST /api/auth/admin/register/resend ──────────────────────────── */
async function resendRegisterOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });

    if (!admin) {
      return res.status(404).json({ message: 'No registration record found for this email.' });
    }

    if (admin.isEmailVerified) {
      return res.status(400).json({ message: 'This email is already verified.' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bcrypt.hash(otp, 10);

    const redis = require('../services/redis.service');
    // Store in Redis / memory fallback
    try {
      await redis.setex(`reg-otp:${normalizedEmail}`, 600, hashedOtp);
    } catch {
      global._regOtpStore = global._regOtpStore || {};
      global._regOtpStore[normalizedEmail] = {
        hash: hashedOtp,
        expires: Date.now() + 600 * 1000,
      };
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n[DEV] Admin Reg OTP for ${normalizedEmail}: ${otp}\n`);
    }

    await sendRegisterVerificationEmail(normalizedEmail, admin.name || 'Admin', otp);

    const maskEmail = (email) => {
      const [local, domain] = email.split('@');
      const masked = local.slice(0, 3) + '***';
      return `${masked}@${domain}`;
    };

    return res.json({
      message: 'Verification OTP resent successfully.',
      maskedEmail: maskEmail(normalizedEmail),
    });
  } catch (err) {
    console.error('[adminResendRegisterOtp] Error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}

module.exports = {
  checkCollegeCode,
  register,
  login,
  logout,
  verifyRegisterOtp,
  resendRegisterOtp,
};
