import { ApiException } from "./ApiException";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

export interface PaginationParams {
  page: number;
  pageSize: number;
  from: number;
  to: number;
}

export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, parseInt(String(query.page ?? "1"), 10) || 1);
  let pageSize = parseInt(String(query.page_size ?? DEFAULT_PAGE_SIZE), 10);

  if (Number.isNaN(pageSize) || pageSize < 1) pageSize = DEFAULT_PAGE_SIZE;
  if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return { page, pageSize, from, to };
}

export function buildPaginationMeta(page: number, pageSize: number, total: number) {
  return {
    page,
    page_size: pageSize,
    total,
    total_pages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function asStringParam(value: string | string[] | undefined, fieldName = "param"): string {
  if (typeof value !== "string" || value.length === 0) {
    throw ApiException.badRequest(`Invalid or missing route parameter: ${fieldName}`);
  }
  return value;
}

export function parseUuidParam(value: string | string[] | undefined, fieldName = "id"): string {
  const str = asStringParam(value, fieldName);
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(str)) {
    throw ApiException.badRequest(`Invalid ${fieldName}: must be a valid UUID`);
  }
  return str;
}
