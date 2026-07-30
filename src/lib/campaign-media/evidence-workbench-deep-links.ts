/**
 * Evidence Workbench URL deep-link helpers — Round A.
 * Normalize aliases so Next Actions / macros always land on a working stage.
 */

export type QueueUrlFilter =
  | "unknown"
  | "draft"
  | "turbo"
  | "needsApproval"
  | "consent"
  | "approved"
  | null;

export type PhotosUrlFilter =
  | "all"
  | "unknown"
  | "needsApproval"
  | "draft"
  | "approved"
  | "homepage";

export type SpeechesUrlFilter = "all" | "noCounty" | "needsApproval" | "approved";

export function parseQueueUrlFilter(raw?: string | null): QueueUrlFilter {
  const v = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
  if (!v) return null;
  if (v === "unknown" || v === "unknown-county") return "unknown";
  if (v === "draft" || v === "drafts" || v === "draft-ingest" || v === "intake") return "draft";
  if (v === "turbo" || v === "turbo-pending") return "turbo";
  if (v === "needsapproval" || v === "needs-approval" || v === "approve") return "needsApproval";
  if (v === "consent" || v === "consent-hold") return "consent";
  if (v === "approved" || v === "public" || v === "albums") return "approved";
  return null;
}

export function queueFilterToBucketId(
  filter: QueueUrlFilter,
):
  | "unknownCounty"
  | "draftIngest"
  | "turboPending"
  | "needsApproval"
  | "consentHold"
  | "approvedPublic"
  | null {
  if (filter === "unknown") return "unknownCounty";
  if (filter === "draft") return "draftIngest";
  if (filter === "turbo") return "turboPending";
  if (filter === "needsApproval") return "needsApproval";
  if (filter === "consent") return "consentHold";
  if (filter === "approved") return "approvedPublic";
  return null;
}

export function parsePhotosUrlFilter(raw?: string | null): PhotosUrlFilter {
  const v = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
  if (v === "unknown") return "unknown";
  if (v === "needsapproval" || v === "needs-approval") return "needsApproval";
  if (v === "draft" || v === "drafts" || v === "intake") return "draft";
  if (v === "approved" || v === "public" || v === "shipped") return "approved";
  if (v === "homepage") return "homepage";
  if (v === "needspromote" || v === "needs-promote" || v === "promote") return "all";
  return "all";
}

export function parseSpeechesUrlFilter(raw?: string | null): SpeechesUrlFilter {
  const v = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
  if (v === "nocounty" || v === "no-county" || v === "county") return "noCounty";
  if (v === "needsapproval" || v === "needs-approval") return "needsApproval";
  if (v === "approved" || v === "public") return "approved";
  if (v === "all") return "all";
  return "all";
}
