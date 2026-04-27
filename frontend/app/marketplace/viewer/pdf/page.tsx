"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Lock, ShoppingCart } from "lucide-react";

/* ─── PDF pages content ─────────────────────────────────── */
const PDF_PAGES = [
  {
    pageNum: 1,
    subject: "SUBJECT: ECE-342",
    unit: "LECTURE NOTES UNIT 1 — Introduction",
    title: "Introduction to Communication Systems",
    subtitle: "1.1 Overview",
    body: "Communication systems are fundamental to modern engineering. This unit covers the basic principles of signal transmission, modulation, and demodulation as applied in real-world scenarios.",
    eqLabel: "Basic signal representation:",
    eq: "x(t) = A·cos(2πf₀t + φ)",
    note: "where A is amplitude, f₀ is frequency, φ is phase offset.",
  },
  {
    pageNum: 2,
    subject: "SUBJECT: ECE-342",
    unit: "LECTURE NOTES UNIT 2 — Modulation",
    title: "Amplitude Modulation (AM)",
    subtitle: "2.1 AM Basics",
    body: "AM is one of the oldest and simplest modulation techniques. The carrier signal's amplitude is varied in proportion to the instantaneous amplitude of the baseband message signal m(t).",
    eqLabel: "AM signal expression:",
    eq: "s(t) = [A_c + m(t)] cos(2πf_c t)",
    note: "Bandwidth of AM = 2W, where W is the message bandwidth.",
  },
  {
    pageNum: 3,
    subject: "SUBJECT: ECE-342",
    unit: "LECTURE NOTES UNIT 3 — Signal Modulation Theory",
    title: "Analog Communications",
    subtitle: "3.4 Signal Modulation Theory",
    body: "Consider the message signal m(t) and the carrier signal fc(t) = A_c·cos(2πf_c·t). The amplitude modulated signal b(t) can be defined through the standard expression:",
    eqLabel: "Modulated signal:",
    eq: "s(t) = [A_c + m(t)] cos(2πf_c t)",
    note: "Efficiency η = μ² / (2 + μ²)",
  },
];

function PdfPage({ data, isPreview, watermarkUser }: {
  data: typeof PDF_PAGES[0];
  isPreview: boolean;
  watermarkUser: string;
}) {
  return (
    <div style={{ position: "relative", padding: "48px 56px", minHeight: "100%" }}>
      {/* header row */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", letterSpacing: "1px" }}>
          {data.subject}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", letterSpacing: "1px" }}>
          {data.unit}
        </span>
      </div>

      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 20 }}>
        {data.title}
      </h1>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 12 }}>
        {data.subtitle}
      </h2>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#374151", lineHeight: 1.75, marginBottom: 16 }}>
        {data.body}
      </p>

      {/* equation */}
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6B7280", marginBottom: 8 }}>{data.eqLabel}</p>
      <div style={{
        background: "#f8f7ff", border: "1px solid #e5e7eb",
        borderRadius: 8, padding: "16px", marginBottom: 20, textAlign: "center",
      }}>
        <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#4F46E5" }}>{data.eq}</code>
      </div>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#9CA3AF", lineHeight: 1.6 }}>{data.note}</p>

      {/* page footer */}
      <div style={{
        position: "absolute", bottom: 32, left: 56, right: 56,
        display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e7eb", paddingTop: 12,
      }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF" }}>© LUMINA ACADEMIC PRESS</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF" }}>PAGE {data.pageNum}</span>
      </div>

      {/* WATERMARK (only in full mode) */}
      {!isPreview && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", userSelect: "none", overflow: "hidden" }}>
          {Array.from({ length: 7 }).map((_, row) =>
            Array.from({ length: 4 }).map((_, col) => (
              <div key={`${row}-${col}`} style={{
                position: "absolute",
                top:  `${row * 15 + 5}%`,
                left: `${col * 28 - 5}%`,
                transform: "rotate(-30deg)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11, color: "#9CA3AF", opacity: 0.08,
                whiteSpace: "nowrap",
              }}>
                {watermarkUser} • CampusConnect • Purchased
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Paywall overlay ──────────────────────────────────── */
function PaywallOverlay({ productTitle }: { productTitle: string }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      backdropFilter: "blur(12px)",
      background: "rgba(10,14,26,0.82)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 16, padding: 32, zIndex: 20,
      borderRadius: 4,
    }}>
      {/* lock icon */}
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: "rgba(139,92,246,0.15)",
        border: "2px solid rgba(139,92,246,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Lock size={28} style={{ color: "#A78BFA" }} />
      </div>
      <h3 style={{
        fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800,
        color: "#F0F4FF", textAlign: "center",
      }}>
        Preview ended — Purchase to read all 48 pages
      </h3>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#9CA3AF",
        textAlign: "center", maxWidth: 360, lineHeight: 1.65,
      }}>
        You&apos;ve viewed <strong style={{ color: "#A78BFA" }}>2 of 48 pages</strong> for free.
        Buy &amp; Access Now to unlock the full{" "}
        <strong style={{ color: "#F0F4FF" }}>{productTitle}</strong>.
      </p>

      {/* price pill */}
      <div style={{
        background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)",
        borderRadius: 9999, padding: "6px 20px",
        fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#F0F4FF",
      }}>₹500</div>

      {/* CTA */}
      <Link href="/marketplace/digital/1" style={{ textDecoration: "none" }}>
        <button style={{
          height: 48, padding: "0 32px", borderRadius: 9999,
          background: "#8B5CF6", border: "none", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff",
          boxShadow: "0 4px 20px rgba(139,92,246,0.4)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <ShoppingCart size={16} /> Buy &amp; Access Now
        </button>
      </Link>

      <Link href="/marketplace/digital/1" style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280",
        textDecoration: "none",
      }}>
        ← Back to product page
      </Link>
    </div>
  );
}

