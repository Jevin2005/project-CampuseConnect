"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { StudentLayout } from "@/components/StudentLayout";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { Send, Search, Check, CheckCheck, Package, Smile, RefreshCw, MessageSquare, Power, Lock, AlertCircle, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getCurrentUserId(): string {
  return useAuthStore.getState().user?.id || "";
}
function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "now";
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  } catch { return ""; }
}
function fmtTime(dateStr: string): string {
  try { return new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }); }
  catch { return ""; }
}
function initials(name: string) {
  return (name || "U").split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}
function productIcon(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("laptop") || t.includes("macbook")) return "💻";
  if (t.includes("notes") || t.includes("pdf")) return "📄";
  if (t.includes("course") || t.includes("video")) return "🎥";
  if (t.includes("phone") || t.includes("mobile")) return "📱";
  if (t.includes("book")) return "📚";
  return "📦";
}

interface UIThread {
  id: string;
  name: string;
  inits: string;
  product: string;
  productIcon: string;
  price: string;
  role: "buyer" | "seller";
  lastMsg: string;
  lastTime: string;
  status: "active" | "closed" | "deal_done";
}
interface UIMsg {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
}

const QUICK = ["Is this still available?", "Can we meet on campus?", "Is the price negotiable?", "What condition is it in?", "I can pay cash."];
const EMOJIS = ["👍", "😊", "🙏", "✅", "💯", "📦", "🤝", "💰", "⭐", "❤️"];

