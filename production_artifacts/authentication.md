You are a senior full-stack engineer implementing the complete authentication 
system for CampusConnect — a multi-tenant college marketplace platform.

═══════════════════════════════════════════════════════════
CONTEXT
═══════════════════════════════════════════════════════════

The project already has:
- Complete UI pages built in Next.js 14 (App Router) + TypeScript
- Three panels: Student (blue), College Admin (green), Master Admin (gold)
- Prisma schema with College, Admin, Student, Product, Order models
- Folder structure as defined in the Technical Specification

YOUR JOB:
Implement ONLY the authentication logic — backend + frontend wiring.
DO NOT touch any UI/styling/design. Zero visual changes.
All existing pages should look identical — only functionality is added.

═══════════════════════════════════════════════════════════
TECH STACK TO USE (STRICTLY)
═══════════════════════════════════════════════════════════

Backend:
  - jsonwebtoken       → sign/verify access + refresh tokens
  - bcryptjs           → hash passwords (salt rounds: 12)
  - cookie-parser      → parse HTTP-only refresh token cookie
  - express-rate-limit → brute force protection
  - ioredis            → OTP storage + session blacklist
  - nodemailer         → OTP email sender
  - @sendgrid/mail     → production email delivery

Frontend:
  - zustand            → auth state store (token + user + role)
  - axios              → API calls + interceptor for token refresh
  - next/middleware    → route protection per panel group
  - js-cookie          → read client-accessible tokens if needed

DO NOT USE:
  - NextAuth / Auth.js
  - Passport.js
  - Clerk, Supabase Auth, Firebase Auth
  - Any OAuth provider

═══════════════════════════════════════════════════════════
JWT CONFIGURATION
═══════════════════════════════════════════════════════════

Access Token:
  payload: { userId, role, collegeId, email }
  secret:  process.env.JWT_SECRET
  expiry:  '15m'

Refresh Token:
  payload: { userId, role, tokenVersion }
  secret:  process.env.JWT_REFRESH_SECRET
  expiry:  '7d'
  storage: HTTP-only cookie (secure, sameSite: strict)

Token Version:
  Add tokenVersion: Int @default(0) to Student and Admin models in Prisma.
  Increment on password change or account suspension to instantly 
  invalidate all existing sessions.

Access Token Storage (Frontend):
  Store ONLY in Zustand memory (never localStorage, never sessionStorage).
  On page refresh → silently call /api/auth/refresh using the HTTP-only 
  cookie to restore the access token.

═══════════════════════════════════════════════════════════
PANEL 1 — STUDENT AUTHENTICATION
═══════════════════════════════════════════════════════════

FLOW:
  Step 1 — Enter enrollment email on S1 (Student Login Page)
  Step 2 — OTP sent to that email via Nodemailer/SendGrid
  Step 3 — Enter OTP on S2 (OTP Verification Page)
  Step 4 — If student doesn't exist → create account (isApproved: false)
           → redirect to S3 (Pending Approval Page)
  Step 5 — If student exists + isApproved: true → issue JWT → enter marketplace
  Step 6 — If student exists + isApproved: false → redirect to S3

BACKEND ROUTES TO BUILD:
  POST /api/auth/student/send-otp
    - Validate email domain matches a registered college domain
    - Generate 6-digit OTP
    - Hash OTP with bcrypt, store in Redis: key=otp:{email}, TTL=600s
    - Send OTP email via Nodemailer
    - Response: { message: "OTP sent", maskedEmail }

  POST /api/auth/student/verify-otp
    - Retrieve hashed OTP from Redis
    - Compare with bcrypt
    - Delete OTP from Redis (one-time use)
    - If student doesn't exist → create Student record (isApproved: false)
      → return { status: "PENDING" }
    - If student exists + isApproved: false → return { status: "PENDING" }
    - If student exists + isApproved: true → issue tokens
      → set refresh token cookie
      → return { status: "APPROVED", accessToken, user }

  POST /api/auth/refresh
    - Read refresh token from HTTP-only cookie
    - Verify JWT signature + check tokenVersion matches DB
    - Issue new access token
    - Return { accessToken }

  POST /api/auth/logout
    - Clear refresh token cookie
    - Return { message: "Logged out" }

REDIS OTP PATTERN:
  Store:  redis.setex(`otp:${email}`, 600, await bcrypt.hash(otp, 10))
  Verify: const stored = await redis.get(`otp:${email}`)
          bcrypt.compareSync(inputOtp, stored)
  Delete: redis.del(`otp:${email}`)

RATE LIMITING:
  /api/auth/student/send-otp → max 3 requests per email per 15 minutes
  /api/auth/student/verify-otp → max 5 attempts per email per 15 minutes

