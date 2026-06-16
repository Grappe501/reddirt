-- Campaign Communications Hub (CCH) workbenches use kind = communications

ALTER TYPE "public"."CommunityWorkbenchKind" ADD VALUE IF NOT EXISTS 'communications';
