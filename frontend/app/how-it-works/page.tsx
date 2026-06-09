"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronDown,
  CheckCircle,
  Shield,
  Lock,
  Eye,
  Download,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import PublicNavbar from "@/components/layout/PublicNavbar";
import Footer from "@/components/layout/Footer";

/* ─── intersection hook ─────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, vis };
}

/* ─── data ──────────────────────────────────────────────────────── */
const TABS = [
  {
    id: "student", label: "Student",
    accent: "#4F8EF7", accentBg: "rgba(79,142,247,0.08)",
    accentBorder: "rgba(79,142,247,0.22)",
    steps: [
      { icon: "📧", text: "Enter your enrollment email" },
      { icon: "📬", text: "Receive OTP on your college email" },
      { icon: "📝", text: "Submit request → admin reviews" },
      { icon: "✅", text: "Get approved → enter your college marketplace" },
      { icon: "🛒", text: "Browse, buy, and sell freely" },
    ],
    mockup: {
      title: "Student Dashboard",
      sub: "MIT College Marketplace",
      dot: "#4F8EF7",
      items: ["📚 GATE Notes 2024  ₹199", "💻 Dell Laptop  ₹28,000", "📖 DSA Textbook  ₹350"],
    },
  },
  {
    id: "admin", label: "College Admin",
    accent: "#10B981", accentBg: "rgba(16,185,129,0.08)",
    accentBorder: "rgba(16,185,129,0.22)",
    steps: [
      { icon: "🏫", text: "Register with College ID + College Code" },
      { icon: "⏳", text: "Wait for Master Admin approval" },
      { icon: "✅", text: "Access your College Admin panel" },
      { icon: "👥", text: "Approve student registrations" },
      { icon: "📊", text: "Moderate listings & manage ads" },
    ],
    mockup: {
      title: "Admin Panel",
      sub: "Pending Approvals: 12 students",
      dot: "#10B981",
      items: ["👤 Rahul Sharma — Pending", "👤 Priya Singh — Pending", "👤 Amit Kumar — Approved ✓"],
    },
  },
  {
    id: "master", label: "Master Admin",
    accent: "#F7C948", accentBg: "rgba(247,201,72,0.08)",
    accentBorder: "rgba(247,201,72,0.22)",
    steps: [
      { icon: "🔑", text: "Login with Master Admin credentials" },
      { icon: "🏫", text: "Review college registration requests" },
      { icon: "✅", text: "Approve or reject colleges" },
      { icon: "📊", text: "Monitor platform-wide analytics" },
      { icon: "⚙️", text: "Configure platform fees globally" },
    ],
    mockup: {
      title: "Master Dashboard",
      sub: "Platform Overview",
      dot: "#F7C948",
      items: ["🏫 IIT Bombay — Approved", "🏫 MIT Manipal — Pending", "💰 Revenue: ₹1,24,500"],
    },
  },
];

const FEES = [
  { type: "Physical Listing", fee: "₹50 one-time", note: "Ensures genuine sellers only", color: "#4F8EF7" },
  { type: "Digital Listing", fee: "₹20 one-time", note: "Covers storage + DRM processing", color: "#A78BFA" },
  { type: "Each Sale", fee: "5% of price", note: "Platform maintenance cut", color: "#10B981" },
  { type: "Cross-College Ad", fee: "₹500 flat", note: "Premium visibility across all colleges", color: "#F7C948" },
];

const FAQS = [
  {
    q: "Can students from other colleges see my products?",
    a: "No. Each college is a completely isolated marketplace. Students can only see listings from their own college. This is enforced at the database level using your college ID from your JWT token.",
  },
  {
    q: "What happens if someone shares a digital file?",
    a: "Every page and video frame is watermarked with the buyer's username. If a file is shared, it can be traced back to the buyer's account. The account will be suspended and legal action may be taken.",
  },
  {
    q: "How do I get my college added?",
    a: "A college admin registers using the College Registration form with college details and unique College Code. After Master Admin reviews (within 24 hrs), your marketplace goes live.",
  },
  {
    q: "When does the seller receive payment?",
    a: "Payment is released to the seller's wallet instantly after the Razorpay payment is confirmed via webhook. The platform fee (5%) is deducted automatically. Sellers can withdraw to their bank account.",
  },
  {
    q: "What file types are supported for digital products?",
    a: "PDFs (up to 50 MB) and video files (MP4, MOV up to 500 MB). Videos are converted to HLS format with encrypted chunks for streaming. PDFs are rendered via a custom PDF.js viewer with canvas watermarking.",
  },
];

