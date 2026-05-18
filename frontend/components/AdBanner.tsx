"use client";
import { useState } from "react";
import { X, MapPin, Phone, ExternalLink, Star, Building2, Megaphone, GraduationCap } from "lucide-react";

/* ─── Ad Types ──────────────────────────────────────── */
export type AdType = "hostel" | "pg" | "college_event" | "cross_college" | "sponsored";

export interface AdData {
  id: string;
  type: AdType;
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
}

/* ─── Inline Card Ad (used in product grids) ──────── */
export function AdCard({ ad }: { ad: AdData }) {
  const [hov, setHov] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const TypeIcon =
    ad.type === "hostel" || ad.type === "pg"
      ? Building2
      : ad.type === "college_event"
      ? GraduationCap
      : Megaphone;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 18,
        overflow: "hidden",
        cursor: "pointer",
        border: `1.5px solid ${hov ? ad.accentColor : `${ad.accentColor}55`}`,
        background: "rgba(10,14,26,0.85)",
        boxShadow: hov ? `0 12px 40px ${ad.glowColor}` : "none",
        transform: hov ? "translateY(-4px)" : "none",
        transition: "all 0.25s",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Dismiss */}
      {ad.dismissible && (
        <button
          onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
          style={{
            position: "absolute", top: 10, right: 10, zIndex: 10,
            width: 22, height: 22, borderRadius: "50%",
            background: "rgba(0,0,0,0.5)", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#6B7280",
          }}
        >
          <X size={11} />
        </button>
      )}

      {/* Hero */}
      <div style={{
        height: 150, background: ad.bgGradient,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 8, position: "relative", overflow: "hidden",
      }}>
        {/* Glow orb */}
        <div style={{
          position: "absolute", width: 120, height: 120, borderRadius: "50%",
          background: `radial-gradient(circle, ${ad.glowColor} 0%, transparent 70%)`,
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          pointerEvents: "none",
        }} />

        <span style={{ fontSize: 38, position: "relative" }}>{ad.icon}</span>
        <span style={{
          fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 800,
          color: ad.accentColor, textAlign: "center", padding: "0 12px",
          position: "relative",
        }}>{ad.title}</span>

        {/* Type badge */}
        <span style={{
          position: "absolute", top: 10, left: 10,
          background: `${ad.accentColor}22`,
          color: ad.accentColor,
          fontSize: 9, fontWeight: 800, letterSpacing: "1.5px",
          padding: "3px 9px", borderRadius: 4,
          display: "flex", alignItems: "center", gap: 4,
          border: `1px solid ${ad.accentColor}44`,
        }}>
          <TypeIcon size={8} /> {ad.tag}
        </span>

        {/* Sponsored badge */}
        <span style={{
          position: "absolute", top: 10, right: ad.dismissible ? 36 : 10,
          background: "rgba(0,0,0,0.5)", color: "#6B7280",
          fontSize: 8, fontWeight: 700, letterSpacing: "1px",
          padding: "2px 6px", borderRadius: 4,
        }}>
          📢 AD
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <p style={{
          fontFamily: "'DM Sans',sans-serif", fontSize: 11,
          color: "#9CA3AF", lineHeight: 1.6,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{ad.description}</p>

        {/* Stats row */}
        {ad.stats && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {ad.stats.map(s => (
              <span key={s.label} style={{
                fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#6B7280",
              }}>
                <strong style={{ color: ad.accentColor }}>{s.value}</strong> {s.label}
              </span>
            ))}
          </div>
        )}

        {/* Location / contact */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {ad.location && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#6B7280" }}>
              <MapPin size={9} style={{ color: ad.accentColor }} />
              {ad.location}
            </span>
          )}
          {ad.contact && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#6B7280" }}>
              <Phone size={9} style={{ color: ad.accentColor }} />
              {ad.contact}
            </span>
          )}
          {ad.rating && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#F7C948" }}>
              <Star size={9} style={{ fill: "#F7C948" }} />
              {ad.rating}/5 · Highly Rated
            </span>
          )}
        </div>

        {/* CTA */}
        <button style={{
          width: "100%", height: 36, borderRadius: 9999, border: "none",
          background: `linear-gradient(90deg, ${ad.accentColor}, ${ad.accentColor}cc)`,
          fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700,
          color: "#0A0E1A", cursor: "pointer", marginTop: "auto",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          boxShadow: `0 4px 14px ${ad.glowColor}`,
          transition: "box-shadow 0.2s",
        }}>
          {ad.ctaLabel} <ExternalLink size={11} />
        </button>
      </div>
    </div>
  );
}

