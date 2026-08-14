-- Oscar tool-suite memory. Keys are normalized questions / tool ids, not contact values.

CREATE TABLE "ContactIntelOscarLesson" (
  "id" TEXT NOT NULL,
  "kind" VARCHAR(40) NOT NULL,
  "key" VARCHAR(200) NOT NULL,
  "label" VARCHAR(320) NOT NULL,
  "payloadJson" JSONB NOT NULL DEFAULT '{}',
  "uses" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContactIntelOscarLesson_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContactIntelOscarLesson_kind_key_key" ON "ContactIntelOscarLesson"("kind", "key");
CREATE INDEX "ContactIntelOscarLesson_kind_updatedAt_idx" ON "ContactIntelOscarLesson"("kind", "updatedAt");
