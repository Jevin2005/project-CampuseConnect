'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../store/authStore';

const API = 'http://localhost:5000/api/admin';

interface RevenueData {
  stats: { totalSales: string; totalCut: string; totalOrders: number };
  chartData: { day: string; v: number }[];
  transactions: { id: string; product: string; buyer: string; seller: string; price: string; cut: string; date: string }[];
  collegeName: string;
}

export default function RevenueAdminPage() {
  const { accessToken } = useAuthStore();
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ day: string; v: number } | null>(null);

  const fetchRevenue = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API}/revenue`, { headers: { Authorization: `Bearer ${accessToken}` } });
      setData(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [accessToken]);

  useEffect(() => { fetchRevenue(); }, [fetchRevenue]);

  const chartData = data?.chartData ?? [];
  const MAX_V = Math.max(...chartData.map(d => d.v), 1);
  const H = 160, W_PAD = 40;
  const pts = chartData.map((d, i) => ({
    x: W_PAD + i * ((500 - W_PAD * 2) / Math.max(chartData.length - 1, 1)),
    y: H - (d.v / MAX_V) * H,
    ...d,
  }));
  const linePath = pts.map((p, i) => i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`).join(' ');
  const fillPath = pts.length > 0 ? `${linePath} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z` : '';

  const downloadCSV = () => {
    if (!data) return;
    const headers = ['Product', 'Buyer', 'Seller', 'Sale Price', 'Platform Cut (5%)', 'Date'];
    const rows = data.transactions.map(t => [t.product, t.buyer, t.seller, t.price, t.cut, t.date]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.collegeName}_Revenue_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
        :root{--bg:#0A0E1A;--card:#111827;--card2:#1a2235;--border:#1e2d45;--green:#10B981;--blue:#4F8EF7;--gold:#F7C948;--txt:#F0F4FF;--mut:#6B7280;--soft:#9CA3AF}
        .page{background:var(--bg);min-height:100vh;padding:36px 40px;animation:fi .35s ease}
        @keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        h1{font-family:'Sora',sans-serif;font-size:28px;font-weight:700;margin-bottom:4px;color:var(--txt)}
        .sub{font-size:14px;color:var(--mut);margin-bottom:24px}
        .stat-cards{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:24px}
        .scard{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:22px;transition:transform .2s}
        .scard:hover{transform:translateY(-2px)}
        .scard.gold{border-color:rgba(247,201,72,.25);box-shadow:0 0 20px rgba(247,201,72,.06)}
        .sc-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--mut);margin-bottom:10px}
        .sc-val{font-family:'Sora',sans-serif;font-size:32px;font-weight:800;line-height:1;color:var(--txt)}
        .skeleton{background:linear-gradient(90deg,var(--card2) 25%,#202d42 50%,var(--card2) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .chart-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:22px;margin-bottom:24px}
        .chart-title{font-family:'Sora',sans-serif;font-size:18px;font-weight:700;margin-bottom:16px;color:var(--txt)}
        .chart-wrap{position:relative;width:100%}
        svg{display:block;width:100%;overflow:visible}
        .tooltip-box{position:absolute;background:var(--card2);border:1px solid var(--border);border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;pointer-events:none;white-space:nowrap;transform:translate(-50%,-110%);color:var(--txt)}
        .tx-card{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden}
        .tx-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border)}
        .tx-title{font-family:'Sora',sans-serif;font-size:18px;font-weight:700;color:var(--txt)}
        .export-btn{background:none;border:1.5px solid var(--border);color:var(--soft);padding:7px 14px;border-radius:9999px;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s}
        .export-btn:hover{border-color:var(--green);color:var(--green)}
        .th{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 1.2fr;background:var(--card2);padding:10px 18px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--mut)}
        .tr{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 1.2fr;padding:13px 18px;border-bottom:1px solid rgba(30,45,69,.5);align-items:center;transition:background .15s}
        .tr:last-child{border-bottom:none}
        .tr:hover{background:rgba(16,185,129,.025)}
        .pname{font-size:13px;font-weight:600;color:var(--txt)}
        .uname{font-size:13px;color:var(--soft)}
        .price{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;color:var(--txt)}
        .cut{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:var(--green)}
        .dt{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--mut)}
        .empty{text-align:center;padding:48px;color:var(--mut)}
      `}</style>

      <div className="page">
        <h1>College Revenue</h1>
        <p className="sub">{loading ? 'Loading…' : `Track all platform earnings for ${data?.collegeName}`}</p>

        <div className="stat-cards">
          {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="scard"><div className="skeleton" style={{ height: 80 }} /></div>) : <>
            <div className="scard">
              <div className="sc-label">💰 Total Sales Volume</div>
              <div className="sc-val" style={{ color: 'var(--blue)' }}>{data?.stats.totalSales ?? '₹0'}</div>
            </div>
            <div className="scard">
              <div className="sc-label">💸 Platform Cut (5%)</div>
              <div className="sc-val" style={{ color: 'var(--green)' }}>{data?.stats.totalCut ?? '₹0'}</div>
            </div>
            <div className="scard gold">
              <div className="sc-label">🛒 Total Orders</div>
              <div className="sc-val" style={{ color: 'var(--gold)' }}>{data?.stats.totalOrders ?? 0}</div>
            </div>
          </>}
        </div>

        <div className="chart-card">
          <div className="chart-title">Revenue (Last 7 Days)</div>
          <div className="chart-wrap">
            {loading ? <div className="skeleton" style={{ height: 200 }} /> : pts.length > 0 ? (
              <svg viewBox="0 0 500 200" style={{ height: 200 }}>
                <defs>
                  <linearGradient id="gfill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75, 1].map(f => (
                  <line key={f} x1={W_PAD} y1={H - f * H} x2={500 - W_PAD} y2={H - f * H} stroke="#1e2d45" strokeWidth="1" strokeDasharray="4,4" />
                ))}
                {[0.25, 0.5, 0.75, 1].map(f => (
                  <text key={f} x={W_PAD - 6} y={H - f * H + 4} textAnchor="end" fontSize="9" fill="#6B7280">₹{(MAX_V * f).toFixed(0)}</text>
                ))}
                <path d={fillPath} fill="url(#gfill)" />
                <path d={linePath} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {pts.map(p => (
                  <g key={p.day}>
                    <text x={p.x} y={H + 18} textAnchor="middle" fontSize="9" fill="#6B7280">{p.day}</text>
                    <circle cx={p.x} cy={p.y} r={tooltip?.day === p.day ? 6 : 4} fill="#10B981" stroke="#0A0E1A" strokeWidth="2"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setTooltip({ day: p.day, v: p.v })}
                      onMouseLeave={() => setTooltip(null)} />
                  </g>
                ))}
              </svg>
            ) : <div style={{ textAlign: 'center', padding: 40, color: 'var(--mut)' }}>No revenue data yet</div>}
            {tooltip && (() => {
              const pt = pts.find(p => p.day === tooltip.day);
              if (!pt) return null;
              return <div className="tooltip-box" style={{ left: `${(pt.x / 500) * 100}%`, top: `${(pt.y / 200) * 100}%` }}>{pt.day}: ₹{pt.v.toFixed(2)}</div>;
            })()}
          </div>
        </div>

        <div className="tx-card">
          <div className="tx-header">
            <div className="tx-title">Recent Transactions</div>
            <button className="export-btn" onClick={downloadCSV}>↓ Export CSV</button>
          </div>
          <div className="th"><div>Product</div><div>Buyer</div><div>Seller</div><div>Sale Price</div><div>Platform Cut</div><div>Date</div></div>
          {loading ? Array(4).fill(0).map((_, i) => (
            <div key={i} className="tr">{Array(6).fill(0).map((_, j) => <div key={j}><div className="skeleton" style={{ height: 14, width: j === 0 ? 160 : 80 }} /></div>)}</div>
          )) : (data?.transactions?.length ?? 0) === 0 ? (
            <div className="empty">No transactions yet.</div>
          ) : data!.transactions.map(t => (
            <div key={t.id} className="tr">
              <div className="pname">{t.product}</div>
              <div className="uname">{t.buyer}</div>
              <div className="uname">{t.seller}</div>
              <div className="price">{t.price}</div>
              <div className="cut">{t.cut} <span style={{ fontSize: '10px', color: 'var(--mut)', fontWeight: 400 }}>(5%)</span></div>
              <div className="dt">{t.date}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
