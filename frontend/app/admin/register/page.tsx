'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

const COLLEGE_TYPES = ['Engineering', 'Medical', 'Arts', 'Commerce', 'Science', 'Management', 'Law'];

export default function AdminRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [codeAvailable, setCodeAvailable] = useState<boolean | null>(null);
  const [checkingCode, setCheckingCode] = useState(false);

  // Email verification state
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  const otpInputsRef = useRef<HTMLInputElement[]>([]);

  const [step1, setStep1] = useState({
    collegeName: '',
    city: '',
    emailDomain: '',
    collegeCode: '',
    collegeType: '',
  });

  const [step2, setStep2] = useState({
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
    authorized: false,
  });

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const passwordStrength = (pwd: string) => {
    if (pwd.length === 0) return { level: 0, label: '', color: '' };
    if (pwd.length < 6) return { level: 1, label: 'Weak', color: '#EF4444' };
    if (pwd.length < 10 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { level: 2, label: 'Medium', color: '#F59E0B' };
    return { level: 3, label: 'Strong', color: '#10B981' };
  };

  const strength = passwordStrength(step2.password);

  // Check college code uniqueness on blur
  const handleCodeBlur = async () => {
    if (!step1.collegeCode.trim()) return;
    setCheckingCode(true);
    try {
      const { data } = await api.get<{ available: boolean }>('/api/auth/admin/check-code', {
        params: { code: step1.collegeCode.toUpperCase() },
      });
      setCodeAvailable(data.available);
    } catch {
      setCodeAvailable(null);
    } finally {
      setCheckingCode(false);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeAvailable === false) return;
    setStep(2);
  };

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showVerification && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showVerification, resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpInputsRef.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      otpInputsRef.current[5]?.focus();
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step2.password !== step2.confirmPassword) return;
    setSubmitError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/admin/register', {
        collegeName: step1.collegeName,
        city: step1.city,
        emailDomain: step1.emailDomain,
        collegeCode: step1.collegeCode,
        collegeType: step1.collegeType,
        adminName: step2.adminName,
        adminEmail: step2.adminEmail,
        password: step2.password,
      });

      if (data.status === 'VERIFICATION_REQUIRED') {
        setVerificationEmail(data.email);
        setMaskedEmail(data.maskedEmail);
        setResendTimer(60);
        setCanResend(false);
        setOtp(Array(6).fill(''));
        setVerificationError('');
        setShowVerification(true);
      } else {
        setSubmitted(true);
        setTimeout(() => router.push('/admin/login'), 3000);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Registration failed. Please try again.';
      setSubmitError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) return;

    setVerificationError('');
    setVerifying(true);
    try {
      await api.post('/api/auth/admin/register/verify', {
        email: verificationEmail,
        otp: fullOtp,
      });

      setSubmitted(true);
      setShowVerification(false);
      setTimeout(() => router.push('/admin/login'), 3500);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Invalid verification OTP. Please try again.';
      setVerificationError(msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setVerificationError('');
    setCanResend(false);
    setResendTimer(60);
    try {
      await api.post('/api/auth/admin/register/resend', {
        email: verificationEmail,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Failed to resend OTP. Please try again.';
      setVerificationError(msg);
      setCanResend(true);
    }
  };

  // Auto-submit OTP when 6 digits are complete
  useEffect(() => {
    const fullOtp = otp.join('');
    if (fullOtp.length === 6 && showVerification) {
      handleVerifyOtp();
    }
  }, [otp, showVerification]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --bg-primary: #0A0E1A;
          --bg-card: #111827;
          --bg-card2: #1a2235;
          --border: #1e2d45;
          --accent-green: #10B981;
          --text-primary: #F0F4FF;
          --text-muted: #6B7280;
          --text-soft: #9CA3AF;
        }
        body { font-family: 'DM Sans', sans-serif; background: var(--bg-primary); color: var(--text-primary); min-height: 100vh; }

        .page-wrap {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 24px;
          position: relative;
          animation: fadeIn 0.4s ease;
        }

        .page-wrap::before {
          content: '';
          position: fixed;
          top: -80px; left: -80px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .logo {
          font-family: 'Sora', sans-serif;
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 8px;
          align-self: flex-start;
          max-width: 640px;
          width: 100%;
        }
        .logo-campus { color: var(--accent-green); }
        .logo-connect { color: var(--text-primary); }

        .page-header { width: 100%; max-width: 640px; margin-bottom: 32px; }
        .page-title {
          font-family: 'Sora', sans-serif;
          font-size: 32px; font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .page-subtitle { font-size: 14px; color: var(--text-muted); }

        /* STEP INDICATOR */
        .step-indicator {
          display: flex;
          align-items: center;
          gap: 0;
          width: 100%;
          max-width: 640px;
          margin-bottom: 32px;
        }
        .step-item {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }
        .step-circle {
          width: 32px; height: 32px;
          border-radius: 50%;
          border: 2px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700;
          transition: all 0.3s;
          background: var(--bg-card2);
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .step-circle.active { border-color: var(--accent-green); color: var(--accent-green); background: rgba(16,185,129,0.1); }
        .step-circle.done { border-color: var(--accent-green); background: var(--accent-green); color: #003824; }
        .step-label { font-size: 13px; color: var(--text-muted); }
        .step-label.active { color: var(--text-primary); font-weight: 600; }
        .step-connector { height: 2px; background: var(--border); flex: 1; margin: 0 12px; transition: background 0.3s; }
        .step-connector.done { background: var(--accent-green); }

        /* CARD */
        .form-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 32px;
          width: 100%;
          max-width: 640px;
        }
        .card-title {
          font-family: 'Sora', sans-serif;
          font-size: 22px; font-weight: 700;
          margin-bottom: 24px;
          color: var(--text-primary);
        }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { margin-bottom: 0; }
        .form-group.full { grid-column: 1 / -1; }

        .form-label {
          display: block;
          font-size: 11px; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .form-input {
          width: 100%;
          background: var(--bg-card2);
          border: 1.5px solid var(--border);
          color: var(--text-primary);
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input::placeholder { color: var(--text-muted); }
        .form-input:focus { border-color: var(--accent-green); box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
        .form-input.mono { font-family: 'JetBrains Mono', monospace; font-size: 13px; }
        select.form-input { cursor: pointer; }
        select.form-input option { background: var(--bg-card); }

        .helper-text { font-size: 12px; color: var(--text-muted); margin-top: 6px; }

        .password-wrapper { position: relative; }
        .eye-btn {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 16px;
        }
        .eye-btn:hover { color: var(--text-primary); }

        .strength-bar { margin-top: 8px; }
        .strength-track { height: 4px; background: var(--border); border-radius: 9999px; overflow: hidden; }
        .strength-fill { height: 100%; border-radius: 9999px; transition: width 0.3s, background 0.3s; }
        .strength-label { font-size: 11px; margin-top: 4px; font-weight: 600; }

        .checkbox-row {
          display: flex; align-items: flex-start; gap: 12px; margin-top: 4px;
        }
        .checkbox-input {
          width: 18px; height: 18px; border-radius: 4px;
          border: 1.5px solid var(--border);
          accent-color: var(--accent-green);
          cursor: pointer; flex-shrink: 0; margin-top: 2px;
        }
        .checkbox-label { font-size: 13px; color: var(--text-soft); line-height: 1.5; }

        .action-row { display: flex; gap: 12px; margin-top: 24px; align-items: center; }
        .btn-primary {
          flex: 1; background: var(--accent-green); color: #003824; border: none;
          padding: 14px 24px; border-radius: 9999px;
          font-size: 14px; font-family: 'DM Sans', sans-serif; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 20px rgba(16,185,129,0.3); }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-back {
          background: none; border: none; color: var(--text-muted);
          font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: color 0.2s;
        }
        .btn-back:hover { color: var(--accent-green); }

        /* INFO CARD */
        .info-card {
          margin-top: 20px;
          background: rgba(16,185,129,0.05);
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: 10px;
          padding: 16px 20px;
          font-size: 13px;
          color: var(--text-soft);
          display: flex; gap: 12px; align-items: flex-start;
          width: 100%; max-width: 640px;
        }
        .info-icon { font-size: 18px; flex-shrink: 0; margin-top: 2px; }

        .already-link {
          margin-top: 20px;
          text-align: center;
          font-size: 13px;
          color: var(--text-muted);
        }
        .already-link a { color: var(--accent-green); text-decoration: none; }
        .already-link a:hover { text-decoration: underline; }

        /* Split-OTP Input styling */
        .otp-container {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin: 28px 0 16px 0;
        }
        .otp-input {
          width: 54px;
          height: 64px;
          background: var(--bg-card2);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 28px;
          font-weight: 800;
          text-align: center;
          outline: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .otp-input:focus {
          border-color: var(--accent-green);
          box-shadow: 0 0 0 4px rgba(16, 185, 201, 0.18), 0 10px 15px -3px rgba(0, 0, 0, 0.3);
          transform: translateY(-2px);
        }
        .otp-input.filled {
          border-color: rgba(16, 185, 201, 0.6);
        }
        .verification-card {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .timer-text {
          font-size: 13px;
          color: var(--text-muted);
          text-align: center;
          margin-top: 18px;
        }
        .resend-btn {
          background: none;
          border: none;
          color: var(--accent-green);
          cursor: pointer;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }
        .resend-btn:hover:not(:disabled) {
          text-decoration: underline;
        }
        .resend-btn:disabled {
          color: var(--text-muted);
          cursor: not-allowed;
        }

        @media (max-width: 700px) {
          .form-grid { grid-template-columns: 1fr; }
          .form-group.full { grid-column: auto; }
        }
      `}</style>

      <div className="page-wrap">
        <div style={{ width: '100%', maxWidth: '640px' }}>
          <div className="logo">
            <span className="logo-campus">Campus</span>
            <span className="logo-connect">Connect</span>
          </div>
        </div>

        <div className="page-header">
          <h1 className="page-title">Register Your College</h1>
          <p className="page-subtitle">Set up your college marketplace in minutes</p>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator">
          <div className="step-item">
            <div className={`step-circle ${step > 1 ? 'done' : 'active'}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span className={`step-label ${step === 1 ? 'active' : ''}`}>College Info</span>
          </div>
          <div className={`step-connector ${step > 1 ? 'done' : ''}`} />
          <div className="step-item">
            <div className={`step-circle ${step === 2 ? 'active' : ''}`}>2</div>
            <span className={`step-label ${step === 2 ? 'active' : ''}`}>Admin Account</span>
          </div>
        </div>

        {/* SUCCESS STATE */}
        {submitted && (
          <div className="form-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 700, color: '#10B981', marginBottom: 8 }}>Registration Submitted!</h2>
            <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.6 }}>
              Your college registration is under review. You will hear back within <strong style={{ color: '#F0F4FF' }}>24–48 hours</strong>.
              <br />Redirecting to login…
            </p>
          </div>
        )}

        {/* STEP 1 */}
        {!submitted && !showVerification && step === 1 && (
          <div className="form-card">
            <h2 className="card-title">College Information</h2>
            <form onSubmit={handleStep1Submit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label" htmlFor="college-name">College Full Name</label>
                  <input id="college-name" type="text" className="form-input" placeholder="MIT College of Engineering"
                    value={step1.collegeName} onChange={e => setStep1({ ...step1, collegeName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="college-city">College City</label>
                  <input id="college-city" type="text" className="form-input" placeholder="Mumbai, Maharashtra"
                    value={step1.city} onChange={e => setStep1({ ...step1, city: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="college-type">College Type</label>
                  <select id="college-type" className="form-input"
                    value={step1.collegeType} onChange={e => setStep1({ ...step1, collegeType: e.target.value })} required>
                    <option value="">Select type...</option>
                    {COLLEGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group full">
                  <label className="form-label" htmlFor="email-domain">Student Email Domain <span style={{ color: '#6B7280', fontSize: 10, fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(for student verification)</span></label>
                  <input id="email-domain" type="text" className="form-input" placeholder="college.edu"
                    value={step1.emailDomain} onChange={e => setStep1({ ...step1, emailDomain: e.target.value })} required />
                  <p className="helper-text">Optional domain used to identify your college's student emails (e.g. @ssit.edu). Students can use any email but this helps associate them.</p>
                </div>
                <div className="form-group full">
                  <label className="form-label" htmlFor="college-code">
                    Unique College Code
                    <span style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', background: 'rgba(247,201,72,0.12)', color: '#F7C948', borderRadius: 9999, padding: '2px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.5px' }}>VERY IMPORTANT</span>
                  </label>
                  <input id="college-code" type="text" className="form-input mono" placeholder="SSVEC2024"
                    value={step1.collegeCode}
                    onChange={e => { setStep1({ ...step1, collegeCode: e.target.value.toUpperCase() }); setCodeAvailable(null); }}
                    onBlur={handleCodeBlur}
                    required />
                  {checkingCode && <p className="helper-text">Checking availability…</p>}
                  {!checkingCode && codeAvailable === true && <p className="helper-text" style={{ color: '#10B981' }}>✓ Code is available</p>}
                  {!checkingCode && codeAvailable === false && <p className="helper-text" style={{ color: '#EF4444' }}>✗ Code already taken. Choose a different code.</p>}
                  {!checkingCode && codeAvailable === null && step1.collegeCode && <p className="helper-text">This code creates your college's marketplace. Students use it to join. Cannot be changed later.</p>}
                  {!step1.collegeCode && <p className="helper-text">This code creates your college's marketplace. Students use it to join. Cannot be changed later.</p>}
                </div>
              </div>
              <div className="action-row">
                <button type="submit" className="btn-primary" disabled={codeAvailable === false}>Next: Admin Account →</button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2 */}
        {!submitted && !showVerification && step === 2 && (
          <div className="form-card">
            <h2 className="card-title">Admin Account Details</h2>
            <form onSubmit={handleStep2Submit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="admin-name">Admin Full Name</label>
                  <input id="admin-name" type="text" className="form-input" placeholder="Dr. Priya Mehta"
                    value={step2.adminName} onChange={e => setStep2({ ...step2, adminName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="admin-email">Your Personal Email</label>
                  <input id="admin-email" type="email" className="form-input" placeholder="any.valid@gmail.com"
                    value={step2.adminEmail} onChange={e => setStep2({ ...step2, adminEmail: e.target.value })} required />
                  <p className="helper-text">Use any valid personal or professional email — no restriction</p>
                </div>
                <div className="form-group full">
                  <label className="form-label" htmlFor="reg-password">Password</label>
                  <div className="password-wrapper">
                    <input id="reg-password" type={showPwd ? 'text' : 'password'} className="form-input"
                      placeholder="Create a strong password" style={{ paddingRight: '44px' }}
                      value={step2.password} onChange={e => setStep2({ ...step2, password: e.target.value })} required />
                    <button type="button" className="eye-btn" onClick={() => setShowPwd(!showPwd)} aria-label="Toggle password">{showPwd ? '🙈' : '👁️'}</button>
                  </div>
                  {step2.password && (
                    <div className="strength-bar">
                      <div className="strength-track">
                        <div className="strength-fill" style={{ width: `${(strength.level / 3) * 100}%`, background: strength.color }} />
                      </div>
                      <div className="strength-label" style={{ color: strength.color }}>{strength.label}</div>
                    </div>
                  )}
                </div>
                <div className="form-group full">
                  <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
                  <div className="password-wrapper">
                    <input id="confirm-password" type={showConfirmPwd ? 'text' : 'password'} className="form-input"
                      placeholder="Repeat password" style={{ paddingRight: '44px' }}
                      value={step2.confirmPassword} onChange={e => setStep2({ ...step2, confirmPassword: e.target.value })} required />
                    <button type="button" className="eye-btn" onClick={() => setShowConfirmPwd(!showConfirmPwd)} aria-label="Toggle confirm password">{showConfirmPwd ? '🙈' : '👁️'}</button>
                  </div>
                  {step2.confirmPassword && step2.password !== step2.confirmPassword && (
                    <p className="helper-text" style={{ color: '#EF4444' }}>Passwords do not match</p>
                  )}
                </div>
                <div className="form-group full">
                  <div className="checkbox-row">
                    <input id="authorized" type="checkbox" className="checkbox-input"
                      checked={step2.authorized} onChange={e => setStep2({ ...step2, authorized: e.target.checked })} required />
                    <label htmlFor="authorized" className="checkbox-label">
                      I confirm I am an authorized representative of this institution and have permission to register it on CampusConnect
                    </label>
                  </div>
                </div>
              </div>
              {submitError && (
                <p style={{ color: '#EF4444', fontSize: 13, marginTop: 12 }}>⚠️ {submitError}</p>
              )}
              <div className="action-row">
                <button type="button" className="btn-back" onClick={() => setStep(1)}>← Back to College Info</button>
                <button type="submit" className="btn-primary" disabled={loading || step2.password !== step2.confirmPassword || !step2.authorized}>
                  {loading ? '⏳ Submitting...' : 'Submit Registration →'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* OTP VERIFICATION STEP */}
        {!submitted && showVerification && (
          <div className="form-card verification-card">
            <h2 className="card-title" style={{ textAlign: 'center', marginBottom: 8 }}>Verify Your Email</h2>
            <p style={{ color: 'var(--text-soft)', fontSize: 14, lineHeight: 1.6, textAlign: 'center', marginBottom: 20 }}>
              We have sent a 6-digit verification code to <strong style={{ color: 'var(--accent-green)' }}>{maskedEmail}</strong>. Please enter it below to complete registration.
            </p>

            {verificationError && (
              <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>⚠️ {verificationError}</p>
            )}

            <form onSubmit={handleVerifyOtp}>
              <div className="otp-container">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      if (el) otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    maxLength={1}
                    className={`otp-input ${digit ? 'filled' : ''}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                    disabled={verifying}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              <div className="action-row" style={{ marginTop: 24 }}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={otp.join('').length < 6 || verifying}
                >
                  {verifying ? '⏳ Verifying OTP...' : 'Complete Verification & Submit →'}
                </button>
              </div>
            </form>

            <div className="timer-text">
              {resendTimer > 0 ? (
                <span>Resend code in <strong style={{ color: 'var(--text-primary)' }}>{resendTimer}s</strong></span>
              ) : (
                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleResendOtp}
                  disabled={!canResend}
                >
                  Resend Verification Code
                </button>
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button
                type="button"
                onClick={() => setShowVerification(false)}
                className="btn-back"
                style={{ fontSize: 13, textDecoration: 'underline' }}
              >
                ← Back to registration form
              </button>
            </div>
          </div>
        )}

        <div className="info-card">
          <span className="info-icon">ℹ️</span>
          <span>After submission, your request will be reviewed by the CampusConnect team within <strong>24–48 hours</strong>. You'll receive an email upon approval.</span>
        </div>

        <div className="already-link">
          Already registered? <Link href="/admin/login">Sign in →</Link>
        </div>
      </div>
    </>
  );
}
