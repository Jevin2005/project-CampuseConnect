"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/StudentLayout";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { AdStrip } from "@/components/AdBanner";
import { OWN_COLLEGE_ADS, CROSS_COLLEGE_ADS, fetchLiveAds } from "@/lib/adsData";
import { Trash2, Download, Eye, BarChart3, IndianRupee, Plus, TrendingUp, ShoppingBag, Check } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
function mediaUrl(p: string) { return p?.startsWith("http") ? p : `${API}${p}`; }
function isVideo(p: string) { return /\.(mp4|webm|ogg|mov)$/i.test(p); }

interface Listing {
  id: string;
  title: string;
  productType: string;
  category: string;
  price: number;
  status: string;
  isApproved: boolean;
  views: number;
  images: string[];
  _count?: { buyRequests: number; orders: number };
}

const TABS = ["All", "Active", "Pending Review", "Sold", "Removed"] as const;
type Tab = typeof TABS[number];

const ST: Record<string, { bg: string; color: string }> = {
  "active": { bg: "rgba(16,185,129,0.1)", color: "#10B981" },
  "pending_review": { bg: "rgba(245,158,11,0.1)", color: "#F59E0B" },
  "sold": { bg: "rgba(79,142,247,0.1)", color: "#4F8EF7" },
  "removed": { bg: "rgba(239,68,68,0.1)", color: "#EF4444" },
  // friendly tab labels
  "Active": { bg: "rgba(16,185,129,0.1)", color: "#10B981" },
  "Pending Review": { bg: "rgba(245,158,11,0.1)", color: "#F59E0B" },
  "Sold": { bg: "rgba(79,142,247,0.1)", color: "#4F8EF7" },
  "Removed": { bg: "rgba(239,68,68,0.1)", color: "#EF4444" },
};

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  "digital": { bg: "rgba(167,139,250,0.12)", color: "#A78BFA" },
  "physical": { bg: "rgba(79,142,247,0.12)", color: "#4F8EF7" },
};

function statusLabel(l: Listing): string {
  const s = l.status?.toLowerCase();
  if (s === "active" && l.isApproved) return "Active";
  if (s === "pending_review" || !l.isApproved) return "Pending Review";
  if (s === "sold" || s === "deal_done" || s === "completed") return "Sold";
  if (s === "removed") return "Removed";
  return l.status;
}

