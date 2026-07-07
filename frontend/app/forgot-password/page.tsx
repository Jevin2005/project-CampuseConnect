'use client';

import { useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://project-campuseconnect.onrender.com';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'input' | 'sent'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setError('Please enter your email address.');
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/student/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMaskedEmail(data.maskedEmail || email);
        setStep('sent');
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
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
          background: rgba(17,24,39,0.9);
          border: 1px solid #1e2d45;
          border-radius: 20px;
          padding: 40px 36px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.4);
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
          margin-bottom: 28px;
          display: block;
        }
        .logo-c { color: #F0F4FF; }
        .logo-g { color: #10B981; }

        .icon-wrap {
          width: 56px; height: 56px;
          background: rgba(79,142,247,0.12);
          border: 1px solid rgba(79,142,247,0.25);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 26px;
          margin-bottom: 20px;
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
          margin-bottom: 28px;
        }

        .label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #9CA3AF;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .input {
          width: 100%;
          background: #1a2235;
          border: 1.5px solid #1e2d45;
          border-radius: 10px;
          color: #F0F4FF;
          padding: 12px 16px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s;
          margin-bottom: 8px;
        }
        .input:focus { border-color: #4F8EF7; }
        .input::placeholder { color: #4B5563; }

        .error {
          font-size: 12px;
          color: #EF4444;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 16px;
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

        /* Success state */
        .success-icon {
          width: 64px; height: 64px;
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.3);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 30px;
          margin: 0 auto 20px;
        }
        .success-title {
          font-family: 'Sora', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #F0F4FF;
          text-align: center;
          margin-bottom: 10px;
        }
        .success-text {
          font-size: 13px;
          color: #9CA3AF;
          text-align: center;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .email-highlight {
          color: #10B981;
          font-weight: 600;
        }
        .btn-green {
          background: linear-gradient(135deg, #10B981, #059669);
        }
      `}</style>

      <div className="page">
        <div className="card">
          <span className="logo">
            <span className="logo-c">Campus</span><span className="logo-g">Connect</span>
          </span>

          {step === 'input' ? (
            <>
              <div className="icon-wrap">🔑</div>
              <h1>Reset Password</h1>
              <p className="sub">
                Enter your registered email. We'll send you a one-time login code so you can access your account and update your password.
              </p>

              <form onSubmit={handleSend}>
                <label className="label" htmlFor="fp-email">Email Address</label>
                <input
                  id="fp-email"
                  type="email"
                  className="input"
                  placeholder="your@college.edu"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  autoFocus
                />
                {error && <div className="error">⚠️ {error}</div>}
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Login Code →'}
                </button>
              </form>

              <Link href="/login" className="back">
                ← Back to Login
              </Link>
            </>
          ) : (
            <>
              <div className="success-icon">✉️</div>
              <div className="success-title">Check your email!</div>
              <p className="success-text">
                We sent a login OTP to{' '}
                <span className="email-highlight">{maskedEmail}</span>.
                <br /><br />
                Use that code on the login page under <strong>"Login with OTP"</strong> to sign in, then change your password from your profile settings.
              </p>

              <Link href="/login">
                <button className="btn btn-green">Go to Login Page →</button>
              </Link>

              <button
                className="back"
                style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', justifyContent: 'center' }}
                onClick={() => { setStep('input'); setError(''); }}
              >
                ← Try a different email
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
