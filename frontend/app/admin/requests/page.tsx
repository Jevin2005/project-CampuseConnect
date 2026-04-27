'use client';

import { useState } from 'react';

const PENDING = [
  { initials: 'AM', name: 'Arjun Mehta', email: 'arjun.mehta@mit.edu', date: 'Dec 24, 2024', domain: '@mit.edu', match: true },
  { initials: 'PS', name: 'Priya Sharma', email: 'priya.s@mit.edu', date: 'Dec 23, 2024', domain: '@mit.edu', match: true },
  { initials: 'RK', name: 'Rahul Kumar', email: 'rahul.k@mit.edu', date: 'Dec 22, 2024', domain: '@mit.edu', match: true },
];

const APPROVED = [
  { initials: 'PP', name: 'Priya Patel', email: 'priya.p@mit.edu', date: 'Dec 20, 2024', products: 5, color: '#10B981' },
  { initials: 'RS', name: 'Rahul Singh', email: 'rahul.s@mit.edu', date: 'Dec 18, 2024', products: 3, color: '#4F8EF7' },
  { initials: 'SM', name: 'Sneha Mehta', email: 'sneha.m@mit.edu', date: 'Dec 15, 2024', products: 8, color: '#7C3AED' },
  { initials: 'VK', name: 'Vijay Kumar', email: 'vijay.k@mit.edu', date: 'Dec 10, 2024', products: 2, color: '#F59E0B' },
  { initials: 'AN', name: 'Anjali Nair', email: 'anjali.n@mit.edu', date: 'Dec 8, 2024', products: 6, color: '#10B981' },
];

type RequestStatus = 'pending' | 'approved' | 'rejected';

