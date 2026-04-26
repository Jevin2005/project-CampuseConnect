'use client';
import { useState } from 'react';

type Period = 'week'|'month'|'year'|'custom';

const CHART_DATA = [
  { day:'Mon', v:980 }, { day:'Tue', v:1400 }, { day:'Wed', v:1100 },
  { day:'Thu', v:2100 }, { day:'Fri', v:2840 }, { day:'Sat', v:1750 }, { day:'Sun', v:1500 },
];
const MAX_V = Math.max(...CHART_DATA.map(d=>d.v));

const TRANSACTIONS = [
  { product:'📄 DS Notes PDF', buyer:'Arjun M.', seller:'Sneha P.', price:'₹199', cut:'₹9.95', date:'Dec 24, 2024' },
  { product:'📦 HP Laptop 15', buyer:'Priya S.', seller:'Rahul K.', price:'₹18,000', cut:'₹900', date:'Dec 22, 2024' },
  { product:'📱 iPhone 13 Pro', buyer:'Vijay K.', seller:'Priya S.', price:'₹55,000', cut:'₹2,750', date:'Dec 20, 2024' },
  { product:'🎥 Python Course', buyer:'Sneha M.', seller:'Arjun M.', price:'₹499', cut:'₹24.95', date:'Dec 18, 2024' },
  { product:'📕 Calculus Book', buyer:'Rahul S.', seller:'Vijay K.', price:'₹350', cut:'₹17.50', date:'Dec 15, 2024' },
];

