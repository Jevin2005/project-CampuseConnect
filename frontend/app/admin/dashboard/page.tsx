'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../../store/authStore';
import api from '@/lib/axios';

interface TopSeller {
  id: string; name: string; email: string; initials: string;
  color: string; soldCount: number; revenue: number;
}
interface ProductBreakdown { active: number; pending: number; sold: number; removed: number; }
interface RecentTx {
  id: string; productTitle: string; buyer: string; seller: string;
  amount: string; platformCut: string; date: string;
}
interface RecentListing {
  id: string; title: string; category: string; price: string;
  seller: string; sellerInitials: string; sellerColor: string;
  status: string; date: string;
}
interface DashData {
  stats: {
    totalStudents: number; pendingStudents: number; totalProducts: number;
    pendingProducts: number; revenue: number; totalOrders: number; soldProducts: number;
  };
  productBreakdown: ProductBreakdown;
  topSellers: TopSeller[];
  recentTransactions: RecentTx[];
  recentListings: RecentListing[];
  pendingRequests: { id: string; name: string; email: string; initials: string; color: string; date: string }[];
  college: { name: string };
  adminName: string;
}

const C = {
  green: '#10B981', blue: '#4F8EF7', gold: '#F7C948',
  orange: '#F59E0B', red: '#EF4444', purple: '#8B5CF6',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function relTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
  :root {
    --bg:#0A0E1A; --card:#111827; --card2:#1a2235; --border:#1e2d45;
    --green:#10B981; --blue:#4F8EF7; --gold:#F7C948; --org:#F59E0B;
    --red:#EF4444; --purple:#8B5CF6;
    --t1:#F0F4FF; --t2:#9CA3AF; --t3:#6B7280;
  }
  *{box-sizing:border-box}
  .dp{background:var(--bg);min-height:100vh;padding:36px 40px;animation:fi .4s ease;font-family:'DM Sans',sans-serif}
  @keyframes fi{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

  /* ── Header ── */
  .hdr{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:28px;gap:16px;flex-wrap:wrap}
  .hdr-left{}
  .greeting{font-family:'Sora',sans-serif;font-size:26px;font-weight:700;color:var(--t1);margin:0 0 4px}
  .greeting-sub{font-size:13px;color:var(--t3)}
  .refresh-btn{background:var(--card2);border:1px solid var(--border);color:var(--t2);padding:8px 16px;border-radius:9999px;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;display:flex;align-items:center;gap:6px}
  .refresh-btn:hover{color:var(--t1);border-color:var(--green)}
  .refresh-btn.spinning svg{animation:spin .7s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}

  /* ── Alert Panel ── */
  .alerts{display:flex;flex-direction:column;gap:8px;margin-bottom:22px}
  .alert{display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;font-size:13px;font-weight:500;border:1px solid}
  .alert-urgent{background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.3);color:#FCA5A5}
  .alert-warn{background:rgba(245,158,11,.08);border-color:rgba(245,158,11,.3);color:#FCD34D}
  .alert-info{background:rgba(79,142,247,.08);border-color:rgba(79,142,247,.3);color:#93C5FD}
  .alert-icon{font-size:16px;flex-shrink:0}
  .alert-action{margin-left:auto;font-size:11px;font-weight:700;opacity:.8;text-decoration:none;padding:3px 10px;border-radius:9999px;border:1px solid currentColor}
  .alert-action:hover{opacity:1}

  /* ── Quick Actions ── */
  .qa-row{display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap}
  .qa-btn{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;border:1px solid;transition:all .2s;text-decoration:none;white-space:nowrap}
  .qa-btn:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,.25)}
  .qa-green{background:rgba(16,185,129,.12);border-color:rgba(16,185,129,.35);color:var(--green)}
  .qa-blue{background:rgba(79,142,247,.12);border-color:rgba(79,142,247,.35);color:var(--blue)}
  .qa-gold{background:rgba(247,201,72,.1);border-color:rgba(247,201,72,.3);color:var(--gold)}
  .qa-purple{background:rgba(139,92,246,.1);border-color:rgba(139,92,246,.3);color:var(--purple)}

  /* ── Stat Grid ── */
  .stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
  .sc{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px;text-decoration:none;display:block;transition:transform .2s,box-shadow .2s;position:relative;overflow:hidden}
  .sc::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.02) 0%,transparent 60%);pointer-events:none}
  .sc:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,.35)}
  .sc-icon{font-size:24px;margin-bottom:10px;display:block}
  .sc-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--t3);margin-bottom:6px}
  .sc-val{font-family:'Sora',sans-serif;font-size:26px;font-weight:700;margin-bottom:4px;line-height:1}
  .sc-sub{font-size:11px;color:var(--t3);display:flex;align-items:center;gap:5px}
  .pulse-dot{width:7px;height:7px;border-radius:50%;background:var(--org);flex-shrink:0}

  /* ── Breakdown Bar ── */
  .bk-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:22px}
  .bk-title{font-family:'Sora',sans-serif;font-size:14px;font-weight:700;color:var(--t1);margin-bottom:14px;display:flex;align-items:center;gap:8px}
  .bk-bar{height:12px;border-radius:9999px;overflow:hidden;display:flex;margin-bottom:12px;background:var(--card2)}
  .bk-seg{height:100%;transition:width .6s cubic-bezier(.4,0,.2,1)}
  .bk-legend{display:flex;gap:20px;flex-wrap:wrap}
  .bk-leg{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--t2)}
  .bk-dot{width:10px;height:10px;border-radius:3px;flex-shrink:0}

  /* ── Mid Grid ── */
  .mid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px}
  .sec{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px}
  .sec-hdr{font-family:'Sora',sans-serif;font-size:15px;font-weight:700;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between}
  .view-all{font-size:11px;text-decoration:none;opacity:.75;font-weight:600}
  .view-all:hover{opacity:1}

  /* ── Student request items ── */
  .req-item{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid rgba(30,45,69,.6)}
  .req-item:last-child{border-bottom:none;padding-bottom:0}
  .av{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif;font-size:12px;font-weight:700;color:#0A0E1A;flex-shrink:0}
  .ri{flex:1;min-width:0}
  .rn{font-size:13px;font-weight:600;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .re{font-size:11px;color:var(--t3);font-family:'JetBrains Mono',monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .ract{display:flex;gap:6px;flex-shrink:0}
  .btn-ap{background:rgba(16,185,129,.13);border:1px solid rgba(16,185,129,.4);color:var(--green);padding:5px 11px;border-radius:9999px;font-size:11px;font-weight:700;cursor:pointer;transition:background .15s}
  .btn-ap:hover{background:rgba(16,185,129,.25)}
  .btn-rj{background:transparent;border:1px solid rgba(239,68,68,.4);color:var(--red);padding:5px 11px;border-radius:9999px;font-size:11px;font-weight:700;cursor:pointer;transition:background .15s}
  .btn-rj:hover{background:rgba(239,68,68,.1)}

  /* ── Product items ── */
  .prod-item{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid rgba(30,45,69,.6)}
  .prod-item:last-child{border-bottom:none;padding-bottom:0}
  .pib{width:34px;height:34px;border-radius:8px;background:var(--card2);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
  .pi{flex:1;min-width:0}
  .pt{font-size:13px;font-weight:600;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .ps{font-size:11px;color:var(--t3)}
  .pp{font-size:13px;font-weight:700;color:var(--green);flex-shrink:0;font-family:'JetBrains Mono',monospace}

  /* ── Top Sellers ── */
  .bot{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px}
  .seller-item{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid rgba(30,45,69,.6)}
  .seller-item:last-child{border-bottom:none;padding-bottom:0}
  .rank{width:22px;font-family:'Sora',sans-serif;font-size:13px;font-weight:700;color:var(--t3);text-align:center;flex-shrink:0}
  .rank-1{color:var(--gold)}
  .rank-2{color:var(--t2)}
  .rank-3{color:#CD7F32}
  .si-info{flex:1;min-width:0}
  .si-name{font-size:13px;font-weight:600;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .si-rev{font-size:11px;color:var(--green);font-family:'JetBrains Mono',monospace}
  .si-badge{background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.25);color:var(--green);padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:700;flex-shrink:0}

  /* ── Activity ── */
  .act-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:18px}
  .act-item{display:flex;align-items:flex-start;gap:14px;padding:12px 0;border-bottom:1px solid rgba(30,45,69,.5)}
  .act-item:last-child{border-bottom:none}
  .act-dot{width:9px;height:9px;border-radius:50%;background:var(--green);margin-top:5px;flex-shrink:0}
  .act-txt{font-size:13px;color:var(--t1);line-height:1.4}
  .act-time{font-size:11px;color:var(--t3);margin-top:3px;font-family:'JetBrains Mono',monospace}

  /* ── Skeletons / empty ── */
  .skeleton{background:linear-gradient(90deg,var(--card2) 25%,#202d42 50%,var(--card2) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  .empty{color:var(--t3);font-size:13px;padding:20px 0;text-align:center}

  /* ── Responsive ── */
  @media(max-width:1200px){.stat-grid{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:900px){.stat-grid{grid-template-columns:repeat(2,1fr)}.mid{grid-template-columns:1fr}.bot{grid-template-columns:1fr}}
  @media(max-width:640px){
    .dp{padding:20px 16px}
    .stat-grid{grid-template-columns:repeat(2,1fr) !important;gap:10px !important}
    .sc{padding:12px 14px !important}
    .sc-icon{font-size:20px !important;margin-bottom:6px !important}
    .sc-val{font-size:18px !important}
    .sc-lbl{font-size:9px !important;letter-spacing:0.8px !important;margin-bottom:4px !important}
    .sc-sub{font-size:10px !important}
    .hdr { flex-direction: column; align-items: flex-start; gap: 12px; }
    .greeting { font-size: 22px; }
  }
`;

export default function AdminDashboardPage() {
  const { accessToken } = useAuthStore();
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reqActs, setReqActs] = useState<Record<string, 'approved' | 'rejected'>>({});
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (!accessToken) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.get('/api/admin/dashboard');
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [accessToken]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handleReqAction = async (id: string, action: 'approve' | 'reject') => {
    const endpoint = action === 'approve' ? 'approve' : 'reject';
    await api.post(`/api/admin/students/${endpoint}`, { studentId: id });
    setReqActs(s => ({ ...s, [id]: action === 'approve' ? 'approved' : 'rejected' }));
  };

  const s = data?.stats;
  const bd = data?.productBreakdown;
  const bdTotal = (bd?.active ?? 0) + (bd?.pending ?? 0) + (bd?.sold ?? 0) + (bd?.removed ?? 0);
  const pct = (n: number) => bdTotal > 0 ? `${((n / bdTotal) * 100).toFixed(1)}%` : '0%';

  const alerts = [];
  if (!loading && s) {
    if ((s.pendingStudents ?? 0) >= 5)
      alerts.push({ type: 'urgent', icon: '🚨', msg: `${s.pendingStudents} student registrations awaiting approval`, href: '/admin/requests' });
    else if ((s.pendingStudents ?? 0) > 0)
      alerts.push({ type: 'warn', icon: '⏳', msg: `${s.pendingStudents} student${s.pendingStudents > 1 ? 's' : ''} pending approval`, href: '/admin/requests' });

  }

  return (
    <>
      <style>{STYLES}</style>

      <div className="dp">
        {/* ── Header ── */}
        <div className="hdr">
          <div className="hdr-left">
            <h1 className="greeting">
              {loading ? '👋 Welcome back' : `${getGreeting()}, ${data?.adminName || 'Admin'} 👋`}
            </h1>
            <p className="greeting-sub">
              {loading ? 'Loading dashboard…' : `${data?.college?.name} · ${today}`}
            </p>
          </div>
          <button
            className={`refresh-btn${refreshing ? ' spinning' : ''}`}
            onClick={() => fetchDashboard(true)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* ── Smart Alerts ── */}
        {alerts.length > 0 && (
          <div className="alerts">
            {alerts.map((a, i) => (
              <div key={i} className={`alert alert-${a.type}`}>
                <span className="alert-icon">{a.icon}</span>
                <span>{a.msg}</span>
                <Link href={a.href} className="alert-action" style={{ color: 'inherit' }}>View →</Link>
              </div>
            ))}
          </div>
        )}

        {/* ── Stat Cards (4) ── */}
        <div className="stat-grid">
          {loading ? Array(4).fill(0).map((_, i) => (
            <div key={i} className="sc"><div className="skeleton" style={{ height: 90 }} /></div>
          )) : [
            { icon: '👥', label: 'APPROVED STUDENTS', value: s?.totalStudents ?? 0, sub: `${s?.pendingStudents ?? 0} pending approval`, color: C.green, href: '/admin/requests', pulse: (s?.pendingStudents ?? 0) > 0 },
            { icon: '📦', label: 'ACTIVE LISTINGS', value: s?.totalProducts ?? 0, sub: `${s?.pendingProducts ?? 0} pending review`, color: C.blue, href: '/admin/products', pulse: (s?.pendingProducts ?? 0) > 0 },
            { icon: '💰', label: 'PLATFORM REVENUE', value: `₹${(s?.revenue ?? 0).toLocaleString('en-IN')}`, sub: `${s?.soldProducts ?? 0} sold · ${s?.totalOrders ?? 0} orders`, color: C.gold, href: '/admin/revenue' },
            { icon: '⏳', label: 'PENDING REGISTRATIONS', value: s?.pendingStudents ?? 0, sub: 'Requires review', color: C.orange, href: '/admin/requests', pulse: (s?.pendingStudents ?? 0) > 0 },
          ].map(card => (
            <Link key={card.label} href={card.href} className="sc" style={{ borderColor: `${card.color}28` }}>
              <span className="sc-icon">{card.icon}</span>
              <div className="sc-lbl">{card.label}</div>
              <div className="sc-val" style={{ color: card.color }}>{card.value}</div>
              <div className="sc-sub">
                {card.pulse && <span className="pulse-dot" />}
                {card.sub}
              </div>
            </Link>
          ))}
        </div>

        {/* ── Product Breakdown Bar ── */}
        <div className="bk-card">
          <div className="bk-title">
            📊 Product Status Breakdown
            <span style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 500 }}>{bdTotal} total listings</span>
          </div>
          {loading ? <div className="skeleton" style={{ height: 12 }} /> : (
            <>
              <div className="bk-bar">
                <div className="bk-seg" style={{ width: pct(bd?.active ?? 0), background: C.green }} />
                <div className="bk-seg" style={{ width: pct(bd?.sold ?? 0), background: C.purple }} />
                <div className="bk-seg" style={{ width: pct(bd?.pending ?? 0), background: C.orange }} />
                <div className="bk-seg" style={{ width: pct(bd?.removed ?? 0), background: C.red }} />
              </div>
              <div className="bk-legend">
                {[
                  { label: 'Active', val: bd?.active ?? 0, color: C.green },
                  { label: 'Sold Out', val: bd?.sold ?? 0, color: C.purple },
                  { label: 'Pending', val: bd?.pending ?? 0, color: C.orange },
                  { label: 'Removed', val: bd?.removed ?? 0, color: C.red },
                ].map(l => (
                  <div key={l.label} className="bk-leg">
                    <div className="bk-dot" style={{ background: l.color }} />
                    {l.label} <strong style={{ color: 'var(--t1)', marginLeft: 2 }}>{l.val}</strong>
                    <span style={{ opacity: .5 }}>({pct(l.val)})</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Mid: Student Requests + Pending Products ── */}
        <div className="mid">
          {/* Student Requests */}
          <div className="sec">
            <div className="sec-hdr">
              <span style={{ color: C.green }}>👤 Student Requests</span>
              <Link href="/admin/requests" className="view-all" style={{ color: C.green }}>View all →</Link>
            </div>
            {loading ? <div className="skeleton" style={{ height: 130 }} /> :
              (data?.pendingRequests?.length ?? 0) === 0
                ? <div className="empty">✅ No pending requests</div>
                : data!.pendingRequests.map(req => (
                  <div key={req.id} className="req-item">
                    <div className="av" style={{ background: req.color }}>{req.initials}</div>
                    <div className="ri">
                      <div className="rn">{req.name}</div>
                      <div className="re">{req.email}</div>
                    </div>
                    <div className="ract">
                      {!reqActs[req.id] ? (
                        <>
                          <button className="btn-ap" onClick={() => handleReqAction(req.id, 'approve')}>✓ Approve</button>
                          <button className="btn-rj" onClick={() => handleReqAction(req.id, 'reject')}>✗</button>
                        </>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 700, color: reqActs[req.id] === 'approved' ? C.green : C.red }}>
                          {reqActs[req.id] === 'approved' ? '✅ Done' : '❌ Rejected'}
                        </span>
                      )}
                    </div>
                  </div>
                ))
            }
          </div>

          {/* Recent Transactions */}
          <div className="sec">
            <div className="sec-hdr">
              <span style={{ color: C.gold }}>💳 Recent Transactions</span>
              <Link href="/admin/revenue" className="view-all" style={{ color: C.gold }}>Full report →</Link>
            </div>
            {loading ? <div className="skeleton" style={{ height: 130 }} /> :
              (data?.recentTransactions?.length ?? 0) === 0
                ? <div className="empty">No transactions yet</div>
                : data!.recentTransactions.map(tx => (
                  <div key={tx.id} className="prod-item">
                    <div className="pib" style={{ background: 'rgba(247,201,72,.08)', fontSize: 14 }}>🛒</div>
                    <div className="pi">
                      <div className="pt">{tx.productTitle}</div>
                      <div className="ps">{tx.buyer} → {tx.seller}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div className="pp">{tx.amount}</div>
                      <div style={{ fontSize: 10, color: 'var(--gold)', fontFamily: "'JetBrains Mono',monospace" }}>+{tx.platformCut} cut</div>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>

        {/* ── Bottom: Top Sellers + Activity ── */}
        <div className="bot">
          {/* Top Sellers Leaderboard */}
          <div className="sec">
            <div className="sec-hdr">
              <span style={{ color: C.gold }}>🏆 Top Sellers</span>
              <Link href="/admin/revenue" className="view-all" style={{ color: C.gold }}>Revenue →</Link>
            </div>
            {loading ? <div className="skeleton" style={{ height: 150 }} /> :
              (data?.topSellers?.length ?? 0) === 0
                ? <div className="empty">No sales recorded yet</div>
                : data!.topSellers.map((seller, i) => (
                  <div key={seller.id} className="seller-item">
                    <span className={`rank rank-${i + 1}`}>#{i + 1}</span>
                    <div className="av" style={{ background: seller.color, width: 34, height: 34, fontSize: 11 }}>{seller.initials}</div>
                    <div className="si-info">
                      <div className="si-name">{seller.name}</div>
                      <div className="si-rev">₹{seller.revenue.toLocaleString('en-IN')}</div>
                    </div>
                    <span className="si-badge">{seller.soldCount} sold</span>
                  </div>
                ))
            }
          </div>

          {/* Recently Listed Products */}
          <div className="sec">
            <div className="sec-hdr">
              <span style={{ color: C.blue }}>🆕 Recently Listed</span>
              <Link href="/admin/products" className="view-all" style={{ color: C.blue }}>All products →</Link>
            </div>
            {loading ? <div className="skeleton" style={{ height: 150 }} /> :
              (data?.recentListings?.length ?? 0) === 0
                ? <div className="empty">No listings yet</div>
                : data!.recentListings.map(listing => (
                  <div key={listing.id} className="seller-item">
                    <div className="av" style={{ background: listing.sellerColor, width: 32, height: 32, fontSize: 10 }}>
                      {listing.sellerInitials}
                    </div>
                    <div className="si-info">
                      <div className="si-name" title={listing.title}>{listing.title}</div>
                      <div style={{ fontSize: 10, color: 'var(--t3)' }}>{listing.seller} · {relTime(listing.date)}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>{listing.price}</div>
                      <div style={{
                        fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 9999, display: 'inline-block', marginTop: 2,
                        background: listing.status === 'sold' ? 'rgba(139,92,246,.15)' : 'rgba(16,185,129,.12)',
                        color: listing.status === 'sold' ? 'var(--purple)' : 'var(--green)',
                      }}>{listing.status === 'sold' ? 'SOLD' : 'ACTIVE'}</div>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
      </div>
    </>
  );
}
