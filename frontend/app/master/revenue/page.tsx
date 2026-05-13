'use client';
import { useState } from 'react';

const FILTERS = ['This Week','This Month','This Year','Custom Range'];
const HEADLINE = [
  { icon:'📋', label:'Total Listing Fees',     value:'₹2,130',  sub:'+12%', color:'#4F8EF7' },
  { icon:'💸', label:'Total Transaction Fees', value:'₹13,550', sub:'+8%',  color:'#10B981' },
  { icon:'💰', label:'Net Platform Profit',    value:'₹15,680', sub:'+10%', color:'#F7C948' },
];
const ROWS = [
  { college:'MIT College of Engineering', listing:'₹1,240', txn:'₹8,430', ad:'₹500',  total:'₹10,170', pct:61 },
  { college:'ABC Engineering College',    listing:'₹890',   txn:'₹5,120', ad:'₹1,000',total:'₹7,010',  pct:42 },
  { college:'XYZ Institute',              listing:'—',       txn:'—',      ad:'—',      total:'—',       pct:0,  pending:true },
];
const CHART_PTS = [
  { mo:'Dec', rev:8000,  fee:3000  },
  { mo:'Jan', rev:10000, fee:4000  },
  { mo:'Feb', rev:12000, fee:5000  },
  { mo:'Mar', rev:14000, fee:6000  },
  { mo:'Apr', rev:13000, fee:5500  },
  { mo:'May', rev:15680, fee:7000  },
];

