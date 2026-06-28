import { Request, Response } from "express";
import { supabase } from "../db/supabaseClient";
import { ApiException } from "../utils/ApiException";
import { buildPaginationMeta, parsePagination, asStringParam, parseUuidParam, slugify } from "../utils/pagination";
import {
  CreateCompanyInput,
  ListCompaniesQuery,
  UpdateCompanyInput,
} from "../types/company.schema";

const SORT_MAP: Record<ListCompaniesQuery["sort"], { column: string; ascending: boolean }> = {
  name_asc: { column: "name", ascending: true },
  name_desc: { column: "name", ascending: false },
  founded_desc: { column: "founded_year", ascending: false },
  founded_asc: { column: "founded_year", ascending: true },
  funding_desc: { column: "total_funding_usd", ascending: false },
  funding_asc: { column: "total_funding_usd", ascending: true },
  recent_funding: { column: "last_funding_at", ascending: false },
};

export async function listCompanies(req: Request, res: Response) {
  const query = (req as unknown as { validatedQuery: ListCompaniesQuery }).validatedQuery;
  const { page, pageSize, from, to } = parsePagination(query as unknown as Record<string, unknown>);
  const { column, ascending } = SORT_MAP[query.sort];

  let builder = supabase
    .from("companies")
    .select("*", { count: "exact" });

  if (query.search) {
    builder = builder.or(
      `name.ilike.%${query.search}%,one_liner.ilike.%${query.search}%`
    );
  }
  if (query.stage) builder = builder.eq("stage", query.stage);
  if (query.category) builder = builder.contains("categories", [query.category]);
  if (query.country) builder = builder.eq("hq_country", query.country);
  if (query.is_unicorn) builder = builder.eq("is_unicorn", query.is_unicorn === "true");

  const { data, error, count } = await builder
    .order(column, { ascending, nullsFirst: false })
    .range(from, to);

  if (error) throw ApiException.internal(error.message);

  res.json({
    data,
    pagination: buildPaginationMeta(page, pageSize, count ?? 0),
  });
}

export async function getCompanyByIdOrSlug(req: Request, res: Response) {
  const idOrSlug = asStringParam(req.params.idOrSlug, "idOrSlug");
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    idOrSlug
  );

  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq(isUuid ? "id" : "slug", idOrSlug)
    .maybeSingle();

  if (error) throw ApiException.internal(error.message);
  if (!company) throw ApiException.notFound(`Company '${idOrSlug}' not found`);

  // Pull funding rounds with lead investor + participants expanded
  const { data: rounds, error: roundsError } = await supabase
    .from("funding_rounds")
    .select(
      `*,
       lead_investor:investors!funding_rounds_lead_investor_id_fkey(id, name, slug, logo_url),
       participants:round_participants(is_lead, investor:investors(id, name, slug, logo_url))`
    )
    .eq("company_id", company.id)
    .order("announced_date", { ascending: false });

  if (roundsError) throw ApiException.internal(roundsError.message);

  res.json({ data: { ...company, funding_rounds: rounds ?? [] } });
}

export async function createCompany(req: Request, res: Response) {
  const input = req.body as CreateCompanyInput;
  const slug = input.slug ? slugify(input.slug) : slugify(input.name);

  const { data, error } = await supabase
    .from("companies")
    .insert({ ...input, slug })
    .select("*")
    .single();

  if (error) throw error; // handled centrally (e.g. 23505 unique violation -> 409)
  res.status(201).json({ data });
}

export async function updateCompany(req: Request, res: Response) {
  const id = parseUuidParam(req.params.id);
  const input = req.body as UpdateCompanyInput;

  const patch: Record<string, unknown> = { ...input };
  if (input.slug) patch.slug = slugify(input.slug);

  const { data, error } = await supabase
    .from("companies")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw ApiException.notFound(`Company '${id}' not found`);

  res.json({ data });
}

export async function deleteCompany(req: Request, res: Response) {
  const id = parseUuidParam(req.params.id);

  const { data, error } = await supabase
    .from("companies")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw ApiException.internal(error.message);
  if (!data) throw ApiException.notFound(`Company '${id}' not found`);

  res.status(204).send();
}
