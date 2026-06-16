import type { CommunityWorkbenchKind } from "@prisma/client";

import { loadElectionPlanSnapshotFromDisk } from "@/lib/election-plan/election-plan-snapshot-disk";
import { getCountyByName } from "@/lib/election-plan/load-county";
import {
  COMMUNITY_KPI_SLUG_OVERRIDES,
  PROGRAM_WORKBENCHES,
} from "./constants";
import { getCoalitionWorkbenchRegistry } from "./load-coalition-workbench-profile";
import { getSmosWorkbenchRegistry } from "./load-smos-workbench-profile";
import { getCchWorkbenchRegistry } from "./load-cch-workbench-profile";
import type { CommunityWorkbenchRegistryEntry } from "./types";

function countySlugForName(countyName: string): string {
  const data = loadElectionPlanSnapshotFromDisk();
  const row = getCountyByName(data, countyName);
  return row?.slug ?? countyName.toLowerCase().replace(/\s+/g, "-").replace(/-county$/, "");
}

function kpiTemplateForSlug(slug: string): string {
  return COMMUNITY_KPI_SLUG_OVERRIDES[slug] ?? "default_city";
}

export function buildCommunityWorkbenchRegistry(): CommunityWorkbenchRegistryEntry[] {
  const data = loadElectionPlanSnapshotFromDisk();
  const cityEntries: CommunityWorkbenchRegistryEntry[] = data.cities.map((city) => ({
    slug: city.slug,
    name: city.name,
    kind: "city" as CommunityWorkbenchKind,
    countySlug: countySlugForName(city.county),
    citySlug: city.slug,
    kpiTemplate: kpiTemplateForSlug(city.slug),
    tagline: `${city.county} County · ${city.influenceCategory}`,
    population: null,
  }));

  const programEntries: CommunityWorkbenchRegistryEntry[] = PROGRAM_WORKBENCHES.map((p) => ({
    slug: p.slug,
    name: p.name,
    kind: p.kind,
    countySlug: p.countySlug ?? null,
    citySlug: null,
    kpiTemplate: p.kpiTemplate,
    tagline: p.tagline,
    population: null,
  }));

  const coalitionEntries: CommunityWorkbenchRegistryEntry[] = getCoalitionWorkbenchRegistry().map((c) => ({
    slug: c.slug,
    name: c.name,
    kind: "coalition" as CommunityWorkbenchKind,
    countySlug: null,
    citySlug: null,
    kpiTemplate: "coalition",
    tagline: c.tagline,
    population: null,
  }));

  const smosEntries: CommunityWorkbenchRegistryEntry[] = getSmosWorkbenchRegistry().map((s) => ({
    slug: s.slug,
    name: s.name,
    kind: "media" as CommunityWorkbenchKind,
    countySlug: null,
    citySlug: null,
    kpiTemplate: "media",
    tagline: s.tagline,
    population: null,
  }));

  const cchEntries: CommunityWorkbenchRegistryEntry[] = getCchWorkbenchRegistry().map((c) => ({
    slug: c.slug,
    name: c.name,
    kind: "communications" as CommunityWorkbenchKind,
    countySlug: null,
    citySlug: null,
    kpiTemplate: "communications",
    tagline: c.tagline,
    population: null,
  }));

  const bySlug = new Map<string, CommunityWorkbenchRegistryEntry>();
  for (const entry of [...cityEntries, ...programEntries, ...coalitionEntries, ...smosEntries, ...cchEntries]) {
    bySlug.set(entry.slug, entry);
  }
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}
