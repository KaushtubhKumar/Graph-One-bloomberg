import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabaseClient';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiException } from '../utils/ApiException';
import { cache, TTL } from '../utils/ttlCache';

const router = Router();

// GET /feed — ranked activity feed: news + funding rounds + new companies
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', page_size = '30' } = req.query as Record<string, string>;
  const limit = Math.min(parseInt(page_size), 100);
  const offset = (parseInt(page) - 1) * limit;

  const cacheKey = `feed:${page}:${page_size}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ data: cached, meta: { cached: true, page: parseInt(page) } });

  const [newsRes, roundsRes, companiesRes] = await Promise.all([
    supabase
      .from('news_articles')
      .select('id, title, url, published_at, source, tag, summary')
      .order('published_at', { ascending: false })
      .limit(40),
    supabase
      .from('funding_rounds')
      .select('id, round_type, amount_usd, announced_date, company:companies(id, name, slug, logo_url, categories)')
      .order('announced_date', { ascending: false })
      .limit(30),
    supabase
      .from('companies')
      .select('id, name, slug, logo_url, categories, stage, founded_year, hq_city, hq_country')
      .order('last_scraped_at', { ascending: false })
      .limit(20),
  ]);

  if (newsRes.error) throw new ApiException(500, 'DB_ERROR', newsRes.error.message);

  // Score each item by recency (days since event)
  const now = Date.now();
  const recencyScore = (dateStr: string) => {
    const daysAgo = (now - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 100 - daysAgo * 2);
  };

  const feedItems: Array<{ type: string; score: number; date: string; data: unknown }> = [
    ...(newsRes.data ?? []).map((n) => ({
      type: 'news' as const,
      score: recencyScore(n.published_at) + 10, // news gets slight boost
      date: n.published_at,
      data: n,
    })),
    ...(roundsRes.data ?? []).map((r) => ({
      type: 'funding_round' as const,
      score: recencyScore(r.announced_date) + 15, // funding gets bigger boost
      date: r.announced_date,
      data: r,
    })),
    ...(companiesRes.data ?? []).map((c) => ({
      type: 'new_company' as const,
      score: 20,
      date: new Date().toISOString(),
      data: c,
    })),
  ]
    .sort((a, b) => b.score - a.score)
    .slice(offset, offset + limit);

  cache.set(cacheKey, feedItems, TTL.FEED);
  res.json({ data: feedItems, meta: { cached: false, page: parseInt(page) } });
}));

export default router;
