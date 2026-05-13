# CampusConnect Auth System — Full Audit & Fix Report

## 🐛 Bugs Found & Fixed

| # | File | Bug | Fix Applied |
|---|------|-----|-------------|
| 1 | `redis.service.js` | `lazyConnect: true` meant Redis never connected until first command — errors were silent and caused cascading failures | Removed `lazyConnect`, added `enableOfflineQueue: false` for instant fail feedback |
| 2 | `student.auth.controller.js` | `sendOtpEmail` was `await`-ed without a try/catch around it — if email failed, the request crashed with a 500 but OTP was already stored. In dev, email errors were completely swallowed | Wrapped in try/catch: In **dev**, email failure is non-fatal (OTP printed to console). In **production**, email failure returns a proper 503 error |
| 3 | `student.auth.controller.js` | OTP was logged to console AFTER email was sent — if email failed mid-way, you'd never see the dev OTP | Moved console log to BEFORE email send, so dev OTP is always visible |
| 4 | `shared.auth.controller.js` | `tokenVersion` check used `!== undefined &&` which could allow a `tokenVersion: 0` mismatch to pass through | Removed the `undefined` guard — all three models have `tokenVersion`, so direct comparison is safe |
| 5 | `shared.auth.controller.js` | New access token always included `collegeId` even for `MASTER_ADMIN` where it's `null` — this put a null field in every downstream JWT decode | Changed to only include `collegeId` in the payload when it actually exists |
| 6 | `shared.auth.controller.js` | No validation of the `role` field from the refresh token — an invalid role would silently return "User not found" | Added explicit `else { return 401 Invalid token role }` guard |
| 7 | `server.js` | No startup check for required env vars — server would start and crash cryptically mid-request if `JWT_SECRET` was missing | Added `REQUIRED_ENV` check that exits with a clear error message before the server even starts |
| 8 | `server.js` | No `prisma.$disconnect()` on shutdown — Prisma connections leak on every `nodemon` restart | Added `SIGINT`/`SIGTERM` handlers that cleanly disconnect Prisma |

---

## ✅ Structured Auth Setup Guide (Do This Once)

### Step 1: Prepare Your `.env`

Your `.env` should look like this (replace placeholder values):

```env
PORT=5000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/campusconnect"

# Generate these with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=<generated_64char_hex>
JWT_REFRESH_SECRET=<different_generated_64char_hex>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

REDIS_URL=redis://localhost:6379

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.gmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx   # Gmail App Password (16 chars)
EMAIL_FROM=your.gmail@gmail.com

MASTER_EMAIL=admin@campusconnect.in
MASTER_PASSWORD=YourStrongPassword!

BCRYPT_ROUNDS=12
FRONTEND_URL=http://localhost:3000
```

### Step 2: Run Migrations + Seed

```bash
cd backend

# Push schema to database
npx prisma migrate dev --name init

# Seed the MasterAdmin account + Demo College
npm run seed
```

> **What seed creates:**
> - MasterAdmin: `admin@campusconnect.in` / your `MASTER_PASSWORD`
> - Demo College code: `DEMO2024`, email domain: `@demo.edu`

### Step 3: Start the Server

```bash
npm run dev
```

You should see:
```
🚀 CampusConnect API running on http://localhost:5000
[Redis] Connected successfully
```

If Redis is not running, you'll see a warning but the server still works using in-memory OTP fallback.

---

## 🔐 Auth Flow — Step by Step

### Flow A: Master Admin Login

```
POST /api/auth/master/login
Body: { "email": "admin@campusconnect.in", "password": "YourStrongPassword!" }

Response: { accessToken, master: { id, name, email } }
+ Cookie: refreshToken (HTTP-only, 7 days)
```

### Flow B: College Admin Registration + Login

```
# 1. Register your college
POST /api/auth/admin/register
Body: {
  "collegeName": "My College",
  "emailDomain": "mycollege.edu",
  "collegeCode": "MYC2024",
  "city": "Mumbai",
  "collegeType": "Engineering",
  "adminName": "John Doe",
  "adminEmail": "john@mycollege.edu",
  "password": "StrongPass123!"
}
→ Status: 201, Registration submitted for review

# 2. Master Admin must approve the college (via Master panel)
#    Once approved, admin gets an approval email

# 3. Login
POST /api/auth/admin/login
Body: { "email": "john@mycollege.edu", "collegeCode": "MYC2024", "password": "StrongPass123!" }
→ Response: { accessToken, admin: { id, name, collegeId, collegeName } }
```

### Flow C: Student OTP Login

```
# 1. Send OTP (email must match a registered + approved college's emailDomain)
POST /api/auth/student/send-otp
Body: { "email": "student@demo.edu" }
→ In DEV: Check backend terminal for the OTP (no email required)
→ In PROD: OTP sent to email

# 2. Verify OTP
POST /api/auth/student/verify-otp
Body: { "email": "student@demo.edu", "otp": "123456" }

# First-time login → Student created, returns: { status: "PENDING" }
# Admin must approve the student from the Admin panel

# After approval, on next verify/status check:
→ Returns: { status: "APPROVED", accessToken, user: { ... } }

# 3. Poll for approval status (call this from frontend while showing "waiting" screen)
GET /api/auth/student/approval-status?email=student@demo.edu
```

### Flow D: Token Refresh (All Roles)

```
# When accessToken expires (15min), call this automatically from frontend
POST /api/auth/refresh
# No body needed — refreshToken cookie is sent automatically

→ Returns: { accessToken (new), user, role }
```

### Flow E: Logout

```
POST /api/auth/logout
# Or role-specific:
POST /api/auth/admin/logout
POST /api/auth/master/logout

→ Clears refreshToken cookie
```

---

## 🧪 Quick Test Checklist (Postman)

- [ ] `GET /api/health` → `{ status: "ok" }`
- [ ] `POST /api/auth/master/login` → gets `accessToken` + `refreshToken` cookie
- [ ] `POST /api/auth/refresh` (with cookie) → gets new `accessToken`
- [ ] `POST /api/auth/student/send-otp` with `student@demo.edu` → see OTP in terminal
- [ ] `POST /api/auth/student/verify-otp` with that OTP → `{ status: "PENDING" }`
- [ ] Hit send-otp 4 times rapidly → `429 Too Many Requests`
- [ ] `POST /api/auth/logout` → refreshToken cookie cleared
