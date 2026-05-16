'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

const BASE_NAV = [
  { href: '/master/dashboard', icon: '👑', label: 'Dashboard' },
  { href: '/master/requests',  icon: '🏫', label: 'College Requests' },
  { href: '/master/colleges',  icon: '🎓', label: 'All Colleges' },
  { href: '/master/students',  icon: '👤', label: 'All Students' },
  { href: '/master/revenue',   icon: '💰', label: 'Platform Revenue' },
  { href: '/master/settings',  icon: '⚙️', label: 'Settings' },
];

export default function MasterLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { clearAuth, accessToken, user } = useAuthStore();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!accessToken) return;
    fetch('http://localhost:5000/api/master/stats', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.stats?.pendingRequests) setPendingCount(d.stats.pendingRequests); })
      .catch(() => {});
  }, [accessToken]);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      console.error('Logout failed', e);
    }
    clearAuth();
    router.push('/master/login');
  };

  const isAuthPage = pathname === '/master/login';
  if (isAuthPage) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:'DM Sans',sans-serif; background:#0A0E1A; color:#F0F4FF; }
        `}</style>
        {children}
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        :root {
          --bg-primary:   #0A0E1A;
          --bg-sidebar:   #0d1120;
          --bg-card:      #111827;
          --bg-card2:     #1a2235;
          --border:       #1e2d45;
          --gold:         #F7C948;
          --gold-dim:     rgba(247,201,72,0.12);
          --gold-border:  rgba(247,201,72,0.25);
          --accent-blue:  #4F8EF7;
          --accent-green: #10B981;
          --accent-red:   #EF4444;
          --accent-orange:#F59E0B;
          --text-primary: #F0F4FF;
          --text-muted:   #6B7280;
          --text-soft:    #9CA3AF;
        }
        body { font-family:'DM Sans',sans-serif; background:var(--bg-primary); color:var(--text-primary); }

        .master-layout { display:flex; min-height:100vh; }

        .master-sidebar {
          width:240px; background:var(--bg-sidebar);
          border-right:1px solid var(--border);
          position:fixed; top:0; left:0; height:100vh;
          display:flex; flex-direction:column;
          overflow-y:auto; z-index:50;
        }

        .sidebar-header {
          padding:24px 20px 20px;
          border-bottom:1px solid var(--border);
        }
        .sidebar-logo {
          font-family:'Sora',sans-serif; font-size:18px;
          font-weight:700; margin-bottom:4px; display:block;
        }
        .logo-campus { color:var(--text-primary); }
        .logo-connect { color:var(--gold); }
        .sidebar-role-label {
          font-size:10px; color:var(--gold); font-weight:700;
          letter-spacing:1px; text-transform:uppercase; opacity:0.7;
          margin-top:2px;
        }

        .sidebar-nav { flex:1; padding:16px 12px; }
        .nav-item {
          display:flex; align-items:center; gap:10px;
          padding:10px 12px; border-radius:8px;
          text-decoration:none; color:var(--text-soft);
          font-size:14px; font-weight:500;
          transition:all 0.2s; margin-bottom:2px; position:relative;
        }
        .nav-item:hover:not(.active) {
          background:var(--gold-dim); color:var(--text-primary);
        }
        .nav-item.active {
          background:var(--gold-dim); color:var(--gold);
          font-weight:700; border-left:3px solid var(--gold);
          padding-left:9px;
        }
        .nav-icon { font-size:16px; flex-shrink:0; }
        .nav-label { flex:1; }
        .nav-badge {
          background:var(--accent-orange); color:#fff;
          font-size:10px; font-weight:700;
          padding:2px 7px; border-radius:9999px;
          min-width:20px; text-align:center;
        }

        .sidebar-footer {
          padding:16px 12px;
          border-top:1px solid var(--border);
        }
        .sidebar-admin-card {
          background:var(--gold-dim); border:1px solid var(--gold-border);
          border-radius:10px; padding:10px 12px; margin-bottom:10px;
        }
        .admin-card-name {
          font-family:'DM Sans',sans-serif; font-size:12px;
          font-weight:700; color:var(--text-primary); margin-bottom:2px;
        }
        .admin-card-email {
          font-family:'JetBrains Mono',monospace; font-size:9px;
          color:var(--gold); opacity:0.7;
        }
        .logout-btn {
          display:flex; align-items:center; gap:10px;
          width:100%; padding:10px 12px; border-radius:8px;
          background:none; border:none; color:var(--accent-red);
          font-size:14px; font-family:'DM Sans',sans-serif;
          cursor:pointer; transition:background 0.2s;
        }
        .logout-btn:hover { background:rgba(239,68,68,0.08); }

        .master-main { margin-left:240px; flex:1; min-height:100vh; }
      `}</style>

      <div className="master-layout">
        <aside className="master-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-logo">
              <span className="logo-campus">Campus</span>
              <span className="logo-connect">Connect</span>
            </span>
            <div className="sidebar-role-label">⚡ Master Control Panel</div>
          </div>

          <nav className="sidebar-nav">
            {BASE_NAV.map(item => {
              const exact  = pathname === item.href;
              const active = item.href === '/master/dashboard' ? exact : (exact || pathname?.startsWith(item.href));
              const badge  = item.href === '/master/requests' && pendingCount > 0 ? pendingCount : null;
              return (
                <Link key={item.href} href={item.href} className={`nav-item ${active ? 'active' : ''}`}>
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {badge ? <span className="nav-badge">{badge}</span> : null}
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-admin-card">
              <div className="admin-card-name">{user?.name || 'Master Admin'}</div>
              <div className="admin-card-email">{user?.email || 'master@campusconnect.in'}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <span>→</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="master-main">
          {children}
        </main>
      </div>
    </>
  );
}
