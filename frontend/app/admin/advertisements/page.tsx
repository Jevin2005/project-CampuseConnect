'use client';
import { useState } from 'react';

const ACTIVE_ADS = [
  { id:'1', scope:'own', title:'MIT Winter Book Fair 2024', expires:'Jan 7, 2025', views:1240, clicks:89, gradient:'linear-gradient(135deg,#0d9167,#10B981)' },
  { id:'2', scope:'cross', title:'Science Lab Equipment Sale', expires:'Dec 31, 2024', views:4500, clicks:312, gradient:'linear-gradient(135deg,#b45309,#F7C948)' },
];

export default function AdvertisementManagerPage() {
  const [scope, setScope] = useState<'own'|'cross'>('own');
  const [form, setForm] = useState({ title:'', desc:'', duration:'7' });
  const [showForm, setShowForm] = useState(false);
  const [ads, setAds] = useState(ACTIVE_ADS);
  const [endModal, setEndModal] = useState<string|null>(null);
  const descLen = form.desc.length;

  const handlePublish = (e:React.FormEvent) => {
    e.preventDefault();
    setAds(prev => [...prev, {
      id: Date.now().toString(),
      scope, title: form.title,
      expires: `+${form.duration} days`,
      views: 0, clicks: 0,
      gradient: scope==='own' ? 'linear-gradient(135deg,#0d9167,#10B981)' : 'linear-gradient(135deg,#b45309,#F7C948)',
    }]);
    setForm({ title:'', desc:'', duration:'7' });
    setShowForm(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        :root{--bg:#0A0E1A;--card:#111827;--card2:#1a2235;--border:#1e2d45;--green:#10B981;--gold:#F7C948;--red:#EF4444;--txt:#F0F4FF;--mut:#6B7280;--soft:#9CA3AF}
        body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--txt)}
        .page{background:var(--bg);min-height:100vh;padding:36px 40px;animation:fi .35s ease}
        @keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        h1{font-family:'Sora',sans-serif;font-size:28px;font-weight:700;margin-bottom:4px}
        .sub{font-size:14px;color:var(--mut);margin-bottom:28px}

        /* OPTION CARDS */
        .options{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px}
        .opt-card{background:var(--card);border:1.5px solid var(--border);border-radius:16px;padding:24px;transition:border-color .2s,transform .2s,box-shadow .2s;cursor:pointer}
        .opt-card:hover{transform:translateY(-2px)}
        .opt-card.own:hover,.opt-card.own.sel{border-color:rgba(16,185,129,.5);box-shadow:0 0 24px rgba(16,185,129,.12)}
        .opt-card.cross:hover,.opt-card.cross.sel{border-color:rgba(247,201,72,.5);box-shadow:0 0 24px rgba(247,201,72,.12)}
        .opt-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        .opt-title{font-family:'Sora',sans-serif;font-size:18px;font-weight:700}
        .scope-pill{font-size:11px;font-weight:700;padding:3px 10px;border-radius:9999px}
        .opt-desc{font-size:13px;color:var(--soft);margin-bottom:14px;line-height:1.6}
        .cost{font-family:'Sora',sans-serif;font-size:28px;font-weight:800;margin-bottom:4px}
        .cost-note{font-size:12px;color:var(--mut);margin-bottom:16px}
        .dur-pills{display:flex;gap:8px;margin-bottom:18px}
        .dp{border:1px solid var(--border);border-radius:9999px;padding:5px 12px;font-size:12px;font-weight:600;cursor:pointer;background:var(--card2);color:var(--soft);font-family:'DM Sans',sans-serif;transition:all .18s}
        .dp.sel{border-color:rgba(16,185,129,.5);background:rgba(16,185,129,.12);color:var(--green)}
        .opt-btn{width:100%;border:none;border-radius:9999px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s}
        .opt-btn.own-btn{background:var(--green);color:#003822}
        .opt-btn.own-btn:hover{box-shadow:0 0 20px rgba(16,185,129,.35);transform:translateY(-1px)}
        .opt-btn.cross-btn{background:var(--gold);color:#3b2800}
        .opt-btn.cross-btn:hover{box-shadow:0 0 20px rgba(247,201,72,.35);transform:translateY(-1px)}

        /* FORM CARD */
        .form-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:24px;margin-bottom:28px;animation:fi .3s ease}
        .fc-title{font-family:'Sora',sans-serif;font-size:18px;font-weight:700;margin-bottom:18px}
        .fg{margin-bottom:16px}
        label{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--mut);margin-bottom:7px}
        .fi-inp{width:100%;background:var(--card2);border:1.5px solid var(--border);border-radius:9px;color:var(--txt);padding:11px 14px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s,box-shadow .2s}
        .fi-inp::placeholder{color:var(--mut)}
        .fi-inp:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(16,185,129,.1)}
        textarea.fi-inp{resize:vertical;min-height:90px}
        .char-count{font-size:11px;color:var(--mut);text-align:right;margin-top:4px}
        .upload-zone{border:2px dashed var(--border);border-radius:10px;padding:28px;text-align:center;cursor:pointer;transition:border-color .2s}
        .upload-zone:hover{border-color:rgba(16,185,129,.4)}
        .upload-icon{font-size:28px;margin-bottom:8px}
        .upload-hint{font-size:13px;color:var(--soft);margin-bottom:4px}
        .upload-dim{font-size:11px;color:var(--mut)}
        .scope-row{display:flex;gap:12px;margin-bottom:16px}
        .scope-opt{flex:1;border:1.5px solid var(--border);border-radius:10px;padding:12px;text-align:center;cursor:pointer;transition:all .18s}
        .scope-opt.sel.own{border-color:rgba(16,185,129,.5);background:rgba(16,185,129,.08)}
        .scope-opt.sel.cross{border-color:rgba(247,201,72,.5);background:rgba(247,201,72,.08)}
        .scope-name{font-size:14px;font-weight:600;margin-bottom:4px}
        .scope-cost{font-size:12px;color:var(--mut)}
        .fdur{background:var(--card2);border:1.5px solid var(--border);border-radius:9px;color:var(--txt);padding:11px 14px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;width:100%}
        .factions{display:flex;gap:12px;margin-top:4px}
        .fpub{flex:1;background:var(--green);color:#003822;border:none;border-radius:9999px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s}
        .fpub:hover{transform:translateY(-1px);box-shadow:0 0 16px rgba(16,185,129,.3)}
        .fcan{background:none;border:1px solid var(--border);color:var(--mut);border-radius:9999px;padding:12px 20px;font-size:14px;cursor:pointer;font-family:'DM Sans',sans-serif}

        /* ACTIVE ADS */
        .sec-title{font-family:'Sora',sans-serif;font-size:20px;font-weight:700;margin-bottom:16px}
        .ads-list{display:flex;flex-direction:column;gap:16px}
        .ad-card{background:var(--card);border:1px solid var(--border);border-radius:14px;display:flex;gap:0;overflow:hidden;transition:transform .2s}
        .ad-card:hover{transform:translateY(-2px)}
        .ad-banner{width:200px;min-height:100px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:32px}
        .ad-body{flex:1;padding:18px 20px;display:flex;align-items:center;gap:20px}
        .ad-info{flex:1}
        .ad-title{font-family:'Sora',sans-serif;font-size:16px;font-weight:700;margin-bottom:6px}
        .ad-badges{display:flex;gap:8px;margin-bottom:8px;align-items:center}
        .scope-badge{font-size:11px;font-weight:700;padding:3px 10px;border-radius:9999px}
        .live-badge{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:#10B981}
        @keyframes live-pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .live-dot{width:7px;height:7px;border-radius:50%;background:#10B981;animation:live-pulse 1.5s ease-in-out infinite}
        .ad-exp{font-size:12px;color:var(--mut);margin-bottom:6px}
        .ad-stats{display:flex;gap:14px;font-size:12px;color:var(--soft)}
        .ad-actions{flex-shrink:0}
        .btn-end{background:transparent;border:1.5px solid rgba(239,68,68,.4);color:var(--red);padding:8px 16px;border-radius:9999px;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s}
        .btn-end:hover{background:rgba(239,68,68,.1)}
        .empty-ads{text-align:center;padding:40px;color:var(--mut);font-size:14px}

        /* MODAL */
        .mo{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center}
        .mb{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:28px;max-width:400px;width:90%}
        .mt{font-family:'Sora',sans-serif;font-size:19px;font-weight:700;margin-bottom:8px}
        .ms{font-size:13px;color:var(--soft);margin-bottom:20px}
        .macts{display:flex;gap:10px;justify-content:flex-end}
        .bcnl{background:none;border:1px solid var(--border);color:var(--mut);padding:8px 16px;border-radius:9999px;cursor:pointer;font-size:13px;font-family:'DM Sans',sans-serif}
        .bend{background:var(--red);color:#fff;border:none;padding:8px 16px;border-radius:9999px;cursor:pointer;font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif}
      `}</style>

      <div className="page">
        <h1>Advertisement Manager</h1>
        <p className="sub">Create and manage ads for your college marketplace</p>

        {/* OPTION CARDS */}
        <div className="options">
          {/* Own College */}
          <div className={`opt-card own ${scope==='own'?'sel':''}`} onClick={()=>setScope('own')}>
            <div className="opt-header">
              <span className="opt-title" style={{color:'var(--green)'}}>🏫 Own College Ad</span>
              <span className="scope-pill" style={{background:'rgba(16,185,129,.12)',color:'var(--green)'}}>MIT Only</span>
            </div>
            <p className="opt-desc">Visible only to MIT College of Engineering students. Perfect for campus-specific events.</p>
            <div className="cost" style={{color:'var(--green)'}}>FREE</div>
            <div className="cost-note">No payment required</div>
            <div className="dur-pills">
              {['7','14','30'].map(d=>(
                <button key={d} className={`dp ${scope==='own'&&form.duration===d?'sel':''}`} onClick={e=>{e.stopPropagation();setScope('own');setForm(f=>({...f,duration:d}))}}>
                  {d} days
                </button>
              ))}
            </div>
            <button className="opt-btn own-btn" onClick={e=>{e.stopPropagation();setScope('own');setShowForm(true)}}>Create Own College Ad →</button>
          </div>

          {/* Cross College */}
          <div className={`opt-card cross ${scope==='cross'?'sel':''}`} onClick={()=>setScope('cross')}>
            <div className="opt-header">
              <span className="opt-title" style={{color:'var(--gold)'}}>🌐 Cross-College Ad</span>
              <span className="scope-pill" style={{background:'rgba(247,201,72,.12)',color:'var(--gold)'}}>All Colleges</span>
            </div>
            <p className="opt-desc">Visible to ALL students across all colleges. Maximum reach with paid placement.</p>
            <div className="cost" style={{color:'var(--gold)'}}>₹500</div>
            <div className="cost-note">Flat fee · 7-day campaign</div>
            <div className="dur-pills">
              <button className="dp sel" style={{borderColor:'rgba(247,201,72,.5)',background:'rgba(247,201,72,.12)',color:'var(--gold)'}}>7 days</button>
            </div>
            <button className="opt-btn cross-btn" onClick={e=>{e.stopPropagation();setScope('cross');setShowForm(true)}}>Create Cross-College Ad →</button>
          </div>
        </div>

        {/* CREATE FORM */}
        {showForm && (
          <div className="form-card">
            <div className="fc-title">Create New Advertisement</div>
            <form onSubmit={handlePublish}>
              <div className="fg">
                <label>Ad Title</label>
                <input className="fi-inp" placeholder="Enter ad title..." value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required/>
              </div>
              <div className="fg">
                <label>Ad Description</label>
                <textarea className="fi-inp" placeholder="Describe your advertisement..." maxLength={200} value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))}/>
                <div className="char-count">{descLen}/200</div>
              </div>
              <div className="fg">
                <label>Banner Image</label>
                <div className="upload-zone">
                  <div className="upload-icon">🖼️</div>
                  <div className="upload-hint">Click to upload banner image</div>
                  <div className="upload-dim">Recommended: 1200×400px · JPG or PNG</div>
                </div>
              </div>
              <div className="fg">
                <label>Ad Scope</label>
                <div className="scope-row">
                  <div className={`scope-opt own ${scope==='own'?'sel':''}`} onClick={()=>setScope('own')}>
                    <div className="scope-name">🏫 Own College</div>
                    <div className="scope-cost" style={{color:'var(--green)'}}>FREE</div>
                  </div>
                  <div className={`scope-opt cross ${scope==='cross'?'sel':''}`} onClick={()=>setScope('cross')}>
                    <div className="scope-name">🌐 All Colleges</div>
                    <div className="scope-cost" style={{color:'var(--gold)'}}>₹500 flat fee</div>
                  </div>
                </div>
              </div>
              <div className="fg">
                <label>Duration</label>
                <select className="fdur" value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))}>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>
              <div className="factions">
                <button type="button" className="fcan" onClick={()=>setShowForm(false)}>Cancel</button>
                <button type="submit" className="fpub">{scope==='cross'?'Pay ₹500 & Publish Ad →':'Publish Ad →'}</button>
              </div>
            </form>
          </div>
        )}

        {/* ACTIVE ADS */}
        <div className="sec-title">Active Advertisements</div>
        {ads.length === 0 ? (
          <div className="empty-ads">No active advertisements. Create one above!</div>
        ) : (
          <div className="ads-list">
            {ads.map(ad => (
              <div key={ad.id} className="ad-card">
                <div className="ad-banner" style={{background:ad.gradient}}>📢</div>
                <div className="ad-body">
                  <div className="ad-info">
                    <div className="ad-title">{ad.title}</div>
                    <div className="ad-badges">
                      <span className="scope-badge" style={ad.scope==='own'?{background:'rgba(16,185,129,.12)',color:'var(--green)'}:{background:'rgba(247,201,72,.12)',color:'var(--gold)'}}>
                        {ad.scope==='own'?'🏫 Own College':'🌐 All Colleges'}
                      </span>
                      <span className="live-badge"><div className="live-dot"/>LIVE</span>
                    </div>
                    <div className="ad-exp">Expires: {ad.expires}</div>
                    <div className="ad-stats">
                      <span>👁 Views: {ad.views.toLocaleString()}</span>
                      <span>🖱 Clicks: {ad.clicks.toLocaleString()}</span>
                      {ad.views > 0 && <span>CTR: {((ad.clicks/ad.views)*100).toFixed(1)}%</span>}
                    </div>
                  </div>
                  <div className="ad-actions">
                    <button className="btn-end" onClick={()=>setEndModal(ad.id)}>End Ad</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {endModal && (
        <div className="mo" onClick={()=>setEndModal(null)}>
          <div className="mb" onClick={e=>e.stopPropagation()}>
            <div className="mt">End Advertisement?</div>
            <p className="ms">This ad will stop running immediately and be removed from the marketplace.</p>
            <div className="macts">
              <button className="bcnl" onClick={()=>setEndModal(null)}>Cancel</button>
              <button className="bend" onClick={()=>{setAds(a=>a.filter(x=>x.id!==endModal));setEndModal(null);}}>End Ad</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
