"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { search as apiSearch } from "@/lib/api";

const navLinks = [
  { label: "Companies", href: "/companies" },
  { label: "Products",  href: "/products"  },
  { label: "Investors", href: "/investors" },
  { label: "Funding",   href: "/funding"   },
  { label: "Jobs",      href: "/jobs"      },
  { label: "News",      href: "/news"      },
];

type SearchResult = { type: string; name: string; href: string; tag: string };

const typeColors: Record<string, string> = {
  Company:  "var(--accent)",
  Investor: "#6a4cf5",
  Product:  "#22c55e",
};

export default function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen]   = useState(false);
  const [query,      setQuery]        = useState("");
  const [results,    setResults]      = useState<SearchResult[]>([]);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [scrolled,   setScrolled]     = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  /* scroll detection for blur intensification */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* typeahead */
  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      const { companies, investors, products } = await apiSearch(query);
      setResults([
        ...companies.slice(0, 3).map(c => ({ type: "Company",  name: c.name, href: `/companies/${c.slug}`, tag: c.category })),
        ...investors.slice(0, 2).map(i => ({ type: "Investor", name: i.name, href: `/investors/${i.slug}`, tag: i.type })),
        ...products.slice(0, 2) .map(p => ({ type: "Product",  name: p.name, href: `/products`,           tag: p.category })),
      ]);
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  /* keyboard shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !searchOpen && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault(); setSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") { setSearchOpen(false); setQuery(""); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  /* click-outside */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false); setQuery("");
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 200,
        background: scrolled
          ? "rgba(9,9,9,0.92)"
          : "rgba(9,9,9,0.80)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${scrolled ? "var(--hairline)" : "var(--hairline-soft)"}`,
        transition: "background 200ms, border-color 200ms",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", height: 56, gap: 24 }}>

          {/* Logo */}
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, textDecoration: "none" }}
          >
            <div style={{
              width: 28, height: 28,
              borderRadius: "var(--r-md)",
              background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 12, fontWeight: 800, letterSpacing: "-0.5px",
              boxShadow: "0 2px 8px rgba(255,59,87,0.4)",
            }}>G</div>
            <span style={{ color: "var(--ink)", fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px" }}>
              graph<span style={{ color: "var(--ink-muted)", fontWeight: 400 }}>one</span>
            </span>
          </Link>

          {/* Search */}
          <div ref={searchRef} style={{ position: "relative", flex: 1, maxWidth: 380 }}>
            <div
              onClick={() => { setSearchOpen(true); inputRef.current?.focus(); }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: searchOpen ? "var(--surface-2)" : "var(--surface-1)",
                borderRadius: "var(--r-pill)",
                padding: "8px 14px",
                cursor: "text",
                border: `1px solid ${searchOpen ? "var(--surface-3)" : "var(--hairline)"}`,
                transition: "all var(--dur-base)",
              }}
            >
              <Search size={13} style={{ color: "var(--ink-muted)", flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search companies, founders, investors…"
                style={{
                  flex: 1, background: "transparent",
                  color: "var(--ink)", fontSize: 13, outline: "none",
                  border: "none", minWidth: 0,
                }}
              />
              <kbd style={{
                fontSize: 10, color: "var(--ink-dim)",
                background: "var(--surface-2)",
                border: "1px solid var(--hairline)",
                borderRadius: "var(--r-xs)",
                padding: "2px 5px",
                fontFamily: "inherit",
                flexShrink: 0,
              }}>/</kbd>
            </div>

            {searchOpen && results.length > 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)",
                left: 0, right: 0,
                background: "var(--surface-2)",
                border: "1px solid var(--hairline)",
                borderRadius: "var(--r-xl)",
                overflow: "hidden",
                boxShadow: "var(--shadow-lg)",
                zIndex: 300,
              }}>
                {results.map((r, i) => (
                  <Link
                    key={i}
                    href={r.href}
                    onClick={() => { setSearchOpen(false); setQuery(""); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 16px",
                      textDecoration: "none",
                      borderBottom: i < results.length - 1 ? "1px solid var(--hairline-soft)" : "none",
                      transition: "background var(--dur-fast)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-3)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      color: typeColors[r.type] ?? "var(--ink-muted)",
                      minWidth: 52, letterSpacing: "0.3px",
                      background: "rgba(255,255,255,0.04)",
                      padding: "2px 6px", borderRadius: "var(--r-xs)",
                    }}>{r.type.toUpperCase()}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", flex: 1 }}>{r.name}</span>
                    <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>{r.tag}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Nav links */}
          <nav style={{ display: "none", alignItems: "center", gap: 2 }} className="lg-nav">
            <style>{`@media (min-width: 1024px) { .lg-nav { display: flex !important; } }`}</style>
            {navLinks.map(link => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "var(--r-pill)",
                    fontSize: 13, fontWeight: active ? 600 : 400,
                    color: active ? "var(--ink)" : "var(--ink-muted)",
                    background: active ? "var(--surface-2)" : "transparent",
                    textDecoration: "none",
                    transition: "all var(--dur-fast)",
                    border: active ? "1px solid var(--hairline)" : "1px solid transparent",
                    letterSpacing: "-0.1px",
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "var(--ink)"; e.currentTarget.style.background = "var(--surface-1)"; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "var(--ink-muted)"; e.currentTarget.style.background = "transparent"; }}}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button className="btn-secondary" style={{ padding: "7px 16px", fontSize: 13, display: "none" }} id="login-btn">
              Log in
            </button>
            <style>{`@media (min-width: 640px) { #login-btn { display: inline-flex !important; } }`}</style>
            <Link href="/signup" className="btn-accent" style={{ padding: "7px 16px", fontSize: 13 }}>
              Sign up
            </Link>
            <button
              style={{
                display: "none", padding: 8,
                background: "var(--surface-1)", border: "1px solid var(--hairline)",
                borderRadius: "var(--r-md)", color: "var(--ink)", cursor: "pointer",
              }}
              id="mobile-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <style>{`@media (max-width: 1023px) { #mobile-btn { display: flex !important; } }`}</style>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          borderTop: "1px solid var(--hairline)",
          background: "var(--surface-1)",
          padding: "12px 24px 16px",
        }}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block",
                padding: "10px 12px",
                borderRadius: "var(--r-md)",
                fontSize: 14, fontWeight: 400,
                color: pathname.startsWith(link.href) ? "var(--ink)" : "var(--ink-muted)",
                background: pathname.startsWith(link.href) ? "var(--surface-2)" : "transparent",
                textDecoration: "none",
                marginBottom: 2,
              }}
            >{link.label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}