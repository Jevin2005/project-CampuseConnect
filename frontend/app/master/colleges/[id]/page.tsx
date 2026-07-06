'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../../../store/authStore';

const API = 'http://localhost:5000/api/master';

const S = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
:root {
  --bg: #080C14; --card: rgba(15,23,42,.92); --card2: rgba(20,30,55,.94);
  --border: rgba(99,130,190,.15); --border-glow: rgba(247,201,72,.4);
  --gold: #F7C948; --gold2: #F59E0B; --blue: #4F8EF7; --green: #10B981;
  --purple: #7C3AED; --red: #EF4444; --orange: #F59E0B;
  --t1: #F0F4FF; --t2: #9CA3AF; --t3: #6B7280;
}
* { box-sizing: border-box; }
.pg {
  padding: 36px; min-height: 100vh; background: var(--bg);
  background-image: radial-gradient(ellipse 60% 30% at 50% 0%, rgba(247,201,72,.04) 0%, transparent 70%);
  font-family: 'DM Sans', sans-serif;
}

/* Back btn */
.back {
  display: inline-flex; align-items: center; gap: 8px;
  text-decoration: none; color: var(--t2); font-size: 12px;
  font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
  margin-bottom: 26px; transition: all .25s ease;
  padding: 8px 16px;
  background: rgba(20, 30, 55, 0.5);
  border: 1px solid var(--border);
  border-radius: 9999px;
}
.back:hover {
  color: var(--gold);
  border-color: rgba(247, 201, 72, 0.35);
  background: rgba(247, 201, 72, 0.06);
  box-shadow: 0 0 12px rgba(247, 201, 72, 0.08);
  transform: translateX(-3px);
}

/* College header card */
.hcard {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 20px; padding: 30px 34px;
  display: flex; align-items: flex-start; justify-content: space-between; gap: 24px;
  margin-bottom: 24px; backdrop-filter: blur(16px);
  position: relative; overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,.3);
}
.hcard::before {
  content: '';
  position: absolute; inset: 0; border-radius: 20px;
  background: linear-gradient(135deg, rgba(255,255,255,.03) 0%, transparent 55%);
  pointer-events: none;
}
.hcard::after {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent 0%, var(--gold) 35%, #fff8 52%, var(--gold2) 65%, transparent 100%);
  opacity: .8;
}
.hcard-name { font-family: 'Sora', sans-serif; font-size: 28px; font-weight: 800; color: var(--t1); margin-bottom: 14px; letter-spacing: -0.5px; }
.badge-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.badge { padding: 5px 13px; border-radius: 9999px; font-size: 12px; font-weight: 700; transition: opacity .2s; }
.b-blue   { background: rgba(79,142,247,.12);  color: var(--blue);   border: 1px solid rgba(79,142,247,.28); }
.b-green  { background: rgba(16,185,129,.12);  color: var(--green);  border: 1px solid rgba(16,185,129,.28); }
.b-gold   { background: rgba(247,201,72,.12);  color: var(--gold);   border: 1px solid rgba(247,201,72,.28); font-family: 'JetBrains Mono',monospace; font-size: 11px; }
.b-purple { background: rgba(124,58,237,.12);  color: var(--purple); border: 1px solid rgba(124,58,237,.28); }
.b-mono   { font-family: 'JetBrains Mono',monospace; font-size: 11px; }
.admins-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.admin-chip {
  display: flex; align-items: center; gap: 8px;
  background: rgba(20,30,55,.8); border: 1px solid rgba(99,130,190,.2);
  border-radius: 10px; padding: 7px 14px; font-size: 12px;
  transition: border-color .2s;
}
.admin-chip:hover { border-color: rgba(79,142,247,.35); }
.admin-av { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: #fff; flex-shrink: 0; }
.admin-name { color: var(--t1); font-weight: 600; font-size: 13px; }
.admin-email { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--t3); margin-top: 1px; }
.hcard-actions { display: flex; flex-direction: column; gap: 10px; align-items: flex-end; flex-shrink: 0; margin-top: 4px; }
.btn-contact {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 9px 20px; border-radius: 9999px; border: 1px solid rgba(79, 142, 247, 0.35);
  background: rgba(79, 142, 247, 0.08); color: var(--blue); font-size: 12px; font-weight: 700;
  cursor: pointer; font-family: 'DM Sans',sans-serif; transition: all 0.25s ease; white-space: nowrap;
}
.btn-contact:hover {
  background: rgba(79, 142, 247, 0.16);
  border-color: var(--blue);
  box-shadow: 0 0 16px rgba(79, 142, 247, 0.25);
  transform: translateY(-1px);
}
.btn-suspend {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 9px 20px; border-radius: 9999px; border: 1px solid rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.06); color: var(--red); font-size: 12px; font-weight: 700;
  cursor: pointer; font-family: 'DM Sans',sans-serif; transition: all 0.25s ease; white-space: nowrap;
}
.btn-suspend:hover {
  background: rgba(239, 68, 68, 0.14);
  border-color: var(--red);
  box-shadow: 0 0 16px rgba(239, 68, 68, 0.25);
  transform: translateY(-1px);
}
.btn-approve {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 9px 20px; border-radius: 9999px; border: 1px solid rgba(16, 185, 129, 0.35);
  background: rgba(16, 185, 129, 0.08); color: var(--green); font-size: 12px; font-weight: 700;
  cursor: pointer; font-family: 'DM Sans',sans-serif; transition: all 0.25s ease; white-space: nowrap;
}
.btn-approve:hover {
  background: rgba(16, 185, 129, 0.16);
  border-color: var(--green);
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.25);
  transform: translateY(-1px);
}

