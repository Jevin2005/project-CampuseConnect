/**
 * Admin Auth Controller
 * Handles: register, login, logout, check-code
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const otpService = require('../services/otp.service');
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

function shouldExposeOtp() {
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.SHOW_DEV_OTP === 'true' ||
    process.env.ENABLE_DEV_OTP === 'true' ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  );
}

const { setRefreshCookie, clearRefreshCookie } = require('../services/cookie.service');

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

    // Generate Verification OTP via otpService
    const otp = otpService.generateOtp();
    await otpService.storeOtp('reg-otp', normalizedEmail, otp, 600);

    // Send verification email asynchronously
    sendRegisterVerificationEmail(normalizedEmail, result.admin.name || 'Admin', otp).catch((err) => {
      console.error('[adminRegister] Email background error:', err.message);
    });

    return res.status(200).json({
      status: 'VERIFICATION_REQUIRED',
      message: '⚡ A verification code has been sent to your email.',
      instantMessage: `A 6-digit verification code was sent to ${otpService.maskEmail(normalizedEmail)}.`,
      maskedEmail: otpService.maskEmail(normalizedEmail),
      email: normalizedEmail,
      devOtp: shouldExposeOtp() ? otp : undefined,
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
    if ((admin.college?.code || '').trim().toUpperCase() !== normalizedCode) {
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
  clearRefreshCookie(res);
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

    // Verify OTP using bulletproof otpService
    const verification = await otpService.verifyOtp('reg-otp', normalizedEmail, otp);
    if (!verification.valid) {
      if (verification.reason === 'EXPIRED') {
        return res.status(400).json({ message: 'Verification OTP expired or not found. Please request a new one.' });
      }
      return res.status(400).json({ message: 'Invalid verification OTP. Please try again.' });
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

    const otp = otpService.generateOtp();
    await otpService.storeOtp('reg-otp', normalizedEmail, otp, 600);

    sendRegisterVerificationEmail(normalizedEmail, admin.name || 'Admin', otp).catch((err) => {
      console.error('[adminResendRegisterOtp] Email background error:', err.message);
    });

    return res.json({
      message: '⚡ Verification code resent successfully.',
      instantMessage: `A new code was dispatched to ${otpService.maskEmail(normalizedEmail)}.`,
      maskedEmail: otpService.maskEmail(normalizedEmail),
      devOtp: shouldExposeOtp() ? otp : undefined,
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
