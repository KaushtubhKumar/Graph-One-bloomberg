-- ============================================================================
-- GraphOne — Core Schema (v1: Companies, Investors, Funding Rounds)
-- Run this in the Supabase SQL Editor (or via `supabase db push`)
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm; -- for fast fuzzy/ILIKE search

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------

do $$ begin
  create type company_stage as enum (
    'idea', 'pre_seed', 'seed', 'series_a', 'series_b', 'series_c',
    'series_d_plus', 'growth', 'public', 'acquired', 'shut_down'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type funding_round_type as enum (
    'pre_seed', 'seed', 'series_a', 'series_b', 'series_c', 'series_d',
    'series_e_plus', 'bridge', 'convertible_note', 'grant', 'ipo', 'acquisition'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type investor_type as enum (
    'vc_firm', 'angel', 'corporate_vc', 'accelerator', 'pe_firm',
    'sovereign_fund', 'family_office', 'hedge_fund'
  );
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- COMPANIES
-- ----------------------------------------------------------------------------

create table if not exists companies (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  slug              text not null unique,
  legal_name        text,
  website           text,
  logo_url          text,
  description       text,
  one_liner         text,
  founded_year      int,
  hq_city           text,
  hq_country        text,
  stage             company_stage not null default 'seed',
  employee_count    int,
  employee_range    text,                 -- e.g. "11-50"
  total_funding_usd numeric(18,2) default 0,
  last_funding_at   date,
  categories        text[] default '{}',  -- e.g. ['LLM Infra', 'Dev Tools']
  tags              text[] default '{}',
  is_unicorn        boolean default false,
  valuation_usd     numeric(18,2),
  status            text default 'active', -- active | acquired | shut_down
  twitter_handle    text,
  linkedin_url      text,
  crunchbase_url    text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_companies_slug on companies (slug);
create index if not exists idx_companies_stage on companies (stage);
create index if not exists idx_companies_categories on companies using gin (categories);
create index if not exists idx_companies_name_trgm on companies using gin (name gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- INVESTORS
-- ----------------------------------------------------------------------------

create table if not exists investors (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  slug              text not null unique,
  type              investor_type not null default 'vc_firm',
  website           text,
  logo_url          text,
  description       text,
  hq_city           text,
  hq_country        text,
  founded_year      int,
  aum_usd           numeric(18,2),         -- assets under management, if known
  check_size_min    numeric(18,2),
  check_size_max    numeric(18,2),
  portfolio_count   int default 0,         -- denormalized, refreshed on writes
  focus_areas       text[] default '{}',   -- e.g. ['AI Infra', 'Robotics']
  stage_focus       company_stage[] default '{}',
  twitter_handle    text,
  linkedin_url      text,
  crunchbase_url    text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_investors_slug on investors (slug);
create index if not exists idx_investors_type on investors (type);
create index if not exists idx_investors_focus_areas on investors using gin (focus_areas);
create index if not exists idx_investors_name_trgm on investors using gin (name gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- FUNDING ROUNDS
-- ----------------------------------------------------------------------------

create table if not exists funding_rounds (
  id                uuid primary key default uuid_generate_v4(),
  company_id        uuid not null references companies(id) on delete cascade,
  round_type        funding_round_type not null,
  amount_usd        numeric(18,2),
  currency          text default 'USD',
  announced_date    date not null,
  valuation_usd     numeric(18,2),
  is_valuation_disclosed boolean default false,
  lead_investor_id  uuid references investors(id) on delete set null,
  source_url        text,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_rounds_company on funding_rounds (company_id);
create index if not exists idx_rounds_lead_investor on funding_rounds (lead_investor_id);
create index if not exists idx_rounds_announced_date on funding_rounds (announced_date desc);
create index if not exists idx_rounds_type on funding_rounds (round_type);

-- ----------------------------------------------------------------------------
-- ROUND PARTICIPANTS (many-to-many: a round can have many investors)
-- ----------------------------------------------------------------------------

create table if not exists round_participants (
  id            uuid primary key default uuid_generate_v4(),
  round_id      uuid not null references funding_rounds(id) on delete cascade,
  investor_id   uuid not null references investors(id) on delete cascade,
  is_lead       boolean default false,
  created_at    timestamptz not null default now(),
  unique (round_id, investor_id)
);

create index if not exists idx_participants_round on round_participants (round_id);
create index if not exists idx_participants_investor on round_participants (investor_id);

-- ----------------------------------------------------------------------------
-- updated_at trigger helper
-- ----------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_companies_updated_at on companies;
create trigger trg_companies_updated_at before update on companies
  for each row execute function set_updated_at();

drop trigger if exists trg_investors_updated_at on investors;
create trigger trg_investors_updated_at before update on investors
  for each row execute function set_updated_at();

drop trigger if exists trg_rounds_updated_at on funding_rounds;
create trigger trg_rounds_updated_at before update on funding_rounds
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security: open read, writes locked to service role only.
-- The backend uses the SERVICE_ROLE key, which bypasses RLS entirely —
-- these policies protect the data if the anon/public key is ever exposed
-- (e.g. if the frontend talks to Supabase directly later).
-- ----------------------------------------------------------------------------

alter table companies enable row level security;
alter table investors enable row level security;
alter table funding_rounds enable row level security;
alter table round_participants enable row level security;

drop policy if exists "Public read companies" on companies;
create policy "Public read companies" on companies for select using (true);

drop policy if exists "Public read investors" on investors;
create policy "Public read investors" on investors for select using (true);

drop policy if exists "Public read funding_rounds" on funding_rounds;
create policy "Public read funding_rounds" on funding_rounds for select using (true);

drop policy if exists "Public read round_participants" on round_participants;
create policy "Public read round_participants" on round_participants for select using (true);
