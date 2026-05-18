"use client";
import { useState } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/StudentLayout";
import { ShieldCheck, Bell, Mail, Save, ChevronRight, TrendingUp, Package, ShoppingBag, Calendar } from "lucide-react";

const LISTINGS_PREVIEW = [
  { icon:"💻", title:"MacBook Pro M2 2023",         price:"₹35,000", status:"Active",  views:450 },
  { icon:"📄", title:"GATE ECE Notes 2024",          price:"₹199",    status:"Pending", views:12  },
  { icon:"🎥", title:"DSP Video Course",             price:"₹499",    status:"Active",  views:230 },
];
const PURCHASES_PREVIEW = [
  { icon:"🎧", title:"Sony WH-1000XM4",     sub:"Dec 10, 2024",     price:"₹18,000" },
  { icon:"📚", title:"Calculus II Textbook",sub:"Nov 28, 2024",      price:"₹1,200"  },
  { icon:"📝", title:"Algorithm Notes PDF", sub:"Nov 10, 2024",      price:"₹249"    },
];

const NOTIFS = [
  { id:"n1", icon:<Mail size={13}/>,    label:"Email Alerts",        val:true  },
  { id:"n2", icon:<Bell size={13}/>,    label:"Marketplace Updates", val:true  },
  { id:"n3", icon:<Bell size={13}/>,    label:"Purchase Receipts",   val:false },
];

