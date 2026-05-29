import {
  loadKimHammerCitationAuditLog,
  type KimHammerCitationAuditEntry,
} from "@/lib/opposition/kimHammerCitationWorkflow";
import {
  loadKimHammerExportAuditLog,
  type KimHammerExportAuditEntry,
} from "@/lib/opposition/kimHammerExportWorkflow";
import {
  loadKimHammerSuggestionAuditLog,
  type KimHammerSuggestionAuditEntry,
} from "@/lib/opposition/kimHammerSuggestionWorkflow";
import {
  loadKimHammerClaimReviewAuditLog,
  type KimHammerClaimReviewAuditEntry,
} from "@/lib/opposition/kimHammerReviewWorkflow";
import {
  loadKimHammerTaskAuditLog,
  type KimHammerTaskAuditEntry,
} from "@/lib/opposition/kimHammerTaskWorkflow";
import {
  loadPublicMediaIntakeAuditLog,
  type PublicMediaIntakeAuditEntry,
} from "@/lib/intelligence/publicMediaReviewWorkflow";
import {
  loadMediaFindingPromotionLog,
  type MediaFindingPromotionEntry,
} from "@/lib/intelligence/mediaFindingPromotionWorkflow";
import {
  loadPublicMediaIntakeRunLog,
  type PublicMediaIntakeRunEntry,
} from "@/lib/intelligence/scheduledPublicMediaIntake";
import {
  loadLlmDraftAuditLog,
  type LlmDraftAuditEntry,
} from "@/lib/intelligence/llmDraftAuditLog";
import {
  loadHumanActionQueueAuditLog,
  type HumanActionQueueAuditEntry,
} from "@/lib/intelligence/humanActionQueueWorkflow";
import type {
  KimHammerAuditEntryKind,
  KimHammerAuditTimeline,
  KimHammerUnifiedAuditEntry,
} from "@/lib/opposition/types/kimHammerAuditBrowser";

export type {
  KimHammerAuditEntryKind,
  KimHammerAuditTimeline,
  KimHammerUnifiedAuditEntry,
} from "@/lib/opposition/types/kimHammerAuditBrowser";

function mapExportEntry(entry: KimHammerExportAuditEntry): KimHammerUnifiedAuditEntry {
  return {
    kind: "EXPORT_EVENT",
    auditId: entry.auditId,
    subjectId: entry.exportId,
    sourceFile: entry.sourceFile,
    previousStatus: entry.format,
    nextStatus: entry.scope,
    operator: entry.operator,
    notes: `v${entry.packetVersion} · ${entry.claimCount} claims · ${entry.citationCount} citations · ${entry.notes}`,
    changedAt: entry.changedAt,
    changedByRoute: entry.changedByRoute,
    backupPath: entry.backupPath,
  };
}

function mapSuggestionEntry(entry: KimHammerSuggestionAuditEntry): KimHammerUnifiedAuditEntry {
  return {
    kind: "AI_SUGGESTION",
    auditId: entry.auditId,
    subjectId: entry.suggestionId,
    sourceFile: entry.sourceFile,
    previousStatus: entry.previousStatus,
    nextStatus: entry.nextStatus,
    operator: entry.operator,
    notes: entry.notes,
    changedAt: entry.changedAt,
    changedByRoute: entry.changedByRoute,
    backupPath: entry.backupPath,
  };
}

function mapCitationEntry(entry: KimHammerCitationAuditEntry): KimHammerUnifiedAuditEntry {
  return {
    kind: "CITATION_MUTATION",
    auditId: entry.auditId,
    subjectId: entry.citationId,
    sourceFile: entry.sourceFile,
    previousStatus: entry.previousReviewStatus,
    nextStatus: entry.nextReviewStatus,
    operator: entry.operator,
    notes: entry.notes,
    changedAt: entry.changedAt,
    changedByRoute: entry.changedByRoute,
    backupPath: entry.backupPath,
  };
}

function mapClaimReviewEntry(entry: KimHammerClaimReviewAuditEntry): KimHammerUnifiedAuditEntry {
  return {
    kind: "CLAIM_REVIEW",
    auditId: entry.auditId,
    subjectId: entry.claimId,
    sourceFile: entry.sourceFile,
    previousStatus: entry.previousStatus,
    nextStatus: entry.nextStatus,
    operator: entry.reviewer,
    notes: entry.reviewNotes,
    changedAt: entry.changedAt,
    changedByRoute: entry.changedByRoute,
    backupPath: entry.backupPath,
  };
}

