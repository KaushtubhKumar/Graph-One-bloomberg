"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search, ChevronRight, ArrowRight, Sparkles,
  Bot, Landmark, Sprout, Zap, Brain, Building2, Code2, HeartPulse,
  LineChart, UserCheck, BarChart3, Home, User, Briefcase, DollarSign, Package,
} from "lucide-react";
import { getInvestors } from "@/lib/api";
import type { Investor } from "@/lib/types";
import Logo from "@/components/shared/Logo";

const investorCollections = [
  { title: "Investors Backing AI Agents", count: 26, icon: Bot, bg: "#1e3a8a" },
  { title: "Investors Backing Indian AI Startups", count: 98, icon: Landmark, bg: "#9a3412" },
  { title: "Top Seed Investors", count: 274, icon: Sprout, bg: "#065f46" },
  { title: "Operator Angels", count: 178, icon: Zap, bg: "#4035c9" },
  { title: "OpenAI Alumni Investors", count: 42, icon: Brain, bg: "#292a3a" },
  { title: "Enterprise AI Investors", count: 84, icon: Building2, bg: "#1e3a5f" },
  { title: "Developer Tool Specialists", count: 92, icon: Code2, bg: "#3329a3" },
  { title: "Healthcare AI Investors", count: 88, icon: HeartPulse, bg: "#0e7490" },
];

const investorTypes = [
  { name: "Seed Investors", count: "1,248", icon: Sprout },
  { name: "Series A Investors", count: "884", icon: LineChart },
  { name: "Angel Investors", count: "2,174", icon: UserCheck },
  { name: "Corporate Venture Funds", count: "615", icon: Landmark },
  { name: "Late Stage Investors", count: "432", icon: BarChart3 },
  { name: "Family Offices", count: "198", icon: Home },
];

const capitalThemes = [
  { name: "AI Agents", count: "214" },
  { name: "AI Coding", count: "160" },
  { name: "AI Infrastructure", count: "88" },
  { name: "Developer Tools", count: "134" },
  { name: "Robotics", count: "87" },
  { name: "Healthcare AI", count: "93" },
  { name: "Defense AI", count: "41" },
  { name: "Video AI", count: "43" },
];

const graphNodes = [
  { node: "Investor", icon: User },
  { node: "Founder", icon: Briefcase },
  { node: "Company", icon: Building2 },
  { node: "Funding Round", icon: DollarSign },
  { node: "Product", icon: Package },
];

