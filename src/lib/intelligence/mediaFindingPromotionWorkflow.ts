import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  loadPublicMediaIntakeQueue,
  type MediaFindingReviewStatus,
  type PublicMediaIntakeFinding,
} from "@/lib/intelligence/publicMediaIntake";
import {
  backupMediaIntakeQueueBeforeMutation,
  updateMediaFindingReviewStatus,
} from "@/lib/intelligence/publicMediaReviewWorkflow";

export const MEDIA_FINDING_PROMOTION_LOG_REL = "data/intelligence/media-finding-promotion-log.json";
export const MEDIA_DERIVED_TASK_DRAFTS_REL = "data/intelligence/media-derived-task-drafts.json";
export const MEDIA_DERIVED_CITATION_CANDIDATES_REL =
  "data/intelligence/media-derived-citation-candidates.json";

export type MediaFindingPromotionType =
  | "RETRIEVAL_TASK_DRAFT"
  | "CITATION_CANDIDATE_DRAFT"
  | "DISMISS"
  | "NEEDS_MORE_REVIEW";

export type MediaFindingPromotionEntry = {
  promotionId: string;
  findingId: string;
  promotionType: MediaFindingPromotionType;
  promotedBy: string;
  promotedAt: string;
  sourceFindingSnapshot: Pick<
    PublicMediaIntakeFinding,
    "findingId" | "title" | "summary" | "canonicalUrl" | "sourceId" | "sourceName" | "reviewStatus"
  >;
  targetDraftId: string | null;
  operatorNotes: string;
  publicationSafety: "NON_PUBLISHABLE";
  humanReviewRequired: true;
};

export type MediaFindingPromotionLog = {
  version: number;
  generatedAt: string;
  purpose: string;
  entries: MediaFindingPromotionEntry[];
};

export type MediaDerivedTaskDraft = {
  draftId: string;
  findingId: string;
  suggestedTaskTitle: string;
  suggestedSourcePath: string;
  suggestedPriority: "HIGH" | "MEDIUM" | "LOW";
  operatorNotes: string;
  publicationSafety: "NON_PUBLISHABLE";
  humanReviewRequired: true;
  reviewStatus: "DRAFT";
  createdAt: string;
  promotedBy: string;
};

export type MediaDerivedTaskDraftsFile = {
  version: number;
  generatedAt: string;
  purpose: string;
  drafts: MediaDerivedTaskDraft[];
};

export type MediaDerivedCitationCandidate = {
  candidateId: string;
  findingId: string;
  sourceUrl: string;
  title: string;
  summary: string;
  proposedCitationText: string;
  reviewStatus: "DRAFT";
  operatorNotes: string;
  publicationSafety: "NON_PUBLISHABLE";
  humanReviewRequired: true;
  createdAt: string;
  promotedBy: string;
};

export type MediaDerivedCitationCandidatesFile = {
  version: number;
  generatedAt: string;
  purpose: string;
  candidates: MediaDerivedCitationCandidate[];
};

export type PromotionResult =
  | {
      ok: true;
      promotionId: string;
      targetDraftId: string | null;
      nextStatus: MediaFindingReviewStatus;
    }
  | { ok: false; error: string };

const PROMOTABLE_STATUSES = new Set<MediaFindingReviewStatus>([
  "IN_REVIEW",
  "ACCEPTED_FOR_RESEARCH",
  "NEEDS_REVIEW",
]);

function absPath(repoRoot: string, rel: string): string {
  return path.join(repoRoot, rel);
}

function readJson<T>(repoRoot: string, rel: string): T {
  return JSON.parse(readFileSync(absPath(repoRoot, rel), "utf8")) as T;
}

function writeJson(repoRoot: string, rel: string, data: unknown): void {
  const target = absPath(repoRoot, rel);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function emptyPromotionLog(): MediaFindingPromotionLog {
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    purpose: "Human-initiated media finding promotions — draft objects only, NSI-10.",
    entries: [],
  };
}

function emptyTaskDrafts(): MediaDerivedTaskDraftsFile {
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    purpose: "Media-derived retrieval task drafts — not active KH-3B tasks until human confirms.",
    drafts: [],
  };
}

