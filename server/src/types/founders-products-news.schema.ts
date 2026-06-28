import { z } from 'zod';

// ── Founder ──────────────────────────────────────────────────────────────────
export const createFounderSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().optional(),
  company_id: z.string().uuid(),
  bio: z.string().optional(),
  twitter: z.string().url().optional().nullable(),
  linkedin: z.string().url().optional().nullable(),
  location: z.string().optional().nullable(),
  photo_url: z.string().url().optional().nullable(),
});

export const updateFounderSchema = createFounderSchema.partial();

export type CreateFounderInput = z.infer<typeof createFounderSchema>;
export type UpdateFounderInput = z.infer<typeof updateFounderSchema>;

// ── Product ───────────────────────────────────────────────────────────────────
export const createProductSchema = z.object({
  company_id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  category: z.string().optional(),
  launch_date: z.string().optional().nullable(),
  upvotes: z.number().int().min(0).default(0),
  website_url: z.string().url().optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ── NewsArticle ───────────────────────────────────────────────────────────────
export const createNewsSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  published_at: z.string(),
  source: z.string().min(1),
  tag: z.string().optional().nullable(),
  related_company_ids: z.array(z.string().uuid()).default([]),
  summary: z.string().optional().nullable(),
});

export const updateNewsSchema = createNewsSchema.partial();

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
