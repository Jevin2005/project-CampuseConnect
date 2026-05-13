'use client';
import { useState } from 'react';
import Link from 'next/link';

const COLLEGE = { name:'MIT College of Engineering', city:'Mumbai', type:'Engineering', code:'MIT2024', status:'Active', adminEmail:'admin@mit.edu' };
const STATS = [
  { icon:'🎓', label:'Total Students',  value:'847',      color:'#F7C948' },
  { icon:'📦', label:'Active Products', value:'1,234',    color:'#4F8EF7' },
  { icon:'💰', label:'Total Revenue',   value:'₹9,670',   color:'#F7C948' },
  { icon:'📅', label:'Member Since',    value:'Apr 2024', color:'#F0F4FF' },
];
const STUDENTS = [
  { ini:'AK', name:'Arjun Kumar',  email:'cse.2301@gmail.com', joined:'Apr 2024', prods:12, status:'Active'    },
  { ini:'PP', name:'Priya Patel',  email:'priya.p@gmail.com',  joined:'Mar 2024', prods:5,  status:'Active'    },
  { ini:'RS', name:'Rahul Sharma', email:'rahul.s@gmail.com',  joined:'Feb 2024', prods:0,  status:'Suspended' },
];
const PRODUCTS = [
  { title:'HP Laptop 2022', type:'Physical', price:'₹28,000', seller:'Arjun Kumar',  status:'Active',  date:'May 10' },
  { title:'DS Notes PDF',   type:'Digital',  price:'₹120',    seller:'Priya Patel',  status:'Pending', date:'May 11' },
  { title:'Economics Book', type:'Physical', price:'₹350',    seller:'Rahul Sharma', status:'Removed', date:'May 8'  },
];
const REVENUE = [
  { label:'Listing Fees',      value:'₹1,240',  color:'#4F8EF7' },
  { label:'Transaction Fees',  value:'₹8,430',  color:'#10B981' },
  { label:'Ad Fees',           value:'₹500',    color:'#7C3AED' },
  { label:'Total',             value:'₹10,170', color:'#F7C948', big:true },
];

