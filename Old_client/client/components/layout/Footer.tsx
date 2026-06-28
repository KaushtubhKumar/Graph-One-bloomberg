"use client";
import Link from "next/link";

const columns = [
  { title: "Platform",   links: ["AI Startups", "AI Products", "Investors", "Funding", "Jobs", "News"] },
  { title: "Resources",  links: ["Research", "Collections", "Blog", "Help Center"] },
  { title: "Company",    links: ["About", "Careers", "Press", "Contact"] },
];

export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--hairline)",
      background: "var(--canvas)",
      marginTop: 0,
    }}>
      {/* Newsletter bar */}
      <div style={{
        borderBottom: "1px solid var(--hairline)",
        background: "var(--surface-1)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 4, letterSpacing: "-0.3px" }}>
                Stay ahead in AI
              </p>
              <p style={{ fontSize: 13, color: "var(--ink-muted)" }}>
                Weekly intelligence on companies, funding rounds, and market signals.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{
                  background: "var(--surface-2)", border: "1px solid var(--hairline)",
                  borderRadius: "var(--r-pill)", padding: "9px 16px",
                  fontSize: 13, color: "var(--ink)", outline: "none",
                  width: 220,
                }}
                placeholder="Enter your email"
                onFocus={e => { e.target.style.borderColor = "var(--surface-3)"; }}
                onBlur={e  => { e.target.style.borderColor = "var(--hairline)"; }}
              />
              <button className="btn-accent" style={{ padding: "9px 18px", fontSize: 13 }}>
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32 }}>

          {/* Brand */}
          <div style={{ gridColumn: "span 1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 24, height: 24, borderRadius: "var(--r-sm)",
                background: "var(--accent)", display: "flex", alignItems: "center",
                justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 800,
              }}>G</div>
              <span style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", letterSpacing: "-0.2px" }}>
                graph<span style={{ color: "var(--ink-muted)", fontWeight: 400 }}>one</span>
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.6, maxWidth: 180 }}>
              The global intelligence layer for the AI economy.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              {["𝕏", "in", "◎"].map((s, i) => (
                <button key={i} style={{
                  width: 30, height: 30, borderRadius: "var(--r-full)",
                  border: "1px solid var(--hairline)",
                  background: "transparent",
                  color: "var(--ink-muted)", fontSize: 11,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "border-color var(--dur-fast), color var(--dur-fast)",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--ink-dim)"; e.currentTarget.style.color = "var(--ink)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--hairline)"; e.currentTarget.style.color = "var(--ink-muted)"; }}
                >{s}</button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map(col => (
            <div key={col.title}>
              <h4 style={{
                fontSize: 11, fontWeight: 600, color: "var(--ink-dim)",
                letterSpacing: "0.8px", textTransform: "uppercase",
                marginBottom: 14,
              }}>{col.title}</h4>
              <ul style={{ listStyle: "none" }}>
                {col.links.map(l => (
                  <li key={l} style={{ marginBottom: 10 }}>
                    <Link href="#" style={{
                      fontSize: 13, color: "var(--ink-muted)",
                      textDecoration: "none",
                      transition: "color var(--dur-fast)",
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--ink)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--ink-muted)"}
                    >{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          marginTop: 40, paddingTop: 24,
          borderTop: "1px solid var(--hairline)",
          display: "flex", flexWrap: "wrap",
          alignItems: "center", justifyContent: "space-between",
          gap: 12,
        }}>
          <p style={{ fontSize: 12, color: "var(--ink-dim)" }}>© 2025 GraphOne. All rights reserved.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {["About", "Advertise", "API", "Newsletter", "Blog", "Privacy", "Terms", "Contact"].map(l => (
              <Link key={l} href="#" style={{
                fontSize: 12, color: "var(--ink-dim)",
                textDecoration: "none",
                transition: "color var(--dur-fast)",
              }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--ink-muted)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--ink-dim)"}
              >{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}