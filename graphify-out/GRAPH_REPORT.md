# Graph Report - project CampuseConenct  (2026-09-08)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1060 nodes · 1671 edges · 86 communities (68 shown, 15 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 104 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `54bf711f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- videoProcessing.queue.js
- marketplace.controller.js
- marketplaceApi.ts
- r2.service.js
- check_env.js
- useAuthStore
- admin.controller.js
- dependencies
- how-it-works/page.tsx
- backend/package.json
- server.js
- lucide-react
- ad.controller.js
- auth.middleware.js
- react
- payment.controller.js
- marketplace/page.tsx
- compilerOptions
- admin.auth.controller.js
- frontend/package.json
- student.auth.controller.js
- upload.middleware.js
- StudentLayout.tsx
- SellProductPage
- AdBanner.tsx
- auth.routes.js
- marketplace/product/[id]/page.tsx
- master.controller.js
- marketplace.routes.js
- inbox/page.tsx
- listings/page.tsx
- shared.auth.controller.js
- scripts
- ads/page.tsx
- marketplace/digital/[id]/page.tsx
- colleges/[id]/page.tsx
- dependencies
- pdf/page.tsx
- proxy.ts
- admin/dashboard/page.tsx
- marketplace/requests/page.tsx
- video/page.tsx
- master.auth.controller.js
- products/page.tsx
- adsData.ts
- devDependencies
- package.json
- AdminLayoutClient.tsx
- video-processing/page.tsx
- master/revenue/page.tsx
- bcryptjs
- register
- admin.routes.js
- admin/settings/page.tsx
- earnings/page.tsx
- students/page.tsx
- email.service.js
- videoMigration.service.js
- advertisements/page.tsx
- ads/[id]/page.tsx
- profile/page.tsx
- payouts/page.tsx
- verify-otp/page.tsx
- frontend/vercel.json
- upload.routes.js
- @prisma/client
- seed.js
- scripts
- vercel.json
- scratch_check_products.js
- scratch_clear_chats.js
- scratch_inspect_ads.js
- scratch_inspect_db.js
- scratch_test_deal_done.js
- scratch_test_inbox.js
- scratch_test_isolation.js
- scratch_verify_existing.js
- test_deal_flow.js
- scripts
- tailwind.config.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `useAuthStore` - 68 edges
2. `react` - 53 edges
3. `lucide-react` - 38 edges
4. `api` - 32 edges
5. `@prisma/client` - 30 edges
6. `getApiBaseUrl()` - 21 edges
7. `StudentLayout()` - 16 edges
8. `compilerOptions` - 16 edges
9. `SellProductPage()` - 13 edges
10. `scripts` - 12 edges

## Surprising Connections (you probably didn't know these)
- `AllCollegesPage()` --calls--> `useAuthStore`  [EXTRACTED]
  frontend/app/master/colleges/page.tsx → frontend/store/authStore.ts
- `MasterDashboardPage()` --calls--> `useAuthStore`  [EXTRACTED]
  frontend/app/master/dashboard/page.tsx → frontend/store/authStore.ts
- `getFileUrl()` --calls--> `getApiBaseUrl()`  [EXTRACTED]
  frontend/app/marketplace/viewer/pdf/page.tsx → frontend/lib/axios.ts
- `AdsPage()` --calls--> `useAuthStore`  [EXTRACTED]
  frontend/app/marketplace/ads/page.tsx → frontend/store/authStore.ts
- `MasterLayoutClient()` --calls--> `useAuthStore`  [EXTRACTED]
  frontend/app/master/MasterLayoutClient.tsx → frontend/store/authStore.ts

## Import Cycles
- None detected.

## Communities (86 total, 15 thin omitted)

### Community 0 - "videoProcessing.queue.js"
Cohesion: 0.05
Nodes (35): crypto, generateSegmentSignature(), getProductContent(), prisma, { PrismaClient }, proxyHlsSegment(), r2, redis (+27 more)

### Community 1 - "marketplace.controller.js"
Cohesion: 0.06
Nodes (23): approveProduct(), completeDeal(), createBuyRequest(), createNotification(), createOrder(), createProduct(), extractFiles(), getPlatformSettings() (+15 more)

