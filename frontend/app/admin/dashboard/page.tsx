'use client';

import Link from 'next/link';

const STAT_CARDS = [
  { icon: '👥', label: 'TOTAL STUDENTS', value: '247', sub: '+12 this month', color: '#10B981' },
  { icon: '📦', label: 'ACTIVE PRODUCTS', value: '89', sub: '18 pending review', color: '#4F8EF7' },
  { icon: '💰', label: 'REVENUE THIS MONTH', value: '₹9,670', sub: '+₹1,240 from fees', color: '#F7C948' },
  { icon: '⏳', label: 'PENDING REQUESTS', value: '3', sub: 'Needs attention', color: '#F59E0B', pulse: true },
];

const PENDING_REQUESTS = [
  { initials: 'AM', name: 'Arjun Mehta', email: 'arjun@mit.edu', date: 'Dec 24' },
  { initials: 'PS', name: 'Priya Sharma', email: 'priya.s@mit.edu', date: 'Dec 23' },
];

const PENDING_PRODUCTS = [
  { icon: '📦', name: 'Calculus Textbook', seller: 'Rahul Kumar', price: '₹350', type: 'PHYSICAL' },
  { icon: '📄', name: 'DS Notes PDF', seller: 'Sneha Patel', price: '₹49', type: 'DIGITAL' },
];

const ACTIVITY = [
  { dot: '#10B981', icon: '📦', text: 'Priya Patel listed HP Laptop', time: '2 hours ago' },
  { dot: '#4F8EF7', icon: '🛒', text: 'Rahul Sharma bought DS Notes', time: '4 hours ago' },
  { dot: '#F59E0B', icon: '👥', text: 'New student request from Arjun Mehta', time: '1 day ago' },
  { dot: '#EF4444', icon: '🚩', text: "Product 'iPhone 13' flagged by student", time: '2 days ago' },
];

