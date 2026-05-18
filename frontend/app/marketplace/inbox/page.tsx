"use client";
import { useState, useRef, useEffect } from "react";
import { StudentLayout } from "@/components/StudentLayout";
import { Send, Search, Check, CheckCheck, Package, Image as ImageIcon, Paperclip, Smile } from "lucide-react";

interface Message {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
  read: boolean;
}

interface Thread {
  id: string;
  name: string;
  initials: string;
  college: string;
  product: string;
  productIcon: string;
  price: string;
  role: "buyer" | "seller";
  lastMsg: string;
  lastTime: string;
  unread: number;
  status: "active" | "closed" | "deal_done";
  messages: Message[];
}

const INITIAL_THREADS: Thread[] = [
  {
    id:"R001", name:"Ananya Iyer", initials:"AI", college:"EE '25",
    product:"MacBook Pro M2 2023", productIcon:"💻", price:"₹35,000",
    role:"seller", lastMsg:"Sounds good! See you at the library tomorrow at 4 PM.", lastTime:"2m", unread:1,
    status:"active",
    messages:[
      {id:"m1", from:"them", text:"Hi! Is this still available? I'm interested!", time:"10:00 AM", read:true},
      {id:"m2", from:"me",   text:"Yes it is! It's in perfect condition. Want to meet on campus?", time:"10:02 AM", read:true},
      {id:"m3", from:"them", text:"That would be great. Can we meet at the library? I can come anytime this week.", time:"10:05 AM", read:true},
      {id:"m4", from:"me",   text:"Sure! How about tomorrow at 4 PM?", time:"10:06 AM", read:true},
      {id:"m5", from:"them", text:"Sounds good! See you at the library tomorrow at 4 PM.", time:"10:07 AM", read:false},
    ],
  },
  {
    id:"R002", name:"Vikram Nair", initials:"VN", college:"CS '24",
    product:"GATE ECE Notes 2024", productIcon:"📄", price:"₹199",
    role:"seller", lastMsg:"Can I get a preview before buying?", lastTime:"18m", unread:0,
    status:"active",
    messages:[
      {id:"m1", from:"them", text:"Can I get a preview before buying? Also is this for 2024 exam?", time:"9:30 AM", read:true},
      {id:"m2", from:"me",   text:"Yes, it covers the full 2024 GATE ECE syllabus. I can share a sample page.", time:"9:45 AM", read:true},
    ],
  },
  {
    id:"T003", name:"Rohan Gupta", initials:"RG", college:"ME '25",
    product:"Engineering Drawing Kit", productIcon:"📐", price:"₹450",
    role:"buyer", lastMsg:"Deal done! Payment via cash. Thanks!", lastTime:"1d", unread:0,
    status:"deal_done",
    messages:[
      {id:"m1", from:"me",   text:"Hi! I saw your kit listing. Is it still available?", time:"Yesterday", read:true},
      {id:"m2", from:"them", text:"Yes! It includes compass, scale, set squares, all in good condition.", time:"Yesterday", read:true},
      {id:"m3", from:"me",   text:"Great! Can we meet near the canteen?", time:"Yesterday", read:true},
      {id:"m4", from:"them", text:"Sure, meet at 5 PM.", time:"Yesterday", read:true},
      {id:"m5", from:"me",   text:"Deal done! Payment via cash. Thanks!", time:"Yesterday", read:true},
    ],
  },
];

const QUICK_REPLIES = [
  "Is this still available?",
  "Can we meet on campus?",
  "Is the price negotiable?",
  "What condition is it in?",
  "I can pay cash.",
];

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true});
}

