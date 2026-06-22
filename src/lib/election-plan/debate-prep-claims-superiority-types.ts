/** Counts + category flags only — no claim text or secret values. */

export type ElectionPlanClaimsSuperiorityCategory = {
  id: string;
  label: string;
  totalCount: number;
  needsReviewCount: number;
  stageSafeCount: number;
};

export type ElectionPlanClaimsSuperioritySummary = {
  ledgerTotals: {
    totalClaims: number;
    verifiedClaims: number;
    needsReviewClaims: number;
    unsupportedClaims: number;
    approvedForPublicAdaptation: number;
  };
  hubBuckets: {
    supported: number;
    partial: number;
    needsResearch: number;
  };
  superiorityCategories: ElectionPlanClaimsSuperiorityCategory[];
};
