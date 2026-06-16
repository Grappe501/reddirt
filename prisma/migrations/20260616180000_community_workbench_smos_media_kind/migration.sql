-- Social Media OS (SMOS) workbenches use kind = media

ALTER TYPE "public"."CommunityWorkbenchKind" ADD VALUE IF NOT EXISTS 'media';
