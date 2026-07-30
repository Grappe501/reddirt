/**
 * Turbo Ingest proposal types (client-safe).
 */

import type { EvidenceAiSuggestion } from "@/lib/campaign-media/evidence-ai-types";
import type { FitRecommendedFlags, WebsiteFitRecommendation } from "@/lib/campaign-media/website-fit-scorer";
import type { WebsiteSurfaceId } from "@/lib/campaign-media/website-surface-catalog";

export const TURBO_INGEST_PROPOSALS_REL = "data/campaign-media/turbo-ingest-proposals.json";

export type TurboIdentifySource = "ai" | "heuristic" | "overlay" | "skipped";

export type TurboPhotoProposal = {
  photoId: string;
  createdAt: string;
  updatedAt: string;
  status: "pending" | "applied" | "dismissed";
  identifySource: TurboIdentifySource;
  identify: EvidenceAiSuggestion | null;
  fit: {
    rankings: WebsiteFitRecommendation[];
    bestSurface: WebsiteSurfaceId | null;
    bestScore: number;
    inventoryNote: string;
  };
  recommendedFlags: FitRecommendedFlags;
  notes: string[];
};

export type TurboIngestProposalStore = {
  version: 1;
  updatedAt: string;
  purpose: string;
  lastRunAt?: string;
  lastRunMessage?: string;
  proposals: TurboPhotoProposal[];
};
