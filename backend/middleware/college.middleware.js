/**
 * College Middleware
 * Enforces multi-tenant isolation:
 * - COLLEGE_ADMIN: req.params.collegeId must match req.user.collegeId
 * - STUDENT: target resource's collegeId must match req.user.collegeId
 */

function collegeMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { role, collegeId: userCollegeId } = req.user;

  if (role === 'COLLEGE_ADMIN') {
    const paramCollegeId = req.params.collegeId;
    // If a collegeId param is provided, it must match the admin's college
    if (paramCollegeId && paramCollegeId !== userCollegeId) {
      return res.status(403).json({ message: 'Access denied: wrong college' });
    }
  }

  if (role === 'STUDENT') {
    // The resource's collegeId (set on req by previous middleware) must match
    if (req.resourceCollegeId && req.resourceCollegeId !== userCollegeId) {
      return res.status(403).json({ message: 'Access denied: cross-college access' });
    }
  }

  next();
}

module.exports = collegeMiddleware;