/* ─── Horizontal Banner Ad ────────────────────────── */
export function AdBannerHorizontal({ ad }: { ad: AdData }) {
  const [hov, setHov] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 16, overflow: "hidden", cursor: "pointer",
        border: `1.5px solid ${hov ? ad.accentColor : `${ad.accentColor}40`}`,
        background: ad.bgGradient,
        boxShadow: hov ? `0 8px 32px ${ad.glowColor}` : "none",
        transition: "all 0.25s",
        display: "flex", alignItems: "center",
        padding: "20px 24px", gap: 20,
        position: "relative",
      }}
    >
      {/* Dismiss */}
      {ad.dismissible && (
        <button
          onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
          style={{
            position: "absolute", top: 10, right: 10,
            width: 24, height: 24, borderRadius: "50%",
            background: "rgba(0,0,0,0.4)", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#9CA3AF",
          }}
        >
          <X size={12} />
        </button>
      )}

      <span style={{ fontSize: 44, flexShrink: 0 }}>{ad.icon}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{
            background: `${ad.accentColor}22`, color: ad.accentColor,
            fontSize: 9, fontWeight: 800, letterSpacing: "1.5px",
            padding: "2px 8px", borderRadius: 4,
            border: `1px solid ${ad.accentColor}44`,
          }}>{ad.tag}</span>
          <span style={{ fontSize: 9, color: "#374151", fontWeight: 700, letterSpacing: "1px" }}>📢 SPONSORED</span>
        </div>
        <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, color: "#F0F4FF", marginBottom: 3 }}>{ad.title}</p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9CA3AF", lineHeight: 1.5 }}>{ad.description}</p>

        {(ad.location || ad.contact) && (
          <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
            {ad.location && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6B7280" }}>
                <MapPin size={10} style={{ color: ad.accentColor }} />{ad.location}
              </span>
            )}
            {ad.contact && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6B7280" }}>
                <Phone size={10} style={{ color: ad.accentColor }} />{ad.contact}
              </span>
            )}
            {ad.rating && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#F7C948" }}>
                <Star size={10} style={{ fill: "#F7C948" }} />{ad.rating}/5 Rating
              </span>
            )}
          </div>
        )}
      </div>

      <button style={{
        flexShrink: 0, height: 40, padding: "0 20px", borderRadius: 9999,
        background: `linear-gradient(90deg, ${ad.accentColor}, ${ad.accentColor}bb)`,
        border: "none", fontFamily: "'DM Sans',sans-serif", fontSize: 13,
        fontWeight: 700, color: "#0A0E1A", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 6,
        boxShadow: `0 4px 16px ${ad.glowColor}`,
      }}>
        {ad.ctaLabel} →
      </button>
    </div>
  );
}

/* ─── Slim Strip Ad ───────────────────────────────── */
export function AdStrip({ ad }: { ad: AdData }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div style={{
      background: `linear-gradient(90deg, ${ad.accentColor}12, ${ad.accentColor}06)`,
      border: `1px solid ${ad.accentColor}30`,
      borderRadius: 10, padding: "10px 16px",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{ad.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9CA3AF" }}>
          <strong style={{ color: ad.accentColor }}>{ad.title}:</strong> {ad.subtitle}
        </span>
      </div>
      <button style={{
        flexShrink: 0, height: 28, padding: "0 14px", borderRadius: 9999,
        background: ad.accentColor, border: "none",
        fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700,
        color: "#0A0E1A", cursor: "pointer",
      }}>{ad.ctaLabel}</button>
      {ad.dismissible && (
        <button
          onClick={() => setDismissed(true)}
          style={{
            width: 20, height: 20, borderRadius: "50%", background: "transparent",
            border: "none", cursor: "pointer", color: "#374151",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
}
