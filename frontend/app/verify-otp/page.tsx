"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, RefreshCw, Clock } from "lucide-react";
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
        {[
          { icon: "🎥", label: "Video Lecture",     color: "#A78BFA", border: "rgba(124,58,237,0.3)", rotate: "-4deg",  left: 24, top: 30 },
          { icon: "📄", label: "Notes PDF",          color: "#10B981", border: "rgba(16,185,129,0.3)", rotate: "-1.5deg", left: 52, top: 16 },
          { icon: "💻", label: "Laptop — ₹28,000",  color: "#4F8EF7", border: "rgba(79,142,247,0.4)", rotate: "1.5deg",  left: 80, top: 0 },
        ].map(c => (
          <div key={c.icon} style={{
            position: "absolute", top: c.top, left: c.left,
            width: 280, height: 160, borderRadius: 14,
            background: "#1a2235", border: `1px solid ${c.border}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: `rotate(${c.rotate})`,
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32 }}>{c.icon}</div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                color: c.color, marginTop: 6, fontWeight: 700,
              }}>{c.label}</div>
            </div>
          </div>
        ))}
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
          { num: "12+",   label: "Colleges" },
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
      style={{
        width: 52, height: 62,
        background: "#1a2235",
        border: focused ? "2px solid #4F8EF7" : `2px solid ${value ? "#4F8EF7aa" : "#1e2d45"}`,
        borderRadius: 10, outline: "none",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 26, fontWeight: 700,
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
  const { pendingEmail, maskedEmail, setPendingEmail, setAuth } = useAuthStore();

  // Fall back gracefully if store is empty (e.g. hard refresh to /verify-otp)
  const displayEmail = maskedEmail ?? pendingEmail ?? "your.name@college.edu";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [focusIdx, setFocusIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
  const timer = useTimer(5 * 60); // 5 min per spec (S2 shows 4:00 min countdown)

  const setValue = (idx: number, val: string) => {
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) {
      refs[idx + 1].current?.focus();
      setFocusIdx(idx + 1);
    }
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleResend = async () => {
    if (!pendingEmail) return;
    try {
      const { data } = await api.post<{ message: string; maskedEmail: string }>(
        "/api/auth/student/send-otp",
        { email: pendingEmail }
      );
      setPendingEmail(pendingEmail, data.maskedEmail);
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
    <div style={{
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

      {/* heading */}
      <h1 style={{
        fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800,
        letterSpacing: "-1px", color: "#F0F4FF", marginBottom: 8,
      }}>
        Check your inbox 📬
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
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr",
      minHeight: "100vh", background: "#0A0E1A",
    }}>
      <AuthLeftPanel />
      <Suspense fallback={
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "#111827",
        }}>
          <div style={{ color: "#6B7280", fontFamily: "'DM Sans', sans-serif" }}>Loading…</div>
        </div>
      }>
        <OtpContent />
      </Suspense>
    </div>
  );
}
