'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../store/authStore';
import api from '@/lib/axios';

type PS = 'pending' | 'active' | 'removed';

interface Product {
  id: string; title: string; seller: string; price: string; priceRaw: number;
  category: string; status: PS; isApproved: boolean; orders: number;
  date: string; imageUrl?: string; description?: string;
}

const CAT_ICON: Record<string, string> = {
  BOOK: '📕', LAPTOP: '💻', PHONE: '📱', NOTE: '📄', VIDEO: '🎥', OTHER: '📦',
};

const SC: Record<PS, { bg: string; c: string; l: string }> = {
  pending: { bg: 'rgba(245,158,11,.12)', c: '#F59E0B', l: 'PENDING' },
  active:  { bg: 'rgba(16,185,129,.12)', c: '#10B981', l: 'ACTIVE'  },
  removed: { bg: 'rgba(239,68,68,.12)',  c: '#EF4444', l: 'REMOVED' },
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
    } catch { showToast('❌ Action failed'); }
    finally { setActionLoading(null); setRmModal(null); setRsModal(null); }
  };

  const cnt = {
    all: products.length,
    pending: products.filter(p => p.status === 'pending').length,
    active:  products.filter(p => p.status === 'active').length,
    removed: products.filter(p => p.status === 'removed').length,
  };

  const rows = products.filter(p => {
    if (tab !== 'all' && p.status !== tab) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.seller.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
        :root{--bg:#0A0E1A;--card:#111827;--card2:#1a2235;--border:#1e2d45;--green:#10B981;--blue:#4F8EF7;--org:#F59E0B;--red:#EF4444;--txt:#F0F4FF;--mut:#6B7280;--soft:#9CA3AF}
        .page{background:var(--bg);min-height:100vh;padding:36px 40px;animation:fi .35s ease}
        @keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        h1{font-family:'Sora',sans-serif;font-size:28px;font-weight:700;margin-bottom:4px;color:var(--txt)}
        .sub{font-size:14px;color:var(--mut);margin-bottom:22px}
        .stat-row{display:flex;gap:12px;margin-bottom:20px}
        .sc-stat{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px 16px;display:flex;align-items:center;gap:8px}
        .sn{font-family:'Sora',sans-serif;font-size:20px;font-weight:700;color:var(--txt)}
        .sl{font-size:12px;color:var(--mut)}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .dot{width:8px;height:8px;border-radius:50%;background:var(--org);animation:pulse 1.5s ease-in-out infinite}
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
        .tbl{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden}
        .th{display:grid;grid-template-columns:2.5fr 1fr 1fr .8fr .8fr 1fr 1.3fr;background:var(--card2);padding:11px 18px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--mut);border-bottom:1px solid var(--border)}
        .tr{display:grid;grid-template-columns:2.5fr 1fr 1fr .8fr .8fr 1fr 1.3fr;padding:13px 18px;align-items:center;border-bottom:1px solid rgba(30,45,69,.5);transition:background .15s}
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
      `}</style>

      {toast && <div className="toast">{toast}</div>}

      <div className="page">
        <h1>Product Management</h1>
        <p className="sub">Review, approve, and moderate all college listings</p>

        <div className="stat-row">
          <div className="sc-stat"><span className="sn">{cnt.all}</span><span className="sl">Total</span></div>
          <div className="sc-stat"><div className="dot" /><span className="sn" style={{ color: 'var(--org)' }}>{cnt.pending}</span><span className="sl">Pending</span></div>
          <div className="sc-stat"><span className="sn" style={{ color: 'var(--green)' }}>{cnt.active}</span><span className="sl">Active</span></div>
          <div className="sc-stat"><span className="sn" style={{ color: 'var(--red)' }}>{cnt.removed}</span><span className="sl">Removed</span></div>
        </div>

        <div className="fbar">
          <div className="pills">
            {(['all', 'pending', 'active', 'removed'] as const).map(t => (
              <button key={t} className={`pill ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}<span className="cnt">{cnt[t]}</span>
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
                  {p.status === 'pending' && <>
                    <button className="bap" disabled={actionLoading === p.id} onClick={() => doAction(p.id, 'approve')}>Approve ✓</button>
                    <button className="brm" onClick={() => setRmModal(p.id)}>Remove ✗</button>
                  </>}
                  {p.status === 'active' && <button className="brm" onClick={() => setRmModal(p.id)}>Remove ✗</button>}
                  {p.status === 'removed' && <button className="brs" onClick={() => setRsModal(p.id)}>↩ Restore</button>}
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
    </>
  );
}
