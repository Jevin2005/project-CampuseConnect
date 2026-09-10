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
const otpService = require('../services/otp.service');
const {
  sendRegisterVerificationEmail,
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

function shouldExposeOtp() {
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.SHOW_DEV_OTP === 'true' ||
    process.env.ENABLE_DEV_OTP === 'true' ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  );
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

const { setRefreshCookie } = require('../services/cookie.service');

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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    let student;
    if (existing) {
      if (existing.isEmailVerified) {
        return res.status(409).json({
          message: 'An account with this email already exists. Please log in instead.',
        });
      } else {
        // Abandoned/unverified registration -> let's update their details and resend OTP
        student = await prisma.student.update({
          where: { email: normalizedEmail },
          data: {
            name: name.trim(),
            password: hashedPassword,
            phone: phone?.trim() || null,
            enrollmentId: enrollmentId?.trim() || null,
            collegeId: college.id,
            isApproved: false,
          },
        });
      }
    } else {
      // Create student (pending verification and approval)
      student = await prisma.student.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          phone: phone?.trim() || null,
          enrollmentId: enrollmentId?.trim() || null,
          collegeId: college.id,
          isApproved: false,
          isEmailVerified: false,
        },
      });
    }

    // Generate Verification OTP via otpService (dual-written to memory + Redis)
    const otp = otpService.generateOtp();
    await otpService.storeOtp('reg-otp', normalizedEmail, otp, 600);

    // Send verification email asynchronously (sub-second API response)
    sendRegisterVerificationEmail(normalizedEmail, student.name || 'Student', otp).catch((err) => {
      console.error('[studentRegister] Email background error:', err.message);
    });

    return res.status(200).json({
      status: 'VERIFICATION_REQUIRED',
      message: '⚡ Verification code sent! Please verify your email to complete registration.',
      instantMessage: `A 6-digit verification code was sent to ${otpService.maskEmail(normalizedEmail)}.`,
      maskedEmail: otpService.maskEmail(normalizedEmail),
      email: normalizedEmail,
      devOtp: shouldExposeOtp() ? otp : undefined,
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

    // Don't reveal whether the email exists, but provide a helpful hint if it's an admin
    if (!student || !student.password) {
      const admin = await prisma.admin.findUnique({
        where: { email: normalizedEmail },
      });
      if (admin) {
        return res.status(400).json({
          message: 'This email belongs to a College Administrator. Please log in at the Admin Portal (/admin/login).',
        });
      }
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check email verification
    if (!student.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email address first.',
        status: 'EMAIL_UNVERIFIED',
      });
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

    let admin = null;
    if (!student) {
      admin = await prisma.admin.findUnique({
        where: { email: normalizedEmail },
        include: { college: true },
      });
    }

    if (!student && !admin) {
      return res.status(404).json({
        message: 'No account found with this email. Please check your email or register first.',
        status: 'NOT_FOUND',
      });
    }

    const otp = otpService.generateOtp();
    await otpService.storeOtp('otp', normalizedEmail, otp, 600);
    await otpService.storeOtp('reset-pwd', normalizedEmail, otp, 600);

    // Send email asynchronously
    sendOtpEmail(normalizedEmail, otp).catch((emailErr) => {
      console.error('[OTP] Email send failed:', emailErr.message);
    });

    return res.json({
      message: '⚡ One-Time Password sent to your email.',
      instantMessage: `OTP dispatched to ${otpService.maskEmail(normalizedEmail)}.`,
      maskedEmail: otpService.maskEmail(normalizedEmail),
      email: normalizedEmail,
      userType: admin ? 'COLLEGE_ADMIN' : 'STUDENT',
      devOtp: shouldExposeOtp() ? otp : undefined,
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

    // Verify OTP using bulletproof otpService
    const verification = await otpService.verifyOtp('otp', normalizedEmail, otp);
    if (!verification.valid) {
      if (verification.reason === 'EXPIRED') {
        return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
      }
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    }

    // Find student
    const student = await prisma.student.findUnique({
      where: { email: normalizedEmail },
      include: { college: true },
    });

    if (!student) {
      // Check if this is a college admin
      const admin = await prisma.admin.findUnique({
        where: { email: normalizedEmail },
        include: { college: true },
      });

      if (!admin) {
        return res.status(404).json({
          message: 'No account found for this email. Please register first.',
          status: 'NOT_FOUND',
        });
      }

      if (!admin.isApproved || !admin.college?.isApproved) {
        return res.json({ status: 'PENDING', role: 'COLLEGE_ADMIN' });
      }

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
        status: 'APPROVED',
        role: 'COLLEGE_ADMIN',
        accessToken,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          collegeId: admin.collegeId,
          collegeName: admin.college?.name,
          collegeCode: admin.college?.code,
        },
      });
    }

    // Pending
    if (!student.isApproved) {
      return res.json({ status: 'PENDING', role: 'STUDENT' });
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
      role: 'STUDENT',
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

/* ─── POST /api/auth/student/register/verify ────────────────────────── */
async function verifyRegisterOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
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

    // Find student
    const student = await prisma.student.findUnique({
      where: { email: normalizedEmail },
      include: { college: { include: { admins: { where: { isApproved: true }, take: 1 } } } },
    });

    if (!student) {
      return res.status(404).json({ message: 'Registration record not found.' });
    }

    // Update email as verified
    await prisma.student.update({
      where: { email: normalizedEmail },
      data: { isEmailVerified: true },
    });

    // Notify college admin
    const adminEmail = student.college.admins[0]?.email;
    if (adminEmail) {
      await notifyCollegeAdminOfStudentRequest(
        adminEmail,
        student.college.admins[0]?.name || 'Admin',
        student.name,
        student.email,
        student.college.name
      ).catch((e) => console.error('[Email] Failed to notify admin:', e.message));
    }

    return res.status(200).json({
      message: 'Email verified successfully! Your college admin will review and approve your account within 24–48 hours.',
    });
  } catch (err) {
    console.error('[verifyRegisterOtp] Error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}

/* ─── POST /api/auth/student/register/resend ────────────────────────── */
async function resendRegisterOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const student = await prisma.student.findUnique({
      where: { email: normalizedEmail },
    });

    if (!student) {
      return res.status(404).json({ message: 'No registration record found for this email.' });
    }

    if (student.isEmailVerified) {
      return res.status(400).json({ message: 'This email is already verified. Please log in.' });
    }

    const otp = otpService.generateOtp();
    await otpService.storeOtp('reg-otp', normalizedEmail, otp, 600);

    sendRegisterVerificationEmail(normalizedEmail, student.name || 'Student', otp).catch((err) => {
      console.error('[resendRegisterOtp] Email background error:', err.message);
    });

    return res.json({
      message: '⚡ Verification code resent successfully.',
      instantMessage: `A new code was dispatched to ${otpService.maskEmail(normalizedEmail)}.`,
      maskedEmail: otpService.maskEmail(normalizedEmail),
      devOtp: shouldExposeOtp() ? otp : undefined,
    });
  } catch (err) {
    console.error('[resendRegisterOtp] Error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}

/* ─── POST /api/auth/student/reset-password ────────────────────────── */
async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP code, and new password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }

    // Verify OTP using otpService
    let verification = await otpService.verifyOtp('otp', normalizedEmail, otp);
    if (!verification.valid) {
      verification = await otpService.verifyOtp('reset-pwd', normalizedEmail, otp);
    }

    if (!verification.valid) {
      if (verification.reason === 'EXPIRED') {
        return res.status(400).json({ message: 'Verification OTP expired. Please request a new one.' });
      }
      return res.status(400).json({ message: 'Invalid verification OTP. Please check the code and try again.' });
    }

    // Find student
    const student = await prisma.student.findUnique({
      where: { email: normalizedEmail },
      include: { college: true },
    });

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    if (!student) {
      // Check if this is a college admin account
      const admin = await prisma.admin.findUnique({
        where: { email: normalizedEmail },
        include: { college: true },
      });

      if (!admin) {
        return res.status(404).json({ message: 'No account found for this email.' });
      }

      await prisma.admin.update({
        where: { email: normalizedEmail },
        data: {
          password: hashedPassword,
          isEmailVerified: true,
        },
      });

      if (!admin.isApproved || !admin.college?.isApproved) {
        return res.json({
          status: 'PENDING',
          role: 'COLLEGE_ADMIN',
          message: 'Password reset successful! Your college admin registration is under review.',
        });
      }

      // Issue tokens for instant seamless login as College Admin
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
        status: 'APPROVED',
        role: 'COLLEGE_ADMIN',
        message: 'Password reset successfully! You are now logged in to your administrator account.',
        accessToken,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          collegeId: admin.collegeId,
          collegeName: admin.college?.name,
          collegeCode: admin.college?.code,
        },
      });
    }

    await prisma.student.update({
      where: { email: normalizedEmail },
      data: {
        password: hashedPassword,
        isEmailVerified: true,
      },
    });

    // Check approval status
    if (!student.isApproved) {
      return res.json({
        status: 'PENDING',
        role: 'STUDENT',
        message: 'Password reset successful! Your account is pending admin approval.',
      });
    }

    // Issue tokens for instant seamless login
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
      role: 'STUDENT',
      message: 'Password reset successfully! You are now logged in with your new password.',
      accessToken,
      user: {
        id: student.id,
        email: student.email,
        name: student.name,
        collegeId: student.collegeId,
        collegeName: student.college?.name,
        collegeCode: student.college?.code,
      },
    });
  } catch (err) {
    console.error('[resetPassword] Error:', err);
    return res.status(500).json({ message: 'Server error while resetting password. Please try again.' });
  }
}

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
  checkApprovalStatus,
  verifyRegisterOtp,
  resendRegisterOtp,
  resetPassword,
};

