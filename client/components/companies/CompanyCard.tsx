"use client";
import Link from "next/link";
import { type Company } from "@/lib/types";

function formatFunding(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

interface Props {
  company: Company;
  rank?: number;
  variant?: "default" | "hero" | "compact" | "grid";
}

/* Deterministic pastel-on-dark category pill colours */
const catStyle: Record<string, { bg: string; color: string }> = {
  "AI Coding":          { bg: "rgba(139,92,246,0.15)",  color: "#a78bfa" },
  "AI Search":          { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa" },
  "AI Image":           { bg: "rgba(236,72,153,0.15)",  color: "#f472b6" },
  "AI Video":           { bg: "rgba(168,85,247,0.15)",  color: "#c084fc" },
  "AI Voice":           { bg: "rgba(249,115,22,0.15)",  color: "#fb923c" },
  "AI Infrastructure":  { bg: "rgba(16,185,129,0.15)",  color: "#34d399" },
  "AI Research":        { bg: "rgba(255,59,87,0.12)",   color: "#ff6b81" },
  "AI Models":          { bg: "rgba(234,179,8,0.15)",   color: "#facc15" },
  "AI Education":       { bg: "rgba(6,182,212,0.15)",   color: "#22d3ee" },
  "AI Legal":           { bg: "rgba(100,116,139,0.15)", color: "#94a3b8" },
  "AI Content":         { bg: "rgba(20,184,166,0.15)",  color: "#2dd4bf" },
  "AI Productivity":    { bg: "rgba(132,204,22,0.15)",  color: "#a3e635" },
  "AI Agents":          { bg: "rgba(255,59,87,0.12)",   color: "#ff7a8a" },
};
const defaultCat = { bg: "rgba(255,255,255,0.06)", color: "#999" };

function CatPill({ cat }: { cat: string }) {
  const s = catStyle[cat] ?? defaultCat;
  return (
    <span style={{
      fontSize: 10, fontWeight: 600,
      padding: "2px 7px",
      borderRadius: "var(--r-sm)",
      background: s.bg,
      color: s.color,
      letterSpacing: "0.2px",
      border: `1px solid ${s.color}22`,
      whiteSpace: "nowrap",
    }}>{cat}</span>
  );
}

function Logo({ name, bg, size = 40 }: { name: string; bg: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size > 36 ? "var(--r-xl)" : "var(--r-lg)",
      background: bg,
      flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 800,
      fontSize: size * 0.36,
      letterSpacing: "-0.5px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    }}>
      {name.charAt(0)}
    </div>
  );
}

/* ─── HERO CARD (trending grid) ─────────────────────────────────────── */
export default function CompanyCard({ company, rank, variant = "default" }: Props) {

  if (variant === "hero") {
    return (
      <Link href={`/companies/${company.slug}`}
        style={{
          display: "block", position: "relative",
          borderRadius: "var(--r-xl)", overflow: "hidden",
          height: 200,
          background: company.logo_bg,
          textDecoration: "none",
          border: "1px solid rgba(255,255,255,0.06)",
          transition: "transform var(--dur-base) var(--ease-out-expo), box-shadow var(--dur-base)",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "var(--shadow-lg)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.05) 100%)",
        }} />

        {/* watermark letter */}
        <div style={{
          position: "absolute", right: -10, top: -10,
          fontSize: 90, fontWeight: 900, color: "rgba(255,255,255,0.06)",
          lineHeight: 1, userSelect: "none",
        }}>{company.name.charAt(0)}</div>

        <div style={{ position: "relative", padding: 16, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Logo name={company.name} bg="rgba(255,255,255,0.15)" size={36} />
            {rank && (
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: "rgba(255,255,255,0.5)",
                background: "rgba(0,0,0,0.3)",
                padding: "3px 7px", borderRadius: "var(--r-pill)",
                backdropFilter: "blur(4px)",
              }}>#{rank}</span>
            )}
          </div>

          <div>
            <CatPill cat={company.category} />
            <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px", margin: "6px 0 4px" }}>
              {company.name}
            </h3>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, lineHeight: 1.45, WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {company.description}
            </p>
            {rank && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                <span style={{ fontSize: 10, color: "var(--accent)", fontWeight: 700 }}>🔥 Trending #{rank}</span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>· {company.views} views</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  /* ─── COMPACT ──────────────────────────────────────────────────────── */
  if (variant === "compact") {
    return (
      <Link href={`/companies/${company.slug}`}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 12px", borderRadius: "var(--r-lg)",
          textDecoration: "none",
          transition: "background var(--dur-fast)",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <Logo name={company.name} bg={company.logo_bg} size={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {company.name}
            </span>
            {company.is_unicorn && <span style={{ fontSize: 11 }}>🦄</span>}
          </div>
          <p style={{ fontSize: 11, color: "var(--ink-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {company.description}
          </p>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", flexShrink: 0 }}>
          {formatFunding(company.total_funding_usd)}
        </span>
      </Link>
    );
  }

  /* ─── GRID ─────────────────────────────────────────────────────────── */
  if (variant === "grid") {
    return (
      <Link href={`/companies/${company.slug}`}
        style={{
          display: "flex", flexDirection: "column",
          background: "var(--surface-1)",
          border: "1px solid var(--hairline)",
          borderRadius: "var(--r-xl)",
          overflow: "hidden",
          textDecoration: "none",
          transition: "border-color var(--dur-base), transform var(--dur-base) var(--ease-out-expo), box-shadow var(--dur-base)",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "var(--surface-3)";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "var(--shadow-md)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "var(--hairline)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* colour banner */}
        <div style={{ height: 80, position: "relative", background: company.logo_bg, overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)" }} />
          <div style={{ position: "absolute", right: -8, top: -8, fontSize: 60, fontWeight: 900, color: "rgba(255,255,255,0.07)", lineHeight: 1 }}>
            {company.name.charAt(0)}
          </div>
          <div style={{ position: "absolute", bottom: 10, left: 12 }}>
            <Logo name={company.name} bg="rgba(255,255,255,0.12)" size={32} />
          </div>
        </div>

        <div style={{ padding: "12px 14px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.2px" }}>{company.name}</span>
            {company.is_unicorn && <span style={{ fontSize: 11 }}>🦄</span>}
          </div>
          <CatPill cat={company.category} />
          <p style={{ fontSize: 11, color: "var(--ink-muted)", lineHeight: 1.5, marginTop: 8, flex: 1, WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {company.description}
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--hairline-soft)" }}>
            <span style={{ fontSize: 11, color: "var(--ink-dim)" }}>{company.founded_year}</span>
            <span style={{ color: "var(--hairline)" }}>·</span>
            <span style={{ fontSize: 11, color: "var(--ink-dim)" }}>{company.employee_count}</span>
          </div>
        </div>
      </Link>
    );
  }

  /* ─── DEFAULT (table row) ──────────────────────────────────────────── */
  return (
    <Link href={`/companies/${company.slug}`}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 16px",
        background: "var(--surface-1)",
        border: "1px solid var(--hairline)",
        borderRadius: "var(--r-lg)",
        textDecoration: "none",
        transition: "border-color var(--dur-fast), background var(--dur-fast), transform var(--dur-fast)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "var(--surface-3)";
        e.currentTarget.style.background = "var(--surface-2)";
        e.currentTarget.style.transform = "translateX(2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--hairline)";
        e.currentTarget.style.background = "var(--surface-1)";
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      <Logo name={company.name} bg={company.logo_bg} size={44} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)", letterSpacing: "-0.2px" }}>{company.name}</span>
          {company.is_unicorn && <span style={{ fontSize: 12 }}>🦄</span>}
          <CatPill cat={company.category} />
        </div>
        <p style={{ fontSize: 12, color: "var(--ink-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {company.description}
        </p>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.3px", fontFamily: "'DM Mono', monospace" }}>
          {formatFunding(company.total_funding_usd)}
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-dim)", marginTop: 2 }}>{company.stage}</div>
      </div>
    </Link>
  );
}