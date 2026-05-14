import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { approxCountyCenter, ROSE_BUD } from "@/lib/opportunities/approx-county-center";

export type RouteMatrixCacheEntry = {
  originKey: string;
  destKey: string;
  dateBucket: string;
  mode: "driving";
  durationSeconds: number;
  distanceMeters: number;
  source: "google_distance_matrix" | "haversine_estimate";
  fetchedAt: string;
};

export type RouteMatrixCacheFile = {
  version: 1;
  entries: Record<string, RouteMatrixCacheEntry>;
};

const EARTH_R_M = 6371000;

function toKey(lat1: number, lng1: number, lat2: number, lng2: number, dateBucket: string): string {
  return `${lat1.toFixed(4)},${lng1.toFixed(4)}|${lat2.toFixed(4)},${lng2.toFixed(4)}|${dateBucket}|driving`;
}

export function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const r1 = (a.lat * Math.PI) / 180;
  const r2 = (b.lat * Math.PI) / 180;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(r1) * Math.cos(r2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  return EARTH_R_M * c;
}

/** Rural / surface-road heuristic: ~0.85 min per mile + 15% on top of naive time, min 10 min. */
export function haversineDriveEstimateMinutes(meters: number): number {
  const miles = meters / 1609.34;
  const naive = miles * 0.85;
  return Math.max(10, Math.round(naive * 1.15));
}

export function applyRuralBufferToGoogleMinutes(googleMinutes: number): number {
  return Math.max(googleMinutes + 10, Math.round(googleMinutes * 1.15));
}

export function lookupCachedLegMinutes(
  cache: RouteMatrixCacheFile,
  origin: { lat: number; lng: number },
  dest: { lat: number; lng: number },
  dateBucket: string,
): number | null {
  const k1 = toKey(origin.lat, origin.lng, dest.lat, dest.lng, dateBucket);
  const e1 = cache.entries[k1];
  if (e1) return Math.round(e1.durationSeconds / 60);
  const k2 = toKey(dest.lat, dest.lng, origin.lat, origin.lng, dateBucket);
  const e2 = cache.entries[k2];
  if (e2) return Math.round(e2.durationSeconds / 60);
  return null;
}

export function estimateLegMinutes(
  cache: RouteMatrixCacheFile,
  origin: { lat: number; lng: number },
  dest: { lat: number; lng: number },
  dateBucket: string,
): number {
  const hit = lookupCachedLegMinutes(cache, origin, dest, dateBucket);
  if (hit != null) return hit;
  return haversineDriveEstimateMinutes(haversineMeters(origin, dest));
}

export async function loadRouteMatrixCache(repoRoot: string): Promise<RouteMatrixCacheFile> {
  const p = path.join(repoRoot, "data/calendar-command-center/route-matrix-cache.json");
  try {
    const raw = await readFile(p, "utf8");
    return JSON.parse(raw) as RouteMatrixCacheFile;
  } catch {
    return { version: 1, entries: {} };
  }
}

export async function saveRouteMatrixCache(repoRoot: string, cache: RouteMatrixCacheFile): Promise<void> {
  const p = path.join(repoRoot, "data/calendar-command-center/route-matrix-cache.json");
  await writeFile(p, JSON.stringify(cache, null, 2), "utf8");
}

export function resolveOpportunityCoord(o: {
  county: string;
  lat?: number;
  lng?: number;
}): { lat: number; lng: number } {
  if (typeof o.lat === "number" && typeof o.lng === "number") return { lat: o.lat, lng: o.lng };
  return approxCountyCenter(o.county);
}

export async function getOrComputeLeg(
  repoRoot: string,
  cache: RouteMatrixCacheFile,
  origin: { lat: number; lng: number },
  dest: { lat: number; lng: number },
  dateBucket: string,
  apiKey: string | undefined,
): Promise<{ minutes: number; miles: number; source: RouteMatrixCacheEntry["source"] }> {
  const key = toKey(origin.lat, origin.lng, dest.lat, dest.lng, dateBucket);
  const existing = cache.entries[key];
  if (existing) {
    return {
      minutes: Math.round(existing.durationSeconds / 60),
      miles: existing.distanceMeters / 1609.34,
      source: existing.source,
    };
  }

  const meters = haversineMeters(origin, dest);
  let minutes = haversineDriveEstimateMinutes(meters);
  let miles = meters / 1609.34;
  let source: RouteMatrixCacheEntry["source"] = "haversine_estimate";

  if (apiKey) {
    try {
      const u = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
      u.searchParams.set("origins", `${origin.lat},${origin.lng}`);
      u.searchParams.set("destinations", `${dest.lat},${dest.lng}`);
      u.searchParams.set("mode", "driving");
      u.searchParams.set("units", "imperial");
      u.searchParams.set("departure_time", "now");
      u.searchParams.set("key", apiKey);
      const res = await fetch(u.toString());
      if (res.ok) {
        const data = (await res.json()) as {
          rows?: Array<{
            elements?: Array<{ status: string; duration?: { value: number }; distance?: { value: number } }>;
          }>;
        };
        const el = data.rows?.[0]?.elements?.[0];
        if (el?.status === "OK" && el.duration?.value && el.distance?.value) {
          minutes = applyRuralBufferToGoogleMinutes(Math.ceil(el.duration.value / 60));
          miles = el.distance.value / 1609.34;
          source = "google_distance_matrix";
        }
      }
    } catch {
      /* keep haversine */
    }
  }

  cache.entries[key] = {
    originKey: `${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}`,
    destKey: `${dest.lat.toFixed(4)},${dest.lng.toFixed(4)}`,
    dateBucket,
    mode: "driving",
    durationSeconds: Math.round(minutes * 60),
    distanceMeters: miles * 1609.34,
    source,
    fetchedAt: new Date().toISOString(),
  };

  return { minutes, miles, source };
}

export { ROSE_BUD };
