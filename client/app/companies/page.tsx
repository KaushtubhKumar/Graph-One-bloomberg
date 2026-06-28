"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronRight, TrendingUp, Zap, Eye, ArrowRight } from "lucide-react";
import { getCompanies, getTrendingCompanies, getCategoriesFromCompanies } from "@/lib/api";
import type { Company } from "@/lib/types";
import CompanyCard from "@/components/companies/CompanyCard";

const tabs = ["AI Agents", "AI Coding", "AI Search", "AI Video", "AI Voice", "AI Infrastructure", "More"];
const sortOptions = ["Trending", "Funding Stage", "Country", "Team Size", "More Filters"];

function SectionHeader({ num, title, subtitle, viewAll = true }: { num: number; title: string; subtitle?: string; viewAll?: boolean }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="w-5 h-5 rounded-full bg-[#FF3B57] text-white text-xs font-bold flex items-center justify-center">{num}</span>
          <h2 className="font-bold text-gray-900 text-base">{title}</h2>
        </div>
        {subtitle && <p className="text-sm text-gray-500 ml-7">{subtitle}</p>}
      </div>
      {viewAll && <Link href="#" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">View all</Link>}
    </div>
  );
}

function MiniSparkline({ color }: { color: string }) {
  const pts = [20, 40, 30, 60, 45, 80, 70, 95];
  const w = 80, h = 30;
  const max = Math.max(...pts), min = Math.min(...pts);
  const coords = pts.map((p, i) => `${(i / (pts.length - 1)) * w},${h - ((p - min) / (max - min)) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline fill="none" stroke={color} strokeWidth="2" points={coords} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading companies…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-gray-100 bg-gradient-to-br from-white via-red-50/20 to-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-50 text-[#FF3B57] text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                AI COMPANIES
              </div>
              <h1 className="text-4xl font-black text-gray-900 leading-tight mb-3">
                Discover the world's<br />most innovative<br /><span className="text-[#FF3B57]">AI companies</span>
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm">
                Explore AI startups, unicorns, frontier labs, and emerging companies shaping the future of artificial intelligence.
              </p>
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 max-w-md shadow-sm">
                <Search size={16} className="text-gray-400" />
                <input className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400" placeholder="Search companies, categories, founders, investors..." />
                <button className="w-8 h-8 bg-[#FF3B57] rounded-lg flex items-center justify-center hover:bg-[#e0324c] transition-colors">
                  <Search size={14} className="text-white" />
                </button>
              </div>
            </div>
            {/* Floating logos decoration */}
            <div className="hidden lg:grid grid-cols-3 gap-4 relative">
              {[
                { name: "Cursor", bg: "#1a1a2e" }, { name: "OpenAI", bg: "#000" }, { name: "Perplexity", bg: "#1e3a5f" },
                { name: "Anthropic", bg: "#cc6600" }, { name: "Mistral", bg: "#f97316" }, { name: "xAI", bg: "#111" },
              ].map((c, i) => (
                <div key={i} className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${i % 3 === 1 ? "mt-6" : i % 3 === 2 ? "mt-2" : ""}`} style={{ background: c.bg }}>
                  {c.name.charAt(0)}
                </div>
              ))}
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 text-sm px-4 py-2 rounded-full font-medium transition-all ${
                  activeTab === tab
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {/* Trending AI Companies */}
        <section>
          <SectionHeader num={1} title="Trending AI Companies" subtitle="The most searched, viewed and discussed AI companies right now." />
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {trending.slice(0, 3).map((company) => (
              <CompanyCard key={company.id} company={company} rank={company.trending_rank} variant="hero" />
            ))}
            <div className="sm:col-span-1 lg:col-span-2 flex flex-col gap-3">
              {trending.slice(3).map((company) => (
                <Link key={company.id} href={`/companies/${company.slug}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: company.logo_bg }}>
                    {company.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900">{company.name}</div>
                    <div className="text-xs text-gray-500">{company.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">{company.views} views</div>
                    <div className="text-xs text-[#FF3B57]">#{company.trending_rank}</div>
                  </div>
                  <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Fastest Growing */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SectionHeader num={2} title="Fastest Growing AI Companies" subtitle="Companies showing strong momentum across key growth signals." />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {fastestGrowing.map(company => (
                  <Link key={company.id} href={`/companies/${company.slug}`}
                    className="group flex flex-col items-center p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-center">
                    <div className="w-12 h-12 rounded-xl mb-2 flex items-center justify-center text-white font-bold" style={{ background: company.logo_bg }}>
                      {company.name.charAt(0)}
                    </div>
                    <div className="text-xs font-semibold text-gray-900 mb-0.5">{company.name}</div>
                    <div className="text-xs text-gray-500 mb-2">{company.category}</div>
                    <MiniSparkline color="#FF3B57" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-gray-900 text-white p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg mb-2">Explore tomorrow's market leaders today.</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Discover categories with the highest growth potential across the AI landscape.</p>
              </div>
              <button className="mt-4 flex items-center gap-2 bg-white text-gray-900 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors w-fit">
                Explore Growth Leaders <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* Emerging Startups */}
        <section>
          <SectionHeader num={3} title="Emerging AI Startups to Watch" subtitle="Promising early-stage companies gaining real traction." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {emerging.map(company => (
              <CompanyCard key={company.id} company={company} variant="grid" />
            ))}
          </div>
        </section>

        {/* Browse by Category */}
        <section>
          <SectionHeader num={4} title="Browse by Category" subtitle="Explore companies by what they're building." />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map(cat => (
              <Link key={cat.name} href={`/companies?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center p-3 rounded-xl border border-gray-100 hover:border-[#FF3B57]/30 hover:bg-red-50/30 transition-all text-center">
                <span className="text-2xl mb-2">{cat.icon}</span>
                <div className="text-xs font-semibold text-gray-900 mb-0.5 leading-tight">{cat.name}</div>
                <div className="text-xs text-gray-400">{cat.count.toLocaleString()} companies</div>
              </Link>
            ))}
            <button className="flex flex-col items-center p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-all text-center group">
              <span className="text-2xl mb-2">›</span>
              <div className="text-xs font-semibold text-gray-500">More</div>
            </button>
          </div>
        </section>

        {/* Three columns: Breakout, Recently Funded, Startups to Watch */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-[#FF3B57]" />
                <h3 className="text-sm font-bold text-gray-900">Breakout Companies</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">Companies showing strong growth moves.</p>
              <div className="space-y-2">
                {breakout.map(c => (
                  <Link key={c.id} href={`/companies/${c.slug}`}
                    className="flex items-center gap-3 p-2.5 bg-white rounded-xl hover:shadow-sm transition-all group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: c.logo_bg }}>
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-400 truncate">{c.description.slice(0, 30)}...</div>
                    </div>
                    <ChevronRight size={12} className="text-gray-400" />
                  </Link>
                ))}
              </div>
              <Link href="#" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 mt-3 font-medium">
                View all <ChevronRight size={12} />
              </Link>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-[#FF3B57]" />
                <h3 className="text-sm font-bold text-gray-900">Recently Funded AI Startups</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">Latest funding announcements.</p>
              <div className="space-y-3">
                {recentlyFunded.map(c => (
                  <Link key={c.id} href={`/companies/${c.slug}`}
                    className="flex items-center gap-3 hover:bg-white rounded-xl p-2 transition-all group -mx-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: c.logo_bg }}>
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-400">
                        {c.total_funding_usd >= 1e9 ? `$${(c.total_funding_usd/1e9).toFixed(0)}B` : `$${(c.total_funding_usd/1e6).toFixed(0)}M`} {c.stage}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">{c.last_funding_at?.slice(0, 7)}</div>
                    <ChevronRight size={12} className="text-gray-400" />
                  </Link>
                ))}
              </div>
              <Link href="#" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 mt-3 font-medium">
                View all <ChevronRight size={12} />
              </Link>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <Eye size={14} className="text-[#FF3B57]" />
                <h3 className="text-sm font-bold text-gray-900">Startups to Watch</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">High potential companies to keep an eye on.</p>
              <div className="space-y-3">
                {watchlist.map(c => (
                  <Link key={c.id} href={`/companies/${c.slug}`}
                    className="flex items-center gap-3 hover:bg-white rounded-xl p-2 transition-all group -mx-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: c.logo_bg }}>
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-400 truncate">{c.description.slice(0, 35)}...</div>
                    </div>
                    <ChevronRight size={12} className="text-gray-400" />
                  </Link>
                ))}
              </div>
              <Link href="#" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 mt-3 font-medium">
                View all <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </section>

        {/* AI Unicorns */}
        <section>
          <SectionHeader num={5} title="AI Unicorns" subtitle="Private companies valued at $1B+." />
          <div className="border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide">
              {unicorns.map(c => (
                <Link key={c.id} href={`/companies/${c.slug}`} className="flex-shrink-0 flex flex-col items-center gap-2 group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: c.logo_bg }}>
                    {c.name.charAt(0)}
                  </div>
                  <div className="text-xs font-semibold text-gray-900 text-center">{c.name}</div>
                  <div className="text-xs text-gray-400">{c.valuation ? `$${(c.valuation/1e9).toFixed(0)}B` : "—"}</div>
                </Link>
              ))}
              <button className="flex-shrink-0 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-400 transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* Frontier AI Labs - dark section */}
        <section className="rounded-2xl bg-gray-900 text-white px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm">Frontier AI Labs</h3>
              <p className="text-gray-400 text-xs">Organizations advancing the state of the art.</p>
            </div>
            <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-white/40 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide">
            {["OpenAI", "Anthropic", "Google DeepMind", "xAI", "Meta AI", "SSI"].map(name => (
              <div key={name} className="flex-shrink-0 flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white text-sm font-bold">
                  {name.charAt(0)}
                </div>
                <span className="text-xs text-gray-400">{name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Open Source AI Leaders - dark section */}
        <section className="rounded-2xl bg-gray-800 text-white px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm">Open Source AI Leaders</h3>
              <p className="text-gray-400 text-xs">Leading the open source movement.</p>
            </div>
          </div>
          <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide">
            {[
              { name: "Hugging Face", stars: "80K" },
              { name: "Mistral AI", stars: "18K" },
              { name: "Ollama", stars: "10K" },
              { name: "Together AI", stars: "6K" },
              { name: "Databricks", stars: "12K" },
            ].map(item => (
              <div key={item.name} className="flex-shrink-0 flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white text-sm font-bold">
                  {item.name.charAt(0)}
                </div>
                <span className="text-xs text-gray-300">{item.name}</span>
                <span className="text-xs text-yellow-400">⭐ {item.stars}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Explore All Companies */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-5 h-5 rounded-full bg-[#FF3B57] text-white text-xs font-bold flex items-center justify-center">8</span>
                <h2 className="font-bold text-gray-900 text-base">Explore All Companies</h2>
              </div>
              <p className="text-sm text-gray-500 ml-7">Find, filter and discover the right companies.</p>
            </div>
            <Link href="#" className="flex items-center gap-2 px-4 py-2 bg-[#FF3B57] text-white text-sm font-semibold rounded-xl hover:bg-[#e0324c] transition-colors">
              Explore Companies
            </Link>
          </div>
          {/* Filter bar */}
          <div className="flex items-center gap-3 mb-4 overflow-x-auto scrollbar-hide">
            {sortOptions.map(opt => (
              <button key={opt} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-gray-400 transition-colors bg-white">
                {opt} <ChevronRight size={12} className="rotate-90" />
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by: Trending</span>
            </div>
          </div>
          <div className="space-y-2">
            {companies.slice(0, 6).map(company => (
              <CompanyCard key={company.id} company={company} variant="default" />
            ))}
          </div>
          <div className="text-center mt-4">
            <span className="text-xs text-gray-400">30,000+ companies</span>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="rounded-2xl bg-gray-50 border border-gray-100 px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FF3B57] flex items-center justify-center text-white font-bold flex-shrink-0">G</div>
            <div>
              <h3 className="font-bold text-gray-900">Be the first to discover what's next in AI</h3>
              <p className="text-sm text-gray-500">Join thousands of builders, investors and researchers.</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input className="flex-1 sm:w-64 text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#FF3B57]" placeholder="Enter your email" />
            <button className="px-5 py-2.5 bg-[#FF3B57] text-white text-sm font-semibold rounded-xl hover:bg-[#e0324c] transition-colors whitespace-nowrap">
              Get updates
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
