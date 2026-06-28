-- Migration: 0002_founders_products_news.sql
-- Run this in the Supabase SQL Editor after 0001_init.sql

-- ── Add missing columns to companies (from spec) ─────────────────────────────
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS valuation         BIGINT,
  ADD COLUMN IF NOT EXISTS growth_score      NUMERIC(5,2)  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_scraped_at   TIMESTAMPTZ   DEFAULT now(),
  ADD COLUMN IF NOT EXISTS data_confidence_score NUMERIC(3,2) DEFAULT 0.8;

-- ── Add missing columns to investors (from spec) ─────────────────────────────
ALTER TABLE investors
  ADD COLUMN IF NOT EXISTS avg_check_size    BIGINT,
  ADD COLUMN IF NOT EXISTS fund_number       INTEGER;

-- ── Founders ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS founders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT,
  company_id  UUID REFERENCES companies(id) ON DELETE SET NULL,
  bio         TEXT,
  twitter     TEXT,
  linkedin    TEXT,
  location    TEXT,
  photo_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_founders_company_id ON founders(company_id);
CREATE INDEX IF NOT EXISTS idx_founders_slug       ON founders(slug);

CREATE TRIGGER founders_updated_at
  BEFORE UPDATE ON founders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE founders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "founders_public_read" ON founders FOR SELECT USING (true);

-- ── Products ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID REFERENCES companies(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT,
  category     TEXT,
  launch_date  DATE,
  upvotes      INTEGER DEFAULT 0,
  website_url  TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_slug       ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);

-- ── NewsArticles ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS news_articles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               TEXT NOT NULL,
  url                 TEXT NOT NULL UNIQUE,
  published_at        TIMESTAMPTZ NOT NULL,
  source              TEXT NOT NULL,
  tag                 TEXT,
  related_company_ids UUID[],
  summary             TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_tag          ON news_articles(tag);

ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news_public_read" ON news_articles FOR SELECT USING (true);
