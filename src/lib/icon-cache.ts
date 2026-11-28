import { getCategories, getPresets } from "@/lib/storage";

export const ICON_CACHE_NAME = "expense-tracker-icons-v1";

/**
 * Normalizes pasted icon links, data:image/svg+xml URLs, url(...) wrappers,
 * and raw <svg>...</svg> markup so they render reliably on both desktop and mobile browsers.
 */
export function normalizeIconInput(raw: string): string {
  let val = raw.trim();
  if (!val) return "";

  // Strip CSS url("...") or url('...') wrapper if pasted
  const cssUrlMatch = val.match(/^url\(\s*['"]?([\s\S]*?)['"]?\s*\)$/i);
  if (cssUrlMatch) {
    val = cssUrlMatch[1].trim();
  }

  // Convert raw <svg ...>...</svg> markup into an encoded data:image/svg+xml URL
  if (/^<svg[\s>]/i.test(val)) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(val)}`;
  }

  // Ensure data:image/svg+xml URLs are safely encoded for mobile WebViews
  if (/^data:image\/svg\+xml/i.test(val)) {
    const commaIdx = val.indexOf(",");
    if (commaIdx !== -1) {
      const header = val.slice(0, commaIdx);
      const body = val.slice(commaIdx + 1);
      if (!/;\s*base64/i.test(header)) {
        // If raw unencoded SVG or partial encoding with literal #, normalize safely
        if (body.includes("<") || body.includes("#")) {
          return `${header},${encodeURIComponent(
            (() => {
              try {
                return decodeURIComponent(body);
              } catch {
                return body;
              }
            })()
          )}`;
        }
      }
    }
  }

  return val;
}

/**
 * Fetches an external http(s) icon URL and saves it in the PWA CacheStorage
 * so it remains available offline.
 */
export async function cacheIconUrl(iconUrl: string): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;
  const trimmed = iconUrl.trim();
  if (!/^https?:\/\//i.test(trimmed)) return;

  try {
    const cache = await caches.open(ICON_CACHE_NAME);
    try {
      const res = await fetch(trimmed, { mode: "cors" });
      if (res.ok) {
        await cache.put(trimmed, res);
        return;
      }
    } catch {
      // Fallback to opaque no-cors fetch when remote host lacks CORS headers
    }
    const opaqueRes = await fetch(trimmed, { mode: "no-cors" });
    await cache.put(trimmed, opaqueRes);
  } catch {
    // Ignore network errors when offline
  }
}

/**
 * Removes an external http(s) icon URL from CacheStorage if no remaining
 * category or preset references it.
 */
export async function uncacheIconUrlIfUnused(iconUrl?: string): Promise<void> {
  if (!iconUrl || typeof window === "undefined" || !("caches" in window)) return;
  const trimmed = iconUrl.trim();
  if (!/^https?:\/\//i.test(trimmed)) return;

  try {
    const stillUsedByCategory = getCategories().some((c) => c.icon === trimmed);
    const stillUsedByPreset = getPresets().some((p) => p.icon === trimmed);
    if (stillUsedByCategory || stillUsedByPreset) return;

    const cache = await caches.open(ICON_CACHE_NAME);
    await cache.delete(trimmed);
  } catch {
    // ignore
  }
}
