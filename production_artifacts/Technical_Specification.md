# 📋 CampuseConnect — Technical Specification

> **Version**: 1.0.0 | **Author**: Product Manager (@pm) | **Date**: 2026-04-24
> **Status**: 🟡 Awaiting User Approval

---

## 1. Executive Summary

**CampuseConnect** is a college-exclusive, peer-to-peer marketplace platform where verified students buy and sell two categories of products:

1. **Refurbished Physical Products** — Second-hand goods (books, electronics, furniture, etc.)
2. **Digital Products** — Notes (PDF), video lectures, and study materials with full DRM protection (no download, no screenshot, seller-username watermark)

The platform operates in a **multi-tenant model**:
- Each college is an isolated marketplace ("tenant").
- Students can only access their own college's market.
- A **College Admin** manages their college's market, approves students, moderates listings, and manages ads.
- A **Master Admin** (website team) approves colleges, oversees all tenants, and monitors global revenue & analytics.

---

## 2. Functional Requirements

### 2.1 User Panel (Student)

| ID | Feature | Description |
|----|---------|-------------|
| U-01 | Student Registration | Register with college enrollment email (e.g., `12345@college.edu`) |
| U-02 | Email Verification Request | Registration triggers an approval request sent to the College Admin panel |
| U-03 | Login | JWT-based login after admin approval |
| U-04 | Marketplace Access | Student can only view & interact with their own college's listings |
| U-05 | List Refurbished Product | Upload images, title, description, price; pay a platform listing fee (%) at checkout |
| U-06 | List Digital Product | Upload PDF/video; pay platform fee (%); DRM protection auto-applied |
| U-07 | Buy Products | Browse, view, and purchase products (both categories) via integrated payment gateway |
| U-08 | Digital Content Viewer | View purchased digital content in-browser with watermark & screenshot/download prevention |
| U-09 | Profile & Dashboard | View own listings, purchases, wallet balance, and transaction history |
| U-10 | Messaging | In-app chat between buyer and seller (for physical goods) |
| U-11 | Ratings & Reviews | Rate sellers and products after purchase |

### 2.2 Admin Panel (College Admin)

| ID | Feature | Description |
|----|---------|-------------|
| A-01 | Admin Registration | Admin registers with `College ID + College Code`; request sent to Master Admin |
| A-02 | Admin Login | JWT login after Master Admin approval |
| A-03 | Student Approval | View pending student registrations; approve or reject |
| A-04 | Product Moderation | View all listed products in own college; remove inappropriate/fraudulent listings |
| A-05 | College Ad Management | Create and manage advertisements shown within own college marketplace |
| A-06 | Cross-College Advertising | Pay platform fee to list ads in other college marketplaces |
| A-07 | College Dashboard | View revenue, active users, product counts, and flagged content for own college |
| A-08 | Announcements | Post college-wide announcements visible to all students |

### 2.3 Master Admin Panel (Website Team)

| ID | Feature | Description |
|----|---------|-------------|
| M-01 | College Admin Approval | Review and approve/reject college admin registration requests |
| M-02 | Global Dashboard | Total revenue, total profit, platform fees collected, active colleges |
| M-03 | College-wise Analytics | Drill down into any college — active students, listings, revenue, flagged content |
| M-04 | Fee Configuration | Adjust platform fee percentages globally or per college (for listing, digital products, ads) |
| M-05 | College Management | Enable/disable colleges, edit college metadata |
| M-06 | User Management | View, suspend, or permanently ban any student or admin |
| M-07 | Content Audit | Review and remove any product globally |
| M-08 | Financial Reports | Export revenue and profit reports (CSV / PDF) |
| M-09 | Cross-College Ad Oversight | View and moderate cross-college ad campaigns |

---

## 3. Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| **Security** | JWT + Refresh Tokens; college-level data isolation (row-level security or tenant scoping); HTTPS-only |
| **DRM / IP Protection** | PDF viewer with disabled right-click, print, and clipboard; Canvas-based video player; Seller username dynamically watermarked over all rendered content |
| **Scalability** | Stateless API servers; S3-compatible storage for media; CDN for static assets |
| **Performance** | API response < 300 ms (p95); pages load < 2 s on 4G |
| **Availability** | 99.9% uptime target; zero-downtime deployments |
| **Compliance** | User data stored per GDPR/DPDP principles; payment data never stored raw (tokenized) |
| **Accessibility** | WCAG 2.1 AA compliant UI |

---

## 4. Architecture & Tech Stack

### 4.1 Recommended Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | **Next.js 14** (App Router) + TypeScript | SSR for SEO, file-based routing, excellent DX |
| **Styling** | **Tailwind CSS** + Shadcn/UI | Rapid, consistent, beautiful UI components |
| **Backend API** | **Node.js + Express.js** (TypeScript) | Lightweight, fast, great ecosystem; easy JWT + middleware |
| **Database** | **PostgreSQL** (via Prisma ORM) | Multi-tenant with schema isolation; strong ACID guarantees |
| **Authentication** | **JWT** (Access + Refresh Token) + **Nodemailer** | Secure, stateless; email verification |
| **File Storage** | **AWS S3** (or Cloudflare R2) | Scalable, CDN-friendly; signed URLs for private content |
| **Payment Gateway** | **Razorpay** (India-first) | Best for INR, supports split payments, subscriptions |
| **Real-time Messaging** | **Socket.IO** | In-app chat for buyer ↔ seller |
| **DRM / Content Protection** | **PDF.js** (custom renderer) + **HLS video** with signed tokens | Prevents download; canvas watermark overlay |
| **Caching** | **Redis** | Session store, rate limiting, feed caching |
| **Email Service** | **Nodemailer** + **SendGrid** | Transactional email (approvals, receipts) |
| **Deployment** | **Docker** + **Nginx** (reverse proxy) | Containerized; easy cloud deployment (GCP/AWS/Railway) |

### 4.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌─────────────┐  ┌──────────────────┐  ┌────────────────────┐ │
│  │ Student App │  │ College Admin App │  │ Master Admin App   │ │
│  │ (Next.js)   │  │ (Next.js)         │  │ (Next.js)          │ │
│  └──────┬──────┘  └────────┬─────────┘  └─────────┬──────────┘ │
└─────────┼──────────────────┼────────────────────────┼───────────┘
          │  HTTPS/REST      │                        │
┌─────────▼──────────────────▼────────────────────────▼───────────┐
│                  API GATEWAY (Nginx + Rate Limiter)              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │               Express.js REST API (Node.js)                 │ │
│  │   /auth  /students  /products  /admins  /master  /payments  │ │
│  └──────────────────┬──────────────────────────────────────────┘ │
└─────────────────────┼───────────────────────────────────────────┘
          ┌───────────┼─────────────┬─────────────────────┐
          ▼           ▼             ▼                     ▼
    ┌──────────┐ ┌─────────┐ ┌──────────┐        ┌──────────────┐
    │PostgreSQL│ │  Redis  │ │  AWS S3  │        │  Socket.IO   │
    │(Prisma)  │ │(Cache)  │ │(Media)   │        │  (Chat/WS)   │
    └──────────┘ └─────────┘ └──────────┘        └──────────────┘
```

### 4.3 Multi-Tenancy Model

Each **College** is a tenant. Data isolation is enforced by a `college_id` foreign key on every resource (students, products, ads, etc.). All API middleware validates the JWT, extracts `college_id`, and scopes all queries accordingly.

---

## 5. Data Models (Key Entities)

### 5.1 Core Tables (Prisma Schema)

```prisma
model College {
  id          String   @id @default(cuid())
  name        String
  code        String   @unique  // college code for admin registration
  domain      String   @unique  // email domain (e.g., "college.edu")
  isApproved  Boolean  @default(false)
  admins      Admin[]
  students    Student[]
  products    Product[]
  ads         Advertisement[]
  createdAt   DateTime @default(now())
}

model Admin {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String   // hashed (bcrypt)
  college     College  @relation(fields: [collegeId], references: [id])
  collegeId   String
  isApproved  Boolean  @default(false)  // approved by Master Admin
  createdAt   DateTime @default(now())
}

