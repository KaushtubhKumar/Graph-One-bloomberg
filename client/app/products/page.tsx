"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Heart, MessageSquare, ChevronRight, Zap, Home, Rocket, Package, Wallet, Briefcase, Newspaper, TrendingUp, Mail, Trophy, Sparkles, Flame } from "lucide-react";
import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/types";

const categories = ["All", "Chat", "Code", "Agents", "Image", "Voice", "Video", "Productivity"];

const trendingSearches = ["Cursor", "Claude", "Vibe Coding", "Lovable", "Perplexity", "Midjourney", "Runway", "MCP", "AI Agents", "AI Notemaker"];

const productOfDay = { name: "Cursor", desc: "AI-first code editor", bg: "#312e81" };

const sidebarNav = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Rocket, label: "AI Startups", href: "/companies" },
  { icon: Package, label: "AI Products", href: "/products", active: true },
  { icon: Wallet, label: "Investors", href: "/investors" },
  { icon: Briefcase, label: "Jobs", href: "/jobs" },
  { icon: Newspaper, label: "News", href: "/news" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Popular");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getProducts().then(data => {
      if (!active) return;
      setProducts(data);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const filtered = activeCategory === "All"
    ? products
    : products.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase() ||
        p.tags.some(t => t.toLowerCase().includes(activeCategory.toLowerCase())));

  const popularNow = products.slice().sort((a, b) => b.upvotes - a.upvotes).slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="skeleton rounded-lg h-10 w-72 mb-4" />
          <div className="skeleton rounded-lg h-5 w-96 mb-10" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton rounded-lg h-16" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-52 flex-shrink-0 border-r border-ink-100 min-h-[calc(100vh-64px)] sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <nav className="p-4 space-y-0.5">
            {sidebarNav.map(item => (
              <Link key={item.label} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-[14px] font-medium transition-colors duration-150 ${
                  item.active
                    ? "bg-accent-50 text-accent-600"
                    : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                }`}>
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="px-4 pt-2 pb-4">
            <p className="text-meta text-ink-400 font-semibold uppercase tracking-wide mb-2 px-3">Contribute</p>
            {[
              { icon: Rocket, label: "Submit Startup" },
              { icon: Package, label: "Submit Product" },
            ].map(item => (
              <button key={item.label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-[14px] font-medium text-ink-600 hover:bg-ink-50 w-full text-left transition-colors duration-150">
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Hero */}
          <section className="border-b border-ink-100 bg-gradient-to-br from-white via-red-50/10 to-white">
            <div className="max-w-4xl mx-auto px-6 py-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center gap-1.5 text-xs text-accent-600 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
                      LIVE AI INTELLIGENCE
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-ink-900 leading-tight mb-3">
                    The Global Intelligence<br />
                    Layer for <span className="text-accent-600">AI.</span>
                  </h1>
                  <p className="text-ink-500 text-sm mb-5">One graph connecting companies, founders, investors, products, funding and talent.</p>
                  <div className="flex items-center gap-3 bg-white border border-ink-200 rounded-sm px-4 py-3 shadow-sm">
                    <Search size={16} className="text-ink-400 flex-shrink-0" />
                    <input className="flex-1 outline-none text-[14px] text-ink-700 placeholder-ink-400 min-w-0"
                      placeholder="Search companies, founders, investors or products…" />
                    <button className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-accent-500 rounded-sm hover:bg-accent-600 transition-colors duration-150">
                      <ChevronRight size={16} className="text-white" />
                    </button>
                  </div>
                  <div className="mt-3">
                    <p className="text-meta text-ink-400 mb-2">Most searched</p>
                    <div className="flex flex-wrap gap-2">
                      {["Databricks", "Notion", "Framer", "Weaveote", "LangChain"].map(s => (
                        <button key={s} className="flex items-center gap-1.5 text-meta px-2.5 py-1 bg-ink-100 rounded-full text-ink-600 hover:bg-ink-200 transition-colors duration-150">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Floating logos */}
                <div className="hidden sm:grid grid-cols-3 gap-3">
                  {[
                    { name: "OpenAI", bg: "#000" },
                    { name: "Anthropic", bg: "#cc6600" },
                    { name: "Cursor", bg: "#1a1a2e" },
                    { name: "Midjourney", bg: "#1a1a1a" },
                    { name: "Perplexity", bg: "#1e3a5f" },
                    { name: "Runway", bg: "#0d1117" },
                  ].map((c, i) => (
                    <div key={i} className={`w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold shadow-md ${i % 2 === 1 ? "mt-4" : ""}`}
                      style={{ background: c.bg }}>
                      {c.name.charAt(0)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
            {/* Collection of the Week + Product of the Day */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 rounded-lg overflow-hidden bg-ink-900 p-5 text-white relative">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-accent-500/25 blur-2xl" />
                <div className="relative flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 text-meta font-semibold bg-white/15 px-2 py-0.5 rounded-full">
                    <Flame size={11} className="text-accent-400" /> COLLECTION OF THE WEEK
                  </span>
                </div>
                <div className="relative flex gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg leading-tight mb-1">Vibe Coding Tools</h3>
                    <p className="text-white/60 text-meta mb-3">The best AI tools for vibe coding, building and shipping faster.</p>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex -space-x-1.5">
                        {["#312e81", "#9a3412", "#4035c9", "#1e3a5f"].map((bg, i) => (
                          <div key={i} className="w-6 h-6 rounded-full ring-2 ring-ink-900 flex items-center justify-center text-white text-meta font-bold" style={{ background: bg }}>
                            {String.fromCharCode(65 + i)}
                          </div>
                        ))}
                      </div>
                      <span className="text-meta text-white/60">2.3M products</span>
                    </div>
                    <button className="flex items-center gap-1.5 bg-white text-ink-900 text-[14px] font-semibold px-4 py-2 rounded-sm hover:bg-ink-50 transition-colors duration-150">
                      Explore collection <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="border border-ink-100 rounded-lg p-5 flex flex-col gap-3">
                <div className="flex items-center gap-1.5">
                  <Trophy size={13} className="text-accent-600" />
                  <span className="text-meta font-semibold text-ink-500">Product of the Day</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-sm flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: productOfDay.bg }}>
                    {productOfDay.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-ink-900">{productOfDay.name}</div>
                    <div className="text-meta text-ink-400">{productOfDay.desc}</div>
                  </div>
                </div>
                <button className="w-full py-2 bg-accent-500 text-white text-[14px] font-semibold rounded-sm hover:bg-accent-600 transition-colors duration-150">
                  View product
                </button>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide border-b border-ink-100 pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2.5 text-[14px] font-medium border-b-2 transition-colors duration-150 ${
                    activeCategory === cat
                      ? "border-accent-500 text-accent-600"
                      : "border-transparent text-ink-500 hover:text-ink-900"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Popular right now */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-accent-600" />
                <h2 className="text-[13px] font-bold text-ink-900 tracking-wide uppercase">Popular right now</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {popularNow.map(p => (
                  <div key={p.id} className="flex-shrink-0 flex flex-col items-center gap-1.5 p-3 border border-ink-100 rounded-lg hover-lift cursor-pointer bg-white">
                    <div className="w-10 h-10 rounded-sm flex items-center justify-center text-white font-bold text-[14px]"
                      style={{ background: p.logo_bg || "#333" }}>
                      {p.name.charAt(0)}
                    </div>
                    <span className="text-meta font-medium text-ink-700">{p.name}</span>
                    <span className="text-meta text-ink-400">{p.category || "AI Tool"}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Sort/filter bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className={`flex items-center gap-1.5 text-[14px] font-semibold pb-1 border-b-2 transition-colors duration-150 ${sortBy === "Popular" ? "border-accent-500 text-accent-600" : "border-transparent text-ink-400 hover:text-ink-700"}`}
                  onClick={() => setSortBy("Popular")}><Flame size={13} /> Most popular</button>
                <button className={`flex items-center gap-1.5 text-[14px] font-semibold pb-1 border-b-2 transition-colors duration-150 ${sortBy === "Newest" ? "border-accent-500 text-accent-600" : "border-transparent text-ink-400 hover:text-ink-700"}`}
                  onClick={() => setSortBy("Newest")}><Sparkles size={13} /> Newest</button>
              </div>
              <div className="text-meta text-ink-400">{products.length.toLocaleString()}+ products</div>
            </div>

            {/* Product list */}
            <div className="space-y-0.5">
              {filtered.map((product, i) => (
                <div key={product.id}>
                  {/* Sponsored banner example */}
                  {i === 4 && (
                    <div className="flex items-center gap-4 py-4 px-4 my-2 bg-accent-50 rounded-lg border border-accent-100">
                      <span className="text-meta bg-accent-100 text-accent-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">SPONSORED</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-bold text-ink-900">Build AI agents in minutes</div>
                        <div className="text-meta text-ink-500">The all-in-one platform to design, deploy and scale AI workflows.</div>
                      </div>
                      <button className="flex-shrink-0 px-3 py-2 bg-accent-500 text-white text-meta font-semibold rounded-sm hover:bg-accent-600 transition-colors duration-150">
                        Try GraphOne Studio →
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-4 py-4 px-2 border-b border-ink-100 hover:bg-ink-50/50 rounded-sm transition-colors duration-150 group cursor-pointer">
                    <div className="w-12 h-12 rounded-sm flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                      style={{ background: product.logo_bg }}>
                      {product.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-ink-900 text-[14px]">{product.name}</span>
                        {product.badge && (
                          <span className="text-meta bg-warning-bg text-warning px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-meta text-ink-500 truncate">{product.description}</p>
                      <div className="flex gap-1.5 mt-1.5">
                        {product.tags.map(tag => (
                          <span key={tag} className="text-meta px-2 py-0.5 bg-ink-100 rounded-full text-ink-600">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <button className="flex items-center gap-1.5 text-ink-400 hover:text-red-400 transition-colors duration-150 group/btn">
                        <Heart size={14} className="group-hover/btn:fill-red-400 transition-colors duration-150" />
                        <span className="text-meta font-medium">{(product.upvotes / 1000).toFixed(1)}K</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-ink-400 hover:text-ink-700 transition-colors duration-150">
                        <MessageSquare size={14} />
                        <span className="text-meta font-medium">{product.comments}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center py-4">
              <button className="flex items-center gap-2 mx-auto text-[14px] text-ink-500 hover:text-ink-900 font-medium transition-colors duration-150">
                Load more products <ChevronRight size={14} className="rotate-90" />
              </button>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="hidden xl:flex flex-col w-64 flex-shrink-0 border-l border-ink-100 min-h-[calc(100vh-64px)] sticky top-16 h-[calc(100vh-64px)] overflow-y-auto p-5 space-y-6">
          {/* Trending Searches */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-accent-600" />
              <h3 className="text-[14px] font-bold text-ink-900">Trending searches</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {trendingSearches.map(s => (
                <button key={s} className="text-meta px-2.5 py-1 bg-ink-100 rounded-full text-ink-600 hover:bg-ink-200 transition-colors duration-150">{s}</button>
              ))}
            </div>
          </div>

          {/* Stay ahead in AI */}
          <div className="border border-ink-100 rounded-lg p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Mail size={14} className="text-accent-600" />
              <h3 className="text-[14px] font-bold text-ink-900">Stay ahead in AI</h3>
            </div>
            <p className="text-meta text-ink-500 mb-3">Get weekly updates on new tools and trends.</p>
            <input className="w-full text-meta border border-ink-200 rounded-sm px-3 py-2.5 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 mb-2 transition-all duration-150" placeholder="Enter your email" />
            <button className="w-full py-2.5 bg-accent-500 text-white text-meta font-semibold rounded-sm hover:bg-accent-600 transition-colors duration-150">
              Subscribe
            </button>
          </div>

          {/* Footer links */}
          <div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {["About", "Advertise", "API", "Newsletter", "Blog", "Privacy", "Terms", "Contact"].map(l => (
                <Link key={l} href="#" className="text-meta text-ink-400 hover:text-ink-600 transition-colors duration-150">{l}</Link>
              ))}
            </div>
            <p className="text-meta text-ink-400 mt-2">© 2026 GraphOne.<br />All rights reserved.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
