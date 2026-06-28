import { z } from "zod";
import { companyStageEnum } from "./company.schema";

export const investorTypeEnum = z.enum([
  "vc_firm",
  "angel",
  "corporate_vc",
  "accelerator",
  "pe_firm",
  "sovereign_fund",
  "family_office",
  "hedge_fund",
]);

export const createInvestorSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  type: investorTypeEnum.default("vc_firm"),
  website: z.string().url().nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  hq_city: z.string().max(120).nullable().optional(),
  hq_country: z.string().max(120).nullable().optional(),
  founded_year: z.number().int().min(1800).max(2100).nullable().optional(),
  aum_usd: z.number().min(0).nullable().optional(),
  check_size_min: z.number().min(0).nullable().optional(),
  check_size_max: z.number().min(0).nullable().optional(),
  focus_areas: z.array(z.string().max(60)).default([]),
  stage_focus: z.array(companyStageEnum).default([]),
  twitter_handle: z.string().max(100).nullable().optional(),
  linkedin_url: z.string().url().nullable().optional(),
  crunchbase_url: z.string().url().nullable().optional(),
});

export const updateInvestorSchema = createInvestorSchema.partial();

export const listInvestorsQuerySchema = z.object({
  page: z.string().optional(),
  page_size: z.string().optional(),
  search: z.string().max(200).optional(),
  type: investorTypeEnum.optional(),
  focus_area: z.string().max(60).optional(),
  country: z.string().max(120).optional(),
  sort: z
    .enum(["name_asc", "name_desc", "portfolio_desc", "aum_desc"])
    .default("portfolio_desc"),
});

export type CreateInvestorInput = z.infer<typeof createInvestorSchema>;
export type UpdateInvestorInput = z.infer<typeof updateInvestorSchema>;
export type ListInvestorsQuery = z.infer<typeof listInvestorsQuerySchema>;
