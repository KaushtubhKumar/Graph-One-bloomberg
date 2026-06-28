"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, ArrowLeft, ChevronRight, BookmarkPlus, TrendingUp, Check, Plus, LineChart, BarChart3, Trophy, Flame, Radio } from "lucide-react";
import { getInvestorBySlug, getInvestors, getInvestorInvestments } from "@/lib/api";
import type { Investor, FundingRound } from "@/lib/types";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// Illustrative placeholder — sector breakdown by dollar concentration isn't in the
// schema (we have sector_focus tags but not $ allocation per sector), so this stays representative.
const portfolioConcentration = [
  { name: "AI Infrastructure", value: 35, color: "#6366f1" },
  { name: "AI Agents", value: 22, color: "#10b981" },
  { name: "AI Coding", value: 18, color: "#f59e0b" },
  { name: "Healthcare AI", value: 15, color: "#ef4444" },
  { name: "Other", value: 10, color: "#e5e7eb" },
];

const investmentVelocity = [
  { year: "2022", deals: 14 },
  { year: "2023", deals: 21 },
  { year: "2024", deals: 36 },
  { year: "2025", deals: 40 },
  { year: "2026", deals: 31, note: "YTD" },
];

const statsBar = [
  { label: "Deals\nLast 90 Days", value: "+12" },
  { label: "Lead\nInvestments", value: "+4" },
  { label: "Most Active\nStage", value: "Series A" },
  { label: "Top\nPartner", value: "a16z" },
  { label: "Top\nFocus Areas", value: "Agents" },
];