/* Stat cards grid */
.stat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px; }
.stat-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 16px; padding: 22px 24px;
  backdrop-filter: blur(16px);
  transition: transform .2s, border-color .25s, box-shadow .25s;
  position: relative; overflow: hidden;
}
.stat-card::before {
  content: ''; position: absolute; inset: 0; border-radius: 16px;
  background: linear-gradient(135deg, rgba(255,255,255,.025) 0%, transparent 60%);
  pointer-events: none;
}
.stat-card:hover { transform: translateY(-4px); border-color: var(--border-glow); box-shadow: 0 12px 36px rgba(0,0,0,.3); }
.stat-icon { font-size: 24px; margin-bottom: 12px; }
.stat-val { font-family: 'Sora', sans-serif; font-size: 26px; font-weight: 800; display: block; margin-bottom: 5px; line-height: 1; }
.stat-lbl { font-size: 12px; color: var(--t3); font-weight: 600; letter-spacing: .2px; }
.stat-sub { font-size: 11px; color: var(--t3); margin-top: 6px; opacity: .8; }

/* Tabs */
.tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 24px; gap: 2px; }
.tab-btn {
  padding: 12px 24px; background: none; border: none;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
  cursor: pointer; color: var(--t3);
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: all 0.25s ease; border-radius: 8px 8px 0 0;
  letter-spacing: 0.3px;
}
.tab-btn:hover { color: var(--t2); background: rgba(255,255,255,.02); }
.tab-btn.on { color: var(--gold); border-bottom-color: var(--gold); background: linear-gradient(to top, rgba(247,201,72,.06), transparent); text-shadow: 0 0 10px rgba(247,201,72,.2); }

