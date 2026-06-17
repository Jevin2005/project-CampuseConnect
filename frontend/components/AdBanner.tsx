"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { X, MapPin, Phone, ExternalLink, Star, Building2, Megaphone, GraduationCap, ChevronRight } from "lucide-react";

const trackAdClick = (adId?: string) => {
  if (adId) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    fetch(`${API_URL}/api/marketplace/ads/${adId}/click`, { method: 'POST' }).catch(() => {});
  }
};

/* ─── Ad Types & Format ─────────────────────────────────────────────── */
export type AdType = "hostel" | "pg" | "college_event" | "cross_college" | "sponsored";
export type AdFormat = "strip" | "banner" | "square" | "portrait" | "card";

export interface AdData {
  id: string;
  type: AdType;
  format?: AdFormat;          // controls how it renders in marketplace
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  tagColor: string;
  bgGradient: string;
  accentColor: string;
  glowColor: string;
  ctaLabel: string;
  ctaLink?: string;
  badge?: string;
  stats?: { label: string; value: string }[];
  contact?: string;
  location?: string;
  rating?: number;
  college?: string;
  icon: string;
  dismissible?: boolean;
  bannerUrl?: string;         // actual uploaded image URL
  adId?: string;              // DB id for tracking
}

/* ─── Helper: TypeIcon ───────────────────────────────────────────────── */
function TypeIcon({ type, size = 9 }: { type: AdType; size?: number }) {
  const Icon =
    type === "hostel" || type === "pg" ? Building2 :
    type === "college_event" ? GraduationCap : Megaphone;
  return <Icon size={size} />;
}

/* ─── Shared dismiss button ─────────────────────────────────────────── */
function DismissBtn({ onClick, pos = {} }: { onClick: () => void; pos?: React.CSSProperties }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        position: "absolute", zIndex: 10, width: 24, height: 24, borderRadius: "50%",
        background: "rgba(0,0,0,0.55)", border: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "#9CA3AF", ...pos,
      }}
    >
      <X size={12} />
    </button>
  );
}

/* ─── Shared Ad Details Modal ───────────────────────────────────────── */
interface AdDetailModalProps {
  ad: AdData;
  onClose: () => void;
}

