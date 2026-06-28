"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { search as apiSearch } from "@/lib/api";

const navLinks = [
  { label: "Companies", href: "/companies" },
  { label: "Products", href: "/products" },
  { label: "Investors", href: "/investors" },
  { label: "Funding", href: "/funding" },
  { label: "Jobs", href: "/jobs" },
  { label: "News", href: "/news" },
];

type SearchResult = { type: string; name: string; href: string; tag: string };

export default function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      const { companies, investors, products } = await apiSearch(query);
      setResults([
        ...companies.slice(0, 3).map(c => ({ type: "Company", name: c.name, href: `/companies/${c.slug}`, tag: c.category })),
        ...investors.slice(0, 2).map(i => ({ type: "Investor", name: i.name, href: `/investors/${i.slug}`, tag: i.type })),
        ...products.slice(0, 2).map(p => ({ type: "Product", name: p.name, href: `/products`, tag: p.category })),
      ]);
    }, 200); // debounce typeahead requests
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (e.key === "/" && !isTyping) { e.preventDefault(); setSearchOpen(true); inputRef.current?.focus(); }
      if (e.key === "Escape") { setSearchOpen(false); setQuery(""); inputRef.current?.blur(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false); setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-220 ease-out ${
        scrolled ? "glass shadow-sm" : "bg-white/0"
      }`}
    >
      <div className={`border-b transition-colors duration-220 ${scrolled ? "border-ink-100" : "border-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center h-16 gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-8 h-8 rounded-sm bg-accent-500 flex items-center justify-center text-white text-sm font-bold shadow-accent transition-transform duration-220 ease-out group-hover:scale-105">
                G
              </div>
              <span className="font-semibold text-ink-900 text-[15px] tracking-tight">GraphOne</span>
            </Link>

            {/* Nav links */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
              {navLinks.map(link => {
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3.5 py-2 rounded-sm text-[14px] font-medium transition-colors duration-150 ${
                      active ? "text-ink-900" : "text-ink-500 hover:text-ink-900 hover:bg-ink-50"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute left-3.5 right-3.5 -bottom-[1px] h-[2px] bg-accent-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Search — full bar on tablet+, icon-only trigger on mobile to prevent overflow */}
            <div ref={searchRef} className="relative flex-1 max-w-xs ml-auto hidden md:block">
              <div
                className={`flex items-center gap-2 rounded-sm px-3 h-9 cursor-text border transition-all duration-150 ${
                  searchOpen ? "border-accent-500 ring-2 ring-accent-100 bg-white" : "border-ink-200 bg-ink-50 hover:bg-ink-100"
                }`}
                onClick={() => { setSearchOpen(true); inputRef.current?.focus(); }}
              >
                <Search size={15} className="text-ink-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search companies, investors…"
                  aria-label="Search GraphOne"
                  className="flex-1 bg-transparent text-[14px] text-ink-700 placeholder-ink-400 outline-none min-w-0"
                />
                <kbd className="hidden sm:flex items-center justify-center text-[11px] text-ink-400 bg-white border border-ink-200 rounded-[6px] w-5 h-5 flex-shrink-0">/</kbd>
              </div>

              {searchOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-ink-100 overflow-hidden z-50 animate-fade-up">
                  {results.map((r, i) => (
                    <Link key={i} href={r.href} onClick={() => { setSearchOpen(false); setQuery(""); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-ink-50 transition-colors duration-150">
                      <span className="text-meta text-ink-400 w-16 flex-shrink-0">{r.type}</span>
                      <span className="text-[14px] font-medium text-ink-900 truncate">{r.name}</span>
                      <span className="ml-auto text-meta text-ink-400 flex-shrink-0">{r.tag}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-1 flex-shrink-0 ml-auto md:ml-0">
              <button className="hidden sm:flex items-center text-[14px] text-ink-600 hover:text-ink-900 font-medium px-3 py-2 rounded-sm transition-colors duration-150">
                Log in
              </button>
              <Link href="/signup"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-ink-900 text-white text-[14px] font-medium rounded-sm hover:bg-ink-800 transition-all duration-150 shadow-xs hover:shadow-sm">
                Sign up
                <ArrowRight size={14} className="transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
              <button
                className="md:hidden p-2 text-ink-600 rounded-sm hover:bg-ink-50 transition-colors"
                onClick={() => { setMobileSearchOpen(!mobileSearchOpen); setMobileOpen(false); }}
                aria-label="Toggle search"
                aria-expanded={mobileSearchOpen}
              >
                <Search size={20} />
              </button>
              <button
                className="lg:hidden p-2 -mr-1 text-ink-600 rounded-sm hover:bg-ink-50 transition-colors"
                onClick={() => { setMobileOpen(!mobileOpen); setMobileSearchOpen(false); }}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search row */}
      {mobileSearchOpen && (
        <div className="md:hidden border-b border-ink-100 bg-white px-4 py-3 animate-fade-up">
          <div className="flex items-center gap-2 rounded-sm px-3 h-10 border border-accent-500 ring-2 ring-accent-100 bg-white">
            <Search size={16} className="text-ink-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search companies, investors…"
              aria-label="Search GraphOne"
              autoFocus
              className="flex-1 bg-transparent text-[14px] text-ink-700 placeholder-ink-400 outline-none min-w-0"
            />
          </div>
          {results.length > 0 && (
            <div className="mt-2 bg-white rounded-lg border border-ink-100 overflow-hidden divide-y divide-ink-50">
              {results.map((r, i) => (
                <Link key={i} href={r.href} onClick={() => { setMobileSearchOpen(false); setQuery(""); }}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-ink-50 transition-colors duration-150">
                  <span className="text-meta text-ink-400 w-16 flex-shrink-0">{r.type}</span>
                  <span className="text-[14px] font-medium text-ink-900 truncate">{r.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-ink-100 bg-white px-4 py-3 space-y-0.5 animate-fade-up">
          {navLinks.map(link => {
            const active = pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href}
                className={`block px-3 py-2.5 rounded-sm text-[14px] font-medium transition-colors ${
                  active ? "text-accent-600 bg-accent-50" : "text-ink-600 hover:bg-ink-50"
                }`}
                onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
