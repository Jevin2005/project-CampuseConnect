'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';

const API = 'http://localhost:5000/api/master';

const S = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
:root{--bg:#0A0E1A;--card:#111827;--card2:#1a2235;--border:#1e2d45;--gold:#F7C948;--t1:#F0F4FF;--t2:#9CA3AF;--t3:#6B7280;}
.m2{padding:32px;min-height:100vh;background:var(--bg);}
.m2 h1{font-family:'Sora',sans-serif;font-size:26px;font-weight:700;color:var(--t1);margin-bottom:4px;}
.m2-sub{font-size:13px;color:var(--t3);margin-bottom:28px;}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;}
.stat-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px 24px;transition:transform .2s,border-color .2s;}
.stat-card:hover{transform:translateY(-3px);border-color:rgba(247,201,72,.3);}
.stat-icon{font-size:20px;display:block;margin-bottom:8px;}
.stat-val{font-family:'Sora',sans-serif;font-size:28px;font-weight:800;display:block;margin-bottom:4px;}
.stat-lbl{font-size:12px;color:var(--t3);}
.charts-row{display:grid;grid-template-columns:60% 40%;gap:16px;margin-bottom:24px;}
.chart-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:24px;}
.chart-ttl{font-family:'Sora',sans-serif;font-size:15px;font-weight:700;color:var(--t1);margin-bottom:20px;}
.bar-row{margin-bottom:14px;}
.bar-lr{display:flex;justify-content:space-between;font-size:12px;color:var(--t2);margin-bottom:6px;}
.bar-track{background:var(--card2);border-radius:9999px;height:12px;overflow:hidden;}
.bar-fill{height:100%;border-radius:9999px;background:linear-gradient(90deg,#F7C948,#F59E0B);}
.act-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:24px;}
.act-ttl{font-family:'Sora',sans-serif;font-size:15px;font-weight:700;color:var(--t1);margin-bottom:16px;}
.act-item{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);}
.act-item:last-child{border-bottom:none;}
.act-icon{font-size:20px;flex-shrink:0;}
.act-msg{font-size:13px;color:var(--t2);flex:1;}
.act-badge{font-size:10px;font-weight:700;padding:3px 9px;border-radius:9999px;letter-spacing:.5px;flex-shrink:0;}
.act-time{font-size:11px;color:var(--t3);flex-shrink:0;}
.skeleton{background:linear-gradient(90deg,var(--card2) 25%,#202d42 50%,var(--card2) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px;}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.pending-pill{background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.3);color:#F59E0B;font-size:10px;font-weight:700;padding:2px 8px;border-radius:9999px;}
.active-pill{background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.3);color:#10B981;font-size:10px;font-weight:700;padding:2px 8px;border-radius:9999px;}
`;

interface DashStats {
  activeColleges: number;
  totalStudents: number;
  totalProducts: number;
  totalRevenue: string;
  pendingRequests: number;
}

interface RevenueBar { name: string; amount: number; pct: number; }
interface RecentItem { id: string; name: string; isApproved: boolean; createdAt: string; }

export default function MasterDashboardPage() {
  const { accessToken } = useAuthStore();
  const [stats, setStats] = useState<DashStats | null>(null);
  const [revenueBars, setRevenueBars] = useState<RevenueBar[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/stats`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error('Failed to load stats');
        const data = await res.json();
        setStats(data.stats);
        setRevenueBars(data.revenueBars);
        setRecentActivity(data.recentActivity);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken]);

  const HERO = stats
    ? [
        { icon: '🏫', label: 'Active Colleges', value: String(stats.activeColleges), color: '#F7C948' },
        { icon: '🎓', label: 'Total Students', value: stats.totalStudents.toLocaleString('en-IN'), color: '#4F8EF7' },
        { icon: '📦', label: 'Total Products', value: stats.totalProducts.toLocaleString('en-IN'), color: '#10B981' },
        { icon: '💰', label: 'Total Revenue', value: stats.totalRevenue, color: '#F7C948' },
      ]
    : [];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return 'just now';
  };

  return (
    <>
      <style>{S}</style>
      <div className="m2">
        <h1>Master Dashboard</h1>
        <p className="m2-sub">Platform-wide overview — all colleges{stats?.pendingRequests ? ` · ⚠️ ${stats.pendingRequests} pending request${stats.pendingRequests > 1 ? 's' : ''}` : ''}</p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#EF4444', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          {loading
            ? Array(4).fill(0).map((_, i) => (
                <div className="stat-card" key={i}>
                  <div className="skeleton" style={{ height: 20, width: 30, marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 32, width: 90, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: 110 }} />
                </div>
              ))
            : HERO.map(s => (
                <div className="stat-card" key={s.label}>
                  <span className="stat-icon">{s.icon}</span>
                  <span className="stat-val" style={{ color: s.color }}>{s.value}</span>
                  <span className="stat-lbl">{s.label}</span>
                </div>
              ))}
        </div>

        {/* Revenue Bars + Pending Summary */}
        <div className="charts-row">
          <div className="chart-card">
            <div className="chart-ttl">Revenue by College</div>
            {loading ? (
              Array(2).fill(0).map((_, i) => (
                <div className="bar-row" key={i}>
                  <div className="skeleton" style={{ height: 12, marginBottom: 8 }} />
                  <div className="bar-track"><div className="bar-fill" style={{ width: '0%' }} /></div>
                </div>
              ))
            ) : revenueBars.length === 0 ? (
              <div style={{ color: 'var(--t3)', fontSize: 13, padding: '20px 0' }}>No completed orders yet.</div>
            ) : (
              revenueBars.map(b => (
                <div className="bar-row" key={b.name}>
                  <div className="bar-lr">
                    <span>{b.name}</span>
                    <span style={{ color: '#F7C948', fontWeight: 700 }}>₹{b.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${b.pct}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="chart-card">
            <div className="chart-ttl">Platform Summary</div>
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div className="skeleton" style={{ height: 14, width: 120 }} />
                  <div className="skeleton" style={{ height: 14, width: 50 }} />
                </div>
              ))
            ) : stats ? (
              [
                { label: '🏫 Active Colleges', value: stats.activeColleges, color: '#F7C948' },
                { label: '⏳ Pending Requests', value: stats.pendingRequests, color: '#F59E0B' },
                { label: '🎓 Total Students', value: stats.totalStudents.toLocaleString('en-IN'), color: '#4F8EF7' },
                { label: '📦 Approved Products', value: stats.totalProducts.toLocaleString('en-IN'), color: '#10B981' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--t2)' }}>{row.label}</span>
                  <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, color: row.color }}>{row.value}</span>
                </div>
              ))
            ) : null}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="act-card">
          <div className="act-ttl">Recent College Activity</div>
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div className="act-item" key={i}>
                <div className="skeleton" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
                <div className="skeleton" style={{ flex: 1, height: 14 }} />
                <div className="skeleton" style={{ width: 60, height: 20, borderRadius: 9999 }} />
              </div>
            ))
          ) : recentActivity.length === 0 ? (
            <div style={{ color: 'var(--t3)', fontSize: 13, padding: '16px 0' }}>No recent activity.</div>
          ) : (
            recentActivity.map(a => (
              <div className="act-item" key={a.id}>
                <span className="act-icon">{a.isApproved ? '✅' : '🆕'}</span>
                <span className="act-msg">
                  {a.isApproved ? `${a.name} is an active college` : `New college request: ${a.name}`}
                </span>
                <span
                  className="act-badge"
                  style={
                    a.isApproved
                      ? { background: 'rgba(16,185,129,.15)', color: '#10B981', border: '1px solid rgba(16,185,129,.3)' }
                      : { background: 'rgba(245,158,11,.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,.3)' }
                  }
                >
                  {a.isApproved ? 'ACTIVE' : 'PENDING'}
                </span>
                <span className="act-time">{timeAgo(a.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
