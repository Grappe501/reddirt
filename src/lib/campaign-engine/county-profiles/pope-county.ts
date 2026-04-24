import { getCountyPriorityPlanMeta } from "../county-priority-voter-universe";
import { buildCountyPoliticalProfile } from "../county-political-profile";
import { prisma } from "@/lib/db";

/** Pope County, Arkansas — first-class profile (Secretary of State). */
export function buildPopeCountyPoliticalProfile() {
  return buildCountyPoliticalProfile({
    countyName: "Pope",
    fips: "05115",
    office: "Secretary of State",
    includePrecincts: true,
    includeOpposition: true,
  });
}

/** Public-safe counts for Pope priority / outreach planning (no voter scan). */
export async function getPopeCountyPriorityPlanMeta() {
  const c = await prisma.county.findFirst({
    where: { OR: [{ fips: "05115" }, { slug: { equals: "pope", mode: "insensitive" } }] },
    select: { id: true },
  });
  if (!c) return null;
  const p = await buildPopeCountyPoliticalProfile();
  return getCountyPriorityPlanMeta({
    countyId: c.id,
    expectedGeneralBallots: p.winNumberModel.expectedTotalVotes ?? null,
  });
}
