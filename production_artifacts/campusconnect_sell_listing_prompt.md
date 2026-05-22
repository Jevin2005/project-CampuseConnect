# CampusConnect — Sell & Listing Feature Implementation Prompt

You are a senior full-stack engineer building the **CampusConnect** platform. Your task is to implement the complete **product listing (sell) flow**, **product card system**, and **marketplace display**. Follow the existing design system (dark theme, Sora / DM Sans / JetBrains Mono fonts, full color palette from the spec) exactly on every screen.

---

## PART 1 — PHYSICAL PRODUCT LISTING (`/sell/physical`)

### Multi-Step Form — 3 Steps

---

### Step 1 — Basic Info

| Field | Type | Notes |
|-------|------|-------|
| Product Title | Text input | Required |
| Description | Textarea | Min 100 chars, live char counter |
| Category | Select | Electronics · Books · Lab Equipment · Clothing · Stationery · Furniture · Other |
| Condition | Select | Brand New · Like New · Good Condition · Fair Condition |
| Original MRP Price ₹ | Text input | Optional — shown as strikethrough on card |

---

### Step 2 — Photos & Pricing

**Image Upload Zone:**
- Drag & drop + click to upload
- Accept: `.jpg`, `.png`, `.webp` only
- Max 4 images, 5 MB each
- Live preview thumbnails with `×` remove button on each
- First image = cover image (labeled `"Cover"` badge)
- Images stored as object URLs for preview; sent as file array on submit
- **No emoji or icon fallback — if images are uploaded, the real image is always shown**

**Live Fee Calculator** (updates on every keystroke in Selling Price field):

```
┌──────────────────────────────────────────┐
│  Your Selling Price:      ₹ [input]      │
│  One-time Listing Fee:    ₹ [X]          │  ← from master admin config
│  ────────────────────────────────────── │
│  You receive per sale:    ₹ [input]      │  ← seller gets FULL price, no deduction
│  (Platform fee is charged to the buyer)  │
│                                          │
│  Buyer will pay at checkout:             │
│  ₹ [price + platform fee %]              │
└──────────────────────────────────────────┘
```

> **Critical logic:** The listing fee is a one-time charge paid by the seller at publish time. The platform fee % is added **on top** of the seller's listed price at buyer checkout — it does **not** reduce the seller's earnings. Show a tooltip: `ℹ️ Platform fee is added to the buyer's total, not deducted from yours.`

---

### Step 3 — Review & Publish

- Full summary card: all entered data + image previews
- Payment section:

```
Listing Fee Due:  ₹50
"Pay once to publish your product to the marketplace."

[ Pay ₹50 & Publish Listing ]   ← Razorpay or [Simulate Payment] mock button
```

- On successful payment → save product with `status: PENDING_REVIEW` → redirect to `/my-listings` with toast: `✅ Product submitted! Awaiting admin review.`

---

## PART 2 — DIGITAL PRODUCT LISTING (`/sell/digital`)

### Step 1 — Choose Digital Type (4 Cards)

Render 4 large clickable selection cards. Selected card: accent-purple border + checkmark + background glow.

| Card | Icon | Label | Description | Listing Fee |
|------|------|-------|-------------|-------------|
| 1 | 📄 | **Notes / PDF** | Upload PDF documents, notes, question banks | ₹20 |
| 2 | 🎥 | **Video Course** | Upload recorded lectures, tutorial videos | ₹30 |
| 3 | 📦 | **Notes + Video** | Combined: PDFs and videos together | ₹40 |
| 4 | 🎁 | **Bundle** | Multiple products grouped as one purchase | ₹60 |

---

### Step 2 — Details Form (changes per type selected)

#### Type A — Notes / PDF

| Field | Type | Notes |
|-------|------|-------|
| Title | Text input | Required |
| Description | Textarea | Required |
| Subject | Select | Mathematics · Physics · Chemistry · Computer Science · ECE · Mechanical · Civil · Management · Other |
| Academic Level | Select | 1st Year · 2nd Year · 3rd Year · 4th Year · Postgraduate |
| Number of Pages | Number input | Required |
| Price ₹ | Number input | Required |
| Cover Image | Image upload | **Required — real image shown on card** |
| PDF File Upload | File upload zone | `.pdf` · `.docx` only · max 50 MB · show file name, size, progress bar |

---

#### Type B — Video Course

