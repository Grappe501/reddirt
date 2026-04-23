-- FIN-2: contribution type + confirmation audit columns
ALTER TYPE "FinancialTransactionType" ADD VALUE 'CONTRIBUTION';

ALTER TABLE "FinancialTransaction" ADD COLUMN "confirmedByUserId" TEXT;
ALTER TABLE "FinancialTransaction" ADD COLUMN "confirmedAt" TIMESTAMP(3);

ALTER TABLE "FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_confirmedByUserId_fkey" FOREIGN KEY ("confirmedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "FinancialTransaction_confirmedByUserId_idx" ON "FinancialTransaction"("confirmedByUserId");

-- FIELD-1: field units + assignments (geography / position / seat rail)
CREATE TYPE "FieldUnitType" AS ENUM ('COUNTY', 'REGION');

CREATE TABLE "FieldUnit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FieldUnitType" NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FieldUnit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FieldAssignment" (
    "id" TEXT NOT NULL,
    "fieldUnitId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "userId" TEXT,
    "positionSeatId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FieldAssignment_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "FieldUnit" ADD CONSTRAINT "FieldUnit_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "FieldUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "FieldUnit_type_name_idx" ON "FieldUnit"("type", "name");
CREATE INDEX "FieldUnit_parentId_idx" ON "FieldUnit"("parentId");

ALTER TABLE "FieldAssignment" ADD CONSTRAINT "FieldAssignment_fieldUnitId_fkey" FOREIGN KEY ("fieldUnitId") REFERENCES "FieldUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FieldAssignment" ADD CONSTRAINT "FieldAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FieldAssignment" ADD CONSTRAINT "FieldAssignment_positionSeatId_fkey" FOREIGN KEY ("positionSeatId") REFERENCES "PositionSeat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "FieldAssignment_fieldUnitId_positionId_idx" ON "FieldAssignment"("fieldUnitId", "positionId");
CREATE INDEX "FieldAssignment_userId_idx" ON "FieldAssignment"("userId");
CREATE INDEX "FieldAssignment_positionSeatId_idx" ON "FieldAssignment"("positionSeatId");
