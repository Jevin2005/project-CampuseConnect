"use client";

import { useState } from "react";
import { CheckCircle, Upload, FileText, Video, Package, Layers } from "lucide-react";
import { StudentLayout } from "@/components/StudentLayout";

type ProdType = "physical" | "digital" | null;
type DigSub = "notes" | "video" | "both" | "bundle" | null;

function FeeCalc({ price, isDigital }: { price: string; isDigital: boolean }) {
  const p = parseFloat(price.replace(/,/g, "")) || 0;
  const list = isDigital ? 20 : 50;
  const plat = Math.round(p * 0.05);
  const recv = Math.max(0, p - plat);
  return (
    <div style={{ background: "#0d1120", border: "1.5px solid #1e2d45", borderRadius: 12, padding: "18px 20px" }}>
      <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: "#F0F4FF", marginBottom: 14 }}>📊 Live Fee Calculator</p>
      {[
        { label: "Selling Price", value: p ? `₹${p.toLocaleString("en-IN")}` : "—", color: "#F0F4FF" },
        { label: "Listing Fee (once)", value: `₹${list}`, color: "#EF4444" },
        { label: "Platform (5%)", value: p ? `−₹${plat.toLocaleString("en-IN")}` : "—", color: "#EF4444" },
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
    </div>
  );
}

const label: React.CSSProperties = {
  display: "block", marginBottom: 6,
  fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
  letterSpacing: "1px", textTransform: "uppercase", color: "#6B7280",
};
const input: React.CSSProperties = {
  width: "100%", height: 44, padding: "0 16px",
  background: "#1a2235", border: "1.5px solid #1e2d45",
  borderRadius: 10, outline: "none",
  fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#F0F4FF",
  boxSizing: "border-box", transition: "border-color 0.2s",
};

