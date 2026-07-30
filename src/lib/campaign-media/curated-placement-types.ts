/**
 * Curated homepage placement proposal types (client-safe).
 */

export const CURATED_PLACEMENT_PROPOSALS_REL = "data/campaign-media/curated-placement-proposals.json";
export const CURATED_PLACEMENT_STUB_REL = "data/campaign-media/curated-placement-stub.md";
export const HOMEPAGE_CURATION_FILE_REL = "src/content/media/homepage-campaign-photos.ts";

export type CuratedSurfaceId = "homepageGallery" | "acrossArkansas" | "meetKelly" | "hero";

export type CuratedIdListDiff = {
  surface: CuratedSurfaceId;
  current: string[];
  proposed: string[];
  added: string[];
  removed: string[];
  reordered: boolean;
  rationale: string;
};

export type CuratedPlacementProposal = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "pending" | "applied" | "dismissed";
  allowHero: boolean;
  diffs: CuratedIdListDiff[];
  meetKellyId: string | null;
  heroId: string | null;
  warnings: string[];
  nextActions: string[];
  appliedAt?: string;
  undoSnapshotId?: string;
};

export type CuratedPlacementUndoSnapshot = {
  id: string;
  createdAt: string;
  proposalId: string;
  homepageIds: string[];
  acrossIds: string[];
  meetKellyId: string | null;
  heroId: string | null;
  fileBackupRel: string;
};

export type CuratedPlacementStore = {
  version: 1;
  updatedAt: string;
  purpose: string;
  proposals: CuratedPlacementProposal[];
  undoSnapshots: CuratedPlacementUndoSnapshot[];
};
