"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search, ChevronRight, ArrowRight, Sparkles, TrendingUp, ChevronDown,
  Bot, Landmark, Sprout, Zap, Brain, Building2, Code2, HeartPulse,
  LineChart, UserCheck, BarChart3, Home, User, Briefcase, DollarSign, Package,
} from "lucide-react";
import { getInvestors } from "@/lib/api";
import type { Investor } from "@/lib/types";
import Logo from "@/components/shared/Logo";

const INITIAL_COUNT = 8;
const BATCH_SIZE = 8;

const investorCollections = [
  { title: "Investors Backing AI Agents",         count: 26,  icon: Bot,        bg: "#ede9fe", accent: "#7c3aed", text: "#4c1d95" },
  { title: "Investors Backing Indian AI Startups", count: 98,  icon: Landmark,   bg: "#fef3c7", accent: "#d97706", text: "#78350f" },
  { title: "Top Seed Investors",                   count: 274, icon: Sprout,     bg: "#d1fae5", accent: "#059669", text: "#064e3b" },
  { title: "Operator Angels",                      count: 178, icon: Zap,        bg: "#e0f2fe", accent: "#0284c7", text: "#0c4a6e" },
  { title: "OpenAI Alumni Investors",              count: 42,  icon: Brain,      bg: "#fce7f3", accent: "#db2777", text: "#831843" },
  { title: "Enterprise AI Investors",              count: 84,  icon: Building2,  bg: "#e0e7ff", accent: "#4f46e5", text: "#312e81" },
  { title: "Developer Tool Specialists",           count: 92,  icon: Code2,      bg: "#f0fdf4", accent: "#16a34a", text: "#14532d" },
  { title: "Healthcare AI Investors",              count: 88,  icon: HeartPulse, bg: "#fff1f2", accent: "#e11d48", text: "#881337" },
];

const investorTypes = [
  { name: "Seed Investors",           count: "1,248", icon: Sprout },
  { name: "Series A Investors",       count: "884",   icon: LineChart },
  { name: "Angel Investors",          count: "2,174", icon: UserCheck },
  { name: "Corporate Venture Funds",  count: "615",   icon: Landmark },
  { name: "Late Stage Investors",     count: "432",   icon: BarChart3 },
  { name: "Family Offices",           count: "198",   icon: Home },
];

const capitalThemes = [
  { name: "AI Agents",        count: "214" },
  { name: "AI Coding",        count: "160" },
  { name: "AI Infrastructure",count: "88"  },
  { name: "Developer Tools",  count: "134" },
  { name: "Robotics",         count: "87"  },
  { name: "Healthcare AI",    count: "93"  },
  { name: "Defense AI",       count: "41"  },
  { name: "Video AI",         count: "43"  },
];

const graphNodes = [
  { node: "Investor",      icon: User },
  { node: "Founder",       icon: Briefcase },
  { node: "Company",       icon: Building2 },
  { node: "Funding Round", icon: DollarSign },
  { node: "Product",       icon: Package },
];

