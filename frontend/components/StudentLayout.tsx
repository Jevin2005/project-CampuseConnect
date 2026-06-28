"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard, Package, ShoppingBag, User,
  Plus, LogOut, Bell, Search,
  ChevronRight, Megaphone, HelpCircle, Heart, MessageCircle,
  Menu, X, BookOpen,
} from "lucide-react";

/* ─── Nav groups ──────────────────────────────────────────── */
const NAV = [
  {
    group: "Marketplace",
    items: [
      { href: "/marketplace", icon: <LayoutDashboard size={16} />, label: "Browse", badge: null },
      { href: "/marketplace/listings", icon: <Package size={16} />, label: "My Listings", badge: null },
      { href: "/marketplace/requests", icon: <Bell size={16} />, label: "Requests", badge: "🔔" },
      { href: "/marketplace/inbox", icon: <MessageCircle size={16} />, label: "Inbox", badge: null },
      { href: "/marketplace/purchases", icon: <ShoppingBag size={16} />, label: "My Purchases", badge: null },
      { href: "/marketplace/wishlist", icon: <Heart size={16} />, label: "Wishlist", badge: null },
      { href: "/marketplace/profile", icon: <User size={16} />, label: "My Profile", badge: null },
      { href: "/marketplace/ads", icon: <Megaphone size={16} />, label: "Advertisements", badge: "📢" },
    ],
  },
];

function NavItem({ href, icon, label, badge, active }: {
  href: string; icon: React.ReactNode; label: string; badge: string | null; active: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 12px", borderRadius: 10,
          background: active
            ? "rgba(79,142,247,0.12)"
            : hov ? "rgba(255,255,255,0.03)" : "transparent",
          borderLeft: `3px solid ${active ? "#4F8EF7" : "transparent"}`,
          color: active ? "#4F8EF7" : hov ? "#C4CFDF" : "#6B7280",
          transition: "all 0.15s", cursor: "pointer",
        }}
      >
        <span style={{ flexShrink: 0 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, flex: 1 }}>{label}</span>
        {badge && <span style={{ fontSize: 11 }}>{badge}</span>}
        {active && <ChevronRight size={12} style={{ opacity: 0.5 }} />}
      </div>
    </Link>
  );
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
function gToken() { return typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""; }
function inits(n: string) { return (n || "?").split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase(); }

