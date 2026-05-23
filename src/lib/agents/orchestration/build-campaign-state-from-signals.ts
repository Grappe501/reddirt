/**
 * Build live CampaignState from orchestration signal bundle.
 */

import type { OsControlBundle } from "@/lib/agents/os-control/load-os-control-bundle";
import type { UnifiedCampaignContext } from "@/lib/agents/campaign-intelligence/unified-campaign-context-assembler";
import type { StatewideCountyIntelligence } from "@/lib/agents/county-intelligence/county-kpi-types";
import type { CommunicationsIntelligenceContext } from "@/lib/communications/communications-intelligence-engine";
import type { CrossDomainContext } from "./cross-domain-context-composer";
import type { OrchestrationSignalBundle } from "./load-campaign-orchestration-signals";
import type { OrchestrationSourceHealth } from "./orchestration-source-health";
import {
  type CampaignBlocker,
  type CampaignDomainId,
  type CampaignHealthBand,
  type CampaignOpportunity,
  type CampaignState,
  type DomainHealthSlice,
  type HumanGateRef,
  type MemoryCandidateRef,
  type OrchestrationActionRef,
  type PreparedOrchestrationAction,
  emptyDomainSlice,
} from "./campaign-state-types";
import { gatesByRisk } from "@/lib/agents/os-control/human-approval-gate-matrix";
import type { UserObservationEntry } from "@/lib/agents/user-intelligence/user-observations";
import type { ToolBuildTicket } from "@/lib/agents/tool-builder/tool-builder-types";
import type { CampaignKnowledgeMemorySlice } from "@/lib/agents/campaign-knowledge/campaign-knowledge-memory-types";
import { emptyKnowledgeMemorySlice } from "@/lib/agents/campaign-knowledge/campaign-knowledge-memory-types";
import type { CampaignKnowledgeSummary } from "@/lib/agents/orchestration/knowledge/campaign-knowledge-types";
import { emptyCampaignKnowledgeSummary } from "@/lib/agents/orchestration/knowledge/campaign-knowledge-types";
import { knowledgeSummaryToMemorySlice } from "@/lib/agents/orchestration/knowledge/knowledge-memory-adapter";
import { emptyAgentToolingState } from "@/lib/agents/orchestration/tooling/agent-tooling-types";

function scoreToBand(score: number): CampaignHealthBand {
  if (score >= 80) return "strong";
  if (score >= 60) return "stable";
  if (score >= 40) return "weak";
  return "critical";
}

function slice(domainId: CampaignDomainId, score: number, summary: string, blockers: string[] = [], opportunities: string[] = []): DomainHealthSlice {
  return { domainId, band: scoreToBand(score), score, summary, blockers, opportunities };
}

function getSliceData<T>(bundle: OrchestrationSignalBundle, domain: string): T | null {
  const s = bundle.slices.find((x) => x.domain === domain);
  return s?.ok && s.data ? (s.data as T) : null;
}

function blocker(id: string, domainId: CampaignDomainId, severity: CampaignBlocker["severity"], message: string, route?: string, missingSignal?: string): CampaignBlocker {
  return { id, domainId, severity, message, suggestedRoute: route, missingSignal };
}

