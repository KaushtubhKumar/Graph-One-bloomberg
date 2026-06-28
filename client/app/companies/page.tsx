"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronRight, TrendingUp, Zap, Eye, ArrowRight, Sparkles } from "lucide-react";
import { getCompanies, getTrendingCompanies, getCategoriesFromCompanies } from "@/lib/api";
import type { Company } from "@/lib/types";
import CompanyCard from "@/components/companies/CompanyCard";

const tabs = ["AI Agents", "AI Coding", "AI Search", "AI Video", "AI Voice", "AI Infrastructure", "More"];
const sortOptions = ["Trending", "Funding Stage", "Country", "Team Size", "More Filters"];

// Numbered markers carry real information here: these sections are a guided,
// ordered tour (trending -> growth -> emerging -> ...), not an arbitrary list,
// so the number is left as a wayfinding device rather than decoration.
function SectionHeader({ num, title, subtitle, viewAll = true }: { num: number; title: string; subtitle?: string; viewAll?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 rounded-sm bg-ink-900 text-white text-meta font-semibold flex items-center justify-center flex-shrink-0 mt-0.5 tabular-nums">{num}</span>
        <div>
          <h2 className="text-h2 text-ink-900">{title}</h2>
          {subtitle && <p className="text-[14px] text-ink-500 mt-1 max-w-xl">{subtitle}</p>}
        </div>
      </div>
      {viewAll && (
        <Link href="#" className="hidden sm:flex items-center gap-1 text-[14px] text-ink-500 hover:text-ink-900 font-medium transition-colors duration-150 flex-shrink-0">
          View all <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

function MiniSparkline() {
  const pts = [20, 40, 30, 60, 45, 80, 70, 95];
  const w = 72, h = 26;
  const max = Math.max(...pts), min = Math.min(...pts);
  const coords = pts.map((p, i) => `${(i / (pts.length - 1)) * w},${h - ((p - min) / (max - min)) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="opacity-80" aria-hidden="true">
      <polyline fill="none" stroke="var(--color-positive)" strokeWidth="2" points={coords} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CardSkeleton() {
  return <div className="skeleton rounded-lg h-44" />;
}

export default function CompaniesPage() {
  const [activeTab, setActiveTab] = useState("AI Agents");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [trendingList, setTrendingList] = useState<Company[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number; icon: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const [all, trending] = await Promise.all([getCompanies(), getTrendingCompanies()]);
      if (!active) return;
      setCompanies(all);
      setTrendingList(trending);
      setCategories(getCategoriesFromCompanies(all));
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, []);

  const unicorns = companies.filter(c => c.is_unicorn).slice(0, 5);
  const trending = trendingList.length
    ? trendingList.slice(0, 5)
    : companies.filter(c => c.trending_rank).sort((a, b) => (a.trending_rank || 99) - (b.trending_rank || 99)).slice(0, 5);
  const fastestGrowing = companies.filter(c => c.growth_score > 85).sort((a, b) => b.growth_score - a.growth_score).slice(0, 5);
  const emerging = companies.filter(c => c.founded_year >= 2022 && !c.is_unicorn).slice(0, 4);
  const breakout = companies.filter(c => c.growth_score > 80).slice(0, 3);
  const recentlyFunded = companies.filter(c => c.last_funding_at).sort((a, b) => (b.last_funding_at || "").localeCompare(a.last_funding_at || "")).slice(0, 3);
  const watchlist = companies.filter(c => c.stage === "Series B" || c.stage === "Series A").slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="skeleton rounded-lg h-10 w-80 mb-4" />
          <div className="skeleton rounded-lg h-5 w-96 mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-ink-900">
        {/* Ambient gradient + grid texture, kept quiet so it reads as atmosphere, not decoration */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-32 w-[560px] h-[560px] rounded-full bg-accent-600/30 blur-[120px]" />
          <div className="absolute top-20 -left-32 w-[420px] h-[420px] rounded-full bg-accent-500/20 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "44px 44px" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center min-w-0">
            <div className="animate-fade-up min-w-0">
              <div className="inline-flex items-center gap-2 glass-dark text-white/90 text-meta font-semibold px-3 py-1.5 rounded-full mb-6 ring-1 ring-white/10">
                <Sparkles size={12} className="text-accent-400" />
                30,000+ AI COMPANIES TRACKED
              </div>
              <h1 className="text-display text-white mb-5">
                Discover the world's<br />most innovative<br /><span className="text-accent-400">AI companies</span>
              </h1>
              <p className="text-[17px] text-white/60 leading-relaxed mb-8 max-w-md">
                Explore AI startups, unicorns, frontier labs, and emerging companies shaping the future of artificial intelligence.
              </p>

              {/* Search */}
              <div className="flex items-center gap-2 glass rounded-lg p-2 w-full max-w-lg shadow-lg ring-1 ring-white/10">
                <Search size={18} className="text-ink-400 ml-2 flex-shrink-0" />
                <input
                  className="flex-1 w-full min-w-0 outline-none text-[15px] text-ink-800 placeholder-ink-400 bg-transparent"
                  placeholder="Search companies, categories…"
                  aria-label="Search AI companies"
                />
                <button className="flex-shrink-0 px-3.5 sm:px-4 h-10 bg-accent-500 rounded-sm flex items-center justify-center gap-1.5 text-white text-[14px] font-medium hover:bg-accent-600 transition-colors duration-150 shadow-accent">
                  <Search size={15} className="sm:hidden" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>

            {/* Floating logo cards — glassmorphism, staggered float animation */}
            <div className="hidden lg:grid grid-cols-3 gap-5 relative" aria-hidden="true">
              {[
                { name: "Cursor", bg: "#312e81" }, { name: "OpenAI", bg: "#18181b" }, { name: "Perplexity", bg: "#1e3a5f" },
                { name: "Anthropic", bg: "#92400e" }, { name: "Mistral", bg: "#c2410c" }, { name: "xAI", bg: "#27272a" },
              ].map((c, i) => (
                <div
                  key={i}
                  className="animate-float w-[72px] h-[72px] rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-1 ring-white/10"
                  style={{
                    background: c.bg,
                    marginTop: i % 3 === 1 ? "28px" : i % 3 === 2 ? "10px" : "0px",
                    animationDelay: `${i * 0.45}s`,
                    "--rot": `${(i % 2 === 0 ? -1 : 1) * 2}deg`,
                  } as React.CSSProperties}
                >
                  {c.name.charAt(0)}
                </div>
              ))}
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-2 mt-10 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 text-[14px] px-4 py-2 rounded-full font-medium transition-all duration-150 ${
                  activeTab === tab
                    ? "bg-white text-ink-900 shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        {/* ============ TRENDING ============ */}
        <section className="py-14 border-b border-ink-100">
          <SectionHeader num={1} title="Trending AI companies" subtitle="The most searched, viewed and discussed AI companies right now." />
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {trending.slice(0, 3).map((company) => (
              <CompanyCard key={company.id} company={company} rank={company.trending_rank} variant="hero" />
            ))}
            <div className="sm:col-span-1 lg:col-span-2 flex flex-col gap-2.5">
              {trending.slice(3).map((company) => (
                <Link key={company.id} href={`/companies/${company.slug}`}
                  className="flex items-center gap-3 p-3 bg-ink-50 rounded-lg hover:bg-ink-100 transition-colors duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                  <div className="w-10 h-10 rounded-sm flex items-center justify-center text-white text-[15px] font-bold flex-shrink-0" style={{ background: company.logo_bg }}>
                    {company.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-ink-900 truncate">{company.name}</div>
                    <div className="text-meta text-ink-500">{company.category}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-meta text-ink-400">{company.views} views</div>
                    <div className="text-meta text-accent-600 font-semibold">#{company.trending_rank}</div>
                  </div>
                  <ChevronRight size={15} className="text-ink-300 group-hover:translate-x-0.5 group-hover:text-ink-500 transition-all duration-150 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============ GROWTH LEADERS ============ */}
        <section className="py-14 border-b border-ink-100">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <SectionHeader num={2} title="Fastest-growing AI companies" subtitle="Companies showing strong momentum across key growth signals." viewAll={false} />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {fastestGrowing.map(company => (
                  <Link key={company.id} href={`/companies/${company.slug}`}
                    className="group flex flex-col items-center p-4 rounded-lg border border-ink-100 hover-lift text-center bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                    <div className="w-12 h-12 rounded-sm mb-3 flex items-center justify-center text-white font-bold" style={{ background: company.logo_bg }}>
                      {company.name.charAt(0)}
                    </div>
                    <div className="text-[13px] font-semibold text-ink-900 mb-0.5 truncate w-full">{company.name}</div>
                    <div className="text-meta text-ink-500 mb-2 truncate w-full">{company.category}</div>
                    <MiniSparkline />
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-ink-900 text-white p-7 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-accent-500/20 blur-2xl" />
              <div className="relative">
                <h3 className="text-h2 text-white mb-2.5">Explore tomorrow's market leaders today.</h3>
                <p className="text-white/60 text-[14px] leading-relaxed">Discover categories with the highest growth potential across the AI landscape.</p>
              </div>
              <button className="relative mt-5 flex items-center gap-2 bg-white text-ink-900 text-[14px] font-semibold px-4 py-2.5 rounded-sm hover:bg-ink-50 transition-colors duration-150 w-fit">
                Explore growth leaders <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* ============ EMERGING ============ */}
        <section className="py-14 border-b border-ink-100">
          <SectionHeader num={3} title="Emerging AI startups to watch" subtitle="Promising early-stage companies gaining real traction." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {emerging.map(company => (
              <CompanyCard key={company.id} company={company} variant="grid" />
            ))}
          </div>
        </section>

        {/* ============ CATEGORIES ============ */}
        <section className="py-14 border-b border-ink-100">
          <SectionHeader num={4} title="Browse by category" subtitle="Explore companies by what they're building." viewAll={false} />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map(cat => (
              <Link key={cat.name} href={`/companies?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center p-4 rounded-lg border border-ink-100 hover:border-accent-200 hover:bg-accent-50/40 transition-all duration-150 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                <span className="text-2xl mb-2.5" aria-hidden="true">{cat.icon}</span>
                <div className="text-[13px] font-semibold text-ink-900 mb-0.5 leading-tight">{cat.name}</div>
                <div className="text-meta text-ink-400">{cat.count.toLocaleString()} {cat.count === 1 ? "company" : "companies"}</div>
              </Link>
            ))}
            <Link href="/companies" className="flex flex-col items-center justify-center p-4 rounded-lg border border-dashed border-ink-200 hover:border-ink-300 transition-colors duration-150 text-center group">
              <ChevronRight size={18} className="text-ink-400 mb-2.5 group-hover:translate-x-0.5 transition-transform duration-150" />
              <div className="text-[13px] font-semibold text-ink-500">More</div>
            </Link>
          </div>
        </section>

        {/* ============ FEATURED: 3-column signal panels ============ */}
        <section className="py-14 border-b border-ink-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-ink-25 border border-ink-100 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-1.5">
                <Zap size={15} className="text-accent-500" />
                <h3 className="text-[15px] font-bold text-ink-900">Breakout companies</h3>
              </div>
              <p className="text-meta text-ink-500 mb-5">Companies showing strong growth moves.</p>
              <div className="space-y-1.5">
                {breakout.map(c => (
                  <Link key={c.id} href={`/companies/${c.slug}`}
                    className="flex items-center gap-3 p-2.5 bg-white rounded-sm hover:shadow-xs transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                    <div className="w-9 h-9 rounded-sm flex items-center justify-center text-white text-meta font-bold flex-shrink-0" style={{ background: c.logo_bg }}>
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-ink-900 truncate">{c.name}</div>
                      <div className="text-meta text-ink-400 truncate">{c.description.slice(0, 30)}...</div>
                    </div>
                    <ChevronRight size={13} className="text-ink-300 flex-shrink-0" />
                  </Link>
                ))}
              </div>
              <Link href="#" className="flex items-center gap-1 text-meta text-ink-500 hover:text-ink-900 mt-4 font-medium transition-colors duration-150">
                View all <ChevronRight size={12} />
              </Link>
            </div>

            <div className="bg-ink-25 border border-ink-100 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp size={15} className="text-positive" />
                <h3 className="text-[15px] font-bold text-ink-900">Recently funded</h3>
              </div>
              <p className="text-meta text-ink-500 mb-5">Latest funding announcements.</p>
              <div className="space-y-1">
                {recentlyFunded.map(c => (
                  <Link key={c.id} href={`/companies/${c.slug}`}
                    className="flex items-center gap-3 hover:bg-white rounded-sm p-2.5 -mx-1 transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                    <div className="w-9 h-9 rounded-sm flex items-center justify-center text-white text-meta font-bold flex-shrink-0" style={{ background: c.logo_bg }}>
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-ink-900 truncate">{c.name}</div>
                      <div className="text-meta text-positive font-medium">
                        {c.total_funding_usd >= 1e9 ? `$${(c.total_funding_usd/1e9).toFixed(0)}B` : `$${(c.total_funding_usd/1e6).toFixed(0)}M`} {c.stage}
                      </div>
                    </div>
                    <div className="text-meta text-ink-400 flex-shrink-0">{c.last_funding_at?.slice(0, 7)}</div>
                  </Link>
                ))}
              </div>
              <Link href="#" className="flex items-center gap-1 text-meta text-ink-500 hover:text-ink-900 mt-4 font-medium transition-colors duration-150">
                View all <ChevronRight size={12} />
              </Link>
            </div>

            <div className="bg-ink-25 border border-ink-100 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-1.5">
                <Eye size={15} className="text-info" />
                <h3 className="text-[15px] font-bold text-ink-900">Startups to watch</h3>
              </div>
              <p className="text-meta text-ink-500 mb-5">High potential companies to keep an eye on.</p>
              <div className="space-y-1">
                {watchlist.map(c => (
                  <Link key={c.id} href={`/companies/${c.slug}`}
                    className="flex items-center gap-3 hover:bg-white rounded-sm p-2.5 -mx-1 transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                    <div className="w-9 h-9 rounded-sm flex items-center justify-center text-white text-meta font-bold flex-shrink-0" style={{ background: c.logo_bg }}>
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-ink-900 truncate">{c.name}</div>
                      <div className="text-meta text-ink-400 truncate">{c.description.slice(0, 35)}...</div>
                    </div>
                    <ChevronRight size={13} className="text-ink-300 flex-shrink-0" />
                  </Link>
                ))}
              </div>
              <Link href="#" className="flex items-center gap-1 text-meta text-ink-500 hover:text-ink-900 mt-4 font-medium transition-colors duration-150">
                View all <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </section>

        {/* ============ UNICORNS ============ */}
        <section className="py-14 border-b border-ink-100">
          <SectionHeader num={5} title="AI unicorns" subtitle="Private companies valued at $1B+." viewAll={false} />
          <div className="border border-ink-100 rounded-lg p-6 bg-white">
            <div className="flex items-center gap-9 overflow-x-auto scrollbar-hide">
              {unicorns.map(c => (
                <Link key={c.id} href={`/companies/${c.slug}`} className="flex-shrink-0 flex flex-col items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-sm">
                  <div className="w-[52px] h-[52px] rounded-sm flex items-center justify-center text-white font-bold transition-transform duration-220 ease-out group-hover:scale-105" style={{ background: c.logo_bg }}>
                    {c.name.charAt(0)}
                  </div>
                  <div className="text-[13px] font-semibold text-ink-900 text-center">{c.name}</div>
                  <div className="text-meta text-positive font-medium">{c.valuation ? `$${(c.valuation/1e9).toFixed(0)}B` : "—"}</div>
                </Link>
              ))}
              <button className="flex-shrink-0 w-9 h-9 rounded-full border border-ink-200 flex items-center justify-center text-ink-400 hover:border-ink-400 hover:text-ink-700 transition-colors duration-150" aria-label="See more unicorns">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* ============ FRONTIER LABS (dark, distinct rhythm) ============ */}
        <section className="py-14 border-b border-ink-100">
          <div className="rounded-lg bg-ink-900 text-white px-7 py-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-[15px] font-bold text-white">Frontier AI labs</h3>
                <p className="text-white/50 text-meta mt-0.5">Organizations advancing the state of the art.</p>
              </div>
              <button className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-white/30 hover:bg-white/5 transition-colors duration-150" aria-label="See more labs">
                <ChevronRight size={15} />
              </button>
            </div>
            <div className="flex items-center gap-9 overflow-x-auto scrollbar-hide">
              {["OpenAI", "Anthropic", "Google DeepMind", "xAI", "Meta AI", "SSI"].map(name => (
                <div key={name} className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div className="w-11 h-11 rounded-sm bg-white/10 ring-1 ring-white/10 flex items-center justify-center text-white text-[15px] font-bold">
                    {name.charAt(0)}
                  </div>
                  <span className="text-meta text-white/60">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ OPEN SOURCE ============ */}
        <section className="py-14 border-b border-ink-100">
          <div className="rounded-lg bg-ink-850 text-white px-7 py-7">
            <div className="mb-6">
              <h3 className="text-[15px] font-bold text-white">Open source AI leaders</h3>
              <p className="text-white/50 text-meta mt-0.5">Leading the open source movement.</p>
            </div>
            <div className="flex items-center gap-9 overflow-x-auto scrollbar-hide">
              {[
                { name: "Hugging Face", stars: "80K" },
                { name: "Mistral AI", stars: "18K" },
                { name: "Ollama", stars: "10K" },
                { name: "Together AI", stars: "6K" },
                { name: "Databricks", stars: "12K" },
              ].map(item => (
                <div key={item.name} className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div className="w-11 h-11 rounded-sm bg-white/10 ring-1 ring-white/10 flex items-center justify-center text-white text-[15px] font-bold">
                    {item.name.charAt(0)}
                  </div>
                  <span className="text-meta text-white/70">{item.name}</span>
                  <span className="text-meta text-accent-400 font-medium tabular-nums">★ {item.stars}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ EXPLORE ALL ============ */}
        <section className="py-14 border-b border-ink-100">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-sm bg-ink-900 text-white text-meta font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">8</span>
              <div>
                <h2 className="text-h2 text-ink-900">Explore all companies</h2>
                <p className="text-[14px] text-ink-500 mt-1">Find, filter and discover the right companies.</p>
              </div>
            </div>
            <Link href="#" className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-accent-500 text-white text-[14px] font-semibold rounded-sm hover:bg-accent-600 transition-colors duration-150 shadow-accent">
              Explore companies
            </Link>
          </div>
          {/* Filter bar */}
          <div className="flex items-center gap-2.5 mb-5 overflow-x-auto scrollbar-hide">
            {sortOptions.map(opt => (
              <button key={opt} className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 border border-ink-200 rounded-sm text-[13px] text-ink-600 hover:border-ink-400 hover:bg-ink-50 transition-colors duration-150 bg-white">
                {opt} <ChevronRight size={12} className="rotate-90" />
              </button>
            ))}
            <div className="ml-auto text-meta text-ink-500 flex-shrink-0">Sort by: Trending</div>
          </div>
          <div className="space-y-2">
            {companies.slice(0, 6).map(company => (
              <CompanyCard key={company.id} company={company} variant="default" />
            ))}
          </div>
          <div className="text-center mt-6">
            <span className="text-meta text-ink-400">30,000+ companies</span>
          </div>
        </section>

        {/* ============ NEWSLETTER ============ */}
        <section className="py-14">
          <div className="rounded-lg bg-ink-25 border border-ink-100 px-5 sm:px-8 py-9 flex flex-col sm:flex-row items-center justify-between gap-7">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-11 h-11 rounded-sm bg-accent-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-accent">G</div>
              <div className="min-w-0">
                <h3 className="text-[16px] font-bold text-ink-900">Be the first to discover what's next in AI</h3>
                <p className="text-[14px] text-ink-500 mt-0.5">Join thousands of builders, investors and researchers.</p>
              </div>
            </div>
            <form className="flex gap-2 w-full sm:w-auto min-w-0" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                required
                aria-label="Email address"
                className="flex-1 min-w-0 sm:w-64 text-[14px] border border-ink-200 rounded-sm px-4 h-11 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all duration-150 bg-white"
                placeholder="Enter your email"
              />
              <button className="flex-shrink-0 px-5 h-11 bg-ink-900 text-white text-[14px] font-semibold rounded-sm hover:bg-ink-800 transition-colors duration-150 whitespace-nowrap">
                Get updates
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
