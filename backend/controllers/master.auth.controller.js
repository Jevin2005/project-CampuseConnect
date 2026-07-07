/**
 * Master Admin Auth Controller
 * Handles: login, logout
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

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

/* ─── POST /api/auth/master/login ─────────────────────────────────── */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find master admin
    const master = await prisma.masterAdmin.findUnique({
      where: { email: normalizedEmail },
    });

    if (!master) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, master.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        action: 'MASTER_LOGIN',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        adminId: master.id,
      },
    }).catch(() => {}); // Non-critical — don't fail login if audit log fails

    // Issue tokens
    const accessToken = signAccessToken({
      userId: master.id,
      role: 'MASTER_ADMIN',
      email: master.email,
    });

    const refreshToken = signRefreshToken({
      userId: master.id,
      role: 'MASTER_ADMIN',
      tokenVersion: master.tokenVersion,
    });

    setRefreshCookie(res, refreshToken);

    return res.json({
      accessToken,
      master: {
        id: master.id,
        name: master.name,
        email: master.email,
      },
    });
  } catch (err) {
    console.error('[masterLogin] Error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}

/* ─── POST /api/auth/master/logout ────────────────────────────────── */
async function logout(req, res) {
  // Log audit
  if (req.user?.userId) {
    await prisma.auditLog.create({
      data: {
        action: 'MASTER_LOGOUT',
        ipAddress: req.ip,
        adminId: req.user.userId,
      },
    }).catch(() => {});
  }

  res.clearCookie('refreshToken', { path: '/' });
  return res.json({ message: 'Logged out successfully' });
}

module.exports = { login, logout };
