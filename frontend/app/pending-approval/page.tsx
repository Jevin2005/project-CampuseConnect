"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, Circle, AlertTriangle, Info, ArrowLeft, Home } from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

/* ─── progress step data ──────────────────────────────────────── */
const STEPS = [
  {
    label: "Email Verified",
    icon: "check",
    status: "done",
    connectorStyle: "solid",
  },
  {
    label: "OTP Confirmed",
    icon: "check",
    status: "done",
    connectorStyle: "solid",
  },
  {
    label: "Admin Reviewing",
    icon: "spin",
    status: "active",
    connectorStyle: "dashed",
  },
  {
    label: "Access Granted",
    icon: "empty",
    status: "pending",
    connectorStyle: null,
  },
];

const WHAT_NEXT = [
  "Your college admin will review your enrollment email",
  "Typical approval time: 24–48 hours",
  "You'll receive an email notification when approved",
  "No action needed from your side",
];

/* ═══ PAGE ════════════════════════════════════════════════════════ */
export default function PendingApprovalPage() {
  const router = useRouter();
  const { pendingEmail, setAuth } = useAuthStore();
  const [approvedToast, setApprovedToast] = useState(false);

  /**
   * Poll GET /api/auth/student/approval-status every 30 seconds.
   * Spec: authentication.md § S3 — "Poll GET … every 30 seconds"
   */
  useEffect(() => {
    if (!pendingEmail) return;

    const checkApproval = async () => {
      try {
        const { data } = await api.get<{
          status: "PENDING" | "APPROVED";
          accessToken?: string;
          user?: import("@/store/authStore").AuthUser;
        }>("/api/auth/student/approval-status", {
          params: { email: pendingEmail },
        });

        if (data.status === "APPROVED" && data.accessToken && data.user) {
          setAuth(data.accessToken, data.user, "STUDENT", data.user.collegeId);
          setApprovedToast(true);
          setTimeout(() => router.push("/marketplace"), 1800);
        }
      } catch {
        // silently ignore poll errors; keep polling
      }
    };

    // Initial check + 30s interval
    checkApproval();
    const interval = setInterval(checkApproval, 30_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingEmail]);

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0E1A",
      display: "flex", flexDirection: "column",
      alignItems: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* background blobs */}
      <div aria-hidden style={{
        position: "fixed", top: "5%", left: "50%", transform: "translateX(-50%)",
        width: 700, height: 400,
        background: "radial-gradient(ellipse, rgba(79,142,247,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div aria-hidden style={{
        position: "fixed", bottom: "10%", right: "10%",
        width: 300, height: 300,
        background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* logo */}
      <div style={{
        width: "100%", padding: "24px 40px",
        borderBottom: "1px solid #1e2d45",
        display: "flex", alignItems: "center",
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "inline-flex" }}>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "#F0F4FF" }}>Campus</span>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "#4F8EF7" }}>Connect</span>
        </Link>
      </div>

      {/* main content area */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "60px 24px",
        width: "100%", maxWidth: 640,
        margin: "0 auto",
      }}>
        {/* hourglass icon with pulse */}
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(79,142,247,0.1)",
          border: "2px solid rgba(79,142,247,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, marginBottom: 24,
          animation: "pulse-glow 2.5s ease-in-out infinite",
          boxShadow: "0 0 0 0 rgba(79,142,247,0.3)",
        }}>
          ⏳
        </div>

        {/* heading */}
        <h1 style={{
          fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800,
          letterSpacing: "-1px", color: "#F0F4FF",
          marginBottom: 10, textAlign: "center",
        }}>
          Approval Pending
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 15,
          color: "#9CA3AF", marginBottom: 48, textAlign: "center",
          lineHeight: 1.6,
        }}>
          {pendingEmail ? (
            <>
              We sent an OTP to{" "}
              <strong style={{ color: "#F0F4FF" }}>{pendingEmail}</strong>.
              <br />Your request is under review by your college admin.
            </>
          ) : (
            "Your request has been submitted to your college admin."
          )}
        </p>

        {/* approved toast */}
        {approvedToast && (
          <div style={{
            position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
            background: "#10B981", color: "#fff",
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
            padding: "12px 28px", borderRadius: 9999,
            boxShadow: "0 4px 24px rgba(16,185,129,0.4)",
            zIndex: 9999,
            animation: "fade-in 0.3s ease",
          }}>
            ✅ Approved! Redirecting to marketplace…
          </div>
        )}

        {/* vertical stepper */}
        <div style={{ width: "100%", marginBottom: 40 }}>
          {STEPS.map((step, i) => (
            <div key={step.label} style={{ display: "flex", gap: 16 }}>
              {/* spine */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* circle */}
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  flexShrink: 0,
                  background:
                    step.status === "done"   ? "#10B981" :
                    step.status === "active" ? "rgba(79,142,247,0.15)" :
                    "rgba(107,114,128,0.12)",
                  border:
                    step.status === "done"   ? "2px solid #10B981" :
                    step.status === "active" ? "2px solid #4F8EF7" :
                    "2px solid rgba(107,114,128,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {step.icon === "check" && (
                    <CheckCircle size={18} style={{ color: "#fff" }} />
                  )}
                  {step.icon === "spin" && (
                    <Loader2 size={18} style={{
                      color: "#4F8EF7",
                      animation: "spin 1.2s linear infinite",
                    }} />
                  )}
                  {step.icon === "empty" && (
                    <Circle size={14} style={{ color: "#6B7280" }} />
                  )}
                </div>

                {/* connector line */}
                {i < STEPS.length - 1 && (
                  <div style={{
                    width: 2,
                    height: 40,
                    background:
                      step.status === "done"   ? "#10B981" :
                      step.status === "active" ? "rgba(79,142,247,0.35)" :
                      "rgba(107,114,128,0.15)",
                    marginTop: 3, marginBottom: 3,
                    backgroundImage:
                      step.connectorStyle === "dashed"
                        ? `repeating-linear-gradient(to bottom, ${
                            step.status === "active"
                              ? "rgba(79,142,247,0.5)"
                              : "rgba(107,114,128,0.3)"
                          } 0, ${
                            step.status === "active"
                              ? "rgba(79,142,247,0.5)"
                              : "rgba(107,114,128,0.3)"
                          } 4px, transparent 4px, transparent 8px)`
                        : "none",
                  }} />
                )}
              </div>

              {/* label */}
              <div style={{ paddingBottom: i < STEPS.length - 1 ? 0 : 0, minHeight: 36 + 40, display: "flex", alignItems: "flex-start" }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15, fontWeight: step.status === "pending" ? 400 : 600,
                  color:
                    step.status === "done"    ? "#10B981" :
                    step.status === "active"  ? "#4F8EF7" :
                    "#6B7280",
                  paddingTop: 8,
                }}>
                  {step.label}
                  {step.status === "active" && (
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12, color: "#6B7280", fontWeight: 400,
                      display: "block", marginTop: 2,
                    }}>
                      Waiting for admin response…
                    </span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* what happens next card */}
        <div style={{
          width: "100%",
          background: "#111827",
          border: "1px solid rgba(79,142,247,0.2)",
          borderRadius: 14, padding: "24px",
          marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Info size={16} style={{ color: "#4F8EF7", flexShrink: 0 }} />
            <h3 style={{
              fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700,
              color: "#F0F4FF",
            }}>
              What happens next?
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {WHAT_NEXT.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#4F8EF7", marginTop: 7, flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14, color: "#9CA3AF", lineHeight: 1.6,
                }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* warning card */}
        <div style={{
          width: "100%",
          background: "rgba(245,158,11,0.05)",
          border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: 14, padding: "20px 24px",
          display: "flex", gap: 12, marginBottom: 40,
          alignItems: "flex-start",
        }}>
          <AlertTriangle size={16} style={{ color: "#F59E0B", flexShrink: 0, marginTop: 2 }} />
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, color: "#9CA3AF", lineHeight: 1.65,
          }}>
            Make sure you used your <strong style={{ color: "#F59E0B" }}>official college enrollment email</strong>.
            Personal emails (gmail, yahoo) will be rejected by the admin.
          </p>
        </div>

        {/* action buttons */}
        <div style={{ display: "flex", gap: 12, width: "100%", flexWrap: "wrap" }}>
          <Link
            href="/login"
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, height: 48, borderRadius: 9999,
              border: "1.5px solid rgba(79,142,247,0.5)", color: "#4F8EF7",
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
              textDecoration: "none", background: "transparent", transition: "all 0.2s",
              minWidth: 180,
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(79,142,247,0.08)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <ArrowLeft size={14} />
            Use Different Email
          </Link>
          <Link
            href="/"
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, height: 48, borderRadius: 9999,
              border: "1.5px solid #1e2d45", color: "#6B7280",
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
              textDecoration: "none", background: "transparent", transition: "all 0.2s",
              minWidth: 180,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "#374151";
              e.currentTarget.style.color = "#9CA3AF";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#1e2d45";
              e.currentTarget.style.color = "#6B7280";
            }}
          >
            <Home size={14} />
            Back to Home
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(79,142,247,0.3); }
          50%       { box-shadow: 0 0 0 16px rgba(79,142,247,0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