export default function SellProductPage() {
  const [step, setStep]         = useState(1);
  const [prodType, setProdType] = useState<ProdType>(null);
  const [digSub, setDigSub]     = useState<DigSub>(null);
  const [title, setTitle]       = useState("");
  const [desc, setDesc]         = useState("");
  const [category, setCategory] = useState("Electronics");
  const [condition, setCondition] = useState("Brand New");
  const [origPrice, setOrigPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");

  const STEPS = ["Product Type", "Details", "Review & Pay"];

  // Digital sub-type options
  const DIG_SUBS = [
    { key: "notes"  as DigSub, icon: <FileText size={28} />,  label: "Notes / PDF",    desc: "Handwritten notes, typed guides, question banks, solutions.", color: "#A78BFA", glow: "rgba(167,139,250,0.18)", tags: ["GATE Notes","Study Guide","Solutions"] },
    { key: "video"  as DigSub, icon: <Video size={28} />,     label: "Video Course",   desc: "Recorded lectures, tutorials, or concept explainer videos.",  color: "#10B981", glow: "rgba(16,185,129,0.18)",  tags: ["Full Course","Lectures","Tutorials"] },
    { key: "both"   as DigSub, icon: <Layers size={28} />,    label: "Notes + Video",  desc: "Sell a combined package of PDFs alongside video content.",    color: "#F7C948", glow: "rgba(247,201,72,0.18)",  tags: ["Complete Pack","Notes + Videos"] },
    { key: "bundle" as DigSub, icon: <Package size={28} />,   label: "Bundle",         desc: "Multi-subject or multi-course bundle at one discounted price.", color: "#4F8EF7", glow: "rgba(79,142,247,0.18)", tags: ["Multi-subject","Combo","Semester Pack"] },
  ];

  const [submitted, setSubmitted]   = useState(false);
  const [draftToast, setDraftToast] = useState(false);
  const [payModal, setPayModal]     = useState(false);
  const [payStep, setPayStep]       = useState<"choose"|"done">("choose");

  const listFee = prodType === "digital" ? 20 : 49;
  const digSubColor = DIG_SUBS.find(d => d.key === digSub)?.color ?? "#4F8EF7";

  function saveDraft() { setDraftToast(true); setTimeout(() => setDraftToast(false), 3000); }
  function openPayModal() { setPayModal(true); setPayStep("choose"); }
  function completePay() { setPayStep("done"); setTimeout(() => { setPayModal(false); setSubmitted(true); }, 1400); }

  return (
    <StudentLayout>
      <div style={{ padding: "32px 36px", maxWidth: 900 }}>

        {/* Draft Saved Toast */}
        {draftToast && (
          <div style={{ position:"fixed", top:20, right:24, zIndex:999, background:"#4F8EF7", color:"#fff", borderRadius:12, padding:"12px 20px", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, boxShadow:"0 8px 32px rgba(0,0,0,0.4)" }}>
            💾 Draft saved! You can continue later.
          </div>
        )}

        {/* Listing Fee Payment Modal */}
        {payModal && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
            <div style={{ background:"#111827", border:"1.5px solid #1e2d45", borderRadius:20, padding:"32px 36px", maxWidth:420, width:"90%", animation:"fadeUp .25s ease" }}>
              {payStep === "choose" ? (<>
                <div style={{ textAlign:"center", marginBottom:20 }}>
                  <div style={{ fontSize:42, marginBottom:8 }}>🏷️</div>
                  <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800, color:"#F0F4FF", marginBottom:4 }}>Pay Listing Fee</h2>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#6B7280" }}>One-time fee to publish your product on CampusConnect Marketplace</p>
                </div>
                <div style={{ background:"rgba(79,142,247,0.06)", border:"1px solid rgba(79,142,247,0.2)", borderRadius:12, padding:"16px 18px", marginBottom:20 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#6B7280" }}>Listing Fee ({prodType === "digital" ? "Digital" : "Physical"}):</span>
                    <span style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, color:"#4F8EF7" }}>₹{listFee}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#374151" }}>Product goes live after admin review</span>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#10B981" }}>✓ One time only</span>
                  </div>
                </div>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700, letterSpacing:"1px", color:"#6B7280", textTransform:"uppercase", marginBottom:12 }}>Choose Payment Method</p>
                <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
                  {[{icon:"📱", label:"UPI / GPay / PhonePe"}, {icon:"💳", label:"Debit / Credit Card"}, {icon:"🏦", label:"Net Banking"}].map(m => (
                    <div key={m.label} onClick={completePay} style={{ display:"flex", alignItems:"center", gap:12, background:"#1a2235", border:"1.5px solid #1e2d45", borderRadius:12, padding:"14px 16px", cursor:"pointer", transition:"border-color 0.15s" }}
                      onMouseEnter={e=>(e.currentTarget.style.borderColor="#4F8EF7")}
                      onMouseLeave={e=>(e.currentTarget.style.borderColor="#1e2d45")}>
                      <span style={{ fontSize:22 }}>{m.icon}</span>
                      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, color:"#F0F4FF" }}>{m.label}</span>
                    </div>
                  ))}
                </div>
                <button onClick={()=>setPayModal(false)} style={{ width:"100%", height:38, borderRadius:9999, background:"transparent", border:"1.5px solid #1e2d45", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#6B7280", cursor:"pointer" }}>Cancel</button>
              </>) : (<>
                <div style={{ textAlign:"center", padding:"20px 0" }}>
                  <div style={{ fontSize:56, marginBottom:12 }}>✅</div>
                  <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800, color:"#10B981", marginBottom:6 }}>Payment Successful!</h2>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#9CA3AF" }}>₹{listFee} paid. Submitting your listing…</p>
                </div>
              </>)}
            </div>
          </div>
        )}

        {/* Success Screen */}
        {submitted ? (
          <div style={{ textAlign:"center", padding:"60px 24px" }}>
            <div style={{ fontSize:72, marginBottom:16 }}>🎉</div>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:28, fontWeight:800, color:"#F0F4FF", marginBottom:8 }}>Listing Submitted!</h2>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15, color:"#9CA3AF", marginBottom:6, maxWidth:440, margin:"0 auto 24px" }}>
              Your product is now <strong style={{ color:"#10B981" }}>pending admin review</strong>. It will go live within 24 hours after approval.
            </p>
            <div style={{ display:"inline-flex", flexDirection:"column", gap:6, background:"rgba(16,185,129,0.06)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:14, padding:"18px 28px", marginBottom:28, textAlign:"left" }}>
              {["✅ Payment received","📋 Listing under review","📢 Goes live after approval"].map(s => (
                <span key={s} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#9CA3AF" }}>{s}</span>
              ))}
            </div>
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              <a href="/marketplace/listings" style={{ height:44, padding:"0 24px", borderRadius:9999, background:"#10B981", border:"none", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:700, color:"#fff", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8, textDecoration:"none" }}>📋 View My Listings</a>
              <button onClick={() => { setSubmitted(false); setStep(1); setProdType(null); setTitle(""); setDesc(""); setSellPrice(""); }} style={{ height:44, padding:"0 24px", borderRadius:9999, background:"transparent", border:"1.5px solid #1e2d45", fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"#9CA3AF", cursor:"pointer" }}>+ List Another</button>
            </div>
          </div>
        ) : (<>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
          {STEPS.map((s, i) => {
            const n = i + 1; const done = n < step; const curr = n === step;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: done ? "#10B981" : curr ? "#4F8EF7" : "#1e2d45", border: `2px solid ${done ? "#10B981" : curr ? "#4F8EF7" : "#1e2d45"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {done ? <CheckCircle size={18} style={{ color: "#fff" }} /> : <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 800, color: curr ? "#fff" : "#6B7280" }}>{n}</span>}
                  </div>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: curr ? 700 : 500, color: curr ? "#F0F4FF" : done ? "#10B981" : "#6B7280", whiteSpace: "nowrap" }}>{s}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 2, marginBottom: 20, marginLeft: 8, marginRight: 8, background: done ? "#10B981" : "#1e2d45", transition: "background 0.3s" }} />}
              </div>
            );
          })}
        </div>

        {/* ── STEP 1: Choose Physical / Digital ── */}
        {step === 1 && (
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: "#F0F4FF", textAlign: "center", marginBottom: 6 }}>List Your Product</h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 36 }}>
              Reach thousands of students in the CampusConnect ecosystem.
            </p>

            {/* Two main cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginBottom: prodType === "digital" ? 32 : 0 }}>
              {[
                { key: "physical" as ProdType, icon: "🔧", label: "Physical Product", desc: "Sell gadgets, textbooks, lab equipment, or any tangible item.", fee: 50, color: "#4F8EF7", glow: "rgba(79,142,247,0.2)", tags: ["Laptop", "Books", "Electronics", "Equipment"] },
                { key: "digital"  as ProdType, icon: "💻", label: "Digital Product",  desc: "Sell study notes, video courses, bundles, or any digital content.", fee: 20, color: "#A78BFA", glow: "rgba(167,139,250,0.2)", tags: ["Notes PDF", "Video Course", "Bundle"] },
              ].map(t => (
                <div
                  key={t.key!}
                  onClick={() => { setProdType(t.key); setDigSub(null); if (t.key === "physical") setStep(2); }}
                  style={{
                    background: "#111827",
                    border: `2px solid ${prodType === t.key ? t.color : "#1e2d45"}`,
                    borderRadius: 18, padding: "28px 24px",
                    cursor: "pointer", transition: "all 0.22s",
                    boxShadow: prodType === t.key ? `0 4px 28px ${t.glow}` : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={{ fontSize: 40 }}>{t.icon}</span>
                    <span style={{ background: `${t.color}20`, color: t.color, borderRadius: 8, padding: "4px 12px", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700 }}>₹{t.fee} listing</span>
                  </div>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 800, color: "#F0F4FF", marginBottom: 10 }}>{t.label}</h3>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280", lineHeight: 1.65, marginBottom: 16 }}>{t.desc}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {t.tags.map(g => <span key={g} style={{ background: "#1a2235", borderRadius: 6, padding: "3px 10px", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#9CA3AF" }}>{g}</span>)}
                  </div>
                </div>
              ))}
            </div>

            {/* Digital sub-type picker */}
            {prodType === "digital" && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#F0F4FF", marginBottom: 4 }}>What are you selling?</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6B7280" }}>Choose the type of digital content you want to list.</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                  {DIG_SUBS.map(d => (
                    <div
                      key={d.key!}
                      onClick={() => setDigSub(d.key)}
                      style={{
                        background: "#111827",
                        border: `2px solid ${digSub === d.key ? d.color : "#1e2d45"}`,
                        borderRadius: 14, padding: "20px 18px",
                        cursor: "pointer", transition: "all 0.2s",
                        boxShadow: digSub === d.key ? `0 4px 20px ${d.glow}` : "none",
                        display: "flex", gap: 14, alignItems: "flex-start",
                      }}
                    >
                      <div style={{ color: digSub === d.key ? d.color : "#374151", flexShrink: 0, marginTop: 2 }}>{d.icon}</div>
                      <div>
                        <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: digSub === d.key ? d.color : "#F0F4FF", marginBottom: 6 }}>{d.label}</p>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6B7280", lineHeight: 1.6, marginBottom: 10 }}>{d.desc}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {d.tags.map(g => <span key={g} style={{ background: "#1a2235", borderRadius: 5, padding: "2px 8px", fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#9CA3AF" }}>{g}</span>)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  disabled={!digSub}
                  onClick={() => setStep(2)}
                  style={{
                    width: "100%", height: 50, borderRadius: 9999,
                    background: digSub ? `linear-gradient(90deg, ${digSubColor}, ${digSubColor}cc)` : "#1a2235",
                    border: "none", cursor: digSub ? "pointer" : "not-allowed",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
                    color: digSub ? "#fff" : "#6B7280",
                    boxShadow: digSub ? `0 4px 20px ${DIG_SUBS.find(d=>d.key===digSub)?.glow}` : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {digSub ? `Continue with ${DIG_SUBS.find(d => d.key === digSub)?.label} →` : "Select a type to continue"}
                </button>
              </>
            )}
          </div>
        )}

        {/* ── STEP 2: Details ── */}
        {step === 2 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "#F0F4FF" }}>Product Details</h2>
              <span style={{ background: prodType === "digital" ? `${digSubColor}20` : "rgba(79,142,247,0.12)", color: prodType === "digital" ? digSubColor : "#4F8EF7", borderRadius: 8, padding: "3px 12px", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700 }}>
                {prodType === "physical" ? "🔧 Physical" : `${DIG_SUBS.find(d => d.key === digSub)?.label}`}
              </span>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280", marginBottom: 24 }}>Fill in the details for your listing.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28 }}>
              {/* Left form */}
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                <label style={label}>Product Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder={prodType === "physical" ? "e.g. MacBook Pro M2 2023 — Space Gray" : digSub === "notes" ? "e.g. GATE 2024 Complete Notes — ECE" : digSub === "video" ? "e.g. Data Structures Full Course" : "e.g. Semester 4 Complete Pack"}
                  style={input} />

                <label style={{ ...label, marginTop: 16 }}>Description</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)}
                  placeholder={prodType === "physical" ? "Describe the condition, usage, any defects..." : "Describe what's included, topics covered, number of pages/videos..."}
                  rows={4}
                  style={{ ...input, height: "auto", resize: "vertical", padding: "10px 16px", lineHeight: 1.6 }} />

                {/* Physical-only fields */}
                {prodType === "physical" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
                    <div>
                      <label style={label}>Category</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} style={input}>
                        {["Electronics","Books","Clothing","Stationery","Equipment","Other"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={label}>Condition</label>
                      <select value={condition} onChange={e => setCondition(e.target.value)} style={input}>
                        {["Brand New","Like New","Good","Fair"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* Digital-only fields */}
                {prodType === "digital" && (
                  <div style={{ marginTop: 16 }}>
                    {(digSub === "notes" || digSub === "both" || digSub === "bundle") && (
                      <>
                        <label style={label}>Subject / Topic</label>
                        <input placeholder="e.g. Digital Signal Processing, GATE ECE" style={{ ...input, marginBottom: 14 }} />
                        <label style={label}>Number of Pages / Files</label>
                        <input placeholder="e.g. 120 pages, 5 PDFs" style={input} />
                      </>
                    )}
                    {(digSub === "video" || digSub === "both" || digSub === "bundle") && (
                      <div style={{ marginTop: 16 }}>
                        <label style={label}>Number of Videos / Duration</label>
                        <input placeholder="e.g. 24 videos, ~8 hours total" style={input} />
                      </div>
                    )}
                    {digSub === "bundle" && (
                      <div style={{ marginTop: 16 }}>
                        <label style={label}>Bundle Contents</label>
                        <input placeholder="e.g. 5 subjects, 200 pages + 30 videos" style={input} />
                      </div>
                    )}
                  </div>
                )}

                {/* Prices */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
                  {prodType === "physical" && (
                    <div>
                      <label style={label}>Original Price (₹)</label>
                      <input value={origPrice} onChange={e => setOrigPrice(e.target.value)} placeholder="25000" style={input} />
                    </div>
                  )}
                  <div style={prodType === "digital" ? { gridColumn: "1 / -1" } : {}}>
                    <label style={label}>Selling Price (₹) *</label>
                    <input value={sellPrice} onChange={e => setSellPrice(e.target.value)} placeholder={prodType === "digital" ? "e.g. 199" : "18000"}
                      style={{ ...input, borderColor: sellPrice ? "#4F8EF7" : "#1e2d45", boxShadow: sellPrice ? "0 0 0 3px rgba(79,142,247,0.12)" : "none" }} />
                  </div>
                </div>

                {/* Upload */}
                <div style={{ marginTop: 24 }}>
                  <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#F0F4FF", marginBottom: 12 }}>
                    {prodType === "physical" ? "Product Photos" : "Upload Files"}
                  </p>
                  <div
                    style={{ border: "2px dashed #1e2d45", borderRadius: 12, height: 130, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", background: "#111827", transition: "border-color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#4F8EF7")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#1e2d45")}
                  >
                    <Upload size={22} style={{ color: "#6B7280" }} />
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF" }}>
                      {prodType === "physical" ? "Click to upload photos" : "Upload PDFs / Videos"}
                    </p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#374151" }}>
                      {prodType === "physical" ? "PNG, JPG or WEBP — Max 5MB" : "PDF, MP4, ZIP — Max 500MB"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right panel */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <FeeCalc price={sellPrice} isDigital={prodType === "digital"} />
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
                >Continue to Review →</button>
                <button onClick={saveDraft} style={{ width: "100%", height: 38, borderRadius: 9999, background: "transparent", border: "1px solid #1e2d45", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280", cursor: "pointer" }}>
                  💾 Save as Draft
                </button>
                <button onClick={() => setStep(1)} style={{ background: "transparent", border: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#374151", cursor: "pointer", textAlign: "center" }}>
                  ← Change product type
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Review & Pay ── */}
        {step === 3 && (
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: "#F0F4FF", marginBottom: 6 }}>Review &amp; Pay</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280", marginBottom: 24 }}>Check your listing before publishing.</p>

            <div style={{ background: "#111827", border: "1.5px solid #1e2d45", borderRadius: 14, padding: "20px 22px", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 10, background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
                  {prodType === "physical" ? "🔧" : digSub === "notes" ? "📄" : digSub === "video" ? "🎥" : digSub === "both" ? "📦" : "🗂️"}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#F0F4FF", marginBottom: 4 }}>{title || "Your Product"}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6B7280" }}>{prodType === "physical" ? category : DIG_SUBS.find(d => d.key === digSub)?.label}</span>
                    {prodType === "physical" && <><span style={{ color: "#6B7280", fontSize: 11 }}>•</span><span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6B7280" }}>{condition}</span></>}
                  </div>
                </div>
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#10B981" }}>₹{sellPrice || "—"}</span>
              </div>
              <div style={{ height: 1, background: "#1e2d45", marginBottom: 16 }} />
              <FeeCalc price={sellPrice} isDigital={prodType === "digital"} />
            </div>

            <div style={{ background: "#111827", border: "1.5px solid #1e2d45", borderRadius: 14, padding: "20px 22px" }}>
              <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#F0F4FF", marginBottom: 4 }}>
                Listing Fee: <span style={{ color: "#F7C948" }}>₹{prodType === "digital" ? "20" : "50"}</span>
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6B7280", marginBottom: 20 }}>This fee ensures only genuine sellers list products.</p>
              <button onClick={openPayModal} style={{ width: "100%", height: 50, borderRadius: 9999, background: "linear-gradient(90deg, #1a6fff, #4F8EF7)", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 4px 20px rgba(79,142,247,0.35)" }}>
                <span style={{ fontSize: 18 }}>💳</span> Pay ₹{listFee} Listing Fee &amp; Publish
              </button>
            </div>

            <button onClick={saveDraft} style={{ marginTop: 12, background: "transparent", border: "1.5px solid #1e2d45", height:44, width:"100%", borderRadius:9999, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280", cursor: "pointer" }}>
              💾 Save as Draft
            </button>

            <button onClick={() => setStep(2)} style={{ marginTop: 16, background: "transparent", border: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280", cursor: "pointer" }}>
              ← Back to Details
            </button>
          </div>
        )}
        </>)}
      </div>
    </StudentLayout>
  );
}
