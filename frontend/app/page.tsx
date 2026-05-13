"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, ArrowRight, CheckCircle, Shield } from "lucide-react";
import PublicNavbar from "@/components/layout/PublicNavbar";
import Footer from "@/components/layout/Footer";

/* ─── count-up hook ────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1600) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  const trigger = () => {
    if (started.current) return;
    started.current = true;
    const steps = 50;
    const step = target / steps;
    const ms = duration / steps;
    let cur = 0;
    const id = setInterval(() => {
      cur += step;
      if (cur >= target) { setCount(target); clearInterval(id); }
      else setCount(Math.floor(cur));
    }, ms);
  };
  return { count, trigger };
}

/* ─── intersection hook ─────────────────────────────────────────── */
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── data ──────────────────────────────────────────────────────── */
const FEATURES = [
  {
    emoji: "🔒", title: "College Isolation",
    desc: "Each college gets a completely private marketplace. Zero cross-college visibility.",
    iconBg: "rgba(79,142,247,0.14)", titleColor: "#4F8EF7",
    hoverBorder: "rgba(79,142,247,0.35)", hoverGlow: "0 0 24px rgba(79,142,247,0.18)",
  },
  {
    emoji: "🛡️", title: "DRM Content Protection",
    desc: "Notes and videos are watermarked with buyer's name. No download. No screenshot.",
    iconBg: "rgba(124,58,237,0.14)", titleColor: "#A78BFA",
    hoverBorder: "rgba(124,58,237,0.35)", hoverGlow: "0 0 24px rgba(124,58,237,0.18)",
  },
  {
    emoji: "💳", title: "Transparent Fee System",
    desc: "Small listing fee filters genuine sellers. 5% platform cut per sale, auto-calculated.",
    iconBg: "rgba(16,185,129,0.14)", titleColor: "#10B981",
    hoverBorder: "rgba(16,185,129,0.35)", hoverGlow: "0 0 24px rgba(16,185,129,0.18)",
  },
  {
    emoji: "📢", title: "College-Targeted Ads",
    desc: "Admins advertise within their college for free, or pay to go platform-wide.",
    iconBg: "rgba(247,201,72,0.14)", titleColor: "#F7C948",
    hoverBorder: "rgba(247,201,72,0.35)", hoverGlow: "0 0 24px rgba(247,201,72,0.18)",
  },
];

const STEPS = [
  { emoji: "🏫", step: "Step 1", title: "College Registers", desc: "Admin submits college details to platform" },
  { emoji: "✅", step: "Step 2", title: "Master Approves",   desc: "Marketplace created and activated in seconds" },
  { emoji: "🎓", step: "Step 3", title: "Students Join",     desc: "Via enrollment email + OTP verification" },
  { emoji: "🛒", step: "Step 4", title: "Buy & Sell",        desc: "Physical goods + DRM-protected digital content" },
];

const STEP_COLORS = [
  { accent: "#F7C948", bg: "rgba(247,201,72,0.10)", border: "rgba(247,201,72,0.25)" },
  { accent: "#10B981", bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.25)" },
  { accent: "#4F8EF7", bg: "rgba(79,142,247,0.10)",  border: "rgba(79,142,247,0.25)" },
  { accent: "#A78BFA", bg: "rgba(124,58,237,0.10)",  border: "rgba(124,58,237,0.25)" },
];

/* ─── FeatureCard ───────────────────────────────────────────────── */
function FeatureCard({ f, delay }: { f: typeof FEATURES[0]; delay: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#111827",
        border: `1px solid ${hovered ? f.hoverBorder : "#1e2d45"}`,
        borderRadius: 14,
        padding: "24px",
        display: "flex", flexDirection: "column", gap: 16,
        transition: "border-color 0.2s, transform 0.22s, box-shadow 0.22s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? f.hoverGlow : "0 4px 24px rgba(0,0,0,0.25)",
        animationDelay: `${delay}s`,
        cursor: "default",
      }}
    >
      {/* icon box */}
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: f.iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, flexShrink: 0,
      }}>
        {f.emoji}
      </div>
      {/* text */}
      <div>
        <h3 style={{
          fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700,
          color: "#F0F4FF", marginBottom: 8, lineHeight: 1.3,
        }}>
          {f.title}
        </h3>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 14,
          color: "#9CA3AF", lineHeight: 1.65,
        }}>
          {f.desc}
        </p>
      </div>
    </div>
  );
}

