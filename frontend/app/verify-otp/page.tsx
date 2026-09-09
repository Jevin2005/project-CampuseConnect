"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, RefreshCw, Clock, Video, FileText, Laptop, MailOpen, Zap, Sparkles, CheckCircle2 } from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

/* ─── left decorative panel (shared) ───────────────────────────── */
function AuthLeftPanel() {
  return (
    <div style={{
      background: "linear-gradient(160deg, #0A0E1A 0%, #0d1830 100%)",
      display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "60px 56px",
      position: "relative", overflow: "hidden", minHeight: "100vh",
    }}>
      <div aria-hidden style={{
        position: "absolute", top: "-10%", left: "-15%",
        width: 500, height: 500,
        background: "radial-gradient(circle, rgba(79,142,247,0.10) 0%, transparent 65%)",
      }} />
      <div aria-hidden style={{
        position: "absolute", bottom: "5%", right: "-10%",
        width: 360, height: 360,
        background: "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%)",
      }} />

      {/* stacked cards */}
      <div style={{ position: "relative", height: 220, marginBottom: 48 }}>
        <div style={{
          position: "absolute", top: 30, left: 24,
          width: 280, height: 160, borderRadius: 14,
          background: "#1a2235", border: "1px solid rgba(124,58,237,0.3)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: "rotate(-4deg)",
        }}>
          <div style={{ textAlign: "center" }}>
            <Video size={32} style={{ color: "#A78BFA", margin: "0 auto" }} />
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#A78BFA", marginTop: 8, fontWeight: 700 }}>Video Lecture</div>
          </div>
        </div>
        <div style={{
          position: "absolute", top: 16, left: 52,
          width: 280, height: 160, borderRadius: 14,
          background: "#1a2235", border: "1px solid rgba(16,185,129,0.3)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: "rotate(-1.5deg)",
        }}>
          <div style={{ textAlign: "center" }}>
            <FileText size={32} style={{ color: "#10B981", margin: "0 auto" }} />
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#10B981", marginTop: 8, fontWeight: 700 }}>Notes PDF</div>
          </div>
        </div>
        <div style={{
          position: "absolute", top: 0, left: 80,
          width: 280, height: 160, borderRadius: 14,
          background: "#1a2235", border: "1px solid rgba(79,142,247,0.4)",
          boxShadow: "0 12px 40px rgba(79,142,247,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: "rotate(1.5deg)",
        }}>
          <div style={{ textAlign: "center" }}>
            <Laptop size={32} style={{ color: "#4F8EF7", margin: "0 auto" }} />
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#4F8EF7", marginTop: 8, fontWeight: 700 }}>Laptop — ₹28,000</div>
          </div>
        </div>
      </div>

      <h2 style={{
        fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800,
        letterSpacing: "-1px", color: "#F0F4FF", marginBottom: 12, lineHeight: 1.25,
      }}>
        Your College.<br />Your Marketplace.
      </h2>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 14,
        color: "#6B7280", lineHeight: 1.65, marginBottom: 36,
      }}>
        Over 2,840 products listed by students just like you.
      </p>

      <div style={{ display: "flex", alignItems: "center" }}>
        {[
          { num: "1,470", label: "Students" },
          { num: "2,840", label: "Products" },
          { num: "12+", label: "Colleges" },
        ].map((s, i) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ textAlign: "center", padding: "0 20px" }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: "#F7C948" }}>{s.num}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6B7280", marginTop: 3 }}>{s.label}</div>
            </div>
            {i < 2 && <div style={{ width: 1, height: 32, background: "#1e2d45" }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── OTP input box ─────────────────────────────────────────────── */
function OtpBox({ idx, value, focused, onChange, onKeyDown, inputRef }: {
  idx: number; value: string; focused: boolean;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <input
      ref={inputRef}
      id={`otp-box-${idx}`}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={value}
      onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(-1))}
      onKeyDown={onKeyDown}
      className="otp-box-input"
      style={{
        background: "#1a2235",
        border: focused ? "2px solid #4F8EF7" : `2px solid ${value ? "#4F8EF7aa" : "#1e2d45"}`,
        borderRadius: 10, outline: "none",
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700,
        color: "#F0F4FF", textAlign: "center",
        boxShadow: focused ? "0 0 0 3px rgba(79,142,247,0.18)" : "none",
        transition: "border-color 0.18s, box-shadow 0.18s",
        caretColor: "transparent",
      }}
    />
  );
}

