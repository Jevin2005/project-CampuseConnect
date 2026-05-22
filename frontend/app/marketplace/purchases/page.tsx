"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { StudentLayout } from "@/components/StudentLayout";
import api from "@/lib/axios";
import { ShoppingBag, FileText, Video, Download, RefreshCw, Package, ExternalLink } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";



interface Order {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  product: {
    id: string;
    title: string;
    images: string[];
    productType: string;
    digitalSubType?: string;
    category?: string;
  };
  seller: { id: string; name: string; email: string };
}

const ST: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:   { bg: "rgba(245,158,11,0.1)",  color: "#F59E0B", label: "⏳ Pending"   },
  COMPLETED: { bg: "rgba(16,185,129,0.1)",  color: "#10B981", label: "✅ Completed"  },
  CANCELLED: { bg: "rgba(239,68,68,0.1)",   color: "#EF4444", label: "❌ Cancelled"  },
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function downloadReceipt(o: Order) {
  const lines = [
    "==============================",
    "    CAMPUSCONNECT RECEIPT",
    "==============================",
    `Order ID:  ${o.id}`,
    `Date:      ${fmt(o.createdAt)}`,
    `Item:      ${o.product.title}`,
    `Seller:    ${o.seller.name}`,
    `Status:    ${o.status}`,
    `Amount:    ₹${o.amount.toLocaleString("en-IN")}`,
    "------------------------------",
    "Thank you for using CampusConnect!",
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `receipt-${o.id.slice(0, 8)}.txt`; a.click();
  URL.revokeObjectURL(url);
}

export default function MyPurchasesPage() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [tab,     setTab]     = useState<"physical" | "digital">("physical");
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  const fetchOrders = useCallback(async () => {
    try {
      const r = await api.get("/api/marketplace/orders");
      setOrders(r.data);
    } catch { /* offline */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const physical = orders.filter(o => o.product.productType === "physical");
  const digital  = orders.filter(o => o.product.productType === "digital");
  const totalSpent = orders.reduce((s, o) => s + (o.status === "COMPLETED" ? o.amount : 0), 0);

  return (
    <StudentLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .pp-page{animation:fadeUp .4s ease}
        .order-card{transition:all 0.22s}
        .order-card:hover{border-color:rgba(79,142,247,0.4)!important;transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,0.3)!important}
        .dig-card{transition:all 0.25s}
        .dig-card:hover{border-color:rgba(167,139,250,0.4)!important;transform:translateY(-3px);box-shadow:0 10px 32px rgba(0,0,0,0.35)!important}
      `}</style>

      <div className="pp-page" style={{ padding: "28px 32px", maxWidth: 1200 }}>

        {/* Toast */}
        {toast && (
          <div style={{ position: "fixed", top: 20, right: 24, zIndex: 999, background: "#10B981", color: "#fff", borderRadius: 12, padding: "12px 20px", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
            ✅ {toast}
          </div>
        )}

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, color: "#F0F4FF", marginBottom: 4 }}>My Purchases</h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280" }}>Manage orders & access your digital study library</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { key: "physical" as const, icon: "📦", label: "Physical Orders", active: "#4F8EF7" },
              { key: "digital"  as const, icon: "📚", label: "Digital Library",  active: "#A78BFA" },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                height: 40, padding: "0 20px", borderRadius: 9999, cursor: "pointer",
                background: tab === t.key ? t.active : "transparent",
                border: `1.5px solid ${tab === t.key ? t.active : "#1e2d45"}`,
                fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700,
                color: tab === t.key ? "#fff" : "#6B7280",
                display: "flex", alignItems: "center", gap: 7,
                boxShadow: tab === t.key ? `0 4px 20px ${t.active}44` : "none",
                transition: "all 0.2s",
              }}>
                {t.icon} {t.label}
              </button>
            ))}
            <button onClick={fetchOrders} title="Refresh" style={{ width: 40, height: 40, borderRadius: 9999, background: "transparent", border: "1px solid #1e2d45", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { icon: "💰", label: "Total Spent",   value: `₹${totalSpent.toLocaleString("en-IN")}`, color: "#10B981" },
            { icon: "📦", label: "Physical Orders", value: String(physical.length),  color: "#4F8EF7" },
            { icon: "📚", label: "Digital Items",   value: String(digital.length),   color: "#A78BFA" },
          ].map(s => (
            <div key={s.label} style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 14, padding: "18px 22px", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 28 }}>{s.icon}</span>
              <div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", color: "#6B7280", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ width: 32, height: 32, border: "3px solid #1e2d45", borderTopColor: "#4F8EF7", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280" }}>Loading purchases…</p>
          </div>
        )}

        {/* Physical Orders */}
        {!loading && tab === "physical" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {physical.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Package size={48} style={{ color: "#1e2d45", margin: "0 auto 12px" }} />
                <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: "#F0F4FF", marginBottom: 6 }}>No physical orders yet</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280" }}>Browse the marketplace to find items</p>
              </div>
            )}
            {physical.map(o => {
              const st  = ST[o.status] || ST.PENDING;
              const img = o.product.images?.[0];
              return (
                <div key={o.id} className="order-card" style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 18 }}>
                  {/* Thumbnail */}
                  <div style={{ width: 56, height: 56, borderRadius: 12, background: "#1a2235", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {img
                      ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => (e.currentTarget.style.display = "none")} />
                      : <ShoppingBag size={24} style={{ color: "#374151" }} />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: "#F0F4FF", marginBottom: 3 }}>{o.product.title}</p>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#6B7280", marginBottom: 10 }}>Seller: {o.seller.name}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ background: st.bg, color: st.color, borderRadius: 9999, padding: "4px 12px", fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700 }}>{st.label}</span>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#374151" }}>#{o.id.slice(0, 8)}</span>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#374151" }}>📅 {fmt(o.createdAt)}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: "#F0F4FF" }}>₹{o.amount.toLocaleString("en-IN")}</p>
                    <button onClick={() => { downloadReceipt(o); showToast("Receipt downloaded!"); }} style={{ height: 30, padding: "0 14px", borderRadius: 9999, background: "transparent", border: "1px solid #1e2d45", fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#4F8EF7", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      <Download size={11} /> Receipt
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Digital Library */}
        {!loading && tab === "digital" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700, color: "#F0F4FF" }}>📚 Digital Content Library</h2>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#6B7280" }}>{digital.length} items</span>
            </div>
            {digital.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <FileText size={48} style={{ color: "#1e2d45", margin: "0 auto 12px" }} />
                <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: "#F0F4FF", marginBottom: 6 }}>No digital purchases yet</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280" }}>Buy notes and video courses from the marketplace</p>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 18 }}>
              {digital.map(o => {
                const isVideo = o.product.digitalSubType === "video_course" || o.product.productType === "video";
                const img     = o.product.images?.[0];
                return (
                  <div key={o.id} className="dig-card" style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ height: 120, background: isVideo ? "linear-gradient(135deg,#0a1f15,#1b3040)" : "linear-gradient(135deg,#1a0d30,#2d1b4e)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, position: "relative", overflow: "hidden" }}>
                      {img
                        ? <img src={img} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.3 }} onError={e => (e.currentTarget.style.display = "none")} />
                        : null
                      }
                      <span style={{ fontSize: 36, position: "relative" }}>{isVideo ? "🎥" : "📄"}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: isVideo ? "#10B981" : "#A78BFA", background: isVideo ? "rgba(16,185,129,0.15)" : "rgba(167,139,250,0.15)", padding: "2px 10px", borderRadius: 9999, position: "relative" }}>
                        {isVideo ? "🎥 Video Course" : "📄 PDF Notes"}
                      </span>
                    </div>
                    <div style={{ padding: "14px 16px" }}>
                      <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, color: "#F0F4FF", marginBottom: 3, lineHeight: 1.3 }}>{o.product.title}</p>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6B7280", marginBottom: 12 }}>by {o.seller.name}</p>
                      <Link href={`/marketplace/digital/${o.product.id}`} style={{ textDecoration: "none" }}>
                        <button style={{
                          width: "100%", height: 36, borderRadius: 9999, border: "none", cursor: "pointer",
                          background: isVideo ? "linear-gradient(90deg,#059669,#10B981)" : "linear-gradient(90deg,#7C3AED,#A78BFA)",
                          fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                          boxShadow: isVideo ? "0 4px 14px rgba(16,185,129,0.3)" : "0 4px 14px rgba(124,58,237,0.3)",
                        }}>
                          {isVideo ? <><Video size={13} />Watch Now</> : <><FileText size={13} />Open PDF</>}
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Browse CTA */}
        <div style={{ marginTop: 28, padding: "18px 24px", background: "linear-gradient(135deg,rgba(79,142,247,0.06),rgba(16,185,129,0.04))", border: "1px solid rgba(79,142,247,0.15)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShoppingBag size={18} style={{ color: "#4F8EF7" }} />
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#9CA3AF" }}>Looking for more study materials or campus goods?</p>
          </div>
          <Link href="/marketplace" style={{ textDecoration: "none" }}>
            <button style={{ height: 38, padding: "0 22px", borderRadius: 9999, background: "#4F8EF7", border: "none", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 4px 16px rgba(79,142,247,0.3)" }}>
              Browse Marketplace →
            </button>
          </Link>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </StudentLayout>
  );
}