/** Branded dark gradient per investor logo_bg, matching the company-card treatment. */
function investorCardGradient(bg: string): string {
  const map: Record<string, string> = {
    "#1e40af": "linear-gradient(135deg, #3b6fe0 0%, #1e40af 55%, #102868 100%)",
    "#1e3a5f": "linear-gradient(135deg, #2563a8 0%, #1e3a5f 55%, #0f1f35 100%)",
    "#16a34a": "linear-gradient(135deg, #22c55e 0%, #16a34a 55%, #0a4d24 100%)",
    "#dc2626": "linear-gradient(135deg, #ef4444 0%, #dc2626 55%, #7f1d1d 100%)",
    "#4f46e5": "linear-gradient(135deg, #6366f1 0%, #4f46e5 55%, #2c2580 100%)",
    "#0f172a": "linear-gradient(135deg, #334155 0%, #0f172a 55%, #02060f 100%)",
    "#0078d4": "linear-gradient(135deg, #2599f5 0%, #0078d4 55%, #00386b 100%)",
    "#111827": "linear-gradient(135deg, #374151 0%, #111827 55%, #030508 100%)",
  };
  return map[bg] ?? `linear-gradient(135deg, ${bg}cc 0%, ${bg} 55%, ${bg}88 100%)`;
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

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getInvestors().then(data => {
      if (!active) return;
      setInvestors(data);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="skeleton rounded-lg h-10 w-80 mb-4" />
          <div className="skeleton rounded-lg h-5 w-96 mb-10" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton rounded-lg h-36" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-ink-900">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-accent-600/25 blur-[120px]" />
          <div className="absolute top-10 right-0 w-[380px] h-[380px] rounded-full bg-accent-500/15 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "44px 44px" }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center min-w-0">
            <div className="animate-fade-up min-w-0">
              <div className="inline-flex items-center gap-2 glass-dark text-white/90 text-meta font-semibold px-3 py-1.5 rounded-full mb-5 ring-1 ring-white/10">
                <Sparkles size={12} className="text-accent-400" />
                6,000+ INVESTORS TRACKED
              </div>
              <h1 className="text-display text-white mb-4" style={{ fontSize: "clamp(2.25rem, 4vw + 1rem, 3.5rem)" }}>
                Discover investors<br />building the<br /><span className="text-accent-400">AI economy</span>
              </h1>
              <p className="text-[16px] text-white/60 leading-relaxed mb-7 max-w-md">
                Find VCs, angels, operators, corporate funds and emerging managers backing the next generation of AI companies.
              </p>
              <div className="flex items-center gap-2 glass rounded-lg p-2 w-full max-w-lg shadow-lg ring-1 ring-white/10 mb-4">
                <Search size={17} className="text-ink-400 ml-2 flex-shrink-0" />
                <input className="flex-1 w-full min-w-0 outline-none text-[15px] text-ink-800 placeholder-ink-400 bg-transparent" placeholder="Search investors, funds, firms…" aria-label="Search investors" />
                <button className="flex-shrink-0 px-3.5 sm:px-4 h-10 bg-accent-500 rounded-sm flex items-center justify-center gap-1.5 text-white text-[14px] font-medium hover:bg-accent-600 transition-colors duration-150 shadow-accent">
                  <Search size={15} className="sm:hidden" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-meta text-white/50">Popular:</span>
                {["AI Agents", "Seed Investors", "Series A", "YC Backers", "India"].map(s => (
                  <button key={s} className="text-meta px-2.5 py-1 bg-white/10 rounded-full text-white/70 hover:bg-white/15 hover:text-white transition-colors duration-150">{s}</button>
                ))}
              </div>
            </div>

            {/* Floating investor cards */}
            <div className="hidden lg:grid grid-cols-3 gap-5" aria-hidden="true">
              {[
                { name: "a16z", website: "a16z.com", bg: "#3329a3" },
                { name: "Sequoia", website: "sequoiacap.com", bg: "#1e3a5f" },
                { name: "Lightspeed", website: "lsvp.com", bg: "#065f46" },
                { name: "Catalyst", bg: "#292a3a" },
                { name: "Khosla", website: "khoslaventures.com", bg: "#9a3412" },
                { name: "Accel", website: "accel.com", bg: "#4035c9" },
              ].map((c, i) => (
                <div key={i}
                  className="animate-float"
                  style={{ marginTop: i % 3 === 1 ? "28px" : i % 3 === 2 ? "10px" : "0px", animationDelay: `${i * 0.45}s`, "--rot": `${(i % 2 === 0 ? -1 : 1) * 2}deg` } as React.CSSProperties}>
                  <Logo name={c.name} website={c.website} bg={c.bg} size={72} rounded="rounded-lg" theme="dark" className="shadow-lg ring-1 ring-white/10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        {/* ============ TRENDING INVESTORS ============ */}
        <section className="py-14 border-b border-ink-100">
          <SectionHeader num={1} title="Trending investors" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {investors.map(inv => (
              <Link key={inv.id} href={`/investors/${inv.slug}`}
                className="group flex flex-col rounded-lg overflow-hidden border border-ink-100 hover-lift bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                <div className="h-20 relative flex items-center justify-center overflow-hidden" style={{ background: investorCardGradient(inv.logo_bg) }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20" />
                  <Logo name={inv.name} website={inv.website} bg={inv.logo_bg} size={44} theme="dark" className="relative" />
                </div>
                <div className="p-3 bg-white flex-1 flex flex-col">
                  <div className="text-[13px] font-semibold text-ink-900 mb-1.5 truncate">{inv.name}</div>
                  <div className="text-meta text-ink-400 truncate mb-2">{inv.sector_focus.slice(0, 2).join(" · ")}</div>
                  <span className="mt-auto text-meta text-accent-600 font-semibold flex items-center gap-1 group-hover:gap-1.5 transition-all duration-150">
                    View portfolio <ChevronRight size={11} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ============ INVESTOR COLLECTIONS ============ */}
        <section className="py-14 border-b border-ink-100">
          <SectionHeader num={2} title="Investor collections" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {investorCollections.map(col => (
              <Link key={col.title} href="#"
                className="group relative rounded-lg overflow-hidden h-32 flex flex-col justify-end p-4 hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                style={{ background: investorCardGradient(col.bg) }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/0" />
                <col.icon size={22} className="absolute top-4 right-4 text-white/25" aria-hidden="true" />
                <div className="relative">
                  <h3 className="text-white font-semibold text-[14px] leading-snug">{col.title}</h3>
                  <p className="text-white/60 text-meta mt-1">{col.count} investors</p>
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
                  <Logo name={inv.name} website={inv.website} bg={inv.logo_bg} size={40} />
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
          <div className="rounded-lg bg-ink-900 text-white px-7 py-8 relative overflow-hidden">
            <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-accent-500/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles size={13} className="text-accent-400" />
                <span className="text-accent-400 text-meta font-semibold uppercase tracking-wide">Explore the capital graph</span>
              </div>
              <h3 className="text-h2 text-white mb-2.5 max-w-md">Visualize how capital moves in the AI economy.</h3>
              <p className="text-white/50 text-[14px] mb-7 max-w-sm leading-relaxed">Explore the relationships between investors, founders, companies, funding rounds, and products.</p>
              <div className="flex items-center gap-7 mb-7 overflow-x-auto scrollbar-hide">
                {graphNodes.map(n => (
                  <div key={n.node} className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className="w-11 h-11 rounded-full bg-white/10 ring-1 ring-white/10 flex items-center justify-center">
                      <n.icon size={18} className="text-white/80" />
                    </div>
                    <span className="text-meta text-white/60 whitespace-nowrap">{n.node}</span>
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