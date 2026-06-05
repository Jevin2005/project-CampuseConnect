"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Info, AlertCircle, Eye, EyeOff, Mail, Lock } from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

/* ─── Mobile CSS embedded directly for guaranteed loading ──────── */
const MOBILE_STYLES = `
  .sl-mobile-top { display: none; }

  @media (max-width: 768px) {
    /* page: switch from 2-col grid to vertical flex */
    .sl-page-grid {
      display: flex !important;
      flex-direction: column !important;
      min-height: 100vh !important;
      background: #0A0E1A !important;
    }
    /* hide decorative left panel */
    .sl-left-panel { display: none !important; }

    /* show mobile header */
    .sl-mobile-top {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      padding: 48px 24px 24px !important;
      text-align: center !important;
    }
    .sl-mobile-logo {
      display: inline-flex !important;
      align-items: center !important;
      gap: 8px !important;
      text-decoration: none !important;
      margin-bottom: 18px !important;
    }
    .sl-mobile-logo-icon {
      width: 32px !important; height: 32px !important;
      background: rgba(79,142,247,0.15) !important;
      border: 1px solid rgba(79,142,247,0.4) !important;
      border-radius: 8px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 16px !important;
    }
    .sl-mobile-logo-text {
      font-family: 'Sora', sans-serif !important;
      font-size: 22px !important;
      font-weight: 800 !important;
    }
    .sl-mobile-logo-campus  { color: #F0F4FF !important; }
    .sl-mobile-logo-connect { color: #4F8EF7 !important; }
    .sl-mobile-heading {
      font-family: 'Sora', sans-serif !important;
      font-size: 26px !important; font-weight: 800 !important;
      color: #F0F4FF !important; margin: 0 0 8px !important;
    }
    .sl-mobile-sub {
      font-family: 'DM Sans', sans-serif !important;
      font-size: 14px !important; color: #9CA3AF !important;
      margin: 0 !important; line-height: 1.5 !important;
    }

    /* right panel: full width, no padding, flat bg */
    .sl-right-panel {
      flex: 1 !important;
      width: 100% !important;
      padding: 0 !important;
      background: #0A0E1A !important;
      position: static !important;
      overflow: visible !important;
      justify-content: flex-start !important;
      border: none !important;
    }
    /* hide desktop-only elements inside right panel */
    .sl-desktop-logo    { display: none !important; }
    .sl-desktop-heading { display: none !important; }
    .sl-desktop-sub     { display: none !important; }
    /* hide the decorative blob */
    .sl-right-panel .sl-blob { display: none !important; }

    /* form body padding */
    .sl-form-body {
      padding: 0 16px 40px !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }

    /* form card */
    .sl-form-card {
      background: #111827 !important;
      border: 1px solid #1e2d45 !important;
      border-radius: 16px !important;
      padding: 20px 18px 24px !important;
      margin-bottom: 0 !important;
    }

    /* tabs: underline style */
    .sl-tabs-wrap {
      background: transparent !important;
      border: none !important;
      border-bottom: 1px solid #1e2d45 !important;
      border-radius: 0 !important;
      padding: 0 !important;
      margin-bottom: 22px !important;
      display: flex !important;
    }
    .sl-tab-btn {
      flex: 1 !important;
      background: transparent !important;
      border: none !important;
      border-bottom: 2px solid transparent !important;
      border-radius: 0 !important;
      height: auto !important;
      padding: 10px 0 12px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      color: #6B7280 !important;
      cursor: pointer !important;
      margin-bottom: -1px !important;
      transition: all 0.2s !important;
    }
    .sl-tab-btn.sl-tab-active {
      color: #F0F4FF !important;
      border-bottom-color: #F0F4FF !important;
      font-weight: 700 !important;
      background: transparent !important;
    }

    /* submit button: bigger + glowing on mobile */
    .sl-submit-btn {
      height: 52px !important;
      font-size: 16px !important;
      background: #4F8EF7 !important;
      box-shadow: 0 4px 20px rgba(79,142,247,0.38) !important;
      color: #fff !important;
      border: none !important;
    }
    .sl-submit-btn:disabled {
      background: #1a2235 !important;
      box-shadow: none !important;
      color: #6B7280 !important;
    }

    /* hide OR divider */
    .sl-divider { display: none !important; }

    /* register box: clean, no border */
    .sl-register-box {
      background: transparent !important;
      border: none !important;
      padding: 0 !important;
      margin: 16px 0 0 !important;
      text-align: center !important;
    }
    .sl-register-box > p { display: none !important; }
    .sl-register-link {
      display: block !important;
      text-align: center !important;
      font-family: 'DM Sans', sans-serif !important;
      font-size: 15px !important; font-weight: 700 !important;
      color: #4F8EF7 !important; padding: 10px 0 !important;
      text-decoration: none !important;
    }
    .sl-admin-link-wrap {
      text-align: center !important;
      margin: 8px 0 0 !important;
    }
    .sl-admin-link {
      font-family: 'DM Sans', sans-serif !important;
      font-size: 14px !important; font-weight: 500 !important;
      color: #9CA3AF !important; text-decoration: none !important;
    }
  }
`;

