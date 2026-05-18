"use client";
import { useState } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/StudentLayout";
import { Heart, Trash2, ShoppingCart, Search, Check } from "lucide-react";

const INITIAL_WISHLIST = [
  { id:1, icon:"💻", bg:"linear-gradient(135deg,#0d2040,#1e3a5f)", title:"Dell Latitude i5 Laptop",     type:"Physical", price:"₹18,000", priceN:18000, seller:"Rahul S.",  rating:4.8, status:"Available" },
  { id:2, icon:"📄", bg:"linear-gradient(135deg,#1a0d30,#2d1b4e)", title:"GATE 2024 ECE Complete Notes", type:"PDF",      price:"₹299",    priceN:299,   seller:"Arjun M.", rating:4.9, status:"Available" },
  { id:3, icon:"🎥", bg:"linear-gradient(135deg,#0a1f20,#1b3040)", title:"Advanced DSP Full Course",     type:"Video",    price:"₹499",    priceN:499,   seller:"Priya K.", rating:4.7, status:"Sold Out" },
  { id:4, icon:"📚", bg:"linear-gradient(135deg,#1a0d0d,#2d1818)", title:"Engineering Drawing Kit",      type:"Physical", price:"₹450",    priceN:450,   seller:"Sneha P.", rating:4.5, status:"Available" },
  { id:6, icon:"🐍", bg:"linear-gradient(135deg,#0a1f15,#122b1e)", title:"Python ML Bootcamp 2024",      type:"Video",    price:"₹799",    priceN:799,   seller:"Dev G.",   rating:5.0, status:"Available" },
];

const TYPE_COLOR: Record<string,{bg:string;color:string}> = {
  Physical:{ bg:"rgba(79,142,247,0.12)",  color:"#4F8EF7" },
  PDF:     { bg:"rgba(167,139,250,0.12)", color:"#A78BFA" },
  Video:   { bg:"rgba(16,185,129,0.12)",  color:"#10B981" },
};

