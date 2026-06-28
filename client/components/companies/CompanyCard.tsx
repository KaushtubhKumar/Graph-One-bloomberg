"use client";
import Link from "next/link";
import { Sparkles, TrendingUp } from "lucide-react";
import { type Company } from "@/lib/types";
import Logo from "@/components/shared/Logo";

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

function CategoryPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-meta text-ink-600 bg-ink-100 px-2.5 py-1 rounded-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-accent-500 flex-shrink-0" />
      {label}
    </span>
  );
}

/** Returns a light pastel gradient bg for hero trending cards.
 *  Keeps text dark so white ink stays readable on the card.
 *  Falls back to a generic light slate if the color isn't mapped. */
function cardGradientLight(bg: string): string {
  const map: Record<string, string> = {
    "#18181b": "linear-gradient(135deg, #f4f4f5 0%, #e4e4e7 100%)",
    "#92400e": "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)",
    "#1e3a5f": "linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%)",
    "#312e81": "linear-gradient(135deg, #eef2ff 0%, #c7d2fe 100%)",
    "#1e3a8a": "linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%)",
    "#27272a": "linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)",
    "#c2410c": "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)",
    "#1447e6": "linear-gradient(135deg, #eff6ff 0%, #bae6fd 100%)",
    "#3329a3": "linear-gradient(135deg, #f5f3ff 0%, #ddd6fe 100%)",
    "#facc15": "linear-gradient(135deg, #fefce8 0%, #fef08a 100%)",
    "#0e7490": "linear-gradient(135deg, #ecfeff 0%, #a5f3fc 100%)",
    "#dc2626": "linear-gradient(135deg, #fff1f2 0%, #fecdd3 100%)",
  };
  return map[bg] ?? "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)";
}

/** Dark gradient for the grid/emerging cards where we want the branded look */
function cardGradient(bg: string): string {
  const map: Record<string, string> = {
    "#18181b": "linear-gradient(135deg, #27272a 0%, #18181b 55%, #09090b 100%)",
    "#92400e": "linear-gradient(135deg, #b45309 0%, #92400e 55%, #5c2d05 100%)",
    "#1e3a5f": "linear-gradient(135deg, #2563a8 0%, #1e3a5f 55%, #0f1f35 100%)",
    "#312e81": "linear-gradient(135deg, #4338ca 0%, #312e81 55%, #1e1b4b 100%)",
    "#1e3a8a": "linear-gradient(135deg, #2563eb 0%, #1e3a8a 55%, #0f1f4d 100%)",
    "#27272a": "linear-gradient(135deg, #3f3f46 0%, #27272a 55%, #09090b 100%)",
    "#c2410c": "linear-gradient(135deg, #ea580c 0%, #c2410c 55%, #7c2d12 100%)",
    "#1447e6": "linear-gradient(135deg, #3b82f6 0%, #1447e6 55%, #0a2494 100%)",
    "#3329a3": "linear-gradient(135deg, #5046e5 0%, #3329a3 55%, #1e1060 100%)",
    "#facc15": "linear-gradient(135deg, #fde68a 0%, #facc15 55%, #b45309 100%)",
    "#0e7490": "linear-gradient(135deg, #0891b2 0%, #0e7490 55%, #083344 100%)",
    "#dc2626": "linear-gradient(135deg, #ef4444 0%, #dc2626 55%, #7f1d1d 100%)",
  };
  return map[bg] ?? `linear-gradient(135deg, ${bg}cc 0%, ${bg} 55%, ${bg}88 100%)`;
}

