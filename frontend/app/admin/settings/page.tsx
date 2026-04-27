'use client';
import { useState } from 'react';

const NOTIFS = [
  { id:'n1', label:'New student registration requests', on:true },
  { id:'n2', label:'Product submitted for review', on:true },
  { id:'n3', label:'Revenue milestone alerts', on:false },
  { id:'n4', label:'Platform announcements', on:true },
];

const STRENGTHS = ['','','Weak','Fair','Good','Strong'];
const getStrength = (pw:string) => {
  let s=0;
  if (pw.length>=8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};
const SCOLS = ['','','#EF4444','#F59E0B','#4F8EF7','#10B981'];

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState({ name:'Dr. Priya Mehta', display:'Priya Mehta', phone:'+91 98765 43210' });
  const [security, setSecurity] = useState({ cur:'', newpw:'', confirm:'' });
  const [twofa, setTwofa] = useState(false);
  const [notifs, setNotifs] = useState<Record<string,boolean>>({ n1:true, n2:true, n3:false, n4:true });
  const [deactModal, setDeactModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  const strength = getStrength(security.newpw);
  const scol = SCOLS[strength];

  const handleSaveProfile = (e:React.FormEvent) => { e.preventDefault(); setSaved(true); setTimeout(()=>setSaved(false),2500); };
  const handleSavePw = (e:React.FormEvent) => { e.preventDefault(); setPwSaved(true); setSecurity({cur:'',newpw:'',confirm:''}); setTimeout(()=>setPwSaved(false),2500); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        :root{--bg:#0A0E1A;--card:#111827;--card2:#1a2235;--border:#1e2d45;--green:#10B981;--blue:#4F8EF7;--red:#EF4444;--txt:#F0F4FF;--mut:#6B7280;--soft:#9CA3AF}
        body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--txt)}
        .page{background:var(--bg);min-height:100vh;padding:36px 40px;animation:fi .35s ease}
        @keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        h1{font-family:'Sora',sans-serif;font-size:28px;font-weight:700;margin-bottom:4px}
        .sub{font-size:14px;color:var(--mut);margin-bottom:26px}

        .cols{display:grid;grid-template-columns:1.1fr 1fr;gap:20px;align-items:start}
        .col-l,.col-r{display:flex;flex-direction:column;gap:16px}

        .card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:22px;transition:border-color .2s}
        .card:hover{border-color:rgba(16,185,129,.2)}
        .card.danger{border-color:rgba(239,68,68,.25)}
        .card-title{font-family:'Sora',sans-serif;font-size:17px;font-weight:700;margin-bottom:16px}
        .card-note{font-size:12px;color:var(--mut);margin-left:6px;font-weight:400}

        /* PROFILE TOP */
        .avatar{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#10B981,#4F8EF7);display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif;font-size:20px;font-weight:700;color:#003822;margin-bottom:12px}
        .profile-name{font-family:'Sora',sans-serif;font-size:22px;font-weight:700;margin-bottom:4px}
        .role-pill{display:inline-flex;align-items:center;background:rgba(16,185,129,.12);color:var(--green);border:1px solid rgba(16,185,129,.3);border-radius:9999px;padding:3px 10px;font-size:12px;font-weight:700;margin-bottom:6px}
        .p-email{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--mut);margin-bottom:4px}
        .p-college{font-size:13px;color:var(--soft);margin-bottom:12px}
        .edit-pic-btn{background:none;border:1.5px solid var(--border);color:var(--soft);padding:6px 14px;border-radius:9999px;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s}
        .edit-pic-btn:hover{border-color:var(--green);color:var(--green)}

        /* FORM */
        .fg{margin-bottom:14px}
        label{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--mut);margin-bottom:7px}
        .fi{width:100%;background:var(--card2);border:1.5px solid var(--border);border-radius:9px;color:var(--txt);padding:10px 13px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s,box-shadow .2s}
        .fi::placeholder{color:var(--mut)}
        .fi:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(16,185,129,.1)}
        .fi:disabled{opacity:.55;cursor:not-allowed}
        .save-btn{background:var(--green);color:#003822;border:none;border-radius:9999px;padding:10px 22px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s}
        .save-btn:hover{transform:translateY(-1px);box-shadow:0 0 14px rgba(16,185,129,.3)}

        /* COLLEGE INFO ROWS */
        .info-row{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(30,45,69,.5)}
        .info-row:last-child{border-bottom:none}
        .info-key{font-size:13px;color:var(--mut)}
        .info-val{font-size:13px;font-weight:600;color:var(--txt)}
        .code-badge{font-family:'JetBrains Mono',monospace;font-size:12px;background:rgba(16,185,129,.1);color:var(--green);border:1px solid rgba(16,185,129,.25);padding:2px 8px;border-radius:6px}

        /* STRENGTH BAR */
        .strength-bar{display:flex;gap:4px;margin-top:6px}
        .sb{height:4px;flex:1;border-radius:2px;background:var(--border);transition:background .3s}
        .strength-label{font-size:11px;margin-top:4px;font-weight:700}

        /* 2FA + SESSIONS */
        .tfa-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0}
        .tfa-label{font-size:14px;font-weight:600}
        .tfa-sub{font-size:12px;color:var(--mut)}
        .toggle{position:relative;width:44px;height:24px;cursor:pointer}
        .toggle input{opacity:0;width:0;height:0}
        .tslider{position:absolute;inset:0;background:var(--card2);border:1.5px solid var(--border);border-radius:9999px;transition:background .2s}
        .tslider::before{content:'';position:absolute;width:16px;height:16px;background:var(--soft);border-radius:50%;left:3px;top:50%;transform:translateY(-50%);transition:left .2s,background .2s}
        input:checked~.tslider{background:rgba(16,185,129,.2);border-color:rgba(16,185,129,.4)}
        input:checked~.tslider::before{left:21px;background:var(--green)}
        .sess-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-top:1px solid rgba(30,45,69,.5);margin-top:6px}
        .sess-label{font-size:14px;font-weight:600}
        .sess-sub{font-size:12px;color:var(--mut);margin-top:2px}
        .revoke-link{font-size:12px;color:var(--red);cursor:pointer;font-weight:700;text-decoration:underline}
        .revoke-link:hover{opacity:.8}

        /* NOTIF ROWS */
        .notif-row{display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid rgba(30,45,69,.5)}
        .notif-row:last-child{border-bottom:none}
        .notif-lbl{font-size:14px}

        /* DANGER ZONE */
        .dz-row{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
        .dz-info .dz-title{font-size:14px;font-weight:700;color:var(--txt);margin-bottom:4px}
        .dz-info .dz-sub{font-size:12px;color:var(--mut);line-height:1.5;max-width:260px}
        .deact-btn{background:none;border:1.5px solid rgba(239,68,68,.5);color:var(--red);padding:9px 18px;border-radius:9999px;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap;transition:all .18s;flex-shrink:0}
        .deact-btn:hover{background:rgba(239,68,68,.1)}

        /* TOAST */
        @keyframes toast-in{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        .toast{position:fixed;top:24px;right:28px;background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.4);color:var(--green);padding:10px 18px;border-radius:10px;font-size:13px;font-weight:700;z-index:2000;animation:toast-in .3s ease}

        /* MODAL */
        .mo{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center}
        .mb{background:var(--card);border:1px solid rgba(239,68,68,.4);border-radius:18px;padding:28px;max-width:420px;width:90%}
        .mt{font-family:'Sora',sans-serif;font-size:19px;font-weight:700;color:var(--red);margin-bottom:8px}
        .ms{font-size:13px;color:var(--soft);margin-bottom:20px;line-height:1.6}
        .macts{display:flex;gap:10px;justify-content:flex-end}
        .bcnl{background:none;border:1px solid var(--border);color:var(--mut);padding:9px 18px;border-radius:9999px;cursor:pointer;font-size:13px;font-family:'DM Sans',sans-serif}
        .bdeact{background:var(--red);color:#fff;border:none;padding:9px 18px;border-radius:9999px;cursor:pointer;font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif}

        @media(max-width:900px){.cols{grid-template-columns:1fr}}
      `}</style>

      {saved && <div className="toast">✓ Profile saved successfully!</div>}
      {pwSaved && <div className="toast">✓ Password updated!</div>}

      <div className="page">
        <h1>Admin Settings</h1>
        <p className="sub">Manage your college profile, account, and preferences</p>

        <div className="cols">
          {/* LEFT COLUMN */}
          <div className="col-l">
            {/* Profile card */}
            <div className="card">
              <div className="avatar">PA</div>
              <div className="profile-name">Dr. Priya Mehta</div>
              <span className="role-pill">College Admin</span>
              <div className="p-email">priya.mehta@mit.edu</div>
              <div className="p-college">MIT College of Engineering</div>
              <button className="edit-pic-btn">Edit Profile Picture</button>
            </div>

            {/* Personal info */}
            <div className="card">
              <div className="card-title">Personal Information</div>
              <form onSubmit={handleSaveProfile}>
                <div className="fg">
                  <label>Full Name</label>
                  <input className="fi" value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))}/>
                </div>
                <div className="fg">
                  <label>Display Name</label>
                  <input className="fi" value={profile.display} onChange={e=>setProfile(p=>({...p,display:e.target.value}))}/>
                </div>
                <div className="fg">
                  <label>Phone (optional)</label>
                  <input className="fi" value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))}/>
                </div>
                <button type="submit" className="save-btn">Save Changes</button>
              </form>
            </div>

            {/* College info — read only */}
            <div className="card">
              <div className="card-title">College Details <span className="card-note">— Contact Support to change</span></div>
              {[
                ['College Name', 'MIT College of Engineering'],
                ['College Code', 'MIT2024', true],
                ['Email Domain', '@mit.edu'],
                ['College Type', 'Engineering'],
                ['City', 'Mumbai, Maharashtra'],
              ].map(([k,v,mono])=>(
                <div className="info-row" key={String(k)}>
                  <span className="info-key">{k}</span>
                  {mono ? <span className="code-badge">{v}</span> : <span className="info-val">{v}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-r">
            {/* Security */}
            <div className="card">
              <div className="card-title">Security & Password</div>
              <form onSubmit={handleSavePw}>
                <div className="fg">
                  <label>Current Password</label>
                  <input type="password" className="fi" value={security.cur} placeholder="••••••••" onChange={e=>setSecurity(s=>({...s,cur:e.target.value}))}/>
                </div>
                <div className="fg">
                  <label>New Password</label>
                  <input type="password" className="fi" value={security.newpw} placeholder="••••••••" onChange={e=>setSecurity(s=>({...s,newpw:e.target.value}))}/>
                  {security.newpw && (
                    <>
                      <div className="strength-bar">
                        {[1,2,3,4].map(i=>(
                          <div key={i} className="sb" style={{background: i<=strength ? scol : undefined}}/>
                        ))}
                      </div>
                      <div className="strength-label" style={{color:scol}}>{STRENGTHS[strength]}</div>
                    </>
                  )}
                </div>
                <div className="fg">
                  <label>Confirm New Password</label>
                  <input type="password" className="fi" value={security.confirm} placeholder="••••••••" onChange={e=>setSecurity(s=>({...s,confirm:e.target.value}))}/>
                </div>
                <button type="submit" className="save-btn">Update Password</button>
              </form>

              <div className="tfa-row">
                <div>
                  <div className="tfa-label">Two-Factor Authentication</div>
                  <div className="tfa-sub">{twofa ? 'Enabled — your account is secured' : 'Disabled — enable for extra security'}</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={twofa} onChange={e=>setTwofa(e.target.checked)}/>
                  <span className="tslider"/>
                </label>
              </div>

              <div className="sess-row">
                <div>
                  <div className="sess-label">Active Sessions</div>
                  <div className="sess-sub">1 device currently signed in</div>
                </div>
                <span className="revoke-link">Revoke All</span>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="card">
              <div className="card-title">Notification Preferences</div>
              {NOTIFS.map(n=>(
                <div className="notif-row" key={n.id}>
                  <span className="notif-lbl">{n.label}</span>
                  <label className="toggle">
                    <input type="checkbox" checked={notifs[n.id]??n.on} onChange={e=>setNotifs(v=>({...v,[n.id]:e.target.checked}))}/>
                    <span className="tslider"/>
                  </label>
                </div>
              ))}
            </div>

            {/* Danger Zone */}
            <div className="card danger">
              <div className="card-title" style={{color:'var(--red)'}}>⚠️ Danger Zone</div>
              <div className="dz-row">
                <div className="dz-info">
                  <div className="dz-title">Deactivate College Marketplace</div>
                  <div className="dz-sub">This will hide all products and prevent student access until you reactivate.</div>
                </div>
                <button className="deact-btn" onClick={()=>setDeactModal(true)}>Deactivate</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {deactModal && (
        <div className="mo" onClick={()=>setDeactModal(false)}>
          <div className="mb" onClick={e=>e.stopPropagation()}>
            <div className="mt">⚠️ Deactivate Marketplace?</div>
            <p className="ms">All product listings will be hidden and students won&apos;t be able to access the marketplace until you reactivate it. Existing orders will not be affected.</p>
            <div className="macts">
              <button className="bcnl" onClick={()=>setDeactModal(false)}>Cancel</button>
              <button className="bdeact" onClick={()=>setDeactModal(false)}>Yes, Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