FRONTEND WIRING:
  S1 (Login Page):
    - On "Send OTP" button click → POST /api/auth/student/send-otp
    - Show loading spinner on button during request
    - On success → navigate to /otp (pass email via sessionStorage or 
      zustand temp state, NOT in URL)
    - On error (invalid domain) → show inline error below email input
      (style already exists — just populate the error state)

  S2 (OTP Page):
    - Display masked email from previous step
    - On OTP complete (all 6 boxes filled) or "Verify" click 
      → POST /api/auth/student/verify-otp
    - If status === "PENDING" → navigate to /pending
    - If status === "APPROVED" → save accessToken + user to Zustand 
      → navigate to /marketplace
    - Countdown timer: 4:00 minutes, on expire enable "Resend OTP" 
      which re-calls send-otp endpoint
    - Wrong OTP: shake animation on OTP boxes + red border 
      (use existing error state in UI)

  S3 (Pending Page):
    - No auth required to view this page
    - Show student's email in the info card
    - Poll GET /api/auth/student/approval-status every 30 seconds
    - If approved → auto-redirect to /marketplace with success toast

═══════════════════════════════════════════════════════════
PANEL 2 — COLLEGE ADMIN AUTHENTICATION
═══════════════════════════════════════════════════════════

FLOW:
  Registration (A2):
    Admin fills 2-step form → POST to register endpoint
    → creates Admin record (isApproved: false)
    → creates College record (isApproved: false)
    → Master Admin sees request in M3 panel
    → On approval: both Admin + College set to isApproved: true
    → Admin receives approval email

  Login (A1):
    Admin enters email + college code + password
    → verify credentials + check isApproved
    → issue JWT with role: "COLLEGE_ADMIN"

BACKEND ROUTES TO BUILD:
  POST /api/auth/admin/register
    - Validate college code is unique
    - Validate email domain
    - Hash password with bcrypt (rounds: 12)
    - Create College record (isApproved: false)
    - Create Admin record linked to college (isApproved: false)
    - Send confirmation email to admin
    - Notify master admin (email or push notification)
    - Return { message: "Registration submitted for review" }

  POST /api/auth/admin/login
    - Find admin by email
    - Verify college code matches admin's college
    - bcrypt.compare(password, admin.password)
    - Check isApproved: true (else return 403 with pending message)
    - Issue access token + refresh token cookie
    - Return { accessToken, admin: { id, name, email, collegeId, collegeName } }

  POST /api/auth/admin/logout
    - Clear refresh token cookie

RATE LIMITING:
  /api/auth/admin/login → max 5 attempts per IP per 15 minutes

FRONTEND WIRING:
  A1 (Admin Login):
    - On "Enter Admin Panel" click → POST /api/auth/admin/login
    - Loading state on button
    - Success → save to Zustand → navigate to /admin/dashboard
    - 403 (not approved) → show orange info card: 
      "Your registration is under review" (card already exists in UI)
    - 401 (wrong credentials) → show error below password field

  A2 (Admin Registration):
    - Step 1 form → validate college code uniqueness on blur 
      (GET /api/auth/admin/check-code?code=MIT2024)
    - Step 2 form → password strength bar already in UI, 
      wire it to check: length, uppercase, number, special char
    - On final submit → POST /api/auth/admin/register
    - Success → show success card: "Submitted! You'll hear back in 24-48hrs"
    - Navigate to /admin/login after 3 seconds

═══════════════════════════════════════════════════════════
PANEL 3 — MASTER ADMIN AUTHENTICATION
═══════════════════════════════════════════════════════════

FLOW:
  Single pre-seeded master admin account (no registration flow).
  Created via seed.js — never via API.
  Login with email + password only.

BACKEND ROUTES TO BUILD:
  POST /api/auth/master/login
    - Find master admin by email in MasterAdmin table
    - bcrypt.compare(password, masterAdmin.password)
    - Issue access token (role: "MASTER_ADMIN", no collegeId)
    - Set refresh token HTTP-only cookie
    - Log login attempt (IP + timestamp) to audit log
    - Return { accessToken, master: { id, name, email } }

  POST /api/auth/master/logout
    - Clear cookie
    - Log logout

RATE LIMITING:
  /api/auth/master/login → max 3 attempts per IP per 30 minutes
  (stricter than other panels — master has full platform control)

SEED SCRIPT (backend/seed.js):
  Create one MasterAdmin record:
  {
    email: process.env.MASTER_EMAIL,
    password: await bcrypt.hash(process.env.MASTER_PASSWORD, 12),
    name: "Platform Admin"
  }

FRONTEND WIRING:
  M1 (Master Login):
    - On "Sign In" click → POST /api/auth/master/login
    - Loading state on gold button
    - Success → save to Zustand → navigate to /master/dashboard
    - Error → show red error below password field
    - All login attempts visible in audit log on M2 dashboard

═══════════════════════════════════════════════════════════
SHARED AUTH MIDDLEWARE (Backend)
═══════════════════════════════════════════════════════════

Create these middleware files:

1. backend/middleware/auth.middleware.js
   - Extract Bearer token from Authorization header
   - jwt.verify(token, process.env.JWT_SECRET)
   - Attach decoded payload to req.user
   - Return 401 if missing or invalid

2. backend/middleware/role.middleware.js
   - checkRole(...allowedRoles) factory function
   - Compare req.user.role against allowedRoles
   - Return 403 if not authorized

3. backend/middleware/college.middleware.js
   - For COLLEGE_ADMIN: verify req.params.collegeId === req.user.collegeId
   - For STUDENT: verify target resource's collegeId === req.user.collegeId
   - Return 403 if mismatch (tenant isolation enforcement)

