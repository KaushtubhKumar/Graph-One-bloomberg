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

const categoryColors: Record<string, string> = {
  "AI Coding": "bg-violet-100 text-violet-700",
  "AI Search": "bg-blue-100 text-blue-700",
  "AI Image": "bg-pink-100 text-pink-700",
  "AI Video": "bg-purple-100 text-purple-700",
  "AI Voice": "bg-orange-100 text-orange-700",
  "AI Infrastructure": "bg-emerald-100 text-emerald-700",
  "AI Research": "bg-red-100 text-red-700",
  "AI Models": "bg-yellow-100 text-yellow-700",
  "AI Education": "bg-cyan-100 text-cyan-700",
  "AI Legal": "bg-gray-100 text-gray-700",
  "AI Content": "bg-teal-100 text-teal-700",
  "AI Productivity": "bg-lime-100 text-lime-700",
};

function LogoPlaceholder({ name, bg }: { name: string; bg: string }) {
  return (
    <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: bg }}>
      {name.charAt(0)}
    </div>
  );
}

export default function CompanyCard({ company, rank, variant = "default" }: Props) {
  const catColor = categoryColors[company.category] || "bg-gray-100 text-gray-700";

  if (variant === "hero") {
    return (
      <Link href={`/companies/${company.slug}`}
        className="relative rounded-2xl overflow-hidden group cursor-pointer block"
        style={{ background: company.logo_bg }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="relative p-5 h-44 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center">
              <LogoPlaceholder name={company.name} bg={company.logo_bg} />
            </div>
            {rank && (
              <span className="text-xs text-white/60 font-medium">#{rank}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-white/60 px-2 py-0.5 rounded-full bg-white/10">{company.category}</span>
            </div>
            <h3 className="text-white font-bold text-lg leading-tight">{company.name}</h3>
            <p className="text-white/70 text-xs mt-1 line-clamp-2">{company.description}</p>
            {rank && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-[#FF3B57] text-xs font-semibold">🔥 Trending #{rank}</span>
                <span className="text-white/50 text-xs">• {company.views} views (7d)</span>
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
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
          <LogoPlaceholder name={company.name} bg={company.logo_bg} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 truncate">{company.name}</span>
            {company.is_unicorn && <span className="text-xs">🦄</span>}
          </div>
          <p className="text-xs text-gray-500 truncate">{company.description}</p>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">{formatFunding(company.total_funding_usd)}</span>
      </Link>
    );
  }

  if (variant === "grid") {
    return (
      <Link href={`/companies/${company.slug}`}
        className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white">
        <div className="h-28 relative overflow-hidden" style={{ background: company.logo_bg }}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-black text-4xl opacity-20">{company.name.charAt(0)}</span>
          </div>
          <div className="absolute bottom-3 left-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{company.name.charAt(0)}</span>
            </div>
          </div>
        </div>
        <div className="p-3 flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-sm text-gray-900">{company.name}</span>
            {company.is_unicorn && <span className="text-xs">🦄</span>}
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColor}`}>{company.category}</span>
          <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{company.description}</p>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
            <span className="text-xs text-gray-400">{company.founded_year}</span>
            <span className="text-gray-200">•</span>
            <span className="text-xs text-gray-400">{company.employee_count}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/companies/${company.slug}`}
      className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white group">
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
        <LogoPlaceholder name={company.name} bg={company.logo_bg} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-gray-900">{company.name}</span>
          {company.is_unicorn && <span className="text-sm">🦄</span>}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColor}`}>{company.category}</span>
        </div>
        <p className="text-sm text-gray-500 truncate">{company.description}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-sm font-semibold text-gray-900">{formatFunding(company.total_funding_usd)}</div>
        <div className="text-xs text-gray-400">{company.stage}</div>
      </div>
    </Link>
  );
}
