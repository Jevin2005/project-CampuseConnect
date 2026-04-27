'use client';

import { useState } from 'react';
import Link from 'next/link';

/* ─── Mock data ─────────────────────────────────────────────── */
const HERO_STATS = [
  { icon: '🏫', label: 'Active Colleges', value: '2',       color: '#F7C948' },
  { icon: '🎓', label: 'Total Students',  value: '1,470',   color: '#4F8EF7' },
  { icon: '📦', label: 'Total Products',  value: '2,840',   color: '#10B981' },
  { icon: '💰', label: 'Total Revenue',   value: '₹15,680', color: '#F7C948' },
];

const REVENUE_BARS = [
  { name: 'MIT Campus',      amount: 9670, pct: 61 },
  { name: 'ABC Engineering', amount: 6010, pct: 39 },
];

const FEE_ROWS = [
  { icon: '📋', label: 'Listing Fees',     amount: '₹2,130',  color: '#4F8EF7' },
  { icon: '💸', label: 'Transaction Fees', amount: '₹13,550', color: '#10B981' },
  { icon: '📢', label: 'Ad Revenue',       amount: '₹1,500',  color: '#F7C948' },
];

const ACTIVITY = [
  { icon: '🆕', msg: 'New college request: XYZ Institute', badge: 'PENDING', bc: '#F59E0B', time: '2h ago' },
  { icon: '👤', msg: 'MIT College: 1 new student request', badge: 'NEW',     bc: '#4F8EF7', time: '5h ago' },
  { icon: '📦', msg: 'ABC College listed 3 new products',  badge: 'LISTED',  bc: '#10B981', time: '1d ago' },
];

