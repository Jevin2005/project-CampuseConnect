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

const COLORS = ['#4F8EF7', '#10B981', '#7C3AED', '#F59E0B', '#EC4899', '#14B8A6', '#F97316'];
function avatarColor(name: string) {
  const code = (name || 'Unknown').charCodeAt(0);
  return COLORS[code % COLORS.length];
}
function initials(name: string) {
  return (name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

const S = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg: #080C14;
  --card: rgba(15, 23, 42, 0.9);
  --card2: rgba(20, 30, 55, 0.92);
  --border: rgba(99, 130, 190, 0.15);
  --border-hover: rgba(247, 201, 72, 0.4);
  --gold: #F7C948;
  --gold2: #F59E0B;
  --blue: #4F8EF7;
  --green: #10B981;
  --purple: #7C3AED;
  --red: #EF4444;
  --t1: #F0F4FF;
  --t2: #9CA3AF;
  --t3: #6B7280;
}

* { box-sizing: border-box; }

.po-wrap {
  padding: 36px;
  min-height: 100vh;
  background: var(--bg);
  background-image: radial-gradient(ellipse 60% 30% at 50% 0%, rgba(247,201,72,.04) 0%, transparent 70%);
  font-family: 'DM Sans', sans-serif;
}

.po-header { margin-bottom: 28px; }
.po-breadcrumb { font-size: 12px; color: var(--t3); margin-bottom: 8px; font-family: 'JetBrains Mono', monospace; }
.po-breadcrumb span { color: var(--gold); }
.po-title { font-family: 'Sora', sans-serif; font-size: 30px; font-weight: 800; color: var(--t1); margin: 0 0 6px; letter-spacing: -0.5px; }
.po-title span { color: var(--gold); }
.po-sub { font-size: 13px; color: var(--t3); }

/* Stats grid */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
.stat-card {
  background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 22px 24px;
  backdrop-filter: blur(16px); transition: transform .2s, border-color .25s, box-shadow .25s;
  position: relative; overflow: hidden;
}
.stat-card::before {
  content: ''; position: absolute; inset: 0; border-radius: 16px;
  background: linear-gradient(135deg, rgba(255,255,255,.025) 0%, transparent 60%);
  pointer-events: none;
}
.stat-card:hover { border-color: var(--border-hover); transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,.35); }
.stat-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--t3); margin-bottom: 8px; }
.stat-val { font-family: 'Sora', sans-serif; font-size: 24px; font-weight: 800; color: var(--t1); line-height: 1; }
.stat-val.gold { color: var(--gold); }
.stat-val.emerald { color: var(--green); }
.stat-val.red { color: var(--red); }
.stat-val.amber { color: var(--gold2); }

/* Toolbar */
.toolbar { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; flex-wrap: wrap; }
.filter-tabs { display: flex; gap: 2px; background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border); border-radius: 10px; padding: 4px; }
.filter-tab { padding: 8px 18px; border-radius: 7px; border: none; background: none; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; color: var(--t3); cursor: pointer; transition: all .2s; white-space: nowrap; }
.filter-tab.active { background: var(--card2); color: var(--gold); text-shadow: 0 0 10px rgba(247,201,72,.2); border: 1px solid rgba(247,201,72,.15); }
.filter-tab:hover:not(.active) { color: var(--t2); }

/* Search Wrap */
.search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 320px; }
.search-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); font-size: 14px; color: var(--t3); pointer-events: none; }
.inp {
  width: 100%; background: var(--card2); border: 1.5px solid var(--border); border-radius: 10px; padding: 10px 13px 10px 38px;
  font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--t1); outline: none; transition: border-color .2s, box-shadow .2s;
}
.inp::placeholder { color: #3d4f6b; }
.inp:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(247,201,72,.1); }

/* Buttons */
.release-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 20px; border-radius: 9999px; border: 1px solid rgba(16, 185, 129, 0.35);
  background: rgba(16, 185, 129, 0.08); color: var(--green); font-size: 13px; font-weight: 800;
  cursor: pointer; font-family: 'Sora', sans-serif; transition: all .25s ease;
}
.release-btn:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.16);
  border-color: var(--green);
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.25);
  transform: translateY(-1px);
}
.release-btn.warning {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.08);
  color: var(--gold2);
}
.release-btn.warning:hover:not(:disabled) {
  background: rgba(245, 158, 11, 0.16);
  border-color: var(--gold2);
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.25);
}
.release-btn:disabled { opacity: .4; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

/* Table card */
.table-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; backdrop-filter: blur(16px); }
.table-scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
thead th { padding: 12px 16px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: var(--t3); border-bottom: 1px solid var(--border); background: rgba(8,12,24,.5); white-space: nowrap; }
tbody td { padding: 14px 16px; font-size: 13px; color: var(--t2); border-bottom: 1px solid rgba(99,130,190,.08); vertical-align: middle; white-space: nowrap; }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: rgba(247,201,72,.02); }

