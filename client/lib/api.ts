/**
 * API adapter layer — bridges Graph-one backend response shapes
 * to the frontend's TypeScript types.
 *
 * When NEXT_PUBLIC_API_URL is set, fetches live data.
 * Falls back to mock data if the env var is missing (local dev without backend).
 */

import type { Company, Investor, FundingRound, Founder, Product, NewsArticle } from "./types";
import {
  companies as mockCompanies,
  investors as mockInvestors,
  fundingRounds as mockRounds,
  founders as mockFounders,
  products as mockProducts,
  news as mockNews,
  categories as mockCategories,
} from "./mockData";

// New types for getCompanyGraph / getCoInvestors / getFeed.
// Move into ./types.ts if you'd rather keep all types centralized there.

export interface CompanyGraph {
  center: Company;
  investors: Investor[];
  products: Product[];
  competitors: Company[];
  funding_rounds: FundingRound[];
}

export type CoInvestor = Investor & { co_investment_count: number };

export interface FeedNewsData {
  headline: string;
  source: string;
  url: string;
  tag?: string;
}

export interface FeedFundingRoundData {
  company_name: string;
  company_slug: string;
  company_website?: string;
  company_logo_bg: string;
  round_type: string;
  amount: number;
  amount_display?: string;
}

export type FeedItem =
  | { type: "news"; score: number; date: string; data: FeedNewsData }
  | { type: "funding_round"; score: number; date: string; data: FeedFundingRoundData }
  | { type: "new_company"; score: number; date: string; data: Company };

const BASE = process.env.NEXT_PUBLIC_API_URL;

// Derive a consistent background color from a category string
const categoryBgMap: Record<string, string> = {
  "AI Coding":         "#1a1a2e",
  "AI Search":         "#1e3a5f",
  "AI Image":          "#1a1a1a",
  "AI Video":          "#0d1117",
  "AI Voice":          "#000000",
  "AI Infrastructure": "#1e3a5f",
  "AI Research":       "#0f172a",
  "AI Models":         "#f97316",
  "AI Education":      "#0e4726",
  "AI Legal":          "#1e1b4b",
  "AI Content":        "#0ea5e9",
  "AI Productivity":   "#16a34a",
};

function mapCompany(c: any): Company {
  return {
    id:               String(c.id),
    name:             c.name,
    slug:             c.slug,
    description:      c.description ?? "",
    category:         c.category ?? "AI",
    tags:             c.tags ?? [c.category].filter(Boolean),
    funding_total:    c.funding_total ?? 0,
    employee_count:   c.employee_count ?? "Unknown",
    founded_year:     c.founded_year ?? 2020,
    hq_city:          c.hq_city ?? "",
    hq_country:       c.hq_country ?? "",
    logo_url:         c.logo_url ?? "",
    logo_bg:          c.logo_bg ?? categoryBgMap[c.category] ?? "#1a1a2e",
    website:          c.website ?? "",
    stage:            c.stage ?? "",
    is_unicorn:       c.is_unicorn ?? false,
    valuation:        c.valuation ?? undefined,
    growth_score:     c.growth_score ?? 50,
    trending_rank:    c.trending_rank ?? undefined,
    views:            c.views ?? "—",
    total_funding_usd: c.funding_total ?? c.total_funding_usd ?? 0,
    last_funding_at:  c.last_funding_at ?? c.last_scraped_at ?? undefined,
    twitter:          c.twitter ?? undefined,
    linkedin:         c.linkedin ?? undefined,
    github:           c.github ?? undefined,
  };
}

function mapInvestor(i: any): Investor {
  return {
    id:             String(i.id),
    name:           i.name,
    slug:           i.slug,
    type:           i.type ?? "VC",
    bio:            i.bio ?? "",
    aum:            i.aum ?? undefined,
    portfolio_count: i.portfolio_count ?? 0,
    stage_focus:    i.stage_focus ?? [],
    sector_focus:   i.sector_focus ?? [],
    location:       i.location ?? "",
    logo_url:       i.logo_url ?? "",
    logo_bg:        i.logo_bg ?? "#1e3a5f",
    avg_check_size: i.avg_check_size ?? undefined,
    fund_number:    i.fund_number ?? undefined,
    founded:        i.founded ?? undefined,
    website:        i.website ?? undefined,
    notable_portfolio: i.notable_portfolio ?? [],
  };
}

