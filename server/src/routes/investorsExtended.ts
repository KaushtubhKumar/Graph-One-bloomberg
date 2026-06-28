import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabaseClient';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiException } from '../utils/ApiException';
import { cache, TTL } from '../utils/ttlCache';

const router = Router();

// GET /investors/most-active — ranked by deal count in last 90 days
router.get('/most-active', asyncHandler(async (_req: Request, res: Response) => {
  const cacheKey = 'investors:most-active';
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ data: cached, meta: { cached: true } });

  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  // Count rounds (as lead) in last 90 days per investor
  const { data: leadCounts, error: le } = await supabase
    .from('funding_rounds')
    .select('lead_investor_id')
    .gte('announced_date', since)
    .not('lead_investor_id', 'is', null);

  if (le) throw new ApiException(500, 'DB_ERROR', le.message);

  const countMap = new Map<string, number>();
  (leadCounts ?? []).forEach((r) => {
    const id = r.lead_investor_id as string;
    countMap.set(id, (countMap.get(id) ?? 0) + 1);
  });

  const topIds = [...countMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id);

  if (topIds.length === 0) {
    cache.set(cacheKey, [], TTL.TRENDING);
    return res.json({ data: [], meta: { cached: false } });
  }

  const { data: investors, error: ie } = await supabase
    .from('investors')
    .select('id, name, slug, logo_url, type, portfolio_count, aum')
    .in('id', topIds);

  if (ie) throw new ApiException(500, 'DB_ERROR', ie.message);

  const result = (investors ?? [])
    .map((inv) => ({ ...inv, deals_last_90d: countMap.get(inv.id) ?? 0 }))
    .sort((a, b) => b.deals_last_90d - a.deals_last_90d);

  cache.set(cacheKey, result, TTL.TRENDING);
  res.json({ data: result, meta: { cached: false } });
}));

// GET /investors/:slug/investments — paginated investment history
router.get('/:slug/investments', asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', page_size = '20' } = req.query as Record<string, string>;
  const limit = Math.min(parseInt(page_size), 100);
  const offset = (parseInt(page) - 1) * limit;

  const { data: investor, error: ie } = await supabase
    .from('investors').select('id').eq('slug', req.params.slug).single();
  if (ie || !investor) throw new ApiException(404, 'NOT_FOUND', `Investor '${req.params.slug}' not found.`);

  // Led rounds
  const { data: ledRounds } = await supabase
    .from('funding_rounds')
    .select('id, round_type, amount_usd, announced_date, company:companies(id, name, slug, logo_url, categories)')
    .eq('lead_investor_id', investor.id)
    .order('announced_date', { ascending: false });

  // Participated rounds (not lead)
  const { data: participations } = await supabase
    .from('round_participants')
    .select('round:funding_rounds(id, round_type, amount_usd, announced_date, company:companies(id, name, slug, logo_url, categories))')
    .eq('investor_id', investor.id);

  const allRounds = [
    ...(ledRounds ?? []).map((r) => ({ ...r, role: 'lead' })),
    ...(participations ?? []).map((p: any) => ({ ...p.round, role: 'participant' })),
  ]
    .sort((a, b) => new Date(b.announced_date).getTime() - new Date(a.announced_date).getTime())
    .slice(offset, offset + limit);

  res.json({
    data: allRounds,
    meta: { page: parseInt(page), page_size: limit, investor_slug: req.params.slug },
  });
}));

// GET /investors/:slug/co-investors — who does this investor most often syndicate with
router.get('/:slug/co-investors', asyncHandler(async (req: Request, res: Response) => {
  const { data: investor, error: ie } = await supabase
    .from('investors').select('id').eq('slug', req.params.slug).single();
  if (ie || !investor) throw new ApiException(404, 'NOT_FOUND', `Investor '${req.params.slug}' not found.`);

  // Find all rounds this investor led
  const { data: ledRounds } = await supabase
    .from('funding_rounds')
    .select('id')
    .eq('lead_investor_id', investor.id);

  const roundIds = (ledRounds ?? []).map((r) => r.id);

  if (roundIds.length === 0) return res.json({ data: [], meta: { investor_slug: req.params.slug } });

  // Find co-investors in those rounds
  const { data: participants } = await supabase
    .from('round_participants')
    .select('investor_id, investor:investors(id, name, slug, logo_url, type)')
    .in('round_id', roundIds)
    .neq('investor_id', investor.id);

  const coInvMap = new Map<string, { investor: unknown; count: number }>();
  (participants ?? []).forEach((p: any) => {
    const id = p.investor_id as string;
    if (!coInvMap.has(id)) coInvMap.set(id, { investor: p.investor, count: 0 });
    coInvMap.get(id)!.count++;
  });

  const result = [...coInvMap.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(({ investor: inv, count }) => ({ ...(inv as object), co_investments: count }));

  res.json({ data: result, meta: { investor_slug: req.params.slug } });
}));

export default router;
