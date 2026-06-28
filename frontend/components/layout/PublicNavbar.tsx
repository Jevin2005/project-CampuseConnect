"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const S = `
.pub-nav {
  position: sticky; top: 0; z-index: 100;
  height: 64px; width: 100%;
  display: flex; align-items: center;
  background: transparent;
  border-bottom: 1px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.pub-nav.scrolled {
  background: rgba(17, 24, 39, 0.92) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
  border-bottom: 1px solid #1e2d45 !important;
}
.pub-nav-container {
  max-width: 1280px; width: 100%;
  margin: 0 auto; padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between;
}
@media (max-width: 768px) {
  .pub-nav-container {
    padding: 0 20px;
  }
}
.desktop-nav-links {
  display: flex; align-items: center; gap: 24px;
}
@media (max-width: 768px) {
  .desktop-nav-links {
    display: none;
  }
}
.nav-link {
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
  color: #9CA3AF; text-decoration: none;
  transition: color 0.2s ease;
}
.nav-link:hover { color: #F0F4FF; }

.btn-col-login {
  display: inline-flex; align-items: center;
  background: transparent;
  border: 1.5px solid rgba(79,142,247,0.55);
  color: #4F8EF7;
  padding: 8px 20px; border-radius: 9999px;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
  text-decoration: none; transition: all 0.2s ease;
  white-space: nowrap;
}
.btn-col-login:hover {
  background: rgba(79,142,247,0.08);
  border-color: #4F8EF7;
  transform: translateY(-1px);
}

.btn-std-login {
  display: inline-flex; align-items: center;
  background: #4F8EF7; color: #fff;
  padding: 8px 20px; border-radius: 9999px;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
  text-decoration: none; transition: all 0.2s ease;
  box-shadow: 0 2px 12px rgba(79,142,247,0.25);
  white-space: nowrap;
}
.btn-std-login:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(79,142,247,0.45);
  background: #609bf9;
}

.hamburger-btn {
  display: none; align-items: center; justify-content: center;
  background: transparent; border: none; cursor: pointer; color: #9CA3AF;
  padding: 6px; outline: none; transition: color 0.2s ease;
}
.hamburger-btn:hover { color: #F0F4FF; }
@media (max-width: 768px) {
  .hamburger-btn {
    display: flex;
  }
}

.mobile-menu-dropdown {
  position: absolute; top: 64px; left: 0; right: 0; z-index: 50;
  padding: 20px 24px; display: flex; flex-direction: column; gap: 14px;
  background: rgba(17, 24, 39, 0.98); backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(30, 45, 69, 0.9);
  animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideDown {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.mobile-nav-link {
  font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
  color: #9CA3AF; text-decoration: none; padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.02);
  transition: color 0.2s ease;
}
.mobile-nav-link:hover { color: #F0F4FF; }
.btn-mobile-auth {
  display: flex; justify-content: center; align-items: center;
  padding: 12px 24px; border-radius: 9999px;
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700;
  text-decoration: none; transition: all 0.2s ease;
}
`;

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <style>{S}</style>
      <nav className={`pub-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="pub-nav-container">
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "linear-gradient(135deg, #4F8EF7, #7C3AED)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 10px rgba(79,142,247,0.25)",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 15 }}>🎓</span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#F0F4FF",
                  letterSpacing: "-0.5px",
                }}
              >
                Campus
              </span>
              <span
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#4F8EF7",
                  letterSpacing: "-0.5px",
                }}
              >
                Connect
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="desktop-nav-links">
            <Link href="/how-it-works" className="nav-link">
              How It Works
            </Link>

            <Link href="/admin/login" className="btn-col-login">
              College Login
            </Link>

            <Link href="/login" className="btn-std-login">
              Student Login
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mobile-menu-dropdown">
            <Link
              href="/how-it-works"
              className="mobile-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/admin/login"
              className="btn-mobile-auth"
              style={{
                background: "transparent",
                border: "1.5px solid rgba(79,142,247,0.55)",
                color: "#4F8EF7",
              }}
              onClick={() => setMenuOpen(false)}
            >
              College Login
            </Link>
            <Link
              href="/login"
              className="btn-mobile-auth"
              style={{
                background: "#4F8EF7",
                color: "#fff",
              }}
              onClick={() => setMenuOpen(false)}
            >
              Student Login
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
