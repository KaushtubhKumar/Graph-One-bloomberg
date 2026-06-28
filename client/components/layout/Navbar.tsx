"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, Menu, X } from "lucide-react";
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
  const searchRef = useRef<HTMLDivElement>(null);

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
      if (e.key === "/" && !searchOpen) { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") { setSearchOpen(false); setQuery(""); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [searchOpen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false); setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#FF3B57] flex items-center justify-center text-white text-xs font-bold">G</div>
            <span className="font-semibold text-gray-900 text-sm">graphone</span>
          </Link>

          {/* Search */}
          <div ref={searchRef} className="relative flex-1 max-w-sm">
            <div
              className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 cursor-text border border-transparent hover:border-gray-200 transition-colors"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search companies, founders, products, investors..."
                className="flex-1 bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none min-w-0"
              />
              <kbd className="hidden sm:flex items-center gap-1 text-xs text-gray-400 bg-gray-200 rounded px-1.5 py-0.5">/</kbd>
            </div>

            {searchOpen && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                {results.map((r, i) => (
                  <Link key={i} href={r.href} onClick={() => { setSearchOpen(false); setQuery(""); }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                    <span className="text-xs text-gray-400 w-14 flex-shrink-0">{r.type}</span>
                    <span className="text-sm font-medium text-gray-900">{r.name}</span>
                    <span className="ml-auto text-xs text-gray-400">{r.tag}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? "text-[#FF3B57] bg-red-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button className="hidden sm:flex items-center text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5">
              Log In
            </button>
            <Link href="/signup"
              className="hidden sm:flex items-center px-4 py-1.5 bg-[#FF3B57] text-white text-sm font-semibold rounded-lg hover:bg-[#e0324c] transition-colors">
              Sign up
            </Link>
            <button
              className="lg:hidden p-2 text-gray-600"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
