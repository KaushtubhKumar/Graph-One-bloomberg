"use client";
import { useState } from "react";

/**
 * Real company/investor logos via logo.dev's image CDN, keyed by domain.
 *
 * Get a free publishable token at https://logo.dev (no card required) and
 * set it as NEXT_PUBLIC_LOGO_DEV_TOKEN in .env.local. Until you do, every
 * logo silently falls back to the letter-avatar treatment below — nothing
 * breaks, the UI just looks like it did before.
 *
 * Why logo.dev: Clearbit's free logo API (the old industry default) was
 * discontinued after its HubSpot acquisition. logo.dev is the most widely
 * adopted drop-in replacement — same "one <img> tag, no SDK" model, real
 * brand marks (not just favicons), and a generous free tier.
 */
const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || "";

// Best-effort domain guess for entities that don't have a website field
// populated in mock data (mainly investors). Real, populated `website`
// values always win — this is only a fallback for the demo dataset.
const KNOWN_DOMAINS: Record<string, string> = {
  "sequoia capital": "sequoiacap.com",
  "andreessen horowitz": "a16z.com",
  "a16z": "a16z.com",
  "y combinator": "ycombinator.com",
  "khosla ventures": "khoslaventures.com",
  "accel": "accel.com",
  "lightspeed": "lsvp.com",
  "lightspeed venture partners": "lsvp.com",
  "general catalyst": "generalcatalyst.com",
  "founders fund": "foundersfund.com",
  "thrive capital": "thrivecap.com",
  "greenoaks": "greenoaks.com",
  "iconiq": "iconiqcapital.com",
  "tiger global": "tigerglobal.com",
  "coatue": "coatue.com",
  "openai": "openai.com",
  "anthropic": "anthropic.com",
  "google deepmind": "deepmind.google",
  "xai": "x.ai",
  "meta ai": "meta.com",
  "ssi": "ssi.inc",
  "hugging face": "huggingface.co",
  "mistral ai": "mistral.ai",
  "ollama": "ollama.com",
  "together ai": "together.ai",
  "databricks": "databricks.com",
};

function guessDomain(name: string, website?: string): string | null {
  if (website) return website.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const known = KNOWN_DOMAINS[name.toLowerCase().trim()];
  if (known) return known;
  return null;
}

interface LogoProps {
  name: string;
  website?: string;
  bg: string;
  size: number;
  /** Tailwind radius class — defaults to rounded-sm (12px token), pass rounded-full for circular contexts */
  rounded?: string;
  className?: string;
  /** Pass "dark" when placing on a dark panel (e.g. bg-ink-900) so the logo card doesn't render as a jarring solid white square */
  theme?: "light" | "dark";
}

export default function Logo({ name, website, bg, size, rounded = "rounded-sm", className = "", theme = "light" }: LogoProps) {
  const [failed, setFailed] = useState(false);
  const domain = guessDomain(name, website);
  const canTryRealLogo = Boolean(LOGO_DEV_TOKEN && domain && !failed);

  if (canTryRealLogo) {
    const logoTheme = theme === "dark" ? "&theme=dark" : "";
    const src = `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=${size * 2}&format=png&retina=true${logoTheme}`;
    const cardClass = theme === "dark"
      ? "bg-white/10 ring-1 ring-white/15"
      : "bg-white ring-1 ring-ink-100";
    return (
      <div
        className={`${rounded} flex-shrink-0 overflow-hidden ${cardClass} flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${name} logo`}
          width={size}
          height={size}
          className="w-full h-full object-contain p-[12%]"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  // Fallback: letter-avatar on the entity's brand-tinted background, exactly
  // as before — never a broken image, never a blank box.
  return (
    <div
      className={`${rounded} flex-shrink-0 flex items-center justify-center text-white font-bold ${className}`}
      style={{ width: size, height: size, background: bg, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {name.charAt(0)}
    </div>
  );
}