function emptyCitationCandidates(): MediaDerivedCitationCandidatesFile {
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    purpose: "Media-derived citation candidates — not governed citation cards until Citation Locker review.",
    candidates: [],
  };
}

export function loadMediaFindingPromotionLog(repoRoot: string = process.cwd()): MediaFindingPromotionLog {
  const abs = absPath(repoRoot, MEDIA_FINDING_PROMOTION_LOG_REL);
  if (!existsSync(abs)) return emptyPromotionLog();
  return readJson<MediaFindingPromotionLog>(repoRoot, MEDIA_FINDING_PROMOTION_LOG_REL);
}

export function loadMediaDerivedTaskDrafts(repoRoot: string = process.cwd()): MediaDerivedTaskDraftsFile {
  const abs = absPath(repoRoot, MEDIA_DERIVED_TASK_DRAFTS_REL);
  if (!existsSync(abs)) return emptyTaskDrafts();
  return readJson<MediaDerivedTaskDraftsFile>(repoRoot, MEDIA_DERIVED_TASK_DRAFTS_REL);
}

export function loadMediaDerivedCitationCandidates(
  repoRoot: string = process.cwd(),
): MediaDerivedCitationCandidatesFile {
  const abs = absPath(repoRoot, MEDIA_DERIVED_CITATION_CANDIDATES_REL);
  if (!existsSync(abs)) return emptyCitationCandidates();
  return readJson<MediaDerivedCitationCandidatesFile>(repoRoot, MEDIA_DERIVED_CITATION_CANDIDATES_REL);
}

function findingSnapshot(finding: PublicMediaIntakeFinding): MediaFindingPromotionEntry["sourceFindingSnapshot"] {
  return {
    findingId: finding.findingId,
    title: finding.title,
    summary: finding.summary,
    canonicalUrl: finding.canonicalUrl,
    sourceId: finding.sourceId,
    sourceName: finding.sourceName,
    reviewStatus: finding.reviewStatus,
  };
}

function appendPromotionEntry(
  entry: MediaFindingPromotionEntry,
  repoRoot: string,
): void {
  const log = loadMediaFindingPromotionLog(repoRoot);
  log.entries.push(entry);
  log.generatedAt = new Date().toISOString();
  writeJson(repoRoot, MEDIA_FINDING_PROMOTION_LOG_REL, log);
}

function resolveFinding(findingId: string, repoRoot: string): PublicMediaIntakeFinding | null {
  const queue = loadPublicMediaIntakeQueue(repoRoot);
  return queue.findings.find((row) => row.findingId === findingId) ?? null;
}

function assertPromotable(finding: PublicMediaIntakeFinding): string | null {
  if (finding.publicationSafety !== "NON_PUBLISHABLE") {
    return "Finding must remain NON_PUBLISHABLE.";
  }
  if (finding.claimStatus !== "NOT_A_CLAIM") {
    return "Finding must remain NOT_A_CLAIM.";
  }
  if (finding.reviewStatus === "DISMISSED" || finding.reviewStatus === "ARCHIVED") {
    return `Cannot promote finding with status ${finding.reviewStatus}.`;
  }
  if (finding.duplicateOf) {
    return "Cannot promote duplicate finding.";
  }
  return null;
}

export function summarizePromotionQueue(repoRoot?: string): {
  taskDraftCount: number;
  citationCandidateCount: number;
  promotionEventCount: number;
  pendingPromotionFindings: number;
} {
  const tasks = loadMediaDerivedTaskDrafts(repoRoot);
  const citations = loadMediaDerivedCitationCandidates(repoRoot);
  const promotions = loadMediaFindingPromotionLog(repoRoot);
  const queue = loadPublicMediaIntakeQueue(repoRoot);
  const pendingPromotionFindings = queue.findings.filter(
    (row) =>
      row.reviewStatus === "ROUTED_TO_TASK" || row.reviewStatus === "ROUTED_TO_CITATION_CANDIDATE",
  ).length;

  return {
    taskDraftCount: tasks.drafts.length,
    citationCandidateCount: citations.candidates.length,
    promotionEventCount: promotions.entries.length,
    pendingPromotionFindings,
  };
}