### Community 2 - "marketplaceApi.ts"
Cohesion: 0.06
Nodes (15): WishlistPage(), remove(), showToast(), BuyRequest, ChatMessage, ChatThread, fetchWishlist(), getMediaBase() (+7 more)

### Community 3 - "r2.service.js"
Cohesion: 0.08
Nodes (27): r2, buildKey(), deleteByUrl(), deleteObject(), deletePrefix(), fs, getFolder(), getObjectStream() (+19 more)

### Community 4 - "check_env.js"
Cohesion: 0.08
Nodes (25): nodemailer, { PrismaClient }, Razorpay, Redis, runDiagnostics(), { S3Client, ListObjectsV2Command }, testCloudflareR2(), testNodemailer() (+17 more)

### Community 5 - "useAuthStore"
Cohesion: 0.12
Nodes (20): AdminLoginPage(), Student, StudentRequestsPage(), RevenueAdminPage(), RevenueData, ForgotPasswordPage(), NOTE: metadata export must live in a Server Component., IMPORTANT: Only call clearAuth() on definitive 401 (invalid/expired token). (+12 more)

### Community 6 - "admin.controller.js"
Cohesion: 0.09
Nodes (16): approveStudent(), AVATAR_COLORS, avatarColor(), getDashboard(), getInitials(), getStudents(), { notifyStudentApproved, notifyStudentRejected }, prisma (+8 more)

### Community 7 - "dependencies"
Cohesion: 0.08
Nodes (25): dependencies, @aws-crypto/crc32c, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, bcryptjs, bull, cookie-parser, cors (+17 more)

### Community 8 - "how-it-works/page.tsx"
Cohesion: 0.12
Nodes (15): DRM_FEATURES, FAQS, FEES, HowItWorksPage(), TABS, useInView(), FEATURES, LandingPage() (+7 more)

### Community 9 - "backend/package.json"
Cohesion: 0.09
Nodes (21): author, description, devDependencies, nodemon, keywords, license, main, name (+13 more)

### Community 10 - "server.js"
Cohesion: 0.09
Nodes (20): adminRoutes, ALLOWED_ORIGINS, app, authRoutes, { convertLegacyVideosToHLS }, cookieParser, cors, express (+12 more)

### Community 11 - "lucide-react"
Cohesion: 0.12
Nodes (13): COLLEGE_TYPES, BASE_NAV, MasterLayoutClient(), NavItem, DEFAULTS, getPhysicalFee(), PhysicalTier, PlatformSettingsPage() (+5 more)

### Community 12 - "ad.controller.js"
Cohesion: 0.11
Nodes (15): autoExpireAds(), bannersDir, createAd(), endAd(), fs, getAdminWithCollege(), getMyAds(), multer (+7 more)

### Community 13 - "auth.middleware.js"
Cohesion: 0.11
Nodes (15): jwt, authMiddleware, express, masterController, router, auth, ctrl, express (+7 more)

### Community 14 - "react"
Cohesion: 0.11
Nodes (8): AllCollegesPage(), College, CollegeWithAdmin, DashStats, MasterDashboardPage(), RecentItem, RevenueBar, react

### Community 15 - "payment.controller.js"
Cohesion: 0.16
Nodes (15): calcPhysicalListingFee(), createOrder(), { createRazorpayOrder, verifyPaymentSignature }, getPlatformSettings(), prisma, { PrismaClient }, verifyPayment(), createRazorpayOrder() (+7 more)

### Community 16 - "marketplace/page.tsx"
Cohesion: 0.18
Nodes (17): BADGE_BG, CATEGORIES, Category, DEMO, fallbackBg(), getBadge(), getCategoryInfo(), isImage() (+9 more)

### Community 17 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 18 - "admin.auth.controller.js"
Cohesion: 0.14
Nodes (16): bcrypt, BCRYPT_ROUNDS, jwt, login(), otpService, prisma, { PrismaClient }, register() (+8 more)

### Community 19 - "frontend/package.json"
Cohesion: 0.11
Nodes (17): next, name, private, version, clsx, eslint, eslint-config-next, framer-motion (+9 more)

