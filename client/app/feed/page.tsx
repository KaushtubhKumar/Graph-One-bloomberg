"use client";

/**
 * /feed — Live Feed page
 *
 * Verified against the real CompanyCard.tsx / Logo.tsx / globals.css (you
 * uploaded these after my first pass). Notes on what changed:
 *
 * - Logo and CompanyCard are default exports, not named — fixed.
 * - Logo requires a `bg` hex color — fixed (funding rows now carry
 *   company_logo_bg; new_company rows go through CompanyCard which handles
 *   its own Logo call).
 * - There's no shared SectionHeader component — it's a local function inside
 *   app/companies/page.tsx. Copied verbatim below so this page matches it
 *   exactly, with viewAll defaulted off (no list for "View all" to point to
 *   on this page).
 * - Swapped guessed Tailwind sizes for the real type-scale classes
 *   (text-h2, text-meta) and semantic color tokens (positive/info/warning +
 *   their -bg pairs) found in globals.css.
 *
 * Still unverified: the exact shape of GET /api/feed's `data` payloads, and
 * whether `lib/types.ts` exports `Company` with exactly the fields used here
 * (reconstructed from grep across CompanyCard.tsx + the companies pages —
 * see api.additions.ts for the full field list).
 */

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getFeed, type FeedItem } from "@/lib/api";
import type { Company } from "@/lib/types";
import Logo from "@/components/shared/Logo";
import CompanyCard from "@/components/companies/CompanyCard";

