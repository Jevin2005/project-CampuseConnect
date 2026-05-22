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
} from "lucide-react";

/* ─── Nav groups ──────────────────────────────────────────── */
const NAV = [
  {
    group: "Marketplace",
    items: [
      { href: "/marketplace",           icon: <LayoutDashboard size={16} />, label: "Browse",         badge: null },
      { href: "/marketplace/listings",  icon: <Package size={16} />,         label: "My Listings",    badge: null },
      { href: "/marketplace/requests",  icon: <Bell size={16} />,            label: "Requests",       badge: "🔔" },
      { href: "/marketplace/inbox",     icon: <MessageCircle size={16} />,   label: "Inbox",          badge: null },
      { href: "/marketplace/purchases", icon: <ShoppingBag size={16} />,     label: "My Purchases",   badge: null },
      { href: "/marketplace/wishlist",  icon: <Heart size={16} />,           label: "Wishlist",       badge: null },
      { href: "/marketplace/profile",   icon: <User size={16} />,            label: "My Profile",     badge: null },
      { href: "/marketplace/ads",       icon: <Megaphone size={16} />,       label: "Advertisements", badge: "📢" },
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
function inits(n: string) { return (n||"?").split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase(); }

export function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user      = useAuthStore((s) => s.user);
  const [searchVal,   setSearchVal]   = useState("");
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [stats, setStats] = useState<{ listed: number; sold: number; revenue: number } | null>(null);

  useEffect(() => {
    api.get("/api/marketplace/me")
      .then(res => {
        const d = res.data;
        if (d?.stats) setStats({ listed: d.stats.listed, sold: d.stats.sold, revenue: d.stats.revenue });
      })
      .catch(() => {});
  }, []);

  const NOTIFS = [
    { text: "Your GATE Notes listing got 12 new views", time: "2m ago",  dot: "#4F8EF7" },
    { text: "Arjun M. sent you a message about Laptop",  time: "18m ago", dot: "#10B981" },
    { text: "Admin approved your DSP Video Course",       time: "1h ago",  dot: "#A78BFA" },
  ];

  const handleLogout = async () => {
    try { await api.post("/api/auth/logout"); } catch { /* ignore */ }
    clearAuth();
    router.push("/login");
  };

  const isActive = (href: string) =>
    href === "/marketplace"
      ? pathname === "/marketplace"
      : pathname.startsWith(href.split("?")[0]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0A0E1A", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ════════════════════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════════════════════ */}
      <aside style={{
        width: 248, flexShrink: 0,
        background: "#0d1120",
        borderRight: "1px solid #1e2d45",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh",
        zIndex: 30, overflowY: "auto",
      }}>

        {/* ── Logo ── */}
        <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid #1e2d45" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg, #4F8EF7, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              boxShadow: "0 4px 12px rgba(79,142,247,0.3)",
            }}>
              <span style={{ fontSize: 16 }}>🎓</span>
            </div>
            <div>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: "#F0F4FF" }}>Campus</span>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: "#4F8EF7" }}>Connect</span>
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
              { label: "Active Listings", value: stats ? String(stats.listed)                          : "–", color: "#4F8EF7" },
              { label: "Total Sales",      value: stats ? String(stats.sold)                            : "–", color: "#10B981" },
              { label: "Revenue Earned",   value: stats ? `₹${stats.revenue.toLocaleString("en-IN")}` : "–", color: "#F7C948" },
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

      {/* ════════════════════════════════════════════════════
          MAIN AREA
      ════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* ── Top Bar ── */}
        <header style={{
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
              onClick={() => setNotifOpen(o => !o)}
              style={{
                width: 36, height: 36, borderRadius: 9999,
                background: notifOpen ? "rgba(79,142,247,0.1)" : "transparent",
                border: notifOpen ? "1px solid rgba(79,142,247,0.3)" : "1px solid transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", position: "relative", transition: "all 0.15s",
              }}
            >
              <Bell size={16} style={{ color: notifOpen ? "#4F8EF7" : "#6B7280" }} />
              <span style={{
                position: "absolute", top: 6, right: 6,
                width: 8, height: 8, borderRadius: "50%",
                background: "#EF4444", border: "1.5px solid #0d1120",
              }} />
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
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#4F8EF7", background: "rgba(79,142,247,0.12)", padding: "2px 8px", borderRadius: 9999 }}>{NOTIFS.length} New</span>
                </div>
                {NOTIFS.map((n, i) => (
                  <div key={i} style={{ padding: "12px 16px", borderBottom: i < NOTIFS.length - 1 ? "1px solid rgba(30,45,69,0.5)" : "none", display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.dot, marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#C4CFDF", lineHeight: 1.5 }}>{n.text}</p>
                      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#374151", marginTop: 3 }}>{n.time}</p>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "10px 16px", textAlign: "center" }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#4F8EF7", cursor: "pointer" }}>View all notifications →</span>
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
              }}>RS</div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: "#C4CFDF" }}>Rahul</span>
            </div>
          </Link>
        </header>

        {/* ── Page Content ── */}
        <main style={{ flex: 1, overflowY: "auto" }} onClick={() => setNotifOpen(false)}>
          {children}
        </main>

        {/* ── Slim Footer ── */}
        <footer style={{
          background: "#0d1120", borderTop: "1px solid #1e2d45",
          padding: "12px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#374151" }}>
            © 2024 CampusConnect · Built for students, by students.
          </span>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { href: "/how-it-works", label: "How it works" },
              { href: "/master/login", label: "Master Admin" },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#374151", textDecoration: "none" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
