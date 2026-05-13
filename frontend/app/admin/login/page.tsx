'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', collegeCode: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsPending(false);
    setLoading(true);
    try {
      const { data } = await api.post<{
        accessToken: string;
        admin: { id: string; name: string; email: string; collegeId: string; collegeName: string };
      }>('/api/auth/admin/login', {
        email: form.email.trim(),
        collegeCode: form.collegeCode.trim(),
        password: form.password,
      });

      setAuth(data.accessToken, {
        id: data.admin.id,
        email: data.admin.email,
        name: data.admin.name,
        collegeId: data.admin.collegeId,
        collegeName: data.admin.collegeName,
      }, 'COLLEGE_ADMIN', data.admin.collegeId);

      router.push('/admin/dashboard');
    } catch (err: unknown) {
      const resp = (err as { response?: { status?: number; data?: { message?: string } } })?.response;
      if (resp?.status === 403) {
        setIsPending(true);
      } else {
        setError(resp?.data?.message ?? 'Invalid credentials. Please check your email, college code, and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --bg:        #0A0E1A;
          --surface:   #111827;
          --surface2:  #141c2e;
          --input-bg:  #1a2235;
          --border:    #1e2d45;
          --green:     #10B981;
          --green-dim: #0d9167;
          --blue:      #4F8EF7;
          --text:      #F0F4FF;
          --muted:     #6B7280;
          --soft:      #9CA3AF;
        }

        html, body { height: 100%; font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); }

        /* ── PAGE ──────────────────────────────────────── */
        .login-page {
          display: grid;
          grid-template-columns: 1fr 460px;
          height: 100vh;
          overflow: hidden;
        }

        /* ── LEFT ──────────────────────────────────────── */
        .left {
          position: relative;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          padding: 40px 52px;
          background: var(--bg);
        }

        /* Ambient orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(80px);
        }
        .orb-1 {
          width: 520px; height: 520px;
          top: -140px; left: -120px;
          background: radial-gradient(circle, rgba(16,185,129,0.13) 0%, transparent 70%);
        }
        .orb-2 {
          width: 360px; height: 360px;
          bottom: -80px; right: 40px;
          background: radial-gradient(circle, rgba(79,142,247,0.08) 0%, transparent 70%);
        }

        /* Decorative grid lines */
        .grid-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(30,45,69,0.35) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,45,69,0.35) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 70% 80% at 30% 50%, black 0%, transparent 100%);
        }

        .left-content { position: relative; z-index: 2; max-width: 480px; }

        /* Role pill */
        .role-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25);
          border-radius: 9999px;
          padding: 5px 12px 5px 9px;
          font-size: 11px;
          font-weight: 700;
          color: var(--green);
          letter-spacing: 0.5px;
          margin-bottom: 18px;
        }
        .role-pill-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--green);
          animation: glow-pulse 2s ease-in-out infinite;
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
          50%       { box-shadow: 0 0 0 5px rgba(16,185,129,0); }
        }

        .left-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(26px, 3vw, 38px);
          font-weight: 800;
          line-height: 1.18;
          letter-spacing: -1px;
          color: var(--text);
          margin-bottom: 12px;
        }
        .left-title .highlight {
          background: linear-gradient(135deg, var(--green), #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .left-desc {
          font-size: 14px;
          color: var(--soft);
          line-height: 1.65;
          margin-bottom: 24px;
          max-width: 380px;
        }

        /* Feature list */
        .features { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
        .feature-row { display: flex; align-items: center; gap: 10px; }
        .feature-icon {
          width: 30px; height: 30px; border-radius: 7px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; flex-shrink: 0;
        }
        .feature-text { font-size: 13px; color: var(--soft); }
        .feature-text strong { color: var(--text); font-weight: 600; }

        /* Stats */
        .stats-row {
          display: flex;
          gap: 0;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
        }
        .stat-block {
          flex: 1;
          padding: 14px 16px;
          text-align: center;
          position: relative;
        }
        .stat-block:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0; top: 20%; bottom: 20%;
          width: 1px;
          background: var(--border);
        }
        .stat-num {
          font-family: 'Sora', sans-serif;
          font-size: 18px; font-weight: 800;
          color: var(--green);
          display: block;
          line-height: 1;
          margin-bottom: 3px;
        }
        .stat-lbl { font-size: 10px; color: var(--muted); font-weight: 600; letter-spacing: 0.5px; }

        /* ── RIGHT — FORM PANEL ────────────────────────── */
        .right {
          background: var(--surface);
          border-left: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 36px 40px;
          position: relative;
          overflow-y: auto;
        }

        .right::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Logo */
        .logo {
          font-family: 'Sora', sans-serif;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 28px;
        }
        .logo-c { color: var(--green); }
        .logo-rest { color: var(--text); }

        .form-heading {
          font-family: 'Sora', sans-serif;
          font-size: 22px; font-weight: 700;
          letter-spacing: -0.5px;
          color: var(--text);
          margin-bottom: 4px;
        }
        .form-sub { font-size: 13px; color: var(--muted); margin-bottom: 18px; }

        /* ── INPUT GROUPS ──────────────────────────────── */
        .field { margin-bottom: 14px; }

        .field-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 7px;
        }
        .label-text {
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1.2px;
          color: var(--muted);
        }
        .label-hint { font-size: 11px; color: var(--muted); }

        .input-wrap { position: relative; }

        .field-input {
          width: 100%;
          background: var(--input-bg);
          border: 1.5px solid var(--border);
          border-radius: 10px;
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          padding: 11px 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          -webkit-appearance: none;
        }
        .field-input::placeholder { color: var(--muted); }
        .field-input:focus {
          border-color: var(--green);
          box-shadow: 0 0 0 3px rgba(16,185,129,0.14);
          background: #1e2840;
        }
        .field-input.mono {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.06em;
        }
        .field-input.has-right { padding-right: 48px; }

        .input-right {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--muted); font-size: 16px;
          display: flex; align-items: center;
          transition: color 0.2s;
          padding: 4px;
        }
        .input-right:hover { color: var(--text); }

        .helper { font-size: 11px; color: var(--muted); margin-top: 5px; display: flex; align-items: center; gap: 4px; }

        /* ── ERROR ─────────────────────────────────────── */
        .error-box {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 13px; color: #EF4444;
          margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
        }

        /* ── SUBMIT BTN ────────────────────────────────── */
        .submit-btn {
          width: 100%;
          position: relative;
          background: var(--green);
          color: #003822;
          border: none;
          border-radius: 9999px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 700;
          padding: 13px 24px;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s, background 0.18s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 4px;
          overflow: hidden;
        }
        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          border-radius: inherit;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(16,185,129,0.35), 0 0 0 1px rgba(16,185,129,0.4);
          background: #12c98d;
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        /* Loading spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(0,56,34,0.3);
          border-top-color: #003822;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* ── DIVIDER ───────────────────────────────────── */
        .divider {
          display: flex; align-items: center; gap: 12px;
          margin: 12px 0; color: var(--muted); font-size: 11px;
          font-weight: 600; letter-spacing: 0.5px;
        }
        .divider::before, .divider::after {
          content: ''; flex: 1; height: 1px; background: var(--border);
        }

        /* ── FOOTER LINKS ──────────────────────────────── */
        .footer-links {
          display: flex; flex-direction: column; gap: 7px; align-items: center;
        }
        .footer-link {
          font-size: 13px; color: var(--muted); text-decoration: none;
          transition: color 0.2s; display: inline-flex; align-items: center; gap: 4px;
        }
        .footer-link:hover { color: var(--green); }
        .footer-link.back { color: var(--soft); }
        .footer-link.back:hover { color: var(--text); }

        .security-note {
          margin-top: 14px;
          display: flex; align-items: center; justify-content: center; gap: 4px;
          font-size: 10px; color: var(--muted);
        }

        /* ── ANIMATIONS ────────────────────────────────── */
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .left-content { animation: slide-up 0.5s ease both; }
        .right        { animation: slide-up 0.5s 0.08s ease both; }

        /* ── RESPONSIVE ────────────────────────────────── */
        @media (max-width: 960px) {
          .login-page { grid-template-columns: 1fr; height: auto; overflow: auto; }
          .left, .right { overflow: visible; }
          .left { padding: 36px 24px 28px; }
          .right { border-left: none; border-top: 1px solid var(--border); padding: 32px 24px 40px; }
        }
        @media (max-width: 500px) {
          .left { padding: 28px 16px; }
          .right { padding: 24px 16px 32px; }
        }
      `}</style>

      <div className="login-page">

        {/* ── LEFT ── */}
        <div className="left">
          <div className="grid-lines" />
          <div className="orb orb-1" />
          <div className="orb orb-2" />

          <div className="left-content">
            <div className="role-pill">
              <div className="role-pill-dot" />
              College Admin Panel
            </div>

            <h1 className="left-title">
              Manage Your<br />
              <span className="highlight">College Marketplace</span>
            </h1>

            <p className="left-desc">
              Full control over student approvals, product moderation, advertisements, and revenue — all in one place.
            </p>

            <div className="features">
              <div className="feature-row">
                <div className="feature-icon">👥</div>
                <p className="feature-text"><strong>Student Approvals</strong> — approve or reject registrations instantly</p>
              </div>
              <div className="feature-row">
                <div className="feature-icon">📦</div>
                <p className="feature-text"><strong>Product Moderation</strong> — review and manage all listings</p>
              </div>
              <div className="feature-row">
                <div className="feature-icon">💰</div>
                <p className="feature-text"><strong>Revenue Tracking</strong> — platform fees and transaction analytics</p>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-block">
                <span className="stat-num">12+</span>
                <div className="stat-lbl">Colleges</div>
              </div>
              <div className="stat-block">
                <span className="stat-num">1,470</span>
                <div className="stat-lbl">Students</div>
              </div>
              <div className="stat-block">
                <span className="stat-num">2,840</span>
                <div className="stat-lbl">Products</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="right">
          <div className="logo">
            <span className="logo-c">Campus</span>
            <span className="logo-rest">Connect</span>
          </div>

          <h2 className="form-heading">Welcome back 👋</h2>
          <p className="form-sub">Sign in to your admin dashboard</p>

          {isPending && (
            <div style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 10, padding: '12px 14px',
              fontSize: 13, color: '#F59E0B',
              marginBottom: 16,
              display: 'flex', alignItems: 'flex-start', gap: 8,
            }}>
              <span>⏳</span>
              <span>Your registration is under review by our team. You'll receive an email once approved (24–48 hours).</span>
            </div>
          )}
          {error && (
            <div className="error-box">⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <div className="field-label">
                <span className="label-text">Admin Email</span>
              </div>
              <div className="input-wrap">
                <input
                  id="admin-email"
                  type="email"
                  className="field-input"
                  placeholder="admin@college.edu"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="field">
              <div className="field-label">
                <span className="label-text">College Code</span>
              </div>
              <div className="input-wrap">
                <input
                  id="college-code"
                  type="text"
                  className="field-input mono"
                  placeholder="MIT2024"
                  value={form.collegeCode}
                  onChange={e => setForm({ ...form, collegeCode: e.target.value.toUpperCase() })}
                  maxLength={20}
                  autoComplete="off"
                  required
                />
              </div>
              <p className="helper">🔑 Assigned during college registration</p>
            </div>

            <div className="field">
              <div className="field-label">
                <span className="label-text">Password</span>
                <Link href="/admin/forgot-password" className="label-hint" style={{ textDecoration: 'none', color: 'var(--muted)', fontSize: '11px' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="input-wrap">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  className="field-input has-right"
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="input-right"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !form.email || !form.collegeCode || !form.password}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Signing in…
                </>
              ) : (
                <>Enter Admin Panel →</>
              )}
            </button>
          </form>

          <div className="divider">OR</div>

          <div className="footer-links">
            <Link href="/admin/register" className="footer-link">
              New college? Register here →
            </Link>
            <Link href="/login" className="footer-link back">
              ← Back to Student Login
            </Link>
          </div>

          <div className="security-note">
            🔒 Secure connection &bull; Sessions are monitored &bull; Unauthorized access is prohibited
          </div>
        </div>

      </div>
    </>
  );
}
