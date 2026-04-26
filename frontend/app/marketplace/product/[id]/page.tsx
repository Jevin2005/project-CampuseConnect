"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Star, ShieldCheck, MessageCircle, ShoppingCart } from "lucide-react";

const THUMBNAILS = ["💻", "🔌", "⌨️", "🖥️"];

export default function PhysicalProductPage() {
  const [mainThumb, setMainThumb] = useState(0);
  const [hoverBuy, setHoverBuy]   = useState(false);
  const [hoverChat, setHoverChat] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0E1A" }}>

      {/* ── NAVBAR ── */}
      <header style={{
        height: 60, background: "#0d1120",
        borderBottom: "1px solid #1e2d45",
        display: "flex", alignItems: "center",
        padding: "0 40px", gap: 24,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex" }}>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#F0F4FF" }}>Campus</span>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#4F8EF7" }}>Connect</span>
        </Link>

        <nav style={{ display: "flex", gap: 0, marginLeft: 24 }}>
          {["Marketplace", "Textbooks", "Housing", "Services"].map((t, i) => (
            <Link key={t} href="#" style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: i === 0 ? 700 : 500,
              color: i === 0 ? "#4F8EF7" : "#6B7280", textDecoration: "none",
              padding: "0 16px", height: 60, display: "flex", alignItems: "center",
              borderBottom: i === 0 ? "2px solid #4F8EF7" : "2px solid transparent",
            }}>{t}</Link>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", cursor: "pointer" }}>
            <input placeholder="Search campus..." style={{
              height: 36, padding: "0 16px",
              background: "#111827", border: "1.5px solid #1e2d45",
              borderRadius: 9999, outline: "none",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F0F4FF", width: 180,
            }} />
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: "#4F8EF7",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 800, color: "#fff",
          }}>RS</div>
          <button style={{
            height: 34, padding: "0 16px", borderRadius: 9999,
            background: "#10B981", border: "none", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff",
          }}>+ Sell</button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px" }}>

        {/* breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
          {["Marketplace", "Electronics", "Dell Latitude Laptop"].map((b, i) => (
            <span key={b} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {i > 0 && <ChevronRight size={12} style={{ color: "#374151" }} />}
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                color: i === 2 ? "#F0F4FF" : "#6B7280",
                fontWeight: i === 2 ? 600 : 400,
              }}>{b}</span>
            </span>
          ))}
        </div>

        {/* two columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 40 }}>

          {/* ── LEFT ── */}
          <div>
            {/* For Sale badge */}
            <div style={{ marginBottom: 14 }}>
              <span style={{
                background: "rgba(16,185,129,0.15)", color: "#10B981",
                borderRadius: 6, padding: "4px 12px",
                fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
              }}>For Sale</span>
            </div>

            {/* main image */}
            <div style={{
              borderRadius: 14, overflow: "hidden",
              background: "#1e3a5f",
              height: 340,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 14,
              border: "1.5px solid #1e2d45",
            }}>
              <span style={{ fontSize: 80 }}>{THUMBNAILS[mainThumb]}</span>
            </div>

            {/* thumbnails */}
            <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
              {THUMBNAILS.map((t, i) => (
                <div
                  key={i}
                  onClick={() => setMainThumb(i)}
                  style={{
                    width: 72, height: 64, borderRadius: 10,
                    background: "#111827",
                    border: `1.5px solid ${mainThumb === i ? "#4F8EF7" : "#1e2d45"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, cursor: "pointer", transition: "border-color 0.15s",
                  }}
                >
                  {t}
                </div>
              ))}
              <div style={{
                width: 72, height: 64, borderRadius: 10,
                background: "#111827", border: "1.5px solid #1e2d45",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6B7280", cursor: "pointer",
              }}>
                +2 More
              </div>
            </div>

            {/* about */}
            <div style={{ borderTop: "1px solid #1e2d45", paddingTop: 28 }}>
              <h2 style={{
                fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700,
                color: "#F0F4FF", marginBottom: 14,
              }}>About this product</h2>
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#9CA3AF",
                lineHeight: 1.75, marginBottom: 20,
              }}>
                Purchased just 4 months ago for my Computer Science finals. This MacBook Pro M2 is in pristine
                condition, with absolutely no scratches on the body or the screen. It has been used primarily for
                coding and light browsing.
              </p>

              {/* specs grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", marginBottom: 20 }}>
                {[
                  { label: "MODEL",       value: "MacBook Pro 14″ (M2 Pro)" },
                  { label: "SPECS",       value: "16GB RAM / 512GB SSD"     },
                  { label: "CYCLE COUNT", value: "42 Cycles (healthy)"      },
                  { label: "WARRANTY",    value: "AppleCare+ until Sept 2025" },
                ].map(s => (
                  <div key={s.label}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1px", color: "#374151", marginBottom: 4 }}>{s.label}</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF" }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* condition */}
              <div style={{ marginBottom: 4 }}>
                <span style={{
                  background: "rgba(79,142,247,0.12)", color: "#4F8EF7",
                  borderRadius: 6, padding: "4px 12px",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                }}>Like New Condition</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT (sticky) ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* badges */}
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{
                background: "rgba(79,142,247,0.12)", color: "#4F8EF7",
                borderRadius: 6, padding: "4px 12px",
                fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
              }}>🔧 Physical</span>
              <span style={{
                background: "rgba(16,185,129,0.12)", color: "#10B981",
                borderRadius: 6, padding: "4px 12px",
                fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
              }}>✅ Available</span>
            </div>

            {/* title */}
            <h1 style={{
              fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800,
              color: "#F0F4FF", letterSpacing: "-0.5px", lineHeight: 1.3,
            }}>
              Apple MacBook Pro 14" (M2 Pro, 2023) — Space Gray
            </h1>

            {/* seller card */}
            <div style={{
              background: "#111827", border: "1.5px solid #1e2d45",
              borderRadius: 12, padding: "14px 16px",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg, #4F8EF7, #7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 800, color: "#fff",
              }}>JW</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: "#F0F4FF" }}>James Wilson</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6B7280" }}>MIT College, 3rd Year</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <Star size={12} style={{ color: "#F7C948", fill: "#F7C948" }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#F7C948" }}>4.8</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6B7280" }}>• 12 products sold</span>
                </div>
              </div>
              <Link href="#" style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                color: "#4F8EF7", textDecoration: "none",
              }}>View Profile</Link>
            </div>

            {/* price breakdown */}
            <div style={{
              background: "#111827", border: "1.5px solid #1e2d45",
              borderRadius: 12, padding: "18px 20px",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Price:",        value: "₹18,000",  color: "#9CA3AF" },
                  { label: "Platform fee:", value: "−₹900 (5%)", color: "#9CA3AF" },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280" }}>{r.label}</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: r.color }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: "#1e2d45" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280" }}>Seller gets:</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#10B981", fontWeight: 700 }}>₹17,100 ✓</span>
                </div>
              </div>

              <div style={{ height: 1, background: "#1e2d45", margin: "14px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#9CA3AF" }}>You pay:</span>
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "#10B981" }}>₹18,000</span>
              </div>
            </div>

            {/* buy button */}
            <button
              onMouseEnter={() => setHoverBuy(true)}
              onMouseLeave={() => setHoverBuy(false)}
              style={{
                width: "100%", height: 48, borderRadius: 9999,
                background: hoverBuy ? "#3b7de8" : "#4F8EF7",
                border: "none", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 16px rgba(79,142,247,0.35)",
                transition: "background 0.15s",
              }}
            >
              <ShoppingCart size={16} /> Buy Now
            </button>

            {/* contact seller */}
            <button
              onMouseEnter={() => setHoverChat(true)}
              onMouseLeave={() => setHoverChat(false)}
              style={{
                width: "100%", height: 46, borderRadius: 9999,
                background: "transparent",
                border: `1.5px solid ${hoverChat ? "#4F8EF7" : "#1e2d45"}`,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600,
                color: hoverChat ? "#4F8EF7" : "#9CA3AF",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.15s",
              }}
            >
              <MessageCircle size={16} /> Contact Seller
            </button>

            {/* safety note */}
            <div style={{
              background: "rgba(16,185,129,0.05)",
              border: "1px solid rgba(16,185,129,0.15)",
              borderRadius: 10, padding: "12px 14px",
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <ShieldCheck size={16} style={{ color: "#10B981", flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6B7280", lineHeight: 1.6 }}>
                <strong style={{ color: "#10B981" }}>CampusConnect Safety Guarantee.</strong>{" "}
                Your payment is held securely and is released to the seller after you confirm receipt and condition of the item.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