const S = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
:root{--bg:#0A0E1A;--card:#111827;--card2:#1a2235;--border:#1e2d45;--gold:#F7C948;--t1:#F0F4FF;--t2:#9CA3AF;--t3:#6B7280;}
.m2{padding:32px;min-height:100vh;background:var(--bg);}
.m2 h1{font-family:'Sora',sans-serif;font-size:26px;font-weight:700;color:var(--t1);margin-bottom:4px;}
.m2-sub{font-size:13px;color:var(--t3);margin-bottom:28px;}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;}
.stat-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px 24px;transition:transform .2s,border-color .2s;}
.stat-card:hover{transform:translateY(-3px);border-color:rgba(247,201,72,.3);}
.stat-icon{font-size:20px;display:block;margin-bottom:8px;}
.stat-val{font-family:'Sora',sans-serif;font-size:28px;font-weight:800;display:block;margin-bottom:4px;}
.stat-lbl{font-size:12px;color:var(--t3);}
.charts-row{display:grid;grid-template-columns:60% 40%;gap:16px;margin-bottom:24px;}
.chart-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:24px;}
.chart-ttl{font-family:'Sora',sans-serif;font-size:15px;font-weight:700;color:var(--t1);margin-bottom:20px;}
.bar-row{margin-bottom:14px;}
.bar-lr{display:flex;justify-content:space-between;font-size:12px;color:var(--t2);margin-bottom:6px;}
.bar-track{background:var(--card2);border-radius:9999px;height:12px;overflow:hidden;}
.bar-fill{height:100%;border-radius:9999px;background:linear-gradient(90deg,#F7C948,#F59E0B);}
.donut-wrap{display:flex;align-items:center;gap:20px;}
.legend{display:flex;flex-direction:column;gap:10px;}
.leg-item{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--t2);}
.leg-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
.fee-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:24px;margin-bottom:24px;}
.fee-ttl{font-family:'Sora',sans-serif;font-size:15px;font-weight:700;color:var(--t1);margin-bottom:16px;}
.fee-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);}
.fee-row:last-of-type{border-bottom:none;}
.fee-left{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--t2);}
.fee-amt{font-family:'Sora',sans-serif;font-size:15px;font-weight:700;}
.fee-total{display:flex;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1.5px solid rgba(247,201,72,.25);}
.fee-total-l{font-size:14px;font-weight:700;color:var(--t1);}
.fee-total-r{font-family:'Sora',sans-serif;font-size:17px;font-weight:800;color:var(--gold);}
.act-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:24px;}
.act-ttl{font-family:'Sora',sans-serif;font-size:15px;font-weight:700;color:var(--t1);margin-bottom:16px;}
.act-item{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);}
.act-item:last-child{border-bottom:none;}
.act-icon{font-size:20px;flex-shrink:0;}
.act-msg{font-size:13px;color:var(--t2);flex:1;}
.act-badge{font-size:10px;font-weight:700;padding:3px 9px;border-radius:9999px;letter-spacing:.5px;flex-shrink:0;}
.act-time{font-size:11px;color:var(--t3);flex-shrink:0;}
`;

export default function MasterDashboardPage() {
  const r=52,cx=60,cy=60,circ=2*Math.PI*r;
  const bd=circ*0.62, pd=circ*0.38, po=-(circ*0.62);

  return (
    <>
      <style>{S}</style>
      <div className="m2">
        <h1>Master Dashboard</h1>
        <p className="m2-sub">Platform-wide overview — all colleges</p>

        <div className="stats-grid">
          {HERO_STATS.map(s=>(
            <div className="stat-card" key={s.label}>
              <span className="stat-icon">{s.icon}</span>
              <span className="stat-val" style={{color:s.color}}>{s.value}</span>
              <span className="stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="charts-row">
          <div className="chart-card">
            <div className="chart-ttl">Revenue by College</div>
            {REVENUE_BARS.map(b=>(
              <div className="bar-row" key={b.name}>
                <div className="bar-lr">
                  <span>{b.name}</span>
                  <span style={{color:'#F7C948',fontWeight:700}}>₹{b.amount.toLocaleString()}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{width:`${b.pct}%`}}/>
                </div>
              </div>
            ))}
          </div>

          <div className="chart-card">
            <div className="chart-ttl">Product Type Distribution</div>
            <div className="donut-wrap">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a2235" strokeWidth="16"/>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#4F8EF7" strokeWidth="16"
                  strokeDasharray={`${bd} ${circ}`} strokeLinecap="round"
                  transform={`rotate(-90 ${cx} ${cy})`}/>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#7C3AED" strokeWidth="16"
                  strokeDasharray={`${pd} ${circ}`} strokeDashoffset={po} strokeLinecap="round"
                  transform={`rotate(-90 ${cx} ${cy})`}/>
                <text x={cx} y={cy-4} textAnchor="middle" fill="#F0F4FF" fontFamily="Sora" fontSize="13" fontWeight="700">2,840</text>
                <text x={cx} y={cy+10} textAnchor="middle" fill="#6B7280" fontFamily="DM Sans" fontSize="9">total</text>
              </svg>
              <div className="legend">
                {[{color:'#4F8EF7',label:'Physical — 62%'},{color:'#7C3AED',label:'Digital — 38%'}].map(l=>(
                  <div className="leg-item" key={l.label}>
                    <span className="leg-dot" style={{background:l.color}}/>
                    <span>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="fee-card">
          <div className="fee-ttl">Platform Fee Breakdown</div>
          {FEE_ROWS.map(f=>(
            <div className="fee-row" key={f.label}>
              <div className="fee-left"><span>{f.icon}</span><span>{f.label}</span></div>
              <span className="fee-amt" style={{color:f.color}}>{f.amount}</span>
            </div>
          ))}
          <div className="fee-total">
            <span className="fee-total-l">Total Collected</span>
            <span className="fee-total-r">₹17,180</span>
          </div>
        </div>

        <div className="act-card">
          <div className="act-ttl">Recent Activity</div>
          {ACTIVITY.map((a,i)=>(
            <div className="act-item" key={i}>
              <span className="act-icon">{a.icon}</span>
              <span className="act-msg">{a.msg}</span>
              <span className="act-badge" style={{background:`${a.bc}18`,color:a.bc,border:`1px solid ${a.bc}40`}}>{a.badge}</span>
              <span className="act-time">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