export default function CompanyCard({ company, rank, variant = "default" }: Props) {
  if (variant === "hero") {
    return (
      <Link
        href={`/companies/${company.slug}`}
        className="group relative rounded-lg overflow-hidden block hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 border border-ink-100"
        style={{ background: cardGradientLight(company.logo_bg) }}
      >
        {/* Subtle noise for texture */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "180px",
          }}
        />
        {/* Bottom fade for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />

        <div className="relative p-5 h-48 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <Logo
              name={company.name}
              website={company.website}
              bg={company.logo_bg}
              size={40}
              className="ring-1 ring-ink-200 shadow-sm"
            />
            {rank && (
              <span className="text-meta text-ink-600 font-semibold tabular-nums bg-white/70 px-2 py-0.5 rounded-full backdrop-blur-sm text-[12px]">
                #{rank}
              </span>
            )}
          </div>
          <div>
            <span className="inline-block text-meta text-ink-600 px-2.5 py-1 rounded-sm bg-white/60 backdrop-blur-sm mb-2 text-[12px] font-medium">
              {company.category}
            </span>
            <h3 className="text-ink-900 font-bold text-[17px] leading-tight tracking-tight transition-transform duration-220 ease-out group-hover:-translate-y-0.5">
              {company.name}
            </h3>
            <p className="text-ink-600 text-[13px] mt-1.5 line-clamp-2 leading-relaxed">
              {company.description}
            </p>
            {rank && (
              <div className="flex items-center gap-1.5 mt-2.5">
                <TrendingUp size={12} className="text-accent-500" />
                <span className="text-meta text-ink-800 font-semibold">Trending #{rank}</span>
                <span className="text-meta text-ink-500">· {company.views} views</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/companies/${company.slug}`}
        className="flex items-center gap-3 p-3 rounded-sm hover:bg-ink-50 transition-colors duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      >
        <Logo name={company.name} website={company.website} bg={company.logo_bg} size={36} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-semibold text-ink-900 truncate">{company.name}</span>
            {company.is_unicorn && (
              <Sparkles size={12} className="text-accent-500 flex-shrink-0" aria-label="Unicorn" />
            )}
          </div>
          <p className="text-meta text-ink-500 truncate">{company.description}</p>
        </div>
        <span className="text-meta text-ink-400 flex-shrink-0 tabular-nums">
          {formatFunding(company.total_funding_usd)}
        </span>
      </Link>
    );
  }

  if (variant === "grid") {
    return (
      <Link
        href={`/companies/${company.slug}`}
        className="group flex flex-col rounded-lg overflow-hidden border border-ink-100 hover-lift bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      >
        <div className="h-32 relative overflow-hidden" style={{ background: cardGradient(company.logo_bg) }}>
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              backgroundSize: "140px",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-black text-5xl opacity-10 select-none">
              {company.name.charAt(0)}
            </span>
          </div>
          <div className="absolute bottom-3 left-3">
            <Logo
              name={company.name}
              website={company.website}
              bg={company.logo_bg}
              size={40}
              className="ring-1 ring-white/25 shadow-md"
            />
          </div>
          {company.is_unicorn && (
            <div
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center"
              aria-label="Unicorn company"
            >
              <Sparkles size={14} className="text-accent-500" />
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-[15px] text-ink-900 truncate">{company.name}</span>
          </div>
          <CategoryPill label={company.category} />
          <p className="text-[13px] text-ink-500 mt-3 line-clamp-2 leading-relaxed flex-1">
            {company.description}
          </p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ink-100">
            <span className="text-meta text-ink-400">{company.founded_year}</span>
            <span className="w-1 h-1 rounded-full bg-ink-300" />
            <span className="text-meta text-ink-400">{company.employee_count}</span>
            <span className="ml-auto text-meta text-ink-700 font-semibold tabular-nums">
              {formatFunding(company.total_funding_usd)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // default variant
  return (
    <Link
      href={`/companies/${company.slug}`}
      className="flex items-center gap-3 sm:gap-4 p-4 rounded-lg border border-ink-100 hover-lift bg-white group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
    >
      <Logo name={company.name} website={company.website} bg={company.logo_bg} size={48} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-[15px] text-ink-900 truncate max-w-[140px] sm:max-w-none">
            {company.name}
          </span>
          {company.is_unicorn && (
            <Sparkles size={13} className="text-accent-500 flex-shrink-0" aria-label="Unicorn" />
          )}
          <span className="hidden sm:inline">
            <CategoryPill label={company.category} />
          </span>
        </div>
        <p className="text-[13px] sm:text-[14px] text-ink-500 truncate mt-0.5 sm:mt-0">
          {company.description}
        </p>
        <span className="sm:hidden inline-block mt-1.5">
          <CategoryPill label={company.category} />
        </span>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-[14px] font-semibold text-ink-900 tabular-nums">
          {formatFunding(company.total_funding_usd)}
        </div>
        <div className="text-meta text-ink-400">{company.stage}</div>
      </div>
    </Link>
  );
}