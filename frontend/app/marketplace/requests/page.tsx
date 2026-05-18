"use client";
import { useState } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/StudentLayout";
import { Check, X, MessageCircle, Clock, Package, ChevronRight } from "lucide-react";

type ReqStatus = "pending" | "accepted" | "rejected";

interface Request {
  id: string;
  buyerName: string;
  buyerInitials: string;
  buyerCollege: string;
  product: string;
  productIcon: string;
  price: string;
  message: string;
  time: string;
  status: ReqStatus;
}

const INITIAL_REQUESTS: Request[] = [
  {
    id:"R001", buyerName:"Ananya Iyer",    buyerInitials:"AI", buyerCollege:"EE '25",
    product:"MacBook Pro M2 2023", productIcon:"💻", price:"₹35,000",
    message:"Hi! Is this still available? I'm interested and can meet on campus this week.",
    time:"2 min ago", status:"pending",
  },
  {
    id:"R002", buyerName:"Vikram Nair",    buyerInitials:"VN", buyerCollege:"CS '24",
    product:"GATE ECE Notes 2024", productIcon:"📄", price:"₹199",
    message:"Can I get a preview before buying? Also is this for 2024 exam?",
    time:"18 min ago", status:"pending",
  },
  {
    id:"R003", buyerName:"Priya Sharma",   buyerInitials:"PS", buyerCollege:"MA '26",
    product:"Engineering Mechanics Vol 1", productIcon:"📚", price:"₹450",
    message:"Would you take ₹400? I'm a first year and this book is needed urgently.",
    time:"1 hr ago", status:"accepted",
  },
  {
    id:"R004", buyerName:"Rohan Gupta",    buyerInitials:"RG", buyerCollege:"ME '25",
    product:"MacBook Pro M2 2023", productIcon:"💻", price:"₹35,000",
    message:"I have cash ready. When can we meet at the library?",
    time:"3 hr ago", status:"rejected",
  },
];