function mapFounder(f: any): Founder {
  return {
    id:        String(f.id),
    name:      f.name,
    title:     f.title ?? "",
    company:   f.company?.name ?? f.company ?? "",
    photo_url: f.photo_url ?? "",
    twitter:   f.twitter ?? undefined,
    linkedin:  f.linkedin ?? undefined,
  };
}

function mapProduct(p: any): Product {
  return {
    id:           String(p.id),
    company_id:   String(p.company_id ?? p.company?.id ?? ""),
    company:      p.company?.name ?? p.company ?? "",
    name:         p.name,
    description:  p.description ?? "",
    category:     p.category ?? "",
    launch_date:  p.launch_date ?? undefined,
    upvotes:      p.upvotes ?? 0,
    comments:     p.comments ?? 0,
    website_url:  p.website_url ?? "",
    logo_url:     p.logo_url ?? p.company?.logo_url ?? "",
    logo_bg:      p.logo_bg ?? "#1a1a2e",
    tags:         p.tags ?? [p.category].filter(Boolean),
    badge:        p.badge ?? undefined,
  };
}

function mapNewsArticle(n: any): NewsArticle {
  return {
    id:                String(n.id),
    title:             n.title,
    url:               n.url ?? "#",
    published_at:      n.published_at,
    source:            n.source ?? "",
    tag:               n.tag ?? "",
    related_companies: n.related_company_ids ?? n.related_companies ?? [],
    summary:           n.summary ?? "",
    view_count:        n.view_count ?? undefined,
  };
}

function mapFundingRound(r: any): FundingRound {
  return {
    id:            String(r.id),
    company_id:    String(r.company_id ?? r.company?.id ?? ""),
    round_type:    r.round_type ?? "",
    amount:        r.amount_usd ?? r.amount ?? 0,
    currency:      r.currency ?? "USD",
    date:          r.announced_date ?? r.date ?? "",
    lead_investor: r.lead_investor?.name ?? r.lead_investor ?? "",
    co_investors:  (r.participants ?? r.co_investors ?? []).map((p: any) => p.investor?.name ?? p.name ?? p),
  };
}

function mapFeedItem(raw: any): FeedItem {
  if (raw.type === "news") {
    return {
      type: "news",
      score: raw.score ?? 0,
      date: raw.date,
      data: {
        headline: raw.data?.title ?? raw.data?.headline ?? "",
        source: raw.data?.source ?? "",
        url: raw.data?.url ?? "#",
        tag: raw.data?.tag,
      },
    };
  }
  if (raw.type === "new_company") {
    return { type: "new_company", score: raw.score ?? 0, date: raw.date, data: mapCompany(raw.data ?? {}) };
  }
  // funding_round
  const d = raw.data ?? {};
  const company = d.company ?? {};
  return {
    type: "funding_round",
    score: raw.score ?? 0,
    date: raw.date,
    data: {
      company_name: company.name ?? d.company_name ?? "",
      company_slug: company.slug ?? d.company_slug ?? "",
      company_website: company.website ?? d.company_website,
      company_logo_bg: company.logo_bg ?? d.company_logo_bg ?? categoryBgMap[company.category] ?? "#1a1a2e",
      round_type: d.round_type ?? "",
      amount: d.amount_usd ?? d.amount ?? 0,
      amount_display: d.amount_display,
    },
  };
}

function buildMockGraph(slug: string): CompanyGraph | undefined {
  const center = mockCompanies.find(c => c.slug === slug);
  if (!center) return undefined;
  return {
    center,
    investors: mockInvestors.slice(0, 3),
    products: mockProducts.filter(p => p.company.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()),
    competitors: mockCompanies.filter(c => c.category === center.category && c.slug !== slug).slice(0, 4),
    funding_rounds: mockRounds.filter(r => r.company_id === center.id),
  };
}

