"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/StudentLayout";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import {
  ShieldCheck, Bell, Mail, Save, ChevronRight, TrendingUp, Package,
  ShoppingBag, Calendar, RefreshCw, User, Phone, Hash, School, Check,
  Copy, ExternalLink, Play, BookOpen, AlertCircle, Sparkles, Heart,
  DollarSign, X, Layers, PlusCircle, Lock, Key, Eye, EyeOff, CheckCircle2, Zap
} from "lucide-react";

interface StudentUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  enrollmentId?: string;
  collegeId?: string;
  collegeName?: string;
  collegeCode?: string;
  isEmailVerified: boolean;
  isApproved: boolean;
  createdAt: string;
}

interface MarketplaceProfile {
  user?: StudentUser;
  stats: {
    listed: number;
    activeListings: number;
    sold: number;
    purchased: number;
    revenue: number;
  };
  recentListings: {
    id: string;
    title: string;
    price: number;
    status: string;
    isApproved: boolean;
    views: number;
    images: string[];
    productType: string;
    digitalSubType?: string;
  }[];
  recentPurchases: {
    id: string;
    amount: number;
    createdAt: string;
    product: {
      id: string;
      title: string;
      images: string[];
      productType: string;
      digitalSubType?: string;
      price: number;
    };
  }[];
}

function initials(name: string) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();
}

function formatDate(d?: string) {
  if (!d) return "–";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch {
    return "–";
  }
}

function formatMonthYear(d?: string) {
  if (!d) return "–";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric"
    });
  } catch {
    return "–";
  }
}

const NOTIF_DEFS = [
  { id: "email_alerts", label: "Email Notifications", desc: "Receive order receipts and instant message alerts" },
  { id: "market_updates", label: "Marketplace Updates", desc: "Get notifications about price drops & relevant items" },
  { id: "drm_activity", label: "Security & DRM Alerts", desc: "Real-time alerts when your digital watermark is accessed" },
];

