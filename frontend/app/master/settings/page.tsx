'use client';
import { useState } from 'react';

const SETTINGS = [
  { id:'txn',       label:'Transaction Fee (%)',              unit:'%',  value:5,   desc:'Deducted from every product sale on the platform', lastChanged:'Jan 15, 2025' },
  { id:'phy',       label:'Physical Product Listing Fee (₹)', unit:'₹',  value:50,  desc:'One-time fee to list a physical product', lastChanged:'Jan 15, 2025' },
  { id:'dig',       label:'Digital Product Listing Fee (₹)',  unit:'₹',  value:20,  desc:'One-time fee to list a digital product', lastChanged:'Jan 15, 2025' },
  { id:'ad',        label:'Cross-College Ad Fee (₹)',          unit:'₹',  value:500, desc:'Flat fee for platform-wide advertisement', lastChanged:'Never changed' },
];
const CHANGE_LOG = [
  { date:'Jan 15, 2025', setting:'Transaction Fee',     old:'3%',  nw:'5%',   by:'admin@campusconnect.in' },
  { date:'Dec 01, 2024', setting:'Physical Listing Fee', old:'₹30', nw:'₹50',  by:'admin@campusconnect.in' },
];

const S = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
:root{--bg:#0A0E1A;--card:#111827;--c2:#1a2235;--bd:#1e2d45;--gold:#F7C948;--t1:#F0F4FF;--t2:#9CA3AF;--t3:#6B7280;--red:#EF4444;}
.m7{padding:32px;min-height:100vh;background:var(--bg);}
.m7 h1{font-family:'Sora',sans-serif;font-size:26px;font-weight:800;color:var(--t1);margin-bottom:4px;}
.sub{font-size:13px;color:var(--t3);margin-bottom:20px;}
.warn{background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.3);border-radius:10px;padding:14px 20px;font-size:13px;color:#F59E0B;margin-bottom:24px;display:flex;align-items:center;gap:10px;}
.sg{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;}
.sc{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:24px;}
.sc-ttl{font-family:'Sora',sans-serif;font-size:15px;font-weight:700;color:var(--t1);margin-bottom:6px;}
.sc-desc{font-size:12px;color:var(--t3);margin-bottom:20px;}
.ctrl{display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:16px;}
.ctrl-btn{width:36px;height:36px;border-radius:50%;border:1.5px solid rgba(247,201,72,.4);background:none;color:var(--gold);font-size:18px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;display:flex;align-items:center;justify-content:center;transition:all .2s;}
.ctrl-btn:hover{background:rgba(247,201,72,.1);}
.ctrl-val{font-family:'Sora',sans-serif;font-size:48px;font-weight:800;color:var(--gold);min-width:120px;text-align:center;display:flex;align-items:baseline;justify-content:center;gap:4px;}
.ctrl-unit{font-size:24px;color:var(--t3);}
.sc-changed{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--t3);text-align:center;}
.save-card{background:var(--card);border:1px solid rgba(247,201,72,.25);border-radius:14px;padding:24px;margin-bottom:24px;}
.save-ttl{font-family:'Sora',sans-serif;font-size:17px;font-weight:700;color:var(--t1);margin-bottom:16px;}
table{width:100%;border-collapse:collapse;}
th{padding:10px 16px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--t3);border-bottom:1px solid var(--bd);}
td{padding:12px 16px;font-size:13px;color:var(--t2);border-bottom:1px solid var(--bd);}
tr:last-child td{border-bottom:none;}
.btns{display:flex;gap:10px;justify-content:flex-end;margin-top:16px;}
.gbtn{padding:10px 24px;border-radius:9999px;border:1px solid var(--bd);background:none;color:var(--t3);font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;}
.gbtn:hover{border-color:var(--t2);color:var(--t1);}
.save-btn{padding:10px 28px;border-radius:9999px;border:none;background:var(--gold);color:#0A0E1A;font-size:13px;font-weight:800;cursor:pointer;font-family:'Sora',sans-serif;transition:all .2s;}
.save-btn:hover{opacity:.9;transform:translateY(-1px);}
.log-card{background:var(--card);border:1px solid var(--bd);border-radius:14px;overflow:hidden;}
.log-hd{padding:20px 24px;border-bottom:1px solid var(--bd);}
.log-ttl{font-family:'Sora',sans-serif;font-size:17px;font-weight:700;color:var(--t1);}
`;

export default function PlatformSettingsPage(){
  const [vals,setVals]=useState<Record<string,number>>(Object.fromEntries(SETTINGS.map(s=>[s.id,s.value])));
  const change=(id:string,delta:number)=>setVals(v=>({...v,[id]:Math.max(0,v[id]+delta)}));

  return(
    <>
      <style>{S}</style>
      <div className="m7">
        <h1>Platform Settings</h1>
        <p className="sub">Configure global fee structures and platform behavior</p>

        <div className="warn">
          ⚠️ Changes to fee settings apply to <strong>ALL</strong> new transactions across <strong>ALL</strong> colleges immediately after saving.
        </div>

        <div className="sg">
          {SETTINGS.map(s=>(
            <div className="sc" key={s.id}>
              <div className="sc-ttl">{s.label}</div>
              <div className="sc-desc">{s.desc}</div>
              <div className="ctrl">
                <button className="ctrl-btn" onClick={()=>change(s.id,-1)}>−</button>
                <div className="ctrl-val">
                  {s.unit==='₹'&&<span className="ctrl-unit">₹</span>}
                  <span>{vals[s.id]}</span>
                  {s.unit==='%'&&<span className="ctrl-unit">%</span>}
                </div>
                <button className="ctrl-btn" onClick={()=>change(s.id,1)}>+</button>
              </div>
              <div className="sc-changed">Current: {s.unit==='₹'?`₹${s.value}`:s.value+'%'} · Last changed: {s.lastChanged}</div>
            </div>
          ))}
        </div>

        <div className="save-card">
          <div className="save-ttl">Pending Changes</div>
          <table>
            <thead><tr><th>Setting</th><th>Current Value</th><th>New Value</th></tr></thead>
            <tbody>
              {SETTINGS.map(s=>{
                const changed=vals[s.id]!==s.value;
                return(
                  <tr key={s.id} style={changed?{background:'rgba(247,201,72,.04)'}:{}}>
                    <td style={{fontWeight:600,color:'var(--t1)'}}>{s.label}</td>
                    <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:12}}>{s.unit==='₹'?`₹${s.value}`:s.value+'%'}</td>
                    <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:12,color:changed?'var(--gold)':'var(--t3)'}}>
                      {s.unit==='₹'?`₹${vals[s.id]}`:vals[s.id]+'%'}
                      {changed&&<span style={{marginLeft:8,fontSize:10,background:'rgba(247,201,72,.15)',color:'var(--gold)',padding:'2px 8px',borderRadius:'9999px'}}>Changed</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="btns">
            <button className="gbtn" onClick={()=>setVals(Object.fromEntries(SETTINGS.map(s=>[s.id,s.value])))}>Cancel Changes</button>
            <button className="save-btn">💾 Save Platform Settings</button>
          </div>
        </div>

        <div className="log-card">
          <div className="log-hd"><div className="log-ttl">Change History</div></div>
          <table>
            <thead><tr><th>Date</th><th>Setting Changed</th><th>Old Value</th><th>New Value</th><th>Changed By</th></tr></thead>
            <tbody>
              {CHANGE_LOG.map((c,i)=>(
                <tr key={i}>
                  <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,color:'var(--t3)'}}>{c.date}</td>
                  <td style={{fontWeight:600,color:'var(--t1)'}}>{c.setting}</td>
                  <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:12,color:'var(--red)'}}>{c.old}</td>
                  <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:12,color:'#10B981'}}>{c.nw}</td>
                  <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,color:'var(--t3)'}}>{c.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
