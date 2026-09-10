'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, Lock, Key, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { setPendingEmail, setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'input' | 'sent' | 'done'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [instantMessage, setInstantMessage] = useState<string | null>(null);

  // Reset fields
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Dynamic live password strength analysis
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: 'None', color: '#64748B', width: '0%' };
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: '#EF4444', width: '25%' };
    if (score === 2) return { score: 2, label: 'Fair', color: '#F59E0B', width: '50%' };
    if (score === 3) return { score: 3, label: 'Good', color: '#3B82F6', width: '75%' };
    return { score: 4, label: 'Strong', color: '#10B981', width: '100%' };
  }, [newPassword]);

  // Match validation helper
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return newPassword === confirmPassword;
  }, [newPassword, confirmPassword]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setError('Please enter your email address.');
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post<{ message: string; maskedEmail: string; devOtp?: string; instantMessage?: string }>(
        '/api/auth/student/send-otp',
        { email: email.trim().toLowerCase() }
      );
      setMaskedEmail(data.maskedEmail || email);
      setDevOtp(data.devOtp || null);
      setInstantMessage(data.instantMessage || 'Verification OTP dispatched to your email.');
      setPendingEmail(email.trim().toLowerCase(), data.maskedEmail || email, data.devOtp, data.instantMessage);
      if (data.devOtp) setOtp(data.devOtp);
      setStep('sent');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const [userRole, setUserRole] = useState<'STUDENT' | 'COLLEGE_ADMIN'>('STUDENT');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter and confirm.');
      return;
    }

    setError('');
    setResetting(true);

    try {
      const { data } = await api.post<{
        status: 'APPROVED' | 'PENDING';
        role?: 'STUDENT' | 'COLLEGE_ADMIN';
        message: string;
        accessToken?: string;
        user?: any;
      }>('/api/auth/student/reset-password', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword: newPassword.trim(),
      });

      const role = data.role === 'COLLEGE_ADMIN' ? 'COLLEGE_ADMIN' : 'STUDENT';
      setUserRole(role);
      setStep('done');

      if (data.status === 'PENDING') {
        setTimeout(() => {
          router.push('/pending-approval');
        }, 2000);
      } else if (data.status === 'APPROVED' && data.accessToken && data.user) {
        setAuth(data.accessToken, data.user, role, data.user.collegeId);
        setTimeout(() => {
          if (role === 'COLLEGE_ADMIN') {
            router.push('/admin/dashboard');
          } else {
            router.push('/marketplace');
          }
        }, 1500);
      } else {
        setTimeout(() => {
          if (role === 'COLLEGE_ADMIN') {
            router.push('/admin/login');
          } else {
            router.push('/login');
          }
        }, 2000);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to reset password. Please verify the code and try again.';
      setError(msg);
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: #0A0E1A; color: #F0F4FF; }

        .page {
          min-height: 100vh;
          background: radial-gradient(ellipse at 20% 50%, rgba(79,142,247,0.08) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.06) 0%, transparent 60%),
                      #0A0E1A;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .card {
          background: rgba(17,24,39,0.92);
          border: 1px solid #1e2d45;
          border-radius: 20px;
          padding: 36px 32px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
          animation: fadeUp 0.4s ease;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .logo {
          font-family: 'Sora', sans-serif;
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 24px;
          display: block;
        }
        .logo-c { color: #F0F4FF; }
        .logo-g { color: #10B981; }

        .icon-wrap {
          width: 52px; height: 52px;
          background: rgba(79,142,247,0.12);
          border: 1px solid rgba(79,142,247,0.25);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
          margin-bottom: 18px;
        }

        h1 {
          font-family: 'Sora', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #F0F4FF;
          margin-bottom: 8px;
        }

        .sub {
          font-size: 13px;
          color: #6B7280;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #9CA3AF;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .input {
          width: 100%;
          background: #1a2235;
          border: 1.5px solid #1e2d45;
          border-radius: 10px;
          color: #F0F4FF;
          padding: 11px 14px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s;
        }
        .input:focus { border-color: #4F8EF7; }
        .input::placeholder { color: #4B5563; }

        .error {
          font-size: 12px;
          color: #EF4444;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn {
          width: 100%;
          background: linear-gradient(135deg, #4F8EF7, #3b7de8);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 700;
          padding: 13px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          margin-top: 8px;
        }
        .btn:hover:not(:disabled) { opacity: 0.9; }
        .btn:active:not(:disabled) { transform: scale(0.98); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .back {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6B7280;
          text-decoration: none;
          margin-top: 20px;
          transition: color 0.2s;
        }
        .back:hover { color: #9CA3AF; }

        .success-icon {
          width: 60px; height: 60px;
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.3);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px;
          margin: 0 auto 18px;
        }
        .email-highlight {
          color: #10B981;
          font-weight: 600;
        }
        .btn-green {
          background: linear-gradient(135deg, #10B981, #059669);
        }

        @media (max-width: 480px) {
          .page {
            padding: 16px 12px !important;
          }
          .card {
            padding: 24px 18px !important;
            border-radius: 16px !important;
          }
          .icon-wrap {
            width: 44px !important;
            height: 44px !important;
            font-size: 20px !important;
            margin-bottom: 14px !important;
          }
          h1 {
            font-size: 20px !important;
          }
          .input {
            height: 46px !important;
            font-size: 14px !important;
          }
          .btn {
            height: 48px !important;
            font-size: 14px !important;
          }
        }
      `}</style>

      <div className="page">
        <div className="card">
          <span className="logo">
            <span className="logo-c">Campus</span><span className="logo-g">Connect</span>
          </span>

          {step === 'input' && (
            <>
              <div className="icon-wrap">🔑</div>
              <h1>Reset Password</h1>
              <p className="sub">
                Enter your registered college email. We will dispatch a 6-digit verification code to reset your account password.
              </p>

              <form onSubmit={handleSend}>
                <div style={{ marginBottom: 16 }}>
                  <label className="label" htmlFor="fp-email">College Email Address</label>
                  <input
                    id="fp-email"
                    type="email"
                    className="input"
                    placeholder="your.name@college.edu"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    autoFocus
                    required
                  />
                </div>

                {error && <div className="error"><AlertCircle size={15} /> <span>{error}</span></div>}

                <button type="submit" className="btn" disabled={loading}>
                  {loading ? 'Sending Verification Code...' : 'Send Reset Code →'}
                </button>
              </form>

              <Link href="/login" className="back">
                ← Back to Login
              </Link>
            </>
          )}

          {step === 'sent' && (
            <>
              <div className="icon-wrap" style={{ background: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.25)', color: '#10B981' }}>
                ✉️
              </div>
              <h1>Set New Password</h1>
              <p className="sub" style={{ marginBottom: 16 }}>
                Enter the 6-digit verification code sent to <span className="email-highlight">{maskedEmail}</span> and establish your new password.
              </p>

              {/* Dev Test Code / Instant Notification */}
              {devOtp && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(79,142,247,0.12))',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 10, padding: '10px 14px', marginBottom: 16, textAlign: 'left',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                    <strong style={{ color: '#10B981' }}>Test Code: </strong>
                    <code style={{ background: '#1a2235', padding: '2px 8px', borderRadius: 6, color: '#F0F4FF', fontSize: 13, letterSpacing: '1px' }}>{devOtp}</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtp(devOtp)}
                    style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid #10B981', color: '#10B981', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Autofill
                  </button>
                </div>
              )}

              {error && <div className="error"><AlertCircle size={15} /> <span>{error}</span></div>}

              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* 6-digit OTP code */}
                <div>
                  <label className="label">6-Digit Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="input"
                    placeholder="e.g. 123456"
                    value={otp}
                    onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                    style={{ letterSpacing: '4px', fontSize: 18, fontWeight: 700, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace" }}
                    autoFocus
                    required
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="label">New Password (min 8 characters)</label>
                  <div style={{ position: 'relative' }}>
                    <Key size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="input"
                      style={{ paddingLeft: 36, paddingRight: 40 }}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setError(''); }}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Dynamic Strength Meter */}
                  {newPassword && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
                        <span style={{ color: '#64748B' }}>Password Strength:</span>
                        <span style={{ color: passwordStrength.color, fontWeight: 700 }}>{passwordStrength.label}</span>
                      </div>
                      <div style={{ width: '100%', height: 4, background: '#1e2d45', borderRadius: 9999, overflow: 'hidden' }}>
                        <div style={{ width: passwordStrength.width, height: '100%', background: passwordStrength.color, transition: 'all 0.2s' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="label">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="input"
                      style={{
                        paddingLeft: 36, paddingRight: 40,
                        borderColor: passwordsMatch === null ? '#1e2d45' : (passwordsMatch ? '#10B981' : '#EF4444')
                      }}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {passwordsMatch !== null && (
                    <div style={{ marginTop: 5, fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, color: passwordsMatch ? '#10B981' : '#EF4444' }}>
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

                <button
                  type="submit"
                  className="btn btn-green"
                  disabled={resetting || passwordsMatch === false || otp.length !== 6}
                >
                  {resetting ? 'Resetting & Logging in...' : 'Reset Password & Continue →'}
                </button>
              </form>

              <button
                className="back"
                style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', justifyContent: 'center' }}
                onClick={() => { setStep('input'); setError(''); }}
              >
                ← Back to enter email again
              </button>
            </>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="success-icon">🎉</div>
              <h1 style={{ marginBottom: 10 }}>Password Reset!</h1>
              <p className="sub" style={{ marginBottom: 20 }}>
                {userRole === 'COLLEGE_ADMIN'
                  ? 'Your administrator password was updated successfully. Taking you directly to the Admin Dashboard...'
                  : 'Your account password was updated successfully. Taking you directly to CampusConnect...'}
              </p>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(16,185,129,0.3)', borderTopColor: '#10B981', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