/* ═══ INNER (uses useSearchParams) ═══════════════════════ */
function PdfViewerInner() {
  const searchParams = useSearchParams();
  const isPreview    = searchParams.get("preview") === "true";
  const PREVIEW_LIMIT = 2;
  const TOTAL_PAGES   = isPreview ? PREVIEW_LIMIT : 42;

  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  // Page data (cycle through 3 mock pages)
  const pageData = PDF_PAGES[Math.min(page - 1, PDF_PAGES.length - 1)];
  const isLocked = isPreview && page > PREVIEW_LIMIT;

  const goNext = () => {
    if (!isPreview) { setPage(p => Math.min(42, p + 1)); return; }
    // In preview, allow navigation to show locked page
    setPage(p => Math.min(PREVIEW_LIMIT + 1, p + 1));
  };
  const goPrev = () => setPage(p => Math.max(1, p - 1));

  // Prevent right-click + shortcuts (full mode only)
  useEffect(() => {
    if (isPreview) return;
    const noCtx = (e: MouseEvent) => e.preventDefault();
    const noKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["s", "p", "c"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", noCtx);
    document.addEventListener("keydown", noKey);
    return () => {
      document.removeEventListener("contextmenu", noCtx);
      document.removeEventListener("keydown", noKey);
    };
  }, [isPreview]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0A0E1A", overflow: "hidden" }}>

      {/* ── VIEWER NAVBAR ── */}
      <header style={{
        height: 56, background: "#0d1120", borderBottom: "1px solid #1e2d45",
        display: "flex", alignItems: "center", padding: "0 24px", flexShrink: 0,
      }}>
        {/* back */}
        <Link href="/marketplace/digital/1" style={{
          display: "flex", alignItems: "center", gap: 6,
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280",
          textDecoration: "none", marginRight: 24,
        }}>
          <ChevronLeft size={14} />
          {isPreview ? "Back to Product" : "My Purchases"}
        </Link>

        {/* preview badge */}
        {isPreview && (
          <div style={{
            background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 9999, padding: "3px 12px",
            fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#F7C948",
            marginRight: 16,
          }}>
            FREE PREVIEW — {PREVIEW_LIMIT} pages only
          </div>
        )}

        {/* center */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#F0F4FF" }}>
            GATE 2024 ECE Notes
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6B7280" }}>
            {isPreview
              ? `Preview page ${Math.min(page, PREVIEW_LIMIT)} of ${PREVIEW_LIMIT} (free)`
              : `Page ${page} of 42`}
          </p>
        </div>

        {/* controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={goPrev} disabled={page <= 1} style={{ ...ctrlBtnStyle, opacity: page <= 1 ? 0.4 : 1 }}>
            <ChevronLeft size={14} />
          </button>
          <button onClick={goNext}
            disabled={isPreview ? page > PREVIEW_LIMIT : page >= 42}
            style={{ ...ctrlBtnStyle, opacity: (isPreview ? page > PREVIEW_LIMIT : page >= 42) ? 0.4 : 1 }}
          >
            <ChevronRight size={14} />
          </button>
          <div style={{ width: 1, height: 20, background: "#1e2d45", margin: "0 4px" }} />
          <button onClick={() => setZoom(z => Math.max(70, z - 10))} style={ctrlBtnStyle}><ZoomOut size={14} /></button>
          <button onClick={() => setZoom(z => Math.min(150, z + 10))} style={ctrlBtnStyle}><ZoomIn size={14} /></button>
          {!isPreview && (
            <div style={{ marginLeft: 8 }}>
              <Lock size={16} style={{ color: "#374151" }} />
            </div>
          )}
        </div>
      </header>

      {/* ── PROGRESS BAR (preview mode) ── */}
      {isPreview && (
        <div style={{ height: 4, background: "#1e2d45", flexShrink: 0, position: "relative" }}>
          <div style={{
            height: "100%",
            width: `${(Math.min(page, PREVIEW_LIMIT) / PREVIEW_LIMIT) * 100}%`,
            background: "linear-gradient(90deg, #A78BFA, #8B5CF6)",
            transition: "width 0.3s",
          }} />
          <span style={{
            position: "absolute", right: 12, top: 6,
            fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#6B7280",
          }}>
            {Math.min(page, PREVIEW_LIMIT)}/{PREVIEW_LIMIT} preview pages
          </span>
        </div>
      )}

      {/* ── VIEWER AREA ── */}
      <div style={{
        flex: 1, background: "#111",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        overflowY: "auto", padding: "32px 24px",
      }}>
        <div style={{
          background: "#fff",
          width: `${595 * zoom / 100}px`,
          minHeight: `${840 * zoom / 100}px`,
          borderRadius: 4,
          boxShadow: "0 8px 48px rgba(0,0,0,0.7)",
          position: "relative", overflow: "hidden",
          fontSize: `${zoom / 100}em`,
          transition: "width 0.2s, min-height 0.2s",
        }}>
          {/* Show blurred preview of page 3 content beneath paywall */}
          <div style={{ filter: isLocked ? "blur(6px)" : "none", transition: "filter 0.3s" }}>
            <PdfPage data={pageData} isPreview={isPreview} watermarkUser="rahulsharma" />
          </div>
          {isLocked && <PaywallOverlay productTitle="GATE 2024 ECE Notes" />}
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      {isPreview ? (
        /* Preview bottom CTA */
        <div style={{
          flexShrink: 0, height: 52,
          background: "#111827", borderTop: "1px solid #1e2d45",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px",
        }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF" }}>
            Like what you see? Unlock all <strong style={{ color: "#F0F4FF" }}>48 pages</strong> instantly.
          </p>
          <Link href="/marketplace/digital/1" style={{ textDecoration: "none" }}>
            <button style={{
              height: 36, padding: "0 20px", borderRadius: 9999,
              background: "#8B5CF6", border: "none", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <ShoppingCart size={14} /> Buy for ₹500
            </button>
          </Link>
        </div>
      ) : (
        /* Full mode watermark bar */
        <div style={{
          flexShrink: 0, height: 44,
          background: "#7C3AED",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 24px",
        }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            🛡️ This PDF is watermarked with your username{" "}
            <strong style={{ color: "#E9D5FF" }}>rahulsharma</strong>.{" "}
            Sharing this content is a violation of Terms of Service.
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══ PAGE (Suspense wrapper for useSearchParams) ═════════ */
export default function PdfViewerPage() {
  return (
    <Suspense fallback={
      <div style={{ background: "#0A0E1A", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B7280" }}>Loading viewer…</p>
      </div>
    }>
      <PdfViewerInner />
    </Suspense>
  );
}

const ctrlBtnStyle: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 6,
  background: "transparent", border: "1.5px solid #1e2d45",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#9CA3AF", cursor: "pointer", transition: "border-color 0.15s",
};
