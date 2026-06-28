"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Search, ChevronRight, TrendingUp, Zap, Eye, ArrowRight, Sparkles,
  GitCompare, Globe, ExternalLink, SlidersHorizontal, X,
} from "lucide-react";
import { getCompanies, getTrendingCompanies, getCategoriesFromCompanies } from "@/lib/api";
import type { Company } from "@/lib/types";
import Logo from "@/components/shared/Logo";
import CompanyCard from "@/components/companies/CompanyCard";

const tabs = ["AI Agents", "AI Coding", "AI Search", "AI Video", "AI Voice", "AI Infrastructure", "More"];
const SORT_OPTIONS = [
  { label: "Trending", value: "trending" },
  { label: "Funding Stage", value: "stage" },
  { label: "Fastest Growing", value: "growth" },
  { label: "Newest", value: "newest" },
  { label: "Most Funded", value: "funded" },
];

function SectionHeader({
  num, title, subtitle, viewAll = true,
}: { num: number; title: string; subtitle?: string; viewAll?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 rounded-sm bg-ink-900 text-white text-meta font-semibold flex items-center justify-center flex-shrink-0 mt-0.5 tabular-nums">
          {num}
        </span>
        <div>
          <h2 className="text-h2 text-ink-900">{title}</h2>
          {subtitle && <p className="text-[14px] text-ink-500 mt-1 max-w-xl">{subtitle}</p>}
        </div>
      </div>
      {viewAll && (
        <Link
          href="#"
          className="hidden sm:flex items-center gap-1 text-[14px] text-ink-500 hover:text-ink-900 font-medium transition-colors duration-150 flex-shrink-0"
        >
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
  const coords = pts
    .map((p, i) => `${(i / (pts.length - 1)) * w},${h - ((p - min) / (max - min)) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="opacity-80" aria-hidden="true">
      <polyline
        fill="none"
        stroke="var(--color-positive)"
        strokeWidth="2"
        points={coords}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CardSkeleton() {
  return <div className="skeleton rounded-lg h-44" />;
}

// ─── Frontier Labs data ───────────────────────────────────────────────────────
const FRONTIER_LABS = [
  {
    name: "OpenAI",
    website: "openai.com",
    bg: "#18181b",
    cardBg: "from-zinc-50 to-slate-100",
    accentColor: "#18181b",
    accentLight: "#e4e4e7",
    tagline: "GPT-4o · o3 · Sora",
    founded: "2015",
    badge: "🧠",
  },
  {
    name: "Anthropic",
    website: "anthropic.com",
    bg: "#92400e",
    cardBg: "from-amber-50 to-orange-50",
    accentColor: "#92400e",
    accentLight: "#fed7aa",
    tagline: "Claude · Constitutional AI",
    founded: "2021",
    badge: "🔬",
  },
  {
    name: "Google DeepMind",
    website: "deepmind.google",
    bg: "#1e3a8a",
    cardBg: "from-blue-50 to-indigo-50",
    accentColor: "#1e3a8a",
    accentLight: "#bfdbfe",
    tagline: "Gemini · AlphaFold · Gemma",
    founded: "2010",
    badge: "💎",
  },
  {
    name: "xAI",
    website: "x.ai",
    bg: "#27272a",
    cardBg: "from-zinc-50 to-gray-100",
    accentColor: "#27272a",
    accentLight: "#d4d4d8",
    tagline: "Grok · Aurora",
    founded: "2023",
    badge: "⚡",
  },
  {
    name: "Meta AI",
    website: "meta.com",
    bg: "#1447e6",
    cardBg: "from-blue-50 to-sky-50",
    accentColor: "#1447e6",
    accentLight: "#bae6fd",
    tagline: "Llama · SAM · SeamlessM4T",
    founded: "2023",
    badge: "🌐",
  },
  {
    name: "SSI",
    website: "ssi.inc",
    bg: "#3329a3",
    cardBg: "from-violet-50 to-purple-50",
    accentColor: "#3329a3",
    accentLight: "#ddd6fe",
    tagline: "Safe Superintelligence",
    founded: "2024",
    badge: "🛡️",
  },
];

// ─── Open Source leaders data ─────────────────────────────────────────────────
const OPEN_SOURCE_LEADERS = [
  {
    name: "Hugging Face",
    website: "huggingface.co",
    bg: "#facc15",
    gradient: "from-yellow-500/20 to-amber-600/10",
    stars: "80K",
    models: "900K+",
    desc: "The GitHub of ML models, datasets & spaces.",
    badge: "🤗",
  },
  {
    name: "Mistral AI",
    website: "mistral.ai",
    bg: "#c2410c",
    gradient: "from-orange-700/20 to-red-900/10",
    stars: "18K",
    models: "20+",
    desc: "Efficient open-weight models: Mistral 7B, Mixtral.",
    badge: "🌊",
  },
  {
    name: "Ollama",
    website: "ollama.com",
    bg: "#27272a",
    gradient: "from-zinc-700/20 to-zinc-900/10",
    stars: "10K",
    models: "100+",
    desc: "Run LLMs locally on Mac, Linux & Windows.",
    badge: "🦙",
  },
  {
    name: "Together AI",
    website: "together.ai",
    bg: "#0e7490",
    gradient: "from-cyan-700/20 to-cyan-950/10",
    stars: "6K",
    models: "200+",
    desc: "Decentralized inference cloud for open models.",
    badge: "⚡",
  },
  {
    name: "Databricks",
    website: "databricks.com",
    bg: "#dc2626",
    gradient: "from-red-700/20 to-red-950/10",
    stars: "12K",
    models: "50+",
    desc: "DBRX, Dolly — enterprise open LLMs at scale.",
    badge: "🧱",
  },
];

// ─── AI Unicorn data (Row 1) ──────────────────────────────────────────────────
const AI_UNICORNS = [
  { name: "OpenAI",        website: "openai.com",        bg: "#18181b", valuation: "157B", stage: "Late Stage",  category: "Foundation Models" },
  { name: "Anthropic",     website: "anthropic.com",     bg: "#92400e", valuation: "61B",  stage: "Series E",    category: "Foundation Models" },
  { name: "xAI",           website: "x.ai",              bg: "#27272a", valuation: "50B",  stage: "Series C",    category: "Foundation Models" },
  { name: "Databricks",    website: "databricks.com",    bg: "#dc2626", valuation: "43B",  stage: "Series J",    category: "Data & AI Platform" },
  { name: "Scale AI",      website: "scale.com",         bg: "#3b0764", valuation: "14B",  stage: "Series F",    category: "AI Infrastructure" },
  { name: "Cohere",        website: "cohere.com",        bg: "#0f766e", valuation: "5.5B", stage: "Series C",    category: "Enterprise AI" },
  { name: "Perplexity",    website: "perplexity.ai",     bg: "#1e3a5f", valuation: "9B",   stage: "Series B",    category: "AI Search" },
  { name: "Mistral AI",    website: "mistral.ai",        bg: "#c2410c", valuation: "6B",   stage: "Series B",    category: "Foundation Models" },
  { name: "Glean",         website: "glean.com",         bg: "#1d4ed8", valuation: "4.6B", stage: "Series E",    category: "Enterprise Search" },
  { name: "Harvey",        website: "harvey.ai",         bg: "#1c1917", valuation: "3B",   stage: "Series D",    category: "Legal AI" },
  { name: "Together AI",   website: "together.ai",       bg: "#0e7490", valuation: "3.3B", stage: "Series B",    category: "AI Infrastructure" },
  { name: "Poolside",      website: "poolside.ai",       bg: "#312e81", valuation: "3B",   stage: "Series B",    category: "AI Coding" },
  { name: "Wayve",         website: "wayve.ai",          bg: "#064e3b", valuation: "5B",   stage: "Series C",    category: "Autonomous Driving" },
  { name: "Instabase",     website: "instabase.com",     bg: "#1e40af", valuation: "2B",   stage: "Series C",    category: "Document AI" },
  { name: "Writer",        website: "writer.com",        bg: "#7c3aed", valuation: "1.9B", stage: "Series C",    category: "Enterprise AI" },
];

// ─── AI Unicorn data (Row 2) ─────────────────────────────────────────────────
const AI_UNICORNS_ROW2 = [
  { name: "Runway",        website: "runwayml.com",      bg: "#18181b", valuation: "1.5B", stage: "Series D",    category: "AI Video" },
  { name: "ElevenLabs",   website: "elevenlabs.io",     bg: "#1a1a2e", valuation: "3.3B", stage: "Series C",    category: "AI Voice" },
  { name: "Midjourney",   website: "midjourney.com",    bg: "#0f172a", valuation: "10B",  stage: "Bootstrapped", category: "AI Image" },
  { name: "Stability AI", website: "stability.ai",      bg: "#18181b", valuation: "4B",   stage: "Series A",    category: "Generative AI" },
  { name: "Character.AI", website: "character.ai",      bg: "#1e3a8a", valuation: "5B",   stage: "Series B",    category: "AI Companions" },
  { name: "Pika",         website: "pika.art",          bg: "#581c87", valuation: "470M", stage: "Series B",    category: "AI Video" },
  { name: "Imbue",        website: "imbue.com",         bg: "#1e3a5f", valuation: "1B",   stage: "Series B",    category: "AI Reasoning" },
  { name: "Sierra",       website: "sierra.ai",         bg: "#292524", valuation: "4.5B", stage: "Series B",    category: "AI Agents" },
  { name: "Hebbia",       website: "hebbia.ai",         bg: "#1c1917", valuation: "700M", stage: "Series B",    category: "AI Research" },
  { name: "Cognition",    website: "cognition.ai",      bg: "#312e81", valuation: "2B",   stage: "Series B",    category: "AI Coding" },
  { name: "LangChain",    website: "langchain.com",     bg: "#166534", valuation: "1B",   stage: "Series A",    category: "AI Dev Tools" },
  { name: "Adept AI",     website: "adept.ai",          bg: "#1e3a5f", valuation: "1B",   stage: "Series B",    category: "AI Agents" },
  { name: "Typeface",     website: "typeface.ai",       bg: "#1d4ed8", valuation: "1B",   stage: "Series B",    category: "AI Marketing" },
  { name: "Synthesia",    website: "synthesia.io",      bg: "#7c3aed", valuation: "2.1B", stage: "Series D",    category: "AI Video" },
  { name: "Hugging Face", website: "huggingface.co",    bg: "#ca8a04", valuation: "4.5B", stage: "Series D",    category: "ML Platform" },
];

// ─── Unicorn card — used inside marquee ──────────────────────────────────────
function UnicornCard({ unicorn }: { unicorn: typeof AI_UNICORNS[0] }) {
  return (
    <Link
      href={`/companies/${unicorn.name.toLowerCase().replace(/[\s.]/g, "-")}`}
      className="flex-shrink-0 group flex items-center gap-3 bg-white border border-ink-100 rounded-lg px-4 py-3 hover:border-accent-200 hover:shadow-sm transition-all duration-200 cursor-pointer"
      style={{ minWidth: 220 }}
    >
      <Logo name={unicorn.name} website={unicorn.website} bg={unicorn.bg} size={40} className="ring-1 ring-ink-100 flex-shrink-0" />
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-ink-900 truncate">{unicorn.name}</div>
        <div className="text-[11px] text-ink-400 truncate">{unicorn.category}</div>
        <div className="text-[12px] text-positive font-semibold tabular-nums mt-0.5">${unicorn.valuation}</div>
      </div>
      <div
        className="ml-auto flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
        style={{ background: "rgba(80,70,229,0.08)", color: "var(--color-accent-600)" }}
      >
        🦄
      </div>
    </Link>
  );
}

export default function CompaniesPage() {
  const [activeTab, setActiveTab] = useState("AI Agents");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [trendingList, setTrendingList] = useState<Company[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number; icon: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Hero search state ──────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // ── Explore section state ──────────────────────────────────────────────────
  const [exploreQuery, setExploreQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState("trending");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const catDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

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

  // Click-outside: hero search
  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  // Click-outside: category dropdown
  useEffect(() => {
    if (!catDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
        setCatDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [catDropdownOpen]);

  // Click-outside: sort dropdown
  useEffect(() => {
    if (!sortDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sortDropdownOpen]);

  // ── Hero search results ───────────────────────────────────────────────────
  const heroSearchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return companies
      .filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [query, companies]);

  const isSearching = query.trim().length > 0;

  // ── Explore section: combined search + category + sort ────────────────────
  const exploreResults = useMemo(() => {
    let list = [...companies];

    // category filter
    if (selectedCategory) {
      list = list.filter(c => c.category === selectedCategory);
    }

    // text search
    const q = exploreQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)),
      );
    }

    // sort
    switch (sortBy) {
      case "stage":
        list = list.sort((a, b) => (a.stage || "").localeCompare(b.stage || ""));
        break;
      case "growth":
        list = list.sort((a, b) => b.growth_score - a.growth_score);
        break;
      case "newest":
        list = list.sort((a, b) => (b.founded_year || 0) - (a.founded_year || 0));
        break;
      case "funded":
        list = list.sort((a, b) => (b.total_funding_usd || 0) - (a.total_funding_usd || 0));
        break;
      default: // trending
        list = list.sort((a, b) => (a.trending_rank || 99) - (b.trending_rank || 99));
    }

    return list;
  }, [companies, selectedCategory, exploreQuery, sortBy]);

  const unicorns = companies.filter(c => c.is_unicorn).slice(0, 5);
  const trending = trendingList.length
    ? trendingList.slice(0, 5)
    : companies
        .filter(c => c.trending_rank)
        .sort((a, b) => (a.trending_rank || 99) - (b.trending_rank || 99))
        .slice(0, 5);
  const fastestGrowing = companies
    .filter(c => c.growth_score > 85)
    .sort((a, b) => b.growth_score - a.growth_score)
    .slice(0, 5);
  const emerging = companies.filter(c => c.founded_year >= 2022 && !c.is_unicorn).slice(0, 4);
  const breakout = companies.filter(c => c.growth_score > 80).slice(0, 3);
  const recentlyFunded = companies
    .filter(c => c.last_funding_at)
    .sort((a, b) => (b.last_funding_at || "").localeCompare(a.last_funding_at || ""))
    .slice(0, 3);
  const watchlist = companies
    .filter(c => c.stage === "Series B" || c.stage === "Series A")
    .slice(0, 3);

  const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? "Trending";
  const hasExploreFilters = !!selectedCategory || !!exploreQuery.trim();

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
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-32 w-[560px] h-[560px] rounded-full bg-accent-600/30 blur-[120px]" />
          <div className="absolute top-20 -left-32 w-[420px] h-[420px] rounded-full bg-accent-500/20 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
            <div className="animate-fade-up min-w-0">
              <div className="inline-flex items-center gap-2 glass-dark text-white/90 text-meta font-semibold px-3 py-1.5 rounded-full mb-6 ring-1 ring-white/10">
                <Sparkles size={12} className="text-accent-400" />
                30,000+ AI COMPANIES TRACKED
              </div>
              <h1 className="text-display text-white mb-5">
                Discover the world's<br />most innovative<br />
                <span className="text-accent-400">AI companies</span>
              </h1>
              <p className="text-[17px] text-white/60 leading-relaxed mb-8 max-w-md">
                Explore AI startups, unicorns, frontier labs, and emerging companies shaping the
                future of artificial intelligence.
              </p>

              {/* ── Hero Search — fixed overflow ── */}
              <div ref={searchRef} className="relative w-full max-w-lg">
                <div className="flex items-center gap-2 glass rounded-lg px-3 py-2 w-full shadow-lg ring-1 ring-white/10">
                  <Search size={17} className="text-white/50 flex-shrink-0" />
                  <input
                    className="flex-1 min-w-0 outline-none text-[15px] text-white placeholder-white/40 bg-transparent"
                    placeholder="Search companies, categories…"
                    aria-label="Search AI companies"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setSearchOpen(true); }}
                    onFocus={() => setSearchOpen(true)}
                  />
                  {query && (
                    <button
                      onClick={() => { setQuery(""); setSearchOpen(false); }}
                      className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 transition-colors duration-150"
                      aria-label="Clear search"
                    >
                      <X size={11} />
                    </button>
                  )}
                  <button className="flex-shrink-0 px-4 h-9 bg-accent-500 rounded-sm flex items-center justify-center gap-1.5 text-white text-[13px] font-medium hover:bg-accent-600 transition-colors duration-150 shadow-accent whitespace-nowrap">
                    <span className="hidden sm:inline">Search</span>
                    <Search size={14} className="sm:hidden" />
                  </button>
                </div>

                {/* Live dropdown */}
                {isSearching && searchOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-ink-100 shadow-lg z-50 overflow-hidden">
                    {heroSearchResults.length === 0 ? (
                      <div className="px-4 py-5 text-center text-[14px] text-ink-400">
                        No companies found for &ldquo;{query}&rdquo;
                      </div>
                    ) : (
                      <>
                        <div className="px-4 py-2 border-b border-ink-50 text-meta text-ink-400 flex items-center justify-between">
                          <span>{heroSearchResults.length} result{heroSearchResults.length !== 1 ? "s" : ""}</span>
                          <button
                            onClick={() => {
                              setExploreQuery(query);
                              setQuery("");
                              setSearchOpen(false);
                              document.getElementById("explore-section")?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="text-accent-500 hover:text-accent-600 font-medium text-[12px] transition-colors duration-150"
                          >
                            See all in Explore →
                          </button>
                        </div>
                        {heroSearchResults.map(c => (
                          <Link
                            key={c.id}
                            href={`/companies/${c.slug}`}
                            onClick={() => { setQuery(""); setSearchOpen(false); }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-ink-50 transition-colors duration-100 group"
                          >
                            <Logo name={c.name} website={c.website} bg={c.logo_bg} size={36} />
                            <div className="flex-1 min-w-0">
                              <div className="text-[14px] font-semibold text-ink-900 truncate">
                                {c.name}
                              </div>
                              <div className="text-meta text-ink-400 truncate">{c.category}</div>
                            </div>
                            <ChevronRight size={14} className="text-ink-300 group-hover:text-ink-500 flex-shrink-0" />
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Floating logo cards */}
            <div className="hidden lg:grid grid-cols-3 gap-5 relative" aria-hidden="true">
              {[
                { name: "Cursor", website: "cursor.com", bg: "#312e81" },
                { name: "OpenAI", website: "openai.com", bg: "#18181b" },
                { name: "Perplexity", website: "perplexity.ai", bg: "#1e3a5f" },
                { name: "Anthropic", website: "anthropic.com", bg: "#92400e" },
                { name: "Mistral", website: "mistral.ai", bg: "#c2410c" },
                { name: "xAI", website: "x.ai", bg: "#27272a" },
              ].map((c, i) => {
                const gradients: Record<string, string> = {
                  "#312e81": "linear-gradient(145deg, #4338ca 0%, #312e81 60%, #1e1b4b 100%)",
                  "#18181b": "linear-gradient(145deg, #3f3f46 0%, #18181b 60%, #000000 100%)",
                  "#1e3a5f": "linear-gradient(145deg, #2563a8 0%, #1e3a5f 60%, #0f1f35 100%)",
                  "#92400e": "linear-gradient(145deg, #b45309 0%, #92400e 60%, #5c2d05 100%)",
                  "#c2410c": "linear-gradient(145deg, #ea580c 0%, #c2410c 60%, #7c2d12 100%)",
                  "#27272a": "linear-gradient(145deg, #52525b 0%, #27272a 60%, #09090b 100%)",
                };
                return (
                  <div
                    key={i}
                    className="animate-float relative"
                    style={{
                      marginTop: i % 3 === 1 ? "28px" : i % 3 === 2 ? "10px" : "0px",
                      animationDelay: `${i * 0.45}s`,
                      "--rot": `${(i % 2 === 0 ? -1 : 1) * 2}deg`,
                    } as React.CSSProperties}
                  >
                    <div
                      className="rounded-lg p-[1px] shadow-lg"
                      style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.03))" }}
                    >
                      <div
                        className="rounded-lg flex items-center justify-center"
                        style={{ width: 72, height: 72, background: gradients[c.bg] ?? c.bg }}
                      >
                        <Logo
                          name={c.name}
                          website={c.website}
                          bg={c.bg}
                          size={72}
                          rounded="rounded-lg"
                          theme="dark"
                          className="shadow-none ring-0 text-2xl"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
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
          <SectionHeader
            num={1}
            title="Trending AI companies"
            subtitle="The most searched, viewed and discussed AI companies right now."
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {trending.slice(0, 3).map(company => (
              <CompanyCard key={company.id} company={company} rank={company.trending_rank} variant="hero" />
            ))}
            <div className="sm:col-span-1 lg:col-span-2 flex flex-col gap-2.5">
              {trending.slice(3).map(company => (
                <Link
                  key={company.id}
                  href={`/companies/${company.slug}`}
                  className="flex items-center gap-3 p-3 bg-ink-50 rounded-lg hover:bg-ink-100 transition-colors duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                >
                  <Logo name={company.name} website={company.website} bg={company.logo_bg} size={40} />
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

        {/* ============ GROWTH + EMERGING — merged panel ============ */}
        <section className="py-14 border-b border-ink-100">
          <div className="rounded-xl overflow-hidden border border-ink-100 bg-ink-25">
            {/* Panel header */}
            <div className="px-7 pt-7 pb-5 flex items-start justify-between border-b border-ink-100">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-positive/10 ring-1 ring-positive/20 mb-3">
                  <TrendingUp size={11} className="text-positive" />
                  <span className="text-[11px] font-bold text-positive tracking-widest uppercase">Section 2 · Growth</span>
                </div>
                <h3 className="text-[18px] font-bold text-ink-900 leading-tight">Fastest-growing &amp; emerging AI startups</h3>
                <p className="text-ink-500 text-[13px] mt-0.5">Momentum leaders and breakout companies gaining real traction.</p>
              </div>
              <Link href="#" className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-ink-200 text-ink-500 text-[13px] hover:border-ink-400 hover:text-ink-700 transition-colors duration-150">
                View all <ChevronRight size={13} />
              </Link>
            </div>

            <div className="px-7 py-6">
              {/* Sub-row 1: Fastest Growing */}
              <div className="mb-7">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={14} className="text-positive" />
                  <span className="text-[13px] font-bold text-ink-900 uppercase tracking-wide">Fastest Growing</span>
                  <span className="text-[11px] text-ink-400 ml-1">· by growth score</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {fastestGrowing.map(company => (
                    <Link
                      key={company.id}
                      href={`/companies/${company.slug}`}
                      className="group flex flex-col items-center p-4 rounded-lg border border-ink-100 hover-lift text-center bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                    >
                      <Logo name={company.name} website={company.website} bg={company.logo_bg} size={48} className="mb-3" />
                      <div className="text-[13px] font-semibold text-ink-900 mb-0.5 truncate w-full">{company.name}</div>
                      <div className="text-meta text-ink-500 mb-2 truncate w-full">{company.category}</div>
                      <MiniSparkline />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-ink-100 mb-7" />

              {/* Sub-row 2: Emerging */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={14} className="text-accent-500" />
                  <span className="text-[13px] font-bold text-ink-900 uppercase tracking-wide">Emerging Startups</span>
                  <span className="text-[11px] text-ink-400 ml-1">· founded 2022+</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {emerging.map(company => (
                    <CompanyCard key={company.id} company={company} variant="grid" />
                  ))}
                </div>
              </div>

              {/* CTA strip */}
              <div className="mt-7 pt-5 border-t border-ink-100 flex items-center justify-between gap-4">
                <p className="text-[14px] text-ink-500">
                  Explore all growth leaders across the AI landscape.
                </p>
                <button className="flex items-center gap-2 bg-ink-900 text-white text-[14px] font-semibold px-4 py-2.5 rounded-sm hover:bg-ink-800 transition-colors duration-150 whitespace-nowrap">
                  Explore growth leaders <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============ SIGNAL PANELS ============ */}
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
                  <Link key={c.id} href={`/companies/${c.slug}`} className="flex items-center gap-3 p-2.5 bg-white rounded-sm hover:shadow-xs transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                    <Logo name={c.name} website={c.website} bg={c.logo_bg} size={36} />
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
                  <Link key={c.id} href={`/companies/${c.slug}`} className="flex items-center gap-3 hover:bg-white rounded-sm p-2.5 -mx-1 transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                    <Logo name={c.name} website={c.website} bg={c.logo_bg} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-ink-900 truncate">{c.name}</div>
                      <div className="text-meta text-positive font-medium">
                        {c.total_funding_usd >= 1e9
                          ? `$${(c.total_funding_usd / 1e9).toFixed(0)}B`
                          : `$${(c.total_funding_usd / 1e6).toFixed(0)}M`}{" "}{c.stage}
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
                  <Link key={c.id} href={`/companies/${c.slug}`} className="flex items-center gap-3 hover:bg-white rounded-sm p-2.5 -mx-1 transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                    <Logo name={c.name} website={c.website} bg={c.logo_bg} size={36} />
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

        {/* ============ UNICORNS — infinite marquee ============ */}
        <section className="py-14 border-b border-ink-100">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-sm bg-ink-900 text-white text-meta font-semibold flex items-center justify-center flex-shrink-0 mt-0.5 tabular-nums">3</span>
              <div>
                <h2 className="text-h2 text-ink-900">AI unicorns</h2>
                <p className="text-[14px] text-ink-500 mt-1">Private companies valued at $1B+ shaping the AI era.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[13px] text-ink-400 font-medium tabular-nums">{AI_UNICORNS.length} companies</span>
              <Link href="#" className="hidden sm:flex items-center gap-1 text-[14px] text-ink-500 hover:text-ink-900 font-medium transition-colors duration-150">
                View all <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Carousel */}
          <div className="marquee-root marquee-fade overflow-hidden rounded-xl border border-ink-100 bg-ink-25 py-5">
            {/* Row 1 — forward */}
            <div className="marquee-track gap-3 mb-3" style={{ gap: "12px" }}>
              {[...AI_UNICORNS, ...AI_UNICORNS].map((u, i) => (
                <UnicornCard key={`r1-${i}`} unicorn={u} />
              ))}
            </div>
            {/* Row 2 — reverse */}
            <div className="marquee-track-reverse" style={{ gap: "12px" }}>
              {[...AI_UNICORNS_ROW2, ...AI_UNICORNS_ROW2].map((u, i) => (
                <UnicornCard key={`r2-${i}`} unicorn={u} />
              ))}
            </div>
          </div>
          <p className="text-center text-[12px] text-ink-400 mt-3">Hover to pause · Click any card to explore</p>
        </section>

        {/* ============ FRONTIER LABS ============ */}
        <section className="py-14 border-b border-ink-100">
          <div className="rounded-xl overflow-hidden border border-ink-100 bg-ink-25">
            <div className="px-7 pt-7 pb-5 flex items-start justify-between border-b border-ink-100">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent-500/10 ring-1 ring-accent-500/20 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-accent-600 tracking-widest uppercase">Section 4 · Frontier</span>
                </div>
                <h3 className="text-[18px] font-bold text-ink-900 leading-tight">Frontier AI labs</h3>
                <p className="text-ink-500 text-[13px] mt-0.5">Organizations advancing the state of the art in foundation models.</p>
              </div>
              <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-ink-200 text-ink-500 text-[13px] hover:border-ink-400 hover:text-ink-700 transition-colors duration-150">
                View all <ChevronRight size={13} />
              </button>
            </div>
            <div className="px-7 py-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {FRONTIER_LABS.map(lab => (
                <div key={lab.name} className="group relative rounded-lg border border-ink-100 bg-white hover-lift overflow-hidden cursor-pointer">
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${lab.cardBg}`} />
                  <div className="relative p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Logo name={lab.name} website={lab.website} bg={lab.bg} size={40} className="ring-1 ring-ink-100 shadow-xs" />
                      <span className="text-xl" aria-hidden="true">{lab.badge}</span>
                    </div>
                    <div className="text-[13px] font-semibold text-ink-900 mb-0.5">{lab.name}</div>
                    <div className="text-[11px] text-ink-400 mb-2">est. {lab.founded}</div>
                    <p className="text-[12px] text-ink-500 leading-snug line-clamp-2 mb-3">{lab.tagline}</p>
                    <div className="pt-3 border-t border-ink-100">
                      <div
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{ background: lab.accentLight + "60", color: lab.accentColor }}
                      >
                        <ExternalLink size={10} />
                        <span>Foundation model</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ OPEN SOURCE ============ */}
        <section className="py-14 border-b border-ink-100">
          <div className="rounded-xl overflow-hidden border border-ink-100 bg-ink-25">
            <div className="px-7 pt-7 pb-5 flex items-start justify-between border-b border-ink-100">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-positive/10 ring-1 ring-positive/20 mb-3">
                  <GitCompare size={11} className="text-positive" />
                  <span className="text-[11px] font-bold text-positive tracking-widest uppercase">Section 5 · Open Source</span>
                </div>
                <h3 className="text-[18px] font-bold text-ink-900 leading-tight">Open source AI leaders</h3>
                <p className="text-ink-500 text-[13px] mt-0.5">The organisations driving open model development and community tooling.</p>
              </div>
            </div>
            <div className="px-7 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {OPEN_SOURCE_LEADERS.map(item => (
                <div key={item.name} className="group relative rounded-lg border border-ink-100 bg-white hover-lift overflow-hidden cursor-pointer">
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${item.gradient}`} />
                  <div className="relative p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Logo name={item.name} website={item.website} bg={item.bg} size={40} className="ring-1 ring-ink-100 shadow-xs" />
                      <span className="text-xl" aria-hidden="true">{item.badge}</span>
                    </div>
                    <div className="text-[13px] font-semibold text-ink-900 mb-1">{item.name}</div>
                    <p className="text-[12px] text-ink-500 leading-snug line-clamp-2 mb-3">{item.desc}</p>
                    <div className="flex items-center gap-3 pt-3 border-t border-ink-100">
                      <div className="flex items-center gap-1">
                        <GitCompare size={11} className="text-ink-400" />
                        <span className="text-[11px] text-ink-500 font-medium tabular-nums">★ {item.stars}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe size={11} className="text-ink-400" />
                        <span className="text-[11px] text-ink-500 font-medium tabular-nums">{item.models} models</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ EXPLORE ALL — merged with Browse by Category ============ */}
        <section id="explore-section" className="py-14 border-b border-ink-100">
          {/* Section header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-sm bg-ink-900 text-white text-meta font-semibold flex items-center justify-center flex-shrink-0 mt-0.5 tabular-nums">6</span>
              <div>
                <h2 className="text-h2 text-ink-900">Explore companies</h2>
                <p className="text-[14px] text-ink-500 mt-1">Search, filter by category, and sort — all in one place.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {hasExploreFilters && (
                <button
                  onClick={() => { setSelectedCategory(null); setExploreQuery(""); setSortBy("trending"); }}
                  className="flex items-center gap-1.5 px-3 py-2 border border-ink-200 rounded-sm text-[13px] text-ink-500 hover:border-ink-400 hover:text-ink-700 transition-colors duration-150 bg-white"
                >
                  <X size={12} /> Clear all
                </button>
              )}
            </div>
          </div>

          {/* ── Unified search + filter bar ── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            {/* Search input */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
              <input
                type="text"
                value={exploreQuery}
                onChange={e => setExploreQuery(e.target.value)}
                placeholder="Search companies, categories, descriptions…"
                className="w-full pl-9 pr-9 h-10 text-[14px] border border-ink-200 rounded-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all duration-150 bg-white text-ink-800 placeholder-ink-400"
              />
              {exploreQuery && (
                <button onClick={() => setExploreQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors duration-150">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category dropdown */}
            <div ref={catDropdownRef} className="relative">
              <button
                onClick={() => { setCatDropdownOpen(o => !o); setSortDropdownOpen(false); }}
                className={`flex items-center gap-2 px-3.5 h-10 border rounded-sm text-[13px] font-medium transition-colors duration-150 bg-white min-w-[160px] justify-between ${
                  selectedCategory ? "border-accent-400 text-accent-700 bg-accent-50" : "border-ink-200 text-ink-700 hover:border-ink-400"
                }`}
              >
                <span className="truncate">
                  {selectedCategory
                    ? (categories.find(c => c.name === selectedCategory)?.icon ?? "") + " " + selectedCategory
                    : "All categories"}
                </span>
                <ChevronRight size={13} className={`flex-shrink-0 text-ink-400 transition-transform duration-150 ${catDropdownOpen ? "rotate-[270deg]" : "rotate-90"}`} />
              </button>
              {catDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-60 bg-white border border-ink-100 rounded-lg shadow-lg z-40 overflow-hidden">
                  <div className="py-1 max-h-72 overflow-y-auto">
                    <button
                      onClick={() => { setSelectedCategory(null); setCatDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-ink-50 transition-colors duration-100 flex items-center justify-between ${!selectedCategory ? "text-accent-600 font-semibold bg-accent-50" : "text-ink-700"}`}
                    >
                      All categories
                      {!selectedCategory && <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />}
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.name}
                        onClick={() => { setSelectedCategory(cat.name); setCatDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-ink-50 transition-colors duration-100 flex items-center justify-between gap-2 ${selectedCategory === cat.name ? "text-accent-600 font-semibold bg-accent-50" : "text-ink-700"}`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span aria-hidden="true">{cat.icon}</span>
                          <span className="truncate">{cat.name}</span>
                        </span>
                        <span className="text-ink-400 text-[11px] flex-shrink-0">{cat.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sort dropdown */}
            <div ref={sortDropdownRef} className="relative">
              <button
                onClick={() => { setSortDropdownOpen(o => !o); setCatDropdownOpen(false); }}
                className="flex items-center gap-2 px-3.5 h-10 border border-ink-200 rounded-sm text-[13px] text-ink-700 bg-white hover:border-ink-400 transition-colors duration-150 font-medium min-w-[150px] justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal size={13} className="text-ink-400" />
                  {activeSortLabel}
                </span>
                <ChevronRight size={13} className={`flex-shrink-0 text-ink-400 transition-transform duration-150 ${sortDropdownOpen ? "rotate-[270deg]" : "rotate-90"}`} />
              </button>
              {sortDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-ink-100 rounded-lg shadow-lg z-40 overflow-hidden">
                  <div className="py-1">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-ink-50 transition-colors duration-100 flex items-center justify-between ${sortBy === opt.value ? "text-accent-600 font-semibold bg-accent-50" : "text-ink-700"}`}
                      >
                        {opt.label}
                        {sortBy === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 border ${
                !selectedCategory ? "bg-ink-900 text-white border-ink-900" : "bg-white text-ink-600 border-ink-200 hover:border-ink-400"
              }`}
            >
              All
            </button>
            {categories.slice(0, 10).map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 border ${
                  selectedCategory === cat.name ? "bg-ink-900 text-white border-ink-900" : "bg-white text-ink-600 border-ink-200 hover:border-ink-400"
                }`}
              >
                <span aria-hidden="true">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
            <button
              onClick={() => setCatDropdownOpen(true)}
              className="flex-shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[13px] font-medium border border-dashed border-ink-300 text-ink-500 hover:border-ink-400 transition-colors duration-150 bg-white"
            >
              More <ChevronRight size={12} />
            </button>
          </div>

          {/* Active filter badge */}
          {hasExploreFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-50 border border-accent-200 text-[13px] text-accent-700 font-medium">
                  {categories.find(c => c.name === selectedCategory)?.icon} {selectedCategory}
                  <button onClick={() => setSelectedCategory(null)} className="hover:text-accent-900 transition-colors duration-100 ml-0.5"><X size={11} /></button>
                </span>
              )}
              {exploreQuery.trim() && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ink-100 border border-ink-200 text-[13px] text-ink-700 font-medium">
                  &ldquo;{exploreQuery}&rdquo;
                  <button onClick={() => setExploreQuery("")} className="hover:text-ink-900 transition-colors duration-100 ml-0.5"><X size={11} /></button>
                </span>
              )}
              <span className="text-[13px] text-ink-400">{exploreResults.length} result{exploreResults.length !== 1 ? "s" : ""}</span>
            </div>
          )}

          {/* Results list */}
          {exploreResults.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-ink-200 rounded-lg">
              <div className="text-[15px] text-ink-400 mb-1">No companies match your filters</div>
              <button onClick={() => { setSelectedCategory(null); setExploreQuery(""); setSortBy("trending"); }} className="text-accent-500 hover:text-accent-600 text-[14px] font-medium transition-colors duration-150 mt-2">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {exploreResults.slice(0, hasExploreFilters ? 20 : 8).map(company => (
                <CompanyCard key={company.id} company={company} variant="default" />
              ))}
            </div>
          )}

          {/* Footer count */}
          <div className="text-center mt-6 flex items-center justify-center gap-3">
            <span className="text-meta text-ink-400">
              {hasExploreFilters
                ? `Showing ${Math.min(20, exploreResults.length)} of ${exploreResults.length} matches`
                : "30,000+ companies tracked"}
            </span>
            {!hasExploreFilters && (
              <Link href="#" className="text-[13px] text-accent-500 hover:text-accent-600 font-medium transition-colors duration-150 flex items-center gap-1">
                Browse all <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </section>

        {/* ============ NEWSLETTER ============ */}
        <section className="py-14">
          <div className="rounded-lg bg-ink-25 border border-ink-100 px-5 sm:px-8 py-9 flex flex-col sm:flex-row items-center justify-between gap-7">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-11 h-11 rounded-sm bg-accent-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-accent">
                G
              </div>
              <div className="min-w-0">
                <h3 className="text-[16px] font-bold text-ink-900">Be the first to discover what's next in AI</h3>
                <p className="text-[14px] text-ink-500 mt-0.5">Join thousands of builders, investors and researchers.</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto min-w-0">
              <input
                type="email"
                aria-label="Email address"
                className="flex-1 min-w-0 sm:w-64 text-[14px] border border-ink-200 rounded-sm px-4 h-11 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all duration-150 bg-white"
                placeholder="Enter your email"
              />
              <button className="flex-shrink-0 px-5 h-11 bg-ink-900 text-white text-[14px] font-semibold rounded-sm hover:bg-ink-800 transition-colors duration-150 whitespace-nowrap">
                Get updates
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}