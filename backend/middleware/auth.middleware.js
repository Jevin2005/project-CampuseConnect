/**
 * Auth Middleware
 * Extracts and verifies the Bearer token from Authorization header.
 * Attaches decoded payload to req.user.
 */

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

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
