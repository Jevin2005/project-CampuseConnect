import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      background: "#111827",
      borderTop: "1px solid #1e2d45",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 40px 40px" }}>
        {/* top grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 48, marginBottom: 48,
        }}>
          {/* brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 13,
              color: "#6B7280", lineHeight: 1.65, maxWidth: 240,
            }}>
              The college-exclusive marketplace for students to buy, sell, and
              share knowledge securely.
            </p>
          </div>

          {/* links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: "1.5px", textTransform: "uppercase",
              color: "#6B7280", marginBottom: 8,
            }}>
              Platform
            </p>
            {[
              { label: "How It Works",   href: "/how-it-works" },
              { label: "Student Login",  href: "/login" },
              { label: "Admin Login",    href: "/admin/login" },
              { label: "Contact Us",     href: "/contact" },
            ].map(link => (
              <Link
                key={link.href} href={link.href}
                style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                  color: "#9CA3AF", textDecoration: "none",
                  padding: "5px 0", transition: "color 0.2s",
                  display: "inline-block",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#F0F4FF")}
                onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* college CTA */}
          <div style={{
            background: "rgba(247,201,72,0.05)",
            border: "1px solid rgba(247,201,72,0.18)",
            borderRadius: 14, padding: "20px 22px",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <p style={{
              fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700,
              color: "#F7C948",
            }}>
              🏫 Is your college missing?
            </p>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 12,
              color: "#6B7280", lineHeight: 1.6,
            }}>
              Register your college and we&apos;ll set up your marketplace within 24 hours.
            </p>
            <Link
              href="/admin/register"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "transparent",
                border: "1.5px solid rgba(247,201,72,0.5)",
                color: "#F7C948",
                padding: "8px 18px", borderRadius: 9999,
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
                textDecoration: "none", transition: "all 0.2s", width: "fit-content",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(247,201,72,0.08)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              Register College →
            </Link>
          </div>
        </div>

        {/* bottom bar */}
        <div style={{
          borderTop: "1px solid #1e2d45", paddingTop: 24,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12,
            color: "#6B7280",
          }}>
            © 2024 CampusConnect. Built for students, by students.
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Terms", "Privacy", "Security"].map(item => (
              <Link
                key={item} href="#"
                style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                  color: "#6B7280", textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#9CA3AF")}
                onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          footer > div {
            padding: 40px 16px 24px !important;
          }
          footer > div > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </footer>
  );
}