export default function InboxPage() {
  const [threads, setThreads]       = useState<Thread[]>(INITIAL_THREADS);
  const [activeId, setActiveId]     = useState<string>(INITIAL_THREADS[0].id);
  const [input, setInput]           = useState("");
  const [search, setSearch]         = useState("");
  const [showEmoji, setShowEmoji]   = useState(false);
  const [dealDone, setDealDone]     = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const thread = threads.find(t=>t.id===activeId)!;

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"});
    // Mark as read
    setThreads(ts=>ts.map(t=>t.id===activeId ? {...t, unread:0, messages:t.messages.map(m=>({...m,read:true}))} : t));
  },[activeId, threads.find(t=>t.id===activeId)?.messages.length]);

  function sendMessage(text?: string) {
    const msg = (text ?? input).trim();
    if(!msg) return;
    const now = formatTime(new Date());
    const newMsg: Message = {id:`m${Date.now()}`, from:"me", text:msg, time:now, read:false};
    setThreads(ts=>ts.map(t=>t.id===activeId ? {...t, lastMsg:msg, lastTime:"now", messages:[...t.messages, newMsg]} : t));
    setInput("");
    setShowEmoji(false);
  }

  function markDealDone() {
    setThreads(ts=>ts.map(t=>t.id===activeId ? {...t, status:"deal_done"} : t));
    setDealDone(true);
    setTimeout(()=>setDealDone(false), 3000);
    sendMessage("✅ Deal done! We agreed to meet on campus for the handover.");
  }

  const filteredThreads = threads.filter(t=>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.product.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = threads.reduce((s,t)=>s+t.unread,0);

  const EMOJIS = ["👍","😊","🙏","✅","💯","📦","🤝","💰","⭐","❤️"];

  return (
    <StudentLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .msg-in{animation:fadeUp .2s ease}
        .thread-item:hover{background:rgba(255,255,255,0.03)!important}
        .send-btn:hover{background:#3b7de8!important}
        .chat-input:focus{border-color:#4F8EF7!important}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#1e2d45;border-radius:4px}
      `}</style>

      <div style={{display:"flex",height:"calc(100vh - 0px)",overflow:"hidden"}}>

        {/* ── Thread List (Left Panel) ── */}
        <div style={{width:300,flexShrink:0,borderRight:"1px solid #1e2d45",display:"flex",flexDirection:"column",background:"#0d1120"}}>

          {/* Header */}
          <div style={{padding:"20px 16px 14px",borderBottom:"1px solid #1e2d45"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:800,color:"#F0F4FF",flex:1}}>Inbox</h2>
              {totalUnread>0 && <span style={{background:"#EF4444",color:"#fff",borderRadius:9999,padding:"1px 8px",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:800}}>{totalUnread}</span>}
            </div>
            <div style={{position:"relative"}}>
              <Search size={13} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#6B7280",pointerEvents:"none"}}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search conversations…" style={{width:"100%",height:36,paddingLeft:32,background:"#111827",border:"1.5px solid #1e2d45",borderRadius:9,color:"#F0F4FF",fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
            </div>
          </div>

          {/* Thread List */}
          <div style={{flex:1,overflowY:"auto"}}>
            {filteredThreads.length === 0 && (
              <div style={{textAlign:"center",padding:"40px 16px"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#374151"}}>No conversations found.</p>
              </div>
            )}
            {filteredThreads.map(t=>(
              <div key={t.id} className="thread-item" onClick={()=>setActiveId(t.id)} style={{padding:"14px 16px",cursor:"pointer",background:t.id===activeId?"rgba(79,142,247,0.08)":"transparent",borderLeft:`3px solid ${t.id===activeId?"#4F8EF7":"transparent"}`,transition:"all 0.15s",borderBottom:"1px solid rgba(30,45,69,0.4)"}}>
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  {/* Avatar */}
                  <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#4F8EF7,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:800,color:"#fff",flexShrink:0,position:"relative"}}>
                    {t.initials}
                    {t.unread>0 && <span style={{position:"absolute",top:-2,right:-2,width:16,height:16,borderRadius:"50%",background:"#EF4444",fontSize:9,fontWeight:800,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{t.unread}</span>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#F0F4FF",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</span>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#374151",flexShrink:0,marginLeft:4}}>{t.lastTime}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:3}}>
                      <span style={{fontSize:11}}>{t.productIcon}</span>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#6B7280",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.product}</span>
                    </div>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:t.unread>0?"#9CA3AF":"#374151",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:t.unread>0?600:400}}>{t.lastMsg}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Chat Window (Right Panel) ── */}
        <div style={{flex:1,display:"flex",flexDirection:"column",background:"#0A0E1A",minWidth:0}}>

          {/* Chat Header */}
          <div style={{padding:"14px 24px",borderBottom:"1px solid #1e2d45",background:"#0d1120",display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:42,height:42,borderRadius:"50%",background:"linear-gradient(135deg,#4F8EF7,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:800,color:"#fff",flexShrink:0}}>
              {thread.initials}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <p style={{fontFamily:"'Sora',sans-serif",fontSize:15,fontWeight:700,color:"#F0F4FF"}}>{thread.name}</p>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#6B7280"}}>{thread.college}</span>
                {thread.status==="deal_done" && <span style={{background:"rgba(16,185,129,0.12)",color:"#10B981",borderRadius:9999,padding:"1px 10px",fontSize:10,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>✅ Deal Done</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                <span style={{fontSize:13}}>{thread.productIcon}</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#6B7280"}}>{thread.product}</span>
                <span style={{fontFamily:"'Sora',sans-serif",fontSize:12,fontWeight:700,color:"#10B981"}}>{thread.price}</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#374151"}}>· {thread.role==="seller"?"You are selling":"You are buying"}</span>
              </div>
            </div>
            {/* Deal Done button */}
            {thread.status==="active" && (
              <button onClick={markDealDone} style={{height:36,padding:"0 14px",borderRadius:9999,background:"rgba(16,185,129,0.1)",border:"1.5px solid rgba(16,185,129,0.3)",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:"#10B981",cursor:"pointer",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                🤝 Mark Deal Done
              </button>
            )}
          </div>

          {/* Deal Done Banner */}
          {dealDone && (
            <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",padding:"10px 24px",display:"flex",alignItems:"center",gap:8}}>
              <Check size={14} style={{color:"#10B981"}}/>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#10B981",fontWeight:600}}>Marked as deal done! Both parties notified.</span>
            </div>
          )}

          {/* Product Info Bar */}
          <div style={{padding:"10px 24px",background:"rgba(79,142,247,0.04)",borderBottom:"1px solid #1e2d45",display:"flex",alignItems:"center",gap:12}}>
            <Package size={13} style={{color:"#4F8EF7",flexShrink:0}}/>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#6B7280",flex:1}}>
              This chat is about <strong style={{color:"#F0F4FF"}}>{thread.product}</strong> — Payment happens <strong style={{color:"#F7C948"}}>in person on campus</strong>. CampusConnect does not handle product payments.
            </span>
          </div>

          {/* Messages */}
          <div style={{flex:1,overflowY:"auto",padding:"20px 24px",display:"flex",flexDirection:"column",gap:12}}>
            {/* Date separator */}
            <div style={{display:"flex",alignItems:"center",gap:10,margin:"4px 0"}}>
              <div style={{flex:1,height:1,background:"#1e2d45"}}/>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#374151",whiteSpace:"nowrap"}}>Today</span>
              <div style={{flex:1,height:1,background:"#1e2d45"}}/>
            </div>

            {thread.messages.map(msg=>(
              <div key={msg.id} className="msg-in" style={{display:"flex",flexDirection:msg.from==="me"?"row-reverse":"row",gap:10,alignItems:"flex-end"}}>
                {msg.from==="them" && (
                  <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#4F8EF7,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:800,color:"#fff",flexShrink:0}}>
                    {thread.initials}
                  </div>
                )}
                <div style={{maxWidth:"68%"}}>
                  <div style={{background:msg.from==="me"?"linear-gradient(135deg,#4F8EF7,#3b6fd4)":"#1a2235",borderRadius:msg.from==="me"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"10px 14px",boxShadow:msg.from==="me"?"0 2px 12px rgba(79,142,247,0.25)":"none"}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:msg.from==="me"?"#fff":"#F0F4FF",lineHeight:1.5,margin:0}}>{msg.text}</p>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:4,marginTop:3,justifyContent:msg.from==="me"?"flex-end":"flex-start"}}>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#374151"}}>{msg.time}</span>
                    {msg.from==="me" && (msg.read ? <CheckCheck size={11} style={{color:"#4F8EF7"}}/> : <Check size={11} style={{color:"#374151"}}/>)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef}/>
          </div>

          {/* Quick Replies */}
          <div style={{padding:"8px 24px 0",display:"flex",gap:6,flexWrap:"wrap"}}>
            {QUICK_REPLIES.map(qr=>(
              <button key={qr} onClick={()=>sendMessage(qr)} style={{height:28,padding:"0 10px",borderRadius:9999,background:"transparent",border:"1px solid #1e2d45",fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#6B7280",cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#4F8EF7";e.currentTarget.style.color="#4F8EF7";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e2d45";e.currentTarget.style.color="#6B7280";}}>
                {qr}
              </button>
            ))}
          </div>

          {/* Emoji Picker */}
          {showEmoji && (
            <div style={{padding:"8px 24px",display:"flex",gap:6,flexWrap:"wrap",background:"#0d1120",borderTop:"1px solid #1e2d45"}}>
              {EMOJIS.map(e=>(
                <button key={e} onClick={()=>setInput(i=>i+e)} style={{fontSize:20,background:"none",border:"none",cursor:"pointer",padding:"2px 4px",borderRadius:6,transition:"background 0.1s"}}
                  onMouseEnter={ev=>ev.currentTarget.style.background="rgba(255,255,255,0.05)"}
                  onMouseLeave={ev=>ev.currentTarget.style.background="none"}>
                  {e}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div style={{padding:"12px 24px",borderTop:"1px solid #1e2d45",background:"#0d1120",display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setShowEmoji(s=>!s)} style={{width:36,height:36,borderRadius:9999,background:"transparent",border:"1.5px solid #1e2d45",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:showEmoji?"#4F8EF7":"#6B7280",transition:"all 0.15s"}}>
              <Smile size={16}/>
            </button>
            <button style={{width:36,height:36,borderRadius:9999,background:"transparent",border:"1.5px solid #1e2d45",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#6B7280"}}>
              <Paperclip size={15}/>
            </button>
            <input
              className="chat-input"
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter" && !e.shiftKey){e.preventDefault();sendMessage();} }}
              placeholder={`Message ${thread.name}…`}
              style={{flex:1,height:44,padding:"0 16px",background:"#111827",border:"1.5px solid #1e2d45",borderRadius:12,color:"#F0F4FF",fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",transition:"border-color 0.2s"}}
            />
            <button className="send-btn" onClick={()=>sendMessage()} disabled={!input.trim()} style={{width:44,height:44,borderRadius:9999,background:input.trim()?"#4F8EF7":"#1a2235",border:"none",cursor:input.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.15s",boxShadow:input.trim()?"0 4px 14px rgba(79,142,247,0.3)":"none"}}>
              <Send size={16} style={{color:input.trim()?"#fff":"#374151"}}/>
            </button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
