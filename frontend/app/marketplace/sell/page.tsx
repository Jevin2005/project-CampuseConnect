"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Package, MessageSquare, Settings, CheckCircle, Upload } from "lucide-react";

/* ─── Live Fee Calculator ─────────────────────────────────────── */
function FeeCalculator({ price, isDigital }: { price: string; isDigital: boolean }) {
  const p     = parseFloat(price.replace(/,/g, "")) || 0;
  const list  = isDigital ? 20 : 50;
  const plat  = Math.round(p * 0.05);
  const recv  = Math.max(0, p - plat);

  return (
    <div style={{
      background: "#0d1120", border: "1.5px solid #1e2d45",
      borderRadius: 12, padding: "18px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 16 }}>📊</span>
        <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: "#F0F4FF" }}>
          Live Fee Calculator
        </p>
      </div>
      {[
        { label: "Selling Price",       value: p     ? `₹${p.toLocaleString("en-IN")}` : "—",       color: "#F0F4FF" },
        { label: "Listing Fee (once)",   value: `₹${list}`,                                           color: "#EF4444" },
        { label: `Platform (5%)`,        value: p     ? `−₹${plat.toLocaleString("en-IN")}` : "—",   color: "#EF4444" },
      ].map(r => (
        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6B7280" }}>{r.label}</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: r.color }}>{r.value}</span>
        </div>
      ))}
      <div style={{ height: 1, background: "#1e2d45", margin: "10px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF" }}>You&apos;ll receive</span>
        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "#10B981" }}>
          {p ? `₹${recv.toLocaleString("en-IN")}` : "₹—"}
        </span>
      </div>
      {p > 0 && (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#374151", marginTop: 4, textAlign: "right" }}>
          (per successful sale)
        </p>
      )}
    </div>
  );
}

