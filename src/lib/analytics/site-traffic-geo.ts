export type VisitorPlace = {
  city: string;
  region: string;
};

const lookupCache = new Map<string, { place: VisitorPlace | null; exp: number }>();
const LOOKUP_TTL_MS = 24 * 60 * 60 * 1000;

export function sanitizeCityLabel(raw: string | null | undefined): string | undefined {
  const text = decodeMaybe(raw).replace(/\s+/g, " ").trim();
  if (!text || text.length > 40) return undefined;
  if (/@/.test(text) || /^\d{1,3}(\.\d{1,3}){3}$/.test(text) || /\d{6,}/.test(text)) return undefined;
  if (!/^[\p{L}][\p{L}\s.'’/-]*$/u.test(text)) return undefined;
  return text;
}

export function sanitizeRegionLabel(raw: string | null | undefined): string | undefined {
  const text = decodeMaybe(raw).replace(/\s+/g, " ").trim();
  if (!text) return undefined;
  if (/^[A-Za-z]{2}$/.test(text)) return text.toUpperCase();
  return sanitizeCityLabel(text);
}

export function formatCityRegion(city?: string | null, region?: string | null): string | undefined {
  const c = sanitizeCityLabel(city);
  const r = sanitizeRegionLabel(region);
  if (c && r) return `${c}, ${r}`;
  return c ?? undefined;
}

export function isPublicIp(ip: string): boolean {
  const text = ip.trim();
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(text)) return false;
  const [a, b] = text.split(".").map(Number);
  if (a === 10 || a === 127 || a === 0) return false;
  if (a === 192 && b === 168) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  return true;
}

export function cityFromRequestHeaders(headers: Headers): VisitorPlace | null {
  const nf = parseNetlifyGeo(headers.get("x-nf-geo"));
  if (nf) return nf;

  const cf = formatPlace(headers.get("cf-ipcity"), headers.get("cf-region") ?? headers.get("cf-region-code"));
  if (cf) return cf;

  const vercel = formatPlace(headers.get("x-vercel-ip-city"), headers.get("x-vercel-ip-country-region"));
  if (vercel) return vercel;

  return formatPlace(headers.get("x-city"), headers.get("x-region") ?? headers.get("x-region-code"));
}

export async function resolveVisitorPlace(req: Request, ip: string): Promise<VisitorPlace | null> {
  const fromHeader = cityFromRequestHeaders(req.headers);
  if (fromHeader) return fromHeader;
  if (!isPublicIp(ip)) return null;
  return lookupPlace(ip);
}

function cacheKey(ip: string): string {
  let hash = 2166136261;
  for (let i = 0; i < ip.length; i += 1) {
    hash ^= ip.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function decodeMaybe(raw: string | null | undefined): string {
  const text = (raw ?? "").trim();
  if (!text) return "";
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

function formatPlace(city: string | null | undefined, region: string | null | undefined): VisitorPlace | null {
  const c = sanitizeCityLabel(city);
  if (!c) return null;
  return { city: c, region: sanitizeRegionLabel(region) ?? "" };
}

function parseNetlifyGeo(raw: string | null): VisitorPlace | null {
  if (!raw) return null;
  try {
    const json = JSON.parse(raw) as {
      city?: string;
      subdivision?: { code?: string; name?: string };
    };
    return formatPlace(json.city, json.subdivision?.code ?? json.subdivision?.name);
  } catch {
    return null;
  }
}

async function lookupPlace(ip: string): Promise<VisitorPlace | null> {
  const key = cacheKey(ip);
  const now = Date.now();
  const hit = lookupCache.get(key);
  if (hit && hit.exp > now) return hit.place;
  const place = await fetchPlace(ip);
  lookupCache.set(key, { place, exp: now + LOOKUP_TTL_MS });
  if (lookupCache.size > 2000) {
    const first = lookupCache.keys().next().value;
    if (first) lookupCache.delete(first);
  }
  return place;
}

async function fetchPlace(ip: string): Promise<VisitorPlace | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 350);
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,city,region_code,region`, {
      signal: ctrl.signal,
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      success?: boolean;
      city?: string;
      region_code?: string;
      region?: string;
    };
    if (json.success === false) return null;
    return formatPlace(json.city, json.region_code ?? json.region);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
