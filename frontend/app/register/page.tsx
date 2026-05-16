'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

function passwordStrength(pwd: string): { level: number; label: string; color: string } {
  if (pwd.length === 0) return { level: 0, label: '', color: '' };
  if (pwd.length < 6) return { level: 1, label: 'Weak', color: '#EF4444' };
  if (pwd.length < 10 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd))
    return { level: 2, label: 'Medium', color: '#F59E0B' };
  return { level: 3, label: 'Strong', color: '#10B981' };
}

export default function StudentRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    collegeCode: '',
    phone: '',
    enrollmentId: '',
  });

  const strength = passwordStrength(form.password);
  const passwordMatch = form.confirmPassword ? form.password === form.confirmPassword : true;
  const canSubmit =
    form.name.trim() &&
    form.email.trim() &&
    form.password.length >= 8 &&
    passwordMatch &&
    form.collegeCode.trim() &&
    !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitError('');
    setLoading(true);
    try {
      await api.post('/api/auth/student/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        collegeCode: form.collegeCode.trim().toUpperCase(),
        phone: form.phone.trim() || undefined,
        enrollmentId: form.enrollmentId.trim() || undefined,
      });
      setSubmitted(true);
      setTimeout(() => router.push(`/pending-approval?email=${encodeURIComponent(form.email.trim())}`), 3500);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.';
      setSubmitError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        :root {
          --bg:     #0A0E1A;
          --card:   #111827;
          --card2:  #1a2235;
          --border: #1e2d45;
          --blue:   #4F8EF7;
          --text:   #F0F4FF;
          --muted:  #6B7280;
          --soft:   #9CA3AF;
        }
        body { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--text); min-height:100vh; }

        .reg-wrap {
          min-height:100vh; display:flex; flex-direction:column;
          align-items:center; padding:48px 24px;
          position:relative; animation:fadeUp 0.4s ease;
        }
        .reg-wrap::before {
          content:''; position:fixed;
          top:-100px; left:-100px; width:600px; height:600px;
          background:radial-gradient(circle, rgba(79,142,247,0.07) 0%, transparent 70%);
          pointer-events:none;
        }
        .reg-wrap::after {
          content:''; position:fixed;
          bottom:-80px; right:-80px; width:400px; height:400px;
          background:radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%);
          pointer-events:none;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }

        .logo { font-family:'Sora',sans-serif; font-size:22px; font-weight:700; margin-bottom:8px; align-self:flex-start; max-width:640px; width:100%; }
        .logo-c { color:var(--blue); }
        .logo-r { color:var(--text); }

        .page-header { width:100%; max-width:640px; margin-bottom:32px; }
        .page-title { font-family:'Sora',sans-serif; font-size:30px; font-weight:800; color:var(--text); margin-bottom:4px; letter-spacing:-0.5px; }
        .page-sub { font-size:14px; color:var(--muted); }

        /* Card */
        .card {
          background:var(--card); border:1px solid var(--border);
          border-radius:16px; padding:36px;
          width:100%; max-width:640px; position:relative;
        }
        .card::before {
          content:''; position:absolute;
          top:-1px; left:48px; right:48px; height:2px;
          background:linear-gradient(90deg, transparent, var(--blue), transparent);
          border-radius:9999px;
        }

        /* Grid */
        .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
        .fg { /* form group */ }
        .fg.full { grid-column:1/-1; }

        .label {
          display:block; margin-bottom:8px;
          font-size:11px; font-weight:700;
          text-transform:uppercase; letter-spacing:1.2px;
          color:var(--muted);
        }
        .required-star { color:#EF4444; margin-left:3px; }
        .optional-tag { color:var(--muted); font-weight:500; text-transform:none; letter-spacing:0; font-size:10px; margin-left:4px; }

        .input {
          width:100%; padding:12px 16px;
          background:var(--card2); border:1.5px solid var(--border);
          border-radius:10px; color:var(--text);
          font-family:'DM Sans',sans-serif; font-size:14px;
          outline:none; transition:border-color 0.2s, box-shadow 0.2s;
        }
        .input::placeholder { color:var(--muted); }
        .input:focus { border-color:var(--blue); box-shadow:0 0 0 3px rgba(79,142,247,0.13); }
        .input.mono { font-family:'JetBrains Mono',monospace; font-size:13px; letter-spacing:0.06em; }
        .input.has-right { padding-right:48px; }

        .input-wrap { position:relative; }
        .eye-btn {
          position:absolute; right:14px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer; color:var(--muted);
          font-size:16px; padding:4px; display:flex; align-items:center;
          transition:color 0.2s;
        }
        .eye-btn:hover { color:var(--text); }

        .helper { font-size:12px; color:var(--muted); margin-top:6px; }
        .helper.good { color:#10B981; }
        .helper.bad { color:#EF4444; }

        /* Strength bar */
        .strength-track { height:4px; background:var(--border); border-radius:9999px; overflow:hidden; margin-top:8px; }
        .strength-fill { height:100%; border-radius:9999px; transition:width 0.3s, background 0.3s; }

        /* College code info card */
        .code-hint {
          background:rgba(79,142,247,0.06); border:1px solid rgba(79,142,247,0.2);
          border-radius:10px; padding:14px 16px;
          display:flex; gap:10; align-items:flex-start;
          margin-top:12px;
        }
        .code-hint p { font-size:13px; color:var(--soft); line-height:1.55; }
        .code-hint strong { color:var(--blue); }

        /* Error */
        .err-box {
          background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25);
          border-radius:10px; padding:12px 16px;
          font-size:13px; color:#EF4444;
          display:flex; align-items:flex-start; gap:8;
          margin-bottom:20px;
        }

        /* Submit */
        .submit-btn {
          width:100%; height:52px; border-radius:9999px;
          background:var(--blue); border:none; cursor:pointer;
          font-family:'DM Sans',sans-serif; font-size:15px; font-weight:700;
          color:#fff; display:flex; align-items:center; justify-content:center; gap:8;
          transition:transform 0.18s, box-shadow 0.18s;
          position:relative; overflow:hidden; margin-top:24px;
        }
        .submit-btn::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          border-radius:inherit;
        }
        .submit-btn:hover:not(:disabled) {
          transform:translateY(-2px);
          box-shadow:0 8px 28px rgba(79,142,247,0.38);
        }
        .submit-btn:active:not(:disabled) { transform:translateY(0); }
        .submit-btn:disabled { opacity:0.65; cursor:not-allowed; }

        @keyframes spin { to { transform:rotate(360deg); } }
        .spinner {
          width:16px; height:16px; border:2px solid rgba(255,255,255,0.3);
          border-top-color:#fff; border-radius:50%;
          animation:spin 0.7s linear infinite;
        }

        /* Success */
        .success-card { text-align:center; padding:48px 32px; }

        .already-link { margin-top:24px; text-align:center; font-size:13px; color:var(--muted); }
        .already-link a { color:var(--blue); text-decoration:none; }
        .already-link a:hover { text-decoration:underline; }

        .info-card {
          margin-top:20px; width:100%; max-width:640px;
          background:rgba(79,142,247,0.04); border:1px solid rgba(79,142,247,0.15);
          border-radius:10px; padding:16px 20px;
          font-size:13px; color:var(--soft); display:flex; gap:12; align-items:flex-start;
        }

        @media (max-width:680px) {
          .form-grid { grid-template-columns:1fr; }
          .fg.full { grid-column:auto; }
          .card { padding:24px 20px; }
          .reg-wrap { padding:32px 16px; }
        }
      `}</style>

      <div className="reg-wrap">
        <div style={{ width: '100%', maxWidth: '640px' }}>
          <div className="logo">
            <span className="logo-c">Campus</span>
            <span className="logo-r">Connect</span>
          </div>
        </div>

        <div className="page-header">
          <h1 className="page-title">Create Student Account</h1>
          <p className="page-sub">Join your college&apos;s exclusive marketplace</p>
        </div>

        {/* ── SUCCESS STATE ── */}
        {submitted ? (
          <div className="card success-card">
            <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 800, color: '#10B981', marginBottom: 12 }}>
              Registration Submitted!
            </h2>
            <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.7, maxWidth: 380, margin: '0 auto' }}>
              Your request has been sent to your <strong style={{ color: '#F0F4FF' }}>college admin</strong> for review.
              You&apos;ll receive an email notification once approved (usually within 24–48 hours).
            </p>
            <p style={{ color: '#6B7280', fontSize: 12, marginTop: 16 }}>Redirecting you…</p>
          </div>
        ) : (
          <div className="card">
            {submitError && (
              <div className="err-box">
                <span>⚠️</span>
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">

                {/* Full Name */}
                <div className="fg full">
                  <label className="label" htmlFor="s-name">
                    Full Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="s-name" type="text" className="input"
                    placeholder="Arjun Sharma"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                {/* Email */}
                <div className="fg full">
                  <label className="label" htmlFor="s-email">
                    Email Address <span className="required-star">*</span>
                  </label>
                  <input
                    id="s-email" type="email" className="input"
                    placeholder="cse.230840131027@gmail.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                  <p className="helper">
                    Use your enrollment-style email (e.g. cse.id@gmail.com) or any personal email
                  </p>
                </div>

                {/* College Code — IMPORTANT */}
                <div className="fg full">
                  <label className="label" htmlFor="s-code">
                    College Code <span className="required-star">*</span>
                    <span style={{
                      marginLeft: 8, display: 'inline-flex', alignItems: 'center',
                      background: 'rgba(247,201,72,0.12)', color: '#F7C948',
                      borderRadius: 9999, padding: '2px 8px', fontSize: 10, fontWeight: 700,
                      letterSpacing: '0.5px',
                    }}>VERY IMPORTANT</span>
                  </label>
                  <input
                    id="s-code" type="text" className="input mono"
                    placeholder="e.g. SSVEC2024"
                    value={form.collegeCode}
                    onChange={e => setForm({ ...form, collegeCode: e.target.value.toUpperCase() })}
                    maxLength={20}
                    required
                  />
                  <div className="code-hint">
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>🔑</span>
                    <p>
                      The <strong>College Code</strong> identifies which college you belong to and creates your marketplace.
                      Ask your college admin or check your institution&apos;s notice board for this code.
                    </p>
                  </div>
                </div>

                {/* Password */}
                <div className="fg">
                  <label className="label" htmlFor="s-password">
                    Password <span className="required-star">*</span>
                  </label>
                  <div className="input-wrap">
                    <input
                      id="s-password"
                      type={showPwd ? 'text' : 'password'}
                      className="input has-right"
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      required
                    />
                    <button
                      type="button" className="eye-btn"
                      onClick={() => setShowPwd(v => !v)}
                      aria-label={showPwd ? 'Hide' : 'Show'}
                    >
                      {showPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {form.password && (
                    <>
                      <div className="strength-track">
                        <div className="strength-fill" style={{ width: `${(strength.level / 3) * 100}%`, background: strength.color }} />
                      </div>
                      <p className="helper" style={{ color: strength.color }}>{strength.label} password</p>
                    </>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="fg">
                  <label className="label" htmlFor="s-confirm">
                    Confirm Password <span className="required-star">*</span>
                  </label>
                  <div className="input-wrap">
                    <input
                      id="s-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      className="input has-right"
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button" className="eye-btn"
                      onClick={() => setShowConfirm(v => !v)}
                      aria-label={showConfirm ? 'Hide' : 'Show'}
                    >
                      {showConfirm ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {form.confirmPassword && !passwordMatch && (
                    <p className="helper bad">Passwords do not match</p>
                  )}
                  {form.confirmPassword && passwordMatch && (
                    <p className="helper good">✓ Passwords match</p>
                  )}
                </div>

                {/* Phone — optional */}
                <div className="fg">
                  <label className="label" htmlFor="s-phone">
                    Phone Number
                    <span className="optional-tag">(optional)</span>
                  </label>
                  <input
                    id="s-phone" type="tel" className="input"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                {/* Enrollment ID — optional */}
                <div className="fg">
                  <label className="label" htmlFor="s-enroll">
                    Enrollment / Roll ID
                    <span className="optional-tag">(optional)</span>
                  </label>
                  <input
                    id="s-enroll" type="text" className="input mono"
                    placeholder="CSE230840131027"
                    value={form.enrollmentId}
                    onChange={e => setForm({ ...form, enrollmentId: e.target.value })}
                  />
                </div>

              </div>

              <button
                id="student-register-btn"
                type="submit"
                className="submit-btn"
                disabled={!canSubmit}
              >
                {loading ? (
                  <><div className="spinner" /> Creating Account…</>
                ) : (
                  <>Create Account &amp; Request Approval →</>
                )}
              </button>
            </form>
          </div>
        )}

        <div className="info-card">
          <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>ℹ️</span>
          <span>
            After registration your request goes to your <strong>college admin</strong> for approval.
            Once approved, you can log in and access your college&apos;s exclusive marketplace.
          </span>
        </div>

        <div className="already-link">
          Already have an account? <Link href="/login">Sign in →</Link>
        </div>
      </div>
    </>
  );
}
