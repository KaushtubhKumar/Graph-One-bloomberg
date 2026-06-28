import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabaseClient';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { createFounderSchema, updateFounderSchema } from '../types/founders-products-news.schema';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiException } from '../utils/ApiException';

const router = Router();

// GET /founders — list all founders
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', page_size = '20', company_id, search } = req.query as Record<string, string>;
  const limit = Math.min(parseInt(page_size), 100);
  const offset = (parseInt(page) - 1) * limit;

  let query = supabase
    .from('founders')
    .select('*, company:companies(id, name, slug, logo_url)', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('name', { ascending: true });

  if (company_id) query = query.eq('company_id', company_id);
  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error, count } = await query;
  if (error) throw new ApiException(500, 'DB_ERROR', error.message);

  res.json({
    data,
    meta: { page: parseInt(page), page_size: limit, total: count ?? 0 },
  });
}));

// GET /founders/:slug — founder profile with linked companies
router.get('/:slug', asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const { data, error } = await supabase
    .from('founders')
    .select('*, company:companies(id, name, slug, logo_url, categories, stage, hq_city, hq_country)')
    .eq('slug', slug)
    .single();

  if (error || !data) throw new ApiException(404, 'NOT_FOUND', `Founder '${slug}' not found.`);

  res.json({ data });
}));

// POST /founders — create (auth required)
router.post('/', apiKeyAuth, asyncHandler(async (req: Request, res: Response) => {
  const parsed = createFounderSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiException(400, 'VALIDATION_ERROR', parsed.error.message);

  const { data, error } = await supabase.from('founders').insert(parsed.data).select().single();
  if (error) throw new ApiException(500, 'DB_ERROR', error.message);

  res.status(201).json({ data });
}));

// PATCH /founders/:id — update (auth required)
router.patch('/:id', apiKeyAuth, asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateFounderSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiException(400, 'VALIDATION_ERROR', parsed.error.message);

  const { data, error } = await supabase
    .from('founders')
    .update(parsed.data)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) throw new ApiException(404, 'NOT_FOUND', 'Founder not found.');
  res.json({ data });
}));

// DELETE /founders/:id (auth required)
router.delete('/:id', apiKeyAuth, asyncHandler(async (req: Request, res: Response) => {
  const { error } = await supabase.from('founders').delete().eq('id', req.params.id);
  if (error) throw new ApiException(500, 'DB_ERROR', error.message);
  res.status(204).send();
}));

export default router;
