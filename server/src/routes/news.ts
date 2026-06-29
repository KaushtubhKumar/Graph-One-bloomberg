import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabaseClient';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { createNewsSchema, updateNewsSchema } from '../types/founders-products-news.schema';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiException } from '../utils/ApiException';
import { cache, TTL } from '../utils/ttlCache';

const router = Router();

// GET /news — paginated feed with optional tag filter
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', page_size = '20', tag, search } = req.query as Record<string, string>;
  const limit = Math.min(parseInt(page_size), 100);
  const offset = (parseInt(page) - 1) * limit;

  let query = supabase
    .from('news_articles')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (tag) query = query.eq('tag', tag);
  if (search) query = query.ilike('title', `%${search}%`);

  const { data, error, count } = await query;
  if (error) throw new ApiException(500, 'DB_ERROR', error.message);

  res.json({ data, meta: { page: parseInt(page), page_size: limit, total: count ?? 0 } });
}));

// GET /news/trending — most read in last 24h
router.get('/trending', asyncHandler(async (_req: Request, res: Response) => {
  const cacheKey = 'news:trending';
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ data: cached, meta: { cached: true } });

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .gte('published_at', since)
    .order('view_count', { ascending: false })
    .limit(20);

  if (error) throw new ApiException(500, 'DB_ERROR', error.message);

  cache.set(cacheKey, data, TTL.TRENDING);
  res.json({ data, meta: { cached: false } });
}));

// GET /news/:id — single article (records a read for trending purposes)
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error || !data) throw new ApiException(404, 'NOT_FOUND', 'Article not found.');

  const { data: updated } = await supabase.rpc('increment_news_view_count', { article_id: req.params.id });
  cache.delete('news:trending');

  res.json({ data: Array.isArray(updated) ? updated[0] : updated ?? data });
}));

// POST /news (auth required)
router.post('/', apiKeyAuth, asyncHandler(async (req: Request, res: Response) => {
  const parsed = createNewsSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiException(400, 'VALIDATION_ERROR', parsed.error.message);

  const { data, error } = await supabase.from('news_articles').insert(parsed.data).select().single();
  if (error) throw new ApiException(500, 'DB_ERROR', error.message);
  res.status(201).json({ data });
}));

// PATCH /news/:id (auth required)
router.patch('/:id', apiKeyAuth, asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateNewsSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiException(400, 'VALIDATION_ERROR', parsed.error.message);

  const { data, error } = await supabase
    .from('news_articles').update(parsed.data).eq('id', req.params.id).select().single();
  if (error || !data) throw new ApiException(404, 'NOT_FOUND', 'Article not found.');
  res.json({ data });
}));

// DELETE /news/:id (auth required)
router.delete('/:id', apiKeyAuth, asyncHandler(async (req: Request, res: Response) => {
  const { error } = await supabase.from('news_articles').delete().eq('id', req.params.id);
  if (error) throw new ApiException(500, 'DB_ERROR', error.message);
  res.status(204).send();
}));

export default router;