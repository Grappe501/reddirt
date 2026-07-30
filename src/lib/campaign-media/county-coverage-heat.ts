/**
 * County coverage heat — album photo counts across all 75 Arkansas counties.
 * Read-only guidance for Publish Queue filters. Never Approves.
 */
import "server-only";

import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import { buildCountyAlbums } from "@/lib/campaign-media/county-albums";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import { resolveRegistryCountyFromLabel } from "@/lib/county/resolve-county-label";

export type CountyCoverageBand = "zero" | "thin" | "ok";

export type CountyCoverageCell = {
  slug: string;
  displayName: string;
  shortName: string;
  photoCount: number;
  band: CountyCoverageBand;
};

export type CountyCoverageHeat = {
  generatedAt: string;
  thinThreshold: number;
  totals: { zero: number; thin: number; ok: number };
  cells: CountyCoverageCell[];
  thinOrZeroSlugs: string[];
  thinOrZeroNames: string[];
};

function bandFor(count: number, thinThreshold: number): CountyCoverageBand {
  if (count <= 0) return "zero";
  if (count < thinThreshold) return "thin";
  return "ok";
}

export function buildCountyPhotoCoverageHeat(input?: {
  thinThreshold?: number;
}): CountyCoverageHeat {
  const thinThreshold = Math.min(Math.max(input?.thinThreshold ?? 3, 1), 12);
  const albums = buildCountyAlbums(listCampaignPhotosLive());
  const bySlug = new Map(albums.map((a) => [a.countySlug, a.photoCount]));

  const cells: CountyCoverageCell[] = ARKANSAS_COUNTY_REGISTRY.map((c) => {
    const photoCount = bySlug.get(c.slug) ?? 0;
    return {
      slug: c.slug,
      displayName: c.displayName,
      shortName: c.displayName.replace(/\s+County$/i, ""),
      photoCount,
      band: bandFor(photoCount, thinThreshold),
    };
  }).sort((a, b) => a.photoCount - b.photoCount || a.shortName.localeCompare(b.shortName));

  const thinOrZero = cells.filter((c) => c.band === "zero" || c.band === "thin");

  return {
    generatedAt: new Date().toISOString(),
    thinThreshold,
    totals: {
      zero: cells.filter((c) => c.band === "zero").length,
      thin: cells.filter((c) => c.band === "thin").length,
      ok: cells.filter((c) => c.band === "ok").length,
    },
    cells,
    thinOrZeroSlugs: thinOrZero.map((c) => c.slug),
    thinOrZeroNames: thinOrZero.map((c) => c.shortName),
  };
}

/** Normalize a freeform county label to registry slug when possible. */
export function countyLabelToCoverageSlug(county: string): string | null {
  const reg = resolveRegistryCountyFromLabel(county);
  return reg?.slug ?? null;
}
