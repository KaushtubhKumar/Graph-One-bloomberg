import { z } from "zod";

export const fundingRoundTypeEnum = z.enum([
  "pre_seed",
  "seed",
  "series_a",
  "series_b",
  "series_c",
  "series_d",
  "series_e_plus",
  "bridge",
  "convertible_note",
  "grant",
  "ipo",
  "acquisition",
]);

export const createFundingRoundSchema = z.object({
  company_id: z.string().uuid(),
  round_type: fundingRoundTypeEnum,
  amount_usd: z.number().min(0).nullable().optional(),
  currency: z.string().length(3).default("USD"),
  announced_date: z.string().date(),
  valuation_usd: z.number().min(0).nullable().optional(),
  is_valuation_disclosed: z.boolean().default(false),
  lead_investor_id: z.string().uuid().nullable().optional(),
  // List of investor IDs participating in this round (lead is set via lead_investor_id)
  participant_investor_ids: z.array(z.string().uuid()).default([]),
  source_url: z.string().url().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const updateFundingRoundSchema = createFundingRoundSchema.partial().extend({
  company_id: z.string().uuid().optional(), // generally shouldn't move rounds between companies, but allow it
});

export const listFundingRoundsQuerySchema = z.object({
  page: z.string().optional(),
  page_size: z.string().optional(),
  company_id: z.string().uuid().optional(),
  investor_id: z.string().uuid().optional(), // either lead or participant
  round_type: fundingRoundTypeEnum.optional(),
  from_date: z.string().date().optional(),
  to_date: z.string().date().optional(),
  sort: z.enum(["date_desc", "date_asc", "amount_desc", "amount_asc"]).default("date_desc"),
});

export type CreateFundingRoundInput = z.infer<typeof createFundingRoundSchema>;
export type UpdateFundingRoundInput = z.infer<typeof updateFundingRoundSchema>;
export type ListFundingRoundsQuery = z.infer<typeof listFundingRoundsQuerySchema>;
