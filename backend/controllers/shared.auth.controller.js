/**
 * Shared Auth Controller
 * Handles: refresh token, logout (shared)
 */

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/* ─── POST /api/auth/refresh ───────────────────────────────────────── */
async function refresh(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      const isProd = process.env.NODE_ENV === 'production';
      res.clearCookie('refreshToken', { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax', path: '/' });
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const { userId, role, tokenVersion } = decoded;

    // Verify tokenVersion matches DB to support instant invalidation
    let dbUser = null;
    let collegeId = null;
    let userData = null;

    if (role === 'STUDENT') {
      dbUser = await prisma.student.findUnique({
        where: { id: userId },
        include: { college: true },
      });
      if (dbUser) {
        collegeId = dbUser.collegeId;
        userData = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          collegeId: dbUser.collegeId,
          collegeName: dbUser.college?.name,
        };
      }
    } else if (role === 'COLLEGE_ADMIN') {
      dbUser = await prisma.admin.findUnique({
        where: { id: userId },
        include: { college: true },
      });
      if (dbUser) {
        collegeId = dbUser.collegeId;
        userData = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          collegeId: dbUser.collegeId,
          collegeName: dbUser.college?.name,
        };
      }
    } else if (role === 'MASTER_ADMIN') {
      dbUser = await prisma.masterAdmin.findUnique({
        where: { id: userId },
      });
      if (dbUser) {
        // collegeId stays null for MASTER_ADMIN — that is correct
        userData = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
        };
      }
    } else {
      const isProdRole = process.env.NODE_ENV === 'production';
      res.clearCookie('refreshToken', { httpOnly: true, secure: isProdRole, sameSite: isProdRole ? 'none' : 'lax', path: '/' });
      return res.status(401).json({ message: 'Invalid token role' });
    }

    if (!dbUser) {
      const isProd = process.env.NODE_ENV === 'production';
      res.clearCookie('refreshToken', { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax', path: '/' });
      return res.status(401).json({ message: 'User not found' });
    }

    // Check tokenVersion to support instant session invalidation
    // All models have tokenVersion field, so this check is always valid
    if (dbUser.tokenVersion !== tokenVersion) {
      const isProdVer = process.env.NODE_ENV === 'production';
      res.clearCookie('refreshToken', { httpOnly: true, secure: isProdVer, sameSite: isProdVer ? 'none' : 'lax', path: '/' });
      return res.status(401).json({ message: 'Session invalidated. Please log in again.' });
    }

    // Issue new access token (only spread collegeId if it exists)
    const accessPayload = { userId, role, email: dbUser.email };
    if (collegeId) accessPayload.collegeId = collegeId;

    const newAccessToken = jwt.sign(
      accessPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
    );

    const responseBody = { accessToken: newAccessToken, user: userData, role };
    if (collegeId) responseBody.collegeId = collegeId;

    return res.json(responseBody);
  } catch (err) {
    console.error('[refresh] Error:', err);
    // Do NOT clear the cookie on a generic server error (DB timeout, crash, etc.)
    // Only clear it on definitive auth failures (handled above with 401 responses).
    return res.status(500).json({ message: 'Server error' });
  }
}


/* ─── POST /api/auth/logout ───────────────────────────────────────── */
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

module.exports = { refresh, logout };
