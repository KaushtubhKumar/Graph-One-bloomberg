import { Request, Response } from "express";
import { supabase } from "../db/supabaseClient";
import { ApiException } from "../utils/ApiException";
import { buildPaginationMeta, parsePagination, parseUuidParam } from "../utils/pagination";
import {
  CreateFundingRoundInput,
  ListFundingRoundsQuery,
  UpdateFundingRoundInput,
} from "../types/fundingRound.schema";

const SORT_MAP: Record<ListFundingRoundsQuery["sort"], { column: string; ascending: boolean }> = {
  date_desc: { column: "announced_date", ascending: false },
  date_asc: { column: "announced_date", ascending: true },
  amount_desc: { column: "amount_usd", ascending: false },
  amount_asc: { column: "amount_usd", ascending: true },
};

const ROUND_SELECT = `*,
  company:companies(id, name, slug, logo_url),
  lead_investor:investors!funding_rounds_lead_investor_id_fkey(id, name, slug, logo_url),
  participants:round_participants(is_lead, investor:investors(id, name, slug, logo_url))`;

export async function listFundingRounds(req: Request, res: Response) {
  const query = (req as unknown as { validatedQuery: ListFundingRoundsQuery }).validatedQuery;
  const { page, pageSize, from, to } = parsePagination(query as unknown as Record<string, unknown>);
  const { column, ascending } = SORT_MAP[query.sort];

  if (query.investor_id) {
    // Rounds where this investor is lead OR a participant — needs a two-step lookup
    // since round_participants is a separate join table.
    const { data: participantRows, error: partErr } = await supabase
      .from("round_participants")
      .select("round_id")
      .eq("investor_id", query.investor_id);

    if (partErr) throw ApiException.internal(partErr.message);
    const roundIds = (participantRows ?? []).map((r) => r.round_id);

    let builder = supabase
      .from("funding_rounds")
      .select(ROUND_SELECT, { count: "exact" })
      .or(
        roundIds.length > 0
          ? `lead_investor_id.eq.${query.investor_id},id.in.(${roundIds.join(",")})`
          : `lead_investor_id.eq.${query.investor_id}`
      );

    if (query.company_id) builder = builder.eq("company_id", query.company_id);
    if (query.round_type) builder = builder.eq("round_type", query.round_type);
    if (query.from_date) builder = builder.gte("announced_date", query.from_date);
    if (query.to_date) builder = builder.lte("announced_date", query.to_date);

    const { data, error, count } = await builder
      .order(column, { ascending, nullsFirst: false })
      .range(from, to);

    if (error) throw ApiException.internal(error.message);
    return res.json({ data, pagination: buildPaginationMeta(page, pageSize, count ?? 0) });
  }

  let builder = supabase.from("funding_rounds").select(ROUND_SELECT, { count: "exact" });

  if (query.company_id) builder = builder.eq("company_id", query.company_id);
  if (query.round_type) builder = builder.eq("round_type", query.round_type);
  if (query.from_date) builder = builder.gte("announced_date", query.from_date);
  if (query.to_date) builder = builder.lte("announced_date", query.to_date);

  const { data, error, count } = await builder
    .order(column, { ascending, nullsFirst: false })
    .range(from, to);

  if (error) throw ApiException.internal(error.message);
  res.json({ data, pagination: buildPaginationMeta(page, pageSize, count ?? 0) });
}

