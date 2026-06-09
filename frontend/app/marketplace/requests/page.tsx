"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/StudentLayout";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import {
  Check, X, MessageCircle, Clock, Package, ChevronRight, RefreshCw,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";


function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function productIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("laptop") || t.includes("mac")) return "💻";
  if (t.includes("note") || t.includes("pdf"))   return "📄";
  if (t.includes("course") || t.includes("video")) return "🎥";
  if (t.includes("phone"))  return "📱";
  if (t.includes("book"))   return "📚";
  return "📦";
}
function initials(name: string) {
  return (name || "?").split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

type ReqStatus = "pending" | "accepted" | "rejected" | "completed";

interface APIRequest {
  id: string;
  message: string;
  status: ReqStatus;
  createdAt: string;
  buyer: { id: string; name: string; email: string; enrollmentId?: string };
  product: { id: string; title: string; price: number; images: string[]; category?: string };
}

const STATUS_STYLE: Record<ReqStatus, { bg: string; color: string; label: string }> = {
  pending:   { bg: "rgba(245,158,11,0.1)",  color: "#F59E0B", label: "⏳ Pending"  },
  accepted:  { bg: "rgba(16,185,129,0.1)",  color: "#10B981", label: "✅ Accepted"  },
  rejected:  { bg: "rgba(239,68,68,0.1)",   color: "#EF4444", label: "❌ Rejected"  },
  completed: { bg: "rgba(16,185,129,0.12)", color: "#10B981", label: "🤝 Completed" },
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<APIRequest[]>([]);
  const [filter,   setFilter]   = useState<"all" | ReqStatus>("all");
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState("");
  const [acting,   setActing]   = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/api/marketplace/requests/received");
      setRequests(r.data);
    } catch { /* offline */ }
    setLoading(false);
  }, []);

  const user = useAuthStore(s => s.user);
  const authLoading = useAuthStore(s => s.isLoading);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      fetchRequests();
    } else {
      setLoading(false);
    }
  }, [user, authLoading, fetchRequests]);

  async function handleStatus(id: string, status: "accepted" | "rejected") {
    if (acting) return;
    setActing(id);
    try {
      const r = await api.patch(`/api/marketplace/requests/${id}`, { status });
      setRequests(rs => rs.map(req => req.id === id ? { ...req, status } : req));
      showToast(status === "accepted"
        ? "✅ Accepted! Chat thread opened in Inbox."
        : "Request declined.");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update request";
      showToast(msg);
    }
    setActing(null);
  }

  const filtered      = filter === "all" ? requests : requests.filter(r => r.status === filter);
  const pendingCount  = requests.filter(r => r.status === "pending").length;

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

        @media (max-width: 768px) {
          .rq-page {
            padding: 16px 14px 28px !important;
          }
          .rq-page > div:first-of-type {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .requests-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .requests-tabs-row {
            display: flex !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            padding-bottom: 4px !important;
            margin-bottom: 16px !important;
            -webkit-overflow-scrolling: touch !important;
            gap: 8px !important;
          }
          .requests-tabs-row::-webkit-scrollbar {
            display: none !important;
          }
          .requests-tabs-row button {
            flex-shrink: 0 !important;
            font-size: 11px !important;
            height: 32px !important;
            padding: 0 12px !important;
          }
          .requests-card-inner {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
          }
          .requests-card-actions {
            width: 100% !important;
            flex-direction: row !important;
            justify-content: stretch !important;
            gap: 8px !important;
            border-top: 1px solid #1e2d45 !important;
            padding-top: 12px !important;
          }
          .requests-card-actions button, .requests-card-actions a {
            flex: 1 !important;
            width: 100% !important;
          }
          .requests-card-actions button {
            height: 36px !important;
            font-size: 12px !important;
            justify-content: center !important;
          }
          .requests-card-actions span {
            width: 100% !important;
            text-align: center !important;
          }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, zIndex: 999, background: "#111827", border: "1px solid #1e2d45", color: "#F0F4FF", borderRadius: 12, padding: "12px 20px", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 8 }}>
          <Check size={14} style={{ color: "#10B981" }} /> {toast}
        </div>
      )}

      <div className="rq-page" style={{ padding: "28px 32px", maxWidth: 900 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <Package size={22} style={{ color: "#4F8EF7" }} />
              <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, color: "#F0F4FF" }}>Buy Requests</h1>
              {pendingCount > 0 && (
                <span style={{ background: "#EF4444", color: "#fff", borderRadius: 9999, padding: "2px 10px", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700 }}>{pendingCount} new</span>
              )}
            </div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280" }}>Interested buyers send you requests. Accept to start a conversation.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={fetchRequests} title="Refresh" style={{ width: 40, height: 40, borderRadius: 9999, background: "transparent", border: "1px solid #1e2d45", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>
              <RefreshCw size={15} />
            </button>
            <Link href="/marketplace/inbox" style={{ textDecoration: "none" }}>
              <button style={{ height: 40, padding: "0 18px", borderRadius: 9999, background: "#4F8EF7", border: "none", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 4px 16px rgba(79,142,247,0.3)" }}>
                <MessageCircle size={14} /> Open Inbox
              </button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="requests-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total Requests", value: requests.length,                                      color: "#4F8EF7" },
            { label: "Accepted",       value: requests.filter(r => r.status === "accepted").length, color: "#10B981" },
            { label: "Pending",        value: pendingCount,                                          color: "#F59E0B" },
          ].map(s => (
            <div key={s.label} style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 14, padding: "16px 20px" }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", color: "#6B7280", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="requests-tabs-row" style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          {(["all", "pending", "accepted", "rejected"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ height: 36, padding: "0 16px", borderRadius: 9999, cursor: "pointer", background: filter === f ? "#4F8EF7" : "transparent", border: `1.5px solid ${filter === f ? "#4F8EF7" : "#1e2d45"}`, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: filter === f ? "#fff" : "#6B7280", transition: "all 0.15s", textTransform: "capitalize" }}>
              {f === "all" ? `All (${requests.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${requests.filter(r => r.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ width: 28, height: 28, border: "3px solid #1e2d45", borderTopColor: "#4F8EF7", borderRadius: "50%", margin: "0 auto 10px", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#6B7280" }}>Loading requests…</p>
          </div>
        )}

        {/* Request Cards */}
        {!loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <span style={{ fontSize: 48 }}>📭</span>
                <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: "#F0F4FF", marginTop: 12 }}>No requests here</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280", marginTop: 4 }}>When students are interested in your listings, requests will appear here.</p>
              </div>
            )}
            {filtered.map(req => {
              const ss  = STATUS_STYLE[req.status];
              const img = req.product.images?.[0];
              return (
                <div key={req.id} className="rq-card" style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 16, padding: "20px 24px", transition: "all 0.2s" }}>
                  <div className="requests-card-inner" style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>

                    {/* Avatar */}
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#4F8EF7,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                      {initials(req.buyer.name)}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                        <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: "#F0F4FF" }}>{req.buyer.name}</p>
                        {req.buyer.enrollmentId && (
                          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6B7280" }}>{req.buyer.enrollmentId}</span>
                        )}
                        <span style={{ background: ss.bg, color: ss.color, borderRadius: 9999, padding: "2px 10px", fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700 }}>{ss.label}</span>
                      </div>

                      {/* Product strip */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#0d1120", borderRadius: 8, padding: "8px 12px", marginBottom: 10, width: "fit-content" }}>
                        {img
                          ? <img src={img} alt="" style={{ width: 24, height: 24, borderRadius: 4, objectFit: "cover" }} onError={e => (e.currentTarget.style.display = "none")} />
                          : <span style={{ fontSize: 18 }}>{productIcon(req.product.title)}</span>
                        }
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9CA3AF" }}>{req.product.title}</span>
                        <ChevronRight size={12} style={{ color: "#374151" }} />
                        <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 700, color: "#10B981" }}>₹{req.product.price.toLocaleString("en-IN")}</span>
                      </div>

                      {/* Message */}
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#9CA3AF", lineHeight: 1.5, marginBottom: 8, fontStyle: "italic" }}>
                        &ldquo;{req.message}&rdquo;
                      </p>

                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Clock size={11} style={{ color: "#374151" }} />
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#374151" }}>{timeAgo(req.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="requests-card-actions" style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                      {req.status === "pending" ? (
                        <>
                          <button
                            className="accept-btn"
                            disabled={acting === req.id}
                            onClick={() => handleStatus(req.id, "accepted")}
                            style={{ height: 38, padding: "0 18px", borderRadius: 9999, background: "#10B981", border: "none", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 3px 12px rgba(16,185,129,0.3)", transition: "background 0.15s", opacity: acting === req.id ? 0.6 : 1 }}
                          >
                            <Check size={13} /> Accept
                          </button>
                          <button
                            className="reject-btn"
                            disabled={acting === req.id}
                            onClick={() => handleStatus(req.id, "rejected")}
                            style={{ height: 38, padding: "0 18px", borderRadius: 9999, background: "transparent", border: "1.5px solid #1e2d45", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s" }}
                          >
                            <X size={13} /> Decline
                          </button>
                        </>
                      ) : req.status === "accepted" || req.status === "completed" ? (
                        <Link href="/marketplace/inbox" style={{ textDecoration: "none" }}>
                          <button style={{ height: 38, padding: "0 18px", borderRadius: 9999, background: "rgba(79,142,247,0.1)", border: "1.5px solid rgba(79,142,247,0.3)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#4F8EF7", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                            <MessageCircle size={13} /> Open Chat
                          </button>
                        </Link>
                      ) : (
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#374151", padding: "8px 14px", background: "rgba(239,68,68,0.06)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.15)" }}>❌ Declined</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </StudentLayout>
  );
}
