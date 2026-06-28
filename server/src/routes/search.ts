import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabaseClient';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiException } from '../utils/ApiException';
import { cache, TTL } from '../utils/ttlCache';

const router = Router();

// GET /search?q= — cross-entity search: companies, investors, founders, products
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const q = (req.query.q as string ?? '').trim();
  if (!q || q.length < 2) throw new ApiException(400, 'VALIDATION_ERROR', 'Query param `q` must be at least 2 characters.');

  const term = `%${q}%`;

  const [companies, investors, founders, products] = await Promise.all([
    supabase
      .from('companies')
      .select('id, name, slug, logo_url, categories, stage, hq_city, hq_country')
      .or(`name.ilike.${term},description.ilike.${term}`)
      .limit(5),
    supabase
      .from('investors')
      .select('id, name, slug, logo_url, type, portfolio_count')
      .or(`name.ilike.${term},bio.ilike.${term}`)
      .limit(5),
    supabase
      .from('founders')
      .select('id, name, slug, photo_url, title, company_id')
      .ilike('name', term)
      .limit(5),
    supabase
      .from('products')
      .select('id, name, slug, category, upvotes, company_id')
      .or(`name.ilike.${term},description.ilike.${term}`)
      .limit(5),
  ]);

  res.json({
    data: {
      companies: companies.data ?? [],
      investors: investors.data ?? [],
      founders: founders.data ?? [],
      products: products.data ?? [],
    },
    meta: { query: q },
  });
}));

export default router;