const DRM_FEATURES = [
  { Icon: Lock, text: "Files stored in private cloud (never public URLs)" },
  { Icon: Shield, text: "Buyer's username watermarked on every page" },
  { Icon: Eye, text: "Pre-signed URLs expire in 10 minutes" },
  { Icon: Download, text: "No download button, no right-click menu" },
  { Icon: Shield, text: "Video streams in encrypted HLS chunks" },
  { Icon: AlertTriangle, text: "Screen recording deterrent overlay active" },
];

/* ═══ PAGE ════════════════════════════════════════════════════════ */
export default function HowItWorksPage() {
  const [tab, setTab] = useState("student");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const activeTab = TABS.find(t => t.id === tab)!;

  const { ref: heroRef, vis: heroVis } = useInView(0.1);
  const { ref: tabsRef, vis: tabsVis } = useInView(0.1);
  const { ref: timelineRef, vis: tlVis } = useInView(0.08);
  const { ref: drmRef, vis: drmVis } = useInView(0.12);
  const { ref: feesRef, vis: feesVis } = useInView(0.12);
  const { ref: faqRef, vis: faqVis } = useInView(0.08);

  return (
    <div style={{ position: "relative", zIndex: 1, overflowX: "hidden" }}>
      <PublicNavbar />

      {/* ══════ HERO ══════ */}
      <section
        ref={heroRef as React.RefObject<HTMLElement>}
        style={{
          padding: "110px 24px 72px",
          textAlign: "center", position: "relative", overflow: "hidden",
        }}
      >
        <div aria-hidden style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: 800, height: 400,
          background: "radial-gradient(ellipse, rgba(79,142,247,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(13,30,46,0.85)",
          border: "1px solid rgba(79,142,247,0.25)",
          borderRadius: 9999, padding: "6px 18px",
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
          color: "#4F8EF7", marginBottom: 24,
          opacity: heroVis ? 1 : 0,
          transform: heroVis ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.5s, transform 0.5s",
        }}>
          How It Works
        </div>

        {/* h1 */}
        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: "clamp(28px, 4vw, 40px)",
          fontWeight: 800, letterSpacing: "-1.5px",
          color: "#F0F4FF", marginBottom: 16,
          opacity: heroVis ? 1 : 0,
          transform: heroVis ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.5s 0.1s, transform 0.5s 0.1s",
        }}>
          How{" "}
          <span style={{
            background: "linear-gradient(135deg, #4F8EF7 0%, #7FBAFF 60%, #B3D9FF 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            CampusConnect
          </span>{" "}Works
        </h1>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16, color: "#9CA3AF", lineHeight: 1.7,
          opacity: heroVis ? 1 : 0,
          transform: heroVis ? "translateY(0)" : "translateY(14px)",
          transition: "opacity 0.5s 0.2s, transform 0.5s 0.2s",
        }}>
          Three panels. One platform. Complete marketplace.
        </p>
      </section>

      {/* ══════ THREE PANELS TABS ══════ */}
      <section style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>

          {/* tab strip */}
          <div style={{
            display: "flex", borderBottom: "1px solid #1e2d45",
            marginBottom: 48, gap: 0,
          }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "12px 28px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14, fontWeight: 700,
                  color: tab === t.id ? t.accent : "#6B7280",
                  background: tab === t.id ? `${t.accent}12` : "transparent",
                  borderBottom: tab === t.id ? `2px solid ${t.accent}` : "2px solid transparent",
                  marginBottom: -1, cursor: "pointer",
                  transition: "all 0.2s",
                  borderTop: "none", borderLeft: "none", borderRight: "none",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* tab body */}
          <div
            ref={tabsRef as React.RefObject<HTMLDivElement>}
            style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48,
              alignItems: "center",
              opacity: tabsVis ? 1 : 0,
              transform: tabsVis ? "translateY(0)" : "translateY(18px)",
              transition: "opacity 0.5s, transform 0.5s",
            }}
          >
            {/* steps list */}
            <div>
              <h3 style={{
                fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 700,
                color: "#F0F4FF", marginBottom: 28,
              }}>
                {activeTab.label} Flow
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {activeTab.steps.map((step, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {/* step number */}
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: `${activeTab.accent}14`,
                      border: `1.5px solid ${activeTab.accent}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700,
                      color: activeTab.accent, flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    {/* emoji + text */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                      <span style={{ fontSize: 18, lineHeight: 1 }}>{step.icon}</span>
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14, color: "#9CA3AF", lineHeight: 1.5,
                      }}>
                        {step.text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* mockup card */}
            <div style={{
              background: activeTab.accentBg,
              border: `1px solid ${activeTab.accentBorder}`,
              borderRadius: 14, padding: "24px",
            }}>
              {/* header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${activeTab.accent}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: "50%",
                    background: activeTab.accent,
                  }} />
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700,
                    color: "#F0F4FF",
                  }}>
                    {activeTab.mockup.title}
                  </div>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                    color: "#6B7280", marginTop: 2,
                  }}>
                    {activeTab.mockup.sub}
                  </div>
                </div>
              </div>

              {/* items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {activeTab.mockup.items.map((item, i) => (
                  <div key={i} style={{
                    background: "#111827", border: "1px solid #1e2d45",
                    borderRadius: 8, padding: "12px 16px",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                    color: "#9CA3AF",
                  }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ PHYSICAL vs DIGITAL TIMELINE ══════ */}
      <section style={{
        padding: "0 24px 96px",
        background: "linear-gradient(180deg, transparent, rgba(79,142,247,0.025) 50%, transparent)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* heading */}
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: "1.5px", textTransform: "uppercase",
              color: "#6B7280", marginBottom: 12,
            }}>
              PRODUCT LIFECYCLE
            </p>
            <h2 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(22px, 3vw, 30px)",
              fontWeight: 800, letterSpacing: "-1px", color: "#F0F4FF",
            }}>
              Physical vs Digital — How They Work
            </h2>
          </div>

          <div
            ref={timelineRef as React.RefObject<HTMLDivElement>}
            style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24,
              opacity: tlVis ? 1 : 0,
              transform: tlVis ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s, transform 0.6s",
            }}
          >
            {/* Physical */}
            <TimelineCard
              emoji="🔧" title="Physical / Refurbished"
              iconBg="rgba(79,142,247,0.12)" accent="#4F8EF7"
              borderGradient="linear-gradient(135deg, rgba(79,142,247,0.5), rgba(79,142,247,0.04))"
              steps={[
                { label: "List product", desc: "Upload photos, title, price, condition" },
                { label: "Pay listing fee", desc: "₹50 one-time — filters genuine sellers" },
                { label: "Admin approves", desc: "College admin reviews the listing" },
                { label: "Goes live", desc: "Visible to all college students" },
                { label: "Buyer purchases", desc: "Payment cleared via Razorpay" },
              ]}
            />
            {/* Digital */}
            <TimelineCard
              emoji="📄" title="Digital Products"
              iconBg="rgba(124,58,237,0.12)" accent="#A78BFA"
              borderGradient="linear-gradient(135deg, rgba(124,58,237,0.5), rgba(124,58,237,0.04))"
              steps={[
                { label: "Upload PDF or Video", desc: "Securely stored in private cloud" },
                { label: "Pay listing fee", desc: "₹20 — covers storage + processing" },
                { label: "DRM applied", desc: "File locked — never publicly accessible" },
                { label: "Watermark stamped", desc: "Username on every page/frame" },
                { label: "Sold safely", desc: "Buyer accesses via protected in-browser viewer" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ══════ DRM DEEP DIVE ══════ */}
      <section style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: "1.5px", textTransform: "uppercase",
              color: "#6B7280", marginBottom: 12,
            }}>
              SECURITY
            </p>
            <h2 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(22px, 3vw, 30px)",
              fontWeight: 800, letterSpacing: "-1px", color: "#F0F4FF",
            }}>
              How We Protect Digital Content
            </h2>
          </div>

          <div
            ref={drmRef as React.RefObject<HTMLDivElement>}
            style={{
              background: "rgba(124,58,237,0.05)",
              border: "1px solid rgba(124,58,237,0.25)",
              borderRadius: 14, padding: "40px",
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48,
              alignItems: "center",
              opacity: drmVis ? 1 : 0,
              transform: drmVis ? "translateY(0)" : "translateY(22px)",
              transition: "opacity 0.6s, transform 0.6s",
            }}
          >
            {/* feature list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {DRM_FEATURES.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "rgba(124,58,237,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#A78BFA", flexShrink: 0,
                  }}>
                    <f.Icon size={14} />
                  </div>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14, color: "#9CA3AF", lineHeight: 1.5,
                  }}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>

            {/* PDF mockup */}
            <div style={{
              background: "#fff", borderRadius: 12,
              aspectRatio: "3/4", maxHeight: 360,
              boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
              position: "relative", overflow: "hidden",
            }}>
              {/* page content */}
              <div style={{ padding: "20px 20px 10px", position: "relative" }}>
                <div style={{
                  fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 700,
                  color: "#111", textAlign: "center", marginBottom: 12,
                }}>
                  GATE 2024 — ECE Notes
                </div>
                {Array.from({ length: 10 }).map((_, j) => (
                  <div key={j} style={{
                    height: 8, borderRadius: 4, marginBottom: 8,
                    background: j % 4 === 0 ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.11)",
                    width: j % 3 === 0 ? "78%" : "100%",
                  }} />
                ))}
              </div>

              {/* watermark tiles */}
              {Array.from({ length: 8 }).map((_, k) => (
                <div key={k} style={{
                  position: "absolute",
                  top: `${8 + k * 12}%`,
                  left: `${(k % 2) * 30 + 2}%`,
                  transform: "rotate(-30deg)",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9, opacity: 0.11, color: "#333",
                  whiteSpace: "nowrap", pointerEvents: "none",
                }}>
                  rahul.sharma • CampusConnect
                </div>
              ))}

              {/* purple footer bar */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "rgba(124,58,237,0.88)",
                padding: "8px 12px", textAlign: "center",
              }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                  fontWeight: 700, color: "#fff",
                }}>
                  🛡️ Watermarked · rahul.sharma · CampusConnect
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ FEE STRUCTURE ══════ */}
      <section style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: "1.5px", textTransform: "uppercase",
              color: "#6B7280", marginBottom: 12,
            }}>
              PRICING
            </p>
            <h2 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(22px, 3vw, 30px)",
              fontWeight: 800, letterSpacing: "-1px", color: "#F0F4FF",
            }}>
              Simple, Transparent Fees
            </h2>
          </div>

          <div
            ref={feesRef as React.RefObject<HTMLDivElement>}
            style={{
              display: "flex", flexDirection: "column", gap: 12,
              opacity: feesVis ? 1 : 0,
              transform: feesVis ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s, transform 0.6s",
            }}
          >
            {FEES.map((fee, i) => (
              <FeeRow key={fee.type} fee={fee} />
            ))}

            {/* note */}
            <div style={{
              marginTop: 4,
              display: "flex", alignItems: "flex-start", gap: 10,
              background: "rgba(79,142,247,0.05)",
              border: "1px solid rgba(79,142,247,0.15)",
              borderRadius: 10, padding: "12px 16px",
            }}>
              <CheckCircle size={14} style={{ color: "#4F8EF7", flexShrink: 0, marginTop: 2 }} />
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                color: "#9CA3AF", lineHeight: 1.6,
              }}>
                Fee % is set by platform and can be configured per college.
                Sellers see the exact breakdown before listing — no hidden charges, ever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ FAQ ══════ */}
      <section style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: "1.5px", textTransform: "uppercase",
              color: "#6B7280", marginBottom: 12,
            }}>
              FAQ
            </p>
            <h2 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(22px, 3vw, 30px)",
              fontWeight: 800, letterSpacing: "-1px", color: "#F0F4FF",
            }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div
            ref={faqRef as React.RefObject<HTMLDivElement>}
            style={{
              display: "flex", flexDirection: "column", gap: 10,
              maxWidth: 760, margin: "0 auto",
              opacity: faqVis ? 1 : 0,
              transform: faqVis ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s, transform 0.6s",
            }}
          >
            {FAQS.map((faq, i) => (
              <FaqItem
                key={i} faq={faq} i={i}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FINAL CTA ══════ */}
      <section style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            background: "linear-gradient(#111827, #111827) padding-box, linear-gradient(135deg, rgba(79,142,247,0.55), rgba(79,142,247,0.04)) border-box",
            border: "1px solid transparent", borderRadius: 20, padding: "56px 40px",
          }}>
            <h2 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(22px, 3vw, 28px)",
              fontWeight: 800, letterSpacing: "-0.5px",
              color: "#F0F4FF", marginBottom: 12,
            }}>
              Ready to get started?
            </h2>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15, color: "#9CA3AF",
              marginBottom: 32, lineHeight: 1.65,
            }}>
              Join thousands of students already buying and selling on CampusConnect.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/login" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#4F8EF7", color: "#fff",
                padding: "14px 32px", borderRadius: 9999,
                fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
                textDecoration: "none", boxShadow: "0 4px 16px rgba(79,142,247,0.35)",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                🎓 Enter Student Market
              </Link>
              <Link href="/admin/register" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "transparent",
                border: "1.5px solid rgba(247,201,72,0.6)", color: "#F7C948",
                padding: "14px 32px", borderRadius: 9999,
                fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
                textDecoration: "none", transition: "all 0.2s",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(247,201,72,0.08)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                🏫 Register College
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ─── TimelineCard ──────────────────────────────────────────────── */
function TimelineCard({ emoji, title, iconBg, accent, borderGradient, steps }: {
  emoji: string; title: string; iconBg: string; accent: string;
  borderGradient: string;
  steps: { label: string; desc: string }[];
}) {
  return (
    <div style={{
      background: "linear-gradient(#111827, #111827) padding-box, " + borderGradient + " border-box",
      border: "1px solid transparent", borderRadius: 14, padding: "28px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: iconBg, fontSize: 22,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {emoji}
        </div>
        <h3 style={{
          fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700,
          color: "#F0F4FF",
        }}>
          {title}
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 16 }}>
            {/* timeline spine */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: `${accent}18`,
                border: `2px solid ${accent}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 700,
                color: accent, flexShrink: 0,
              }}>
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  width: 1, flex: 1, minHeight: 16,
                  background: `${accent}22`,
                  margin: "3px 0",
                }} />
              )}
            </div>
            {/* text */}
            <div style={{ paddingBottom: i < steps.length - 1 ? 18 : 0 }}>
              <div style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
                color: "#F0F4FF", marginBottom: 3,
              }}>
                {s.label}
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                color: "#6B7280", lineHeight: 1.55,
              }}>
                {s.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── FeeRow ────────────────────────────────────────────────────── */
function FeeRow({ fee }: { fee: typeof FEES[0] }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#111827",
        border: "1px solid #1e2d45",
        borderLeft: `3px solid ${fee.color}`,
        borderRadius: 10, padding: "18px 24px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 20,
        transition: "transform 0.2s, background 0.2s",
        transform: hov ? "translateX(5px)" : "translateX(0)",
        background2: hov ? "rgba(255,255,255,0.01)" : "#111827",
      } as React.CSSProperties}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <CheckCircle size={15} style={{ color: fee.color, flexShrink: 0 }} />
        <span style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
          color: "#F0F4FF",
        }}>
          {fee.type}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <span style={{
          fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800,
          color: fee.color, minWidth: 110, textAlign: "right",
        }}>
          {fee.fee}
        </span>
        <span style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 13,
          color: "#6B7280", minWidth: 200,
        }}>
          {fee.note}
        </span>
      </div>
    </div>
  );
}

