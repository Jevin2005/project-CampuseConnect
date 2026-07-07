'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';

const API = `${process.env.NEXT_PUBLIC_API_URL || 'https://project-campuseconnect.onrender.com'}/api/admin`;

interface Student {
  id: string;
  initials: string;
  color: string;
  name: string;
  email: string;
  phone: string;
  enrollmentId: string;
  date: string;
  products: number;
  purchases: number;
  match: boolean;
}

export default function StudentRequestsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [pending, setPending] = useState<Student[]>([]);
  const [approved, setApproved] = useState<Student[]>([]);
  const [collegeName, setCollegeName] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<Student | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [suspendModal, setSuspendModal] = useState<Student | null>(null);
  const [viewModal, setViewModal] = useState<(Student & { status: 'pending' | 'approved' }) | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const { accessToken } = useAuthStore();

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API}/students`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPending(data.pending || []);
        setApproved(data.approved || []);
        setCollegeName(data.college?.name || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchStudents();
  }, [accessToken]);

  const handleApprove = async (student: Student) => {
    setActionLoading(student.id);
    try {
      const res = await fetch(`${API}/students/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ studentId: student.id }),
      });
      if (res.ok) {
        showToast(`✅ ${student.name} approved! They'll receive an email to login.`);
        fetchStudents();
      } else {
        const d = await res.json();
        showToast(d.message || 'Failed to approve', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmReject = async () => {
    if (!showRejectModal) return;
    const student = showRejectModal;
    setActionLoading(student.id);
    try {
      const res = await fetch(`${API}/students/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ studentId: student.id, reason: rejectReason }),
      });
      if (res.ok) {
        showToast(`❌ ${student.name}'s request rejected.`);
        setShowRejectModal(null);
        setRejectReason('');
        fetchStudents();
      } else {
        const d = await res.json();
        showToast(d.message || 'Failed to reject', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async () => {
    if (!suspendModal) return;
    const student = suspendModal;
    setActionLoading(student.id);
    try {
      const res = await fetch(`${API}/students/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ studentId: student.id }),
      });
      if (res.ok) {
        showToast(`⏸️ ${student.name} suspended.`);
        setSuspendModal(null);
        fetchStudents();
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnsuspend = async (student: Student) => {
    setActionLoading(student.id);
    try {
      const res = await fetch(`${API}/students/unsuspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ studentId: student.id }),
      });
      if (res.ok) {
        showToast(`✅ ${student.name} unsuspended.`);
        fetchStudents();
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredApproved = approved.filter(s =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollmentId.toLowerCase().includes(search.toLowerCase())
  );

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        :root {
          --bg: #0A0E1A; --card: #111827; --card2: #1a2235; --border: #1e2d45;
          --green: #10B981; --blue: #4F8EF7; --orange: #F59E0B;
          --red: #EF4444; --t1: #F0F4FF; --t2: #9CA3AF; --t3: #6B7280;
        }
        .rp { padding: 40px; min-height: 100vh; background: var(--bg); }
        .rp-hdr { margin-bottom: 24px; }
        .rp-title { font-family: 'Sora',sans-serif; font-size: 28px; font-weight: 700; color: var(--t1); margin-bottom: 4px; }
        .rp-sub { font-size: 13px; color: var(--t3); }
        .alert-banner { background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.25); border-left: 4px solid var(--orange); border-radius: 10px; padding: 14px 18px; font-size: 13px; color: var(--orange); margin-bottom: 24px; display: flex; align-items: center; gap: 10px; }
        .tabs { display: flex; gap: 0; margin-bottom: 24px; border-bottom: 1px solid var(--border); }
        .tab-btn { background: none; border: none; padding: 12px 20px; font-size: 14px; font-weight: 600; cursor: pointer; color: var(--t3); border-bottom: 2px solid transparent; transition: all .2s; font-family: 'DM Sans',sans-serif; display: flex; align-items: center; gap: 8px; margin-bottom: -1px; }
        .tab-btn:hover { color: var(--t1); }
        .tab-btn.active { color: var(--green); border-bottom-color: var(--green); }
        .tab-count { font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 9999px; }
        .tc-orange { background: var(--orange); color: #fff; }
        .tc-green { background: rgba(16,185,129,.2); color: var(--green); }

        /* Pending cards */
        .req-cards { display: flex; flex-direction: column; gap: 16px; }
        .req-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 24px; transition: border-color .2s, transform .15s; }
        .req-card:hover { border-color: rgba(16,185,129,.25); transform: translateY(-1px); }
        .req-top { display: flex; align-items: flex-start; gap: 16px; }
        .req-av { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Sora',sans-serif; font-size: 17px; font-weight: 700; color: #0A0E1A; flex-shrink: 0; }
        .req-info { flex: 1; min-width: 0; }
        .req-name { font-family: 'Sora',sans-serif; font-size: 17px; font-weight: 700; color: var(--t1); margin-bottom: 3px; }
        .req-email { font-family: 'JetBrains Mono',monospace; font-size: 12px; color: var(--t3); }
        .req-divider { height: 1px; background: var(--border); margin: 16px 0; }
        .req-meta { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; margin-bottom: 16px; }
        .req-meta-item { display: flex; gap: 6px; align-items: center; font-size: 12px; color: var(--t2); }
        .req-meta-lbl { color: var(--t3); min-width: 100px; }
        .req-meta-val { font-family: 'JetBrains Mono',monospace; color: var(--t1); }
        .domain-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 9999px; }
        .domain-ok { background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.25); color: var(--green); }
        .domain-warn { background: rgba(245,158,11,.1); border: 1px solid rgba(245,158,11,.25); color: var(--orange); }
        .req-actions { display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap; }
        .btn-approve { background: var(--green); border: none; color: #003824; padding: 10px 22px; border-radius: 9999px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'DM Sans',sans-serif; transition: all .15s; }
        .btn-approve:hover { opacity: .9; transform: translateY(-1px); }
        .btn-approve:disabled { opacity: .5; cursor: not-allowed; transform: none; }
        .btn-reject { background: none; border: 1.5px solid rgba(239,68,68,.4); color: var(--red); padding: 10px 22px; border-radius: 9999px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'DM Sans',sans-serif; transition: all .15s; }
        .btn-reject:hover { background: rgba(239,68,68,.08); }
        .btn-reject:disabled { opacity: .5; cursor: not-allowed; }

        /* Approved table */
        .search-wrap { position: relative; margin-bottom: 16px; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--t3); }
        .search-bar { width: 100%; background: var(--card2); border: 1.5px solid var(--border); color: var(--t1); padding: 11px 16px 11px 44px; border-radius: 10px; font-size: 14px; font-family: 'DM Sans',sans-serif; outline: none; transition: border-color .2s; }
        .search-bar::placeholder { color: var(--t3); }
        .search-bar:focus { border-color: var(--green); }
        .tbl-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
        .tbl { width: 100%; border-collapse: collapse; }
        .tbl th { background: var(--card2); padding: 12px 16px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--t3); border-bottom: 1px solid var(--border); }
        .tbl td { padding: 13px 16px; font-size: 13px; color: var(--t2); border-bottom: 1px solid var(--border); vertical-align: middle; }
        .tbl tr:last-child td { border-bottom: none; }
        .tbl tr:hover td { background: rgba(16,185,129,.025); }
        .tbl-av { width: 36px; height: 36px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #0A0E1A; }
        .tbl-name { font-weight: 600; color: var(--t1); }
        .tbl-email { font-family: 'JetBrains Mono',monospace; font-size: 11px; color: var(--t3); margin-top: 2px; }
        .btn-sm { padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; cursor: pointer; font-family: 'DM Sans',sans-serif; border: none; transition: all .15s; }
        .btn-sm-suspend { background: none; border: 1px solid rgba(239,68,68,.35); color: var(--red); }
        .btn-sm-suspend:hover { background: rgba(239,68,68,.08); }
        .btn-sm-unsuspend { background: none; border: 1px solid rgba(16,185,129,.35); color: var(--green); }
        .btn-sm-unsuspend:hover { background: rgba(16,185,129,.08); }
        .btn-sm:disabled { opacity: .5; cursor: not-allowed; }

        /* Modal */
        .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.75); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
        .modal-box { background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 32px; max-width: 480px; width: 90%; }
        .modal-title { font-family: 'Sora',sans-serif; font-size: 20px; font-weight: 700; color: var(--t1); margin-bottom: 8px; }
        .modal-sub { font-size: 13px; color: var(--t2); margin-bottom: 20px; line-height: 1.6; }
        .modal-ta { width: 100%; background: var(--card2); border: 1.5px solid var(--border); color: var(--t1); padding: 12px 16px; border-radius: 10px; font-size: 13px; font-family: 'DM Sans',sans-serif; resize: vertical; min-height: 90px; outline: none; margin-bottom: 20px; transition: border-color .2s; }
        .modal-ta:focus { border-color: var(--red); }
        .modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
        .btn-cancel { background: none; border: 1px solid var(--border); color: var(--t2); padding: 10px 20px; border-radius: 9999px; cursor: pointer; font-size: 13px; font-family: 'DM Sans',sans-serif; }
        .btn-danger { background: var(--red); color: #fff; border: none; padding: 10px 20px; border-radius: 9999px; cursor: pointer; font-size: 13px; font-weight: 700; font-family: 'DM Sans',sans-serif; }
        .btn-orange { background: var(--orange); color: #1a0a00; border: none; padding: 10px 20px; border-radius: 9999px; cursor: pointer; font-size: 13px; font-weight: 700; font-family: 'DM Sans',sans-serif; }
        .btn-sm-view { background: none; border: 1px solid rgba(79,142,247,.35); color: var(--blue); }
        .btn-sm-view:hover { background: rgba(79,142,247,.08); }

        /* View Modal */
        .view-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.8); backdrop-filter: blur(6px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .view-modal-box { background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 32px; max-width: 540px; width: 100%; }
        .vm-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .vm-av { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Sora',sans-serif; font-size: 22px; font-weight: 700; color: #0A0E1A; flex-shrink: 0; }
        .vm-name { font-family: 'Sora',sans-serif; font-size: 20px; font-weight: 700; color: var(--t1); margin-bottom: 4px; }
        .vm-email { font-family: 'JetBrains Mono',monospace; font-size: 12px; color: var(--t3); }
        .vm-divider { height: 1px; background: var(--border); margin: 0 0 20px; }
        .vm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
        .vm-field { background: var(--card2); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; }
        .vm-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--t3); margin-bottom: 5px; }
        .vm-val { font-size: 13px; font-weight: 600; color: var(--t1); font-family: 'JetBrains Mono',monospace; }
        .vm-val.normal { font-family: 'DM Sans',sans-serif; }
        .vm-status-row { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
        .vm-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 9999px; }
        .vm-badge-pending { background: rgba(245,158,11,.12); border: 1px solid rgba(245,158,11,.3); color: var(--orange); }
        .vm-badge-approved { background: rgba(16,185,129,.12); border: 1px solid rgba(16,185,129,.3); color: var(--green); }
        .vm-badge-domain-ok { background: rgba(16,185,129,.08); border: 1px solid rgba(16,185,129,.2); color: var(--green); }
        .vm-badge-domain-warn { background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.2); color: var(--orange); }
        .vm-footer { display: flex; justify-content: flex-end; }
        .btn-close-modal { background: none; border: 1px solid var(--border); color: var(--t2); padding: 10px 24px; border-radius: 9999px; cursor: pointer; font-size: 13px; font-family: 'DM Sans',sans-serif; transition: border-color .2s; }
        .btn-close-modal:hover { border-color: var(--t2); color: var(--t1); }

        /* Toast */
        .toast { position: fixed; top: 24px; right: 28px; padding: 14px 22px; border-radius: 12px; font-size: 13px; font-weight: 700; z-index: 2000; animation: slideIn .3s ease; max-width: 360px; }
        .toast-success { background: rgba(16,185,129,.15); border: 1px solid rgba(16,185,129,.4); color: var(--green); }
        .toast-error { background: rgba(239,68,68,.15); border: 1px solid rgba(239,68,68,.4); color: var(--red); }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

        .skeleton { background: linear-gradient(90deg, var(--card2) 25%, #202d42 50%, var(--card2) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .empty-state { text-align: center; padding: 60px 24px; color: var(--t3); }
        .empty-icon { font-size: 52px; margin-bottom: 16px; }
        .empty-title { font-family: 'Sora',sans-serif; font-size: 18px; font-weight: 700; color: var(--t1); margin-bottom: 8px; }

        @media (max-width: 768px) {
          .rp { padding: 20px 16px; }
          .rp-title { font-size: 22px; }
          .req-meta { grid-template-columns: 1fr; }
          .req-top { flex-direction: column; align-items: flex-start; gap: 12px; }
          .req-top > div:last-child { align-self: flex-start; }
          .req-actions { flex-direction: column; width: 100%; }
          .req-actions button { width: 100%; margin-right: 0 !important; }

          /* Table to Cards for Approved Students */
          .tbl-card { background: none; border: none; border-radius: 0; }
          .tbl thead { display: none; }
          .tbl tbody { display: flex; flex-direction: column; gap: 12px; }
          .tbl tr {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            padding: 16px;
            border-radius: 12px;
            background: var(--card);
            border: 1px solid var(--border);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .tbl tr:hover td { background: none; }
          .tbl td {
            padding: 0;
            border-bottom: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }
          /* Custom layout for fields */
          .tbl td:first-child { border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; justify-content: flex-start; }
          .tbl td:nth-child(2) { order: 2; }
          .tbl td:nth-child(2)::before { content: 'Enrollment ID'; font-size: 11px; color: var(--t3); font-weight: 500; }
          .tbl td:nth-child(3) { order: 3; }
          .tbl td:nth-child(3)::before { content: 'Approved Date'; font-size: 11px; color: var(--t3); font-weight: 500; }
          .tbl td:nth-child(4) { order: 4; }
          .tbl td:nth-child(4)::before { content: 'Products'; font-size: 11px; color: var(--t3); font-weight: 500; }
          .tbl td:nth-child(5) { order: 5; }
          .tbl td:nth-child(5)::before { content: 'Purchases'; font-size: 11px; color: var(--t3); font-weight: 500; }
          .tbl td:nth-child(6) { order: 6; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; margin-top: 4px; justify-content: flex-end; }
          
          /* Modals responsive optimization */
          .modal-box { padding: 20px; }
          .view-modal-box { padding: 20px 16px; max-height: 90vh; overflow-y: auto; }
          .vm-grid { grid-template-columns: 1fr; gap: 10px; }
          .vm-header { flex-direction: column; align-items: center; text-align: center; gap: 10px; }
          .vm-status-row { justify-content: center; }
        }
      `}</style>

      <div className="rp">
        {/* Header */}
        <div className="rp-hdr">
          <h1 className="rp-title">Student Requests</h1>
          <p className="rp-sub">
            {collegeName ? `Managing students for ${collegeName}` : 'Review and manage student access to your marketplace'}
          </p>
        </div>

        {/* Alert Banner */}
        {pending.length > 0 && (
          <div className="alert-banner">
            ⚠️ {pending.length} student{pending.length > 1 ? 's are' : ' is'} waiting for your approval. Review each request carefully.
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
            Pending
            {pending.length > 0 && <span className="tab-count tc-orange">{pending.length}</span>}
          </button>
          <button className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveTab('approved')}>
            Approved
            <span className="tab-count tc-green">{approved.length}</span>
          </button>
        </div>

        {/* ── PENDING TAB ── */}
        {activeTab === 'pending' && (
          <div className="req-cards">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div className="req-card" key={i}>
                  <div className="req-top">
                    <div className="skeleton" style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 18, width: '40%', marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 13, width: '60%' }} />
                    </div>
                  </div>
                </div>
              ))
            ) : pending.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <div className="empty-title">All caught up!</div>
                <div>No pending student requests right now.</div>
              </div>
            ) : (
              pending.map(req => (
                <div className="req-card" key={req.id}>
                  <div className="req-top">
                    <div className="req-av" style={{ background: req.color }}>{req.initials}</div>
                    <div className="req-info">
                      <div className="req-name">{req.name}</div>
                      <div className="req-email">{req.email}</div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {req.match
                        ? <span className="domain-badge domain-ok">✓ Domain matches</span>
                        : <span className="domain-badge domain-warn">⚠️ Domain mismatch</span>}
                    </div>
                  </div>

                  <div className="req-divider" />

                  <div className="req-meta">
                    <div className="req-meta-item">
                      <span className="req-meta-lbl">📅 Request Date</span>
                      <span className="req-meta-val">{fmtDate(req.date)}</span>
                    </div>
                    {req.enrollmentId !== '—' && (
                      <div className="req-meta-item">
                        <span className="req-meta-lbl">🎫 Enrollment ID</span>
                        <span className="req-meta-val">{req.enrollmentId}</span>
                      </div>
                    )}
                    {req.phone !== '—' && (
                      <div className="req-meta-item">
                        <span className="req-meta-lbl">📞 Phone</span>
                        <span className="req-meta-val">{req.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="req-actions">
                    <button
                      className="btn-reject"
                      style={{ marginRight: 'auto' }}
                      onClick={() => setViewModal({ ...req, status: 'pending' })}
                    >
                      👁 View
                    </button>
                    <button
                      className="btn-reject"
                      disabled={actionLoading === req.id}
                      onClick={() => setShowRejectModal(req)}
                    >
                      ❌ Reject
                    </button>
                    <button
                      className="btn-approve"
                      disabled={actionLoading === req.id}
                      onClick={() => handleApprove(req)}
                    >
                      {actionLoading === req.id ? 'Processing…' : '✅ Approve Access'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── APPROVED TAB ── */}
        {activeTab === 'approved' && (
          <>
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                className="search-bar"
                placeholder="Search by name, email, or enrollment ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="tbl-card">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Enrollment ID</th>
                    <th>Approved Date</th>
                    <th>Products</th>
                    <th>Purchases</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i}>
                        {Array(6).fill(0).map((_, j) => (
                          <td key={j}><div className="skeleton" style={{ height: 14, width: j === 0 ? 160 : 80 }} /></td>
                        ))}
                      </tr>
                    ))
                  ) : filteredApproved.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--t3)' }}>
                        {search ? `No students matching "${search}"` : 'No approved students yet.'}
                      </td>
                    </tr>
                  ) : (
                    filteredApproved.map(st => (
                      <tr key={st.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="tbl-av" style={{ background: st.color }}>{st.initials}</div>
                            <div>
                              <div className="tbl-name">{st.name}</div>
                              <div className="tbl-email">{st.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12 }}>
                          {st.enrollmentId}
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--t3)' }}>{fmtDate(st.date)}</td>
                        <td>
                          <span style={{ background: 'rgba(79,142,247,.12)', color: 'var(--blue)', padding: '3px 9px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>
                            {st.products}
                          </span>
                        </td>
                        <td>
                          <span style={{ background: 'rgba(16,185,129,.12)', color: 'var(--green)', padding: '3px 9px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>
                            {st.purchases}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn-sm btn-sm-view"
                              onClick={() => setViewModal({ ...st, status: 'approved' })}
                            >
                              👁 View
                            </button>
                            <button
                              className="btn-sm btn-sm-suspend"
                              disabled={actionLoading === st.id}
                              onClick={() => setSuspendModal(st)}
                            >
                              Suspend
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── REJECT MODAL ── */}
      {showRejectModal && (
        <div className="modal-bg" onClick={() => setShowRejectModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Reject Student Request</div>
            <p className="modal-sub">
              You are rejecting <strong style={{ color: 'var(--t1)' }}>{showRejectModal.name}</strong>.
              They will receive an email notification and can re-apply.
            </p>
            <textarea
              className="modal-ta"
              placeholder="Reason for rejection (optional — will be included in the email)…"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => { setShowRejectModal(null); setRejectReason(''); }}>Cancel</button>
              <button className="btn-danger" onClick={confirmReject}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUSPEND MODAL ── */}
      {suspendModal && (
        <div className="modal-bg" onClick={() => setSuspendModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title" style={{ color: 'var(--orange)' }}>⚠️ Suspend Student?</div>
            <p className="modal-sub">
              <strong style={{ color: 'var(--t1)' }}>{suspendModal.name}</strong> will lose marketplace access immediately.
              Their listings will be hidden. You can unsuspend them at any time.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setSuspendModal(null)}>Cancel</button>
              <button className="btn-orange" onClick={handleSuspend} disabled={actionLoading === suspendModal?.id}>
                {actionLoading === suspendModal?.id ? 'Suspending…' : 'Confirm Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW MODAL ── */}
      {viewModal && (
        <div className="view-modal-bg" onClick={() => setViewModal(null)}>
          <div className="view-modal-box" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="vm-header">
              <div className="vm-av" style={{ background: viewModal.color }}>{viewModal.initials}</div>
              <div>
                <div className="vm-name">{viewModal.name}</div>
                <div className="vm-email">{viewModal.email}</div>
              </div>
            </div>

            {/* Status badges */}
            <div className="vm-status-row">
              <span className={`vm-badge ${viewModal.status === 'pending' ? 'vm-badge-pending' : 'vm-badge-approved'}`}>
                {viewModal.status === 'pending' ? '⏳ Pending Approval' : '✅ Approved'}
              </span>
              <span className={`vm-badge ${viewModal.match ? 'vm-badge-domain-ok' : 'vm-badge-domain-warn'}`}>
                {viewModal.match ? '✓ Domain Verified' : '⚠️ Domain Mismatch'}
              </span>
            </div>

            <div className="vm-divider" />

            {/* Detail grid */}
            <div className="vm-grid">
              <div className="vm-field">
                <div className="vm-lbl">📅 Join Date</div>
                <div className="vm-val normal">{fmtDate(viewModal.date)}</div>
              </div>
              <div className="vm-field">
                <div className="vm-lbl">🎫 Enrollment ID</div>
                <div className="vm-val">{viewModal.enrollmentId}</div>
              </div>
              <div className="vm-field">
                <div className="vm-lbl">📞 Phone</div>
                <div className="vm-val normal">{viewModal.phone}</div>
              </div>
              <div className="vm-field">
                <div className="vm-lbl">📦 Products Listed</div>
                <div className="vm-val" style={{ color: 'var(--blue)' }}>{viewModal.products}</div>
              </div>
              <div className="vm-field">
                <div className="vm-lbl">🛒 Purchases Made</div>
                <div className="vm-val" style={{ color: 'var(--green)' }}>{viewModal.purchases}</div>
              </div>
              <div className="vm-field">
                <div className="vm-lbl">✉️ Email Domain</div>
                <div className="vm-val">{viewModal.email.split('@')[1] || '—'}</div>
              </div>
            </div>

            <div className="vm-footer">
              <button className="btn-close-modal" onClick={() => setViewModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
