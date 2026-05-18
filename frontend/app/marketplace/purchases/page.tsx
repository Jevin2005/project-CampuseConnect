"use client";
import { useState } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/StudentLayout";
import { AdBannerHorizontal, AdStrip } from "@/components/AdBanner";
import { HOSTEL_ADS, CROSS_COLLEGE_ADS } from "@/lib/adsData";
import { Download, FileText, Video, ShoppingBag, Shield } from "lucide-react";

const PHYSICAL = [
  { id:"O001", icon:"💻", title:"MacBook Pro M1",        seller:"Rahul Sharma", college:"CS '24", price:45000, date:"Dec 12, 2024", status:"Pending"   },
  { id:"O002", icon:"🎧", title:"Sony WH-1000XM4",       seller:"Ananya Iyer",  college:"EE '25", price:18000, date:"Dec 10, 2024", status:"Confirmed" },
  { id:"O003", icon:"📚", title:"Calculus II Textbook",  seller:"Mark Wood",    college:"MA '25", price:1200,  date:"Nov 28, 2024", status:"Delivered" },
];

const DIGITAL = [
  { id:"D001", icon:"📄", type:"pdf",   title:"Quantum Mechanics Notes",       seller:"Dr. Smith",         date:"Dec 15, 2024", pages:48,  size:"4.2 MB" },
  { id:"D002", icon:"🎥", type:"video", title:"Advanced Algorithm Visualizer", seller:"Prof. G. Miller",   date:"Dec 12, 2024", duration:"6h 20m" },
  { id:"D003", icon:"📄", type:"pdf",   title:"C++ Design Patterns Guide",     seller:"Rahul Sharma",      date:"Dec 08, 2024", pages:92,  size:"8.1 MB" },
  { id:"D004", icon:"📄", type:"pdf",   title:"GATE ECE Notes 2024",           seller:"Priya Nair",        date:"Nov 20, 2024", pages:210, size:"18.4 MB" },
  { id:"D005", icon:"🎥", type:"video", title:"DSP Video Full Course",         seller:"Dr. Kumar",         date:"Nov 15, 2024", duration:"12h 45m" },
  { id:"D006", icon:"📄", type:"pdf",   title:"Engineering Maths Vol 2",       seller:"Prof. Sharma",      date:"Oct 30, 2024", pages:156, size:"11.2 MB" },
];

const ST: Record<string,{ bg:string; color:string; label:string }> = {
  Pending:   { bg:"rgba(245,158,11,0.1)",  color:"#F59E0B", label:"⏳ Pending"   },
  Confirmed: { bg:"rgba(16,185,129,0.1)",  color:"#10B981", label:"✅ Confirmed" },
  Delivered: { bg:"rgba(79,142,247,0.1)",  color:"#4F8EF7", label:"📦 Delivered" },
};

