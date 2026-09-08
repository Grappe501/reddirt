import { PrismaClient, CompetitionMemberRole, CashLedgerEntryType } from "@prisma/client";

const prisma = new PrismaClient();

export type JoinCompetitionInput = {
  authSubject: string;
  email?: string | null;
  displayName?: string | null;
  competitionSlug: string;
};

/**
 * Atomically joins a player to a competition and provisions exactly one portfolio
 * with exactly one immutable opening-balance ledger entry. The opening cash amount
 * is always copied from Competition.startingCash at join time.
 */
export async function joinCompetition(input: JoinCompetitionInput) {
  return prisma.$transaction(async (tx) => {
    const competition = await tx.competition.findUnique({
      where: { slug: input.competitionSlug },
    });

    if (!competition) {
      throw new Error("Competition not found");
    }

    if (!['OPEN', 'ACTIVE'].includes(competition.status)) {
      throw new Error("Competition is not open for player enrollment");
    }

    const player = await tx.player.upsert({
      where: { authSubject: input.authSubject },
      update: {
        email: input.email ?? undefined,
        displayName: input.displayName ?? undefined,
      },
      create: {
        authSubject: input.authSubject,
        email: input.email ?? null,
        displayName: input.displayName ?? null,
      },
    });

    const membership = await tx.competitionMember.upsert({
      where: {
        competitionId_playerId: {
          competitionId: competition.id,
          playerId: player.id,
        },
      },
      update: {},
      create: {
        competitionId: competition.id,
        playerId: player.id,
        role: CompetitionMemberRole.PLAYER,
      },
    });

    const existingPortfolio = await tx.portfolio.findUnique({
      where: {
        competitionId_playerId: {
          competitionId: competition.id,
          playerId: player.id,
        },
      },
      include: { cashLedger: true },
    });

    if (existingPortfolio) {
      return {
        player,
        competition,
        membership,
        portfolio: existingPortfolio,
        openingBalanceCreated: false,
      };
    }

    const portfolio = await tx.portfolio.create({
      data: {
        competitionId: competition.id,
        playerId: player.id,
        currencyCode: competition.currencyCode,
        cashLedger: {
          create: {
            entryType: CashLedgerEntryType.OPENING_BALANCE,
            amount: competition.startingCash,
            currencyCode: competition.currencyCode,
            memo: `Opening balance for ${competition.name}`,
            sourceType: "COMPETITION",
            sourceId: competition.id,
          },
        },
      },
      include: { cashLedger: true },
    });

    return {
      player,
      competition,
      membership,
      portfolio,
      openingBalanceCreated: true,
    };
  });
}
