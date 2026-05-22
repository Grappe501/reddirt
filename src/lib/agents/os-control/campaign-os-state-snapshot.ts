import { loadCampaignEventsWorkbench } from "@/lib/campaign-events/load-workbench-events";
import { buildCampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { verifyTravelReimbursementQueues } from "@/lib/campaign-events/travel-reimbursement/queue-verification";
import { buildOfficialReimbursementReport } from "@/lib/campaign-events/travel-reimbursement/reimbursement-report";
import { buildCampaignFinanceSummary, detectReimbursementExceptions } from "@/lib/campaign-events/finance/finance-helpers";
import { listFinanceDocumentsForMonth } from "@/lib/campaign-events/finance/finance-document-store";
import { loadCampaignLearningSnapshot } from "@/lib/campaign-events/hot-wash-intelligence/load-campaign-learning-snapshot";
import { loadGlobalUserObservations } from "@/lib/agents/user-intelligence/user-observations";
import { loadRuntimeAudit } from "@/lib/agents/runtime/runtime-audit";
import { gatesByRisk } from "./human-approval-gate-matrix";

export type CampaignOsDomain =
  | "intake"
  | "calendar"
  | "approval"
  | "event_planning"
  | "travel"
  | "reimbursement"
  | "finance"
  | "compliance"
  | "hot_wash"
  | "county_memory"
  | "dashboard_ux"
  | "agent";

export type CampaignOsStateSnapshot = {
  period: string;
  generatedAt: string;
  systemHealthScore: number;
  activeBlockers: string[];
  recommendedWorkflow: string;
  domainsNeedingAttention: CampaignOsDomain[];
  safeActions: string[];
  gatedActions: string[];
  forbiddenActions: string[];
  signals: {
    pendingApprovals: number;
    websiteIntakeCount: number;
    travelNeedsReview: number;
    reimbursementDerivedStatus: string;
    calendarSyncStale: boolean;
    promotionReady: number;
    financeExceptions: number;
    pendingReceipts: number;
    hotWashActionItems: number;
    countyMemoryEvents: number;
    recentObservations: number;
    runtimeAuditCount: number;
  };
};

function deriveReimbursementLabel(queues: ReturnType<typeof verifyTravelReimbursementQueues>, report: ReturnType<typeof buildOfficialReimbursementReport>): string {
  if (report.derivedStatus === "empty") return "draft";
  if (queues.needsApproval > 0 || queues.missingMileage > 0 || queues.missingCityCounty > 0) return "needs_review";
  if (report.totals.approvedEventCount > 0) return "ready";
  return "draft";
}

export async function buildCampaignOsStateSnapshot(period = "2026-04"): Promise<CampaignOsStateSnapshot> {
  const { rows, period: p } = await loadCampaignEventsWorkbench({ period });
  const dash = buildCampaignEventsDashboardSnapshot(rows, p);
  const queues = verifyTravelReimbursementQueues(rows, p);
  const report = buildOfficialReimbursementReport(rows, p);
  const financeSummary = await buildCampaignFinanceSummary(rows, p);
  const docs = await listFinanceDocumentsForMonth(p);
  const exceptions = detectReimbursementExceptions(rows, p);
  let learning = { countyCount: 0, blueprintCount: 0 };
  try {
    learning = await loadCampaignLearningSnapshot();
  } catch {
    /* learning optional */
  }
  const observations = loadGlobalUserObservations();
  const audit = loadRuntimeAudit();

  const activeBlockers: string[] = [];
  const domainsNeedingAttention: CampaignOsDomain[] = [];

  if (dash.pendingApprovals > 0) {
    activeBlockers.push(`${dash.pendingApprovals} event(s) pending approval`);
    domainsNeedingAttention.push("approval");
  }
  if (dash.websiteIntakeCount > 0 || dash.needsIntakeReviewCount > 0) {
    activeBlockers.push(`${dash.websiteIntakeCount} website intake(s) need review`);
    domainsNeedingAttention.push("intake");
  }
  if (queues.needsApproval > 0) {
    activeBlockers.push(`${queues.needsApproval} travel row(s) need approval`);
    domainsNeedingAttention.push("travel");
  }
  if (queues.missingMileage > 0) {
    activeBlockers.push(`${queues.missingMileage} row(s) missing mileage`);
    domainsNeedingAttention.push("travel");
  }
  if (dash.calendarSync?.jsonStale) {
    activeBlockers.push("Normalized calendar JSON is stale");
    domainsNeedingAttention.push("calendar");
  }
  if (dash.promotionReadyTentative > 0 || dash.promotionReadyOfficial > 0) {
    domainsNeedingAttention.push("calendar");
  }
  if (exceptions.length > 0) {
    activeBlockers.push(`${exceptions.length} finance exception(s) flagged`);
    domainsNeedingAttention.push("finance");
  }
  if (docs.filter((d) => d.approvalStatus === "pending").length > 0) {
    activeBlockers.push(`${docs.filter((d) => d.approvalStatus === "pending").length} receipt(s) pending approval`);
    domainsNeedingAttention.push("finance");
  }
  if (dash.actionItems.hotWashPending > 0) {
    domainsNeedingAttention.push("hot_wash");
  }

  const reimbStatus = deriveReimbursementLabel(queues, report);
  if (reimbStatus === "needs_review") domainsNeedingAttention.push("reimbursement");

  let systemHealthScore = 100;
  systemHealthScore -= Math.min(30, activeBlockers.length * 8);
  systemHealthScore -= dash.calendarSync?.jsonStale ? 10 : 0;
  systemHealthScore = Math.max(0, Math.min(100, systemHealthScore));

  let recommendedWorkflow = "Steady state — review dashboards and upcoming events";
  if (reimbStatus === "needs_review" && queues.needsApproval === 0) recommendedWorkflow = "Close reimbursement documentation — then mark month ready";
  else if (queues.needsApproval > 0) recommendedWorkflow = "Clear travel approvals before reimbursement packet";
  else if (dash.pendingApprovals > 5) recommendedWorkflow = "Run month review wizard — clear approval queue";
  else if (dash.websiteIntakeCount > 0) recommendedWorkflow = "Review website intake and tentative calendar";
  else if (dash.promotionReadyTentative > 0) recommendedWorkflow = "Promote approved tentative events (human-gated GCal)";
  else if (exceptions.length > 0) recommendedWorkflow = "Resolve finance documentation gaps";

  const safe = gatesByRisk("safe").map((g) => g.label);
  const gated = gatesByRisk("gated").map((g) => g.label);
  const forbidden = gatesByRisk("forbidden").map((g) => g.label);

  return {
    period: p,
    generatedAt: new Date().toISOString(),
    systemHealthScore,
    activeBlockers,
    recommendedWorkflow,
    domainsNeedingAttention: [...new Set(domainsNeedingAttention)],
    safeActions: [
      ...safe,
      "View OS control snapshot",
      "Generate workflow plan",
      "Open command center audit",
    ],
    gatedActions: gated,
    forbiddenActions: forbidden,
    signals: {
      pendingApprovals: dash.pendingApprovals,
      websiteIntakeCount: dash.websiteIntakeCount,
      travelNeedsReview: dash.actionItems.travelReview,
      reimbursementDerivedStatus: reimbStatus,
      calendarSyncStale: Boolean(dash.calendarSync?.jsonStale),
      promotionReady: dash.promotionReadyTentative + dash.promotionReadyOfficial,
      financeExceptions: exceptions.length,
      pendingReceipts: docs.filter((d) => d.approvalStatus === "pending").length,
      hotWashActionItems: dash.actionItems.hotWashPending,
      countyMemoryEvents: learning.countyCount,
      recentObservations: observations.length,
      runtimeAuditCount: audit.length,
    },
  };
}

