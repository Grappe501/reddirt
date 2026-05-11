import "server-only";

import { getCountyRegistrationGoalByCountyId } from "@/lib/campaign-engine/county-goals";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";
import { getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";

export type CountyRegistrationGoalDataStatus = "live" | "demo" | "not_connected";

export type CountyRegistrationGoalCardData = {
  countyDisplayName: string;
  registrationGoal: number | null;
  registrationsSoFar: number | null;
  dataStatus: CountyRegistrationGoalDataStatus;
};

/**
 * Loads county registration goal + progress for dashboard cards (read-only).
 */
export async function loadCountyRegistrationGoalCardData(
  registrySlug: string | null,
): Promise<CountyRegistrationGoalCardData | null> {
  if (!registrySlug) return null;

  const reg = getRegistryCountyBySlug(registrySlug);
  const fallbackName = reg?.displayName ?? registrySlug;

  if (!isDatabaseConfigured()) {
    return {
      countyDisplayName: fallbackName,
      registrationGoal: 5_000,
      registrationsSoFar: 1_200,
      dataStatus: "demo",
    };
  }

  try {
    const county = await prisma.county.findUnique({
      where: { slug: registrySlug },
      select: { id: true, displayName: true },
    });
    if (!county) {
      return {
        countyDisplayName: fallbackName,
        registrationGoal: null,
        registrationsSoFar: null,
        dataStatus: "not_connected",
      };
    }

    const pack = await getCountyRegistrationGoalByCountyId(county.id);
    if (!pack) {
      return {
        countyDisplayName: county.displayName,
        registrationGoal: null,
        registrationsSoFar: null,
        dataStatus: "not_connected",
      };
    }

    const goal = pack.registrationGoal ?? null;
    const soFar = pack.newRegistrationsSinceBaseline ?? null;

    if (goal == null) {
      return {
        countyDisplayName: pack.county.displayName,
        registrationGoal: null,
        registrationsSoFar: soFar,
        dataStatus: "not_connected",
      };
    }

    return {
      countyDisplayName: pack.county.displayName,
      registrationGoal: goal,
      registrationsSoFar: soFar,
      dataStatus: "live",
    };
  } catch {
    return {
      countyDisplayName: fallbackName,
      registrationGoal: null,
      registrationsSoFar: null,
      dataStatus: "not_connected",
    };
  }
}
