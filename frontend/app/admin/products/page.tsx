'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../store/authStore';
import api from '@/lib/axios';

type PS = 'pending' | 'active' | 'removed' | 'sold';

interface Product {
  id: string; title: string; seller: string; price: string; priceRaw: number;
  category: string; status: PS; isApproved: boolean; orders: number;
  date: string; images?: string[]; imageUrl?: string; description?: string;
}

const CAT_ICON: Record<string, string> = {
  BOOK: '📕', LAPTOP: '💻', PHONE: '📱', NOTE: '📄', VIDEO: '🎥', OTHER: '📦',
};

const isImage = (url: string) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);
const isVideo = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url);
const isPdf = (url: string) => /\.pdf$/i.test(url) || url.includes('/documents/') || url.includes('.pdf');

const SC: Record<PS, { bg: string; c: string; l: string }> = {
  pending: { bg: 'rgba(245,158,11,.12)', c: '#F59E0B', l: 'PENDING' },
  active:  { bg: 'rgba(16,185,129,.12)', c: '#10B981', l: 'ACTIVE'  },
  removed: { bg: 'rgba(239,68,68,.12)',  c: '#EF4444', l: 'REMOVED' },
  sold:    { bg: 'rgba(79,142,247,.12)',  c: '#4F8EF7',  l: 'SOLD OUT' },
};

