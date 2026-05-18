"use client";
import { useState } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/StudentLayout";
import { AdStrip } from "@/components/AdBanner";
import { OWN_COLLEGE_ADS, CROSS_COLLEGE_ADS } from "@/lib/adsData";
import { Pencil, Trash2, Download, Eye, BarChart3, IndianRupee, Plus, TrendingUp, ShoppingBag } from "lucide-react";

const LISTINGS = [
  { id:"L001", icon:"💻", title:"MacBook Pro M2 2023",        type:"Physical", cat:"Electronics", price:35000, status:"Active",         views:450, sales:0, earnings:0    },
  { id:"L002", icon:"📄", title:"GATE ECE Notes 2024",        type:"Digital",  cat:"Notes PDF",  price:199,   status:"Pending Review", views:12,  sales:0, note:"Awaiting admin approval" },
  { id:"L003", icon:"🥼", title:"Lab Coat (XL)",              type:"Physical", cat:"Equipment",  price:500,   status:"Sold",           views:88,  sales:1, earnings:475   },
  { id:"L004", icon:"📚", title:"Engineering Mechanics Vol 1",type:"Physical", cat:"Books",      price:450,   status:"Active",         views:67,  sales:0, earnings:0    },
  { id:"L005", icon:"🎥", title:"DSP Video Course",           type:"Digital",  cat:"Video",      price:499,   status:"Active",         views:230, sales:3, earnings:1422  },
];

const TABS = ["All","Active","Pending Review","Sold","Removed"] as const;
type Tab = typeof TABS[number];

const ST: Record<string,{ bg:string; color:string }> = {
  "Active":         { bg:"rgba(16,185,129,0.1)",  color:"#10B981" },
  "Pending Review": { bg:"rgba(245,158,11,0.1)",  color:"#F59E0B" },
  "Sold":           { bg:"rgba(79,142,247,0.1)",  color:"#4F8EF7" },
  "Removed":        { bg:"rgba(239,68,68,0.1)",   color:"#EF4444" },
};

const TYPE_STYLE: Record<string,{ bg:string; color:string }> = {
  "Digital":  { bg:"rgba(167,139,250,0.12)", color:"#A78BFA" },
  "Physical": { bg:"rgba(79,142,247,0.12)",  color:"#4F8EF7" },
};