| Field | Type | Notes |
|-------|------|-------|
| Course Title | Text input | Required |
| Course Description | Textarea | Required |
| Subject | Select | Same as above |
| Total Duration | Text input | e.g. `4 hours 30 minutes` |
| Number of Lectures | Number input | Auto-counted from uploads |
| Price ₹ | Number input | Required |
| Cover / Thumbnail Image | Image upload | **Required — real image shown on card** |
| Video Uploads | Multi-file upload | `.mp4` · `.mov` · `.mkv` · max 2 GB per file |

For each uploaded video, show an inline sub-form:
- Lecture Number (auto-incremented)
- Lecture Title (text input)
- Duration (auto-read from metadata or manual input)
- `×` remove button

All lectures render as a numbered reorderable list. Show counter: `3 lectures added`.

---

#### Type C — Notes + Video

Render **both** the Type A and Type B form sections on the same page, separated by a labeled divider:

```
━━━━━━━━  📄 PDF Section  ━━━━━━━━
[all Type A fields]

━━━━━━━━  🎥 Video Section  ━━━━━━━━
[all Type B fields]
```

- Single combined price input
- One cover image upload used for the card

---

#### Type D — Bundle

| Field | Type | Notes |
|-------|------|-------|
| Bundle Title | Text input | Required |
| Bundle Description | Textarea | What's included, why it's valuable |
| Bundle Price ₹ | Number input | Required |
| Cover Image | Image upload | **Required — real image shown on card** |

**Add Items to Bundle section:**

- Button: `+ Add PDF Item` → opens inline sub-form:
  - Item Title, Subject, Page Count, PDF file upload
- Button: `+ Add Video Item` → opens inline sub-form:
  - Item Title, Subject, Number of Lectures, Video file upload(s)

Each added item renders as a compact card:
- Icon + Title + Type badge + `×` remove

Rules:
- Minimum 2 items, maximum 10
- Live bundle item counter: `3 items in bundle`
- **Bundle Value** = sum of what each item would individually cost — displayed as `~~₹800~~` (strikethrough) next to bundle price to show savings

---

### Step 3 — DRM Info + Review + Pay (all digital types)

Show purple DRM info box:

```
🛡️ Your content will be automatically protected:
  ✓ Buyer's username watermarked on every PDF page / video frame
  ✓ File stored in private encrypted storage
  ✓ No download button available to buyers
  ✓ Pre-signed access URLs expire in 15 minutes
  ✓ You retain full ownership of your content
```

Full product summary, then payment:

```
Listing Fee:  ₹[amount based on type]
[ Pay & Publish Digital Product ]
```

On success → save product → redirect to `/my-listings`.

---

## PART 3 — PAYMENT & FEE LOGIC (Critical)

### Two Separate Fee Events

| Event | Who Pays | When | Amount |
|-------|----------|------|--------|
| Listing Fee | **Seller** | At listing/publish time | Fixed ₹ per type |
| Platform Fee | **Buyer** | At purchase checkout | % added on top of seller price |

### Listing Fee Defaults (from master admin config)

| Product Type | Default Fee |
|---|---|
| Physical | ₹50 |
| PDF / Notes | ₹20 |
| Video Course | ₹30 |
| Notes + Video | ₹40 |
| Bundle | ₹60 |

### Platform Fee (buyer-side)

- Default: **5%** (configured by master admin)
- Buyer checkout total = `Seller Price + (Seller Price × platformFeePercent / 100)`
- Seller receives **100% of their listed price**
- Platform keeps the fee % amount

### Fee Calculator Must Show

```
Your listed price:        ₹500
You will receive:         ₹500   (your full price, always)
Buyer pays at checkout:   ₹525   (your price + 5% platform fee)
One-time listing fee:     ₹50    (paid now, once)
```

---

## PART 4 — PRODUCT CARD COMPONENT (4 Variants)

> **Rule: Every card variant uses the real uploaded cover image. There are no emoji, icon, or color-block fallbacks for the image area. If no image is uploaded, the upload step is required before the product can be submitted.**

All cards share base styles:
- Background: `#111827`
- Border: `1px solid #1e2d45`
- Border-radius: `14px`
- Hover: `translateY(-3px)` + border shifts to type accent color + shadow glow
- Cursor: pointer → navigate to product detail page

---

### Variant 1 — Physical Product Card