export default function AdminDashboardPage() {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

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
          --accent-gold: #F7C948;
          --accent-orange: #F59E0B;
          --accent-red: #EF4444;
          --accent-purple: #7C3AED;
          --text-primary: #F0F4FF;
          --text-muted: #6B7280;
          --text-soft: #9CA3AF;
        }

        .dashboard-page {
          background: var(--bg-primary);
          min-height: 100vh;
          padding: 40px;
          position: relative;
          animation: fadeIn 0.4s ease;
        }
        .dashboard-page::before {
          content: '';
          position: fixed;
          top: -100px; right: -100px;
          width: 450px; height: 450px;
          background: radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-greeting { margin-bottom: 32px; }
        .greeting-title {
          font-family: 'Sora', sans-serif;
          font-size: 24px; font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .greeting-sub { font-size: 14px; color: var(--text-muted); }

        /* STAT CARDS */
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }

        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 22px;
          transition: border-color 0.2s, transform 0.2s;
        }
        .stat-card:hover { transform: translateY(-2px); }

        .stat-card-icon { font-size: 28px; margin-bottom: 12px; display: block; }
        .stat-label {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 1.2px; color: var(--text-muted);
          margin-bottom: 8px;
        }
        .stat-value {
          font-family: 'Sora', sans-serif;
          font-size: 28px; font-weight: 700;
          margin-bottom: 4px;
        }
        .stat-sub { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .pulse-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--accent-orange);
          animation: pulse 1.5s ease-in-out infinite;
          display: inline-block;
        }

        /* MID SECTION */
        .mid-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .section-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 20px;
        }

        .section-card-title {
          font-family: 'Sora', sans-serif;
          font-size: 16px; font-weight: 700;
          margin-bottom: 16px;
          display: flex; align-items: center; justify-content: space-between;
        }

        .view-all {
          font-size: 12px; font-weight: 500;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .view-all:hover { opacity: 0.8; }

        /* Request row */
        .request-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }
        .request-item:last-child { border-bottom: none; padding-bottom: 0; }

        .avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(16,185,129,0.15);
          border: 1px solid rgba(16,185,129,0.3);
          color: var(--accent-green);
          font-family: 'Sora', sans-serif;
          font-size: 13px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .request-info { flex: 1; }
        .request-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .request-email { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
        .request-date { font-size: 11px; color: var(--text-muted); }

        .request-actions { display: flex; gap: 8px; flex-shrink: 0; }

        .btn-approve {
          background: rgba(16,185,129,0.15);
          border: 1px solid rgba(16,185,129,0.4);
          color: var(--accent-green);
          padding: 6px 12px; border-radius: 9999px;
          font-size: 12px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-approve:hover { background: rgba(16,185,129,0.25); }

        .btn-reject {
          background: transparent;
          border: 1px solid rgba(239,68,68,0.4);
          color: #EF4444;
          padding: 6px 12px; border-radius: 9999px;
          font-size: 12px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-reject:hover { background: rgba(239,68,68,0.08); }

        /* Product rows */
        .product-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }
        .product-item:last-child { border-bottom: none; padding-bottom: 0; }

        .product-icon-box {
          width: 40px; height: 40px; border-radius: 8px;
          background: var(--bg-card2);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }
        .product-info { flex: 1; }
        .product-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .product-seller { font-size: 12px; color: var(--text-muted); }
        .product-price { font-size: 13px; font-weight: 700; color: var(--accent-green); margin-right: 8px; }

        .type-badge {
          font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
          padding: 2px 8px; border-radius: 9999px;
        }
        .type-badge.physical { background: rgba(79,142,247,0.1); color: #4F8EF7; border: 1px solid rgba(79,142,247,0.2); }
        .type-badge.digital { background: rgba(124,58,237,0.1); color: #A78BFA; border: 1px solid rgba(124,58,237,0.2); }

        /* Activity feed */
        .activity-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 20px;
        }
        .activity-title {
          font-family: 'Sora', sans-serif;
          font-size: 18px; font-weight: 700;
          margin-bottom: 20px;
          color: var(--text-primary);
        }
        .activity-list { display: flex; flex-direction: column; gap: 0; }
        .activity-item {
          display: flex; align-items: flex-start; gap: 16px;
          padding: 14px 0;
          border-bottom: 1px solid var(--border);
        }
        .activity-item:last-child { border-bottom: none; padding-bottom: 0; }
        .activity-dot-wrap {
          display: flex; flex-direction: column; align-items: center;
          padding-top: 2px;
        }
        .activity-dot {
          width: 10px; height: 10px; border-radius: 50%;
          flex-shrink: 0;
        }
        .activity-body { flex: 1; }
        .activity-icon-text { display: flex; align-items: center; gap: 8px; }
        .activity-text { font-size: 14px; color: var(--text-primary); }
        .activity-time { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

        @media (max-width: 1100px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 800px) {
          .dashboard-page { padding: 24px 16px; }
          .stat-grid { grid-template-columns: 1fr; }
          .mid-section { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dashboard-page">
        {/* Greeting */}
        <div className="page-greeting">
          <h1 className="greeting-title">Good morning, MIT Admin 👋</h1>
          <p className="greeting-sub">MIT College of Engineering · {today}</p>
        </div>

        {/* Stat Cards */}
        <div className="stat-grid">
          {STAT_CARDS.map((card) => (
            <div key={card.label} className="stat-card" style={{ borderColor: `${card.color}22` }}>
              <span className="stat-card-icon">{card.icon}</span>
              <div className="stat-label">{card.label}</div>
              <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
              <div className="stat-sub">
                {card.pulse && <span className="pulse-dot" />}
                {card.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Mid: Requests + Products */}
        <div className="mid-section">
          {/* Student Requests */}
          <div className="section-card">
            <div className="section-card-title">
              <span style={{ color: 'var(--accent-green)' }}>Student Requests</span>
              <Link href="/admin/requests" className="view-all" style={{ color: 'var(--accent-green)' }}>
                View All →
              </Link>
            </div>
            {PENDING_REQUESTS.map((req) => (
              <div key={req.email} className="request-item">
                <div className="avatar">{req.initials}</div>
                <div className="request-info">
                  <div className="request-name">{req.name}</div>
                  <div className="request-email">{req.email}</div>
                  <div className="request-date">Requested: {req.date}</div>
                </div>
                <div className="request-actions">
                  <button className="btn-approve">✅</button>
                  <button className="btn-reject">❌</button>
                </div>
              </div>
            ))}
          </div>

          {/* Products Needing Review */}
          <div className="section-card">
            <div className="section-card-title">
              <span style={{ color: 'var(--accent-blue)' }}>Products Awaiting Review</span>
              <Link href="/admin/products" className="view-all" style={{ color: 'var(--accent-blue)' }}>
                View All →
              </Link>
            </div>
            {PENDING_PRODUCTS.map((prod) => (
              <div key={prod.name} className="product-item">
                <div className="product-icon-box">{prod.icon}</div>
                <div className="product-info">
                  <div className="product-name">{prod.name}</div>
                  <div className="product-seller">by {prod.seller}</div>
                </div>
                <span className="product-price">{prod.price}</span>
                <span className={`type-badge ${prod.type.toLowerCase()}`}>{prod.type}</span>
                <div style={{ display: 'flex', gap: '6px', marginLeft: '8px' }}>
                  <button className="btn-approve" style={{ fontSize: '11px' }}>Approve ✓</button>
                  <button className="btn-reject" style={{ fontSize: '11px' }}>Remove ✗</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-card">
          <h2 className="activity-title">Recent Activity</h2>
          <div className="activity-list">
            {ACTIVITY.map((item, i) => (
              <div key={i} className="activity-item">
                <div className="activity-dot-wrap">
                  <div className="activity-dot" style={{ background: item.dot }} />
                </div>
                <div className="activity-body">
                  <div className="activity-icon-text">
                    <span>{item.icon}</span>
                    <span className="activity-text">{item.text}</span>
                  </div>
                  <div className="activity-time">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
