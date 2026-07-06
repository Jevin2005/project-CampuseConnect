'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';

const S = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
:root{--bg:#0A0E1A;--card:#111827;--card2:#1a2235;--border:#1e2d45;--gold:#F7C948;--t1:#F0F4FF;--t2:#9CA3AF;--t3:#6B7280;}
.m3{padding:32px;min-height:100vh;background:var(--bg);}
.m3 h1{font-family:'Sora',sans-serif;font-size:26px;font-weight:700;color:var(--t1);margin-bottom:4px;}
.m3-sub{font-size:13px;color:var(--t3);margin-bottom:28px;}
.m3-section-title{font-family:'Sora',sans-serif;font-size:17px;font-weight:700;color:var(--t1);margin-bottom:14px;}
.m3-banner{background:rgba(79,142,247,.08);border:1px solid rgba(79,142,247,.25);border-radius:10px;padding:12px 16px;font-size:13px;color:#9CA3AF;margin-bottom:20px;display:flex;gap:8px;align-items:center;}
.req-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:24px;margin-bottom:16px;transition:border-color .2s;}
.req-card:hover{border-color:rgba(247,201,72,.3);}
.req-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.req-name{font-family:'Sora',sans-serif;font-size:19px;font-weight:700;color:var(--t1);}
.badge-pending{background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.3);color:#F59E0B;font-size:11px;font-weight:700;padding:4px 12px;border-radius:9999px;}
.req-admin{font-size:13px;color:var(--t2);margin-bottom:10px;}
.req-pills{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;}
.pill{background:var(--card2);border:1px solid var(--border);border-radius:9999px;padding:3px 10px;font-size:11px;color:var(--t2);}
.req-date{font-size:12px;color:var(--t3);margin-bottom:16px;}
.req-actions{display:flex;gap:10px;justify-content:flex-end;}
.btn-reject{background:none;border:1.5px solid rgba(239,68,68,.4);color:#EF4444;border-radius:9999px;padding:8px 18px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;}
.btn-reject:hover{background:rgba(239,68,68,.08);}
.btn-approve{background:#10B981;border:none;color:#fff;border-radius:9999px;padding:8px 20px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:opacity .15s,transform .1s;box-shadow:0 4px 14px rgba(16,185,129,.3);}
.btn-approve:hover{opacity:.9;}
.btn-approve:active{transform:scale(.97);}
.table-card{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:24px;}
.tbl{width:100%;border-collapse:collapse;}
.tbl th{background:#0d1120;color:var(--t3);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;padding:12px 16px;text-align:left;border-bottom:1px solid var(--border);}
.tbl td{padding:12px 16px;font-size:13px;color:var(--t2);border-bottom:1px solid var(--border);}
.tbl tr:last-child td{border-bottom:none;}
.tbl tr:hover td{background:rgba(247,201,72,.03);}
.badge-active{background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.3);color:#10B981;font-size:10px;font-weight:700;padding:3px 9px;border-radius:9999px;}
.section-header{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
.count-badge{background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.3);color:#10B981;font-size:11px;font-weight:700;padding:3px 9px;border-radius:9999px;}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:200;backdrop-filter:blur(4px);}
.modal-card{background:#111827;border:1px solid #1e2d45;border-radius:16px;padding:32px;max-width:420px;width:90%;text-align:center;}
.modal-icon{font-size:40px;margin-bottom:12px;}
.modal-title{font-family:'Sora',sans-serif;font-size:19px;font-weight:700;color:#F0F4FF;margin-bottom:8px;}
.modal-text{font-size:13px;color:#9CA3AF;line-height:1.65;margin-bottom:20px;}
.modal-close{background:#10B981;border:none;color:#fff;border-radius:9999px;padding:10px 28px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;}

@media (max-width: 768px) {
  .m3 { padding: 20px 16px; }
  .m3 h1 { font-size: 22px; }
  .req-card { padding: 16px; }
  .req-top { flex-direction: column; align-items: flex-start; gap: 6px; }
  .req-name { font-size: 16px; }
  .req-actions { flex-direction: column; gap: 8px; }
  .btn-reject, .btn-approve { width: 100%; text-align: center; }
  
  .table-card { border: none; background: none; }
  .tbl, .tbl thead, .tbl tbody, .tbl th, .tbl td, .tbl tr { display: block; }
  .tbl thead { display: none; }
  .tbl tr {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    margin-bottom: 12px;
    padding: 14px 16px;
  }
  .tbl td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px dashed rgba(30,45,69,0.5);
    padding: 8px 0;
    font-size: 13px;
    text-align: right;
  }
  .tbl td:last-child {
    border-bottom: none;
  }
  .tbl td::before {
    content: attr(data-label);
    font-weight: 700;
    color: var(--t3);
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.5px;
    float: left;
    margin-right: 15px;
  }
}

`;

export default function CollegeRequestsPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [active, setActive] = useState<any[]>([]);
  const [modal, setModal] = useState<string | null>(null);
  const { accessToken } = useAuthStore();

  const fetchColleges = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/master/colleges', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPending(data.pending);
        setActive(data.active);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (accessToken) fetchColleges();
  }, [accessToken]);

  const handleApprove = async (id: string, name: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/master/colleges/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        setModal(name);
        fetchColleges(); // refresh
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/master/colleges/${id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        fetchColleges(); // refresh
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <style>{S}</style>
      <div className="m3">
        <h1>College Requests</h1>
        <p className="m3-sub">Review and approve college admin registration requests</p>

        {/* Pending */}
        <div className="m3-section-title">Pending Requests</div>
        <div className="m3-banner">
          ℹ️ Approving a college creates their isolated marketplace and activates the admin account.
        </div>

        {pending.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, color: '#F0F4FF', marginBottom: 6 }}>All caught up!</div>
            <div style={{ fontSize: 13 }}>No pending college requests.</div>
          </div>
        ) : (
          pending.map(r => (
            <div className="req-card" key={r.id}>
              <div className="req-top">
                <span className="req-name">{r.name}</span>
                <span className="badge-pending">⏳ PENDING</span>
              </div>
              <div className="req-admin">{r.admin} · <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{r.email}</span></div>
              <div className="req-pills">
                {[r.city, r.type, r.domain, `Code: ${r.code}`].map(t => (
                  <span className="pill" key={t}>{t}</span>
                ))}
              </div>
              <div className="req-date">Submitted: {new Date(r.submitted).toLocaleDateString()}</div>
              <div className="req-actions">
                <button className="btn-reject" onClick={() => handleReject(r.id)}>❌ Reject Request</button>
                <button className="btn-approve" onClick={() => handleApprove(r.id, r.name)}>
                  ✅ Approve &amp; Create Marketplace
                </button>
              </div>
            </div>
          ))
        )}

        {/* Active Colleges table */}
        <div className="section-header" style={{ marginTop: 32 }}>
          <span className="m3-section-title" style={{ margin: 0 }}>Active Colleges</span>
          <span className="count-badge">{active.length} Active</span>
        </div>

        <div className="table-card">
          <table className="tbl">
            <thead>
              <tr>
                {['College','City','Code','Students','Products','Revenue','Status','Joined'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {active.map(a => (
                <tr key={a.id}>
                  <td data-label="College" style={{ color: '#F0F4FF', fontWeight: 600 }}>{a.name}</td>
                  <td data-label="City">{a.city}</td>
                  <td data-label="Code" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{a.code}</td>
                  <td data-label="Students" style={{ color: '#4F8EF7' }}>{a.students?.toLocaleString()}</td>
                  <td data-label="Products" style={{ color: '#10B981' }}>{a.products?.toLocaleString()}</td>
                  <td data-label="Revenue" style={{ color: '#F7C948', fontWeight: 700 }}>{a.revenue}</td>
                  <td data-label="Status"><span className="badge-active">✅ Active</span></td>
                  <td data-label="Joined">{new Date(a.joined).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval modal */}
      {modal && (
        <div className="modal-bg" onClick={() => setModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🎉</div>
            <div className="modal-title">Marketplace Created!</div>
            <div className="modal-text">
              <strong style={{ color: '#F0F4FF' }}>{modal}</strong> has been approved.<br />
              An isolated marketplace has been created and the admin account is now active.
            </div>
            <button className="modal-close" onClick={() => setModal(null)}>Done</button>
          </div>
        </div>
      )}
    </>
  );
}