const S = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
:root{--bg:#0A0E1A;--card:#111827;--c2:#1a2235;--bd:#1e2d45;--gold:#F7C948;--t1:#F0F4FF;--t2:#9CA3AF;--t3:#6B7280;--blue:#4F8EF7;--green:#10B981;--red:#EF4444;}
.m5{padding:32px;min-height:100vh;background:var(--bg);}
.back-btn{display:inline-flex;align-items:center;gap:6px;text-decoration:none;color:var(--t3);font-size:13px;margin-bottom:20px;transition:color .2s;}
.back-btn:hover{color:var(--gold);}
.ch{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:24px;display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;}
.ch-name{font-family:'Sora',sans-serif;font-size:24px;font-weight:800;color:var(--t1);margin-bottom:10px;}
.br{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;}
.badge{padding:4px 12px;border-radius:9999px;font-size:12px;font-weight:700;}
.bc{background:rgba(79,142,247,.12);color:var(--blue);}
.bt{background:rgba(16,185,129,.12);color:var(--green);}
.bk{background:rgba(247,201,72,.12);color:var(--gold);font-family:'JetBrains Mono',monospace;font-size:11px;}
.ba{background:rgba(16,185,129,.12);color:var(--green);}
.ar{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--t3);}
.cbtn{padding:5px 14px;border-radius:9999px;border:1.5px solid var(--blue);background:none;color:var(--blue);font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;}
.sbtn{padding:9px 20px;border-radius:9999px;border:1.5px solid var(--red);background:none;color:var(--red);font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap;}
.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;}
.sc{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:20px;transition:transform .2s;}
.sc:hover{transform:translateY(-3px);border-color:rgba(247,201,72,.3);}
.sv{font-family:'Sora',sans-serif;font-size:26px;font-weight:800;display:block;margin-bottom:4px;}
.sl{font-size:12px;color:var(--t3);}
.tabs{display:flex;border-bottom:1px solid var(--bd);margin-bottom:20px;}
.tb{padding:10px 22px;background:none;border:none;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;color:var(--t3);border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .2s;}
.tb.on{color:var(--gold);border-bottom-color:var(--gold);}
.sr{display:flex;justify-content:flex-end;margin-bottom:14px;}
.si{padding:8px 14px;background:var(--c2);border:1px solid var(--bd);border-radius:8px;color:var(--t1);font-family:'DM Sans',sans-serif;font-size:13px;outline:none;width:220px;}
table{width:100%;border-collapse:collapse;background:var(--card);border-radius:14px;overflow:hidden;border:1px solid var(--bd);}
th{padding:12px 16px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--t3);border-bottom:1px solid var(--bd);}
td{padding:13px 16px;font-size:13px;color:var(--t2);border-bottom:1px solid var(--bd);}
tr:last-child td{border-bottom:none;}
tr:hover td{background:rgba(247,201,72,.025);}
.av{width:36px;height:36px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;background:var(--blue);}
.nc{display:flex;align-items:center;gap:10px;}
.nn{font-weight:600;color:var(--t1);font-size:13px;}
.ne{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--t3);margin-top:2px;}
.pill{display:inline-block;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700;}
.pg{background:rgba(16,185,129,.12);color:var(--green);}
.pr{background:rgba(239,68,68,.12);color:var(--red);}
.po{background:rgba(245,158,11,.12);color:#F59E0B;}
.pb{background:rgba(79,142,247,.12);color:var(--blue);}
.pp{background:rgba(124,58,237,.12);color:#7C3AED;}
.pm{background:rgba(107,114,128,.12);color:var(--t3);}
.av2{padding:4px 12px;border-radius:9999px;border:1.5px solid var(--blue);background:none;color:var(--blue);font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;}
.as2{padding:4px 12px;border-radius:9999px;border:1.5px solid var(--red);background:none;color:var(--red);font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;margin-left:6px;}
.rc{background:var(--card);border:1px solid rgba(247,201,72,.2);border-radius:14px;padding:24px;margin-top:24px;}
.rt{font-family:'Sora',sans-serif;font-size:17px;font-weight:700;color:var(--gold);margin-bottom:20px;}
.rg{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px;}
.ri{text-align:center;}
.rv{font-family:'Sora',sans-serif;font-weight:800;display:block;margin-bottom:4px;}
.rl{font-size:11px;color:var(--t3);}
.pr2{display:flex;align-items:center;gap:14px;}
.pct{font-family:'Sora',sans-serif;font-size:32px;font-weight:800;color:var(--gold);}
.pt{height:8px;background:var(--c2);border-radius:9999px;overflow:hidden;margin-top:8px;}
.pf{height:100%;background:linear-gradient(90deg,#F7C948,#F59E0B);border-radius:9999px;}
`;

function Pill({s}:{s:string}){
  const m:Record<string,string>={Active:'pg',Suspended:'pr',Pending:'po',Removed:'pm',Active2:'pb'};
  return <span className={`pill ${m[s]??'pm'}`}>{s}</span>;
}

export default function CollegeDetailPage(){
  const [tab,setTab]=useState<'students'|'products'>('students');
  return(
    <>
      <style>{S}</style>
      <div className="m5">
        <Link href="/master/colleges" className="back-btn">← All Colleges</Link>

        <div className="ch">
          <div style={{flex:1}}>
            <div className="ch-name">{COLLEGE.name}</div>
            <div className="br">
              <span className="badge bc">📍 {COLLEGE.city}</span>
              <span className="badge bt">{COLLEGE.type}</span>
              <span className="badge bk">{COLLEGE.code}</span>
              <span className="badge ba">✅ {COLLEGE.status}</span>
            </div>
            <div className="ar">
              <span>👤 {COLLEGE.adminEmail}</span>
              <button className="cbtn">Contact Admin</button>
            </div>
          </div>
          <button className="sbtn">⚠️ Suspend College</button>
        </div>

        <div className="sg">
          {STATS.map(s=>(
            <div className="sc" key={s.label}>
              <div style={{fontSize:20,marginBottom:8}}>{s.icon}</div>
              <span className="sv" style={{color:s.color}}>{s.value}</span>
              <span className="sl">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="tabs">
          {(['students','products']as const).map(t=>(
            <button key={t} className={`tb ${tab===t?'on':''}`} onClick={()=>setTab(t)}>
              {t==='students'?'👥 Students':'📦 Products'}
            </button>
          ))}
        </div>

        <div className="sr"><input className="si" placeholder="Search…"/></div>

        {tab==='students'&&(
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Products</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{STUDENTS.map(st=>(
              <tr key={st.email}>
                <td><div className="nc"><div className="av">{st.ini}</div><div><div className="nn">{st.name}</div><div className="ne">{st.email}</div></div></div></td>
                <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,color:'var(--t3)'}}>{st.email}</td>
                <td>{st.joined}</td>
                <td><span className="pill pb">{st.prods}</span></td>
                <td><Pill s={st.status}/></td>
                <td><button className="av2">View</button><button className="as2">{st.status==='Suspended'?'Unsuspend':'Suspend'}</button></td>
              </tr>
            ))}</tbody>
          </table>
        )}

        {tab==='products'&&(
          <table>
            <thead><tr><th>Title</th><th>Type</th><th>Price</th><th>Seller</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>{PRODUCTS.map(p=>(
              <tr key={p.title}>
                <td style={{fontWeight:600,color:'var(--t1)'}}>{p.title}</td>
                <td><span className={`pill ${p.type==='Digital'?'pp':'pb'}`}>{p.type}</span></td>
                <td style={{color:'var(--green)',fontFamily:'JetBrains Mono,monospace',fontSize:12}}>{p.price}</td>
                <td>{p.seller}</td>
                <td><Pill s={p.status}/></td>
                <td style={{fontSize:12,color:'var(--t3)'}}>{p.date}</td>
                <td><button className="av2">View</button>{p.status!=='Removed'&&<button className="as2">Remove</button>}</td>
              </tr>
            ))}</tbody>
          </table>
        )}

        <div className="rc">
          <div className="rt">💰 Revenue Contribution</div>
          <div className="rg">
            {REVENUE.map(r=>(
              <div className="ri" key={r.label}>
                <span className="rv" style={{color:r.color,fontSize:r.big?26:20}}>{r.value}</span>
                <span className="rl">{r.label}</span>
              </div>
            ))}
          </div>
          <div className="pr2">
            <div className="pct">61%</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,color:'var(--t2)'}}>MIT contributes <strong style={{color:'var(--gold)'}}>61%</strong> of total platform revenue</div>
              <div className="pt"><div className="pf" style={{width:'61%'}}/></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
