import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Cash is always derived from the immutable ledger. No mutable portfolio.cash field
 * exists, so accounting truth can be reconstructed from economic events.
 */
export async function getCashBalance(portfolioId: string) {
  const aggregate = await prisma.cashLedgerEntry.aggregate({
    where: { portfolioId },
    _sum: { amount: true },
  });

  return aggregate._sum.amount ?? 0;
}