function mapTaskEntry(entry: KimHammerTaskAuditEntry): KimHammerUnifiedAuditEntry {
  return {
    kind: "RETRIEVAL_TASK",
    auditId: entry.auditId,
    subjectId: entry.taskId,
    sourceFile: entry.sourceFile,
    previousStatus: entry.previousStatus,
    nextStatus: entry.nextStatus,
    operator: entry.operator,
    notes: entry.taskNotes,
    changedAt: entry.changedAt,
    changedByRoute: entry.changedByRoute,
    backupPath: entry.backupPath,
    previousOwner: entry.previousOwner,
    nextOwner: entry.nextOwner,
    previousPriority: entry.previousPriority,
    nextPriority: entry.nextPriority,
    previousDueDate: entry.previousDueDate,
    nextDueDate: entry.nextDueDate,
  };
}

function mapMediaIntakeEntry(entry: PublicMediaIntakeAuditEntry): KimHammerUnifiedAuditEntry {
  return {
    kind: "MEDIA_INTAKE_REVIEW",
    auditId: entry.auditId,
    subjectId: entry.findingId,
    sourceFile: "data/intelligence/public-media-intake-queue.json",
    previousStatus: entry.previousStatus,
    nextStatus: entry.nextStatus,
    operator: entry.operator,
    notes: entry.operatorNotes,
    changedAt: entry.changedAt,
    changedByRoute: entry.changedByRoute,
    backupPath: entry.backupPath,
  };
}

function mapMediaIntakeRunEntry(entry: PublicMediaIntakeRunEntry): KimHammerUnifiedAuditEntry {
  return {
    kind: "MEDIA_INTAKE_RUN",
    auditId: entry.runId,
    subjectId: entry.runId,
    sourceFile: "data/intelligence/public-media-intake-run-log.json",
    previousStatus: entry.mode,
    nextStatus: `${entry.newFindingCount} new / ${entry.duplicateFindingCount} dup`,
    operator: entry.operator,
    notes: `${entry.fetchedSourceCount} fetched · ${entry.skippedSourceCount} skipped · ${entry.errorCount} errors · ${entry.notes}`,
    changedAt: entry.completedAt,
    changedByRoute: "scheduledPublicMediaIntake",
    backupPath: "",
  };
}

function mapHumanActionAuditEntry(entry: HumanActionQueueAuditEntry): KimHammerUnifiedAuditEntry {
  return {
    kind: entry.eventType,
    auditId: entry.auditId,
    subjectId: entry.actionId,
    sourceFile: "data/intelligence/human-action-queue.json",
    previousStatus: entry.previousStatus,
    nextStatus: entry.nextStatus,
    operator: entry.operator,
    notes: entry.notes,
    changedAt: entry.changedAt,
    changedByRoute: entry.changedByRoute,
    backupPath: entry.backupPath,
    previousOwner: entry.owner,
    nextOwner: entry.owner,
  };
}

function mapLlmDraftAuditEntry(entry: LlmDraftAuditEntry): KimHammerUnifiedAuditEntry {
  return {
    kind: entry.eventType,
    auditId: entry.auditId,
    subjectId: entry.draftId,
    sourceFile: "data/intelligence/llm-draft-audit-log.json",
    previousStatus: entry.previousStatus,
    nextStatus: entry.nextStatus,
    operator: entry.reviewer,
    notes: `${entry.notes} · model: ${entry.model} · warnings: ${entry.warnings.length}${entry.promotionTarget ? ` · promoted: ${entry.promotionTarget}` : ""}`,
    changedAt: entry.timestamp,
    changedByRoute: entry.route,
    backupPath: "",
  };
}

function mapMediaFindingPromotionEntry(entry: MediaFindingPromotionEntry): KimHammerUnifiedAuditEntry {
  return {
    kind: "MEDIA_FINDING_PROMOTION",
    auditId: entry.promotionId,
    subjectId: entry.findingId,
    sourceFile: "data/intelligence/media-finding-promotion-log.json",
    previousStatus: entry.sourceFindingSnapshot.reviewStatus,
    nextStatus: entry.promotionType,
    operator: entry.promotedBy,
    notes: `${entry.operatorNotes} · draft: ${entry.targetDraftId ?? "none"} · NON_PUBLISHABLE`,
    changedAt: entry.promotedAt,
    changedByRoute: "mediaFindingPromotionWorkflow",
    backupPath: "",
  };
}

