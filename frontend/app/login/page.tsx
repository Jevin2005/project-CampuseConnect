"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Info } from "lucide-react";

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
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 12,
              color: "#A78BFA", marginTop: 6, fontWeight: 700,
            }}>
              Video Lecture
            </div>
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
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 12,
              color: "#10B981", marginTop: 6, fontWeight: 700,
            }}>
              Notes PDF
            </div>
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
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 12,
              color: "#4F8EF7", marginTop: 6, fontWeight: 700,
            }}>
              Laptop — ₹28,000
            </div>
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
              <div style={{
                fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800,
                color: "#F7C948",
              }}>
                {s.num}
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                color: "#6B7280", marginTop: 3,
              }}>
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
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // simulate API
    router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
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
          <span style={{
            fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "#F0F4FF",
          }}>Campus</span>
          <span style={{
            fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "#4F8EF7",
          }}>Connect</span>
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
          color: "#9CA3AF", marginBottom: 36, lineHeight: 1.6,
        }}>
          Sign in to your college marketplace
        </p>

        <form onSubmit={handleSubmit}>
          {/* email field */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: "block", marginBottom: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11, fontWeight: 700,
              letterSpacing: "1.2px", textTransform: "uppercase",
              color: "#6B7280",
            }}>
              Enrollment Email
            </label>
            <input
              id="enrollment-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="your.name@college.edu"
              required
              style={{
                width: "100%", height: 50, padding: "0 16px",
                background: "#1a2235",
                border: focused
                  ? "1.5px solid #4F8EF7"
                  : "1.5px solid #1e2d45",
                borderRadius: 10, outline: "none",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15, color: "#F0F4FF",
                boxShadow: focused ? "0 0 0 3px rgba(79,142,247,0.15)" : "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxSizing: "border-box",
              }}
            />
            <p style={{
              marginTop: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12, color: "#6B7280",
            }}>
              Use your official college-issued email address
            </p>
          </div>

          {/* hint card */}
          <div style={{
            background: "rgba(79,142,247,0.06)",
            border: "1px solid rgba(79,142,247,0.2)",
            borderRadius: 10, padding: "14px 16px",
            display: "flex", gap: 10, marginBottom: 28,
          }}>
            <Info size={15} style={{ color: "#4F8EF7", flexShrink: 0, marginTop: 2 }} />
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, color: "#9CA3AF", lineHeight: 1.6,
            }}>
              <strong style={{ color: "#4F8EF7" }}>New here?</strong> Your account will be created
              automatically after your college admin approves you.
            </p>
          </div>

          {/* submit */}
          <button
            id="send-otp-btn"
            type="submit"
            disabled={loading || !email.trim()}
            style={{
              width: "100%", height: 50, borderRadius: 9999,
              background: email.trim() ? "#4F8EF7" : "#1a2235",
              border: "none", cursor: email.trim() ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, fontFamily: "'DM Sans', sans-serif",
              fontSize: 15, fontWeight: 700,
              color: email.trim() ? "#fff" : "#6B7280",
              transition: "all 0.2s",
              boxShadow: email.trim() ? "0 4px 16px rgba(79,142,247,0.35)" : "none",
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                  style={{ animation: "spin 0.8s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3"
                    strokeLinecap="round" />
                </svg>
                Sending OTP…
              </span>
            ) : (
              <>Send OTP <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        {/* divider */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, margin: "24px 0",
        }}>
          <div style={{ flex: 1, height: 1, background: "#1e2d45" }} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12, color: "#6B7280",
          }}>
            OR
          </span>
          <div style={{ flex: 1, height: 1, background: "#1e2d45" }} />
        </div>

        {/* admin link */}
        <p style={{ textAlign: "center", marginBottom: 24 }}>
          <Link
            href="/admin/login"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, fontWeight: 600, color: "#4F8EF7",
              textDecoration: "none",
            }}
          >
            College Admin? Login here →
          </Link>
        </p>

        {/* terms */}
        <p style={{
          textAlign: "center",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12, color: "#6B7280", lineHeight: 1.6,
        }}>
          By continuing, you agree to our{" "}
          <Link href="/terms" style={{ color: "#4F8EF7", textDecoration: "none" }}>
            Terms of Service
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
