"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/StudentLayout";
import api from "@/lib/axios";
import { AdCard, AdBannerHorizontal, AdStrip } from "@/components/AdBanner";
import { INLINE_ADS, OWN_COLLEGE_ADS, HOSTEL_ADS } from "@/lib/adsData";
import { Search, SlidersHorizontal, TrendingUp, Zap, X } from "lucide-react";

type Category = "All" | "Notes PDF" | "Video Course" | "Physical" | "Ads";

const CATEGORIES: { key: Category; icon: string; color: string; glow: string }[] = [
  { key: "All",          icon: "🏪", color: "#4F8EF7", glow: "rgba(79,142,247,0.2)" },
  { key: "Notes PDF",    icon: "📄", color: "#A78BFA", glow: "rgba(167,139,250,0.2)" },
  { key: "Video Course", icon: "🎥", color: "#10B981", glow: "rgba(16,185,129,0.2)" },
  { key: "Physical",     icon: "🔧", color: "#F59E0B", glow: "rgba(245,158,11,0.2)" },
  { key: "Ads",          icon: "📢", color: "#F7C948", glow: "rgba(247,201,72,0.2)" },
];

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function mediaUrl(p: string) { return p?.startsWith("http") ? p : `${API}${p}`; }
function isVideo(p: string)  { return /\.(mp4|webm|ogg|mov)$/i.test(p); }

interface Product {
  id: string;
  productType: string;
  images: string[];
  title: string;
  price: number;
  category: string;
  seller: { name: string };
  views?: number;
  isApproved?: boolean;
  badge?: string;
  badgeC?: string;
  hot?: boolean;
}

function getBadge(p: Product): { badge: string; badgeC: string } {
  const cat = (p.category || "").toLowerCase();
  if (p.productType === "physical") return { badge: "Physical", badgeC: "#4F8EF7" };
  if (cat.includes("video"))        return { badge: "Video",    badgeC: "#10B981" };
  return { badge: "Notes PDF", badgeC: "#A78BFA" };
}

const BADGE_BG: Record<string, string> = {
  "Notes PDF": "rgba(167,139,250,0.15)",
  "Video":     "rgba(16,185,129,0.15)",
  "Physical":  "rgba(79,142,247,0.15)",
};

function fallbackIcon(badge: string, cat: string) {
  if (badge === "Video")    return "🎥";
  if (badge === "Notes PDF") return "📄";
  const c = cat.toLowerCase();
  if (c.includes("electron") || c.includes("laptop")) return "💻";
  if (c.includes("book") || c.includes("note"))       return "📚";
  return "🛍️";
}
function fallbackBg(badge: string) {
  if (badge === "Video")     return "linear-gradient(135deg,#0a1f20,#1b3040)";
  if (badge === "Notes PDF") return "linear-gradient(135deg,#1a0d30,#2d1b4e)";
  return "linear-gradient(135deg,#0d2040,#1e3a5f)";
}

