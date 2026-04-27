'use client';
import { useState } from 'react';

type PS = 'pending' | 'active' | 'removed';
const PRODUCTS = [
  { id:'1', icon:'📦', title:'HP Laptop 15-inch, i5 10th Gen', seller:'Rahul Kumar', type:'PHYSICAL', price:'₹18,000', date:'Dec 24', status:'pending' as PS },
  { id:'2', icon:'📄', title:'DS Notes Complete PDF 2024', seller:'Sneha Patel', type:'DIGITAL PDF', price:'₹49', date:'Dec 23', status:'pending' as PS },
  { id:'3', icon:'📱', title:'iPhone 13 Pro 128GB Space Gray', seller:'Priya Singh', type:'PHYSICAL', price:'₹55,000', date:'Dec 20', status:'active' as PS },
  { id:'4', icon:'🎥', title:'Python Full Course 2024 – 60hrs', seller:'Arjun Mehta', type:'DIGITAL VIDEO', price:'₹199', date:'Dec 18', status:'active' as PS },
  { id:'5', icon:'📕', title:'Calculus Textbook Vol 1 & 2', seller:'Vijay Kumar', type:'PHYSICAL', price:'₹350', date:'Dec 15', status:'removed' as PS },
  { id:'6', icon:'🖥️', title:'Dell Monitor 24" Full HD IPS', seller:'Rahul Kumar', type:'PHYSICAL', price:'₹8,500', date:'Dec 12', status:'active' as PS },
];
const TC:Record<string,{bg:string;c:string}> = {
  'PHYSICAL':    {bg:'rgba(79,142,247,.12)',c:'#4F8EF7'},
  'DIGITAL PDF': {bg:'rgba(124,58,237,.12)',c:'#A78BFA'},
  'DIGITAL VIDEO':{bg:'rgba(236,72,153,.12)',c:'#F472B6'},
};
const SC:Record<PS,{bg:string;c:string;l:string}> = {
  pending:{bg:'rgba(245,158,11,.12)',c:'#F59E0B',l:'PENDING'},
  active: {bg:'rgba(16,185,129,.12)',c:'#10B981',l:'ACTIVE'},
  removed:{bg:'rgba(239,68,68,.12)', c:'#EF4444',l:'REMOVED'},
};

