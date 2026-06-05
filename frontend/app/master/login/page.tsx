'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

export default function MasterLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post<{
        accessToken: string;
        master: { id: string; name: string; email: string };
      }>('/api/auth/master/login', { email: email.trim(), password });

      setAuth(data.accessToken, {
        id: data.master.id,
        email: data.master.email,
        name: data.master.name,
      }, 'MASTER_ADMIN');

      router.push('/master/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'DM Sans',sans-serif; background:#0A0E1A; color:#F0F4FF; }

        .m1-root {
          min-height:100vh; background:#0A0E1A;
          display:flex; align-items:center; justify-content:center;
          position:relative; overflow:hidden;
        }
        /* Gold atmospheric glow */
        .m1-glow {
          position:absolute; width:500px; height:500px; border-radius:50%;
          background:radial-gradient(circle, rgba(247,201,72,0.08) 0%, transparent 70%);
          top:50%; left:50%; transform:translate(-50%,-50%);
          pointer-events:none; z-index:0;
        }
        .m1-glow2 {
          position:absolute; width:300px; height:300px; border-radius:50%;
          background:radial-gradient(circle, rgba(247,201,72,0.04) 0%, transparent 70%);
          top:20%; left:10%;
          pointer-events:none; z-index:0;
        }

        .m1-center {
          position:relative; z-index:1;
          display:flex; flex-direction:column; align-items:center; gap:20px;
          width:100%; max-width:440px; padding:24px;
        }

        /* Above-card branding */
        .m1-crown { font-size:44px; line-height:1; }
        .m1-logo {
          font-family:'Sora',sans-serif; font-size:22px; font-weight:800;
          letter-spacing:-0.02em;
        }
        .m1-logo-campus { color:#F0F4FF; }
        .m1-logo-connect { color:#F7C948; }
        .m1-subtitle {
          font-size:11px; color:#6B7280; text-transform:uppercase;
          letter-spacing:2px; font-weight:600; margin-top:-6px;
        }

        /* Card */
        .m1-card {
          width:100%; background:#111827;
          border:1px solid #1e2d45; border-radius:14px;
          padding:32px; display:flex; flex-direction:column; gap:20px;
        }
        .m1-card-title {
          font-family:'Sora',sans-serif; font-size:22px;
          font-weight:700; color:#F0F4FF; text-align:center;
        }
        .m1-warning {
          display:flex; align-items:center; justify-content:center; gap:6px;
          background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25);
          border-radius:9999px; padding:6px 14px;
          font-size:12px; font-weight:600; color:#EF4444;
        }

        .m1-form { display:flex; flex-direction:column; gap:14px; }
        .m1-field { display:flex; flex-direction:column; gap:6px; }
        .m1-label {
          font-size:12px; font-weight:600; color:#9CA3AF;
          text-transform:uppercase; letter-spacing:0.5px;
        }
        .m1-input-wrap { position:relative; }
        .m1-input {
          width:100%; background:#1a2235; border:1.5px solid #1e2d45;
          border-radius:8px; padding:12px 14px;
          font-family:'DM Sans',sans-serif; font-size:14px;
          color:#F0F4FF; outline:none; transition:border-color 0.2s, box-shadow 0.2s;
        }
        .m1-input:focus {
          border-color:#F7C948;
          box-shadow:0 0 0 3px rgba(247,201,72,0.12);
        }
        .m1-input::placeholder { color:#374151; }
        .m1-eye {
          position:absolute; right:12px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer;
          color:#6B7280; font-size:16px; padding:0;
          display:flex; align-items:center;
        }
        .m1-eye:hover { color:#F7C948; }

        .m1-error {
          background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2);
          border-radius:8px; padding:10px 14px;
          font-size:13px; color:#EF4444; text-align:center;
        }

        .m1-submit {
          width:100%; height:50px; border-radius:9999px;
          background:#F7C948; border:none; cursor:pointer;
          font-family:'Sora',sans-serif; font-size:15px;
          font-weight:700; color:#0A0E1A;
          transition:opacity 0.2s, transform 0.1s;
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .m1-submit:hover:not(:disabled) { opacity:0.9; }
        .m1-submit:active:not(:disabled) { transform:scale(0.97); }
        .m1-submit:disabled { opacity:0.6; cursor:not-allowed; }

        .m1-footer-text {
          font-size:11px; color:#374151; text-align:center;
          font-family:'JetBrains Mono',monospace;
        }
      `}</style>

      <div className="m1-root">
        <div className="m1-glow" />
        <div className="m1-glow2" />

        <div className="m1-center">
          <div className="m1-crown">👑</div>
          <div className="m1-logo">
            <span className="m1-logo-campus">Campus</span>
            <span className="m1-logo-connect">Connect</span>
          </div>
          <div className="m1-subtitle">Platform Master Control</div>

          <div className="m1-card">
            <div className="m1-card-title">Master Admin Access</div>
            <div className="m1-warning">
              🔐 Authorized Personnel Only
            </div>

            <form className="m1-form" onSubmit={handleLogin}>
              <div className="m1-field">
                <label className="m1-label">Master Email</label>
                <div className="m1-input-wrap">
                  <input
                    id="master-email"
                    type="email"
                    className="m1-input"
                    placeholder="master@campusconnect.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="m1-field">
                <label className="m1-label">Password</label>
                <div className="m1-input-wrap">
                  <input
                    id="master-password"
                    type={showPass ? 'text' : 'password'}
                    className="m1-input"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ paddingRight: '44px' }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="m1-eye"
                    onClick={() => setShowPass(v => !v)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {error && <div className="m1-error">{error}</div>}

              <button
                id="master-signin-btn"
                type="submit"
                className="m1-submit"
                disabled={loading}
              >
                {loading ? '⏳ Authenticating…' : 'Sign In →'}
              </button>
            </form>
          </div>

          <p className="m1-footer-text">
            Access is logged. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </>
  );
}
