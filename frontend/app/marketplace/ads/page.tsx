"use client";
import { useState } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/StudentLayout";
import { AdCard, AdBannerHorizontal, AdStrip } from "@/components/AdBanner";
import { HOSTEL_ADS, OWN_COLLEGE_ADS, CROSS_COLLEGE_ADS, ALL_ADS } from "@/lib/adsData";
import { Megaphone, Building2, GraduationCap, Globe, Search, Filter, TrendingUp, Zap, Star, MapPin } from "lucide-react";

type AdCategory = "All" | "Hostel & PG" | "College Events" | "Cross-College" | "Sponsored";

const CATEGORIES: { key: AdCategory; icon: React.ReactNode; color: string; glow: string; count: number }[] = [
  { key: "All",           icon: <Megaphone size={14} />,    color: "#F7C948",  glow: "rgba(247,201,72,0.2)",    count: ALL_ADS.length },
  { key: "Hostel & PG",   icon: <Building2 size={14} />,    color: "#4F8EF7",  glow: "rgba(79,142,247,0.2)",    count: HOSTEL_ADS.length },
  { key: "College Events",icon: <GraduationCap size={14} />,color: "#A78BFA",  glow: "rgba(167,139,250,0.2)",   count: OWN_COLLEGE_ADS.length },
  { key: "Cross-College", icon: <Globe size={14} />,         color: "#10B981",  glow: "rgba(16,185,129,0.2)",    count: CROSS_COLLEGE_ADS.length },
];

const AD_STATS = [
  { label: "Active Ads",       value: "24",    color: "#F7C948", icon: "📢" },
  { label: "Hostels Listed",   value: "8",     color: "#4F8EF7", icon: "🏠" },
  { label: "Events This Month",value: "12",    color: "#A78BFA", icon: "🎉" },
  { label: "Cross-College",    value: "6",     color: "#10B981", icon: "🤝" },
];

/* ─── Featured Hostel/PG Comparison Card ─── */
function HostelCompareCard({ ad }: { ad: typeof HOSTEL_ADS[0] }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#111827",
        border: `1.5px solid ${hov ? ad.accentColor : "#1e2d45"}`,
        borderRadius: 16, padding: "20px 22px",
        transition: "all 0.25s", cursor: "pointer",
        boxShadow: hov ? `0 8px 32px ${ad.glowColor}` : "none",
        transform: hov ? "translateY(-3px)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: ad.bgGradient,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          border: `1px solid ${ad.accentColor}40`,
        }}>{ad.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{
              background: `${ad.accentColor}20`, color: ad.accentColor,
              fontSize: 9, fontWeight: 800, letterSpacing: "1.5px",
              padding: "2px 8px", borderRadius: 4,
            }}>{ad.tag}</span>
            {ad.rating && (
              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#F7C948" }}>
                <Star size={9} style={{ fill: "#F7C948" }} />{ad.rating}
              </span>
            )}
          </div>
          <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: "#F0F4FF", marginBottom: 2 }}>{ad.title}</p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6B7280" }}>{ad.subtitle}</p>
        </div>
      </div>

      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9CA3AF", lineHeight: 1.6, marginBottom: 12 }}>{ad.description}</p>

      <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
        {ad.location && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6B7280" }}>
            <MapPin size={10} style={{ color: ad.accentColor }} />{ad.location}
          </span>
        )}
        {ad.stats?.map(s => (
          <span key={s.label} style={{ fontSize: 11, color: "#6B7280" }}>
            <strong style={{ color: ad.accentColor }}>{s.value}</strong> {s.label}
          </span>
        ))}
      </div>

      <button style={{
        width: "100%", height: 38, borderRadius: 9999, border: "none",
        background: `linear-gradient(90deg, ${ad.accentColor}, ${ad.accentColor}cc)`,
        fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700,
        color: "#0A0E1A", cursor: "pointer",
        boxShadow: `0 4px 14px ${ad.glowColor}`,
      }}>{ad.ctaLabel} →</button>
    </div>
  );
}

