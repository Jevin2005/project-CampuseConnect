"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, Plus } from "lucide-react";
import { StudentLayout } from "@/components/StudentLayout";

/* ─── types ──────────────────────────────────────────────────────── */
type ProductType = "physical" | "pdf" | "video" | "sponsored";

interface Product {
  id: number;
  type: ProductType;
  emoji: string;
  emojiColor: string;
  seller: string;
  year: string;
  title: string;
  price?: string;
  badge?: string;
  btnLabel: string;
  sponsored?: boolean;
  sponsoredTitle?: string;
  sponsoredSub?: string;
}

const PRODUCTS: Product[] = [
  { id: 1, type: "physical",   emoji: "💻", emojiColor: "#1e3a5f", seller: "RS", year: "MIT '24", title: "Dell Latitude i5 Laptop",        price: "₹18,000", badge: "Physical", btnLabel: "Chat with Seller" },
  { id: 2, type: "pdf",        emoji: "📄", emojiColor: "#2d1b4e", seller: "AM", year: "MIT '23", title: "GATE 2024 ECE Complete Notes",    price: "₹299",    badge: "PDF",      btnLabel: "Instant Buy" },
  { id: 3, type: "video",      emoji: "🎥", emojiColor: "#1b3040", seller: "PK", year: "MIT '24", title: "Advanced DSP Video Course",       price: "₹499",    badge: "Video",    btnLabel: "Enroll Now" },
  { id: 4, type: "physical",   emoji: "🔊", emojiColor: "#1a2a1a", seller: "SK", year: "MIT '23", title: "Engineering Drawing Kit",         price: "₹450",    badge: "Physical", btnLabel: "Chat with Seller" },
  { id: 5, type: "pdf",        emoji: "📄", emojiColor: "#2d1b4e", seller: "VR", year: "MIT '24", title: "Thermodynamics Notes",            price: "₹149",    badge: "PDF",      btnLabel: "Instant Buy" },
  { id: 6, type: "sponsored",  emoji: "✨", emojiColor: "#2a1d0e", seller: "",   year: "",         title: "",                               btnLabel: "Join the Hype", sponsored: true, sponsoredTitle: "MIT Campus Fest 2024", sponsoredSub: "The biggest cultural extravaganza of the year. Registrations open now!" },
];

const BADGE_STYLE: Record<string, { bg: string; color: string; text: string }> = {
  Physical: { bg: "rgba(79,142,247,0.15)", color: "#4F8EF7",  text: "Physical" },
  PDF:      { bg: "rgba(139,92,246,0.2)",  color: "#A78BFA",  text: "📄 PDF"   },
  Video:    { bg: "rgba(16,185,129,0.15)", color: "#10B981",  text: "🎥 Video" },
};

const BTN_STYLE: Record<string, { bg: string; color: string }> = {
  "Chat with Seller": { bg: "transparent",          color: "#4F8EF7" },
  "Instant Buy":      { bg: "rgba(79,142,247,0.1)", color: "#4F8EF7" },
  "Enroll Now":       { bg: "rgba(16,185,129,0.1)", color: "#10B981" },
};

/* ─── ProductCard ─────────────────────────────────────────────── */
function ProductCard({ p }: { p: Product }) {
  const [hovered, setHovered] = useState(false);

  if (p.sponsored) {
    return (
      <div style={{
        borderRadius: 14, overflow: "hidden",
        background: "rgba(245,158,11,0.05)",
        border: `1.5px solid ${hovered ? "#F7C948" : "rgba(245,158,11,0.35)"}`,
        boxShadow: hovered ? "0 8px 32px rgba(245,158,11,0.12)" : "none",
        transition: "all 0.2s", cursor: "pointer",
        display: "flex", flexDirection: "column",
      }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* SPONSORED tag */}
        <div style={{ padding: "12px 14px 0", display: "flex", justifyContent: "flex-end" }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 800,
            letterSpacing: "1.5px", color: "#F7C948",
            background: "rgba(247,201,72,0.12)", borderRadius: 4, padding: "2px 8px",
          }}>SPONSORED</span>
        </div>
        {/* icon */}
        <div style={{ display: "flex", justifyContent: "center", padding: "20px 0 16px" }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "rgba(245,158,11,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28,
          }}>✨</div>
        </div>
        <div style={{ padding: "0 18px 20px", textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#F0F4FF" }}>{p.sponsoredTitle}</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#9CA3AF", lineHeight: 1.6 }}>{p.sponsoredSub}</p>
          <button style={{
            marginTop: 12, height: 34, borderRadius: 9999,
            background: "#A78BFA", border: "none", cursor: "pointer",
            padding: "0 20px",
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff",
          }}>Join the Hype</button>
        </div>
      </div>
    );
  }

  const badge = BADGE_STYLE[p.badge!];
  const btnS  = BTN_STYLE[p.btnLabel] || { bg: "rgba(79,142,247,0.1)", color: "#4F8EF7" };
  const href  = p.type === "physical" ? `/marketplace/product/${p.id}` : `/marketplace/digital/${p.id}`;

  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        borderRadius: 14, overflow: "hidden",
        background: "#111827",
        border: `1.5px solid ${hovered ? "#4F8EF7" : "#1e2d45"}`,
        boxShadow: hovered ? "0 8px 32px rgba(79,142,247,0.12)" : "none",
        transition: "all 0.2s", cursor: "pointer",
        display: "flex", flexDirection: "column",
      }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* image area */}
        <div style={{
          height: 170, background: p.emojiColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}>
          <span style={{ fontSize: 52 }}>{p.emoji}</span>
          {badge && (
            <div style={{
              position: "absolute", top: 10, right: 10,
              background: badge.bg, color: badge.color,
              borderRadius: 6, padding: "2px 10px",
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
            }}>
              {badge.text}
            </div>
          )}
        </div>
        {/* body */}
        <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: "#4F8EF7", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 800, color: "#fff",
            }}>
              {p.seller}
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6B7280" }}>
              {p.seller} • {p.year}
            </span>
            <span style={{
              marginLeft: "auto",
              fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: "#10B981",
            }}>
              {p.price}
            </span>
          </div>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
            color: "#F0F4FF", lineHeight: 1.4,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {p.title}
          </p>
          <button style={{
            marginTop: 6, height: 34, borderRadius: 8,
            background: btnS.bg,
            border: `1.5px solid ${btnS.color}33`,
            cursor: "pointer", color: btnS.color,
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
            transition: "all 0.15s",
          }}>
            {p.btnLabel}
          </button>
        </div>
      </div>
    </Link>
  );
}

