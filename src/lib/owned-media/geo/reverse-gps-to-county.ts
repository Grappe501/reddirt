import type { Prisma } from "@prisma/client";

/** Rough WGS84 bounds for the US state of Arkansas. */
const AR_BBOX = { minLat: 33.0, maxLat: 36.5, minLng: -94.7, maxLng: -89.5 };

function inArkansas(lat: number, lng: number): boolean {
  return lat >= AR_BBOX.minLat && lat <= AR_BBOX.maxLat && lng >= AR_BBOX.minLng && lng <= AR_BBOX.maxLng;
}

function countyNameToSlug(county: string | undefined): string | null {
  if (!county) return null;
  const base = county.replace(/\bcounty\b/gi, "").trim().toLowerCase();
  if (!base) return null;
  return base.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || null;
}

export type NominatimSummary = { displayName: string; state: string; county: string; city: string; raw: Record<string, unknown> };

/**
 * Best-effort: OpenStreetMap Nominatim reverse (when not disabled), restricted to AR.
 * Set OWNED_MEDIA_NOMINATIM=0 to skip network. Always advisory — keep `needsGeoReview` on the row until a human confirms.
 * @see https://operations.osmfoundation.org/policies/nominatim/ (usage / attribution)
 */
export async function reverseGpsToArkansasCounty(
  lat: number,
  lng: number
): Promise<{
  countySlug: string | null;
  countyFips: string | null;
  city: string | null;
  confidence: number;
  nominatim?: NominatimSummary | null;
}> {
  if (!inArkansas(lat, lng)) {
    return { countySlug: null, countyFips: null, city: null, confidence: 0, nominatim: null };
  }
  if (process.env.OWNED_MEDIA_NOMINATIM === "0") {
    return { countySlug: null, countyFips: null, city: null, confidence: 0, nominatim: null };
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    const res = await fetch(url, {
      headers: {
        "User-Agent": process.env.OWNED_MEDIA_NOMINATIM_UA || "RedDirt-campaign/1.0 (owned-media-ingest)",
        Accept: "application/json",
      },
      // Next.js or Node fetch — no cookies
      cache: "no-store",
    });
    if (!res.ok) {
      return { countySlug: null, countyFips: null, city: null, confidence: 0, nominatim: null };
    }
    const data = (await res.json()) as {
      display_name?: string;
      address?: { state?: string; county?: string; city?: string; town?: string; village?: string; hamlet?: string; municipality?: string };
    };
    const state = data.address?.state;
    const inAr = state === "Arkansas" || state === "AR";
    if (!inAr) {
      return { countySlug: null, countyFips: null, city: null, confidence: 0, nominatim: null };
    }
    const county = data.address?.county;
    const cityName =
      data.address?.city ??
      data.address?.town ??
      data.address?.village ??
      data.address?.hamlet ??
      data.address?.municipality ??
      null;
    const slug = countyNameToSlug(county);
    const nom: NominatimSummary = {
      displayName: data.display_name ?? "",
      state: state ?? "Arkansas",
      county: county ?? "",
      city: cityName ?? "",
      raw: { display_name: data.display_name, address: data.address },
    };
    return {
      countySlug: slug,
      countyFips: null,
      city: cityName,
      confidence: 0.55,
      nominatim: nom,
    };
  } catch {
    return { countySlug: null, countyFips: null, city: null, confidence: 0, nominatim: null };
  }
}

/**
 * Merges filename/exif/gps hints into a single `metadataJson.ingress` block for audit.
 */
export function buildIngestMetadataBlock(payload: {
  exif: Record<string, unknown>;
  filenameHints: Record<string, unknown>;
  fileStat: { birthtime: string; mtime: string; ctime: string };
  videoNote?: string;
  /** Small audit trail for Nominatim (no PII policy beyond what the provider returns in reverse). */
  reverseGeocode?: { provider: string; confidenceModel: string; displayName?: string; note?: string } | null;
}): Prisma.InputJsonValue {
  return {
    ingress: {
      version: 2,
      exif: payload.exif,
      filenameHints: payload.filenameHints,
      fileSystem: payload.fileStat,
      video: payload.videoNote ? { note: payload.videoNote } : undefined,
      reverseGeocode: payload.reverseGeocode ?? undefined,
    },
  } as Prisma.InputJsonValue;
}
