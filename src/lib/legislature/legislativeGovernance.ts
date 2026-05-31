/** Legislative video intelligence governance — INTERNAL ONLY. */

export const LEGISLATIVE_GOVERNANCE = {
  publicationSafety: "NON_PUBLISHABLE" as const,
  humanReviewRequired: true as const,
  labels: [
    "INTERNAL_DRAFT",
    "NON_PUBLISHABLE",
    "HUMAN_REVIEW_REQUIRED",
    "TRANSCRIPT_NEEDS_REVIEW",
    "SPEAKER_ATTRIBUTION_REVIEW",
    "KH-4_EXPORT_CONTROL",
  ],
};

export const ARKLEG_BASE = "https://www.arkleg.state.ar.us";
export const DEFAULT_SPONSOR_NAME = "Kim Hammer";
export const DEFAULT_FETCH_DELAY_MS = 1500;
export const DEFAULT_MAX_FETCHES_PER_RUN = 5;
export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
