"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRight, Star, ShieldCheck, Eye, ShoppingCart, FileText, Video } from "lucide-react";

const SUBJECTS = ["Electronics", "GATE", "Notes", "Signals & Systems", "Digital Circuits"];
const INCLUDED = [
  "Hand-written comprehensive notes with architectural diagrams",
  "Consolidated Formula sheet for last-minute revision",
  "Solved PIQs (2018–2023) with step-by-step methodology",
  "High-priority topic weightage analysis",
];
const DRM_POINTS = [
  "Watermarked with YOUR username on every page",
  "No download button available",
  "Right-click is disabled",
  "Screenshot protection active",
  "Shared copies are digitally traceable",
];

export default function DigitalProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [hoverBuy, setHoverBuy]         = useState(false);
  const [hoverPreview, setHoverPreview] = useState(false);
  // Toggle between PDF and Video product to demo both preview flows
  const [productKind, setProductKind]   = useState<"pdf" | "video">("pdf");

  const handlePreview = () => {
    if (productKind === "pdf") {
      router.push("/marketplace/viewer/pdf?preview=true");
    } else {
      router.push("/marketplace/viewer/video?preview=true");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0A0E1A" }}>

      {/* ── LEFT SIDEBAR ── */}
      <aside style={{
        width: 200, flexShrink: 0,
        background: "#0d1120", borderRight: "1px solid #1e2d45",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh",
      }}>
        {/* logo */}
        <div style={{ padding: "20px 18px", borderBottom: "1px solid #1e2d45" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex" }}>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: "#F0F4FF" }}>Scholar</span>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: "#A78BFA" }}>Market</span>
          </Link>
        </div>

        {/* nav */}
        <nav style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { label: "Marketplace", active: true,  icon: "🛒" },
            { label: "Library",     active: false, icon: "📚" },
            { label: "Research",    active: false, icon: "🔬" },
            { label: "Network",     active: false, icon: "👥" },
            { label: "Settings",    active: false, icon: "⚙️" },
          ].map(n => (
            <Link key={n.label} href="#" style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8,
                background: n.active ? "rgba(167,139,250,0.12)" : "transparent",
                color: n.active ? "#A78BFA" : "#6B7280",
              }}>
                <span style={{ fontSize: 14 }}>{n.icon}</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: n.active ? 700 : 500 }}>
                  {n.label}
                </span>
              </div>
            </Link>
          ))}
        </nav>

        {/* user */}
        <div style={{ marginTop: "auto", padding: "16px", borderTop: "1px solid #1e2d45" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#A78BFA",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 800, color: "#fff",
            }}>IVY</div>
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#F0F4FF" }}>Ivy Scholar</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#6B7280" }}>Graduate Level</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* top nav */}
        <header style={{
          height: 56, background: "#0d1120",
          borderBottom: "1px solid #1e2d45",
          display: "flex", alignItems: "center",
          padding: "0 28px", gap: 24,
          position: "sticky", top: 0, zIndex: 10,
        }}>
          {["Marketplace", "Library", "Research"].map((t, i) => (
            <Link key={t} href="#" style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: i === 0 ? 700 : 500,
              color: i === 0 ? "#A78BFA" : "#6B7280", textDecoration: "none",
              padding: "0 4px", height: 56, display: "flex", alignItems: "center",
              borderBottom: i === 0 ? "2px solid #A78BFA" : "2px solid transparent",
            }}>{t}</Link>
          ))}
          <div style={{ flex: 1 }} />
          <ShoppingCart size={18} style={{ color: "#6B7280", cursor: "pointer" }} />
          <div style={{ position: "relative", cursor: "pointer" }}>
            <span style={{ fontSize: 18 }}>🔔</span>
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: "#A78BFA",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 800, color: "#fff",
            cursor: "pointer",
          }}>RS</div>
        </header>

        {/* breadcrumb */}
        <div style={{ padding: "16px 28px", display: "flex", alignItems: "center", gap: 8 }}>
          {["Marketplace", "Digital", "GATE ECE Notes"].map((b, i) => (
            <span key={b} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {i > 0 && <ChevronRight size={12} style={{ color: "#374151" }} />}
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                color: i === 2 ? "#F0F4FF" : "#6B7280", fontWeight: i === 2 ? 600 : 400,
              }}>{b}</span>
            </span>
          ))}
        </div>

        {/* two columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 28, padding: "0 28px 40px" }}>

          {/* LEFT */}
          <div>
            {/* product type toggle (demo) */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {(["pdf", "video"] as const).map(k => (
                <button key={k} onClick={() => setProductKind(k)} style={{
                  flex: 1, height: 36, borderRadius: 8,
                  background: productKind === k ? (k === "pdf" ? "rgba(167,139,250,0.15)" : "rgba(16,185,129,0.12)") : "#111827",
                  border: `1.5px solid ${productKind === k ? (k === "pdf" ? "#A78BFA" : "#10B981") : "#1e2d45"}`,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
                  color: productKind === k ? (k === "pdf" ? "#A78BFA" : "#10B981") : "#6B7280",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "all 0.15s",
                }}>
                  {k === "pdf" ? <FileText size={13} /> : <Video size={13} />}
                  {k === "pdf" ? "PDF Notes" : "Video Course"}
                </button>
              ))}
            </div>

            {/* preview card */}
            <div style={{
              background: "#111827",
              border: `1.5px solid ${productKind === "pdf" ? "rgba(167,139,250,0.3)" : "rgba(16,185,129,0.3)"}`,
              borderRadius: 14, padding: "40px 24px",
              display: "flex", flexDirection: "column", alignItems: "center",
              marginBottom: 28, transition: "border-color 0.2s",
            }}>
              {/* icon */}
              <div style={{
                width: 80, height: 80, borderRadius: 18,
                background: productKind === "pdf" ? "rgba(167,139,250,0.15)" : "rgba(16,185,129,0.12)",
                border: `1.5px solid ${productKind === "pdf" ? "rgba(167,139,250,0.3)" : "rgba(16,185,129,0.3)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36, marginBottom: 16, transition: "all 0.2s",
              }}>{productKind === "pdf" ? "📄" : "🎥"}</div>
              <h2 style={{
                fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700,
                color: "#F0F4FF", marginBottom: 8, textAlign: "center",
              }}>{productKind === "pdf" ? "GATE 2024 ECE Notes" : "Advanced DSP Video Course"}</h2>
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280",
                marginBottom: 16,
              }}>{productKind === "pdf" ? "Preview: 2 of 48 pages" : "Preview: First 5 minutes free"}</p>
              <div style={{ display: "flex", gap: 10 }}>
                {(productKind === "pdf"
                  ? [{ icon: "📄", text: "48 pages" }, { icon: "📁", text: "PDF" }, { icon: "💾", text: "12.4 MB" }]
                  : [{ icon: "🎥", text: "12 lessons" }, { icon: "⏱️", text: "6h 40m total" }, { icon: "💾", text: "HD Video" }]
                ).map(i => (
                  <span key={i.text} style={{
                    background: "#1a2235", borderRadius: 9999, padding: "4px 12px",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#9CA3AF",
                  }}>{i.icon} {i.text}</span>
                ))}
              </div>
            </div>

            {/* subjects */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: "#F0F4FF", marginBottom: 12 }}>Subjects covered</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SUBJECTS.map(s => (
                  <span key={s} style={{
                    background: "#111827", border: "1px solid #1e2d45",
                    borderRadius: 9999, padding: "5px 14px",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#9CA3AF",
                  }}>{s}</span>
                ))}
              </div>
            </div>

            {/* what's included */}
            <div>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: "#F0F4FF", marginBottom: 12 }}>What&apos;s included</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {INCLUDED.map(item => (
                  <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: "rgba(16,185,129,0.15)", flexShrink: 0, marginTop: 2,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981" }} />
                    </div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF", lineHeight: 1.6 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* DRM box */}
            <div style={{
              background: "rgba(139,92,246,0.06)",
              border: "1.5px solid rgba(139,92,246,0.25)",
              borderRadius: 12, padding: "16px 18px",
            }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                <ShieldCheck size={16} style={{ color: "#A78BFA" }} />
                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: "#A78BFA" }}>
                  Digital Content Protection
                </p>
              </div>
              {DRM_POINTS.map(pt => (
                <div key={pt} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ color: "#10B981", fontSize: 14, flexShrink: 0 }}>✓</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#9CA3AF" }}>{pt}</span>
                </div>
              ))}
              {/* warning */}
              <div style={{
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 8, padding: "8px 12px", marginTop: 8,
              }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#EF4444" }}>
                  ⚠️ Do not share this content. Your account may be suspended.
                </p>
              </div>
            </div>

            {/* price card */}
            <div style={{
              background: "#111827", border: "1.5px solid #1e2d45",
              borderRadius: 12, padding: "16px 18px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280" }}>Price</span>
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: "#F0F4FF" }}>₹500</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280" }}>Platform fee</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#EF4444" }}>−₹25</span>
              </div>
              <div style={{ height: 1, background: "#1e2d45", margin: "10px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280" }}>Seller gets</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: "#10B981" }}>₹475</span>
              </div>
            </div>

            {/* buy button */}
            <button
              onMouseEnter={() => setHoverBuy(true)}
              onMouseLeave={() => setHoverBuy(false)}
              style={{
                width: "100%", height: 48, borderRadius: 9999,
                background: hoverBuy ? "#7c4be8" : "#8B5CF6",
                border: "none", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff",
                boxShadow: "0 4px 16px rgba(139,92,246,0.3)",
                transition: "background 0.15s",
              }}
            >
              Buy &amp; Access Now
            </button>

            {/* preview button — routes to viewer with ?preview=true */}
            <button
              onClick={handlePreview}
              onMouseEnter={() => setHoverPreview(true)}
              onMouseLeave={() => setHoverPreview(false)}
              style={{
                width: "100%", height: 44, borderRadius: 9999,
                background: hoverPreview
                  ? (productKind === "pdf" ? "rgba(167,139,250,0.08)" : "rgba(16,185,129,0.08)")
                  : "transparent",
                border: `1.5px solid ${hoverPreview
                  ? (productKind === "pdf" ? "#A78BFA" : "#10B981")
                  : (productKind === "pdf" ? "rgba(139,92,246,0.4)" : "rgba(16,185,129,0.4)")}`,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                color: productKind === "pdf" ? "#A78BFA" : "#10B981",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.15s",
              }}
            >
              <Eye size={15} />
              {productKind === "pdf" ? "Free Preview (2 pages)" : "Free Preview (5 min)"}
            </button>

            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#374151", textAlign: "center" }}>
              Safe &amp; Encrypted Transactions
            </p>

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
              }}>RS</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: "#F0F4FF" }}>Rahul Sharma</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6B7280" }}>MIT '24 • Top Contributor</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                  <Star size={11} style={{ color: "#F7C948", fill: "#F7C948" }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#F7C948" }}>4.9</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6B7280" }}>(50 Reviews)</span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: "#374151" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
