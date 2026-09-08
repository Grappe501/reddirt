import { CompetitionStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export const DEFAULT_COMPETITION_SLUG = "six-week-classic";

export async function ensureDefaultCompetition() {
  const existing = await prisma.competition.findUnique({ where: { slug: DEFAULT_COMPETITION_SLUG } });
  if (existing) return existing;

  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + 42 * 24 * 60 * 60 * 1000);

  return prisma.competition.create({
    data: {
      slug: DEFAULT_COMPETITION_SLUG,
      name: "Six-Week Classic",
      status: CompetitionStatus.OPEN,
      startingCash: "1000.00",
      currencyCode: "USD",
      startsAt,
      endsAt,
    },
  });
}
