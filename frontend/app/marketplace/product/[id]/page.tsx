"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Star, ShieldCheck, MessageCircle, ShoppingBag, Heart, Share2, Check, X, Send } from "lucide-react";
import { StudentLayout } from "@/components/StudentLayout";

const THUMBNAILS = ["💻", "🔌", "⌨️", "🖥️"];

export default function PhysicalProductPage() {
  const [mainThumb, setMainThumb]   = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [toast, setToast]           = useState("");
  const [showRequest, setShowRequest] = useState(false);
  const [reqMsg, setReqMsg]           = useState("");
  const [reqSent, setReqSent]         = useState(false);
  const [showChat, setShowChat]       = useState(false);
  const [chatMsg, setChatMsg]         = useState("");
  const [chatSent, setChatSent]       = useState(false);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  function handleWishlist() {
    setWishlisted(w => !w);
    showToast(wishlisted ? "Removed from wishlist" : "Added to wishlist ❤️");
  }

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    showToast("Link copied to clipboard! 🔗");
  }

  function sendRequest() {
    if (!reqMsg.trim()) return;
    setReqSent(true);
    setTimeout(() => { setShowRequest(false); setReqSent(false); setReqMsg(""); showToast("Request sent! Seller will respond shortly. 📬"); }, 1400);
  }

  function sendChat() {
    if (!chatMsg.trim()) return;
    setChatSent(true);
    setTimeout(() => { setShowChat(false); setChatSent(false); setChatMsg(""); showToast("Message sent to seller! 💬"); }, 1500);
  }

  return (
    <StudentLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes modalIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
        .pd-page{animation:fadeUp .35s ease}
        .thumb:hover{border-color:#4F8EF7!important}
        .buy-btn:hover{background:#3b7de8!important;transform:translateY(-1px);box-shadow:0 6px 24px rgba(79,142,247,0.45)!important}
        .chat-btn:hover{border-color:#4F8EF7!important;color:#4F8EF7!important}
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",top:20,right:24,zIndex:1000,background:"#111827",border:"1px solid #1e2d45",color:"#F0F4FF",borderRadius:12,padding:"12px 20px",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",display:"flex",alignItems:"center",gap:8}}>
          <Check size={14} style={{color:"#10B981"}}/> {toast}
        </div>
      )}

      {/* Send Request Modal */}
      {showRequest && (
        <div onClick={()=>setShowRequest(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#111827",border:"1.5px solid #1e2d45",borderRadius:20,padding:"28px 32px",maxWidth:420,width:"90%",animation:"modalIn 0.25s ease"}}>
            {!reqSent ? (<>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:800,color:"#F0F4FF"}}>Send Buy Request</h2>
                <button onClick={()=>setShowRequest(false)} style={{background:"none",border:"none",cursor:"pointer",color:"#6B7280"}}><X size={18}/></button>
              </div>
              {/* Product summary */}
              <div style={{display:"flex",alignItems:"center",gap:10,background:"#0d1120",borderRadius:10,padding:"12px 14px",marginBottom:16}}>
                <span style={{fontSize:28}}>💻</span>
                <div style={{flex:1}}>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#F0F4FF"}}>Apple MacBook Pro 14&quot;</p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#6B7280"}}>Seller: James Wilson · ₹18,000</p>
                </div>
              </div>
              {/* Info note */}
              <div style={{background:"rgba(247,201,72,0.06)",border:"1px solid rgba(247,201,72,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",gap:8,alignItems:"flex-start"}}>
                <span style={{fontSize:16,flexShrink:0}}>ℹ️</span>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#9CA3AF",lineHeight:1.5}}>
                  <strong style={{color:"#F7C948"}}>No payment needed here.</strong> Payment happens in person on campus after the seller accepts your request.
                </p>
              </div>
              {/* Quick prompts */}
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#6B7280",marginBottom:8}}>Quick messages:</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                {["Is this still available?","Can we meet on campus?","Is the price negotiable?"].map(q=>(
                  <button key={q} onClick={()=>setReqMsg(q)} style={{background:"#1a2235",border:"1.5px solid #1e2d45",borderRadius:8,padding:"6px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#9CA3AF",cursor:"pointer"}}>{q}</button>
                ))}
              </div>
              <textarea value={reqMsg} onChange={e=>setReqMsg(e.target.value)} placeholder="Write your message to the seller…" rows={3} style={{width:"100%",background:"#1a2235",border:"1.5px solid #1e2d45",borderRadius:10,padding:"10px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#F0F4FF",outline:"none",resize:"none",boxSizing:"border-box",marginBottom:12}}/>
              <button onClick={sendRequest} disabled={!reqMsg.trim()} style={{width:"100%",height:46,borderRadius:9999,background:reqMsg.trim()?"#4F8EF7":"#1a2235",border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,color:reqMsg.trim()?"#fff":"#374151",cursor:reqMsg.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:reqMsg.trim()?"0 4px 16px rgba(79,142,247,0.35)":"none",transition:"all 0.2s"}}>
                <Send size={15}/> Send Request to Seller
              </button>
            </>) : (
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{fontSize:56,marginBottom:12}}>📬</div>
                <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:800,color:"#10B981",marginBottom:6}}>Request Sent!</h2>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#9CA3AF"}}>Notifying the seller…</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Seller Modal */}
      {showChat && (
        <div onClick={()=>setShowChat(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#111827",border:"1.5px solid #1e2d45",borderRadius:20,padding:"28px 32px",maxWidth:400,width:"90%",animation:"modalIn 0.25s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:800,color:"#F0F4FF"}}>Message Seller</h2>
              <button onClick={()=>setShowChat(false)} style={{background:"none",border:"none",cursor:"pointer",color:"#6B7280"}}><X size={18}/></button>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,background:"#0d1120",borderRadius:10,padding:"12px 14px",marginBottom:16}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#4F8EF7,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:800,color:"#fff"}}>JW</div>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#F0F4FF"}}>James Wilson</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#6B7280"}}>MIT College · Usually replies in 2h</p>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
              {["Is this still available?","Can we meet on campus?","Is the price negotiable?"].map(q=>(
                <button key={q} onClick={()=>setChatMsg(q)} style={{textAlign:"left",background:"#1a2235",border:"1.5px solid #1e2d45",borderRadius:8,padding:"8px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#9CA3AF",cursor:"pointer"}}>
                  {q}
                </button>
              ))}
            </div>
            <textarea value={chatMsg} onChange={e=>setChatMsg(e.target.value)} placeholder="Type your message..." rows={3} style={{width:"100%",background:"#1a2235",border:"1.5px solid #1e2d45",borderRadius:10,padding:"10px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#F0F4FF",outline:"none",resize:"none",boxSizing:"border-box",marginBottom:12}}/>
            <button onClick={sendChat} disabled={chatSent} style={{width:"100%",height:44,borderRadius:9999,background:chatSent?"#10B981":"#4F8EF7",border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"background 0.2s"}}>
              {chatSent ? <><Check size={14}/>Sent!</> : "Send Message"}
            </button>
          </div>
        </div>
      )}

      <div className="pd-page" style={{maxWidth:1100,margin:"0 auto",padding:"24px 32px"}}>

        {/* Breadcrumb */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:28}}>
          {[["Marketplace","/marketplace"],["Electronics","#"],["MacBook Pro","#"]].map(([b,href],i)=>(
            <span key={b} style={{display:"flex",alignItems:"center",gap:8}}>
              {i>0 && <ChevronRight size={12} style={{color:"#374151"}}/>}
              <Link href={href} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:i===2?"#F0F4FF":"#6B7280",fontWeight:i===2?600:400,textDecoration:"none"}}>{b}</Link>
            </span>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 380px",gap:40}}>

          {/* LEFT */}
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{background:"rgba(16,185,129,0.15)",color:"#10B981",borderRadius:6,padding:"4px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700}}>For Sale</span>
              <div style={{display:"flex",gap:8}}>
                <button onClick={handleWishlist} style={{width:36,height:36,borderRadius:9999,background:wishlisted?"rgba(239,68,68,0.12)":"#111827",border:`1.5px solid ${wishlisted?"rgba(239,68,68,0.4)":"#1e2d45"}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
                  <Heart size={15} style={{color:wishlisted?"#EF4444":"#6B7280",fill:wishlisted?"#EF4444":"none"}}/>
                </button>
                <button onClick={handleShare} style={{width:36,height:36,borderRadius:9999,background:"#111827",border:"1.5px solid #1e2d45",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Share2 size={14} style={{color:"#6B7280"}}/>
                </button>
              </div>
            </div>

            <div style={{borderRadius:14,overflow:"hidden",background:"#1e3a5f",height:340,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,border:"1.5px solid #1e2d45"}}>
              <span style={{fontSize:80}}>{THUMBNAILS[mainThumb]}</span>
            </div>

            <div style={{display:"flex",gap:10,marginBottom:32}}>
              {THUMBNAILS.map((t,i)=>(
                <div key={i} className="thumb" onClick={()=>setMainThumb(i)} style={{width:72,height:64,borderRadius:10,background:"#111827",border:`1.5px solid ${mainThumb===i?"#4F8EF7":"#1e2d45"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,cursor:"pointer",transition:"border-color 0.15s"}}>{t}</div>
              ))}
            </div>

            <div style={{borderTop:"1px solid #1e2d45",paddingTop:28}}>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:700,color:"#F0F4FF",marginBottom:14}}>About this product</h2>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"#9CA3AF",lineHeight:1.75,marginBottom:20}}>
                Purchased just 4 months ago for my Computer Science finals. This MacBook Pro M2 is in pristine condition, with absolutely no scratches. Used primarily for coding and light browsing. Comes with original box and all accessories.
              </p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px 24px",marginBottom:20}}>
                {[{label:"MODEL",value:"MacBook Pro 14\" (M2 Pro)"},{label:"SPECS",value:"16GB RAM / 512GB SSD"},{label:"CYCLE COUNT",value:"42 Cycles (healthy)"},{label:"WARRANTY",value:"AppleCare+ until Sept 2025"}].map(s=>(
                  <div key={s.label}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:700,letterSpacing:"1px",color:"#374151",marginBottom:4}}>{s.label}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#9CA3AF"}}>{s.value}</p>
                  </div>
                ))}
              </div>
              <span style={{background:"rgba(79,142,247,0.12)",color:"#4F8EF7",borderRadius:6,padding:"4px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600}}>Like New Condition</span>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"flex",gap:8}}>
              <span style={{background:"rgba(79,142,247,0.12)",color:"#4F8EF7",borderRadius:6,padding:"4px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700}}>🔧 Physical</span>
              <span style={{background:"rgba(16,185,129,0.12)",color:"#10B981",borderRadius:6,padding:"4px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700}}>✅ Available</span>
            </div>

            <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:"#F0F4FF",letterSpacing:"-0.5px",lineHeight:1.3}}>
              Apple MacBook Pro 14&quot; (M2 Pro, 2023) — Space Gray
            </h1>

            {/* Seller card */}
            <div style={{background:"#111827",border:"1.5px solid #1e2d45",borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#4F8EF7,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:800,color:"#fff"}}>JW</div>
              <div style={{flex:1}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,color:"#F0F4FF"}}>James Wilson</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#6B7280"}}>MIT College, 3rd Year</p>
                <div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}>
                  <Star size={12} style={{color:"#F7C948",fill:"#F7C948"}}/>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#F7C948"}}>4.8</span>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#6B7280"}}>• 12 sold</span>
                </div>
              </div>
              <Link href="#" style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"#4F8EF7",textDecoration:"none"}}>Profile</Link>
            </div>

            {/* Price card */}
            <div style={{background:"#111827",border:"1.5px solid #1e2d45",borderRadius:12,padding:"18px 20px"}}>
              {[{label:"Price:",value:"₹18,000"},{label:"Platform fee:",value:"₹0 (buyer)"}].map(r=>(
                <div key={r.label} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#6B7280"}}>{r.label}</span>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#9CA3AF"}}>{r.value}</span>
                </div>
              ))}
              <div style={{height:1,background:"#1e2d45",margin:"10px 0"}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"#9CA3AF"}}>You pay:</span>
                <span style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,color:"#10B981"}}>₹18,000</span>
              </div>
            </div>

            {/* Send Request Button */}
            <button onClick={()=>setShowRequest(true)} style={{width:"100%",height:48,borderRadius:9999,background:"#4F8EF7",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 16px rgba(79,142,247,0.35)",transition:"all 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.background="#3b7de8"}
              onMouseLeave={e=>e.currentTarget.style.background="#4F8EF7"}>
              <ShoppingBag size={16}/> Send Buy Request
            </button>

            {/* Contact Seller */}
            <button className="chat-btn" onClick={()=>setShowChat(true)} style={{width:"100%",height:46,borderRadius:9999,background:"transparent",border:"1.5px solid #1e2d45",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:600,color:"#9CA3AF",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 0.15s"}}>
              <MessageCircle size={16}/> Contact Seller
            </button>

            {/* Safety note */}
            <div style={{background:"rgba(16,185,129,0.05)",border:"1px solid rgba(16,185,129,0.15)",borderRadius:10,padding:"12px 14px",display:"flex",gap:10,alignItems:"flex-start"}}>
              <ShieldCheck size={16} style={{color:"#10B981",flexShrink:0,marginTop:2}}/>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#6B7280",lineHeight:1.6}}>
                <strong style={{color:"#10B981"}}>CampusConnect Safety Guarantee.</strong>{" "}
                Payment held securely and released after you confirm receipt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