export function loadKimHammerUnifiedAuditTimeline(
  repoRoot?: string,
): KimHammerAuditTimeline {
  const claimLog = loadKimHammerClaimReviewAuditLog(repoRoot);
  const taskLog = loadKimHammerTaskAuditLog(repoRoot);
  const citationLog = loadKimHammerCitationAuditLog(repoRoot);
  const suggestionLog = loadKimHammerSuggestionAuditLog(repoRoot);
  const exportLog = loadKimHammerExportAuditLog(repoRoot);
  const mediaIntakeLog = loadPublicMediaIntakeAuditLog(repoRoot);
  const mediaIntakeRunLog = loadPublicMediaIntakeRunLog(repoRoot);
  const mediaPromotionLog = loadMediaFindingPromotionLog(repoRoot);
  const llmDraftLog = loadLlmDraftAuditLog(repoRoot);
  const humanActionLog = loadHumanActionQueueAuditLog(repoRoot);

  const claimEntries = claimLog.entries.map(mapClaimReviewEntry);
  const taskEntries = taskLog.entries.map(mapTaskEntry);
  const citationEntries = citationLog.entries.map(mapCitationEntry);
  const suggestionEntries = suggestionLog.entries.map(mapSuggestionEntry);
  const exportEntries = exportLog.entries.map(mapExportEntry);
  const mediaIntakeEntries = mediaIntakeLog.entries.map(mapMediaIntakeEntry);
  const mediaIntakeRunEntries = mediaIntakeRunLog.runs.map(mapMediaIntakeRunEntry);
  const mediaPromotionEntries = mediaPromotionLog.entries.map(mapMediaFindingPromotionEntry);
  const llmDraftEntries = llmDraftLog.entries.map(mapLlmDraftAuditEntry);
  const humanActionEntries = humanActionLog.entries.map(mapHumanActionAuditEntry);

  const entries = [
    ...claimEntries,
    ...taskEntries,
    ...citationEntries,
    ...suggestionEntries,
    ...exportEntries,
    ...mediaIntakeEntries,
    ...mediaIntakeRunEntries,
    ...mediaPromotionEntries,
    ...llmDraftEntries,
    ...humanActionEntries,
  ].sort((a, b) => b.changedAt.localeCompare(a.changedAt));

  return {
    generatedAt: new Date().toISOString(),
    claimReviewCount: claimEntries.length,
    retrievalTaskCount: taskEntries.length,
    citationMutationCount: citationEntries.length,
    aiSuggestionCount: suggestionEntries.length,
    exportEventCount: exportEntries.length,
    mediaIntakeReviewCount: mediaIntakeEntries.length,
    mediaIntakeRunCount: mediaIntakeRunEntries.length,
    mediaFindingPromotionCount: mediaPromotionEntries.length,
    llmDraftAuditCount: llmDraftEntries.length,
    humanActionAuditCount: humanActionEntries.length,
    totalEntries: entries.length,
    entries,
  };
}

export function filterKimHammerAuditTimeline(
  timeline: KimHammerAuditTimeline,
  filters: {
    kind?: KimHammerAuditEntryKind | "ALL";
    subjectQuery?: string;
    operatorQuery?: string;
    statusQuery?: string;
  },
): KimHammerUnifiedAuditEntry[] {
  const kind = filters.kind ?? "ALL";
  const subjectQuery = filters.subjectQuery?.trim().toLowerCase() ?? "";
  const operatorQuery = filters.operatorQuery?.trim().toLowerCase() ?? "";
  const statusQuery = filters.statusQuery?.trim().toLowerCase() ?? "";

  return timeline.entries.filter((entry) => {
    if (kind !== "ALL" && entry.kind !== kind) return false;

    if (subjectQuery) {
      const haystack = [entry.subjectId, entry.auditId, entry.sourceFile].join(" ").toLowerCase();
      if (!haystack.includes(subjectQuery)) return false;
    }

    if (operatorQuery && !entry.operator.toLowerCase().includes(operatorQuery)) {
      return false;
    }

    if (statusQuery) {
      const statusHaystack = `${entry.previousStatus} ${entry.nextStatus}`.toLowerCase();
      if (!statusHaystack.includes(statusQuery)) return false;
    }

    return true;
  });
}

export function groupAuditEntriesBySubject(
  entries: KimHammerUnifiedAuditEntry[],
): Map<string, KimHammerUnifiedAuditEntry[]> {
  const grouped = new Map<string, KimHammerUnifiedAuditEntry[]>();
  for (const entry of entries) {
    const key = `${entry.kind}:${entry.subjectId}`;
    const bucket = grouped.get(key) ?? [];
    bucket.push(entry);
    grouped.set(key, bucket);
  }
  return grouped;
}