export default function ProfilePage() {
  const [name,     setName]     = useState("Rahul Sharma");
  const [editing,  setEditing]  = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [notifs,   setNotifs]   = useState<Record<string,boolean>>({ n1:true, n2:true, n3:false });

  const handleSave = () => { setSaved(true); setEditing(false); setTimeout(()=>setSaved(false),3000); };

  const Toggle = ({ id, val }: { id:string; val:boolean }) => (
    <button onClick={() => setNotifs(n => ({ ...n, [id]:!n[id] }))} style={{ width:44, height:24, borderRadius:9999, background: notifs[id] ? "#4F8EF7":"#1a2235", border:"none", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:4, left: notifs[id] ? 22:4, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }} />
    </button>
  );

  return (
    <StudentLayout>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes toast{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .pp{animation:fadeUp .4s ease}
        .preview-row:hover{background:#1e2d45!important}
      `}</style>

      <div className="pp" style={{ padding:"28px 32px", maxWidth:1100 }}>

        {/* Profile Hero */}
        <div style={{ background:"linear-gradient(135deg,#0d1829,#111827,#0a1f15)", border:"1px solid #1e2d45", borderRadius:20, padding:"28px 32px", marginBottom:24, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-60, right:-60, width:250, height:250, borderRadius:"50%", background:"rgba(79,142,247,0.06)", pointerEvents:"none" }} />
          <div style={{ display:"flex", alignItems:"center", gap:22, flexWrap:"wrap" }}>
            <div style={{ width:76, height:76, borderRadius:"50%", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:"#fff", boxShadow:"0 0 0 4px rgba(79,142,247,0.2)", flexShrink:0 }}>RS</div>
            <div style={{ flex:1, minWidth:0 }}>
              <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:"#F0F4FF", marginBottom:4 }}>Rahul Sharma</h1>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#6B7280", marginBottom:8 }}>MIT College of Engineering · Computer Science · Class of 2024</p>
              <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"#9CA3AF" }}>rahul.sharma@mit.edu</span>
                <span style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:9999, padding:"2px 10px", fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, color:"#10B981" }}>
                  <ShieldCheck size={10}/>VERIFIED STUDENT
                </span>
              </div>
            </div>
            <button onClick={() => setEditing(e=>!e)} style={{ height:38, padding:"0 20px", borderRadius:9999, background:"#1a2235", border:"1.5px solid #1e2d45", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, color:"#9CA3AF", cursor:"pointer", flexShrink:0 }}>
              {editing ? "Cancel" : "✏️ Edit Profile"}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
          {[
            { icon:<Package size={18}/>,      label:"Listed",      value:"8",        color:"#4F8EF7"  },
            { icon:<TrendingUp size={18}/>,   label:"Sold",        value:"5",        color:"#10B981"  },
            { icon:<ShoppingBag size={18}/>,  label:"Purchased",   value:"14",       color:"#A78BFA"  },
            { icon:<Calendar size={18}/>,     label:"Member Since", value:"Aug '22", color:"#F7C948"  },
          ].map(s => (
            <div key={s.label} style={{ background:"#111827", border:"1px solid #1e2d45", borderRadius:14, padding:"18px 20px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:`${s.color}15`, display:"flex", alignItems:"center", justifyContent:"center", color:s.color, flexShrink:0 }}>{s.icon}</div>
              <div>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, letterSpacing:"1px", color:"#6B7280", textTransform:"uppercase", marginBottom:4 }}>{s.label}</p>
                <p style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800, color:"#F0F4FF" }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 2-col section */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>
          {/* Active Listings */}
          <div style={{ background:"#111827", border:"1px solid #1e2d45", borderRadius:16, padding:"20px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700, color:"#F0F4FF" }}>My Active Listings</h2>
              <Link href="/marketplace/listings" style={{ textDecoration:"none", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#4F8EF7" }}>View All</Link>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {LISTINGS_PREVIEW.map(l => (
                <div key={l.title} className="preview-row" style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", background:"#1a2235", borderRadius:10, cursor:"pointer", transition:"background 0.15s" }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:"#111827", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{l.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, color:"#F0F4FF", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.title}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#6B7280" }}>{l.price} · 👁 {l.views}</p>
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:9999, background: l.status==="Active" ? "rgba(16,185,129,0.1)":"rgba(245,158,11,0.1)", color: l.status==="Active" ? "#10B981":"#F59E0B" }}>{l.status}</span>
                  <ChevronRight size={14} style={{ color:"#374151", flexShrink:0 }} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Purchases */}
          <div style={{ background:"#111827", border:"1px solid #1e2d45", borderRadius:16, padding:"20px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700, color:"#F0F4FF" }}>Recent Purchases</h2>
              <Link href="/marketplace/purchases" style={{ textDecoration:"none", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#4F8EF7" }}>View All</Link>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {PURCHASES_PREVIEW.map(p => (
                <div key={p.title} className="preview-row" style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", background:"#1a2235", borderRadius:10, transition:"background 0.15s" }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:"#111827", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{p.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, color:"#F0F4FF", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.title}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#6B7280" }}>{p.sub}</p>
                  </div>
                  <span style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700, color:"#10B981", flexShrink:0 }}>{p.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div style={{ background:"#111827", border:"1px solid #1e2d45", borderRadius:16, padding:"24px" }}>
          <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:700, color:"#F0F4FF", marginBottom:22 }}>⚙️ Account Settings</h2>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32 }}>
            {/* Name edit */}
            <div>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700, letterSpacing:"1px", color:"#6B7280", marginBottom:8, textTransform:"uppercase" }}>Display Name</p>
              <input
                value={name} onChange={e => setName(e.target.value)} disabled={!editing}
                style={{ width:"100%", background: editing ? "#1a2235":"#111827", border:`1.5px solid ${editing ? "#4F8EF7":"#1e2d45"}`, borderRadius:10, padding:"10px 14px", fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"#F0F4FF", outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" }}
              />
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#374151", marginTop:6 }}>Visible to other students in the marketplace.</p>
              {editing && (
                <button onClick={handleSave} style={{ marginTop:12, height:36, padding:"0 20px", borderRadius:9999, background:"#4F8EF7", border:"none", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                  <Save size={13}/>Save Changes
                </button>
              )}
            </div>

            {/* Notifications */}
            <div>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700, letterSpacing:"1px", color:"#6B7280", marginBottom:8, textTransform:"uppercase" }}>Notification Preferences</p>
              {NOTIFS.map(n => (
                <div key={n.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 0", borderBottom:"1px solid #1e2d45" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, color:"#9CA3AF" }}>
                    {n.icon}
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>{n.label}</span>
                  </div>
                  <Toggle id={n.id} val={notifs[n.id]} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {saved && (
        <div style={{ position:"fixed", bottom:28, right:28, background:"#10B981", color:"#fff", padding:"14px 22px", borderRadius:12, fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:700, boxShadow:"0 4px 20px rgba(16,185,129,0.4)", display:"flex", alignItems:"center", gap:8, zIndex:50, animation:"toast .3s ease" }}>
          ✓ Profile updated!
        </div>
      )}
    </StudentLayout>
  );
}