Usage example:
  router.get('/admin/dashboard', 
    authMiddleware, 
    checkRole('COLLEGE_ADMIN'),
    collegeMiddleware,
    dashboardController
  )

═══════════════════════════════════════════════════════════
ZUSTAND AUTH STORE (Frontend)
═══════════════════════════════════════════════════════════

Create frontend/store/authStore.ts:

  interface AuthState {
    accessToken: string | null
    user: User | null
    role: 'STUDENT' | 'COLLEGE_ADMIN' | 'MASTER_ADMIN' | null
    collegeId: string | null
    isLoading: boolean
    
    setAuth: (token, user, role, collegeId) => void
    clearAuth: () => void
    setLoading: (bool) => void
  }

  On app boot (layout.tsx):
    - Call GET /api/auth/refresh silently
    - If success → populate store (user was already logged in)
    - If fail → store stays empty (user needs to log in)
    - This is the "persist session across page refresh" mechanism

═══════════════════════════════════════════════════════════
AXIOS INSTANCE + INTERCEPTOR (Frontend)
═══════════════════════════════════════════════════════════

Create frontend/lib/axios.ts:

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true  // send HTTP-only cookie on every request
  })

  // Attach access token to every request
  api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  // Auto-refresh on 401
  api.interceptors.response.use(null, async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      try {
        const { data } = await axios.post('/api/auth/refresh', {}, 
          { withCredentials: true })
        useAuthStore.getState().setAuth(data.accessToken, ...)
        error.config.headers.Authorization = `Bearer ${data.accessToken}`
        return api(error.config)
      } catch {
        useAuthStore.getState().clearAuth()
        redirect to login based on current path
      }
    }
    return Promise.reject(error)
  })

═══════════════════════════════════════════════════════════
NEXT.JS MIDDLEWARE (Route Protection)
═══════════════════════════════════════════════════════════

Create frontend/middleware.ts:

  Rules:
  - /marketplace, /product/*, /viewer/*, /sell/*, 
    /my-listings, /my-purchases, /profile
    → require role: STUDENT

  - /admin/dashboard, /admin/requests, /admin/products,
    /admin/advertisements, /admin/revenue, /admin/settings
    → require role: COLLEGE_ADMIN

  - /master/dashboard, /master/colleges, /master/revenue,
    /master/settings, /master/students, /master/college-requests
    → require role: MASTER_ADMIN

  - /login, /otp, /pending, /admin/login, /admin/register,
    /master/login, /, /how-it-works, /contact
    → public (no auth required, but redirect if already logged in)

  Implementation:
    - Read access token from cookie (or call refresh endpoint)
    - Decode role from token
    - Redirect to correct login page if unauthorized
    - Redirect to correct dashboard if already logged in and 
      trying to access login page

═══════════════════════════════════════════════════════════
ENVIRONMENT VARIABLES
═══════════════════════════════════════════════════════════

Backend (.env):
  JWT_SECRET=your_strong_random_secret_256bit
  JWT_REFRESH_SECRET=your_different_strong_secret_256bit
  JWT_ACCESS_EXPIRY=15m
  JWT_REFRESH_EXPIRY=7d
  REDIS_URL=redis://localhost:6379
  SENDGRID_API_KEY=your_sendgrid_key
  EMAIL_FROM=noreply@campusconnect.in
  MASTER_EMAIL=admin@campusconnect.in
  MASTER_PASSWORD=your_secure_master_password
  BCRYPT_ROUNDS=12

Frontend (.env.local):
  NEXT_PUBLIC_API_URL=http://localhost:5000

═══════════════════════════════════════════════════════════
IMPLEMENTATION ORDER
═══════════════════════════════════════════════════════════

Follow this exact order to avoid dependency issues:

1. Update Prisma schema → add tokenVersion to Student + Admin
2. Run prisma migrate dev
3. Install all backend packages
4. Create Redis + email service files
5. Build auth middleware (auth + role + college)
6. Build auth routes + controllers (student → admin → master)
7. Run seed.js to create master admin
8. Install frontend packages
9. Create Zustand auth store
10. Create axios instance with interceptors
11. Wire S1 + S2 + S3 pages (student auth)
12. Wire A1 + A2 pages (admin auth)
13. Wire M1 page (master auth)
14. Implement Next.js middleware (route protection)
15. Test all 3 flows end-to-end

═══════════════════════════════════════════════════════════
CRITICAL RULES
═══════════════════════════════════════════════════════════

✅ DO:
  - Keep all existing UI, styling, and layout 100% unchanged
  - Use existing button, input, error state elements already in pages
  - Wire onClick/onSubmit handlers to existing buttons
  - Populate existing error/success UI states with real data
  - Use existing loading spinner/skeleton components for async states

❌ DO NOT:
  - Add new UI components or change any styles
  - Use localStorage or sessionStorage for tokens
  - Use any third-party auth library (NextAuth, Passport, Clerk)
  - Create new pages — only add logic to existing ones
  - Store raw passwords anywhere (always bcrypt hash)
  - Skip rate limiting on any auth endpoint