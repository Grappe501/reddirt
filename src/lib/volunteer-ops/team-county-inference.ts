import {
  ARKANSAS_COUNTY_REGISTRY,
  isValidArkansasCountySlug,
} from "@/lib/county/arkansas-county-registry";

/**
 * Best-effort link from a VOS team slug / geography label to an Arkansas county registry slug.
 * DB-backed teams can set `metadataJson.countySlug` for an authoritative link (see `Team.linkedCountySlug`).
 */
export function inferTeamCountyRegistrySlug(team: { slug: string; geography: string }): string | null {
  return inferCountySlugFromTeamSlug(team.slug) ?? inferCountySlugFromGeography(team.geography);
}

function inferCountySlugFromTeamSlug(teamSlug: string): string | null {
  const parts = teamSlug.split("-").filter(Boolean);
  if (parts.length >= 2 && parts[1] === "county") {
    const candidate = parts[0]!;
    if (isValidArkansasCountySlug(candidate)) return candidate;
  }
  for (const c of ARKANSAS_COUNTY_REGISTRY) {
    if (teamSlug === c.slug || teamSlug.startsWith(`${c.slug}-`)) {
      return c.slug;
    }
    if (teamSlug.startsWith(`${c.slug}-county-`)) {
      return c.slug;
    }
  }
  return null;
}

function inferCountySlugFromGeography(geography: string): string | null {
  const g = geography.trim();
  if (!g) return null;
  for (const c of ARKANSAS_COUNTY_REGISTRY) {
    if (g.includes(c.displayName)) {
      return c.slug;
    }
  }
  return null;
}