export async function getFundingRoundById(req: Request, res: Response) {
  const id = parseUuidParam(req.params.id);

  const { data, error } = await supabase
    .from("funding_rounds")
    .select(ROUND_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw ApiException.internal(error.message);
  if (!data) throw ApiException.notFound(`Funding round '${id}' not found`);

  res.json({ data });
}

/** Recomputes and writes companies.total_funding_usd / last_funding_at from funding_rounds. */
async function recalcCompanyFundingTotals(companyId: string) {
  const { data: rounds, error } = await supabase
    .from("funding_rounds")
    .select("amount_usd, announced_date")
    .eq("company_id", companyId);

  if (error) throw ApiException.internal(error.message);

  const total = (rounds ?? []).reduce((sum, r) => sum + (r.amount_usd ?? 0), 0);
  const lastDate = (rounds ?? [])
    .map((r) => r.announced_date)
    .sort()
    .at(-1);

  const { error: updateError } = await supabase
    .from("companies")
    .update({ total_funding_usd: total, last_funding_at: lastDate ?? null })
    .eq("id", companyId);

  if (updateError) throw ApiException.internal(updateError.message);
}

/** Recomputes investors.portfolio_count = distinct companies they've led or participated in. */
async function recalcInvestorPortfolioCount(investorId: string) {
  const [{ data: led, error: ledErr }, { data: participated, error: partErr }] = await Promise.all([
    supabase.from("funding_rounds").select("company_id").eq("lead_investor_id", investorId),
    supabase
      .from("round_participants")
      .select("round:funding_rounds(company_id)")
      .eq("investor_id", investorId),
  ]);

  if (ledErr) throw ApiException.internal(ledErr.message);
  if (partErr) throw ApiException.internal(partErr.message);

  const companyIds = new Set<string>();
  (led ?? []).forEach((r) => companyIds.add(r.company_id));
  (participated ?? []).forEach((p) => {
    const round = p.round as unknown as { company_id: string } | null;
    if (round?.company_id) companyIds.add(round.company_id);
  });

  const { error: updateError } = await supabase
    .from("investors")
    .update({ portfolio_count: companyIds.size })
    .eq("id", investorId);

  if (updateError) throw ApiException.internal(updateError.message);
}

export async function createFundingRound(req: Request, res: Response) {
  const input = req.body as CreateFundingRoundInput;
  const { participant_investor_ids, ...roundFields } = input;

  const { data: round, error } = await supabase
    .from("funding_rounds")
    .insert(roundFields)
    .select("*")
    .single();

  if (error) throw error;

  // Build the participant set: explicit participants + the lead (if any), deduped.
  const investorIds = new Set(participant_investor_ids);
  if (input.lead_investor_id) investorIds.add(input.lead_investor_id);

  if (investorIds.size > 0) {
    const rows = Array.from(investorIds).map((investorId) => ({
      round_id: round.id,
      investor_id: investorId,
      is_lead: investorId === input.lead_investor_id,
    }));

    const { error: participantsError } = await supabase.from("round_participants").insert(rows);
    if (participantsError) throw participantsError;
  }

  await recalcCompanyFundingTotals(input.company_id);
  await Promise.all(Array.from(investorIds).map((id) => recalcInvestorPortfolioCount(id)));

  const { data: fullRound, error: fetchError } = await supabase
    .from("funding_rounds")
    .select(ROUND_SELECT)
    .eq("id", round.id)
    .single();

  if (fetchError) throw ApiException.internal(fetchError.message);
  res.status(201).json({ data: fullRound });
}

export async function updateFundingRound(req: Request, res: Response) {
  const id = parseUuidParam(req.params.id);
  const input = req.body as UpdateFundingRoundInput;
  const { participant_investor_ids, ...roundFields } = input;

  const { data: existing, error: existingError } = await supabase
    .from("funding_rounds")
    .select("company_id")
    .eq("id", id)
    .maybeSingle();

  if (existingError) throw ApiException.internal(existingError.message);
  if (!existing) throw ApiException.notFound(`Funding round '${id}' not found`);

  const { data: updated, error } = await supabase
    .from("funding_rounds")
    .update(roundFields)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  // If participant list was provided, replace it entirely (simplest correct approach).
  let affectedInvestorIds = new Set<string>();
  if (participant_investor_ids !== undefined) {
    const { data: oldParticipants } = await supabase
      .from("round_participants")
      .select("investor_id")
      .eq("round_id", id);
    (oldParticipants ?? []).forEach((p) => affectedInvestorIds.add(p.investor_id));

    await supabase.from("round_participants").delete().eq("round_id", id);

    const leadId = input.lead_investor_id ?? updated.lead_investor_id;
    const investorIds = new Set(participant_investor_ids);
    if (leadId) investorIds.add(leadId);

    if (investorIds.size > 0) {
      const rows = Array.from(investorIds).map((investorId) => ({
        round_id: id,
        investor_id: investorId,
        is_lead: investorId === leadId,
      }));
      const { error: insertError } = await supabase.from("round_participants").insert(rows);
      if (insertError) throw insertError;
    }
    investorIds.forEach((i) => affectedInvestorIds.add(i));
  } else if (input.lead_investor_id) {
    affectedInvestorIds.add(input.lead_investor_id);
  }

  await recalcCompanyFundingTotals(updated.company_id);
  if (existing.company_id !== updated.company_id) {
    await recalcCompanyFundingTotals(existing.company_id);
  }
  await Promise.all(Array.from(affectedInvestorIds).map((iid) => recalcInvestorPortfolioCount(iid)));

  const { data: fullRound, error: fetchError } = await supabase
    .from("funding_rounds")
    .select(ROUND_SELECT)
    .eq("id", id)
    .single();

  if (fetchError) throw ApiException.internal(fetchError.message);
  res.json({ data: fullRound });
}

export async function deleteFundingRound(req: Request, res: Response) {
  const id = parseUuidParam(req.params.id);

  const { data: existing, error: existingError } = await supabase
    .from("funding_rounds")
    .select("company_id, lead_investor_id")
    .eq("id", id)
    .maybeSingle();

  if (existingError) throw ApiException.internal(existingError.message);
  if (!existing) throw ApiException.notFound(`Funding round '${id}' not found`);

  const { data: participants } = await supabase
    .from("round_participants")
    .select("investor_id")
    .eq("round_id", id);

  const { error } = await supabase.from("funding_rounds").delete().eq("id", id);
  if (error) throw ApiException.internal(error.message);

  await recalcCompanyFundingTotals(existing.company_id);

  const affected = new Set((participants ?? []).map((p) => p.investor_id));
  if (existing.lead_investor_id) affected.add(existing.lead_investor_id);
  await Promise.all(Array.from(affected).map((iid) => recalcInvestorPortfolioCount(iid)));

  res.status(204).send();
}
