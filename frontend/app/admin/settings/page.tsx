'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../store/authStore';

const API = 'http://localhost:5000/api/admin';

interface SettingsData {
  admin: { id: string; name: string; email: string };
  college: { name: string; code: string; emailDomain: string; type: string | null; city: string | null };
}

const STRENGTHS = ['', '', 'Weak', 'Fair', 'Good', 'Strong'];
const SCOLS = ['', '', '#EF4444', '#F59E0B', '#4F8EF7', '#10B981'];
const getStrength = (pw: string) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};

function getInitials(name: string) {
  if (!name) return 'AD';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

export default function AdminSettingsPage() {
  const { accessToken } = useAuthStore();
  const [data, setData] = useState<SettingsData | null>(null);
  const [name, setName] = useState('');
  const [security, setSecurity] = useState({ cur: '', newpw: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const fetchSettings = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API}/settings`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const d = await res.json();
      setData(d);
      setName(d.admin?.name || '');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [accessToken]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/settings/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ name }),
      });
      const d = await res.json();
      if (res.ok) { showToast('✓ Profile saved!'); setData(prev => prev ? { ...prev, admin: { ...prev.admin, name } } : prev); }
      else showToast(d.message || 'Failed to save', 'error');
    } catch { showToast('Network error', 'error'); }
  };

  const handleSavePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (security.newpw !== security.confirm) { showToast('Passwords do not match', 'error'); return; }
    if (security.newpw.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
    try {
      const res = await fetch(`${API}/settings/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ currentPassword: security.cur, newPassword: security.newpw }),
      });
      const d = await res.json();
      if (res.ok) { showToast('✓ Password updated!'); setSecurity({ cur: '', newpw: '', confirm: '' }); }
      else showToast(d.message || 'Failed to update', 'error');
    } catch { showToast('Network error', 'error'); }
  };

  const strength = getStrength(security.newpw);
  const scol = SCOLS[strength];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        :root{--bg:#0A0E1A;--card:#111827;--card2:#1a2235;--border:#1e2d45;--green:#10B981;--blue:#4F8EF7;--red:#EF4444;--txt:#F0F4FF;--mut:#6B7280;--soft:#9CA3AF}
        .page{background:var(--bg);min-height:100vh;padding:36px 40px;animation:fi .35s ease}
        @keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        h1{font-family:'Sora',sans-serif;font-size:28px;font-weight:700;margin-bottom:4px;color:var(--txt)}
        .sub{font-size:14px;color:var(--mut);margin-bottom:26px}
        .cols{display:grid;grid-template-columns:1.1fr 1fr;gap:20px;align-items:start}
        .col-l,.col-r{display:flex;flex-direction:column;gap:16px}
        .card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:22px;transition:border-color .2s}
        .card:hover{border-color:rgba(16,185,129,.2)}
        .card.danger{border-color:rgba(239,68,68,.25)}
        .card-title{font-family:'Sora',sans-serif;font-size:17px;font-weight:700;margin-bottom:16px;color:var(--txt)}
        .card-note{font-size:12px;color:var(--mut);margin-left:6px;font-weight:400}
        .avatar{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#10B981,#4F8EF7);display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif;font-size:20px;font-weight:700;color:#003822;margin-bottom:12px}
        .profile-name{font-family:'Sora',sans-serif;font-size:22px;font-weight:700;margin-bottom:4px;color:var(--txt)}
        .role-pill{display:inline-flex;align-items:center;background:rgba(16,185,129,.12);color:var(--green);border:1px solid rgba(16,185,129,.3);border-radius:9999px;padding:3px 10px;font-size:12px;font-weight:700;margin-bottom:6px}
        .p-email{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--mut);margin-bottom:4px}
        .p-college{font-size:13px;color:var(--soft);margin-bottom:12px}
        .fg{margin-bottom:14px}
        label{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--mut);margin-bottom:7px}
        .fi{width:100%;background:var(--card2);border:1.5px solid var(--border);border-radius:9px;color:var(--txt);padding:10px 13px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s,box-shadow .2s}
        .fi::placeholder{color:var(--mut)}
        .fi:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(16,185,129,.1)}
        .save-btn{background:var(--green);color:#003822;border:none;border-radius:9999px;padding:10px 22px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s}
        .save-btn:hover{transform:translateY(-1px);box-shadow:0 0 14px rgba(16,185,129,.3)}
        .info-row{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(30,45,69,.5)}
        .info-row:last-child{border-bottom:none}
        .info-key{font-size:13px;color:var(--mut)}
        .info-val{font-size:13px;font-weight:600;color:var(--txt)}
        .code-badge{font-family:'JetBrains Mono',monospace;font-size:12px;background:rgba(16,185,129,.1);color:var(--green);border:1px solid rgba(16,185,129,.25);padding:2px 8px;border-radius:6px}
        .strength-bar{display:flex;gap:4px;margin-top:6px}
        .sb{height:4px;flex:1;border-radius:2px;background:var(--border);transition:background .3s}
        .strength-label{font-size:11px;margin-top:4px;font-weight:700}
        .skeleton{background:linear-gradient(90deg,var(--card2) 25%,#202d42 50%,var(--card2) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes toast-in{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        .toast{position:fixed;top:24px;right:28px;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:700;z-index:2000;animation:toast-in .3s ease}
        .toast-success{background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.4);color:var(--green)}
        .toast-error{background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.4);color:var(--red)}
        @media(max-width:900px){.cols{grid-template-columns:1fr}}
      `}</style>

      {toast && <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>{toast.msg}</div>}

      <div className="page">
        <h1>Admin Settings</h1>
        <p className="sub">Manage your college profile, account, and security</p>

        <div className="cols">
          <div className="col-l">
            {/* Profile card */}
            <div className="card">
              {loading ? <div className="skeleton" style={{height:100}} /> : <>
                <div className="avatar">{getInitials(data?.admin.name || '')}</div>
                <div className="profile-name">{data?.admin.name}</div>
                <span className="role-pill">College Admin</span>
                <div className="p-email">{data?.admin.email}</div>
                <div className="p-college">{data?.college.name}</div>
              </>}
            </div>

            {/* Edit name */}
            <div className="card">
              <div className="card-title">Personal Information</div>
              <form onSubmit={handleSaveProfile}>
                <div className="fg">
                  <label>Full Name</label>
                  <input className="fi" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
                </div>
                <div className="fg">
                  <label>Email Address (read-only)</label>
                  <input className="fi" value={data?.admin.email || ''} disabled style={{opacity:.55}} />
                </div>
                <button type="submit" className="save-btn">Save Changes</button>
              </form>
            </div>

            {/* College info */}
            <div className="card">
              <div className="card-title">College Details <span className="card-note">— Contact Support to change</span></div>
              {loading ? <div className="skeleton" style={{height:120}} /> : [
                ['College Name', data?.college.name || '—', false],
                ['College Code', data?.college.code || '—', true],
                ['Email Domain', `@${data?.college.emailDomain || '—'}`, false],
                ['College Type', data?.college.type || 'N/A', false],
                ['City', data?.college.city || 'N/A', false],
              ].map(([k, v, mono]) => (
                <div className="info-row" key={String(k)}>
                  <span className="info-key">{k}</span>
                  {mono ? <span className="code-badge">{v}</span> : <span className="info-val">{v}</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="col-r">
            {/* Password */}
            <div className="card">
              <div className="card-title">Change Password</div>
              <form onSubmit={handleSavePw}>
                <div className="fg">
                  <label>Current Password</label>
                  <input type="password" className="fi" value={security.cur} placeholder="••••••••" onChange={e => setSecurity(s => ({ ...s, cur: e.target.value }))} required />
                </div>
                <div className="fg">
                  <label>New Password</label>
                  <input type="password" className="fi" value={security.newpw} placeholder="••••••••" onChange={e => setSecurity(s => ({ ...s, newpw: e.target.value }))} required />
                  {security.newpw && (
                    <>
                      <div className="strength-bar">
                        {[1, 2, 3, 4].map(i => <div key={i} className="sb" style={{ background: i <= strength ? scol : undefined }} />)}
                      </div>
                      <div className="strength-label" style={{ color: scol }}>{STRENGTHS[strength]}</div>
                    </>
                  )}
                </div>
                <div className="fg">
                  <label>Confirm New Password</label>
                  <input type="password" className="fi" value={security.confirm} placeholder="••••••••" onChange={e => setSecurity(s => ({ ...s, confirm: e.target.value }))} required />
                </div>
                <button type="submit" className="save-btn">Update Password</button>
              </form>
            </div>

            {/* Session info */}
            <div className="card">
              <div className="card-title">Account Info</div>
              <div className="info-row">
                <span className="info-key">Account Status</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', padding: '2px 10px', borderRadius: 9999 }}>✓ Active</span>
              </div>
              <div className="info-row">
                <span className="info-key">Role</span>
                <span className="info-val">College Admin</span>
              </div>
              <div className="info-row">
                <span className="info-key">Platform</span>
                <span className="info-val">CampusConnect</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