/* ─── FaqItem ───────────────────────────────────────────────────── */
function FaqItem({ faq, i, open, onToggle }: {
  faq: typeof FAQS[0]; i: number; open: boolean; onToggle: () => void;
}) {
  return (
    <div style={{
      background: "#111827",
      border: `1px solid ${open ? "rgba(79,142,247,0.3)" : "#1e2d45"}`,
      borderRadius: 12,
      transition: "border-color 0.2s",
      overflow: "hidden",
    }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 20px",
          background: "transparent", cursor: "pointer",
          textAlign: "left",
          borderTop: "none", borderLeft: "none", borderRight: "none",
          borderBottom: open ? "1px solid #1e2d45" : "1px solid transparent",
          transition: "border-color 0.2s",
        }}
        aria-expanded={open}
      >
        <span style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
          color: "#F0F4FF", paddingRight: 16, lineHeight: 1.4,
        }}>
          {faq.q}
        </span>
        <div style={{
          color: open ? "#4F8EF7" : "#6B7280",
          transform: open ? "rotate(180deg)" : "rotate(0)",
          transition: "transform 0.3s ease, color 0.2s",
          flexShrink: 0,
        }}>
          <ChevronDown size={16} />
        </div>
      </button>

      <div style={{
        maxHeight: open ? 200 : 0,
        overflow: "hidden",
        transition: "max-height 0.35s ease",
      }}>
        <p style={{
          padding: "16px 20px 18px",
          fontFamily: "'DM Sans', sans-serif", fontSize: 14,
          color: "#9CA3AF", lineHeight: 1.7,
        }}>
          {faq.a}
        </p>
      </div>
    </div>
  );
}
