import { Request, Response } from "express";
import { supabase } from "../db/supabaseClient";
import { ApiException } from "../utils/ApiException";
import { buildPaginationMeta, parsePagination, asStringParam, parseUuidParam, slugify } from "../utils/pagination";
import {
  CreateInvestorInput,
  ListInvestorsQuery,
  UpdateInvestorInput,
} from "../types/investor.schema";

const SORT_MAP: Record<ListInvestorsQuery["sort"], { column: string; ascending: boolean }> = {
  name_asc: { column: "name", ascending: true },
  name_desc: { column: "name", ascending: false },
  portfolio_desc: { column: "portfolio_count", ascending: false },
  aum_desc: { column: "aum_usd", ascending: false },
};

export async function listInvestors(req: Request, res: Response) {
  const query = (req as unknown as { validatedQuery: ListInvestorsQuery }).validatedQuery;
  const { page, pageSize, from, to } = parsePagination(query as unknown as Record<string, unknown>);
  const { column, ascending } = SORT_MAP[query.sort];

  let builder = supabase.from("investors").select("*", { count: "exact" });

  if (query.search) {
    builder = builder.or(`name.ilike.%${query.search}%,description.ilike.%${query.search}%`);
  }
  if (query.type) builder = builder.eq("type", query.type);
  if (query.focus_area) builder = builder.contains("focus_areas", [query.focus_area]);
  if (query.country) builder = builder.eq("hq_country", query.country);

  const { data, error, count } = await builder
    .order(column, { ascending, nullsFirst: false })
    .range(from, to);

  if (error) throw ApiException.internal(error.message);

  res.json({ data, pagination: buildPaginationMeta(page, pageSize, count ?? 0) });
}

export async function getInvestorByIdOrSlug(req: Request, res: Response) {
  const idOrSlug = asStringParam(req.params.idOrSlug, "idOrSlug");
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    idOrSlug
  );

  const { data: investor, error } = await supabase
    .from("investors")
    .select("*")
    .eq(isUuid ? "id" : "slug", idOrSlug)
    .maybeSingle();

  if (error) throw ApiException.internal(error.message);
  if (!investor) throw ApiException.notFound(`Investor '${idOrSlug}' not found`);

  const { data: ledRounds, error: ledError } = await supabase
    .from("funding_rounds")
    .select("*, company:companies(id, name, slug, logo_url)")
    .eq("lead_investor_id", investor.id)
    .order("announced_date", { ascending: false });

  if (ledError) throw ApiException.internal(ledError.message);

  const { data: participations, error: partError } = await supabase
    .from("round_participants")
    .select("is_lead, round:funding_rounds(*, company:companies(id, name, slug, logo_url))")
    .eq("investor_id", investor.id);

  if (partError) throw ApiException.internal(partError.message);

  res.json({
    data: {
      ...investor,
      led_rounds: ledRounds ?? [],
      participated_rounds: (participations ?? []).map((p) => p.round),
    },
  });
}

export async function createInvestor(req: Request, res: Response) {
  const input = req.body as CreateInvestorInput;
  const slug = input.slug ? slugify(input.slug) : slugify(input.name);

  const { data, error } = await supabase
    .from("investors")
    .insert({ ...input, slug })
    .select("*")
    .single();

  if (error) throw error;
  res.status(201).json({ data });
}

export async function updateInvestor(req: Request, res: Response) {
  const id = parseUuidParam(req.params.id);
  const input = req.body as UpdateInvestorInput;

  const patch: Record<string, unknown> = { ...input };
  if (input.slug) patch.slug = slugify(input.slug);

  const { data, error } = await supabase
    .from("investors")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw ApiException.notFound(`Investor '${id}' not found`);

  res.json({ data });
}

export async function deleteInvestor(req: Request, res: Response) {
  const id = parseUuidParam(req.params.id);

  const { data, error } = await supabase
    .from("investors")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw ApiException.internal(error.message);
  if (!data) throw ApiException.notFound(`Investor '${id}' not found`);

  res.status(204).send();
}
