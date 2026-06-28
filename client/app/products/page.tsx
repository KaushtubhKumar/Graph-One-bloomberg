"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Heart, MessageSquare, ChevronRight, Zap } from "lucide-react";
import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/types";

const categories = ["All", "Chat", "Code", "Agents", "Image", "Voice", "Video", "Productivity"];

const trendingSearches = ["Cursor", "Claude", "Vibe Coding", "Lovable", "Perplexity", "Midjourney", "Runway", "MCP", "AI Agents", "AI Notemaker"];

const collections = [
  { name: "Collection of the Week", emoji: "🔥", title: "Vibe Coding Tools", desc: "The best AI tools for vibe coding, building and shipping faster.", count: "2.3M products", color: "from-orange-500 to-red-600" },
];

const productOfDay = { name: "Cursor", desc: "AI-first code editor", bg: "#1a1a2e" };

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading products…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-52 flex-shrink-0 border-r border-gray-100 min-h-[calc(100vh-56px)] sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
          <nav className="p-4 space-y-1">
            {[
              { icon: "🏠", label: "Home", href: "/" },
              { icon: "🚀", label: "AI Startups", href: "/companies" },
              { icon: "📦", label: "AI Products", href: "/products", active: true },
              { icon: "💰", label: "Investors", href: "/investors" },
              { icon: "💼", label: "Jobs", href: "/jobs" },
              { icon: "📰", label: "News", href: "/news" },
            ].map(item => (
              <Link key={item.label} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-red-50 text-[#FF3B57]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="px-4 pt-2 pb-4">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2 px-3">Contribute</p>
            {[
              { icon: "🚀", label: "Submit Startup" },
              { icon: "📦", label: "Submit Product" },
            ].map(item => (
              <button key={item.label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 w-full text-left transition-colors">
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Hero */}
          <section className="border-b border-gray-100 bg-gradient-to-br from-white via-red-50/10 to-white">
            <div className="max-w-4xl mx-auto px-6 py-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center gap-1.5 text-xs text-[#FF3B57] font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#FF3B57] animate-pulse" />
                      LIVE AI INTELLIGENCE
                    </span>
                  </div>
                  <h1 className="text-3xl font-black text-gray-900 leading-tight mb-3">
                    The Global Intelligence<br />
                    Layer for <span className="text-[#FF3B57]">AI.</span>
                  </h1>
                  <p className="text-gray-500 text-sm mb-5">One graph connecting companies, founders, investors, products, funding and talent.</p>
                  <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                    <Search size={16} className="text-gray-400 flex-shrink-0" />
                    <input className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
                      placeholder="Search companies, founders, investors or products..." />
                    <button className="flex items-center justify-center w-8 h-8 bg-[#FF3B57] rounded-lg hover:bg-[#e0324c] transition-colors">
                      <ChevronRight size={16} className="text-white" />
                    </button>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-2">Most searched</p>
                    <div className="flex flex-wrap gap-2">
                      {["Databricks", "Notion", "Framer", "Weaveote", "LangChain"].map(s => (
                        <button key={s} className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                          <span className="w-4 h-4 rounded bg-gray-300 inline-block" />
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
                    <div key={i} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold shadow-md ${i % 2 === 1 ? "mt-4" : ""}`}
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
              <div className="sm:col-span-2 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 p-5 text-white relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">🔥 COLLECTION OF THE WEEK</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <h3 className="font-black text-lg leading-tight mb-1">Vibe Coding Tools</h3>
                    <p className="text-white/80 text-xs mb-3">The best AI tools for vibe coding, building and shipping faster.</p>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex -space-x-1.5">
                        {["#000", "#cc6600", "#4f46e5", "#1e3a5f"].map((bg, i) => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-orange-500 flex items-center justify-center text-white text-xs font-bold" style={{ background: bg }}>
                            {String.fromCharCode(65 + i)}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-white/80">2.3M products</span>
                    </div>
                    <button className="flex items-center gap-2 bg-white text-orange-600 text-sm font-bold px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors">
                      Explore Collection <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="w-24 hidden sm:flex items-center justify-center opacity-20 text-6xl">💻</div>
                </div>
              </div>
              <div className="border border-gray-100 rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏆</span>
                  <span className="text-xs font-semibold text-gray-500">Product of the Day</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: productOfDay.bg }}>
                    {productOfDay.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{productOfDay.name}</div>
                    <div className="text-xs text-gray-400">{productOfDay.desc}</div>
                  </div>
                </div>
                <button className="w-full py-2 bg-[#FF3B57] text-white text-sm font-semibold rounded-xl hover:bg-[#e0324c] transition-colors">
                  View Product
                </button>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide border-b border-gray-100 pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeCategory === cat
                      ? "border-[#FF3B57] text-[#FF3B57]"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Popular right now */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-[#FF3B57]" />
                <h2 className="text-sm font-bold text-gray-900">POPULAR RIGHT NOW</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {popularNow.map(p => (
                  <div key={p.id} className="flex-shrink-0 flex flex-col items-center gap-1.5 p-3 border border-gray-100 rounded-xl hover:shadow-sm transition-all cursor-pointer">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: p.logo_bg || "#333" }}>
                      {p.name.charAt(0)}
                    </div>
                    <span className="text-xs font-medium text-gray-700">{p.name}</span>
                    <span className="text-xs text-gray-400">{p.category || "AI Tool"}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Sort/filter bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className={`text-sm font-semibold px-1 pb-1 border-b-2 transition-colors ${sortBy === "Popular" ? "border-[#FF3B57] text-[#FF3B57]" : "border-transparent text-gray-400 hover:text-gray-700"}`}
                  onClick={() => setSortBy("Popular")}>🔥 Most Popular</button>
                <button className={`text-sm font-semibold px-1 pb-1 border-b-2 transition-colors ${sortBy === "Newest" ? "border-[#FF3B57] text-[#FF3B57]" : "border-transparent text-gray-400 hover:text-gray-700"}`}
                  onClick={() => setSortBy("Newest")}>✨ Newest</button>
              </div>
              <div className="text-xs text-gray-400">{products.length.toLocaleString()}+ products</div>
            </div>

            {/* Product list */}
            <div className="space-y-0.5">
              {filtered.map((product, i) => (
                <div key={product.id}>
                  {/* Sponsored banner example */}
                  {i === 4 && (
                    <div className="flex items-center gap-4 py-4 px-4 my-2 bg-gradient-to-r from-violet-50 to-blue-50 rounded-2xl border border-violet-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-semibold">SPONSORED</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-gray-900">Build AI agents in minutes</div>
                        <div className="text-xs text-gray-500">The all-in-one platform to design, deploy and scale AI workflows.</div>
                      </div>
                      <button className="flex-shrink-0 px-3 py-2 bg-violet-600 text-white text-xs font-semibold rounded-xl hover:bg-violet-700 transition-colors">
                        Try GraphOne Studio →
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-4 py-4 px-2 border-b border-gray-50 hover:bg-gray-50/50 rounded-xl transition-colors group cursor-pointer">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                      style={{ background: product.logo_bg }}>
                      {product.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-gray-900 text-sm">{product.name}</span>
                        {product.badge && (
                          <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{product.description}</p>
                      <div className="flex gap-1.5 mt-1">
                        {product.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <button className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors group/btn">
                        <Heart size={14} className="group-hover/btn:fill-red-400 transition-colors" />
                        <span className="text-xs font-medium">{(product.upvotes / 1000).toFixed(1)}K</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors">
                        <MessageSquare size={14} />
                        <span className="text-xs font-medium">{product.comments}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center py-4">
              <button className="flex items-center gap-2 mx-auto text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
                Load more products <ChevronRight size={14} className="rotate-90" />
              </button>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="hidden xl:flex flex-col w-64 flex-shrink-0 border-l border-gray-100 min-h-[calc(100vh-56px)] sticky top-14 h-[calc(100vh-56px)] overflow-y-auto p-5 space-y-6">
          {/* Trending Searches */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">📈</span>
              <h3 className="text-sm font-bold text-gray-900">Trending Searches</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {trendingSearches.map(s => (
                <button key={s} className="text-xs px-2.5 py-1 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">{s}</button>
              ))}
            </div>
          </div>

          {/* Stay ahead in AI */}
          <div className="border border-gray-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">✉️</span>
              <h3 className="text-sm font-bold text-gray-900">Stay ahead in AI</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">Get weekly updates on new tools and trends.</p>
            <input className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#FF3B57] mb-2 transition-colors" placeholder="Enter your email" />
            <button className="w-full py-2.5 bg-[#FF3B57] text-white text-xs font-semibold rounded-xl hover:bg-[#e0324c] transition-colors">
              Subscribe
            </button>
          </div>

          {/* Footer links */}
          <div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {["About", "Advertise", "API", "Newsletter", "Blog", "Privacy", "Terms", "Contact"].map(l => (
                <Link key={l} href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">{l}</Link>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">© 2024 GraphOne.<br />All rights reserved.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