/* Checkbox Custom Styles */
input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;
  background-color: var(--card2);
  margin: 0;
  font: inherit;
  color: var(--gold);
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--border);
  border-radius: 4px;
  display: inline-grid;
  place-content: center;
  cursor: pointer;
  transition: 120ms border-color ease-in-out, 120ms background-color ease-in-out;
}
input[type="checkbox"]::before {
  content: "✓";
  width: 10px;
  height: 10px;
  transform: scale(0);
  transition: 120ms transform ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 900;
  color: #070B14;
}
input[type="checkbox"]:checked {
  border-color: var(--gold);
  background-color: var(--gold);
}
input[type="checkbox"]:checked::before {
  transform: scale(1);
}
input[type="checkbox"]:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(247,201,72,.15);
}

/* Seller Wrap */
.seller-wrap { display: flex; align-items: center; gap: 10px; }
.seller-avatar {
  width: 34px; height: 34px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; color: #fff; flex-shrink: 0;
}
.seller-name { font-weight: 600; color: var(--t1); font-size: 13px; }
.seller-email { font-size: 10px; color: var(--t3); font-family: var(--font-mono); margin-top: 1px; }
.college-tag { font-size: 10px; font-weight: 700; color: var(--blue); background: rgba(79,142,247,.08); border: 1px solid rgba(79,142,247,.2); padding: 2px 8px; border-radius: 99px; display: inline-block; margin-top: 4px; }
.product-ttl { font-weight: 600; color: var(--t1); font-size: 13px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; }
.product-type { font-size: 11px; color: var(--t3); margin-top: 2px; }
.amt { font-family: var(--font-mono); font-size: 13px; font-weight: 600; }
.amt.green { color: var(--green); font-weight: 700; }
.amt.red { color: var(--red); }
.amt.gold { color: var(--gold); }

/* Status badges */
.badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; white-space: nowrap; }
.badge.pending { background: rgba(245,158,11,.08); color: var(--gold2); border: 1px solid rgba(245,158,11,.2); }
.badge.overdue { background: rgba(239,68,68,.08); color: var(--red); border: 1px solid rgba(239,68,68,.25); box-shadow: 0 0 10px rgba(239,68,68,0.1); }
.badge.released { background: rgba(16,185,129,.08); color: var(--green); border: 1px solid rgba(16,185,129,.2); }

/* Row Action Buttons */
.row-release-btn {
  padding: 5px 12px; border-radius: 9999px; border: 1px solid rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.06); color: var(--green); font-size: 11px; font-weight: 700;
  cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s ease;
  display: inline-flex; align-items: center; gap: 4px;
}
.row-release-btn:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.16);
  border-color: var(--green);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
  transform: translateY(-0.5px);
}
.row-release-btn.warning {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.06);
  color: var(--gold2);
}
.row-release-btn.warning:hover:not(:disabled) {
  background: rgba(245, 158, 11, 0.16);
  border-color: var(--gold2);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.2);
}
.row-release-btn:disabled { opacity: .4; cursor: not-allowed; }

/* Empty state */
.empty { text-align: center; padding: 70px 20px; color: var(--t3); }
.empty-icon { font-size: 52px; margin-bottom: 16px; opacity: .6; }
.empty-title { font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 700; color: var(--t1); margin-bottom: 6px; }

/* Date styling */
.date-str { font-family: var(--font-mono); font-size: 11px; color: var(--t3); }

