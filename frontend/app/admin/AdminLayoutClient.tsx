'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  icon: string;
  label: string;
  badge?: string | number;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/admin/requests', icon: '👥', label: 'Student Requests' },
  { href: '/admin/products', icon: '📦', label: 'Products' },
  { href: '/admin/advertisements', icon: '📢', label: 'Advertisements' },
  { href: '/admin/revenue', icon: '💰', label: 'Revenue' },
  { href: '/admin/settings', icon: '⚙️', label: 'Settings' },
];

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingCount = async () => {
    try {
      const res = await api.get('/api/admin/dashboard');
      if (res.data && typeof res.data.stats?.pendingStudents === 'number') {
        setPendingCount(res.data.stats.pendingStudents);
      }
    } catch (err) {
      console.error('Failed to fetch pending requests count:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPendingCount();
      const interval = setInterval(fetchPendingCount, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const getInitials = (n?: string) => {
    if (!n) return 'AD';
    return n.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      console.error('Logout failed', e);
    }
    clearAuth();
    router.push('/admin/login');
  };

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

        @keyframes badgePulse {
          0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.6); }
          70% { box-shadow: 0 0 0 5px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }

        .nav-badge.blink-badge {
          animation: badgePulse 2s infinite;
          background: var(--accent-orange);
        }

        .bnav-badge {
          position: absolute;
          top: -2px;
          right: -4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-orange);
          border: 1.5px solid rgba(13, 17, 32, 0.96);
          animation: badgePulse 2s infinite;
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
          width: calc(100% - 240px);
          min-height: 100vh;
        }

        .admin-mobile-header {
          display: none;
        }
        .admin-drawer-overlay {
          display: none;
        }
        .admin-mobile-drawer {
          display: none;
        }
        .admin-bottom-nav {
          display: none;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            display: none !important;
          }
          .admin-main {
            margin-left: 0 !important;
            width: 100% !important;
            padding-top: 56px;
            padding-bottom: 70px !important;
          }
          .admin-mobile-header {
            display: flex !important;
            align-items: center;
            justify-content: space-between;
            height: 56px;
            background: var(--bg-sidebar);
            border-bottom: 1px solid var(--border);
            padding: 0 16px;
            position: fixed;
            top: 0; left: 0; right: 0;
            z-index: 60;
          }
          .admin-mobile-header-btn {
            background: none;
            border: none;
            color: var(--text-soft);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
          }
          .admin-mobile-header-btn:hover {
            color: var(--text-primary);
          }
          .admin-mobile-header-logo {
            font-family: 'Sora', sans-serif;
            font-size: 16px;
            font-weight: 800;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 4px;
          }

          /* Drawer Overlay */
          .admin-drawer-overlay {
            display: block !important;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            z-index: 100;
          }

          /* Drawer */
          .admin-mobile-drawer {
            display: flex !important;
            flex-direction: column;
            position: fixed;
            top: 0; left: 0; bottom: 0;
            width: 280px;
            background: var(--bg-sidebar);
            border-right: 1px solid var(--border);
            z-index: 110;
            box-shadow: 10px 0 30px rgba(0,0,0,0.5);
            transform: translateX(-100%);
            transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            overflow-y: auto;
          }
          .admin-mobile-drawer.open {
            transform: translateX(0);
          }
          .drawer-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 18px 16px;
            border-bottom: 1px solid var(--border);
          }
          .drawer-close-btn {
            background: none;
            border: none;
            color: var(--text-soft);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            transition: color 0.2s;
          }
          .drawer-close-btn:hover {
            color: var(--text-primary);
          }
          .drawer-nav {
            flex: 1;
            padding: 16px 12px;
          }
          .drawer-footer {
            padding: 16px 12px;
            border-top: 1px solid var(--border);
          }

          /* Bottom Nav */
          .admin-bottom-nav {
            display: flex !important;
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 60px !important;
            background: rgba(13, 17, 32, 0.96) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border-top: 1px solid var(--border) !important;
            z-index: 40 !important;
            justify-content: space-around !important;
            align-items: center !important;
            padding-bottom: env(safe-area-inset-bottom) !important;
          }
          .admin-bnav-item {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 3px !important;
            color: var(--text-soft) !important;
            text-decoration: none !important;
            font-size: 10px !important;
            font-weight: 500 !important;
            flex: 1 !important;
            background: none;
            border: none;
            cursor: pointer;
            transition: color 0.2s !important;
          }
          .admin-bnav-item.active {
            color: var(--accent-green) !important;
          }
          .admin-bnav-icon {
            font-size: 18px !important;
          }
        }
      `}</style>

      <div className="admin-layout">
        {/* Mobile Header */}
        <header className="admin-mobile-header">
          <button
            className="admin-mobile-header-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          
          <Link href="/admin/dashboard" className="admin-mobile-header-logo">
            <span className="logo-campus">Campus</span>
            <span className="logo-connect">Connect</span>
          </Link>
          
          <Link href="/admin/settings" style={{ textDecoration: 'none' }} title={user?.name || 'Admin Settings'}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#0A0E1A' }}>
              {getInitials(user?.name)}
            </div>
          </Link>
        </header>

        {/* Mobile Drawer Overlay */}
        {drawerOpen && (
          <div className="admin-drawer-overlay" onClick={() => setDrawerOpen(false)} />
        )}

        {/* Mobile Drawer */}
        <aside className={`admin-mobile-drawer ${drawerOpen ? 'open' : ''}`}>
          <div className="drawer-header">
            <div>
              <span className="sidebar-logo">
                <span className="logo-campus">Campus</span>
                <span className="logo-connect">Connect</span>
              </span>
              <div className="sidebar-admin-label" style={{ fontSize: 10 }}>MIT Admin Panel</div>
            </div>
            <button
              className="drawer-close-btn"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="drawer-nav">
            {NAV_ITEMS.map(item => {
              const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/admin/dashboard');
              const isExact = pathname === item.href;
              const active = item.href === '/admin/dashboard' ? isExact : isActive;
              const showBadge = item.href === '/admin/requests' ? pendingCount > 0 : !!item.badge;
              const badgeVal = item.href === '/admin/requests' ? pendingCount : item.badge;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${active ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {showBadge ? <span className="nav-badge blink-badge">{badgeVal}</span> : null}
                </Link>
              );
            })}
          </nav>

          <div className="drawer-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <span>→</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Desktop Sidebar */}
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
              const showBadge = item.href === '/admin/requests' ? pendingCount > 0 : !!item.badge;
              const badgeVal = item.href === '/admin/requests' ? pendingCount : item.badge;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${active ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {showBadge ? <span className="nav-badge blink-badge">{badgeVal}</span> : null}
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <span>→</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="admin-main">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="admin-bottom-nav">
          <Link href="/admin/dashboard" className={`admin-bnav-item ${pathname === '/admin/dashboard' ? 'active' : ''}`}>
            <span className="admin-bnav-icon">📊</span>
            <span>Dashboard</span>
          </Link>
          
          <Link href="/admin/requests" className={`admin-bnav-item ${pathname?.startsWith('/admin/requests') ? 'active' : ''}`}>
            <span className="admin-bnav-icon" style={{ position: 'relative' }}>
              👥
              {pendingCount > 0 && <span className="bnav-badge" />}
            </span>
            <span>Requests</span>
          </Link>
          
          <Link href="/admin/products" className={`admin-bnav-item ${pathname?.startsWith('/admin/products') ? 'active' : ''}`}>
            <span className="admin-bnav-icon">📦</span>
            <span>Products</span>
          </Link>
          
          <Link href="/admin/revenue" className={`admin-bnav-item ${pathname?.startsWith('/admin/revenue') ? 'active' : ''}`}>
            <span className="admin-bnav-icon">💰</span>
            <span>Revenue</span>
          </Link>

        </nav>
      </div>
    </>
  );
}