function ProductCard({ p }: { p: Product }) {
  const [hov, setHov] = useState(false);
  const { badge, badgeC } = getBadge(p);
  const href = p.productType === "physical"
    ? `/marketplace/product/${p.id}`
    : `/marketplace/digital/${p.id}`;

  const realImages = (p.images || []).filter(f => !isVideo(f));
  const realVideos = (p.images || []).filter(f => isVideo(f));
  const thumb      = realImages[0] ? mediaUrl(realImages[0]) : null;
  const vidSrc     = realVideos[0] ? mediaUrl(realVideos[0]) : null;

  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          borderRadius: 18, overflow: "hidden", cursor: "pointer",
          border: `1.5px solid ${hov ? "#2a3a5a" : "#1e2d45"}`,
          background: "#111827",
          boxShadow: hov ? "0 12px 40px rgba(0,0,0,0.4)" : "none",
          transform: hov ? "translateY(-4px)" : "none",
          transition: "all 0.25s", display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ height: 170, position: "relative", overflow: "hidden", background: fallbackBg(badge) }}>
          {thumb && !hov && (
            <img src={thumb} alt={p.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          )}
          {!vidSrc && realImages[1] && hov && (
            <img src={mediaUrl(realImages[1])} alt={p.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          )}
          {!vidSrc && !realImages[1] && thumb && hov && (
            <img src={thumb} alt={p.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          )}
          {vidSrc && hov && (
            <video autoPlay muted loop playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}>
              <source src={vidSrc} />
            </video>
          )}
          {!thumb && !(vidSrc && hov) && (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 52, filter: hov ? "drop-shadow(0 0 16px rgba(255,255,255,0.25))" : "none", transition: "filter 0.25s" }}>
                {fallbackIcon(badge, p.category)}
              </span>
            </div>
          )}
          {vidSrc && !hov && (
            <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.75)", borderRadius: 6, padding: "3px 8px", color: "#10B981", fontSize: 10, fontWeight: 700 }}>
              ▶ Video
            </div>
          )}
          {vidSrc && hov && (
            <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(16,185,129,0.2)", border: "1px solid #10B981", borderRadius: 6, padding: "3px 8px", color: "#10B981", fontSize: 10, fontWeight: 700 }}>
              🔴 Live Preview
            </div>
          )}
          <span style={{ position: "absolute", top: 10, left: 10, background: BADGE_BG[badge] || "rgba(79,142,247,0.15)", color: badgeC, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 6 }}>
            {badge}
          </span>
          {p.hot && (
            <span style={{ position: "absolute", top: 10, right: 10, background: "rgba(239,68,68,0.15)", color: "#EF4444", fontSize: 9, fontWeight: 800, letterSpacing: "1px", padding: "3px 8px", borderRadius: 6, display: "flex", alignItems: "center", gap: 3 }}>
              <Zap size={9} />HOT
            </span>
          )}
        </div>

        <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#4F8EF7,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
              {(p.seller?.name || "U").split(" ").map((w: string) => w[0]).join("")}
            </div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6B7280" }}>{p.seller?.name || "Anonymous"}</span>
          </div>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600, color: "#F0F4FF", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {p.title}
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, color: "#10B981" }}>
              ₹{p.price.toLocaleString("en-IN")}
            </span>
            <button style={{
              height: 32, padding: "0 14px", borderRadius: 9999,
              background: badge === "Video" ? "rgba(16,185,129,0.12)" : badge === "Notes PDF" ? "rgba(167,139,250,0.12)" : "rgba(79,142,247,0.12)",
              border: `1px solid ${badge === "Video" ? "rgba(16,185,129,0.3)" : badge === "Notes PDF" ? "rgba(167,139,250,0.3)" : "rgba(79,142,247,0.3)"}`,
              color: badge === "Video" ? "#10B981" : badge === "Notes PDF" ? "#A78BFA" : "#4F8EF7",
              fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>
              {p.productType === "physical" ? "View →" : badge === "Notes PDF" ? "Buy PDF" : "Enroll"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

const PER_PAGE = 12;

function normProduct(p: any): Product {
  const cat = (p.category || "").toLowerCase();
  let badge = "Physical"; let badgeC = "#4F8EF7";
  if (p.productType === "digital") {
    if (cat.includes("video") || p.digitalSubType === "video") { badge = "Video"; badgeC = "#10B981"; }
    else { badge = "Notes PDF"; badgeC = "#A78BFA"; }
  }
  return { ...p, badge, badgeC };
}

// Demo products as fallback (shown while API loads)
const DEMO: Product[] = [
  { id:"1", productType:"physical", images:[], badge:"Physical", badgeC:"#4F8EF7", seller:{name:"Rahul S."}, title:"Dell Latitude i5 Laptop", price:18000, views:450, category:"Electronics", hot:true },
  { id:"2", productType:"digital", images:[], badge:"Notes PDF", badgeC:"#A78BFA", seller:{name:"Arjun M."}, title:"GATE 2024 ECE Notes", price:299, views:120, category:"Notes PDF", hot:true },
  { id:"3", productType:"digital", images:[], badge:"Video", badgeC:"#10B981", seller:{name:"Priya K."}, title:"Advanced DSP Full Course", price:499, views:230, category:"Video Course", hot:false },
  { id:"4", productType:"physical", images:[], badge:"Physical", badgeC:"#4F8EF7", seller:{name:"Sneha P."}, title:"Engineering Drawing Kit", price:450, views:88, category:"Equipment", hot:false },
  { id:"5", productType:"digital", images:[], badge:"Notes PDF", badgeC:"#A78BFA", seller:{name:"Vijay R."}, title:"Thermodynamics Notes", price:149, views:67, category:"Notes PDF", hot:false },
  { id:"6", productType:"digital", images:[], badge:"Video", badgeC:"#10B981", seller:{name:"Dev G."}, title:"Python ML Bootcamp 2024", price:799, views:340, category:"Video Course", hot:true },
  { id:"7", productType:"physical", images:[], badge:"Physical", badgeC:"#4F8EF7", seller:{name:"Meera T."}, title:"Sony WH-1000XM4", price:14000, views:55, category:"Electronics", hot:false },
  { id:"8", productType:"digital", images:[], badge:"Notes PDF", badgeC:"#A78BFA", seller:{name:"Raj K."}, title:"Engg Maths Handwritten", price:199, views:99, category:"Notes PDF", hot:true },
] as any;

export default function MarketplacePage() {
  const [cat, setCat] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Newest");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [minP, setMinP] = useState("");
  const [maxP, setMaxP] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>(DEMO as any);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  useEffect(() => {
    api.get("/api/marketplace/products?limit=100")
      .then(res => {
        const data = res.data;
        if (data?.products?.length) {
          setAllProducts(data.products.map(normProduct));
        }
        if (typeof data?.total === 'number') setTotalCount(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = allProducts.filter(p => {
    const { badge } = getBadge(p);
    if (cat === "Notes PDF" && badge !== "Notes PDF") return false;
    if (cat === "Video Course" && badge !== "Video") return false;
    if (cat === "Physical" && p.productType !== "physical") return false;
    if (cat === "Ads") return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (minP && p.price < parseFloat(minP)) return false;
    if (maxP && p.price > parseFloat(maxP)) return false;
    return true;
  }).sort((a, b) => {
    if (sort === "Price: Low to High") return a.price - b.price;
    if (sort === "Price: High to Low") return b.price - a.price;
    if (sort === "Most Popular") return (b.views || 0) - (a.views || 0);
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safeP = Math.min(page, totalPages);
  const paged = filtered.slice((safeP - 1) * PER_PAGE, safeP * PER_PAGE);

  const activeFilters = [minP, maxP].filter(Boolean).length;
  function clearFilters() { setMinP(""); setMaxP(""); setPage(1); }

  type GridItem = { kind: "product"; data: Product } | { kind: "ad"; data: typeof INLINE_ADS[0] };
  const gridItems: GridItem[] = [];
  let adIdx = 0;
  if (cat === "All") {
    paged.forEach((p, i) => {
      gridItems.push({ kind: "product", data: p });
      if ((i + 1) % 4 === 0 && adIdx < INLINE_ADS.length)
        gridItems.push({ kind: "ad", data: INLINE_ADS[adIdx++] });
    });
  } else {
    paged.forEach(p => gridItems.push({ kind: "product", data: p }));
  }

  const showAdsOnly = cat === "Ads";

  return (
    <StudentLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .mkt-page { animation: fadeUp .4s ease; }
      `}</style>

      <div className="mkt-page" style={{ padding: "28px 32px", maxWidth: 1400 }}>

        {/* Hero Banner */}
        <div style={{
          background: "linear-gradient(135deg,#0d1829 0%,#111827 40%,#0a1f15 100%)",
          border: "1px solid rgba(79,142,247,0.2)", borderRadius: 20,
          padding: "28px 32px", marginBottom: 28, position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(79,142,247,0.05)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: 200, width: 160, height: 160, borderRadius: "50%", background: "rgba(16,185,129,0.04)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, position: "relative" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#10B981", fontSize: 10, fontWeight: 800, letterSpacing: "1.2px", padding: "3px 10px", borderRadius: 9999 }}>🔒 MIT Campus Only</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#10B981" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", display: "inline-block", animation: "pulse 1.5s ease-in-out infinite" }} />
                  Live Marketplace
                </span>
              </div>
              <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, color: "#F0F4FF", marginBottom: 6, lineHeight: 1.2 }}>
                Campus Marketplace
              </h1>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280", maxWidth: 500 }}>
                Buy &amp; sell notes, video courses, gadgets and more — exclusively within MIT College of Engineering.
              </p>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { label: "Products", value: totalCount !== null ? `${totalCount}+` : "—", color: "#4F8EF7" },
                { label: "Students", value: "1.2k+", color: "#10B981" },
                { label: "Sales Today", value: "18", color: "#F7C948" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6B7280" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Featured Ad Banner (Hostel) — shown in All view ── */}
        {cat === "All" && (
          <div style={{ marginBottom: 22 }}>
            <AdBannerHorizontal ad={HOSTEL_ADS[0]} />
          </div>
        )}

        {/* Category Pills */}
        <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              style={{
                height: 40, padding: "0 18px", borderRadius: 9999, cursor: "pointer",
                background: cat === c.key ? c.color : "transparent",
                border: `1.5px solid ${cat === c.key ? c.color : "#1e2d45"}`,
                color: cat === c.key ? (c.key === "Ads" ? "#1a0d00" : "#fff") : "#6B7280",
                fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700,
                display: "flex", alignItems: "center", gap: 7,
                boxShadow: cat === c.key ? `0 4px 20px ${c.glow}` : "none",
                transition: "all 0.2s",
              }}
            >
              {c.icon} {c.key}
            </button>
          ))}
        </div>

        {/* Search + Sort Row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6B7280", pointerEvents: "none" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products, notes, courses…"
              style={{ width: "100%", height: 44, paddingLeft: 42, background: "#111827", border: "1.5px solid #1e2d45", borderRadius: 12, outline: "none", fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#F0F4FF", boxSizing: "border-box", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#4F8EF7"}
              onBlur={e => e.target.style.borderColor = "#1e2d45"}
            />
          </div>
          <select
            value={sort} onChange={e => setSort(e.target.value)}
            style={{ height: 44, padding: "0 16px", background: "#111827", border: "1.5px solid #1e2d45", borderRadius: 12, color: "#9CA3AF", fontFamily: "'DM Sans',sans-serif", fontSize: 13, outline: "none", cursor: "pointer" }}
          >
            {["Newest", "Price: Low to High", "Price: High to Low", "Most Popular"].map(o => <option key={o}>{o}</option>)}
          </select>
          <button
            onClick={() => setFilterOpen(o => !o)}
            style={{ height: 44, padding: "0 18px", background: filterOpen ? "rgba(79,142,247,0.1)" : "#111827", border: `1.5px solid ${filterOpen ? "#4F8EF7" : "#1e2d45"}`, borderRadius: 12, color: filterOpen ? "#4F8EF7" : "#9CA3AF", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, position: "relative", transition: "all 0.2s" }}
          >
            <SlidersHorizontal size={14} /> Filters
            {activeFilters > 0 && <span style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "#EF4444", color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{activeFilters}</span>}
          </button>
        </div>

        {/* ── Filter Panel ── */}
        {filterOpen && (
          <div style={{ background: "#111827", border: "1.5px solid #1e2d45", borderRadius: 16, padding: "20px 24px", marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: "#F0F4FF" }}>🎛 Filters</p>
              <button onClick={clearFilters} style={{ background: "transparent", border: "none", fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#EF4444", cursor: "pointer" }}>Clear All</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1px", color: "#6B7280", textTransform: "uppercase", marginBottom: 10 }}>Price Range (₹)</p>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input value={minP} onChange={e => { setMinP(e.target.value); setPage(1); }} placeholder="Min" style={{ flex: 1, height: 36, padding: "0 10px", background: "#1a2235", border: "1.5px solid #1e2d45", borderRadius: 8, color: "#F0F4FF", fontFamily: "'DM Sans',sans-serif", fontSize: 13, outline: "none" }} />
                  <span style={{ color: "#374151" }}>–</span>
                  <input value={maxP} onChange={e => { setMaxP(e.target.value); setPage(1); }} placeholder="Max" style={{ flex: 1, height: 36, padding: "0 10px", background: "#1a2235", border: "1.5px solid #1e2d45", borderRadius: 8, color: "#F0F4FF", fontFamily: "'DM Sans',sans-serif", fontSize: 13, outline: "none" }} />
                </div>
              </div>
              <div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1px", color: "#6B7280", textTransform: "uppercase", marginBottom: 10 }}>Active Filters</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {minP && <span style={{ background: "rgba(79,142,247,0.12)", color: "#4F8EF7", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>Min ₹{minP} <button onClick={() => setMinP("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#4F8EF7", padding: 0 }}><X size={10} /></button></span>}
                  {maxP && <span style={{ background: "rgba(79,142,247,0.12)", color: "#4F8EF7", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>Max ₹{maxP} <button onClick={() => setMaxP("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#4F8EF7", padding: 0 }}><X size={10} /></button></span>}
                  {activeFilters === 0 && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#374151" }}>No filters applied</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trending banner */}
        {cat === "All" && (
          <div style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 12, padding: "10px 16px", marginBottom: 22, display: "flex", alignItems: "center", gap: 10 }}>
            <TrendingUp size={14} style={{ color: "#10B981", flexShrink: 0 }} />
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#9CA3AF" }}>
              <strong style={{ color: "#10B981" }}>Trending now:</strong> GATE Notes, Python Courses, MacBook listings — updated 5 min ago
            </p>
          </div>
        )}

        {/* ── ADS-ONLY VIEW ── */}
        {showAdsOnly ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280" }}>
                Showing <strong style={{ color: "#F0F4FF" }}>{INLINE_ADS.length + OWN_COLLEGE_ADS.length}</strong> advertisements
              </p>
              <Link href="/marketplace/ads" style={{ textDecoration: "none" }}>
                <span style={{ fontSize: 11, color: "#F7C948", background: "rgba(247,201,72,0.1)", padding: "3px 12px", borderRadius: 9999, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
                  View Full Ad Hub →
                </span>
              </Link>
            </div>

            {/* MIT Events */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1.4px", color: "#374151", textTransform: "uppercase", marginBottom: 14 }}>🎓 MIT COLLEGE EVENTS</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20, marginBottom: 20 }}>
                {OWN_COLLEGE_ADS.map(ad => <AdCard key={ad.id} ad={ad} />)}
              </div>
            </div>

            {/* Hostel & PG */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1.4px", color: "#374151", textTransform: "uppercase", marginBottom: 14 }}>🏠 HOSTEL & PG NEAR CAMPUS</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
                {INLINE_ADS.filter(a => a.type === "hostel" || a.type === "pg").map(ad => <AdCard key={ad.id} ad={ad} />)}
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Link href="/marketplace/ads" style={{ textDecoration: "none" }}>
                <button style={{
                  height: 44, padding: "0 32px", borderRadius: 9999,
                  background: "linear-gradient(90deg,#F7C948,#F59E0B)",
                  border: "none", fontFamily: "'DM Sans',sans-serif", fontSize: 14,
                  fontWeight: 700, color: "#1a0d00", cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(247,201,72,0.3)",
                }}>
                  📢 Explore All Advertisements →
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280" }}>
                Showing <strong style={{ color: "#F0F4FF" }}>{paged.length}</strong> of <strong style={{ color: "#F0F4FF" }}>{filtered.length}</strong> {cat !== "All" ? cat : "products"}
                {cat === "All" && <span style={{ color: "#F7C948", marginLeft: 8, fontSize: 11 }}>+ ads mixed in</span>}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ icon: "📄", label: "Notes", c: "#A78BFA" }, { icon: "🎥", label: "Videos", c: "#10B981" }, { icon: "🔧", label: "Physical", c: "#4F8EF7" }].map(x => (
                  <span key={x.label} style={{ fontSize: 11, color: x.c, background: `${x.c}15`, padding: "3px 10px", borderRadius: 9999, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>{x.icon} {x.label}</span>
                ))}
              </div>
            </div>

            {/* ── MIT Event strip ad ── */}
            {cat === "All" && (
              <div style={{ marginBottom: 18 }}>
                <AdStrip ad={{
                  ...OWN_COLLEGE_ADS[0],
                  subtitle: "Register for Zenith Tech Fest — ₹5L prize pool. Dec 20 deadline!",
                  dismissible: true,
                }} />
              </div>
            )}

            {/* Mixed Product + Ad Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 22, marginBottom: 40 }}>
              {gridItems.map((item, idx) =>
                item.kind === "product"
                  ? <ProductCard key={`p-${item.data.id}`} p={item.data} />
                  : <AdCard key={`ad-${item.data.id}-${idx}`} ad={item.data} />
              )}
              {filtered.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0" }}>
                  <span style={{ fontSize: 48 }}>🔍</span>
                  <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700, color: "#F0F4FF", marginTop: 12 }}>No results found</p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6B7280", marginTop: 4 }}>Try a different filter or search term</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, paddingBottom: 8 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safeP <= 1} style={{ height: 36, padding: "0 14px", borderRadius: 8, background: "transparent", border: `1.5px solid ${safeP <= 1 ? "#1e2d45" : "#2a3a5a"}`, fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: safeP <= 1 ? "#374151" : "#6B7280", cursor: safeP <= 1 ? "not-allowed" : "pointer" }}>← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)} style={{ height: 36, padding: "0 14px", borderRadius: 8, background: n === safeP ? "#4F8EF7" : "transparent", border: `1.5px solid ${n === safeP ? "#4F8EF7" : "#1e2d45"}`, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: n === safeP ? 700 : 500, color: n === safeP ? "#fff" : "#6B7280", cursor: "pointer" }}>{n}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safeP >= totalPages} style={{ height: 36, padding: "0 14px", borderRadius: 8, background: "transparent", border: `1.5px solid ${safeP >= totalPages ? "#1e2d45" : "#2a3a5a"}`, fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: safeP >= totalPages ? "#374151" : "#6B7280", cursor: safeP >= totalPages ? "not-allowed" : "pointer" }}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </StudentLayout>
  );
}
