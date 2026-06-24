"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ChevronRight, Star, ShieldCheck, Eye, FileText, Video,
  Heart, Check, X, Loader2, PlayCircle, Download, BookOpen,
  Layers, Package, Calendar, Award, User, Clock, AlertTriangle, Info, Share2
} from "lucide-react";
import { StudentLayout } from "@/components/StudentLayout";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { usePlatformPricing } from "@/lib/usePlatformPricing";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  digitalSubType?: string;
  isApproved: boolean;
  views: number;
  createdAt?: string;
  seller: { id: string; name: string; email: string };
  college: { name: string };
  _count: { buyRequests: number };
}

const DRM_POINTS = [
  "Watermarked with YOUR academic email address",
  "Secured against screenshots and recordings",
  "Right-click and clipboard copy actions disabled",
  "Instantly traceable custom download watermark",
  "Shared copies are digitally flagged automatically"
];

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

const isDocumentUrl = (url: string) => {
  const cleanUrl = url.split("?")[0].toLowerCase();
  const ext = cleanUrl.substring(cleanUrl.lastIndexOf(".") + 1);
  return ["pdf", "doc", "docx", "ppt", "pptx", "txt"].includes(ext);
};

const isVideoUrl = (url: string) => {
  const cleanUrl = url.split("?")[0].toLowerCase();
  const ext = cleanUrl.substring(cleanUrl.lastIndexOf(".") + 1);
  return ["mp4", "webm", "mkv", "mov"].includes(ext);
};

