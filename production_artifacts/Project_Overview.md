# 🎓 CampusConnect - Project Overview

**CampusConnect** is a premium, high-performance, multi-tenant college peer-to-peer marketplace. It enables verified students to buy, sell, and monetize digital and physical resources within the safety of their university community. The system includes robust **Digital Rights Management (DRM)** to protect student study materials (notes, slides, videos) from piracy.

---

## 🎨 System Roles & Themes

The platform implements a unified dark-mode interface with distinctive color codes for each access level:

1. **Student Panel (Blue Theme 💙)**: Used by students to list products, send buy requests, chat, purchase items, and access the DRM reader/player.
2. **College Admin Panel (Green Theme 💚)**: Used by local campus administrators to verify student registrations, moderate listings, configure local ad campaigns, and track revenue.
3. **Master Admin Panel (Gold Theme 💛)**: Used by platform owners to provision new college tenants, manage global transaction/listing fees, audit logs, and manage suspensions or bans.

---

## 🛠️ Technological Stack (Tech Stack)

### Frontend (Client-side)
* **Core Framework**: Next.js `16.2.4` (App Router, Turbopack Engine)
* **Language**: TypeScript `5.x` (For strict type safety)
* **Styling**: Tailwind CSS `4.x` (Dynamic styling using custom dark-mode & HSL palette variables)
* **Animations**: Framer Motion `12.x` (Smooth hover triggers and view transitions)
* **State Management**: Zustand `5.0.x` (React Hook stores with local persistence)
* **API Client**: Axios (Equipped with JWT Token Interceptors & automated token rotation on `401 Unauthorized`)

### Backend (Server-side)
* **Core Framework**: Node.js & Express.js `5.x` (Asynchronous REST API router)
* **Database ORM**: Prisma `6.19.x` (Type-safe query engine)
* **Database**: PostgreSQL (Relational database for storing users, products, orders, chat threads, and payments)
* **Caching & Rate Limiting**: Redis `5.10.x` (Token versioning validation, API rate-limiting, and state caching)
* **Storage Engine**: Cloudflare R2 / AWS S3 (Stores private images and files with strict access. Content is delivered via short-lived 15-minute Presigned URLs)
* **Payments Gateway**: Razorpay (Dual-tier checkout processing listing fees for sellers and transactional fees for buyers)
* **Mailing Service**: Nodemailer (Sends verification emails, secure OTP logins, and onboarding updates)
* **Real-time Networking**: Socket.io (Bi-directional websocket connection for real-time messaging)

---

## 🏗️ System Architecture & Workflow

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

### 1. Registration & Tenant Isolation Workflow
* A student registers on the portal. They select their college which dictates the required email domain list (e.g. `@demo.edu`).
* An **OTP** is sent using `Nodemailer`. After verification, their registration request lands in the respective **College Admin's queue** for review.
* Upon admin approval, the student gets access to their isolated marketplace. The tenant logic restricts them to viewing products, buying requests, and active campaigns scoped to their college.

### 2. Listing & Selling Workflow
* A student lists physical items or digital materials (PDF notes, lecture videos, bundles).
* If listing digital goods, a flat seller **Listing Fee** is calculated and paid via **Razorpay**.
* Once listing payment goes through, the product goes into the **College Admin's Moderation Queue**.
* Once approved by the College Admin, the listing becomes active.

### 3. Buying & Chat Negotiation Workflow
* A student discovers a listing and submits a **Buy Request** with an initial message.
* This automatically generates a real-time **Chat Thread** using **Socket.io**.
* Students negotiate pricing and trade locations directly in the inbox.
* For digital items, buyers checkout through **Razorpay**. The platform deducts transactional fees and holds the remainder in a **Seller Payout** ledger.
* Payouts are auto-released to the seller after a configured cooling period (e.g. 7 days) to protect against disputes.

### 4. DRM Content Protection System
* **No Raw URLs**: Files are stored privately in Cloudflare R2 and requested via 15-minute TTL Presigned URLs.
* **Canvas Projection**: Assets are parsed in memory and drawn directly onto an HTML5 `<canvas>`, preventing standard browser document saving and text copying.
* **Focus Loss Blackout**: Tracks window blur. Opening screenshots tools, screen-recording apps (like OBS/Snipping Tool), or other active windows triggers an immediate blur blackout state, pausing playback and obscuring the screen.
* **Interception**: Prevents shortcut combinations like `Ctrl+S`, `Ctrl+P`, `Ctrl+A`, and standard right-clicks. Pressing `PrintScreen` automatically clears the system clipboard with `🔒` and triggers a security violation modal.
* **Dynamic Watermarking**: Staves off external video recorders. Renders diagonal watermarks (with buyer's name, email, IP, and timestamp) in multiple rows for PDFs. For video, the watermark text shifts coordinates across the player every 10 seconds.
* **Paywall Obfuscation**: Backends restrict access for non-buyers. PDFs are fetched page-by-page. For preview modes, pages are capped at Page 2, while pages beyond are blurred out with a payment call-to-action.

---

## 🗄️ Database Data Model (Prisma Entity Relationships)

* **`College`**: Parent tenant containing `admins`, `students`, `products`, and `advertisements`. Restricts registrations via `emailDomain` (e.g. `demo.edu`).
* **`Student`**: Scoped to a college. Has relations to listing payment entries, buy requests, wishlists, messages, orders (as buyer/seller), and payout balances.
* **`Product`**: Denotes an item. Mapped to a seller student, college tenant, and listing payments. Includes type filters (`physical`, `digital`) and status states.
* **`ListingPayment`**: Records listing payments for digital goods.
* **`BuyRequest` & `ChatThread` & `ChatMessage`**: Controls real-time negotiations. A thread initiates when a buy request is opened.
* **`Order` & `SellerPayout`**: Ledger mapping purchases. Holds details like platform fee, seller cut, net amount, Razorpay IDs, and payout release timers (`releaseAfter`).
* **`Advertisement`**: Allows college admins to publish local campaigns (Free) or cross-college campaigns (Paid).
* **`PlatformSettings`**: Holds platform values like default listing fees, transaction fee percentages, and payout release days.
* **`AuditLog`**: Master Admin audit logs.

---

## 📁 Repository Directory Structure

```
project-CampuseConnect/
├── backend/                           # Express Server API
│   ├── config/                        # DB configurations, server configurations
│   ├── controllers/                   # API logic controllers (Ad, Auth, Admin, Master, Marketplace, Payments)
│   ├── middleware/                    # Authorization, tenant checks, upload buffers
│   ├── prisma/                        # DB schema definition & seed scripts
│   ├── routes/                        # REST routes mapping path handlers
│   ├── services/                      # Modular services (Nodemailer, R2, Razorpay, Redis)
│   ├── seed.js                        # Seeding script for Master Admin and College
│   └── server.js                      # Application server bootstrap file
│
├── frontend/                          # Next.js 16 Client App
│   ├── app/                           # App routing directory
│   │   ├── admin/                     # College Admin screens (Green Accent)
│   │   ├── master/                    # Master Admin screens (Gold Accent)
│   │   ├── marketplace/               # Marketplace views & actions (Blue Accent)
│   │   │   └── viewer/                # Secure DRM Document/Video render components
│   │   ├── globals.css                # Style tokens & variables
│   │   └── page.tsx                   # System landing page
│   ├── components/                    # Sharable visual components (Buttons, inputs, loaders, modals)
│   └── store/                         # Zustand persistence stores
```
