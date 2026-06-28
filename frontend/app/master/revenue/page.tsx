'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../store/authStore';

const API = 'http://localhost:5000/api/master';

const S = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg: #080C14;
  --card: rgba(15, 23, 42, 0.9);
  --card2: rgba(20, 30, 55, 0.92);
  --border: rgba(99, 130, 190, 0.15);
  --border-hover: rgba(247, 201, 72, 0.4);
  --gold: #F7C948;
  --gold2: #F59E0B;
  --blue: #4F8EF7;
  --green: #10B981;
  --purple: #7C3AED;
  --red: #EF4444;
  --pink: #EC4899;
  --t1: #F0F4FF;
  --t2: #9CA3AF;
  --t3: #6B7280;
}

* { box-sizing: border-box; }

.m6 {
  padding: 36px;
  min-height: 100vh;
  background: var(--bg);
  background-image: radial-gradient(ellipse 60% 30% at 50% 0%, rgba(247,201,72,.04) 0%, transparent 70%);
  font-family: 'DM Sans', sans-serif;
}

.m6 h1 { font-family: 'Sora', sans-serif; font-size: 30px; font-weight: 800; color: var(--t1); margin-bottom: 5px; letter-spacing: -0.5px; }
.m6 h1 span { color: var(--gold); }
.sub { font-size: 13px; color: var(--t3); margin-bottom: 24px; }

/* Tabs Layout */
.nav-tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 24px; gap: 2px; }
.tab-btn {
  padding: 12px 24px; background: none; border: none;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
  cursor: pointer; color: var(--t3);
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: all 0.25s ease; border-radius: 8px 8px 0 0;
  letter-spacing: 0.3px;
}
.tab-btn:hover { color: var(--t2); background: rgba(255,255,255,0.02); }
.tab-btn.on {
  color: var(--gold);
  border-bottom-color: var(--gold);
  background: linear-gradient(to top, rgba(247,201,72,0.06), transparent);
  text-shadow: 0 0 10px rgba(247,201,72,0.2);
}

/* Stats */
.hg { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
.hg.three { grid-template-columns: repeat(3, 1fr); }
.hc {
  background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 22px 24px;
  backdrop-filter: blur(16px); transition: transform .2s, border-color .25s, box-shadow .25s;
  position: relative; overflow: hidden;
}
.hc::before {
  content: ''; position: absolute; inset: 0; border-radius: 16px;
  background: linear-gradient(135deg, rgba(255,255,255,.025) 0%, transparent 60%);
  pointer-events: none;
}
.hc:hover { border-color: var(--border-hover); transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,.35); }
.hc-icon { font-size: 20px; margin-bottom: 12px; }
.hc-val { font-family: 'Sora', sans-serif; font-size: 24px; font-weight: 800; display: block; margin-bottom: 6px; line-height: 1; }
.hc-lbl { font-size: 10px; color: var(--t3); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }

/* Tables */
.tbl-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; backdrop-filter: blur(16px); margin-bottom: 28px; }
.tbl-hd { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); background: rgba(8,12,24,.3); }
.tbl-ttl { font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 700; color: var(--t1); }
.tbl-actions { display: flex; align-items: center; gap: 12px; }
table { width: 100%; border-collapse: collapse; }
th { padding: 12px 20px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: var(--t3); border-bottom: 1px solid var(--border); background: rgba(8,12,24,.5); white-space: nowrap; }
td { padding: 14px 20px; font-size: 13px; color: var(--t2); border-bottom: 1px solid rgba(99,130,190,.08); white-space: nowrap; }
tr:last-of-type td { border-bottom: none; }
tr:hover td { background: rgba(247,201,72,.02); }
.tfoot td { background: rgba(247,201,72,.04); font-weight: 700; color: var(--t1); border-top: 1px solid rgba(247,201,72,.2); }

