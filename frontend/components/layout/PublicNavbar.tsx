"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      style={{
        position: "sticky", top: 0, zIndex: 100,
        height: 64,
        display: "flex", alignItems: "center",
        background: scrolled ? "rgba(17,24,39,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid #1e2d45" : "1px solid transparent",
        transition: "background 0.3s, border-color 0.3s, backdrop-filter 0.3s",
      }}
    >
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        width: "100%", padding: "0 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex", alignItems: "center", gap: 0,
            textDecoration: "none",
          }}
        >
          <span style={{
            fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800,
            color: "#F0F4FF", letterSpacing: "-0.5px",
          }}>
            Campus
          </span>
          <span style={{
            fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800,
            color: "#4F8EF7", letterSpacing: "-0.5px",
          }}>
            Connect
          </span>
        </Link>

        {/* Desktop nav */}
        <div
          className="desktop-nav"
          style={{ display: "flex", alignItems: "center", gap: 32 }}
        >
          <Link
            href="/how-it-works"
            style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
              color: "#9CA3AF", textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#F0F4FF")}
            onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
          >
            How It Works
          </Link>

          <Link
            href="/admin/login"
            style={{
              display: "inline-flex", alignItems: "center",
              background: "transparent",
              border: "1.5px solid rgba(79,142,247,0.55)",
              color: "#4F8EF7",
              padding: "8px 20px", borderRadius: 9999,
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
              textDecoration: "none", transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(79,142,247,0.08)";
              e.currentTarget.style.borderColor = "#4F8EF7";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(79,142,247,0.55)";
            }}
          >
            College Login
          </Link>

          <Link
            href="/login"
            style={{
              display: "inline-flex", alignItems: "center",
              background: "#4F8EF7", color: "#fff",
              padding: "8px 20px", borderRadius: 9999,
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
              textDecoration: "none", transition: "all 0.2s",
              boxShadow: "0 2px 12px rgba(79,142,247,0.35)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(79,142,247,0.5)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(79,142,247,0.35)";
            }}
          >
            Student Login
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          style={{
            display: "none", background: "transparent", border: "none",
            cursor: "pointer", color: "#9CA3AF", padding: 6,
          }}
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: "absolute", top: 64, left: 0, right: 0, zIndex: 50,
          padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12,
          background: "rgba(17,24,39,0.98)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid #1e2d45",
        }}>
          <Link
            href="/how-it-works"
            style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 14,
              color: "#9CA3AF", textDecoration: "none", padding: "8px 0",
            }}
            onClick={() => setMenuOpen(false)}
          >
            How It Works
          </Link>
          <Link
            href="/admin/login"
            style={{
              display: "flex", justifyContent: "center",
              background: "transparent", border: "1.5px solid rgba(79,142,247,0.55)",
              color: "#4F8EF7", padding: "10px 20px", borderRadius: 9999,
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
              textDecoration: "none",
            }}
            onClick={() => setMenuOpen(false)}
          >
            College Login
          </Link>
          <Link
            href="/login"
            style={{
              display: "flex", justifyContent: "center",
              background: "#4F8EF7", color: "#fff",
              padding: "10px 20px", borderRadius: 9999,
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
              textDecoration: "none",
            }}
            onClick={() => setMenuOpen(false)}
          >
            Student Login
          </Link>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (max-width: 640px) {
          nav > div { padding: 0 16px !important; }
        }
      `}</style>
    </nav>
  );
}