/* ═══ PAGE ════════════════════════════════════════════════════════ */
export default function SellProductPage() {
  const [step,      setStep]      = useState(1);
  const [prodType,  setProdType]  = useState<"physical" | "digital" | null>(null);
  const [title,     setTitle]     = useState("");
  const [desc,      setDesc]      = useState("");
  const [category,  setCategory]  = useState("Electronics");
  const [condition, setCondition] = useState("Brand New");
  const [origPrice, setOrigPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [photos,    setPhotos]    = useState<string[]>([]);

  const STEPS = ["Product Type", "Details", "Review & Pay"];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0A0E1A" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 200, flexShrink: 0,
        background: "#0d1120", borderRight: "1px solid #1e2d45",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh",
      }}>
        <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid #1e2d45" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex" }}>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: "#F0F4FF" }}>Lumina </span>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: "#4F8EF7" }}>Market</span>
          </Link>
        </div>
        <nav style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { icon: <Home size={15}/>,         label: "Marketplace", active: false },
            { icon: <Package size={15}/>,      label: "Sell Product", active: true  },
            { icon: <span>🏪</span>,           label: "My Shop",     active: false },
            { icon: <MessageSquare size={15}/>, label: "Messages",    active: false },
            { icon: <Settings size={15}/>,     label: "Services",    active: false },
          ].map(n => (
            <div key={n.label} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 8,
              background: n.active ? "rgba(79,142,247,0.12)" : "transparent",
              color: n.active ? "#4F8EF7" : "#6B7280", cursor: "pointer",
            }}>
              {n.icon}
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: n.active ? 700 : 500 }}>{n.label}</span>
            </div>
          ))}
        </nav>

        {/* Price preview */}
        {sellPrice && (
          <div style={{ margin: "auto 16px 20px", background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.2)", borderRadius: 10, padding: "10px 14px" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#6B7280", marginBottom: 4 }}>LISTING PRICE</p>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#4F8EF7" }}>₹{sellPrice}</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "#10B981", marginTop: 2 }}>+{origPrice ? `₹${origPrice} orig.` : "Set orig. price"}</p>
          </div>
        )}
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, padding: "32px 36px", minWidth: 0 }}>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
          {STEPS.map((s, i) => {
            const n = i + 1;
            const done = n < step;
            const curr = n === step;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: done ? "#10B981" : curr ? "#4F8EF7" : "#1e2d45",
                    border: `2px solid ${done ? "#10B981" : curr ? "#4F8EF7" : "#1e2d45"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {done
                      ? <CheckCircle size={18} style={{ color: "#fff" }} />
                      : <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 800, color: curr ? "#fff" : "#6B7280" }}>{n}</span>
                    }
                  </div>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: curr ? 700 : 500,
                    color: curr ? "#F0F4FF" : done ? "#10B981" : "#6B7280",
                    whiteSpace: "nowrap",
                  }}>{s}</span>
                </div>
                {i < 2 && (
                  <div style={{
                    flex: 1, height: 2, marginBottom: 20, marginLeft: 8, marginRight: 8,
                    background: done ? "#10B981" : "#1e2d45",
                    transition: "background 0.3s",
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── STEP 1: Type chooser ── */}
        {step === 1 && (
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: "#F0F4FF", textAlign: "center", marginBottom: 6 }}>
              List Your Product
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 32 }}>
              Reach thousands of students in the Digital Ivy League ecosystem.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {[
                { key: "physical" as const, icon: "🔧", label: "Physical / Refurbished Item", sub: "Sell your pre-loved gadgets, textbooks, or even essentials to other students on campus.", fee: 50,  tags: ["Laptop", "Books", "Electronics"], color: "#4F8EF7" },
                { key: "digital"  as const, icon: "📄", label: "Digital Product",              sub: "Share your knowledge, full course notes, study guides, or specialized digital assets.",    fee: 20,  tags: ["Note PDF", "Video+Notes", "Markup(digital)"], color: "#10B981" },
              ].map(t => (
                <div
                  key={t.key}
                  onClick={() => { setProdType(t.key); setStep(2); }}
                  style={{
                    background: "#111827",
                    border: `1.5px solid ${prodType === t.key ? t.color : "#1e2d45"}`,
                    borderRadius: 14, padding: "24px 22px",
                    cursor: "pointer", transition: "all 0.2s",
                    boxShadow: prodType === t.key ? `0 0 0 3px ${t.color}22` : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                    <span style={{
                      background: `rgba(${t.key === "physical" ? "79,142,247" : "16,185,129"},0.1)`,
                      color: t.color, borderRadius: 6, padding: "2px 10px",
                      fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700,
                    }}>Listing Fee ₹{t.fee}</span>
                  </div>
                  <span style={{ fontSize: 32, display: "block", marginBottom: 12 }}>{t.icon}</span>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#F0F4FF", marginBottom: 8 }}>{t.label}</h3>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6B7280", lineHeight: 1.6, marginBottom: 14 }}>{t.sub}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1px", color: "#374151", marginBottom: 8 }}>EXAMPLES:</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {t.tags.map(g => (
                      <span key={g} style={{
                        background: "#1a2235", borderRadius: 6, padding: "3px 10px",
                        fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#9CA3AF",
                      }}>{g}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Details ── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "#F0F4FF", marginBottom: 6 }}>Product Details</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280", marginBottom: 24 }}>Fill in the details for your listing.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28 }}>
              {/* left — form */}
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {/* Product Title */}
                <label style={labelStyle}>Product Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. MacBook Pro M2 2023 — Space Gray"
                  style={inputStyle} />

                {/* Description */}
                <label style={{ ...labelStyle, marginTop: 16 }}>Description</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)}
                  placeholder="Describe the condition, usage, and any defects..."
                  rows={4}
                  style={{ ...inputStyle, height: "auto", resize: "vertical", padding: "10px 16px", lineHeight: 1.6 }} />

                {/* Category + Condition row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
                      {["Electronics","Books","Clothing","Stationery","Equipment","Other"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Condition</label>
                    <select value={condition} onChange={e => setCondition(e.target.value)} style={inputStyle}>
                      {["Brand New","Like New","Good","Fair"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>

                {/* Prices row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
                  <div>
                    <label style={labelStyle}>Original Price (₹)</label>
                    <input value={origPrice} onChange={e => setOrigPrice(e.target.value)} placeholder="25000" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Selling Price (₹) *</label>
                    <input value={sellPrice} onChange={e => setSellPrice(e.target.value)} placeholder="18000"
                      style={{ ...inputStyle, borderColor: sellPrice ? "#4F8EF7" : "#1e2d45", boxShadow: sellPrice ? "0 0 0 3px rgba(79,142,247,0.12)" : "none" }} />
                  </div>
                </div>

                {/* Photo upload */}
                <div style={{ marginTop: 24 }}>
                  <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#F0F4FF", marginBottom: 12 }}>Product Media</p>
                  <div style={{
                    border: "2px dashed #1e2d45", borderRadius: 12, height: 140,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: 8, cursor: "pointer", transition: "border-color 0.15s",
                    background: "#111827",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#4F8EF7")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#1e2d45")}
                  >
                    <Upload size={24} style={{ color: "#6B7280" }} />
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF" }}>Click to upload photos</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#374151" }}>PNG, JPG or WEBP (Max 5MB per file)</p>
                  </div>
                </div>
              </div>

              {/* right — fee calculator + review */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <FeeCalculator price={sellPrice} isDigital={prodType === "digital"} />

                <button
                  onClick={() => setStep(3)}
                  disabled={!title || !sellPrice}
                  style={{
                    width: "100%", height: 46, borderRadius: 9999,
                    background: title && sellPrice ? "#4F8EF7" : "#1a2235",
                    border: "none", cursor: title && sellPrice ? "pointer" : "not-allowed",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
                    color: title && sellPrice ? "#fff" : "#6B7280",
                    boxShadow: title && sellPrice ? "0 4px 16px rgba(79,142,247,0.3)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  Continue to Review →
                </button>

                <button
                  style={{
                    width: "100%", height: 38, borderRadius: 9999,
                    background: "transparent", border: "1px solid #1e2d45",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280", cursor: "pointer",
                  }}
                >
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Review & Pay ── */}
        {step === 3 && (
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: "#F0F4FF", marginBottom: 6 }}>Review &amp; Pay</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280", marginBottom: 24 }}>Check your listing details before publishing.</p>

            {/* summary card */}
            <div style={{ background: "#111827", border: "1.5px solid #1e2d45", borderRadius: 14, padding: "20px 22px", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 10,
                  background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, flexShrink: 0,
                }}>💻</div>
                <div>
                  <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#F0F4FF", marginBottom: 4 }}>
                    {title || "MacBook Pro M2 2023"}
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6B7280" }}>{category}</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6B7280" }}>•</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6B7280" }}>{condition}</span>
                  </div>
                </div>
                <span style={{ marginLeft: "auto", fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#10B981" }}>
                  ₹{sellPrice || "18,000"}
                </span>
              </div>
              <div style={{ height: 1, background: "#1e2d45" }} />
              <FeeCalculator price={sellPrice} isDigital={prodType === "digital"} />
            </div>

            {/* payment section */}
            <div style={{ background: "#111827", border: "1.5px solid #1e2d45", borderRadius: 14, padding: "20px 22px" }}>
              <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#F0F4FF", marginBottom: 4 }}>
                Listing Fee Required: <span style={{ color: "#F7C948" }}>₹{prodType === "digital" ? "20" : "50"}</span>
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6B7280", marginBottom: 20 }}>
                This fee ensures only genuine sellers list products.
              </p>
              <button style={{
                width: "100%", height: 48, borderRadius: 9999,
                background: "linear-gradient(90deg, #1a6fff 0%, #4F8EF7 100%)",
                border: "none", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: "0 4px 20px rgba(79,142,247,0.35)",
              }}>
                <span style={{ fontSize: 16 }}>💳</span>
                Pay ₹{prodType === "digital" ? "20" : "50"} &amp; List Product
              </button>
            </div>

            <button onClick={() => setStep(2)} style={{
              marginTop: 16, background: "transparent", border: "none",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280", cursor: "pointer",
            }}>
              ← Back to Details
            </button>
          </div>
        )}

        {/* navigation row */}
        {step === 2 && (
          <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
            <button onClick={() => setStep(1)} style={{
              height: 42, padding: "0 20px", borderRadius: 9999,
              background: "transparent", border: "1.5px solid #1e2d45",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF", cursor: "pointer",
            }}>← Back</button>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", marginBottom: 6,
  fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
  letterSpacing: "1px", textTransform: "uppercase", color: "#6B7280",
};

const inputStyle: React.CSSProperties = {
  width: "100%", height: 44, padding: "0 16px",
  background: "#1a2235", border: "1.5px solid #1e2d45",
  borderRadius: 10, outline: "none",
  fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#F0F4FF",
  boxSizing: "border-box", transition: "border-color 0.2s",
};
