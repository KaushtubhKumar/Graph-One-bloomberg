/**
 * Trending Score Formula
 * ----------------------
 * Signals used (all available in the schema):
 *   1. Funding recency   — how recently the last funding round was announced (max 40 pts)
 *      Score decays linearly over 180 days. A round announced today = 40, 180 days ago = 0.
 *   2. Total funding     — log-scaled so mega-rounds don't dominate (max 25 pts)
 *      log10(funding_usd / 1_000_000) capped at 5 → mapped to 25 pts.
 *   3. Employee growth   — employee_count as a proxy for momentum (max 20 pts)
 *      log10(employee_count + 1) capped at 4 → mapped to 20 pts.
 *   4. Data confidence   — data_confidence_score weight on result reliability (max 15 pts)
 *      data_confidence_score is 0-1; multiplied by 15.
 *
 * Maximum possible score: 100.
 * Stored as growth_score on the company record after calculation.
 */

export interface TrendingInput {
  last_funding_at: string | null;
  total_funding_usd: number | null;
  employee_count: number | null;
  data_confidence_score: number | null;
}

export function computeTrendingScore(c: TrendingInput): number {
  const now = Date.now();

  // 1. Funding recency (40 pts)
  let recencyScore = 0;
  if (c.last_funding_at) {
    const daysAgo = (now - new Date(c.last_funding_at).getTime()) / (1000 * 60 * 60 * 24);
    recencyScore = Math.max(0, 40 * (1 - daysAgo / 180));
  }

  // 2. Total funding log-scaled (25 pts)
  let fundingScore = 0;
  if (c.total_funding_usd && c.total_funding_usd > 0) {
    const logVal = Math.log10(c.total_funding_usd / 1_000_000);
    fundingScore = Math.min(25, Math.max(0, (logVal / 5) * 25));
  }

  // 3. Employee count momentum (20 pts)
  let employeeScore = 0;
  if (c.employee_count && c.employee_count > 0) {
    const logVal = Math.log10(c.employee_count + 1);
    employeeScore = Math.min(20, Math.max(0, (logVal / 4) * 20));
  }

  // 4. Data confidence (15 pts)
  const confidenceScore = (c.data_confidence_score ?? 0.5) * 15;

  const total = recencyScore + fundingScore + employeeScore + confidenceScore;
  return Math.round(total * 10) / 10;
}