### Community 20 - "student.auth.controller.js"
Cohesion: 0.18
Nodes (16): bcrypt, BCRYPT_ROUNDS, checkApprovalStatus(), jwt, login(), otpService, prisma, { PrismaClient } (+8 more)

### Community 21 - "upload.middleware.js"
Cohesion: 0.12
Nodes (13): ALLOWED_MIMES, diskStorage, fs, memoryStorage, multer, path, r2, UPLOAD_ROOT (+5 more)

### Community 22 - "StudentLayout.tsx"
Cohesion: 0.16
Nodes (11): downloadReceipt(), fmt(), MyPurchasesPage(), Order, ST, BundleItem, DigSub, ProdType (+3 more)

### Community 23 - "SellProductPage"
Cohesion: 0.18
Nodes (13): SellProductPage(), handleBundleFileChange(), handleListingFeePayment(), removeBundleItem(), showNotification(), submitToAPI(), updateBundleItem(), validateAndAddFiles() (+5 more)

### Community 24 - "AdBanner.tsx"
Cohesion: 0.29
Nodes (14): AdBannerHorizontal(), AdCard(), AdDetailModal(), AdDetailModalProps, AdFormat, AdPortrait(), AdRenderer(), AdSquare() (+6 more)

### Community 25 - "auth.routes.js"
Cohesion: 0.12
Nodes (15): adminController, adminLoginLimiter, authMiddleware, express, masterController, masterLoginLimiter, { rateLimit, ipKeyGenerator }, router (+7 more)

### Community 26 - "marketplace/product/[id]/page.tsx"
Cohesion: 0.23
Nodes (14): initials(), isImageUrl(), PhysicalProductPage(), handleShare(), handleWishlist(), sendRequest(), showToast(), Product (+6 more)

### Community 28 - "marketplace.routes.js"
Cohesion: 0.15
Nodes (11): checkRole(), uploadMedia, adCtrl, auth, { checkRole }, ctrl, express, jwt (+3 more)

### Community 29 - "inbox/page.tsx"
Cohesion: 0.20
Nodes (10): EMOJIS, fmtTime(), getCurrentUserId(), InboxPage(), initials(), productIcon(), QUICK, timeAgo() (+2 more)

### Community 30 - "listings/page.tsx"
Cohesion: 0.21
Nodes (13): isVideo(), Listing, ListingThumb(), mediaUrl(), MyListingsPage(), doDelete(), exportCSV(), showToast() (+5 more)

### Community 31 - "shared.auth.controller.js"
Cohesion: 0.23
Nodes (11): logout(), logout(), { clearRefreshCookie }, jwt, logout(), prisma, { PrismaClient }, refresh() (+3 more)

### Community 32 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:inspect, db:verify, dev, postinstall, prisma:generate, prisma:migrate (+4 more)

### Community 33 - "ads/page.tsx"
Cohesion: 0.30
Nodes (10): AdBannerWide(), AdCard(), AdsPage(), bannerSrc(), daysLeft(), FilterTab, fmtDate(), LiveAd (+2 more)

### Community 34 - "marketplace/digital/[id]/page.tsx"
Cohesion: 0.27
Nodes (11): DigitalProductPage(), handleBuyNow(), handleShare(), handleWishlist(), showToast(), DRM_POINTS, initials(), isDocumentUrl() (+3 more)

### Community 35 - "colleges/[id]/page.tsx"
Cohesion: 0.20
Nodes (10): AdminInfo, avatarColor(), CollegeData, CollegeDetailPage(), CollegeInfo, COLORS, initials(), ProductInfo (+2 more)

### Community 36 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, axios, clsx, framer-motion, js-cookie, lucide-react, next, react (+4 more)

### Community 37 - "pdf/page.tsx"
Cohesion: 0.22
Nodes (6): ACADEMIC_NOTES_DATABASE, ctrlBtnStyle, getFileUrl(), getOriginalFileName(), isDocumentUrl(), PdfViewerInner()

### Community 38 - "proxy.ts"
Cohesion: 0.22
Nodes (10): ADMIN_AUTH_PAGES, ADMIN_ROUTES, config, decodeJwtPayload(), MASTER_AUTH_PAGES, MASTER_ROUTES, matchesAny(), proxy() (+2 more)