export function StudentLayout({ children, showFooter = false }: { children: React.ReactNode; showFooter?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);
  const [searchVal, setSearchVal] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [stats, setStats] = useState<{ listed: number; sold: number; revenue: number } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Helper to format ISO strings into relative times
  const timeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      if (diffMs < 0) return "just now";

      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHr / 24);

      if (diffSec < 60) return "just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHr < 24) return `${diffHr}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return "some time ago";
    }
  };

  // Helper to get notification type visual dot color
  const getDotColor = (type: string) => {
    switch (type) {
      case "NEW_REQUEST":
        return "#4F8EF7"; // blue
      case "CHAT_MESSAGE":
        return "#10B981"; // green
      case "PRODUCT_APPROVED":
      case "REQUEST_ACCEPTED":
        return "#A78BFA"; // purple
      case "REQUEST_REJECTED":
        return "#EF4444"; // red
      default:
        return "#6B7280"; // gray
    }
  };

  // Open notifications and mark as read
  const handleToggleNotif = async () => {
    const nextOpen = !notifOpen;
    setNotifOpen(nextOpen);
    if (nextOpen) {
      try {
        const res = await api.get("/api/marketplace/notifications");
        const data = res.data || [];
        setNotifications(data);
        const count = data.filter((n: any) => !n.read).length;
        if (count > 0) {
          await api.patch("/api/marketplace/notifications/read");
          setUnreadCount(0); // clear count badge on header bell button
        }
      } catch (err) {
        console.error("Error toggling notifications:", err);
      }
    }
  };

  useEffect(() => {
    setMounted(true);

    // Fetch profile stats
    api.get("/api/marketplace/me")
      .then(res => {
        const d = res.data;
        if (d?.stats) setStats({ listed: d.stats.listed, sold: d.stats.sold, revenue: d.stats.revenue });
      })
      .catch(() => { });

    // Fetch initial and setup interval to pull notifications
    const fetchNotifs = () => {
      api.get("/api/marketplace/notifications")
        .then(res => {
          const data = res.data || [];
          setNotifications(data);
          setUnreadCount(data.filter((n: any) => !n.read).length);
        })
        .catch(() => { });
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try { await api.post("/api/auth/logout"); } catch { /* ignore */ }
    clearAuth();
    router.push("/login");
  };

  const isActive = (href: string) =>
    href === "/marketplace"
      ? pathname === "/marketplace"
      : pathname.startsWith(href.split("?")[0]);

  const isBrowseActive = pathname === "/marketplace" || pathname.startsWith("/marketplace/product");
  const isRequestsActive = pathname.startsWith("/marketplace/requests");
  const isSellActive = pathname.startsWith("/marketplace/sell");
  const isInboxActive = pathname.startsWith("/marketplace/inbox");

  // Safe checks for URL params on client-side
  const query = typeof window !== "undefined" ? window.location.search : "";
  const isHomeActive = pathname === "/marketplace" && !query.includes("category=");
  const isMarketActive = pathname === "/marketplace" && query.includes("category=Physical");
  const isStudyActive = pathname === "/marketplace" && (query.includes("category=Notes") || query.includes("category=Video"));
  const isAccountActive = pathname.startsWith("/marketplace/profile");

  return (
    <div className="sl-layout-container" style={{ display: "flex", minHeight: "100vh", background: "#0A0E1A", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Mobile styles for layout responsive design ── */}
      <style>{`
        .sl-mobile-header { display: none; }
        .sl-bottom-nav { display: none; }
        .sl-mobile-drawer-overlay { display: none; }

        @media (max-width: 768px) {
          .sl-sidebar-desktop {
            display: none !important;
          }
          .sl-header-desktop {
            display: none !important;
          }
          .sl-layout-container {
            flex-direction: column !important;
          }
          .sl-main-content {
            padding-bottom: 70px !important; /* space for fixed bottom nav */
          }
          .sl-mobile-header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            height: 56px !important;
            background: #0d1120 !important;
            border-bottom: 1px solid #1e2d45 !important;
            padding: 0 16px !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 40 !important;
          }
          
          /* Bottom Navigation */
          .sl-bottom-nav {
            display: flex !important;
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 60px !important;
            background: rgba(13, 17, 32, 0.96) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border-top: 1px solid #1e2d45 !important;
            z-index: 40 !important;
            justify-content: space-around !important;
            align-items: center !important;
            padding-bottom: env(safe-area-inset-bottom) !important;
          }
          .sl-main-content footer {
            flex-direction: column !important;
            gap: 10px !important;
            text-align: center !important;
            padding: 20px 20px 80px !important; /* spacing for bottom nav bar */
          }
          .sl-main-content footer div {
            justify-content: center !important;
          }
          .sl-bnav-item {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 3px !important;
            color: #6B7280 !important;
            text-decoration: none !important;
            font-size: 10px !important;
            font-weight: 500 !important;
            flex: 1 !important;
            transition: color 0.2s !important;
          }
          .sl-bnav-item.active {
            color: #4F8EF7 !important;
          }
          .sl-bnav-icon {
            font-size: 18px !important;
          }
          
          /* Mobile Drawer */
          .sl-mobile-drawer-overlay {
            display: flex !important;
            position: fixed !important;
            inset: 0 !important;
            background: rgba(0, 0, 0, 0.6) !important;
            backdrop-filter: blur(4px) !important;
            z-index: 9999 !important;
            justify-content: flex-end !important;
          }
          .sl-mobile-drawer {
            display: flex !important;
            flex-direction: column !important;
            width: 290px !important;
            height: 100% !important;
            background: #0d1120 !important;
            border-left: 1px solid #1e2d45 !important;
            box-shadow: -10px 0 30px rgba(0,0,0,0.5) !important;
            padding: 20px !important;
            box-sizing: border-box !important;
            overflow-y: auto !important;
            animation: slSlideIn 0.25s ease-out !important;
          }
          @keyframes slSlideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        }
      `}</style>

      {/* ════════════════════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════════════════════ */}
      <aside className="sl-sidebar-desktop" style={{
        width: 248, flexShrink: 0,
        background: "#0d1120",
        borderRight: "1px solid #1e2d45",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh",
        zIndex: 30, overflowY: "auto",
      }}>

        {/* ── Logo ── */}
        <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid #1e2d45" }}>
          <Link href="/" style={{ textDecoration: "none", display: "block", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "linear-gradient(135deg, #4F8EF7, #7C3AED)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 10px rgba(79,142,247,0.25)",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 15 }}>🎓</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#F0F4FF", letterSpacing: "-0.5px" }}>Campus</span>
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#4F8EF7", letterSpacing: "-0.5px" }}>Connect</span>
              </div>
            </div>
          </Link>

          {/* College badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(79,142,247,0.07)", border: "1px solid rgba(79,142,247,0.18)",
            borderRadius: 10, padding: "8px 10px",
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: "linear-gradient(135deg, #4F8EF7, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0,
            }}>🏛</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#F0F4FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.collegeName || "Your College"}</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, color: "#10B981", letterSpacing: "0.5px" }}>✓ VERIFIED STUDENT</p>
            </div>
          </div>
        </div>

        {/* ── Search (inside sidebar) ── */}
        <div style={{ padding: "12px 14px 0" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#111827", border: "1.5px solid #1e2d45",
            borderRadius: 10, padding: "8px 12px",
          }}>
            <Search size={13} style={{ color: "#6B7280", flexShrink: 0 }} />
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search marketplace…"
              onKeyDown={e => { if (e.key === "Enter" && searchVal) router.push(`/marketplace?search=${searchVal}`); }}
              style={{
                background: "transparent", border: "none", outline: "none",
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#F0F4FF",
                width: "100%",
              }}
            />
          </div>
        </div>

        {/* ── Nav groups ── */}
        <nav style={{ padding: "12px 10px", flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
          {NAV.map(group => (
            <div key={group.group} style={{ marginBottom: 8 }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700,
                letterSpacing: "1.4px", color: "#374151", textTransform: "uppercase",
                padding: "6px 12px 5px",
              }}>{group.group}</p>
              {group.items.map(item => (
                <NavItem
                  key={item.href}
                  {...item}
                  active={isActive(item.href)}
                />
              ))}
            </div>
          ))}

          {/* ── Divider ── */}
          <div style={{ height: 1, background: "#1e2d45", margin: "6px 4px 12px" }} />

          {/* ── Sell CTA ── */}
          <Link href="/marketplace/sell" style={{ textDecoration: "none", margin: "0 2px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "11px 14px", borderRadius: 12,
              background: "linear-gradient(135deg, rgba(16,185,129,0.14), rgba(16,185,129,0.06))",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "#10B981", cursor: "pointer", transition: "all 0.18s",
              boxShadow: isActive("/marketplace/sell") ? "0 4px 16px rgba(16,185,129,0.2)" : "none",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Plus size={15} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#10B981" }}>Sell a Product</p>
                <p style={{ fontSize: 10, color: "rgba(16,185,129,0.6)", marginTop: 1 }}>Notes, gadgets &amp; more</p>
              </div>
            </div>
          </Link>

          {/* ── Quick Stats ── */}
          <div style={{
            margin: "12px 2px 0",
            background: "rgba(79,142,247,0.04)", border: "1px solid #1e2d45",
            borderRadius: 12, padding: "12px 14px",
          }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.2px", color: "#374151", textTransform: "uppercase", marginBottom: 10 }}>Your Activity</p>
            {[
              { label: "Active Listings", value: stats ? String(stats.listed) : "–", color: "#4F8EF7" },
              { label: "Total Sales", value: stats ? String(stats.sold) : "–", color: "#10B981" },
              { label: "Revenue Earned", value: stats ? `₹${stats.revenue.toLocaleString("en-IN")}` : "–", color: "#F7C948" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6B7280" }}>{s.label}</span>
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </nav>

        {/* ── Bottom: User + Sign Out ── */}
        <div style={{ padding: "10px 12px 14px", borderTop: "1px solid #1e2d45" }}>
          {/* User card */}
          <Link href="/marketplace/profile" style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 12, marginBottom: 6,
              background: "rgba(79,142,247,0.05)", border: "1px solid #1e2d45",
              cursor: "pointer", transition: "border-color 0.15s",
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg, #4F8EF7, #7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0,
              }}>{inits(user?.name || "")}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#F0F4FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "Student"}</p>
                <p style={{ fontSize: 10, color: "#6B7280" }}>{user?.collegeName || "CampusConnect"}</p>
              </div>
              <ChevronRight size={13} style={{ color: "#374151", flexShrink: 0 }} />
            </div>
          </Link>

          {/* Help + Logout row */}
          <div style={{ display: "flex", gap: 6 }}>
            <Link href="/how-it-works" style={{ textDecoration: "none", flex: 1 }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "8px", borderRadius: 8, cursor: "pointer",
                background: "transparent", border: "1px solid #1e2d45",
                color: "#6B7280", fontSize: 11, transition: "all 0.15s",
              }}>
                <HelpCircle size={13} />Help
              </div>
            </Link>
            <button
              onClick={handleLogout}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "8px", borderRadius: 8, cursor: "pointer",
                background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
                color: "#EF4444", fontSize: 11, fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
              }}
            >
              <LogOut size={13} />Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ── MOBILE Header ── */}
      <div className="sl-mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/marketplace/profile" style={{ textDecoration: "none", display: "flex" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              overflow: "hidden",
              border: "1.5px solid rgba(255, 255, 255, 0.15)",
              background: "linear-gradient(135deg, #4F8EF7, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100"
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </Link>
          <Link href="/marketplace" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "linear-gradient(135deg, #4F8EF7, #7C3AED)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 13 }}>🎓</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: "#F0F4FF", letterSpacing: "-0.5px" }}>Campus</span>
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: "#4F8EF7", letterSpacing: "-0.5px" }}>Connect</span>
              </div>
            </div>
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setMobileSearchOpen(v => !v)}
            style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", display: "flex", alignItems: "center", padding: 4 }}
          >
            <Search size={20} />
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", display: "flex", alignItems: "center", padding: 4 }}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* ── MOBILE Search Dropdown ── */}
      {mobileSearchOpen && (
        <div style={{
          position: "fixed", top: 56, left: 0, right: 0,
          background: "#0d1120", borderBottom: "1px solid #1e2d45",
          padding: "10px 16px", zIndex: 35, display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 8px 20px rgba(0,0,0,0.4)"
        }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 8,
            background: "#111827", border: "1.5px solid #1e2d45",
            borderRadius: 10, padding: "6px 12px",
          }}>
            <Search size={14} style={{ color: "#6B7280" }} />
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search marketplace…"
              onKeyDown={e => {
                if (e.key === "Enter" && searchVal) {
                  router.push(`/marketplace?search=${searchVal}`);
                  setMobileSearchOpen(false);
                }
              }}
              style={{
                background: "transparent", border: "none", outline: "none",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F0F4FF",
                width: "100%",
              }}
            />
          </div>
          <button
            onClick={() => setMobileSearchOpen(false)}
            style={{ background: "none", border: "none", color: "#4F8EF7", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── MOBILE Drawer Menu ── */}
      {drawerOpen && (
        <div className="sl-mobile-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="sl-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #4F8EF7, #7C3AED)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 13 }}>🎓</span>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: "#F0F4FF", letterSpacing: "-0.5px" }}>Campus</span>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: "#4F8EF7", letterSpacing: "-0.5px" }}>Connect</span>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: "rgba(79,142,247,0.05)", border: "1px solid #1e2d45",
              borderRadius: 12, padding: "14px", marginBottom: 20
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "linear-gradient(135deg, #4F8EF7, #7C3AED)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 800, color: "#fff"
                }}>{inits(user?.name || "")}</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#F0F4FF", margin: 0 }}>{user?.name || "Student"}</p>
                  <p style={{ fontSize: 10, color: "#10B981", fontWeight: 700, margin: "2px 0 0" }}>✓ VERIFIED STUDENT</p>
                </div>
              </div>
              <p style={{ fontSize: 11, color: "#6B7280", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                🏛 {user?.collegeName || "Your College"}
              </p>
            </div>

            <div style={{ flex: 1 }}>
              {NAV.map(group => (
                <div key={group.group} style={{ marginBottom: 14 }}>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700,
                    letterSpacing: "1.4px", color: "#374151", textTransform: "uppercase",
                    padding: "4px 8px", margin: "0 0 6px"
                  }}>{group.group}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {group.items.map(item => {
                      const active = isActive(item.href);
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setDrawerOpen(false)} style={{ textDecoration: "none" }}>
                          <div style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "10px 12px", borderRadius: 10,
                            background: active ? "rgba(79,142,247,0.12)" : "transparent",
                            borderLeft: `3px solid ${active ? "#4F8EF7" : "transparent"}`,
                            color: active ? "#4F8EF7" : "#C4CFDF",
                            transition: "all 0.15s", cursor: "pointer",
                          }}>
                            <span>{item.icon}</span>
                            <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, flex: 1 }}>{item.label}</span>
                            {item.badge && <span style={{ fontSize: 11 }}>{item.badge}</span>}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div style={{ height: 1, background: "#1e2d45", margin: "14px 0" }} />
              <Link href="/marketplace/sell" onClick={() => setDrawerOpen(false)} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "12px", borderRadius: 12,
                  background: "linear-gradient(135deg, rgba(16,185,129,0.14), rgba(16,185,129,0.06))",
                  border: "1px solid rgba(16,185,129,0.3)",
                  color: "#10B981", cursor: "pointer", transition: "all 0.18s",
                  textAlign: "center"
                }}>
                  <Plus size={15} />
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Sell a Product</span>
                </div>
              </Link>
            </div>

            <div style={{ paddingTop: 14, borderTop: "1px solid #1e2d45", marginTop: 20 }}>
              <button
                onClick={() => { setDrawerOpen(false); handleLogout(); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "10px", borderRadius: 10, cursor: "pointer",
                  background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
                  color: "#EF4444", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600
                }}
              >
                <LogOut size={14} />Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE Bottom navigation bar ── */}
      <nav className="sl-bottom-nav">
        <Link href="/marketplace" className={`sl-bnav-item${isBrowseActive ? " active" : ""}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textDecoration: "none", flex: 1 }}>
          <LayoutDashboard size={19} style={{ color: isBrowseActive ? "#4F8EF7" : "#6B7280", transition: "color 0.2s" }} />
          <span style={{ fontSize: 10, fontWeight: isBrowseActive ? 700 : 500, color: isBrowseActive ? "#4F8EF7" : "#6B7280", transition: "color 0.2s" }}>Browse</span>
        </Link>

        <Link href="/marketplace/requests" className={`sl-bnav-item${isRequestsActive ? " active" : ""}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textDecoration: "none", flex: 1, position: "relative" }}>
          <Bell size={19} style={{ color: isRequestsActive ? "#4F8EF7" : "#6B7280", transition: "color 0.2s" }} />
          <span style={{ fontSize: 10, fontWeight: isRequestsActive ? 700 : 500, color: isRequestsActive ? "#4F8EF7" : "#6B7280", transition: "color 0.2s" }}>Requests</span>
          {unreadCount > 0 && (
            <span style={{
              position: "absolute", top: 0, right: "24%",
              width: 6, height: 6, borderRadius: "50%",
              background: "#EF4444"
            }} />
          )}
        </Link>

        {/* Elevated Sell FAB */}
        <Link href="/marketplace/sell" className={`sl-bnav-item${isSellActive ? " active" : ""}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textDecoration: "none", flex: 1 }}>
          <div style={{
            width: 42, height: 42, borderRadius: "50%",
            background: isSellActive
              ? "linear-gradient(135deg, #10B981, #059669)"
              : "linear-gradient(135deg, #1F2937, #111827)",
            border: isSellActive ? "2.5px solid #0d1120" : "2.5px solid #1e2d45",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginTop: -18,
            boxShadow: isSellActive ? "0 4px 14px rgba(16,185,129,0.4)" : "0 4px 10px rgba(0,0,0,0.3)",
            transition: "all 0.2s",
            color: isSellActive ? "#fff" : "#9CA3AF"
          }}>
            <Plus size={20} />
          </div>
          <span style={{ fontSize: 10, fontWeight: isSellActive ? 700 : 600, color: isSellActive ? "#10B981" : "#6B7280", transition: "color 0.2s" }}>Sell</span>
        </Link>

        <Link href="/marketplace/inbox" className={`sl-bnav-item${isInboxActive ? " active" : ""}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textDecoration: "none", flex: 1 }}>
          <MessageCircle size={19} style={{ color: isInboxActive ? "#4F8EF7" : "#6B7280", transition: "color 0.2s" }} />
          <span style={{ fontSize: 10, fontWeight: isInboxActive ? 700 : 500, color: isInboxActive ? "#4F8EF7" : "#6B7280", transition: "color 0.2s" }}>Inbox</span>
        </Link>

        <Link href="/marketplace/profile" className={`sl-bnav-item${isAccountActive ? " active" : ""}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textDecoration: "none", flex: 1 }}>
          <User size={19} style={{ color: isAccountActive ? "#4F8EF7" : "#6B7280", transition: "color 0.2s" }} />
          <span style={{ fontSize: 10, fontWeight: isAccountActive ? 700 : 500, color: isAccountActive ? "#4F8EF7" : "#6B7280", transition: "color 0.2s" }}>Account</span>
        </Link>
      </nav>

      {/* ════════════════════════════════════════════════════
          MAIN AREA
      ════════════════════════════════════════════════════ */}
      <div className="sl-main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* ── Top Bar ── */}
        <header className="sl-header-desktop" style={{
          height: 56, background: "rgba(13,17,32,0.95)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid #1e2d45",
          display: "flex", alignItems: "center",
          padding: "0 24px", gap: 12,
          position: "sticky", top: 0, zIndex: 15, flexShrink: 0,
        }}>
          {/* Page title breadcrumb */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#374151" }}>CampusConnect</span>
            <span style={{ color: "#1e2d45", fontSize: 14 }}>/</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#9CA3AF" }}>
              {pathname === "/marketplace" ? "Marketplace"
                : pathname.includes("/listings") ? "My Listings"
                  : pathname.includes("/purchases") ? "My Purchases"
                    : pathname.includes("/profile") ? "My Profile"
                      : pathname.includes("/sell") ? "Sell Product"
                        : pathname.includes("/product") ? "Product Details"
                          : pathname.includes("/digital") ? "Digital Content"
                            : "Marketplace"}
            </span>
          </div>

          {/* Notification Bell */}
          <div style={{ position: "relative" }}>
            <button
              onClick={handleToggleNotif}
              style={{
                width: 36, height: 36, borderRadius: 9999,
                background: notifOpen ? "rgba(79,142,247,0.1)" : "transparent",
                border: notifOpen ? "1px solid rgba(79,142,247,0.3)" : "1px solid transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", position: "relative", transition: "all 0.15s",
              }}
            >
              <Bell size={16} style={{ color: notifOpen ? "#4F8EF7" : "#6B7280" }} />
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: 6, right: 6,
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#EF4444", border: "1.5px solid #0d1120",
                }} />
              )}
            </button>

            {/* Notification dropdown */}
            {notifOpen && (
              <div style={{
                position: "absolute", top: 44, right: 0,
                width: 320, background: "#111827",
                border: "1px solid #1e2d45", borderRadius: 14,
                boxShadow: "0 16px 48px rgba(0,0,0,0.5)", zIndex: 100,
              }}>
                <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #1e2d45", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#F0F4FF" }}>Notifications</p>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#4F8EF7", background: "rgba(79,142,247,0.12)", padding: "2px 8px", borderRadius: 9999 }}>
                    {notifications.filter(n => !n.read).length} New
                  </span>
                </div>
                <div style={{ maxHeight: 280, overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "24px 16px", textAlign: "center", color: "#6B7280" }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={n.id || i} style={{ padding: "12px 16px", borderBottom: i < notifications.length - 1 ? "1px solid rgba(30,45,69,0.5)" : "none", display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: getDotColor(n.type), marginTop: 5, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: n.read ? "#9CA3AF" : "#C4CFDF", fontWeight: n.read ? 400 : 500, lineHeight: 1.5 }}>{n.text}</p>
                          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#4B5563", marginTop: 3 }}>{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div style={{ padding: "10px 16px", textAlign: "center", borderTop: "1px solid #1e2d45" }}>
                  <Link href="/marketplace/requests" onClick={() => setNotifOpen(false)} style={{ textDecoration: "none" }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#4F8EF7", cursor: "pointer", fontWeight: 500 }}>View all notifications →</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Avatar pill → profile */}
          <Link href="/marketplace/profile" style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
              background: "#1a2235", border: "1.5px solid #1e2d45",
              borderRadius: 9999, padding: "4px 12px 4px 4px",
              transition: "border-color 0.15s",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "linear-gradient(135deg, #4F8EF7, #7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 800, color: "#fff",
              }}>{inits(user?.name || "")}</div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: "#C4CFDF" }}>{user?.name?.split(" ")[0] || "Rahul"}</span>
            </div>
          </Link>
        </header>

        {/* ── Page Content ── */}
        <main style={{ flex: 1, overflowY: "auto" }} onClick={() => setNotifOpen(false)}>
          {children}
        </main>

        {/* ── Slim Footer ── */}
        {mounted && showFooter && (
          <footer style={{
            background: "#0d1120", borderTop: "1px solid #1e2d45",
            padding: "16px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#374151" }}>
              © 2024 CampusConnect
            </span>
          </footer>
        )}
      </div>
    </div>
  );
}