export default function DigitalProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlisted, setWishlisted] = useState(false);
  const [toast, setToast] = useState("");
  const [buyModal, setBuyModal] = useState(false);
  const [buyStep, setBuyStep] = useState<"confirm" | "pay" | "done">("confirm");
  const [buyLoading, setBuyLoading] = useState(false);
  const [selectedUpi, setSelectedUpi] = useState("");
  const [isPurchased, setIsPurchased] = useState(false);
  const user = useAuthStore(s => s.user);
  const { pricing } = usePlatformPricing();

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const loadData = async () => {
      try {
        // Fetch product details
        const res = await api.get(`/api/marketplace/products/${id}`);
        setProduct(res.data);
        if (res.data?.title) {
          document.title = `${res.data.title} | CampusConnect`;
        }

        // Query orders to verify if student has purchased it
        const ordersRes = await api.get("/api/marketplace/orders");
        const orders = ordersRes.data || [];
        const bought = orders.some((o: any) => o.productId === id && o.status === "COMPLETED");
        const seller = res.data.sellerId === user?.id;

        if (bought || seller) {
          setIsPurchased(true);
        }

        // Fetch wishlist status
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
  }, [id, user]);

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

  async function confirmPurchase(method: string) {
    if (!product) return;
    setBuyLoading(true);
    try {
      // Buyer pays product price + platform fee (billing-only fee)
      const platformFeeAmt = parseFloat(((pricing.digitalBuyerFeePercent / 100) * product.price).toFixed(2));
      const totalBuyerAmt  = parseFloat((product.price + platformFeeAmt).toFixed(2));

      const res = await api.post("/api/marketplace/orders", {
        productId: product.id,
        amount: totalBuyerAmt,
        method,
      });
      if (res.status === 200 || res.status === 201 || res.data.orderId) {
        setBuyStep("done");
      } else {
        showToast(res.data.message || "Purchase failed");
        setBuyModal(false);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to process transaction. Try again.";
      showToast(msg);
      setBuyModal(false);
    }
    setBuyLoading(false);
  }

  // ── Loading state
  if (loading) {
    return (
      <StudentLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 16 }}>
          <div style={{ width: 44, height: 44, border: "3px solid var(--border)", borderTopColor: "var(--accent-purple)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>Preparing secure resource...</p>
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
          <span style={{ fontSize: 56 }}>📁</span>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Resource Not Found</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", marginTop: -8 }}>This digital product might have been unlisted or removed.</p>
          <Link href="/marketplace" style={{ textDecoration: "none" }}>
            <button className="btn btn-primary btn-sm" style={{ background: "var(--accent-purple)", color: "white" }}>
              Back to Marketplace
            </button>
          </Link>
        </div>
      </StudentLayout>
    );
  }

  // Split description & Specifications list
  const descParts = (product.description || "").split("📝 STRUCTURED SPECIFICATIONS:");
  const userDesc = descParts[0]?.trim();
  const specsText = descParts[1]?.trim();
  const specsArray = specsText
    ? specsText.split("\n").map(l => l.trim()).filter(Boolean)
    : [];

  const specsList: { key: string; value: string }[] = [];
  const bundleItems: { index: number; title: string; type: string; desc: string }[] = [];

  specsArray.forEach(line => {
    const trimLine = line.trim();
    if (trimLine.startsWith("[Item") || trimLine.includes("[Item")) {
      // Parse bundle items
      // Format: "[Item 1] Title (NOTES) - Description"
      const match = trimLine.match(/\[Item\s+(\d+)\]\s+([^\(]+)(?:\(([^)]+)\))?(?:\s*-\s*(.*))?/i);
      if (match) {
        bundleItems.push({
          index: parseInt(match[1]),
          title: match[2]?.trim() || "",
          type: match[3]?.trim()?.toLowerCase() || "notes",
          desc: match[4]?.trim() || "No description provided."
        });
      }
    } else {
      const colonIdx = trimLine.indexOf(":");
      if (colonIdx !== -1) {
        const key = trimLine.substring(0, colonIdx).trim();
        const value = trimLine.substring(colonIdx + 1).trim();
        if (key && value && key !== "Bundle Pack Items") {
          specsList.push({ key, value });
        }
      }
    }
  });

  // Partition files from backend
  const allFiles = product.images || [];
  const imagePreviews = allFiles.filter(isImageUrl);
  const documentFiles = allFiles.filter(isDocumentUrl);
  const videoFiles = allFiles.filter(isVideoUrl);

  const sub = product.digitalSubType || "notes";

  // Dynamic visual parameters based on digitalSubType
  let themeColor = "var(--accent-purple)";
  let themeBg = "rgba(124, 58, 237, 0.08)";
  let themeBorder = "rgba(124, 58, 237, 0.25)";
  let themeGlow = "rgba(124, 58, 237, 0.15)";
  let themeBadge = "badge-purple";
  let subtypeIcon = "📄";
  let subtypeLabel = "Study Notes / PDF";
  let subtypePreviewLabel = "Includes high-quality PDF slides with watermark protections.";

  if (sub === "video") {
    themeColor = "var(--accent-green)";
    themeBg = "rgba(16, 185, 129, 0.06)";
    themeBorder = "rgba(16, 185, 129, 0.25)";
    themeGlow = "rgba(16, 185, 129, 0.15)";
    themeBadge = "badge-green";
    subtypeIcon = "🎥";
    subtypeLabel = "Video Course Explainer";
    subtypePreviewLabel = "Includes video lectures accessible securely within our web viewer.";
  } else if (sub === "both") {
    themeColor = "var(--accent-orange)";
    themeBg = "rgba(245, 158, 11, 0.06)";
    themeBorder = "rgba(245, 158, 11, 0.25)";
    themeGlow = "rgba(245, 158, 11, 0.15)";
    themeBadge = "badge-orange";
    subtypeIcon = "📚";
    subtypeLabel = "Notes + Video Pack";
    subtypePreviewLabel = "Dual package featuring reference lectures and text study materials.";
  } else if (sub === "bundle") {
    themeColor = "var(--accent-blue)";
    themeBg = "rgba(59, 130, 246, 0.06)";
    themeBorder = "rgba(59, 130, 246, 0.25)";
    themeGlow = "rgba(59, 130, 246, 0.15)";
    themeBadge = "badge-blue";
    subtypeIcon = "📦";
    subtypeLabel = "Semester Resource Kit";
    subtypePreviewLabel = "Multi-item study pack consisting of various bundled learning files.";
  }

  const hasPurchased = buyStep === "done";

  return (
    <StudentLayout>
      <style>{`
        @keyframes modalIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .digital-page { animation: fadeInUp 0.4s ease-out forwards; }
        .glass-panel {
          background: rgba(17, 24, 39, 0.45);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
        }
        .active-glow {
          box-shadow: 0 0 20px ${themeGlow};
          border-color: ${themeBorder} !important;
        }
        .bundle-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .pay-option:hover {
          border-color: ${themeColor} !important;
          background: rgba(255, 255, 255, 0.02);
        }
      `}</style>

      {/* Toast popup */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 1000, background: "#111827", border: "1.5px solid var(--border)", color: "var(--text-primary)", borderRadius: 12, padding: "12px 20px", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, boxShadow: "var(--shadow-lifted)", display: "flex", alignItems: "center", gap: 10, animation: "modalIn 0.2s ease" }}>
          <Check size={15} style={{ color: "var(--accent-green)" }} /> {toast}
        </div>
      )}

      {/* Payment / Secure Checkout Modal */}
      {buyModal && (
        <div onClick={() => { if (buyStep !== "done" && !buyLoading) setBuyModal(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div onClick={e => e.stopPropagation()} className="glass-panel" style={{ padding: "32px", maxWidth: 430, width: "90%", animation: "modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)", border: `1.5px solid ${themeBorder}`, boxShadow: `0 0 24px ${themeGlow}` }}>

            {buyStep === "confirm" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>Order Summary</h2>
                  <button onClick={() => setBuyModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={18} /></button>
                </div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", marginBottom: 18 }}>Review your order details before proceeding to payment.</p>

                {/* Professional Invoice Breakdown */}
                {(() => {
                  const platformFeeAmt = parseFloat(((pricing.digitalBuyerFeePercent / 100) * (product?.price ?? 0)).toFixed(2));
                  const totalAmt = parseFloat(((product?.price ?? 0) + platformFeeAmt).toFixed(2));
                  return (
                    <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
                      {/* Invoice header */}
                      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Invoice Breakdown</span>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-muted)" }}>Digital Product</span>
                      </div>
                      {/* Line items */}
                      <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-soft)" }}>{product?.title}</span>
                          <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>₹{(product?.price ?? 0).toLocaleString("en-IN")}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-soft)" }}>Platform Fee</span>
                            <span style={{ fontSize: 10, background: "rgba(59,130,246,0.1)", color: "#60A5FA", padding: "2px 7px", borderRadius: 99, fontWeight: 700 }}>{pricing.digitalBuyerFeePercent}%</span>
                          </div>
                          <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "#60A5FA" }}>₹{platformFeeAmt.toLocaleString("en-IN")}</span>
                        </div>
                        <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Total Payable</span>
                          <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: themeColor }}>₹{totalAmt.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                      {/* Access info */}
                      <div style={{ padding: "10px 18px", background: "rgba(16,185,129,0.04)", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                        <Check size={12} style={{ color: "var(--accent-green)", flexShrink: 0 }} />
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)" }}>Permanent lifetime access granted immediately after payment</span>
                      </div>
                    </div>
                  );
                })()}

                <button
                  onClick={() => setBuyStep("pay")}
                  style={{ width: "100%", height: 48, borderRadius: 9999, background: themeColor, border: "none", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 16px ${themeGlow}` }}
                >
                  💳 Proceed to Payment
                </button>
                <button onClick={() => setBuyModal(false)} style={{ width: "100%", height: 38, borderRadius: 9999, background: "transparent", border: "1px solid var(--border)", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-soft)", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.borderColor = "var(--text-soft)"} onMouseOut={e => e.currentTarget.style.borderColor = "var(--border)"}>Cancel</button>
              </>
            )}

            {buyStep === "pay" && (
              <>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>Choose Secured Method</h2>
                {buyLoading ? (
                  <div style={{ textAlign: "center", padding: "28px 0" }}>
                    <Loader2 size={36} style={{ color: themeColor, animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", marginTop: 12 }}>Securing transaction channel...</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { icon: "📱", label: "Google Pay / PhonePe / UPI", method: "upi" },
                      { icon: "💳", label: "Debit or Credit Cards", method: "card" },
                      { icon: "🏦", label: "Instant Netbanking", method: "netbanking" }
                    ].map(m => (
                      <div
                        key={m.label}
                        onClick={() => confirmPurchase(m.method)}
                        className="pay-option"
                        style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(0,0,0,0.25)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "all 0.2s" }}
                      >
                        <span style={{ fontSize: 22 }}>{m.icon}</span>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{m.label}</span>
                      </div>
                    ))}
                    <button onClick={() => setBuyStep("confirm")} style={{ width: "100%", height: 38, borderRadius: 9999, background: "transparent", border: "1px solid var(--border)", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", cursor: "pointer", marginTop: 6 }}>← Back to Review</button>
                  </div>
                )}
              </>
            )}

            {buyStep === "done" && (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>Access Granted!</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", marginBottom: 22 }}>Your purchase was successful. Lifetime DRM secured access is added to your account library.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                  {sub === "notes" || sub === "both" ? (
                    <Link href={`/marketplace/viewer/pdf?id=${product.id}`} style={{ textDecoration: "none", width: "100%" }}>
                      <button className="btn btn-primary" style={{ background: "var(--accent-purple)", width: "100%", gap: 8, height: 46, cursor: "pointer" }}>
                        <FileText size={15} /> Launch Secure PDF Reader
                      </button>
                    </Link>
                  ) : null}
                  {sub === "video" || sub === "both" ? (
                    <Link href={`/marketplace/viewer/video?id=${product.id}`} style={{ textDecoration: "none", width: "100%" }}>
                      <button className="btn btn-primary" style={{ background: "var(--accent-green)", width: "100%", gap: 8, height: 46, cursor: "pointer" }}>
                        <PlayCircle size={15} /> Launch Secure Video Player
                      </button>
                    </Link>
                  ) : null}
                  {sub === "bundle" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <Link href={`/marketplace/viewer/pdf?id=${product.id}`} style={{ textDecoration: "none", width: "100%" }}>
                        <button className="btn btn-primary" style={{ background: "var(--accent-purple)", width: "100%", gap: 8, height: 44, cursor: "pointer" }}>
                          📖 Read Bundled Notes (PDF)
                        </button>
                      </Link>
                      <Link href={`/marketplace/viewer/video?id=${product.id}`} style={{ textDecoration: "none", width: "100%" }}>
                        <button className="btn btn-primary" style={{ background: "var(--accent-green)", width: "100%", gap: 8, height: 44, cursor: "pointer" }}>
                          🎥 Watch Bundled Lectures
                        </button>
                      </Link>
                    </div>
                  )}
                </div>

                <button onClick={() => { setBuyModal(false); setBuyStep("confirm"); }} style={{ width: "100%", height: 38, borderRadius: 9999, background: "transparent", border: "1px solid var(--border)", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-soft)", cursor: "pointer", marginTop: 8 }}>Close Dashboard</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="digital-page" style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px 60px" }}>

        {/* Breadcrumb Trail */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            ["Marketplace", "/marketplace"],
            ["Digital Resources", "/marketplace?type=digital"],
            [product.title, "#"]
          ].map(([b, href], i) => (
            <span key={b} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {i > 0 && <ChevronRight size={13} style={{ color: "var(--text-muted)" }} />}
              {i === 2 ? (
                <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-primary)", fontWeight: 600 }}>{b}</span>
              ) : (
                <Link href={href} style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", fontWeight: 400, textDecoration: "none" }}>{b}</Link>
              )}
            </span>
          ))}
        </div>

        {/* Dynamic Detail Sections Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }} className="md:grid-cols-[1fr_380px] grid">

          {/* LEFT SIDEBAR: Resource Showcase card, description, bundle items, and specifications */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {/* Top Showcase Frame */}
            <div className="glass-panel active-glow" style={{ position: "relative", overflow: "hidden", padding: "40px 32px", display: "flex", flexDirection: "column", alignItems: "center", background: `linear-gradient(135deg, rgba(10,14,26,0.9), ${themeBg})` }}>
              <div style={{ width: 84, height: 84, borderRadius: 20, background: themeBg, border: `1.5px solid ${themeBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, marginBottom: 18, boxShadow: `0 0 14px ${themeGlow}` }}>
                {subtypeIcon}
              </div>

              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8, textAlign: "center", lineHeight: 1.3 }}>{product.title}</h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-soft)", marginBottom: 20, textAlign: "center" }}>{subtypePreviewLabel}</p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                <span className={`badge ${themeBadge}`} style={{ textTransform: "uppercase" }}>{subtypeLabel}</span>
                <span className="badge" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text-soft)" }}>♾️ Lifetime Access</span>
                <span className="badge" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text-soft)" }}>🔒 Secured DRM</span>
              </div>
            </div>

            {/* Structured Specifications Metadata */}
            {specsList.length > 0 && (
              <div className="glass-panel" style={{ padding: "28px" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Academic Specifications</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  {specsList.map((spec, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.8 }}>{spec.key}</span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", fontWeight: 600 }}>{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Semester Custom Bundle Item index list */}
            {sub === "bundle" && bundleItems.length > 0 && (
              <div className="glass-panel" style={{ padding: "28px" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>Inside this Semester Pack ({bundleItems.length} resources)</h3>

                <div style={{ display: "flex", flexDirection: "column", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                  {bundleItems.map((item, idx) => {
                    const isNotes = item.type.includes("note") || item.type.includes("pdf");
                    const isVideo = item.type.includes("video") || item.type.includes("course");

                    return (
                      <div key={idx} className="bundle-row" style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: 14, padding: "16px 20px", borderBottom: idx === bundleItems.length - 1 ? "none" : "1px solid var(--border)" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: isNotes ? "rgba(124, 58, 237, 0.08)" : isVideo ? "rgba(16, 185, 129, 0.08)" : "rgba(59, 130, 246, 0.08)", border: `1px solid ${isNotes ? "rgba(124,58,237,0.2)" : isVideo ? "rgba(16,185,129,0.2)" : "rgba(59,130,246,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                          {isNotes ? "📄" : isVideo ? "🎥" : "📂"}
                        </div>
                        <div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 3 }}>
                            <h4 style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{item.title}</h4>
                            <span className="badge" style={{ height: 18, fontSize: 9, padding: "0 8px", background: isNotes ? "rgba(124,58,237,0.12)" : isVideo ? "rgba(16,185,129,0.12)" : "rgba(59,130,246,0.12)", color: isNotes ? "#A78BFA" : isVideo ? "var(--accent-green)" : "var(--accent-blue)", border: "none" }}>{item.type.toUpperCase()}</span>
                          </div>
                          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cleaned Description */}
            <div className="glass-panel" style={{ padding: "28px" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>Description & Objectives</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-soft)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                {userDesc || "No manual description provided by the instructor."}
              </p>
            </div>

          </div>

          {/* RIGHT SIDEBAR: Purchase CTAs, platform stats, DRM details, Seller profile card */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Wishlist Header Tool */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={handleWishlist} style={{ width: 38, height: 38, borderRadius: "50%", background: wishlisted ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${wishlisted ? "rgba(239,68,68,0.3)" : "var(--border)"}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                <Heart size={16} style={{ color: wishlisted ? "var(--accent-red)" : "var(--text-soft)", fill: wishlisted ? "var(--accent-red)" : "none" }} />
              </button>
              <button onClick={handleShare} style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"} onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>
                <Share2 size={15} style={{ color: "var(--text-soft)" }} />
              </button>
            </div>

            {/* Secure Purchase CTA widget */}
            <div className="glass-panel" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Price display — NO platform fee shown here */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Listed Price</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>₹{(product?.price ?? 0).toLocaleString("en-IN")}</span>
                </div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: 99 }}>+ fees at checkout</span>
              </div>

              <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />

              {isPurchased ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {sub === "notes" || sub === "both" ? (
                    <Link href={`/marketplace/viewer/pdf?id=${product.id}`} style={{ textDecoration: "none", width: "100%" }}>
                      <button className="btn btn-primary btn-lg" style={{ width: "100%", background: "var(--accent-purple)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        📖 Launch Secure PDF Reader
                      </button>
                    </Link>
                  ) : null}
                  {sub === "video" || sub === "both" ? (
                    <Link href={`/marketplace/viewer/video?id=${product.id}`} style={{ textDecoration: "none", width: "100%" }}>
                      <button className="btn btn-primary btn-lg" style={{ width: "100%", background: "var(--accent-green)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        🎥 Launch Secure Video Player
                      </button>
                    </Link>
                  ) : null}
                  {sub === "bundle" && (
                    <>
                      <Link href={`/marketplace/viewer/pdf?id=${product.id}`} style={{ textDecoration: "none", width: "100%" }}>
                        <button className="btn btn-primary btn-lg" style={{ width: "100%", background: "var(--accent-purple)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
                          📖 Read Bundled Notes (PDF)
                        </button>
                      </Link>
                      <Link href={`/marketplace/viewer/video?id=${product.id}`} style={{ textDecoration: "none", width: "100%" }}>
                        <button className="btn btn-primary btn-lg" style={{ width: "100%", background: "var(--accent-green)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          🎥 Watch Bundled Lectures
                        </button>
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button
                    onClick={() => { setBuyModal(true); setBuyStep("confirm"); }}
                    className="btn btn-primary btn-lg"
                    style={{ width: "100%", background: themeColor, boxShadow: `0 4px 16px ${themeGlow}`, border: "none", cursor: "pointer" }}
                  >
                    Instant Buy & Unlock
                  </button>

                  {sub === "notes" || sub === "both" || sub === "bundle" ? (
                    <Link href={`/marketplace/viewer/pdf?id=${product.id}&preview=true`} style={{ textDecoration: "none", width: "100%" }}>
                      <button className="btn btn-outline-white" style={{ width: "100%", height: 42, borderColor: themeColor, color: themeColor, background: "transparent", border: "1.5px solid", borderRadius: 9999, fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        📖 Read Free Preview (2 Pages)
                      </button>
                    </Link>
                  ) : null}
                  {sub === "video" || sub === "both" ? (
                    <Link href={`/marketplace/viewer/video?id=${product.id}&preview=true`} style={{ textDecoration: "none", width: "100%" }}>
                      <button className="btn btn-outline-white" style={{ width: "100%", height: 42, borderColor: themeColor, color: themeColor, background: "transparent", border: "1.5px solid", borderRadius: 9999, fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        🎬 Watch Free Preview (5 Mins)
                      </button>
                    </Link>
                  ) : null}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><Eye size={12} /> {product.views} Views</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>Platform Secured</span>
              </div>
            </div>

            {/* DRM security box */}
            <div style={{ background: "rgba(124, 58, 237, 0.03)", border: `1px solid ${themeBorder}`, borderRadius: 16, padding: "20px 22px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
                <ShieldCheck size={16} style={{ color: themeColor }} />
                <p style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: themeColor }}>Digital Content Protection</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {DRM_POINTS.map(pt => (
                  <div key={pt} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <Check size={13} style={{ color: "var(--accent-green)", flexShrink: 0, marginTop: 3 }} />
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-soft)", lineHeight: 1.4 }}>{pt}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 10, padding: "10px 14px", marginTop: 16, display: "flex", gap: 8 }}>
                <AlertTriangle size={14} style={{ color: "var(--accent-red)", flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--accent-red)", lineHeight: 1.4 }}>
                  <strong>Policy Violation Notice:</strong> Sharing or distribution of secured assets results in immediate profile suspension and academic reporting.
                </p>
              </div>
            </div>

            {/* Instructor / Seller profile card */}
            <div className="glass-panel" style={{ padding: "20px" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Resource Creator</p>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg, ${themeColor}, var(--accent-purple))`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 800, color: "#fff", boxShadow: "var(--shadow-card)", flexShrink: 0 }}>
                  {initials(product.seller.name)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.seller.name}</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.college.name}</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </StudentLayout>
  );
}
