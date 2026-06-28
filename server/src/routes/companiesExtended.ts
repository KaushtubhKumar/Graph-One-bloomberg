import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabaseClient';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiException } from '../utils/ApiException';
import { cache, TTL } from '../utils/ttlCache';
import { computeTrendingScore } from '../services/trendingScore';

const router = Router();

// GET /companies/trending — top 10 by computed trending score (cached)
router.get('/trending', asyncHandler(async (_req: Request, res: Response) => {
  const cacheKey = 'companies:trending';
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ data: cached, meta: { cached: true } });

  const { data, error } = await supabase
    .from('companies')
    .select('id, name, slug, logo_url, categories, stage, total_funding_usd, employee_count, last_funding_at, data_confidence_score, growth_score, hq_city, hq_country, is_unicorn');

  if (error) {
    console.error("Supabase Error Details:", error);
    throw new ApiException(500, 'DB_ERROR', error.message);
  }

  const scored = (data ?? [])
    .map((c) => ({ ...c, trending_score: computeTrendingScore(c) }))
    .sort((a, b) => b.trending_score - a.trending_score)
    .slice(0, 10);

  cache.set(cacheKey, scored, TTL.TRENDING);
  res.json({ data: scored, meta: { cached: false } });
}));

// GET /companies/:slug/funding — funding rounds timeline
router.get('/:slug/funding', asyncHandler(async (req: Request, res: Response) => {
  const { data: company, error: ce } = await supabase
    .from('companies').select('id').eq('slug', req.params.slug).single();
  if (ce || !company) throw new ApiException(404, 'NOT_FOUND', `Company '${req.params.slug}' not found.`);

  const { data, error } = await supabase
    .from('funding_rounds')
    .select(`
      id, round_type, amount_usd, announced_date, currency,
      lead_investor:investors!lead_investor_id(id, name, slug, logo_url),
      participants:round_participants(investor:investors(id, name, slug, logo_url))
    `)
    .eq('company_id', company.id)
    .order('announced_date', { ascending: true });

  if (error) throw new ApiException(500, 'DB_ERROR', error.message);
  res.json({ data, meta: { company_slug: req.params.slug } });
}));

// GET /companies/:slug/products — company's products
router.get('/:slug/products', asyncHandler(async (req: Request, res: Response) => {
  const { data: company, error: ce } = await supabase
    .from('companies').select('id').eq('slug', req.params.slug).single();
  if (ce || !company) throw new ApiException(404, 'NOT_FOUND', `Company '${req.params.slug}' not found.`);

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('company_id', company.id)
    .order('upvotes', { ascending: false });

  if (error) throw new ApiException(500, 'DB_ERROR', error.message);
  res.json({ data, meta: { company_slug: req.params.slug } });
}));

// GET /companies/:slug/graph — 1-hop ecosystem graph
router.get('/:slug/graph', asyncHandler(async (req: Request, res: Response) => {
  const cacheKey = `companies:graph:${req.params.slug}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ data: cached, meta: { cached: true } });

  const { data: company, error: ce } = await supabase
    .from('companies')
    .select('id, name, slug, logo_url, categories')
    .eq('slug', req.params.slug)
    .single();
  if (ce || !company) throw new ApiException(404, 'NOT_FOUND', `Company '${req.params.slug}' not found.`);

  // Investors who participated in rounds for this company
  const { data: rounds } = await supabase
    .from('funding_rounds')
    .select(`
      round_type, amount_usd, announced_date,
      lead_investor:investors!lead_investor_id(id, name, slug, logo_url),
      participants:round_participants(investor:investors(id, name, slug, logo_url))
    `)
    .eq('company_id', company.id);

  // Products
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, category')
    .eq('company_id', company.id);

  // Competitors (overlapping category tags, different company)
  const { data: competitors } = await supabase
    .from('companies')
    .select('id, name, slug, logo_url, categories, stage')
    .overlaps('categories', company.categories ?? [])
    .neq('id', company.id)
    .limit(6);

  const investorSet = new Map<string, unknown>();
  (rounds ?? []).forEach((r) => {
    if (r.lead_investor) investorSet.set((r.lead_investor as any).id, r.lead_investor);
    (r.participants ?? []).forEach((p: any) => {
      if (p.investor) investorSet.set(p.investor.id, p.investor);
    });
  });

  const graph = {
    center: company,
    investors: Array.from(investorSet.values()),
    products: products ?? [],
    competitors: competitors ?? [],
    funding_rounds: (rounds ?? []).map((r) => ({
      round_type: r.round_type,
      amount_usd: r.amount_usd,
      announced_date: r.announced_date,
    })),
  };

  cache.set(cacheKey, graph, TTL.GRAPH);
  res.json({ data: graph, meta: { cached: false } });
}));

export default router;