export function promoteFindingToRetrievalTaskDraft(
  input: {
    findingId: string;
    operator: string;
    operatorNotes?: string;
    changedByRoute: string;
    suggestedPriority?: "HIGH" | "MEDIUM" | "LOW";
  },
  repoRoot: string = process.cwd(),
): PromotionResult {
  const finding = resolveFinding(input.findingId, repoRoot);
  if (!finding) return { ok: false, error: `Finding not found: ${input.findingId}` };

  const block = assertPromotable(finding);
  if (block) return { ok: false, error: block };

  if (!PROMOTABLE_STATUSES.has(finding.reviewStatus) && finding.reviewStatus !== "ROUTED_TO_TASK") {
    return { ok: false, error: `Finding status ${finding.reviewStatus} not eligible for task draft promotion.` };
  }

  backupMediaIntakeQueueBeforeMutation(repoRoot);

  const draftId = `media-task-draft-${Date.now()}`;
  const drafts = loadMediaDerivedTaskDrafts(repoRoot);
  drafts.drafts.push({
    draftId,
    findingId: finding.findingId,
    suggestedTaskTitle: `Retrieve / verify: ${finding.title.slice(0, 120)}`,
    suggestedSourcePath: finding.canonicalUrl || finding.sourceUrl,
    suggestedPriority: input.suggestedPriority ?? (finding.relevanceScore >= 70 ? "HIGH" : "MEDIUM"),
    operatorNotes: input.operatorNotes ?? "",
    publicationSafety: "NON_PUBLISHABLE",
    humanReviewRequired: true,
    reviewStatus: "DRAFT",
    createdAt: new Date().toISOString(),
    promotedBy: input.operator,
  });
  drafts.generatedAt = new Date().toISOString();
  writeJson(repoRoot, MEDIA_DERIVED_TASK_DRAFTS_REL, drafts);

  const statusResult = updateMediaFindingReviewStatus(
    {
      findingId: input.findingId,
      nextStatus: "ROUTED_TO_TASK",
      operator: input.operator,
      operatorNotes: input.operatorNotes ?? `Promoted to task draft ${draftId}`,
      changedByRoute: input.changedByRoute,
    },
    repoRoot,
  );
  if (!statusResult.ok) return statusResult;

  const promotionId = `media-promotion-${Date.now()}`;
  appendPromotionEntry(
    {
      promotionId,
      findingId: finding.findingId,
      promotionType: "RETRIEVAL_TASK_DRAFT",
      promotedBy: input.operator,
      promotedAt: new Date().toISOString(),
      sourceFindingSnapshot: findingSnapshot(finding),
      targetDraftId: draftId,
      operatorNotes: input.operatorNotes ?? "",
      publicationSafety: "NON_PUBLISHABLE",
      humanReviewRequired: true,
    },
    repoRoot,
  );

  return { ok: true, promotionId, targetDraftId: draftId, nextStatus: "ROUTED_TO_TASK" };
}

export function promoteFindingToCitationCandidateDraft(
  input: {
    findingId: string;
    operator: string;
    operatorNotes?: string;
    changedByRoute: string;
    proposedCitationText?: string;
  },
  repoRoot: string = process.cwd(),
): PromotionResult {
  const finding = resolveFinding(input.findingId, repoRoot);
  if (!finding) return { ok: false, error: `Finding not found: ${input.findingId}` };

  const block = assertPromotable(finding);
  if (block) return { ok: false, error: block };

  if (
    !PROMOTABLE_STATUSES.has(finding.reviewStatus) &&
    finding.reviewStatus !== "ROUTED_TO_CITATION_CANDIDATE"
  ) {
    return {
      ok: false,
      error: `Finding status ${finding.reviewStatus} not eligible for citation candidate promotion.`,
    };
  }

  backupMediaIntakeQueueBeforeMutation(repoRoot);

  const candidateId = `media-citation-candidate-${Date.now()}`;
  const candidates = loadMediaDerivedCitationCandidates(repoRoot);
  candidates.candidates.push({
    candidateId,
    findingId: finding.findingId,
    sourceUrl: finding.canonicalUrl || finding.sourceUrl,
    title: finding.title,
    summary: finding.summary,
    proposedCitationText:
      input.proposedCitationText ??
      `${finding.title} — ${finding.summary.slice(0, 200)} (media finding; verify before citation use)`,
    reviewStatus: "DRAFT",
    operatorNotes: input.operatorNotes ?? "",
    publicationSafety: "NON_PUBLISHABLE",
    humanReviewRequired: true,
    createdAt: new Date().toISOString(),
    promotedBy: input.operator,
  });
  candidates.generatedAt = new Date().toISOString();
  writeJson(repoRoot, MEDIA_DERIVED_CITATION_CANDIDATES_REL, candidates);

  const statusResult = updateMediaFindingReviewStatus(
    {
      findingId: input.findingId,
      nextStatus: "ROUTED_TO_CITATION_CANDIDATE",
      operator: input.operator,
      operatorNotes: input.operatorNotes ?? `Promoted to citation candidate ${candidateId}`,
      changedByRoute: input.changedByRoute,
    },
    repoRoot,
  );
  if (!statusResult.ok) return statusResult;

  const promotionId = `media-promotion-${Date.now()}`;
  appendPromotionEntry(
    {
      promotionId,
      findingId: finding.findingId,
      promotionType: "CITATION_CANDIDATE_DRAFT",
      promotedBy: input.operator,
      promotedAt: new Date().toISOString(),
      sourceFindingSnapshot: findingSnapshot(finding),
      targetDraftId: candidateId,
      operatorNotes: input.operatorNotes ?? "",
      publicationSafety: "NON_PUBLISHABLE",
      humanReviewRequired: true,
    },
    repoRoot,
  );

  return { ok: true, promotionId, targetDraftId: candidateId, nextStatus: "ROUTED_TO_CITATION_CANDIDATE" };
}