export default function MyListingsPage() {
  const [tab, setTab] = useState<Tab>("All");
  const [hov, setHov] = useState<string|null>(null);
  const filtered = LISTINGS.filter(l => tab === "All" || l.status === tab);

  const totals = {
    active:   LISTINGS.filter(l => l.status === "Active").length,
    views:    LISTINGS.reduce((s,l) => s+l.views, 0),
    sales:    LISTINGS.reduce((s,l) => s+l.sales, 0),
    earnings: LISTINGS.reduce((s,l) => s+(l.earnings||0), 0),
  };

  return (
    <StudentLayout>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .lp{animation:fadeUp .4s ease}
        .row:hover{background:rgba(79,142,247,0.025)!important;border-bottom-color:rgba(79,142,247,0.15)!important}
      `}</style>

      <div className="lp" style={{ padding:"28px 32px", maxWidth:1200 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:16 }}>
          <div>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:26, fontWeight:800, color:"#F0F4FF", marginBottom:4 }}>My Listings</h1>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#6B7280" }}>Track and manage your marketplace products</p>
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <button style={{ height:38, padding:"0 16px", borderRadius:9999, background:"transparent", border:"1.5px solid #1e2d45", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#9CA3AF", cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}>
              <Download size={13} />Export CSV
            </button>
            <Link href="/marketplace/sell" style={{ textDecoration:"none" }}>
              <button style={{ height:38, padding:"0 18px", borderRadius:9999, background:"#10B981", border:"none", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:7, boxShadow:"0 4px 16px rgba(16,185,129,0.3)" }}>
                <Plus size={14} />New Listing
              </button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
          {[
            { icon:<Eye size={16}/>,         label:"Active Listings", value:totals.active,                             color:"#4F8EF7",  sub:"live now"        },
            { icon:<BarChart3 size={16}/>,   label:"Total Views",     value:totals.views.toLocaleString(),             color:"#A78BFA",  sub:"all products"    },
            { icon:<ShoppingBag size={16}/>, label:"Total Sales",     value:totals.sales,                              color:"#10B981",  sub:"all time"        },
            { icon:<IndianRupee size={16}/>, label:"Revenue Earned",  value:`₹${totals.earnings.toLocaleString("en-IN")}`, color:"#F7C948",  sub:"after 5% fee"  },
          ].map(s => (
            <div key={s.label} style={{ background:"#111827", border:"1px solid #1e2d45", borderRadius:14, padding:"20px 22px", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:9999, background:`${s.color}15`, display:"flex", alignItems:"center", justifyContent:"center", color:s.color }}>{s.icon}</div>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, letterSpacing:"1px", color:"#6B7280", textTransform:"uppercase", marginBottom:8 }}>{s.label}</p>
              <p style={{ fontFamily:"'Sora',sans-serif", fontSize:26, fontWeight:800, color:"#F0F4FF", lineHeight:1, marginBottom:4 }}>{s.value}</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:s.color }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
          {TABS.map(t => {
            const cnt = t === "All" ? LISTINGS.length : LISTINGS.filter(l=>l.status===t).length;
            return (
              <button key={t} onClick={() => setTab(t)} style={{
                height:36, padding:"0 16px", borderRadius:9999, cursor:"pointer",
                background: tab===t ? "#4F8EF7" : "transparent",
                border:`1.5px solid ${tab===t ? "#4F8EF7" : "#1e2d45"}`,
                fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight: tab===t ? 700:500,
                color: tab===t ? "#fff" : "#6B7280", transition:"all 0.18s",
                display:"flex", alignItems:"center", gap:6,
              }}>
                {t}
                <span style={{ background: tab===t ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)", borderRadius:9999, padding:"0 7px", fontSize:11 }}>{cnt}</span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div style={{ background:"#111827", border:"1px solid #1e2d45", borderRadius:16, overflow:"hidden" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2.2fr 0.9fr 1fr 1fr 70px 70px 110px", background:"#1a2235", padding:"12px 22px", gap:8 }}>
            {["Product","Type","Price","Status","Views","Sales","Actions"].map(h => (
              <span key={h} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, letterSpacing:"1px", color:"#6B7280", textTransform:"uppercase" }}>{h}</span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding:"60px 24px", textAlign:"center" }}>
              <span style={{ fontSize:48 }}>📦</span>
              <p style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:700, color:"#F0F4FF", marginTop:12, marginBottom:4 }}>No products here</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#6B7280", marginBottom:20 }}>Start selling to your campus community</p>
              <Link href="/marketplace/sell" style={{ textDecoration:"none" }}>
                <button style={{ height:40, padding:"0 24px", borderRadius:9999, background:"#10B981", border:"none", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>List Your First Product →</button>
              </Link>
            </div>
          ) : filtered.map(l => {
            const st = ST[l.status] || ST["Active"];
            const ts = TYPE_STYLE[l.type];
            return (
              <div key={l.id} className="row" style={{ display:"grid", gridTemplateColumns:"2.2fr 0.9fr 1fr 1fr 70px 70px 110px", padding:"14px 22px", borderBottom:"1px solid #1e2d45", alignItems:"center", gap:8, transition:"all 0.15s", background: hov===l.id ? "rgba(79,142,247,0.02)" : "transparent" }}
                onMouseEnter={() => setHov(l.id)} onMouseLeave={() => setHov(null)}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:38, height:38, borderRadius:9, background:"#1a2235", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{l.icon}</div>
                  <div>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, color:"#F0F4FF", marginBottom:2 }}>{l.title}</p>
                    {l.note
                      ? <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:"#F59E0B" }}>⚠ {l.note}</p>
                      : <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#374151" }}>#{l.id} · {l.cat}</p>}
                  </div>
                </div>
                <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:ts.bg, color:ts.color, borderRadius:9999, padding:"4px 10px", fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700, width:"fit-content" }}>
                  {l.type === "Digital" ? "📄" : "🔧"} {l.type}
                </span>
                <span style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700, color:"#10B981" }}>₹{l.price.toLocaleString("en-IN")}</span>
                <span style={{ display:"inline-block", background:st.bg, color:st.color, borderRadius:9999, padding:"4px 12px", fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700, width:"fit-content" }}>{l.status}</span>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#9CA3AF" }}>{l.views.toLocaleString()}</span>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#9CA3AF" }}>{l.sales}</span>
                <div style={{ display:"flex", gap:6 }}>
                  <button style={{ width:32, height:32, borderRadius:8, background:"transparent", border:"1px solid rgba(79,142,247,0.3)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#4F8EF7" }}><Pencil size={13}/></button>
                  <button style={{ width:32, height:32, borderRadius:8, background:"transparent", border:"1px solid rgba(239,68,68,0.3)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#EF4444" }}><Trash2 size={13}/></button>
                </div>
              </div>
            );
          })}

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 22px", background:"#0d1120" }}>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#6B7280" }}>Showing {filtered.length} of {LISTINGS.length} listings</span>
            <div style={{ display:"flex", gap:4 }}>
              {["‹","1","2","›"].map((p,i) => (
                <button key={i} style={{ width:32, height:32, borderRadius:7, background: p==="1" ? "#4F8EF7":"transparent", border:`1px solid ${p==="1" ? "#4F8EF7":"#1e2d45"}`, fontFamily:"'DM Sans',sans-serif", fontSize:12, color: p==="1" ? "#fff":"#6B7280", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Insight bar */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:16, padding:"12px 18px", background:"rgba(79,142,247,0.05)", border:"1px solid rgba(79,142,247,0.12)", borderRadius:12 }}>
          <TrendingUp size={14} style={{ color:"#4F8EF7", flexShrink:0 }} />
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#6B7280" }}>
            Your listings got <strong style={{ color:"#F0F4FF" }}>{totals.views.toLocaleString()} views</strong> this month — boost your sales by sharing on campus groups 📣
          </p>
        </div>

        {/* ── Ad Section ── */}
        <div style={{ marginTop:24 }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:700, letterSpacing:"1.4px", color:"#374151", textTransform:"uppercase", marginBottom:10 }}>📢 ADVERTISEMENTS</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <AdStrip ad={{
              ...OWN_COLLEGE_ADS[0],
              subtitle: "Zenith Tech Fest 2024 — Register before Dec 20. ₹5L prize pool!",
              dismissible: true,
            }} />
            <AdStrip ad={{
              ...CROSS_COLLEGE_ADS[0],
              subtitle: "Inter-college Hackathon — VIT × MIT × PCCOE. ₹2L prizes. Open to all!",
              dismissible: true,
            }} />
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
