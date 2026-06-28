"use client";
import Link from "next/link";
import { Sparkles, TrendingUp } from "lucide-react";
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

// One consistent treatment for every category — a neutral pill with an
// accent-tinted dot, rather than 12 hand-picked Tailwind color pairs.
// Color is reserved for things that mean something (growth, funding); the
// category label itself doesn't need to compete for attention with hue.
function CategoryPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-meta text-ink-600 bg-ink-100 px-2.5 py-1 rounded-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-accent-500 flex-shrink-0" />
      {label}
    </span>
  );
}

function Logo({ name, bg, size = 40 }: { name: string; bg: string; size?: number }) {
  return (
    <div
      className="rounded-sm flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ background: bg, width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.charAt(0)}
    </div>
  );
}

export default function CompanyCard({ company, rank, variant = "default" }: Props) {
  if (variant === "hero") {
    return (
      <Link href={`/companies/${company.slug}`}
        className="group relative rounded-lg overflow-hidden block hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        style={{ background: company.logo_bg }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/0" />
        <div className="relative p-5 h-48 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-sm bg-white/15 backdrop-blur-sm flex items-center justify-center text-white font-bold text-base ring-1 ring-white/20">
              {company.name.charAt(0)}
            </div>
            {rank && (
              <span className="text-meta text-white/70 font-semibold tabular-nums">#{rank}</span>
            )}
          </div>
          <div>
            <span className="inline-block text-meta text-white/80 px-2.5 py-1 rounded-sm bg-white/15 backdrop-blur-sm mb-2">
              {company.category}
            </span>
            <h3 className="text-white font-bold text-[19px] leading-tight tracking-tight transition-transform duration-220 ease-out group-hover:-translate-y-0.5">
              {company.name}
            </h3>
            <p className="text-white/70 text-[13px] mt-1.5 line-clamp-2 leading-relaxed">{company.description}</p>
            {rank && (
              <div className="flex items-center gap-1.5 mt-2.5">
                <TrendingUp size={12} className="text-accent-400" />
                <span className="text-meta text-white font-semibold">Trending #{rank}</span>
                <span className="text-meta text-white/50">· {company.views} views</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/companies/${company.slug}`}
        className="flex items-center gap-3 p-3 rounded-sm hover:bg-ink-50 transition-colors duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
        <Logo name={company.name} bg={company.logo_bg} size={36} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-semibold text-ink-900 truncate">{company.name}</span>
            {company.is_unicorn && <Sparkles size={12} className="text-accent-500 flex-shrink-0" aria-label="Unicorn" />}
          </div>
          <p className="text-meta text-ink-500 truncate">{company.description}</p>
        </div>
        <span className="text-meta text-ink-400 flex-shrink-0 tabular-nums">{formatFunding(company.total_funding_usd)}</span>
      </Link>
    );
  }

  if (variant === "grid") {
    return (
      <Link href={`/companies/${company.slug}`}
        className="group flex flex-col rounded-lg overflow-hidden border border-ink-100 hover-lift bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
        <div className="h-32 relative overflow-hidden" style={{ background: company.logo_bg }}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/25" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-black text-5xl opacity-15 select-none">{company.name.charAt(0)}</span>
          </div>
          <div className="absolute bottom-3 left-3">
            <div className="w-10 h-10 rounded-sm bg-white/15 backdrop-blur-sm ring-1 ring-white/25 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{company.name.charAt(0)}</span>
            </div>
          </div>
          {company.is_unicorn && (
            <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center" aria-label="Unicorn company">
              <Sparkles size={14} className="text-accent-500" />
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-[15px] text-ink-900 truncate">{company.name}</span>
          </div>
          <CategoryPill label={company.category} />
          <p className="text-[13px] text-ink-500 mt-3 line-clamp-2 leading-relaxed flex-1">{company.description}</p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ink-100">
            <span className="text-meta text-ink-400">{company.founded_year}</span>
            <span className="w-1 h-1 rounded-full bg-ink-300" />
            <span className="text-meta text-ink-400">{company.employee_count}</span>
            <span className="ml-auto text-meta text-ink-700 font-semibold tabular-nums">{formatFunding(company.total_funding_usd)}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/companies/${company.slug}`}
      className="flex items-center gap-3 sm:gap-4 p-4 rounded-lg border border-ink-100 hover-lift bg-white group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
      <Logo name={company.name} bg={company.logo_bg} size={48} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-[15px] text-ink-900 truncate max-w-[140px] sm:max-w-none">{company.name}</span>
          {company.is_unicorn && <Sparkles size={13} className="text-accent-500 flex-shrink-0" aria-label="Unicorn" />}
          <span className="hidden sm:inline"><CategoryPill label={company.category} /></span>
        </div>
        <p className="text-[13px] sm:text-[14px] text-ink-500 truncate mt-0.5 sm:mt-0">{company.description}</p>
        <span className="sm:hidden inline-block mt-1.5"><CategoryPill label={company.category} /></span>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-[14px] font-semibold text-ink-900 tabular-nums">{formatFunding(company.total_funding_usd)}</div>
        <div className="text-meta text-ink-400">{company.stage}</div>
      </div>
    </Link>
  );
}
