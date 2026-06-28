import { Request, Response } from "express";
import { supabase } from "../db/supabaseClient";
import { ApiException } from "../utils/ApiException";
import { cache, TTL } from "../utils/ttlCache";

const CACHE_KEY = "stats:overview";

export async function getOverviewStats(_req: Request, res: Response) {
  const cached = cache.get(CACHE_KEY);
  if (cached) return res.json({ data: cached, meta: { cached: true } });

  const [companiesCount, investorsCount, foundersCount, productsCount, newsCount, roundsAgg, recentRounds] =
    await Promise.all([
      supabase.from("companies").select("id", { count: "exact", head: true }),
      supabase.from("investors").select("id", { count: "exact", head: true }),
      supabase.from("founders").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("news_articles").select("id", { count: "exact", head: true }),
      supabase.from("funding_rounds").select("amount_usd"),
      supabase
        .from("funding_rounds")
        .select(
          `id, round_type, amount_usd, announced_date,
           company:companies(id, name, slug, logo_url),
           lead_investor:investors!funding_rounds_lead_investor_id_fkey(id, name, slug)`
        )
        .order("announced_date", { ascending: false })
        .limit(10),
    ]);

  if (companiesCount.error) throw ApiException.internal(companiesCount.error.message);
  if (investorsCount.error) throw ApiException.internal(investorsCount.error.message);
  if (roundsAgg.error) throw ApiException.internal(roundsAgg.error.message);
  if (recentRounds.error) throw ApiException.internal(recentRounds.error.message);

  const totalFunding = (roundsAgg.data ?? []).reduce((sum, r) => sum + (r.amount_usd ?? 0), 0);

  const stats = {
    total_companies: companiesCount.count ?? 0,
    total_investors: investorsCount.count ?? 0,
    total_founders: foundersCount.count ?? 0,
    total_products: productsCount.count ?? 0,
    total_news_articles: newsCount.count ?? 0,
    total_funding_rounds: roundsAgg.data?.length ?? 0,
    total_funding_usd: totalFunding,
    recent_rounds: recentRounds.data,
  };

  cache.set(CACHE_KEY, stats, TTL.STATS);
  res.json({ data: stats, meta: { cached: false } });
}