const STATUS_STYLE: Record<ReqStatus, { bg: string; color: string; label: string }> = {
  pending:  { bg:"rgba(245,158,11,0.1)",  color:"#F59E0B", label:"⏳ Pending"  },
  accepted: { bg:"rgba(16,185,129,0.1)",  color:"#10B981", label:"✅ Accepted" },
  rejected: { bg:"rgba(239,68,68,0.1)",   color:"#EF4444", label:"❌ Rejected" },
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>(INITIAL_REQUESTS);
  const [filter, setFilter]     = useState<"all"|ReqStatus>("all");
  const [toast, setToast]       = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(()=>setToast(""), 3000); }

  function accept(id: string) {
    setRequests(rs => rs.map(r => r.id===id ? {...r, status:"accepted"} : r));
    showToast("Request accepted! Chat thread opened in Inbox.");
  }
  function reject(id: string) {
    setRequests(rs => rs.map(r => r.id===id ? {...r, status:"rejected"} : r));
    showToast("Request declined.");
  }

  const filtered = filter==="all" ? requests : requests.filter(r=>r.status===filter);
  const pendingCount = requests.filter(r=>r.status==="pending").length;

  return (
    <StudentLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .rq-page{animation:fadeUp .4s ease}
        .rq-card{transition:all 0.2s}
        .rq-card:hover{border-color:rgba(79,142,247,0.35)!important;transform:translateY(-1px)}
        .accept-btn:hover{background:#059669!important}
        .reject-btn:hover{background:rgba(239,68,68,0.15)!important;border-color:#EF4444!important;color:#EF4444!important}
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",top:20,right:24,zIndex:999,background:"#111827",border:"1px solid #1e2d45",color:"#F0F4FF",borderRadius:12,padding:"12px 20px",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",display:"flex",alignItems:"center",gap:8}}>
          <Check size={14} style={{color:"#10B981"}}/> {toast}
        </div>
      )}

      <div className="rq-page" style={{padding:"28px 32px", maxWidth:900}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:28,flexWrap:"wrap",gap:16}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <Package size={22} style={{color:"#4F8EF7"}}/>
              <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,color:"#F0F4FF"}}>Buy Requests</h1>
              {pendingCount > 0 && (
                <span style={{background:"#EF4444",color:"#fff",borderRadius:9999,padding:"2px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700}}>{pendingCount} new</span>
              )}
            </div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#6B7280"}}>Interested buyers will send you requests. Accept to start a conversation.</p>
          </div>
          <Link href="/marketplace/inbox" style={{textDecoration:"none"}}>
            <button style={{height:40,padding:"0 18px",borderRadius:9999,background:"#4F8EF7",border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:7,boxShadow:"0 4px 16px rgba(79,142,247,0.3)"}}>
              <MessageCircle size={14}/> Open Inbox
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
          {[
            {label:"Total Requests", value:requests.length, color:"#4F8EF7"},
            {label:"Accepted",       value:requests.filter(r=>r.status==="accepted").length, color:"#10B981"},
            {label:"Pending",        value:pendingCount, color:"#F59E0B"},
          ].map(s=>(
            <div key={s.label} style={{background:"#111827",border:"1px solid #1e2d45",borderRadius:14,padding:"16px 20px"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"1px",color:"#6B7280",textTransform:"uppercase",marginBottom:4}}>{s.label}</p>
              <p style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,color:s.color}}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{display:"flex",gap:8,marginBottom:22}}>
          {(["all","pending","accepted","rejected"] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{height:36,padding:"0 16px",borderRadius:9999,cursor:"pointer",background:filter===f?"#4F8EF7":"transparent",border:`1.5px solid ${filter===f?"#4F8EF7":"#1e2d45"}`,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:filter===f?"#fff":"#6B7280",transition:"all 0.15s",textTransform:"capitalize"}}>
              {f === "all" ? `All (${requests.length})` : `${f.charAt(0).toUpperCase()+f.slice(1)} (${requests.filter(r=>r.status===f).length})`}
            </button>
          ))}
        </div>

        {/* Request Cards */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {filtered.length === 0 && (
            <div style={{textAlign:"center",padding:"60px 0"}}>
              <span style={{fontSize:48}}>📭</span>
              <p style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:700,color:"#F0F4FF",marginTop:12}}>No requests here</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#6B7280",marginTop:4}}>When students are interested in your listings, requests will appear here.</p>
            </div>
          )}
          {filtered.map(req=>{
            const ss = STATUS_STYLE[req.status];
            return (
              <div key={req.id} className="rq-card" style={{background:"#111827",border:"1px solid #1e2d45",borderRadius:16,padding:"20px 24px",transition:"all 0.2s"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:16,flexWrap:"wrap"}}>

                  {/* Buyer Avatar */}
                  <div style={{width:48,height:48,borderRadius:"50%",background:"linear-gradient(135deg,#4F8EF7,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:800,color:"#fff",flexShrink:0}}>
                    {req.buyerInitials}
                  </div>

                  {/* Content */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4,flexWrap:"wrap"}}>
                      <p style={{fontFamily:"'Sora',sans-serif",fontSize:15,fontWeight:700,color:"#F0F4FF"}}>{req.buyerName}</p>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#6B7280"}}>{req.buyerCollege}</span>
                      <span style={{background:ss.bg,color:ss.color,borderRadius:9999,padding:"2px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700}}>{ss.label}</span>
                    </div>

                    {/* Product info */}
                    <div style={{display:"flex",alignItems:"center",gap:8,background:"#0d1120",borderRadius:8,padding:"8px 12px",marginBottom:10,width:"fit-content"}}>
                      <span style={{fontSize:18}}>{req.productIcon}</span>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#9CA3AF"}}>{req.product}</span>
                      <ChevronRight size={12} style={{color:"#374151"}}/>
                      <span style={{fontFamily:"'Sora',sans-serif",fontSize:13,fontWeight:700,color:"#10B981"}}>{req.price}</span>
                    </div>

                    {/* Message */}
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#9CA3AF",lineHeight:1.5,marginBottom:8,fontStyle:"italic"}}>
                      &ldquo;{req.message}&rdquo;
                    </p>

                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <Clock size={11} style={{color:"#374151"}}/>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#374151"}}>{req.time}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{display:"flex",flexDirection:"column",gap:8,flexShrink:0}}>
                    {req.status === "pending" ? (<>
                      <button className="accept-btn" onClick={()=>accept(req.id)} style={{height:38,padding:"0 18px",borderRadius:9999,background:"#10B981",border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:6,boxShadow:"0 3px 12px rgba(16,185,129,0.3)",transition:"background 0.15s"}}>
                        <Check size={13}/> Accept
                      </button>
                      <button className="reject-btn" onClick={()=>reject(req.id)} style={{height:38,padding:"0 18px",borderRadius:9999,background:"transparent",border:"1.5px solid #1e2d45",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#6B7280",cursor:"pointer",display:"flex",alignItems:"center",gap:6,transition:"all 0.15s"}}>
                        <X size={13}/> Decline
                      </button>
                    </>) : req.status === "accepted" ? (
                      <Link href={`/marketplace/inbox?thread=${req.id}`} style={{textDecoration:"none"}}>
                        <button style={{height:38,padding:"0 18px",borderRadius:9999,background:"rgba(79,142,247,0.1)",border:"1.5px solid rgba(79,142,247,0.3)",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#4F8EF7",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                          <MessageCircle size={13}/> Open Chat
                        </button>
                      </Link>
                    ) : (
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#374151",padding:"8px 14px",background:"rgba(239,68,68,0.06)",borderRadius:8,border:"1px solid rgba(239,68,68,0.15)"}}>❌ Declined</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </StudentLayout>
  );
}
