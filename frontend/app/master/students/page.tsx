'use client';
import { useState } from 'react';

const STUDENTS = [
  { ini:'AK', initColor:'#F7C948', name:'Arjun Kumar',   email:'cse.2301@gmail.com',  college:'MIT College',      collegeColor:'#4F8EF7', enrolled:'Apr 2024', prods:12, purch:8,  status:'Active'    },
  { ini:'PP', initColor:'#4F8EF7', name:'Priya Patel',   email:'priya.p@gmail.com',   college:'MIT College',      collegeColor:'#4F8EF7', enrolled:'Mar 2024', prods:5,  purch:15, status:'Active'    },
  { ini:'RS', initColor:'#7C3AED', name:'Rahul Sharma',  email:'rahul.s@gmail.com',   college:'ABC Engineering',  collegeColor:'#10B981', enrolled:'Feb 2024', prods:0,  purch:3,  status:'Suspended' },
  { ini:'AM', initColor:'#10B981', name:'Anjali Mehta',  email:'anjali.m@gmail.com',  college:'MIT College',      collegeColor:'#4F8EF7', enrolled:'May 2024', prods:8,  purch:2,  status:'Active'    },
  { ini:'VD', initColor:'#F59E0B', name:'Vikram Das',    email:'vikram.d@gmail.com',  college:'ABC Engineering',  collegeColor:'#10B981', enrolled:'Jan 2024', prods:20, purch:45, status:'Active'    },
];

