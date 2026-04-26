"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, CheckCircle, Lock, Bell, User, ShoppingCart, Play, Pause } from "lucide-react";

/* ─── Course lessons ──────────────────────────────────── */
const LESSONS = [
  { id: 1, title: "Orientation",           duration: "28:14", done: true,  locked: false },
  { id: 2, title: "Mathematical Prefaces", duration: "35:22", done: true,  locked: false },
  { id: 3, title: "Classic Wave Dynamics", duration: "41:05", done: true,  locked: false },
  { id: 4, title: "Quantum Mechanics",     duration: "51:48", done: false, locked: false, current: true },
  { id: 5, title: "Particle Interactions", duration: "38:30", done: false, locked: true  },
  { id: 6, title: "Atomic Mechanics",      duration: "44:10", done: false, locked: true  },
  { id: 7, title: "Hydrogen Atom",         duration: "29:33", done: false, locked: true  },
  { id: 8, title: "Quantum Probabilities", duration: "37:15", done: false, locked: true  },
];

const WATERMARK_POSITIONS: React.CSSProperties[] = [
  { top: "8%",    right: "3%"  },
  { top: "8%",    left:  "3%"  },
  { bottom: "8%", right: "3%"  },
  { bottom: "8%", left:  "3%"  },
];
const TAGS = ["LECTURE", "ADVANCED", "CORE THEORY"];

/* preview limit: 5 minutes = 300 seconds */
const PREVIEW_LIMIT_SECS = 300;

/* ─── Video Paywall Overlay ────────────────────────────── */
function VideoPaywall() {
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "rgba(10,14,26,0.90)",
      backdropFilter: "blur(8px)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 16, padding: 32, zIndex: 30,
      borderRadius: 12,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: "rgba(16,185,129,0.12)",
        border: "2px solid rgba(16,185,129,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Lock size={28} style={{ color: "#10B981" }} />
      </div>
      <h3 style={{
        fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800,
        color: "#F0F4FF", textAlign: "center",
      }}>
        Free preview ended
      </h3>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#9CA3AF",
        textAlign: "center", maxWidth: 320, lineHeight: 1.65,
      }}>
        You&apos;ve watched <strong style={{ color: "#10B981" }}>5 minutes</strong> for free.
        Enroll now to unlock all <strong style={{ color: "#F0F4FF" }}>12 lessons</strong> and 6h 40m of content.
      </p>
      <div style={{
        background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
        borderRadius: 9999, padding: "6px 20px",
        fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#F0F4FF",
      }}>₹499</div>
      <Link href="/marketplace/digital/1" style={{ textDecoration: "none" }}>
        <button style={{
          height: 48, padding: "0 32px", borderRadius: 9999,
          background: "#10B981", border: "none", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff",
          boxShadow: "0 4px 20px rgba(16,185,129,0.35)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <ShoppingCart size={16} /> Enroll Now — ₹499
        </button>
      </Link>
      <Link href="/marketplace/digital/1" style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280", textDecoration: "none",
      }}>← Back to product page</Link>
    </div>
  );
}

