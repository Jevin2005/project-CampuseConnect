/**
 * Student Auth Controller
 *
 * Registration flow:
 *   1. POST /api/auth/student/register
 *      → any email + college code + password + optional info
 *      → college looked up by code (not by email domain)
 *      → student created with isApproved: false
 *      → college admin notified by email
 *
 * Login flows (either of the two):
 *   A) Password login (primary)
 *      POST /api/auth/student/login  { email, password }
 *
 *   B) OTP login (optional/passwordless)
 *      POST /api/auth/student/send-otp   { email }
 *      POST /api/auth/student/verify-otp { email, otp }
 *
 * Other:
 *   GET /api/auth/student/approval-status?email=...
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const redis = require('../services/redis.service');
const {
  sendOtpEmail,
  notifyCollegeAdminOfStudentRequest,
} = require('../services/email.service');

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

/* ─── helpers ──────────────────────────────────────────────────────── */

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function maskEmail(email) {
  const [local, domain] = email.split('@');
  const masked = local.slice(0, 3) + '***';
  return `${masked}@${domain}`;
}

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
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

/** Basic email format check */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ─── POST /api/auth/student/register ─────────────────────────────── */
async function register(req, res) {
  try {
    const { name, email, password, collegeCode, phone, enrollmentId } = req.body;

    // — Validate required fields —
    if (!name || !email || !password || !collegeCode) {
      return res.status(400).json({
        message: 'Name, email, password, and college code are required.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode  = collegeCode.trim().toUpperCase();

    // — Check college by code —
    const college = await prisma.college.findUnique({
      where: { code: normalizedCode },
      include: {
        admins: {
          where: { isApproved: true },
          select: { email: true, name: true },
          take: 1,
        },
      },
    });

    if (!college) {
      return res.status(400).json({
        message: `College code "${normalizedCode}" is not registered on CampusConnect. Please check your code.`,
      });
    }

    if (!college.isApproved) {
      return res.status(400).json({
        message: 'This college is not yet approved on CampusConnect. Please contact your college admin.',
      });
    }

    // — Check if email already used —
    const existing = await prisma.student.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return res.status(409).json({
        message: 'An account with this email already exists. Please log in instead.',
      });
    }

    // — Hash password —
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // — Create student (pending approval) —
    const student = await prisma.student.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone?.trim() || null,
        enrollmentId: enrollmentId?.trim() || null,
        collegeId: college.id,
        isApproved: false,
      },
    });

    // — Notify college admin —
    const adminEmail = college.admins[0]?.email;
    if (adminEmail) {
      await notifyCollegeAdminOfStudentRequest(
        adminEmail,
        college.admins[0]?.name || 'Admin',
        student.name,
        student.email,
        college.name
      ).catch((e) => console.error('[Email] Failed to notify admin:', e.message));
    }

    return res.status(201).json({
      message:
        'Registration submitted! Your college admin will review and approve your account within 24–48 hours.',
    });
  } catch (err) {
    console.error('[studentRegister] Error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}

/* ─── POST /api/auth/student/login ────────────────────────────────── */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const student = await prisma.student.findUnique({
      where: { email: normalizedEmail },
      include: { college: true },
    });

    // Don't reveal whether the email exists
    if (!student || !student.password) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check approval status
    if (!student.isApproved) {
      return res.status(403).json({
        message:
          'Your account is pending approval from your college admin. You will be notified by email once approved.',
        status: 'PENDING',
      });
    }

    // Issue tokens
    const accessToken = signAccessToken({
      userId: student.id,
      role: 'STUDENT',
      collegeId: student.collegeId,
      email: student.email,
    });

    const refreshToken = signRefreshToken({
      userId: student.id,
      role: 'STUDENT',
      tokenVersion: student.tokenVersion,
    });

    setRefreshCookie(res, refreshToken);

    return res.json({
      status: 'APPROVED',
      accessToken,
      user: {
        id: student.id,
        email: student.email,
        name: student.name,
        collegeId: student.collegeId,
        collegeName: student.college?.name,
      },
    });
  } catch (err) {
    console.error('[studentLogin] Error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}

/* ─── POST /api/auth/student/send-otp ─────────────────────────────── */
// OTP login is the optional / passwordless path.
// Students who registered via the new form can also use OTP if they prefer.
async function sendOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Check student exists (OTP login requires prior registration)
    const student = await prisma.student.findUnique({
      where: { email: normalizedEmail },
    });

    // We still send a success response even if student not found
    // to avoid email enumeration. The OTP simply won't be sent
    // if student doesn't exist.
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Store in Redis / in-memory fallback
    let redisWorking = false;
    try {
      await redis.setex(`otp:${normalizedEmail}`, 600, hashedOtp);
      redisWorking = true;
    } catch (redisErr) {
      console.warn('[OTP] Redis unavailable, using in-memory fallback:', redisErr.message);
      global._otpStore = global._otpStore || {};
      global._otpStore[normalizedEmail] = {
        hash: hashedOtp,
        expires: Date.now() + 600 * 1000,
      };
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n[DEV] OTP for ${normalizedEmail}: ${otp}\n`);
    }

    if (student) {
      try {
        await sendOtpEmail(normalizedEmail, otp);
      } catch (emailErr) {
        console.error('[OTP] Email send failed:', emailErr.message);
        if (process.env.NODE_ENV === 'production') {
          return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
        }
      }
    }

    return res.json({
      message:
        process.env.NODE_ENV !== 'production'
          ? 'OTP sent (check server console for dev OTP)'
          : 'If this email is registered, an OTP has been sent.',
      maskedEmail: maskEmail(normalizedEmail),
    });
  } catch (err) {
    console.error('[sendOtp] Error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}

/* ─── POST /api/auth/student/verify-otp ───────────────────────────── */
async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Retrieve hashed OTP
    let storedHash = null;
    try {
      storedHash = await redis.get(`otp:${normalizedEmail}`);
    } catch {
      const stored = global._otpStore?.[normalizedEmail];
      if (stored && stored.expires > Date.now()) {
        storedHash = stored.hash;
      }
    }

    if (!storedHash) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }

    const isValid = await bcrypt.compare(otp.toString(), storedHash);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    }

    // Delete OTP (one-time use)
    try {
      await redis.del(`otp:${normalizedEmail}`);
    } catch {
      if (global._otpStore) delete global._otpStore[normalizedEmail];
    }

    // Find student
    const student = await prisma.student.findUnique({
      where: { email: normalizedEmail },
      include: { college: true },
    });

    // If student doesn't exist → they need to register first
    if (!student) {
      return res.status(404).json({
        message: 'No account found for this email. Please register first.',
        status: 'NOT_FOUND',
      });
    }

    // Pending
    if (!student.isApproved) {
      return res.json({ status: 'PENDING' });
    }

    // Approved → issue tokens
    const accessToken = signAccessToken({
      userId: student.id,
      role: 'STUDENT',
      collegeId: student.collegeId,
      email: student.email,
    });

    const refreshToken = signRefreshToken({
      userId: student.id,
      role: 'STUDENT',
      tokenVersion: student.tokenVersion,
    });

    setRefreshCookie(res, refreshToken);

    return res.json({
      status: 'APPROVED',
      accessToken,
      user: {
        id: student.id,
        email: student.email,
        name: student.name,
        collegeId: student.collegeId,
        collegeName: student.college?.name,
      },
    });
  } catch (err) {
    console.error('[verifyOtp] Error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}

/* ─── GET /api/auth/student/approval-status ───────────────────────── */
async function checkApprovalStatus(req, res) {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const student = await prisma.student.findUnique({
      where: { email: normalizedEmail },
      include: { college: true },
    });

    if (!student) {
      return res.json({ status: 'NOT_FOUND' });
    }

    if (!student.isApproved) {
      return res.json({ status: 'PENDING' });
    }

    // Issue fresh tokens on approval detection
    const accessToken = signAccessToken({
      userId: student.id,
      role: 'STUDENT',
      collegeId: student.collegeId,
      email: student.email,
    });

    const refreshToken = signRefreshToken({
      userId: student.id,
      role: 'STUDENT',
      tokenVersion: student.tokenVersion,
    });

    setRefreshCookie(res, refreshToken);

    return res.json({
      status: 'APPROVED',
      accessToken,
      user: {
        id: student.id,
        email: student.email,
        name: student.name,
        collegeId: student.collegeId,
        collegeName: student.college?.name,
      },
    });
  } catch (err) {
    console.error('[checkApprovalStatus] Error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
}

module.exports = { register, login, sendOtp, verifyOtp, checkApprovalStatus };
