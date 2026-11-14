/**
 * Small in-memory cache for public (read-only) API responses.
 *
 * - Entries live for TTL_MS, so the database is hit at most once per key per window.
 * - Concurrent requests for the same key share one database query (single flight).
 * - Any successful admin write clears everything (see index.ts), so edits show up immediately.
 */
const TTL_MS = 5 * 60 * 1000;
const MAX_ENTRIES = 500;

const store = new Map<string, { expires: number; value: unknown }>();
const inFlight = new Map<string, Promise<unknown>>();
let generation = 0;

export async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;

  const running = inFlight.get(key);
  if (running) return running as Promise<T>;

  const startedIn = generation;
  const promise = load()
    .then((value) => {
      // Don't store a result that was loaded before an admin write cleared the cache.
      if (startedIn === generation) {
        if (store.size >= MAX_ENTRIES) store.delete(store.keys().next().value as string);
        store.set(key, { expires: Date.now() + TTL_MS, value });
      }
      return value;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

export function clearPublicCache() {
  generation++;
  store.clear();
  inFlight.clear();
}

export const publicCacheSize = () => store.size;
