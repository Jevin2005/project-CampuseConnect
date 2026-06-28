'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  --t1: #F0F4FF;
  --t2: #9CA3AF;
  --t3: #6B7280;
}
* { box-sizing: border-box; }
.pg {
  padding: 36px;
  min-height: 100vh;
  background: var(--bg);
  background-image: radial-gradient(ellipse 60% 30% at 50% 0%, rgba(247,201,72,.04) 0%, transparent 70%);
  font-family: 'DM Sans', sans-serif;
}

/* Header */
.hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
.hdr-left h1 { font-family: 'Sora', sans-serif; font-size: 30px; font-weight: 800; color: var(--t1); margin-bottom: 5px; letter-spacing: -0.5px; }
.hdr-left h1 span { color: var(--gold); }
.hdr-sub { font-size: 13px; color: var(--t3); }
.hdr-badge {
  background: linear-gradient(135deg, rgba(247,201,72,.18), rgba(245,158,11,.08));
  border: 1px solid rgba(247,201,72,.4);
  color: var(--gold);
  font-size: 12px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
  padding: 7px 18px; border-radius: 9999px;
  box-shadow: 0 0 20px rgba(247,201,72,.18), inset 0 1px 0 rgba(247,201,72,.15);
}

/* Summary strip */
.summary-strip {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px;
}
.sum-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px; padding: 22px 26px;
  display: flex; align-items: center; gap: 18px;
  backdrop-filter: blur(16px);
  transition: border-color .25s, transform .2s, box-shadow .25s;
  position: relative; overflow: hidden;
}
.sum-card::before {
  content: ''; position: absolute; inset: 0; border-radius: 16px;
  background: linear-gradient(135deg, rgba(255,255,255,.025) 0%, transparent 60%);
  pointer-events: none;
}
.sum-card:hover { border-color: var(--border-hover); transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,.35); }
.sum-icon-wrap {
  width: 50px; height: 50px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; flex-shrink: 0;
}
.si-gold { background: rgba(247,201,72,.14); box-shadow: 0 0 16px rgba(247,201,72,.12); }
.si-blue { background: rgba(79,142,247,.14); box-shadow: 0 0 16px rgba(79,142,247,.12); }
.si-green { background: rgba(16,185,129,.14); box-shadow: 0 0 16px rgba(16,185,129,.12); }
.sum-val { font-family: 'Sora', sans-serif; font-size: 24px; font-weight: 800; color: var(--t1); line-height: 1; margin-bottom: 5px; }
.sum-lbl { font-size: 12px; color: var(--t3); font-weight: 500; letter-spacing: .2px; }

/* Filters */
.filter-row { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; align-items: center; }
.search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 360px; }
.search-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); font-size: 14px; color: var(--t3); pointer-events: none; }
.inp {
  width: 100%; background: var(--card2);
  border: 1.5px solid var(--border);
  border-radius: 10px; padding: 10px 13px 10px 38px;
  font-family: 'DM Sans', sans-serif; font-size: 13px;
  color: var(--t1); outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.inp::placeholder { color: #3d4f6b; }
.inp:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(247,201,72,.1); }
.sel {
  background: var(--card2); border: 1.5px solid var(--border);
  border-radius: 10px; padding: 10px 14px;
  font-family: 'DM Sans', sans-serif; font-size: 13px;
  color: var(--t2); outline: none; cursor: pointer;
  transition: border-color .2s, box-shadow .2s;
}
.sel:hover { border-color: rgba(99,130,190,.4); }
.sel:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(247,201,72,.1); }
.results-count {
  font-size: 12px; color: var(--t3); margin-left: auto;
  background: var(--card2); border: 1px solid var(--border);
  padding: 6px 14px; border-radius: 9999px;
}

/* Grid */
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

/* College card */
.ccard {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px; padding: 26px;
  backdrop-filter: blur(16px);
  transition: transform .25s cubic-bezier(.25,.8,.25,1), border-color .25s, box-shadow .25s;
  position: relative; overflow: hidden;
}
.ccard::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent 0%, var(--gold) 50%, transparent 100%);
  opacity: 0; transition: opacity .3s;
}
.ccard::after {
  content: '';
  position: absolute; inset: 0; border-radius: 18px;
  background: linear-gradient(135deg, rgba(255,255,255,.02) 0%, transparent 50%);
  pointer-events: none;
}
.ccard:hover { transform: translateY(-5px); border-color: var(--border-hover); box-shadow: 0 20px 56px rgba(0,0,0,.45), 0 0 0 1px rgba(247,201,72,.08); }
.ccard:hover::before { opacity: 1; }

