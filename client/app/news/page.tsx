"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search, ChevronRight, ExternalLink, Flame,
  Home, Rocket, Package, Wallet, Briefcase, Newspaper, Mail,
} from "lucide-react";
import { getNews, getTrendingNews } from "@/lib/api";
import type { NewsArticle } from "@/lib/types";

export const dynamic='force-dynamic';

const sidebarNav = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Rocket, label: "AI Startups", href: "/companies" },
  { icon: Package, label: "AI Products", href: "/products" },
  { icon: Wallet, label: "Investors", href: "/investors" },
  { icon: Briefcase, label: "Jobs", href: "/jobs" },
  { icon: Newspaper, label: "News", href: "/news", active: true },
];

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;
  return `${Math.floor(months / 12)} yr ago`;
}

const PAGE_SIZE = 20;

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [trending, setTrending] = useState<NewsArticle[]>([]);
  const [activeTag, setActiveTag] = useState("All");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Derive the full tag list once from a large unfiltered batch (server has no distinct-tags endpoint).
  useEffect(() => {
    getNews({ pageSize: 100 }).then(({ data }) => {
      setAllTags(Array.from(new Set(data.map(a => a.tag).filter(Boolean))));
    });
    getTrendingNews().then(setTrending);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const handle = setTimeout(() => {
      getNews({ page, pageSize: PAGE_SIZE, tag: activeTag, search }).then(({ data, total }) => {
        if (!active) return;
        setArticles(data);
        setTotal(total);
        setLoading(false);
      });
    }, search ? 300 : 0);
    return () => { active = false; clearTimeout(handle); };
  }, [page, activeTag, search]);

  const tags = ["All", ...allTags];
  const filtered = articles;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function changeTag(tag: string) {
    setActiveTag(tag);
    setPage(1);
  }

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  if (loading && articles.length === 0 && total === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="skeleton rounded-lg h-10 w-72 mb-4" />
          <div className="skeleton rounded-lg h-5 w-96 mb-10" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton rounded-lg h-20" />)}
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
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <section className="border-b border-ink-100 bg-gradient-to-br from-white via-red-50/10 to-white">
            <div className="max-w-4xl mx-auto px-6 py-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 text-xs text-accent-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
                  LIVE AI INTELLIGENCE
                </span>
              </div>
              <h1 className="text-3xl font-bold text-ink-900 leading-tight mb-3">
                AI News, <span className="text-accent-600">tracked daily.</span>
              </h1>
              <p className="text-ink-500 text-sm mb-5">Funding, launches, research, and policy across the AI economy.</p>
              <div className="flex items-center gap-3 bg-white border border-ink-200 rounded-sm px-4 py-3 shadow-sm max-w-lg">
                <Search size={16} className="text-ink-400 flex-shrink-0" />
                <input
                  value={search}
                  onChange={e => changeSearch(e.target.value)}
                  className="flex-1 outline-none text-[14px] text-ink-700 placeholder-ink-400 min-w-0"
                  placeholder="Search news…"
                />
              </div>
            </div>
          </section>

          <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
            {/* Tag tabs */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide border-b border-ink-100 pb-0">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => changeTag(tag)}
                  className={`flex-shrink-0 px-4 py-2.5 text-[14px] font-medium border-b-2 transition-colors duration-150 ${
                    activeTag === tag
                      ? "border-accent-500 text-accent-600"
                      : "border-transparent text-ink-500 hover:text-ink-900"
                  }`}>
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-bold text-ink-900 tracking-wide uppercase">Latest</h2>
              <div className="text-meta text-ink-400">{total.toLocaleString()} articles</div>
            </div>

            {/* Article list */}
            <div className={`space-y-0.5 transition-opacity duration-150 ${loading ? "opacity-50" : "opacity-100"}`}>
              {filtered.map(article => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 py-4 px-2 border-b border-ink-100 hover:bg-ink-50/50 rounded-sm transition-colors duration-150 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {article.tag && (
                        <span className="text-meta px-2 py-0.5 bg-ink-100 rounded-full text-ink-600 flex-shrink-0">{article.tag}</span>
                      )}
                      <span className="text-meta text-ink-400">{article.source}</span>
                      <span className="text-meta text-ink-300">·</span>
                      <span className="text-meta text-ink-400">{timeAgo(article.published_at)}</span>
                    </div>
                    <h3 className="font-semibold text-ink-900 text-[15px] leading-snug group-hover:text-accent-600 transition-colors duration-150">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="text-meta text-ink-500 mt-1 line-clamp-2 leading-relaxed">{article.summary}</p>
                    )}
                  </div>
                  <ExternalLink size={14} className="text-ink-300 group-hover:text-accent-500 transition-colors duration-150 flex-shrink-0 mt-1" />
                </a>
              ))}
              {filtered.length === 0 && (
                <p className="text-ink-400 text-[14px] py-10 text-center">No articles match this filter yet.</p>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-4">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-[14px] font-medium text-ink-600 disabled:text-ink-300 hover:text-ink-900 disabled:hover:text-ink-300 transition-colors duration-150"
                >
                  ← Prev
                </button>
                <span className="text-meta text-ink-400">Page {page} of {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 text-[14px] font-medium text-ink-600 disabled:text-ink-300 hover:text-ink-900 disabled:hover:text-ink-300 transition-colors duration-150"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="hidden xl:flex flex-col w-72 flex-shrink-0 border-l border-ink-100 min-h-[calc(100vh-64px)] sticky top-16 h-[calc(100vh-64px)] overflow-y-auto p-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame size={14} className="text-accent-600" />
              <h3 className="text-[14px] font-bold text-ink-900">Trending — last 24h</h3>
            </div>
            <div className="space-y-3">
              {trending.length === 0 && (
                <p className="text-meta text-ink-400">No trending articles in the last 24h yet.</p>
              )}
              {trending.map((article, i) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 group"
                >
                  <span className="text-meta text-ink-300 font-bold tabular-nums w-4 flex-shrink-0 pt-0.5">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink-800 leading-snug group-hover:text-accent-600 transition-colors duration-150 line-clamp-2">
                      {article.title}
                    </p>
                    <span className="text-meta text-ink-400">{article.source}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

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