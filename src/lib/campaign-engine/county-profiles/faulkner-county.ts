import { getCountyPriorityPlanMeta } from "../county-priority-voter-universe";
import { buildCountyPoliticalProfile } from "../county-political-profile";
import { prisma } from "@/lib/db";

/** Faulkner County, Arkansas — profile via shared COUNTY-PROFILE engine (no bespoke migration). */
export function buildFaulknerCountyPoliticalProfile() {
  return buildCountyPoliticalProfile({
    countyName: "Faulkner",
    fips: "05045",
    office: "Secretary of State",
    includePrecincts: true,
    includeOpposition: true,
  });
}

/** Priority-plan aggregates when Prisma resolves a Faulkner county row — no voter scan here. */
export async function getFaulknerCountyPriorityPlanMeta() {
  const c = await prisma.county.findFirst({
    where: { OR: [{ fips: "05045" }, { slug: { equals: "faulkner-county", mode: "insensitive" } }] },
    select: { id: true },
  });
  if (!c) return null;
  const p = await buildFaulknerCountyPoliticalProfile();
  return getCountyPriorityPlanMeta({
    countyId: c.id,
    expectedGeneralBallots: p.winNumberModel.expectedTotalVotes ?? null,
  });
}
