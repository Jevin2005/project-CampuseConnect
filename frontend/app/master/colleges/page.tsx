'use client';

import { useState } from 'react';
import Link from 'next/link';

const COLLEGES = [
  {
    id: 1,
    name: 'MIT Campus',
    city: 'Pune',
    type: 'Engineering',
    status: 'active',
    students: 920,
    products: 1740,
    revenue: 9670,
    ads: 4,
    revPct: 61,
    joined: 'Jan 2024',
  },
  {
    id: 2,
    name: 'ABC Engineering',
    city: 'Mumbai',
    type: 'Engineering',
    status: 'active',
    students: 550,
    products: 1100,
    revenue: 6010,
    ads: 2,
    revPct: 39,
    joined: 'Mar 2023',
  },
  {
    id: 3,
    name: 'City Arts College',
    city: 'Mumbai',
    type: 'Arts',
    status: 'pending',
    students: 0,
    products: 0,
    revenue: 0,
    ads: 0,
    revPct: 0,
    joined: '—',
  },
];

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
.col-meta{display:flex;gap:8px;margin-bottom:14px;}
.meta-pill{background:var(--card2);border:1px solid var(--border);border-radius:9999px;padding:3px 10px;font-size:11px;color:var(--t2);}
.col-divider{height:1px;background:var(--border);margin-bottom:14px;}
.col-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;}
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
`;

export default function AllCollegesPage() {
  const [search, setSearch] = useState('');
  const [city, setCity]     = useState('');

  const cities = Array.from(new Set(COLLEGES.map(c => c.city)));
  const filtered = COLLEGES.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
    const matchCity   = !city || c.city === city;
    return matchSearch && matchCity;
  });

  const totalStudents = COLLEGES.reduce((s,c) => s + c.students, 0);
  const totalRevenue  = COLLEGES.reduce((s,c) => s + c.revenue, 0);

  return (
    <>
      <style>{S}</style>
      <div className="m4">
        <div className="m4-hdr">
          <div>
            <h1>All Colleges</h1>
            <p className="m4-sub">Manage and monitor all college marketplaces</p>
          </div>
          <span className="m4-count">{COLLEGES.length} Colleges</span>
        </div>

        {/* Filters */}
        <div className="filter-row">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="m4-input"
              placeholder="Search colleges..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="m4-select" value={city} onChange={e => setCity(e.target.value)}>
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="m4-select">
            <option>All Status</option>
            <option>Active</option>
            <option>Pending</option>
          </select>
        </div>

        {/* Summary */}
        <div className="summary-row">
          {[
            { icon: '🏫', val: COLLEGES.length, lbl: 'Total Colleges' },
            { icon: '🎓', val: totalStudents.toLocaleString(), lbl: 'Total Students' },
            { icon: '💰', val: `₹${totalRevenue.toLocaleString()}`, lbl: 'Total Revenue' },
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
        <div className="colleges-grid">
          {filtered.map(c => (
            <div className="col-card" key={c.id}>
              <div className="col-top">
                <span className="col-name">{c.name}</span>
                {c.status === 'active'
                  ? <span className="badge-active">✅ Active</span>
                  : <span className="badge-pending">⏳ Pending</span>}
              </div>

              <div className="col-meta">
                <span className="meta-pill">📍 {c.city}</span>
                <span className="meta-pill">{c.type}</span>
              </div>

              <div className="col-divider" />

              <div className="col-stats">
                {[
                  { lbl: '🎓 Students', val: c.students.toLocaleString() },
                  { lbl: '📦 Products', val: c.products.toLocaleString() },
                  { lbl: '💰 Revenue',  val: c.revenue ? `₹${c.revenue.toLocaleString()}` : '₹0' },
                  { lbl: '📢 Ads',      val: c.ads },
                ].map(s => (
                  <div className="cs-item" key={s.lbl}>
                    <span className="cs-label">{s.lbl}</span>
                    <span className="cs-val">{s.val}</span>
                  </div>
                ))}
              </div>

              <div className="rev-track">
                <div className="rev-fill" style={{ width: `${c.revPct}%` }} />
              </div>
              <div className="rev-caption">
                {c.revPct > 0 ? `${c.revPct}% of platform revenue` : 'No revenue yet'}
              </div>

              <div className="col-footer">
                <span className="col-joined">{c.joined}</span>
                {c.status === 'active'
                  ? <Link href={`/master/colleges/${c.id}`} className="view-link">View Details →</Link>
                  : <Link href="/master/requests" className="view-link" style={{ color: '#F59E0B' }}>Review Request →</Link>}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
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