export function buildCampaignStateFromSignals(
  bundle: OrchestrationSignalBundle,
  sourceHealth: OrchestrationSourceHealth[],
  knowledge: CampaignKnowledgeSummary = emptyCampaignKnowledgeSummary(),
): CampaignState {
  const knowledgeMemory = knowledgeSummaryToMemorySlice(knowledge);
  const period = bundle.period;
  const now = bundle.loadedAt;
  const os = getSliceData<OsControlBundle>(bundle, "os_control");
  const unified = getSliceData<UnifiedCampaignContext>(bundle, "unified_context");
  const county = getSliceData<StatewideCountyIntelligence>(bundle, "county");
  const comms = getSliceData<CommunicationsIntelligenceContext>(bundle, "communications");
  const observations = getSliceData<UserObservationEntry[]>(bundle, "observations") ?? [];
  const toolQueue = getSliceData<ToolBuildTicket[]>(bundle, "tool_builder") ?? [];
  const crossDomain = getSliceData<CrossDomainContext>(bundle, "cross_domain");
  const emailOs = getSliceData<{ sendEnabled: boolean; sendGridConfigured: boolean; massSendBlocked: boolean }>(bundle, "email_os");

  const activeBlockers: CampaignBlocker[] = [];
  const activeOpportunities: CampaignOpportunity[] = [];
  const degradedCount = sourceHealth.filter((s) => s.status === "error" || s.status === "missing").length;
  const readyCount = sourceHealth.filter((s) => s.status === "ready").length;
  const unifiedReady = sourceHealth.some((s) => s.sourceId === "unified_context" && s.status === "ready");
  const osReady = sourceHealth.some((s) => s.sourceId === "os_control" && s.status === "ready");
  const isLive = unifiedReady || osReady || readyCount >= 5;

  if (degradedCount > 0) {
    activeBlockers.push(
      blocker("orch-degraded-sources", "campaign_management", "P1", `${degradedCount} orchestration signal source(s) degraded or missing`),
    );
  }

  const osScore = os?.state.systemHealthScore ?? unified?.campaignReadinessIndex ?? 65;
  const osBlockers = os?.state.activeBlockers ?? [];
  for (let i = 0; i < osBlockers.length; i++) {
    activeBlockers.push(blocker(`os-b-${i}`, "campaign_management", "P1", osBlockers[i], "/admin/ai-command-center"));
  }

  if (crossDomain) {
    for (let i = 0; i < crossDomain.currentBlockers.length; i++) {
      activeBlockers.push(blocker(`xd-b-${i}`, "event_planning", "P1", crossDomain.currentBlockers[i], "/admin/campaign-events/workbench"));
    }
  }

  if (county && !county.bridgeAvailable) {
    activeBlockers.push(blocker("county-bridge", "county", "P1", "County workbench bridge unavailable", "/admin/county-intelligence", "county"));
  }

  if (comms?.bottlenecks.length) {
    for (let i = 0; i < Math.min(3, comms.bottlenecks.length); i++) {
      activeBlockers.push(blocker(`comms-b-${i}`, "communications", "P2", comms.bottlenecks[i], "/admin/communications/intelligence"));
    }
  }

  const weakCountyCount = county?.weakCounties.length ?? 0;
  const countyScore =
    county?.bridgeAvailable === false
      ? 30
      : weakCountyCount === 0
        ? 85
        : Math.max(35, 85 - weakCountyCount * 4);

  const volunteerAtRisk = comms?.volunteerEngagement.atRisk ?? 0;
  const volunteerScore = volunteerAtRisk > 5 ? 45 : volunteerAtRisk > 0 ? 62 : 78;

  const commsScore =
    72 -
    (comms?.relationshipHealth.relationshipWarnings.length ?? 0) * 4 -
    (comms?.fatigueWarnings.length ?? 0) * 3 -
    (comms?.bottlenecks.length ?? 0) * 2;

  const reimbStatus = os?.state.signals.reimbursementDerivedStatus ?? "unknown";
  const reimbScore = reimbStatus === "ready" ? 88 : reimbStatus === "needs_review" ? 52 : 70;

  const financeExceptions = os?.state.signals.financeExceptions ?? 0;
  const financeScore = Math.max(30, 90 - financeExceptions * 12);

  const pendingApprovals = os?.state.signals.pendingApprovals ?? 0;
  const syncStale = os?.state.signals.calendarSyncStale ?? false;
  const eventScore = Math.max(25, 90 - pendingApprovals * 6 - (syncStale ? 15 : 0));

  const complianceScore = Math.max(35, 85 - (os?.state.signals.pendingReceipts ?? 0) * 8);

  const countyHealth = slice(
    "county",
    countyScore,
    county?.bridgeAvailable
      ? `${weakCountyCount} weak counties · ${county.topAttention.length} need attention`
      : "County bridge unavailable",
    weakCountyCount > 0 ? [`${weakCountyCount} counties below field threshold`] : [],
    county?.recommendedStateActions.slice(0, 3) ?? [],
  );

  const volunteerHealth = slice(
    "volunteer",
    volunteerScore,
    volunteerAtRisk > 0 ? `${volunteerAtRisk} volunteers at burnout risk` : "Volunteer engagement stable",
    volunteerAtRisk > 3 ? ["High volunteer fatigue — rebalance assignments"] : [],
  );

  const communicationsHealth = slice(
    "communications",
    Math.max(30, Math.min(100, commsScore)),
    comms ? `Mass email ${comms.massEmailStatus} · ${comms.topPriorities.length} priorities` : "Comms signals unavailable",
    comms?.bottlenecks.slice(0, 2) ?? [],
    comms?.topPriorities.slice(0, 2) ?? [],
  );

  if (unified?.recommendedCampaignMoves.length) {
    for (let i = 0; i < unified.recommendedCampaignMoves.length; i++) {
      const m = unified.recommendedCampaignMoves[i];
      activeOpportunities.push({
        id: `uc-opp-${i}`,
        domainId: "campaign_management",
        message: m.title,
        impact: i === 0 ? "high" : "medium",
      });
    }
  }

  if (county?.opportunityCounties.length) {
    activeOpportunities.push({
      id: "county-momentum",
      domainId: "county",
      message: `${county.opportunityCounties.length} counties show momentum opportunity`,
      impact: "high",
    });
  }

  const domainStatuses: Record<CampaignDomainId, DomainHealthSlice> = {
    campaign_management: slice("campaign_management", osScore, `OS health ${osScore}%`, osBlockers.slice(0, 2)),
    candidate: slice("candidate", unified?.campaignReadinessIndex ?? 68, "Candidate briefing path via copilots"),
    calendar: slice("calendar", syncStale ? 45 : 75, syncStale ? "Calendar JSON stale" : "Calendar sync OK", syncStale ? ["Sync stale"] : []),
    event_planning: slice("event_planning", eventScore, `${pendingApprovals} pending approvals`),
    approvals: slice("approvals", pendingApprovals > 0 ? 50 : 82, `${pendingApprovals} pending approval(s)`),
    travel: slice("travel", os?.state.signals.travelNeedsReview ? 55 : 78, `${os?.state.signals.travelNeedsReview ?? 0} travel review rows`),
    reimbursement: slice("reimbursement", reimbScore, `Reimbursement: ${reimbStatus}`),
    finance: slice("finance", financeScore, `${financeExceptions} finance exception(s)`),
    compliance: slice("compliance", complianceScore, `${os?.state.signals.pendingReceipts ?? 0} pending receipt(s)`),
    county: countyHealth,
    field: slice("field", countyScore, "Field priorities tied to county intelligence"),
    volunteer: volunteerHealth,
    communications: communicationsHealth,
    social_media: slice("social_media", 60, "Social cadence via comms intelligence"),
    host: slice("host", 58, "Host pipeline via event workbench"),
    hot_wash: slice("hot_wash", os?.state.signals.hotWashActionItems ? 55 : 72, `${os?.state.signals.hotWashActionItems ?? 0} hot wash action items`),
    training: slice("training", 70, "Training registry available; progress partial"),
    dashboard_ux: slice("dashboard_ux", unified ? 72 : 55, "Dashboard nav bundle loaded"),
    memory: slice("memory", observations.length > 10 ? 68 : 55, `${observations.length} recent observations`),
    tool_builder: slice("tool_builder", toolQueue.length > 5 ? 50 : 75, `${toolQueue.length} tool-build ticket(s)`),
  };

  const allDomains = Object.values(domainStatuses);
  const weakDomains = allDomains.filter((d) => d.band === "weak" || d.band === "critical").map((d) => d.domainId);
  const strongDomains = allDomains.filter((d) => d.band === "strong").map((d) => d.domainId);

  const countyActions: OrchestrationActionRef[] =
    county?.recommendedStateActions.slice(0, 4).map((title, i) => ({
      id: `county-act-${i}`,
      title,
      domainId: "county" as const,
      route: "/admin/county-intelligence",
      humanGate: "review" as const,
      priority: "P1" as const,
    })) ?? [];

  const communicationActions: OrchestrationActionRef[] =
    comms?.topPriorities.slice(0, 4).map((title, i) => ({
      id: `comms-act-${i}`,
      title,
      domainId: "communications" as const,
      route: "/admin/communications/intelligence",
      humanGate: "review" as const,
      priority: "P1" as const,
    })) ?? [];

  const volunteerActions: OrchestrationActionRef[] =
    volunteerAtRisk > 0
      ? [
          {
            id: "vol-rebalance",
            title: `Rebalance workload for ${volunteerAtRisk} at-risk volunteers`,
            domainId: "volunteer",
            route: "/admin/volunteers",
            humanGate: "review",
            priority: "P1",
          },
        ]
      : [];

  const toolBuildActions: OrchestrationActionRef[] = toolQueue
    .filter((t) => t.status === "proposed" || t.status === "backlog")
    .slice(0, 4)
    .map((t) => ({
      id: t.id,
      title: t.observedProblem.slice(0, 80),
      domainId: "tool_builder" as CampaignDomainId,
      route: "/admin/ai-command-center/tool-builder",
      humanGate: "review" as const,
      priority: "P2" as const,
    }));

  const humanGates: HumanGateRef[] = [
    ...gatesByRisk("forbidden").map((g) => ({ actionType: g.actionId, risk: g.risk, route: g.reviewRoute })),
    ...gatesByRisk("gated").slice(0, 6).map((g) => ({ actionType: g.actionId, risk: g.risk, route: g.reviewRoute })),
  ];

  const preparedActions: PreparedOrchestrationAction[] =
    os?.preparedActions.slice(0, 5).map((a) => ({
      id: a.id,
      title: a.title,
      why: a.preview,
      routes: [a.reviewRoute],
      checklist: a.toolIds.map((t) => `Review tool: ${t}`),
      humanGate: "review" as const,
    })) ?? [];

  const frictionSignals = observations.filter(
    (o) => o.event === "flow_abandoned" || o.event === "abandoned_flow" || o.event === "no_results_search",
  ).length;

  const memoryCandidates: MemoryCandidateRef[] = [
    ...(frictionSignals >= 3
      ? [{ id: "friction-pattern", type: "workflow_friction", summary: "Repeated UX friction detected in observation stream", requiresApproval: true }]
      : []),
    ...knowledgeMemory.strongestLessons.slice(0, 3).map((l) => ({
      id: l.id,
      type: "campaign_lesson",
      summary: l.summary,
      requiresApproval: true,
    })),
  ];

  const operatingMode: CampaignState["operatingMode"] =
    degradedCount === 0 && isLive ? "live" : degradedCount > 0 && isLive ? "degraded" : "skeleton";

  const systemRisk: CampaignState["systemRisk"] =
    osScore < 50 || weakDomains.length >= 5 ? "high" : osScore < 70 || weakDomains.length >= 3 ? "medium" : "low";

  const confidenceLevel: CampaignState["confidenceLevel"] =
    operatingMode === "live" && degradedCount === 0 ? "high" : operatingMode === "degraded" ? "medium" : "low";

  const executiveSummary = [
    unified?.situationSummary?.slice(0, 120) ?? `Kelly SOS period ${period}`,
    `Health ${scoreToBand(osScore)} (${osScore}%)`,
    weakDomains.length ? `${weakDomains.length} weak domain(s)` : "No critical domain gaps",
  ].join(" · ");

  return {
    generatedAt: now,
    currentPeriod: period,
    isLive,
    operatingMode,
    executiveSummary,
    confidenceLevel,
    overallHealth: scoreToBand(osScore),
    operationalReadiness: osScore,
    candidateReadiness: Math.round((unified?.campaignReadinessIndex ?? 68) * 0.95),
    campaignManagerReadiness: unified?.campaignReadinessIndex ?? osScore,
    domainStatuses,
    countyHealth,
    volunteerHealth,
    communicationsHealth,
    financeHealth: domainStatuses.finance,
    eventReadiness: domainStatuses.event_planning,
    reimbursementReadiness: domainStatuses.reimbursement,
    complianceReadiness: domainStatuses.compliance,
    trainingHealth: domainStatuses.training,
    dashboardHealth: domainStatuses.dashboard_ux,
    countyIntelligenceSummary: {
      bridgeAvailable: county?.bridgeAvailable ?? false,
      weakCountyCount,
      topAttentionCount: county?.topAttention.length ?? 0,
      heatListTop: county?.heatList.slice(0, 3).map((h) => h.countyName) ?? [],
    },
    commsReadiness: {
      massEmailBlocked: comms?.massEmailStatus === "blocked" || emailOs?.massSendBlocked !== false,
      bottleneckCount: comms?.bottlenecks.length ?? 0,
      volunteerAtRisk,
    },
    emailEccReadiness: {
      sendEnabled: emailOs?.sendEnabled ?? false,
      sendGridConfigured: emailOs?.sendGridConfigured ?? false,
      massSendBlocked: emailOs?.massSendBlocked ?? true,
    },
    calendarEventPressure: {
      pendingApprovals,
      syncStale,
      promotionReady: (os?.state.signals.promotionReady ?? 0) as number,
    },
    financeComplianceWarnings: [
      ...(financeExceptions > 0 ? [`${financeExceptions} finance exception(s) flagged`] : []),
      ...(os?.state.signals.pendingReceipts ? [`${os.state.signals.pendingReceipts} pending receipt(s)`] : []),
    ],
    memoryObservationSummary: {
      recentObservationCount: observations.length,
      frictionSignals,
      pendingToolTickets: toolQueue.filter((t) => t.status === "proposed" || t.status === "backlog").length,
    },
    toolCoverage: {
      readySources: sourceHealth.filter((s) => s.status === "ready").length,
      degradedSources: degradedCount,
    },
    systemRisk,
    activeBlockers,
    activeOpportunities,
    weakDomains,
    strongDomains,
    urgentActions: activeBlockers
      .filter((b) => b.severity === "P0" || b.severity === "P1")
      .slice(0, 5)
      .map((b, i) => ({
        id: `urgent-${i}`,
        title: b.message,
        domainId: b.domainId,
        route: b.suggestedRoute,
        humanGate: "review" as const,
        priority: b.severity,
      })),
    roleActions: {
      campaign_manager: countyActions.slice(0, 2).concat(communicationActions.slice(0, 1)),
    },
    countyActions,
    volunteerActions,
    communicationActions,
    eventActions:
      pendingApprovals > 0
        ? [{ id: "evt-approvals", title: "Clear pending event approvals", domainId: "approvals", route: "/admin/campaign-events/review", humanGate: "review", priority: "P1" }]
        : [],
    financeActions:
      financeExceptions > 0
        ? [{ id: "fin-ex", title: "Review finance exceptions", domainId: "finance", route: "/admin/campaign-events/reimbursement", humanGate: "review", priority: "P1" }]
        : [],
    trainingActions: [],
    toolBuildActions,
    humanGates,
    preparedActions,
    memoryCandidates,
    observationSummary: `${observations.length} observations · ${frictionSignals} friction · ${knowledgeMemory.entityCount} graph entities · ${sourceHealth.filter((s) => s.status === "ready").length}/${sourceHealth.length} sources ready`,
    signalLoadErrors: bundle.errors,
    knowledge,
    knowledgeMemory,
    agentTooling: emptyAgentToolingState(),
  };
}
