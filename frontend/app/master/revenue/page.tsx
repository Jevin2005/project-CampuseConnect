'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';

const API = 'http://localhost:5000/api/master';

const S = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
:root{--bg:#0A0E1A;--card:#111827;--c2:#1a2235;--bd:#1e2d45;--gold:#F7C948;--t1:#F0F4FF;--t2:#9CA3AF;--t3:#6B7280;--blue:#4F8EF7;--green:#10B981;}
.m6{padding:32px;min-height:100vh;background:var(--bg);}
.m6 h1{font-family:'Sora',sans-serif;font-size:26px;font-weight:800;color:var(--t1);margin-bottom:4px;}
.sub{font-size:13px;color:var(--t3);margin-bottom:24px;}
.hg{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;}
.hc{background:var(--card);border:1px solid rgba(247,201,72,.2);border-radius:14px;padding:24px;transition:transform .2s;}
.hc:hover{transform:translateY(-3px);}
.hc-icon{font-size:20px;margin-bottom:12px;}
.hc-val{font-family:'Sora',sans-serif;font-size:32px;font-weight:800;display:block;margin-bottom:6px;}
.hc-lbl{font-size:13px;color:var(--t3);}
.tbl-card{background:var(--card);border:1px solid var(--bd);border-radius:14px;overflow:hidden;margin-bottom:24px;}
.tbl-hd{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--bd);}
.tbl-ttl{font-family:'Sora',sans-serif;font-size:17px;font-weight:700;color:var(--t1);}
table{width:100%;border-collapse:collapse;}
th{padding:12px 20px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--t3);border-bottom:1px solid var(--bd);}
td{padding:14px 20px;font-size:13px;color:var(--t2);border-bottom:1px solid var(--bd);}
tr:last-of-type td{border-bottom:none;}
.tfoot td{background:rgba(247,201,72,.06);font-weight:700;color:var(--t1);border-top:1px solid rgba(247,201,72,.2);}
.bar-sm{height:6px;background:var(--c2);border-radius:9999px;overflow:hidden;margin-top:6px;width:80px;}
.bar-fill{height:100%;background:linear-gradient(90deg,#F7C948,#F59E0B);border-radius:9999px;}
.chart-card{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:24px;}
.ct{font-family:'Sora',sans-serif;font-size:17px;font-weight:700;color:var(--t1);margin-bottom:20px;}
.leg{display:flex;gap:20px;margin-bottom:16px;}
.ld{width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:6px;}
.ls{font-size:12px;color:var(--t2);}
.skeleton{background:linear-gradient(90deg,var(--c2) 25%,#202d42 50%,var(--c2) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px;}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.empty-msg{text-align:center;padding:48px;color:var(--t3);font-size:13px;}
`;

interface CollegeRev { name: string; amount: number; pct: number; }
interface Stats { activeColleges: number; totalStudents: number; totalProducts: number; totalRevenue: string; pendingRequests: number; }

function fmt(n: number) { return `₹${n.toLocaleString('en-IN')}`; }

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
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenueBars, setRevenueBars] = useState<CollegeRev[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/stats`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setStats(data.stats);
        setRevenueBars(data.revenueBars || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [accessToken]);

  const totalRev = revenueBars.reduce((s, b) => s + b.amount, 0);

  const HEADLINE = stats
    ? [
        { icon: '📋', label: 'Active Colleges', value: String(stats.activeColleges), color: '#4F8EF7' },
        { icon: '🎓', label: 'Total Students', value: stats.totalStudents.toLocaleString('en-IN'), color: '#10B981' },
        { icon: '💰', label: 'Total Revenue', value: stats.totalRevenue, color: '#F7C948' },
      ]
    : [];

  return (
    <>
      <style>{S}</style>
      <div className="m6">
        <h1>Platform Revenue</h1>
        <p className="sub">Real-time financial overview across all active colleges</p>

        <div className="hg">
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
            <span className="tbl-ttl">Revenue by College</span>
          </div>
          <table>
            <thead>
              <tr><th>College</th><th>Revenue</th><th>% Share</th></tr>
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
          <div className="ct">Revenue Per College</div>
          <div className="leg">
            <span className="ls"><span className="ld" style={{ background: '#F7C948' }} />Revenue</span>
          </div>
          {loading
            ? <div className="skeleton" style={{ height: 180 }} />
            : revenueBars.length === 0
              ? <div className="empty-msg">No revenue data to chart.</div>
              : <LineChart bars={revenueBars} />}
        </div>
      </div>
    </>
  );
}
