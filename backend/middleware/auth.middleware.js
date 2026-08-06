/**
 * Auth Middleware
 * Extracts and verifies the Bearer token from:
 *   1. Authorization: Bearer <token>  header  (primary — all API calls)
 *   2. ?token=<token>                  query   (fallback — for <video src> / <img src>
 *                                               which cannot send custom headers)
 *
 * Attaches decoded payload to req.user.
 */

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  // 1. Try Authorization header (all normal API calls)
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    // 2. Fallback: ?token= query param (used by <video src=".../file?token=xxx">)
    //    This is intentionally limited to streaming/file routes only — do not expose
    //    this pattern to mutation endpoints.
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    // Normalize: JWT payload uses `userId`, marketplace controllers use `req.user.id`
    if (!req.user.id && req.user.userId) {
      req.user.id = req.user.userId;
    }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = authMiddleware;
