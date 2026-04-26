"use client";
import { useState } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/StudentLayout";
import { ShoppingBag, IndianRupee, Download, FileText, Video, ChevronRight } from "lucide-react";

const PHYSICAL = [
  { id:"O001", emoji:"💻", title:"MacBook Pro M1",    seller:"Rahul Sharma (CS '24)", price:45000, date:"Dec 12, 2024", status:"Pending"   },
  { id:"O002", emoji:"🎧", title:"Sony WH-1000XM4",  seller:"Ananya Iyer (EE '25)",  price:18000, date:"Dec 10, 2024", status:"Confirmed" },
  { id:"O003", emoji:"📚", title:"Calculus II Textbook",seller:"Mark Wood (MA '25)", price:1200,  date:"Nov 28, 2024", status:"Delivered" },
];
const DIGITAL = [
  { id:"D001", emoji:"📄", type:"pdf",   title:"Quantum Mechanics Notes",      seller:"Dr. Smith",         date:"Dec 15, 2024" },
  { id:"D002", emoji:"🎥", type:"video", title:"Advanced Algorithm Visualizer", seller:"Prof. G. Miller",   date:"Dec 12, 2024" },
  { id:"D003", emoji:"📄", type:"pdf",   title:"C++ Design Patterns Guide",     seller:"Rahul Sharma (CS '24)", date:"Dec 08, 2024" },
  { id:"D004", emoji:"📄", type:"pdf",   title:"GATE ECE Notes 2024",           seller:"Priya Nair (ECE '23)",  date:"Nov 20, 2024" },
  { id:"D005", emoji:"🎥", type:"video", title:"DSP Video Full Course",          seller:"Dr. Kumar",         date:"Nov 15, 2024" },
  { id:"D006", emoji:"📄", type:"pdf",   title:"Engineering Maths Vol 2",        seller:"Prof. Sharma",      date:"Oct 30, 2024" },
];
const STSTYLE: Record<string,{bg:string;color:string;border:string}> = {
  Pending:   {bg:"#2e1f0d",color:"#F59E0B",border:"#F59E0B33"},
  Confirmed: {bg:"#0d2e1f",color:"#10B981",border:"#10B98133"},
  Delivered: {bg:"#0d1e2e",color:"#4F8EF7", border:"#4F8EF733"},
};