/* Progress bar */
.bar-sm { height: 5px; background: var(--card2); border-radius: 9999px; overflow: hidden; margin-top: 6px; width: 100px; }
.bar-fill { height: 100%; background: linear-gradient(90deg, #F7C948, #F59E0B); border-radius: 9999px; box-shadow: 0 0 8px rgba(247,201,72,.4); }

/* Chart */
.chart-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 24px; backdrop-filter: blur(16px); }
.ct { font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 700; color: var(--t1); margin-bottom: 20px; }
.leg { display: flex; gap: 20px; margin-bottom: 16px; }
.ld { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 6px; }
.ls { font-size: 12px; color: var(--t2); }

/* Shimmer */
.skeleton { background: linear-gradient(90deg, var(--card2) 25%, var(--border) 50%, var(--card2) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.empty-msg { text-align: center; padding: 60px 20px; color: var(--t3); font-size: 13px; }

/* Audit Ledger specific styles */
.badge-type { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; }
.badge-type.listing { background: rgba(79,142,247,.08); color: var(--blue); border: 1px solid rgba(79,142,247,.2); }
.badge-type.tx { background: rgba(16,185,129,.08); color: var(--green); border: 1px solid rgba(16,185,129,.2); }
.badge-type.ad { background: rgba(124,58,237,.08); color: var(--purple); border: 1px solid rgba(124,58,237,.2); }

.amt-inflow { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: var(--green); }
.amt-breakdown { font-size: 10px; color: var(--t3); margin-top: 2px; }

/* Filter Inputs */
.search-wrap { position: relative; width: 240px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 13px; color: var(--t3); pointer-events: none; }
.inp {
  width: 100%; background: var(--card2); border: 1.5px solid var(--border); border-radius: 8px; padding: 8px 12px 8px 34px;
  font-family: 'DM Sans', sans-serif; font-size: 12px; color: var(--t1); outline: none; transition: border-color .2s, box-shadow .2s;
}
.inp::placeholder { color: #3d4f6b; }
.inp:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(247,201,72,.1); }

.sel {
  background: var(--card2); border: 1.5px solid var(--border); border-radius: 8px; padding: 8px 12px;
  font-family: 'DM Sans', sans-serif; font-size: 12px; color: var(--t2); outline: none; cursor: pointer;
  transition: border-color .2s, box-shadow .2s;
}
.sel:hover { border-color: rgba(99,130,190,.3); }
.sel:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(247,201,72,.1); }

.btn-export {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(247,201,72,0.3);
  background: rgba(247,201,72,0.06); color: var(--gold); font-size: 12px; font-weight: 700;
  cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s;
}
.btn-export:hover:not(:disabled) {
  background: rgba(247,201,72,0.14); border-color: var(--gold); box-shadow: 0 0 12px rgba(247,201,72,0.2);
}
.btn-export:disabled { opacity: 0.5; cursor: not-allowed; }

/* Toast */
.toast-container {
  position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  background: rgba(15, 23, 42, 0.95); border: 1.5px solid rgba(247, 201, 72, 0.35);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(247,201,72,0.15);
  padding: 12px 22px; border-radius: 12px; color: var(--t1); font-size: 13px; font-weight: 600;
  display: flex; align-items: center; gap: 10px; backdrop-filter: blur(12px);
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideIn {
  from { transform: translateY(20px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}
`;

interface CollegeRev { name: string; amount: number; pct: number; }
interface Stats { activeColleges: number; totalStudents: number; totalProducts: number; totalRevenue: string; pendingRequests: number; }

interface AccountingSummary {
  totalListingFees: number;
  totalBuyerFees: number;
  totalSellerCuts: number;
  totalAdRevenue: number;
  totalPlatformRevenue: number;
  pendingPayoutsVal: number;
  releasedPayoutsVal: number;
  totalSalesVolume: number;
}

interface LedgerEntry {
  id: string;
  type: 'LISTING_FEE' | 'TRANSACTION_FEE' | 'AD_REVENUE';
  description: string;
  party: string;
  email: string;
  inflow: number;
  listingFee: number;
  buyerFee: number;
  sellerCut: number;
  adCost: number;
  method: string;
  reference: string;
  date: string;
}

function fmt(n: number) { return `₹${Math.round(n).toLocaleString('en-IN')}`; }

function LineChart({ bars }: { bars: CollegeRev[] }) {
  if (!bars.length) return null;
  const W = 700, H = 180, PL = 50, PR = 20, PT = 20, PB = 36;
  const cw = W - PL - PR, ch = H - PT - PB;
  const maxAmt = Math.max(...bars.map(b => b.amount), 1);
  const xs = bars.map((_, i) => PL + i * (cw / Math.max(bars.length - 1, 1)));
  const yOf = (v: number) => PT + ch - (v / maxAmt) * ch;
  const path = bars.map((b, i) => `${i === 0 ? 'M' : 'L'}${xs[i]},${yOf(b.amount)}`).join(' ');
  const area = `${path} L${xs[xs.length - 1]},${PT + ch} L${xs[0]},${PT + ch} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="rg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F7C948" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#F7C948" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const y = PT + ch * t;
        return <line key={t} x1={PL} x2={W - PR} y1={y} y2={y} stroke="#1e2d45" strokeWidth="1" />;
      })}
      <path d={area} fill="url(#rg2)" />
      <path d={path} fill="none" stroke="#F7C948" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {bars.map((b, i) => (
        <g key={i}>
          <circle cx={xs[i]} cy={yOf(b.amount)} r="5" fill="#F7C948" />
          <text x={xs[i]} y={H - 8} textAnchor="middle" fill="#6B7280" fontSize="10" fontFamily="JetBrains Mono">
            {b.name.split(' ')[0]}
          </text>
          <text x={xs[i]} y={yOf(b.amount) - 10} textAnchor="middle" fill="#F7C948" fontSize="10" fontFamily="JetBrains Mono">
            {b.amount > 0 ? fmt(b.amount) : ''}
          </text>
        </g>
      ))}
      {[0, maxAmt / 2, maxAmt].map((v, i) => (
        <text key={i} x={PL - 6} y={yOf(v) + 4} textAnchor="end" fill="#6B7280" fontSize="10" fontFamily="JetBrains Mono">
          {v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : '₹0'}
        </text>
      ))}
    </svg>
  );
}

