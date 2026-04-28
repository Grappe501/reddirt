import { getCountyPriorityPlanMeta } from "../county-priority-voter-universe";
import { buildCountyPoliticalProfile } from "../county-political-profile";
import { prisma } from "@/lib/db";

/** Pulaski County, Arkansas — profile via shared COUNTY-PROFILE engine (no bespoke migration). */
export function buildPulaskiCountyPoliticalProfile() {
  return buildCountyPoliticalProfile({
    countyName: "Pulaski",
    fips: "05119",
    office: "Secretary of State",
    includePrecincts: true,
    includeOpposition: true,
  });
}

/** Priority-plan aggregates when Prisma resolves a Pulaski county row — no voter scan here. */
export async function getPulaskiCountyPriorityPlanMeta() {
  const c = await prisma.county.findFirst({
    where: { OR: [{ fips: "05119" }, { slug: { equals: "pulaski-county", mode: "insensitive" } }] },
    select: { id: true },
  });
  if (!c) return null;
  const p = await buildPulaskiCountyPoliticalProfile();
  return getCountyPriorityPlanMeta({
    countyId: c.id,
    expectedGeneralBallots: p.winNumberModel.expectedTotalVotes ?? null,
  });
}