export default function MyPurchasesPage(){
  const [activeTab,setActiveTab]=useState<"physical"|"digital">("physical");

  const totalSpent = [...PHYSICAL.map(p=>p.price)].reduce((a,b)=>a+b,0);

  return(
    <StudentLayout>
      <div style={{padding:"28px 32px",maxWidth:1200}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:28}}>
          <div>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,color:"#F0F4FF",marginBottom:4}}>My Purchases</h1>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#6B7280",maxWidth:480}}>
              Manage your physical product orders and access your purchased digital study materials from the CampusConnect community.
            </p>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>setActiveTab("physical")} style={{height:38,padding:"0 20px",borderRadius:9999,background:activeTab==="physical"?"#4F8EF7":"#111827",border:`1.5px solid ${activeTab==="physical"?"#4F8EF7":"#1e2d45"}`,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:activeTab==="physical"?"#fff":"#6B7280",cursor:"pointer",transition:"all 0.15s"}}>
              Physical Orders
            </button>
            <button onClick={()=>setActiveTab("digital")} style={{height:38,padding:"0 20px",borderRadius:9999,background:activeTab==="digital"?"#7C3AED":"#111827",border:`1.5px solid ${activeTab==="digital"?"#7C3AED":"#1e2d45"}`,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:activeTab==="digital"?"#fff":"#6B7280",cursor:"pointer",transition:"all 0.15s"}}>
              Digital Content
            </button>
          </div>
        </div>

        {activeTab==="physical" && (
          <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:20,alignItems:"start"}}>
            {/* Sidebar summary */}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{background:"#111827",border:"1px solid #1e2d45",borderRadius:14,padding:20}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:700,letterSpacing:"1.5px",color:"#6B7280",marginBottom:16,textTransform:"uppercase"}}>Summary</p>
                {[
                  {label:"Total Spent",  value:`₹${totalSpent.toLocaleString("en-IN")}`, color:"#10B981"},
                  {label:"Active Orders",value:"2",                                        color:"#4F8EF7"},
                  {label:"Downloads",    value:"14",                                       color:"#A78BFA"},
                ].map(s=>(
                  <div key={s.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#6B7280"}}>{s.label}</span>
                    <span style={{fontFamily:"'Sora',sans-serif",fontSize:14,fontWeight:700,color:s.color}}>{s.value}</span>
                  </div>
                ))}
              </div>
              <div style={{background:"#111827",border:"1px solid #1e2d45",borderRadius:14,padding:20}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:700,letterSpacing:"1.5px",color:"#6B7280",marginBottom:12,textTransform:"uppercase"}}>Quick Filters</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {["All","Pending","Confirmed","Delivered"].map(f=>(
                    <button key={f} style={{padding:"4px 12px",borderRadius:9999,background:"#1a2235",border:"1px solid #1e2d45",fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#6B7280",cursor:"pointer"}}>{f}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Orders list */}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {PHYSICAL.map(o=>{
                const st=STSTYLE[o.status];
                return(
                  <div key={o.id} style={{background:"#111827",border:"1px solid #1e2d45",borderRadius:14,padding:"18px 20px",display:"flex",alignItems:"center",gap:16,transition:"border-color 0.15s"}}>
                    <div style={{width:48,height:48,borderRadius:10,background:"#1a2235",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{o.emoji}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontFamily:"'Sora',sans-serif",fontSize:15,fontWeight:700,color:"#F0F4FF",marginBottom:2}}>{o.title}</p>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#6B7280"}}>Seller: {o.seller}</p>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8}}>
                        <span style={{background:st.bg,color:st.color,border:`1px solid ${st.border}`,borderRadius:9999,padding:"3px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700}}>• {o.status}</span>
                        <button style={{background:"transparent",border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#4F8EF7",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                          View Order Details <ChevronRight size={12}/>
                        </button>
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <p style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:800,color:"#F0F4FF"}}>₹{o.price.toLocaleString("en-IN")}</p>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#374151"}}>{o.date}</p>
                    </div>
                  </div>
                );
              })}
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 16px",background:"rgba(79,142,247,0.04)",border:"1px solid rgba(79,142,247,0.1)",borderRadius:10}}>
                <IndianRupee size={13} style={{color:"#4F8EF7",flexShrink:0}}/>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#6B7280"}}>Total spent across all orders: <strong style={{color:"#F0F4FF"}}>₹{totalSpent.toLocaleString("en-IN")}</strong></p>
                <button style={{marginLeft:"auto",height:28,padding:"0 12px",borderRadius:9999,background:"transparent",border:"1px solid #1e2d45",fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#6B7280",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                  <Download size={11}/> Receipt
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab==="digital" && (
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div>
                <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:700,color:"#F0F4FF"}}>Digital Content Library</h2>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#6B7280"}}>Access your purchased notes and video courses instantly.</p>
              </div>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#6B7280"}}>{DIGITAL.length} items</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
              {DIGITAL.map(d=>(
                <div key={d.id} style={{background:"#111827",border:"1px solid #1e2d45",borderRadius:14,overflow:"hidden",transition:"border-color 0.2s, transform 0.2s"}}>
                  <div style={{height:120,background:d.type==="pdf"?"rgba(124,58,237,0.1)":"rgba(16,185,129,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,borderBottom:"1px solid #1e2d45"}}>
                    {d.emoji}
                  </div>
                  <div style={{padding:"16px"}}>
                    <p style={{fontFamily:"'Sora',sans-serif",fontSize:14,fontWeight:700,color:"#F0F4FF",marginBottom:4}}>{d.title}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#6B7280",marginBottom:10}}>Seller: {d.seller}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#374151",marginBottom:12}}>Purchased: {d.date}</p>
                    <Link href={d.type==="pdf"?"/marketplace/viewer/pdf":"/marketplace/viewer/video"} style={{textDecoration:"none"}}>
                      <button style={{
                        width:"100%",height:36,borderRadius:9999,border:"none",cursor:"pointer",
                        background:d.type==="pdf"?"#7C3AED":"#10B981",
                        fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:"#fff",
                        display:"flex",alignItems:"center",justifyContent:"center",gap:6,
                        boxShadow:`0 4px 12px ${d.type==="pdf"?"rgba(124,58,237,0.3)":"rgba(16,185,129,0.3)"}`,
                      }}>
                        {d.type==="pdf"?<><FileText size={13}/> Open PDF</>:<><Video size={13}/> Watch Video</>}
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div style={{marginTop:20,padding:"12px 16px",background:"rgba(124,58,237,0.05)",border:"1px solid rgba(124,58,237,0.15)",borderRadius:10,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:14}}>🛡️</span>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#6B7280"}}>
                All digital content is <strong style={{color:"#A78BFA"}}>watermarked with your username</strong> and protected by DRM. Do not share access.
              </p>
            </div>
          </div>
        )}

        {/* Browse CTA */}
        <div style={{marginTop:24,padding:"16px 20px",background:"rgba(79,142,247,0.05)",border:"1px solid rgba(79,142,247,0.1)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <ShoppingBag size={16} style={{color:"#4F8EF7"}}/>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#9CA3AF"}}>Looking for more study materials or goods?</p>
          </div>
          <Link href="/marketplace" style={{textDecoration:"none"}}>
            <button style={{height:36,padding:"0 20px",borderRadius:9999,background:"#4F8EF7",border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer"}}>Browse Marketplace →</button>
          </Link>
        </div>
      </div>
    </StudentLayout>
  );
}
