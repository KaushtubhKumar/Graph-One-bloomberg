"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronRight, ArrowRight } from "lucide-react";
import { getInvestors } from "@/lib/api";
import type { Investor } from "@/lib/types";

const investorCollections = [
  { title: "Investors Backing AI Agents", count: 26, img: "🤖", color: "from-blue-600 to-indigo-900" },
  { title: "Investors Backing Indian AI Startups", count: 98, img: "🏛️", color: "from-orange-500 to-red-800" },
  { title: "Top Seed Investors", count: 274, img: "🌱", color: "from-emerald-500 to-teal-800" },
  { title: "Operator Angels", count: 178, img: "⚡", color: "from-purple-500 to-indigo-900" },
  { title: "OpenAI Alumni Investors", count: 42, img: "🧠", color: "from-gray-600 to-gray-900" },
  { title: "Enterprise AI Investors", count: 84, img: "🏢", color: "from-blue-500 to-blue-900" },
  { title: "Developer Tool Specialists", count: 92, img: "💻", color: "from-violet-500 to-purple-900" },
  { title: "Healthcare AI Investors", count: 88, img: "🏥", color: "from-cyan-500 to-blue-900" },
];

const investorTypes = [
  { name: "Seed Investors", count: "1,248", icon: "🌱" },
  { name: "Series A Investors", count: "884", icon: "📈" },
  { name: "Angel Investors", count: "2,174", icon: "😇" },
  { name: "Corporate Venture Funds", count: "615", icon: "🏛️" },
  { name: "Late Stage Investors", count: "432", icon: "📊" },
  { name: "Family Offices", count: "198", icon: "🏠" },
];