export default function StudentRequestsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [statuses, setStatuses] = useState<Record<string, RequestStatus>>({});
  const [search, setSearch] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [suspendModal, setSuspendModal] = useState<string | null>(null);
  const [suspended, setSuspended] = useState<Set<string>>(new Set());
  const [profileToast, setProfileToast] = useState<string | null>(null);

  const handleApprove = (email: string) => {
    setStatuses(prev => ({ ...prev, [email]: 'approved' }));
  };

  const handleReject = (email: string) => {
    setShowRejectModal(email);
  };

  const confirmReject = () => {
    if (showRejectModal) {
      setStatuses(prev => ({ ...prev, [showRejectModal]: 'rejected' }));
      setShowRejectModal(null);
      setRejectReason('');
    }
  };

  const confirmSuspend = () => {
    if (suspendModal) {
      setSuspended(prev => new Set([...prev, suspendModal]));
      setSuspendModal(null);
    }
  };

  const showProfile = (name: string) => {
    setProfileToast(name);
    setTimeout(() => setProfileToast(null), 2500);
  };

  const pendingCount = PENDING.filter(r => !statuses[r.email]).length;
  const filteredApproved = APPROVED.filter(s =>
    (s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())) &&
    !suspended.has(s.email)
  );

  return (
    <>
      <style>{`
        :root {
          --bg-primary: #0A0E1A;
          --bg-card: #111827;
          --bg-card2: #1a2235;
          --border: #1e2d45;
          --accent-green: #10B981;
          --accent-blue: #4F8EF7;
          --accent-orange: #F59E0B;
          --accent-red: #EF4444;
          --text-primary: #F0F4FF;
          --text-muted: #6B7280;
          --text-soft: #9CA3AF;
        }

        .requests-page {
          background: var(--bg-primary);
          min-height: 100vh;
          padding: 40px;
          position: relative;
          animation: fadeIn 0.4s ease;
        }
        .requests-page::before {
          content: '';
          position: fixed;
          top: -80px; right: -80px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-header { margin-bottom: 24px; }
        .page-title {
          font-family: 'Sora', sans-serif;
          font-size: 32px; font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .page-subtitle { font-size: 14px; color: var(--text-muted); }

        /* ALERT BANNER */
        .alert-banner {
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.25);
          border-left: 4px solid var(--accent-orange);
          border-radius: 10px;
          padding: 14px 18px;
          font-size: 14px;
          color: var(--accent-orange);
          margin-bottom: 24px;
          display: flex; align-items: center; gap: 10px;
        }

        /* TABS */
        .tabs { display: flex; gap: 0; margin-bottom: 24px; border-bottom: 1px solid var(--border); }
        .tab-btn {
          background: none; border: none;
          padding: 12px 20px;
          font-size: 14px; font-weight: 600;
          cursor: pointer; color: var(--text-muted);
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: -1px;
        }
        .tab-btn:hover { color: var(--text-primary); }
        .tab-btn.active { color: var(--accent-green); border-bottom-color: var(--accent-green); }
        .tab-count {
          background: var(--accent-orange);
          color: #fff; font-size: 11px; font-weight: 700;
          padding: 2px 7px; border-radius: 9999px;
        }
        .tab-count.green { background: rgba(16,185,129,0.2); color: var(--accent-green); }

        /* REQUEST CARDS */
        .request-cards { display: flex; flex-direction: column; gap: 16px; }

        .request-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: border-color 0.2s, transform 0.2s;
        }
        .request-card:hover { border-color: rgba(16,185,129,0.2); transform: translateY(-1px); }
        .request-card.approved { border-color: rgba(16,185,129,0.3); opacity: 0.7; }
        .request-card.rejected { border-color: rgba(239,68,68,0.3); opacity: 0.5; }

        .req-avatar {
          width: 48px; height: 48px; border-radius: 50%;
          background: rgba(16,185,129,0.15);
          border: 1.5px solid rgba(16,185,129,0.3);
          color: var(--accent-green);
          font-family: 'Sora', sans-serif;
          font-size: 16px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .req-left { flex-shrink: 0; }
        .req-name { font-size: 16px; font-weight: 700; color: var(--text-primary); }
        .req-email-display { font-size: 13px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

        .req-center { flex: 1; }
        .req-detail-row {
          display: flex; gap: 8px; align-items: center;
          font-size: 13px; margin-bottom: 8px;
        }
        .req-detail-label { color: var(--text-muted); min-width: 140px; }
        .req-detail-value { color: var(--text-primary); font-family: 'JetBrains Mono', monospace; font-size: 12px; }

        .domain-badge {
          display: inline-flex; align-items: center; gap: 4px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.2);
          color: var(--accent-green);
          font-size: 11px; font-weight: 700;
          padding: 3px 10px; border-radius: 9999px;
        }

        .req-actions { display: flex; gap: 10px; flex-shrink: 0; flex-direction: column; }

        .btn-approve-lg {
          background: var(--accent-green);
          color: #003824; border: none;
          padding: 10px 20px; border-radius: 9999px;
          font-size: 13px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }
        .btn-approve-lg:hover { transform: translateY(-1px); box-shadow: 0 0 16px rgba(16,185,129,0.3); }

        .btn-reject-lg {
          background: transparent;
          border: 1.5px solid rgba(239,68,68,0.4);
          color: #EF4444;
          padding: 10px 20px; border-radius: 9999px;
          font-size: 13px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }
        .btn-reject-lg:hover { background: rgba(239,68,68,0.08); }

        .status-pill {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 700;
          padding: 6px 14px; border-radius: 9999px;
        }
        .status-pill.approved { background: rgba(16,185,129,0.1); color: var(--accent-green); border: 1px solid rgba(16,185,129,0.2); }
        .status-pill.rejected { background: rgba(239,68,68,0.1); color: #EF4444; border: 1px solid rgba(239,68,68,0.2); }

        /* APPROVED TAB TABLE */
        .search-bar {
          width: 100%;
          background: var(--bg-card2);
          border: 1.5px solid var(--border);
          color: var(--text-primary);
          padding: 12px 16px 12px 44px;
          border-radius: 10px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          outline: none;
          margin-bottom: 20px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .search-bar::placeholder { color: var(--text-muted); }
        .search-bar:focus { border-color: var(--accent-green); box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
        .search-wrapper { position: relative; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 16px; color: var(--text-muted); }

        .approved-table {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          width: 100%;
        }
        .table-header {
          display: grid;
          grid-template-columns: 2fr 2fr 1.5fr 1fr 1fr;
          background: var(--bg-card2);
          padding: 12px 20px;
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 1.2px; color: var(--text-muted);
          border-bottom: 1px solid var(--border);
        }
        .table-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1.5fr 1fr 1fr;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          align-items: center;
          transition: background 0.15s;
        }
        .table-row:last-child { border-bottom: none; }
        .table-row:hover { background: rgba(16,185,129,0.04); }

        .table-user-cell { display: flex; align-items: center; gap: 10px; }
        .table-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif;
          font-size: 12px; font-weight: 700;
          flex-shrink: 0;
        }
        .table-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .table-email { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
        .table-date { font-size: 13px; color: var(--text-muted); }
        .table-products { font-size: 14px; font-weight: 700; color: var(--text-primary); }
        .table-actions { display: flex; gap: 8px; }
        .btn-view { background: none; border: none; color: var(--accent-blue); font-size: 12px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; font-family: 'DM Sans', sans-serif; }
        .btn-view:hover { opacity: 0.7; }
        .btn-suspend { background: none; border: 1px solid rgba(239,68,68,0.3); color: #EF4444; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .btn-suspend:hover { background: rgba(239,68,68,0.08); }

        /* MODAL */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.2s ease;
        }
        .modal-box {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 32px;
          max-width: 480px; width: 90%;
        }
        .modal-title { font-family: 'Sora', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); }
        .modal-sub { font-size: 14px; color: var(--text-muted); margin-bottom: 20px; }
        .modal-textarea {
          width: 100%;
          background: var(--bg-card2); border: 1.5px solid var(--border);
          color: var(--text-primary); padding: 12px 16px;
          border-radius: 10px; font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          resize: vertical; min-height: 100px; outline: none;
          margin-bottom: 20px;
          transition: border-color 0.2s;
        }
        .modal-textarea:focus { border-color: #EF4444; }
        .modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
        .btn-cancel { background: none; border: 1px solid var(--border); color: var(--text-muted); padding: 10px 20px; border-radius: 9999px; cursor: pointer; font-size: 14px; font-family: 'DM Sans', sans-serif; transition: color 0.2s; }
        .btn-cancel:hover { color: var(--text-primary); }
        .btn-confirm-reject { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 9999px; cursor: pointer; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .btn-confirm-reject:hover { transform: translateY(-1px); box-shadow: 0 0 16px rgba(239,68,68,0.3); }

        @media (max-width: 800px) {
          .requests-page { padding: 24px 16px; }
          .request-card { flex-direction: column; align-items: flex-start; }
          .table-header, .table-row { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="requests-page">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Student Requests</h1>
          <p className="page-subtitle">Review and manage student access to your marketplace</p>
        </div>

        {/* Alert Banner */}
        {pendingCount > 0 && (
          <div className="alert-banner">
            ⚠️ {pendingCount} student{pendingCount > 1 ? 's are' : ' is'} waiting for your approval. Each student must have an @mit.edu email domain.
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending
            {pendingCount > 0 && <span className="tab-count">{pendingCount}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved
            <span className="tab-count green">247</span>
          </button>
        </div>

        {/* PENDING TAB */}
        {activeTab === 'pending' && (
          <div className="request-cards">
            {PENDING.map((req) => {
              const status = statuses[req.email];
              return (
                <div key={req.email} className={`request-card ${status || ''}`}>
                  <div className="req-left">
                    <div className="req-avatar">{req.initials}</div>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div className="req-name">{req.name}</div>
                    <div className="req-email-display">{req.email}</div>
                  </div>

                  <div className="req-center">
                    <div className="req-detail-row">
                      <span className="req-detail-label">Enrollment Email:</span>
                      <span className="req-detail-value">{req.email}</span>
                    </div>
                    <div className="req-detail-row">
                      <span className="req-detail-label">Request Date:</span>
                      <span className="req-detail-value">{req.date}</span>
                    </div>
                    <div className="req-detail-row">
                      <span className="req-detail-label">Email Domain:</span>
                      <span className="domain-badge">✓ Matches college domain</span>
                    </div>
                  </div>

                  <div className="req-actions">
                    {!status ? (
                      <>
                        <button className="btn-approve-lg" onClick={() => handleApprove(req.email)}>
                          ✅ Approve
                        </button>
                        <button className="btn-reject-lg" onClick={() => handleReject(req.email)}>
                          ❌ Reject
                        </button>
                      </>
                    ) : (
                      <div className={`status-pill ${status}`}>
                        {status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {pendingCount === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>All caught up!</div>
                <div>No pending student requests.</div>
              </div>
            )}
          </div>
        )}

        {/* APPROVED TAB */}
        {activeTab === 'approved' && (
          <>
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-bar"
                placeholder="Search students..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="approved-table">
              <div className="table-header">
                <div>Name</div>
                <div>Email</div>
                <div>Approved Date</div>
                <div>Products</div>
                <div>Actions</div>
              </div>
              {filteredApproved.map((student) => (
                <div key={student.email} className="table-row">
                  <div className="table-user-cell">
                    <div className="table-avatar" style={{ background: `${student.color}20`, color: student.color }}>
                      {student.initials}
                    </div>
                    <div>
                      <div className="table-name">{student.name}</div>
                    </div>
                  </div>
                  <div>
                    <div className="table-email">{student.email}</div>
                  </div>
                  <div className="table-date">{student.date}</div>
                  <div className="table-products">{student.products}</div>
                  <div className="table-actions">
                    <button className="btn-view" onClick={() => showProfile(student.name)}>View Profile</button>
                    <button
                      className="btn-suspend"
                      onClick={() => setSuspendModal(student.email)}
                      disabled={suspended.has(student.email)}
                      style={suspended.has(student.email) ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                    >
                      {suspended.has(student.email) ? 'Suspended' : 'Suspend'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Reject Student Request</h2>
            <p className="modal-sub">Optionally provide a reason for rejection. The student will be notified.</p>
            <textarea
              className="modal-textarea"
              placeholder="Rejection reason (optional)..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowRejectModal(null)}>Cancel</button>
              <button className="btn-confirm-reject" onClick={confirmReject}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

      {/* SUSPEND MODAL */}
      {suspendModal && (
        <div className="modal-overlay" onClick={() => setSuspendModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title" style={{ color: '#EF4444' }}>⚠️ Suspend Student?</h2>
            <p className="modal-sub">
              {APPROVED.find(s => s.email === suspendModal)?.name} will lose marketplace access immediately.
              Their listings will be hidden until you unsuspend them.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setSuspendModal(null)}>Cancel</button>
              <button className="btn-confirm-reject" onClick={confirmSuspend}>Confirm Suspend</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW PROFILE TOAST */}
      {profileToast && (
        <div style={{
          position: 'fixed', top: '24px', right: '28px',
          background: 'rgba(79,142,247,0.15)', border: '1px solid rgba(79,142,247,0.4)',
          color: '#4F8EF7', padding: '12px 20px', borderRadius: '10px',
          fontSize: '13px', fontWeight: 700, zIndex: 2000,
          animation: 'fadeIn 0.3s ease',
        }}>
          👤 Viewing profile: {profileToast}
          <span style={{ marginLeft: '8px', fontSize: '11px', opacity: 0.7 }}>(Backend integration pending)</span>
        </div>
      )}
    </>
  );
}