function AdDetailModal({ ad, onClose }: AdDetailModalProps) {
  useEffect(() => {
    if (ad.adId) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      fetch(`${API_URL}/api/marketplace/ads/${ad.adId}/click`, { method: 'POST' }).catch(() => {});
    }
  }, [ad.adId]);

  const handleCtaClick = async () => {
    if (ad.ctaLink) {
      window.open(ad.ctaLink, "_blank");
    }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const imgUrl = ad.bannerUrl ? (ad.bannerUrl.startsWith("http") || ad.bannerUrl.startsWith("data:") ? ad.bannerUrl : `${API_URL}${ad.bannerUrl}`) : null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(3, 7, 18, 0.82)",
        backdropFilter: "blur(12px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        cursor: "default",
        animation: "adFadeIn 0.25s ease-out",
      }}
    >
      <style>{`
        @keyframes adFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes adScaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0d131f",
          border: "1.5px solid #1e2d45",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "580px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: `0 24px 64px rgba(0, 0, 0, 0.7), 0 0 40px ${ad.glowColor || 'rgba(79, 142, 247, 0.15)'}`,
          animation: "adScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            zIndex: 10,
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "rgba(10, 14, 26, 0.7)",
            border: "1px solid #1e2d45",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#9CA3AF",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#F0F4FF";
            e.currentTarget.style.borderColor = ad.accentColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#9CA3AF";
            e.currentTarget.style.borderColor = "#1e2d45";
          }}
        >
          <X size={16} />
        </button>

        {/* Hero image or fallback */}
        <div style={{ height: "240px", width: "100%", position: "relative", overflow: "hidden", flexShrink: 0 }}>
          {imgUrl ? (
            <img src={imgUrl} alt={ad.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: ad.bgGradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "72px", filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))" }}>{ad.icon}</span>
            </div>
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0d131f 0%, transparent 60%)" }} />
          
          {/* Scope Tag */}
          <span style={{
            position: "absolute",
            bottom: "16px",
            left: "20px",
            background: `${ad.accentColor}22`,
            color: ad.accentColor,
            fontSize: "10px",
            fontWeight: 800,
            letterSpacing: "1.5px",
            padding: "4px 12px",
            borderRadius: "6px",
            border: `1px solid ${ad.accentColor}50`,
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}>
            <TypeIcon type={ad.type} /> {ad.tag}
          </span>
        </div>

        {/* Info Body */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "24px", fontWeight: 800, color: "#F0F4FF", marginBottom: "6px", lineHeight: 1.25 }}>
              {ad.title}
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: ad.accentColor, fontWeight: 500 }}>
              {ad.subtitle}
            </p>
          </div>

          <div style={{ height: "1px", background: "#1e2d45" }} />

          <div>
            <h4 style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "#6B7280", marginBottom: "8px" }}>
              About This Poster
            </h4>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#C4CFDF", lineHeight: 1.6, whiteSpace: "pre-line" }}>
              {ad.description}
            </p>
          </div>

          {/* Metadata Grid */}
          {(ad.location || ad.contact || ad.rating || ad.college) && (
            <>
              <div style={{ height: "1px", background: "#1e2d45" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {ad.location && (
                  <div style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: "10px", padding: "10px 14px" }}>
                    <div style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#6B7280", marginBottom: "4px" }}>📍 Address / Location</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#F0F4FF" }}>{ad.location}</div>
                  </div>
                )}
                {ad.contact && (
                  <div style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: "10px", padding: "10px 14px" }}>
                    <div style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#6B7280", marginBottom: "4px" }}>📞 Contact Info</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#F0F4FF" }}>{ad.contact}</div>
                  </div>
                )}
                {ad.college && (
                  <div style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: "10px", padding: "10px 14px" }}>
                    <div style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#6B7280", marginBottom: "4px" }}>🏫 Publisher College</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#F0F4FF" }}>{ad.college}</div>
                  </div>
                )}
                {ad.rating && (
                  <div style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: "10px", padding: "10px 14px" }}>
                    <div style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#6B7280", marginBottom: "4px" }}>⭐ Rating</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#F7C948", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Star size={12} style={{ fill: "#F7C948" }} /> {ad.rating} / 5
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* CTA Actions */}
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                height: "44px",
                borderRadius: "9999px",
                border: "1.5px solid #1e2d45",
                background: "transparent",
                color: "#9CA3AF",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#F0F4FF";
                e.currentTarget.style.borderColor = "#9CA3AF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#9CA3AF";
                e.currentTarget.style.borderColor = "#1e2d45";
              }}
            >
              Close
            </button>
            <button
              onClick={handleCtaClick}
              style={{
                flex: 2,
                height: "44px",
                borderRadius: "9999px",
                border: "none",
                background: `linear-gradient(90deg, ${ad.accentColor}, ${ad.accentColor}cc)`,
                color: "#0A0E1A",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: `0 4px 20px ${ad.glowColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              {ad.ctaLabel} <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Helper: Hook to track views ────────────────────────────────────── */
function useTrackView(adId?: string) {
  useEffect(() => {
    if (adId) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      fetch(`${API_URL}/api/marketplace/ads/${adId}/view`, { method: 'POST' }).catch(() => {});
    }
  }, [adId]);
}

/* ════════════════════════════════════════════════════════════════════════
   1. STRIP AD — full-width slim bar (like a ticker/leaderboard)
      Ratio: ~8:1   Recommended: 1200×150px
 ════════════════════════════════════════════════════════════════════════ */
export function AdStrip({ ad }: { ad: AdData }) {
  const [dismissed, setDismissed] = useState(false);
  useTrackView(ad.adId);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const imgUrl = ad.bannerUrl ? (ad.bannerUrl.startsWith("http") || ad.bannerUrl.startsWith("data:") ? ad.bannerUrl : `${API_URL}${ad.bannerUrl}`) : null;

  if (dismissed) return null;

  return (
    <Link
      href={`/marketplace/ads/${ad.adId || ad.id}`}
      onClick={() => trackAdClick(ad.adId)}
      style={{ textDecoration: "none", display: "block", width: "100%" }}
    >
      <div 
        style={{
          background: imgUrl ? "transparent" : `linear-gradient(90deg, ${ad.accentColor}14, ${ad.bgGradient.includes("gradient") ? "transparent" : ad.accentColor + "06"})`,
          border: `1px solid ${ad.accentColor}35`,
          borderRadius: 10, padding: "11px 16px",
          display: "flex", alignItems: "center", gap: 12,
          position: "relative", overflow: "hidden",
          cursor: "pointer",
          width: "100%",
          minHeight: 52,
        }}
        className="ad-strip-responsive"
      >
        <style>{`
          @media (min-width: 640px) {
            .ad-strip-responsive {
              aspect-ratio: 8/1;
              padding: 0 24px !important;
            }
          }
          @media (max-width: 640px) {
            .ad-strip-responsive {
              padding: 12px 16px !important;
            }
            .ad-strip-responsive .ad-strip-content {
              flex-wrap: wrap !important;
              gap: 8px !important;
            }
            .ad-strip-responsive .ad-strip-actions {
              width: 100% !important;
              justify-content: space-between !important;
              margin-top: 4px !important;
            }
          }
        `}</style>

        {imgUrl ? (
          <>
            <img src={imgUrl} alt={ad.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, rgba(10,14,26,0.95) 0%, rgba(10,14,26,0.85) 45%, rgba(10,14,26,0.5) 75%, transparent 100%)`, zIndex: 1 }} />
          </>
        ) : (
          <div style={{ position: "absolute", inset: 0, background: ad.bgGradient, zIndex: 0 }} />
        )}

        {/* Glow left accent line */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: ad.accentColor, borderRadius: "10px 0 0 10px", zIndex: 2 }} />

        <div className="ad-strip-content" style={{ display: "flex", alignItems: "center", gap: 12, zIndex: 2, width: "100%", height: "100%" }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>{ad.icon}</span>

          <div style={{ flex: 1, minWidth: 200 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#C4CFDF", lineHeight: 1.4 }}>
              <strong style={{ color: ad.accentColor }}>{ad.title}: </strong>
              {ad.subtitle}
            </span>
          </div>

          <div className="ad-strip-actions" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {/* Scope badge */}
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "1.2px", color: ad.accentColor, background: `${ad.accentColor}18`, border: `1px solid ${ad.accentColor}35`, padding: "2px 8px", borderRadius: 4, flexShrink: 0 }}>
              <TypeIcon type={ad.type} /> {ad.tag}
            </span>

            <button style={{
              flexShrink: 0, height: 30, padding: "0 14px", borderRadius: 9999,
              background: ad.accentColor, border: "none",
              fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700,
              color: "#0A0E1A", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
              transition: "opacity .18s",
            }}>
              {ad.ctaLabel} <ChevronRight size={11} />
            </button>
          </div>
        </div>

        {ad.dismissible && <DismissBtn onClick={() => setDismissed(true)} pos={{ top: 8, right: 8 }} />}
      </div>
    </Link>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   2. BANNER AD — full-width horizontal hero banner
      Ratio: ~3:1   Recommended: 1200×400px
 ════════════════════════════════════════════════════════════════════════ */
export function AdBannerHorizontal({ ad }: { ad: AdData }) {
  const [hov, setHov] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useTrackView(ad.adId);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const imgUrl = ad.bannerUrl ? (ad.bannerUrl.startsWith("http") || ad.bannerUrl.startsWith("data:") ? ad.bannerUrl : `${API_URL}${ad.bannerUrl}`) : null;

  if (dismissed) return null;

  return (
    <Link
      href={`/marketplace/ads/${ad.adId || ad.id}`}
      onClick={() => trackAdClick(ad.adId)}
      style={{ textDecoration: "none", display: "block", width: "100%" }}
    >
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          borderRadius: 16,
          overflow: "hidden",
          cursor: "pointer",
          border: `1.5px solid ${hov ? ad.accentColor : `${ad.accentColor}35`}`,
          background: "#111827",
          boxShadow: hov ? `0 12px 36px ${ad.glowColor}, 0 0 0 1px ${ad.accentColor}30` : "none",
          transition: "all 0.25s",
          position: "relative",
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          minHeight: 130,
          width: "100%",
        }}
        className="ad-banner-responsive"
      >
        <style>{`
          @media (max-width: 640px) {
            .ad-banner-responsive {
              flex-direction: column !important;
            }
            .ad-banner-img-wrap {
              width: 100% !important;
              height: 140px !important;
              border-right: none !important;
              border-bottom: 1px solid #1e2d45 !important;
            }
            .ad-banner-responsive .ad-banner-content {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 16px !important;
              padding: 16px 20px !important;
            }
            .ad-banner-responsive .ad-banner-cta-btn {
              width: 100% !important;
              justify-content: center !important;
            }
          }
        `}</style>

        {/* Left Column: Image or Gradient bar */}
        {imgUrl ? (
          <div style={{
            width: "280px",
            flexShrink: 0,
            position: "relative",
            background: "rgba(10, 14, 26, 0.4)",
            borderRight: "1px solid #1e2d45",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }} className="ad-banner-img-wrap">
            <img src={imgUrl} alt={ad.title} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
          </div>
        ) : (
          <div style={{
            width: "80px",
            flexShrink: 0,
            background: ad.bgGradient || "linear-gradient(135deg, #0d2040, #1e3a5f)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px"
          }}>
            {ad.icon}
          </div>
        )}

        {/* Right Column: Content */}
        <div className="ad-banner-content" style={{ flex: 1, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", flexWrap: "wrap", zIndex: 2 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ background: `${ad.accentColor}15`, color: ad.accentColor, fontSize: 9, fontWeight: 800, letterSpacing: "1.5px", padding: "2px 8px", borderRadius: 4, border: `1px solid ${ad.accentColor}30` }}>
                {ad.tag}
              </span>
              <span style={{ fontSize: 9, color: "#6B7280", fontWeight: 700, letterSpacing: "1px" }}>📢 SPONSORED</span>
            </div>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, color: "#F0F4FF", marginBottom: 6 }}>{ad.title}</h3>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9CA3AF", lineHeight: 1.5, maxWidth: 580 }}>{ad.description}</p>

            {(ad.location || ad.contact) && (
              <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
                {ad.location && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6B7280" }}><MapPin size={10} style={{ color: ad.accentColor }} />{ad.location}</span>}
                {ad.contact && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6B7280" }}><Phone size={10} style={{ color: ad.accentColor }} />{ad.contact}</span>}
                {ad.rating && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#F7C948" }}><Star size={10} style={{ fill: "#F7C948" }} />{ad.rating}/5</span>}
              </div>
            )}
          </div>

          <button className="ad-banner-cta-btn" style={{
            flexShrink: 0, height: 38, padding: "0 22px", borderRadius: 9999,
            background: `linear-gradient(90deg, ${ad.accentColor}, ${ad.accentColor}cc)`,
            border: "none", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700,
            color: "#0A0E1A", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            boxShadow: `0 4px 14px ${ad.glowColor}`,
            transition: "all 0.2s"
          }}
          >
            {ad.ctaLabel} →
          </button>
        </div>

        {ad.dismissible && <DismissBtn onClick={() => setDismissed(true)} pos={{ top: 10, right: 10 }} />}
      </div>
    </Link>
  );
}

/* ─── CARD AD ─────────────────────────────────────────────────────────── */
export function AdCard({ ad }: { ad: AdData }) {
  const [hov, setHov] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useTrackView(ad.adId);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const imgUrl = ad.bannerUrl ? (ad.bannerUrl.startsWith("http") || ad.bannerUrl.startsWith("data:") ? ad.bannerUrl : `${API_URL}${ad.bannerUrl}`) : null;

  if (dismissed) return null;

  return (
    <Link
      href={`/marketplace/ads/${ad.adId || ad.id}`}
      onClick={() => trackAdClick(ad.adId)}
      style={{ textDecoration: "none", display: "block", height: "100%" }}
    >
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          borderRadius: 18, overflow: "hidden", cursor: "pointer",
          border: `1.5px solid ${hov ? ad.accentColor : `${ad.accentColor}55`}`,
          background: "#0d1218",
          boxShadow: hov ? `0 12px 40px ${ad.glowColor}` : "none",
          transform: hov ? "translateY(-4px)" : "none",
          transition: "all 0.25s", display: "flex", flexDirection: "column", position: "relative",
          height: "100%",
        }}
      >
        {/* Hero area */}
        <div style={{
          width: "100%",
          height: 180,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: ad.bgGradient || "linear-gradient(135deg, #0d1218, #162035)",
          flexShrink: 0,
        }}>
          {imgUrl ? (
            <img src={imgUrl} alt={ad.title} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, position: "relative" }}>
              <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${ad.glowColor} 0%, transparent 70%)`, top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
              <span style={{ fontSize: 38, position: "relative" }}>{ad.icon}</span>
              <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 800, color: ad.accentColor, textAlign: "center", padding: "0 12px", position: "relative" }}>{ad.title}</span>
            </div>
          )}

          {/* Type badge */}
          <span style={{ position: "absolute", top: 10, left: 10, background: `${ad.accentColor}22`, color: ad.accentColor, fontSize: 9, fontWeight: 800, letterSpacing: "1.5px", padding: "3px 9px", borderRadius: 4, display: "flex", alignItems: "center", gap: 4, border: `1px solid ${ad.accentColor}44`, zIndex: 3 }}>
            <TypeIcon type={ad.type} /> {ad.tag}
          </span>
          <span style={{ position: "absolute", top: 10, right: ad.dismissible ? 36 : 10, background: "rgba(0,0,0,0.5)", color: "#6B7280", fontSize: 8, fontWeight: 700, letterSpacing: "1px", padding: "2px 6px", borderRadius: 4, zIndex: 3 }}>
            📢 AD
          </span>
          {ad.dismissible && <DismissBtn onClick={() => setDismissed(true)} pos={{ top: 10, right: 10 }} />}
        </div>

        {/* Body */}
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9CA3AF", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{ad.description}</p>

          {ad.stats && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {ad.stats.map(s => (
                <span key={s.label} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#6B7280" }}>
                  <strong style={{ color: ad.accentColor }}>{s.value}</strong> {s.label}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {ad.location && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#6B7280" }}><MapPin size={9} style={{ color: ad.accentColor }} />{ad.location}</span>}
            {ad.contact && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#6B7280" }}><Phone size={9} style={{ color: ad.accentColor }} />{ad.contact}</span>}
            {ad.rating && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#F7C948" }}><Star size={9} style={{ fill: "#F7C948" }} />{ad.rating}/5</span>}
          </div>

          <button style={{ width: "100%", height: 36, borderRadius: 9999, border: "none", background: `linear-gradient(90deg, ${ad.accentColor}, ${ad.accentColor}cc)`, fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: "#0A0E1A", cursor: "pointer", marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, boxShadow: `0 4px 14px ${ad.glowColor}` }}>
            {ad.ctaLabel} <ExternalLink size={11} />
          </button>
        </div>
      </div>
    </Link>
  );
}

/* ─── SQUARE AD ───────────────────────────────────────────────────────── */
export function AdSquare({ ad }: { ad: AdData }) {
  const [hov, setHov] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useTrackView(ad.adId);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const imgUrl = ad.bannerUrl ? (ad.bannerUrl.startsWith("http") || ad.bannerUrl.startsWith("data:") ? ad.bannerUrl : `${API_URL}${ad.bannerUrl}`) : null;

  if (dismissed) return null;

  return (
    <Link
      href={`/marketplace/ads/${ad.adId || ad.id}`}
      onClick={() => trackAdClick(ad.adId)}
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          borderRadius: 16, overflow: "hidden", cursor: "pointer", position: "relative",
          aspectRatio: "1/1",
          border: `1.5px solid ${hov ? ad.accentColor : `${ad.accentColor}45`}`,
          boxShadow: hov ? `0 12px 40px ${ad.glowColor}` : "none",
          transform: hov ? "translateY(-3px)" : "none",
          transition: "all 0.25s",
        }}
      >
        {imgUrl ? (
          <img src={imgUrl} alt={ad.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: ad.bgGradient }} />
        )}

        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,8,18,0.95) 0%, rgba(5,8,18,0.5) 45%, transparent 70%)" }} />

        <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ background: `${ad.accentColor}22`, color: ad.accentColor, fontSize: 9, fontWeight: 800, letterSpacing: "1.5px", padding: "3px 9px", borderRadius: 4, border: `1px solid ${ad.accentColor}44`, display: "flex", alignItems: "center", gap: 4 }}>
            <TypeIcon type={ad.type} /> {ad.tag}
          </span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ background: "rgba(0,0,0,0.6)", color: "#6B7280", fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>📢 AD</span>
            {ad.dismissible && <DismissBtn onClick={() => setDismissed(true)} pos={{ position: "relative", top: "auto", right: "auto" }} />}
          </div>
        </div>

        {!imgUrl && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 52, filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.5))" }}>{ad.icon}</span>
          </div>
        )}

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px" }}>
          <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: "#F0F4FF", marginBottom: 4, lineHeight: 1.25 }}>{ad.title}</p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9CA3AF", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 10 }}>{ad.subtitle}</p>

          {ad.stats && ad.stats.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              {ad.stats.slice(0, 2).map(s => (
                <span key={s.label} style={{ fontSize: 10, color: "#6B7280", background: "rgba(0,0,0,0.4)", padding: "2px 8px", borderRadius: 4 }}>
                  <strong style={{ color: ad.accentColor }}>{s.value}</strong> {s.label}
                </span>
              ))}
            </div>
          )}

          <button style={{ width: "100%", height: 34, borderRadius: 9999, border: "none", background: ad.accentColor, fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: "#0A0E1A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, boxShadow: `0 4px 14px ${ad.glowColor}` }}>
            {ad.ctaLabel} <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </Link>
  );
}

