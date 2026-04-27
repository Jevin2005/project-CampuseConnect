"use client";
import { useState } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/StudentLayout";
import { Pencil, Trash2, Download, Eye, ShoppingBag, BarChart3, IndianRupee, Plus, TrendingUp } from "lucide-react";

const LISTINGS = [
  { id:"L001", emoji:"💻", title:"MacBook Pro M2 2023",       type:"Physical", price:35000, status:"Active",         views:450, sales:0 },
  { id:"L002", emoji:"📄", title:"GATE ECE Notes 2024",       type:"Digital",  price:199,   status:"Pending Review", views:12,  sales:0, note:"Awaiting admin approval" },
  { id:"L003", emoji:"🥼", title:"Lab Coat (XL)",              type:"Physical", price:500,   status:"Sold",           views:88,  sales:1 },
  { id:"L004", emoji:"📚", title:"Engineering Mechanics Vol 1",type:"Physical", price:450,   status:"Active",         views:67,  sales:0 },
  { id:"L005", emoji:"🎥", title:"DSP Video Course",           type:"Digital",  price:499,   status:"Active",         views:230, sales:3 },
];
const TABS = ["All","Active","Pending Review","Sold","Removed"] as const;
type Tab = typeof TABS[number];
const S: Record<string,{bg:string;color:string;border:string}> = {
  "Active":         {bg:"#0d2e1f",color:"#10B981",border:"#10B98133"},
  "Pending Review": {bg:"#2e1f0d",color:"#F59E0B",border:"#F59E0B33"},
  "Sold":           {bg:"#0d1e2e",color:"#4F8EF7", border:"#4F8EF733"},
  "Removed":        {bg:"#2e0d0d",color:"#EF4444",border:"#EF444433"},
};

function Stat({icon,label,value,sub,c}:{icon:React.ReactNode;label:string;value:string|number;sub?:string;c:string}){
  return(
    <div style={{background:"#111827",border:"1px solid #1e2d45",borderRadius:14,padding:"22px",flex:1,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:14,right:14,width:32,height:32,borderRadius:9999,background:`${c}15`,display:"flex",alignItems:"center",justifyContent:"center",color:c}}>{icon}</div>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"1px",color:"#6B7280",marginBottom:8,textTransform:"uppercase"}}>{label}</p>
      <p style={{fontFamily:"'Sora',sans-serif",fontSize:28,fontWeight:800,color:"#F0F4FF",lineHeight:1}}>{value}</p>
      {sub&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:c,marginTop:6}}>{sub}</p>}
    </div>
  );
}

