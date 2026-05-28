import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { appendLlmDraftAuditEntry } from "@/lib/intelligence/llmDraftAuditLog";
import {
  LLM_DRAFT_BACKUP_DIR_REL,
  LLM_DRAFT_REVIEW_QUEUE_REL,
  loadLlmDraftReviewQueue,
  type LlmDraftReviewEntry,
  type LlmDraftReviewStatus,
} from "@/lib/intelligence/llmDraftGateway";

export const LLM_PROMOTED_WORKFLOW_DRAFTS_REL = "data/intelligence/llm-promoted-workflow-drafts.json";

export type LlmWorkflowPromotionTarget =
  | "CITATION_CANDIDATE_DRAFT"
  | "RETRIEVAL_TASK_DRAFT"
  | "BRIEFING_DRAFT"
  | "WRITING_DRAFT";

export type LlmPromotedWorkflowDraftsFile = {
  version: number;
  generatedAt: string;
  purpose: string;
  citationCandidateDrafts: Array<{
    draftId: string;
    sourceLlmDraftId: string;
    title: string;
    summary: string;
    reviewStatus: "DRAFT";
    publicationSafety: "NON_PUBLISHABLE";
    humanReviewRequired: true;
    promotedBy: string;
    promotedAt: string;
  }>;
  retrievalTaskDrafts: Array<{
    draftId: string;
    sourceLlmDraftId: string;
    suggestedTaskTitle: string;
    operatorNotes: string;
    reviewStatus: "DRAFT";
    publicationSafety: "NON_PUBLISHABLE";
    humanReviewRequired: true;
    promotedBy: string;
    promotedAt: string;
  }>;
  briefingDrafts: Array<{
    draftId: string;
    sourceLlmDraftId: string;
    briefingType: string;
    title: string;
    reviewStatus: "DRAFT";
    publicationSafety: "NON_PUBLISHABLE";
    humanReviewRequired: true;
    promotedBy: string;
    promotedAt: string;
  }>;
  writingDrafts: Array<{
    draftId: string;
    sourceLlmDraftId: string;
    writingType: string;
    title: string;
    reviewStatus: "DRAFT";
    publicationSafety: "NON_PUBLISHABLE";
    humanReviewRequired: true;
    promotedBy: string;
    promotedAt: string;
  }>;
};

const ALLOWED_TRANSITIONS: Record<LlmDraftReviewStatus, LlmDraftReviewStatus[]> = {
  DRAFT_PENDING_REVIEW: ["NEEDS_REVISION", "REVIEWED_INTERNAL_ONLY", "APPROVED_FOR_PROMOTION", "REJECTED", "ARCHIVED"],
  NEEDS_REVISION: ["DRAFT_PENDING_REVIEW", "REJECTED", "ARCHIVED"],
  REVIEWED_INTERNAL_ONLY: ["APPROVED_FOR_PROMOTION", "NEEDS_REVISION", "ARCHIVED"],
  APPROVED_FOR_PROMOTION: ["ARCHIVED"],
  REJECTED: ["DRAFT_PENDING_REVIEW", "ARCHIVED"],
  ARCHIVED: [],
};

function absPath(repoRoot: string, rel: string): string {
  return path.join(repoRoot, rel);
}

function backupQueue(repoRoot: string): string {
  const src = absPath(repoRoot, LLM_DRAFT_REVIEW_QUEUE_REL);
  if (!existsSync(src)) return "";
  const backupDir = absPath(repoRoot, LLM_DRAFT_BACKUP_DIR_REL);
  mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = path.join(backupDir, `llm-draft-review-queue-${stamp}.json`);
  copyFileSync(src, dest);
  return path.relative(repoRoot, dest).split(path.sep).join("/");
}

function writeQueue(repoRoot: string, queue: ReturnType<typeof loadLlmDraftReviewQueue>): void {
  const target = absPath(repoRoot, LLM_DRAFT_REVIEW_QUEUE_REL);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
}