/* ─── Countdown timer ───────────────────────────────────────────── */
function useTimer(initial: number) {
  const [secs, setSecs] = useState(initial);
  const [running, setRunning] = useState(true);
  useEffect(() => {
    if (!running) return;
    if (secs === 0) { setRunning(false); return; }
    const id = setInterval(() => setSecs(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [secs, running]);
  const reset = () => { setSecs(initial); setRunning(true); };
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return { display: `${mm}:${ss}`, expired: secs === 0, reset };
}

/* ═══ S2 CONTENT ══════════════════════════════════════════════════ */
function OtpContent() {
  const rtr = useRouter();
  const { pendingEmail, maskedEmail, devOtp, instantMessage, setPendingEmail, setAuth } = useAuthStore();

  // Fall back gracefully if store is empty (e.g. hard refresh to /verify-otp)
  const displayEmail = maskedEmail ?? pendingEmail ?? "your.name@college.edu";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [focusIdx, setFocusIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
  const timer = useTimer(30); // 30s quick resend timer

  const setValue = (idx: number, val: string) => {
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) {
      refs[idx + 1].current?.focus();
      setFocusIdx(idx + 1);
    }
  };

  const handleAutofill = (code: string) => {
    const digits = code.split("").slice(0, 6);
    const padded = [...digits, ...Array(6 - digits.length).fill("")].slice(0, 6);
    setOtp(padded);
    refs[5].current?.focus();
  };

  const handleKeyDown = (idx: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
      setFocusIdx(idx - 1);
    }
    if (e.key === "ArrowLeft" && idx > 0) { refs[idx - 1].current?.focus(); setFocusIdx(idx - 1); }
    if (e.key === "ArrowRight" && idx < 5) { refs[idx + 1].current?.focus(); setFocusIdx(idx + 1); }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (t) {
      setOtp([...t.split(""), ...Array(6 - t.length).fill("")]);
      refs[Math.min(t.length, 5)].current?.focus();
    }
  };

  const filled = otp.every(d => d !== "");

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!filled) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post<{
        status: "PENDING" | "APPROVED";
        accessToken?: string;
        user?: import("@/store/authStore").AuthUser;
      }>("/api/auth/student/verify-otp", {
        email: pendingEmail,
        otp: otp.join(""),
      });

      if (data.status === "PENDING") {
        rtr.push("/pending-approval");
      } else if (data.status === "APPROVED" && data.accessToken && data.user) {
        setAuth(data.accessToken, data.user, "STUDENT", data.user.collegeId);
        rtr.push("/marketplace");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Invalid or expired OTP. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (otp.every(d => d !== "") && !loading) {
      handleVerify();
    }
  }, [otp]);

  const handleResend = async () => {
    if (!pendingEmail) return;
    try {
      const { data } = await api.post<{
        message: string;
        maskedEmail: string;
        devOtp?: string;
        instantMessage?: string;
      }>("/api/auth/student/send-otp", { email: pendingEmail });

      setPendingEmail(pendingEmail, data.maskedEmail, data.devOtp, data.instantMessage);
      timer.reset();
      setOtp(["", "", "", "", "", ""]);
      setError("");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to resend OTP.";
      setError(msg);
    }
  };

  return (
    <div className="otp-content-card" style={{
      display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "60px 72px",
      background: "#111827", position: "relative", overflow: "hidden",
    }}>
      <div aria-hidden style={{
        position: "absolute", top: "10%", right: "-10%",
        width: 280, height: 280,
        background: "radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 65%)",
      }} />

      {/* logo */}
      <Link href="/" style={{ textDecoration: "none", marginBottom: 40, display: "inline-flex" }}>
        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "#F0F4FF" }}>Campus</span>
        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "#4F8EF7" }}>Connect</span>
      </Link>

      {/* Instant Notification Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(79,142,247,0.12))",
        border: "1px solid rgba(16,185,129,0.3)",
        borderRadius: 14, padding: "14px 18px", marginBottom: 28,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Zap size={20} style={{ color: "#10B981", flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: "#10B981" }}>
              Instant Message
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#9CA3AF" }}>
              {instantMessage || "Verification code dispatched. Check inbox or spam folder."}
            </div>
          </div>
        </div>
        {devOtp && (
          <button
            type="button"
            onClick={() => handleAutofill(devOtp)}
            style={{
              background: "#10B981", color: "#003824", border: "none",
              padding: "6px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 700,
              cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
              boxShadow: "0 2px 10px rgba(16,185,129,0.3)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Sparkles size={13} /> Auto-fill ({devOtp})
          </button>
        )}
      </div>

      {/* heading */}
      <div style={{ marginBottom: 16 }}>
        <MailOpen size={36} style={{ color: '#4F8EF7' }} />
      </div>
      <h1 style={{
        fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800,
        letterSpacing: "-1px", color: "#F0F4FF", marginBottom: 8,
      }}>
        Check your inbox
      </h1>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 15,
        color: "#9CA3AF", marginBottom: 12,
      }}>
        We sent a 6-digit OTP to:
      </p>

      {/* email badge */}
      <div style={{
        display: "inline-flex", alignItems: "center",
        background: "rgba(79,142,247,0.1)",
        border: "1px solid rgba(79,142,247,0.25)",
        borderRadius: 9999, padding: "6px 16px",
        marginBottom: 36, width: "fit-content",
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14, fontWeight: 600, color: "#4F8EF7",
        }}>
          {displayEmail}
        </span>
      </div>

      <form onSubmit={handleVerify}>
        {/* OTP boxes */}
        <div
          className="otp-boxes-row"
          style={{ display: "flex", gap: 10, marginBottom: 20 }}
          onPaste={handlePaste}
        >
          {otp.map((digit, i) => (
            <OtpBox
              key={i} idx={i} value={digit}
              focused={focusIdx === i}
              onChange={val => setValue(i, val)}
              onKeyDown={handleKeyDown(i)}
              inputRef={refs[i]}
            />
          ))}
        </div>

        {error && (
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13,
            color: "#EF4444", marginBottom: 12,
          }}>
            {error}
          </p>
        )}

        {/* timer */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          marginBottom: 8,
        }}>
          <Clock size={13} style={{ color: timer.expired ? "#F59E0B" : "#6B7280" }} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13,
            color: timer.expired ? "#F59E0B" : "#6B7280",
          }}>
            {timer.expired ? "OTP expired" : `Resend OTP in ${timer.display}`}
          </span>
        </div>

        {/* resend */}
        <button
          type="button"
          disabled={!timer.expired}
          onClick={handleResend}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "transparent", border: "none",
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
            color: timer.expired ? "#4F8EF7" : "#6B7280",
            cursor: timer.expired ? "pointer" : "not-allowed",
            padding: 0, marginBottom: 32,
          }}
        >
          <RefreshCw size={12} />
          Resend OTP
        </button>

        {/* verify button */}
        <button
          id="verify-otp-btn"
          type="submit"
          disabled={!filled || loading}
          style={{
            width: "100%", height: 50, borderRadius: 9999,
            background: filled ? "#4F8EF7" : "#1a2235",
            border: "none", cursor: filled ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, fontWeight: 700,
            color: filled ? "#fff" : "#6B7280",
            boxShadow: filled ? "0 4px 16px rgba(79,142,247,0.35)" : "none",
            transition: "all 0.2s",
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                style={{ animation: "spin 0.8s linear infinite" }}>
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Verifying…
            </span>
          ) : (
            <>Verify & Enter <ArrowRight size={16} /></>
          )}
        </button>
      </form>

      {/* change email */}
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <Link
          href="/login"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
            color: "#6B7280", textDecoration: "none", transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#9CA3AF")}
          onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}
        >
          <ArrowLeft size={14} />
          Change Email
        </Link>
      </div>

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* ═══ PAGE ════════════════════════════════════════════════════════ */
export default function OtpPage() {
  return (
    <>
      <style>{`
        .otp-page-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          background: #0A0E1A;
        }
        .otp-right-panel {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .otp-boxes-row {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          width: 100%;
        }
        .otp-box-input {
          width: 52px;
          height: 62px;
          font-size: 26px;
        }

        @media (max-width: 768px) {
          .otp-page-container {
            display: flex !important;
            flex-direction: column !important;
            min-height: 100vh !important;
          }
          .otp-left-panel {
            display: none !important;
          }
          .otp-right-panel {
            flex: 1 !important;
            width: 100% !important;
          }
          .otp-content-card {
            padding: 36px 18px 48px !important;
            justify-content: flex-start !important;
            min-height: 100vh !important;
          }
          .otp-boxes-row {
            gap: 6px !important;
            justify-content: space-between !important;
          }
          .otp-box-input {
            width: min(46px, calc((100% - 30px) / 6)) !important;
            height: 54px !important;
            font-size: 22px !important;
            border-radius: 8px !important;
          }
        }
        @media (max-width: 480px) {
          .otp-content-card {
            padding: 24px 14px 40px !important;
          }
          .otp-box-input {
            width: min(42px, calc((100% - 25px) / 6)) !important;
            height: 50px !important;
            font-size: 20px !important;
          }
        }
      `}</style>
      <div className="otp-page-container">
        <div className="otp-left-panel">
          <AuthLeftPanel />
        </div>
        <div className="otp-right-panel">
          <Suspense fallback={
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#111827", flex: 1, minHeight: "100vh",
            }}>
              <div style={{ color: "#6B7280", fontFamily: "'DM Sans', sans-serif" }}>Loading…</div>
            </div>
          }>
            <OtpContent />
          </Suspense>
        </div>
      </div>
    </>
  );
}