export default function ProductManagementPage() {
  const [tab, setTab] = useState<'all'|PS>('all');
  const [search, setSearch] = useState('');
  const [typeF, setTypeF] = useState('all');
  const [st, setSt] = useState<Record<string,PS>>({});
  const [rmModal, setRmModal] = useState<string|null>(null);
  const [rsModal, setRsModal] = useState<string|null>(null);
  const gs = (p:typeof PRODUCTS[0]) => st[p.id] ?? p.status;
  const cnt = { all:PRODUCTS.length, pending:PRODUCTS.filter(p=>gs(p)==='pending').length, active:PRODUCTS.filter(p=>gs(p)==='active').length, removed:PRODUCTS.filter(p=>gs(p)==='removed').length };
  const rows = PRODUCTS.filter(p => {
    const s = gs(p);
    if (tab !== 'all' && s !== tab) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.seller.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeF !== 'all' && p.type !== typeF) return false;
    return true;
  });
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        :root{--bg:#0A0E1A;--card:#111827;--card2:#1a2235;--border:#1e2d45;--green:#10B981;--blue:#4F8EF7;--gold:#F7C948;--org:#F59E0B;--red:#EF4444;--txt:#F0F4FF;--mut:#6B7280;--soft:#9CA3AF}
        body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--txt)}
        .page{background:var(--bg);min-height:100vh;padding:36px 40px;animation:fi .35s ease}
        @keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        h1{font-family:'Sora',sans-serif;font-size:28px;font-weight:700;margin-bottom:4px}
        .sub{font-size:14px;color:var(--mut);margin-bottom:22px}
        .stat-row{display:flex;gap:12px;margin-bottom:20px}
        .sc{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px 16px;display:flex;align-items:center;gap:8px}
        .sn{font-family:'Sora',sans-serif;font-size:20px;font-weight:700}
        .sl{font-size:12px;color:var(--mut)}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .dot{width:8px;height:8px;border-radius:50%;background:var(--org);animation:pulse 1.5s ease-in-out infinite}
        .fbar{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap}
        .pills{display:flex;gap:6px}
        .pill{border:1px solid var(--border);border-radius:9999px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif;background:var(--card2);color:var(--soft)}
        .pill.on{background:rgba(16,185,129,.15);color:var(--green);border-color:rgba(16,185,129,.4)}
        .pill:hover:not(.on){background:rgba(16,185,129,.05);color:var(--txt)}
        .cnt{display:inline-block;background:rgba(255,255,255,.1);border-radius:9999px;padding:1px 6px;font-size:10px;margin-left:4px}
        .sw{position:relative;flex:1;max-width:260px}
        .si{position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:13px;color:var(--mut)}
        .sinput{width:100%;background:var(--card2);border:1.5px solid var(--border);border-radius:9px;color:var(--txt);padding:9px 12px 9px 32px;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s,box-shadow .2s}
        .sinput::placeholder{color:var(--mut)}
        .sinput:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(16,185,129,.1)}
        .tsel{background:var(--card2);border:1.5px solid var(--border);border-radius:9px;color:var(--txt);padding:9px 12px;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;cursor:pointer}
        .tsel option{background:var(--card)}
        .tbl{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden}
        .th{display:grid;grid-template-columns:2.5fr 1fr 1fr .8fr .7fr 1fr 1.2fr;background:var(--card2);padding:11px 18px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--mut);border-bottom:1px solid var(--border)}
        .tr{display:grid;grid-template-columns:2.5fr 1fr 1fr .8fr .7fr 1fr 1.2fr;padding:13px 18px;align-items:center;border-bottom:1px solid rgba(30,45,69,.5);transition:background .15s}
        .tr:last-child{border-bottom:none}
        .tr:hover{background:rgba(16,185,129,.03)}
        .pcell{display:flex;align-items:center;gap:9px}
        .pib{width:36px;height:36px;border-radius:7px;background:var(--card2);display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}
        .ptitle{font-size:13px;font-weight:600;line-height:1.3}
        .sname{font-size:13px;color:var(--blue)}
        .tbadge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:9999px}
        .sbadge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:9999px}
        .price{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;color:var(--green)}
        .dt{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--mut)}
        .acts{display:flex;gap:6px}
        .bap{background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.4);color:var(--green);padding:5px 10px;border-radius:9999px;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s}
        .bap:hover{background:rgba(16,185,129,.3)}
        .brm{background:transparent;border:1px solid rgba(239,68,68,.4);color:var(--red);padding:5px 10px;border-radius:9999px;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s}
        .brm:hover{background:rgba(239,68,68,.1)}
        .brs{background:rgba(79,142,247,.1);border:1px solid rgba(79,142,247,.35);color:var(--blue);padding:5px 10px;border-radius:9999px;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s}
        .brs:hover{background:rgba(79,142,247,.2)}
        .empty{text-align:center;padding:56px 20px;color:var(--mut)}
        .empty-icon{font-size:40px;margin-bottom:12px}
        .mo{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;animation:fi .2s ease}
        .mb{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:28px;max-width:420px;width:90%}
        .mt{font-family:'Sora',sans-serif;font-size:19px;font-weight:700;margin-bottom:6px}
        .ms{font-size:13px;color:var(--soft);margin-bottom:20px;line-height:1.6}
        .macts{display:flex;gap:10px;justify-content:flex-end}
        .bcnl{background:none;border:1px solid var(--border);color:var(--mut);padding:9px 18px;border-radius:9999px;cursor:pointer;font-size:13px;font-family:'DM Sans',sans-serif}
        .bcrm{background:var(--red);color:#fff;border:none;padding:9px 18px;border-radius:9999px;cursor:pointer;font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif}
        .bcrs{background:var(--blue);color:#fff;border:none;padding:9px 18px;border-radius:9999px;cursor:pointer;font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif}
      `}</style>
      <div className="page">
        <h1>Product Management</h1>
        <p className="sub">Review, approve, and moderate all college listings</p>
        <div className="stat-row">
          <div className="sc"><span className="sn">{cnt.all}</span><span className="sl">Total</span></div>
          <div className="sc"><div className="dot"/><span className="sn" style={{color:'var(--org)'}}>{cnt.pending}</span><span className="sl">Pending</span></div>
          <div className="sc"><span className="sn" style={{color:'var(--green)'}}>{cnt.active}</span><span className="sl">Active</span></div>
          <div className="sc"><span className="sn" style={{color:'var(--red)'}}>{cnt.removed}</span><span className="sl">Removed</span></div>
        </div>
        <div className="fbar">
          <div className="pills">
            {(['all','pending','active','removed'] as const).map(t=>(
              <button key={t} className={`pill ${tab===t?'on':''}`} onClick={()=>setTab(t)}>
                {t.charAt(0).toUpperCase()+t.slice(1)}<span className="cnt">{cnt[t]}</span>
              </button>
            ))}
          </div>
          <div className="sw">
            <span className="si">🔍</span>
            <input className="sinput" placeholder="Search products…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="tsel" value={typeF} onChange={e=>setTypeF(e.target.value)}>
            <option value="all">All Types</option>
            <option value="PHYSICAL">Physical</option>
            <option value="DIGITAL PDF">Digital PDF</option>
            <option value="DIGITAL VIDEO">Digital Video</option>
          </select>
        </div>
        <div className="tbl">
          <div className="th"><div>Product</div><div>Seller</div><div>Type</div><div>Price</div><div>Date</div><div>Status</div><div>Actions</div></div>
          {rows.length===0 ? (
            <div className="empty"><div className="empty-icon">📦</div><p>No products found</p></div>
          ) : rows.map(p=>{
            const s=gs(p); const ss=SC[s]; const ts=TC[p.type]??{bg:'rgba(255,255,255,.08)',c:'var(--soft)'};
            return (
              <div key={p.id} className="tr">
                <div className="pcell"><div className="pib">{p.icon}</div><div className="ptitle">{p.title}</div></div>
                <div className="sname">{p.seller}</div>
                <div><span className="tbadge" style={{background:ts.bg,color:ts.c}}>{p.type}</span></div>
                <div className="price">{p.price}</div>
                <div className="dt">{p.date}</div>
                <div><span className="sbadge" style={{background:ss.bg,color:ss.c}}>{ss.l}</span></div>
                <div className="acts">
                  {s==='pending'&&<><button className="bap" onClick={()=>setSt(v=>({...v,[p.id]:'active'}))}>Approve ✓</button><button className="brm" onClick={()=>setRmModal(p.id)}>Remove ✗</button></>}
                  {s==='active'&&<button className="brm" onClick={()=>setRmModal(p.id)}>Remove ✗</button>}
                  {s==='removed'&&<button className="brs" onClick={()=>setRsModal(p.id)}>↩ Restore</button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {rmModal&&<div className="mo" onClick={()=>setRmModal(null)}><div className="mb" onClick={e=>e.stopPropagation()}>
        <div className="mt">⚠️ Remove Product?</div>
        <p className="ms">This listing will be hidden from students. You can restore it later.</p>
        <div className="macts"><button className="bcnl" onClick={()=>setRmModal(null)}>Cancel</button><button className="bcrm" onClick={()=>{setSt(v=>({...v,[rmModal]:'removed'}));setRmModal(null);}}>Confirm Remove</button></div>
      </div></div>}
      {rsModal&&<div className="mo" onClick={()=>setRsModal(null)}><div className="mb" onClick={e=>e.stopPropagation()}>
        <div className="mt">↩️ Restore Product?</div>
        <p className="ms">This product will become Active and visible to students again.</p>
        <div className="macts"><button className="bcnl" onClick={()=>setRsModal(null)}>Cancel</button><button className="bcrs" onClick={()=>{setSt(v=>({...v,[rsModal]:'active'}));setRsModal(null);}}>Confirm Restore</button></div>
      </div></div>}
    </>
  );
}
