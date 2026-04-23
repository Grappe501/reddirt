-- Persist Author Studio compose alternates per work item.

CREATE TABLE "SocialContentDraft" (
    "id" TEXT NOT NULL,
    "socialContentItemId" TEXT NOT NULL,
    "title" TEXT,
    "sourceRoute" TEXT NOT NULL,
    "sourceIntent" TEXT NOT NULL,
    "bodyCopy" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "isApplied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialContentDraft_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SocialContentDraft_socialContentItemId_createdAt_idx" ON "SocialContentDraft"("socialContentItemId", "createdAt");
CREATE INDEX "SocialContentDraft_createdByUserId_idx" ON "SocialContentDraft"("createdByUserId");

ALTER TABLE "SocialContentDraft" ADD CONSTRAINT "SocialContentDraft_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "SocialContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SocialContentDraft" ADD CONSTRAINT "SocialContentDraft_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