model Student {
  id              String   @id @default(cuid())
  enrollmentEmail String   @unique
  name            String
  password        String   // hashed (bcrypt)
  college         College  @relation(fields: [collegeId], references: [id])
  collegeId       String
  isApproved      Boolean  @default(false)  // approved by College Admin
  listings        Product[]
  orders          Order[]
  createdAt       DateTime @default(now())
}

model Product {
  id           String        @id @default(cuid())
  title        String
  description  String
  price        Decimal
  type         ProductType   // REFURBISHED | DIGITAL
  status       ProductStatus // PENDING | ACTIVE | REMOVED
  seller       Student       @relation(fields: [sellerId], references: [id])
  sellerId     String
  college      College       @relation(fields: [collegeId], references: [id])
  collegeId    String
  mediaUrls    String[]      // S3 signed URLs
  platformFee  Decimal       // percentage charged
  createdAt    DateTime      @default(now())
}

model Order {
  id           String      @id @default(cuid())
  buyer        Student     @relation(fields: [buyerId], references: [id])
  buyerId      String
  product      Product     @relation(fields: [productId], references: [id])
  productId    String
  amount       Decimal
  platformCut  Decimal
  paymentId    String      // Razorpay payment ID
  status       OrderStatus // PENDING | PAID | FAILED | REFUNDED
  createdAt    DateTime    @default(now())
}

model Advertisement {
  id             String    @id @default(cuid())
  college        College   @relation(fields: [collegeId], references: [id])
  collegeId      String
  targetColleges String[]  // IDs of colleges where this ad shows
  imageUrl       String
  linkUrl        String
  feesPaid       Decimal
  isActive       Boolean   @default(true)
  createdAt      DateTime  @default(now())
}
```

---

## 6. API Structure (REST)

### Auth Routes
```
POST /api/auth/student/register       → Student registration → triggers admin approval
POST /api/auth/student/login          → JWT login (approved students only)
POST /api/auth/admin/register         → College Admin registration → triggers master approval
POST /api/auth/admin/login            → JWT login (approved admins only)
POST /api/auth/master/login           → Master Admin login
POST /api/auth/refresh                → Refresh access token
POST /api/auth/logout                 → Invalidate refresh token
```

### Student Routes
```
GET  /api/student/marketplace         → List products (own college only, scoped by JWT)
GET  /api/student/product/:id         → Product detail
POST /api/student/product             → Create listing (physical or digital)
PUT  /api/student/product/:id         → Edit own listing
DEL  /api/student/product/:id         → Remove own listing
GET  /api/student/orders              → Purchase history
POST /api/student/order               → Initiate purchase
GET  /api/student/content/:orderId    → Stream digital content (DRM, signed token)
GET  /api/student/profile             → Profile & stats
POST /api/student/review              → Submit review
```

### College Admin Routes
```
GET  /api/admin/pending-students      → Students awaiting approval
POST /api/admin/approve-student/:id   → Approve/reject student
GET  /api/admin/products              → All products in college
DEL  /api/admin/product/:id           → Remove product
GET  /api/admin/dashboard             → College analytics
POST /api/admin/advertisement         → Create ad (own college or cross-college)
GET  /api/admin/advertisements        → List own ads
POST /api/admin/announcement          → Post college announcement
```

### Master Admin Routes
```
GET  /api/master/pending-admins       → Admins awaiting approval
POST /api/master/approve-admin/:id    → Approve/reject college admin
GET  /api/master/colleges             → All colleges list
GET  /api/master/college/:id          → College detail & analytics
PUT  /api/master/college/:id          → Enable/disable college
GET  /api/master/dashboard            → Global revenue, profit, stats
PUT  /api/master/fees                 → Update platform fee config
GET  /api/master/users                → All students/admins
PUT  /api/master/user/:id/suspend     → Suspend user
GET  /api/master/reports/export       → Export financial report (CSV/PDF)
```

---

## 7. DRM & Content Protection Strategy

### PDF Protection
- PDFs are **never served directly** — raw files stored in private S3 bucket
- Frontend renders using **PDF.js** in a custom `<canvas>` element
- Disabled: right-click, keyboard shortcuts (Ctrl+S, Ctrl+P, Ctrl+A), DevTools print
- **Seller's username** dynamically rendered as a semi-transparent watermark on every page canvas
- All pages loaded per-page (no bulk download)

### Video Protection
- Videos served as **HLS streams** (`.m3u8`) via signed CloudFront/S3 URLs with short TTL (~15 min)
- **Canvas overlay** renders seller's username watermark continuously
- Screenshot detection: page blur events and `visibilitychange` pause/obscure the player
- No `download` attribute; right-click disabled on video element

---

## 8. Payment Flow

```
Student initiates purchase
      ↓
Backend creates Razorpay Order (amount = product price + platform fee)
      ↓
Frontend opens Razorpay Checkout (client-side)
      ↓
Payment success → Razorpay webhook → Backend verifies signature
      ↓
Backend:  - Creates Order record with status = PAID
          - Credits seller's wallet (price - platform_fee_cut)
          - Logs platform revenue
          - Grants buyer access to product (Order record)
      ↓