export function dismissFindingAfterReview(
  input: {
    findingId: string;
    operator: string;
    operatorNotes?: string;
    changedByRoute: string;
  },
  repoRoot: string = process.cwd(),
): PromotionResult {
  const finding = resolveFinding(input.findingId, repoRoot);
  if (!finding) return { ok: false, error: `Finding not found: ${input.findingId}` };

  const statusResult = updateMediaFindingReviewStatus(
    {
      findingId: input.findingId,
      nextStatus: "DISMISSED",
      operator: input.operator,
      operatorNotes: input.operatorNotes ?? "Dismissed after review.",
      changedByRoute: input.changedByRoute,
    },
    repoRoot,
  );
  if (!statusResult.ok) return statusResult;

  appendPromotionEntry(
    {
      promotionId: `media-promotion-${Date.now()}`,
      findingId: finding.findingId,
      promotionType: "DISMISS",
      promotedBy: input.operator,
      promotedAt: new Date().toISOString(),
      sourceFindingSnapshot: findingSnapshot(finding),
      targetDraftId: null,
      operatorNotes: input.operatorNotes ?? "",
      publicationSafety: "NON_PUBLISHABLE",
      humanReviewRequired: true,
    },
    repoRoot,
  );

  return { ok: true, promotionId: statusResult.auditId, targetDraftId: null, nextStatus: "DISMISSED" };
}

export function markFindingNeedsMoreReview(
  input: {
    findingId: string;
    operator: string;
    operatorNotes?: string;
    changedByRoute: string;
  },
  repoRoot: string = process.cwd(),
): PromotionResult {
  const finding = resolveFinding(input.findingId, repoRoot);
  if (!finding) return { ok: false, error: `Finding not found: ${input.findingId}` };

  const statusResult = updateMediaFindingReviewStatus(
    {
      findingId: input.findingId,
      nextStatus: "NEEDS_REVIEW",
      operator: input.operator,
      operatorNotes: input.operatorNotes ?? "Marked needs more review.",
      changedByRoute: input.changedByRoute,
    },
    repoRoot,
  );
  if (!statusResult.ok) return statusResult;

  appendPromotionEntry(
    {
      promotionId: `media-promotion-${Date.now()}`,
      findingId: finding.findingId,
      promotionType: "NEEDS_MORE_REVIEW",
      promotedBy: input.operator,
      promotedAt: new Date().toISOString(),
      sourceFindingSnapshot: findingSnapshot(finding),
      targetDraftId: null,
      operatorNotes: input.operatorNotes ?? "",
      publicationSafety: "NON_PUBLISHABLE",
      humanReviewRequired: true,
    },
    repoRoot,
  );

  return { ok: true, promotionId: statusResult.auditId, targetDraftId: null, nextStatus: "NEEDS_REVIEW" };
}