```
┌─────────────────────────────────────┐
│                                     │
│   [ Real uploaded cover image ]     │  ← object URL / base64 from upload
│   180px height, object-fit: cover   │
│                    [🔧 Physical]    │  ← blue badge, top-right overlay
│                                     │
├─────────────────────────────────────┤
│  👤 Rahul Sharma  ·  MIT '24        │  ← seller name + year, muted 12px
│                                     │
│  HP Pavilion Laptop 15-inch         │  ← title, bold, max 2 lines
│  Good Condition  ·  Electronics     │  ← condition + category, muted 12px
│                                     │
│  ~~₹45,000~~    ₹18,000   View →   │  ← MRP strikethrough + price + link
└─────────────────────────────────────┘
```

- Bottom-left: `📍 MIT Campus` location chip (12px, muted)
- Top-left on hover: `❤️` wishlist button (toggleable)
- If `status: SOLD` (in My Listings only): red diagonal "SOLD" stamp overlay on image

---

### Variant 2 — PDF / Notes Card

```
┌─────────────────────────────────────┐
│                                     │
│   [ Real uploaded cover image ]     │  ← seller-uploaded thumbnail/cover
│   180px height, object-fit: cover   │
│                   [📄 PDF Notes]    │  ← purple badge, top-right overlay
│                                     │
├─────────────────────────────────────┤
│  👤 Priya Patel  ·  MIT '23         │
│                                     │
│  GATE 2024 ECE Complete Notes       │  ← title, bold, max 2 lines
│  ECE  ·  48 pages  ·  2nd Year      │  ← subject, pages, level, muted 12px
│                                     │
│  🔒 DRM Protected    ₹199  View →  │  ← DRM tag left + price right
└─────────────────────────────────────┘
```

- `🔒 DRM Protected` tag: purple bg, 11px, bottom-left

---

### Variant 3 — Video Course Card

```
┌─────────────────────────────────────┐
│                                     │
│   [ Real uploaded cover/thumbnail ] │  ← seller-uploaded thumbnail image
│   180px height, object-fit: cover   │
│   ▶  (centered play icon overlay)  │  ← semi-transparent ▶ button on hover
│   12 lectures · 4h 30m             │  ← bottom-left overlay on image
│                        [🎥 Video]  │  ← purple badge, top-right
│                                     │
├─────────────────────────────────────┤
│  👤 Arjun Singh  ·  MIT '24         │
│                                     │
│  Data Structures Full Course        │  ← title, bold, max 2 lines
│  Computer Science  ·  3rd Year      │  ← subject + level, muted 12px
│                                     │
│  🔒 DRM Protected    ₹499  View →  │
└─────────────────────────────────────┘
```

- Lecture count + duration shown as a dark semi-transparent chip at bottom of image area

---

### Variant 4 — Bundle Card

```
┌─────────────────────────────────────┐
│                                     │
│   [ Real uploaded bundle cover ]    │  ← seller-uploaded cover image
│   180px height, object-fit: cover   │
│   🎁 3 items inside                │  ← center overlay chip on image
│                        [🎁 Bundle] │  ← gold badge, top-right
│                                     │
├─────────────────────────────────────┤
│  👤 Meera Joshi  ·  MIT '24         │
│                                     │
│  Complete DBMS Exam Pack            │  ← title, bold, max 2 lines
│  2 PDFs  +  1 Video Course          │  ← bundle contents summary, muted 12px
│                                     │
│  ~~₹800~~  Bundle: ₹599   View →   │  ← individual value strikethrough + price
└─────────────────────────────────────┘
```

- Gold accent border on hover (instead of blue)

---

### Shared Card Elements (all variants)

- `❤️` wishlist/save button: top-left corner, visible on hover, toggleable (filled ❤️ when saved)
- `⭐ 4.8 (12)` rating: shown if reviews exist; `New` badge if no reviews yet
- `PENDING_REVIEW` orange overlay: visible in My Listings only — not in Marketplace
- All image areas: `object-fit: cover`, `border-radius: 14px 14px 0 0`

---

## PART 5 — MARKETPLACE INTEGRATION

1. **Render real store data** — no hardcoded dummy products anywhere
2. **Type filter pills** must actively filter the grid:
   - `[All]` · `[🔧 Physical]` · `[📄 Notes PDF]` · `[🎥 Video Course]` · `[🎁 Bundle]`