/* ─── StatsRow ──────────────────────────────────────────────────── */
function StatsRow() {
  const { ref, visible } = useInView(0.4);
  const c1 = useCountUp(12, 1200);
  const c2 = useCountUp(1470, 1600);
  const c3 = useCountUp(2840, 1800);

  useEffect(() => {
    if (visible) { c1.trigger(); c2.trigger(); c3.trigger(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const stats = [
    { counter: c1, label: "Colleges",  suffix: "+" },
    { counter: c2, label: "Students",  suffix: "" },
    { counter: c3, label: "Products",  suffix: "" },
  ];

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        marginTop: 40, gap: 0,
      }}
    >
      {stats.map((s, i) => (
        <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 36px" }}>
            <span style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 30, fontWeight: 800,
              color: "#F7C948",
              lineHeight: 1,
            }}>
              {s.counter.count.toLocaleString()}{s.suffix}
            </span>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12, fontWeight: 500,
              color: "#6B7280", marginTop: 6, letterSpacing: "0.5px",
            }}>
              {s.label}
            </span>
          </div>
          {i < 2 && (
            <div style={{ width: 1, height: 36, background: "#1e2d45", flexShrink: 0 }} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══ PAGE ════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const { ref: featRef, visible: featVis } = useInView(0.1);
  const { ref: stepsRef, visible: stepsVis } = useInView(0.1);
  const { ref: ptRef, visible: ptVis } = useInView(0.1);
  const { ref: ctaRef, visible: ctaVis } = useInView(0.3);

  return (
    <div style={{ position: "relative", zIndex: 1, overflowX: "hidden" }}>
      <PublicNavbar />

      {/* ══════ HERO ══════ */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center",
          padding: "100px 24px 80px",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* blobs */}
        <div aria-hidden style={{
          position: "absolute", top: "8%", left: "-5%",
          width: 640, height: 640,
          background: "radial-gradient(circle, rgba(79,142,247,0.09) 0%, transparent 68%)",
          pointerEvents: "none",
        }} />
        <div aria-hidden style={{
          position: "absolute", bottom: "5%", right: "-5%",
          width: 480, height: 480,
          background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 68%)",
          pointerEvents: "none",
        }} />

        {/* badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(13,30,46,0.85)",
          border: "1px solid rgba(79,142,247,0.25)",
          borderRadius: 9999, padding: "6px 18px",
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
          color: "#4F8EF7", marginBottom: 28,
          animation: "fadeInUp 0.5s ease both",
        }}>
          🎓 College Marketplace Platform
        </div>

        {/* h1 */}
        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: "clamp(38px, 5.5vw, 58px)",
          fontWeight: 900, letterSpacing: "-2px", lineHeight: 1.05,
          color: "#F0F4FF", maxWidth: 760,
          animation: "fadeInUp 0.55s ease 0.08s both",
        }}>
          Your College&apos;s Own<br />
          <span style={{
            background: "linear-gradient(135deg, #4F8EF7 0%, #7FBAFF 60%, #B3D9FF 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Student Marketplace
          </span>
        </h1>

        {/* subtext */}
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16, lineHeight: 1.75,
          color: "#9CA3AF", maxWidth: 520, marginTop: 20,
          animation: "fadeInUp 0.55s ease 0.18s both",
        }}>
          Buy and sell physical goods and protected digital content
          exclusively within your college community.
        </p>

        {/* CTAs */}
        <div style={{
          display: "flex", gap: 16, marginTop: 36,
          flexWrap: "wrap", justifyContent: "center",
          animation: "fadeInUp 0.55s ease 0.28s both",
        }}>
          <Link
            href="/marketplace"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#4F8EF7", color: "#fff",
              padding: "14px 32px", borderRadius: 9999,
              fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
              textDecoration: "none", transition: "all 0.2s",
              boxShadow: "0 4px 16px rgba(79,142,247,0.35)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(79,142,247,0.5)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(79,142,247,0.35)";
            }}
          >
            🎓 Enter Student Market
          </Link>
          <Link
            href="/admin/login"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "transparent",
              border: "1.5px solid rgba(79,142,247,0.6)",
              color: "#4F8EF7",
              padding: "14px 32px", borderRadius: 9999,
              fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
              textDecoration: "none", transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(79,142,247,0.08)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = "rgba(79,142,247,0.9)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(79,142,247,0.6)";
            }}
          >
            🏫 College Admin Login
          </Link>
        </div>

        {/* stats */}
        <StatsRow />

        {/* scroll indicator */}
        <div style={{
          position: "absolute", bottom: 32, left: "50%",
          transform: "translateX(-50%)",
          color: "#6B7280", animation: "bounce-slow 2s ease-in-out infinite",
        }}>
          <ChevronDown size={22} />
        </div>
      </section>

      {/* ══════ FEATURES ══════ */}
      <section style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* heading */}
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11, fontWeight: 700,
              letterSpacing: "1.5px", textTransform: "uppercase",
              color: "#6B7280", marginBottom: 12,
            }}>
              WHY CAMPUSCONNECT
            </p>
            <h2 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(24px, 3vw, 32px)",
              fontWeight: 800, letterSpacing: "-1px",
              color: "#F0F4FF",
            }}>
              Everything your college market needs
            </h2>
          </div>

          {/* 2×2 grid */}
          <div
            ref={featRef as React.RefObject<HTMLDivElement>}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 20,
            }}
          >
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                style={{
                  opacity: featVis ? 1 : 0,
                  transform: featVis ? "translateY(0)" : "translateY(22px)",
                  transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
                }}
              >
                <FeatureCard f={f} delay={i * 0.08} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS PREVIEW ══════ */}
      <section style={{
        padding: "96px 24px",
        background: "linear-gradient(180deg, transparent, rgba(79,142,247,0.025) 50%, transparent)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(22px, 3vw, 30px)",
              fontWeight: 800, letterSpacing: "-1px",
              color: "#F0F4FF", marginBottom: 12,
            }}>
              From Registration to First Sale
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#9CA3AF" }}>
              Four simple steps to your college marketplace
            </p>
          </div>

          {/* Steps */}
          <div
            ref={stepsRef as React.RefObject<HTMLDivElement>}
            style={{ position: "relative" }}
          >
            {/* horizontal dotted connector — desktop */}
            <div aria-hidden style={{
              position: "absolute", top: 44,
              left: "calc(12.5% + 20px)", right: "calc(12.5% + 20px)",
              height: 1,
              borderTop: "2px dashed rgba(30,45,69,0.8)",
              display: "block",
            }} />

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 24,
              position: "relative",
            }}>
              {STEPS.map((s, i) => {
                const c = STEP_COLORS[i];
                return (
                  <div
                    key={s.title}
                    style={{
                      display: "flex", flexDirection: "column",
                      alignItems: "center", textAlign: "center", gap: 16,
                      opacity: stepsVis ? 1 : 0,
                      transform: stepsVis ? "translateY(0)" : "translateY(24px)",
                      transition: `opacity 0.5s ease ${i * 0.14}s, transform 0.5s ease ${i * 0.14}s`,
                    }}
                  >
                    {/* icon circle */}
                    <div style={{
                      width: 88, height: 88, borderRadius: "50%",
                      background: c.bg, border: `2px solid ${c.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 36, position: "relative", zIndex: 1,
                      flexShrink: 0,
                    }}>
                      {s.emoji}
                    </div>

                    <div>
                      <div style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: 11, fontWeight: 700,
                        letterSpacing: "1px", textTransform: "uppercase",
                        color: c.accent, marginBottom: 6,
                      }}>
                        {s.step}
                      </div>
                      <h3 style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: 15, fontWeight: 700,
                        color: "#F0F4FF", marginBottom: 6,
                      }}>
                        {s.title}
                      </h3>
                      <p style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13, color: "#6B7280", lineHeight: 1.6,
                      }}>
                        {s.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 48 }}>
            <Link
              href="/how-it-works"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "transparent",
                border: "1.5px solid rgba(79,142,247,0.5)",
                color: "#4F8EF7", padding: "11px 28px", borderRadius: 9999,
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
                textDecoration: "none", transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(79,142,247,0.08)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Learn More <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════ PRODUCT TYPES ══════ */}
      <section style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11, fontWeight: 700,
              letterSpacing: "1.5px", textTransform: "uppercase",
              color: "#6B7280", marginBottom: 12,
            }}>
              WHAT YOU CAN TRADE
            </p>
            <h2 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(22px, 3vw, 30px)",
              fontWeight: 800, letterSpacing: "-1px", color: "#F0F4FF",
            }}>
              Two categories. One platform.
            </h2>
          </div>

          <div
            ref={ptRef as React.RefObject<HTMLDivElement>}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
          >
            {/* Physical */}
            <ProductTypeCard
              emoji="🔧" title="Refurbished Goods"
              tags={["Laptops", "Textbooks", "Lab Equipment", "Instruments", "Furniture", "Electronics"]}
              tagColor="#4F8EF7" tagBg="rgba(79,142,247,0.1)" tagBorder="rgba(79,142,247,0.2)"
              bulletIcon={<CheckCircle size={14} />} bulletColor="#4F8EF7"
              bulletBg="rgba(79,142,247,0.08)" bulletBorder="rgba(79,142,247,0.18)"
              bulletText="Seller pays listing fee → Ensures genuine listings only"
              linkText="View Physical Products" linkColor="#4F8EF7"
              borderGradient="linear-gradient(135deg, rgba(79,142,247,0.55), rgba(79,142,247,0.04))"
              accentGlow="rgba(79,142,247,0.12)"
              visible={ptVis} delay={0}
              href="/marketplace"
            />
            {/* Digital */}
            <ProductTypeCard
              emoji="📄" title="Digital Content"
              tags={["Notes PDFs", "Video Lectures", "Question Banks", "Study Guides", "Past Papers"]}
              tagColor="#A78BFA" tagBg="rgba(124,58,237,0.1)" tagBorder="rgba(124,58,237,0.2)"
              bulletIcon={<Shield size={14} />} bulletColor="#A78BFA"
              bulletBg="rgba(124,58,237,0.08)" bulletBorder="rgba(124,58,237,0.18)"
              bulletText="Protected with buyer watermark — impossible to steal or share"
              linkText="View Digital Products" linkColor="#A78BFA"
              borderGradient="linear-gradient(135deg, rgba(124,58,237,0.55), rgba(124,58,237,0.04))"
              accentGlow="rgba(124,58,237,0.12)"
              visible={ptVis} delay={0.15}
              href="/marketplace"
            />
          </div>
        </div>
      </section>

      {/* ══════ COLLEGE CTA ══════ */}
      <section style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div
            ref={ctaRef as React.RefObject<HTMLDivElement>}
            style={{
              background: "linear-gradient(135deg, rgba(247,201,72,0.05) 0%, #111827 55%)",
              border: "1px solid rgba(247,201,72,0.22)",
              borderRadius: 20, padding: "56px 40px",
              textAlign: "center",
              opacity: ctaVis ? 1 : 0,
              transform: ctaVis ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "rgba(247,201,72,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, margin: "0 auto 20px",
            }}>
              🎓
            </div>
            <h2 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(22px, 2.5vw, 28px)",
              fontWeight: 800, letterSpacing: "-0.5px",
              color: "#F0F4FF", marginBottom: 12,
            }}>
              Is your college not on CampusConnect?
            </h2>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15, color: "#9CA3AF",
              maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.65,
            }}>
              Register your college and we&apos;ll set up your completely isolated
              marketplace within 24 hours.
            </p>
            <Link
              href="/admin/register"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#F7C948", color: "#1a1200",
                padding: "14px 32px", borderRadius: 9999,
                fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
                textDecoration: "none", transition: "all 0.2s",
                boxShadow: "0 4px 16px rgba(247,201,72,0.3)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(247,201,72,0.45)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(247,201,72,0.3)";
              }}
            >
              Register Your College →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ─── ProductTypeCard ───────────────────────────────────────────── */
function ProductTypeCard({
  emoji, title, tags, tagColor, tagBg, tagBorder,
  bulletIcon, bulletColor, bulletBg, bulletBorder, bulletText,
  linkText, linkColor, borderGradient, accentGlow,
  visible, delay, href,
}: {
  emoji: string; title: string;
  tags: string[]; tagColor: string; tagBg: string; tagBorder: string;
  bulletIcon: React.ReactNode; bulletColor: string; bulletBg: string; bulletBorder: string;
  bulletText: string;
  linkText: string; linkColor: string;
  borderGradient: string; accentGlow: string;
  visible: boolean; delay: number;
  href: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "linear-gradient(#111827, #111827) padding-box, " + borderGradient + " border-box",
        border: "1px solid transparent", borderRadius: 14,
        padding: "28px", display: "flex", flexDirection: "column", gap: 20,
        transition: "transform 0.22s, box-shadow 0.22s",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hov ? `0 16px 40px ${accentGlow}` : "0 4px 24px rgba(0,0,0,0.25)",
        opacity: visible ? 1 : 0,
        transition2: `opacity 0.6s ease ${delay}s, transform 0.22s, box-shadow 0.22s`,
      } as React.CSSProperties}
    >
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: tagBg, display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: 22,
        }}>
          {emoji}
        </div>
        <h3 style={{
          fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700,
          color: "#F0F4FF",
        }}>
          {title}
        </h3>
      </div>

      {/* tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {tags.map(t => (
          <span key={t} style={{
            background: tagBg, color: tagColor,
            border: `1px solid ${tagBorder}`,
            borderRadius: 9999, padding: "4px 12px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12, fontWeight: 600,
          }}>
            {t}
          </span>
        ))}
      </div>

      {/* bullet */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        background: bulletBg, border: `1px solid ${bulletBorder}`,
        borderRadius: 10, padding: "10px 14px",
      }}>
        <span style={{ color: bulletColor, flexShrink: 0, marginTop: 2 }}>{bulletIcon}</span>
        <span style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 13,
          color: "#9CA3AF", lineHeight: 1.55,
        }}>
          {bulletText}
        </span>
      </div>

      {/* link */}
      <Link
        href={href}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
          color: linkColor, textDecoration: "none", marginTop: "auto",
          transition: "gap 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.gap = "10px")}
        onMouseLeave={e => (e.currentTarget.style.gap = "6px")}
      >
        {linkText} <ArrowRight size={14} />
      </Link>
    </div>
  );
}