export default function ProductManagementPage() {
  const { accessToken } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | PS>('all');
  const [search, setSearch] = useState('');
  const [rmModal, setRmModal] = useState<string | null>(null);
  const [rsModal, setRsModal] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [viewModal, setViewModal] = useState<Product | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchProducts = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await api.get('/api/admin/products');
      // Map removed = not approved & has been seen (we track via status field)
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [accessToken]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const doAction = async (id: string, action: 'approve' | 'remove' | 'restore') => {
    setActionLoading(id);
    try {
      await api.post(`/api/admin/products/${id}/${action}`);
      showToast(action === 'approve' ? '✅ Product approved!' : action === 'remove' ? '🗑 Product removed.' : '↩ Product restored!');
      await fetchProducts();
    } catch (e) { console.error(e); showToast('❌ Action failed'); }
    finally { setActionLoading(null); setRmModal(null); setRsModal(null); }
  };

  const cnt = {
    all: products.length,
    pending: products.filter(p => p.status === 'pending').length,
    active:  products.filter(p => p.status === 'active').length,
    removed: products.filter(p => p.status === 'removed').length,
    sold:    products.filter(p => p.status === 'sold').length,
  };

  const rows = products.filter(p => {
    if (tab !== 'all' && p.status !== tab) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.seller.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch (_e) { return d; }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
        :root{--bg:#0A0E1A;--card:#111827;--card2:#1a2235;--border:#1e2d45;--green:#10B981;--blue:#4F8EF7;--org:#F59E0B;--red:#EF4444;--txt:#F0F4FF;--mut:#6B7280;--soft:#9CA3AF}
        .page{background:var(--bg);min-height:100vh;padding:36px 40px;max-width:1200px;margin:0 auto;width:100%;box-sizing:border-box;animation:fi .35s ease}
        @keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        h1{font-family:'Sora',sans-serif;font-size:28px;font-weight:700;margin-bottom:4px;color:var(--txt)}
        .sub{font-size:14px;color:var(--mut);margin-bottom:22px}
        .stat-row{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:20px}
        .sc-stat{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px 16px;display:flex;align-items:center;gap:8px}
        .sn{font-family:'Sora',sans-serif;font-size:20px;font-weight:700;color:var(--txt)}
        .sl{font-size:12px;color:var(--mut)}
        .dot{width:8px;height:8px;border-radius:50%;background:var(--org)}
        .fbar{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap}
        .pills{display:flex;gap:6px}
        .pill{border:1px solid var(--border);border-radius:9999px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;background:var(--card2);color:var(--soft);font-family:'DM Sans',sans-serif;transition:all .18s}
        .pill.on{background:rgba(16,185,129,.15);color:var(--green);border-color:rgba(16,185,129,.4)}
        .cnt{display:inline-block;background:rgba(255,255,255,.1);border-radius:9999px;padding:1px 6px;font-size:10px;margin-left:4px}
        .sw{position:relative;flex:1;max-width:280px}
        .si{position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:13px;color:var(--mut)}
        .sinput{width:100%;background:var(--card2);border:1.5px solid var(--border);border-radius:9px;color:var(--txt);padding:9px 12px 9px 34px;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s}
        .sinput::placeholder{color:var(--mut)}
        .sinput:focus{border-color:var(--green)}
        .tbl{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;width:100%}
        .th{display:grid;grid-template-columns:2.1fr 1fr 1fr .8fr .8fr 1fr 1.8fr;background:var(--card2);padding:11px 18px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--mut);border-bottom:1px solid var(--border)}
        .tr{display:grid;grid-template-columns:2.1fr 1fr 1fr .8fr .8fr 1fr 1.8fr;padding:13px 18px;align-items:center;border-bottom:1px solid rgba(30,45,69,.5);transition:background .15s}
        .tr:last-child{border-bottom:none}
        .tr:hover{background:rgba(16,185,129,.025)}
        .pcell{display:flex;align-items:center;gap:9px}
        .pib{width:36px;height:36px;border-radius:7px;background:var(--card2);display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}
        .ptitle{font-size:13px;font-weight:600;color:var(--txt);line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .sname{font-size:13px;color:var(--blue)}
        .tbadge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:9999px;background:rgba(79,142,247,.12);color:var(--blue)}
        .sbadge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:9999px}
        .price{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;color:var(--green)}
        .dt{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--mut)}
        .acts{display:flex;gap:6px}
        .bap{background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.4);color:var(--green);padding:5px 10px;border-radius:9999px;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s}
        .bap:hover{background:rgba(16,185,129,.3)}
        .bap:disabled{opacity:.5;cursor:not-allowed}
        .brm{background:transparent;border:1px solid rgba(239,68,68,.4);color:var(--red);padding:5px 10px;border-radius:9999px;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s}
        .brm:hover{background:rgba(239,68,68,.1)}
        .brs{background:rgba(79,142,247,.1);border:1px solid rgba(79,142,247,.35);color:var(--blue);padding:5px 10px;border-radius:9999px;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif}
        .empty{text-align:center;padding:56px 20px;color:var(--mut)}
        .skeleton{background:linear-gradient(90deg,var(--card2) 25%,#202d42 50%,var(--card2) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .mo{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center}
        .mb{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:28px;max-width:420px;width:90%}
        .mt{font-family:'Sora',sans-serif;font-size:19px;font-weight:700;color:var(--txt);margin-bottom:6px}
        .ms{font-size:13px;color:var(--soft);margin-bottom:20px;line-height:1.6}
        .macts{display:flex;gap:10px;justify-content:flex-end}
        .bcnl{background:none;border:1px solid var(--border);color:var(--mut);padding:9px 18px;border-radius:9999px;cursor:pointer;font-size:13px;font-family:'DM Sans',sans-serif}
        .bcrm{background:var(--red);color:#fff;border:none;padding:9px 18px;border-radius:9999px;cursor:pointer;font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif}
        .bcrs{background:var(--blue);color:#fff;border:none;padding:9px 18px;border-radius:9999px;cursor:pointer;font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif}
        .toast{position:fixed;top:24px;right:28px;background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.35);color:var(--green);padding:12px 20px;border-radius:10px;font-size:13px;font-weight:700;z-index:2000;animation:slideIn .3s ease}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}

        @media (max-width: 1024px) {
          .stat-row {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .page { padding: 20px 16px; }
          h1 { font-size: 22px; }
          .stat-row {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .stat-row > :last-child {
            grid-column: span 2 !important;
          }
          .fbar { flex-direction: column; align-items: stretch; gap: 12px; }
          .sw { max-width: none; }
          .pills {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding-bottom: 4px;
            width: 100%;
            -webkit-overflow-scrolling: touch;
          }
          .pills::-webkit-scrollbar {
            display: none;
          }
          .pill {
            flex-shrink: 0;
            white-space: nowrap;
          }
          
          /* Table to Cards Conversion */
          .th { display: none; }
          .tbl { background: none; border: none; border-radius: 0; }
          .tr {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            padding: 16px;
            border-radius: 12px;
            background: var(--card);
            border: 1px solid var(--border);
            margin-bottom: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .tr:hover { background: var(--card); }
          .tr > div { width: 100%; display: flex; justify-content: space-between; align-items: center; }
          
          .tr > .pcell { order: 1; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; justify-content: flex-start; }
          .tr > .sname { order: 2; display: flex; justify-content: space-between; }
          .tr > .sname::before { content: 'Seller'; font-size: 11px; color: var(--mut); font-weight: 500; }
          .tr > :nth-child(3) { order: 3; display: flex; justify-content: space-between; }
          .tr > :nth-child(3)::before { content: 'Category'; font-size: 11px; color: var(--mut); font-weight: 500; }
          .tr > .price { order: 4; display: flex; justify-content: space-between; }
          .tr > .price::before { content: 'Price'; font-size: 11px; color: var(--mut); font-weight: 500; }
          .tr > .dt { order: 5; display: flex; justify-content: space-between; }
          .tr > .dt::before { content: 'Listed Date'; font-size: 11px; color: var(--mut); font-weight: 500; }
          .tr > :nth-child(6) { order: 6; display: flex; justify-content: space-between; }
          .tr > :nth-child(6)::before { content: 'Status'; font-size: 11px; color: var(--mut); font-weight: 500; }
          .tr > .acts { order: 7; display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; margin-top: 4px; }
          
          /* Modals responsive optimization */
          .mb { padding: 20px 16px; max-height: 90vh; overflow-y: auto; }
          .mo { padding: 10px; }
        }
      `}</style>

      {toast && <div className="toast">{toast}</div>}

      <div className="page">
        <h1>Product Management</h1>
        <p className="sub">Review, approve, and moderate all college listings</p>

        <div className="stat-row">
          <div className="sc-stat"><span className="sn">{cnt.all}</span><span className="sl">Total</span></div>
          <div className="sc-stat">{cnt.pending > 0 && <div className="dot" />}{loading ? <div className="skeleton" style={{ height: 24, width: 24 }} /> : <span className="sn" style={{ color: 'var(--org)' }}>{cnt.pending}</span>}<span className="sl">Pending</span></div>
          <div className="sc-stat"><span className="sn" style={{ color: 'var(--green)' }}>{cnt.active}</span><span className="sl">Active</span></div>
          <div className="sc-stat"><span className="sn" style={{ color: 'var(--red)' }}>{cnt.removed}</span><span className="sl">Removed</span></div>
          <div className="sc-stat"><span className="sn" style={{ color: 'var(--blue)' }}>{cnt.sold}</span><span className="sl">Sold Out</span></div>
        </div>

        <div className="fbar">
          <div className="pills">
            {(['all', 'pending', 'active', 'removed', 'sold'] as const).map(t => (
              <button key={t} className={`pill ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
                {t === 'sold' ? 'Sold Out' : t.charAt(0).toUpperCase() + t.slice(1)}<span className="cnt">{cnt[t]}</span>
              </button>
            ))}
          </div>
          <div className="sw">
            <span className="si">🔍</span>
            <input className="sinput" placeholder="Search products or sellers…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="tbl">
          <div className="th"><div>Product</div><div>Seller</div><div>Category</div><div>Price</div><div>Date</div><div>Status</div><div>Actions</div></div>
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="tr">{Array(7).fill(0).map((_, j) => <div key={j}><div className="skeleton" style={{ height: 14, width: j === 0 ? 160 : 80 }} /></div>)}</div>
            ))
          ) : rows.length === 0 ? (
            <div className="empty">📦 No products found</div>
          ) : rows.map(p => {
            const ss = SC[p.status];
            return (
              <div key={p.id} className="tr">
                <div className="pcell">
                  <div className="pib">{CAT_ICON[p.category] || '📦'}</div>
                  <div className="ptitle" title={p.title}>{p.title}</div>
                </div>
                <div className="sname">{p.seller}</div>
                <div><span className="tbadge">{p.category}</span></div>
                <div className="price">{p.price}</div>
                <div className="dt">{fmtDate(p.date)}</div>
                <div><span className="sbadge" style={{ background: ss.bg, color: ss.c }}>{ss.l}</span></div>
                <div className="acts">
                  <button className="brs" style={{ border: '1.5px solid rgba(79,142,247,.35)', color: 'var(--blue)', padding: '5px 11px' }} onClick={() => setViewModal(p)}>👁 View</button>
                  {p.status === 'pending' && !p.isApproved && <>
                    <button className="bap" disabled={actionLoading === p.id} onClick={() => doAction(p.id, 'approve')}>Approve ✓</button>
                    <button className="brm" onClick={() => setRmModal(p.id)}>Remove ✗</button>
                  </>}
                  {(p.status === 'active' || (p.status === 'pending' && p.isApproved)) && <button className="brm" onClick={() => setRmModal(p.id)}>Remove ✗</button>}
                  {p.status === 'removed' && <button className="brs" onClick={() => setRsModal(p.id)}>↩ Restore</button>}
                  {p.status === 'sold' && <span style={{ color: 'var(--mut)', padding: '5px 10px' }}>—</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {rmModal && <div className="mo" onClick={() => setRmModal(null)}><div className="mb" onClick={e => e.stopPropagation()}>
        <div className="mt">⚠️ Remove Product?</div>
        <p className="ms">This listing will be hidden from students. You can restore it later.</p>
        <div className="macts">
          <button className="bcnl" onClick={() => setRmModal(null)}>Cancel</button>
          <button className="bcrm" onClick={() => doAction(rmModal, 'remove')}>Confirm Remove</button>
        </div>
      </div></div>}
 
      {rsModal && <div className="mo" onClick={() => setRsModal(null)}><div className="mb" onClick={e => e.stopPropagation()}>
        <div className="mt">↩️ Restore Product?</div>
        <p className="ms">This product will become Active and visible to students again.</p>
        <div className="macts">
          <button className="bcnl" onClick={() => setRsModal(null)}>Cancel</button>
          <button className="bcrs" onClick={() => doAction(rsModal, 'restore')}>Confirm Restore</button>
        </div>
      </div></div>}

      {viewModal && (
        <div className="mo" onClick={() => setViewModal(null)}>
          <div className="mb" style={{ maxWidth: '640px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="mt" style={{ fontSize: '20px' }}>Product Specifications</div>
              <span className="sbadge" style={{ background: SC[viewModal.status].bg, color: SC[viewModal.status].c }}>{SC[viewModal.status].l}</span>
            </div>

            {/* Images Grid */}
            {viewModal.images && viewModal.images.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: viewModal.images.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: 10,
                marginBottom: 20,
                maxHeight: '220px',
                overflowY: 'auto',
                padding: 4,
                border: '1px solid var(--border)',
                borderRadius: 10,
                background: 'var(--card2)'
              }}>
                {viewModal.images.map((img, idx) => {
                  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://project-campuseconnect.onrender.com';
                  const fullImgUrl = img.startsWith('http') ? img : `${API_URL}${img}`;
                  
                  if (isVideo(img)) {
                    return (
                      <div key={idx} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <video src={fullImgUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    );
                  }
                  
                  if (isPdf(img)) {
                    return (
                      <div key={idx} onClick={() => window.open(fullImgUrl, '_blank')} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 8, border: '1.5px dashed rgba(167, 139, 250, 0.3)', background: 'rgba(167, 139, 250, 0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 8, boxSizing: 'border-box' }} title="Click to view full PDF document">
                        <span style={{ fontSize: '28px', marginBottom: '4px' }}>📄</span>
                        <span style={{ fontSize: '10px', color: 'var(--soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
                          {img.split('/').pop() || 'document.pdf'}
                        </span>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={idx} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', cursor: 'pointer' }}>
                      <img src={fullImgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onClick={() => window.open(fullImgUrl, '_blank')} title="Click to view full poster image" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '24px', background: 'var(--card2)', borderRadius: 10, border: '1px solid var(--border)', color: 'var(--mut)', marginBottom: 20, textAlign: 'center' }}>
                No product images/posters uploaded
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--txt)', marginBottom: 4 }}>{viewModal.title}</h3>
                <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--soft)' }}>
                  <span>Category: <strong>{viewModal.category}</strong></span> · 
                  <span>Price: <strong style={{ color: 'var(--green)' }}>{viewModal.price}</strong></span>
                </div>
              </div>

              <div style={{ height: 1, background: 'var(--border)' }} />

              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mut)', marginBottom: 4 }}>Seller Contact Info</div>
                <div style={{ fontSize: 13, color: 'var(--txt)' }}>Name: <strong style={{ color: 'var(--blue)' }}>{viewModal.seller}</strong></div>
              </div>

              <div style={{ height: 1, background: 'var(--border)' }} />

              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--mut)', marginBottom: 4 }}>Description / Specifications</div>
                <p style={{ fontSize: 13, color: 'var(--soft)', lineHeight: 1.6, whiteSpace: 'pre-line', maxHeight: '160px', overflowY: 'auto' }}>
                  {viewModal.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <div className="macts" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <button className="bcnl" onClick={() => setViewModal(null)}>Close</button>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                {viewModal.status === 'pending' && !viewModal.isApproved && (
                  <>
                    <button className="bcrm" style={{ background: 'transparent', border: '1.5px solid var(--red)', color: 'var(--red)' }} onClick={() => { setRmModal(viewModal.id); setViewModal(null); }}>Remove ✗</button>
                    <button className="bap" onClick={() => { doAction(viewModal.id, 'approve'); setViewModal(null); }}>Approve ✓</button>
                  </>
                )}
                {(viewModal.status === 'active' || (viewModal.status === 'pending' && viewModal.isApproved)) && (
                  <button className="bcrm" onClick={() => { setRmModal(viewModal.id); setViewModal(null); }}>Remove ✗</button>
                )}
                {viewModal.status === 'removed' && (
                  <button className="bcrs" onClick={() => { doAction(viewModal.id, 'restore'); setViewModal(null); }}>Restore</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
