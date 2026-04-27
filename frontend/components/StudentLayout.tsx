"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag, Package, User, LayoutDashboard,
  Bell, ShoppingCart, Search, ChevronDown, LogOut, HelpCircle, Plus,
} from "lucide-react";

/* ─── Nav items ───────────────────────────────────────────── */
const NAV_ITEMS = [
  { href: "/marketplace",           icon: <LayoutDashboard size={16} />, label: "Marketplace" },
  { href: "/marketplace/listings",  icon: <Package size={16} />,         label: "My Listings"  },
  { href: "/marketplace/purchases", icon: <ShoppingBag size={16} />,     label: "My Purchases" },
  { href: "/marketplace/profile",   icon: <User size={16} />,            label: "My Profile"   },
];

/* ─── Top nav tabs ────────────────────────────────────────── */
const TOP_TABS = [
  { href: "/marketplace",  label: "Marketplace" },
  { href: "/marketplace/purchases", label: "Library"    },
  { href: "#",             label: "Community"   },
];

export function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0A0E1A", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: "#0d1120",
        borderRight: "1px solid #1e2d45",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh",
        zIndex: 20,
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid #1e2d45" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, #4F8EF7, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 14 }}>🎓</span>
            </div>
            <div>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: "#F0F4FF" }}>Campus</span>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: "#4F8EF7" }}>Connect</span>
            </div>
          </Link>
          {/* College pill */}
          <div style={{
            marginTop: 10, display: "flex", alignItems: "center", gap: 6,
            background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.15)",
            borderRadius: 8, padding: "5px 10px",
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 4,
              background: "linear-gradient(135deg, #4F8EF7, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
            }}>🏛</div>
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, color: "#F0F4FF" }}>MIT Campus</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "#4F8EF7" }}>VERIFIED STUDENT</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "14px 12px", display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {NAV_ITEMS.map(n => {
            const active = pathname === n.href || (n.href !== "/marketplace" && pathname.startsWith(n.href));
            return (
              <Link key={n.href} href={n.href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 10,
                  background: active ? "rgba(79,142,247,0.10)" : "transparent",
                  borderLeft: `3px solid ${active ? "#4F8EF7" : "transparent"}`,
                  color: active ? "#4F8EF7" : "#6B7280",
                  transition: "all 0.15s",
                }}>
                  {n.icon}
                  <span style={{ fontSize: 13, fontWeight: active ? 700 : 500 }}>{n.label}</span>
                </div>
              </Link>
            );
          })}

          <div style={{ height: 1, background: "#1e2d45", margin: "10px 0" }} />

          {/* Sell button */}
          <Link href="/marketplace/sell" style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 10,
              background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
              color: "#10B981", cursor: "pointer", transition: "all 0.15s",
            }}>
              <Plus size={16} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>Sell a Product</span>
            </div>
          </Link>
        </nav>

        {/* Bottom: support + sign out */}
        <div style={{ padding: "12px", borderTop: "1px solid #1e2d45" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 12px", borderRadius: 8, cursor: "pointer", color: "#6B7280",
            marginBottom: 2, transition: "color 0.15s",
          }}>
            <HelpCircle size={15} />
            <span style={{ fontSize: 13 }}>Support</span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 12px", borderRadius: 8, cursor: "pointer", color: "#EF4444",
            transition: "color 0.15s",
          }}>
            <LogOut size={15} />
            <span style={{ fontSize: 13 }}>Sign Out</span>
          </div>

          {/* User card */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 10, marginTop: 8,
            background: "rgba(79,142,247,0.04)", border: "1px solid #1e2d45",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #4F8EF7, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 800, color: "#fff",
              flexShrink: 0,
            }}>RS</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#F0F4FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Rahul Sharma</p>
              <p style={{ fontSize: 10, color: "#6B7280" }}>CS • MIT '24</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* TOP NAVBAR */}
        <header style={{
          height: 60, background: "rgba(13,17,32,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #1e2d45",
          display: "flex", alignItems: "center",
          padding: "0 28px", gap: 8,
          position: "sticky", top: 0, zIndex: 15,
          flexShrink: 0,
        }}>
          {/* Platform name (mobile visible) */}
          <span style={{
            fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 800,
            color: "#F0F4FF", marginRight: 20, display: "none",
          }}>CampusConnect</span>

          {/* Top tab nav */}
          {TOP_TABS.map((t, i) => {
            const active = pathname === t.href || (t.href !== "/" && pathname.startsWith(t.href));
            return (
              <Link key={t.label} href={t.href} style={{ textDecoration: "none" }}>
                <div style={{
                  height: 60, display: "flex", alignItems: "center", padding: "0 12px",
                  borderBottom: `2px solid ${active ? "#4F8EF7" : "transparent"}`,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  color: active ? "#4F8EF7" : "#6B7280",
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                  {t.label}
                </div>
              </Link>
            );
          })}

          <div style={{ flex: 1 }} />

          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#1a2235", border: "1.5px solid #1e2d45",
            borderRadius: 9999, padding: "7px 14px", width: 200,
          }}>
            <Search size={13} style={{ color: "#6B7280", flexShrink: 0 }} />
            <input
              placeholder="Search campus..."
              style={{
                background: "transparent", border: "none", outline: "none",
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#F0F4FF",
                width: "100%",
              }}
            />
          </div>

          {/* Actions */}
          <button style={{ ...iconBtn, position: "relative" }}>
            <Bell size={17} style={{ color: "#6B7280" }} />
            <span style={{
              position: "absolute", top: 4, right: 4,
              width: 7, height: 7, borderRadius: "50%", background: "#EF4444",
            }} />
          </button>
          <button style={iconBtn}>
            <ShoppingCart size={17} style={{ color: "#6B7280" }} />
          </button>

          {/* Avatar + chevron */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
            background: "#1a2235", border: "1.5px solid #1e2d45",
            borderRadius: 9999, padding: "4px 10px 4px 4px",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg, #4F8EF7, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 800, color: "#fff",
            }}>RS</div>
            <ChevronDown size={12} style={{ color: "#6B7280" }} />
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </main>

        {/* FOOTER */}
        <footer style={{
          background: "#0d1120", borderTop: "1px solid #1e2d45",
          padding: "16px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 800, color: "#F0F4FF" }}>Campus</span>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 800, color: "#4F8EF7" }}>Connect</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#374151", marginLeft: 8 }}>
              © 2024 · Built for students, by students.
            </span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy", "Terms", "Support", "Contact"].map(l => (
              <Link key={l} href="#" style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#374151",
                textDecoration: "none", transition: "color 0.15s",
              }}>{l}</Link>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 9999,
  background: "transparent", border: "none",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", position: "relative",
  transition: "background 0.15s",
};