/* ═══ PAGE ════════════════════════════════════════════════════════ */
export default function MarketplacePage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch]             = useState("");

  const filters = ["All", "Notes PDF", "Video Course", "Physical"];

  return (
    <StudentLayout>



        <div style={{ padding: "24px 28px" }}>

          {/* college isolation banner */}
          <div style={{
            background: "rgba(79,142,247,0.06)",
            border: "1px solid rgba(79,142,247,0.2)",
            borderLeft: "4px solid #4F8EF7",
            borderRadius: 10, padding: "12px 16px",
            marginBottom: 24,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 16 }}>🔒</span>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF",
            }}>
              <strong style={{ color: "#4F8EF7" }}>You're browsing MIT College of Engineering marketplace only.</strong>{" "}
              Products here are listed exclusively by MIT students.
            </p>
          </div>

          {/* search + filters */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              {/* search input */}
              <div style={{ flex: 1, position: "relative" }}>
                <Search size={16} style={{
                  position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                  color: "#6B7280",
                }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search products, notes, categories..."
                  style={{
                    width: "100%", height: 44, paddingLeft: 42, paddingRight: 16,
                    background: "#111827", border: "1.5px solid #1e2d45",
                    borderRadius: 10, outline: "none", boxSizing: "border-box",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#F0F4FF",
                  }}
                />
              </div>
              {/* sort */}
              <button style={{
                height: 44, padding: "0 16px", borderRadius: 10,
                background: "#111827", border: "1.5px solid #1e2d45",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF",
                display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
              }}>
                Sort: Newest First <ChevronDown size={14} />
              </button>
            </div>

            {/* filter pills */}
            <div style={{ display: "flex", gap: 8 }}>
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    height: 32, padding: "0 16px", borderRadius: 9999,
                    background: activeFilter === f ? "#4F8EF7" : "transparent",
                    border: `1.5px solid ${activeFilter === f ? "#4F8EF7" : "#1e2d45"}`,
                    fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                    color: activeFilter === f ? "#fff" : "#6B7280",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {f === "Notes PDF" ? "📄 Notes PDF" : f === "Video Course" ? "🎥 Video Course" : f}
                </button>
              ))}
            </div>
          </div>

          {/* stats row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 20,
          }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280" }}>
              Showing <strong style={{ color: "#F0F4FF" }}>24</strong> products
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6B7280" }}>
              4 Digital | 20 Physical
            </p>
          </div>

          {/* product grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20,
            marginBottom: 32,
          }}>
            {PRODUCTS.map(p => <ProductCard key={p.id} p={p} />)}
          </div>

          {/* pagination */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
            {["← Prev", "1", "2", "3", "Next →"].map((p, i) => (
              <button
                key={p}
                style={{
                  height: 36,
                  padding: i === 0 || i === 4 ? "0 16px" : "0 14px",
                  borderRadius: 8,
                  background: i === 2 ? "#4F8EF7" : "transparent",
                  border: `1.5px solid ${i === 2 ? "#4F8EF7" : "#1e2d45"}`,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: i === 2 ? 700 : 500,
                  color: i === 2 ? "#fff" : "#6B7280",
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
    </StudentLayout>
  );
}