const capitalThemes = [
  { name: "AI Agents", count: "214", color: "bg-blue-50 text-blue-700" },
  { name: "AI Coding", count: "160", color: "bg-violet-50 text-violet-700" },
  { name: "AI Infrastructure", count: "88", color: "bg-emerald-50 text-emerald-700" },
  { name: "Developer Tools", count: "134", color: "bg-orange-50 text-orange-700" },
  { name: "Robotics", count: "87", color: "bg-red-50 text-red-700" },
  { name: "Healthcare AI", count: "93", color: "bg-pink-50 text-pink-700" },
  { name: "Defense AI", count: "41", color: "bg-gray-100 text-gray-700" },
  { name: "Video AI", count: "43", color: "bg-purple-50 text-purple-700" },
];

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading investors…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-gray-100 bg-gradient-to-br from-white via-blue-50/10 to-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl font-black text-gray-900 leading-tight mb-3">
                Discover Investors<br />
                <span className="text-[#FF3B57]">Building the AI Economy</span>
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm">
                Find VCs, angels, operators, corporate funds and emerging managers backing the next generation of AI companies.
              </p>
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 max-w-md shadow-sm mb-4">
                <Search size={16} className="text-gray-400" />
                <input className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400" placeholder="Search investors, funds, firms..." />
                <button className="w-8 h-8 bg-[#FF3B57] rounded-lg flex items-center justify-center">
                  <Search size={14} className="text-white" />
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">Popular searches:</span>
                {["AI Agents", "Seed Investors", "Series A", "YC Backers", "India", "OpenAI Portfolio"].map(s => (
                  <button key={s} className="text-xs px-2.5 py-1 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">{s}</button>
                ))}
              </div>
            </div>
            {/* Floating investor logos */}
            <div className="hidden lg:block relative h-48">
              {[
                { name: "a16z", bg: "#1e40af", top: "5%", left: "60%", size: "w-20" },
                { name: "Sequoia Capital", bg: "#1e3a5f", top: "20%", left: "20%", size: "w-24" },
                { name: "Lightspeed", bg: "#16a34a", top: "50%", left: "65%", size: "w-20" },
                { name: "General Catalyst", bg: "#0f172a", top: "10%", left: "40%", size: "w-20" },
                { name: "Khosla Ventures", bg: "#dc2626", top: "60%", left: "30%", size: "w-22" },
                { name: "Accel", bg: "#4f46e5", top: "35%", left: "5%", size: "w-16" },
              ].map((inv, i) => (
                <div key={i}
                  className={`absolute ${inv.size} py-2 px-3 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg`}
                  style={{ background: inv.bg, top: inv.top, left: inv.left }}>
                  {inv.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* Trending Investors */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#FF3B57] text-white text-xs font-bold flex items-center justify-center">01</span>
              <h2 className="font-bold text-gray-900">Trending Investors</h2>
            </div>
            <Link href="#" className="text-sm text-gray-500 font-medium hover:text-gray-900">View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {investors.map(inv => (
              <Link key={inv.id} href={`/investors/${inv.slug}`}
                className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all">
                <div className="h-20 flex items-center justify-center text-white font-black text-2xl" style={{ background: inv.logo_bg }}>
                  {inv.name.charAt(0)}
                </div>
                <div className="p-3 bg-white">
                  <div className="text-xs font-bold text-gray-900 mb-1">{inv.name}</div>
                  <div className="space-y-0.5">
                    {inv.sector_focus.slice(0, 2).map(s => (
                      <div key={s} className="text-xs text-gray-400">{s}</div>
                    ))}
                  </div>
                  <button className="mt-2 text-xs text-[#FF3B57] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    View portfolio →
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Investor Collections */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#FF3B57] text-white text-xs font-bold flex items-center justify-center">02</span>
              <h2 className="font-bold text-gray-900">Investor Collections</h2>
            </div>
            <Link href="#" className="text-sm text-gray-500 font-medium hover:text-gray-900">View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {investorCollections.map(col => (
              <Link key={col.title} href="#"
                className={`relative rounded-2xl overflow-hidden h-32 flex flex-col justify-end p-4 bg-gradient-to-br ${col.color} group cursor-pointer`}>
                <div className="absolute top-4 right-4 text-3xl opacity-30">{col.img}</div>
                <div className="relative">
                  <h3 className="text-white font-bold text-sm leading-tight">{col.title}</h3>
                  <p className="text-white/60 text-xs mt-0.5">{col.count} Investors</p>
                </div>
                <button className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white/40 transition-colors">
                  <ChevronRight size={12} />
                </button>
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by Investor Type */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#FF3B57] text-white text-xs font-bold flex items-center justify-center">02</span>
              <h2 className="font-bold text-gray-900">Browse by Investor Type</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {investorTypes.map(type => (
              <Link key={type.name} href="#"
                className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-sm transition-all group">
                <span className="text-2xl">{type.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{type.name}</div>
                  <div className="text-xs text-gray-400">{type.count} investors</div>
                </div>
                <ChevronRight size={14} className="ml-auto text-gray-300 group-hover:text-gray-500" />
              </Link>
            ))}
          </div>
        </section>

        {/* Most Active Investors */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#FF3B57] text-white text-xs font-bold flex items-center justify-center">04</span>
              <h2 className="font-bold text-gray-900">Most Active Investors</h2>
            </div>
            <Link href="#" className="text-sm text-gray-500 font-medium hover:text-gray-900">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {investors.slice(0, 4).map(inv => (
              <div key={inv.id} className="border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: inv.logo_bg }}>
                    {inv.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{inv.name}</div>
                    <div className="text-xs text-gray-400">{inv.portfolio_count} portfolio companies</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(inv.notable_portfolio || ["OpenAI", "Cursor", "Harvey"]).slice(0, 3).map(p => (
                    <span key={p} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{p}</span>
                  ))}
                </div>
                <Link href={`/investors/${inv.slug}`} className="text-xs text-[#FF3B57] font-semibold hover:underline">
                  View portfolio →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Capital Themes */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#FF3B57] text-white text-xs font-bold flex items-center justify-center">06</span>
              <h2 className="font-bold text-gray-900">Capital Themes</h2>
            </div>
            <Link href="#" className="text-sm text-gray-500 font-medium hover:text-gray-900">View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {capitalThemes.map(theme => (
              <Link key={theme.name} href="#"
                className={`px-3 py-3 rounded-xl text-sm font-medium ${theme.color} hover:opacity-90 transition-opacity flex items-center justify-between`}>
                <span>{theme.name}</span>
                <span className="text-xs opacity-70">{theme.count}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Capital Graph CTA */}
        <section className="rounded-2xl bg-gray-950 text-white px-8 py-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#FF3B57] text-xs font-semibold">✦ Explore the Capital Graph</span>
          </div>
          <h3 className="text-2xl font-black mb-2">Visualize How Capital<br />Moves in the AI Economy</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm">Explore the relationships between investors, founders, companies, funding rounds, and products.</p>
          <div className="flex items-center gap-6 mb-6 overflow-x-auto scrollbar-hide">
            {["Investor", "Founder", "Company", "Funding Round", "Product"].map((node, i) => (
              <div key={node} className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                  ["bg-blue-500", "bg-purple-500", "bg-red-500", "bg-green-500", "bg-orange-500"][i]
                }`}>
                  {["👤", "🧑‍💼", "🏢", "💰", "📦"][i]}
                </div>
                <span className="text-xs text-gray-400">{node}</span>
              </div>
            ))}
          </div>
          <button className="px-5 py-2.5 bg-[#FF3B57] text-white text-sm font-semibold rounded-xl hover:bg-[#e0324c] transition-colors flex items-center gap-2">
            Explore Capital Graph <ArrowRight size={14} />
          </button>
        </section>
      </div>
    </div>
  );
}
