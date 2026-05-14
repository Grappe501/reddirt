import { approxCountyCenter } from "@/lib/opportunities/approx-county-center";

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Rough drive-distance proxy for staff (centroid to centroid); not shown on public responses. */
export function estimatePublicScheduleRouteMiles(countyName: string | undefined | null): number | null {
  if (!countyName?.trim()) return null;
  try {
    const dest = approxCountyCenter(countyName.trim());
    const hub = approxCountyCenter("Pulaski");
    return Math.round(haversineMiles(hub.lat, hub.lng, dest.lat, dest.lng));
  } catch {
    return null;
  }
}
