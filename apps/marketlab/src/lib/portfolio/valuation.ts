import { prisma } from "@/lib/db/prisma";
import { getCashBalance } from "@/lib/ledger/getCashBalance";
import { getMarketDataProvider } from "@/lib/market/provider";

export type PositionValuation = {
  symbol: string;
  quantity: number;
  averageCost: number;
  marketPrice: number;
  marketValue: number;
  costBasis: number;
  unrealizedPnL: number;
  realizedPnL: number;
  quoteAsOf: string;
  delayed: boolean;
};

export type PortfolioValuation = {
  portfolioId: string;
  cash: number;
  positionsValue: number;
  totalValue: number;
  startingCash: number;
  totalReturn: number;
  totalReturnPct: number;
  unrealizedPnL: number;
  realizedPnL: number;
  positions: PositionValuation[];
  valuedAt: string;
};

export async function getPortfolioValuation(portfolioId: string): Promise<PortfolioValuation> {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
    include: { positions: true, competition: true },
  });
  if (!portfolio) throw new Error("Portfolio not found");

  const cash = Number(await getCashBalance(portfolio.id));
  const livePositions = portfolio.positions.filter((p) => Number(p.quantity) > 0);
  const symbols = livePositions.map((p) => p.symbol);
  const quotes = symbols.length ? await getMarketDataProvider().getQuotes(symbols) : [];
  const quoteMap = new Map(quotes.map((q) => [q.symbol.toUpperCase(), q]));

  const positions: PositionValuation[] = livePositions.map((position) => {
    const quote = quoteMap.get(position.symbol.toUpperCase());
    if (!quote) throw new Error(`Quote unavailable for ${position.symbol}`);
    const quantity = Number(position.quantity);
    const averageCost = Number(position.averageCost);
    const marketPrice = quote.price;
    const marketValue = quantity * marketPrice;
    const costBasis = quantity * averageCost;
    return {
      symbol: position.symbol,
      quantity,
      averageCost,
      marketPrice,
      marketValue,
      costBasis,
      unrealizedPnL: marketValue - costBasis,
      realizedPnL: Number(position.realizedPnl),
      quoteAsOf: quote.asOf,
      delayed: quote.delayed,
    };
  });

  const positionsValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
  const unrealizedPnL = positions.reduce((sum, p) => sum + p.unrealizedPnL, 0);
  const realizedPnL = portfolio.positions.reduce((sum, p) => sum + Number(p.realizedPnl), 0);
  const totalValue = cash + positionsValue;
  const startingCash = Number(portfolio.competition.startingCash);
  const totalReturn = totalValue - startingCash;
  const totalReturnPct = startingCash === 0 ? 0 : totalReturn / startingCash;

  return {
    portfolioId: portfolio.id,
    cash,
    positionsValue,
    totalValue,
    startingCash,
    totalReturn,
    totalReturnPct,
    unrealizedPnL,
    realizedPnL,
    positions,
    valuedAt: new Date().toISOString(),
  };
}