export default function InboxPage() {
  const [threads, setThreads] = useState<UIThread[]>([]);
  const [msgs, setMsgs] = useState<UIMsg[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [noToken, setNoToken] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const myId = useRef("");

  const scrollToBottom = (behavior: "smooth" | "auto" = "smooth") => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    // Show button if scrolled up by more than 200px
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
    setShowScrollBtn(!isNearBottom);
  };

  const fetchThreads = useCallback(async () => {
    const uid = getCurrentUserId();
    if (!uid) { setLoading(false); setNoToken(true); return; }
    setNoToken(false);
    try {
      const r = await api.get("/api/marketplace/threads");
      const mapped: UIThread[] = r.data.map((bt: any) => {
        const isBuyer = bt.request.buyer.id === uid;
        const other = isBuyer ? bt.request.seller : bt.request.buyer;
        const lm = bt.messages?.[0];
        return {
          id: bt.id,
          name: other.name || other.email,
          inits: initials(other.name || other.email),
          product: bt.request.product.title,
          productIcon: productIcon(bt.request.product.title),
          price: `₹${bt.request.product.price.toLocaleString("en-IN")}`,
          role: isBuyer ? "buyer" : "seller",
          lastMsg: lm?.text || "No messages yet",
          lastTime: lm ? timeAgo(lm.createdAt) : timeAgo(bt.updatedAt),
          status: bt.status === "closed" ? "closed" : bt.status === "deal_done" ? "deal_done" : "active",
        } as UIThread;
      });
      setThreads(mapped);
      if (!activeId && mapped.length > 0) setActiveId(mapped[0].id);
    } catch { }
    setLoading(false);
  }, [activeId]);

  const fetchMsgs = useCallback(async (tid: string) => {
    const uid = getCurrentUserId();
    if (!uid || !tid) return;
    try {
      const r = await api.get(`/api/marketplace/threads/${tid}/messages`);
      setMsgs(r.data.map((m: any) => ({ id: m.id, from: m.senderId === uid ? "me" : "them", text: m.text, time: fmtTime(m.createdAt) })));
    } catch { }
    setMsgLoading(false);
  }, []);

  const user = useAuthStore(s => s.user);
  const authLoading = useAuthStore(s => s.isLoading);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      myId.current = user.id;
      fetchThreads();
    } else {
      setLoading(false);
      setNoToken(true);
    }
  }, [user, authLoading, fetchThreads]);

  useEffect(() => {
    if (!activeId) return;
    setMsgLoading(true);
    fetchMsgs(activeId);
  }, [activeId]);

  // Poll for new messages every 5s
  useEffect(() => {
    if (!activeId) return;
    const iv = setInterval(() => fetchMsgs(activeId), 5000);
    return () => clearInterval(iv);
  }, [activeId, fetchMsgs]);

  useEffect(() => {
    prevMsgCountRef.current = 0;
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;

    const isFirstLoad = prevMsgCountRef.current === 0;
    const hasNewMessages = msgs.length > prevMsgCountRef.current;

    prevMsgCountRef.current = msgs.length;

    let isNearBottom = true;
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
    }

    if (isFirstLoad) {
      scrollToBottom("auto");
    } else if (hasNewMessages && isNearBottom) {
      scrollToBottom("smooth");
    }
  }, [msgs, activeId]);

  async function sendMsg(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || !activeId || sending) return;
    setSending(true); setInput(""); setShowEmoji(false);
    try {
      await api.post(`/api/marketplace/threads/${activeId}/messages`, { text: msg });
      await fetchMsgs(activeId);
      setThreads(ts => ts.map(t => t.id === activeId ? { ...t, lastMsg: msg, lastTime: "now" } : t));
      setTimeout(() => scrollToBottom("smooth"), 50);
    } catch { }
    setSending(false);
  }

  async function markDeal() {
    if (!activeId) return;
    if (!confirm("Mark this deal as completed? This will mark the product as sold, create the order logs, and close all other conversations for this product.")) return;
    try {
      await api.patch(`/api/marketplace/threads/${activeId}/complete`);
      setThreads(ts => ts.map(t => t.id === activeId ? { ...t, status: "deal_done" } : t));
      await fetchMsgs(activeId);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to mark deal as done.");
    }
  }

  async function closeConversation() {
    if (!activeId) return;
    if (!confirm("Are you sure you want to end this conversation? This will reject the buy request and close the chat thread.")) return;
    try {
      await api.patch(`/api/marketplace/threads/${activeId}/close`);
      setThreads(ts => ts.map(t => t.id === activeId ? { ...t, status: "closed" } : t));
      await fetchMsgs(activeId);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to close conversation.");
    }
  }

  const active = threads.find(t => t.id === activeId);
  const filtered = threads.filter(t => !search || t.name.toLowerCase().includes(search) || t.product.toLowerCase().includes(search));

  return (
    <StudentLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .msg-in{animation:fadeUp .2s ease}
        .ti:hover{background:rgba(255,255,255,0.03)!important}
        .sb:hover{background:#3b7de8!important}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#1e2d45;border-radius:4px}
        .inbox-back-btn {
          display: none !important;
        }
        @media (max-width: 768px) {
          .inbox-container {
            height: calc(100vh - 120px) !important;
          }
          .inbox-back-btn {
            display: flex !important;
          }
          .inbox-sidebar {
            width: 100% !important;
            display: ${mobileView === "list" ? "flex" : "none"} !important;
            border-right: none !important;
          }
          .inbox-chat-window {
            width: 100% !important;
            display: ${mobileView === "chat" ? "flex" : "none"} !important;
          }
          .inbox-chat-window > div:first-of-type {
            padding: 10px 14px !important;
            gap: 10px !important;
          }
          .inbox-chat-window > div[style*="padding: 12px 24px"], .inbox-chat-window > div[style*="padding: 16px 24px"] {
            padding: 10px 12px !important;
            gap: 8px !important;
          }
        }
      `}</style>

      <div className="inbox-container" style={{ display: "flex", height: "calc(100vh - 102px)", overflow: "hidden" }}>

        {/* Thread List */}
        <div className="inbox-sidebar" style={{ width: 300, flexShrink: 0, borderRight: "1px solid #1e2d45", display: "flex", flexDirection: "column", background: "#0d1120" }}>
          <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid #1e2d45" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: "#F0F4FF", flex: 1 }}>Inbox</h2>
              <button onClick={fetchThreads} title="Refresh" style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6B7280", padding: 4 }}>
                <RefreshCw size={14} />
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#6B7280", pointerEvents: "none" }} />
              <input value={search} onChange={e => setSearch(e.target.value.toLowerCase())} placeholder="Search conversations…"
                style={{ width: "100%", height: 36, paddingLeft: 32, background: "#111827", border: "1.5px solid #1e2d45", borderRadius: 9, color: "#F0F4FF", fontFamily: "'DM Sans',sans-serif", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading && (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ width: 28, height: 28, border: "3px solid #1e2d45", borderTopColor: "#4F8EF7", borderRadius: "50%", margin: "0 auto 10px", animation: "spin 0.8s linear infinite" }} />
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#6B7280" }}>Loading…</p>
              </div>
            )}
            {!loading && noToken && (
              <div style={{ textAlign: "center", padding: 40 }}>
                <MessageSquare size={32} style={{ color: "#374151", margin: "0 auto 10px" }} />
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280" }}>Log in to view your messages</p>
              </div>
            )}
            {!loading && !noToken && filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: 40 }}>
                <MessageSquare size={32} style={{ color: "#374151", margin: "0 auto 10px" }} />
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280" }}>No conversations yet</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#374151", marginTop: 6 }}>Send a buy request to start chatting</p>
              </div>
            )}
            {filtered.map(t => (
              <div key={t.id} className="ti" onClick={() => { setActiveId(t.id); setMobileView("chat"); }}
                style={{ padding: "14px 16px", cursor: "pointer", background: t.id === activeId ? "rgba(79,142,247,0.08)" : "transparent", borderLeft: `3px solid ${t.id === activeId ? "#4F8EF7" : "transparent"}`, transition: "all 0.15s", borderBottom: "1px solid rgba(30,45,69,0.4)" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#4F8EF7,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                    {t.inits}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#F0F4FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#374151", flexShrink: 0, marginLeft: 4 }}>{t.lastTime}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                      <span style={{ fontSize: 11 }}>{t.productIcon}</span>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{t.product}</span>
                      {t.status === "deal_done" && (
                        <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 4, background: "rgba(16,185,129,0.15)", color: "#10B981", fontWeight: 700, fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>SOLD</span>
                      )}
                      {t.status === "closed" && (
                        <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 4, background: "rgba(239,68,68,0.15)", color: "#EF4444", fontWeight: 700, fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>ENDED</span>
                      )}
                    </div>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.lastMsg}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        {active ? (
          <div className="inbox-chat-window" style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0A0E1A", minWidth: 0 }}>
            {/* Header */}
            <div style={{ padding: "14px 24px", borderBottom: "1px solid #1e2d45", background: "#0d1120", display: "flex", alignItems: "center", gap: 14 }}>
              <button
                onClick={() => setMobileView("list")}
                className="inbox-back-btn"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#9CA3AF",
                  padding: "6px",
                  marginRight: "-4px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <ArrowLeft size={20} />
              </button>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#4F8EF7,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 800, color: "#fff" }}>
                {active.inits}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: "#F0F4FF" }}>{active.name}</p>
                  {active.status === "deal_done" && <span style={{ background: "rgba(16,185,129,0.12)", color: "#10B981", borderRadius: 9999, padding: "1px 10px", fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>✅ Deal Done</span>}
                  {active.status === "closed" && <span style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444", borderRadius: 9999, padding: "1px 10px", fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>🔌 Closed</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: 13 }}>{active.productIcon}</span>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#6B7280" }}>{active.product}</span>
                  <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 700, color: "#10B981" }}>{active.price}</span>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#374151" }}>· {active.role === "seller" ? "You are selling" : "You are buying"}</span>
                </div>
              </div>
              {active.role === "seller" && active.status === "active" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <button onClick={markDeal} style={{ height: 36, padding: "0 14px", borderRadius: 9999, background: "rgba(16,185,129,0.1)", border: "1.5px solid rgba(16,185,129,0.3)", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: "#10B981", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#10B981"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(16,185,129,0.1)"; e.currentTarget.style.color = "#10B981"; }}>
                    🤝 Mark Deal Done
                  </button>
                  <button onClick={closeConversation} title="Close / End Conversation" style={{ height: 36, width: 36, borderRadius: "50%", background: "rgba(239,68,68,0.1)", border: "1.5px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#EF4444"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#EF4444"; }}>
                    <Power size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* Product bar */}
            <div style={{ padding: "10px 24px", background: "rgba(79,142,247,0.04)", borderBottom: "1px solid #1e2d45", display: "flex", alignItems: "center", gap: 12 }}>
              <Package size={13} style={{ color: "#4F8EF7", flexShrink: 0 }} />
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#6B7280", flex: 1 }}>
                This chat is about <strong style={{ color: "#F0F4FF" }}>{active.product}</strong> — Payment happens <strong style={{ color: "#F7C948" }}>in person on campus</strong>. CampusConnect does not handle product payments.
              </span>
            </div>

            {/* Status banners */}
            {active.status === "deal_done" && (
              <div style={{ padding: "12px 24px", background: "rgba(16,185,129,0.06)", borderBottom: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle size={15} style={{ color: "#10B981", flexShrink: 0 }} />
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#A7F3D0" }}>
                  This deal has been completed successfully! The listing has been marked as <strong>Sold</strong>.
                </span>
              </div>
            )}
            {active.status === "closed" && (
              <div style={{ padding: "12px 24px", background: "rgba(239,68,68,0.06)", borderBottom: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
                <XCircle size={15} style={{ color: "#EF4444", flexShrink: 0 }} />
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#FCA5A5" }}>
                  This conversation has ended. The product is sold or the conversation was ended.
                </span>
              </div>
            )}

            {/* Messages Container with Floating Scroll Button */}
            <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}
              >
                {msgLoading && msgs.length === 0 && (
                  <div style={{ textAlign: "center", padding: 40 }}>
                    <div style={{ width: 24, height: 24, border: "3px solid #1e2d45", borderTopColor: "#4F8EF7", borderRadius: "50%", margin: "0 auto", animation: "spin 0.8s linear infinite" }} />
                  </div>
                )}
                {!msgLoading && msgs.length === 0 && (
                  <div style={{ textAlign: "center", padding: 40 }}>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#374151" }}>No messages yet — say hello! 👋</p>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "#1e2d45" }} />
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#374151", whiteSpace: "nowrap" }}>Chat</span>
                  <div style={{ flex: 1, height: 1, background: "#1e2d45" }} />
                </div>
                {msgs.map(msg => {
                  const isSoldOut = msg.text === "This product is sold out. Sorry!";
                  const isCloseMsg = msg.text === "The seller has ended this conversation.";
                  const isSystem = isSoldOut || isCloseMsg;

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="msg-in" style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
                        <div style={{ background: "rgba(30,41,59,0.5)", border: "1px solid #1e2d45", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, maxWidth: "80%", backdropFilter: "blur(4px)" }}>
                          {isSoldOut ? (
                            <XCircle size={15} style={{ color: "#EF4444", flexShrink: 0 }} />
                          ) : (
                            <Power size={15} style={{ color: "#EF4444", flexShrink: 0 }} />
                          )}
                          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#9CA3AF", margin: 0, fontStyle: "italic", textAlign: "center" }}>
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className="msg-in" style={{ display: "flex", flexDirection: msg.from === "me" ? "row-reverse" : "row", gap: 10, alignItems: "flex-end" }}>
                      {msg.from === "them" && (
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#4F8EF7,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                          {active.inits}
                        </div>
                      )}
                      <div style={{ maxWidth: "68%" }}>
                        <div style={{ background: msg.from === "me" ? "linear-gradient(135deg,#4F8EF7,#3b6fd4)" : "#1a2235", borderRadius: msg.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "10px 14px", boxShadow: msg.from === "me" ? "0 2px 12px rgba(79,142,247,0.25)" : "none" }}>
                          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: msg.from === "me" ? "#fff" : "#F0F4FF", lineHeight: 1.5, margin: 0 }}>{msg.text}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3, justifyContent: msg.from === "me" ? "flex-end" : "flex-start" }}>
                          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#374151" }}>{msg.time}</span>
                          {msg.from === "me" && <CheckCheck size={11} style={{ color: "#4F8EF7" }} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {showScrollBtn && (
                <button
                  onClick={() => scrollToBottom("smooth")}
                  style={{
                    position: "absolute",
                    bottom: 16,
                    right: 24,
                    background: "linear-gradient(135deg, #4F8EF7, #3b6fd4)",
                    border: "none",
                    borderRadius: "9999px",
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#fff",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(79,142,247,0.35)",
                    animation: "fadeUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
                    zIndex: 10,
                    transition: "transform 0.15s ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px) scale(1.05)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0) scale(1)"}
                >
                  <span>⬇️ Scroll to Bottom</span>
                </button>
              )}
            </div>

            {/* Quick replies */}
            {active.status === "active" && (
              <div style={{ padding: "8px 24px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
                {QUICK.map(qr => (
                  <button key={qr} onClick={() => sendMsg(qr)}
                    style={{ height: 28, padding: "0 10px", borderRadius: 9999, background: "transparent", border: "1px solid #1e2d45", fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6B7280", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#4F8EF7"; e.currentTarget.style.color = "#4F8EF7"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e2d45"; e.currentTarget.style.color = "#6B7280"; }}>
                    {qr}
                  </button>
                ))}
              </div>
            )}

            {/* Emoji picker */}
            {active.status === "active" && showEmoji && (
              <div style={{ padding: "8px 24px", display: "flex", gap: 6, flexWrap: "wrap", background: "#0d1120", borderTop: "1px solid #1e2d45" }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setInput(i => i + e)} style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: 6 }}
                    onMouseEnter={ev => ev.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                    onMouseLeave={ev => ev.currentTarget.style.background = "none"}>{e}</button>
                ))}
              </div>
            )}

            {/* Input / Lock Box */}
            {active.status === "active" ? (
              <div style={{ padding: "12px 24px", borderTop: "1px solid #1e2d45", background: "#0d1120", display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => setShowEmoji(s => !s)} style={{ width: 36, height: 36, borderRadius: 9999, background: "transparent", border: "1.5px solid #1e2d45", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: showEmoji ? "#4F8EF7" : "#6B7280", transition: "all 0.15s" }}>
                  <Smile size={16} />
                </button>
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
                  placeholder={`Message ${active.name}…`}
                  style={{ flex: 1, height: 44, padding: "0 16px", background: "#111827", border: "1.5px solid #1e2d45", borderRadius: 12, color: "#F0F4FF", fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: "none", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "#4F8EF7"}
                  onBlur={e => e.target.style.borderColor = "#1e2d45"}
                />
                <button className="sb" onClick={() => sendMsg()} disabled={!input.trim() || sending}
                  style={{ width: 44, height: 44, borderRadius: 9999, background: input.trim() && !sending ? "#4F8EF7" : "#1a2235", border: "none", cursor: input.trim() && !sending ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s", boxShadow: input.trim() ? "0 4px 14px rgba(79,142,247,0.3)" : "none" }}>
                  {sending ? <div style={{ width: 16, height: 16, border: "2px solid #374151", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    : <Send size={16} style={{ color: input.trim() ? "#fff" : "#374151" }} />}
                </button>
              </div>
            ) : (
              <div style={{ padding: "16px 24px", borderTop: "1px solid #1e2d45", background: "#090d16", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <Lock size={15} style={{ color: "#4B5563" }} />
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#4B5563", fontWeight: 500 }}>
                  This conversation has ended. You cannot send messages here.
                </span>
              </div>
            )}
          </div>
        ) : (
          /* No thread selected / empty state */
          <div className="inbox-chat-window" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0E1A", flexDirection: "column", gap: 12 }}>
            <MessageSquare size={48} style={{ color: "#1e2d45" }} />
            <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700, color: "#F0F4FF" }}>
              {loading ? "Loading your inbox…" : "Select a conversation"}
            </p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280" }}>
              {loading ? "" : "Or send a buy request to start chatting with a seller"}
            </p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </StudentLayout>
  );
}
