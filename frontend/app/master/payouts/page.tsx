'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

interface Payout {
  id: string;
  orderId: string;
  grossAmount: number;
  platformCut: number;
  netAmount: number;
  status: string;
  releaseAfter: string;
  releasedAt: string | null;
  isOverdue: boolean;
  createdAt: string;
  seller: { id: string; name: string; email: string; college: { name: string } };
  order: { product: { id: string; title: string; productType: string } };
}

const S = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg:#070B14;--surface:#0D1321;--card:#111827;--card2:#141f35;--bd:#1E2D45;--bd2:#243352;
  --gold:#F7C948;--gold-dim:rgba(247,201,72,.12);--emerald:#10B981;--emerald-dim:rgba(16,185,129,.12);
  --red:#EF4444;--red-dim:rgba(239,68,68,.1);--blue:#3B82F6;--amber:#F59E0B;--amber-dim:rgba(245,158,11,.1);
  --t1:#F0F4FF;--t2:#94A3B8;--t3:#4B5563;
  --font:'DM Sans',sans-serif;--font-head:'Sora',sans-serif;--font-mono:'JetBrains Mono',monospace;
}
* { box-sizing: border-box; }
.po-wrap { padding: 32px; min-height: 100vh; background: var(--bg); font-family: var(--font); }
.po-header { margin-bottom: 28px; }
.po-breadcrumb { font-size: 12px; color: var(--t3); margin-bottom: 8px; }
.po-breadcrumb span { color: var(--gold); }
.po-title { font-family: var(--font-head); font-size: 28px; font-weight: 800; color: var(--t1); margin: 0 0 6px; }
.po-sub { font-size: 13px; color: var(--t2); }

/* Stats grid */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
.stat-card { background: var(--card); border: 1px solid var(--bd); border-radius: 12px; padding: 18px 20px; }
.stat-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .7px; color: var(--t3); margin-bottom: 8px; }
.stat-val { font-family: var(--font-head); font-size: 24px; font-weight: 800; color: var(--t1); }
.stat-val.gold { color: var(--gold); }
.stat-val.emerald { color: var(--emerald); }
.stat-val.red { color: var(--red); }
.stat-val.amber { color: var(--amber); }

/* Toolbar */
.toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
.filter-tabs { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--bd); border-radius: 10px; padding: 4px; }
.filter-tab { padding: 7px 16px; border-radius: 7px; border: none; background: none; font-family: var(--font); font-size: 12px; font-weight: 600; color: var(--t2); cursor: pointer; transition: all .2s; white-space: nowrap; }
.filter-tab.active { background: var(--card); color: var(--t1); }
.release-btn { margin-left: auto; display: flex; align-items: center; gap: 7px; padding: 9px 20px; border-radius: 99px; border: none; background: var(--emerald); color: #070B14; font-size: 13px; font-weight: 800; cursor: pointer; font-family: var(--font-head); transition: all .2s; }
.release-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,185,129,.3); }
.release-btn:disabled { opacity: .5; cursor: not-allowed; }

/* Table card */
.table-card { background: var(--card); border: 1px solid var(--bd); border-radius: 14px; overflow: hidden; }
.table-scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
thead th { padding: 11px 16px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--t3); border-bottom: 1px solid var(--bd); white-space: nowrap; }
tbody td { padding: 14px 16px; font-size: 13px; color: var(--t2); border-bottom: 1px solid rgba(30,45,69,.5); vertical-align: middle; }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: rgba(30,45,69,.3); }
.seller-name { font-weight: 600; color: var(--t1); font-size: 13px; margin-bottom: 2px; }
.seller-email { font-size: 11px; color: var(--t3); font-family: var(--font-mono); }
.college-tag { font-size: 11px; color: var(--blue); background: var(--blue-dim, rgba(59,130,246,.1)); padding: 2px 8px; border-radius: 99px; display: inline-block; margin-top: 3px; }
.product-ttl { font-weight: 600; color: var(--t1); font-size: 13px; }
.product-type { font-size: 11px; color: var(--t3); }
.amt { font-family: var(--font-mono); font-size: 13px; }
.amt.green { color: var(--emerald); font-weight: 700; }
.amt.red { color: var(--red); }
.amt.gold { color: var(--gold); }

