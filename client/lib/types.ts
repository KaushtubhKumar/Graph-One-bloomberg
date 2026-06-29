export interface Company {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  funding_total: number;
  employee_count: string;
  founded_year: number;
  hq_city: string;
  hq_country: string;
  logo_url: string;
  logo_bg: string;
  website: string;
  stage: string;
  is_unicorn: boolean;
  valuation?: number;
  growth_score: number;
  trending_rank?: number;
  views: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  total_funding_usd: number;
  last_funding_at?: string;
}

export interface Investor {
  id: string;
  name: string;
  slug: string;
  type: string;
  bio: string;
  aum?: number;
  portfolio_count: number;
  stage_focus: string[];
  sector_focus: string[];
  location: string;
  logo_url: string;
  logo_bg: string;
  avg_check_size?: number;
  fund_number?: number;
  founded?: number;
  website?: string;
  notable_portfolio?: string[];
}

export interface FundingRound {
  id: string;
  company_id: string;
  round_type: string;
  amount: number;
  currency: string;
  date: string;
  lead_investor: string;
  co_investors: string[];
}

export interface Founder {
  id: string;
  name: string;
  title: string;
  company: string;
  photo_url: string;
  twitter?: string;
  linkedin?: string;
}

export interface Product {
  id: string;
  company_id: string;
  company: string;
  name: string;
  description: string;
  category: string;
  launch_date?: string;
  upvotes: number;
  comments: number;
  website_url: string;
  logo_url: string;
  logo_bg: string;
  tags: string[];
  badge?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  published_at: string;
  source: string;
  tag: string;
  related_companies: string[];
  summary: string;
  view_count?: number;
}