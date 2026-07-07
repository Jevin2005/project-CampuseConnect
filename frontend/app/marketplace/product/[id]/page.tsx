"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ChevronRight, Star, ShieldCheck, MessageCircle, ShoppingBag,
  Heart, Share2, Check, X, Send, Loader2, Eye, Calendar, Tag, Info
} from "lucide-react";
import { StudentLayout } from "@/components/StudentLayout";
import api from "@/lib/axios";
import { usePlatformPricing, calcPhysicalListingFee, findTier } from "@/lib/usePlatformPricing";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  condition: string;
  productType: string;
  status: string;
  isApproved: boolean;
  views: number;
  createdAt?: string;
  seller: { id: string; name: string; email: string; phone?: string };
  college: { name: string };
  _count: { buyRequests: number };
}

function initials(name: string) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();
}

const isImageUrl = (url: string) => {
  const cleanUrl = url.split("?")[0].toLowerCase();
  const ext = cleanUrl.substring(cleanUrl.lastIndexOf(".") + 1);
  return ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
};

export default function PhysicalProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mainThumb, setMainThumb] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [toast, setToast] = useState("");
  const [showRequest, setShowRequest] = useState(false);
  const [reqMsg, setReqMsg] = useState("");
  const [reqSent, setReqSent] = useState(false);
  const [reqLoading, setReqLoading] = useState(false);
  const { pricing } = usePlatformPricing();

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  // Fetch product & Set Page Title & Wishlist Status
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const res = await api.get(`/api/marketplace/products/${id}`);
        setProduct(res.data);
        if (res.data?.title) {
          document.title = `${res.data.title} | CampusConnect`;
        }

        // Fetch wishlist to see if this product is saved
        const wishlistRes = await api.get("/api/marketplace/wishlist");
        const wishlist = wishlistRes.data || [];
        const exists = wishlist.some((item: any) => item.product?.id === id);
        setWishlisted(exists);
      } catch (err: any) {
        setError(err.response?.data?.message || "Product not found");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  async function handleWishlist() {
    if (!product) return;
    try {
      if (wishlisted) {
        await api.delete(`/api/marketplace/wishlist/${product.id}`);
        setWishlisted(false);
        showToast("Removed from wishlist");
      } else {
        await api.post(`/api/marketplace/wishlist`, { productId: product.id });
        setWishlisted(true);
        showToast("Added to wishlist ❤️");
      }
    } catch (err: any) {
      showToast("Failed to update wishlist");
    }
  }

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href).catch(() => { });
    showToast("Link copied to clipboard! 🔗");
  }

  async function sendRequest() {
    if (!reqMsg.trim() || reqLoading || !product) return;
    setReqLoading(true);
    try {
      await api.post(`/api/marketplace/products/${product.id}/request`, { message: reqMsg });
      setReqSent(true);
      setTimeout(() => {
        setShowRequest(false);
        setReqSent(false);
        setReqMsg("");
        showToast("Request sent! Seller will respond shortly. 📬");
      }, 1400);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to send request";
      showToast(msg);
      setShowRequest(false);
    }
    setReqLoading(false);
  }

  // ── Loading state
  if (loading) {
    return (
      <StudentLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 16 }}>
          <div style={{ width: 44, height: 44, border: "3px solid var(--border)", borderTopColor: "var(--accent-blue)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>Loading item details...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </StudentLayout>
    );
  }

  // ── Error / not found
  if (error || !product) {
    return (
      <StudentLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 16 }}>
          <span style={{ fontSize: 56 }}>📦</span>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Product Not Found</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", marginTop: -8 }}>This item may have been sold or removed by the seller.</p>
          <a href="/marketplace" style={{ textDecoration: "none" }}>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
              Back to Marketplace
            </button>
          </a>
        </div>
      </StudentLayout>
    );
  }

  // Enriched Description & Specifications Splitting
  const descParts = (product.description || "").split("📝 STRUCTURED SPECIFICATIONS:");
  const userDesc = descParts[0]?.trim();
  const specsText = descParts[1]?.trim();
  const specsArray = specsText
    ? specsText.split("\n").map(l => l.trim()).filter(Boolean)
    : [];

  const specsList: { key: string; value: string }[] = [];
  specsArray.forEach(line => {
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const key = line.substring(0, colonIdx).trim();
      const value = line.substring(colonIdx + 1).trim();
      if (key && value) {
        specsList.push({ key, value });
      }
    }
  });

  // Filter actual image URLs
  const allImages = product.images || [];
  const onlyImages = allImages.filter(isImageUrl);
  const displayedImages = onlyImages.length > 0 ? onlyImages : [];

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  // Format creation date
  const dateFormatted = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
    : "";

  return (
    <StudentLayout>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes modalIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
        .pd-page { animation: fadeUp 0.4s ease-out forwards; }
        .glass-panel {
          background: rgba(17, 24, 39, 0.45);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
        }
        .thumb-active {
          border-color: var(--accent-blue) !important;
          box-shadow: 0 0 10px rgba(79, 142, 247, 0.25);
        }
        .spec-row:nth-child(even) {
          background: rgba(255, 255, 255, 0.02);
        }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 1000, background: "#111827", border: "1.5px solid var(--border)", color: "var(--text-primary)", borderRadius: 12, padding: "12px 20px", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, boxShadow: "var(--shadow-lifted)", display: "flex", alignItems: "center", gap: 10, animation: "modalIn 0.2s ease" }}>
          <Check size={15} style={{ color: "var(--accent-green)" }} /> {toast}
        </div>
      )}

      {/* Send Request Modal */}
      {showRequest && (
        <div onClick={() => { if (!reqLoading) setShowRequest(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div onClick={e => e.stopPropagation()} className="glass-panel" style={{ padding: "28px 32px", maxWidth: 460, width: "90%", animation: "modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            {!reqSent ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>Send Buy Request</h2>
                  <button onClick={() => setShowRequest(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={20} /></button>
                </div>

                {/* Product summary card */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: "12px 16px", border: "1px solid var(--border)", marginBottom: 18 }}>
                  {displayedImages[0] ? (
                    <img src={displayedImages[0]} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📦</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{product.title}</p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)" }}>Seller: {product.seller.name} · ₹{product.price.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                {/* Safe meetup guide */}
                <div style={{ background: "rgba(247,201,72,0.06)", border: "1px solid rgba(247,201,72,0.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 18, display: "flex", gap: 10 }}>
                  <Info size={16} style={{ color: "var(--accent-gold)", flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-soft)", lineHeight: 1.5 }}>
                    <strong style={{ color: "var(--accent-gold)" }}>In-Person Verification Required.</strong> Payments for physical items happen physically on campus. Exchange and pay only after inspection.
                  </p>
                </div>

                {/* Instant Templates */}
                <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>QUICK TEMPLATES:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {[
                    "Hi! Is this still available?",
                    "Can we meet on campus tomorrow?",
                    "Is the price negotiable?"
                  ].map(q => (
                    <button key={q} onClick={() => setReqMsg(q)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 12px", fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-soft)", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"} onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}>{q}</button>
                  ))}
                </div>

                <textarea
                  value={reqMsg}
                  onChange={e => setReqMsg(e.target.value)}
                  placeholder="Type a polite message to coordinate meetup details with the seller..."
                  rows={4}
                  style={{ width: "100%", background: "rgba(0,0,0,0.25)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-primary)", outline: "none", resize: "none", boxSizing: "border-box", marginBottom: 18 }}
                />

                <button
                  onClick={sendRequest}
                  disabled={!reqMsg.trim() || reqLoading}
                  style={{ width: "100%", height: 46, borderRadius: 9999, background: reqMsg.trim() && !reqLoading ? "var(--accent-blue)" : "rgba(255,255,255,0.05)", border: "none", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: reqMsg.trim() && !reqLoading ? "#fff" : "var(--text-muted)", cursor: reqMsg.trim() && !reqLoading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.2s", boxShadow: reqMsg.trim() && !reqLoading ? "0 4px 16px rgba(79, 142, 247, 0.3)" : "none" }}
                >
                  {reqLoading ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : <Send size={15} />}
                  {reqLoading ? "Sending request..." : "Send Request to Seller"}
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--accent-green)", marginBottom: 8 }}>Buy Request Sent!</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-soft)" }}>We have notified the seller. Keep an eye on your Inbox for responses!</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="pd-page" style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px 60px" }}>

        {/* Breadcrumb Trail */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            ["Marketplace", "/marketplace"],
            [product.category || "Items", `/marketplace?category=${encodeURIComponent(product.category || "")}`],
            [product.title, "#"]
          ].map(([b, href], i) => (
            <span key={b} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {i > 0 && <ChevronRight size={13} style={{ color: "var(--text-muted)" }} />}
              {i === 2 ? (
                <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-primary)", fontWeight: 600 }}>{b}</span>
              ) : (
                <a href={href} style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", fontWeight: 400, textDecoration: "none" }}>{b}</a>
              )}
            </span>
          ))}
        </div>

        {/* Core Layout Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }} className="md:grid-cols-[1fr_380px] grid">

          {/* LEFT COLUMN: Media Showcase, Description, Technical Specifications */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {/* Visual Header Panel */}
            <div className="glass-panel" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span className={`badge ${product.isApproved ? "badge-green" : "badge-orange"}`} style={{ display: "inline-flex", gap: 6 }}>
                  {product.isApproved ? (
                    <>
                      <Check size={11} /> Verified For Sale
                    </>
                  ) : (
                    "Awaiting Admin Review"
                  )}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleWishlist} style={{ width: 38, height: 38, borderRadius: "50%", background: wishlisted ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${wishlisted ? "rgba(239,68,68,0.3)" : "var(--border)"}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                    <Heart size={16} style={{ color: wishlisted ? "var(--accent-red)" : "var(--text-soft)", fill: wishlisted ? "var(--accent-red)" : "none" }} />
                  </button>
                  <button onClick={handleShare} style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"} onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>
                    <Share2 size={15} style={{ color: "var(--text-soft)" }} />
                  </button>
                </div>
              </div>

              {/* Core Hero Frame */}
              <div style={{ borderRadius: 12, overflow: "hidden", background: "rgba(0,0,0,0.35)", height: 380, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", marginBottom: 16 }}>
                {displayedImages.length > 0 ? (
                  <img src={displayedImages[mainThumb]} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 72 }}>📦</span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>No item preview image available</span>
                  </div>
                )}
              </div>

              {/* Image Carousel Previews */}
              {displayedImages.length > 1 && (
                <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
                  {displayedImages.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setMainThumb(i)}
                      className={`glass-panel ${mainThumb === i ? "thumb-active" : ""}`}
                      style={{ width: 72, height: 64, flexShrink: 0, overflow: "hidden", cursor: "pointer", transition: "all 0.2s", padding: 2, border: "1.5px solid var(--border)" }}
                    >
                      <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description & Technical specifications */}
            <div className="glass-panel" style={{ padding: "28px" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>About this product</h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-soft)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                {userDesc || "No manual description provided by the seller."}
              </p>

              {/* Categorization & stats */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
                <span style={{ background: "rgba(79,142,247,0.1)", color: "var(--accent-blue)", borderRadius: 6, padding: "5px 12px", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600 }}>{product.condition} Condition</span>
                <span style={{ background: "rgba(16,185,129,0.08)", color: "var(--accent-green)", borderRadius: 6, padding: "5px 12px", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600 }}>👁 {product.views} Views</span>
                <span style={{ background: "rgba(247,201,72,0.08)", color: "var(--accent-gold)", borderRadius: 6, padding: "5px 12px", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600 }}>📬 {product._count.buyRequests} Interest Requests</span>
              </div>
            </div>

            {/* Structured Specifications Grid */}
            {specsList.length > 0 && (
              <div className="glass-panel" style={{ padding: "28px" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Structured Specifications</h3>
                <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)" }}>
                  {specsList.map((spec, i) => (
                    <div key={i} className="spec-row" style={{ display: "grid", gridTemplateColumns: "180px 1fr", borderBottom: i === specsList.length - 1 ? "none" : "1px solid var(--border)", padding: "12px 20px" }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--text-soft)" }}>{spec.key}</span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-primary)" }}>{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar details, Pricing, CTA request, Seller details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Purchase CTA Card */}
            <div className="glass-panel" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span className="badge badge-blue">📦 Physical Item</span>
                {product.status === "active" ? (
                  <span className="badge badge-green">Available</span>
                ) : (
                  <span className="badge badge-orange">{product.status}</span>
                )}
                {discount > 0 && <span className="badge" style={{ background: "rgba(239,68,68,0.15)", color: "var(--accent-red)", border: "1px solid rgba(239,68,68,0.25)" }}>-{discount}%</span>}
              </div>

              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", lineHeight: 1.3 }}>
                {product.title}
              </h1>

              {/* Price card details */}
              <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginTop: 8 }}>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 18px", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>Retail MRP</span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", textDecoration: "line-through" }}>₹{product.originalPrice.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {/* Seller listing fee info */}
                {(() => {
                  const tier = findTier(product.price, pricing.physicalTiers);
                  const listingFee = calcPhysicalListingFee(product.price, pricing.physicalTiers);
                  return tier ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 18px", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>Seller Listing Fee</span>
                        <span style={{ fontSize: 10, background: "rgba(247,201,72,0.1)", color: "#F7C948", padding: "2px 7px", borderRadius: 99, fontWeight: 700 }}>
                          {tier.type === "fixed" ? `₹${tier.value}` : `${tier.value}%`}
                        </span>
                      </div>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#F7C948", fontWeight: 600 }}>₹{listingFee.toLocaleString("en-IN")}</span>
                    </div>
                  ) : null;
                })()}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 18px", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>Buyer Platform Fee</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--accent-green)", fontWeight: 600 }}>Free for Buyer ✔</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px" }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-soft)", fontWeight: 500 }}>You Pay</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--accent-green)" }}>₹{product.price.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                onClick={() => setShowRequest(true)}
                disabled={product.status !== "active"}
                className={`btn btn-lg ${product.status === "active" ? "btn-primary" : "btn-secondary"}`}
                style={{ width: "100%", marginTop: 8, cursor: product.status === "active" ? "pointer" : "not-allowed" }}
              >
                {product.status === "active" ? (
                  <>
                    <ShoppingBag size={16} /> Send Buy Request
                  </>
                ) : (
                  "Sold Out"
                )}
              </button>

              <div style={{ background: "rgba(16,185,129,0.03)", border: "1px solid rgba(16,185,129,0.12)", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start", marginTop: 4 }}>
                <ShieldCheck size={16} style={{ color: "var(--accent-green)", flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  <strong style={{ color: "var(--accent-green)" }}>Campus Meetup:</strong> Physical marketplace items require face-to-face inspection and manual transaction on campus. Pay only when satisfied.
                </p>
              </div>
            </div>

            {/* Seller Contact Card */}
            <div className="glass-panel" style={{ padding: "20px" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Listed by Seller</p>

              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 800, color: "#fff", boxShadow: "var(--shadow-card)" }}>
                  {initials(product.seller.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.seller.name}</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.college.name}</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "rgba(0,0,0,0.15)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Calendar size={13} style={{ color: "var(--text-muted)" }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-soft)" }}>Listed on {dateFormatted || "Recently"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Tag size={13} style={{ color: "var(--text-muted)" }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-soft)" }}>Category: {product.category}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </StudentLayout>
  );
}