/* Shimmer */
.shimmer { background: linear-gradient(90deg,var(--card2) 25%,var(--border) 50%,var(--card2) 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; border-radius:8px; }
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* Toast Notification */
.toast-container {
  position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  background: rgba(15, 23, 42, 0.95);
  border: 1.5px solid rgba(247, 201, 72, 0.35);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(247,201,72,0.15);
  padding: 12px 22px; border-radius: 12px;
  color: var(--t1); font-size: 13px; font-weight: 600;
  display: flex; align-items: center; gap: 10px;
  backdrop-filter: blur(12px);
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideIn {
  from { transform: translateY(20px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}
`;

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string>('');

  // Safeguard confirmation states
  const [confirmPayoutId, setConfirmPayoutId] = useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [confirmAllOverdue, setConfirmAllOverdue] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(prev => prev === msg ? '' : prev);
    }, 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch high limit so we can do accurate global stats + fast client-side tab switching
      const res = await api.get('/api/master/payouts?limit=250');
      setPayouts(res.data.payouts || []);
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRelease = async (ids?: string[]) => {
    setReleasing(true);
    try {
      const res = await api.post('/api/master/payouts/release', { payoutIds: ids });
      showToast(`Released payout(s) successfully! 💸`);
      setSelected(new Set());
      setConfirmPayoutId(null);
      setConfirmBulk(false);
      setConfirmAllOverdue(false);

      // Real-time optimistic local state update for instant feedback
      const nowStr = new Date().toISOString();
      setPayouts(prev => prev.map(p => {
        const matches = ids ? ids.includes(p.id) : p.isOverdue;
        if (matches && p.status === 'pending') {
          return { ...p, status: 'released', releasedAt: nowStr, isOverdue: false };
        }
        return p;
      }));

      // Reload database values silently in background
      load();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to release payouts ⚠️');
    } finally {
      setReleasing(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  // Global static stats computed from total database list
  const total = payouts.length;
  const pending = payouts.filter(p => p.status === 'pending').length;
  const overdue = payouts.filter(p => p.isOverdue).length;
  const totalNet = payouts.filter(p => p.status === 'pending' || p.isOverdue).reduce((s, p) => s + p.netAmount, 0);

  // Client-side filtration based on status tabs & search query
  const filteredPayouts = payouts.filter(p => {
    // 1. Tab filtration
    if (filter === 'pending' && p.status !== 'pending') return false;
    if (filter === 'released' && p.status !== 'released') return false;
    if (filter === 'overdue' && !p.isOverdue) return false;

    // 2. Query filtration
    const q = search.toLowerCase();
    return (
      !search ||
      p.seller.name.toLowerCase().includes(q) ||
      p.seller.email.toLowerCase().includes(q) ||
      (p.seller.college?.name || '').toLowerCase().includes(q) ||
      (p.order?.product?.title || '').toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  });

  const pendingFiltered = filteredPayouts.filter(p => p.status === 'pending');
  const allChecked = pendingFiltered.length > 0 && pendingFiltered.every(p => selected.has(p.id));
  const overdueList = payouts.filter(p => p.isOverdue);

  return (
    <>
      <style>{S}</style>
      <div className="po-wrap">
        <div className="po-header">
          <div className="po-breadcrumb">Master Admin · <span>Seller Payouts</span></div>
          <h1 className="po-title">💸 Seller <span>Payouts</span></h1>
          <div className="po-sub">Monitor transaction disbursements and disburse seller balances</div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Transactions</div>
            <div className="stat-val">{loading ? '…' : total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending Release</div>
            <div className="stat-val amber">{loading ? '…' : pending}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Overdue Releases</div>
            <div className="stat-val red">{loading ? '…' : overdue}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Held Balance Value</div>
            <div className="stat-val gold">₹{loading ? '…' : totalNet.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          {/* Status Tabs */}
          <div className="filter-tabs">
            {[
              { label: 'All', val: '' },
              { label: '⏳ Pending', val: 'pending' },
              { label: '🔴 Overdue', val: 'overdue' },
              { label: '✅ Released', val: 'released' },
            ].map(f => (
              <button
                key={f.val}
                className={`filter-tab${filter === f.val ? ' active' : ''}`}
                onClick={() => { setFilter(f.val); setSelected(new Set()); setSearch(''); }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="inp"
              placeholder="Search seller, product, or order ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Multi-Select Bulk Actions */}
          {selected.size > 0 && (
            <button
              className={`release-btn ${confirmBulk ? 'warning' : ''}`}
              onClick={() => {
                if (!confirmBulk) {
                  setConfirmBulk(true);
                  setTimeout(() => setConfirmBulk(false), 5000);
                } else {
                  handleRelease([...selected]);
                }
              }}
              disabled={releasing}
            >
              {releasing ? '⏳ Releasing...' : (confirmBulk ? '⚠️ Confirm Bulk Release?' : `✓ Release ${selected.size} Selected`)}
            </button>
          )}

          {/* Overdue Release All Actions */}
          {overdueList.length > 0 && selected.size === 0 && (
            <button
              className={`release-btn ${confirmAllOverdue ? 'warning' : ''}`}
              onClick={() => {
                if (!confirmAllOverdue) {
                  setConfirmAllOverdue(true);
                  setTimeout(() => setConfirmAllOverdue(false), 5000);
                } else {
                  handleRelease();
                }
              }}
              disabled={releasing}
            >
              {releasing ? '⏳ Releasing...' : (confirmAllOverdue ? '⚠️ Confirm Release All Overdue?' : `🚀 Release All Overdue (${overdueList.length})`)}
            </button>
          )}
        </div>

        {/* Table View */}
        <div className="table-card">
          {loading ? (
            <div style={{ padding: 24 }}>
              {[...Array(5)].map((_, i) => <div key={i} className="shimmer" style={{ height: 54, marginBottom: 8 }} />)}
            </div>
          ) : filteredPayouts.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">💸</div>
              <div className="empty-title">No payouts found</div>
              <div style={{ fontSize: 13, color: 'var(--t3)', marginTop: 6 }}>
                {search ? 'Try adjusting your search query' : 'Settlement entries will appear here once products sell'}
              </div>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 44 }}>
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelected(new Set(pendingFiltered.map(p => p.id)));
                          } else {
                            setSelected(new Set());
                          }
                        }}
                      />
                    </th>
                    <th>Seller</th>
                    <th>Product</th>
                    <th style={{ textAlign: 'right' }}>Gross</th>
                    <th style={{ textAlign: 'right' }}>Platform Fee</th>
                    <th style={{ textAlign: 'right' }}>Net Payout</th>
                    <th>Status</th>
                    <th>Release Term</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayouts.map(p => (
                    <tr key={p.id}>
                      <td>
                        {p.status === 'pending' && (
                          <input
                            type="checkbox"
                            checked={selected.has(p.id)}
                            onChange={() => toggleSelect(p.id)}
                          />
                        )}
                      </td>
                      <td>
                        <div className="seller-wrap">
                          <div className="seller-avatar" style={{ background: avatarColor(p.seller.name) }}>
                            {initials(p.seller.name)}
                          </div>
                          <div>
                            <div className="seller-name">{p.seller.name || 'Unknown'}</div>
                            <div className="seller-email">{p.seller.email}</div>
                          </div>
                        </div>
                        <span className="college-tag">{p.seller.college?.name}</span>
                      </td>
                      <td>
                        <div className="product-ttl" title={p.order?.product?.title}>{p.order?.product?.title || '—'}</div>
                        <div className="product-type">
                          {p.order?.product?.productType === 'digital' ? '🖥 Digital' : '📦 Physical'}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}><span className="amt">₹{p.grossAmount.toLocaleString('en-IN')}</span></td>
                      <td style={{ textAlign: 'right' }}><span className="amt red">−₹{p.platformCut.toLocaleString('en-IN')}</span></td>
                      <td style={{ textAlign: 'right' }}><span className="amt green">₹{p.netAmount.toLocaleString('en-IN')}</span></td>
                      <td>
                        {p.isOverdue ? (
                          <span className="badge overdue">🚨 Overdue</span>
                        ) : p.status === 'released' ? (
                          <span className="badge released">✓ Released</span>
                        ) : (
                          <span className="badge pending">⏳ Pending</span>
                        )}
                      </td>
                      <td>
                        <div className="date-str">
                          {new Date(p.releaseAfter).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        {p.releasedAt && (
                          <div className="date-str" style={{ color: 'var(--green)', fontSize: 10, marginTop: 2 }}>
                            Cleared {new Date(p.releasedAt).toLocaleDateString('en-IN')}
                          </div>
                        )}
                      </td>
                      <td>
                        {p.status === 'pending' && (
                          <button
                            className={`row-release-btn ${confirmPayoutId === p.id ? 'warning' : ''}`}
                            onClick={() => {
                              if (confirmPayoutId !== p.id) {
                                setConfirmPayoutId(p.id);
                                setTimeout(() => setConfirmPayoutId(prev => prev === p.id ? null : prev), 4000);
                              } else {
                                handleRelease([p.id]);
                              }
                            }}
                            disabled={releasing}
                          >
                            {confirmPayoutId === p.id ? "⚠️ Confirm?" : "💸 Release"}
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

      {/* Floating Toast Notification */}
      {toast && (
        <div className="toast-container">
          <span>🔔</span>
          <span>{toast}</span>
        </div>
      )}
    </>
  );
}
