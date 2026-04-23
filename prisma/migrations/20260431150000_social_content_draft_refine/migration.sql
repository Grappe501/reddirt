-- After SocialContentDraft exists: optional route/intent, updatedAt, relation rename is Prisma-only.

ALTER TABLE "SocialContentDraft" ALTER COLUMN "sourceRoute" DROP NOT NULL;
ALTER TABLE "SocialContentDraft" ALTER COLUMN "sourceIntent" DROP NOT NULL;
ALTER TABLE "SocialContentDraft" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
