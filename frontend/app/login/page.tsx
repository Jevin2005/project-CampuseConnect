"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Info, AlertCircle, Eye, EyeOff, Mail, Lock } from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

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
      {/* blobs */}
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

      {/* stacked product cards illustration */}
      <div style={{ position: "relative", height: 220, marginBottom: 48 }}>
        {/* card 3 - back */}
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
        {/* card 2 - middle */}
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
        {/* card 1 - front */}
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

      {/* heading */}
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
        fontSize: 14, color: "#6B7280", lineHeight: 1.65,
        marginBottom: 36,
      }}>
        Over 2,840 products listed by students just like you.
      </p>

      {/* stats */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {[
          { num: "1,470", label: "Students" },
          { num: "2,840", label: "Products" },
          { num: "12+",   label: "Colleges" },
        ].map((s, i) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ textAlign: "center", padding: "0 20px" }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: "#F7C948" }}>
                {s.num}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6B7280", marginTop: 3 }}>
                {s.label}
              </div>
            </div>
            {i < 2 && <div style={{ width: 1, height: 32, background: "#1e2d45" }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ S1. STUDENT LOGIN PAGE ══════════════════════════════════════ */
export default function StudentLoginPage() {
  const router = useRouter();
  const { setPendingEmail, setAuth } = useAuthStore();

  // Tab: "password" (primary) or "otp" (secondary/passwordless)
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");

  // Password login state
  const [pwForm, setPwForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [isPending, setIsPending] = useState(false);

  // OTP login state
  const [otpEmail, setOtpEmail] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  /* ── Password Login ── */
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setIsPending(false);
    if (!pwForm.email.trim() || !pwForm.password) return;
    setPwLoading(true);
    try {
      const { data } = await api.post<{
        status: "APPROVED" | "PENDING";
        accessToken?: string;
        user?: import("@/store/authStore").AuthUser;
      }>("/api/auth/student/login", {
        email: pwForm.email.trim(),
        password: pwForm.password,
      });

      if (data.status === "APPROVED" && data.accessToken && data.user) {
        setAuth(data.accessToken, data.user, "STUDENT", data.user.collegeId);
        router.push("/marketplace");
      }
    } catch (err: unknown) {
      const resp = (err as { response?: { status?: number; data?: { message?: string } } })?.response;
      if (resp?.status === 403) {
        setIsPending(true);
      } else {
        setPwError(resp?.data?.message ?? "Invalid email or password.");
      }
    } finally {
      setPwLoading(false);
    }
  };

  /* ── OTP Login ── */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail.trim()) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      const { data } = await api.post<{ message: string; maskedEmail: string }>(
        "/api/auth/student/send-otp",
        { email: otpEmail.trim() }
      );
      setPendingEmail(otpEmail.trim(), data.maskedEmail);
      router.push("/verify-otp");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to send OTP. Please try again.";
      setOtpError(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  const inputBase: React.CSSProperties = {
    width: "100%", height: 50, padding: "0 16px",
    background: "#1a2235",
    border: "1.5px solid #1e2d45",
    borderRadius: 10, outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15, color: "#F0F4FF",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr",
      minHeight: "100vh", background: "#0A0E1A",
    }}>
      <AuthLeftPanel />

      {/* right — form */}
      <div style={{
        display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "60px 72px",
        background: "#111827", position: "relative", overflow: "hidden",
      }}>
        <div aria-hidden style={{
          position: "absolute", top: "10%", right: "-10%",
          width: 280, height: 280,
          background: "radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 65%)",
          pointerEvents: "none",
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
          Welcome back 👋
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 15,
          color: "#9CA3AF", marginBottom: 28, lineHeight: 1.6,
        }}>
          Sign in to your college marketplace
        </p>

        {/* ── Mode Tabs ── */}
        <div style={{
          display: "flex", background: "#1a2235",
          borderRadius: 10, padding: 4, marginBottom: 28,
          border: "1px solid #1e2d45",
        }}>
          {(["password", "otp"] as const).map((mode) => (
            <button
              key={mode}
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
              {mode === "password" ? "🔑 Password" : "📱 OTP Login"}
            </button>
          ))}
        </div>

        {/* ── PENDING BANNER ── */}
        {isPending && (
          <div style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 10, padding: "12px 16px",
            display: "flex", alignItems: "flex-start", gap: 10,
            marginBottom: 20,
          }}>
            <span style={{ fontSize: 16 }}>⏳</span>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F59E0B", lineHeight: 1.5 }}>
              Your account is pending approval from your college admin. You'll be notified by email once approved.
            </p>
          </div>
        )}

        {/* ══ PASSWORD LOGIN FORM ══ */}
        {loginMode === "password" && (
          <form onSubmit={handlePasswordLogin}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: "block", marginBottom: 8,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11, fontWeight: 700,
                letterSpacing: "1.2px", textTransform: "uppercase",
                color: "#6B7280",
              }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{
                  position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                  color: "#6B7280", pointerEvents: "none",
                }} />
                <input
                  id="student-email"
                  type="email"
                  value={pwForm.email}
                  onChange={e => setPwForm({ ...pwForm, email: e.target.value })}
                  onFocus={e => (e.target.style.borderColor = "#4F8EF7")}
                  onBlur={e => (e.target.style.borderColor = "#1e2d45")}
                  placeholder="your.email@example.com"
                  required
                  style={{ ...inputBase, paddingLeft: 40 }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: "1.2px", textTransform: "uppercase",
                  color: "#6B7280",
                }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12, color: "#4F8EF7", textDecoration: "none",
                }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{
                  position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                  color: "#6B7280", pointerEvents: "none",
                }} />
                <input
                  id="student-password"
                  type={showPassword ? "text" : "password"}
                  value={pwForm.password}
                  onChange={e => setPwForm({ ...pwForm, password: e.target.value })}
                  onFocus={e => (e.target.style.borderColor = "#4F8EF7")}
                  onBlur={e => (e.target.style.borderColor = "#1e2d45")}
                  placeholder="••••••••••"
                  required
                  style={{ ...inputBase, paddingLeft: 40, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "#6B7280", display: "flex", alignItems: "center",
                    padding: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {pwError && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 16 }}>
                <AlertCircle size={13} style={{ color: "#EF4444", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#EF4444", lineHeight: 1.5 }}>
                  {pwError}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              id="password-login-btn"
              type="submit"
              disabled={pwLoading || !pwForm.email.trim() || !pwForm.password}
              style={{
                width: "100%", height: 50, borderRadius: 9999,
                background: (pwForm.email.trim() && pwForm.password) ? "#4F8EF7" : "#1a2235",
                border: "none", cursor: (pwForm.email.trim() && pwForm.password) ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, fontFamily: "'DM Sans', sans-serif",
                fontSize: 15, fontWeight: 700,
                color: (pwForm.email.trim() && pwForm.password) ? "#fff" : "#6B7280",
                transition: "all 0.2s",
                boxShadow: (pwForm.email.trim() && pwForm.password) ? "0 4px 16px rgba(79,142,247,0.35)" : "none",
              }}
            >
              {pwLoading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        )}

        {/* ══ OTP LOGIN FORM ══ */}
        {loginMode === "otp" && (
          <form onSubmit={handleSendOtp}>
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: "block", marginBottom: 8,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11, fontWeight: 700,
                letterSpacing: "1.2px", textTransform: "uppercase",
                color: "#6B7280",
              }}>
                Enrollment / Any Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{
                  position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                  color: "#6B7280", pointerEvents: "none",
                }} />
                <input
                  id="otp-email"
                  type="email"
                  value={otpEmail}
                  onChange={e => setOtpEmail(e.target.value)}
                  onFocus={e => (e.target.style.borderColor = "#4F8EF7")}
                  onBlur={e => (e.target.style.borderColor = "#1e2d45")}
                  placeholder="cse.230840131027@gmail.com"
                  required
                  style={{ ...inputBase, paddingLeft: 40 }}
                />
              </div>
            </div>

            {/* hint */}
            <div style={{
              background: "rgba(79,142,247,0.06)",
              border: "1px solid rgba(79,142,247,0.2)",
              borderRadius: 10, padding: "14px 16px",
              display: "flex", gap: 10, marginBottom: 20,
            }}>
              <Info size={15} style={{ color: "#4F8EF7", flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF", lineHeight: 1.6 }}>
                <strong style={{ color: "#4F8EF7" }}>OTP login</strong> is only available for existing registered accounts.
                New students must register first.
              </p>
            </div>

            {otpError && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 16 }}>
                <AlertCircle size={13} style={{ color: "#EF4444", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#EF4444", lineHeight: 1.5 }}>
                  {otpError}
                </p>
              </div>
            )}

            <button
              id="send-otp-btn"
              type="submit"
              disabled={otpLoading || !otpEmail.trim()}
              style={{
                width: "100%", height: 50, borderRadius: 9999,
                background: otpEmail.trim() ? "#4F8EF7" : "#1a2235",
                border: "none", cursor: otpEmail.trim() ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, fontFamily: "'DM Sans', sans-serif",
                fontSize: 15, fontWeight: 700,
                color: otpEmail.trim() ? "#fff" : "#6B7280",
                transition: "all 0.2s",
                boxShadow: otpEmail.trim() ? "0 4px 16px rgba(79,142,247,0.35)" : "none",
              }}
            >
              {otpLoading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Sending OTP…
                </span>
              ) : (
                <>Send OTP <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        )}

        {/* divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#1e2d45" }} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6B7280" }}>OR</span>
          <div style={{ flex: 1, height: 1, background: "#1e2d45" }} />
        </div>

        {/* Register Link */}
        <div style={{
          background: "rgba(79,142,247,0.04)",
          border: "1px solid rgba(79,142,247,0.15)",
          borderRadius: 10, padding: "14px 16px",
          textAlign: "center", marginBottom: 16,
        }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF", marginBottom: 8 }}>
            New to CampusConnect?
          </p>
          <Link
            href="/register"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, fontWeight: 700, color: "#4F8EF7",
              textDecoration: "none",
            }}
          >
            Create a Student Account →
          </Link>
        </div>

        {/* admin link */}
        <p style={{ textAlign: "center", marginBottom: 0 }}>
          <Link
            href="/admin/login"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, fontWeight: 600, color: "#6B7280",
              textDecoration: "none",
            }}
          >
            College Admin? Login here →
          </Link>
        </p>

        <style jsx>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @media (max-width: 768px) {
            div[style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