3. **Sort dropdown** must actually sort:
   - Newest First (default) · Price: Low to High · Price: High to Low · Most Popular
4. Every card is **clickable** → navigates to correct product detail page with full data
5. Marketplace only shows products with `status: ACTIVE`
6. Cards render with **real uploaded cover images** throughout

---

## PART 6 — MY LISTINGS PAGE (Updates)

1. Real data from product store — every submitted product appears here
2. **Actual cover image** shown in each listing row or card
3. Status badges accurately reflect:

| Status | Badge Color | Meaning |
|--------|-------------|---------|
| `PENDING_REVIEW` | Orange | Submitted, awaiting admin |
| `ACTIVE` | Green | Live on marketplace |
| `SOLD` | Muted blue | Physical item sold |
| `REMOVED` | Red | Removed by admin |

4. Product type badge shown on every row
5. Actions per status:

| Status | Available Actions |
|--------|-------------------|
| `PENDING_REVIEW` | View · Cancel Listing |
| `ACTIVE` | Edit · Remove |
| `SOLD` | Mark as Delivered |
| `REMOVED` | Re-list |

---

## PART 7 — DATA STRUCTURE

### Product Store (Zustand or React Context)

```typescript
interface Product {
  id: string;
  type: 'PHYSICAL' | 'PDF' | 'VIDEO' | 'NOTES_VIDEO' | 'BUNDLE';
  title: string;
  description: string;
  price: number;
  originalPrice?: number;         // MRP for physical (strikethrough display)
  sellerId: string;
  sellerName: string;
  sellerCollege: string;
  sellerYear: string;
  collegeId: string;
  status: 'PENDING_REVIEW' | 'ACTIVE' | 'SOLD' | 'REMOVED';

  coverImage: string;             // object URL / base64 — REQUIRED, always real image
  images?: string[];              // additional images for physical products

  // Physical
  category?: string;
  condition?: string;

  // PDF
  subject?: string;
  pageCount?: number;
  academicLevel?: string;
  fileUrl?: string;

  // Video
  totalDuration?: string;
  lectureCount?: number;
  lectures?: {
    number: number;
    title: string;
    duration: string;
    url?: string;
  }[];

  // Bundle
  bundleItems?: {
    type: 'PDF' | 'VIDEO';
    title: string;
    subject?: string;
    pageCount?: number;
    lectureCount?: number;
    fileUrl?: string;
  }[];
  bundleValue?: number;           // sum of individual item prices (for strikethrough)

  listingFeePaid: number;
  platformFeePercent: number;     // from master config, e.g. 5
  rating?: number;
  reviewCount?: number;
  views: number;
  sales: number;
  createdAt: string;
}
```

### Platform Fee Config

```typescript
interface PlatformFees {
  physicalListingFee: number;       // default: 50
  pdfListingFee: number;            // default: 20
  videoListingFee: number;          // default: 30
  notesVideoListingFee: number;     // default: 40
  bundleListingFee: number;         // default: 60
  transactionFeePercent: number;    // default: 5
  crossCollegeAdFee: number;        // default: 500
}
```

---

## IMPLEMENTATION CHECKLIST

- [ ] `/sell/physical` — 3-step form with real image upload + correct fee calculator
- [ ] `/sell/digital` — type selector + 4 type-specific forms + DRM info + payment step
- [ ] Fee calculator: listing fee only for seller; platform % shown as buyer add-on
- [ ] Listing fee mock payment gate before product is saved to store
- [ ] Product saved to shared store on successful payment
- [ ] All 4 `ProductCard` variants built as one polymorphic component
- [ ] Every card variant uses `coverImage` (real uploaded image) — no fallback emoji or icons
- [ ] `object-fit: cover` on all card image areas
- [ ] Marketplace filters and sort work on live store data
- [ ] Marketplace shows only `ACTIVE` products
- [ ] My Listings shows all products with real images + correct status + correct actions
- [ ] Loading skeletons on all list/grid views
- [ ] Empty states on all list/grid views
- [ ] Mobile responsive (cards single column, forms stacked, upload zones full width)
- [ ] All design system tokens (colors, fonts, spacing, shadows, radii) applied consistently

---

> **Agent note:** Build the sell flow and product store first, then wire the marketplace and My Listings to consume real store data. The `coverImage` field is required on every product — enforce this in the form validation before the payment step is reached. No product card should ever render without a real image.
