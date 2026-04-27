"use client";
import { useState } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/StudentLayout";
import { ShieldCheck, ChevronRight, Bell, Mail, Save, AlertTriangle } from "lucide-react";

const LISTINGS_PREVIEW = [
  { emoji:"💻", title:"MacBook Pro M2 2023",        price:"₹35,000", views:"450 Views" },
  { emoji:"📚", title:"Engineering Mechanics Vol 1", price:"₹45.00",  views:"24 Views"  },
  { emoji:"🥼", title:"Chemistry Lab Coat (XL)",     price:"₹25.00",  views:"8 Views"   },
];
const PURCHASES_PREVIEW = [
  { emoji:"🎧", title:"Sony WH-1000XM4",    sub:"Bought 2 days ago • ₹18,000", status:"Delivered" },
  { emoji:"📚", title:"Calculus II Textbook",sub:"Bought 1 week ago • ₹12.00", status:"Delivered" },
  { emoji:"📝", title:"Algorithm Notes",     sub:"Bought 2 weeks ago • ₹5.00", status:"Delivered" },
];

const STATS = [
  { label:"Products Listed",  value:"8" },
  { label:"Products Sold",    value:"5",       color:"#10B981" },
  { label:"Items Purchased",  value:"14" },
  { label:"Member Since",     value:"Aug 2022" },
];

