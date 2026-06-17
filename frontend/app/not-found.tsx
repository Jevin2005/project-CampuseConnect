'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0E1A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      padding: '24px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 40px rgba(79,142,247,0.2)} 50%{box-shadow:0 0 80px rgba(79,142,247,0.5)} }
        .nf-card { animation: fadeUp 0.5s ease forwards; }
        .nf-num { animation: float 4s ease-in-out infinite; }
        .nf-go-btn {
          background: linear-gradient(135deg, #4F8EF7, #7C3AED);
          border: none; border-radius: 9999px;
          color: #fff; font-family: 'DM Sans', sans-serif;
          font-weight: 700; font-size: 14px;
          padding: 12px 28px; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          text-decoration: none; display: inline-block;
        }
        .nf-go-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(79,142,247,0.4); }
        .nf-back-btn {
          background: transparent;
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 9999px;
          color: #6B7280; font-family: 'DM Sans', sans-serif;
          font-weight: 600; font-size: 14px;
          padding: 12px 28px; cursor: pointer;
          transition: all 0.2s; text-decoration: none;
          display: inline-block;
        }
        .nf-back-btn:hover { border-color: rgba(255,255,255,0.25); color: #9CA3AF; }
      `}</style>

      {/* Ambient glow orbs */}
      <div style={{ position: 'fixed', top: '20%', left: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '15%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="nf-card" style={{ textAlign: 'center', maxWidth: 480 }}>
        {/* 404 Number */}
        <div className="nf-num" style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 'clamp(100px, 18vw, 160px)',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #4F8EF7 0%, #7C3AED 50%, #4F8EF7 100%)',
          backgroundSize: '200%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1,
          marginBottom: 8,
          letterSpacing: '-6px',
        }}>
          404
        </div>

        {/* Divider line */}
        <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg, #4F8EF7, #7C3AED)', borderRadius: 9999, margin: '0 auto 24px' }} />

        {/* Heading */}
        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 'clamp(20px, 4vw, 28px)',
          fontWeight: 800,
          color: '#F0F4FF',
          marginBottom: 12,
          lineHeight: 1.2,
        }}>
          Page Not Found
        </h1>
        <p style={{
          fontSize: 15,
          color: '#6B7280',
          lineHeight: 1.65,
          marginBottom: 36,
          maxWidth: 360,
          margin: '0 auto 36px',
        }}>
          The page you're looking for doesn't exist or may have been moved.
          Check the URL or go back to a familiar place.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/marketplace" className="nf-go-btn">
            🏪 Go to Marketplace
          </Link>
          <Link href="/" className="nf-back-btn">
            ← Home
          </Link>
        </div>

        {/* Quick links */}
        <div style={{ marginTop: 40, display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { href: '/marketplace', label: 'Marketplace' },
            { href: '/marketplace/sell', label: 'Sell Item' },
            { href: '/marketplace/purchases', label: 'Purchases' },
            { href: '/admin/dashboard', label: 'Admin' },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{
              fontSize: 12,
              color: '#4B5563',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#4F8EF7')}
              onMouseLeave={e => (e.currentTarget.style.color = '#4B5563')}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