function buildMockFeed(): FeedItem[] {
  const newsItems: FeedItem[] = mockNews.slice(0, 5).map(n => ({
    type: "news",
    score: 15,
    date: n.published_at,
    data: { headline: n.title, source: n.source, url: n.url, tag: n.tag },
  }));
  const fundingItems: FeedItem[] = mockRounds.slice(0, 5).map(r => {
    const company = mockCompanies.find(c => c.id === r.company_id);
    return {
      type: "funding_round",
      score: 25,
      date: r.date,
      data: {
        company_name: company?.name ?? "Unknown",
        company_slug: company?.slug ?? "",
        company_website: company?.website,
        company_logo_bg: company?.logo_bg ?? "#1a1a2e",
        round_type: r.round_type,
        amount: r.amount,
      },
    };
  });
  const newCoItems: FeedItem[] = mockCompanies.slice(0, 5).map(c => ({
    type: "new_company",
    score: 20,
    date: c.last_funding_at ?? new Date().toISOString(),
    data: c,
  }));
  return [...newsItems, ...fundingItems, ...newCoItems].sort(
    (a, b) => +new Date(b.date) - +new Date(a.date)
  );
}

async function fetchJSON(path: string) {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`API error: ${res.status} on ${path}`);
  return res.json();
}

// --- Companies ---

export async function getCompanies(): Promise<Company[]> {
  if (!BASE) return mockCompanies;
  try {
    const json = await fetchJSON("/companies");
    const raw = json.data?.companies ?? json.data ?? json;
    return (Array.isArray(raw) ? raw : []).map(mapCompany);
  } catch {
    console.warn("getCompanies: falling back to mock data");
    return mockCompanies;
  }
}

export async function getCompanyBySlug(slug: string): Promise<Company | undefined> {
  if (!BASE) return mockCompanies.find(c => c.slug === slug);
  try {
    const json = await fetchJSON(`/companies/${slug}`);
    const raw = json.data ?? json;
    return mapCompany(raw);
  } catch {
    return mockCompanies.find(c => c.slug === slug);
  }
}

export async function getTrendingCompanies(): Promise<Company[]> {
  if (!BASE) return mockCompanies.filter(c => c.trending_rank).sort((a, b) => (a.trending_rank ?? 99) - (b.trending_rank ?? 99));
  try {
    // Backend may not have /companies/trending yet — try it, fall back to /companies?sort=trending
    const json = await fetchJSON("/companies/trending").catch(() => fetchJSON("/companies?sort=trending&limit=10"));
    const raw = json.data?.companies ?? json.data ?? json;
    return (Array.isArray(raw) ? raw : []).map(mapCompany);
  } catch {
    return mockCompanies.slice(0, 5);
  }
}

export async function getFundingRounds(companyId: string): Promise<FundingRound[]> {
  if (!BASE) return mockRounds.filter(r => r.company_id === companyId);
  try {
    const json = await fetchJSON(`/companies/${companyId}/funding`);
    const raw = json.data?.rounds ?? json.data ?? json;
    return (Array.isArray(raw) ? raw : []).map(mapFundingRound);
  } catch {
    return mockRounds.filter(r => r.company_id === companyId);
  }
}

// Same endpoint as getFundingRounds — alias for callers using slug-based naming.
export const getCompanyFundingTimeline = getFundingRounds;

export async function getCompanyGraph(slug: string): Promise<CompanyGraph | undefined> {
  if (!BASE) return buildMockGraph(slug);
  try {
    const json = await fetchJSON(`/companies/${slug}/graph`);
    const raw = json.data ?? json;
    return {
      center: mapCompany(raw.center ?? raw),
      investors: (raw.investors ?? []).map(mapInvestor),
      products: (raw.products ?? []).map(mapProduct),
      competitors: (raw.competitors ?? []).map(mapCompany),
      funding_rounds: (raw.funding_rounds ?? []).map(mapFundingRound),
    };
  } catch {
    return buildMockGraph(slug);
  }
}