// Copied from app/companies/page.tsx so this page matches it exactly —
// extract to components/shared/SectionHeader.tsx and import in both places
// if you'd rather not duplicate it.
function SectionHeader({
  num, title, subtitle, viewAll = false,
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

type FilterKey = "all" | "news" | "funding_round" | "new_company";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "news", label: "News" },
  { key: "funding_round", label: "Funding" },
  { key: "new_company", label: "New Companies" },
];

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Data fetching — not derived state, so useEffect is the right tool here
  // (the "no useEffect for filtering" rule is about client-side filtering,
  // not network calls). The `cancelled` flag is the standard pattern for
  // surviving React Strict Mode's deliberate mount→cleanup→remount in dev:
  // the first (cancelled) mount's fetch result gets ignored, the second
  // mount's fetch is the one that actually completes and sets state.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getFeed(page)
      .then((next) => {
        if (cancelled) return;
        setItems((prev) => (page === 1 ? next : [...prev, ...next]));
        setHasMore(next.length > 0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setPage((p) => p + 1);
  }, [loading, hasMore]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "600px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  // Derived/filtered state — useMemo, per the rules
  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      all: items.length,
      news: 0,
      funding_round: 0,
      new_company: 0,
    };
    for (const item of items) c[item.type as FilterKey]++;
    return c;
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return items;
    return items.filter((item) => item.type === activeFilter);
  }, [items, activeFilter]);

  const stats = useMemo(() => {
    const totalFunding = items
      .filter((i): i is FeedItem & { type: "funding_round" } => i.type === "funding_round")
      .reduce((sum, i) => sum + (i.data.amount ?? 0), 0);
    return { totalFunding };
  }, [items]);

  return (
    <main className="min-h-screen bg-ink-25">
      {/* Top strip — dense Bloomberg-style numbers, dark by design (not a card) */}
      <div className="border-b border-ink-100 bg-ink-900">
        <div className="mx-auto flex max-w-[1400px] items-center gap-8 overflow-x-auto px-6 py-3 scrollbar-hide">
          <StripStat label="Items" value={items.length.toLocaleString()} />
          <StripStat label="Funding rounds" value={counts.funding_round.toLocaleString()} accent />
          <StripStat label="New companies" value={counts.new_company.toLocaleString()} />
          <StripStat label="Tracked capital" value={formatCompact(stats.totalFunding)} accent />
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <SectionHeader
          num={1}
          title="Live Feed"
          subtitle="News, funding rounds, and new companies, ranked by recency"
        />

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
          {/* Sidebar filters */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-lg border border-ink-100 bg-white p-2">
              {FILTERS.map((f) => {
                const active = activeFilter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-accent-50 font-medium text-accent-700"
                        : "text-ink-600 hover:bg-ink-25"
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className={active ? "text-accent-600" : "text-ink-400"}>
                      {counts[f.key]}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Feed list */}
          <div className="rounded-lg border border-ink-100 bg-white">
            <div className="divide-y divide-ink-100">
              {filteredItems.map((item, idx) => (
                <FeedRow key={`${item.type}-${item.date}-${idx}`} item={item} />
              ))}
            </div>

            {loading && (
              <div className="space-y-3 p-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="skeleton h-16 rounded-sm" />
                ))}
              </div>
            )}

            {!loading && filteredItems.length === 0 && (
              <div className="p-10 text-center text-sm text-ink-400">
                Nothing here yet — check back soon.
              </div>
            )}

            <div ref={sentinelRef} />

            {!loading && hasMore && filteredItems.length > 0 && (
              <div className="flex justify-center p-4">
                <button
                  onClick={loadMore}
                  className="rounded-sm border border-ink-100 px-4 py-2 text-sm text-ink-600 hover:bg-ink-25"
                >
                  Load more
                </button>
              </div>
            )}

            {!hasMore && filteredItems.length > 0 && (
              <div className="p-4 text-center text-meta text-ink-400">You're all caught up.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function StripStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="text-meta uppercase tracking-wide text-ink-400">{label}</span>
      <span className={`text-sm font-semibold ${accent ? "text-accent-400" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}

function formatCompact(n: number) {
  if (!n) return "$0";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function FeedRow({ item }: { item: FeedItem }) {
  switch (item.type) {
    case "news":
      return <NewsRow headline={item.data.headline} source={item.data.source} url={item.data.url} tag={item.data.tag} date={item.date} />;
    case "funding_round":
      return (
        <FundingRow
          companyName={item.data.company_name}
          companySlug={item.data.company_slug}
          companyWebsite={item.data.company_website}
          companyLogoBg={item.data.company_logo_bg}
          roundType={item.data.round_type}
          amount={item.data.amount}
          amountDisplay={item.data.amount_display}
          date={item.date}
        />
      );
    case "new_company":
      return <NewCompanyRow company={item.data} date={item.date} />;
    default:
      return null;
  }
}

function NewsRow({
  headline,
  source,
  url,
  tag,
  date,
}: {
  headline: string;
  source: string;
  url: string;
  tag?: string;
  date: string;
}) {
  return (
    <div className="hover-lift flex items-start gap-4 p-4">
      <span className="mt-0.5 shrink-0 rounded-sm bg-info-bg px-2 py-0.5 text-[11px] font-medium text-info">
        {tag ?? "News"}
      </span>
      <div className="min-w-0 flex-1">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-ink-900 hover:text-accent-600"
        >
          {headline}
        </a>
        <div className="mt-1 text-meta text-ink-400">{source}</div>
      </div>
      <span className="shrink-0 text-meta text-ink-400">{timeAgo(date)}</span>
    </div>
  );
}

function FundingRow({
  companyName,
  companySlug,
  companyWebsite,
  companyLogoBg,
  roundType,
  amount,
  amountDisplay,
  date,
}: {
  companyName: string;
  companySlug: string;
  companyWebsite?: string;
  companyLogoBg: string;
  roundType: string;
  amount: number;
  amountDisplay?: string;
  date: string;
}) {
  return (
    <div className="hover-lift flex items-center gap-4 p-4">
      <Logo name={companyName} website={companyWebsite} bg={companyLogoBg} size={36} />
      <div className="min-w-0 flex-1">
        <Link
          href={`/companies/${companySlug}`}
          className="text-sm font-medium text-ink-900 hover:text-accent-600"
        >
          {companyName}
        </Link>
        <div className="mt-1 text-meta text-ink-400">
          {roundType} · <span className="font-medium text-positive">{amountDisplay ?? formatCompact(amount)}</span>
        </div>
      </div>
      <span className="shrink-0 text-meta text-ink-400">{timeAgo(date)}</span>
    </div>
  );
}

function NewCompanyRow({ company, date }: { company: Company; date: string }) {
  return (
    <div className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-meta text-ink-400 uppercase tracking-wide">New company</span>
        <span className="text-meta text-ink-400">{timeAgo(date)}</span>
      </div>
      <CompanyCard company={company} variant="compact" />
    </div>
  );
}