export function loadLlmPromotedWorkflowDrafts(repoRoot: string = process.cwd()): LlmPromotedWorkflowDraftsFile {
  const abs = absPath(repoRoot, LLM_PROMOTED_WORKFLOW_DRAFTS_REL);
  if (!existsSync(abs)) {
    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      purpose: "Not initialized",
      citationCandidateDrafts: [],
      retrievalTaskDrafts: [],
      briefingDrafts: [],
      writingDrafts: [],
    };
  }
  return JSON.parse(readFileSync(abs, "utf8")) as LlmPromotedWorkflowDraftsFile;
}

function writePromotedDrafts(repoRoot: string, file: LlmPromotedWorkflowDraftsFile): void {
  const target = absPath(repoRoot, LLM_PROMOTED_WORKFLOW_DRAFTS_REL);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(file, null, 2)}\n`, "utf8");
}

function findDraft(repoRoot: string, draftId: string): LlmDraftReviewEntry | undefined {
  return loadLlmDraftReviewQueue(repoRoot).drafts.find((row) => row.draftId === draftId);
}

export function updateDraftReviewStatus(
  draftId: string,
  nextStatus: LlmDraftReviewStatus,
  operator: string,
  route: string,
  notes?: string,
  repoRoot: string = process.cwd(),
): { ok: true } | { ok: false; error: string } {
  backupQueue(repoRoot);
  const queue = loadLlmDraftReviewQueue(repoRoot);
  const draft = queue.drafts.find((row) => row.draftId === draftId);
  if (!draft) return { ok: false, error: "Draft not found." };
  const allowed = ALLOWED_TRANSITIONS[draft.reviewStatus] ?? [];
  if (!allowed.includes(nextStatus)) {
    return { ok: false, error: `Transition ${draft.reviewStatus} → ${nextStatus} not allowed.` };
  }
  const previousStatus = draft.reviewStatus;
  draft.reviewStatus = nextStatus;
  if (notes) draft.operatorNotes = notes;
  queue.generatedAt = new Date().toISOString();
  writeQueue(repoRoot, queue);
  appendLlmDraftAuditEntry(
    {
      eventType: "LLM_DRAFT_REVIEWED",
      draftId,
      draftType: draft.draftType,
      reviewer: operator,
      route,
      model: draft.llmModel,
      previousStatus,
      nextStatus,
      warnings: draft.governanceWarnings,
      promotionTarget: null,
      notes: notes ?? "",
    },
    repoRoot,
  );
  return { ok: true };
}

export function assignDraftReviewer(
  draftId: string,
  reviewer: string,
  repoRoot: string = process.cwd(),
): { ok: true } | { ok: false; error: string } {
  backupQueue(repoRoot);
  const queue = loadLlmDraftReviewQueue(repoRoot);
  const draft = queue.drafts.find((row) => row.draftId === draftId);
  if (!draft) return { ok: false, error: "Draft not found." };
  draft.recommendedReviewer = reviewer;
  queue.generatedAt = new Date().toISOString();
  writeQueue(repoRoot, queue);
  return { ok: true };
}

export function addDraftReviewNotes(
  draftId: string,
  notes: string,
  repoRoot: string = process.cwd(),
): { ok: true } | { ok: false; error: string } {
  backupQueue(repoRoot);
  const queue = loadLlmDraftReviewQueue(repoRoot);
  const draft = queue.drafts.find((row) => row.draftId === draftId);
  if (!draft) return { ok: false, error: "Draft not found." };
  draft.operatorNotes = notes;
  queue.generatedAt = new Date().toISOString();
  writeQueue(repoRoot, queue);
  return { ok: true };
}

export function promoteDraftToWorkflowCandidate(
  draftId: string,
  target: LlmWorkflowPromotionTarget,
  operator: string,
  route: string,
  repoRoot: string = process.cwd(),
): { ok: true; workflowDraftId: string } | { ok: false; error: string } {
  const draft = findDraft(repoRoot, draftId);
  if (!draft) return { ok: false, error: "Draft not found." };
  if (draft.reviewStatus !== "APPROVED_FOR_PROMOTION") {
    return { ok: false, error: "Draft must be APPROVED_FOR_PROMOTION before workflow promotion." };
  }

  const promoted = loadLlmPromotedWorkflowDrafts(repoRoot);
  const workflowDraftId = `llm-wf-${target.toLowerCase()}-${Date.now().toString(36)}`;
  const promotedAt = new Date().toISOString();

  switch (target) {
    case "CITATION_CANDIDATE_DRAFT":
      promoted.citationCandidateDrafts.unshift({
        draftId: workflowDraftId,
        sourceLlmDraftId: draftId,
        title: draft.draftTitle,
        summary: draft.draftContent.slice(0, 500),
        reviewStatus: "DRAFT",
        publicationSafety: "NON_PUBLISHABLE",
        humanReviewRequired: true,
        promotedBy: operator,
        promotedAt,
      });
      break;
    case "RETRIEVAL_TASK_DRAFT":
      promoted.retrievalTaskDrafts.unshift({
        draftId: workflowDraftId,
        sourceLlmDraftId: draftId,
        suggestedTaskTitle: `Follow up: ${draft.draftTitle}`,
        operatorNotes: "Promoted from LLM review queue — not an active KH-3B task.",
        reviewStatus: "DRAFT",
        publicationSafety: "NON_PUBLISHABLE",
        humanReviewRequired: true,
        promotedBy: operator,
        promotedAt,
      });
      break;
    case "BRIEFING_DRAFT":
      promoted.briefingDrafts.unshift({
        draftId: workflowDraftId,
        sourceLlmDraftId: draftId,
        briefingType: draft.draftType,
        title: draft.draftTitle,
        reviewStatus: "DRAFT",
        publicationSafety: "NON_PUBLISHABLE",
        humanReviewRequired: true,
        promotedBy: operator,
        promotedAt,
      });
      break;
    case "WRITING_DRAFT":
      promoted.writingDrafts.unshift({
        draftId: workflowDraftId,
        sourceLlmDraftId: draftId,
        writingType: draft.draftType,
        title: draft.draftTitle,
        reviewStatus: "DRAFT",
        publicationSafety: "NON_PUBLISHABLE",
        humanReviewRequired: true,
        promotedBy: operator,
        promotedAt,
      });
      break;
  }

  promoted.generatedAt = promotedAt;
  writePromotedDrafts(repoRoot, promoted);

  backupQueue(repoRoot);
  const queue = loadLlmDraftReviewQueue(repoRoot);
  const queueDraft = queue.drafts.find((row) => row.draftId === draftId);
  if (queueDraft) {
    queueDraft.promotedTo = `${target}:${workflowDraftId}`;
    queueDraft.archived = true;
    queueDraft.reviewStatus = "ARCHIVED";
    writeQueue(repoRoot, queue);
  }

  appendLlmDraftAuditEntry(
    {
      eventType: "LLM_DRAFT_PROMOTED",
      draftId,
      draftType: draft.draftType,
      reviewer: operator,
      route,
      model: draft.llmModel,
      previousStatus: "APPROVED_FOR_PROMOTION",
      nextStatus: "ARCHIVED",
      warnings: draft.governanceWarnings,
      promotionTarget: `${target}:${workflowDraftId}`,
      notes: "Human-initiated workflow candidate — not a governed claim/citation/task.",
    },
    repoRoot,
  );

  return { ok: true, workflowDraftId };
}

export function archiveDraftReviewItem(
  draftId: string,
  operator: string,
  route: string,
  notes: string,
  repoRoot: string = process.cwd(),
): { ok: true } | { ok: false; error: string } {
  backupQueue(repoRoot);
  const queue = loadLlmDraftReviewQueue(repoRoot);
  const draft = queue.drafts.find((row) => row.draftId === draftId);
  if (!draft) return { ok: false, error: "Draft not found." };
  draft.archived = true;
  draft.reviewStatus = "ARCHIVED";
  draft.operatorNotes = notes;
  queue.generatedAt = new Date().toISOString();
  writeQueue(repoRoot, queue);
  appendLlmDraftAuditEntry(
    {
      eventType: "LLM_DRAFT_ARCHIVED",
      draftId,
      draftType: draft.draftType,
      reviewer: operator,
      route,
      model: draft.llmModel,
      previousStatus: "DRAFT_PENDING_REVIEW",
      nextStatus: "ARCHIVED",
      warnings: draft.governanceWarnings,
      promotionTarget: null,
      notes,
    },
    repoRoot,
  );
  return { ok: true };
}

export { appendLlmDraftAuditEntry, loadLlmDraftAuditLog } from "@/lib/intelligence/llmDraftAuditLog";
