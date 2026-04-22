/** Public-safe view for campaign trail / feeds. */
export type PublicFestivalCard = {
  id: string;
  name: string;
  shortDescription: string | null;
  startAt: string;
  endAt: string;
  city: string | null;
  countyDisplayName: string | null;
  countySlug: string | null;
  venueName: string | null;
  /** Internal dedupe or listing; may be a non-HTTP `sos:` key. */
  sourceUrl: string;
  sourceChannel: string;
  /** Public `https?://` link for the card, when available. */
  linkUrl: string | null;
};

export type FestivalCoveragePayloadV1 = {
  version: 1;
  horizonNote: string;
  /** ISO week ranges (Sat–Sun framing in copy, stored as date keys). */
  weekends: {
    label: string;
    windowStart: string;
    windowEnd: string;
    candidatePriority: {
      festivalId: string;
      name: string;
      countyOrCity: string;
      rationale: string;
    };
    /** Organize volunteers / visibility at these other events while the candidate is at `candidatePriority`. */
    parallelTeamTargets: { festivalId: string; name: string; countyOrCity: string; task: string }[];
    /** Counties with no strong option that week — optional field visibility. */
    coverageGaps?: string[];
  }[];
};