export default function ProfilePage() {
  const authUser = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);

  const [profile, setProfile] = useState<MarketplaceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit modal / drawer states
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEnrollment, setEditEnrollment] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [copied, setCopied] = useState(false);

  // Password update modal states
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordMode, setPasswordMode] = useState<"current" | "otp">("current");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpDevCode, setOtpDevCode] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Dynamic live password strength analysis
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: "None", color: "#64748B", width: "0%" };
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "#EF4444", width: "25%" };
    if (score === 2) return { score: 2, label: "Fair", color: "#F59E0B", width: "50%" };
    if (score === 3) return { score: 3, label: "Good", color: "#3B82F6", width: "75%" };
    return { score: 4, label: "Strong", color: "#10B981", width: "100%" };
  }, [newPassword]);

  // Match validation helper
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return newPassword === confirmPassword;
  }, [newPassword, confirmPassword]);

  // Send verification OTP to student email
  const handleSendProfileOtp = async () => {
    setSendingOtp(true);
    setPasswordError("");
    try {
      const res = await api.post<{ success: boolean; message: string; maskedEmail: string; devOtp?: string }>("/api/marketplace/me/password/send-otp");
      setOtpSent(true);
      if (res.data?.devOtp) {
        setOtpDevCode(res.data.devOtp);
        setOtpCode(res.data.devOtp);
      }
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || "Failed to send verification code. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle saving new password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordMode === "otp") {
      if (!otpCode.trim() || otpCode.trim().length !== 6) {
        setPasswordError("Please enter the 6-digit verification code sent to your email.");
        return;
      }
    } else {
      if (!currentPassword) {
        setPasswordError("Please enter your current password, or click 'Forgot current?' to verify via email OTP.");
        return;
      }
    }

    if (!newPassword || newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match. Please re-enter and verify.");
      return;
    }
    if (passwordMode === "current" && currentPassword && currentPassword === newPassword) {
      setPasswordError("New password cannot be identical to your current password.");
      return;
    }

    setSavingPassword(true);
    setPasswordError("");

    try {
      const payload: any = {
        newPassword: newPassword.trim(),
      };
      if (passwordMode === "otp") {
        payload.otp = otpCode.trim();
      } else {
        payload.currentPassword = currentPassword.trim();
      }

      const res = await api.put("/api/marketplace/me/password", payload);

      setChangePasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOtpCode("");
      setOtpSent(false);
      setPasswordMode("current");
      setSuccessToast(res.data?.message || "Password updated successfully!");
      setTimeout(() => setSuccessToast(""), 4000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || "Failed to update password. Please check your inputs.");
    } finally {
      setSavingPassword(false);
    }
  };

  // Portfolio tab state
  const [activeTab, setActiveTab] = useState<"listings" | "purchases">("listings");

  // Notification preferences (persisted in localStorage)
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    email_alerts: true,
    market_updates: true,
    drm_activity: false
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("cc_notif_prefs");
        if (saved) setNotifs(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const handleToggleNotif = (id: string) => {
    setNotifs(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("cc_notif_prefs", JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  const fetchProfile = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get("/api/marketplace/me");
      setProfile(res.data);
      if (res.data?.user) {
        setEditName(res.data.user.name || "");
        setEditPhone(res.data.user.phone || "");
        setEditEnrollment(res.data.user.enrollmentId || "");
        // Keep auth store updated
        updateUser({
          name: res.data.user.name,
          phone: res.data.user.phone,
          enrollmentId: res.data.user.enrollmentId,
          collegeName: res.data.user.collegeName,
          collegeCode: res.data.user.collegeCode,
        });
      }
    } catch (err: any) {
      console.error("Failed to fetch marketplace profile:", err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, [updateUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handle saving profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setErrorMsg("Display name cannot be blank.");
      return;
    }
    setSaving(true);
    setErrorMsg("");

    try {
      const res = await api.put("/api/marketplace/me", {
        name: editName.trim(),
        phone: editPhone.trim(),
        enrollmentId: editEnrollment.trim(),
      });

      if (res.data?.user) {
        setProfile(prev => prev ? { ...prev, user: res.data.user } : null);
        updateUser({
          name: res.data.user.name,
          phone: res.data.user.phone,
          enrollmentId: res.data.user.enrollmentId,
        });
      }

      setEditing(false);
      setSuccessToast("Profile details updated successfully!");
      setTimeout(() => setSuccessToast(""), 3500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyEmail = () => {
    const em = profile?.user?.email || authUser?.email;
    if (em) {
      navigator.clipboard.writeText(em);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Student details resolution
  const userObj = profile?.user;
  const displayName = userObj?.name || authUser?.name || "Verified Student";
  const displayEmail = userObj?.email || authUser?.email || "";
  const collegeName = userObj?.collegeName || authUser?.collegeName || "Campus College";
  const collegeCode = userObj?.collegeCode || "";
  const displayPhone = userObj?.phone || "Not set";
  const displayEnrollment = userObj?.enrollmentId || "Not set";
  const memberSince = userObj?.createdAt ? formatMonthYear(userObj.createdAt) : "Active Member";

  const activeListings = useMemo(() => {
    return (profile?.recentListings || []).filter(l => l.status === "active");
  }, [profile?.recentListings]);

  const recentPurchases = useMemo(() => {
    return profile?.recentPurchases || [];
  }, [profile?.recentPurchases]);

  return (
    <StudentLayout>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .profile-wrapper {
          max-width: 1100px;
          margin: 0 auto;
          padding: 24px 28px 60px;
          animation: fadeIn 0.3s ease-out;
        }

        .glass-panel {
          background: #0D1322;
          border: 1px solid #1C273E;
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        }

        .hero-banner {
          background: linear-gradient(135deg, #0D1629 0%, #111B34 50%, #0A1E20 100%);
          border: 1px solid #1F2D4A;
          border-radius: 20px;
          padding: 32px;
          position: relative;
          overflow: hidden;
          margin-bottom: 24px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: #0E1526;
          border: 1px solid #1C273E;
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .stat-card:hover {
          border-color: #3B82F6;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
        }

        .action-row:hover {
          background: #141E34 !important;
        }

        .switch-toggle {
          width: 44px;
          height: 24px;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: background 0.2s;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .profile-wrapper {
            padding: 16px 14px 50px !important;
          }
          .hero-banner {
            padding: 20px 16px !important;
          }
          .hero-inner {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 16px !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .stat-card {
            padding: 14px 14px !important;
            gap: 12px !important;
          }
          .two-col-layout {
            grid-template-columns: 1fr !important;
            gap: 18px !important;
          }
        }
      `}</style>

      <div className="profile-wrapper">

        {/* ── PROFILE HERO HEADER ── */}
        <div className="hero-banner">
          {/* Subtle Ambient Radial Glow */}
          <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div className="hero-inner" style={{ display: "flex", alignItems: "center", gap: 24, position: "relative", zIndex: 2 }}>
            {/* Avatar Pill with Gradient */}
            <div style={{
              width: 84, height: 84, borderRadius: "50%",
              background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: "#FFFFFF",
              boxShadow: "0 0 0 5px rgba(59, 130, 246, 0.2), 0 8px 24px rgba(0, 0, 0, 0.4)",
              flexShrink: 0
            }}>
              {initials(displayName)}
            </div>

            {/* Student Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "#F9FAFB", margin: 0 }}>
                  {displayName}
                </h1>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: 9999, padding: "2px 10px",
                  fontSize: 10, fontWeight: 700, color: "#10B981"
                }}>
                  <ShieldCheck size={12} /> VERIFIED STUDENT
                </span>
              </div>

              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <School size={14} style={{ color: "#60A5FA" }} />
                <span>{collegeName}</span>
                {collegeCode && <span style={{ background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 4, fontSize: 11 }}>{collegeCode}</span>}
                <span>• Member since {memberSince}</span>
              </p>

              {/* Email & Phone Badges */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {displayEmail && (
                  <button
                    onClick={handleCopyEmail}
                    title="Click to copy email"
                    style={{
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8, padding: "4px 10px", color: "#CBD5E1",
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 11, cursor: "pointer",
                      display: "inline-flex", alignItems: "center", gap: 6
                    }}
                  >
                    <Mail size={12} style={{ color: "#60A5FA" }} />
                    <span>{displayEmail}</span>
                    {copied ? <Check size={12} style={{ color: "#10B981" }} /> : <Copy size={12} style={{ color: "#6B7280" }} />}
                  </button>
                )}

                {userObj?.phone && (
                  <span style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "4px 10px", color: "#94A3B8", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <Phone size={11} style={{ color: "#34D399" }} />
                    <span>{userObj.phone}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => fetchProfile(true)}
                title="Refresh stats"
                disabled={refreshing}
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: "#131C30", border: "1px solid #223252",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#94A3B8", transition: "all 0.2s"
                }}
              >
                <RefreshCw size={15} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
              </button>

              <button
                onClick={() => {
                  setChangePasswordOpen(true);
                  setPasswordError("");
                }}
                style={{
                  height: 38, padding: "0 14px", borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: "#CBD5E1",
                  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                  transition: "all 0.15s"
                }}
              >
                <Key size={14} style={{ color: "#60A5FA" }} />
                <span>Password</span>
              </button>

              <button
                onClick={() => setEditing(true)}
                style={{
                  height: 38, padding: "0 18px", borderRadius: 10,
                  background: "#3B82F6", border: "none",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: "#FFFFFF",
                  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                  boxShadow: "0 4px 14px rgba(59, 130, 246, 0.35)", transition: "all 0.15s"
                }}
              >
                <span>✏️ Edit Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 4 STATS ROW (CLICKABLE) ── */}
        <div className="stats-grid">
          {/* 1. Listed */}
          <Link href="/marketplace/listings" className="stat-card">
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(59, 130, 246, 0.12)", border: "1px solid rgba(59, 130, 246, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#60A5FA", flexShrink: 0 }}>
              <Package size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, display: "block" }}>
                My Listings
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: "#F9FAFB" }}>
                  {profile?.stats.listed ?? (loading ? "–" : 0)}
                </span>
                <span style={{ fontSize: 11, color: "#10B981" }}>
                  ({profile?.stats.activeListings ?? 0} active)
                </span>
              </div>
            </div>
          </Link>

          {/* 2. Sold */}
          <Link href="/marketplace/earnings" className="stat-card">
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34D399", flexShrink: 0 }}>
              <TrendingUp size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, display: "block" }}>
                Items Sold
              </span>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: "#F9FAFB" }}>
                {profile?.stats.sold ?? (loading ? "–" : 0)}
              </span>
            </div>
          </Link>

          {/* 3. Purchased */}
          <Link href="/marketplace/purchases" className="stat-card">
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C084FC", flexShrink: 0 }}>
              <ShoppingBag size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, display: "block" }}>
                Purchased
              </span>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: "#F9FAFB" }}>
                {profile?.stats.purchased ?? (loading ? "–" : 0)}
              </span>
            </div>
          </Link>

          {/* 4. Revenue */}
          <Link href="/marketplace/earnings" className="stat-card">
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FBBF24", flexShrink: 0 }}>
              <DollarSign size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, display: "block" }}>
                Seller Revenue
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "#FBBF24" }}>
                  ₹{(profile?.stats.revenue ?? 0).toLocaleString("en-IN")}
                </span>
                <span style={{ fontSize: 11, color: "#60A5FA", fontWeight: 700 }}>↗</span>
              </div>
            </div>
          </Link>
        </div>

        {/* ── MAIN CONTENT (2-COLUMN LAYOUT) ── */}
        <div className="two-col-layout" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, marginBottom: 24 }}>

          {/* LEFT: Portfolio Showcase (Tabs for Listings & Purchases) */}
          <div className="glass-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              {/* Tab Selector */}
              <div style={{ display: "flex", gap: 8, background: "#080D18", padding: 4, borderRadius: 10, border: "1px solid #1A2438" }}>
                <button
                  onClick={() => setActiveTab("listings")}
                  style={{
                    padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 700,
                    background: activeTab === "listings" ? "#3B82F6" : "transparent",
                    color: activeTab === "listings" ? "#fff" : "#94A3B8",
                    transition: "all 0.15s"
                  }}
                >
                  Active Listings ({activeListings.length})
                </button>
                <button
                  onClick={() => setActiveTab("purchases")}
                  style={{
                    padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 700,
                    background: activeTab === "purchases" ? "#3B82F6" : "transparent",
                    color: activeTab === "purchases" ? "#fff" : "#94A3B8",
                    transition: "all 0.15s"
                  }}
                >
                  Recent Purchases ({recentPurchases.length})
                </button>
              </div>

              {activeTab === "listings" ? (
                <Link href="/marketplace/sell" style={{ textDecoration: "none" }}>
                  <button style={{
                    padding: "6px 12px", borderRadius: 8,
                    background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)",
                    color: "#10B981", fontSize: 11, fontWeight: 700, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: 6
                  }}>
                    <PlusCircle size={13} /> List New Item
                  </button>
                </Link>
              ) : (
                <Link href="/marketplace/purchases" style={{ textDecoration: "none", fontSize: 12, color: "#60A5FA", fontWeight: 600 }}>
                  View Full History ↗
                </Link>
              )}
            </div>

            {/* TAB CONTENT: ACTIVE LISTINGS */}
            {activeTab === "listings" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {loading && <p style={{ fontSize: 13, color: "#64748B", textAlign: "center", padding: "30px 0" }}>Loading listings…</p>}
                {!loading && activeListings.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <Package size={36} style={{ color: "#334155", margin: "0 auto 12px" }} />
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#E2E8F0", margin: "0 0 6px" }}>No active listings right now</h3>
                    <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 16px" }}>Sell textbook notes, study bundles, or electronics to students on campus.</p>
                    <Link href="/marketplace/sell" style={{ textDecoration: "none" }}>
                      <button style={{ padding: "8px 18px", borderRadius: 8, background: "#3B82F6", border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        Start Selling Today
                      </button>
                    </Link>
                  </div>
                )}

                {activeListings.map(l => {
                  const isDig = (l.productType || "").toLowerCase() === "digital";
                  return (
                    <Link
                      key={l.id}
                      href={`/marketplace/${isDig ? "digital" : "product"}/${l.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <div className="action-row" style={{
                        display: "flex", alignItems: "center", gap: 14, padding: "12px 14px",
                        background: "#080E1A", border: "1px solid #19253C", borderRadius: 12,
                        transition: "all 0.15s ease", cursor: "pointer"
                      }}>
                        <div style={{ width: 44, height: 44, borderRadius: 8, background: "#111827", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {l.images?.[0] ? (
                            <img src={l.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => (e.currentTarget.style.display = "none")} />
                          ) : (
                            <span style={{ fontSize: 20 }}>{isDig ? "📄" : "📦"}</span>
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {l.title}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#64748B" }}>
                            <span style={{ color: "#34D399", fontWeight: 700 }}>₹{l.price.toLocaleString("en-IN")}</span>
                            <span>• 👁 {l.views} views</span>
                            <span style={{ background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 4, textTransform: "capitalize" }}>
                              {l.productType}
                            </span>
                          </div>
                        </div>

                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 9999, background: "rgba(16, 185, 129, 0.12)", color: "#10B981" }}>
                          Active
                        </span>
                        <ChevronRight size={15} style={{ color: "#475569", flexShrink: 0 }} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT: RECENT PURCHASES (WITH DIRECT DIGITAL LAUNCH BUTTONS) */}
            {activeTab === "purchases" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {loading && <p style={{ fontSize: 13, color: "#64748B", textAlign: "center", padding: "30px 0" }}>Loading purchases…</p>}
                {!loading && recentPurchases.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <ShoppingBag size={36} style={{ color: "#334155", margin: "0 auto 12px" }} />
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#E2E8F0", margin: "0 0 6px" }}>No purchases made yet</h3>
                    <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 16px" }}>Discover verified semester notes, video lectures, and student-listed supplies.</p>
                    <Link href="/marketplace" style={{ textDecoration: "none" }}>
                      <button style={{ padding: "8px 18px", borderRadius: 8, background: "#3B82F6", border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        Browse Marketplace
                      </button>
                    </Link>
                  </div>
                )}

                {recentPurchases.map(p => {
                  const isDig = (p.product?.productType || "").toLowerCase() === "digital";
                  const subType = p.product?.digitalSubType || "notes";
                  const hasVideo = subType === "video" || subType === "both";
                  const hasPdf = subType === "notes" || subType === "both" || subType === "bundle";

                  return (
                    <div
                      key={p.id}
                      className="action-row"
                      style={{
                        display: "flex", alignItems: "center", gap: 14, padding: "12px 14px",
                        background: "#080E1A", border: "1px solid #19253C", borderRadius: 12,
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: "#111827", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {p.product?.images?.[0] ? (
                          <img src={p.product.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => (e.currentTarget.style.display = "none")} />
                        ) : (
                          <span style={{ fontSize: 20 }}>{isDig ? (hasVideo ? "🎥" : "📖") : "📦"}</span>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link href={`/marketplace/${isDig ? "digital" : "product"}/${p.product?.id}`} style={{ textDecoration: "none" }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.product?.title || "Purchased Asset"}
                          </p>
                        </Link>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#64748B" }}>
                          <span>{formatDate(p.createdAt)}</span>
                          <span>•</span>
                          <span style={{ color: "#34D399", fontWeight: 700 }}>₹{p.amount.toLocaleString("en-IN")}</span>
                          <span style={{ color: "#10B981" }}>✓ Completed</span>
                        </div>
                      </div>

                      {/* Direct Digital Access Launcher Buttons */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        {isDig && hasVideo && (
                          <Link href={`/marketplace/viewer/video?id=${p.product?.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                            <button title="Launch Video Player" style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.35)", color: "#34D399", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <Play size={11} /> Watch
                            </button>
                          </Link>
                        )}
                        {isDig && hasPdf && (
                          <Link href={`/marketplace/viewer/pdf?id=${p.product?.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                            <button title="Open PDF Reader" style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(168, 85, 247, 0.15)", border: "1px solid rgba(168, 85, 247, 0.35)", color: "#C084FC", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <BookOpen size={11} /> Read
                            </button>
                          </Link>
                        )}
                        {!isDig && (
                          <Link href={`/marketplace/product/${p.product?.id}`} style={{ textDecoration: "none" }}>
                            <button style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94A3B8", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                              View
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Security, Identity Card, & Preferences */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Campus DRM & Security Card */}
            <div className="glass-panel" style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <ShieldCheck size={16} style={{ color: "#10B981" }} />
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#F9FAFB", margin: 0 }}>
                  Campus DRM & Trust ID
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1E293B", paddingBottom: 8 }}>
                  <span style={{ color: "#64748B" }}>Account Status</span>
                  <span style={{ color: "#10B981", fontWeight: 700 }}>✓ Verified Student</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1E293B", paddingBottom: 8 }}>
                  <span style={{ color: "#64748B" }}>Student Roll / ID</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#E2E8F0" }}>{displayEnrollment}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1E293B", paddingBottom: 8 }}>
                  <span style={{ color: "#64748B" }}>DRM Watermark</span>
                  <span style={{ color: "#60A5FA", fontWeight: 600 }}>Active (AES-128)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Trader Reputation</span>
                  <span style={{ color: "#FBBF24", fontWeight: 700 }}>100% Academic Trust</span>
                </div>
              </div>
            </div>

            {/* Account Security & Password Card */}
            <div className="glass-panel" style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Lock size={16} style={{ color: "#60A5FA" }} />
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#F9FAFB", margin: 0 }}>
                    Account Security
                  </h3>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#10B981", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: 9999, padding: "2px 8px" }}>
                  ENCRYPTED
                </span>
              </div>

              <p style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5, margin: "0 0 14px" }}>
                Your login password protects your listings, earnings, and digital watermarks. Regularly update your passphrase to keep your account safe.
              </p>

              <button
                onClick={() => {
                  setChangePasswordOpen(true);
                  setPasswordError("");
                }}
                style={{
                  width: "100%", padding: "10px", borderRadius: 10,
                  background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.15))",
                  border: "1px solid rgba(59,130,246,0.35)",
                  color: "#93C5FD", fontSize: 12, fontWeight: 700, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "all 0.15s"
                }}
              >
                <Key size={14} /> Update Account Password
              </button>
            </div>

            {/* Notification & Platform Preferences */}
            <div className="glass-panel" style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Bell size={16} style={{ color: "#3B82F6" }} />
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#F9FAFB", margin: 0 }}>
                  Notification Preferences
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {NOTIF_DEFS.map(n => (
                  <div key={n.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9" }}>{n.label}</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>{n.desc}</div>
                    </div>
                    <button
                      onClick={() => handleToggleNotif(n.id)}
                      className="switch-toggle"
                      style={{ background: notifs[n.id] ? "#3B82F6" : "#1A2438" }}
                    >
                      <div style={{
                        position: "absolute", top: 4, left: notifs[n.id] ? 22 : 4,
                        width: 16, height: 16, borderRadius: "50%", background: "#fff",
                        transition: "left 0.2s"
                      }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div className="glass-panel" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href="/marketplace/earnings" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", color: "#CBD5E1", fontSize: 12, fontWeight: 600, padding: "6px 0" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><DollarSign size={14} style={{ color: "#FBBF24" }} /> Seller Payouts & Earnings</span>
                <ChevronRight size={14} style={{ color: "#64748B" }} />
              </Link>
              <Link href="/marketplace/wishlist" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", color: "#CBD5E1", fontSize: 12, fontWeight: 600, padding: "6px 0" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Heart size={14} style={{ color: "#EF4444" }} /> Saved Wishlist Items</span>
                <ChevronRight size={14} style={{ color: "#64748B" }} />
              </Link>
              <Link href="/marketplace/inbox" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", color: "#CBD5E1", fontSize: 12, fontWeight: 600, padding: "6px 0" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Mail size={14} style={{ color: "#3B82F6" }} /> Buyer & Seller Inbox</span>
                <ChevronRight size={14} style={{ color: "#64748B" }} />
              </Link>
            </div>

          </div>

        </div>

      </div>

      {/* ── EDIT PROFILE MODAL (REAL BACKEND PERSISTENCE) ── */}
      {editing && (
        <div
          onClick={() => { if (!saving) setEditing(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(5, 8, 18, 0.85)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#0E1526", border: "1.5px solid #223252",
              borderRadius: 20, maxWidth: 460, width: "100%",
              padding: "28px", boxShadow: "0 16px 50px rgba(0,0,0,0.7)",
              animation: "modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#F8FAFC", margin: 0 }}>
                  Edit Student Profile
                </h2>
                <p style={{ fontSize: 12, color: "#94A3B8", margin: "2px 0 0" }}>
                  Changes are saved directly to your CampusConnect account
                </p>
              </div>
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, color: "#F87171", fontSize: 12 }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Full Name */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Your legal or display name"
                    style={{
                      width: "100%", background: "#080E1A", border: "1.5px solid #1E293B",
                      borderRadius: 10, padding: "10px 14px 10px 36px",
                      fontSize: 13, color: "#F8FAFC", outline: "none", boxSizing: "border-box"
                    }}
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                  Phone Number (for Physical Item Orders)
                </label>
                <div style={{ position: "relative" }}>
                  <Phone size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    style={{
                      width: "100%", background: "#080E1A", border: "1.5px solid #1E293B",
                      borderRadius: 10, padding: "10px 14px 10px 36px",
                      fontSize: 13, color: "#F8FAFC", outline: "none", boxSizing: "border-box"
                    }}
                  />
                </div>
                <span style={{ fontSize: 10, color: "#64748B", marginTop: 4, display: "block" }}>
                  Shared with other students only when you coordinate handoffs.
                </span>
              </div>

              {/* Enrollment / Roll ID */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                  Student Roll / Enrollment ID
                </label>
                <div style={{ position: "relative" }}>
                  <Hash size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
                  <input
                    type="text"
                    value={editEnrollment}
                    onChange={e => setEditEnrollment(e.target.value)}
                    placeholder="e.g. 21BCE1048"
                    style={{
                      width: "100%", background: "#080E1A", border: "1.5px solid #1E293B",
                      borderRadius: 10, padding: "10px 14px 10px 36px",
                      fontSize: 13, color: "#F8FAFC", outline: "none", boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              {/* College (Read-only) */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                  Campus Affiliation (Locked)
                </label>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#94A3B8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{collegeName}</span>
                  <span style={{ fontSize: 10, background: "rgba(16,185,129,0.12)", color: "#10B981", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>Verified</span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  style={{
                    flex: 1, height: 42, borderRadius: 10,
                    background: "transparent", border: "1px solid #223252",
                    color: "#94A3B8", fontSize: 13, fontWeight: 600, cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1.5, height: 42, borderRadius: 10,
                    background: "#3B82F6", border: "none",
                    color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)"
                  }}
                >
                  {saving ? (
                    <>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />
                      <span>Saving Changes…</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── UPDATE PASSWORD MODAL ── */}
      {changePasswordOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(3, 7, 18, 0.82)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 16
        }}>
          <div style={{
            background: "#0D1322", border: "1px solid #1F2D4A",
            borderRadius: 20, width: "100%", maxWidth: 480,
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7)",
            animation: "modalPop 0.25s ease-out",
            padding: "26px 26px 22px",
            maxHeight: "92vh", overflowY: "auto"
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.2) 100%)",
                  border: "1px solid rgba(59,130,246,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#60A5FA"
                }}>
                  <Key size={20} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 700, color: "#F9FAFB", margin: "0 0 2px" }}>
                    Update Password
                  </h2>
                  <p style={{ fontSize: 11, color: "#94A3B8", margin: 0 }}>
                    Secure your account credentials and digital purchases.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setChangePasswordOpen(false);
                  setPasswordError("");
                  setPasswordMode("current");
                }}
                disabled={savingPassword}
                style={{ background: "transparent", border: "none", color: "#64748B", cursor: "pointer", padding: 4, borderRadius: 6 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div style={{ display: "flex", gap: 6, background: "#080E1A", padding: 4, borderRadius: 10, border: "1px solid #1A2438", marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => { setPasswordMode("current"); setPasswordError(""); }}
                style={{
                  flex: 1, padding: "7px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 700,
                  background: passwordMode === "current" ? "#3B82F6" : "transparent",
                  color: passwordMode === "current" ? "#fff" : "#94A3B8",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  transition: "all 0.15s"
                }}
              >
                <Lock size={12} /> Current Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setPasswordMode("otp");
                  setPasswordError("");
                  if (!otpSent) handleSendProfileOtp();
                }}
                style={{
                  flex: 1, padding: "7px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 700,
                  background: passwordMode === "otp" ? "#3B82F6" : "transparent",
                  color: passwordMode === "otp" ? "#fff" : "#94A3B8",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  transition: "all 0.15s"
                }}
              >
                <Mail size={12} /> Reset via Email OTP
              </button>
            </div>

            {/* Error Message */}
            {passwordError && (
              <div style={{
                background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: 10, padding: "10px 14px", marginBottom: 14,
                display: "flex", alignItems: "center", gap: 8, color: "#F87171", fontSize: 12
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* MODE A: CURRENT PASSWORD */}
              {passwordMode === "current" ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8 }}>
                      Current Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordMode("otp");
                        setPasswordError("");
                        if (!otpSent) handleSendProfileOtp();
                      }}
                      style={{
                        background: "none", border: "none", padding: 0,
                        fontSize: 11, color: "#60A5FA", fontWeight: 600, cursor: "pointer",
                        display: "inline-flex", alignItems: "center", gap: 3
                      }}
                    >
                      <Zap size={11} /> Forgot current? Reset via OTP
                    </button>
                  </div>
                  <div style={{ position: "relative" }}>
                    <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      style={{
                        width: "100%", background: "#080E1A", border: "1.5px solid #1E293B",
                        borderRadius: 10, padding: "10px 42px 10px 36px",
                        fontSize: 13, color: "#F8FAFC", outline: "none", boxSizing: "border-box"
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{
                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        background: "transparent", border: "none", color: "#64748B", cursor: "pointer", padding: 0
                      }}
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ) : (
                /* MODE B: EMAIL OTP VERIFICATION */
                <div style={{ background: "#080E1A", border: "1px solid #19253C", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>
                      Registered email: <strong style={{ color: "#38BDF8" }}>{displayEmail}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendProfileOtp}
                      disabled={sendingOtp}
                      style={{
                        background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)",
                        color: "#60A5FA", borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      {sendingOtp ? "Sending…" : (otpSent ? "Resend Code" : "Send OTP")}
                    </button>
                  </div>

                  {otpDevCode && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 6, padding: "4px 8px", marginBottom: 10, fontSize: 11 }}>
                      <span style={{ color: "#10B981", fontWeight: 700 }}>Dev Test Code:</span>
                      <code style={{ color: "#F1F5F9", fontFamily: "monospace" }}>{otpDevCode}</code>
                      <button
                        type="button"
                        onClick={() => setOtpCode(otpDevCode)}
                        style={{ marginLeft: "auto", background: "none", border: "none", color: "#34D399", fontSize: 10, fontWeight: 700, cursor: "pointer" }}
                      >
                        Autofill
                      </button>
                    </div>
                  )}

                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="e.g. 123456"
                    style={{
                      width: "100%", background: "#0D1322", border: "1.5px solid #223252",
                      borderRadius: 8, padding: "8px 12px",
                      fontSize: 16, fontWeight: 700, color: "#F8FAFC",
                      letterSpacing: "4px", textAlign: "center", fontFamily: "'JetBrains Mono', monospace",
                      outline: "none", boxSizing: "border-box"
                    }}
                    required
                  />
                </div>
              )}

              {/* New Password */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                  New Password (min 8 characters)
                </label>
                <div style={{ position: "relative" }}>
                  <Key size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Choose a strong new passphrase"
                    style={{
                      width: "100%", background: "#080E1A", border: "1.5px solid #1E293B",
                      borderRadius: 10, padding: "10px 42px 10px 36px",
                      fontSize: 13, color: "#F8FAFC", outline: "none", boxSizing: "border-box"
                    }}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      background: "transparent", border: "none", color: "#64748B", cursor: "pointer", padding: 0
                    }}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <span style={{ fontSize: 10, color: "#64748B" }}>Strength:</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div style={{ width: "100%", height: 4, background: "#1E293B", borderRadius: 9999, overflow: "hidden" }}>
                      <div style={{
                        width: passwordStrength.width, height: "100%",
                        background: passwordStrength.color,
                        borderRadius: 9999,
                        transition: "all 0.25s ease"
                      }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                  Confirm New Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    style={{
                      width: "100%", background: "#080E1A",
                      border: `1.5px solid ${passwordsMatch === null ? "#1E293B" : (passwordsMatch ? "#10B981" : "#EF4444")}`,
                      borderRadius: 10, padding: "10px 42px 10px 36px",
                      fontSize: 13, color: "#F8FAFC", outline: "none", boxSizing: "border-box"
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      background: "transparent", border: "none", color: "#64748B", cursor: "pointer", padding: 0
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {passwordsMatch !== null && (
                  <div style={{ marginTop: 5, fontSize: 11, display: "flex", alignItems: "center", gap: 5, color: passwordsMatch ? "#10B981" : "#EF4444" }}>
                    {passwordsMatch ? (
                      <>
                        <CheckCircle2 size={13} />
                        <span>Passwords match</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={13} />
                        <span>Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setChangePasswordOpen(false);
                    setPasswordError("");
                    setPasswordMode("current");
                  }}
                  disabled={savingPassword}
                  style={{
                    flex: 1, height: 42, borderRadius: 10,
                    background: "transparent", border: "1px solid #223252",
                    color: "#94A3B8", fontSize: 13, fontWeight: 600, cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword || (passwordsMatch === false) || (passwordMode === "otp" && otpCode.length !== 6)}
                  style={{
                    flex: 1.5, height: 42, borderRadius: 10,
                    background: (passwordsMatch === false || (passwordMode === "otp" && otpCode.length !== 6)) ? "#1E293B" : "#3B82F6",
                    border: "none",
                    color: (passwordsMatch === false || (passwordMode === "otp" && otpCode.length !== 6)) ? "#64748B" : "#fff",
                    fontSize: 13, fontWeight: 700,
                    cursor: (passwordsMatch === false || (passwordMode === "otp" && otpCode.length !== 6)) ? "not-allowed" : "pointer",
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                    boxShadow: (passwordsMatch === false || (passwordMode === "otp" && otpCode.length !== 6)) ? "none" : "0 4px 14px rgba(59, 130, 246, 0.4)",
                    transition: "all 0.15s"
                  }}
                >
                  {savingPassword ? (
                    <>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />
                      <span>{passwordMode === "otp" ? "Resetting Password…" : "Updating Password…"}</span>
                    </>
                  ) : (
                    <>
                      <Lock size={14} />
                      <span>{passwordMode === "otp" ? "Reset Password via OTP" : "Update Password"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification Toast */}
      {successToast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 99999,
          background: "#10B981", color: "#FFFFFF",
          padding: "12px 20px", borderRadius: 12,
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
          boxShadow: "0 8px 30px rgba(16, 185, 129, 0.4)",
          display: "flex", alignItems: "center", gap: 8,
          animation: "fadeIn 0.25s ease-out"
        }}>
          <Check size={16} />
          <span>{successToast}</span>
        </div>
      )}

    </StudentLayout>
  );
}