/* Table section */
.tbl-wrap { overflow-x: auto; }
.search-bar { display: flex; justify-content: flex-end; margin-bottom: 16px; }
.tbl-search-wrap { position: relative; }
.tbl-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 13px; color: var(--t3); pointer-events: none; }
.tbl-search {
  padding: 9px 14px 9px 36px; background: var(--card2); border: 1.5px solid var(--border);
  border-radius: 10px; color: var(--t1); font-family: 'DM Sans',sans-serif;
  font-size: 13px; outline: none; width: 260px; transition: border-color .2s, box-shadow .2s;
}
.tbl-search:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(247,201,72,.1); }
.tbl-search::placeholder { color: #3d4f6b; }
table { width: 100%; border-collapse: collapse; background: var(--card); border-radius: 14px; overflow: hidden; border: 1px solid var(--border); }
th { padding: 12px 16px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: var(--t3); border-bottom: 1px solid var(--border); white-space: nowrap; background: rgba(8,12,24,.5); }
td { padding: 14px 16px; font-size: 13px; color: var(--t2); border-bottom: 1px solid rgba(99,130,190,.08); white-space: nowrap; }
tr:last-child td { border-bottom: none; }
tr:hover td { background: rgba(247,201,72,.03); }
.av { width: 36px; height: 36px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #fff; flex-shrink: 0; }
.nc { display: flex; align-items: center; gap: 10px; }
.nn { font-weight: 600; color: var(--t1); font-size: 13px; white-space: nowrap; }
.ne { font-family: 'JetBrains Mono',monospace; font-size: 10px; color: var(--t3); margin-top: 2px; }
.mono { font-family: 'JetBrains Mono',monospace; font-size: 11px; }

/* Pills */
.pill { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; white-space: nowrap; }
.p-green  { background: rgba(16,185,129,.12);  color: var(--green);  border: 1px solid rgba(16,185,129,.2); }
.p-red    { background: rgba(239,68,68,.12);   color: var(--red);    border: 1px solid rgba(239,68,68,.2); }
.p-orange { background: rgba(245,158,11,.12);  color: var(--orange); border: 1px solid rgba(245,158,11,.2); }
.p-blue   { background: rgba(79,142,247,.12);  color: var(--blue);   border: 1px solid rgba(79,142,247,.2); }
.p-purple { background: rgba(124,58,237,.12);  color: var(--purple); border: 1px solid rgba(124,58,237,.2); }
.p-gray   { background: rgba(107,114,128,.12); color: var(--t3);     border: 1px solid rgba(107,114,128,.2); }

/* Action buttons */
.act-view {
  padding: 5px 12px; border-radius: 9999px; border: 1px solid rgba(79, 142, 247, 0.3);
  background: rgba(79, 142, 247, 0.06); color: var(--blue); font-size: 11px; font-weight: 700;
  cursor: pointer; font-family: 'DM Sans',sans-serif; transition: all 0.2s ease;
  display: inline-flex; align-items: center; gap: 4px;
}
.act-view:hover {
  background: rgba(79, 142, 247, 0.16);
  border-color: var(--blue);
  box-shadow: 0 0 10px rgba(79, 142, 247, 0.2);
  transform: translateY(-0.5px);
}
.act-sus {
  padding: 5px 12px; border-radius: 9999px; border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.06); color: var(--red); font-size: 11px; font-weight: 700;
  cursor: pointer; font-family: 'DM Sans',sans-serif; margin-left: 6px; transition: all 0.2s ease;
  display: inline-flex; align-items: center; gap: 4px;
}
.act-sus:hover {
  background: rgba(239, 68, 68, 0.16);
  border-color: var(--red);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
  transform: translateY(-0.5px);
}
.act-app {
  padding: 5px 12px; border-radius: 9999px; border: 1px solid rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.06); color: var(--green); font-size: 11px; font-weight: 700;
  cursor: pointer; font-family: 'DM Sans',sans-serif; margin-left: 6px; transition: all 0.2s ease;
  display: inline-flex; align-items: center; gap: 4px;
}
.act-app:hover {
  background: rgba(16, 185, 129, 0.16);
  border-color: var(--green);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
  transform: translateY(-0.5px);
}
.act-rem {
  padding: 5px 12px; border-radius: 9999px; border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.06); color: var(--red); font-size: 11px; font-weight: 700;
  cursor: pointer; font-family: 'DM Sans',sans-serif; transition: all 0.2s ease;
  display: inline-flex; align-items: center; gap: 4px;
}
.act-rem:hover {
  background: rgba(239, 68, 68, 0.16);
  border-color: var(--red);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
  transform: translateY(-0.5px);
}