/* ─── shared left decorative panel ─────────────────────────────── */
function AuthLeftPanel() {
  return (
    <div style={{
      background: "linear-gradient(160deg, #0A0E1A 0%, #0d1830 100%)",
      display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "60px 56px",
      position: "relative", overflow: "hidden",
      minHeight: "100vh",
    }}>
      <div aria-hidden style={{
        position: "absolute", top: "-10%", left: "-15%",
        width: 500, height: 500,
        background: "radial-gradient(circle, rgba(79,142,247,0.10) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      <div aria-hidden style={{
        position: "absolute", bottom: "5%", right: "-10%",
        width: 360, height: 360,
        background: "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

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
            <div style={{ fontSize: 32 }}>🎥</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#A78BFA", marginTop: 6, fontWeight: 700 }}>Video Lecture</div>
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
            <div style={{ fontSize: 32 }}>📄</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#10B981", marginTop: 6, fontWeight: 700 }}>Notes PDF</div>
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
            <div style={{ fontSize: 32 }}>💻</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#4F8EF7", marginTop: 6, fontWeight: 700 }}>Laptop — ₹28,000</div>
          </div>
        </div>
      </div>

      <h2 style={{
        fontFamily: "'Sora', sans-serif",
        fontSize: "clamp(22px, 2vw, 28px)",
        fontWeight: 800, letterSpacing: "-1px",
        color: "#F0F4FF", marginBottom: 12, lineHeight: 1.25,
      }}>
        Your College.<br />Your Marketplace.
      </h2>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14, color: "#6B7280", lineHeight: 1.65, marginBottom: 36,
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

/* ═══ STUDENT LOGIN PAGE ═══════════════════════════════════════════ */
export default function StudentLoginPage() {
  const router = useRouter();
  const { setPendingEmail, setAuth } = useAuthStore();

  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [pwForm, setPwForm]       = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError]     = useState("");
  const [isPending, setIsPending] = useState(false);

  const [otpEmail, setOtpEmail]   = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError]   = useState("");

  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const otpInputsRef = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showVerification && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((p) => { if (p <= 1) { setCanResend(true); clearInterval(timer); return 0; } return p - 1; });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showVerification, resendTimer]);

  const handleOtpChange = (idx: number, val: string) => {
    if (val && !/^\d$/.test(val)) return;
    const n = [...otp]; n[idx] = val; setOtp(n);
    if (val && idx < 5) otpInputsRef.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[idx] && idx > 0) {
        const n = [...otp]; n[idx - 1] = ""; setOtp(n); otpInputsRef.current[idx - 1]?.focus();
      } else {
        const n = [...otp]; n[idx] = ""; setOtp(n);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(p)) { setOtp(p.split("")); otpInputsRef.current[5]?.focus(); }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const full = otp.join("");
    if (full.length < 6) return;
    setVerificationError(""); setVerifying(true);
    try {
      await api.post("/api/auth/student/register/verify", { email: verificationEmail, otp: full });
      setShowVerification(false);
      router.push(`/pending-approval?email=${encodeURIComponent(verificationEmail)}`);
    } catch (err: any) {
      setVerificationError(err.response?.data?.message ?? "Invalid OTP. Please try again.");
    } finally { setVerifying(false); }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setVerificationError(""); setCanResend(false); setResendTimer(60);
    try {
      await api.post("/api/auth/student/register/resend", { email: verificationEmail });
    } catch (err: any) {
      setVerificationError(err.response?.data?.message ?? "Failed to resend. Try again.");
      setCanResend(true);
    }
  };

  useEffect(() => {
    if (otp.join("").length === 6 && showVerification) handleVerifyOtp();
  }, [otp, showVerification]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setPwError(""); setIsPending(false);
    if (!pwForm.email.trim() || !pwForm.password) return;
    setPwLoading(true);
    try {
      const { data } = await api.post<{
        status: "APPROVED" | "PENDING";
        accessToken?: string;
        user?: import("@/store/authStore").AuthUser;
      }>("/api/auth/student/login", { email: pwForm.email.trim(), password: pwForm.password });
      if (data.status === "APPROVED" && data.accessToken && data.user) {
        setAuth(data.accessToken, data.user, "STUDENT", data.user.collegeId);
        router.push("/marketplace");
      }
    } catch (err: unknown) {
      const r = (err as any)?.response;
      if (r?.status === 403) {
        if (r?.data?.status === "EMAIL_UNVERIFIED") {
          setVerificationEmail(pwForm.email.trim());
          setPwError("Your email is not verified. Sending a code now…");
          try {
            const { data } = await api.post<{ maskedEmail?: string }>("/api/auth/student/register/resend", { email: pwForm.email.trim() });
            setMaskedEmail(data.maskedEmail || pwForm.email.trim());
            setResendTimer(60); setCanResend(false); setOtp(Array(6).fill(""));
            setVerificationError(""); setShowVerification(true); setPwError("");
          } catch (re: any) {
            setPwError(re.response?.data?.message ?? "Email unverified. Could not send code.");
          }
        } else { setIsPending(true); }
      } else { setPwError(r?.data?.message ?? "Invalid email or password."); }
    } finally { setPwLoading(false); }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault(); if (!otpEmail.trim()) return;
    setOtpLoading(true); setOtpError("");
    try {
      const { data } = await api.post<{ message: string; maskedEmail: string }>(
        "/api/auth/student/send-otp", { email: otpEmail.trim() }
      );
      setPendingEmail(otpEmail.trim(), data.maskedEmail);
      router.push("/verify-otp");
    } catch (err: unknown) {
      setOtpError((err as any)?.response?.data?.message ?? "Failed to send OTP. Try again.");
    } finally { setOtpLoading(false); }
  };

  const inputBase: React.CSSProperties = {
    width: "100%", height: 50, padding: "0 16px",
    background: "#1a2235", border: "1.5px solid #1e2d45",
    borderRadius: 10, outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15, color: "#F0F4FF",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const Spinner = () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ animation: "sl-spin 0.8s linear infinite" }}>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );

  return (
    <>
      {/* ── Inject mobile styles directly into the document ── */}
      <style>{MOBILE_STYLES}</style>
      <style>{`@keyframes sl-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div className="sl-page-grid" style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        minHeight: "100vh", background: "#0A0E1A",
      }}>

        {/* ══ MOBILE-ONLY header (display:none on desktop via MOBILE_STYLES) ══ */}
        <div className="sl-mobile-top">
          <Link href="/" className="sl-mobile-logo">
            <span className="sl-mobile-logo-icon">🛡️</span>
            <span className="sl-mobile-logo-text">
              <span className="sl-mobile-logo-campus">Campus</span>
              <span className="sl-mobile-logo-connect">Connect</span>
            </span>
          </Link>
          <h1 className="sl-mobile-heading">Welcome back 👋</h1>
          <p className="sl-mobile-sub">Access your campus marketplace securely.</p>
        </div>

        {/* ══ Left illustration panel — hidden on mobile ══ */}
        <div className="sl-left-panel">
          <AuthLeftPanel />
        </div>

        {/* ══ Right form panel ══ */}
        <div className="sl-right-panel" style={{
          display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "60px 72px",
          background: "#111827", position: "relative", overflow: "hidden",
        }}>
          {/* decorative blob */}
          <div className="sl-blob" aria-hidden style={{
            position: "absolute", top: "10%", right: "-10%",
            width: 280, height: 280,
            background: "radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 65%)",
            pointerEvents: "none",
          }} />

          {/* Desktop logo — hidden on mobile */}
          <Link href="/" className="sl-desktop-logo" style={{ textDecoration: "none", marginBottom: 40, display: "inline-flex" }}>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "#F0F4FF" }}>Campus</span>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "#4F8EF7" }}>Connect</span>
          </Link>

          {/* ── Mobile form body ── */}
          <div className="sl-form-body">

            {showVerification ? (
              /* ── Email verification OTP entry ── */
              <div className="sl-form-card">
                <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 800, color: "#F0F4FF", marginBottom: 8 }}>
                  Verify Your Email
                </h2>
                <p style={{ color: "#9CA3AF", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                  6-digit code sent to <strong style={{ color: "#4F8EF7" }}>{maskedEmail}</strong>
                </p>

                {verificationError && (
                  <div style={{
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#EF4444",
                    marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
                  }}>
                    ⚠️ {verificationError}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, margin: "24px 0 16px" }}>
                    {otp.map((digit, idx) => (
                      <input key={idx}
                        ref={(el) => { if (el) otpInputsRef.current[idx] = el; }}
                        type="text" maxLength={1} value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={idx === 0 ? handleOtpPaste : undefined}
                        disabled={verifying} inputMode="numeric" pattern="[0-9]*" autoFocus={idx === 0}
                        style={{
                          width: "100%", maxWidth: 52, height: 60,
                          background: "#1a2235", border: "1.5px solid #1e2d45", borderRadius: 12,
                          color: "#F0F4FF", fontSize: 26, fontWeight: 800, textAlign: "center",
                          outline: "none", boxSizing: "border-box",
                        }}
                      />
                    ))}
                  </div>
                  <button type="submit" disabled={otp.join("").length < 6 || verifying} style={{
                    width: "100%", height: 50, borderRadius: 9999,
                    background: otp.join("").length === 6 ? "#4F8EF7" : "#1a2235",
                    border: "none", cursor: otp.join("").length === 6 ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 700,
                    color: otp.join("").length === 6 ? "#fff" : "#6B7280",
                    boxShadow: otp.join("").length === 6 ? "0 4px 16px rgba(79,142,247,0.35)" : "none",
                    marginTop: 20,
                  }}>
                    {verifying ? <><Spinner /> Verifying…</> : <>Complete Verification →</>}
                  </button>
                </form>

                <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "#6B7280" }}>
                  {resendTimer > 0
                    ? <span>Resend in <strong style={{ color: "#F0F4FF" }}>{resendTimer}s</strong></span>
                    : <button type="button" onClick={handleResendOtp} disabled={!canResend}
                        style={{ background: "none", border: "none", color: "#4F8EF7", cursor: "pointer", fontWeight: 600 }}>
                        Resend Code
                      </button>
                  }
                </div>
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <button type="button" onClick={() => setShowVerification(false)}
                    style={{ background: "none", border: "none", color: "#6B7280", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
                    ← Back to login
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop heading — hidden on mobile */}
                <h1 className="sl-desktop-heading" style={{
                  fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800,
                  letterSpacing: "-1px", color: "#F0F4FF", marginBottom: 8,
                }}>
                  Welcome back 👋
                </h1>
                <p className="sl-desktop-sub" style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 15,
                  color: "#9CA3AF", marginBottom: 28, lineHeight: 1.6,
                }}>
                  Sign in to your college marketplace
                </p>

                {/* ── Form card (border appears only on mobile via CSS) ── */}
                <div className="sl-form-card">

                  {/* Tabs */}
                  <div className="sl-tabs-wrap" style={{
                    display: "flex", background: "#1a2235",
                    borderRadius: 10, padding: 4, marginBottom: 28,
                    border: "1px solid #1e2d45",
                  }}>
                    {(["password", "otp"] as const).map((mode) => (
                      <button key={mode}
                        className={`sl-tab-btn${loginMode === mode ? " sl-tab-active" : ""}`}
                        onClick={() => { setLoginMode(mode); setPwError(""); setOtpError(""); setIsPending(false); }}
                        style={{
                          flex: 1, height: 38, borderRadius: 8, border: "none",
                          fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
                          cursor: "pointer",
                          background: loginMode === mode ? "#4F8EF7" : "transparent",
                          color: loginMode === mode ? "#fff" : "#6B7280",
                          transition: "all 0.2s",
                        }}
                      >
                        {mode === "password" ? "Password Login" : "OTP Login"}
                      </button>
                    ))}
                  </div>

                  {/* Pending banner */}
                  {isPending && (
                    <div style={{
                      background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)",
                      borderRadius: 10, padding: "12px 16px",
                      display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20,
                    }}>
                      <span style={{ fontSize: 16 }}>⏳</span>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F59E0B", lineHeight: 1.5 }}>
                        Your account is pending admin approval. You will be notified by email.
                      </p>
                    </div>
                  )}

                  {/* ── Password form ── */}
                  {loginMode === "password" && (
                    <form onSubmit={handlePasswordLogin}>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{
                          display: "block", marginBottom: 8, fontFamily: "'DM Sans', sans-serif",
                          fontSize: 11, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "#6B7280",
                        }}>Email Address</label>
                        <div style={{ position: "relative" }}>
                          <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6B7280", pointerEvents: "none" }} />
                          <input id="student-email" type="email" value={pwForm.email}
                            onChange={e => setPwForm({ ...pwForm, email: e.target.value })}
                            onFocus={e => (e.target.style.borderColor = "#4F8EF7")}
                            onBlur={e => (e.target.style.borderColor = "#1e2d45")}
                            placeholder="student@university.edu" required
                            style={{ ...inputBase, paddingLeft: 40 }} />
                        </div>
                      </div>

                      <div style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <label style={{
                            fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
                            letterSpacing: "1.2px", textTransform: "uppercase", color: "#6B7280",
                          }}>Password</label>
                          <Link href="/forgot-password" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#4F8EF7", textDecoration: "none" }}>
                            Forgot password?
                          </Link>
                        </div>
                        <div style={{ position: "relative" }}>
                          <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6B7280", pointerEvents: "none" }} />
                          <input id="student-password" type={showPassword ? "text" : "password"} value={pwForm.password}
                            onChange={e => setPwForm({ ...pwForm, password: e.target.value })}
                            onFocus={e => (e.target.style.borderColor = "#4F8EF7")}
                            onBlur={e => (e.target.style.borderColor = "#1e2d45")}
                            placeholder="••••••••••" required
                            style={{ ...inputBase, paddingLeft: 40, paddingRight: 44 }} />
                          <button type="button" onClick={() => setShowPassword(v => !v)}
                            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6B7280", display: "flex", alignItems: "center", padding: 4 }}>
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {pwError && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 16 }}>
                          <AlertCircle size={13} style={{ color: "#EF4444", flexShrink: 0, marginTop: 1 }} />
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#EF4444", lineHeight: 1.5 }}>{pwError}</p>
                        </div>
                      )}

                      <button id="password-login-btn" className="sl-submit-btn" type="submit"
                        disabled={pwLoading || !pwForm.email.trim() || !pwForm.password}
                        style={{
                          width: "100%", height: 50, borderRadius: 9999,
                          background: (pwForm.email.trim() && pwForm.password) ? "#4F8EF7" : "#1a2235",
                          border: "none", cursor: (pwForm.email.trim() && pwForm.password) ? "pointer" : "not-allowed",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
                          color: (pwForm.email.trim() && pwForm.password) ? "#fff" : "#6B7280",
                          transition: "all 0.2s",
                          boxShadow: (pwForm.email.trim() && pwForm.password) ? "0 4px 16px rgba(79,142,247,0.35)" : "none",
                        }}>
                        {pwLoading ? <><Spinner /> Signing in…</> : <>Sign In &nbsp;<ArrowRight size={16} /></>}
                      </button>
                    </form>
                  )}

                  {/* ── OTP form ── */}
                  {loginMode === "otp" && (
                    <form onSubmit={handleSendOtp}>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{
                          display: "block", marginBottom: 8, fontFamily: "'DM Sans', sans-serif",
                          fontSize: 11, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "#6B7280",
                        }}>Enrollment / Any Email</label>
                        <div style={{ position: "relative" }}>
                          <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6B7280", pointerEvents: "none" }} />
                          <input id="otp-email" type="email" value={otpEmail}
                            onChange={e => setOtpEmail(e.target.value)}
                            onFocus={e => (e.target.style.borderColor = "#4F8EF7")}
                            onBlur={e => (e.target.style.borderColor = "#1e2d45")}
                            placeholder="cse.230840131027@gmail.com" required
                            style={{ ...inputBase, paddingLeft: 40 }} />
                        </div>
                      </div>

                      <div style={{
                        background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.2)",
                        borderRadius: 10, padding: "14px 16px", display: "flex", gap: 10, marginBottom: 20,
                      }}>
                        <Info size={15} style={{ color: "#4F8EF7", flexShrink: 0, marginTop: 2 }} />
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF", lineHeight: 1.6 }}>
                          <strong style={{ color: "#4F8EF7" }}>OTP login</strong> is only for existing accounts. New students must register first.
                        </p>
                      </div>

                      {otpError && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 16 }}>
                          <AlertCircle size={13} style={{ color: "#EF4444", flexShrink: 0, marginTop: 1 }} />
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#EF4444", lineHeight: 1.5 }}>{otpError}</p>
                        </div>
                      )}

                      <button id="send-otp-btn" className="sl-submit-btn" type="submit"
                        disabled={otpLoading || !otpEmail.trim()}
                        style={{
                          width: "100%", height: 50, borderRadius: 9999,
                          background: otpEmail.trim() ? "#4F8EF7" : "#1a2235",
                          border: "none", cursor: otpEmail.trim() ? "pointer" : "not-allowed",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
                          color: otpEmail.trim() ? "#fff" : "#6B7280",
                          transition: "all 0.2s",
                          boxShadow: otpEmail.trim() ? "0 4px 16px rgba(79,142,247,0.35)" : "none",
                        }}>
                        {otpLoading ? <><Spinner /> Sending OTP…</> : <>Send OTP &nbsp;<ArrowRight size={16} /></>}
                      </button>
                    </form>
                  )}

                </div>{/* end sl-form-card */}

                {/* OR divider — hidden on mobile */}
                <div className="sl-divider" style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "#1e2d45" }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6B7280" }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: "#1e2d45" }} />
                </div>

                {/* Register link */}
                <div className="sl-register-box" style={{
                  background: "rgba(79,142,247,0.04)", border: "1px solid rgba(79,142,247,0.15)",
                  borderRadius: 10, padding: "14px 16px", textAlign: "center", marginBottom: 16,
                }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF", marginBottom: 8 }}>
                    New to CampusConnect?
                  </p>
                  <Link href="/register" className="sl-register-link" style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
                    color: "#4F8EF7", textDecoration: "none",
                  }}>
                    Create a Student Account →
                  </Link>
                </div>

                {/* Admin link */}
                <p className="sl-admin-link-wrap" style={{ textAlign: "center", marginBottom: 0 }}>
                  <Link href="/admin/login" className="sl-admin-link" style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                    color: "#6B7280", textDecoration: "none",
                  }}>
                    College Admin? Login here →
                  </Link>
                </p>
              </>
            )}

          </div>{/* end sl-form-body */}
        </div>{/* end sl-right-panel */}

      </div>
    </>
  );
}