Email receipt sent to buyer + seller
```

---

## 9. State Management & Data Flow

| Concern | Approach |
|---------|----------|
| **Server State** | **TanStack Query** (React Query) — caching, background refetch, pagination |
| **Auth State** | **Zustand** store — JWT tokens, user profile, college context |
| **Form State** | **React Hook Form** + **Zod** validation |
| **Real-time** | **Socket.IO** client — in-app chat, notification badges |
| **Global UI** | **Zustand** — modals, toasts, loading states |

---

## 10. Project Folder Structure


campusconnect/
│
├── frontend/                          ← Next.js 14 App (App Router)
│   ├── public/
│   │   ├── fonts/                     ← Self-hosted Sora + DM Sans + JetBrains Mono
│   │   ├── icons/
│   │   └── images/
│   │
│   ├── app/
│   │   ├── layout.jsx                 ← Root layout (fonts, global providers)
│   │   ├── globals.css                ← CSS variables + global resets
│   │   ├── page.jsx                   ← Landing page (/)
│   │   │
│   │   ├── how-it-works/
│   │   │   └── page.jsx               ← /how-it-works
│   │   │
│   │   ├── contact/
│   │   │   └── page.jsx               ← /contact
│   │   │
│   │   ├── (student)/                 ← Student route group
│   │   │   ├── layout.jsx             ← Student layout (navbar, auth guard)
│   │   │   ├── login/
│   │   │   │   └── page.jsx           ← /login
│   │   │   ├── otp/
│   │   │   │   └── page.jsx           ← /otp
│   │   │   ├── pending/
│   │   │   │   └── page.jsx           ← /pending
│   │   │   ├── marketplace/
│   │   │   │   └── page.jsx           ← /marketplace
│   │   │   ├── product/
│   │   │   │   └── [id]/
│   │   │   │       └── page.jsx       ← /product/:id
│   │   │   ├── viewer/
│   │   │   │   ├── pdf/[id]/
│   │   │   │   │   └── page.jsx       ← /viewer/pdf/:id
│   │   │   │   └── video/[id]/
│   │   │   │       └── page.jsx       ← /viewer/video/:id
│   │   │   ├── sell/
│   │   │   │   ├── physical/
│   │   │   │   │   └── page.jsx       ← /sell/physical
│   │   │   │   └── digital/
│   │   │   │       └── page.jsx       ← /sell/digital
│   │   │   ├── my-listings/
│   │   │   │   └── page.jsx           ← /my-listings
│   │   │   ├── my-purchases/
│   │   │   │   └── page.jsx           ← /my-purchases
│   │   │   └── profile/
│   │   │       └── page.jsx           ← /profile
│   │   │
│   │   ├── (admin)/                   ← Admin route group
│   │   │   ├── layout.jsx             ← Admin layout (sidebar, auth guard)
│   │   │   ├── admin/
│   │   │   │   ├── login/
│   │   │   │   │   └── page.jsx       ← /admin/login
│   │   │   │   ├── register/
│   │   │   │   │   └── page.jsx       ← /admin/register
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.jsx       ← /admin/dashboard
│   │   │   │   ├── requests/
│   │   │   │   │   └── page.jsx       ← /admin/requests
│   │   │   │   ├── products/
│   │   │   │   │   └── page.jsx       ← /admin/products
│   │   │   │   ├── advertisements/
│   │   │   │   │   └── page.jsx       ← /admin/advertisements
│   │   │   │   ├── revenue/
│   │   │   │   │   └── page.jsx       ← /admin/revenue
│   │   │   │   └── settings/
│   │   │   │       └── page.jsx       ← /admin/settings
│   │   │
│   │   └── (master)/                  ← Master Admin route group
│   │       ├── layout.jsx             ← Master layout (sidebar, auth guard)
│   │       ├── master/
│   │       │   ├── login/
│   │       │   │   └── page.jsx       ← /master/login
│   │       │   ├── dashboard/
│   │       │   │   └── page.jsx       ← /master/dashboard
│   │       │   ├── college-requests/
│   │       │   │   └── page.jsx       ← /master/college-requests
│   │       │   ├── colleges/
│   │       │   │   ├── page.jsx       ← /master/colleges
│   │       │   │   └── [id]/
│   │       │   │       └── page.jsx   ← /master/colleges/:id
│   │       │   ├── revenue/
│   │       │   │   └── page.jsx       ← /master/revenue
│   │       │   ├── settings/
│   │       │   │   └── page.jsx       ← /master/settings
│   │       │   └── students/
│   │       │       └── page.jsx       ← /master/students
│   │
│   ├── components/
│   │   │
│   │   ├── ui/                        ← Base design system components
│   │   │   ├── Button.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Tabs.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   └── Spinner.jsx
│   │   │
│   │   ├── layout/                    ← Structural layout components
│   │   │   ├── StudentNavbar.jsx
│   │   │   ├── AdminSidebar.jsx
│   │   │   ├── MasterSidebar.jsx
│   │   │   ├── PublicNavbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── NotificationBell.jsx
│   │   │
│   │   ├── student/                   ← Student-specific components
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductGrid.jsx
│   │   │   ├── MarketplaceFilters.jsx
│   │   │   ├── PriceBreakdown.jsx
│   │   │   ├── DRMInfoBox.jsx
│   │   │   ├── CollegeIsolationBanner.jsx
│   │   │   ├── ProtectedPDFViewer.jsx
│   │   │   ├── ProtectedVideoPlayer.jsx
│   │   │   ├── SellTypeSelector.jsx
│   │   │   ├── FeeCalculator.jsx
│   │   │   ├── FileUploadZone.jsx
│   │   │   ├── OTPInputBox.jsx
│   │   │   ├── ApprovalStepper.jsx
│   │   │   └── ImageGallery.jsx
│   │   │
│   │   ├── admin/                     ← Admin-specific components
│   │   │   ├── StudentRequestCard.jsx
│   │   │   ├── ProductModerationRow.jsx
│   │   │   ├── AdCreationForm.jsx
│   │   │   ├── AdScopeSelector.jsx
│   │   │   ├── RevenueTable.jsx
│   │   │   └── ActivityFeed.jsx
│   │   │
│   │   └── master/                    ← Master admin components
│   │       ├── CollegeRequestCard.jsx
│   │       ├── CollegeStatsCard.jsx
│   │       ├── RevenueBarChart.jsx
│   │       ├── ProductTypePieChart.jsx
│   │       ├── PlatformRevenueTable.jsx
│   │       └── SettingsInput.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js                 ← JWT decode, role check, redirect
│   │   ├── useApi.js                  ← Axios wrapper with token injection
│   │   ├── usePayment.js              ← Razorpay open/verify flow
│   │   ├── useSocket.js               ← Socket.io connection + events
│   │   ├── useToast.js                ← Global toast state
│   │   └── useLocalStorage.js         ← Safe localStorage wrapper
│   │
│   ├── context/
│   │   ├── AuthContext.jsx            ← Global auth state provider
│   │   ├── ToastContext.jsx           ← Global toast provider
│   │   └── SocketContext.jsx          ← Socket.io provider
│   │
│   ├── lib/
│   │   ├── axios.js                   ← Axios instance (baseURL + interceptors)
│   │   ├── constants.js               ← API endpoints, fee configs, roles
│   │   └── utils.js                   ← formatPrice, formatDate, truncate, etc.
│   │
│   ├── middleware.js                  ← Next.js route protection middleware
│   │                                    (checks JWT from cookies per route group)
│   │
│   ├── next.config.js
│   ├── tailwind.config.js             ← Custom design tokens
│   └── package.json
│
└── backend/                           ← Node.js + Express API
    ├── models/
    │   ├── MasterAdmin.js
    │   ├── College.js
    │   ├── CollegeAdmin.js
    │   ├── Student.js
    │   ├── Product.js
    │   ├── DigitalProduct.js
    │   ├── Order.js
    │   ├── Transaction.js
    │   ├── Advertisement.js
    │   └── RevenueLog.js
    │
    ├── routes/
    │   ├── auth.routes.js
    │   ├── student.routes.js
    │   ├── product.routes.js
    │   ├── payment.routes.js
    │   ├── admin.routes.js
    │   └── master.routes.js
    │
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── student.controller.js
    │   ├── product.controller.js
    │   ├── payment.controller.js
    │   ├── admin.controller.js
    │   └── master.controller.js
    │
    ├── middleware/
    │   ├── auth.middleware.js         ← JWT verify + attach user to req
    │   ├── role.middleware.js         ← role-based access check
    │   ├── college.middleware.js      ← college isolation check
    │   └── rateLimit.middleware.js    ← express-rate-limit configs
    │
    ├── services/
    │   ├── email.service.js           ← Nodemailer OTP sender
    │   ├── s3.service.js              ← AWS S3 upload + signed URL
    │   ├── payment.service.js         ← Razorpay order + verify
    │   ├── hls.service.js             ← FFmpeg video → HLS conversion
    │   └── redis.service.js           ← OTP store + session cache
    │
    ├── socket/
    │   └── socket.js                  ← Socket.io events + rooms
    │
    ├── config/
    │   ├── db.js                      ← MongoDB Atlas connection
    │   ├── redis.js                   ← Redis Cloud connection
    │   └── s3.js                      ← AWS S3 client config
    │
    ├── seed.js                        ← Database seed script
    ├── server.js                      ← Express app entry point
    └── package.json


---

## 11. Security Design

| Threat | Mitigation |
|--------|-----------|
| Unauthorized college access | `college_id` enforced on every DB query via Prisma middleware |
| Token theft | Short-lived JWT (15 min) + HTTP-only Refresh Token cookie |
| Brute-force login | Redis-based rate limiting (5 attempts / 15 min) |
| File leakage | All S3 objects private; served via pre-signed URL with 15-min TTL |
| XSS | React's output escaping + Content-Security-Policy headers |
| SQL Injection | Prisma parameterized queries; no raw SQL |
| Payment fraud | Razorpay webhook signature verification before any order finalization |

---

## 12. Development Phases (Milestones)

| Phase | Scope | Est. Duration |
|-------|-------|--------------|
| **Phase 1** | Auth flows (all 3 panels) + DB schema + multi-tenant scaffolding | 2 weeks |
| **Phase 2** | Student marketplace — list, browse, buy physical products | 2 weeks |
| **Phase 3** | Digital products + DRM viewer (PDF + video) | 2 weeks |
| **Phase 4** | Payment integration (Razorpay) + order management | 1 week |
| **Phase 5** | Admin panel — moderation, ads, announcements, dashboard | 2 weeks |
| **Phase 6** | Master Admin panel — full analytics, approvals, fee config | 2 weeks |
| **Phase 7** | Real-time chat (Socket.IO) + notifications | 1 week |
| **Phase 8** | QA, security audit, performance optimization, deployment | 2 weeks |
| **Total** | | **~14 weeks** |

---

> 💬 **Awaiting your approval!** Please review this specification. You can open `production_artifacts/Technical_Specification.md` directly and add inline comments — I'll re-read and revise until you're satisfied. Once you type **"Approved"**, the Full-Stack Engineer will begin building the application.


## 13. DESIGN SYSTEM — APPLY TO EVERY SINGLE PAGE

You are a world-class UI/UX designer and frontend developer. Design and build 
ALL pages of "CampusConnect" — a college-isolated student marketplace platform.

Build every page as a complete, pixel-perfect, production-ready HTML/CSS/JS file.

═══════════════════════════════════════════════════════════
DESIGN SYSTEM — APPLY TO EVERY SINGLE PAGE
═══════════════════════════════════════════════════════════

COLOR PALETTE:
  --bg-primary:    #0A0E1A   ← main background
  --bg-card:       #111827   ← card background
  --bg-card2:      #1a2235   ← nested card / input background
  --border:        #1e2d45   ← all borders
  --accent-blue:   #4F8EF7   ← primary action, student panel
  --accent-green:  #10B981   ← success, admin panel, approve
  --accent-gold:   #F7C948   ← master admin, premium
  --accent-purple: #7C3AED   ← digital products, DRM
  --accent-orange: #F59E0B   ← warnings, pending states
  --accent-red:    #EF4444   ← danger, reject, delete
  --text-primary:  #F0F4FF   ← headings, important text
  --text-muted:    #6B7280   ← labels, secondary info
  --text-soft:     #9CA3AF   ← placeholder, captions

TYPOGRAPHY:
  Display font:  'Sora', sans-serif         ← headings, logo, big numbers
  Body font:     'DM Sans', sans-serif      ← body text, labels, inputs
  Mono font:     'JetBrains Mono', monospace ← codes, IDs, OTP inputs
  Import from Google Fonts in every file

  Scale:
    Hero title:   56px, weight 900, letter-spacing -2px
    Page title:   32px, weight 800, letter-spacing -1px
    Section title:22px, weight 700
    Card title:   16px, weight 700
    Body:         14px, weight 400, line-height 1.6
    Label:        11px, weight 700, letter-spacing 1.5px, UPPERCASE
    Small:        12px, weight 500

SPACING SYSTEM:
  Use 4px base grid: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px

BORDER RADIUS:
  Small:   6px   (badges, tags, small inputs)
  Medium:  10px  (inputs, small cards)
  Large:   14px  (main cards)
  XL:      20px  (modals, feature cards)
  Round:   9999px (pills, avatars, buttons)

SHADOWS:
  Card:    0 4px 24px rgba(0,0,0,0.3)
  Lifted:  0 8px 32px rgba(0,0,0,0.5)
  Glow blue:   0 0 20px rgba(79,142,247,0.25)
  Glow green:  0 0 20px rgba(16,185,129,0.25)
  Glow gold:   0 0 20px rgba(247,201,72,0.25)

COMPONENT STYLES:

  Button Primary:
    background: var(--accent-blue)
    color: white
    padding: 10px 24px
    border-radius: 9999px
    font: 14px DM Sans, weight 700
    border: none
    cursor: pointer
    transition: all 0.2s
    hover: translateY(-2px) + box-shadow glow

  Button Outline:
    background: transparent
    border: 1.5px solid current-color
    color: current-color
    same sizing as primary

  Button Danger:
    background: rgba(239,68,68,0.1)
    border: 1px solid rgba(239,68,68,0.3)
    color: #EF4444

  Input Field:
    background: #1a2235
    border: 1.5px solid #1e2d45
    color: #F0F4FF
    padding: 12px 16px
    border-radius: 10px
    font: 14px DM Sans
    focus: border-color changes to panel accent color + glow
    placeholder-color: #6B7280

  Card:
    background: #111827
    border: 1px solid #1e2d45
    border-radius: 14px
    padding: 20px
    transition: border-color 0.2s, transform 0.2s
    hover (if clickable): translateY(-3px) + border glow

  Badge:
    padding: 3px 12px
    border-radius: 9999px
    font: 11px, weight 700, letter-spacing 0.5px
    
    Active/Success: bg #0d2e1f, color #10B981, border 1px solid #10B98133
    Pending:        bg #2e1f0d, color #F59E0B, border 1px solid #F59E0B33
    Danger:         bg #2e0d0d, color #EF4444, border 1px solid #EF444433
    Info:           bg #0d1e2e, color #4F8EF7, border 1px solid #4F8EF733
    Purple:         bg #1a0d2e, color #A78BFA, border 1px solid #7C3AED33
    Gold:           bg #2e250d, color #F7C948, border 1px solid #F7C94833

  Stat Card:
    background: #111827
    border: 1px solid #1e2d45
    border-radius: 14px
    padding: 22px
    contains: icon (28px) + label (11px muted uppercase) + value (28px bold) + sub (12px muted)

  Sidebar:
    width: 240px
    background: #0d1220
    border-right: 1px solid #1e2d45
    position: fixed, full height
    
    Nav item active:
      background: panel-color + 12% opacity
      border-left: 3px solid panel-color
      color: panel-color
      font-weight: 700

  Top Navbar:
    background: rgba(17,24,39,0.85)
    backdrop-filter: blur(12px)
    border-bottom: 1px solid #1e2d45
    position: sticky top:0
    z-index: 100
    height: 64px

  Table:
    header: background #1a2235, color muted, uppercase 11px, padding 12px 16px
    row: border-bottom 1px solid #1e2d45, padding 14px 16px
    row hover: background rgba(79,142,247,0.04)
    alternating: every other row slightly lighter bg

  Progress Bar:
    track: background #1e2d45, height 8px, border-radius 9999px
    fill: gradient matching panel color, border-radius 9999px
    animated: width transition 1s ease

  Toast Notification:
    position: fixed bottom-28px right-28px
    background: #10B981
    color: white
    padding: 14px 22px
    border-radius: 12px
    font-weight: 700
    box-shadow: 0 4px 20px rgba(16,185,129,0.4)
    animation: slide in from right

  Modal Overlay:
    position: fixed, inset 0
    background: rgba(0,0,0,0.75)
    backdrop-filter: blur(4px)
    z-index: 1000
    display: flex, center

  Modal Box:
    background: #111827
    border: 1px solid #1e2d45
    border-radius: 20px
    padding: 32px
    max-width: 500px
    width: 90%

ANIMATIONS:
  Page load: fade in + translateY(16px) → 0, duration 0.4s
  Card hover: translateY(-3px), duration 0.2s
  Button hover: translateY(-2px), duration 0.15s
  Toast: slide in from right, duration 0.3s
  Sidebar active item: smooth background transition
  Skeleton loader: shimmer animation for loading states

BACKGROUND TEXTURE:
  Every main background gets:
    background: #0A0E1A
    + subtle radial gradient blob (top-left, 400px, accent-color at 6% opacity)
    + another blob (bottom-right, 300px, different accent at 4% opacity)
    This creates depth without being distracting

═══════════════════════════════════════════════════════════
PANEL COLOR ASSIGNMENTS
═══════════════════════════════════════════════════════════

Student Panel  → Primary: #4F8EF7 (blue)
Admin Panel    → Primary: #10B981 (green)  
Master Panel   → Primary: #F7C948 (gold)

Every panel uses its color for:
  - Active nav item highlight
  - Primary buttons
  - Stat card values
  - Border glows on hover
  - Focus rings on inputs
  - Badge accents

═══════════════════════════════════════════════════════════
PAGE LIST — BUILD ALL OF THESE
═══════════════════════════════════════════════════════════

LANDING PAGES (Public):
  P1.  Landing / Home Page
  P2.  How It Works Page
  P3.  Contact / Support Page

STUDENT PANEL (12 pages):
  S1.  Student Login Page
  S2.  OTP Verification Page
  S3.  Pending Approval Page
  S4.  Marketplace / Home Page
  S5.  Product Detail Page (Physical)
  S6.  Product Detail Page (Digital — PDF)
  S7.  Protected PDF Viewer Page
  S8.  Protected Video Viewer Page
  S9.  Sell Product Page (Physical)
  S10. Sell Product Page (Digital)
  S11. My Listings Page
  S12. My Purchases Page
  S13. Student Profile Page

ADMIN PANEL (8 pages):
  A1.  Admin Login Page
  A2.  Admin Registration Page
  A3.  Admin Dashboard Page
  A4.  Student Requests Page
  A5.  Product Management Page
  A6.  Advertisement Manager Page
  A7.  College Revenue Page
  A8.  Admin Profile/Settings Page

MASTER ADMIN PANEL (8 pages):
  M1.  Master Admin Login Page
  M2.  Master Dashboard Page
  M3.  College Requests Page
  M4.  All Colleges Page
  M5.  Individual College Detail Page
  M6.  Platform Revenue Page
  M7.  Platform Settings Page
  M8.  All Students Page

═══════════════════════════════════════════════════════════
DETAILED PAGE SPECIFICATIONS
═══════════════════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
P1. LANDING / HOME PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Navbar (transparent → blur on scroll):
  Left:  "Campus" bold white + "Connect" accent blue (Sora font, 22px)
  Right: "How It Works" link + "College Login" outline btn + "Student Login" filled btn

Hero Section (full viewport height, centered):
  Background: dark bg + large gradient blob top-left (blue 8%) + right (purple 5%)
  Small badge pill: "🎓 College Marketplace Platform"
  
  H1 (two lines):
    "Your College's Own"
    "Student Marketplace" ← this line in blue gradient text
  
  Subtext (max-width 520px):
    "Buy and sell physical goods and protected digital content 
     exclusively within your college community."
  
  Two CTA buttons:
    "🎓 Enter Student Market" (filled blue, large)
    "🏫 College Admin Login" (outline, medium)
  
  Trust stats row (3 items with dividers):
    "12+ Colleges" | "1,470 Students" | "2,840 Products"
    each: large bold number (gold) + muted label below

  Scroll indicator: animated bouncing arrow ↓

Feature Cards Section:
  Section label: "WHY CAMPUSCONNECT" (muted uppercase)
  Section title: "Everything your college market needs"
  
  4 cards in 2x2 grid, each with:
    Colored icon box (rounded, 48x48)
    Feature title (white, 18px bold)
    Description (muted, 14px, 2 lines)
    
    Card 1 (blue):  🔒 "College Isolation"
      "Each college gets a completely private marketplace. 
       Zero cross-college visibility."
    
    Card 2 (purple): 🛡️ "DRM Content Protection"
      "Notes and videos are watermarked with buyer's name. 
       No download. No screenshot."
    
    Card 3 (green): 💳 "Transparent Fee System"
      "Small listing fee filters genuine sellers. 
       5% platform cut per sale, auto-calculated."
    
    Card 4 (gold): 📢 "College-Targeted Ads"
      "Admins advertise within their college for free, 
       or pay to go platform-wide."

How It Works Preview Section:
  Title: "From Registration to First Sale"
  Horizontal steps connected by dotted line:
    Step 1: 🏫 College Registers → admin submits college details
    Step 2: ✅ Master Approves → marketplace created in seconds
    Step 3: 🎓 Students Join → via enrollment email + OTP
    Step 4: 🛒 Buy & Sell → physical goods + protected digital

  Each step: number circle + icon + title + description + connector line

Product Types Section:
  Two large cards side by side:
  
  Left card (blue gradient border):
    "🔧 Refurbished Goods"
    Examples list: Laptops, Books, Lab Equipment, Instruments
    "Seller pays listing fee → Ensures genuine listings"
    "View Physical Products →" link
  
  Right card (purple gradient border):
    "📄 Digital Content"
    Examples list: Notes PDFs, Video Lectures, Question Banks
    "Protected with buyer watermark — can't be stolen"
    "View Digital Products →" link

For Colleges Section:
  Dark card with subtle gold border:
  "Is your college not on CampusConnect?"
  Subtext: "Register your college and we'll set up your marketplace within 24 hours."
  Button: "Register Your College →" (gold outline)

Footer:
  Logo + tagline
  Links: How It Works | Admin Login | Student Login | Contact
  Bottom: "© 2024 CampusConnect. Built for students, by students."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
P2. HOW IT WORKS PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Same navbar as landing.

Hero:
  Title: "How CampusConnect Works"
  Subtitle: "Three panels. One platform. Complete marketplace."

Three Panels Explained (tabs):
  Tab 1: Student  Tab 2: College Admin  Tab 3: Master Admin
  (Tab color matches panel color)
  
  Each tab shows:
    Left side: numbered step list with icons
    Right side: illustrated mockup card showing that panel's UI

Student flow steps:
  1. Enter your enrollment email
  2. Receive OTP on your college email
  3. Submit request → admin reviews
  4. Get approved → enter your college marketplace
  5. Browse, buy, and sell freely

Refurbished vs Digital Section:
  Two column layout:
  
  Left: "🔧 Physical / Refurbished"
    Step-by-step: List → Pay fee → Admin approves → Goes live → Buyer purchases
    Timeline visualization (vertical dotted line + steps)
  
  Right: "📄 Digital Products"
    Step-by-step: Upload PDF/Video → Pay fee → DRM applied → Watermark added → Sold safely
    Timeline visualization

DRM Deep Dive Section:
  Title: "How We Protect Digital Content"
  Dark card with purple accent:
    Left: feature list
      ✓ Files stored in private cloud (never public URLs)
      ✓ Buyer's username watermarked on every page
      ✓ Pre-signed URLs expire in 10 minutes
      ✓ No download button, no right-click
      ✓ Video streams in encrypted HLS chunks
      ✓ Screen recording deterrent overlay
    Right: visual mockup of PDF viewer with watermark overlay

Fee Structure Section:
  Title: "Simple, Transparent Fees"
  Table-style cards:
    Row 1: Physical Listing → ₹50 one-time → "Ensures genuine sellers"
    Row 2: Digital Listing  → ₹20 one-time → "Covers storage + processing"
    Row 3: Each Sale        → 5% of price  → "Platform maintenance"
    Row 4: Cross-College Ad → ₹500 flat    → "Premium visibility"
  
  Note box: "Fee % is set by platform. Sellers see exact breakdown before listing."

FAQ Section:
  Accordion-style (click to expand):
    Q: Can students from other colleges see my products?
    Q: What happens if someone shares a digital file?
    Q: How do I get my college added?
    Q: When does the seller receive payment?
    Q: What file types are supported for digital products?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
S1. STUDENT LOGIN PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Layout: Two columns (50/50)

Left column (decorative):
  Dark bg with blue gradient blob
  Large illustration: stacked cards showing product types
  Bold text: "Your College. Your Marketplace."
  Subtext: "Over 2,840 products listed by students just like you."
  Three mini stats: Students | Products | Colleges

Right column (form):
  Logo at top
  "Welcome back 👋" heading (32px)
  "Sign in to your college marketplace"

  Form:
    Label: ENROLLMENT EMAIL
    Input: full width, college email placeholder
    Helper text: "Use your official college-issued email address"
    
    Hint card (blue bg, subtle):
      "New here? Your account will be created automatically 
       after your college admin approves you."

  "Send OTP →" button (full width, blue, rounded)

  Divider: "OR"
  
  "College Admin?" link → goes to admin login
  
  Small text: "By continuing, you agree to our Terms of Service"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
S2. OTP VERIFICATION PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Same two-column layout.

Right column:
  "Check your inbox 📬" (32px)
  "We sent a 6-digit OTP to:"
  Email shown in a pill badge (blue bg, mono font)
  
  OTP Input: 6 separate boxes side by side
    Each box: 48x56px, border 2px, center text
    Focus: border turns blue + glow
    Auto-advance: cursor moves to next box on input
    Font: JetBrains Mono, 24px
  
  Timer: "Resend OTP in 04:32" countdown (orange when < 1 min)
  "Resend OTP" link (disabled until timer hits 0)
  
  "Verify & Enter →" button
  
  "← Change Email" link

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
S3. PENDING APPROVAL PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Centered layout (no sidebar):

Top: Large animated ⏳ icon (subtle pulse animation)
Title: "Approval Pending" (32px)
Subtext: "Your request has been submitted to MIT College admin."

Progress tracker (vertical stepper):
  Step 1: ✅ Email Verified         (green circle, filled)
  Step 2: ✅ OTP Confirmed          (green circle, filled)
  Step 3: ⟳ Admin Reviewing         (blue circle, spinning indicator)
  Step 4: ○ Access Granted          (empty circle, muted)
  
  Connecting lines between steps (solid green for done, dashed for pending)

Info card:
  "What happens next?"
  • Your college admin will review your enrollment email
  • Typical approval time: 24-48 hours
  • You'll receive an email notification when approved
  • No action needed from your side

Warning card (orange):
  "Make sure you used your official college enrollment email. 
   Personal emails (gmail, yahoo) will be rejected."

Two buttons:
  "← Use Different Email" (outline)
  "← Back to Home" (ghost)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
S4. MARKETPLACE / HOME PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Layout: Sticky top navbar + main content (no sidebar for students)

Navbar:
  Logo | "🏫 MIT College of Engineering" breadcrumb
  Right: 🔔 bell icon with unread dot | "RS" avatar | "+ Sell" green btn

College Isolation Banner (full width, blue bg subtle):
  🔒 "You're browsing MIT College of Engineering marketplace only.
      Products here are listed exclusively by MIT students."

Search + Filter Bar:
  Large search input (60% width): "Search products, notes, categories..."
  Filter pills: [All] [🔧 Physical] [📄 Notes PDF] [🎥 Video Course]
  Sort dropdown: "Newest First ▾"
  Price range: "₹0 — ₹50,000" slider (optional)

Stats row (small, between search and grid):
  "Showing 24 products" | "4 Digital | 20 Physical"

Product Grid (3 columns, gap 20px):
  ProductCard component:
    Image area (180px height):
      If image exists: show image
      If no image: large emoji centered, colored bg
      Type badge overlay: top-right corner
        Digital PDF:   purple "📄 PDF"
        Digital Video: purple "🎥 Video"
        Physical:      blue "🔧 Physical"
    
    Card body:
      Seller row: avatar circle (28px) + "by [name]" + "MIT '24"
      Title: 15px bold, max 2 lines, ellipsis
      Description: 12px muted, 1 line ellipsis
      
      Bottom row:
        Price: 18px bold green "₹199"
        "View Details →" blue text link

    Hover: lift + blue border glow + shadow

Advertisement Banner (between row 2 and row 3):
  Styled differently: gold border, "SPONSORED" label
  Admin-created ad content

Pagination: 
  "← Prev" | 1 2 3 ... | "Next →"
  Styled with border, rounded

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
S5. PRODUCT DETAIL PAGE (Physical)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Layout: Two columns (60/40 split)

Left column:
  Image gallery:
    Main image (large, rounded 14px)
    4 thumbnail images below (click to switch main)
    If no image: large emoji in colored card
  
  Product description section:
    "About this product" heading
    Full description text
    Condition badge: "Good Condition" / "Like New" etc.

Right column (sticky on scroll):
  Breadcrumb: Marketplace → Electronics → Product name
  
  Type badge + Status badge row
  
  Product title: 26px bold
  
  Seller card:
    Avatar + name + "MIT College, 3rd Year"
    "⭐ 4.8 seller rating" + "12 products sold"
    "View Profile" link
  
  Price breakdown card (dark bg):
    ┌─────────────────────────────┐
    │ Price:         ₹18,000      │
    │ Platform fee:  -₹900 (5%)   │
    ├─────────────────────────────│
    │ Seller gets:   ₹17,100  ✓  │
    └─────────────────────────────┘
    "You pay: ₹18,000" (large, green)
  
  "💳 Buy Now" button (full width, large, blue)
  "💬 Contact Seller" button (full width, outline)
  
  Safety note:
    "🛡️ Protected by CampusConnect. 
     Payment held until delivery confirmed."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
S6. PRODUCT DETAIL PAGE (Digital PDF)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Same layout as S5 but with:

Left column:
  Preview card (instead of image gallery):
    Dark bg with purple border
    Large 📄 icon (80px)
    "GATE 2024 ECE Notes" title
    "Preview not available — Purchase to access"
    Sample page count: "48 pages"
    File info: "PDF • 12.4 MB"
  
  Content details:
    Subjects covered list (tags)
    "What's included" bullet list

Right column:
  DRM Protection Info box (purple bg, important section):
    "🛡️ Digital Content Protection"
    ✓ Watermarked with YOUR username on every page
    ✓ No download button available
    ✓ Right-click is disabled
    ✓ Content cannot be screenshot-identified
    ✓ Shared copies are traceable back to buyer
    Warning: "Do not share this content. Your account may be suspended."
  
  Price card (same as physical)
  "💳 Buy & Access Now" button
  "👁 Free Preview (2 pages)" button (outline purple) → opens small preview modal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
S7. PROTECTED PDF VIEWER PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full-page viewer (no regular navbar):

Custom viewer navbar:
  Left: "← My Purchases" back link
  Center: PDF title + "Page 3 of 48"
  Right: page navigation (< >) + zoom controls (- +) + NO download button

Viewer area (full remaining height):
  Outer container: black bg, centered
  PDF canvas: white bg, rendered via PDF.js
  
  Watermark overlay (position: absolute over canvas):
    Text: "rahul.sharma • CampusConnect • Purchased Dec 2024"
    Tiled diagonally across entire page
    Opacity: 0.10
    Color: gray
    font: mono, 13px
    Rotation: -30 degrees
    pointer-events: none
    user-select: none
  
  Page render: clean with subtle shadow

Bottom info bar:
  Purple bg:
  "🛡️ This PDF is watermarked with your username [rahul.sharma]. 
   Sharing this content is a violation of Terms of Service."

Right-click prevention active (JS: e.preventDefault())
Keyboard shortcut prevention (Ctrl+S, Ctrl+P blocked)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
S8. PROTECTED VIDEO VIEWER PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full page viewer:

Custom navbar:
  Back link | Course title | Lesson selector dropdown

Main layout (two columns 70/30):

Left: Video Player
  Video.js player (dark controls, no download button)
  
  Floating watermark overlay (absolute, over video):
    "rahul.sharma • CampusConnect"
    Semi-transparent white text
    Position changes every 30 seconds (JS)
    4 positions cycle: top-left, top-right, bottom-left, bottom-right
    font-size: 13px, opacity: 0.6
    pointer-events: none
  
  Right-click disabled on video element

Right: Course Outline sidebar
  "Course Contents" heading
  Lesson list (scrollable):
    Each lesson: lesson number + title + duration
    Current lesson: blue highlight
    Purchased: clickable
    Not purchased: lock icon 🔒

Below video: lesson title + description

Info bar: 
  "🛡️ This video is protected. Unauthorized distribution is 
   traceable to your account."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
S9. SELL PRODUCT PAGE (Physical)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Multi-step form (3 steps, progress bar at top):

Step indicator bar:
  ① Product Type → ② Details → ③ Review & Pay
  Active step: blue circle + label
  Done step: green checkmark circle

Step 1 — Choose Type:
  Two large clickable cards side by side:
  
  Left (Physical):
    🔧 icon (large)
    "Physical / Refurbished Item"
    Examples: Laptop, Books, Equipment, Clothes
    Listing fee: ₹50
    "Select →" button
    On select: blue border + checkmark
  
  Right (Digital):
    📄 icon (large)
    "Digital Product"
    Examples: Notes PDF, Video Course, Study Material
    Listing fee: ₹20
    "Select →" button

Step 2 — Details (Physical):
  Two-column form layout:
  
  Left column:
    Input: Product Title (required)
    Textarea: Description (required, 150 chars min)
    Select: Category (Electronics, Books, Clothing, Stationery, Equipment, Other)
    Select: Condition (Brand New, Like New, Good, Fair)
    Input: Original Price ₹ (for reference)
    Input: Selling Price ₹ (required)
  
  Right column:
    Photo Upload Zone:
      Dashed border box, 200px height
      "Drag & drop photos or Click to upload"
      "Max 4 photos, 5MB each"
      Accepted: JPG, PNG, WEBP
      Preview thumbnails with X to remove
    
    Live Fee Calculator card (updates as price typed):
      ┌──────────────────────────────┐
      │ Your selling price:  ₹4,500  │
      │ Listing fee:         ₹50     │
      │ Per-sale platform:   ₹225    │
      │ ─────────────────────────── │
      │ You'll receive:      ₹4,275  │
      │ (per successful sale)        │
      └──────────────────────────────┘

Step 3 — Review & Pay:
  Review summary card (all entered details)
  Payment section:
    "Listing Fee Required: ₹50"
    "This fee ensures only genuine sellers list products."
    Razorpay pay button (styled)
  On payment: redirect to My Listings with success toast

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
S10. SELL PRODUCT PAGE (Digital)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Same 3-step structure.

Step 2 — Details (Digital):
  Left column:
    Input: Title
    Textarea: Description
    Select: Subject (Mathematics, Physics, CS, ECE, Mechanical, Civil, Other)
    Select: Content Type (PDF Notes, Video Course, Mixed)
    Input: Price ₹
    Input: Number of pages / lecture hours
  
  Right column:
    File Upload Zone:
      Purple dashed border
      Large upload icon
      "Upload PDF or Video file"
      "Max file size: 500MB for video, 50MB for PDF"
      Progress bar appears during upload
      Accepted formats shown
    
    DRM Info box (purple):
      "Your content will be protected:"
      ✓ Buyer's username watermarked automatically
      ✓ File stored in secure private storage
      ✓ No download access for buyers
      ✓ You retain full ownership
    
    Fee Calculator (same as physical)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
S11. MY LISTINGS PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Navbar + content area.

Summary stats row (4 cards):
  Active Listings | Total Views | Total Sales | Revenue Earned

Filter tabs: All | Active | Pending Review | Sold | Removed

Table (for larger screens):
  Columns: Product | Type | Price | Status | Views | Sales | Actions
  
  Each row:
    Thumbnail + title (product column)
    Type badge
    Price
    Status badge (color-coded)
    View count
    Sale count
    Actions: Edit (pencil icon) | Delete (trash icon)
  
  Pending Review rows: orange row tint + "Awaiting admin approval"
  Sold rows: slightly muted + "Sold" green badge

Empty state (when no listings):
  Large 📦 icon
  "No products listed yet"
  "Start selling to your MIT College community"
  "List Your First Product →" button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
S12. MY PURCHASES PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Two tabs: Physical Orders | Digital Content

Physical Orders tab:
  Order cards (list):
    Each card: product image/emoji | title | seller | price paid | order date | status
    Status: "Pending" / "Confirmed" / "Delivered"
    "View Order Details" link

Digital Content tab:
  Grid of purchased digital items:
    Card: emoji + title + seller + purchase date
    "📖 Open PDF" or "▶️ Watch Video" button (blue/purple)
    Opens respective protected viewer
    "Purchased on: Dec 15, 2024" small text

Empty state:
  "No purchases yet"
  "← Browse Marketplace" button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
S13. STUDENT PROFILE PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Top section (card):
  Large avatar circle (64px, initials or image)
  Name (24px bold)
  College name + Enrollment year
  Enrollment email (with verified badge ✓)
  "Edit Profile" button

Stats row (4 items):
  Products Listed | Products Sold | Items Purchased | Member Since

Two columns below:
  Left: "My Active Listings" (3 most recent, "View All →" link)
  Right: "Recent Purchases" (3 most recent, "View All →" link)

Account Settings section:
  Change display name
  Notification preferences (toggles)
  "Delete Account" danger button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A1. ADMIN LOGIN PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Two columns layout.

Left: decorative panel (green theme)
  College building illustration / abstract
  "Manage Your College Marketplace"
  "Full control over students, products, and revenue."

Right: form panel
  "College Admin Login" (28px)
  "Manage your college's marketplace"
  
  Label: ADMIN EMAIL
  Input: admin@college.edu
  
  Label: COLLEGE CODE
  Input: monospace font, placeholder "COLLEGE2024"
  Helper: "This was assigned to you during college registration"
  
  Label: PASSWORD
  Input: password type with show/hide toggle
  
  "Enter Admin Panel →" button (full width, green)
  
  Divider
  
  "New college?" link → A2 registration page
  "← Student Login" link

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A2. ADMIN REGISTRATION PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Multi-step (2 steps):

Step 1 — College Info:
  Input: College Full Name
  Input: College City
  Input: College Email Domain (e.g. mit.edu) with helper text
  Input: Unique College Code (e.g. MIT2024) — they choose this
  Input: College Type (Engineering/Medical/Arts/Commerce dropdown)

Step 2 — Admin Account:
  Input: Admin Full Name
  Input: Admin Official Email
  Input: Password (strength indicator)
  Input: Confirm Password
  Checkbox: "I confirm I am an authorized representative"
  
  "Submit Registration →" (green)
  
  Info card below form:
    "After submission, your request will be reviewed by the 
     CampusConnect team within 24-48 hours."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A3. ADMIN DASHBOARD PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Layout: Fixed left sidebar (green theme) + main content

Sidebar nav items:
  📊 Dashboard     (active)
  👥 Student Requests  (with badge if pending)
  📦 Products
  📢 Advertisements
  💰 Revenue
  ⚙️ Settings
  → Logout

Top of main content:
  "Good morning, MIT Admin 👋" (24px)
  "MIT College of Engineering · Dec 25, 2024"

4 Stat Cards (grid 4):
  👥 Total Students    → 2 (approved)  (green value)
  📦 Active Products   → 12            (blue value)
  💰 Revenue This Month → ₹9,670       (gold value)
  ⏳ Pending Requests   → 1            (orange value, pulsing dot if > 0)

Two columns below:

Left: "Student Requests" card
  If pending: show request cards with Approve/Reject
  If none: "No pending requests ✅"

Right: "Products Needing Review" card
  List of pending products with Approve/Remove
  If none: "All products reviewed ✅"

Full-width: "Recent Activity" feed
  Timeline of recent actions:
    "Priya Patel listed HP Laptop — 2 hours ago"
    "Rahul Sharma bought DS Notes — 4 hours ago"
    "New student request from Arjun Mehta — 1 day ago"
  Each with icon, text, time, and blue dot

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A4. STUDENT REQUESTS PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Two tabs with count: "Pending (1)" | "Approved (2)"

Pending tab:
  Alert banner (orange): "1 student is waiting for your approval"
  
  Request cards (large, detailed):
    Left: avatar circle (48px) + name + email
    Center: 
      "Enrollment Email:" value
      "Request Date:" value  
      "Email Domain:" value (should match college domain)
    Right: "✅ Approve" (green) + "❌ Reject" (red outline) buttons
  
  On approve → card moves to approved + success toast
  On reject → modal asking for rejection reason (optional) → removes card

Approved tab:
  Table or card list:
    Avatar | Name | Email | Approved Date | Products Listed | Actions
  Actions: "View Profile" | "Suspend" (outline red)
  
  Search bar to filter students

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A5. PRODUCT MANAGEMENT PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Filter bar: [All] [Pending] [Active] [Removed] + search input + type filter

Products as table:
  Columns: Product | Seller | Type | Price | Listed Date | Status | Actions

Each row:
  Thumbnail/emoji + title (truncated)
  Seller name (link to profile)
  Type badge
  Price (green)
  Date
  Status badge
  Actions: 
    Pending: "Approve ✓" | "Remove ✗"
    Active: "Remove ✗" (with confirmation)
    
"Removed Products" tab:
  Shows removed products with:
    Who removed it (Admin)
    Date removed
    "Restore" button option

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A6. ADVERTISEMENT MANAGER PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Two large option cards at top:

Left: "🏫 Own College Advertisement" (green border)
  → Visible only to MIT College students
  → Cost: FREE
  → Duration: 7 / 14 / 30 days
  "Create Own College Ad" button

Right: "🌐 All Colleges Advertisement" (gold border)
  → Visible to ALL students on the platform
  → Cost: ₹500 flat fee
  → Duration: 7 days
  → "Higher reach, paid placement"
  "Create Cross-College Ad" button

Create Ad Form (shown below on click, or in modal):
  Input: Ad Title
  Textarea: Ad Description (max 200 chars with counter)
  Upload: Banner Image (1200×400px recommended, preview shown)
  Select: Duration
  If cross-college: payment section + "Pay ₹500 & Publish" button
  If own college: "Publish Ad" button (free)

Active Advertisements section:
  Ad preview cards (horizontal, like banner ads):
    Banner image preview
    Title + scope badge (Own/All)
    "Live ●" badge
    Expires: date
    Stats: Views | Clicks (mock numbers)
    "End Ad" button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A7. COLLEGE REVENUE PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date filter: "This Week" / "This Month" / "This Year" / Custom Range

3 Summary cards:
  📋 Listing Fees Collected → ₹1,240  (blue)
  💸 Transaction Fees (5%)  → ₹8,430  (green)
  💰 Total Platform Earned  → ₹9,670  (gold)

Chart section:
  "Revenue Over Time" (line chart — use CSS or canvas)
  Simple SVG line chart showing 7 data points (weekly)
  Hover: tooltip showing amount for that day

Transactions table:
  Header: Product | Buyer | Sale Price | Platform Cut | Date
  Sortable columns (click header to sort)
  Export CSV button (top right)
  Pagination

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
M1. MASTER ADMIN LOGIN PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Minimal, secure-feeling design:

Center of page:
  Gold crown icon 👑 (large)
  "CampusConnect" logo
  "Platform Master Control"
  
  Card (slightly wider, 420px):
    "Master Admin Access" heading
    Red subtle warning: "Authorized personnel only"
    
    MASTER EMAIL input
    PASSWORD input (with show/hide)
    
    "Sign In →" (gold button, full width)
  
  Small text: "Access is logged. Unauthorized access is prohibited."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
M2. MASTER DASHBOARD PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gold-themed sidebar.

Hero stats (full-width, 4 cards):
  🏫 Active Colleges    → 2       (gold)
  🎓 Total Students     → 1,470   (blue)
  📦 Total Products     → 2,840   (green)
  💰 Total Revenue      → ₹15,680 (gold)

Two charts side by side:
  Left (60%): "Revenue by College" — horizontal bar chart
    MIT College:     ████████████ ₹9,670
    ABC Engineering: ████████     ₹6,010
    Bars: gradient gold to orange

  Right (40%): "Product Type Distribution" — donut/pie visual
    Physical: 62% (blue)
    Digital:  38% (purple)
    Center: total count

Fee Breakdown card:
  Three rows with icons:
    📋 Listing Fees:     ₹2,130 (blue)
    💸 Transaction Fees: ₹13,550 (green)
    📢 Ad Revenue:       ₹1,500 (gold)

Recent Activity (full width):
  Combined feed from all colleges:
    "New college request: XYZ Institute — 2 hours ago"
    "MIT College: 1 new student request — 5 hours ago"
    "ABC College listed 3 new products — 1 day ago"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
M3. COLLEGE REQUESTS PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pending section:
  Info banner: "Approving a college creates their isolated marketplace 
               and activates the admin account."
  
  Detailed request cards:
    College name (large, bold)
    Admin name + email
    City | Type | Email Domain | Code
    "Submitted: 2 days ago"
    
    Two action buttons:
      "✅ Approve & Create Marketplace" (green, prominent)
      "❌ Reject Request" (red outline)
    
    On approve: success modal explaining what was created

Active Colleges list:
  Table: College | City | Code | Students | Products | Revenue | Status | Date Joined

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
M4. ALL COLLEGES PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Search bar + City filter dropdown

College cards (two per row):
  Each card: 
    College name (18px bold)
    City + Type badges
    4 mini stats: Students | Products | Revenue | Ads
    Status badge + "View Details →" link
    
    Revenue bar (mini progress showing relative revenue vs total)

Click → goes to M5 (college detail)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
M5. INDIVIDUAL COLLEGE DETAIL PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Back button → All Colleges

College header:
  Large college name
  City | Code | Email domain | Status badge
  Admin email + "Contact Admin" button
  "⚠️ Suspend College" danger button (right side)

4 stat cards (same style)

Two tabs: Students | Products

Students tab:
  Table: Name | Email | Joined | Products Listed | Status
  Actions: View | Suspend individual student

Products tab:
  Table: Title | Type | Price | Seller | Status | Date
  Actions: View | Remove (override admin)

Revenue card (full width):
  This college's contribution:
    Listing fees | Transaction fees | Ad fees | Total
  % of total platform revenue: "MIT contributes 61% of platform revenue"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
M6. PLATFORM REVENUE PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date range filter

3 headline stats (large):
  Total Listing Fees | Total Transaction Fees | Net Profit

Revenue table:
  Columns: College | Listing Fees | Transaction Fees | Ad Revenue | Total | % Share
  Footer row: TOTAL (bold, gold)
  
  Progress bar per row showing % share

Monthly trend chart (SVG line chart):
  Two lines: Revenue vs Fees Collected
  X axis: last 6 months
  Y axis: ₹ amounts

Export: CSV and PDF options

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
M7. PLATFORM SETTINGS PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Warning banner (orange):
  "Changes to fee settings apply to ALL new transactions across ALL colleges."

Two column settings grid:

Card 1: Transaction Fee (%)
  Current value: 5%
  Large editable input (gold, 32px, centered)
  +/- buttons on sides
  "This is deducted from every product sale"

Card 2: Physical Listing Fee (₹)
  Current: ₹50
  Same editable input
  
Card 3: Digital Listing Fee (₹)
  Current: ₹20

Card 4: Cross-College Ad Fee (₹)
  Current: ₹500

Save card (full width):
  Summary of changes (before vs after)
  "Save Platform Settings" gold button
  "Cancel Changes" ghost button
  
Change Log section:
  Table of previous setting changes:
    Date | Setting | Old Value | New Value | Changed By

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
M8. ALL STUDENTS PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Filters: College dropdown | Status filter | Search

Summary: "1,470 students across 2 colleges"

Table:
  Avatar | Name | Email | College | Enrolled | Products | Purchases | Status | Actions

Actions per student:
  View profile (opens side panel drawer)
  Suspend student

Side drawer (on View):
  Student full profile
  Their listings
  Their purchases
  Quick suspend/unsuspend toggle

═══════════════════════════════════════════════════════════
ADDITIONAL DESIGN REQUIREMENTS FOR EVERY PAGE
═══════════════════════════════════════════════════════════

LOADING STATES:
  Every page must have skeleton loaders:
    Gray animated shimmer blocks matching content layout
    Visible for 0.5-1 second on load (simulate API delay)
    animation: shimmer 1.5s infinite linear

EMPTY STATES:
  Every list/table must have an empty state:
    Relevant emoji (large, 48-64px)
    "Nothing here yet" title
    Contextual helper text
    Action button where applicable

ERROR STATES:
  Network error: "⚠️ Failed to load. Try again." with retry button
  Not found: 404 style with back button
  Unauthorized: redirect to login

RESPONSIVE BREAKPOINTS:
  Desktop: 1280px+ (full sidebar + content)
  Tablet:  768-1279px (collapsible sidebar)
  Mobile:  < 768px (bottom nav or hamburger menu)
  
  Mobile adjustments:
    Sidebars become slide-in drawers with overlay
    Grids collapse to single column
    Tables scroll horizontally
    Modals full-screen on mobile

MICRO-INTERACTIONS:
  Button click: slight scale(0.97) then back
  Card hover: translateY(-3px) + shadow increase
  Input focus: border glow animation (0→glow in 0.2s)
  Badge pulse: orange/red badges pulse when attention needed
  Success: green flash + checkmark animation
  Delete: card slides out to left + fades (0.3s)

NOTIFICATION SYSTEM (all pages):
  Bell icon in navbar (🔔)
  Unread count badge (red, top-right of bell)
  Click: dropdown panel (280px wide, right-aligned)
    List of notifications with:
      Icon | Message | Timestamp
    "Mark all read" button
    Unread items: slightly highlighted bg
    Click notification: navigate to relevant page