export default function AdsPage() {
  const [cat, setCat] = useState<AdCategory>("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const visibleAds = ALL_ADS.filter(ad => {
    if (cat === "Hostel & PG" && ad.type !== "hostel" && ad.type !== "pg") return false;
    if (cat === "College Events" && ad.type !== "college_event") return false;
    if (cat === "Cross-College" && ad.type !== "cross_college") return false;
    if (search && !ad.title.toLowerCase().includes(search.toLowerCase()) &&
        !ad.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <StudentLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .ads-page { animation: fadeUp .4s ease; }
        .ad-filter-btn:hover { opacity: 0.9; }
      `}</style>

      <div className="ads-page" style={{ padding: "28px 32px", maxWidth: 1400 }}>

        {/* ── Hero Banner ── */}
        <div style={{
          background: "linear-gradient(135deg,#0d1829 0%,#111827 50%,#1a1000 100%)",
          border: "1px solid rgba(247,201,72,0.25)", borderRadius: 20,
          padding: "28px 32px", marginBottom: 28, position: "relative", overflow: "hidden",
        }}>
          {/* Decorative orbs */}
          <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(247,201,72,0.06)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -30, left: 300, width: 120, height: 120, borderRadius: "50%", background: "rgba(79,142,247,0.05)", pointerEvents: "none" }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20, position: "relative" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ background: "rgba(247,201,72,0.12)", border: "1px solid rgba(247,201,72,0.3)", color: "#F7C948", fontSize: 10, fontWeight: 800, letterSpacing: "1.2px", padding: "3px 10px", borderRadius: 9999 }}>📢 ADVERTISEMENTS HUB</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#F7C948" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F7C948", display: "inline-block", animation: "pulse 1.5s ease-in-out infinite" }} />
                  Live Ads
                </span>
              </div>
              <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, color: "#F0F4FF", marginBottom: 6, lineHeight: 1.2 }}>
                Campus Advertisements
              </h1>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280", maxWidth: 520 }}>
                Discover hostels, PG accommodations, college events from MIT and other colleges — all in one place.
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
              {AD_STATS.slice(0, 3).map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#6B7280" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
          {AD_STATS.map(s => (
            <div key={s.label} style={{
              background: "#111827", border: "1px solid #1e2d45", borderRadius: 14,
              padding: "18px 20px", display: "flex", alignItems: "center", gap: 14,
            }}>
              <span style={{ fontSize: 26 }}>{s.icon}</span>
              <div>
                <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6B7280", marginTop: 2 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Featured Banner: MIT Event ── */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1.4px", color: "#374151", textTransform: "uppercase", marginBottom: 10 }}>⭐ FEATURED — YOUR COLLEGE</p>
          <AdBannerHorizontal ad={OWN_COLLEGE_ADS[0]} />
        </div>

        {/* ── Placement Banner ── */}
        <div style={{ marginBottom: 28 }}>
          <AdBannerHorizontal ad={OWN_COLLEGE_ADS[2]} />
        </div>

        {/* ── Category Filter + Search ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              className="ad-filter-btn"
              onClick={() => setCat(c.key)}
              style={{
                height: 40, padding: "0 18px", borderRadius: 9999, cursor: "pointer",
                background: cat === c.key ? c.color : "transparent",
                border: `1.5px solid ${cat === c.key ? c.color : "#1e2d45"}`,
                color: cat === c.key ? "#0A0E1A" : "#6B7280",
                fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700,
                display: "flex", alignItems: "center", gap: 7,
                boxShadow: cat === c.key ? `0 4px 20px ${c.glow}` : "none",
                transition: "all 0.2s",
              }}
            >
              {c.icon} {c.key}
              <span style={{
                background: cat === c.key ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.06)",
                borderRadius: 9999, padding: "0 7px", fontSize: 11,
              }}>{c.count}</span>
            </button>
          ))}

          {/* Search */}
          <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6B7280", pointerEvents: "none" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search ads…"
              style={{
                width: "100%", height: 40, paddingLeft: 36, background: "#111827",
                border: "1.5px solid #1e2d45", borderRadius: 12, outline: "none",
                fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#F0F4FF",
                boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = "#F7C948"}
              onBlur={e => e.target.style.borderColor = "#1e2d45"}
            />
          </div>

          {/* Grid/List toggle */}
          <div style={{ display: "flex", gap: 4 }}>
            {(["grid", "list"] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)} style={{
                width: 40, height: 40, borderRadius: 10,
                background: viewMode === mode ? "#1e2d45" : "transparent",
                border: `1.5px solid ${viewMode === mode ? "#2a3a5a" : "#1e2d45"}`,
                cursor: "pointer", color: viewMode === mode ? "#F0F4FF" : "#6B7280",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              }}>
                {mode === "grid" ? "⊞" : "≡"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Hostel & PG Section ── */}
        {(cat === "All" || cat === "Hostel & PG") && (
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 4, height: 20, borderRadius: 2, background: "#4F8EF7" }} />
              <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, color: "#F0F4FF" }}>🏠 Hostel & PG Listings</p>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6B7280", background: "rgba(79,142,247,0.1)", padding: "2px 10px", borderRadius: 9999 }}>Near Campus</span>
            </div>

            {/* Strip tip */}
            <div style={{ marginBottom: 14 }}>
              <AdStrip ad={{
                id: "strip1",
                type: "hostel",
                title: "Pro Tip",
                subtitle: "Book early for the academic year — limited premium rooms available!",
                description: "",
                tag: "TIP",
                tagColor: "#4F8EF7",
                bgGradient: "",
                accentColor: "#4F8EF7",
                glowColor: "rgba(79,142,247,0.2)",
                ctaLabel: "Browse All",
                icon: "💡",
                dismissible: true,
              }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
              {(cat === "All" ? HOSTEL_ADS : HOSTEL_ADS.filter(ad =>
                !search || ad.title.toLowerCase().includes(search.toLowerCase())
              )).map(ad => (
                <HostelCompareCard key={ad.id} ad={ad} />
              ))}
            </div>
          </div>
        )}

        {/* ── Own College Events ── */}
        {(cat === "All" || cat === "College Events") && (
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 4, height: 20, borderRadius: 2, background: "#A78BFA" }} />
              <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, color: "#F0F4FF" }}>🎓 MIT College Events</p>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#A78BFA", background: "rgba(167,139,250,0.1)", padding: "2px 10px", borderRadius: 9999 }}>Official</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
              {OWN_COLLEGE_ADS.filter(ad =>
                !search || ad.title.toLowerCase().includes(search.toLowerCase())
              ).map(ad => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          </div>
        )}

        {/* ── Cross-College Ads ── */}
        {(cat === "All" || cat === "Cross-College") && (
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 4, height: 20, borderRadius: 2, background: "#10B981" }} />
              <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, color: "#F0F4FF" }}>🤝 Cross-College Opportunities</p>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "2px 10px", borderRadius: 9999 }}>Other Colleges</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
              {CROSS_COLLEGE_ADS.filter(ad =>
                !search || ad.title.toLowerCase().includes(search.toLowerCase())
              ).map(ad => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {visibleAds.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <span style={{ fontSize: 48 }}>🔍</span>
            <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700, color: "#F0F4FF", marginTop: 12 }}>No ads found</p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280", marginTop: 4 }}>Try a different category or search term</p>
          </div>
        )}

        {/* ── Post Your Ad CTA ── */}
        <div style={{
          marginTop: 8, padding: "24px 28px",
          background: "linear-gradient(135deg,rgba(247,201,72,0.06),rgba(79,142,247,0.04))",
          border: "1px solid rgba(247,201,72,0.2)", borderRadius: 16,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 36 }}>📣</span>
            <div>
              <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, color: "#F0F4FF", marginBottom: 3 }}>Want to post an ad?</p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9CA3AF" }}>
                Hostel owners, college clubs & event organizers — reach 5,000+ students. Contact campus admin.
              </p>
            </div>
          </div>
          <Link href="/marketplace/sell" style={{ textDecoration: "none" }}>
            <button style={{
              height: 42, padding: "0 24px", borderRadius: 9999,
              background: "linear-gradient(90deg,#F7C948,#F59E0B)",
              border: "none", fontFamily: "'DM Sans',sans-serif", fontSize: 13,
              fontWeight: 700, color: "#1a0d00", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(247,201,72,0.3)",
            }}>
              Post an Ad →
            </button>
          </Link>
        </div>
      </div>
    </StudentLayout>
  );
}