export default function ProfilePage(){
  const [displayName, setDisplayName] = useState("Rahul Sharma");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [mktUpdates, setMktUpdates] = useState(true);
  const [receipts,   setReceipts]   = useState(false);
  const [editing,    setEditing]    = useState(false);
  const [saved,      setSaved]      = useState(false);

  const handleSave = () => { setSaved(true); setEditing(false); setTimeout(()=>setSaved(false), 3000); };

  return(
    <StudentLayout>
      <div style={{padding:"28px 32px",maxWidth:1100}}>

        {/* Profile card */}
        <div style={{background:"#111827",border:"1px solid #1e2d45",borderRadius:20,padding:"28px",marginBottom:24,position:"relative",overflow:"hidden"}}>
          {/* Blob bg */}
          <div style={{position:"absolute",top:-80,right:-80,width:300,height:300,borderRadius:"50%",background:"rgba(79,142,247,0.05)",pointerEvents:"none"}}/>
          <div style={{display:"flex",alignItems:"center",gap:20}}>
            <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#4F8EF7,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:"#fff",flexShrink:0,boxShadow:"0 0 0 4px rgba(79,142,247,0.2)"}}>RS</div>
            <div style={{flex:1,minWidth:0}}>
              <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,color:"#F0F4FF",marginBottom:2}}>Rahul Sharma</h1>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#6B7280",marginBottom:6}}>MIT College of Engineering | Class of 2024</p>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#9CA3AF"}}>rahul.sharma@mit.edu</span>
                <span style={{display:"flex",alignItems:"center",gap:4,background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:9999,padding:"2px 8px",fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:700,color:"#10B981"}}>
                  <ShieldCheck size={10}/> VERIFIED
                </span>
              </div>
            </div>
            <button
              onClick={()=>setEditing(e=>!e)}
              style={{height:38,padding:"0 20px",borderRadius:9999,background:"#1a2235",border:"1.5px solid #1e2d45",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#9CA3AF",cursor:"pointer",flexShrink:0,transition:"all 0.15s"}}>
              {editing?"Cancel":"Edit Profile"}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
          {STATS.map(s=>(
            <div key={s.label} style={{background:"#111827",border:"1px solid #1e2d45",borderRadius:14,padding:"18px 20px"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:700,letterSpacing:"1.5px",color:"#6B7280",marginBottom:8,textTransform:"uppercase"}}>{s.label}</p>
              <p style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,color:s.color||"#F0F4FF"}}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Two columns */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
          {/* My Active Listings */}
          <div style={{background:"#111827",border:"1px solid #1e2d45",borderRadius:14,padding:"20px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:15,fontWeight:700,color:"#F0F4FF"}}>My Active Listings</h2>
              <Link href="/marketplace/listings" style={{textDecoration:"none",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#4F8EF7"}}>View All</Link>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {LISTINGS_PREVIEW.map(l=>(
                <div key={l.title} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:"#1a2235",borderRadius:10,cursor:"pointer"}}>
                  <div style={{width:34,height:34,borderRadius:8,background:"#111827",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{l.emoji}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:"#F0F4FF",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.title}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#6B7280"}}>{l.price} • {l.views}</p>
                  </div>
                  <ChevronRight size={14} style={{color:"#374151",flexShrink:0}}/>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Purchases */}
          <div style={{background:"#111827",border:"1px solid #1e2d45",borderRadius:14,padding:"20px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:15,fontWeight:700,color:"#F0F4FF"}}>Recent Purchases</h2>
              <Link href="/marketplace/purchases" style={{textDecoration:"none",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#4F8EF7"}}>View All</Link>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {PURCHASES_PREVIEW.map(p=>(
                <div key={p.title} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:"#1a2235",borderRadius:10}}>
                  <div style={{width:34,height:34,borderRadius:8,background:"#111827",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{p.emoji}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:"#F0F4FF",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#6B7280"}}>{p.sub}</p>
                  </div>
                  <span style={{background:"#0d1e2e",color:"#4F8EF7",border:"1px solid #4F8EF733",borderRadius:9999,padding:"2px 8px",fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:700,flexShrink:0}}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div style={{background:"#111827",border:"1px solid #1e2d45",borderRadius:14,padding:"24px"}}>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:700,color:"#F0F4FF",marginBottom:20}}>Account Settings</h2>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32}}>
            {/* Display name */}
            <div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"1px",color:"#6B7280",marginBottom:8,textTransform:"uppercase"}}>Display Name</p>
              <input
                value={displayName}
                onChange={e=>setDisplayName(e.target.value)}
                disabled={!editing}
                style={{width:"100%",background:editing?"#1a2235":"#111827",border:`1.5px solid ${editing?"#4F8EF7":"#1e2d45"}`,borderRadius:10,padding:"10px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"#F0F4FF",outline:"none",boxSizing:"border-box",transition:"border-color 0.15s"}}
              />
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#374151",marginTop:6}}>This is how your name will appear to other students in the marketplace.</p>
              {editing&&(
                <button onClick={handleSave} style={{marginTop:12,height:36,padding:"0 20px",borderRadius:9999,background:"#4F8EF7",border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                  <Save size={13}/> Save Changes
                </button>
              )}
            </div>

            {/* Notifications */}
            <div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"1px",color:"#6B7280",marginBottom:8,textTransform:"uppercase"}}>Notification Preferences</p>
              {[
                {label:"Email Alerts",           icon:<Mail size={13}/>,  val:emailAlerts, set:setEmailAlerts},
                {label:"Marketplace Updates",     icon:<Bell size={13}/>,  val:mktUpdates,  set:setMktUpdates},
                {label:"Purchase Receipts",       icon:<Mail size={13}/>,  val:receipts,    set:setReceipts},
              ].map(n=>(
                <div key={n.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #1e2d45"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,color:"#9CA3AF"}}>
                    {n.icon}
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13}}>{n.label}</span>
                  </div>
                  <button onClick={()=>n.set(v=>!v)} style={{width:40,height:22,borderRadius:9999,background:n.val?"#4F8EF7":"#1a2235",border:"none",cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
                    <div style={{position:"absolute",top:3,left:n.val?20:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{marginTop:20,paddingTop:20,borderTop:"1px solid #1e2d45",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#374151"}}>Update your password or privacy settings in the advanced panel.</p>
            <button style={{height:36,padding:"0 20px",borderRadius:9999,background:"rgba(239,68,68,0.08)",border:"1.5px solid rgba(239,68,68,0.25)",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:"#EF4444",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
              <AlertTriangle size={13}/> Delete Account
            </button>
          </div>
        </div>

        {/* Toast */}
        {saved&&(
          <div style={{position:"fixed",bottom:28,right:28,background:"#10B981",color:"#fff",padding:"14px 22px",borderRadius:12,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,boxShadow:"0 4px 20px rgba(16,185,129,0.4)",display:"flex",alignItems:"center",gap:8,zIndex:50}}>
            ✓ Profile updated successfully
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
