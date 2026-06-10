"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/StudentLayout";
import { useAuthStore } from "@/store/authStore";
import { Heart, Trash2, ShoppingBag, Search, Check, RefreshCw } from "lucide-react";
import { fetchWishlist, removeFromWishlist, type WishlistItem } from "@/lib/marketplaceApi";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function WishlistPage() {
  const [items,   setItems]   = useState<WishlistItem[]>([]);
  const [search,  setSearch]  = useState("");
  const [toast,   setToast]   = useState("");
  const [loading, setLoading] = useState(true);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  const loadWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWishlist();
      setItems(data);
    } catch { /* empty or offline */ }
    setLoading(false);
  }, []);

  const user = useAuthStore(s => s.user);
  const authLoading = useAuthStore(s => s.isLoading);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      loadWishlist();
    } else {
      setLoading(false);
    }
  }, [user, authLoading, loadWishlist]);

  async function remove(productId: string) {
    try {
      await removeFromWishlist(productId);
      setItems(is => is.filter(i => i.product && i.product.id !== productId));
      showToast("Removed from wishlist");
    } catch { showToast("Could not remove"); }
  }

  const validItems = items.filter(i => i && i.product);

  const filtered = validItems.filter(i =>
    !search || i.product.title.toLowerCase().includes(search.toLowerCase())
  );
  const totalVal = filtered.reduce((s, i) => s + i.product.price, 0);
  const physCount = filtered.filter(i => i.product.productType === "physical").length;
  const digCount  = filtered.filter(i => i.product.productType === "digital").length;

  function typeTag(productType: string) {
    if (productType === "digital") return { bg: "rgba(167,139,250,0.12)", color: "#A78BFA", label: "Digital" };
    return { bg: "rgba(79,142,247,0.12)", color: "#4F8EF7", label: "Physical" };
  }

  return (
    <StudentLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .wl-page{animation:fadeUp .4s ease}
        .wl-card{transition:all 0.22s}
        .wl-card:hover{border-color:rgba(239,68,68,0.3)!important;transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,0.3)!important}
        .rm-btn:hover{background:rgba(239,68,68,0.12)!important;border-color:rgba(239,68,68,0.4)!important;color:#EF4444!important}
        .buy-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(79,142,247,0.4)!important}

        @media (max-width: 768px) {
          .wl-page {
            padding: 16px 14px 28px !important;
          }
          .wl-page > div:first-of-type {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .wishlist-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .wishlist-cards-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .wl-card-image {
            height: 110px !important;
          }
          .wl-card-tags {
            display: none !important;
          }
          .wl-card-title {
            font-size: 12px !important;
            min-height: 34px !important;
            margin-bottom: 4px !important;
          }
          .wl-card-info-row {
            margin-bottom: 10px !important;
          }
          .wl-card-info-row span:last-child {
            display: none !important;
          }
          .wl-card-info-row span:first-child {
            font-size: 14px !important;
          }
          .wl-card-actions button {
            font-size: 11px !important;
            height: 32px !important;
          }
        }
      `}</style>

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, zIndex: 999, background: "#111827", border: "1px solid #1e2d45", color: "#F0F4FF", borderRadius: 12, padding: "12px 20px", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 8 }}>
          <Check size={14} style={{ color: "#10B981" }} /> {toast}
        </div>
      )}

      <div className="wl-page" style={{ padding: "28px 32px", maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
          <div>
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, color: "#F0F4FF", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
              <Heart size={22} style={{ color: "#EF4444" }} /> Wishlist
            </h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280" }}>{filtered.length} saved item{filtered.length !== 1 ? "s" : ""}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={loadWishlist} title="Refresh" style={{ width: 40, height: 40, borderRadius: 9999, background: "transparent", border: "1px solid #1e2d45", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="wishlist-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
          {[
            { icon: "❤️",  label: "Saved Items",    value: filtered.length,             color: "#EF4444" },
            { icon: "📦",  label: "Physical",        value: physCount,                   color: "#4F8EF7" },
            { icon: "💰",  label: "Total Value",     value: `₹${totalVal.toLocaleString("en-IN")}`, color: "#F7C948" },
          ].map(s => (
            <div key={s.label} style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 26 }}>{s.icon}</span>
              <div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1px", color: "#6B7280", textTransform: "uppercase", marginBottom: 3 }}>{s.label}</p>
                <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#111827", border: "1.5px solid #1e2d45", borderRadius: 12, padding: "10px 16px", marginBottom: 22 }}>
          <Search size={15} style={{ color: "#374151", flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your wishlist…" style={{ background: "transparent", border: "none", outline: "none", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#F0F4FF", width: "100%" }} />
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ width: 32, height: 32, border: "3px solid #1e2d45", borderTopColor: "#EF4444", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280" }}>Loading wishlist…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "70px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 14 }}>💔</div>
            <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700, color: "#F0F4FF", marginBottom: 6 }}>
              {search ? "Nothing matches your search" : "Your wishlist is empty"}
            </p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280", marginBottom: 20 }}>
              {search ? "Try a different keyword" : "Browse the marketplace and heart items to save them here."}
            </p>
            {!search && (
              <Link href="/marketplace" style={{ textDecoration: "none" }}>
                <button style={{ height: 42, padding: "0 28px", borderRadius: 9999, background: "#4F8EF7", border: "none", fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 4px 16px rgba(79,142,247,0.3)" }}>
                  Browse Marketplace →
                </button>
              </Link>
            )}
          </div>
        )}

        {/* Cards */}
        {!loading && filtered.length > 0 && (
          <div className="wishlist-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 18 }}>
            {filtered.map(item => {
              const { product } = item;
              const img  = product.images?.[0];
              const tag  = typeTag(product.productType);
              const href = `/marketplace/${product.productType === "digital" ? "digital" : "product"}/${product.id}`;
              return (
                <div key={item.id} className="wl-card" style={{ background: "#111827", border: "1.5px solid #1e2d45", borderRadius: 16, overflow: "hidden" }}>
                  {/* Image / Preview */}
                  <div className="wl-card-image" style={{ height: 140, background: product.productType === "digital" ? "linear-gradient(135deg,#1a0d30,#2d1b4e)" : "#1a2235", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                    {img
                      ? <img src={img} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => (e.currentTarget.style.display = "none")} />
                      : <span style={{ fontSize: 48 }}>{product.productType === "digital" ? "📄" : "📦"}</span>
                    }
                    <button onClick={() => remove(product.id)} title="Remove from wishlist" style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Heart size={14} style={{ color: "#EF4444", fill: "#EF4444" }} />
                    </button>
                  </div>

                  <div style={{ padding: "14px 16px" }}>
                    <div className="wl-card-tags" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ background: tag.bg, color: tag.color, borderRadius: 9999, padding: "2px 10px", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700 }}>{tag.label}</span>
                        {product.status && product.status.toLowerCase() !== "active" && (
                          <span style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444", borderRadius: 9999, padding: "2px 10px", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, border: "1px solid rgba(239,68,68,0.25)" }}>Sold Out</span>
                        )}
                      </div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#374151", textDecoration: "line-through" }}>₹{product.originalPrice.toLocaleString("en-IN")}</span>
                      )}
                    </div>
                    <h3 className="wl-card-title" style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, color: "#F0F4FF", marginBottom: 6, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{product.title}</h3>
                    <div className="wl-card-info-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, color: "#10B981" }}>₹{product.price.toLocaleString("en-IN")}</span>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6B7280" }}>by {product.seller?.name || "–"}</span>
                    </div>
                    <div className="wl-card-actions" style={{ display: "flex", gap: 8 }}>
                      <Link href={href} style={{ textDecoration: "none", flex: 1 }}>
                        <button className="buy-btn" style={{ width: "100%", height: 36, borderRadius: 9999, background: "#4F8EF7", border: "none", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 3px 12px rgba(79,142,247,0.3)", transition: "all 0.15s" }}>
                          <ShoppingBag size={12} /> View Item
                        </button>
                      </Link>
                      <button className="rm-btn" onClick={() => remove(product.id)} style={{ width: 36, height: 36, borderRadius: 9999, background: "transparent", border: "1.5px solid #1e2d45", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280", transition: "all 0.15s" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Browse CTA */}
        {!loading && (
          <div style={{ marginTop: 28, padding: "18px 24px", background: "linear-gradient(135deg,rgba(239,68,68,0.05),rgba(79,142,247,0.03))", border: "1px solid rgba(239,68,68,0.12)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Heart size={16} style={{ color: "#EF4444" }} />
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#9CA3AF" }}>Find more items to save. Heart any listing while browsing.</p>
            </div>
            <Link href="/marketplace" style={{ textDecoration: "none" }}>
              <button style={{ height: 38, padding: "0 20px", borderRadius: 9999, background: "transparent", border: "1.5px solid #EF4444", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#EF4444", cursor: "pointer" }}>Browse →</button>
            </Link>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </StudentLayout>
  );
}