/* Status badges */
.badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
.badge.pending { background: var(--amber-dim); color: var(--amber); border: 1px solid rgba(245,158,11,.3); }
.badge.overdue { background: var(--red-dim); color: var(--red); border: 1px solid rgba(239,68,68,.3); animation: pulse 2s infinite; }
.badge.released { background: var(--emerald-dim); color: var(--emerald); border: 1px solid rgba(16,185,129,.3); }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }

/* Release btn per row */
.row-release-btn { padding: 5px 14px; border-radius: 99px; border: 1px solid rgba(16,185,129,.4); background: var(--emerald-dim); color: var(--emerald); font-size: 11px; font-weight: 700; cursor: pointer; font-family: var(--font-head); transition: all .15s; }
.row-release-btn:hover { background: var(--emerald); color: #070B14; }

/* Empty state */
.empty { text-align: center; padding: 60px 20px; color: var(--t3); }
.empty-icon { font-size: 48px; margin-bottom: 14px; }
.empty-title { font-family: var(--font-head); font-size: 16px; font-weight: 700; color: var(--t2); margin-bottom: 6px; }

/* Date */
.date-str { font-family: var(--font-mono); font-size: 11px; color: var(--t3); }

/* Toast */
.toast { position: fixed; bottom: 28px; right: 28px; padding: 14px 20px; border-radius: 12px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 10px; z-index: 9999; animation: slideIn .3s ease; box-shadow: 0 8px 30px rgba(0,0,0,.4); }
.toast.success { background: #052E20; border: 1px solid rgba(16,185,129,.3); color: var(--emerald); }
.toast.error { background: #200505; border: 1px solid rgba(239,68,68,.3); color: var(--red); }
@keyframes slideIn { from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1} }

/* Shimmer */
.shimmer { background: linear-gradient(90deg,var(--card2) 25%,var(--bd) 50%,var(--card2) 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; border-radius:8px; }
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
`;

export default function PayoutsPage() {
  const [payouts, setPayouts]   = useState<Payout[]>([]);
  const [filter, setFilter]     = useState<string>('');
  const [loading, setLoading]   = useState(true);
  const [releasing, setReleasing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast]       = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = filter ? `?status=${filter}` : '';
      const res = await api.get(`/api/master/payouts${q}`);
      setPayouts(res.data.payouts || []);
    } catch { /* empty */ }
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleRelease = async (ids?: string[]) => {
    setReleasing(true);
    try {
      const res = await api.post('/api/master/payouts/release', { payoutIds: ids });
      showToast(`✅ ${res.data.released} payout(s) released`);
      setSelected(new Set());
      await load();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to release', 'error');
    }
    setReleasing(false);
  };

  const toggleSelect = (id: string) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  /* Stats */
  const total     = payouts.length;
  const pending   = payouts.filter(p => p.status === 'pending').length;
  const overdue   = payouts.filter(p => p.isOverdue).length;
  const released  = payouts.filter(p => p.status === 'released').length;
  const totalNet  = payouts.reduce((s, p) => s + p.netAmount, 0);

  const overdueList = payouts.filter(p => p.isOverdue);

  return (
    <>
      <style>{S}</style>
      <div className="po-wrap">
        <div className="po-header">
          <div className="po-breadcrumb">Master Admin · <span>Seller Payouts</span></div>
          <h1 className="po-title">💸 Seller Payouts</h1>
          <div className="po-sub">Track and release platform-held seller earnings</div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Payouts</div>
            <div className="stat-val">{total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending Release</div>
            <div className="stat-val amber">{pending}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Overdue 🔴</div>
            <div className="stat-val red">{overdue}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Payout Value</div>
            <div className="stat-val gold">₹{totalNet.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="filter-tabs">
            {[
              { label: 'All',     val: '' },
              { label: '⏳ Pending',  val: 'pending' },
              { label: '🔴 Overdue', val: 'overdue' },
              { label: '✅ Released', val: 'released' },
            ].map(f => (
              <button key={f.val} className={`filter-tab${filter === f.val ? ' active' : ''}`} onClick={() => { setFilter(f.val); setSelected(new Set()); }}>
                {f.label}
              </button>
            ))}
          </div>
          {selected.size > 0 && (
            <button className="release-btn" onClick={() => handleRelease([...selected])} disabled={releasing}>
              {releasing ? '⏳ Releasing...' : `✅ Release ${selected.size} Selected`}
            </button>
          )}
          {overdueList.length > 0 && selected.size === 0 && (
            <button className="release-btn" onClick={() => handleRelease()} disabled={releasing}>
              {releasing ? '⏳ Releasing...' : `🚀 Release All Overdue (${overdueList.length})`}
            </button>
          )}
        </div>

        {/* Table */}
        <div className="table-card">
          {loading ? (
            <div style={{padding:24}}>
              {[...Array(5)].map((_, i) => <div key={i} className="shimmer" style={{height:54,marginBottom:8}} />)}
            </div>
          ) : payouts.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">💸</div>
              <div className="empty-title">No payouts found</div>
              <div style={{fontSize:13,color:'var(--t3)',marginTop:6}}>
                {filter ? 'Try a different filter' : 'Completed deals will appear here'}
              </div>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th style={{width:40}}>
                      <input type="checkbox" style={{cursor:'pointer'}}
                        checked={selected.size === payouts.filter(p=>p.status==='pending').length && payouts.filter(p=>p.status==='pending').length > 0}
                        onChange={e => {
                          if (e.target.checked) setSelected(new Set(payouts.filter(p=>p.status==='pending').map(p=>p.id)));
                          else setSelected(new Set());
                        }} />
                    </th>
                    <th>Seller</th>
                    <th>Product</th>
                    <th>Gross (₹)</th>
                    <th>Platform Cut</th>
                    <th>Net Payout</th>
                    <th>Status</th>
                    <th>Release After</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(p => (
                    <tr key={p.id}>
                      <td>
                        {p.status === 'pending' && (
                          <input type="checkbox" style={{cursor:'pointer'}}
                            checked={selected.has(p.id)}
                            onChange={() => toggleSelect(p.id)} />
                        )}
                      </td>
                      <td>
                        <div className="seller-name">{p.seller.name || 'Unknown'}</div>
                        <div className="seller-email">{p.seller.email}</div>
                        <span className="college-tag">{p.seller.college?.name}</span>
                      </td>
                      <td>
                        <div className="product-ttl">{p.order?.product?.title || '—'}</div>
                        <div className="product-type">{p.order?.product?.productType === 'digital' ? '🖥 Digital' : '📦 Physical'}</div>
                      </td>
                      <td><span className="amt">₹{p.grossAmount.toLocaleString('en-IN')}</span></td>
                      <td><span className="amt red">−₹{p.platformCut.toLocaleString('en-IN')}</span></td>
                      <td><span className="amt green">₹{p.netAmount.toLocaleString('en-IN')}</span></td>
                      <td>
                        {p.isOverdue
                          ? <span className="badge overdue">🔴 Overdue</span>
                          : p.status === 'released'
                            ? <span className="badge released">✅ Released</span>
                            : <span className="badge pending">⏳ Pending</span>
                        }
                      </td>
                      <td>
                        <div className="date-str">{new Date(p.releaseAfter).toLocaleDateString('en-IN', { day:'numeric',month:'short',year:'numeric' })}</div>
                        {p.releasedAt && (
                          <div className="date-str" style={{color:'var(--emerald)'}}>
                            Released {new Date(p.releasedAt).toLocaleDateString('en-IN')}
                          </div>
                        )}
                      </td>
                      <td>
                        {(p.status === 'pending') && (
                          <button className="row-release-btn" onClick={() => handleRelease([p.id])} disabled={releasing}>
                            Release
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
