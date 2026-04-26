'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const COLLEGE_TYPES = ['Engineering', 'Medical', 'Arts', 'Commerce', 'Science', 'Management', 'Law'];

export default function AdminRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

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

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Connect to /api/auth/admin/register
    setTimeout(() => router.push('/admin/login'), 1500);
  };

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

        {/* STEP 1 */}
        {step === 1 && (
          <div className="form-card">
            <h2 className="card-title">College Information</h2>
            <form onSubmit={handleStep1Submit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label" htmlFor="college-name">College Full Name</label>
                  <input id="college-name" type="text" className="form-input" placeholder="MIT College of Engineering"
                    value={step1.collegeName} onChange={e => setStep1({...step1, collegeName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="college-city">College City</label>
                  <input id="college-city" type="text" className="form-input" placeholder="Mumbai, Maharashtra"
                    value={step1.city} onChange={e => setStep1({...step1, city: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="college-type">College Type</label>
                  <select id="college-type" className="form-input"
                    value={step1.collegeType} onChange={e => setStep1({...step1, collegeType: e.target.value})} required>
                    <option value="">Select type...</option>
                    {COLLEGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group full">
                  <label className="form-label" htmlFor="email-domain">College Email Domain</label>
                  <input id="email-domain" type="text" className="form-input" placeholder="mit.edu"
                    value={step1.emailDomain} onChange={e => setStep1({...step1, emailDomain: e.target.value})} required />
                  <p className="helper-text">Students must register using this domain (e.g. 12345@mit.edu)</p>
                </div>
                <div className="form-group full">
                  <label className="form-label" htmlFor="college-code">Unique College Code</label>
                  <input id="college-code" type="text" className="form-input mono" placeholder="MIT2024"
                    value={step1.collegeCode}
                    onChange={e => setStep1({...step1, collegeCode: e.target.value.toUpperCase()})} required />
                  <p className="helper-text">Students and admins use this code. Cannot be changed later.</p>
                </div>
              </div>
              <div className="action-row">
                <button type="submit" className="btn-primary">Next: Admin Account →</button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="form-card">
            <h2 className="card-title">Admin Account Details</h2>
            <form onSubmit={handleStep2Submit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="admin-name">Admin Full Name</label>
                  <input id="admin-name" type="text" className="form-input" placeholder="Dr. Priya Mehta"
                    value={step2.adminName} onChange={e => setStep2({...step2, adminName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="admin-email">Admin Official Email</label>
                  <input id="admin-email" type="email" className="form-input" placeholder={`admin@${step1.emailDomain || 'college.edu'}`}
                    value={step2.adminEmail} onChange={e => setStep2({...step2, adminEmail: e.target.value})} required />
                </div>
                <div className="form-group full">
                  <label className="form-label" htmlFor="reg-password">Password</label>
                  <div className="password-wrapper">
                    <input id="reg-password" type={showPwd ? 'text' : 'password'} className="form-input"
                      placeholder="Create a strong password" style={{ paddingRight: '44px' }}
                      value={step2.password} onChange={e => setStep2({...step2, password: e.target.value})} required />
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
                      value={step2.confirmPassword} onChange={e => setStep2({...step2, confirmPassword: e.target.value})} required />
                    <button type="button" className="eye-btn" onClick={() => setShowConfirmPwd(!showConfirmPwd)} aria-label="Toggle confirm password">{showConfirmPwd ? '🙈' : '👁️'}</button>
                  </div>
                  {step2.confirmPassword && step2.password !== step2.confirmPassword && (
                    <p className="helper-text" style={{ color: '#EF4444' }}>Passwords do not match</p>
                  )}
                </div>
                <div className="form-group full">
                  <div className="checkbox-row">
                    <input id="authorized" type="checkbox" className="checkbox-input"
                      checked={step2.authorized} onChange={e => setStep2({...step2, authorized: e.target.checked})} required />
                    <label htmlFor="authorized" className="checkbox-label">
                      I confirm I am an authorized representative of this institution and have permission to register it on CampusConnect
                    </label>
                  </div>
                </div>
              </div>
              <div className="action-row">
                <button type="button" className="btn-back" onClick={() => setStep(1)}>← Back to College Info</button>
                <button type="submit" className="btn-primary" disabled={loading || step2.password !== step2.confirmPassword}>
                  {loading ? '⏳ Submitting...' : 'Submit Registration →'}
                </button>
              </div>
            </form>
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