const S = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
:root{--bg:#0A0E1A;--card:#111827;--c2:#1a2235;--bd:#1e2d45;--gold:#F7C948;--t1:#F0F4FF;--t2:#9CA3AF;--t3:#6B7280;--blue:#4F8EF7;--green:#10B981;--red:#EF4444;}
.m8{padding:32px;min-height:100vh;background:var(--bg);}
.m8 h1{font-family:'Sora',sans-serif;font-size:26px;font-weight:800;color:var(--t1);margin-bottom:4px;}
.sub{font-size:13px;color:var(--t3);margin-bottom:20px;}
.filter-card{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;gap:12px;}
.filter-l{display:flex;gap:10px;}
.sel{padding:8px 14px;background:var(--c2);border:1px solid var(--bd);border-radius:8px;color:var(--t1);font-family:'DM Sans',sans-serif;font-size:13px;outline:none;cursor:pointer;}
.search{padding:8px 14px;background:var(--c2);border:1px solid var(--bd);border-radius:8px;color:var(--t1);font-family:'DM Sans',sans-serif;font-size:13px;outline:none;width:240px;}
.tbl-card{background:var(--card);border:1px solid var(--bd);border-radius:14px;overflow:hidden;}
table{width:100%;border-collapse:collapse;}
th{padding:12px 16px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--t3);border-bottom:1px solid var(--bd);}
td{padding:13px 16px;font-size:13px;color:var(--t2);border-bottom:1px solid var(--bd);}
tr:last-child td{border-bottom:none;}
tr:hover td{background:rgba(247,201,72,.025);cursor:pointer;}
.av{width:38px;height:38px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0;}
.nc{display:flex;align-items:center;gap:10px;}
.nn{font-weight:600;color:var(--t1);font-size:13px;}
.ne{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--t3);margin-top:2px;}
.cpill{padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700;}
.pill{display:inline-block;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700;}
.pg{background:rgba(16,185,129,.12);color:var(--green);}
.pr{background:rgba(239,68,68,.12);color:var(--red);}
.pb{background:rgba(79,142,247,.12);color:var(--blue);}
.pn{background:rgba(16,185,129,.12);color:var(--green);}
.num-badge{padding:3px 9px;border-radius:9999px;font-size:11px;font-weight:700;}
.av2{padding:4px 12px;border-radius:9999px;border:1.5px solid var(--blue);background:none;color:var(--blue);font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;}
.as2{padding:4px 12px;border-radius:9999px;border:1.5px solid var(--red);background:none;color:var(--red);font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;margin-left:6px;}
.au2{padding:4px 12px;border-radius:9999px;border:1.5px solid var(--green);background:none;color:var(--green);font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;margin-left:6px;}
.pg-row{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:16px;padding:16px;}
.pgbtn{padding:6px 14px;border-radius:9999px;border:1px solid var(--bd);background:none;color:var(--t3);font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;}
.pgbtn.active{background:var(--gold);color:#0A0E1A;border-color:var(--gold);}
.pgbtn:not(.active):hover{border-color:rgba(247,201,72,.4);color:var(--t1);}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:40;backdrop-filter:blur(4px);}
.drawer{position:fixed;top:0;right:0;height:100vh;width:340px;background:var(--card);border-left:3px solid var(--gold);z-index:50;padding:28px 24px;overflow-y:auto;box-shadow:-8px 0 32px rgba(0,0,0,.4);}
.dr-close{position:absolute;top:16px;right:16px;background:none;border:none;color:var(--t3);font-size:20px;cursor:pointer;padding:4px 8px;border-radius:6px;}
.dr-close:hover{color:var(--t1);}
.dr-av{width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#0A0E1A;margin:0 auto 16px;}
.dr-name{font-family:'Sora',sans-serif;font-size:20px;font-weight:800;color:var(--t1);text-align:center;margin-bottom:8px;}
.dr-pills{display:flex;gap:8px;justify-content:center;margin-bottom:20px;}
.dr-info{display:flex;flex-direction:column;gap:10px;margin-bottom:20px;}
.dr-row{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:var(--t2);}
.dr-lbl{font-size:11px;color:var(--t3);width:80px;flex-shrink:0;}
.dr-val{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--t1);}
.dr-stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;}
.dr-stat{background:var(--c2);border-radius:10px;padding:14px;text-align:center;}
.dr-stat-v{font-family:'Sora',sans-serif;font-size:22px;font-weight:800;display:block;margin-bottom:4px;}
.dr-stat-l{font-size:11px;color:var(--t3);}
.dr-btns{display:flex;flex-direction:column;gap:10px;}
.dr-sus-btn{width:100%;padding:11px;border-radius:9999px;border:1.5px solid var(--red);background:none;color:var(--red);font-size:13px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;}
.dr-view-btn{width:100%;padding:11px;border-radius:9999px;border:none;background:var(--gold);color:#0A0E1A;font-size:13px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;}
`;

type Student = typeof STUDENTS[0];

export default function AllStudentsPage(){
  const [drawer,setDrawer]=useState<Student|null>(null);
  const [search,setSearch]=useState('');
  const [college,setCollege]=useState('all');
  const [status,setStatus]=useState('all');

  const filtered=STUDENTS.filter(s=>{
    const ms=college==='all'||s.college.toLowerCase().includes(college.toLowerCase());
    const ss=status==='all'||s.status.toLowerCase()===status.toLowerCase();
    const sch=!search||s.name.toLowerCase().includes(search.toLowerCase())||s.email.toLowerCase().includes(search.toLowerCase());
    return ms&&ss&&sch;
  });

  return(
    <>
      <style>{S}</style>
      <div className="m8">
        <h1>All Students</h1>
        <p className="sub">1,470 students across 2 active colleges</p>

        <div className="filter-card">
          <div className="filter-l">
            <select className="sel" value={college} onChange={e=>setCollege(e.target.value)}>
              <option value="all">All Colleges</option>
              <option value="MIT">MIT College</option>
              <option value="ABC">ABC Engineering</option>
            </select>
            <select className="sel" value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <input className="search" placeholder="🔍 Search by name or email…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>

        <div className="tbl-card">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>College</th><th>Enrolled</th><th>Products</th><th>Purchases</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(st=>(
                <tr key={st.email} onClick={()=>setDrawer(st)}>
                  <td>
                    <div className="nc">
                      <div className="av" style={{background:st.initColor}}>{st.ini}</div>
                      <div><div className="nn">{st.name}</div><div className="ne">{st.email}</div></div>
                    </div>
                  </td>
                  <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,color:'var(--t3)'}}>{st.email}</td>
                  <td><span className="cpill" style={{background:`${st.collegeColor}15`,color:st.collegeColor}}>{st.college}</span></td>
                  <td style={{fontSize:12,color:'var(--t3)'}}>{st.enrolled}</td>
                  <td><span className="num-badge" style={{background:'rgba(79,142,247,.12)',color:'var(--blue)'}}>{st.prods}</span></td>
                  <td><span className="num-badge" style={{background:'rgba(16,185,129,.12)',color:'var(--green)'}}>{st.purch}</span></td>
                  <td>
                    <span className={`pill ${st.status==='Active'?'pg':'pr'}`}>{st.status}</span>
                  </td>
                  <td onClick={e=>e.stopPropagation()}>
                    <button className="av2" onClick={()=>setDrawer(st)}>View</button>
                    {st.status==='Suspended'
                      ? <button className="au2">Unsuspend</button>
                      : <button className="as2">Suspend</button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pg-row">
            {['←',...['1','2','3','...','12'],'→'].map((p,i)=>(
              <button key={i} className={`pgbtn ${p==='1'?'active':''}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {drawer&&(
        <>
          <div className="overlay" onClick={()=>setDrawer(null)}/>
          <div className="drawer">
            <button className="dr-close" onClick={()=>setDrawer(null)}>✕</button>
            <div className="dr-av" style={{background:drawer.initColor}}>{drawer.ini}</div>
            <div className="dr-name">{drawer.name}</div>
            <div className="dr-pills">
              <span className="cpill" style={{background:`${drawer.collegeColor}15`,color:drawer.collegeColor}}>{drawer.college}</span>
              <span className={`pill ${drawer.status==='Active'?'pg':'pr'}`}>{drawer.status}</span>
            </div>

            <div className="dr-info">
              <div className="dr-row">
                <span className="dr-lbl">📧 Email</span>
                <span className="dr-val">{drawer.email}</span>
              </div>
              <div className="dr-row">
                <span className="dr-lbl">📅 Joined</span>
                <span className="dr-val">{drawer.enrolled}</span>
              </div>
              <div className="dr-row">
                <span className="dr-lbl">🏫 College</span>
                <span className="dr-val">{drawer.college}</span>
              </div>
            </div>

            <div className="dr-stats">
              <div className="dr-stat">
                <span className="dr-stat-v" style={{color:'var(--blue)'}}>{drawer.prods}</span>
                <span className="dr-stat-l">📦 Products</span>
              </div>
              <div className="dr-stat">
                <span className="dr-stat-v" style={{color:'var(--green)'}}>{drawer.purch}</span>
                <span className="dr-stat-l">🛒 Purchases</span>
              </div>
            </div>

            <div className="dr-btns">
              <button className="dr-sus-btn">
                {drawer.status==='Suspended'?'✅ Unsuspend Student':'⛔ Suspend Student'}
              </button>
              <button className="dr-view-btn">👤 View Full Profile</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
