CREATE TYPE "marketlab"."OrderSide" AS ENUM ('BUY', 'SELL');
CREATE TYPE "marketlab"."OrderType" AS ENUM ('MARKET');
CREATE TYPE "marketlab"."OrderStatus" AS ENUM ('PENDING', 'FILLED', 'REJECTED', 'CANCELLED');

ALTER TABLE "marketlab"."Competition"
  ADD COLUMN "flatTradeFee" DECIMAL(18,4) NOT NULL DEFAULT 0,
  ADD COLUMN "slippageBps" DECIMAL(10,4) NOT NULL DEFAULT 0;

CREATE TABLE "marketlab"."SimulatedOrder" (
  "id" TEXT NOT NULL,
  "portfolioId" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "side" "marketlab"."OrderSide" NOT NULL,
  "orderType" "marketlab"."OrderType" NOT NULL DEFAULT 'MARKET',
  "status" "marketlab"."OrderStatus" NOT NULL DEFAULT 'PENDING',
  "quantity" DECIMAL(18,8) NOT NULL,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "rejectReason" TEXT,
  CONSTRAINT "SimulatedOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketlab"."SimulatedExecution" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "portfolioId" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "side" "marketlab"."OrderSide" NOT NULL,
  "quantity" DECIMAL(18,8) NOT NULL,
  "marketPrice" DECIMAL(18,8) NOT NULL,
  "executionPrice" DECIMAL(18,8) NOT NULL,
  "grossAmount" DECIMAL(18,2) NOT NULL,
  "feeAmount" DECIMAL(18,2) NOT NULL,
  "cashImpact" DECIMAL(18,2) NOT NULL,
  "quoteTimestamp" TIMESTAMP(3) NOT NULL,
  "provider" TEXT NOT NULL,
  "feed" TEXT,
  "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SimulatedExecution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketlab"."Position" (
  "id" TEXT NOT NULL,
  "portfolioId" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "quantity" DECIMAL(18,8) NOT NULL,
  "averageCost" DECIMAL(18,8) NOT NULL,
  "realizedPnl" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SimulatedOrder_portfolioId_idempotencyKey_key" ON "marketlab"."SimulatedOrder"("portfolioId", "idempotencyKey");
CREATE INDEX "SimulatedOrder_portfolioId_requestedAt_idx" ON "marketlab"."SimulatedOrder"("portfolioId", "requestedAt");
CREATE INDEX "SimulatedOrder_symbol_requestedAt_idx" ON "marketlab"."SimulatedOrder"("symbol", "requestedAt");
CREATE UNIQUE INDEX "SimulatedExecution_orderId_key" ON "marketlab"."SimulatedExecution"("orderId");
CREATE INDEX "SimulatedExecution_portfolioId_executedAt_idx" ON "marketlab"."SimulatedExecution"("portfolioId", "executedAt");
CREATE INDEX "SimulatedExecution_symbol_executedAt_idx" ON "marketlab"."SimulatedExecution"("symbol", "executedAt");
CREATE UNIQUE INDEX "Position_portfolioId_symbol_key" ON "marketlab"."Position"("portfolioId", "symbol");
CREATE INDEX "Position_symbol_idx" ON "marketlab"."Position"("symbol");

ALTER TABLE "marketlab"."SimulatedOrder" ADD CONSTRAINT "SimulatedOrder_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "marketlab"."Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "marketlab"."SimulatedExecution" ADD CONSTRAINT "SimulatedExecution_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "marketlab"."SimulatedOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "marketlab"."SimulatedExecution" ADD CONSTRAINT "SimulatedExecution_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "marketlab"."Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "marketlab"."Position" ADD CONSTRAINT "Position_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "marketlab"."Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
