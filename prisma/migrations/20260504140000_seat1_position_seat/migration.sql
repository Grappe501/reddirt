-- CreateEnum
CREATE TYPE "PositionSeatStatus" AS ENUM ('VACANT', 'FILLED', 'ACTING', 'SHADOW');

-- CreateTable
CREATE TABLE "PositionSeat" (
    "id" TEXT NOT NULL,
    "positionKey" TEXT NOT NULL,
    "userId" TEXT,
    "status" "PositionSeatStatus" NOT NULL DEFAULT 'VACANT',
    "actingForPositionKey" TEXT,
    "notes" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PositionSeat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PositionSeat_positionKey_key" ON "PositionSeat"("positionKey");
CREATE INDEX "PositionSeat_userId_idx" ON "PositionSeat"("userId");
CREATE INDEX "PositionSeat_status_positionKey_idx" ON "PositionSeat"("status", "positionKey");

-- AddForeignKey
ALTER TABLE "PositionSeat" ADD CONSTRAINT "PositionSeat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
