'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/authStore';

const API = 'http://localhost:5000/api/admin';

interface DashData {
  stats: { totalStudents: number; pendingStudents: number; totalProducts: number; pendingProducts: number; revenue: number };
  pendingRequests: { id: string; name: string; email: string; initials: string; color: string; date: string }[];
  pendingProducts: { id: string; title: string; seller: string; price: string; category: string }[];
  activity: { icon: string; text: string; time: string }[];
  college: { name: string };
  adminName: string;
}

const COLORS = { green: '#10B981', blue: '#4F8EF7', gold: '#F7C948', orange: '#F59E0B' };

function relTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  return `${Math.floor(h / 24)} day${Math.floor(h / 24) > 1 ? 's' : ''} ago`;
}

export default function AdminDashboardPage() {
  const { accessToken } = useAuthStore();
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reqActs, setReqActs] = useState<Record<string, 'approved' | 'rejected'>>({});
  const [prodActs, setProdActs] = useState<Record<string, 'approved' | 'removed'>>({});
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    if (!accessToken) return;
    fetch(`${API}/dashboard`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [accessToken]);

  const handleReqAction = async (id: string, action: 'approve' | 'reject') => {
    const endpoint = action === 'approve' ? 'approve' : 'reject';
    await fetch(`${API}/students/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ studentId: id }),
    });
    setReqActs(s => ({ ...s, [id]: action === 'approve' ? 'approved' : 'rejected' }));
  };

  const handleProdAction = async (id: string, action: 'approve' | 'remove') => {
    await fetch(`${API}/products/${id}/${action}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setProdActs(s => ({ ...s, [id]: action === 'approve' ? 'approved' : 'removed' }));
  };

  const s = data?.stats;

  return (
    <>
      <style>{`
        :root {
          --bg: #0A0E1A; --card: #111827; --card2: #1a2235; --border: #1e2d45;
          --green: #10B981; --blue: #4F8EF7; --gold: #F7C948; --orange: #F59E0B; --red: #EF4444;
          --t1: #F0F4FF; --t2: #9CA3AF; --t3: #6B7280;
        }
        .dp { background: var(--bg); min-height: 100vh; padding: 40px; animation: fi .4s ease; }
        @keyframes fi { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .greeting { margin-bottom: 32px; }
        .greeting-title { font-family: 'Sora',sans-serif; font-size: 24px; font-weight: 700; color: var(--t1); margin-bottom: 4px; }
        .greeting-sub { font-size: 14px; color: var(--t3); }
        .stat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px; }
        .sc { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 22px; text-decoration: none; display: block; transition: transform .2s, box-shadow .2s; }
        .sc:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.3); }
        .sc-icon { font-size: 28px; margin-bottom: 12px; display: block; }
        .sc-lbl { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: var(--t3); margin-bottom: 8px; }
        .sc-val { font-family: 'Sora',sans-serif; font-size: 28px; font-weight: 700; margin-bottom: 4px; }
        .sc-sub { font-size: 12px; color: var(--t3); display: flex; align-items: center; gap: 6px; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
        .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--orange); animation: pulse 1.5s ease-in-out infinite; }
        .mid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .section-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 20px; }
        .section-title { font-family: 'Sora',sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
        .view-all { font-size: 12px; text-decoration: none; opacity: .8; }
        .view-all:hover { opacity: 1; }
        .req-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .req-item:last-child { border-bottom: none; padding-bottom: 0; }
        .av { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Sora',sans-serif; font-size: 13px; font-weight: 700; color: #0A0E1A; flex-shrink: 0; }
        .req-info { flex: 1; min-width: 0; }
        .req-name { font-size: 14px; font-weight: 600; color: var(--t1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .req-email { font-size: 12px; color: var(--t3); font-family: 'JetBrains Mono',monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .req-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .btn-ap { background: rgba(16,185,129,.15); border: 1px solid rgba(16,185,129,.4); color: var(--green); padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; cursor: pointer; }
        .btn-ap:hover { background: rgba(16,185,129,.25); }
        .btn-rj { background: transparent; border: 1px solid rgba(239,68,68,.4); color: var(--red); padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; cursor: pointer; }
        .btn-rj:hover { background: rgba(239,68,68,.08); }
        .prod-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .prod-item:last-child { border-bottom: none; padding-bottom: 0; }
        .prod-icon { width: 36px; height: 36px; border-radius: 8px; background: var(--card2); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .prod-info { flex: 1; min-width: 0; }
        .prod-title { font-size: 13px; font-weight: 600; color: var(--t1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .prod-seller { font-size: 12px; color: var(--t3); }
        .prod-price { font-size: 13px; font-weight: 700; color: var(--green); flex-shrink: 0; }
        .activity-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 20px; }
        .activity-title { font-family: 'Sora',sans-serif; font-size: 18px; font-weight: 700; color: var(--t1); margin-bottom: 20px; }
        .act-item { display: flex; align-items: flex-start; gap: 14px; padding: 13px 0; border-bottom: 1px solid var(--border); }
        .act-item:last-child { border-bottom: none; }
        .act-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--green); margin-top: 4px; flex-shrink: 0; }
        .act-text { font-size: 14px; color: var(--t1); }
        .act-time { font-size: 12px; color: var(--t3); margin-top: 2px; }
        .skeleton { background: linear-gradient(90deg,var(--card2) 25%,#202d42 50%,var(--card2) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .empty { color: var(--t3); font-size: 13px; padding: 16px 0; text-align: center; }
        @media (max-width:1100px) { .stat-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width:800px) { .dp { padding: 24px 16px; } .stat-grid { grid-template-columns: 1fr; } .mid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="dp">
        <div className="greeting">
          <h1 className="greeting-title">
            {loading ? 'Welcome back 👋' : `Good day, ${data?.adminName || 'Admin'} 👋`}
          </h1>
          <p className="greeting-sub">
            {loading ? 'Loading…' : `${data?.college?.name} · ${today}`}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="stat-grid">
          {loading ? Array(4).fill(0).map((_,i) => (
            <div key={i} className="sc"><div className="skeleton" style={{height:100}} /></div>
          )) : [
            { icon:'👥', label:'TOTAL STUDENTS', value: s?.totalStudents ?? 0, sub: `${s?.pendingStudents ?? 0} pending`, color: COLORS.green, href:'/admin/requests' },
            { icon:'📦', label:'ACTIVE PRODUCTS', value: s?.totalProducts ?? 0, sub: `${s?.pendingProducts ?? 0} pending review`, color: COLORS.blue, href:'/admin/products', pulse: (s?.pendingProducts ?? 0) > 0 },
            { icon:'💰', label:'REVENUE (5% CUT)', value: `₹${(s?.revenue ?? 0).toLocaleString('en-IN')}`, sub: 'Platform earnings', color: COLORS.gold, href:'/admin/revenue' },
            { icon:'⏳', label:'PENDING REQUESTS', value: s?.pendingStudents ?? 0, sub: 'Needs attention', color: COLORS.orange, href:'/admin/requests', pulse: (s?.pendingStudents ?? 0) > 0 },
          ].map(card => (
            <Link key={card.label} href={card.href} className="sc" style={{ borderColor: `${card.color}22` }}>
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

        {/* Mid section */}
        <div className="mid">
          {/* Pending Student Requests */}
          <div className="section-card">
            <div className="section-title">
              <span style={{ color: COLORS.green }}>Student Requests</span>
              <Link href="/admin/requests" className="view-all" style={{ color: COLORS.green }}>View All →</Link>
            </div>
            {loading ? <div className="skeleton" style={{height:120}} /> :
             (data?.pendingRequests?.length ?? 0) === 0 ? <div className="empty">✅ No pending requests</div> :
             data!.pendingRequests.map(req => (
              <div key={req.id} className="req-item">
                <div className="av" style={{ background: req.color }}>{req.initials}</div>
                <div className="req-info">
                  <div className="req-name">{req.name}</div>
                  <div className="req-email">{req.email}</div>
                </div>
                <div className="req-actions">
                  {!reqActs[req.id] ? (
                    <>
                      <button className="btn-ap" onClick={() => handleReqAction(req.id, 'approve')}>✅</button>
                      <button className="btn-rj" onClick={() => handleReqAction(req.id, 'reject')}>❌</button>
                    </>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, color: reqActs[req.id] === 'approved' ? COLORS.green : '#EF4444' }}>
                      {reqActs[req.id] === 'approved' ? '✅ Approved' : '❌ Rejected'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Products Awaiting Review */}
          <div className="section-card">
            <div className="section-title">
              <span style={{ color: COLORS.blue }}>Products Awaiting Review</span>
              <Link href="/admin/products" className="view-all" style={{ color: COLORS.blue }}>View All →</Link>
            </div>
            {loading ? <div className="skeleton" style={{height:120}} /> :
             (data?.pendingProducts?.length ?? 0) === 0 ? <div className="empty">📦 No pending products</div> :
             data!.pendingProducts.map(prod => (
              <div key={prod.id} className="prod-item">
                <div className="prod-icon">📦</div>
                <div className="prod-info">
                  <div className="prod-title">{prod.title}</div>
                  <div className="prod-seller">by {prod.seller}</div>
                </div>
                <span className="prod-price">{prod.price}</span>
                <div style={{ display:'flex', gap:6, marginLeft:8 }}>
                  {!prodActs[prod.id] ? (
                    <>
                      <button className="btn-ap" style={{fontSize:11}} onClick={() => handleProdAction(prod.id, 'approve')}>Approve ✓</button>
                      <button className="btn-rj" style={{fontSize:11}} onClick={() => handleProdAction(prod.id, 'remove')}>Remove ✗</button>
                    </>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, color: prodActs[prod.id] === 'approved' ? COLORS.green : '#EF4444' }}>
                      {prodActs[prod.id] === 'approved' ? '✅ Approved' : '🗑 Removed'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-card">
          <div className="activity-title">Recent Activity</div>
          {loading ? <div className="skeleton" style={{height:160}} /> :
           (data?.activity?.length ?? 0) === 0 ? <div className="empty">No recent activity yet.</div> :
           data!.activity.map((item, i) => (
            <div key={i} className="act-item">
              <div className="act-dot" />
              <div>
                <div className="act-text">{item.icon} {item.text}</div>
                <div className="act-time">{relTime(item.time)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