/* Toast Notification */
.toast-container {
  position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  background: rgba(15, 23, 42, 0.95);
  border: 1.5px solid rgba(247, 201, 72, 0.35);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(247,201,72,0.15);
  padding: 12px 22px; border-radius: 12px;
  color: var(--t1); font-size: 13px; font-weight: 600;
  display: flex; align-items: center; gap: 10px;
  backdrop-filter: blur(12px);
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideIn {
  from { transform: translateY(20px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

/* Revenue tab */
.rev-section { display: flex; flex-direction: column; gap: 24px; }
.rev-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.rev-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 16px; padding: 24px 22px; text-align: center;
  backdrop-filter: blur(16px); transition: transform .2s, border-color .25s, box-shadow .25s;
  position: relative; overflow: hidden;
}
.rev-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  border-radius: 16px 16px 0 0;
  background: var(--accent, rgba(247,201,72,.5));
  opacity: .7;
}
.rev-card:hover { transform: translateY(-4px); border-color: var(--border-glow); box-shadow: 0 12px 36px rgba(0,0,0,.3); }
.rev-val { font-family: 'Sora',sans-serif; font-size: 26px; font-weight: 800; display: block; margin-bottom: 7px; line-height: 1; }
.rev-lbl { font-size: 12px; color: var(--t2); font-weight: 600; }
.rev-sub { font-size: 11px; color: var(--t3); margin-top: 5px; opacity: .8; }
.rev-contribution {
  background: var(--card);
  border: 1px solid rgba(247,201,72,.25);
  border-radius: 16px; padding: 26px 30px;
  display: flex; align-items: center; gap: 30px;
  backdrop-filter: blur(16px);
  box-shadow: 0 0 40px rgba(247,201,72,.06), inset 0 1px 0 rgba(247,201,72,.08);
}
.rev-pct { font-family: 'Sora',sans-serif; font-size: 52px; font-weight: 800; color: var(--gold); line-height: 1; flex-shrink: 0; text-shadow: 0 0 40px rgba(247,201,72,.4); }
.rev-pct-info { flex: 1; }
.rev-pct-title { font-family: 'Sora',sans-serif; font-size: 17px; font-weight: 700; color: var(--t1); margin-bottom: 7px; }
.rev-pct-sub { font-size: 13px; color: var(--t2); margin-bottom: 14px; line-height: 1.6; }
.progress-wrap { background: rgba(20,32,60,.9); border-radius: 9999px; height: 10px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 9999px; background: linear-gradient(90deg, #F7C948, #F59E0B); transition: width .9s ease; box-shadow: 0 0 10px rgba(247,201,72,.5); }
.rev-orders-row { display: flex; gap: 16px; margin-top: 14px; }
.rev-orders-chip {
  display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--t3);
  background: rgba(20,32,60,.6); border: 1px solid var(--border);
  border-radius: 9999px; padding: 4px 12px;
}
.rev-orders-chip strong { color: var(--t1); font-family: 'Sora',sans-serif; font-size: 13px; }

/* Empty table */
.empty-tbl { padding: 48px; text-align: center; color: var(--t3); font-size: 13px; }
.empty-tbl-icon { font-size: 36px; margin-bottom: 10px; opacity: .5; }

/* Skeleton */
.skeleton { background: linear-gradient(90deg, rgba(20,30,55,.9) 25%, rgba(32,48,84,.9) 50%, rgba(20,30,55,.9) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
@keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }

/* Error */
.err-box { background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.25); border-radius: 14px; padding: 24px 28px; color: var(--red); font-size: 14px; text-align: center; }

@media (max-width: 768px) {
  .pg { padding: 20px 16px; }
  .hdr { flex-direction: column; align-items: flex-start; gap: 12px; }
  .hdr-left h1 { font-size: 24px; }
  
  .hcard { flex-direction: column; align-items: stretch; padding: 20px 24px; gap: 18px; }
  .hcard-actions { align-items: stretch; width: 100%; }
  .btn-contact, .btn-suspend, .btn-approve { width: 100%; justify-content: center; }
  
  .stat-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
  .stat-card { padding: 14px; }
  .stat-val { font-size: 18px; }
  
  .tabs { overflow-x: auto; white-space: nowrap; padding-bottom: 4px; }
  .tabs::-webkit-scrollbar { display: none; }
  .tab-btn { padding: 10px 16px; font-size: 12px; }
  
  .search-bar { width: 100%; }
  .tbl-search-wrap { width: 100%; }
  .tbl-search { width: 100% !important; }
  
  .rev-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
  .rev-card { padding: 14px; }
  .rev-val { font-size: 18px; }
  .rev-contribution { flex-direction: column; align-items: stretch; padding: 20px; gap: 16px; }
  .rev-pct { text-align: center; font-size: 36px; }
  
  .tbl-wrap { overflow: visible; }
  table, thead, tbody, th, td, tr { display: block; }
  thead { display: none; }
  tr {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    margin-bottom: 16px;
    padding: 16px;
    position: relative;
  }
  td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px dashed rgba(99, 130, 190, 0.15);
    padding: 10px 0;
    font-size: 13px;
    white-space: normal;
  }
  td:last-child {
    border-bottom: none;
  }
  td::before {
    content: attr(data-label);
    font-weight: 700;
    color: var(--t3);
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.5px;
    float: left;
  }
  
  /* Mobile header for Student card */
  td[data-label="Student"] {
    display: block;
    text-align: left;
    padding-bottom: 14px;
    margin-bottom: 6px;
    border-bottom: 1px solid var(--border);
  }
  td[data-label="Student"]::before { display: none !important; }
  
  /* Mobile header for Product card */
  td[data-label="Title"] {
    display: block;
    text-align: left;
    padding-bottom: 14px;
    margin-bottom: 6px;
    border-bottom: 1px solid var(--border);
    max-width: none !important;
  }
  td[data-label="Title"] span {
    max-width: none !important;
  }
  td[data-label="Title"]::before { display: none !important; }
  
  /* Mobile status badge placement */
  tr td[data-label="Status"] {
    position: absolute;
    top: 18px;
    right: 16px;
    border-bottom: none !important;
    padding: 0 !important;
    background: none !important;
  }
  tr td[data-label="Status"]::before { display: none !important; }
  
  /* Mobile action buttons placement */
  td[data-label="Actions"] {
    border-bottom: none !important;
    justify-content: stretch !important;
    gap: 8px;
    padding-top: 12px;
  }
  td[data-label="Actions"]::before { display: none !important; }
  .act-view, .act-sus, .act-app, .act-rem {
    flex: 1;
    justify-content: center !important;
    margin: 0 !important;
    padding: 10px !important;
  }
}
`;

// ─── Types ───────────────────────────────────────────────────────────────────
interface CollegeInfo {
  id: string; name: string; code: string; city: string; type: string;
  emailDomain: string; isApproved: boolean; joined: string; updatedAt: string;
  totalStudents: number; totalProducts: number;
}
interface AdminInfo {
  id: string; name: string; email: string; isApproved: boolean;
  isEmailVerified: boolean; joined: string;
}
interface StudentInfo {
  id: string; name: string; email: string; enrollmentId: string;
  phone: string; isApproved: boolean; status: string;
  products: number; purchases: number; joined: string;
}
interface ProductInfo {
  id: string; title: string; type: string; subType: string | null;
  price: string; priceRaw: number; seller: string; sellerEmail: string;
  status: string; isApproved: boolean; category: string; date: string;
}
interface RevenueInfo {
  grossRevenue: number; grossRevenueFormatted: string;
  platformFees: number; platformFeesFormatted: string;
  sellerCuts: number; sellerCutsFormatted: string;
  netSellerTotal: number; netSellerTotalFormatted: string;
  listingFeeRevenue: number; listingFeeRevenueFormatted: string;
  completedOrders: number; revPct: number;
  platformTotal: number; platformTotalFormatted: string;
}
interface CollegeData {
  college: CollegeInfo;
  admins: AdminInfo[];
  students: StudentInfo[];
  products: ProductInfo[];
  revenue: RevenueInfo;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const COLORS = ['#4F8EF7','#10B981','#7C3AED','#F59E0B','#EC4899','#14B8A6','#F97316'];
function avatarColor(name: string) { return COLORS[name.charCodeAt(0) % COLORS.length]; }
function initials(name: string) { return name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase(); }

function StatusPill({ s }: { s: string }) {
  const map: Record<string, string> = {
    Active: 'p-green', approved: 'p-green', available: 'p-green',
    Pending: 'p-orange', pending_review: 'p-orange', pending: 'p-orange',
    Suspended: 'p-red', rejected: 'p-red', removed: 'p-gray',
    sold: 'p-blue', physical: 'p-blue', digital: 'p-purple',
  };
  const norm = s?.replace('_', ' ');
  return <span className={`pill ${map[s] ?? 'p-gray'}`}>{norm}</span>;
}

export default function CollegeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { accessToken } = useAuthStore();
  const [data, setData] = useState<CollegeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'students' | 'products' | 'revenue'>('students');
  const [search, setSearch] = useState('');

  // UI feedback states
  const [toast, setToast] = useState('');
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [confirmStudentId, setConfirmStudentId] = useState<string | null>(null);
  const [confirmProductId, setConfirmProductId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    // Clear any previous timeouts if multiple triggers occur quickly
    setTimeout(() => {
      setToast(prev => prev === msg ? '' : prev);
    }, 4000);
  };

  const handleSuspendCollege = () => {
    if (!confirmSuspend) {
      setConfirmSuspend(true);
      setTimeout(() => setConfirmSuspend(false), 5000);
    } else {
      if (!data) return;
      const nextState = !data.college.isApproved;
      setData({
        ...data,
        college: {
          ...data.college,
          isApproved: nextState
        }
      });
      showToast(nextState ? "College marketplace activated! ✓" : "College marketplace suspended! ⏸️");
      setConfirmSuspend(false);
    }
  };

  const handleToggleStudent = (studentId: string, currentStatus: string) => {
    if (confirmStudentId !== studentId) {
      setConfirmStudentId(studentId);
      setTimeout(() => setConfirmStudentId(prev => prev === studentId ? null : prev), 4000);
    } else {
      if (!data) return;
      const isSus = currentStatus === 'Suspended' || currentStatus === 'pending' || currentStatus === 'Pending';
      const nextStatus = isSus ? 'Active' : 'Suspended';
      const nextIsApproved = nextStatus === 'Active';
      setData({
        ...data,
        students: data.students.map(s => s.id === studentId ? { ...s, status: nextStatus, isApproved: nextIsApproved } : s)
      });
      showToast(nextIsApproved ? "Student account approved! ✓" : "Student account suspended! ⏸️");
      setConfirmStudentId(null);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    if (confirmProductId !== productId) {
      setConfirmProductId(productId);
      setTimeout(() => setConfirmProductId(prev => prev === productId ? null : prev), 4000);
    } else {
      if (!data) return;
      setData({
        ...data,
        products: data.products.map(p => p.id === productId ? { ...p, status: 'removed', isApproved: false } : p)
      });
      showToast("Product listing removed! 🗑️");
      setConfirmProductId(null);
    }
  };

  useEffect(() => {
    if (!accessToken || !id) return;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API}/colleges/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error(`Failed to load college: ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken, id]);

  // Filtered lists
  const filteredStudents = (data?.students ?? []).filter(s => {
    const q = search.toLowerCase();
    return !search || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.enrollmentId.toLowerCase().includes(q);
  });
  const filteredProducts = (data?.products ?? []).filter(p => {
    const q = search.toLowerCase();
    return !search || p.title.toLowerCase().includes(q) || p.seller.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <>
        <style>{S}</style>
        <div className="pg">
          <div className="skeleton" style={{ height: 14, width: 120, marginBottom: 24, borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 140, borderRadius: 18, marginBottom: 24 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
            {Array(4).fill(0).map((_,i) => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 14 }} />)}
          </div>
          <div className="skeleton" style={{ height: 44, marginBottom: 24, borderRadius: 14 }} />
          <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <style>{S}</style>
        <div className="pg">
          <Link href="/master/colleges" className="back">← All Colleges</Link>
          <div className="err-box">⚠️ {error || 'College not found'}</div>
        </div>
      </>
    );
  }

  const { college, admins, students, products, revenue } = data;

  const statCards = [
    { icon: '🎓', val: college.totalStudents.toLocaleString('en-IN'),   lbl: 'Total Students',   color: '#4F8EF7', sub: `${students.filter(s => s.isApproved).length} active` },
    { icon: '📦', val: college.totalProducts.toLocaleString('en-IN'),   lbl: 'Total Listings',   color: '#7C3AED', sub: `${products.filter(p => p.isApproved).length} approved` },
    { icon: '💰', val: revenue.grossRevenueFormatted,                    lbl: 'Gross Revenue',    color: '#F7C948', sub: `${revenue.completedOrders} completed orders` },
    { icon: '📅', val: new Date(college.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), lbl: 'Member Since', color: '#F0F4FF', sub: `Updated ${new Date(college.updatedAt).toLocaleDateString('en-IN')}` },
  ];

  return (
    <>
      <style>{S}</style>
      <div className="pg">
        <Link href="/master/colleges" className="back">← All Colleges</Link>

        {/* Header Card */}
        <div className="hcard">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="hcard-name">{college.name}</div>
            <div className="badge-row">
              <span className="badge b-blue">📍 {college.city}</span>
              <span className="badge b-green">{college.type}</span>
              <span className="badge b-gold b-mono">#{college.code}</span>
              <span className="badge b-purple">@{college.emailDomain}</span>
              <span className={`badge ${college.isApproved ? 'b-green' : 'b-red'}`}>
                {college.isApproved ? '✓ Active' : '🚫 Suspended'}
              </span>
            </div>
            <div className="admins-row">
              {admins.length === 0 ? (
                <span style={{ fontSize: 12, color: 'var(--t3)' }}>No admin assigned</span>
              ) : admins.map(a => (
                <div className="admin-chip" key={a.id}>
                  <div className="admin-av" style={{ background: avatarColor(a.name) }}>{initials(a.name)}</div>
                  <div>
                    <div className="admin-name">{a.name}</div>
                    <div className="admin-email">{a.email}</div>
                  </div>
                  {a.isApproved && <span style={{ fontSize: 10, color: 'var(--green)' }}>✓</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="hcard-actions">
            {admins[0] && (
              <button className="btn-contact" onClick={() => {
                window.open(`mailto:${admins[0].email}`);
                showToast(`Opening mail client for ${admins[0].email} ✉`);
              }}>
                ✉ Contact Admin
              </button>
            )}
            <button 
              className={college.isApproved ? "btn-suspend" : "btn-approve"} 
              onClick={handleSuspendCollege}
            >
              {college.isApproved 
                ? (confirmSuspend ? "⚠️ Confirm Suspend?" : "🚫 Suspend Marketplace")
                : (confirmSuspend ? "⚠️ Confirm Activate?" : "✓ Activate Marketplace")
              }
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="stat-grid">
          {statCards.map(s => (
            <div className="stat-card" key={s.lbl}>
              <div className="stat-icon">{s.icon}</div>
              <span className="stat-val" style={{ color: s.color }}>{s.val}</span>
              <span className="stat-lbl">{s.lbl}</span>
              {s.sub && <div className="stat-sub">{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {([
            { key: 'students', label: `👥 Students (${college.totalStudents})` },
            { key: 'products', label: `📦 Products (${college.totalProducts})` },
            { key: 'revenue',  label: '💰 Revenue' },
          ] as const).map(t => (
            <button
              key={t.key}
              className={`tab-btn ${tab === t.key ? 'on' : ''}`}
              onClick={() => { setTab(t.key); setSearch(''); }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Students Tab ── */}
        {tab === 'students' && (
          <>
            <div className="search-bar">
              <div className="tbl-search-wrap">
                <span className="tbl-search-icon">🔍</span>
                <input className="tbl-search" placeholder="Search by name, email or ID…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Enrollment ID</th>
                    <th>Phone</th>
                    <th>Listings</th>
                    <th>Purchases</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr><td colSpan={8}>
                      <div className="empty-tbl"><div className="empty-tbl-icon">🎓</div>No students found</div>
                    </td></tr>
                  ) : filteredStudents.map(s => (
                    <tr key={s.id}>
                      <td data-label="Student">
                        <div className="nc">
                          <div className="av" style={{ background: `linear-gradient(135deg, ${avatarColor(s.name)}, ${avatarColor(s.name)}99)` }}>{initials(s.name)}</div>
                          <div>
                            <div className="nn">{s.name}</div>
                            <div className="ne">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td data-label="ID"><span className="mono" style={{ color: 'var(--t3)' }}>{s.enrollmentId}</span></td>
                      <td data-label="Phone"><span className="mono" style={{ color: 'var(--t3)' }}>{s.phone}</span></td>
                      <td data-label="Listings"><span className="pill p-blue">{s.products}</span></td>
                      <td data-label="Purchases"><span className="pill p-purple">{s.purchases}</span></td>
                      <td data-label="Joined" style={{ fontSize: 12, color: 'var(--t3)' }}>
                        {new Date(s.joined).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td data-label="Status"><StatusPill s={s.status} /></td>
                      <td data-label="Actions">
                        <button className="act-view" onClick={() => showToast(`Viewing profile of ${s.name} (Enrollment: ${s.enrollmentId}) 🎓`)}>👁 View</button>
                        {s.status === 'Active' || s.status === 'approved' ? (
                          <button 
                            className="act-sus" 
                            onClick={() => handleToggleStudent(s.id, s.status)}
                          >
                            {confirmStudentId === s.id ? "⚠️ Confirm?" : "🚫 Suspend"}
                          </button>
                        ) : (
                          <button 
                            className="act-app" 
                            onClick={() => handleToggleStudent(s.id, s.status)}
                          >
                            {confirmStudentId === s.id ? "⚠️ Confirm?" : "✓ Approve"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Products Tab ── */}
        {tab === 'products' && (
          <>
            <div className="search-bar">
              <div className="tbl-search-wrap">
                <span className="tbl-search-icon">🔍</span>
                <input className="tbl-search" placeholder="Search by title, seller or category…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Seller</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr><td colSpan={8}>
                      <div className="empty-tbl"><div className="empty-tbl-icon">📦</div>No products found</div>
                    </td></tr>
                  ) : filteredProducts.map(p => (
                    <tr key={p.id}>
                      <td data-label="Title" style={{ maxWidth: 200 }}>
                        <span style={{ fontWeight: 600, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: 200 }}>
                          {p.title}
                        </span>
                      </td>
                      <td data-label="Type">
                        <span className={`pill ${p.type === 'digital' ? 'p-purple' : 'p-blue'}`}>
                          {p.type === 'digital' ? '📱' : '📦'} {p.type}
                        </span>
                      </td>
                      <td data-label="Category" style={{ fontSize: 12, color: 'var(--t3)' }}>{p.category}</td>
                      <td data-label="Price">
                        <span className="mono" style={{ color: 'var(--green)', fontWeight: 700 }}>{p.price}</span>
                      </td>
                      <td data-label="Seller">
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--t1)', fontSize: 13 }}>{p.seller}</div>
                          <div className="ne">{p.sellerEmail}</div>
                        </div>
                      </td>
                      <td data-label="Status"><StatusPill s={p.status} /></td>
                      <td data-label="Date" style={{ fontSize: 12, color: 'var(--t3)' }}>{p.date}</td>
                      <td data-label="Actions">
                        <button className="act-view" onClick={() => showToast(`Viewing listing: "${p.title}" by ${p.seller} 📦`)}>👁 View</button>
                        {p.status !== 'removed' && p.status !== 'sold' && (
                          <button 
                            className="act-rem" 
                            style={{ marginLeft: 6 }}
                            onClick={() => handleRemoveProduct(p.id)}
                          >
                            {confirmProductId === p.id ? "⚠️ Confirm?" : "🗑 Remove"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Revenue Tab ── */}
        {tab === 'revenue' && (
          <div className="rev-section">
            {/* Revenue cards */}
            <div className="rev-grid">
              {[
                { val: revenue.grossRevenueFormatted,       lbl: 'Gross Revenue',     sub: 'Total sales volume',         color: '#F7C948' },
                { val: revenue.platformFeesFormatted,       lbl: 'Platform Fees',     sub: 'Buyer fees collected',       color: '#4F8EF7' },
                { val: revenue.listingFeeRevenueFormatted,  lbl: 'Listing Fees',      sub: 'From product listings',      color: '#10B981' },
                { val: revenue.sellerCutsFormatted,         lbl: 'Seller Deductions', sub: 'Cut from seller payouts',    color: '#7C3AED' },
                { val: revenue.netSellerTotalFormatted,     lbl: 'Net to Sellers',    sub: 'After platform deductions',  color: '#EC4899' },
                { val: revenue.completedOrders.toLocaleString('en-IN'), lbl: 'Completed Orders', sub: 'Successfully closed deals', color: '#F0F4FF' },
              ].map(r => (
                <div className="rev-card" key={r.lbl} style={{ ['--accent' as any]: r.color }}>
                  <span className="rev-val" style={{ color: r.color }}>{r.val}</span>
                  <div className="rev-lbl">{r.lbl}</div>
                  <div className="rev-sub">{r.sub}</div>
                </div>
              ))}
            </div>

            {/* Platform contribution */}
            <div className="rev-contribution">
              <div className="rev-pct">{revenue.revPct}%</div>
              <div className="rev-pct-info">
                <div className="rev-pct-title">Platform Revenue Contribution</div>
                <div className="rev-pct-sub">
                  <strong style={{ color: 'var(--t1)' }}>{college.name}</strong> contributes{' '}
                  <strong style={{ color: 'var(--gold)' }}>{revenue.revPct}%</strong> of the platform's total revenue of{' '}
                  <strong style={{ color: 'var(--t1)' }}>{revenue.platformTotalFormatted}</strong>
                </div>
                <div className="progress-wrap">
                  <div className="progress-fill" style={{ width: `${Math.min(revenue.revPct, 100)}%` }} />
                </div>
                <div className="rev-orders-row">
                  <div className="rev-orders-chip">
                    <span>🧾</span>
                    <span><strong>{revenue.completedOrders}</strong> completed orders</span>
                  </div>
                  <div className="rev-orders-chip">
                    <span>🏦</span>
                    <span>Platform total: <strong>{revenue.platformTotalFormatted}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary table */}
            <table>
              <thead>
                <tr>
                  <th>Revenue Stream</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'right' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { stream: '💰 Gross Sales', amt: revenue.grossRevenueFormatted, note: 'Total transaction value', color: 'var(--gold)' },
                  { stream: '🏦 Platform Buyer Fees', amt: revenue.platformFeesFormatted, note: 'Charged to buyers on digital products', color: 'var(--blue)' },
                  { stream: '📋 Listing Fees', amt: revenue.listingFeeRevenueFormatted, note: 'Upfront fee to list digital products', color: 'var(--green)' },
                  { stream: '✂️ Seller Deductions', amt: revenue.sellerCutsFormatted, note: 'Platform cut from seller proceeds', color: 'var(--purple)' },
                  { stream: '👤 Net Seller Payouts', amt: revenue.netSellerTotalFormatted, note: 'What sellers actually receive', color: '#EC4899' },
                ].map(r => (
                  <tr key={r.stream}>
                    <td data-label="Stream" style={{ color: 'var(--t1)', fontWeight: 600 }}>{r.stream}</td>
                    <td data-label="Amount" style={{ textAlign: 'right' }}>
                      <span className="mono" style={{ color: r.color, fontWeight: 700 }}>{r.amt}</span>
                    </td>
                    <td data-label="Notes" style={{ textAlign: 'right', fontSize: 12, color: 'var(--t3)' }}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Floating Toast Notification */}
        {toast && (
          <div className="toast-container">
            <span>🔔</span>
            <span>{toast}</span>
          </div>
        )}
      </div>
    </>
  );
}
