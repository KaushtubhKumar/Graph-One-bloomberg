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

export async function getNews(): Promise<NewsArticle[]> {
  if (!BASE) return mockNews;
  try {
    const json = await fetchJSON("/news");
    const raw = json.data ?? json;
    return (Array.isArray(raw) ? raw : []).map(mapNewsArticle);
  } catch {
    return mockNews;
  }
}

export async function getNewsByCompanySlug(slug: string): Promise<NewsArticle[]> {
  const all = await getNews();
  return all.filter(n => n.related_companies.includes(slug));
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