/* ─── Format seconds ──────────────────────────────────── */
function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/* ═══ INNER ═══════════════════════════════════════════════ */
function VideoViewerInner() {
  const searchParams = useSearchParams();
  const isPreview    = searchParams.get("preview") === "true";

  const [current,  setCurrent]  = useState(4);
  const [playing,  setPlaying]  = useState(false);
  const [elapsed,  setElapsed]  = useState(0);   // seconds
  const [wmIndex,  setWmIndex]  = useState(0);
  const [expired,  setExpired]  = useState(false);

  const totalSecs   = isPreview ? PREVIEW_LIMIT_SECS : 51 * 60 + 48; // 51:48
  const progress    = Math.min((elapsed / totalSecs) * 100, 100);
  const remaining   = Math.max(0, PREVIEW_LIMIT_SECS - elapsed);

  // Tick when playing
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (playing && !expired) {
      timerRef.current = setInterval(() => {
        setElapsed(e => {
          const next = e + 1;
          if (isPreview && next >= PREVIEW_LIMIT_SECS) {
            setPlaying(false);
            setExpired(true);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, expired, isPreview]);

  // Rotate watermark every 30s
  useEffect(() => {
    const t = setInterval(() => setWmIndex(i => (i + 1) % 4), 30000);
    return () => clearInterval(t);
  }, []);

  // Right-click prevention (full mode)
  const noCtx = useCallback((e: MouseEvent) => {
    const el = e.target as HTMLElement;
    if (el.closest(".video-area")) e.preventDefault();
  }, []);
  useEffect(() => {
    if (isPreview) return;
    document.addEventListener("contextmenu", noCtx);
    return () => document.removeEventListener("contextmenu", noCtx);
  }, [noCtx, isPreview]);

  const lesson = LESSONS.find(l => l.id === current)!;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#0A0E1A" }}>

      {/* ── NAVBAR ── */}
      <header style={{
        height: 60, background: "#0d1120", borderBottom: "1px solid #1e2d45",
        display: "flex", alignItems: "center", padding: "0 28px", gap: 20,
        position: "sticky", top: 0, zIndex: 10, flexShrink: 0,
      }}>
        <Link href="/marketplace/digital/1" style={{
          display: "flex", alignItems: "center", gap: 6,
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280",
          textDecoration: "none",
        }}>
          <ChevronLeft size={14} />
          {isPreview ? "Back to Product" : "My Purchases"}
        </Link>

        {/* preview badge */}
        {isPreview && !expired && (
          <div style={{
            background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 9999, padding: "3px 12px",
            fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#F7C948",
          }}>
            FREE PREVIEW — {fmt(remaining)} remaining
          </div>
        )}
        {isPreview && expired && (
          <div style={{
            background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 9999, padding: "3px 12px",
            fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#EF4444",
          }}>
            PREVIEW EXPIRED
          </div>
        )}

        <div style={{ flex: 1, textAlign: "center" }}>
          <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#F0F4FF" }}>
            Advanced Physics — Module 4
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#4F8EF7", letterSpacing: "0.5px" }}>
            LESSON SELECTOR ▾
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Bell size={17} style={{ color: "#6B7280", cursor: "pointer" }} />
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: "#4F8EF7",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <User size={16} style={{ color: "#fff" }} />
          </div>
        </div>
      </header>

      {/* preview progress bar */}
      {isPreview && (
        <div style={{ height: 4, background: "#1e2d45", flexShrink: 0, position: "relative" }}>
          <div style={{
            height: "100%",
            width: `${((PREVIEW_LIMIT_SECS - remaining) / PREVIEW_LIMIT_SECS) * 100}%`,
            background: expired
              ? "#EF4444"
              : `linear-gradient(90deg, #10B981 ${100 - (remaining / PREVIEW_LIMIT_SECS) * 100}%, #F7C948)`,
            transition: "width 1s linear",
          }} />
        </div>
      )}

      {/* ── MAIN (70/30) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", flex: 1, minHeight: 0 }}>

        {/* LEFT — video + details */}
        <div style={{ display: "flex", flexDirection: "column", padding: "24px 24px 0" }}>

          {/* VIDEO PLAYER */}
          <div
            className="video-area"
            style={{
              position: "relative", width: "100%", aspectRatio: "16/9",
              borderRadius: 12, overflow: "hidden", background: "#000",
              marginBottom: 16, flexShrink: 0,
            }}
          >
            {/* cosmic bg */}
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse at 50% 50%, #0a0a2e 0%, #000 60%)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {/* stars */}
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} style={{
                  position: "absolute",
                  top:  `${(i * 73 + 17) % 100}%`,
                  left: `${(i * 43 + 11) % 100}%`,
                  width: i % 5 === 0 ? 2 : 1, height: i % 5 === 0 ? 2 : 1,
                  borderRadius: "50%",
                  background: "#fff", opacity: 0.3 + (i % 4) * 0.15,
                }} />
              ))}
              {/* glow */}
              <div style={{
                width: 120, height: 120, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(79,142,247,0.55), transparent 70%)",
                filter: "blur(20px)",
              }} />

              {/* play/pause button */}
              <button
                onClick={() => { if (!expired) setPlaying(p => !p); }}
                style={{
                  position: "absolute",
                  width: 60, height: 60, borderRadius: "50%",
                  background: expired ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.15)",
                  border: `2px solid ${expired ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.4)"}`,
                  cursor: expired ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(4px)",
                  transition: "all 0.15s",
                }}
              >
                {playing
                  ? <Pause size={22} style={{ color: "#fff" }} />
                  : <Play  size={22} style={{ color: "#fff", marginLeft: 3 }} />
                }
              </button>
            </div>

            {/* FLOATING WATERMARK (full mode only) */}
            {!isPreview && (
              <div style={{
                position: "absolute",
                ...WATERMARK_POSITIONS[wmIndex],
                pointerEvents: "none", userSelect: "none",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12, color: "#fff", opacity: 0.55,
                background: "rgba(0,0,0,0.2)", borderRadius: 4,
                padding: "3px 8px",
                transition: "all 0.5s",
              }}>
                rahul.sharma • CampusConnect
              </div>
            )}

            {/* PREVIEW countdown badge (top right) */}
            {isPreview && !expired && (
              <div style={{
                position: "absolute", top: 12, right: 12,
                background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
                borderRadius: 8, padding: "5px 12px",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
                color: remaining < 60 ? "#EF4444" : "#F7C948",
                fontWeight: 700,
                border: `1px solid ${remaining < 60 ? "rgba(239,68,68,0.3)" : "rgba(247,201,72,0.3)"}`,
                transition: "color 0.3s",
              }}>
                ⏱ {fmt(remaining)} left
              </div>
            )}

            {/* VIDEO PAYWALL (preview expired) */}
            {expired && <VideoPaywall />}

            {/* PROGRESS BAR */}
            {!expired && (
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: 60,
                background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                display: "flex", flexDirection: "column", justifyContent: "flex-end",
                padding: "0 16px 12px",
              }}>
                {/* track */}
                <div style={{
                  height: 3, background: "rgba(255,255,255,0.2)",
                  borderRadius: 9999, marginBottom: 8, position: "relative",
                }}>
                  <div style={{
                    height: "100%", width: `${progress}%`,
                    background: isPreview ? "#F7C948" : "#4F8EF7",
                    borderRadius: 9999, transition: "width 1s linear",
                  }} />
                  <div style={{
                    position: "absolute", left: `${progress}%`, top: -3,
                    width: 9, height: 9, borderRadius: "50%",
                    background: isPreview ? "#F7C948" : "#4F8EF7",
                    transform: "translateX(-50%)",
                    boxShadow: `0 0 0 2px ${isPreview ? "rgba(247,201,72,0.4)" : "rgba(79,142,247,0.4)"}`,
                    transition: "left 1s linear",
                  }} />
                </div>
                {/* time row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#d1d5db" }}>
                    {fmt(elapsed)} / {isPreview ? fmt(PREVIEW_LIMIT_SECS) : "51:48"}
                  </span>
                  <div style={{ flex: 1 }} />
                  {isPreview
                    ? <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#F7C948" }}>👁 Preview Mode</span>
                    : <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#6B7280" }}>🔒 Protected</span>
                  }
                </div>
              </div>
            )}
          </div>

          {/* lesson info */}
          <div style={{
            background: "#111827", border: "1.5px solid #1e2d45",
            borderRadius: 12, padding: "18px 20px", marginBottom: 16,
          }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 700, color: "#F0F4FF", marginBottom: 6 }}>
              {lesson.title} Fundamentals
            </h2>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF",
              lineHeight: 1.65, marginBottom: 12,
            }}>
              {isPreview
                ? "You're watching the first 5 minutes of this lecture. Purchase the full course to access all lessons."
                : "In this foundational session of Module 4, we explore the wave-particle duality and the historical context of the Schrödinger Equation. This video is intended for enrolled students only."}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {TAGS.map(t => (
                <span key={t} style={{
                  background: "#1a2235", border: "1px solid #1e2d45",
                  borderRadius: 6, padding: "3px 10px",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#9CA3AF",
                  letterSpacing: "0.5px",
                }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Preview CTA below video (if preview mode) */}
          {isPreview && (
            <div style={{
              background: "rgba(16,185,129,0.06)",
              border: "1.5px solid rgba(16,185,129,0.2)",
              borderRadius: 12, padding: "16px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 16,
            }}>
              <div>
                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#F0F4FF", marginBottom: 4 }}>
                  Enjoying the preview?
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#9CA3AF" }}>
                  Get full access to all 12 lessons, HD downloads &amp; more.
                </p>
              </div>
              <Link href="/marketplace/digital/1" style={{ textDecoration: "none", flexShrink: 0, marginLeft: 16 }}>
                <button style={{
                  height: 40, padding: "0 20px", borderRadius: 9999,
                  background: "#10B981", border: "none", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff",
                  display: "flex", alignItems: "center", gap: 6,
                  boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
                }}>
                  <ShoppingCart size={14} /> Enroll — ₹499
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* RIGHT — COURSE OUTLINE */}
        <div style={{
          background: "#0d1120", borderLeft: "1px solid #1e2d45",
          display: "flex", flexDirection: "column", overflowY: "auto",
        }}>
          <div style={{ padding: "20px 20px 12px", borderBottom: "1px solid #1e2d45" }}>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#F0F4FF" }}>COURSE CONTENTS</p>
            {isPreview && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#6B7280", marginTop: 4 }}>
                🔒 Full course locked — purchase to unlock
              </p>
            )}
          </div>

          <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            {LESSONS.map(l => {
              // In preview, all lessons after lesson 1 are locked
              const lockedInPreview = isPreview && l.id > 1;
              const effectiveLocked = l.locked || lockedInPreview;

              return (
                <div
                  key={l.id}
                  onClick={() => !effectiveLocked && setCurrent(l.id)}
                  style={{
                    padding: "10px 12px", borderRadius: 8,
                    background: l.current && !lockedInPreview ? "rgba(79,142,247,0.1)" : "transparent",
                    border: `1px solid ${l.current && !lockedInPreview ? "rgba(79,142,247,0.25)" : "transparent"}`,
                    cursor: effectiveLocked ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: 10,
                    opacity: effectiveLocked ? 0.4 : 1,
                    transition: "all 0.15s",
                  }}
                >
                  {effectiveLocked
                    ? <Lock size={14} style={{ color: "#374151", flexShrink: 0 }} />
                    : l.done
                      ? <CheckCircle size={14} style={{ color: "#10B981", flexShrink: 0 }} />
                      : (
                        <div style={{
                          width: 14, height: 14, borderRadius: "50%",
                          background: l.current ? "#4F8EF7" : "transparent",
                          border: `2px solid ${l.current ? "#4F8EF7" : "#374151"}`,
                          flexShrink: 0,
                        }} />
                      )
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12, fontWeight: l.current && !lockedInPreview ? 700 : 500,
                      color: l.current && !lockedInPreview ? "#F0F4FF" : effectiveLocked ? "#374151" : "#9CA3AF",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {String(l.id).padStart(2, "0")}: {l.title}
                    </p>
                    {l.current && !lockedInPreview && (
                      <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                        <span style={{
                          background: "#4F8EF7", color: "#fff",
                          borderRadius: 4, padding: "1px 6px",
                          fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700,
                        }}>PLAYING</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#6B7280" }}>
                          {l.duration}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* unlock */}
          <div style={{ padding: "16px 12px", borderTop: "1px solid #1e2d45" }}>
            <Link href="/marketplace/digital/1" style={{ textDecoration: "none" }}>
              <button style={{
                width: "100%", height: 40, borderRadius: 8,
                background: "rgba(245,158,11,0.1)", border: "1.5px solid rgba(245,158,11,0.3)",
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#F7C948",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                🔓 {isPreview ? "Purchase to Unlock All" : "UNLOCK NEXT MODULES"}
              </button>
            </Link>
          </div>

          {/* resources */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid #1e2d45" }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700,
              letterSpacing: "1px", color: "#374151", marginBottom: 10,
            }}>CLASS RESOURCES</p>
            {[
              { icon: "📄", label: "Lecture Notes (PDF)", locked: isPreview },
              { icon: "{ }", label: "Jupyter Lab: Schrödinger Sim", locked: isPreview },
            ].map(r => (
              <div key={r.label} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                borderBottom: "1px solid #1e2d45",
                opacity: r.locked ? 0.4 : 1,
              }}>
                <span style={{ fontSize: 14 }}>{r.locked ? "🔒" : r.icon}</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#9CA3AF" }}>{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      {!isPreview && (
        <div style={{
          flexShrink: 0, padding: "10px 28px",
          background: "#7C3AED",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#fff", letterSpacing: "0.5px" }}>
            🛡️ THIS VIDEO IS PROTECTED. UNAUTHORIZED DISTRIBUTION IS TRACEABLE TO YOUR ACCOUNT [RAHUL.SHARMA]
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
              SESSION ID: 7A5-4EL-9C2N4
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
              PROTECTED CONTENT
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══ PAGE (Suspense wrapper) ══════════════════════════════ */
export default function VideoViewerPage() {
  return (
    <Suspense fallback={
      <div style={{ background: "#0A0E1A", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B7280" }}>Loading viewer…</p>
      </div>
    }>
      <VideoViewerInner />
    </Suspense>
  );
}
