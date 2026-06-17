"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { StudentLayout } from "@/components/StudentLayout";
import { 
  ArrowLeft, Megaphone, Building2, User, Clock, Eye, 
  MousePointer, Mail, ExternalLink, Calendar, AlertCircle, Loader2, X
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  admin?: { name: string; email: string };
}

function daysLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff <= 0 ? 0 : Math.ceil(diff / 86400000);
}

function fmtDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-IN", { 
    day: "2-digit", 
    month: "long", 
    year: "numeric" 
  });
}

function bannerSrc(url: string | null) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API}${url}`;
}

export default function AdDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [ad, setAd] = useState<LiveAd | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewed, setViewed] = useState(false);
  const [btnHov, setBtnHov] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Load Advertisement Details
  const loadAdDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/marketplace/ads/${id}`, { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Advertisement not found or has expired");
        }
        throw new Error("Failed to load advertisement");
      }
      const data = await res.json();
      setAd(data.ad);
      
      // Update page title
      if (data.ad?.title) {
        document.title = `${data.ad.title} | Campus Advertisements`;
      }
    } catch (e: any) {
      setError(e.message || "Could not fetch advertisement details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAdDetails();
  }, [loadAdDetails]);

  // Track View Silently
  useEffect(() => {
    if (ad && !viewed) {
      const trackView = async () => {
        try {
          await fetch(`${API}/api/marketplace/ads/${ad.id}/view`, { method: "POST" });
          setViewed(true);
        } catch (err) {}
      };
      trackView();
    }
  }, [ad, viewed]);

  // Track Click Silently
  const handleCtaClick = async () => {
    if (!ad) return;
    try {
      await fetch(`${API}/api/marketplace/ads/${ad.id}/click`, { method: "POST" });
      // Update click count in state locally for immediate feedback
      setAd(prev => prev ? { ...prev, clicks: prev.clicks + 1 } : null);
    } catch (err) {}
  };

  // ── Loading state skeleton
  if (loading) {
    return (
      <StudentLayout>
        <div style={{ padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ width: 100, height: 20, background: "#1e2d45", borderRadius: 4, marginBottom: 24 }} />
          <div style={{ height: 260, background: "#111827", border: "1px solid #1e2d45", borderRadius: 16, marginBottom: 28, animation: "pulse 1.5s infinite" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }} className="md:grid-cols-[2fr_1fr] grid">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ height: 28, background: "#1e2d45", borderRadius: 6, width: "60%" }} />
              <div style={{ height: 14, background: "#1e2d45", borderRadius: 6, width: "95%" }} />
              <div style={{ height: 14, background: "#1e2d45", borderRadius: 6, width: "90%" }} />
              <div style={{ height: 14, background: "#1e2d45", borderRadius: 6, width: "40%" }} />
            </div>
            <div style={{ height: 200, background: "#111827", border: "1px solid #1e2d45", borderRadius: 16 }} />
          </div>
        </div>
      </StudentLayout>
    );
  }

  // ── Error / Not Found state
  if (error || !ad) {
    return (
      <StudentLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 56 }}>📢</div>
          <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#F0F4FF" }}>Advertisement Not Found</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280", marginTop: -8, maxWidth: 360, textAlign: "center" }}>
            {error || "This advertisement has either expired, been deactivated, or does not exist."}
          </p>
          <Link href="/marketplace/ads" style={{ textDecoration: "none" }}>
            <button style={{
              height: 40, padding: "0 22px", borderRadius: 9999, border: "none",
              background: "#4F8EF7", fontFamily: "'DM Sans', sans-serif", fontSize: 13,
              fontWeight: 700, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 4px 14px rgba(79,142,247,0.3)"
            }}>
              <ArrowLeft size={14} /> Back to Advertisements
            </button>
          </Link>
        </div>
      </StudentLayout>
    );
  }

  // Extract and parse campaign metadata if present
  let displayDescription = ad.description;
  let customCtaLink = "";
  let customCtaLabel = "";
  let customCtaContact = "";

  if (ad.description && ad.description.includes("📢 CAMPAIGN_METADATA:")) {
    const parts = ad.description.split("📢 CAMPAIGN_METADATA:");
    displayDescription = parts[0].trim();
    const metaStr = parts[1] || "";
    
    // Parse link
    const linkMatch = metaStr.match(/CTA_LINK:\s*(https?:\/\/\S+|[^\n]+)/i);
    if (linkMatch) customCtaLink = linkMatch[1].trim();

    // Parse label
    const labelMatch = metaStr.match(/CTA_LABEL:\s*([^\n]+)/i);
    if (labelMatch) customCtaLabel = labelMatch[1].trim();

    // Parse contact
    const contactMatch = metaStr.match(/CTA_CONTACT:\s*([^\n]+)/i);
    if (contactMatch) customCtaContact = contactMatch[1].trim();
  }

  const isOwn = ad.scope === "own";
  const accent = isOwn ? "#10B981" : "#F7C948";
  const days = daysLeft(ad.expiresAt);
  const imgSrc = bannerSrc(ad.bannerUrl);

  // Compute Expiry Progress Percentage
  const totalDays = ad.duration || 7;
  const progressPercent = Math.max(0, Math.min(100, (days / totalDays) * 100));

  const formatDimLabel: Record<string, string> = {
    banner: "Wide Banner (3:1)",
    square: "Square (1:1)",
    strip: "Thin Strip (6:1)",
    portrait: "Story Layout (2:3)",
    card: "Grid Card Layout",
  };

  return (
    <StudentLayout>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .detail-pg { animation: fadeUp .4s ease; }
        .glass-box {
          background: rgba(17, 24, 39, 0.6);
          backdrop-filter: blur(12px);
          border: 1.5px solid #1e2d45;
          border-radius: 18px;
        }
      ` }} />

      <div className="detail-pg" style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <Link href="/marketplace/ads" style={{ textDecoration: "none", color: "#6B7280", fontSize: 13, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#F0F4FF"} onMouseLeave={e => e.currentTarget.style.color = "#6B7280"}>
            <ArrowLeft size={14} />
            Back to Advertisements
          </Link>
          <span style={{ color: "#374151" }}>/</span>
          <span style={{ color: "#9CA3AF", fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
            {ad.title}
          </span>
        </div>

        {/* Hero Section Banner/Billboard */}
        <div className="glass-box" style={{ 
          position: "relative", 
          overflow: "hidden", 
          marginBottom: 28, 
          background: isOwn
            ? "linear-gradient(135deg,#0a1f15 0%,#0c1424 100%)"
            : "linear-gradient(135deg,#1f1a00 0%,#0c1424 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          {imgSrc ? (
            <img 
              src={imgSrc} 
              alt={ad.title} 
              onClick={() => setLightboxOpen(true)}
              style={{ width: "100%", height: "auto", display: "block", cursor: "zoom-in" }} 
            />
          ) : (
            <div style={{ height: 260, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, justifyContent: "center" }}>
              <Megaphone size={64} style={{ color: `${accent}40` }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280" }}>No visual poster uploaded</span>
            </div>
          )}

          {/* Badges Overlay */}
          <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 8 }}>
            <span style={{
              background: isOwn ? "rgba(16,185,129,0.9)" : "rgba(247,201,72,0.9)",
              color: isOwn ? "#0a1f15" : "#1a1000",
              fontSize: 9, fontWeight: 800, letterSpacing: "1px",
              padding: "4px 10px", borderRadius: 6,
              backdropFilter: "blur(4px)",
            }}>
              {isOwn ? "🏫 YOUR COLLEGE" : "🌐 CROSS-COLLEGE"}
            </span>
            <span style={{
              background: "rgba(0,0,0,0.7)",
              color: "#9CA3AF",
              fontSize: 9, fontWeight: 700, letterSpacing: "0.5px",
              padding: "4px 10px", borderRadius: 6,
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.08)"
            }}>
              {formatDimLabel[ad.format] || ad.format}
            </span>
          </div>
        </div>

        {/* Main Content Layout Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 28 }} className="md:grid-cols-[2fr_1fr] grid">
          
          {/* Left Column: Title, Description, Publisher Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Title & Info Card */}
            <div className="glass-box" style={{ padding: "28px" }}>
              <h1 style={{ 
                fontFamily: "'Sora', sans-serif", 
                fontSize: 26, 
                fontWeight: 900, 
                color: "#F0F4FF", 
                marginBottom: 16, 
                lineHeight: 1.25,
                letterSpacing: "-0.5px"
              }}>
                {ad.title}
              </h1>

              <div style={{ height: 1, background: "rgba(30,45,69,0.5)", margin: "16px 0" }} />

              <p style={{ 
                fontFamily: "'DM Sans', sans-serif", 
                fontSize: 14, 
                color: "#9CA3AF", 
                lineHeight: 1.8, 
                whiteSpace: "pre-wrap" 
              }}>
                {displayDescription}
              </p>
            </div>

            {/* Publisher Details */}
            <div className="glass-box" style={{ padding: "24px" }}>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: "#F0F4FF", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Building2 size={16} style={{ color: accent }} />
                Publisher Information
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                <div>
                  <span style={{ display: "block", fontSize: 11, color: "#6B7280", marginBottom: 4 }}>COLLEGE</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#F0F4FF", fontWeight: 600 }}>
                    {ad.college?.name || "Campus Administration"}
                  </span>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: 11, color: "#6B7280", marginBottom: 4 }}>PUBLISHED BY</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#F0F4FF", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    <User size={13} style={{ color: "#6B7280" }} />
                    {ad.admin?.name || "College Administrator"}
                  </span>
                </div>
                {customCtaContact && (
                  <div>
                    <span style={{ display: "block", fontSize: 11, color: "#6B7280", marginBottom: 4 }}>CAMPAIGN CONTACT</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#F0F4FF", fontWeight: 600 }}>
                      {customCtaContact}
                    </span>
                  </div>
                )}
              </div>

              {ad.admin?.email && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px dashed rgba(30,45,69,0.5)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Mail size={14} style={{ color: "#6B7280" }} />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#9CA3AF" }}>
                      {ad.admin.email}
                    </span>
                  </div>
                  <a 
                    href={`mailto:${ad.admin?.email}?subject=Inquiry about Ad: ${encodeURIComponent(ad.title)}`}
                    onClick={handleCtaClick}
                    style={{ 
                      fontSize: 12, fontWeight: 700, color: accent, 
                      textDecoration: "none", display: "flex", alignItems: "center", gap: 5 
                    }}
                  >
                    Send Email Contact <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>

            {/* Campaign Specifications */}
            <div className="glass-box" style={{ padding: "24px" }}>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: "#F0F4FF", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar size={16} style={{ color: "#4F8EF7" }} />
                Campaign Details
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
                <div>
                  <span style={{ display: "block", fontSize: 10, color: "#6B7280", marginBottom: 4 }}>LAUNCH DATE</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F0F4FF", fontWeight: 500 }}>
                    {fmtDate(ad.startsAt)}
                  </span>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: 10, color: "#6B7280", marginBottom: 4 }}>EXPIRY DATE</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F0F4FF", fontWeight: 500 }}>
                    {fmtDate(ad.expiresAt)}
                  </span>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: 10, color: "#6B7280", marginBottom: 4 }}>TOTAL DURATION</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F0F4FF", fontWeight: 500 }}>
                    {ad.duration} Days
                  </span>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: 10, color: "#6B7280", marginBottom: 4 }}>CAMPAIGN SCOPE</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: accent, fontWeight: 700, textTransform: "uppercase" }}>
                    {ad.scope === "own" ? "Local College" : "Global Cross-College"}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Statistics, Expiry Progress, CTA Contact */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            
            {/* Stats Overview */}
            <div className="glass-box" style={{ padding: "24px" }}>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 800, color: "#F0F4FF", marginBottom: 18 }}>
                Engagement Metrics
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.18)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(30,45,69,0.3)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Eye size={16} style={{ color: "#4F8EF7" }} />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF" }}>Total Views</span>
                  </div>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: "#F0F4FF" }}>
                    {ad.views.toLocaleString("en-IN")}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.18)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(30,45,69,0.3)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <MousePointer size={15} style={{ color: "#10B981" }} />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF" }}>Total Clicks</span>
                  </div>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: "#F0F4FF" }}>
                    {ad.clicks.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Time / Countdown Status Card */}
            <div className="glass-box" style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 800, color: "#F0F4FF" }}>
                  Campaign Expiry
                </h3>
                {days <= 3 && days > 0 && (
                  <span style={{
                    background: "rgba(239,68,68,0.15)", color: "#EF4444", fontSize: 9, fontWeight: 800,
                    padding: "3px 8px", borderRadius: 5, border: "1px solid rgba(239,68,68,0.25)"
                  }}>
                    Expires Soon
                  </span>
                )}
              </div>

              {/* Progress bar container */}
              <div style={{ background: "rgba(255,255,255,0.05)", height: 8, borderRadius: 9999, position: "relative", marginBottom: 12, overflow: "hidden" }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, height: "100%", width: `${progressPercent}%`,
                  background: isOwn 
                    ? "linear-gradient(90deg, #059669, #10B981)" 
                    : "linear-gradient(90deg, #D97706, #F7C948)",
                  borderRadius: 9999, transition: "width 0.4s ease"
                }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6B7280" }}>
                  {ad.duration - days} days elapsed
                </span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: accent, fontWeight: 700 }}>
                  {days} days remaining
                </span>
              </div>
            </div>

            {/* Actions Card / CTA */}
            {(customCtaLink || ad.admin?.email) && (
              <div className="glass-box" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}>
                <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 800, color: "#F0F4FF", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Ad Action
                </h4>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6B7280", lineHeight: 1.5 }}>
                  {customCtaLink 
                    ? "Click the action button below to proceed to the external registration/information portal."
                    : "Interested in this offer or have questions? Contact the publisher directly by sending an inquiry email."
                  }
                </p>
                <a 
                  href={customCtaLink ? customCtaLink : `mailto:${ad.admin?.email}?subject=Inquiry about Ad: ${encodeURIComponent(ad.title)}`}
                  target={customCtaLink ? "_blank" : undefined}
                  rel={customCtaLink ? "noopener noreferrer" : undefined}
                  onClick={handleCtaClick}
                  onMouseEnter={() => setBtnHov(true)}
                  onMouseLeave={() => setBtnHov(false)}
                  style={{ 
                    textDecoration: "none", 
                    width: "100%", 
                    display: "block" 
                  }}
                >
                  <button style={{
                    width: "100%", height: 44, borderRadius: 12, border: "none",
                    background: isOwn 
                      ? "linear-gradient(90deg, #059669, #10B981)" 
                      : "linear-gradient(90deg, #D97706, #F7C948)",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
                    color: isOwn ? "#fff" : "#1a1000",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: btnHov 
                      ? isOwn ? "0 6px 20px rgba(16,185,129,0.45)" : "0 6px 20px rgba(247,201,72,0.45)"
                      : isOwn ? "0 4px 14px rgba(16,185,129,0.3)" : "0 4px 14px rgba(247,201,72,0.3)",
                    transform: btnHov ? "translateY(-1px)" : "none",
                    transition: "all 0.2s"
                  }}>
                    {customCtaLink ? (
                      <>
                        <ExternalLink size={14} /> {customCtaLabel || "Learn More"}
                      </>
                    ) : (
                      <>
                        <Mail size={14} /> Send Email Inquiry
                      </>
                    )}
                  </button>
                </a>
              </div>
            )}

            {/* Policy Notice Box */}
            <div style={{ padding: "14px 18px", background: "rgba(79,142,247,0.05)", border: "1px solid rgba(79,142,247,0.12)", borderRadius: 14, display: "flex", gap: 10 }}>
              <AlertCircle size={15} style={{ color: "#4F8EF7", flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6B7280", lineHeight: 1.5 }}>
                Advertisements are reviewed and certified by CampusConnect admins. For complaints or feedback regarding content safety, please contact your administration office.
              </p>
            </div>

        </div>

      </div>

    </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && imgSrc && (
        <div 
          onClick={() => setLightboxOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
            animation: "modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          {/* Close button */}
          <button 
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              fontSize: 20,
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          >
            <X size={20} />
          </button>
          <img 
            src={imgSrc} 
            alt={ad.title} 
            style={{ 
              maxWidth: "95vw", 
              maxHeight: "95vh", 
              objectFit: "contain",
              borderRadius: 8,
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)"
            }} 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </StudentLayout>
  );
}