// --- Investors ---

export async function getInvestors(): Promise<Investor[]> {
  if (!BASE) return mockInvestors;
  try {
    const json = await fetchJSON("/investors");
    const raw = json.data?.investors ?? json.data ?? json;
    return (Array.isArray(raw) ? raw : []).map(mapInvestor);
  } catch {
    console.warn("getInvestors: falling back to mock data");
    return mockInvestors;
  }
}

export async function getInvestorBySlug(slug: string): Promise<Investor | undefined> {
  if (!BASE) return mockInvestors.find(i => i.slug === slug);
  try {
    const json = await fetchJSON(`/investors/${slug}`);
    const raw = json.data ?? json;
    return mapInvestor(raw);
  } catch {
    return mockInvestors.find(i => i.slug === slug);
  }
}

// --- Search ---

export async function search(q: string): Promise<{ companies: Company[]; investors: Investor[]; products: Product[] }> {
  if (!BASE || q.length < 2) return { companies: [], investors: [], products: [] };
  try {
    const json = await fetchJSON(`/search?q=${encodeURIComponent(q)}`);
    return {
      companies: (json.data?.companies ?? []).map(mapCompany),
      investors: (json.data?.investors ?? []).map(mapInvestor),
      products:  (json.data?.products ?? []).map(mapProduct),
    };
  } catch {
    // Local fuzzy fallback
    const ql = q.toLowerCase();
    return {
      companies: mockCompanies.filter(c => c.name.toLowerCase().includes(ql)).slice(0, 3),
      investors: mockInvestors.filter(i => i.name.toLowerCase().includes(ql)).slice(0, 2),
      products:  mockProducts.filter(p => p.name.toLowerCase().includes(ql)).slice(0, 2),
    };
  }
}

// --- Founders ---

export async function getFounders(): Promise<Founder[]> {
  if (!BASE) return mockFounders;
  try {
    const json = await fetchJSON("/founders");
    const raw = json.data ?? json;
    return (Array.isArray(raw) ? raw : []).map(mapFounder);
  } catch {
    return mockFounders;
  }
}

export async function getFoundersByCompanySlug(slug: string): Promise<Founder[]> {
  if (!BASE) return mockFounders.filter(f => f.company.toLowerCase() === slug.toLowerCase());
  try {
    const all = await getFounders();
    return all.filter(f => f.company.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase());
  } catch {
    return mockFounders;
  }
}

// --- Products ---

export async function getProducts(): Promise<Product[]> {
  if (!BASE) return mockProducts;
  try {
    const json = await fetchJSON("/products");
    const raw = json.data ?? json;
    return (Array.isArray(raw) ? raw : []).map(mapProduct);
  } catch {
    console.warn("getProducts: falling back to mock data");
    return mockProducts;
  }
}

export async function getProductsByCompanySlug(slug: string): Promise<Product[]> {
  if (!BASE) return mockProducts.filter(p => p.company.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase());
  try {
    const json = await fetchJSON(`/companies/${slug}/products`);
    const raw = json.data ?? json;
    return (Array.isArray(raw) ? raw : []).map(mapProduct);
  } catch {
    return mockProducts.filter(p => p.company.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase());
  }
}

// --- News ---

export interface NewsPage {
  data: NewsArticle[];
  total: number;
}

export async function getNews(opts: { page?: number; pageSize?: number; tag?: string; search?: string } = {}): Promise<NewsPage> {
  const { page = 1, pageSize = 20, tag, search } = opts;

  if (!BASE) {
    let filtered = tag && tag !== "All" ? mockNews.filter(n => n.tag === tag) : mockNews;
    if (search) filtered = filtered.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));
    const start = (page - 1) * pageSize;
    return { data: filtered.slice(start, start + pageSize), total: filtered.length };
  }

  try {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (tag && tag !== "All") params.set("tag", tag);
    if (search) params.set("search", search);
    const json = await fetchJSON(`/news?${params.toString()}`);
    const raw = json.data ?? json;
    return {
      data: (Array.isArray(raw) ? raw : []).map(mapNewsArticle),
      total: json.meta?.total ?? raw.length,
    };
  } catch {
    let filtered = tag && tag !== "All" ? mockNews.filter(n => n.tag === tag) : mockNews;
    if (search) filtered = filtered.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));
    const start = (page - 1) * pageSize;
    return { data: filtered.slice(start, start + pageSize), total: filtered.length };
  }
}

