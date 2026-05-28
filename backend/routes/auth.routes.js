/**
 * Auth Routes
 * All routes: /api/auth/*
 */

const express = require('express');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const studentController = require('../controllers/student.auth.controller');
const adminController   = require('../controllers/admin.auth.controller');
const masterController  = require('../controllers/master.auth.controller');
const sharedController  = require('../controllers/shared.auth.controller');
const authMiddleware    = require('../middleware/auth.middleware');

const router = express.Router();

/* ─── Rate limiters ───────────────────────────────────────────────── */

// Student registration: max 3 attempts per IP per 10 min
const studentRegisterLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => ipKeyGenerator(req),
  message: { message: 'Too many registration attempts. Please wait 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Student password login: max 5 per email per 15 min
const studentLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    if (req.body?.email) return req.body.email.trim().toLowerCase();
    return ipKeyGenerator(req);
  },
  message: { message: 'Too many login attempts. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Student OTP send: max 3 per email per 15 min
const sendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => {
    if (req.body?.email) return req.body.email.trim().toLowerCase();
    return ipKeyGenerator(req);
  },
  message: { message: 'Too many OTP requests. Please wait 15 minutes before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Student OTP verify: max 5 per email per 15 min
const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    if (req.body?.email) return req.body.email.trim().toLowerCase();
    return ipKeyGenerator(req);
  },
  message: { message: 'Too many verification attempts. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin login: max 5 per IP per 15 min
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => ipKeyGenerator(req),
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Master login: max 3 per IP per 30 min (stricter)
const masterLoginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => ipKeyGenerator(req),
  message: { message: 'Too many login attempts. Please try again in 30 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});


/* ─── Student Auth Routes ──────────────────────────────────────────── */

// Registration (new: any email + college code + password)
router.post('/student/register', studentRegisterLimiter, studentController.register);
router.post('/student/register/verify', verifyOtpLimiter, studentController.verifyRegisterOtp);
router.post('/student/register/resend', sendOtpLimiter, studentController.resendRegisterOtp);

// Password login (new primary login method)
router.post('/student/login', studentLoginLimiter, studentController.login);

// OTP login (optional / passwordless alternative)
router.post('/student/send-otp', sendOtpLimiter, studentController.sendOtp);
router.post('/student/verify-otp', verifyOtpLimiter, studentController.verifyOtp);

// Approval status poll (for pending-approval page)
router.get('/student/approval-status', studentController.checkApprovalStatus);


/* ─── Admin Auth Routes ────────────────────────────────────────────── */
router.get('/admin/check-code', adminController.checkCollegeCode);
router.post('/admin/register', adminController.register);
router.post('/admin/register/verify', adminController.verifyRegisterOtp);
router.post('/admin/register/resend', adminController.resendRegisterOtp);
router.post('/admin/login', adminLoginLimiter, adminController.login);
router.post('/admin/logout', adminController.logout);


/* ─── Master Auth Routes ───────────────────────────────────────────── */
router.post('/master/login', masterLoginLimiter, masterController.login);
router.post('/master/logout', authMiddleware, masterController.logout);


/* ─── Shared Routes ────────────────────────────────────────────────── */
router.post('/refresh', sharedController.refresh);
router.post('/logout', sharedController.logout);

module.exports = router;