### Community 39 - "admin/dashboard/page.tsx"
Cohesion: 0.24
Nodes (9): AdminDashboardPage(), C, DashData, getGreeting(), ProductBreakdown, RecentListing, RecentTx, relTime() (+1 more)

### Community 40 - "marketplace/requests/page.tsx"
Cohesion: 0.29
Nodes (9): APIRequest, initials(), productIcon(), ReqStatus, RequestsPage(), handleStatus(), showToast(), STATUS_STYLE (+1 more)

### Community 41 - "video/page.tsx"
Cohesion: 0.29
Nodes (7): formatTime(), getOriginalFileName(), isDocumentUrl(), isVideoUrl(), LessonItem, VideoViewerInner(), WATERMARK_POSITIONS

### Community 42 - "master.auth.controller.js"
Cohesion: 0.28
Nodes (8): bcrypt, jwt, login(), prisma, { PrismaClient }, { setRefreshCookie }, signAccessToken(), signRefreshToken()

### Community 43 - "products/page.tsx"
Cohesion: 0.31
Nodes (7): CAT_ICON(), isPdf(), isVideo(), Product, ProductManagementPage(), PS, SC

### Community 44 - "adsData.ts"
Cohesion: 0.25
Nodes (8): AdData, ALL_ADS, CROSS_COLLEGE_ADS, fetchLiveAds(), HOSTEL_ADS, INLINE_ADS, mapDbAdToAdData(), OWN_COLLEGE_ADS

### Community 45 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+1 more)

### Community 46 - "package.json"
Cohesion: 0.22
Nodes (8): dependencies, next, @vercel/speed-insights, next, @vercel/speed-insights, name, private, version

### Community 47 - "AdminLayoutClient.tsx"
Cohesion: 0.29
Nodes (5): AdminLayoutClient(), AdminLayoutClientProps, NAV_ITEMS, NavItem, metadata

### Community 48 - "video-processing/page.tsx"
Cohesion: 0.29
Nodes (6): getStageIndex(), ProcessingItem, ProcessingStage, STAGES, StatusData, VideoProcessingInner()

### Community 49 - "master/revenue/page.tsx"
Cohesion: 0.32
Nodes (7): AccountingSummary, CollegeRev, fmt(), LedgerEntry, LineChart(), PlatformRevenuePage(), Stats

### Community 50 - "bcryptjs"
Cohesion: 0.29
Nodes (5): updatePassword(), { execSync, spawnSync }, MIGRATIONS, runSeed(), bcryptjs

### Community 51 - "register"
Cohesion: 0.43
Nodes (7): generateOtp(), isValidEmail(), maskEmail(), register(), resendRegisterOtp(), sendOtp(), sendOtpEmail()

