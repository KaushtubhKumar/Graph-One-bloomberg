import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabaseClient';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { createProductSchema, updateProductSchema } from '../types/founders-products-news.schema';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiException } from '../utils/ApiException';

const router = Router();

// GET /products — list with category filter + sort popular/newest
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', page_size = '20', category, sort = 'popular', search } = req.query as Record<string, string>;
  const limit = Math.min(parseInt(page_size), 100);
  const offset = (parseInt(page) - 1) * limit;

  let query = supabase
    .from('products')
    .select('*, company:companies(id, name, slug, logo_url)', { count: 'exact' })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq('category', category);
  if (search) query = query.ilike('name', `%${search}%`);

  if (sort === 'popular') query = query.order('upvotes', { ascending: false });
  else if (sort === 'newest') query = query.order('launch_date', { ascending: false });
  else query = query.order('name', { ascending: true });

  const { data, error, count } = await query;
  if (error) throw new ApiException(500, 'DB_ERROR', error.message);

  res.json({ data, meta: { page: parseInt(page), page_size: limit, total: count ?? 0 } });
}));

// GET /products/:slug — product detail
router.get('/:slug', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, company:companies(id, name, slug, logo_url, categories, hq_city, hq_country)')
    .eq('slug', req.params.slug)
    .single();

  if (error || !data) throw new ApiException(404, 'NOT_FOUND', `Product '${req.params.slug}' not found.`);
  res.json({ data });
}));

// POST /products (auth required)
router.post('/', apiKeyAuth, asyncHandler(async (req: Request, res: Response) => {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiException(400, 'VALIDATION_ERROR', parsed.error.message);

  const { data, error } = await supabase.from('products').insert(parsed.data).select().single();
  if (error) throw new ApiException(500, 'DB_ERROR', error.message);
  res.status(201).json({ data });
}));

// PATCH /products/:id (auth required)
router.patch('/:id', apiKeyAuth, asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiException(400, 'VALIDATION_ERROR', parsed.error.message);

  const { data, error } = await supabase
    .from('products').update(parsed.data).eq('id', req.params.id).select().single();
  if (error || !data) throw new ApiException(404, 'NOT_FOUND', 'Product not found.');
  res.json({ data });
}));

// DELETE /products/:id (auth required)
router.delete('/:id', apiKeyAuth, asyncHandler(async (req: Request, res: Response) => {
  const { error } = await supabase.from('products').delete().eq('id', req.params.id);
  if (error) throw new ApiException(500, 'DB_ERROR', error.message);
  res.status(204).send();
}));

export default router;
