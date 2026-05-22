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

### *A Multi-Tenant, Secure Peer-to-Peer College Marketplace with DRM content protection*

**Buy & sell refurbished campus goods and secure digital study materials — exclusively within your university community.**

<br/>

[🌐 **Live Demo**](https://frontend-two-gray-85.vercel.app) &nbsp;·&nbsp; [📋 Technical Spec](./production_artifacts/Technical_Specification.md) &nbsp;·&nbsp; [🐛 Report Bug](https://github.com/Jevin2005/project-CampuseConnect/issues) &nbsp;·&nbsp; [✨ Request Feature](https://github.com/Jevin2005/project-CampuseConnect/issues)

</div>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Multi-Tenant Data Model](#-multi-tenant-data-model)
- [🔒 DRM & Content Protection Deep Dive](#-drm--content-protection-deep-dive)
- [🎨 Design System](#-design-system)
- [🏁 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [🚀 Deployment](#-deployment)
- [👤 Author](#-author)
- [📄 License](#-license)

---

## 🚀 About the Project

**CampusConnect** is a fully functional, high-performance, multi-tenant college marketplace that allows verified students to buy, sell, and monetize digital & physical resources within the safety of their own campus.

Unlike typical general-purpose classified sites, CampusConnect incorporates:
- 🔒 **Total Tenant Isolation**: Strict college-level bounds mapped via custom subdomains/domain filters. A student at one university cannot view listings, request chats, or see transactions from another campus.
- 🎨 **Unified Three-Tier Interface**: A consistent dark-mode experience with color-coded access levels (Blue for Students, Green for College Admins, Gold for Platform Master Admins).
- 🛡️ **Digital Right Management (DRM)**: Advanced client-canvas video/document secure projection blocking downloads, right-clicks, print keys, screen sharing, and Snipping Tool screenshots.
- 💳 **Monetization Safeguards**: Flat one-time listing fees for sellers, plus dynamic percentage-based platform fees collected on student checkout transactions.

---

## ✨ Key Features

### 👨‍🎓 Student panel (Blue Theme 💙)
| Feature | Implementation | Details |
| :--- | :--- | :--- |
| **Verified Registration** | Multi-step Signup | Verification restricts access to students matching college domain lists. Awaits approval by local college admin. |
| **DRM Viewer** | Secured Canvas Projection | Read notes or watch lectures. No raw PDF/video URLs exposed to browser. |
| **Secured Digital Listing** | Structured Uploads | Select physical goods or categorised digital assets (PDF Notes, Video Panels, Bundles). |
| **Instant Buy Requests** | DB-Driven Negotiations | Express interest instantly and open automated messaging chat channels directly with the seller. |
| **Dual Gateway Auth** | Refresh Interceptor | Stay logged in safely across tabs. Automatic token rotation eliminates persistent re-auth requests. |

### 🏫 College Admin Panel (Green Theme 💚)
| Feature | Implementation | Details |
| :--- | :--- | :--- |
| **Student Moderation** | Active Request Queue | Inspect student registration forms, check enrollment codes, approve/reject access. |
| **Market Moderation** | Flagged Items Table | Take down inappropriate, duplicate, or unsafe listings. |
| **Local Revenue Tracking**| Analytical Dashboard | Visual charts charting student transactions, total listing fees collected locally, and active college listings. |
| **Ad Campaigns** | Multi-tier Ads Manager | Create local banner advertisements or coordinate cross-campus sponsored ads. |

### 👑 Master Admin Panel (Gold Theme 💛)
| Feature | Implementation | Details |
| :--- | :--- | :--- |
| **College Provisioning** | University Onboarding | Inspect pending college applications, set specific approved email domains, and configure custom keys. |
| **Dynamic Fee Controls** | Centralized Ledger | Customize one-time digital seller listing fees and customer platform transaction fees globally or per college. |
| **Global Ban Hammer** | Direct User Management | Audit global logs, suspend or permanently ban any bad actor student/admin across all network tenants. |

---

## 🛠️ Tech Stack

### Frontend Architecture
* **Core Framework:** Next.js `16.2.4` (App Router, Turbopack Engine)
* **Language System:** TypeScript `5.x` (Type Safety & Robust Interfaces)
* **Styling Layer:** Tailwind CSS `4.x` (Dynamic Dark-Mode & HSL Palette Variables)
* **Animation Engine:** Framer Motion `12.x` (Fluid Hover states & Canvas View Transitions)
* **State Management:** Zustand `5.0.x` (React Hook stores with persistence)
* **HTTP Client:** Axios (Automatic Bearer Token Injection & Retry Refresh Interceptor on `401 Unauthorized`)

### Backend Architecture
* **Core Framework:** Node.js + Express.js `5.x` (High-Performance Async REST Router)
* **Database ORM:** Prisma `6.19.x` (Strict types, relation queries, and dynamic migrations)
* **Database Engine:** PostgreSQL (Multi-tenant schema with unique key indices)
* **Caching & Security:** Redis `5.10.x` (Auth Token Version validation, rate limiting, and temporary cache storage)
* **Storage Engine:** Cloudflare R2 / AWS S3 (Private assets secured via temporary 15-minute Presigned URLs)
* **Mail Server:** Nodemailer (For secure OTP verification and student onboarding notifications)
* **Payment Integration:** Razorpay (Dual-tier payment structures for listing fees and platform fees)

---

## 🏗️ System Architecture

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

---

## 🗄️ Multi-Tenant Data Model

Every single platform resource maps back to an isolated college database instance. This multi-tenancy model ensures students only view listings, ratings, and messaging channels belonging to their own peers.

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

### Key Models (Prisma Schema Reference)
- `College`: Represents a tenant campus. Enforces specific `emailDomain` limits (e.g. `demo.edu`) and has a unique college `code` (`DEMO2024`).
- `Student`: College-scoped. Owns token versioning fields to force-invalidate active sessions on global logout.
- `Product`: Flagged with type (`physical` or `digital`), subtype (`notes`, `video`, `bundle`), approval status, and listing fee payment indicators.
- `ListingPayment`: Verification transaction for seller onboarding.
- `BuyRequest` & `ChatThread`: Direct peer-to-peer interest mapping with real-time text threads.
- `Order`: Platform ledger logging sales amount, buyer/seller parameters, and verification.

---

## 🔒 DRM & Content Protection Deep Dive

CampusConnect provides robust digital asset locking that blocks piracy, sniffing, and unauthorized redistribution of student study guides, notes, and course lectures.

> [!IMPORTANT]
> The platform's custom PDF and Video viewers prevent raw asset links from ever loading in standard browser components. Resources are loaded via private Cloudflare R2 Presigned URLs containing a short 15-minute TTL, processed inside an isolated memory buffer, and rendered directly onto a secured, unselectable HTML5 canvas.

### 🛡️ Core Security Features

#### 1. Focus-Loss Blur Blackout
* Both PDF and Video viewers attach event listeners tracking browser `window.blur` and `window.focus`.
* If a student opens a screen-capture utility (such as Windows Snipping Tool, OBS, ShareX, or a browser extension screenshot capture), the focus is immediately lost.
* **Result:** The viewer completely blackouts the screen, suspends playback, and shows a lock warning until the focus returns to the active browser workspace.

#### 2. Screenshot & Shortcut Interception
* The viewer intercepts key combinations including `Ctrl+S`, `Ctrl+P`, `Ctrl+A`, `Cmd+S`, `Cmd+P`, and browser DevTools print triggers.
* The system interceptor overrides the keyboard event `PrintScreen` (keyCode `44`).
* **Result:** Wipes the OS clipboard dynamically (`navigator.clipboard.writeText("🔒")`) and flashes a full-screen screenshot violation alert box.

#### 3. Secure Canvas Watermarking
* **Document Viewer:** Seller/buyer identifiers (name, email, unique IP token) are stamped diagonally across the custom canvas viewport in multiple transparent rows.
* **Video Viewer:** High-contrast watermark text dynamically shifts coordinates across four corners of the player box every 10 seconds.
* **Result:** Defeats external recording devices (such as capturing the screen via a mobile camera) by visibly tracing the leaky source back to the logged-in student account.

#### 4. Micro-Preview & Paywall Layering
* When students click to preview a listing, the page limits are strictly enforced inside the backend routing wrapper.
* **Result:** For digital PDF documents, pages are served one-at-a-time (no pre-fetching). Unpurchased accounts are hard-capped at Page 2, with subsequent pages obscured by a deep HSL-blurred, interactive payment paywall. For courses, playback is capped at a 5-minute preview limit before locking.

---

## 🎨 Design System

All three dashboard layouts leverage a customized premium color palette utilizing high-contrast dark-mode styles.

```css
:root {
  --bg-primary:    #0A0E1A;  /* Main dark cosmic background */
  --bg-card:       #111827;  /* High-contrast card dark fill */
  --border-glow:   #1B233A;  /* Accent border color */
  
  /* Role accents */
  --student-blue:  #4F8EF7;  /* Student panels and glows */
  --admin-green:   #10B981;  /* College Admin controls */
  --master-gold:   #F7C948;  /* Platform master tools */
  
  --drm-purple:    #7C3AED;  /* Digital security layers */
  --danger-red:    #EF4444;  /* Warnings & system rejections */
}
```

### Typography System
* **Headings:** `Sora` (Distinctive, bold, premium)
* **Body Text:** `DM Sans` (Clean, readable, modern)
* **Codes & Identifiers:** `JetBrains Mono` (High-legibility for OTP tokens, pricing logs, and order IDs)

---

## 🏁 Getting Started

### 📋 Prerequisites
* **Node.js** v18 or newer
* **npm** v9 or newer
* **PostgreSQL** (Local instance or hosting URL)
* **Redis** (Local service or server URL)

---

### 💻 Installation & Setup Steps

#### 1. Clone the repository and navigate inside
```bash
git clone https://github.com/Jevin2005/project-CampuseConnect.git
cd project-CampuseConnect
```

#### 2. Set Up the Backend Server
Navigate to the `backend/` directory and configure the environment:
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` using the following values:
```env
# Server Details
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database Connections
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/campusconnect?schema=public"

# Auth Tokens Setup
JWT_SECRET="CC_Sec_Key_Student_2026_#"
JWT_REFRESH_SECRET="CC_Sec_Refresh_Student_2026_$"
BCRYPT_ROUNDS=12

# Mailer Config (Optional - for real Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Initial Master Admin Credentials
MASTER_EMAIL=admin@campusconnect.in
MASTER_PASSWORD=MasterAdmin@2024!
```

#### 3. Initialize the Database Schema & Generate client
```bash
# Push the Prisma schema directly to your local database
npx prisma db push

# Generate the type-safe Prisma client
npx prisma generate
```

#### 4. Seed the Database
Run the seed script to create the master admin account and set up the default demo college:
```bash
node seed.js
```
> [!TIP]
> The seed script automatically generates the platform's Master Admin account (`admin@campusconnect.in` with password `MasterAdmin@2024!`) and initializes a demo college with domain `demo.edu` and campus code `DEMO2024`. You can register any student using an `@demo.edu` email to instantly access the isolated demo campus!

#### 5. Start the API Server
```bash
npm run dev
```
The server will boot on [http://localhost:5000](http://localhost:5000).

---

#### 6. Set Up the Frontend App
Open a separate terminal window, navigate to the `frontend/` directory, install packages, and boot up:
```bash
cd frontend
npm install
```

Create a `.env.local` file inside the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the Next.js development server running on the Turbopack engine:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to access the beautiful marketplace landing page!

---

## 📁 Project Structure

```
project-CampuseConnect/
├── backend/                           # Express Server API
│   ├── config/                        # DB and third-party configs
│   ├── controllers/                   # Auth, Admin, and Market handlers
│   ├── middleware/                    # Tenant checks, JWT validators, and limits
│   ├── prisma/                        # DB layout schema.prisma & migrations
│   ├── routes/                        # Express URL endpoints
│   ├── services/                      # Caching & presigned URL helpers
│   ├── uploads/                       # Direct local uploads folder fallback
│   ├── seed.js                        # Seeding script
│   └── server.js                      # Primary startup file
│
├── frontend/                          # Next.js 16 Client App
│   ├── app/                           # App router directory
│   │   ├── admin/                     # College Admin screens (Green)
│   │   ├── master/                    # Master Admin screens (Gold)
│   │   ├── marketplace/               # Marketplace, listings, and checkout (Blue)
│   │   │   └── viewer/                # DRM Document and Video Players
│   │   ├── globals.css                # Global token mappings
│   │   └── page.tsx                   # Main Landing view
│   ├── components/                    # Reusable visual UI components
│   ├── store/                         # Zustand auth store
│   └── package.json                   # Client configurations
│
└── production_artifacts/              # Original specifications and trackers
```

---

## 🚀 Deployment

### Frontend (Next.js)
The frontend builds seamlessly on **Vercel** with zero custom configuration. Just configure the `NEXT_PUBLIC_API_URL` environment variable pointing to your deployed API server.

### Backend (Node.js/Express)
Deploys perfectly to platforms like Render, Railway, AWS ECS, or a private VPS. Ensure your Redis service is linked and that your CORS parameters in your backend `.env` match the production frontend URL.

---

## 👤 Author

* **Jevin** — Lead Developer — [@Jevin2005](https://github.com/Jevin2005)

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ for college student communities everywhere.

</div>
