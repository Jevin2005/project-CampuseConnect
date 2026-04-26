# Admin Panel Pages — Build Progress

## Status: ✅ A1–A4 Complete

| ID | Page | Stitch Screen ID | File Path | Status |
|----|------|-----------------|-----------|--------|
| A1 | Admin Login Page | `d6bff0b4b9424826aff92b3e2bedaf56` | `app/admin/login/page.tsx` | ✅ Done |
| A2 | Admin Registration Page | `4d64124095c14aa2acaa3c713d7a5b64` | `app/admin/register/page.tsx` | ✅ Done |
| A3 | Admin Dashboard Page | `60e436c11f1d4da889bd0a24c0fdd317` | `app/admin/dashboard/page.tsx` | ✅ Done |
| A4 | Student Requests Page | `0a8bf8e181474641963794cf321552d7` | `app/admin/requests/page.tsx` | ✅ Done |
| A5 | Product Management Page | — | `app/admin/products/page.tsx` | ⬜ Pending |
| A6 | Advertisement Manager Page | — | `app/admin/advertisements/page.tsx` | ⬜ Pending |
| A7 | College Revenue Page | — | `app/admin/revenue/page.tsx` | ⬜ Pending |
| A8 | Admin Profile/Settings Page | — | `app/admin/settings/page.tsx` | ⬜ Pending |

## File System Layout (Admin Panel)

```
frontend/app/admin/
├── layout.tsx                        ← Admin route layout (imports AdminLayoutClient)
├── AdminLayoutClient.tsx             ← Green-themed sidebar + nav wrapper
├── login/
│   └── page.tsx                      ← A1: Admin Login (two-column, green theme)
├── register/
│   └── page.tsx                      ← A2: Admin Registration (2-step multi-form)
├── dashboard/
│   └── page.tsx                      ← A3: Admin Dashboard (stats + activity + queues)
├── requests/
│   └── page.tsx                      ← A4: Student Requests (pending/approved tabs + modal)
├── products/
│   └── page.tsx                      ← A5: Product Management (⬜ next)
├── advertisements/
│   └── page.tsx                      ← A6: Advertisement Manager (⬜ next)
├── revenue/
│   └── page.tsx                      ← A7: College Revenue (⬜ next)
└── settings/
    └── page.tsx                      ← A8: Admin Settings (⬜ next)
```

## Design System Applied

- **Theme**: Dark (`#0A0E1A` bg) + **GREEN** accent (`#10B981`) — Admin panel
- **Fonts**: Sora (headings) + DM Sans (body) + JetBrains Mono (codes)
- **Sidebar**: 240px fixed, `#0d1220` bg, green active state with left border indicator
- **Cards**: `#111827` bg, `#1e2d45` border, `14px` radius
- **Buttons**: Pill shape (`9999px`), green gradient, hover lift + glow
- **Inputs**: `#1a2235` bg, focus green border + glow

## Stitch Project

- **Project ID**: `6758598250339151054`
- **Canvas**: All 4 screens rendered in the Stitch canvas with Emerald Ledger / Lumina Academic design system

## Functionality Implemented

### A1 — Admin Login
- Admin email + college code + password form
- JetBrains Mono for college code field
- Show/hide password toggle
- Routes to `/admin/dashboard`
- Links to `/admin/register` and `/login`

### A2 — Admin Registration
- 2-step form: College Info → Admin Account
- Step progress indicator
- Password strength bar (Weak/Medium/Strong)
- College type dropdown
- Authorization checkbox
- 24-48hr review info card

### A3 — Admin Dashboard
- 4 stat cards: Students (green), Products (blue), Revenue (gold), Pending (orange pulsing)
- Quick student requests with Approve/Reject
- Quick products needing review
- Full-width recent activity timeline feed

### A4 — Student Requests
- Pending / Approved tab switcher with counts
- Request cards: avatar, enrollment email, domain match badge, Approve/Reject buttons
- Rejection modal with optional reason textarea
- Approved tab: searchable student table with View Profile + Suspend actions
- State management for approve/reject