export default function WishlistPage() {
  const [items, setItems] = useState(INITIAL_WISHLIST);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [sortBy, setSortBy] = useState("Added");

  function showToast(msg: string) { setToast(msg); setTimeout(()=>setToast(""),3000); }

  function remove(id: number) {
    setItems(is => is.filter(i => i.id !== id));
    showToast("Removed from wishlist");
  }

  function clearAll() {
    setItems([]);
    showToast("Wishlist cleared");
  }

  const filtered = items
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => sortBy==="Price: Low to High" ? a.priceN-b.priceN : sortBy==="Price: High to Low" ? b.priceN-a.priceN : sortBy==="Rating" ? b.rating-a.rating : 0);

  const totalVal = items.reduce((s,i)=>s+i.priceN,0);

  return (
    <StudentLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .wl-page{animation:fadeUp .4s ease}
        .wl-card{transition:all 0.22s}
        .wl-card:hover{border-color:rgba(239,68,68,0.3)!important;transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,0.3)!important}
      `}</style>

      {toast && (
        <div style={{position:"fixed",top:20,right:24,zIndex:999,background:"#111827",border:"1px solid #1e2d45",color:"#F0F4FF",borderRadius:12,padding:"12px 20px",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",display:"flex",alignItems:"center",gap:8}}>
          <Check size={14} style={{color:"#10B981"}}/> {toast}
        </div>
      )}

      <div className="wl-page" style={{padding:"28px 32px",maxWidth:1100}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:28,flexWrap:"wrap",gap:16}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <Heart size={22} style={{color:"#EF4444",fill:"#EF4444"}}/>
              <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,color:"#F0F4FF"}}>My Wishlist</h1>
              <span style={{background:"rgba(239,68,68,0.1)",color:"#EF4444",borderRadius:9999,padding:"2px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700}}>{items.length} items</span>
            </div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#6B7280"}}>Save items to buy later. Total wishlist value: <strong style={{color:"#10B981"}}>₹{totalVal.toLocaleString("en-IN")}</strong></p>
          </div>
          <div style={{display:"flex",gap:10}}>
            {items.length > 0 && <button onClick={clearAll} style={{height:38,padding:"0 16px",borderRadius:9999,background:"transparent",border:"1.5px solid rgba(239,68,68,0.3)",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#EF4444",cursor:"pointer"}}>Clear All</button>}
            <Link href="/marketplace" style={{textDecoration:"none"}}>
              <button style={{height:38,padding:"0 18px",borderRadius:9999,background:"#4F8EF7",border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer",boxShadow:"0 4px 16px rgba(79,142,247,0.3)"}}>+ Browse More</button>
            </Link>
          </div>
        </div>

        {/* Search + Sort */}
        {items.length > 0 && (
          <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:200,position:"relative"}}>
              <Search size={14} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"#6B7280",pointerEvents:"none"}}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search wishlist..." style={{width:"100%",height:42,paddingLeft:40,background:"#111827",border:"1.5px solid #1e2d45",borderRadius:10,color:"#F0F4FF",fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{height:42,padding:"0 14px",background:"#111827",border:"1.5px solid #1e2d45",borderRadius:10,color:"#9CA3AF",fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none",cursor:"pointer"}}>
              {["Added","Price: Low to High","Price: High to Low","Rating"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 && (
          <div style={{textAlign:"center",padding:"80px 24px"}}>
            <div style={{fontSize:64,marginBottom:16}}>💔</div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:"#F0F4FF",marginBottom:8}}>Wishlist is empty</h2>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"#6B7280",marginBottom:24}}>Browse the marketplace and save items you like!</p>
            <Link href="/marketplace" style={{textDecoration:"none"}}>
              <button style={{height:44,padding:"0 28px",borderRadius:9999,background:"#4F8EF7",border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,color:"#fff",cursor:"pointer"}}>Browse Marketplace →</button>
            </Link>
          </div>
        )}

        {/* Grid */}
        {filtered.length > 0 && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:20}}>
            {filtered.map(item=>{
              const tc = TYPE_COLOR[item.type] || TYPE_COLOR.Physical;
              const available = item.status === "Available";
              return (
                <div key={item.id} className="wl-card" style={{background:"#111827",border:"1px solid #1e2d45",borderRadius:16,overflow:"hidden",position:"relative"}}>
                  {/* Remove button */}
                  <button onClick={()=>remove(item.id)} title="Remove from wishlist" style={{position:"absolute",top:10,right:10,zIndex:2,width:30,height:30,borderRadius:9999,background:"rgba(0,0,0,0.5)",border:"1px solid rgba(239,68,68,0.3)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#EF4444"}}>
                    <Trash2 size={12}/>
                  </button>

                  {/* Card top */}
                  <div style={{height:140,background:item.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,position:"relative"}}>
                    <span style={{fontSize:48}}>{item.icon}</span>
                    {!available && (
                      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <span style={{background:"#EF4444",color:"#fff",borderRadius:9999,padding:"4px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:800}}>SOLD OUT</span>
                      </div>
                    )}
                  </div>

                  <div style={{padding:"14px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                      <span style={{background:tc.bg,color:tc.color,borderRadius:5,padding:"2px 8px",fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:700}}>{item.type}</span>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#6B7280"}}>⭐ {item.rating}</span>
                    </div>
                    <p style={{fontFamily:"'Sora',sans-serif",fontSize:14,fontWeight:700,color:"#F0F4FF",marginBottom:3,lineHeight:1.3}}>{item.title}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#6B7280",marginBottom:12}}>by {item.seller}</p>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                      <span style={{fontFamily:"'Sora',sans-serif",fontSize:17,fontWeight:800,color:"#10B981"}}>{item.price}</span>
                      <Link href={`/marketplace/product/${item.id}`} style={{textDecoration:"none"}}>
                        <button disabled={!available} style={{height:34,padding:"0 14px",borderRadius:9999,background:available?"#4F8EF7":"#1a2235",border:"none",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:available?"#fff":"#374151",cursor:available?"pointer":"not-allowed",display:"flex",alignItems:"center",gap:5,boxShadow:available?"0 3px 12px rgba(79,142,247,0.3)":"none"}}>
                          <ShoppingCart size={11}/> Buy Now
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && items.length > 0 && (
          <div style={{textAlign:"center",padding:"60px 0"}}>
            <span style={{fontSize:40}}>🔍</span>
            <p style={{fontFamily:"'Sora',sans-serif",fontSize:17,fontWeight:700,color:"#F0F4FF",marginTop:12}}>No matches in wishlist</p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