const S = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
:root{--bg:#0A0E1A;--card:#111827;--c2:#1a2235;--bd:#1e2d45;--gold:#F7C948;--t1:#F0F4FF;--t2:#9CA3AF;--t3:#6B7280;--blue:#4F8EF7;--green:#10B981;}
.m6{padding:32px;min-height:100vh;background:var(--bg);}
.m6 h1{font-family:'Sora',sans-serif;font-size:26px;font-weight:800;color:var(--t1);margin-bottom:4px;}
.sub{font-size:13px;color:var(--t3);margin-bottom:24px;}
.top-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;}
.filters{display:flex;gap:8px;}
.fb{padding:7px 16px;border-radius:9999px;border:1px solid var(--bd);background:none;color:var(--t3);font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;}
.fb.on{background:var(--gold);color:#0A0E1A;border-color:var(--gold);}
.fb:not(.on):hover{border-color:rgba(247,201,72,.4);color:var(--t1);}
.hg{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;}
.hc{background:var(--card);border:1px solid rgba(247,201,72,.2);border-radius:14px;padding:24px;transition:transform .2s;}
.hc:hover{transform:translateY(-3px);}
.hc-icon{font-size:20px;margin-bottom:12px;}
.hc-val{font-family:'Sora',sans-serif;font-size:32px;font-weight:800;display:block;margin-bottom:6px;}
.hc-lbl{font-size:13px;color:var(--t3);}
.hc-sub{font-size:12px;color:var(--green);font-weight:700;margin-left:6px;}
.tbl-card{background:var(--card);border:1px solid var(--bd);border-radius:14px;overflow:hidden;margin-bottom:24px;}
.tbl-hd{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--bd);}
.tbl-ttl{font-family:'Sora',sans-serif;font-size:17px;font-weight:700;color:var(--t1);}
.exp-btns{display:flex;gap:8px;}
.exp-btn{padding:6px 14px;border-radius:9999px;border:1.5px solid rgba(247,201,72,.4);background:none;color:var(--gold);font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;}
.exp-btn:hover{background:rgba(247,201,72,.08);}
table{width:100%;border-collapse:collapse;}
th{padding:12px 20px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--t3);border-bottom:1px solid var(--bd);}
td{padding:14px 20px;font-size:13px;color:var(--t2);border-bottom:1px solid var(--bd);}
tr:last-of-type td{border-bottom:none;}
.tfoot td{background:rgba(247,201,72,.06);font-weight:700;color:var(--t1);border-top:1px solid rgba(247,201,72,.2);}
.bar-sm{height:6px;background:var(--c2);border-radius:9999px;overflow:hidden;margin-top:6px;width:80px;}
.bar-fill{height:100%;background:linear-gradient(90deg,#F7C948,#F59E0B);border-radius:9999px;}
.chart-card{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:24px;}
.ct{font-family:'Sora',sans-serif;font-size:17px;font-weight:700;color:var(--t1);margin-bottom:20px;}
.leg{display:flex;gap:20px;margin-bottom:16px;}
.ld{width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:6px;}
.ls{font-size:12px;color:var(--t2);}
`;

function LineChart(){
  const W=700,H=200,PL=40,PR=20,PT=20,PB=40;
  const cw=W-PL-PR, ch=H-PT-PB;
  const maxR=16000,maxF=8000;
  const xs=CHART_PTS.map((_,i)=>PL+i*(cw/(CHART_PTS.length-1)));
  const revY=(v:number)=>PT+ch-(v/maxR)*ch;
  const feeY=(v:number)=>PT+ch-(v/maxF)*ch;
  const rPath=CHART_PTS.map((p,i)=>`${i===0?'M':'L'}${xs[i]},${revY(p.rev)}`).join(' ');
  const fPath=CHART_PTS.map((p,i)=>`${i===0?'M':'L'}${xs[i]},${feeY(p.fee)}`).join(' ');
  const rArea=`${rPath} L${xs[xs.length-1]},${PT+ch} L${xs[0]},${PT+ch} Z`;
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:'visible'}}>
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F7C948" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#F7C948" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* grid */}
      {[0,.25,.5,.75,1].map(t=>{
        const y=PT+ch*t;
        return<line key={t} x1={PL} x2={W-PR} y1={y} y2={y} stroke="#1e2d45" strokeWidth="1"/>;
      })}
      {/* area */}
      <path d={rArea} fill="url(#rg)"/>
      {/* lines */}
      <path d={rPath} fill="none" stroke="#F7C948" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      <path d={fPath} fill="none" stroke="#4F8EF7" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      {/* dots */}
      {CHART_PTS.map((p,i)=>(
        <g key={i}>
          <circle cx={xs[i]} cy={revY(p.rev)} r="4" fill="#F7C948"/>
          <circle cx={xs[i]} cy={feeY(p.fee)} r="4" fill="#4F8EF7"/>
        </g>
      ))}
      {/* x labels */}
      {CHART_PTS.map((p,i)=>(
        <text key={i} x={xs[i]} y={H-10} textAnchor="middle" fill="#6B7280" fontSize="11" fontFamily="JetBrains Mono">{p.mo}</text>
      ))}
      {/* y labels */}
      {[0,4000,8000,12000,16000].map((v,i)=>(
        <text key={i} x={PL-6} y={revY(v)+4} textAnchor="end" fill="#6B7280" fontSize="10" fontFamily="JetBrains Mono">
          {v>=1000?`₹${v/1000}k`:'₹0'}
        </text>
      ))}
    </svg>
  );
}

export default function PlatformRevenuePage(){
  const [filter,setFilter]=useState('This Month');
  return(
    <>
      <style>{S}</style>
      <div className="m6">
        <div className="top-row">
          <div>
            <h1>Platform Revenue</h1>
            <p className="sub">Complete financial overview across all colleges</p>
          </div>
          <div className="filters">
            {FILTERS.map(f=><button key={f} className={`fb ${filter===f?'on':''}`} onClick={()=>setFilter(f)}>{f}</button>)}
          </div>
        </div>

        <div className="hg">
          {HEADLINE.map(h=>(
            <div className="hc" key={h.label}>
              <div className="hc-icon">{h.icon}</div>
              <span className="hc-val" style={{color:h.color}}>{h.value}</span>
              <span className="hc-lbl">{h.label}<span className="hc-sub">↑ {h.sub}</span></span>
            </div>
          ))}
        </div>

        <div className="tbl-card">
          <div className="tbl-hd">
            <span className="tbl-ttl">Revenue by College</span>
            <div className="exp-btns">
              <button className="exp-btn">📥 Export CSV</button>
              <button className="exp-btn">📄 Export PDF</button>
            </div>
          </div>
          <table>
            <thead>
              <tr><th>College</th><th>Listing Fees</th><th>Transaction Fees</th><th>Ad Revenue</th><th>Total</th><th>% Share</th></tr>
            </thead>
            <tbody>
              {ROWS.map(r=>(
                <tr key={r.college}>
                  <td style={{fontWeight:600,color:'var(--t1)'}}>{r.college}</td>
                  <td style={{color:'var(--blue)',fontFamily:'JetBrains Mono,monospace',fontSize:12}}>{r.listing}</td>
                  <td style={{color:'var(--green)',fontFamily:'JetBrains Mono,monospace',fontSize:12}}>{r.txn}</td>
                  <td style={{color:'#7C3AED',fontFamily:'JetBrains Mono,monospace',fontSize:12}}>{r.ad}</td>
                  <td style={{color:'var(--gold)',fontFamily:'JetBrains Mono,monospace',fontSize:12,fontWeight:700}}>{r.total}</td>
                  <td>
                    {r.pending
                      ? <span style={{fontSize:11,padding:'3px 10px',borderRadius:'9999px',background:'rgba(245,158,11,.12)',color:'#F59E0B',fontWeight:700}}>Pending</span>
                      : (<><span style={{fontFamily:'JetBrains Mono,monospace',fontSize:12,color:'var(--gold)'}}>{r.pct}%</span>
                          <div className="bar-sm"><div className="bar-fill" style={{width:`${r.pct}%`}}/></div>
                        </>)
                    }
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="tfoot">
                <td style={{fontFamily:'Sora,sans-serif',fontWeight:800}}>TOTAL</td>
                <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:12}}>₹2,130</td>
                <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:12}}>₹13,550</td>
                <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:12}}>₹1,500</td>
                <td style={{fontFamily:'Sora,sans-serif',fontSize:16,color:'var(--gold)'}}>₹17,180</td>
                <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:12}}>100%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="chart-card">
          <div className="ct">Revenue Trend — Last 6 Months</div>
          <div className="leg">
            <span className="ls"><span className="ld" style={{background:'#F7C948'}}/>Revenue</span>
            <span className="ls"><span className="ld" style={{background:'#4F8EF7'}}/>Fees Collected</span>
          </div>
          <LineChart/>
        </div>
      </div>
    </>
  );
}
