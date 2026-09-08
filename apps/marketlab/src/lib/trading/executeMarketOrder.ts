import { Prisma, OrderSide, OrderStatus, CashLedgerEntryType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getMarketDataProvider } from "@/lib/market/provider";

export type ExecuteMarketOrderInput = {
  portfolioId: string;
  symbol: string;
  side: OrderSide;
  quantity: string | number;
  idempotencyKey: string;
};

const ZERO = new Prisma.Decimal(0);
const ONE_HUNDRED = new Prisma.Decimal(100);
const TEN_THOUSAND = new Prisma.Decimal(10000);

function money(value: Prisma.Decimal) {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

/**
 * Executes a simulated market order using a server-fetched quote.
 * No browser supplied price is ever trusted. All accounting mutations occur in one DB transaction.
 */
export async function executeMarketOrder(input: ExecuteMarketOrderInput) {
  const symbol = input.symbol.trim().toUpperCase();
  const quantity = new Prisma.Decimal(input.quantity);
  if (!symbol) throw new Error("Symbol is required");
  if (!quantity.isFinite() || quantity.lte(0)) throw new Error("Quantity must be greater than zero");
  if (!input.idempotencyKey.trim()) throw new Error("Idempotency key is required");

  const portfolio = await prisma.portfolio.findUnique({
    where: { id: input.portfolioId },
    include: { competition: true },
  });
  if (!portfolio) throw new Error("Portfolio not found");
  if (!["OPEN", "ACTIVE"].includes(portfolio.competition.status)) {
    throw new Error("Competition is not accepting trades");
  }

  const existing = await prisma.simulatedOrder.findUnique({
    where: { portfolioId_idempotencyKey: { portfolioId: portfolio.id, idempotencyKey: input.idempotencyKey } },
    include: { execution: true },
  });
  if (existing) return existing;

  const market = getMarketDataProvider();
  const status = await market.getMarketStatus();
  if (status.state !== "OPEN") throw new Error("Market orders are only available while the market is open");
  const quote = await market.getQuote(symbol);
  if (!Number.isFinite(quote.price) || quote.price <= 0) throw new Error("A valid market quote is required");

  const marketPrice = new Prisma.Decimal(quote.price);
  const slippageRate = new Prisma.Decimal(portfolio.competition.slippageBps).div(TEN_THOUSAND);
  const executionPrice = input.side === OrderSide.BUY
    ? marketPrice.mul(new Prisma.Decimal(1).add(slippageRate))
    : marketPrice.mul(new Prisma.Decimal(1).sub(slippageRate));
  const grossAmount = money(executionPrice.mul(quantity));
  const feeAmount = money(new Prisma.Decimal(portfolio.competition.flatTradeFee));
  const cashImpact = input.side === OrderSide.BUY
    ? grossAmount.add(feeAmount).neg()
    : grossAmount.sub(feeAmount);

  return prisma.$transaction(async (tx) => {
    const duplicate = await tx.simulatedOrder.findUnique({
      where: { portfolioId_idempotencyKey: { portfolioId: portfolio.id, idempotencyKey: input.idempotencyKey } },
      include: { execution: true },
    });
    if (duplicate) return duplicate;

    const cash = await tx.cashLedgerEntry.aggregate({
      where: { portfolioId: portfolio.id },
      _sum: { amount: true },
    });
    const cashBalance = new Prisma.Decimal(cash._sum.amount ?? 0);
    const position = await tx.position.findUnique({
      where: { portfolioId_symbol: { portfolioId: portfolio.id, symbol } },
    });

    if (input.side === OrderSide.BUY && cashBalance.add(cashImpact).lt(ZERO)) {
      throw new Error("Insufficient simulated cash");
    }
    if (input.side === OrderSide.SELL && (!position || new Prisma.Decimal(position.quantity).lt(quantity))) {
      throw new Error("Cannot sell more shares than the portfolio owns");
    }

    const order = await tx.simulatedOrder.create({
      data: {
        portfolioId: portfolio.id,
        idempotencyKey: input.idempotencyKey,
        symbol,
        side: input.side,
        status: OrderStatus.PENDING,
        quantity,
      },
    });

    let realizedPnl = new Prisma.Decimal(position?.realizedPnl ?? 0);
    if (input.side === OrderSide.BUY) {
      const oldQty = new Prisma.Decimal(position?.quantity ?? 0);
      const oldAvg = new Prisma.Decimal(position?.averageCost ?? 0);
      const newQty = oldQty.add(quantity);
      const newAvg = oldQty.mul(oldAvg).add(quantity.mul(executionPrice)).div(newQty);
      await tx.position.upsert({
        where: { portfolioId_symbol: { portfolioId: portfolio.id, symbol } },
        create: { portfolioId: portfolio.id, symbol, quantity, averageCost: executionPrice },
        update: { quantity: newQty, averageCost: newAvg },
      });
    } else if (position) {
      const oldQty = new Prisma.Decimal(position.quantity);
      const avgCost = new Prisma.Decimal(position.averageCost);
      realizedPnl = realizedPnl.add(executionPrice.sub(avgCost).mul(quantity));
      const newQty = oldQty.sub(quantity);
      await tx.position.update({
        where: { id: position.id },
        data: { quantity: newQty, realizedPnl: money(realizedPnl) },
      });
    }

    const execution = await tx.simulatedExecution.create({
      data: {
        orderId: order.id,
        portfolioId: portfolio.id,
        symbol,
        side: input.side,
        quantity,
        marketPrice,
        executionPrice,
        grossAmount,
        feeAmount,
        cashImpact,
        quoteTimestamp: new Date(quote.asOf),
        provider: quote.source,
        feed: quote.delayed ? "DELAYED" : "LIVE",
      },
    });

    await tx.cashLedgerEntry.create({
      data: {
        portfolioId: portfolio.id,
        entryType: CashLedgerEntryType.TRADE_SETTLEMENT,
        amount: input.side === OrderSide.BUY ? grossAmount.neg() : grossAmount,
        currencyCode: portfolio.currencyCode,
        memo: `${input.side} ${quantity.toString()} ${symbol} @ ${executionPrice.toFixed(4)}`,
        sourceType: "EXECUTION",
        sourceId: execution.id,
      },
    });
    if (feeAmount.gt(ZERO)) {
      await tx.cashLedgerEntry.create({
        data: {
          portfolioId: portfolio.id,
          entryType: CashLedgerEntryType.FEE,
          amount: feeAmount.neg(),
          currencyCode: portfolio.currencyCode,
          memo: `Simulated transaction fee for ${symbol}`,
          sourceType: "EXECUTION",
          sourceId: execution.id,
        },
      });
    }

    return tx.simulatedOrder.update({
      where: { id: order.id },
      data: { status: OrderStatus.FILLED, completedAt: new Date() },
      include: { execution: true },
    });
  });
}
