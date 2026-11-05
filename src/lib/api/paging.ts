import "server-only";

import type { ApiResult } from "./client";

const API_MAX = 100;

/** The first `shown` items of a list, in pages of at most 100 (the API's limit). */
export async function upTo<T, Extra extends object = object>(
  shown: number,
  page: (limit: number, offset: number) => Promise<ApiResult<{ items: T[]; total: number } & Extra>>
): Promise<ApiResult<{ items: T[]; total: number } & Extra>> {
  let result = await page(Math.min(shown, API_MAX), 0);
  if (!result.ok) return result;
  const items = [...result.data.items];
  while (items.length < Math.min(shown, result.data.total) && result.data.items.length > 0) {
    result = await page(Math.min(shown - items.length, API_MAX), items.length);
    if (!result.ok) return result;
    items.push(...result.data.items);
  }
  return { ok: true, data: { ...result.data, items } };
}
