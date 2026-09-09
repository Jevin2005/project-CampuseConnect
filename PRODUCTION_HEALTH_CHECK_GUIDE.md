# 🚀 CampusConnect — Production & Render Health Check Guide

A complete, practical operational manual to monitor, test, and analyze the health of all production services across **Render**, **Vercel**, **Neon PostgreSQL**, **Upstash Redis**, **Cloudflare R2**, **Razorpay**, and **Gmail SMTP**.

---

## 📑 Table of Contents
1. [Quick Access Endpoints](#1-quick-access-endpoints)
2. [Render Backend Live Checking Commands](#2-render-backend-live-checking-commands)
   - [PowerShell Commands](#powershell-windows)
   - [cURL / Bash Commands](#curl--bash)
   - [Node.js Fast Script](#nodejs-one-liner)
3. [Production Smoke Test Commands](#3-production-smoke-test-commands)
4. [How to Analyze Each Platform Dashboard](#4-how-to-analyze-each-platform-dashboard)
   - [A. Render (Backend Web Service)](#a-render-backend)
   - [B. Vercel (Frontend Next.js App)](#b-vercel-frontend)
   - [C. Neon Console (PostgreSQL Cloud)](#c-neon-console-postgresql)
   - [D. Upstash Console (Redis Cache & Queue)](#d-upstash-console-redis)
   - [E. Cloudflare R2 (Media & Document Storage)](#e-cloudflare-r2-storage)
   - [F. Razorpay Dashboard (Payments Gateway)](#f-razorpay-dashboard)
   - [G. Gmail SMTP (Email & OTP Delivery)](#g-gmail-smtp-email-delivery)
5. [Troubleshooting Matrix (Error Codes & Fixes)](#5-troubleshooting-matrix)

---

## 1. Quick Access Endpoints

| Endpoint | Target URL | Expected Output | Purpose |
|---|---|---|---|
| **System Status** | [`/api/system-status`](https://project-campuseconnect.onrender.com/api/system-status) | HTTP 200 (JSON) | Live latency & health of DB, Redis, R2, Razorpay, Nodemailer |
| **Database Status** | [`/api/db-status`](https://project-campuseconnect.onrender.com/api/db-status) | HTTP 200 (JSON) | Table record counts + Env keys presence check |
| **Health Ping** | [`/api/health`](https://project-campuseconnect.onrender.com/api/health) | HTTP 200 (`status: "ok"`) | Basic uptime check used by Render health monitor |
| **Marketplace Feed**| [`/api/marketplace/products`](https://project-campuseconnect.onrender.com/api/marketplace/products) | HTTP 200 (Array) | Public active product catalog check |

---

## 2. Render Backend Live Checking Commands

### PowerShell (Windows)

#### 1. Full Multi-Service Diagnostic Check
```powershell
Invoke-RestMethod -Uri "https://project-campuseconnect.onrender.com/api/system-status" | ConvertTo-Json -Depth 5
```

#### 2. Database Record Counts & Env Key Check
```powershell
Invoke-RestMethod -Uri "https://project-campuseconnect.onrender.com/api/db-status" | ConvertTo-Json -Depth 4
```

#### 3. Quick Latency & Uptime Ping
```powershell
Measure-Command { $res = Invoke-WebRequest -Uri "https://project-campuseconnect.onrender.com/api/health" }
Write-Host "Status Code: $($res.StatusCode) (Response Time: $($_.TotalMilliseconds) ms)"
```

---

### cURL / Bash

#### 1. Formatted System Status Output
```bash
curl -s https://project-campuseconnect.onrender.com/api/system-status | jq .
```

#### 2. Inspect HTTP Response Headers & Status Code
```bash
curl -i https://project-campuseconnect.onrender.com/api/health
```

#### 3. Test CORS Headers for Vercel Origins
```bash
curl -I -X OPTIONS https://project-campuseconnect.onrender.com/api/marketplace/products \
  -H "Origin: https://project-campuse-connect.vercel.app" \
  -H "Access-Control-Request-Method: GET"
```
*(Verify that `access-control-allow-origin: https://project-campuse-connect.vercel.app` is returned)*

---

### Node.js (One-Liner)

Run this directly from your terminal:
```bash
node -e "fetch('https://project-campuseconnect.onrender.com/api/system-status').then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2))).catch(console.error);"
```

---

## 3. Production Smoke Test Commands

Use these commands to verify key functional flows on the deployed backend:

### Test 1: Fetch Live Marketplace Products
```powershell
Invoke-RestMethod -Uri "https://project-campuseconnect.onrender.com/api/marketplace/products"
```
* **Success:** Returns an array of approved products.
* **Failure:** Returns 500 (check database connection) or empty array.

### Test 2: Check College Code Validation Endpoint
```powershell
Invoke-RestMethod -Uri "https://project-campuseconnect.onrender.com/api/auth/admin/check-code?code=DEMO2024"
```
* **Success:** Returns `{"available": false}` (indicates code is already registered).

### Test 3: Test Student OTP Request Endpoint
```powershell
Invoke-RestMethod -Uri "https://project-campuseconnect.onrender.com/api/auth/student/send-otp" -Method POST -ContentType "application/json" -Body '{"email":"test.student.1788870358248@campus.edu"}'
```
* **Success:** Returns `200` with OTP sent notification.
* **Failure:** Returns `429` (Rate limit working properly) or `500` (SMTP credential issue).

---

## 4. How to Analyze Each Platform Dashboard

### A. Render (Backend)
🔗 **URL:** [https://dashboard.render.com](https://dashboard.render.com)

1. **Service Status:**
   - **Green Badge (Live):** Your service is active and passing the `/api/health` check.
   - **Yellow Badge (Deploying / Building):** Render is running `startup.js` or `npm install`.
   - **Red Badge (Failed):** Server crashed during boot.
2. **Logs Tab (Real-Time Output):**
   - Look for: `🚀 CampusConnect API running on port 5000`.
   - Look for: `[Redis] Connected successfully`.
   - Look for: `✅ MasterAdmin ready` and `✅ Demo College Admin ready`.
   - If you see `EADDRINUSE` or `Missing required environment variables`, check the **Environment** tab.
3. **Environment Tab:**
   - Verify that all 22 required keys (`DATABASE_URL`, `JWT_SECRET`, `REDIS_URL`, `R2_*`, `RAZORPAY_*`, `EMAIL_*`) have NO leading or trailing whitespace.
4. **Events Tab:**
   - View history of auto-deploys, restarts, or memory threshold warnings.
5. **Free Tier Cold Starts:**
   - Services with no incoming traffic sleep after 15 minutes.
   - First request after sleep takes ~30–50 seconds while container allocates resources.

---

### B. Vercel (Frontend)
🔗 **URL:** [https://vercel.com/dashboard](https://vercel.com/dashboard)

1. **Deployments Tab:**
   - Look for status: `Ready` with a green dot.
   - If `Error`: Click on the deployment to read the build log. Look for TypeScript errors or missing packages.
2. **Settings → Environment Variables:**
   - `NEXT_PUBLIC_API_URL`: Must point to `https://project-campuseconnect.onrender.com` (no trailing slash).
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Must be set to your public key `rzp_test_...` (never the secret).
3. **Runtime Logs:**
   - Located under **Project → Logs**.
   - Filters 4xx and 5xx client-side errors and server-side Next.js route handler issues.

---

### C. Neon Console (PostgreSQL)
🔗 **URL:** [https://console.neon.tech](https://console.neon.tech)

1. **Compute Status:**
   - Look for `Active` or `Idle` (Neon auto-suspends inactive databases to conserve usage).
   - Compute auto-resumes within ~500ms on first query.
2. **Connection Pooling vs Direct Connection:**
   - **Connection Pooling (`-pooler` in hostname):** Used for standard app traffic to handle thousands of concurrent queries without connection leaks.
   - **Direct URL:** Used for Prisma CLI migrations.
3. **Tables & Rows:**
   - Under **Tables**, verify core schemas exist: `Student`, `Admin`, `College`, `Product`, `Order`, `ChatMessage`.

---

### D. Upstash Console (Redis)
🔗 **URL:** [https://console.upstash.com](https://console.upstash.com)

1. **Database Status:**
   - Look for status `Active` in your region (`ap-southeast-1` or closest).
2. **Metrics:**
   - **Commands/sec:** Spikes during OTP requests or login bursts.
   - **Memory Usage:** Should typically stay under a few megabytes for session/OTP keys.
3. **Data Browser Tab:**
   - Inspect active keys:
     - `reg-otp:<email>`: 6-digit OTP codes expiring in 10 minutes (TTL 600s).
     - `bull:video-transcode:*`: Video processing queues.
     - `rl:*`: Express rate-limiting buckets.

---

### E. Cloudflare R2 (Storage)
🔗 **URL:** [https://dash.cloudflare.com](https://dash.cloudflare.com) → R2

1. **Bucket Overview (`campusconnect`):**
   - Check storage consumption and object count.
2. **Settings → Public Access:**
   - Public Bucket URL must be **Enabled**.
   - Your configured URL is: `https://pub-4c2c15a46fc84483a25acc1371b0aa08.r2.dev`
3. **CORS Configuration:**
   - In bucket settings under **CORS Policy**, ensure `GET`, `HEAD`, `PUT` are allowed for `*` or your Vercel domains so browsers can stream HLS videos and load DRM PDF blobs.

---

### F. Razorpay Dashboard (Payments)
🔗 **URL:** [https://dashboard.razorpay.com](https://dashboard.razorpay.com)

1. **Mode Indicator:**
   - Look at the top banner: Must show **Test Mode** (orange) during staging, or **Live Mode** (green) in production.
2. **Transactions / Orders:**
   - View recent test payments and orders created by the marketplace checkout flow.
3. **API Keys:**
   - Under **Settings → API Keys**, verify the active `Key ID` matches `RAZORPAY_KEY_ID`.

---

### G. Gmail SMTP (Email Delivery)
🔗 **URL:** [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

1. **App Password Status:**
   - Gmail requires an **App Password** (16 characters, e.g., `xxxx xxxx xxxx xxxx`) generated under 2-Step Verification.
   - Standard Google Account passwords **will not work** and will trigger `535-5.7.8 Username and Password not accepted`.
2. **Daily Quotas:**
   - Standard Gmail accounts have a sending quota of **500 emails/day** (Google Workspace accounts have **2,000 emails/day**).

---

## 5. Troubleshooting Matrix

| Symptom | Probable Cause | Immediate Fix |
|---|---|---|
| **CORS error in browser console** | Origin mismatch with backend | Backend allows `*.vercel.app` dynamically. Ensure URL has `https://` and no trailing slash in frontend config. |
| **Render cold start delay (30–50s)** | Free-tier spin-down | Expected behavior on Render free tier. Use an external uptime monitor (e.g. UptimeRobot) to ping `/api/health` every 10 mins to keep container awake. |
| **Database Connection Timeout (P1001)** | Neon compute sleeping or IP block | Neon resumes in ~500ms. Verify `DATABASE_URL` contains `?sslmode=require`. |
| **Redis Connection Error (ECONNREFUSED)** | Upstash URL incorrect | Backend includes in-memory fallback for OTPs. Check `REDIS_URL` in Render environment settings. |
| **Email Not Arriving (SMTP error)** | Invalid Gmail App Password | Generate a new 16-character App Password at `myaccount.google.com/apppasswords` and update `EMAIL_PASS`. |
| **Frontend 401 on Page Refresh** | Refresh token cookie issue | Axios interceptor handles auto-refresh. Verify `withCredentials: true` is sent and cookie has `SameSite=None; Secure`. |