/* ── Thumbnail component ─────────────────────────────────────────────── */
function ListingThumb({ images }: { images: string[] }) {
  const imgs = images.filter(f => !isVideo(f));
  const vids = images.filter(f => isVideo(f));
  const thumb = imgs[0] || vids[0];
  if (!thumb) return (
    <div style={{ width: 38, height: 38, borderRadius: 9, background: "#1a2235", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📦</div>
  );
  return isVideo(thumb)
    ? <video src={mediaUrl(thumb)} muted style={{ width: 38, height: 38, borderRadius: 9, objectFit: "cover", flexShrink: 0 }} />
    : <img src={mediaUrl(thumb)} alt="" style={{ width: 38, height: 38, borderRadius: 9, objectFit: "cover", flexShrink: 0 }} />;
}

export default function MyListingsPage() {
  const [tab, setTab] = useState<Tab>("All");
  const [hov, setHov] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const user = useAuthStore(s => s.user);
  const collegeId = useAuthStore(s => s.collegeId);
  const authLoading = useAuthStore(s => s.isLoading);
  const [liveAds, setLiveAds] = useState<any[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    setLoading(true);
    api.get("/api/marketplace/my-listings")
      .then(res => setListings(Array.isArray(res.data) ? res.data : []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  useEffect(() => {
    if (authLoading) return;
    fetchLiveAds(collegeId ?? undefined)
      .then(ads => setLiveAds(ads || []))
      .catch(() => {});
  }, [collegeId, authLoading]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function doDelete() {
    try {
      const productToDelete = listings.find(l => l.id === deleteId);
      await api.delete(`/api/marketplace/products/${deleteId}`);
      if (productToDelete?.productType === 'digital') {
        setListings(ls => ls.map(l => l.id === deleteId ? { ...l, status: 'removed' } : l));
        showToast("Digital product unlisted (marked as removed) to preserve access for existing buyers.");
      } else {
        setListings(ls => ls.filter(l => l.id !== deleteId));
        showToast("Listing removed successfully.");
      }
      setDeleteId(null);
    } catch (err) {
      console.error("Error deleting listing:", err);
    }
  }

  function exportCSV() {
    const rows = ["ID,Title,Type,Price,Status,Views",
      ...listings.map(l => `${l.id},"${l.title}",${l.productType},${l.price},${statusLabel(l)},${l.views}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "my-listings.csv"; a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exported!");
  }

  const filtered = listings.filter(l => {
    const sl = statusLabel(l);
    return tab === "All" || sl === tab;
  });

  const totals = {
    active: listings.filter(l => statusLabel(l) === "Active").length,
    views: listings.reduce((s, l) => s + (l.views || 0), 0),
    requests: listings.reduce((s, l) => s + (l._count?.buyRequests || 0), 0),
    orders: listings.reduce((s, l) => s + (l._count?.orders || 0), 0),
  };

  return (
    <StudentLayout>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .lp{animation:fadeUp .4s ease}
        .row:hover{background:rgba(79,142,247,0.025)!important;border-bottom-color:rgba(79,142,247,0.15)!important}

        @media (max-width: 768px) {
          .lp {
            padding: 16px 14px 28px !important;
          }
          .lp > div:first-of-type {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .listings-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .listings-tabs-row {
            display: flex !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            padding-bottom: 4px !important;
            margin-bottom: 16px !important;
            -webkit-overflow-scrolling: touch !important;
            gap: 8px !important;
          }
          .listings-tabs-row::-webkit-scrollbar {
            display: none !important;
          }
          .listings-tabs-row button {
            flex-shrink: 0 !important;
          }
          .listings-table-header {
            display: none !important;
          }
          .listings-table-container {
            background: transparent !important;
            border: none !important;
          }
          .listings-table-row {
            display: grid !important;
            grid-template-columns: 1fr 1.2fr !important;
            grid-template-areas:
              "info info"
              "type status"
              "price actions"
              "views requests" !important;
            gap: 12px !important;
            padding: 16px !important;
            border: 1px solid #1e2d45 !important;
            border-radius: 14px !important;
            background: #111827 !important;
            margin-bottom: 12px !important;
          }
          .listings-cell-info { grid-area: info !important; }
          .listings-cell-type { grid-area: type !important; }
          .listings-cell-status { grid-area: status !important; justify-self: right !important; }
          .listings-cell-price { grid-area: price !important; align-self: center !important; font-size: 15px !important; }
          .listings-cell-actions { grid-area: actions !important; justify-self: right !important; }
          
          .listings-cell-views { 
            grid-area: views !important; 
            font-size: 11px !important; 
            color: #6B7280 !important; 
            display: flex !important;
            align-items: center !important;
            gap: 4px !important;
          }
          .listings-cell-views::before {
            content: "👁 Views: " !important;
          }
          .listings-cell-requests { 
            grid-area: requests !important; 
            font-size: 11px !important; 
            color: #6B7280 !important; 
            justify-self: right !important; 
            display: flex !important;
            align-items: center !important;
            gap: 4px !important;
          }
          .listings-cell-requests::before {
            content: "💬 Requests: " !important;
          }
        }
      `}</style>

      <div className="lp" style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }}>

        {/* Toast */}
        {toast && (
          <div style={{ position: "fixed", top: 20, right: 24, zIndex: 999, background: "#10B981", color: "#fff", borderRadius: 12, padding: "12px 20px", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 8 }}>
            <Check size={14} /> {toast}
          </div>
        )}

        {/* Delete Confirm Modal */}
        {deleteId && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 998 }}>
            <div style={{ background: "#111827", border: "1.5px solid #EF444460", borderRadius: 16, padding: "28px 32px", maxWidth: 380, textAlign: "center" }}>
              <span style={{ fontSize: 40 }}>🗑️</span>
              <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 700, color: "#F0F4FF", margin: "12px 0 6px" }}>Remove this listing?</p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280", marginBottom: 20 }}>This action cannot be undone. The listing will be permanently removed.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button onClick={() => setDeleteId(null)} style={{ height: 38, padding: "0 20px", borderRadius: 9999, background: "transparent", border: "1.5px solid #1e2d45", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#9CA3AF", cursor: "pointer" }}>Cancel</button>
                <button onClick={doDelete} style={{ height: 38, padding: "0 20px", borderRadius: 9999, background: "#EF4444", border: "none", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}>Yes, Remove</button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, color: "#F0F4FF", marginBottom: 4 }}>My Listings</h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280" }}>Track and manage your marketplace products</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={exportCSV} style={{ height: 38, padding: "0 16px", borderRadius: 9999, background: "transparent", border: "1.5px solid #1e2d45", fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9CA3AF", cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
              <Download size={13} />Export CSV
            </button>
            <Link href="/marketplace/sell" style={{ textDecoration: "none" }}>
              <button style={{ height: 38, padding: "0 18px", borderRadius: 9999, background: "#10B981", border: "none", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 4px 16px rgba(16,185,129,0.3)" }}>
                <Plus size={14} />New Listing
              </button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="listings-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { icon: <Eye size={16} />, label: "Active Listings", value: totals.active, color: "#4F8EF7", sub: "live now" },
            { icon: <BarChart3 size={16} />, label: "Total Views", value: totals.views.toLocaleString(), color: "#A78BFA", sub: "all products" },
            { icon: <ShoppingBag size={16} />, label: "Buy Requests", value: totals.requests, color: "#10B981", sub: "all time" },
            { icon: <IndianRupee size={16} />, label: "Orders", value: totals.orders, color: "#F7C948", sub: "completed" },
          ].map(s => (
            <div key={s.label} style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 14, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: 9999, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1px", color: "#6B7280", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</p>
              <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, color: "#F0F4FF", lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: s.color }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="listings-tabs-row" style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {TABS.map(t => {
            const cnt = t === "All" ? listings.length : listings.filter(l => statusLabel(l) === t).length;
            return (
              <button key={t} onClick={() => setTab(t)} style={{
                height: 36, padding: "0 16px", borderRadius: 9999, cursor: "pointer",
                background: tab === t ? "#4F8EF7" : "transparent",
                border: `1.5px solid ${tab === t ? "#4F8EF7" : "#1e2d45"}`,
                fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: tab === t ? 700 : 500,
                color: tab === t ? "#fff" : "#6B7280", transition: "all 0.18s",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {t}
                <span style={{ background: tab === t ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)", borderRadius: 9999, padding: "0 7px", fontSize: 11 }}>{cnt}</span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="listings-table-container" style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 16, overflow: "hidden" }}>
          <div className="listings-table-header" style={{ display: "grid", gridTemplateColumns: "2.2fr 0.9fr 1fr 1fr 70px 100px 110px", background: "#1a2235", padding: "12px 22px", gap: 8 }}>
            {["Product", "Type", "Price", "Status", "Views", "Sales / Requests", "Actions"].map(h => (
              <span key={h} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1px", color: "#6B7280", textTransform: "uppercase" }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <div style={{ width: 36, height: 36, border: "3px solid #1e2d45", borderTopColor: "#4F8EF7", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280" }}>Loading your listings…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <span style={{ fontSize: 48 }}>📦</span>
              <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700, color: "#F0F4FF", marginTop: 12, marginBottom: 4 }}>No products here</p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280", marginBottom: 20 }}>Start selling to your campus community</p>
              <Link href="/marketplace/sell" style={{ textDecoration: "none" }}>
                <button style={{ height: 40, padding: "0 24px", borderRadius: 9999, background: "#10B981", border: "none", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}>List Your First Product →</button>
              </Link>
            </div>
          ) : filtered.map(l => {
            const sl = statusLabel(l);
            const st = ST[sl] || ST["Active"];
            const ts = TYPE_STYLE[l.productType] || TYPE_STYLE["physical"];
            return (
              <div key={l.id} className="row listings-table-row" style={{ display: "grid", gridTemplateColumns: "2.2fr 0.9fr 1fr 1fr 70px 100px 110px", padding: "14px 22px", borderBottom: "1px solid #1e2d45", alignItems: "center", gap: 8, transition: "all 0.15s", background: hov === l.id ? "rgba(79,142,247,0.02)" : "transparent" }}
                onMouseEnter={() => setHov(l.id)} onMouseLeave={() => setHov(null)}>
                <div className="listings-cell-info" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ListingThumb images={l.images || []} />
                  <div>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: "#F0F4FF", marginBottom: 2 }}>{l.title}</p>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#374151" }}>#{l.id.slice(0, 8)} · {l.category}</p>
                  </div>
                </div>
                <span className="listings-cell-type" style={{ display: "inline-flex", alignItems: "center", gap: 4, background: ts.bg, color: ts.color, borderRadius: 9999, padding: "4px 10px", fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, width: "fit-content" }}>
                  {l.productType === "digital" ? "📄" : "🔧"} {l.productType === "digital" ? "Digital" : "Physical"}
                </span>
                <span className="listings-cell-price" style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 700, color: "#10B981" }}>₹{l.price.toLocaleString("en-IN")}</span>
                <span className="listings-cell-status" style={{ display: "inline-block", background: st.bg, color: st.color, borderRadius: 9999, padding: "4px 12px", fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, width: "fit-content" }}>{sl}</span>
                <span className="listings-cell-views" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#9CA3AF" }}>{(l.views || 0).toLocaleString()}</span>
                <span className="listings-cell-requests" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#9CA3AF" }}>
                  {l.productType === "digital"
                    ? `${l._count?.orders || 0} Sale${(l._count?.orders || 0) === 1 ? "" : "s"}`
                    : `${l._count?.buyRequests || 0} Req${(l._count?.buyRequests || 0) === 1 ? "" : "s"}`
                  }
                </span>
                <div className="listings-cell-actions" style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setDeleteId(l.id)} style={{ width: 32, height: 32, borderRadius: 8, background: "transparent", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#EF4444" }}><Trash2 size={13} /></button>
                </div>
              </div>
            );
          })}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", background: "#0d1120" }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#6B7280" }}>Showing {filtered.length} of {listings.length} listings</span>
          </div>
        </div>

        {/* Insight bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, padding: "12px 18px", background: "rgba(79,142,247,0.05)", border: "1px solid rgba(79,142,247,0.12)", borderRadius: 12 }}>
          <TrendingUp size={14} style={{ color: "#4F8EF7", flexShrink: 0 }} />
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#6B7280" }}>
            Your listings got <strong style={{ color: "#F0F4FF" }}>{totals.views.toLocaleString()} views</strong> total — boost sales by sharing on campus groups 📣
          </p>
        </div>

        {/* Ads */}
        {(() => {
          const adsToShow = liveAds.length > 0
            ? liveAds
            : (process.env.NODE_ENV === "production"
                ? []
                : [
                    { ...OWN_COLLEGE_ADS[0], subtitle: "Zenith Tech Fest 2024 — Register before Dec 20. ₹5L prize pool!", dismissible: true },
                    { ...CROSS_COLLEGE_ADS[0], subtitle: "Inter-college Hackathon — VIT × MIT × PCCOE. ₹2L prizes. Open to all!", dismissible: true }
                  ]
              );
          if (adsToShow.length === 0) return null;
          return (
            <div style={{ marginTop: 24 }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.4px", color: "#374151", textTransform: "uppercase", marginBottom: 10 }}>📢 ADVERTISEMENTS</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {adsToShow.slice(0, 2).map((ad, idx) => (
                  <AdStrip key={ad.id || idx} ad={ad} />
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </StudentLayout>
  );
}
