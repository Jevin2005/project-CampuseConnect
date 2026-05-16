'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../store/authStore';

const API = 'http://localhost:5000/api/master';

const S = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
:root{--bg:#0A0E1A;--card:#111827;--c2:#1a2235;--bd:#1e2d45;--gold:#F7C948;--t1:#F0F4FF;--t2:#9CA3AF;--t3:#6B7280;--blue:#4F8EF7;--green:#10B981;--red:#EF4444;}
.m8{padding:32px;min-height:100vh;background:var(--bg);}
.m8 h1{font-family:'Sora',sans-serif;font-size:26px;font-weight:800;color:var(--t1);margin-bottom:4px;}
.sub{font-size:13px;color:var(--t3);margin-bottom:20px;}
.filter-card{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;gap:12px;flex-wrap:wrap;}
.filter-l{display:flex;gap:10px;flex-wrap:wrap;}
.sel{padding:8px 14px;background:var(--c2);border:1px solid var(--bd);border-radius:8px;color:var(--t1);font-family:'DM Sans',sans-serif;font-size:13px;outline:none;cursor:pointer;}
.search{padding:8px 14px;background:var(--c2);border:1px solid var(--bd);border-radius:8px;color:var(--t1);font-family:'DM Sans',sans-serif;font-size:13px;outline:none;width:240px;}
.tbl-card{background:var(--card);border:1px solid var(--bd);border-radius:14px;overflow:hidden;}
table{width:100%;border-collapse:collapse;}
th{padding:12px 16px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--t3);border-bottom:1px solid var(--bd);}
td{padding:13px 16px;font-size:13px;color:var(--t2);border-bottom:1px solid var(--bd);}
tr:last-child td{border-bottom:none;}
tr:hover td{background:rgba(247,201,72,.025);cursor:pointer;}
.av{width:38px;height:38px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0;}
.nc{display:flex;align-items:center;gap:10px;}
.nn{font-weight:600;color:var(--t1);font-size:13px;}
.ne{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--t3);margin-top:2px;}
.cpill{padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700;}
.pill{display:inline-block;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700;}
.pg{background:rgba(16,185,129,.12);color:var(--green);}
.pr{background:rgba(239,68,68,.12);color:var(--red);}
.pnd{background:rgba(245,158,11,.12);color:#F59E0B;}
.num-badge{padding:3px 9px;border-radius:9999px;font-size:11px;font-weight:700;}
.av2{padding:4px 12px;border-radius:9999px;border:1.5px solid var(--blue);background:none;color:var(--blue);font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;}
.pg-row{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:16px;padding:16px;}
.pgbtn{padding:6px 14px;border-radius:9999px;border:1px solid var(--bd);background:none;color:var(--t3);font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;}
.pgbtn.active{background:var(--gold);color:#0A0E1A;border-color:var(--gold);}
.pgbtn:not(.active):hover{border-color:rgba(247,201,72,.4);color:var(--t1);}
.pgbtn:disabled{opacity:.4;cursor:not-allowed;}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:40;backdrop-filter:blur(4px);}
.drawer{position:fixed;top:0;right:0;height:100vh;width:340px;background:var(--card);border-left:3px solid var(--gold);z-index:50;padding:28px 24px;overflow-y:auto;box-shadow:-8px 0 32px rgba(0,0,0,.4);}
.dr-close{position:absolute;top:16px;right:16px;background:none;border:none;color:var(--t3);font-size:20px;cursor:pointer;padding:4px 8px;border-radius:6px;}
.dr-close:hover{color:var(--t1);}
.dr-av{width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#0A0E1A;margin:0 auto 16px;}
.dr-name{font-family:'Sora',sans-serif;font-size:20px;font-weight:800;color:var(--t1);text-align:center;margin-bottom:8px;}
.dr-pills{display:flex;gap:8px;justify-content:center;margin-bottom:20px;flex-wrap:wrap;}
.dr-info{display:flex;flex-direction:column;gap:10px;margin-bottom:20px;}
.dr-row{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:var(--t2);}
.dr-lbl{font-size:11px;color:var(--t3);width:90px;flex-shrink:0;}
.dr-val{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--t1);word-break:break-all;}
.dr-stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;}
.dr-stat{background:var(--c2);border-radius:10px;padding:14px;text-align:center;}
.dr-stat-v{font-family:'Sora',sans-serif;font-size:22px;font-weight:800;display:block;margin-bottom:4px;}
.dr-stat-l{font-size:11px;color:var(--t3);}
.skeleton{background:linear-gradient(90deg,var(--c2) 25%,#202d42 50%,var(--c2) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:6px;}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
`;

const AVATAR_COLORS = ['#F7C948','#4F8EF7','#7C3AED','#10B981','#F59E0B','#EF4444','#06B6D4','#EC4899'];
function avatarColor(str: string) {
  let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 0xFFFFFF;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name: string) { return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?'; }

interface Student {
  id: string; name: string; email: string; enrollmentId: string; phone: string;
  college: string; collegeId: string; isApproved: boolean; status: string;
  products: number; purchases: number; joined: string;
}

interface CollegeOption { id: string; name: string; }

export default function AllStudentsPage() {
  const { accessToken } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [collegeOptions, setCollegeOptions] = useState<CollegeOption[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState<Student | null>(null);
  const [search, setSearch] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [status, setStatus] = useState('');

  // Load college options for filter dropdown
  useEffect(() => {
    if (!accessToken) return;
    fetch(`${API}/colleges/active`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(r => r.json())
      .then(d => setCollegeOptions(d.colleges || []))
      .catch(console.error);
  }, [accessToken]);

  const fetchStudents = useCallback(async (pg = 1) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pg), limit: '20',
        ...(search    ? { search }    : {}),
        ...(collegeId ? { collegeId } : {}),
        ...(status    ? { status }    : {}),
      });
      const res = await fetch(`${API}/students?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setStudents(data.students || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setPage(pg);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [accessToken, search, collegeId, status]);

  useEffect(() => { fetchStudents(1); }, [fetchStudents]);

  const pageNums = () => {
    const pages: (number | '...')[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
      else if (pages[pages.length - 1] !== '...') pages.push('...');
    }
    return pages;
  };

  return (
    <>
      <style>{S}</style>
      <div className="m8">
        <h1>All Students</h1>
        <p className="sub">{loading ? '…' : `${total.toLocaleString('en-IN')} students across ${collegeOptions.length} active college${collegeOptions.length !== 1 ? 's' : ''}`}</p>

        <div className="filter-card">
          <div className="filter-l">
            <select className="sel" value={collegeId} onChange={e => { setCollegeId(e.target.value); setPage(1); }}>
              <option value="">All Colleges</option>
              {collegeOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="sel" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="approved">Active</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <input
            className="search"
            placeholder="🔍 Search by name, email, enroll ID…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="tbl-card">
          <table>
            <thead>
              <tr><th>Name</th><th>College</th><th>Enrolled</th><th>Products</th><th>Purchases</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading
                ? Array(8).fill(0).map((_, i) => (
                    <tr key={i}>
                      {Array(7).fill(0).map((_, j) => (
                        <td key={j}><div className="skeleton" style={{ height: 14, width: j === 0 ? 160 : 80 }} /></td>
                      ))}
                    </tr>
                  ))
                : students.map(st => {
                    const color = avatarColor(st.name);
                    return (
                      <tr key={st.id} onClick={() => setDrawer(st)}>
                        <td>
                          <div className="nc">
                            <div className="av" style={{ background: color }}>{initials(st.name)}</div>
                            <div>
                              <div className="nn">{st.name}</div>
                              <div className="ne">{st.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="cpill" style={{ background: 'rgba(79,142,247,.12)', color: 'var(--blue)' }}>
                            {st.college}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--t3)' }}>
                          {new Date(st.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </td>
                        <td><span className="num-badge" style={{ background: 'rgba(79,142,247,.12)', color: 'var(--blue)' }}>{st.products}</span></td>
                        <td><span className="num-badge" style={{ background: 'rgba(16,185,129,.12)', color: 'var(--green)' }}>{st.purchases}</span></td>
                        <td>
                          <span className={`pill ${st.status === 'Active' ? 'pg' : 'pnd'}`}>{st.status}</span>
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <button className="av2" onClick={() => setDrawer(st)}>View</button>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>

          {!loading && students.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#6B7280' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🎓</div>
              <div style={{ fontFamily: "'Sora',sans-serif", color: '#F0F4FF', marginBottom: 6 }}>No students found</div>
              <div style={{ fontSize: 13 }}>Try adjusting your filters.</div>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pg-row">
              <button className="pgbtn" disabled={page === 1} onClick={() => fetchStudents(page - 1)}>←</button>
              {pageNums().map((p, i) =>
                p === '...'
                  ? <span key={i} style={{ color: 'var(--t3)', fontSize: 12 }}>…</span>
                  : <button key={p} className={`pgbtn ${p === page ? 'active' : ''}`} onClick={() => fetchStudents(p as number)}>{p}</button>
              )}
              <button className="pgbtn" disabled={page === totalPages} onClick={() => fetchStudents(page + 1)}>→</button>
            </div>
          )}
        </div>
      </div>

      {drawer && (
        <>
          <div className="overlay" onClick={() => setDrawer(null)} />
          <div className="drawer">
            <button className="dr-close" onClick={() => setDrawer(null)}>✕</button>
            <div className="dr-av" style={{ background: avatarColor(drawer.name) }}>{initials(drawer.name)}</div>
            <div className="dr-name">{drawer.name}</div>
            <div className="dr-pills">
              <span className="cpill" style={{ background: 'rgba(79,142,247,.12)', color: 'var(--blue)' }}>{drawer.college}</span>
              <span className={`pill ${drawer.status === 'Active' ? 'pg' : 'pnd'}`}>{drawer.status}</span>
            </div>

            <div className="dr-info">
              <div className="dr-row">
                <span className="dr-lbl">📧 Email</span>
                <span className="dr-val">{drawer.email}</span>
              </div>
              <div className="dr-row">
                <span className="dr-lbl">🎫 Enroll ID</span>
                <span className="dr-val">{drawer.enrollmentId}</span>
              </div>
              <div className="dr-row">
                <span className="dr-lbl">📞 Phone</span>
                <span className="dr-val">{drawer.phone}</span>
              </div>
              <div className="dr-row">
                <span className="dr-lbl">📅 Joined</span>
                <span className="dr-val">{new Date(drawer.joined).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="dr-stats">
              <div className="dr-stat">
                <span className="dr-stat-v" style={{ color: 'var(--blue)' }}>{drawer.products}</span>
                <span className="dr-stat-l">📦 Products</span>
              </div>
              <div className="dr-stat">
                <span className="dr-stat-v" style={{ color: 'var(--green)' }}>{drawer.purchases}</span>
                <span className="dr-stat-l">🛒 Purchases</span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