/** Format AUM / check-size numbers compactly */
function fmtMoney(n?: number): string | null {
  if (!n) return null;
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function SectionHeader({ num, title, viewAll = true }: { num: number; title: string; viewAll?: boolean }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-sm bg-ink-900 text-white text-meta font-semibold flex items-center justify-center flex-shrink-0 tabular-nums">{num}</span>
        <h2 className="text-h2 text-ink-900">{title}</h2>
      </div>
      {viewAll && (
        <Link href="#" className="hidden sm:flex items-center gap-1 text-[14px] text-ink-500 hover:text-ink-900 font-medium transition-colors duration-150">
          View all <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

/** Single horizontal investor row — full width, light themed */
function InvestorRow({ inv, rank }: { inv: Investor; rank: number }) {
  const aum = fmtMoney(inv.aum);
  const check = fmtMoney(inv.avg_check_size);
  return (
    <Link
      href={`/investors/${inv.slug}`}
      className="group flex items-center gap-4 px-4 py-3.5 rounded-lg border border-ink-100 bg-white hover:border-accent-200 hover:bg-accent-50/30 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
    >
      {/* Rank */}
      <span className="w-6 text-center text-[13px] font-bold text-ink-300 tabular-nums flex-shrink-0">{rank}</span>

      {/* Logo */}
      <Logo
        name={inv.name}
        website={inv.website}
        bg={inv.logo_bg}
        size={40}
        rounded="rounded-md"
        theme="light"
        className="flex-shrink-0"
      />

      {/* Name + type */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[14px] font-semibold text-ink-900 truncate group-hover:text-accent-600 transition-colors duration-150">
            {inv.name}
          </span>
          {inv.type && (
            <span className="hidden sm:inline text-meta px-2 py-0.5 bg-ink-100 rounded-full text-ink-500 flex-shrink-0">
              {inv.type}
            </span>
          )}
        </div>
        <div className="text-meta text-ink-400 truncate mt-0.5">
          {inv.sector_focus.slice(0, 3).join(" · ")}
        </div>
      </div>

      {/* Stage focus */}
      <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
        {inv.stage_focus.slice(0, 2).map(s => (
          <span key={s} className="text-meta px-2 py-0.5 bg-accent-50 text-accent-600 rounded-full border border-accent-100">
            {s}
          </span>
        ))}
      </div>

      {/* Portfolio count */}
      <div className="hidden lg:flex flex-col items-end flex-shrink-0 w-24">
        <span className="text-[13px] font-semibold text-ink-900">{inv.portfolio_count}</span>
        <span className="text-meta text-ink-400">portfolio co.</span>
      </div>

      {/* AUM or check size */}
      <div className="hidden xl:flex flex-col items-end flex-shrink-0 w-24">
        {aum ? (
          <>
            <span className="text-[13px] font-semibold text-ink-900">{aum}</span>
            <span className="text-meta text-ink-400">AUM</span>
          </>
        ) : check ? (
          <>
            <span className="text-[13px] font-semibold text-ink-900">{check}</span>
            <span className="text-meta text-ink-400">avg check</span>
          </>
        ) : null}
      </div>

      {/* Location */}
      <div className="hidden lg:block text-meta text-ink-400 flex-shrink-0 w-28 text-right truncate">
        {inv.location}
      </div>

      {/* Arrow */}
      <ChevronRight size={14} className="text-ink-300 group-hover:text-accent-500 group-hover:translate-x-0.5 transition-all duration-150 flex-shrink-0" />
    </Link>
  );
}

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let active = true;
    getInvestors().then(data => {
      if (!active) return;
      setInvestors(data);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  function handleLoadMore() {
    setLoadingMore(true);
    // Simulate a brief async feel — in prod this would fetch the next page
    setTimeout(() => {
      setVisibleCount(c => Math.min(c + BATCH_SIZE, investors.length));
      setLoadingMore(false);
    }, 280);
  }

  const visibleInvestors = investors.slice(0, visibleCount);
  const hasMore = visibleCount < investors.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="skeleton rounded-lg h-10 w-80 mb-4" />
          <div className="skeleton rounded-lg h-5 w-96 mb-10" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton rounded-lg h-16" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent-50 via-white to-white">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-32 w-[560px] h-[560px] rounded-full bg-accent-200/40 blur-[120px]" />
          <div className="absolute top-20 -left-32 w-[420px] h-[420px] rounded-full bg-accent-100/50 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "44px 44px" }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center min-w-0">
            <div className="animate-fade-up min-w-0">
              <div className="inline-flex items-center gap-2 bg-white text-ink-700 text-meta font-semibold px-3 py-1.5 rounded-full mb-6 ring-1 ring-ink-100 shadow-xs">
                <Sparkles size={12} className="text-accent-500" />
                6,000+ INVESTORS TRACKED
              </div>
              <h1 className="text-display text-ink-900 mb-5" style={{ fontSize: "clamp(2.25rem, 4vw + 1rem, 3.5rem)" }}>
                Discover investors<br />building the<br /><span className="text-accent-600">AI economy</span>
              </h1>
              <p className="text-[17px] text-ink-500 leading-relaxed mb-8 max-w-md">
                Find VCs, angels, operators, corporate funds and emerging managers backing the next generation of AI companies.
              </p>
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 w-full max-w-lg shadow-md ring-1 ring-ink-100">
                <Search size={17} className="text-ink-400 flex-shrink-0" />
                <input className="flex-1 w-full min-w-0 outline-none text-[15px] text-ink-800 placeholder-ink-400 bg-transparent" placeholder="Search investors, funds, firms…" aria-label="Search investors" />
                <button className="flex-shrink-0 px-4 h-9 bg-accent-500 rounded-sm flex items-center justify-center gap-1.5 text-white text-[13px] font-medium hover:bg-accent-600 transition-colors duration-150 shadow-accent whitespace-nowrap">
                  <Search size={14} className="sm:hidden" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-4">
                {["a16z", "Sequoia", "Khosla", "Y Combinator", "Lightspeed"].map(tag => (
                  <span key={tag} className="text-meta px-2.5 py-1 bg-white border border-ink-200 rounded-full text-ink-600 hover:border-accent-300 hover:text-accent-600 cursor-pointer transition-colors duration-150 shadow-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: floating investor logos */}
            <div className="hidden lg:grid grid-cols-3 gap-3">
              {investors.slice(0, 9).map((inv, i) => (
                <div key={i}
                  className="animate-float"
                  style={{ marginTop: i % 3 === 1 ? "28px" : i % 3 === 2 ? "10px" : "0px", animationDelay: `${i * 0.45}s`, "--rot": `${(i % 2 === 0 ? -1 : 1) * 2}deg` } as React.CSSProperties}>
                  <Logo name={inv.name} website={inv.website} bg={inv.logo_bg} size={72} rounded="rounded-lg" theme="light" className="shadow-md ring-1 ring-ink-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">

        {/* ============ TRENDING INVESTORS — horizontal rows ============ */}
        <section className="py-14 border-b border-ink-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-sm bg-ink-900 text-white text-meta font-semibold flex items-center justify-center flex-shrink-0 tabular-nums">1</span>
              <h2 className="text-h2 text-ink-900">Trending investors</h2>
            </div>
            <div className="flex items-center gap-1.5 text-meta text-ink-400">
              <TrendingUp size={13} />
              <span className="hidden sm:inline">Ranked by recent deal flow</span>
            </div>
          </div>

          {/* Column headers — desktop only */}
          <div className="hidden lg:grid grid-cols-[24px_40px_1fr_auto_100px_100px_112px_20px] gap-4 items-center px-4 mb-2">
            <span />
            <span />
            <span className="text-meta text-ink-400 font-medium">Investor</span>
            <span className="text-meta text-ink-400 font-medium">Stage focus</span>
            <span className="text-meta text-ink-400 font-medium text-right">Portfolio</span>
            <span className="text-meta text-ink-400 font-medium text-right">AUM</span>
            <span className="text-meta text-ink-400 font-medium text-right">Location</span>
            <span />
          </div>

          <div className="space-y-1.5">
            {visibleInvestors.map((inv, i) => (
              <InvestorRow key={inv.id} inv={inv} rank={i + 1} />
            ))}
          </div>

          {/* Load more / View less */}
          {(hasMore || visibleCount > INITIAL_COUNT) && (
            <div className="mt-5 flex items-center gap-3">
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-4 py-2.5 border border-ink-200 rounded-lg text-[14px] font-medium text-ink-700 hover:border-accent-300 hover:text-accent-600 hover:bg-accent-50/40 transition-all duration-150 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-ink-300 border-t-accent-500 animate-spin" />
                      Loading…
                    </>
                  ) : (
                    <>
                      <ChevronDown size={15} />
                      Show {Math.min(BATCH_SIZE, investors.length - visibleCount)} more
                    </>
                  )}
                </button>
              )}
              <span className="text-meta text-ink-400">
                Showing {visibleCount} of {investors.length} investors
              </span>
            </div>
          )}
        </section>

        {/* ============ INVESTOR COLLECTIONS ============ */}
        <section className="py-14 border-b border-ink-100">
          <SectionHeader num={2} title="Investor collections" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {investorCollections.map(col => (
              <Link key={col.title} href="#"
                className="group relative rounded-lg overflow-hidden h-32 flex flex-col justify-end p-4 border border-ink-100 hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 transition-all duration-150"
                style={{ background: col.bg }}>
                <col.icon size={22} className="absolute top-4 right-4 opacity-30" style={{ color: col.accent }} aria-hidden="true" />
                <div className="relative">
                  <h3 className="font-semibold text-[14px] leading-snug" style={{ color: col.text }}>{col.title}</h3>
                  <p className="text-meta mt-1" style={{ color: col.accent }}>{col.count} investors</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ============ BROWSE BY TYPE ============ */}
        <section className="py-14 border-b border-ink-100">
          <SectionHeader num={3} title="Browse by investor type" viewAll={false} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {investorTypes.map(type => (
              <Link key={type.name} href="#"
                className="flex items-center gap-3.5 p-4 border border-ink-100 rounded-lg hover:border-ink-200 hover:bg-ink-50/60 transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                <type.icon size={20} className="text-ink-500 flex-shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold text-ink-900 truncate">{type.name}</div>
                  <div className="text-meta text-ink-400">{type.count} investors</div>
                </div>
                <ChevronRight size={14} className="text-ink-300 group-hover:text-ink-500 group-hover:translate-x-0.5 transition-all duration-150 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* ============ MOST ACTIVE ============ */}
        <section className="py-14 border-b border-ink-100">
          <SectionHeader num={4} title="Most active investors" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {investors.slice(0, 4).map(inv => (
              <div key={inv.id} className="border border-ink-100 rounded-lg p-4 hover-lift bg-white">
                <div className="flex items-center gap-3 mb-3.5">
                  <Logo name={inv.name} website={inv.website} bg={inv.logo_bg} size={40} theme="light" />
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-ink-900 truncate">{inv.name}</div>
                    <div className="text-meta text-ink-400">{inv.portfolio_count} portfolio companies</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3.5">
                  {(inv.notable_portfolio || ["OpenAI", "Cursor", "Harvey"]).slice(0, 3).map(p => (
                    <span key={p} className="text-meta px-2 py-0.5 bg-ink-100 rounded-full text-ink-600">{p}</span>
                  ))}
                </div>
                <Link href={`/investors/${inv.slug}`} className="text-meta text-accent-600 font-semibold hover:text-accent-700 transition-colors duration-150">
                  View portfolio →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ============ CAPITAL THEMES ============ */}
        <section className="py-14 border-b border-ink-100">
          <SectionHeader num={5} title="Capital themes" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {capitalThemes.map(theme => (
              <Link key={theme.name} href="#"
                className="px-3.5 py-3 rounded-sm text-[13px] font-medium bg-ink-50 text-ink-700 hover:bg-ink-100 transition-colors duration-150 flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                <span className="truncate">{theme.name}</span>
                <span className="text-meta text-ink-400 flex-shrink-0 ml-2">{theme.count}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ============ CAPITAL GRAPH CTA ============ */}
        <section className="py-14">
          <div className="rounded-lg bg-gradient-to-br from-accent-50 via-white to-accent-50/30 border border-accent-100 px-7 py-8 relative overflow-hidden">
            <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-accent-200/60 blur-3xl" />
            <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-accent-100/50 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles size={13} className="text-accent-500" />
                <span className="text-accent-600 text-meta font-semibold uppercase tracking-wide">Explore the capital graph</span>
              </div>
              <h3 className="text-h2 text-ink-900 mb-2.5 max-w-md">Visualize how capital moves in the AI economy.</h3>
              <p className="text-ink-500 text-[14px] mb-7 max-w-sm leading-relaxed">Explore the relationships between investors, founders, companies, funding rounds, and products.</p>
              <div className="flex items-center gap-7 mb-7 overflow-x-auto scrollbar-hide">
                {graphNodes.map(n => (
                  <div key={n.node} className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className="w-11 h-11 rounded-full bg-white ring-1 ring-ink-200 flex items-center justify-center shadow-xs">
                      <n.icon size={18} className="text-ink-600" />
                    </div>
                    <span className="text-meta text-ink-500 whitespace-nowrap">{n.node}</span>
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-accent-500 text-white text-[14px] font-semibold rounded-sm hover:bg-accent-600 transition-colors duration-150 shadow-accent">
                Explore capital graph <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}