export default function PlatformRevenuePage() {
  const { accessToken } = useAuthStore();
  
  // Navigation View Tab: 'analytics' | 'accounting'
  const [view, setView] = useState<'analytics' | 'accounting'>('analytics');
  
  // State variables
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenueBars, setRevenueBars] = useState<CollegeRev[]>([]);
  const [accountingSummary, setAccountingSummary] = useState<AccountingSummary | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  
  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(prev => prev === msg ? '' : prev);
    }, 4000);
  };

  const loadData = useCallback(async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      // 1. Fetch distribution analytics
      const resStats = await fetch(`${API}/stats`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (resStats.ok) {
        const d = await resStats.json();
        setStats(d.stats);
        setRevenueBars(d.revenueBars || []);
      }

      // 2. Fetch business accounting ledgers
      const resAcc = await fetch(`${API}/revenue/accounting`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (resAcc.ok) {
        const d = await resAcc.json();
        setAccountingSummary(d.summary);
        setLedger(d.ledger || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalRev = revenueBars.reduce((s, b) => s + b.amount, 0);

  // Filter combined ledger
  const filteredLedger = ledger.filter(item => {
    const matchType = !typeFilter || item.type === typeFilter;
    const q = search.toLowerCase();
    return matchType && (
      !search ||
      item.description.toLowerCase().includes(q) ||
      item.party.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.reference.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  });

  // Simulated CSV Exporter
  const handleExportLedger = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      try {
        const headers = ['Date', 'Type', 'Description', 'Party', 'Email', 'Inflow (INR)', 'Listing Fee', 'Buyer Surcharge', 'Seller Comm.', 'Ad Cost', 'Ref ID'];
        const rows = filteredLedger.map(item => [
          new Date(item.date).toLocaleDateString('en-IN'),
          item.type,
          `"${item.description.replace(/"/g, '""')}"`,
          `"${item.party.replace(/"/g, '""')}"`,
          item.email,
          item.inflow,
          item.listingFee,
          item.buyerFee,
          item.sellerCut,
          item.adCost,
          item.reference
        ]);
        const csvContent = "data:text/csv;charset=utf-8," 
          + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `platform_ledger_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Ledger CSV downloaded successfully! 📊");
      } catch (err) {
        showToast("Export failed ⚠️");
      }
    }, 800);
  };

  const HEADLINE = stats
    ? [
        { icon: '🏫', label: 'Active Colleges', value: String(stats.activeColleges), color: 'var(--blue)' },
        { icon: '🎓', label: 'Total Students', value: stats.totalStudents.toLocaleString('en-IN'), color: 'var(--green)' },
        { icon: '💰', label: 'Gross Volume', value: stats.totalRevenue, color: 'var(--gold)' },
      ]
    : [];

  return (
    <>
      <style>{S}</style>
      <div className="m6">
        <h1>Platform <span>Revenue</span></h1>
        <p className="sub">Monitor marketplace metrics, listing collections, and business payouts</p>

        {/* View Tabs Selector */}
        <div className="nav-tabs">
          <button className={`tab-btn ${view === 'analytics' ? 'on' : ''}`} onClick={() => setView('analytics')}>
            📊 Distribution Analysis
          </button>
          <button className={`tab-btn ${view === 'accounting' ? 'on' : ''}`} onClick={() => setView('accounting')}>
            🏦 Platform Business Accounting
          </button>
        </div>

        {/* ── View 1: Analytics / Distribution Analysis ── */}
        {view === 'analytics' && (
          <>
            <div className="hg three">
              {loading
                ? Array(3).fill(0).map((_, i) => (
                    <div className="hc" key={i}>
                      <div className="skeleton" style={{ height: 20, width: 30, marginBottom: 16 }} />
                      <div className="skeleton" style={{ height: 36, width: 120, marginBottom: 10 }} />
                      <div className="skeleton" style={{ height: 14, width: 150 }} />
                    </div>
                  ))
                : HEADLINE.map(h => (
                    <div className="hc" key={h.label}>
                      <div className="hc-icon">{h.icon}</div>
                      <span className="hc-val" style={{ color: h.color }}>{h.value}</span>
                      <span className="hc-lbl">{h.label}</span>
                    </div>
                  ))}
            </div>

            {/* Revenue table per college */}
            <div className="tbl-card">
              <div className="tbl-hd">
                <span className="tbl-ttl">Revenue Share by College</span>
              </div>
              <table>
                <thead>
                  <tr><th>College</th><th>Fulfillment Volume</th><th>% Share</th></tr>
                </thead>
                <tbody>
                  {loading
                    ? Array(3).fill(0).map((_, i) => (
                        <tr key={i}>
                          <td><div className="skeleton" style={{ height: 14, width: 180 }} /></td>
                          <td><div className="skeleton" style={{ height: 14, width: 80 }} /></td>
                          <td><div className="skeleton" style={{ height: 14, width: 60 }} /></td>
                        </tr>
                      ))
                    : revenueBars.map((r, i) => (
                        <tr key={`${r.name}-${i}`}>
                          <td style={{ fontWeight: 600, color: 'var(--t1)' }}>{r.name}</td>
                          <td style={{ color: 'var(--gold)', fontFamily: 'JetBrains Mono,monospace', fontSize: 12, fontWeight: 700 }}>
                            {fmt(r.amount)}
                          </td>
                          <td>
                            <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12, color: 'var(--gold)' }}>{r.pct}%</span>
                            <div className="bar-sm"><div className="bar-fill" style={{ width: `${r.pct}%` }} /></div>
                          </td>
                        </tr>
                      ))}
                </tbody>
                {!loading && revenueBars.length > 0 && (
                  <tfoot>
                    <tr className="tfoot">
                      <td style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800 }}>TOTAL</td>
                      <td style={{ fontFamily: 'Sora,sans-serif', fontSize: 15, color: 'var(--gold)' }}>{fmt(totalRev)}</td>
                      <td style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12 }}>100%</td>
                    </tr>
                  </tfoot>
                )}
              </table>
              {!loading && revenueBars.length === 0 && (
                <div className="empty-msg">💰 No completed orders yet. Revenue will appear here once orders are fulfilled.</div>
              )}
            </div>

            {/* Chart */}
            <div className="chart-card">
              <div className="ct">Gross Sales Distribution</div>
              <div className="leg">
                <span className="ls"><span className="ld" style={{ background: '#F7C948' }} />Sales Volume</span>
              </div>
              {loading
                ? <div className="skeleton" style={{ height: 180 }} />
                : revenueBars.length === 0
                  ? <div className="empty-msg">No sales data available.</div>
                  : <LineChart bars={revenueBars} />}
            </div>
          </>
        )}

        {/* ── View 2: Platform Business Accounting ── */}
        {view === 'accounting' && (
          <>
            {/* Accounting Stat Cards */}
            <div className="hg">
              {loading || !accountingSummary ? (
                Array(4).fill(0).map((_, i) => (
                  <div className="hc" key={i}>
                    <div className="skeleton" style={{ height: 18, width: 30, marginBottom: 14 }} />
                    <div className="skeleton" style={{ height: 28, width: 100, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: 120 }} />
                  </div>
                ))
              ) : (
                <>
                  <div className="hc">
                    <div className="hc-icon">🏦</div>
                    <span className="hc-val" style={{ color: 'var(--gold)' }}>{fmt(accountingSummary.totalPlatformRevenue)}</span>
                    <span className="hc-lbl">Net Platform Earnings</span>
                  </div>
                  <div className="hc">
                    <div className="hc-icon">📋</div>
                    <span className="hc-val" style={{ color: 'var(--blue)' }}>{fmt(accountingSummary.totalListingFees)}</span>
                    <span className="hc-lbl">Listing Fee Sales</span>
                  </div>
                  <div className="hc">
                    <div className="hc-icon">🏷️</div>
                    <span className="hc-val" style={{ color: 'var(--green)' }}>{fmt(accountingSummary.totalBuyerFees + accountingSummary.totalSellerCuts)}</span>
                    <span className="hc-lbl">Digital Order Cuts</span>
                  </div>
                  <div className="hc">
                    <div className="hc-icon">📢</div>
                    <span className="hc-val" style={{ color: 'var(--purple)' }}>{fmt(accountingSummary.totalAdRevenue)}</span>
                    <span className="hc-lbl">Ad Space Campaign Proceeds</span>
                  </div>
                </>
              )}
            </div>

            {/* Held Balances Block */}
            <div className="hg three" style={{ marginBottom: 28 }}>
              {loading || !accountingSummary ? (
                Array(3).fill(0).map((_, i) => (
                  <div className="hc" key={i}>
                    <div className="skeleton" style={{ height: 18, width: 30, marginBottom: 14 }} />
                    <div className="skeleton" style={{ height: 28, width: 100, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: 120 }} />
                  </div>
                ))
              ) : (
                <>
                  <div className="hc">
                    <div className="hc-icon">⏳</div>
                    <span className="hc-val" style={{ color: 'var(--gold2)' }}>{fmt(accountingSummary.pendingPayoutsVal)}</span>
                    <span className="hc-lbl">Seller Balances Held</span>
                  </div>
                  <div className="hc">
                    <div className="hc-icon">💸</div>
                    <span className="hc-val" style={{ color: 'var(--green)' }}>{fmt(accountingSummary.releasedPayoutsVal)}</span>
                    <span className="hc-lbl">Seller Payouts Disbursed</span>
                  </div>
                  <div className="hc">
                    <div className="hc-icon">📊</div>
                    <span className="hc-val" style={{ color: 'var(--t1)' }}>{fmt(accountingSummary.totalSalesVolume)}</span>
                    <span className="hc-lbl">Gross Transaction Volume</span>
                  </div>
                </>
              )}
            </div>

            {/* Combined Audit Ledger Card */}
            <div className="tbl-card">
              <div className="tbl-hd">
                <span className="tbl-ttl">Platform Cash Audit Ledger</span>
                <div className="tbl-actions">
                  {/* Category Filter */}
                  <select className="sel" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                    <option value="">All Streams</option>
                    <option value="LISTING_FEE">Listing Fees</option>
                    <option value="TRANSACTION_FEE">Order Splits</option>
                    <option value="AD_REVENUE">Ad Placements</option>
                  </select>

                  {/* Ledger Search */}
                  <div className="search-wrap">
                    <span className="search-icon">🔍</span>
                    <input
                      className="inp"
                      placeholder="Search descriptions, parties, or refs..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>

                  {/* CSV Exporter */}
                  <button className="btn-export" onClick={handleExportLedger} disabled={exporting || filteredLedger.length === 0}>
                    {exporting ? '⏳ Exporting...' : '📥 Export CSV'}
                  </button>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Inflow Source</th>
                    <th>Ledger Description</th>
                    <th>Transacting Party</th>
                    <th>Accounting Reference</th>
                    <th style={{ textAlign: 'right' }}>Inflow Share</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td><div className="skeleton" style={{ height: 14, width: 80 }} /></td>
                        <td><div className="skeleton" style={{ height: 14, width: 100 }} /></td>
                        <td><div className="skeleton" style={{ height: 14, width: 220 }} /></td>
                        <td><div className="skeleton" style={{ height: 14, width: 150 }} /></td>
                        <td><div className="skeleton" style={{ height: 14, width: 90 }} /></td>
                        <td style={{ textAlign: 'right' }}><div className="skeleton" style={{ height: 14, width: 60, marginLeft: 'auto' }} /></td>
                      </tr>
                    ))
                  ) : filteredLedger.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-msg">📖 No matching ledger entries. Accounts are empty.</div>
                      </td>
                    </tr>
                  ) : (
                    filteredLedger.map((item, idx) => (
                      <tr key={`${item.id}-${idx}`}>
                        <td style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: 'var(--t3)' }}>
                          {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td>
                          {item.type === 'LISTING_FEE' ? (
                            <span className="badge-type listing">Listing Fee</span>
                          ) : item.type === 'TRANSACTION_FEE' ? (
                            <span className="badge-type tx">Order Cut</span>
                          ) : (
                            <span className="badge-type ad">Ad Promo</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 500, color: 'var(--t1)' }}>
                          {item.description}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--t2)', fontSize: 13 }}>{item.party}</div>
                          <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>{item.email}</div>
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: 'var(--t3)' }}>
                          {item.reference}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="amt-inflow">+{fmt(item.inflow)}</span>
                          {item.type === 'TRANSACTION_FEE' && (
                            <div className="amt-breakdown">
                              B. Fee: +{fmt(item.buyerFee)} | S. Cut: +{fmt(item.sellerCut)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="toast-container">
          <span>🔔</span>
          <span>{toast}</span>
        </div>
      )}
    </>
  );
}
