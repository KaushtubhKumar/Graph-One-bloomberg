import { z } from "zod";

export const companyStageEnum = z.enum([
  "idea",
  "pre_seed",
  "seed",
  "series_a",
  "series_b",
  "series_c",
  "series_d_plus",
  "growth",
  "public",
  "acquired",
  "shut_down",
]);

export const createCompanySchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(), // auto-generated from name if omitted
  legal_name: z.string().max(200).nullable().optional(),
  website: z.string().url().nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  one_liner: z.string().max(280).nullable().optional(),
  founded_year: z.number().int().min(1800).max(2100).nullable().optional(),
  hq_city: z.string().max(120).nullable().optional(),
  hq_country: z.string().max(120).nullable().optional(),
  stage: companyStageEnum.default("seed"),
  employee_count: z.number().int().min(0).nullable().optional(),
  employee_range: z.string().max(20).nullable().optional(),
  total_funding_usd: z.number().min(0).default(0),
  last_funding_at: z.string().date().nullable().optional(),
  categories: z.array(z.string().max(60)).default([]),
  tags: z.array(z.string().max(60)).default([]),
  is_unicorn: z.boolean().default(false),
  valuation_usd: z.number().min(0).nullable().optional(),
  status: z.enum(["active", "acquired", "shut_down"]).default("active"),
  twitter_handle: z.string().max(100).nullable().optional(),
  linkedin_url: z.string().url().nullable().optional(),
  crunchbase_url: z.string().url().nullable().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export const listCompaniesQuerySchema = z.object({
  page: z.string().optional(),
  page_size: z.string().optional(),
  search: z.string().max(200).optional(),
  stage: companyStageEnum.optional(),
  category: z.string().max(60).optional(),
  country: z.string().max(120).optional(),
  is_unicorn: z.enum(["true", "false"]).optional(),
  sort: z
    .enum([
      "name_asc",
      "name_desc",
      "founded_desc",
      "founded_asc",
      "funding_desc",
      "funding_asc",
      "recent_funding",
    ])
    .default("recent_funding"),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type ListCompaniesQuery = z.infer<typeof listCompaniesQuerySchema>;