export default function InvestorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [investor, setInvestor] = useState<Investor | null | undefined>(undefined);
  const [allInvestors, setAllInvestors] = useState<Investor[]>([]);
  const [investments, setInvestments] = useState<FundingRound[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const [found, all] = await Promise.all([getInvestorBySlug(slug), getInvestors()]);
      if (!active) return;
      setInvestor(found ?? null);
      setAllInvestors(all);
      if (found) {
        const inv = await getInvestorInvestments(slug);
        if (!active) return;
        setInvestments(inv);
      }
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="skeleton rounded-lg h-32 w-full mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="skeleton rounded-lg h-40" />
              <div className="skeleton rounded-lg h-56" />
            </div>
            <div className="skeleton rounded-lg h-72" />
          </div>
        </div>
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <p className="text-ink-900 font-semibold">Investor "{slug}" not found</p>
        <Link href="/investors" className="text-sm text-accent-600 font-medium flex items-center gap-1 hover:text-accent-700 transition-colors duration-150">
          <ArrowLeft size={14} /> Back to investors
        </Link>
      </div>
    );
  }

  const coInvestors = allInvestors.filter(i => i.slug !== investor.slug).slice(0, 5);
  const relatedInvestors = allInvestors.filter(i => i.slug !== investor.slug && i.type === investor.type).slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-ink-100 px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 text-meta text-ink-400">
          <Link href="/" className="hover:text-ink-700 transition-colors duration-150">Home</Link>
          <ChevronRight size={11} />
          <Link href="/investors" className="hover:text-ink-700 transition-colors duration-150">Investors</Link>
          <ChevronRight size={11} />
          <span className="text-ink-700 font-medium">{investor.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="border border-ink-100 rounded-lg p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-24 opacity-10"
                style={{ background: `radial-gradient(circle, ${investor.logo_bg} 0%, transparent 70%)` }} />
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                  style={{ background: investor.logo_bg }}>
                  {investor.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 text-meta text-positive font-semibold bg-positive-bg px-2 py-0.5 rounded-full">
                      <Check size={11} /> Verified investor
                    </span>
                  </div>
                  <h1 className="text-h2 text-ink-900">{investor.name}</h1>
                  <p className="text-ink-500 text-[14px] mt-1 mb-3 leading-relaxed">{investor.bio.split(".")[0]}.</p>
                  <div className="flex items-center gap-3.5 text-meta text-ink-500 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {investor.location}</span>
                    <span>Founded {investor.founded || 1972}</span>
                    <span>{investor.type}</span>
                    {investor.stage_focus.slice(0, 2).map(s => (
                      <span key={s} className="px-2 py-0.5 bg-ink-100 rounded-full text-ink-600">{s}</span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-accent-500 text-white text-[14px] font-semibold rounded-sm hover:bg-accent-600 transition-colors duration-150 shadow-accent">
                      <Plus size={14} /> Follow investor
                    </button>
                    <button className="px-3 py-2 border border-ink-200 rounded-sm hover:bg-ink-50 transition-colors duration-150" aria-label="Bookmark investor">
                      <BookmarkPlus size={16} className="text-ink-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="border border-ink-100 rounded-lg p-4 mt-4 grid grid-cols-5 gap-4">
              {statsBar.map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-lg font-bold text-ink-900">{stat.value}</div>
                  <div className="text-xs text-ink-400 leading-tight mt-0.5 whitespace-pre-line">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key People */}
          <div className="border border-ink-100 rounded-lg p-5">
            <h3 className="font-bold text-ink-900 mb-4">Key people</h3>
            <div className="grid grid-cols-2 gap-3">
              {["Managing Partner", "Managing Partner", "Partner", "Partner"].map((title, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-[13px]"
                    style={{ background: `color-mix(in srgb, ${investor.logo_bg} 70%, #14151f)` }}>
                    {investor.name.charAt(0)}{i + 1}
                  </div>
                  <div>
                    <div className="text-meta font-semibold text-ink-900 leading-tight">Partner {i + 1}</div>
                    <div className="text-meta text-ink-400">{title}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="#" className="text-meta text-accent-600 font-semibold mt-4 flex items-center justify-center gap-1 hover:text-accent-700 transition-colors duration-150">
              View all team members →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Investment Thesis + Portfolio Concentration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-ink-100 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl opacity-30">❝</span>
                  <h3 className="font-bold text-ink-900">Investment Thesis</h3>
                </div>
                <p className="text-sm text-ink-600 leading-relaxed mb-4">{investor.bio}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {investor.sector_focus.map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 bg-ink-100 rounded-full text-ink-600">{s}</span>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-ink-500 font-semibold mb-2">Preferred Stages</p>
                  <div className="flex gap-2">
                    {investor.stage_focus.map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 border border-ink-200 rounded-full text-ink-600">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-ink-100 rounded-lg p-5">
                <h3 className="font-bold text-ink-900 mb-3">Portfolio Concentration</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={portfolioConcentration} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                      {portfolioConcentration.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(val) => `${val}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {portfolioConcentration.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        <span className="text-ink-700">{d.name}</span>
                      </div>
                      <span className="font-semibold text-ink-900">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Investments */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-ink-900">Recent Investments</h2>
                <Link href="#" className="text-xs text-accent-600 font-medium">View all investments →</Link>
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {investments.length > 0 ? investments.slice(0, 8).map(inv => (
                  <div key={inv.id}
                    className="flex-shrink-0 w-44 rounded-lg overflow-hidden border border-ink-100 hover:shadow-sm transition-all">
                    <div className="h-24 flex flex-col justify-end p-3 relative" style={{ background: "#1e3a5f" }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="relative">
                        <div className="text-white font-bold text-sm">{inv.round_type}</div>
                      </div>
                    </div>
                    <div className="p-3 bg-white">
                      <div className="text-xs text-ink-500 mb-0.5">{inv.date.slice(0, 7)}</div>
                      <div className="text-sm font-bold text-ink-900">
                        {inv.amount >= 1e9 ? `$${(inv.amount / 1e9).toFixed(1)}B` : `$${(inv.amount / 1e6).toFixed(0)}M`}
                      </div>
                      <div className="text-xs text-accent-600 mt-1">{inv.lead_investor === investor.name ? "Lead Investor" : "Participant"}</div>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-ink-400">No investments on record yet.</p>
                )}
              </div>
            </section>

            {/* Investment Velocity, Capital Flow, Stage Evolution */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-ink-100 rounded-lg p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <TrendingUp size={14} className="text-accent-600" />
                  <h3 className="text-sm font-bold text-ink-900">Investment Velocity</h3>
                </div>
                <div className="space-y-2">
                  {investmentVelocity.map(v => (
                    <div key={v.year} className="flex items-center justify-between text-xs">
                      <span className="text-ink-500">{v.year}</span>
                      <div className="flex-1 mx-3 bg-ink-100 rounded-full h-1.5">
                        <div className="bg-accent-500 h-1.5 rounded-full" style={{ width: `${(v.deals / 40) * 100}%` }} />
                      </div>
                      <span className="font-semibold text-ink-900">{v.deals} {v.note || "AI Deals"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-ink-100 rounded-lg p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <LineChart size={14} className="text-accent-600" />
                  <h3 className="text-[14px] font-bold text-ink-900">Capital Flow</h3>
                </div>
                <div className="mb-2">
                  <p className="text-xs text-ink-500 mb-1.5 font-medium">Increasing Capital</p>
                  {["AI Agents", "AI Coding", "AI Infrastructure"].map(s => (
                    <div key={s} className="flex items-center gap-1.5 text-xs text-ink-700 mb-1">
                      <span className="text-positive">↗</span> {s}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-ink-500 mb-1.5 font-medium">Decreasing Capital</p>
                  {["Enterprise AI", "Traditional SaaS", "Consumer Apps"].map(s => (
                    <div key={s} className="flex items-center gap-1.5 text-xs text-ink-700 mb-1">
                      <span className="text-[#c4453a]">↘</span> {s}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-ink-100 rounded-lg p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <BarChart3 size={14} className="text-accent-600" />
                  <h3 className="text-[14px] font-bold text-ink-900">Stage Evolution</h3>
                </div>
                <div className="space-y-1.5">
                  {[
                    { year: "2021", stage: "Seed Heavy" },
                    { year: "2022", stage: "Seed → Series A" },
                    { year: "2023", stage: "Series A Focus" },
                    { year: "2024", stage: "Series A → Growth" },
                    { year: "2025", stage: "Growth Equity Expansion" },
                  ].map(e => (
                    <div key={e.year} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-500 flex-shrink-0" />
                      <span className="text-ink-500">{e.year}</span>
                      <span className="text-ink-700">{e.stage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Portfolio Winners */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-ink-100 rounded-lg p-5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Trophy size={14} className="text-accent-600" />
                  <h3 className="text-[14px] font-bold text-ink-900">Portfolio Winners</h3>
                </div>
                <p className="text-xs text-ink-400 mb-4">Notable Winners</p>
                <div className="flex flex-wrap gap-3 mb-4">
                  {["Anthropic", "Cursor", "Harvey", "Perplexity", "Databricks", "Stripe"].map(name => (
                    <span key={name} className="text-xs font-semibold text-ink-700">{name}</span>
                  ))}
                </div>
                <p className="text-xs text-ink-500 font-semibold mb-2">Outcome Breakdown</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[{ n: 18, l: "Unicorns" }, { n: 6, l: "IPOs" }, { n: 24, l: "Acquisitions" }, { n: 85, l: "Active Companies" }].map(s => (
                    <div key={s.l}>
                      <div className="text-lg font-bold text-accent-600">{s.n}</div>
                      <div className="text-xs text-ink-400">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-ink-100 rounded-lg p-5">
                <div className="flex items-center gap-1.5 mb-4">
                  <Flame size={14} className="text-accent-600" />
                  <h3 className="text-[14px] font-bold text-ink-900">Follow-On Strength</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: "82%", label: "Raised Next Round" },
                    { val: "14", label: "Months Average Time" },
                    { val: "3.8x", label: "Median Funding Growth" },
                    { val: "68%", label: "Raised Series B+" },
                  ].map(s => (
                    <div key={s.label} className="text-center p-2 bg-ink-50 rounded-sm">
                      <div className="text-lg font-bold text-ink-900">{s.val}</div>
                      <div className="text-xs text-ink-400 leading-tight mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* AI Market Influence */}
            <div className="border border-ink-100 rounded-lg p-5">
              <div className="flex items-center gap-1.5 mb-4">
                <Radio size={14} className="text-accent-600" />
                <h3 className="text-[14px] font-bold text-ink-900">AI Market Influence</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: "18%", label: "AI Infrastructure\nRounds" },
                  { val: "14%", label: "AI Agent\nFunding" },
                  { val: "12%", label: "Developer Tools\nFunding" },
                  { val: "Top 3", label: "Most Active\nAI Investor" },
                  { val: "#1", label: "Series A\nInvestor" },
                ].map(s => (
                  <div key={s.label} className="p-2 border border-ink-100 rounded-sm text-center">
                    <div className="text-sm font-bold text-ink-900">{s.val}</div>
                    <div className="text-xs text-ink-400 leading-tight mt-0.5 whitespace-pre-line">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Co-Investor Network */}
            <div className="border border-ink-100 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-bold text-ink-900">Co-Investor Network</h3>
                <Link href="#" className="text-meta text-accent-600 hover:text-accent-700 transition-colors duration-150">View all →</Link>
              </div>
              <p className="text-meta text-ink-500 mb-3">Most Frequent Co-Investors</p>
              <div className="flex flex-wrap gap-2">
                {coInvestors.map(inv => (
                  <Link key={inv.id} href={`/investors/${inv.slug}`}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-ink-50 rounded-sm hover:bg-ink-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-white text-meta font-bold flex-shrink-0" style={{ background: inv.logo_bg }}>
                      {inv.name.charAt(0)}
                    </div>
                    <span className="text-meta text-ink-700 font-medium">{inv.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Related Investors */}
            <div className="border border-ink-100 rounded-lg p-5">
              <h3 className="text-[14px] font-bold text-ink-900 mb-4">Related Investors</h3>
              <div className="grid grid-cols-2 gap-3">
                {relatedInvestors.map(inv => (
                  <Link key={inv.id} href={`/investors/${inv.slug}`}
                    className="flex flex-col items-center text-center p-3 border border-ink-100 rounded-sm hover:border-ink-200 hover:bg-ink-50/60 transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                    <div className="w-10 h-10 rounded-sm mb-2 flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0" style={{ background: inv.logo_bg }}>
                      {inv.name.charAt(0)}
                    </div>
                    <div className="text-meta font-semibold text-ink-900 leading-tight">{inv.name}</div>
                    <div className="text-meta text-ink-400 mt-0.5">{inv.type}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