### Community 52 - "admin.routes.js"
Cohesion: 0.29
Nodes (6): adController, adminController, authMiddleware, express, IMPORTANT: /ads/upload must be declared BEFORE /ads/:id/* to avoid Express, router

### Community 53 - "admin/settings/page.tsx"
Cohesion: 0.38
Nodes (6): AdminSettingsPage(), getInitials(), getStrength(), SCOLS, SettingsData, STRENGTHS

### Community 54 - "earnings/page.tsx"
Cohesion: 0.33
Nodes (6): ChartItem, EarningsData, initials(), PayoutItem, Stats, StudentEarningsPage()

### Community 55 - "students/page.tsx"
Cohesion: 0.38
Nodes (6): AllStudentsPage(), AVATAR_COLORS, avatarColor(), CollegeOption, initials(), Student

### Community 56 - "email.service.js"
Cohesion: 0.33
Nodes (5): emailPort, nodemailer, sendApprovalEmail(), transporter, nodemailer

### Community 57 - "videoMigration.service.js"
Cohesion: 0.33
Nodes (5): convertLegacyVideosToHLS(), prisma, { PrismaClient }, r2, videoQueue

### Community 58 - "advertisements/page.tsx"
Cohesion: 0.47
Nodes (5): Ad, AdvertisementManagerPage(), daysLeft(), DURATION_OPTS, fmtDate()

### Community 59 - "ads/[id]/page.tsx"
Cohesion: 0.53
Nodes (5): AdDetailPage(), bannerSrc(), daysLeft(), fmtDate(), LiveAd

### Community 60 - "profile/page.tsx"
Cohesion: 0.47
Nodes (5): fmt(), initials(), MarketplaceProfile, NOTIF_DEFS, ProfilePage()

### Community 61 - "payouts/page.tsx"
Cohesion: 0.47
Nodes (5): avatarColor(), COLORS, initials(), Payout, PayoutsPage()

### Community 63 - "frontend/vercel.json"
Cohesion: 0.33
Nodes (5): buildCommand, framework, headers, installCommand, outputDirectory

### Community 64 - "upload.routes.js"
Cohesion: 0.40
Nodes (4): auth, ctrl, express, router

### Community 65 - "@prisma/client"
Cohesion: 0.40
Nodes (3): prisma, { PrismaClient }, @prisma/client

### Community 66 - "seed.js"
Cohesion: 0.40
Nodes (3): bcrypt, prisma, { PrismaClient }

### Community 67 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 68 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, framework, installCommand, outputDirectory

### Community 78 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, build, dev, start

## Knowledge Gaps
- **463 isolated node(s):** `NavItem`, `PhysicalTier`, `PricingSettings`, `DashStats`, `RecentItem` (+458 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 619 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@prisma/client` connect `@prisma/client` to `videoProcessing.queue.js`, `marketplace.controller.js`, `check_env.js`, `admin.controller.js`, `backend/package.json`, `server.js`, `ad.controller.js`, `payment.controller.js`, `admin.auth.controller.js`, `student.auth.controller.js`, `master.controller.js`, `shared.auth.controller.js`, `master.auth.controller.js`, `bcryptjs`, `videoMigration.service.js`, `seed.js`, `scratch_check_products.js`, `scratch_clear_chats.js`, `scratch_inspect_ads.js`, `scratch_inspect_db.js`, `scratch_test_deal_done.js`, `scratch_test_inbox.js`, `scratch_test_isolation.js`, `scratch_verify_existing.js`, `test_deal_flow.js`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `marketplaceApi.ts`, `useAuthStore`, `how-it-works/page.tsx`, `lucide-react`, `marketplace/page.tsx`, `frontend/package.json`, `StudentLayout.tsx`, `AdBanner.tsx`, `marketplace/product/[id]/page.tsx`, `inbox/page.tsx`, `listings/page.tsx`, `ads/page.tsx`, `marketplace/digital/[id]/page.tsx`, `colleges/[id]/page.tsx`, `pdf/page.tsx`, `admin/dashboard/page.tsx`, `marketplace/requests/page.tsx`, `video/page.tsx`, `products/page.tsx`, `AdminLayoutClient.tsx`, `video-processing/page.tsx`, `master/revenue/page.tsx`, `admin/settings/page.tsx`, `earnings/page.tsx`, `students/page.tsx`, `advertisements/page.tsx`, `ads/[id]/page.tsx`, `profile/page.tsx`, `payouts/page.tsx`, `verify-otp/page.tsx`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `useAuthStore` connect `useAuthStore` to `marketplaceApi.ts`, `lucide-react`, `react`, `marketplace/page.tsx`, `StudentLayout.tsx`, `SellProductPage`, `inbox/page.tsx`, `listings/page.tsx`, `ads/page.tsx`, `marketplace/digital/[id]/page.tsx`, `colleges/[id]/page.tsx`, `pdf/page.tsx`, `admin/dashboard/page.tsx`, `marketplace/requests/page.tsx`, `video/page.tsx`, `products/page.tsx`, `AdminLayoutClient.tsx`, `master/revenue/page.tsx`, `admin/settings/page.tsx`, `students/page.tsx`, `profile/page.tsx`, `verify-otp/page.tsx`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `NavItem`, `PhysicalTier`, `PricingSettings` to the rest of the system?**
  _463 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `videoProcessing.queue.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05272895467160037 - nodes in this community are weakly interconnected._
- **Should `marketplace.controller.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._
- **Should `marketplaceApi.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06456456456456457 - nodes in this community are weakly interconnected._