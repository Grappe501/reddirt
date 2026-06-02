import "server-only";

import { listCountyRegistrationGoals } from "@/lib/campaign-engine/county-goals";
import { getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";
import { isDatabaseConfigured } from "@/lib/env";

export type CanonicalRegistrationGoalStatus = "live" | "not_set" | "not_connected" | "db_unavailable";

export type CanonicalRegistrationGoalRow = {
  countySlug: string;
  countyName: string;
  canonicalRegistrationGoal: number | null;
  canonicalRegistrationGoalStatus: CanonicalRegistrationGoalStatus;
  canonicalRegistrationGoalSource: "CountyCampaignStats" | null;
};

/**
 * Read-only map of canonical registration goals keyed by registry slug (`pope-county`).
 * Never writes goals. Returns empty map when DB unavailable.
 */
export async function loadCanonicalRegistrationGoalsBySlug(): Promise<Map<string, CanonicalRegistrationGoalRow>> {
  const map = new Map<string, CanonicalRegistrationGoalRow>();
  if (!isDatabaseConfigured()) return map;

  try {
    const rows = await listCountyRegistrationGoals();
    for (const row of rows) {
      const slug = row.county.slug;
      const goal = row.registrationGoal ?? null;
      map.set(slug, {
        countySlug: slug,
        countyName: row.county.displayName,
        canonicalRegistrationGoal: goal,
        canonicalRegistrationGoalStatus: goal != null ? "live" : "not_set",
        canonicalRegistrationGoalSource: "CountyCampaignStats",
      });
    }
  } catch {
    return map;
  }
  return map;
}

/** Read-only single county canonical goal. */
export async function getCanonicalRegistrationGoalForSlug(
  registrySlug: string,
): Promise<CanonicalRegistrationGoalRow | null> {
  const reg = getRegistryCountyBySlug(registrySlug);
  if (!reg) return null;
  if (!isDatabaseConfigured()) {
    return {
      countySlug: registrySlug,
      countyName: reg.displayName,
      canonicalRegistrationGoal: null,
      canonicalRegistrationGoalStatus: "db_unavailable",
      canonicalRegistrationGoalSource: null,
    };
  }
  const map = await loadCanonicalRegistrationGoalsBySlug();
  return (
    map.get(registrySlug) ?? {
      countySlug: registrySlug,
      countyName: reg.displayName,
      canonicalRegistrationGoal: null,
      canonicalRegistrationGoalStatus: "not_connected",
      canonicalRegistrationGoalSource: null,
    }
  );
}
