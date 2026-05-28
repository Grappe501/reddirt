import {
  loadKimHammerEvidenceIndex,
  resolveRetrievalTaskStatus,
} from "@/lib/opposition/kimHammerEvidenceIndex";
import {
  canExportClaim,
  getExternalUseStatus,
  getLegalRiskLabel,
  getPublicationTier,
  getReviewStatusLabel,
  getSafetyBlockers,
  KIM_HAMMER_EXPORT_FILTER,
} from "@/lib/opposition/kimHammerPublicationSafety";
import { loadKimHammerKh4SuggestionAgents } from "@/lib/opposition/kimHammerKh4SuggestionAgents";
import {
  EvidenceCommandDashboard,
  type EvidenceCommandAnalytics,
} from "./EvidenceCommandDashboard";
import {
  EvidenceCommandFilters,
  type EvidenceCommandClaimRow,
  type EvidenceCommandTaskRow,
} from "./EvidenceCommandFilters";

function buildRecommendedActions(index: ReturnType<typeof loadKimHammerEvidenceIndex>): string[] {
  const actions: string[] = [];

  if (index.metrics.blockedClaims > 0) {
    actions.push(
      `Keep ${index.metrics.blockedClaims} safety-blocked claim(s) out of external messaging until blockers are resolved.`,
    );
  }

  if (index.metrics.reviewNeededClaims > 0) {
    actions.push(
      `Complete human review for ${index.metrics.reviewNeededClaims} claim(s) before treating caution-tier material as deployable.`,
    );
  }

  const highPriorityTasks = [...index.retrievalTasks]
    .filter((task) => task.priority === "HIGH" && resolveRetrievalTaskStatus(task) !== "COMPLETE")
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
    .slice(0, 3);

  if (highPriorityTasks.length > 0) {
    actions.push(
      `Execute top KH-3B retrieval tasks (${highPriorityTasks.map((task) => `#${task.rank ?? "?"}`).join(", ")}) to close evidence gaps.`,
    );
  }

  if (index.metrics.exportReadyClaims > 0) {
    actions.push(
      `Use only ${index.metrics.exportReadyClaims} export-ready claim(s) for citation-backed debate prep; download from debate packet export after final review.`,
    );
  } else {
    actions.push("No claims currently pass the full export filter; prioritize retrieval and review before external debate prep.");
  }

  actions.push("Treat all KH-4 copilot suggestions as non-publishable until human review and publication-safety clearance.");

  if (index.reviewNeededClaims.some((claim) => claim.citationStatus === "PARTIAL")) {
    actions.push("Strengthen partial citations on caution-tier claims before moving them toward Tier 1 deployability.");
  }

  return actions;
}

function buildClaimRows(index: ReturnType<typeof loadKimHammerEvidenceIndex>): EvidenceCommandClaimRow[] {
  return index.claims.map((claim) => ({
    id: claim.id,
    indexSource: claim.indexSource,
    title: claim.topic ?? claim.id,
    text: claim.text ?? claim.claim ?? "",
    reviewStatus: getReviewStatusLabel(claim),
    publicationTier: getPublicationTier(claim) ?? "—",
    legalRisk: getLegalRiskLabel(claim),
    externalUseStatus: getExternalUseStatus(claim) ?? "—",
    exportReady: canExportClaim(claim),
    blocked: claim.blocked,
    reviewNeeded: claim.reviewNeeded,
    safetyBlockers: getSafetyBlockers(claim, index.publicationSafety.rules),
  }));
}

function buildTaskRows(index: ReturnType<typeof loadKimHammerEvidenceIndex>): EvidenceCommandTaskRow[] {
  return index.retrievalTasks.map((task) => ({
    id: task.id,
    rank: task.rank ?? null,
    title: task.description,
    taskStatus: resolveRetrievalTaskStatus(task),
    owner: task.owner ?? "—",
    priority: task.priority,
    confidenceNeed: task.confidenceNeed ?? "—",
    externalReadiness: task.externalMessageReadiness ?? "—",
  }));
}

function buildAnalytics(
  index: ReturnType<typeof loadKimHammerEvidenceIndex>,
  taskRows: EvidenceCommandTaskRow[],
  copilotAgentCount: number,
): EvidenceCommandAnalytics {
  const retrievalWorkNeededCount = taskRows.filter(
    (task) =>
      task.taskStatus === "NOT_STARTED" ||
      task.taskStatus === "ASSIGNED" ||
      task.externalReadiness === "NOT_READY",
  ).length;

  return {
    exportReadyCount: index.metrics.exportReadyClaims,
    reviewNeededCount: index.metrics.reviewNeededClaims,
    blockedCount: index.metrics.blockedClaims,
    retrievalWorkNeededCount,
    copilotAgentCount,
    activeRetrievalCount: taskRows.filter((task) => task.taskStatus === "IN_PROGRESS").length,
    reviewBottleneckCount:
      index.metrics.reviewStatusCounts.NEEDS_REVIEW + index.metrics.reviewStatusCounts.DRAFT,
    partialCitationCount: index.claims.filter((claim) => claim.citationStatus === "PARTIAL").length,
    mediumHighRiskCount: index.claims.filter(
      (claim) => claim.legalRisk === "MEDIUM" || claim.legalRisk === "HIGH",
    ).length,
    notReadyTaskCount: taskRows.filter((task) => task.externalReadiness === "NOT_READY").length,
    needsContextTaskCount: taskRows.filter((task) => task.externalReadiness === "NEEDS_CONTEXT").length,
    exportReadyClaimIds: index.exportReadyClaims.map((claim) => claim.id),
  };
}

export default async function KimHammerEvidenceCommandPage() {
  const index = loadKimHammerEvidenceIndex();
  const { metrics } = index;
  const copilot = loadKimHammerKh4SuggestionAgents();
  const claimRows = buildClaimRows(index);
  const taskRows = buildTaskRows(index);
  const analytics = buildAnalytics(index, taskRows, copilot.agents.length);
  const recommendedActions = buildRecommendedActions(index);

  const blockerRules = index.publicationSafety.rules.filter((rule) =>
    metrics.safetyBlockers.includes(rule.id),
  );

  const exportFilterLabel = `${KIM_HAMMER_EXPORT_FILTER.externalUseStatus} · ${KIM_HAMMER_EXPORT_FILTER.citationStatus} · ${KIM_HAMMER_EXPORT_FILTER.confidenceTier} · ${KIM_HAMMER_EXPORT_FILTER.legalRisk} legal risk · review APPROVED_FOR_EXTERNAL_USE or EXPORTED`;

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">
          Evidence Command Center
        </p>
        <h1 className="font-heading text-2xl font-bold">Unified Evidence Governance Dashboard</h1>
        <p className="mt-2 max-w-4xl text-xs text-kelly-muted">
          Read-only operator command view for claim disposition, retrieval workload, publication safety, and
          copilot readiness. Behavior is unchanged — filters and links only.
        </p>
      </header>

      <EvidenceCommandDashboard
        analytics={analytics}
        reviewStatusCounts={metrics.reviewStatusCounts}
        taskStatusCounts={metrics.taskStatusCounts}
        tierDistribution={metrics.tierDistribution}
        safetyBlockerIds={metrics.safetyBlockers}
        safetyBlockerDescriptions={blockerRules.map((rule) => ({
          id: rule.id,
          description: rule.description,
        }))}
        exportFilterLabel={exportFilterLabel}
        copilotLabel={copilot.nonPublishableLabel}
        recommendedActions={recommendedActions}
      />

      <EvidenceCommandFilters claims={claimRows} tasks={taskRows} />
    </div>
  );
}
