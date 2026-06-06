const PREFIX = 'astro_';

interface CacheEntry {
  data: unknown;
  expiry: number; // 0 = never expires
}

export function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (entry.expiry !== 0 && Date.now() > entry.expiry) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return entry.data as T;
  } catch {
    return null;
  }
}

export function setCache(key: string, data: unknown, ttlMs?: number): void {
  try {
    const expiry = ttlMs ? Date.now() + ttlMs : 0;
    localStorage.setItem(PREFIX + key, JSON.stringify({ data, expiry }));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}
