import { Request } from "express";

export interface PageParams {
  limit: number;
  offset: number;
  q: string;
}

export interface PageMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  nextOffset: number | null;
}

const toInt = (value: unknown) => {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(n) ? n : NaN;
};

/**
 * Read ?limit=&offset= (or ?page=) and an optional ?q= search term.
 * Works for GET query strings and for the legacy POST body the old frontend sends.
 */
export function pageParams(req: Request, opts: { defaultLimit?: number; maxLimit?: number } = {}): PageParams {
  const { defaultLimit = 10, maxLimit = 50 } = opts;
  const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
  const src: Record<string, unknown> = { ...body, ...req.query };

  const rawLimit = toInt(src.limit);
  const limit = Math.min(Math.max(Number.isNaN(rawLimit) ? defaultLimit : rawLimit, 1), maxLimit);

  const rawOffset = toInt(src.offset);
  const rawPage = toInt(src.page);
  const offset = !Number.isNaN(rawOffset)
    ? Math.max(rawOffset, 0)
    : !Number.isNaN(rawPage) ? Math.max(rawPage - 1, 0) * limit : 0;

  const q = typeof src.q === "string" ? src.q.trim().slice(0, 100) : "";
  return { limit, offset, q };
}

/** Escape % and _ so user input is matched literally inside ILIKE. */
export const likePattern = (q: string) => `%${q.replace(/[\\%_]/g, (c) => "\\" + c)}%`;

export function pageMeta(total: number, { limit, offset }: PageParams, returned: number): PageMeta {
  const next = offset + returned;
  const hasMore = next < total;
  return { total, limit, offset, hasMore, nextOffset: hasMore ? next : null };
}
