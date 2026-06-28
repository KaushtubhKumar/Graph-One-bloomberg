// ============================================================================
// Domain types — mirror the Supabase schema (supabase/migrations/0001_init.sql)
// ============================================================================

export type CompanyStage =
  | "idea"
  | "pre_seed"
  | "seed"
  | "series_a"
  | "series_b"
  | "series_c"
  | "series_d_plus"
  | "growth"
  | "public"
  | "acquired"
  | "shut_down";

export type FundingRoundType =
  | "pre_seed"
  | "seed"
  | "series_a"
  | "series_b"
  | "series_c"
  | "series_d"
  | "series_e_plus"
  | "bridge"
  | "convertible_note"
  | "grant"
  | "ipo"
  | "acquisition";

export type InvestorType =
  | "vc_firm"
  | "angel"
  | "corporate_vc"
  | "accelerator"
  | "pe_firm"
  | "sovereign_fund"
  | "family_office"
  | "hedge_fund";

export interface Company {
  id: string;
  name: string;
  slug: string;
  legal_name: string | null;
  website: string | null;
  logo_url: string | null;
  description: string | null;
  one_liner: string | null;
  founded_year: number | null;
  hq_city: string | null;
  hq_country: string | null;
  stage: CompanyStage;
  employee_count: number | null;
  employee_range: string | null;
  total_funding_usd: number;
  last_funding_at: string | null;
  categories: string[];
  tags: string[];
  is_unicorn: boolean;
  valuation_usd: number | null;
  status: "active" | "acquired" | "shut_down";
  twitter_handle: string | null;
  linkedin_url: string | null;
  crunchbase_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Investor {
  id: string;
  name: string;
  slug: string;
  type: InvestorType;
  website: string | null;
  logo_url: string | null;
  description: string | null;
  hq_city: string | null;
  hq_country: string | null;
  founded_year: number | null;
  aum_usd: number | null;
  check_size_min: number | null;
  check_size_max: number | null;
  portfolio_count: number;
  focus_areas: string[];
  stage_focus: CompanyStage[];
  twitter_handle: string | null;
  linkedin_url: string | null;
  crunchbase_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FundingRound {
  id: string;
  company_id: string;
  round_type: FundingRoundType;
  amount_usd: number | null;
  currency: string;
  announced_date: string;
  valuation_usd: number | null;
  is_valuation_disclosed: boolean;
  lead_investor_id: string | null;
  source_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoundParticipant {
  id: string;
  round_id: string;
  investor_id: string;
  is_lead: boolean;
  created_at: string;
}

// Expanded shapes returned by GET-by-id endpoints (joined data)

export interface FundingRoundExpanded extends FundingRound {
  company?: Pick<Company, "id" | "name" | "slug" | "logo_url">;
  lead_investor?: Pick<Investor, "id" | "name" | "slug" | "logo_url"> | null;
  participants?: Array<{
    investor: Pick<Investor, "id" | "name" | "slug" | "logo_url">;
    is_lead: boolean;
  }>;
}

export interface CompanyExpanded extends Company {
  funding_rounds?: FundingRoundExpanded[];
}

export interface InvestorExpanded extends Investor {
  led_rounds?: FundingRoundExpanded[];
  participated_rounds?: FundingRoundExpanded[];
}

// Generic API envelope

export interface ApiError {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}
