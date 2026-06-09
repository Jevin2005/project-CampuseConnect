import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      background: "linear-gradient(180deg, #0b0f19 0%, #05070c 100%)",
      borderTop: "1px solid rgba(79,142,247,0.12)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background Glow */}
      <div aria-hidden style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: 800,
        height: 350,
        background: "radial-gradient(circle, rgba(79,142,247,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 48px;
          margin-bottom: 48px;
          position: relative;
          z-index: 1;
        }
        .footer-bottom-bar {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          position: relative;
          z-index: 1;
        }
        .footer-bottom-links {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          align-items: center;
        }
        .footer-cta-card {
          background: rgba(247,201,72,0.03);
          border: 1px solid rgba(247,201,72,0.12);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-width: 340px;
          box-sizing: border-box;
          margin-left: auto;
        }
        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 40px !important;
          }
          .footer-cta-card {
            margin-left: 0 !important;
            max-width: 100% !important;
          }
        }
        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .footer-bottom-bar {
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
            flex-wrap: wrap !important;
            gap: 12px !important;
          }
          .footer-bottom-links {
            justify-content: flex-end !important;
            gap: 12px !important;
          }
          .footer-cta-card {
            margin-left: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <div style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "64px 24px 48px",
        boxSizing: "border-box",
      }}>
        {/* Top Grid */}
        <div className="footer-grid">
          {/* Brand block */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "linear-gradient(135deg, #4F8EF7, #7C3AED)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(79,142,247,0.3)",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 16 }}>🎓</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{
                  fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800,
                  color: "#F0F4FF", letterSpacing: "-0.5px",
                }}>Campus</span>
                <span style={{
                  fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800,
                  color: "#4F8EF7", letterSpacing: "-0.5px",
                }}>Connect</span>
              </div>
            </div>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 13,
              color: "#9CA3AF", lineHeight: 1.65, maxWidth: 280,
              margin: 0,
            }}>
              The college-exclusive marketplace for students to buy, sell, and
              share knowledge securely.
            </p>
          </div>

          {/* Links block */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: "1.5px", textTransform: "uppercase",
              color: "#4F8EF7", marginBottom: 8,
              margin: 0,
            }}>
              Platform
            </p>
            {[
              { label: "How It Works", href: "/how-it-works" },
              { label: "Student Login", href: "/login" },
              { label: "Admin Login", href: "/admin/login" },
              { label: "Contact Us", href: "/contact" },
            ].map(link => (
              <Link
                key={link.href} href={link.href}
                style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                  color: "#9CA3AF", textDecoration: "none",
                  padding: "4px 0", transition: "color 0.2s",
                  display: "inline-block", width: "fit-content",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#F0F4FF")}
                onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* College CTA block */}
          <div className="footer-cta-card">
            <p style={{
              fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700,
              color: "#F7C948", margin: 0,
            }}>
              🏫 Is your college missing?
            </p>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 12,
              color: "#9CA3AF", lineHeight: 1.6, margin: 0,
            }}>
              Register your college and we&apos;ll set up your marketplace within 24 hours.
            </p>
            <Link
              href="/admin/register"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "transparent",
                border: "1.5px solid rgba(247,201,72,0.4)",
                color: "#F7C948",
                padding: "8px 18px", borderRadius: 9999,
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
                textDecoration: "none", transition: "all 0.2s", width: "fit-content",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(247,201,72,0.06)";
                e.currentTarget.style.borderColor = "rgba(247,201,72,0.8)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(247,201,72,0.4)";
              }}
            >
              Register College →
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12,
            color: "#6B7280", margin: 0,
            whiteSpace: "nowrap"
          }}>
            © 2024 CampusConnect
          </p>
          <div className="footer-bottom-links">
            {[
              { label: "Terms", href: "/terms" },
              { label: "Privacy", href: "/privacy" },
              { label: "Security", href: "/security" },
            ].map(link => (
              <Link
                key={link.href} href={link.href}
                style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                  color: "#6B7280", textDecoration: "none",
                  transition: "color 0.2s"
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#9CA3AF")}
                onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/master/login"
              style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                color: "#F7C948", textDecoration: "none",
                transition: "all 0.2s", opacity: 0.8
              }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = "0.8";
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              Master Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
