<div align="center">

<img src="https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
<img src="https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white" />
<img src="https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-Active-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Redis-Active-DC382D?style=for-the-badge&logo=redis&logoColor=white" />

<br/>

# 🎓 CampusConnect

### *The Secure, Multi-Tenant Peer-to-Peer Commerce & DRM Platform for Universities*

**An enterprise-grade, high-performance SaaS marketplace allowing verified university students to buy, sell, and securely monetize digital study materials and physical resources.**

<br/>

[🌐 **Live Production**](https://frontend-two-gray-85.vercel.app) &nbsp;·&nbsp; [📋 Technical Architecture](./production_artifacts/Project_Overview.md) &nbsp;·&nbsp; [⚡ System Specifications](./production_artifacts/Project_Overview.md)

</div>

---

## 🚀 Executive Summary

**CampusConnect** is a proprietary multi-tenant peer-to-peer SaaS platform engineered to solve the safety and copyright leakage problems inherent in university-level commerce. 

Unlike generic classified sites, CampusConnect provides:
* 🔒 **Cryptographically Isolated Multi-Tenancy**: Complete network and database separation at the institution level. Students can only trade and converse with authenticated peers within their specific university domain.
* 🛡️ **Proprietary DRM Engine**: A custom-built security pipeline that renders digital intellectual property (PDFs, lectures, documents) on a secured HTML5 Canvas—preventing raw file access, print commands, downloads, and screen captures.
* 💳 **Built-in Monetization & Escrow**: An integrated multi-tier payment infrastructure supporting flat listing fees and buyer platform fees, backed by structured seller payout ledgers and safety cooling periods.

---

## ✨ Core Product Features

### 1. Student Commerce & Digital Rights Management (💙 Student Panel)
* **Domain-Verified Onboarding**: Dynamic registration pipeline checking student email domains against university registers (e.g., `@university.edu`) prior to tenant onboarding.
* **Secure Document Rendering**: Interactive study notes and slides are processed in-memory as buffers, projecting directly to a custom HTML5 canvas to defeat DevTools inspections, inspect-element URL sniffing, and standard download options.
* **Active Screen/Capture Blocking**: Real-time event hooks that intercept screen-recording software (OBS, ShareX) and screenshot utilities (Windows Snipping Tool). Detecting focus loss blackouts the viewer instantly.
* **Hardware Interception & Clipboard Sanitization**: Hooks that block right-clicks, selection, copying, `Ctrl+P` (printing), and `Ctrl+S` (saving). Intercepting the `PrintScreen` key triggers an instant layout wipe and replaces the OS clipboard with security symbols (`🔒`).
* **Dynamic Digital Watermarking**: Diagonally prints transaction metadata (buyer ID, buyer IP, email, and timestamp) in rotating opacity positions to neutralize external camera recording.
* **Interactive Negotiation Inbox**: Real-time bidding and communication channels driven by `Socket.io` websockets. Includes custom transaction status tracking (Negotiating, Sold, Completed, Cancelled) and unread notification alerts.

### 2. Moderation & Native Advertising (💚 College Admin Panel)
* **Onboarding Moderation**: Administrative queue to vet student enrollment numbers and verify pending campus profiles.
* **Dynamic Listing Control**: Moderation systems for flag reviews, inappropriate content filtering, and active listings management.
* **Campus Revenue Analytics**: Real-time dashboard charting transaction counts, total local listing fees, platform commission cuts, and active user metrics.
* **Self-Serve Advertising Layer**: Native banner and listing promotion systems. Enables admins to schedule local ad campaigns and tracks ad impressions, click metrics, and CTR (Click-Through-Rate) statistics automatically.

### 3. Network Infrastructure Management (💛 Master Admin Panel)
* **Tenant Provisioning**: Simple UI for onboarding new universities, mapping approved domains, and assigning initial configurations.
* **Global Fee Controls**: Live configurations managing global seller listing fees, checkout processing rates, and payout release cooling periods.
* **Platform Audit & Compliance**: System-wide access to search audit trails, manage system bans, and instantly blacklist bad actors across all colleges.

### 4. Advanced System & Infrastructure Implementations
* **Escrow Ledger & Wallet Services**: Dual-tier transaction fee splitting. Integrated Razorpay processing charges listing fees from sellers and transactions fees from buyers, routing payouts through an automated ledger with customizable cooling releases (e.g., 7-day dispute window).
* **Multi-Format Asset Pipeline**: Optimized file handlers utilising Multer buffers to process and cache multi-format items (images up to 10 files, videos up to 5, and PDF guides up to 10). Private files are securely kept in Cloudflare R2 / AWS S3 buckets and accessed using 15-minute time-locked presigned tokens.
* **Double-Guard Session Security**: Clean JWT structure combining short-lived Access Tokens (15-min expiry) with sliding-window, HTTP-only Refresh Cookies (7-day expiry). Verified dynamically against version indices stored in a Redis cache, enabling rapid global logouts and session terminations.


---

## 🏗️ Technical Architecture

```
                                   +--------------------------------------------------------+
                                   |                      CLIENT LAYER                      |
                                   |                                                        |
                                   |   +----------------+  +----------------+  +--------+   |
                                   |   |  Student App   |  | Col Admin App  |  | Master |   |
                                   |   |   (Blue 💙)    |  |   (Green 💚)   |  | (Gold) |   |
                                   |   +-------+--------+  +-------+--------+  +----+---+   |
                                   +-----------|-------------------|----------------|-------+
                                               | HTTPS             |                |
                                               |                   v                |
                                   +-----------v------------------------------------v-------+
                                   |                 NGINX GATEWAY / RATE LIMITER           |
                                   +-------------------------------|------------------------+
                                                                   v
                                   +--------------------------------------------------------+
                                   |             EXPRESS.JS REST API BACKEND SERVER         |
                                   |                                                        |
                                   |   /api/auth   /api/marketplace   /api/admin  /api/etc  |
                                   +------|-------------|-------------|-------------|-------+
                                          |             |             |             |
                         +---------------+             |             |             +---------------+
                         |                             v             v                             |
                         v                       +-----------+ +-----------+                       v
                  +------------+                 | Cloudflare| |  Socket.  |                +-------------+
                  | PostgreSQL |                 |   R2 / S3 | |   IO Web  |                |    Redis    |
                  |  (Prisma)  |                 |  (Private)| |  Sockets  |                | (Token ver/ |
                  +------------+                 +-----------+ +-----------+                |   Cache)    |
                                                                                            +-------------+
```

### Key Technical Specs
* **Frontend**: Next.js `16.2.4` (App Router, Turbopack) built with TypeScript `5.x`, Zustand `5.0.x` persistent stores, and Tailwind CSS `4.x`.
* **Backend**: Asynchronous Node.js & Express.js REST API with Redis `5.10.x` handling active token version checks, API rate limiting, and temporary state caches.
* **Database & ORM**: Prisma `6.19.x` powering PostgreSQL database schemas with multi-tenant key index designs.
* **Media & Assets**: Secured Cloudflare R2 object storage utilizing short-lived (15-min TTL) presigned URLs for media security.
* **Real-Time Communication**: Socket.io for instantaneous student negotiation threads.

---

## 🗄️ Multi-Tenant Domain Schema

Every resource maps to a specific college instance to guarantee database level multi-tenancy.

```mermaid
erDiagram
    College ||--o{ Student : "has"
    College ||--o{ Admin : "manages"
    College ||--o{ Product : "contains"
    Student ||--o{ Product : "sells"
    Student ||--o{ Order : "buys/sells"
    Product ||--|| ListingPayment : "requires"
    Product ||--o{ BuyRequest : "receives"
    BuyRequest ||--|| ChatThread : "initiates"
    ChatThread ||--o{ ChatMessage : "holds"
    MasterAdmin ||--o{ AuditLog : "tracks"
```

---

## ⚙️ Setup & Development Guide

### Prerequisites
* **Node.js** v18+
* **npm** v9+
* **PostgreSQL** & **Redis** active instances

### 1. Database & Environment Configuration

Navigate to the `backend/` directory:
```bash
cd backend
npm install
```

Create a `.env` configuration:
```env
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database & Caching
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/campusconnect?schema=public"
REDIS_URL="redis://localhost:6379"

# Security & Tokens
JWT_SECRET="CC_Sec_Key_Student_2026_#"
JWT_REFRESH_SECRET="CC_Sec_Refresh_Student_2026_$"
BCRYPT_ROUNDS=12

# Mailer Gateway
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Initial Master Admin Credentials
MASTER_EMAIL=admin@campusconnect.in
MASTER_PASSWORD=MasterAdmin@2024!
```

### 2. Database Initialization
```bash
# Push schemas & apply PostgreSQL indexing
npx prisma db push

# Generate optimized Prisma Engine
npx prisma generate

# Seed the master tenant configurations
node seed.js
```
> The database seed generates a default Sandbox College tenant (`demo.edu`, access code `DEMO2024`) and sets up the primary Master Admin (`admin@campusconnect.in`).

### 3. Booting Servers

**Start Backend Service:**
```bash
npm run dev
```

**Start Next.js Client App:**
In a separate terminal, navigate to `frontend/`:
```bash
cd frontend
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Run Next.js with Turbopack:
```bash
npm run dev
```

Open `http://localhost:3000` to launch the platform locally.

---

## 👥 Co-Founders & Core Engineers

* **Jevin** — Co-Founder & Lead Engineer — [@Jevin2005](https://github.com/Jevin2005)
* **Varun** — Co-Founder & Lead Architect

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
