"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, ArrowLeft, ChevronRight, BookmarkPlus, TrendingUp } from "lucide-react";
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
  { label: "Deals\nLast 90 Days", value: "+12", icon: "📈" },
  { label: "Lead\nInvestments", value: "+4", icon: "🎯" },
  { label: "Most Active\nStage", value: "Series A", icon: "📊" },
  { label: "Top\nPartner", value: "a16z", icon: "🤝" },
  { label: "Top\nFocus Areas", value: "Agents", icon: "🤖" },
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading investor…</p>
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <p className="text-gray-900 font-semibold">Investor "{slug}" not found</p>
        <Link href="/investors" className="text-sm text-[#FF3B57] font-medium flex items-center gap-1">
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
      <div className="border-b border-gray-100 px-6 py-2 bg-gray-50 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <ChevronRight size={12} />
          <Link href="/investors" className="hover:text-gray-900">Investors</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 font-medium">{investor.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="border border-gray-100 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-24 opacity-10"
                style={{ background: `radial-gradient(circle, ${investor.logo_bg} 0%, transparent 70%)` }} />
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0"
                  style={{ background: investor.logo_bg }}>
                  {investor.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">✓ Verified Investor</span>
                  </div>
                  <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    {investor.name} <span className="text-blue-500 text-lg">✓</span>
                  </h1>
                  <p className="text-gray-500 text-sm mt-1 mb-3">{investor.bio.split(".")[0]}.</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {investor.location}</span>
                    <span>Founded {investor.founded || 1972}</span>
                    <span>{investor.type}</span>
                    {investor.stage_focus.slice(0, 2).map(s => (
                      <span key={s} className="px-2 py-0.5 bg-gray-100 rounded-full">{s}</span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#FF3B57] text-white text-sm font-semibold rounded-xl hover:bg-[#e0324c] transition-colors">
                      + Follow Investor
                    </button>
                    <button className="px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <BookmarkPlus size={16} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="border border-gray-100 rounded-2xl p-4 mt-4 grid grid-cols-5 gap-4">
              {statsBar.map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-lg font-black text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-400 leading-tight mt-0.5 whitespace-pre-line">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key People */}
          <div className="border border-gray-100 rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">Key people</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Roelof Botha", title: "Managing Partner", img: "https://i.pravatar.cc/100?img=11" },
                { name: "Pat Grady", title: "Managing Partner", img: "https://i.pravatar.cc/100?img=12" },
                { name: "Doug Leone", title: "Managing Partner", img: "https://i.pravatar.cc/100?img=13" },
                { name: "Alfred Lin", title: "Partner", img: "https://i.pravatar.cc/100?img=14" },
              ].map(person => (
                <div key={person.name} className="flex flex-col items-center text-center gap-2">
                  <img src={person.img} alt={person.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="text-xs font-semibold text-gray-900 leading-tight">{person.name}</div>
                    <div className="text-xs text-gray-400">{person.title}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="#" className="text-xs text-[#FF3B57] font-semibold mt-4 flex items-center justify-center gap-1 hover:underline">
              View all team members →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Investment Thesis + Portfolio Concentration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl opacity-30">❝</span>
                  <h3 className="font-bold text-gray-900">Investment Thesis</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{investor.bio}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {investor.sector_focus.map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{s}</span>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-2">Preferred Stages</p>
                  <div className="flex gap-2">
                    {investor.stage_focus.map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 border border-gray-200 rounded-full text-gray-600">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-gray-100 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 mb-3">Portfolio Concentration</h3>
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
                        <span className="text-gray-700">{d.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Investments */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Recent Investments</h2>
                <Link href="#" className="text-xs text-[#FF3B57] font-medium">View all investments →</Link>
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {investments.length > 0 ? investments.slice(0, 8).map(inv => (
                  <div key={inv.id}
                    className="flex-shrink-0 w-44 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-sm transition-all">
                    <div className="h-24 flex flex-col justify-end p-3 relative" style={{ background: "#1e3a5f" }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="relative">
                        <div className="text-white font-bold text-sm">{inv.round_type}</div>
                      </div>
                    </div>
                    <div className="p-3 bg-white">
                      <div className="text-xs text-gray-500 mb-0.5">{inv.date.slice(0, 7)}</div>
                      <div className="text-sm font-bold text-gray-900">
                        {inv.amount >= 1e9 ? `$${(inv.amount / 1e9).toFixed(1)}B` : `$${(inv.amount / 1e6).toFixed(0)}M`}
                      </div>
                      <div className="text-xs text-[#FF3B57] mt-1">{inv.lead_investor === investor.name ? "Lead Investor" : "Participant"}</div>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-gray-400">No investments on record yet.</p>
                )}
              </div>
            </section>

            {/* Investment Velocity, Capital Flow, Stage Evolution */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <TrendingUp size={14} className="text-[#FF3B57]" />
                  <h3 className="text-sm font-bold text-gray-900">Investment Velocity</h3>
                </div>
                <div className="space-y-2">
                  {investmentVelocity.map(v => (
                    <div key={v.year} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{v.year}</span>
                      <div className="flex-1 mx-3 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-[#FF3B57] h-1.5 rounded-full" style={{ width: `${(v.deals / 40) * 100}%` }} />
                      </div>
                      <span className="font-semibold text-gray-900">{v.deals} {v.note || "AI Deals"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-[#FF3B57]">📈</span>
                  <h3 className="text-sm font-bold text-gray-900">Capital Flow</h3>
                </div>
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1.5 font-medium">Increasing Capital</p>
                  {["AI Agents", "AI Coding", "AI Infrastructure"].map(s => (
                    <div key={s} className="flex items-center gap-1.5 text-xs text-gray-700 mb-1">
                      <span className="text-emerald-500">↗</span> {s}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5 font-medium">Decreasing Capital</p>
                  {["Enterprise AI", "Traditional SaaS", "Consumer Apps"].map(s => (
                    <div key={s} className="flex items-center gap-1.5 text-xs text-gray-700 mb-1">
                      <span className="text-red-400">↘</span> {s}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-[#FF3B57]">📊</span>
                  <h3 className="text-sm font-bold text-gray-900">Stage Evolution</h3>
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
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF3B57] flex-shrink-0" />
                      <span className="text-gray-500">{e.year}</span>
                      <span className="text-gray-700">{e.stage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Portfolio Winners */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span>🏆</span>
                  <h3 className="text-sm font-bold text-gray-900">Portfolio Winners</h3>
                </div>
                <p className="text-xs text-gray-400 mb-4">Notable Winners</p>
                <div className="flex flex-wrap gap-3 mb-4">
                  {["Anthropic", "Cursor", "Harvey", "Perplexity", "Databricks", "Stripe"].map(name => (
                    <span key={name} className="text-xs font-semibold text-gray-700">{name}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 font-semibold mb-2">Outcome Breakdown</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[{ n: 18, l: "Unicorns" }, { n: 6, l: "IPOs" }, { n: 24, l: "Acquisitions" }, { n: 85, l: "Active Companies" }].map(s => (
                    <div key={s.l}>
                      <div className="text-lg font-black text-[#FF3B57]">{s.n}</div>
                      <div className="text-xs text-gray-400">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center gap-1.5 mb-4">
                  <span>💪</span>
                  <h3 className="text-sm font-bold text-gray-900">Follow-On Strength</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: "82%", label: "Raised Next Round" },
                    { val: "14", label: "Months Average Time" },
                    { val: "3.8x", label: "Median Funding Growth" },
                    { val: "68%", label: "Raised Series B+" },
                  ].map(s => (
                    <div key={s.label} className="text-center p-2 bg-gray-50 rounded-xl">
                      <div className="text-lg font-black text-gray-900">{s.val}</div>
                      <div className="text-xs text-gray-400 leading-tight mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* AI Market Influence */}
            <div className="border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-1.5 mb-4">
                <span>📡</span>
                <h3 className="text-sm font-bold text-gray-900">AI Market Influence</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: "18%", label: "AI Infrastructure\nRounds" },
                  { val: "14%", label: "AI Agent\nFunding" },
                  { val: "12%", label: "Developer Tools\nFunding" },
                  { val: "Top 3", label: "Most Active\nAI Investor" },
                  { val: "#1", label: "Series A\nInvestor" },
                ].map(s => (
                  <div key={s.label} className="p-2 border border-gray-100 rounded-xl text-center">
                    <div className="text-sm font-black text-gray-900">{s.val}</div>
                    <div className="text-xs text-gray-400 leading-tight mt-0.5 whitespace-pre-line">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Co-Investor Network */}
            <div className="border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Co-Investor Network</h3>
                <Link href="#" className="text-xs text-[#FF3B57]">View all →</Link>
              </div>
              <p className="text-xs text-gray-500 mb-3">Most Frequent Co-Investors</p>
              <div className="flex flex-wrap gap-2">
                {coInvestors.map(inv => (
                  <Link key={inv.id} href={`/investors/${inv.slug}`}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold" style={{ background: inv.logo_bg }}>
                      {inv.name.charAt(0)}
                    </div>
                    <span className="text-xs text-gray-700 font-medium">{inv.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Related Investors */}
            <div className="border border-gray-100 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Related Investors</h3>
              <div className="grid grid-cols-2 gap-3">
                {relatedInvestors.map(inv => (
                  <Link key={inv.id} href={`/investors/${inv.slug}`}
                    className="flex flex-col items-center text-center p-3 border border-gray-100 rounded-xl hover:border-gray-200 transition-all group">
                    <div className="w-10 h-10 rounded-xl mb-2 flex items-center justify-center text-white font-bold text-sm" style={{ background: inv.logo_bg }}>
                      {inv.name.charAt(0)}
                    </div>
                    <div className="text-xs font-semibold text-gray-900 leading-tight">{inv.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{inv.type}</div>
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
