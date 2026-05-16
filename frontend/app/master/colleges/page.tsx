'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../../store/authStore';

const API = 'http://localhost:5000/api/master';

const S = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
:root{--bg:#0A0E1A;--card:#111827;--card2:#1a2235;--border:#1e2d45;--gold:#F7C948;--t1:#F0F4FF;--t2:#9CA3AF;--t3:#6B7280;}
.m4{padding:32px;min-height:100vh;background:var(--bg);}
.m4-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;}
.m4-hdr h1{font-family:'Sora',sans-serif;font-size:26px;font-weight:700;color:var(--t1);margin-bottom:4px;}
.m4-sub{font-size:13px;color:var(--t3);}
.m4-count{background:rgba(247,201,72,.12);border:1px solid rgba(247,201,72,.3);color:var(--gold);font-size:12px;font-weight:700;padding:4px 14px;border-radius:9999px;}
.filter-row{display:flex;gap:12px;margin-bottom:20px;}
.search-wrap{position:relative;flex:1;max-width:300px;}
.search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#6B7280;font-size:14px;}
.m4-input{width:100%;background:var(--card2);border:1.5px solid var(--border);border-radius:8px;padding:9px 12px 9px 34px;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--t1);outline:none;transition:border-color .2s;}
.m4-input:focus{border-color:var(--gold);}
.m4-input::placeholder{color:#374151;}
.m4-select{background:var(--card2);border:1.5px solid var(--border);border-radius:8px;padding:9px 12px;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--t2);outline:none;cursor:pointer;}
.summary-row{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:24px;}
.sum-card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px 18px;display:flex;align-items:center;gap:12px;}
.sum-icon{font-size:20px;}
.sum-val{font-family:'Sora',sans-serif;font-size:18px;font-weight:700;color:var(--t1);}
.sum-lbl{font-size:11px;color:var(--t3);}
.colleges-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.col-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:24px;transition:transform .2s,border-color .2s;}
.col-card:hover{transform:translateY(-3px);border-color:rgba(247,201,72,.3);}
.col-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;}
.col-name{font-family:'Sora',sans-serif;font-size:18px;font-weight:700;color:var(--t1);}
.badge-active{background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.3);color:#10B981;font-size:11px;font-weight:700;padding:3px 10px;border-radius:9999px;}
.badge-pending{background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.3);color:#F59E0B;font-size:11px;font-weight:700;padding:3px 10px;border-radius:9999px;}
.col-meta{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;}
.meta-pill{background:var(--card2);border:1px solid var(--border);border-radius:9999px;padding:3px 10px;font-size:11px;color:var(--t2);}
.col-divider{height:1px;background:var(--border);margin-bottom:14px;}
.col-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;}
.cs-item{display:flex;flex-direction:column;gap:2px;}
.cs-label{font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;}
.cs-val{font-size:14px;font-weight:700;color:var(--t1);}
.rev-track{background:var(--card2);border-radius:9999px;height:6px;margin-bottom:4px;overflow:hidden;}
.rev-fill{height:100%;border-radius:9999px;background:linear-gradient(90deg,#F7C948,#F59E0B);}
.rev-caption{font-size:11px;color:var(--t3);margin-bottom:14px;}
.col-footer{display:flex;align-items:center;justify-content:space-between;}
.col-joined{font-size:12px;color:var(--t3);}
.view-link{font-size:13px;font-weight:700;color:var(--gold);text-decoration:none;}
.view-link:hover{text-decoration:underline;}
.skeleton{background:linear-gradient(90deg,var(--card2) 25%,#202d42 50%,var(--card2) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px;}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
`;

interface College {
  id: string;
  name: string;
  city: string;
  type: string;
  code: string;
  domain: string;
  students: number;
  products: number;
  revenue: string;
  revenueRaw: number;
  revPct: number;
  joined: string;
}

export default function AllCollegesPage() {
  const { accessToken } = useAuthStore();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    if (!accessToken) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/colleges`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error('Failed to load colleges');
        const data = await res.json();
        setColleges(data.active || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken]);

  const cities = Array.from(new Set(colleges.map(c => c.city).filter(Boolean)));
  const types  = Array.from(new Set(colleges.map(c => c.type).filter(Boolean)));

  const filtered = colleges.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !search || c.name.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q);
    const matchCity = !cityFilter || c.city === cityFilter;
    const matchType = !typeFilter || c.type === typeFilter;
    return matchSearch && matchCity && matchType;
  });

  const totalStudents = colleges.reduce((s, c) => s + (c.students || 0), 0);
  const totalRevenue  = colleges.reduce((s, c) => s + (c.revenueRaw || 0), 0);

  return (
    <>
      <style>{S}</style>
      <div className="m4">
        <div className="m4-hdr">
          <div>
            <h1>All Colleges</h1>
            <p className="m4-sub">Manage and monitor all active college marketplaces</p>
          </div>
          <span className="m4-count">{colleges.length} Active College{colleges.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Filters */}
        <div className="filter-row">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="m4-input"
              placeholder="Search colleges…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="m4-select" value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="m4-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Summary */}
        <div className="summary-row">
          {[
            { icon: '🏫', val: colleges.length, lbl: 'Active Colleges' },
            { icon: '🎓', val: totalStudents.toLocaleString('en-IN'), lbl: 'Total Students' },
            { icon: '💰', val: `₹${totalRevenue.toLocaleString('en-IN')}`, lbl: 'Total Revenue' },
          ].map(s => (
            <div className="sum-card" key={s.lbl}>
              <span className="sum-icon">{s.icon}</span>
              <div>
                <div className="sum-val">{s.val}</div>
                <div className="sum-lbl">{s.lbl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="colleges-grid">
            {Array(4).fill(0).map((_, i) => (
              <div className="col-card" key={i}>
                <div className="skeleton" style={{ height: 24, width: '60%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 1, marginBottom: 14 }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
                  {Array(3).fill(0).map((_, j) => <div key={j} className="skeleton" style={{ height: 40 }} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="colleges-grid">
            {filtered.map(c => (
              <div className="col-card" key={c.id}>
                <div className="col-top">
                  <span className="col-name">{c.name}</span>
                  <span className="badge-active">✅ Active</span>
                </div>

                <div className="col-meta">
                  {c.city && <span className="meta-pill">📍 {c.city}</span>}
                  {c.type && <span className="meta-pill">{c.type}</span>}
                  {c.code && <span className="meta-pill">#{c.code}</span>}
                  {c.domain && <span className="meta-pill">@{c.domain}</span>}
                </div>

                <div className="col-divider" />

                <div className="col-stats">
                  {[
                    { lbl: '🎓 Students', val: c.students.toLocaleString('en-IN') },
                    { lbl: '📦 Products', val: c.products.toLocaleString('en-IN') },
                    { lbl: '💰 Revenue',  val: c.revenue },
                  ].map(s => (
                    <div className="cs-item" key={s.lbl}>
                      <span className="cs-label">{s.lbl}</span>
                      <span className="cs-val">{s.val}</span>
                    </div>
                  ))}
                </div>

                <div className="rev-track">
                  <div className="rev-fill" style={{ width: `${c.revPct || 0}%` }} />
                </div>
                <div className="rev-caption">
                  {c.revPct > 0 ? `${c.revPct}% of platform revenue` : 'No revenue yet'}
                </div>

                <div className="col-footer">
                  <span className="col-joined">Joined {new Date(c.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                  <Link href={`/master/colleges/${c.id}`} className="view-link">View Details →</Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B7280' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏫</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, color: '#F0F4FF', marginBottom: 6 }}>No colleges found</div>
            <div style={{ fontSize: 13 }}>Try adjusting your search or filters.</div>
          </div>
        )}
      </div>
    </>
  );
}
