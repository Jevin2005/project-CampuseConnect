'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/admin/requests', icon: '👥', label: 'Student Requests', badge: 3 },
  { href: '/admin/products', icon: '📦', label: 'Products' },
  { href: '/admin/advertisements', icon: '📢', label: 'Advertisements' },
  { href: '/admin/revenue', icon: '💰', label: 'Revenue' },
  { href: '/admin/settings', icon: '⚙️', label: 'Settings' },
];

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const pathname = usePathname();

  // Auth pages (login, register) — render without sidebar
  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/register';
  if (isAuthPage) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'DM Sans', sans-serif; background: #0A0E1A; color: #F0F4FF; }
        `}</style>
        {children}
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --bg-primary: #0A0E1A;
          --bg-sidebar: #0d1220;
          --bg-card: #111827;
          --bg-card2: #1a2235;
          --border: #1e2d45;
          --accent-green: #10B981;
          --accent-blue: #4F8EF7;
          --accent-gold: #F7C948;
          --accent-orange: #F59E0B;
          --accent-red: #EF4444;
          --accent-purple: #7C3AED;
          --text-primary: #F0F4FF;
          --text-muted: #6B7280;
          --text-soft: #9CA3AF;
        }
        body { font-family: 'DM Sans', sans-serif; background: var(--bg-primary); color: var(--text-primary); }

        .admin-layout { display: flex; min-height: 100vh; }

        .admin-sidebar {
          width: 240px;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border);
          position: fixed;
          top: 0; left: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          z-index: 50;
        }

        .sidebar-header {
          padding: 24px 20px 20px;
          border-bottom: 1px solid var(--border);
        }

        .sidebar-logo {
          font-family: 'Sora', sans-serif;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
          display: block;
        }
        .logo-campus { color: var(--accent-green); }
        .logo-connect { color: var(--text-primary); }

        .sidebar-admin-label {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .sidebar-nav { flex: 1; padding: 16px 12px; }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          text-decoration: none;
          color: var(--text-soft);
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          margin-bottom: 2px;
          position: relative;
        }

        .nav-item:hover:not(.active) {
          background: rgba(16,185,129,0.05);
          color: var(--text-primary);
        }

        .nav-item.active {
          background: rgba(16,185,129,0.12);
          color: var(--accent-green);
          font-weight: 700;
          border-left: 3px solid var(--accent-green);
          padding-left: 9px;
        }

        .nav-icon { font-size: 16px; flex-shrink: 0; }
        .nav-label { flex: 1; }

        .nav-badge {
          background: var(--accent-orange);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 9999px;
          min-width: 20px;
          text-align: center;
        }

        .sidebar-footer {
          padding: 16px 12px;
          border-top: 1px solid var(--border);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          background: none;
          border: none;
          color: var(--accent-red);
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.2s;
        }
        .logout-btn:hover { background: rgba(239,68,68,0.08); }

        .admin-main {
          margin-left: 240px;
          flex: 1;
          min-height: 100vh;
        }
      `}</style>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-logo">
              <span className="logo-campus">Campus</span>
              <span className="logo-connect">Connect</span>
            </span>
            <div className="sidebar-admin-label">MIT Admin · College Panel</div>
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map(item => {
              const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/admin/dashboard');
              const isExact = pathname === item.href;
              const active = item.href === '/admin/dashboard' ? isExact : isActive;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${active ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <button className="logout-btn" onClick={() => { /* TODO: logout */ }}>
              <span>→</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="admin-main">
          {children}
        </main>
      </div>
    </>
  );
}