/* ─── PORTRAIT AD ─────────────────────────────────────────────────────── */
export function AdPortrait({ ad }: { ad: AdData }) {
  const [hov, setHov] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useTrackView(ad.adId);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const imgUrl = ad.bannerUrl ? (ad.bannerUrl.startsWith("http") || ad.bannerUrl.startsWith("data:") ? ad.bannerUrl : `${API_URL}${ad.bannerUrl}`) : null;

  if (dismissed) return null;

  return (
    <Link
      href={`/marketplace/ads/${ad.adId || ad.id}`}
      onClick={() => trackAdClick(ad.adId)}
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          borderRadius: 16, overflow: "hidden", cursor: "pointer", position: "relative",
          aspectRatio: "2/3",
          border: `1.5px solid ${hov ? ad.accentColor : `${ad.accentColor}45`}`,
          boxShadow: hov ? `0 16px 48px ${ad.glowColor}` : "none",
          transform: hov ? "translateY(-4px) scale(1.01)" : "none",
          transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {imgUrl ? (
          <img src={imgUrl} alt={ad.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: ad.bgGradient }} />
        )}

        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,8,18,0.7) 0%, transparent 30%, transparent 50%, rgba(5,8,18,0.97) 100%)" }} />

        {!imgUrl && (
          <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${ad.glowColor} 0%, transparent 70%)`, top: "35%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
        )}

        <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between" }}>
          <span style={{ background: `${ad.accentColor}25`, color: ad.accentColor, fontSize: 9, fontWeight: 800, letterSpacing: "1.5px", padding: "3px 10px", borderRadius: 5, border: `1px solid ${ad.accentColor}50`, display: "flex", alignItems: "center", gap: 4 }}>
            <TypeIcon type={ad.type} /> {ad.tag}
          </span>
          <div style={{ display: "flex", gap: 5 }}>
            <span style={{ background: "rgba(0,0,0,0.65)", color: "#6B7280", fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>📢 AD</span>
            {ad.dismissible && <DismissBtn onClick={() => setDismissed(true)} pos={{ position: "relative", top: "auto", right: "auto", width: 20, height: 20 }} />}
          </div>
        </div>

        {!imgUrl && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: "30%" }}>
            <span style={{ fontSize: 58, filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.6))" }}>{ad.icon}</span>
          </div>
        )}

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 18px" }}>
          <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, color: "#F0F4FF", marginBottom: 5, lineHeight: 1.25 }}>{ad.title}</p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9CA3AF", lineHeight: 1.5, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{ad.description}</p>

          {ad.stats && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {ad.stats.map(s => (
                <span key={s.label} style={{ fontSize: 10, background: "rgba(0,0,0,0.5)", color: "#6B7280", padding: "2px 8px", borderRadius: 4, border: `1px solid ${ad.accentColor}25` }}>
                  <strong style={{ color: ad.accentColor }}>{s.value}</strong> {s.label}
                </span>
              ))}
            </div>
          )}

          <button style={{ width: "100%", height: 38, borderRadius: 9999, border: "none", background: `linear-gradient(90deg, ${ad.accentColor}, ${ad.accentColor}cc)`, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#0A0E1A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, boxShadow: `0 6px 20px ${ad.glowColor}` }}>
            {ad.ctaLabel} →
          </button>
        </div>
      </div>
    </Link>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Smart dispatch — pick the right component based on ad.format
 ════════════════════════════════════════════════════════════════════════ */
export function AdRenderer({ ad }: { ad: AdData }) {
  switch (ad.format) {
    case "strip":    return <AdStrip ad={ad} />;
    case "banner":   return <AdBannerHorizontal ad={ad} />;
    case "square":   return <AdSquare ad={ad} />;
    case "portrait": return <AdPortrait ad={ad} />;
    case "card":
    default:         return <AdCard ad={ad} />;
  }
}
