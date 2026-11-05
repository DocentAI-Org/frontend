/**
 * Search, sort and "Show more" for lists (spec 016). They live in the URL, so the server renders
 * the list and reload, back and shared links keep them.
 */
export const STEP = 20;
const MAX_SHOWN = 500;

type Params = Record<string, string | string[] | undefined>;

export type ListState<Sort extends string> = { q: string; sort: Sort; shown: number };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** `sorts[0]` is the list's default order, also the API's. */
export function listState<Sort extends string>(params: Params, sorts: readonly Sort[]): ListState<Sort> {
  const sort = first(params.sort);
  const shown = Number.parseInt(first(params.shown) ?? "", 10);
  return {
    q: (first(params.q) ?? "").trim(),
    sort: sorts.includes(sort as Sort) ? (sort as Sort) : sorts[0],
    shown: Number.isFinite(shown) ? Math.min(Math.max(Math.ceil(shown / STEP) * STEP, STEP), MAX_SHOWN) : STEP
  };
}

/** The API query for a list: only what differs from the defaults. */
export function apiQuery<Sort extends string>(state: ListState<Sort>, sorts: readonly Sort[]) {
  return { q: state.q || undefined, sort: state.sort === sorts[0] ? undefined : state.sort };
}

/** The current URL with `changes` applied (undefined removes a parameter). */
export function withParams(pathname: string, current: URLSearchParams, changes: Record<string, string | undefined>) {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(changes)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  const query = next.toString();
  return query ? `${pathname}?${query}` : pathname;
}
