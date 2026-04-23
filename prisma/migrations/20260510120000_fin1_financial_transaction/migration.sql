-- CreateEnum
CREATE TYPE "FinancialTransactionType" AS ENUM ('EXPENSE', 'REIMBURSEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "FinancialSourceType" AS ENUM ('MANUAL', 'SUBMISSION', 'DOCUMENT', 'FUTURE_INTEGRATION');

-- CreateEnum
CREATE TYPE "FinancialTransactionStatus" AS ENUM ('DRAFT', 'CONFIRMED');

-- CreateTable
CREATE TABLE "FinancialTransaction" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "transactionType" "FinancialTransactionType" NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourceType" "FinancialSourceType" NOT NULL,
    "sourceId" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "relatedUserId" TEXT,
    "relatedEventId" TEXT,
    "notes" TEXT,
    "status" "FinancialTransactionStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FinancialTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinancialTransaction_transactionDate_status_idx" ON "FinancialTransaction"("transactionDate", "status");
CREATE INDEX "FinancialTransaction_sourceType_sourceId_idx" ON "FinancialTransaction"("sourceType", "sourceId");
CREATE INDEX "FinancialTransaction_category_transactionDate_idx" ON "FinancialTransaction"("category", "transactionDate");
CREATE INDEX "FinancialTransaction_status_transactionDate_idx" ON "FinancialTransaction"("status", "transactionDate");

-- AddForeignKey
ALTER TABLE "FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_relatedUserId_fkey" FOREIGN KEY ("relatedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_relatedEventId_fkey" FOREIGN KEY ("relatedEventId") REFERENCES "CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