export async function getTrendingNews(): Promise<NewsArticle[]> {
  if (!BASE) return mockNews.slice().sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0)).slice(0, 10);
  try {
    const json = await fetchJSON("/news/trending");
    const raw = json.data ?? json;
    return (Array.isArray(raw) ? raw : []).map(mapNewsArticle);
  } catch {
    return mockNews.slice(0, 10);
  }
}

export async function getNewsByCompanySlug(slug: string): Promise<NewsArticle[]> {
  const { data } = await getNews({ pageSize: 100 });
  return data.filter(n => n.related_companies.includes(slug));
}

// --- Categories (derived client-side from companies; no dedicated endpoint) ---

// Covers every category value actually used across mock + live company data
// (confirmed against lib/mockData.ts), so real categories don't silently
// degrade to a generic icon. Add to this map if a new category is introduced.
const CATEGORY_ICONS: Record<string, string> = {
  "AI Agents": "🤖",
  "AI Coding": "💻",
  "AI Search": "🔍",
  "AI Video": "🎬",
  "AI Voice": "🎙",
  "AI Infrastructure": "⚙️",
  "AI Image": "🎨",
  "AI Research": "🧪",
  "AI Models": "🧠",
  "AI Education": "🎓",
  "AI Legal": "⚖️",
  "AI Content": "📝",
  "AI Productivity": "⚡",
  "Healthcare AI": "🏥",
  "Robotics": "🦾",
  "Chat": "💬",
  "Code": "💻",
  "Image": "🎨",
  "Video": "🎬",
  "Voice": "🎙",
};

export function getCategoriesFromCompanies(allCompanies: Company[]) {
  if (allCompanies.length === 0) return mockCategories;
  const counts = new Map<string, number>();
  allCompanies.forEach(c => {
    counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
  });
  return Array.from(counts.entries()).map(([name, count]) => ({
    name,
    count,
    icon: CATEGORY_ICONS[name] ?? "✨",
  }));
}

// --- Investors: investments / co-investors ---

export async function getInvestorInvestments(slug: string): Promise<FundingRound[]> {
  if (!BASE) return mockRounds;
  try {
    const json = await fetchJSON(`/investors/${slug}/investments`);
    const raw = json.data ?? json;
    return (Array.isArray(raw) ? raw : []).map(mapFundingRound);
  } catch {
    return mockRounds;
  }
}

export async function getCoInvestors(slug: string): Promise<CoInvestor[]> {
  if (!BASE) return mockInvestors.slice(0, 3).map(i => ({ ...i, co_investment_count: 1 }));
  try {
    const json = await fetchJSON(`/investors/${slug}/co-investors`);
    const raw = json.data?.co_investors ?? json.data ?? json;
    return (Array.isArray(raw) ? raw : []).map((r: any) => ({
      ...mapInvestor(r.investor ?? r),
      co_investment_count: r.co_investment_count ?? r.count ?? 0,
    }));
  } catch {
    return [];
  }
}

// --- Feed ---

export async function getFeed(page: number = 1): Promise<FeedItem[]> {
  if (!BASE) return page === 1 ? buildMockFeed() : [];
  try {
    const json = await fetchJSON(`/feed?page=${page}`);
    const raw = json.data?.items ?? json.data ?? json;
    return (Array.isArray(raw) ? raw : []).map(mapFeedItem);
  } catch {
    console.warn("getFeed: falling back to mock data");
    return page === 1 ? buildMockFeed() : [];
  }
}