-- CreateEnum
CREATE TYPE "BudgetPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "BudgetPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "BudgetPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetLine" (
    "id" TEXT NOT NULL,
    "budgetPlanId" TEXT NOT NULL,
    "costBearingWireKind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "plannedAmount" DECIMAL(14,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BudgetPlan_status_createdAt_idx" ON "BudgetPlan"("status", "createdAt");

-- CreateIndex
CREATE INDEX "BudgetLine_budgetPlanId_idx" ON "BudgetLine"("budgetPlanId");

-- CreateIndex
CREATE INDEX "BudgetLine_costBearingWireKind_idx" ON "BudgetLine"("costBearingWireKind");

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_budgetPlanId_fkey" FOREIGN KEY ("budgetPlanId") REFERENCES "BudgetPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
