import { prisma } from "@/lib/db/prisma";
import { getPortfolioValuation } from "@/lib/portfolio/valuation";

export type LeaderboardRow = {
  rank: number;
  portfolioId: string;
  playerId: string;
  displayName: string;
  totalValue: number;
  totalReturn: number;
  totalReturnPct: number;
  cash: number;
  positionsValue: number;
};

export async function getCompetitionLeaderboard(competitionId: string): Promise<LeaderboardRow[]> {
  const portfolios = await prisma.portfolio.findMany({
    where: { competitionId },
    include: { player: true },
  });

  const valued = await Promise.all(
    portfolios.map(async (portfolio) => {
      const valuation = await getPortfolioValuation(portfolio.id);
      return {
        portfolioId: portfolio.id,
        playerId: portfolio.playerId,
        displayName: portfolio.player.displayName || portfolio.player.email || "MarketLab Player",
        totalValue: valuation.totalValue,
        totalReturn: valuation.totalReturn,
        totalReturnPct: valuation.totalReturnPct,
        cash: valuation.cash,
        positionsValue: valuation.positionsValue,
      };
    }),
  );

  return valued
    .sort((a, b) => b.totalValue - a.totalValue || a.displayName.localeCompare(b.displayName))
    .map((row, index) => ({ ...row, rank: index + 1 }));
}