/* Card top row */
.card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; gap: 10px; }
.card-name { font-family: 'Sora', sans-serif; font-size: 17px; font-weight: 700; color: var(--t1); line-height: 1.35; flex: 1; min-width: 0; }
.badge-active {
  background: rgba(16,185,129,.12); border: 1px solid rgba(16,185,129,.3);
  color: var(--green); font-size: 10px; font-weight: 700;
  padding: 3px 10px; border-radius: 9999px; white-space: nowrap; flex-shrink: 0;
  box-shadow: 0 0 10px rgba(16,185,129,.1);
}

/* Meta pills row */
.meta-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.pill {
  background: rgba(25,38,68,.9); border: 1px solid rgba(99,130,190,.18);
  border-radius: 9999px; padding: 3px 10px; font-size: 11px; color: var(--t2); white-space: nowrap;
  transition: border-color .2s;
}
.pill:hover { border-color: rgba(99,130,190,.35); }
.pill-mono { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--gold); background: rgba(247,201,72,.06); border-color: rgba(247,201,72,.2); }

/* Admin email row */
.admin-row { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.admin-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--blue); box-shadow: 0 0 6px var(--blue); flex-shrink: 0; }
.admin-email { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--t3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Divider */
.divider { height: 1px; background: linear-gradient(90deg, transparent, var(--border), transparent); margin-bottom: 18px; }

/* Stats row */
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
.stat-item {
  background: rgba(20,30,55,.6); border: 1px solid var(--border);
  border-radius: 10px; padding: 10px 12px;
  display: flex; flex-direction: column; gap: 4px;
  transition: border-color .2s;
}
.stat-item:hover { border-color: rgba(99,130,190,.3); }
.stat-lbl { font-size: 9px; color: var(--t3); text-transform: uppercase; letter-spacing: .8px; font-weight: 700; }
.stat-val { font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 800; color: var(--t1); }
.stat-val.gold { color: var(--gold); }
.stat-val.blue { color: var(--blue); }
.stat-val.green { color: var(--green); }

/* Rev progress */
.rev-track { background: rgba(20,32,60,.9); border-radius: 9999px; height: 5px; margin-bottom: 6px; overflow: hidden; }
.rev-fill { height: 100%; border-radius: 9999px; background: linear-gradient(90deg, #F7C948, #F59E0B); transition: width .7s ease; box-shadow: 0 0 8px rgba(247,201,72,.4); }
.rev-caption { font-size: 11px; color: var(--t3); margin-bottom: 16px; }

/* Card footer */
.card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 2px; }
.card-joined { font-size: 11px; color: var(--t3); }
.view-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 700; color: var(--gold);
  text-decoration: none; padding: 7px 18px;
  background: rgba(247,201,72,.05);
  border: 1px solid rgba(247,201,72,.25); border-radius: 9999px;
  transition: all .25s ease;
  letter-spacing: 0.5px; text-transform: uppercase;
}
.view-btn:hover {
  background: rgba(247,201,72,.14);
  border-color: var(--gold);
  box-shadow: 0 0 16px rgba(247,201,72,.25);
  transform: translateY(-1px);
}
.view-btn .arrow {
  display: inline-block;
  transition: transform .2s ease;
}
.view-btn:hover .arrow {
  transform: translateX(3px);
}

/* Skeleton */
.skeleton {
  background: linear-gradient(90deg, rgba(20,30,55,.9) 25%, rgba(32,48,84,.9) 50%, rgba(20,30,55,.9) 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px;
}
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* Empty state */
.empty { text-align: center; padding: 80px 0; color: var(--t3); }
.empty-icon { font-size: 52px; margin-bottom: 16px; opacity: .6; }
.empty-title { font-family: 'Sora', sans-serif; font-size: 18px; color: var(--t1); margin-bottom: 6px; font-weight: 700; }
.empty-sub { font-size: 13px; }
`;

interface College {
  id: string; name: string; city: string; type: string;
  code: string; domain: string; students: number; products: number;
  revenue: string; revenueRaw: number; revPct: number; joined: string;
}

// Extended interface with admin info from the response
interface CollegeWithAdmin extends College {
  adminEmail?: string;
  admins?: number;
}

export default function AllCollegesPage() {
  const { accessToken } = useAuthStore();
  const [colleges, setColleges] = useState<CollegeWithAdmin[]>([]);
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
  const totalProducts = colleges.reduce((s, c) => s + (c.products || 0), 0);

  return (
    <>
      <style>{S}</style>
      <div className="pg">

        {/* Header */}
        <div className="hdr">
          <div className="hdr-left">
            <h1>All <span>Colleges</span></h1>
            <p className="hdr-sub">Manage and monitor all active college marketplaces</p>
          </div>
          <span className="hdr-badge">
            {loading ? '…' : `${colleges.length} Active`}
          </span>
        </div>

        {/* Summary strip */}
        <div className="summary-strip">
          {[
            { icon: '🏫', val: loading ? '…' : colleges.length.toLocaleString('en-IN'), lbl: 'Active Colleges',  cls: 'si-gold'  },
            { icon: '🎓', val: loading ? '…' : totalStudents.toLocaleString('en-IN'),   lbl: 'Total Students',  cls: 'si-blue'  },
            { icon: '💰', val: loading ? '…' : `₹${totalRevenue.toLocaleString('en-IN')}`, lbl: 'Gross Revenue', cls: 'si-green' },
          ].map(s => (
            <div className="sum-card" key={s.lbl}>
              <div className={`sum-icon-wrap ${s.cls}`}>{s.icon}</div>
              <div>
                <div className="sum-val">{s.val}</div>
                <div className="sum-lbl">{s.lbl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="filter-row">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="inp"
              placeholder="Search by name, city, or code…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="sel" value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="sel" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {!loading && <span className="results-count">{filtered.length} of {colleges.length} shown</span>}
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="grid">
            {Array(4).fill(0).map((_, i) => (
              <div className="ccard" key={i}>
                <div className="skeleton" style={{ height: 22, width: '65%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 12, width: '45%', marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 1, marginBottom: 14 }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
                  {Array(3).fill(0).map((_, j) => <div key={j} className="skeleton" style={{ height: 44 }} />)}
                </div>
                <div className="skeleton" style={{ height: 5, marginBottom: 16 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="skeleton" style={{ height: 12, width: 80 }} />
                  <div className="skeleton" style={{ height: 26, width: 100, borderRadius: 9999 }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid">
            {filtered.map(c => {
              const adminEmail = (c as any).adminEmail;
              return (
                <div className="ccard" key={c.id}>
                  {/* Top */}
                  <div className="card-top">
                    <span className="card-name">{c.name}</span>
                    <span className="badge-active">✓ Active</span>
                  </div>

                  {/* Meta pills */}
                  <div className="meta-row">
                    {c.city  && <span className="pill">📍 {c.city}</span>}
                    {c.type  && <span className="pill">{c.type}</span>}
                    {c.code  && <span className="pill pill-mono">#{c.code}</span>}
                    {c.domain && <span className="pill pill-mono">@{c.domain}</span>}
                  </div>

                  {/* Admin email */}
                  {adminEmail && (
                    <div className="admin-row">
                      <span className="admin-dot" />
                      <span className="admin-email">{adminEmail}</span>
                    </div>
                  )}
                  {!adminEmail && <div style={{ marginBottom: 16 }} />}

                  <div className="divider" />

                  {/* Stats */}
                  <div className="stats-row">
                    <div className="stat-item">
                      <span className="stat-lbl">Students</span>
                      <span className="stat-val blue">{c.students.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-lbl">Products</span>
                      <span className="stat-val">{c.products.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-lbl">Revenue</span>
                      <span className="stat-val green">{c.revenue}</span>
                    </div>
                  </div>

                  {/* Revenue bar */}
                  <div className="rev-track">
                    <div className="rev-fill" style={{ width: `${c.revPct || 0}%` }} />
                  </div>
                  <div className="rev-caption">
                    {c.revPct > 0 ? `${c.revPct}% of total platform revenue` : 'No completed orders yet'}
                  </div>

                  {/* Footer */}
                  <div className="card-footer">
                    <span className="card-joined">
                      Joined {new Date(c.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                    <Link href={`/master/colleges/${c.id}`} className="view-btn">
                      View Details <span className="arrow">→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="empty">
            <div className="empty-icon">🏫</div>
            <div className="empty-title">No colleges found</div>
            <div className="empty-sub">Try adjusting your search or filters.</div>
          </div>
        )}
      </div>
    </>
  );
}
