import { useEffect, useState } from "react";

const RECENTLY_VIEWED_KEY = "k_essence_recently_viewed_v1";

export function recordRecentlyViewed(slug: string) {
  if (typeof window === "undefined" || !slug) return;
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const next = [slug, ...list.filter((s) => s !== slug)].slice(0, 8);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  } catch (e) {
    console.error("Failed to record recently viewed product", e);
  }
}

export function getRecentlyViewed(excludeSlug?: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    return excludeSlug ? list.filter((s) => s !== excludeSlug) : list;
  } catch {
    return [];
  }
}

export function useRecentlyViewed(currentSlug?: string) {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    if (currentSlug) {
      recordRecentlyViewed(currentSlug);
    }
    setSlugs(getRecentlyViewed(currentSlug));
  }, [currentSlug]);

  return slugs;
}