export default function MyListingsPage(){
  const [tab,setTab]=useState<Tab>("All");
  const filtered=LISTINGS.filter(l=>tab==="All"||l.status===tab);
  return(
    <StudentLayout>
      <div style={{padding:"28px 32px",maxWidth:1200}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:28}}>
          <div>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,color:"#F0F4FF",marginBottom:4}}>My Listings</h1>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#6B7280"}}>Manage and track your marketplace activities.</p>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button style={{height:38,padding:"0 16px",borderRadius:9999,background:"#1a2235",border:"1px solid #1e2d45",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#9CA3AF",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
              <Download size={13}/> Export CSV
            </button>
            <Link href="/marketplace/sell" style={{textDecoration:"none"}}>
              <button style={{height:38,padding:"0 16px",borderRadius:9999,background:"#4F8EF7",border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:6,boxShadow:"0 4px 14px rgba(79,142,247,0.3)"}}>
                <Plus size={13}/> Create New Listing
              </button>
            </Link>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}}>
          <Stat icon={<Eye size={16}/>}        label="Active Listings" value="8"       sub="+12% this month"  c="#4F8EF7"/>
          <Stat icon={<BarChart3 size={16}/>}  label="Total Views"     value="1,240"   sub="+4.3k this week"  c="#A78BFA"/>
          <Stat icon={<ShoppingBag size={16}/>}label="Total Sales"     value="5"       sub="All time"         c="#10B981"/>
          <Stat icon={<IndianRupee size={16}/>}label="Revenue Earned"  value="₹12,450" sub="After platform fee" c="#F7C948"/>
        </div>

        <div style={{display:"flex",gap:4,marginBottom:20}}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{height:34,padding:"0 16px",borderRadius:9999,background:tab===t?"#4F8EF7":"#111827",border:`1px solid ${tab===t?"#4F8EF7":"#1e2d45"}`,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:tab===t?700:500,color:tab===t?"#fff":"#6B7280",cursor:"pointer",transition:"all 0.15s"}}>{t}</button>
          ))}
        </div>

        <div style={{background:"#111827",border:"1px solid #1e2d45",borderRadius:14,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 80px 80px 100px",background:"#1a2235",padding:"12px 20px"}}>
            {["PRODUCT","TYPE","PRICE","STATUS","VIEWS","SALES","ACTIONS"].map(h=>(
              <span key={h} style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:700,letterSpacing:"1px",color:"#6B7280",textTransform:"uppercase"}}>{h}</span>
            ))}
          </div>

          {filtered.length===0?(
            <div style={{padding:"60px 24px",textAlign:"center"}}>
              <p style={{fontSize:40,marginBottom:12}}>📦</p>
              <p style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:700,color:"#F0F4FF",marginBottom:6}}>No products listed yet</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#6B7280",marginBottom:20}}>Start selling to your MIT College community</p>
              <Link href="/marketplace/sell" style={{textDecoration:"none"}}>
                <button style={{height:40,padding:"0 24px",borderRadius:9999,background:"#4F8EF7",border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer"}}>List Your First Product →</button>
              </Link>
            </div>
          ):filtered.map((l,i)=>{
            const st=S[l.status]||S["Active"];
            return(
              <div key={l.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 80px 80px 100px",padding:"14px 20px",borderBottom:"1px solid #1e2d45",background:l.status==="Pending Review"?"rgba(245,158,11,0.03)":i%2===0?"transparent":"rgba(255,255,255,0.01)",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:8,background:"#1a2235",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{l.emoji}</div>
                  <div>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:"#F0F4FF",marginBottom:2}}>{l.title}</p>
                    {l.note?<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#F59E0B"}}>⚠ {l.note}</p>
                           :<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#374151"}}>ID #{l.id}</p>}
                  </div>
                </div>
                <span style={{display:"inline-flex",alignItems:"center",gap:4,background:l.type==="Digital"?"#1a0d2e":"#0d1e2e",color:l.type==="Digital"?"#A78BFA":"#4F8EF7",border:`1px solid ${l.type==="Digital"?"#7C3AED33":"#4F8EF733"}`,borderRadius:9999,padding:"3px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700}}>
                  {l.type==="Digital"?"📄":"🔧"} {l.type}
                </span>
                <span style={{fontFamily:"'Sora',sans-serif",fontSize:13,fontWeight:700,color:"#10B981"}}>₹{l.price.toLocaleString("en-IN")}</span>
                <span style={{display:"inline-block",background:st.bg,color:st.color,border:`1px solid ${st.border}`,borderRadius:9999,padding:"3px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700}}>{l.status}</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#9CA3AF"}}>{l.views}</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#9CA3AF"}}>{l.sales}</span>
                <div style={{display:"flex",gap:6}}>
                  <button style={{width:30,height:30,borderRadius:6,background:"transparent",border:"1px solid rgba(79,142,247,0.3)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#4F8EF7"}}><Pencil size={13}/></button>
                  <button style={{width:30,height:30,borderRadius:6,background:"transparent",border:"1px solid rgba(239,68,68,0.3)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#EF4444"}}><Trash2 size={13}/></button>
                </div>
              </div>
            );
          })}

          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",background:"#0d1120"}}>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#6B7280"}}>Showing {filtered.length} of 8 listings</span>
            <div style={{display:"flex",gap:4}}>
              {["‹","1","2","›"].map((p,i)=>(
                <button key={i} style={{width:30,height:30,borderRadius:6,background:p==="1"?"#4F8EF7":"#1a2235",border:`1px solid ${p==="1"?"#4F8EF7":"#1e2d45"}`,fontFamily:"'DM Sans',sans-serif",fontSize:12,color:p==="1"?"#fff":"#6B7280",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:16,padding:"12px 16px",background:"rgba(79,142,247,0.05)",border:"1px solid rgba(79,142,247,0.1)",borderRadius:10}}>
          <TrendingUp size={14} style={{color:"#4F8EF7"}}/>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#6B7280"}}>Your listings got <strong style={{color:"#F0F4FF"}}>1,240 views</strong> this month — <strong style={{color:"#10B981"}}> +12%</strong> vs last month.</p>
        </div>
      </div>
    </StudentLayout>
  );
}