export default function MyPurchasesPage() {
  const [tab, setTab] = useState<"physical"|"digital">("physical");
  const totalSpent = PHYSICAL.reduce((s,o) => s + o.price, 0);

  return (
    <StudentLayout>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .pp-page{animation:fadeUp .4s ease}
        .order-card:hover{border-color:rgba(79,142,247,0.4)!important;transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,0.3)}
        .dig-card:hover{border-color:rgba(167,139,250,0.4)!important;transform:translateY(-3px);box-shadow:0 10px 32px rgba(0,0,0,0.35)}
      `}</style>

      <div className="pp-page" style={{ padding:"28px 32px", maxWidth:1200 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:16 }}>
          <div>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:26, fontWeight:800, color:"#F0F4FF", marginBottom:4 }}>My Purchases</h1>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#6B7280" }}>Manage orders &amp; access your digital study library</p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {[
              { key:"physical" as const, icon:"📦", label:"Physical Orders", active:"#4F8EF7" },
              { key:"digital"  as const, icon:"📚", label:"Digital Library",  active:"#A78BFA" },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                height:40, padding:"0 20px", borderRadius:9999, cursor:"pointer",
                background: tab === t.key ? t.active : "transparent",
                border:`1.5px solid ${tab === t.key ? t.active : "#1e2d45"}`,
                fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700,
                color: tab === t.key ? "#fff" : "#6B7280",
                display:"flex", alignItems:"center", gap:7,
                boxShadow: tab === t.key ? `0 4px 20px ${t.active}44` : "none",
                transition:"all 0.2s",
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:28 }}>
          {[
            { icon:"💰", label:"Total Spent",    value:`₹${totalSpent.toLocaleString("en-IN")}`, color:"#10B981" },
            { icon:"📦", label:"Active Orders",  value:"2",  color:"#4F8EF7" },
            { icon:"📚", label:"Digital Items",  value:`${DIGITAL.length}`, color:"#A78BFA" },
          ].map(s => (
            <div key={s.label} style={{ background:"#111827", border:"1px solid #1e2d45", borderRadius:14, padding:"18px 22px", display:"flex", alignItems:"center", gap:14 }}>
              <span style={{ fontSize:28 }}>{s.icon}</span>
              <div>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700, letterSpacing:"1px", color:"#6B7280", textTransform:"uppercase", marginBottom:4 }}>{s.label}</p>
                <p style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, color:s.color }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Physical Orders */}
        {tab === "physical" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {PHYSICAL.map(o => {
              const st = ST[o.status];
              return (
                <div key={o.id} className="order-card" style={{ background:"#111827", border:"1px solid #1e2d45", borderRadius:16, padding:"20px 24px", display:"flex", alignItems:"center", gap:18, transition:"all 0.22s" }}>
                  <div style={{ width:52, height:52, borderRadius:12, background:"#1a2235", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{o.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:700, color:"#F0F4FF", marginBottom:3 }}>{o.title}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#6B7280", marginBottom:10 }}>Seller: {o.seller} · {o.college}</p>
                    <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                      <span style={{ background:st.bg, color:st.color, borderRadius:9999, padding:"4px 12px", fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700 }}>{st.label}</span>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#374151" }}>Order #{o.id}</span>
                      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#374151" }}>📅 {o.date}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <p style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, color:"#F0F4FF", marginBottom:4 }}>₹{o.price.toLocaleString("en-IN")}</p>
                    <button style={{ height:30, padding:"0 14px", borderRadius:9999, background:"transparent", border:"1px solid #1e2d45", fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#4F8EF7", cursor:"pointer" }}>
                      <Download size={11} style={{ display:"inline", marginRight:4 }} />Receipt
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Digital Library */}
        {tab === "digital" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:700, color:"#F0F4FF" }}>📚 Digital Content Library</h2>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#6B7280" }}>{DIGITAL.length} items</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:18 }}>
              {DIGITAL.map(d => (
                <div key={d.id} className="dig-card" style={{ background:"#111827", border:"1px solid #1e2d45", borderRadius:16, overflow:"hidden", transition:"all 0.25s" }}>
                  <div style={{ height:120, background: d.type==="pdf" ? "linear-gradient(135deg,#1a0d30,#2d1b4e)" : "linear-gradient(135deg,#0a1f15,#1b3040)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
                    <span style={{ fontSize:36 }}>{d.icon}</span>
                    <span style={{ fontSize:10, fontWeight:700, color: d.type==="pdf" ? "#A78BFA" : "#10B981", background: d.type==="pdf" ? "rgba(167,139,250,0.15)" : "rgba(16,185,129,0.15)", padding:"2px 10px", borderRadius:9999 }}>
                      {d.type === "pdf" ? "📄 PDF Notes" : "🎥 Video Course"}
                    </span>
                  </div>
                  <div style={{ padding:"14px 16px" }}>
                    <p style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color:"#F0F4FF", marginBottom:3, lineHeight:1.3 }}>{d.title}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#6B7280", marginBottom:4 }}>by {d.seller}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:"#374151", marginBottom:12 }}>
                      {d.type==="pdf" ? `${d.pages} pages · ${d.size}` : `⏱ ${d.duration}`}
                    </p>
                    <Link href={d.type==="pdf" ? "/marketplace/viewer/pdf" : "/marketplace/viewer/video"} style={{ textDecoration:"none" }}>
                      <button style={{
                        width:"100%", height:36, borderRadius:9999, border:"none", cursor:"pointer",
                        background: d.type==="pdf" ? "linear-gradient(90deg,#7C3AED,#A78BFA)" : "linear-gradient(90deg,#059669,#10B981)",
                        fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700, color:"#fff",
                        display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                        boxShadow: d.type==="pdf" ? "0 4px 14px rgba(124,58,237,0.3)" : "0 4px 14px rgba(16,185,129,0.3)",
                      }}>
                        {d.type==="pdf" ? <><FileText size={13}/>Open PDF</> : <><Video size={13}/>Watch Now</>}
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop:20, padding:"14px 18px", background:"rgba(124,58,237,0.05)", border:"1px solid rgba(124,58,237,0.15)", borderRadius:12, display:"flex", alignItems:"center", gap:10 }}>
              <Shield size={15} style={{ color:"#A78BFA", flexShrink:0 }} />
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#6B7280" }}>
                All content is <strong style={{ color:"#A78BFA" }}>watermarked with your student ID</strong> and DRM-protected. Do not share access.
              </p>
            </div>
          </div>
        )}

        {/* Browse CTA */}
        <div style={{ marginTop:28, padding:"18px 24px", background:"linear-gradient(135deg,rgba(79,142,247,0.06),rgba(16,185,129,0.04))", border:"1px solid rgba(79,142,247,0.15)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <ShoppingBag size={18} style={{ color:"#4F8EF7" }} />
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#9CA3AF" }}>Looking for more study materials or campus goods?</p>
          </div>
          <Link href="/marketplace" style={{ textDecoration:"none" }}>
            <button style={{ height:38, padding:"0 22px", borderRadius:9999, background:"#4F8EF7", border:"none", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", boxShadow:"0 4px 16px rgba(79,142,247,0.3)" }}>
              Browse Marketplace →
            </button>
          </Link>
        </div>

        {/* ── Advertisements Section ── */}
        <div style={{ marginTop:32 }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:700, letterSpacing:"1.4px", color:"#374151", textTransform:"uppercase", marginBottom:14 }}>📢 ADVERTISEMENTS FOR YOU</p>

          {/* Hostel Banner */}
          <div style={{ marginBottom:12 }}>
            <AdBannerHorizontal ad={HOSTEL_ADS[1]} />
          </div>

          {/* Cross College Strip */}
          <AdStrip ad={{
            ...CROSS_COLLEGE_ADS[1],
            subtitle: "COEP Techniche 2024 — India’s oldest tech festival. Jan 15–18. All colleges welcome!",
            dismissible: true,
          }} />
        </div>
      </div>
    </StudentLayout>
  );
}