export default function RevenueAdminPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [tooltip, setTooltip] = useState<{day:string;v:number}|null>(null);

  const H = 160;
  const W_PAD = 40;
  const pts = CHART_DATA.map((d,i)=>{
    const x = W_PAD + i * ((500-W_PAD*2)/6);
    const y = H - (d.v/MAX_V)*H;
    return { x, y, ...d };
  });
  const linePath = pts.map((p,i)=>i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`).join(' ');
  const fillPath = `${linePath} L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        :root{--bg:#0A0E1A;--card:#111827;--card2:#1a2235;--border:#1e2d45;--green:#10B981;--blue:#4F8EF7;--gold:#F7C948;--txt:#F0F4FF;--mut:#6B7280;--soft:#9CA3AF}
        body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--txt)}
        .page{background:var(--bg);min-height:100vh;padding:36px 40px;animation:fi .35s ease}
        @keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        h1{font-family:'Sora',sans-serif;font-size:28px;font-weight:700;margin-bottom:4px}
        .sub{font-size:14px;color:var(--mut);margin-bottom:24px}

        .period-row{display:flex;gap:8px;margin-bottom:24px}
        .pbtn{border:1px solid var(--border);border-radius:9999px;padding:7px 14px;font-size:12px;font-weight:600;cursor:pointer;background:var(--card2);color:var(--soft);font-family:'DM Sans',sans-serif;transition:all .18s}
        .pbtn.on{background:rgba(16,185,129,.15);color:var(--green);border-color:rgba(16,185,129,.4)}

        .stat-cards{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:24px}
        .scard{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:22px;transition:transform .2s}
        .scard:hover{transform:translateY(-2px)}
        .scard.gold{border-color:rgba(247,201,72,.25);box-shadow:0 0 20px rgba(247,201,72,.06)}
        .sc-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--mut);margin-bottom:10px;display:flex;align-items:center;gap:6px}
        .sc-val{font-family:'Sora',sans-serif;font-size:32px;font-weight:800;line-height:1}

        .chart-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:22px;margin-bottom:24px}
        .chart-title{font-family:'Sora',sans-serif;font-size:18px;font-weight:700;margin-bottom:16px}
        .chart-wrap{position:relative;width:100%}
        svg{display:block;width:100%;overflow:visible}
        .tooltip-box{position:absolute;background:var(--card2);border:1px solid var(--border);border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;pointer-events:none;white-space:nowrap;transform:translate(-50%,-110%);color:var(--txt)}

        .tx-card{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden}
        .tx-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border)}
        .tx-title{font-family:'Sora',sans-serif;font-size:18px;font-weight:700}
        .export-btn{background:none;border:1.5px solid var(--border);color:var(--soft);padding:7px 14px;border-radius:9999px;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s}
        .export-btn:hover{border-color:var(--green);color:var(--green)}
        .th{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 1.2fr;background:var(--card2);padding:10px 18px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--mut)}
        .tr{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 1.2fr;padding:13px 18px;border-bottom:1px solid rgba(30,45,69,.5);align-items:center;transition:background .15s}
        .tr:last-child{border-bottom:none}
        .tr:hover{background:rgba(16,185,129,.03)}
        .pname{font-size:13px;font-weight:600}
        .uname{font-size:13px;color:var(--soft)}
        .price{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;color:var(--txt)}
        .cut{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:var(--green)}
        .dt{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--mut)}
        .pag{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;border-top:1px solid var(--border)}
        .pag-btn{background:var(--card2);border:1px solid var(--border);color:var(--soft);padding:6px 14px;border-radius:8px;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s}
        .pag-btn:hover{border-color:var(--green);color:var(--green)}
        .pag-num{background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.35);color:var(--green);padding:6px 12px;border-radius:8px;font-size:13px;font-weight:700}
        .pag-other{background:var(--card2);border:1px solid var(--border);color:var(--mut);padding:6px 12px;border-radius:8px;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif}
      `}</style>

      <div className="page">
        <h1>College Revenue</h1>
        <p className="sub">Track all platform earnings for MIT College of Engineering</p>

        <div className="period-row">
          {(['week','month','year','custom'] as Period[]).map(p=>(
            <button key={p} className={`pbtn ${period===p?'on':''}`} onClick={()=>setPeriod(p)}>
              {p==='week'?'This Week':p==='month'?'This Month':p==='year'?'This Year':'Custom Range'}
            </button>
          ))}
        </div>

        <div className="stat-cards">
          <div className="scard">
            <div className="sc-label">📋 Listing Fees Collected</div>
            <div className="sc-val" style={{color:'var(--blue)'}}>₹1,240</div>
          </div>
          <div className="scard">
            <div className="sc-label">💸 Transaction Fees (5%)</div>
            <div className="sc-val" style={{color:'var(--green)'}}>₹8,430</div>
          </div>
          <div className="scard gold">
            <div className="sc-label">💰 Total Platform Earned</div>
            <div className="sc-val" style={{color:'var(--gold)'}}>₹9,670</div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Revenue Over Time</div>
          <div className="chart-wrap">
            <svg viewBox="0 0 500 200" style={{height:'200px'}}>
              <defs>
                <linearGradient id="gfill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.35"/>
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.02"/>
                </linearGradient>
              </defs>
              {/* grid lines */}
              {[0.25,0.5,0.75,1].map(f=>(
                <line key={f} x1={W_PAD} y1={H-f*H} x2={500-W_PAD} y2={H-f*H} stroke="#1e2d45" strokeWidth="1" strokeDasharray="4,4"/>
              ))}
              {/* y labels */}
              {[0.25,0.5,0.75,1].map(f=>(
                <text key={f} x={W_PAD-6} y={H-f*H+4} textAnchor="end" fontSize="9" fill="#6B7280">₹{(MAX_V*f/1000).toFixed(1)}k</text>
              ))}
              {/* fill */}
              <path d={fillPath} fill="url(#gfill)"/>
              {/* line */}
              <path d={linePath} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
              {/* x labels + points */}
              {pts.map(p=>(
                <g key={p.day}>
                  <text x={p.x} y={H+18} textAnchor="middle" fontSize="9" fill="#6B7280">{p.day}</text>
                  <circle cx={p.x} cy={p.y} r={tooltip?.day===p.day?6:4} fill="#10B981" stroke="#0A0E1A" strokeWidth="2"
                    style={{cursor:'pointer'}}
                    onMouseEnter={()=>setTooltip({day:p.day,v:p.v})}
                    onMouseLeave={()=>setTooltip(null)}/>
                </g>
              ))}
            </svg>
            {tooltip && (() => {
              const pt = pts.find(p=>p.day===tooltip.day);
              if (!pt) return null;
              const pct = (pt.x/500)*100;
              const top = ((pt.y)/200)*100;
              return (
                <div className="tooltip-box" style={{left:`${pct}%`, top:`${top}%`}}>
                  {pt.day}: ₹{pt.v.toLocaleString()}
                </div>
              );
            })()}
          </div>
        </div>

        <div className="tx-card">
          <div className="tx-header">
            <div className="tx-title">Recent Transactions</div>
            <button className="export-btn">↓ Export CSV</button>
          </div>
          <div className="th">
            <div>Product</div><div>Buyer</div><div>Seller</div>
            <div>Sale Price</div><div>Platform Cut</div><div>Date</div>
          </div>
          {TRANSACTIONS.map((t,i)=>(
            <div key={i} className="tr">
              <div className="pname">{t.product}</div>
              <div className="uname">{t.buyer}</div>
              <div className="uname">{t.seller}</div>
              <div className="price">{t.price}</div>
              <div className="cut">{t.cut} <span style={{fontSize:'10px',color:'var(--mut)',fontWeight:400}}>(5%)</span></div>
              <div className="dt">{t.date}</div>
            </div>
          ))}
          <div className="pag">
            <button className="pag-btn">← Prev</button>
            <span className="pag-num">1</span>
            <span className="pag-other">2</span>
            <span className="pag-other">3</span>
            <button className="pag-btn">Next →</button>
          </div>
        </div>
      </div>
    </>
  );
}
