"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/StudentLayout";
import { useAuthStore } from "@/store/authStore";
import { Megaphone, Globe, Building2, Search, RefreshCw, ExternalLink, Clock, Eye, MousePointer, AlertCircle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* ─── Types ─────────────────────────────────────────────────────────── */
interface LiveAd {
  id: string;
  title: string;
  description: string;
  bannerUrl: string | null;
  scope: "own" | "cross";
  format: "banner" | "square" | "strip" | "portrait" | "card";
  status: "active" | "expired" | "deactivated";
  duration: number;
  views: number;
  clicks: number;
  startsAt: string;
  expiresAt: string;
  createdAt: string;
  college?: { name: string; code: string };
  admin?: { name: string };
}

type FilterTab = "All" | "Your College" | "Cross-College";

/* ─── Helpers ────────────────────────────────────────────────────────── */
function daysLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff <= 0 ? 0 : Math.ceil(diff / 86400000);
}

function fmtDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function bannerSrc(url: string | null) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API}${url}`;
}

/* ─── Track view/click silently ─────────────────────────────────────── */
async function trackView(adId: string) {
  try { await fetch(`${API}/api/marketplace/ads/${adId}/view`, { method: "POST" }); } catch {}
}
async function trackClick(adId: string) {
  try { await fetch(`${API}/api/marketplace/ads/${adId}/click`, { method: "POST" }); } catch {}
}

/* ─── Ad Card Component ──────────────────────────────────────────────── */
function AdCard({ ad }: { ad: LiveAd }) {
  const [hov, setHov] = useState(false);
  const [viewed, setViewed] = useState(false);
  const isOwn = ad.scope === "own";
  const accent = isOwn ? "#10B981" : "#F7C948";
  const days = daysLeft(ad.expiresAt);
  const imgSrc = bannerSrc(ad.bannerUrl);

  // Track view on mount (once per card render)
  useEffect(() => {
    if (!viewed) { trackView(ad.id); setViewed(true); }
  }, [ad.id, viewed]);

  const formatDimLabel: Record<string, string> = {
    banner: "Wide Banner (3:1)", square: "Square (1:1)",
    strip: "Thin Strip (6:1)", portrait: "Story (2:3)", card: "Grid Card",
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#111827",
        border: `1.5px solid ${hov ? accent : "#1e2d45"}`,
        borderRadius: 18,
        overflow: "hidden",
        transition: "all 0.25s",
        transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? `0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px ${accent}30` : "none",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Banner image or gradient placeholder */}
      <Link href={`/marketplace/ads/${ad.id}`} onClick={() => trackClick(ad.id)} style={{ display: "block", textDecoration: "none" }}>
        <div style={{
          position: "relative", overflow: "hidden",
          background: isOwn
            ? "linear-gradient(135deg,#0a1f15,#0d2d1e)"
            : "linear-gradient(135deg,#1a1500,#2a2000)",
          height: 180,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          {imgSrc ? (
            <img src={imgSrc} alt={ad.title} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} onError={e => (e.currentTarget.style.display = "none")} />
          ) : (
            <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Megaphone size={48} style={{ color: `${accent}50` }} />
            </div>
          )}

          {/* Scope badge */}
          <div style={{
            position: "absolute", top: 10, left: 10,
            background: isOwn ? "rgba(16,185,129,0.9)" : "rgba(247,201,72,0.9)",
            color: isOwn ? "#0a1f15" : "#1a1000",
            fontSize: 9, fontWeight: 800, letterSpacing: "1px",
            padding: "3px 8px", borderRadius: 6,
            backdropFilter: "blur(4px)",
          }}>
            {isOwn ? "🏫 YOUR COLLEGE" : "🌐 CROSS-COLLEGE"}
          </div>

          {/* Format badge */}
          <div style={{
            position: "absolute", top: 10, right: 10,
            background: "rgba(0,0,0,0.65)",
            color: "#9CA3AF",
            fontSize: 8, fontWeight: 700, letterSpacing: "0.5px",
            padding: "3px 8px", borderRadius: 6,
            backdropFilter: "blur(4px)",
          }}>
            {formatDimLabel[ad.format] || ad.format}
          </div>

          {/* Expiry countdown */}
          {days <= 3 && days > 0 && (
            <div style={{
              position: "absolute", bottom: 10, right: 10,
              background: "rgba(239,68,68,0.9)",
              color: "#fff", fontSize: 9, fontWeight: 800,
              padding: "3px 8px", borderRadius: 6,
              animation: "pulse 1.5s ease-in-out infinite",
            }}>
              ⚡ {days}d left
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div>
          <Link href={`/marketplace/ads/${ad.id}`} onClick={() => trackClick(ad.id)} style={{ textDecoration: "none" }}>
            <h3 style={{
              fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800,
              color: "#F0F4FF", marginBottom: 5, lineHeight: 1.3,
              cursor: "pointer",
            }}>
              {ad.title}
            </h3>
          </Link>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#9CA3AF",
            lineHeight: 1.6,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {ad.description}
          </p>
        </div>

        {/* College name */}
        {ad.college?.name && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Building2 size={11} style={{ color: accent }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: accent, fontWeight: 600 }}>
              {ad.college.name}
            </span>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: "flex", gap: 14, marginTop: "auto", paddingTop: 8, borderTop: "1px solid #1e2d45" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#6B7280" }}>
            <Eye size={10} style={{ color: "#4F8EF7" }} />
            {ad.views.toLocaleString("en-IN")} views
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#6B7280" }}>
            <MousePointer size={10} style={{ color: "#10B981" }} />
            {ad.clicks.toLocaleString("en-IN")} clicks
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#6B7280", marginLeft: "auto" }}>
            <Clock size={10} />
            Expires {fmtDate(ad.expiresAt)}
          </span>
        </div>
      </div>

      {/* CTA footer */}
      <Link href={`/marketplace/ads/${ad.id}`} onClick={() => trackClick(ad.id)} style={{ textDecoration: "none", margin: "0 18px 16px", display: "block" }}>
        <button
          style={{
            width: "100%",
            height: 38, borderRadius: 9999, border: "none",
            background: isOwn
              ? "linear-gradient(90deg,#059669,#10B981)"
              : "linear-gradient(90deg,#D97706,#F7C948)",
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
            color: isOwn ? "#fff" : "#1a1000",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            boxShadow: isOwn ? "0 4px 14px rgba(16,185,129,0.3)" : "0 4px 14px rgba(247,201,72,0.3)",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = isOwn ? "0 6px 20px rgba(16,185,129,0.45)" : "0 6px 20px rgba(247,201,72,0.45)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = isOwn ? "0 4px 14px rgba(16,185,129,0.3)" : "0 4px 14px rgba(247,201,72,0.3)"; }}
        >
          <ExternalLink size={12} />
          Learn More
        </button>
      </Link>
    </div>
  );
}

/* ─── Wide Banner Ad (strip/banner) ─────────────────────────────────── */
function AdBannerWide({ ad }: { ad: LiveAd }) {
  const [hov, setHov] = useState(false);
  const [viewed, setViewed] = useState(false);
  const isOwn = ad.scope === "own";
  const accent = isOwn ? "#10B981" : "#F7C948";
  const imgSrc = bannerSrc(ad.bannerUrl);

  useEffect(() => {
    if (!viewed) { trackView(ad.id); setViewed(true); }
  }, [ad.id, viewed]);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#111827",
        border: `1.5px solid ${hov ? accent : "#1e2d45"}`,
        borderRadius: 16,
        overflow: "hidden",
        transition: "all 0.25s",
        display: "flex",
        alignItems: "center",
        minHeight: 110,
        boxShadow: hov ? `0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px ${accent}30` : "none",
      }}
    >
      {/* Left image strip */}
      {imgSrc && (
        <Link href={`/marketplace/ads/${ad.id}`} onClick={() => trackClick(ad.id)} style={{ width: 220, flexShrink: 0, height: "100%", display: "block", overflow: "hidden", position: "relative" }}>
          <img src={imgSrc} alt={ad.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => (e.currentTarget.style.display = "none")} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 60%, #111827)" }} />
        </Link>
      )}
      {/* If no image, a colored bar */}
      {!imgSrc && (
        <div style={{
          width: 8, flexShrink: 0, alignSelf: "stretch",
          background: `linear-gradient(180deg, ${accent}, ${accent}80)`,
        }} />
      )}

      {/* Content */}
      <div style={{ flex: 1, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{
              background: isOwn ? "rgba(16,185,129,0.12)" : "rgba(247,201,72,0.12)",
              color: accent, fontSize: 9, fontWeight: 800, letterSpacing: "1px",
              padding: "2px 8px", borderRadius: 5, border: `1px solid ${accent}30`,
            }}>
              {isOwn ? "🏫 YOUR COLLEGE" : "🌐 CROSS-COLLEGE"}
            </span>
            {ad.college?.name && (
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6B7280" }}>
                {ad.college.name}
              </span>
            )}
          </div>
          <Link href={`/marketplace/ads/${ad.id}`} onClick={() => trackClick(ad.id)} style={{ textDecoration: "none" }}>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 800, color: "#F0F4FF", marginBottom: 4, cursor: "pointer" }}>
              {ad.title}
            </h3>
          </Link>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#9CA3AF", lineHeight: 1.5, maxWidth: 480 }}>
            {ad.description}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#6B7280" }}>
              <Eye size={10} style={{ color: "#4F8EF7" }} /> {ad.views.toLocaleString("en-IN")}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#6B7280" }}>
              <Clock size={10} /> {fmtDate(ad.expiresAt)}
            </span>
          </div>
          <Link href={`/marketplace/ads/${ad.id}`} onClick={() => trackClick(ad.id)} style={{ textDecoration: "none" }}>
            <button
              style={{
                height: 36, padding: "0 20px", borderRadius: 9999, border: "none",
                background: isOwn ? "linear-gradient(90deg,#059669,#10B981)" : "linear-gradient(90deg,#D97706,#F7C948)",
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
                color: isOwn ? "#fff" : "#1a1000",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <ExternalLink size={11} /> Learn More
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Empty State ────────────────────────────────────────────────────── */
function EmptyState({ tab, collegeName }: { tab: FilterTab; collegeName: string }) {
  return (
    <div style={{ textAlign: "center", padding: "70px 0" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>📢</div>
      <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#F0F4FF", marginBottom: 8 }}>
        {tab === "Your College" ? `No ads from ${collegeName} yet` : "No cross-college ads yet"}
      </p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280", maxWidth: 360, margin: "0 auto 20px" }}>
        {tab === "Your College"
          ? "Your college admin hasn't published any ads yet. Ads created by the college admin will appear here."
          : "Cross-college ads from other colleges will appear here when published."}
      </p>
      {tab === "Your College" && (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#374151" }}>
          Only college admins can create advertisements — not students.
        </p>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function AdsPage() {
  const user = useAuthStore(s => s.user);
  const collegeId = useAuthStore(s => s.collegeId);
  const authLoading = useAuthStore(s => s.isLoading);

  const [ads, setAds] = useState<LiveAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<FilterTab>("All");
  const [search, setSearch] = useState("");
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (collegeId) params.set("collegeId", collegeId);
      const res = await fetch(`${API}/api/marketplace/ads?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch ads");
      const data = await res.json();
      setAds(data.ads || []);
      setLastFetched(new Date());
    } catch (e: any) {
      setError("Could not load advertisements. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [collegeId]);

  useEffect(() => {
    if (!authLoading) fetchAds();
  }, [authLoading, fetchAds]);

  /* Filter */
  const filtered = ads.filter(ad => {
    if (tab === "Your College" && ad.scope !== "own") return false;
    if (tab === "Cross-College" && ad.scope !== "cross") return false;
    if (search) {
      const q = search.toLowerCase();
      return ad.title.toLowerCase().includes(q) || ad.description.toLowerCase().includes(q) || ad.college?.name?.toLowerCase().includes(q);
    }
    return true;
  });

  const ownAds = filtered.filter(a => a.scope === "own");
  const crossAds = filtered.filter(a => a.scope === "cross");
  const wideFormats = ["banner", "strip"];
  const cardFormats = ["square", "card", "portrait"];

  const collegeName = user?.collegeName || "Your College";

  /* Stats */
  const totalOwn = ads.filter(a => a.scope === "own").length;
  const totalCross = ads.filter(a => a.scope === "cross").length;
  const totalViews = ads.reduce((s, a) => s + a.views, 0);

  return (
    <StudentLayout>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .ads-pg { animation: fadeUp .4s ease; }
        .ad-tab { transition: all 0.2s; }
        .ad-tab:hover { opacity: 0.9; }
        .spin { animation: spin 0.7s linear infinite; }
      ` }} />

      <div className="ads-pg" style={{ padding: "28px 32px", maxWidth: 1320, margin: "0 auto" }}>

        {/* Hero */}
        <div style={{
          background: "linear-gradient(135deg,#0d1829 0%,#111827 50%,#1a1000 100%)",
          border: "1px solid rgba(247,201,72,0.2)",
          borderRadius: 20, padding: "28px 32px",
          marginBottom: 28, position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(247,201,72,0.05)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -30, left: 250, width: 140, height: 140, borderRadius: "50%", background: "rgba(79,142,247,0.04)", pointerEvents: "none" }} />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20, position: "relative" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ background: "rgba(247,201,72,0.12)", border: "1px solid rgba(247,201,72,0.3)", color: "#F7C948", fontSize: 10, fontWeight: 800, letterSpacing: "1.2px", padding: "3px 10px", borderRadius: 9999 }}>
                  📢 CAMPUS ADVERTISEMENTS
                </span>
                {!loading && ads.length > 0 && (
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#10B981" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", display: "inline-block", animation: "pulse 1.5s ease-in-out infinite" }} />
                    {ads.length} Live
                  </span>
                )}
              </div>
              <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 900, color: "#F0F4FF", marginBottom: 8, lineHeight: 1.2 }}>
                Campus Advertisements
              </h1>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280", maxWidth: 520, lineHeight: 1.6 }}>
                Official advertisements from <strong style={{ color: "#F0F4FF" }}>{collegeName}</strong> and cross-college announcements — all managed by verified college admins.
              </p>
            </div>

            {/* Quick stats */}
            <div style={{ display: "flex", gap: 24 }}>
              {[
                { label: "Your College", value: totalOwn, color: "#10B981", icon: "🏫" },
                { label: "Cross-College", value: totalCross, color: "#F7C948", icon: "🌐" },
                { label: "Total Views", value: totalViews.toLocaleString("en-IN"), color: "#4F8EF7", icon: "👁" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#6B7280", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin notice for students */}
          <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(79,142,247,0.07)", border: "1px solid rgba(79,142,247,0.15)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={13} style={{ color: "#4F8EF7", flexShrink: 0 }} />
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6B7280" }}>
              Advertisements are created and managed exclusively by <strong style={{ color: "#4F8EF7" }}>college admins</strong>.
              If you want to post an ad, contact your college administrator.
            </p>
          </div>
        </div>

        {/* Controls row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          {/* Tabs */}
          {(["All", "Your College", "Cross-College"] as FilterTab[]).map(t => (
            <button
              key={t}
              className="ad-tab"
              onClick={() => setTab(t)}
              style={{
                height: 40, padding: "0 18px", borderRadius: 9999, cursor: "pointer",
                background: tab === t
                  ? t === "All" ? "#4F8EF7" : t === "Your College" ? "#10B981" : "#F7C948"
                  : "transparent",
                border: `1.5px solid ${tab === t
                  ? t === "All" ? "#4F8EF7" : t === "Your College" ? "#10B981" : "#F7C948"
                  : "#1e2d45"}`,
                color: tab === t ? (t === "Cross-College" ? "#1a1000" : "#fff") : "#6B7280",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
                display: "flex", alignItems: "center", gap: 7,
              }}
            >
              {t === "All" ? <Megaphone size={13} /> : t === "Your College" ? <Building2 size={13} /> : <Globe size={13} />}
              {t}
              <span style={{
                background: tab === t ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.06)",
                borderRadius: 9999, padding: "0 7px", fontSize: 11,
              }}>
                {t === "All" ? ads.length : t === "Your College" ? totalOwn : totalCross}
              </span>
            </button>
          ))}

          {/* Search */}
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6B7280", pointerEvents: "none" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search ads by title, college…"
              style={{
                width: "100%", height: 40, paddingLeft: 36, background: "#111827",
                border: "1.5px solid #1e2d45", borderRadius: 12, outline: "none",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F0F4FF",
                boxSizing: "border-box", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#F7C948"}
              onBlur={e => e.target.style.borderColor = "#1e2d45"}
            />
          </div>

          {/* Refresh */}
          <button
            onClick={fetchAds}
            title="Refresh"
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: "transparent", border: "1.5px solid #1e2d45",
              cursor: "pointer", color: "#6B7280",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#2a3a5a"; e.currentTarget.style.color = "#F0F4FF"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e2d45"; e.currentTarget.style.color = "#6B7280"; }}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
          </button>

          {lastFetched && (
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#374151" }}>
              Updated {lastFetched.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={15} style={{ color: "#EF4444", flexShrink: 0 }} />
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF" }}>{error}</p>
            <button onClick={fetchAds} style={{ marginLeft: "auto", height: 32, padding: "0 14px", borderRadius: 9999, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Retry
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 18, overflow: "hidden" }}>
                <div style={{ height: 160, background: "linear-gradient(90deg,#1a2235 25%,#1e2d45 50%,#1a2235 75%)", backgroundSize: "200%", animation: "shimmer 1.5s infinite" }} />
                <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ height: 14, background: "#1a2235", borderRadius: 6, width: "70%" }} />
                  <div style={{ height: 10, background: "#1a2235", borderRadius: 6, width: "90%" }} />
                  <div style={{ height: 10, background: "#1a2235", borderRadius: 6, width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ads content */}
        {!loading && !error && (
          <>
            {/* YOUR COLLEGE section */}
            {(tab === "All" || tab === "Your College") && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 4, height: 22, borderRadius: 2, background: "#10B981" }} />
                  <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#F0F4FF" }}>
                    🏫 {collegeName} — Official Ads
                  </h2>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "2px 10px", borderRadius: 9999, fontWeight: 700 }}>
                    {ownAds.length} active
                  </span>
                </div>

                {ownAds.length === 0 ? (
                  <EmptyState tab="Your College" collegeName={collegeName} />
                ) : (
                  <>
                    {/* Wide banner ads first */}
                    {ownAds.filter(a => wideFormats.includes(a.format)).map(ad => (
                      <div key={ad.id} style={{ marginBottom: 14 }}>
                        <AdBannerWide ad={ad} />
                      </div>
                    ))}
                    {/* Card/square/portrait ads grid */}
                    {ownAds.filter(a => cardFormats.includes(a.format)).length > 0 && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                        {ownAds.filter(a => cardFormats.includes(a.format)).map(ad => (
                          <AdCard key={ad.id} ad={ad} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Divider */}
            {tab === "All" && ownAds.length > 0 && crossAds.length > 0 && (
              <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #1e2d45, transparent)", marginBottom: 40 }} />
            )}

            {/* CROSS-COLLEGE section */}
            {(tab === "All" || tab === "Cross-College") && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 4, height: 22, borderRadius: 2, background: "#F7C948" }} />
                  <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#F0F4FF" }}>
                    🌐 Cross-College Advertisements
                  </h2>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#F7C948", background: "rgba(247,201,72,0.1)", padding: "2px 10px", borderRadius: 9999, fontWeight: 700 }}>
                    {crossAds.length} from other colleges
                  </span>
                </div>

                {crossAds.length === 0 ? (
                  <EmptyState tab="Cross-College" collegeName={collegeName} />
                ) : (
                  <>
                    {crossAds.filter(a => wideFormats.includes(a.format)).map(ad => (
                      <div key={ad.id} style={{ marginBottom: 14 }}>
                        <AdBannerWide ad={ad} />
                      </div>
                    ))}
                    {crossAds.filter(a => cardFormats.includes(a.format)).length > 0 && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                        {crossAds.filter(a => cardFormats.includes(a.format)).map(ad => (
                          <AdCard key={ad.id} ad={ad} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* If no results after search */}
            {filtered.length === 0 && search && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#F0F4FF", marginBottom: 6 }}>No ads matched "{search}"</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280" }}>Try a different search term</p>
                <button onClick={() => setSearch("")} style={{ marginTop: 16, height: 38, padding: "0 20px", borderRadius: 9999, background: "transparent", border: "1.5px solid #1e2d45", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: "#9CA3AF", cursor: "pointer" }}>
                  Clear Search
                </button>
              </div>
            )}
          </>
        )}

        {/* Admin CTA box */}
        <div style={{
          marginTop: 12, padding: "22px 26px",
          background: "linear-gradient(135deg, rgba(79,142,247,0.06), rgba(16,185,129,0.04))",
          border: "1px solid rgba(79,142,247,0.15)", borderRadius: 16,
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 32 }}>📣</span>
            <div>
              <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: "#F0F4FF", marginBottom: 3 }}>
                Want to place an advertisement?
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#9CA3AF" }}>
                Only college admins can create ads. Contact your college admin to promote events, hostels, or services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
