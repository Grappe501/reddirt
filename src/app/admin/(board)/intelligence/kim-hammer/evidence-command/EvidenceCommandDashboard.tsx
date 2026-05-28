import Link from "next/link";
import type { KimHammerReviewStatusCountKey } from "@/lib/opposition/kimHammerEvidenceIndex";
import type { KimHammerPublicationTier, KimHammerRetrievalTaskStatus } from "@/lib/opposition/types/kimHammerEvidence";

export type EvidenceCommandAnalytics = {
  exportReadyCount: number;
  reviewNeededCount: number;
  blockedCount: number;
  retrievalWorkNeededCount: number;
  copilotAgentCount: number;
  activeRetrievalCount: number;
  reviewBottleneckCount: number;
  partialCitationCount: number;
  mediumHighRiskCount: number;
  notReadyTaskCount: number;
  needsContextTaskCount: number;
  exportReadyClaimIds: string[];
};

type EvidenceCommandDashboardProps = {
  analytics: EvidenceCommandAnalytics;
  reviewStatusCounts: Record<KimHammerReviewStatusCountKey, number>;
  taskStatusCounts: Record<KimHammerRetrievalTaskStatus, number>;
  tierDistribution: Record<KimHammerPublicationTier, number>;
  safetyBlockerIds: string[];
  safetyBlockerDescriptions: Array<{ id: string; description: string }>;
  exportFilterLabel: string;
  copilotLabel: string;
  recommendedActions: string[];
  geographicSummary?: {
    countyCount: number;
    blockedCells: number;
    underdevelopedCells: number;
    topRisks: Array<{ countyId: string; countyName: string; signal: string }>;
  };
  usageSummary?: {
    narrativeCount: number;
    fragileCount: number;
    overexposedCount: number;
    underutilizedCount: number;
    topFatigueWarnings: Array<{ narrativeId: string; narrativeTitle: string; signal: string }>;
    underutilizedAlerts: Array<{ narrativeId: string; narrativeTitle: string; signal: string }>;
    synchronizationReadinessSummary: {
      mappedSourceCount: number;
      integratedSourceCount: number;
      plannedSourceCount: number;
      readinessLabel: string;
    };
  };
  strategicSummary?: {
    doctrineCount: number;
    tenseCount: number;
    fragileCount: number;
    priorityCount: number;
    topStrategicTensions: Array<{ narrativeId: string; narrativeTitle: string; signal: string }>;
    philosophyAlerts: Array<{ doctrineId: string; doctrineTitle: string; signal: string; severity: string }>;
    priorityDoctrineAreas: Array<{ doctrineId: string; title: string; category: string }>;
  };
  countyBriefingSummary?: {
    countyCount: number;
    highestRiskNarratives: Array<{ countyId: string; countyName: string; narrativeTitle: string; signal: string }>;
    blockedCountyBriefings: Array<{ countyId: string; countyName: string; blockedCount: number }>;
    strongestExportOpportunities: Array<{ countyId: string; countyName: string; exportReadyCount: number }>;
    countiesNeedingResearch: Array<{ countyId: string; countyName: string; openResearchCount: number }>;
  };
  operationalSummary?: {
    adapterCount: number;
    liveAdapterCount: number;
    turnoutVolatileCounties: Array<{ countyId: string; countyName: string; signal: string }>;
    mediaSaturationWarnings: Array<{ countyId: string; countyName: string; signal: string }>;
    countyOpportunityRankings: Array<{ countyId: string; countyName: string; signal: string }>;
    structurallyFragileCounties: Array<{ countyId: string; countyName: string; signal: string }>;
    volunteerReadinessSummaries: Array<{ countyId: string; countyName: string; summary: string }>;
  };
  nsi7Summary?: {
    mediaGaps: string[];
    targetPathwayGaps: string[];
    registrationNote: string;
    expectedSupportYield: number;
    morningBriefHref: string;
    writingToolboxHref: string;
    targetPathwayHref: string;
  };
  nsi11Summary?: {
    aiToolCount: number;
    aiCopilotRecommendedRuns: string[];
    oppositionResearchNextActions: string[];
    debatePrepNextActions: string[];
    citationImprovementPriorities: string[];
    mediaMonitoringPriorities: string[];
    publicMeetingWatchlistGaps: string[];
    briefingPaperGaps: Array<{ title: string; href: string }>;
    writingOpportunities: string[];
    aiToolsHref: string;
    oppositionCopilotHref: string;
    debateWorkbenchHref: string;
    briefingPapersHref: string;
  };
  nsi12Summary?: {
    pendingDraftCount: number;
    debateDraftBacklog: number;
    writingDraftBacklog: number;
    citationRiskDraftCount: number;
    unsupportedClaimDraftCount: number;
    reviewPriorities: string[];
    unsafeWarnings: string[];
    llmReviewQueueHref: string;
  };
  nsi13Summary?: {
    narrativeFatigueAlerts: string[];
    citationAgingAlerts: string[];
    debateRecurrenceWarnings: string[];
    countyDriftWarnings: string[];
    doctrineInconsistencyWarnings: string[];
    exportFatigueAlerts: string[];
    recurringAttackSummaries: string[];
    intelligenceMemoryHref: string;
  };
};

const tierLabels: Record<KimHammerPublicationTier, string> = {
  TIER_1_PUBLIC_DEPLOYABLE: "Tier 1 — Public deployable",
  TIER_2_NEEDS_CORROBORATION: "Tier 2 — Needs corroboration",
  TIER_3_INTERNAL_ONLY: "Tier 3 — Internal only",
  TIER_4_HIGH_CAUTION: "Tier 4 — High caution",
};

const taskStatusLabels: Record<KimHammerRetrievalTaskStatus, string> = {
  NOT_STARTED: "Not started",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In progress",
  BLOCKED: "Blocked",
  READY_FOR_REVIEW: "Ready for review",
  COMPLETE: "Complete",
  ARCHIVED: "Archived",
};

const reviewStatusLabels: Record<KimHammerReviewStatusCountKey, string> = {
  DRAFT: "Draft",
  NEEDS_REVIEW: "Needs review",
  APPROVED_FOR_INTERNAL_USE: "Approved internal",
  APPROVED_FOR_EXTERNAL_USE: "Approved external",
  EXPORTED: "Exported",
  BLOCKED: "Blocked",
  ARCHIVED: "Archived",
  LEGACY_UNSET: "Legacy unset",
};

const quickLinks = [
  { href: "/admin/intelligence/kim-hammer/audit-log", label: "Audit log browser" },
  { href: "/admin/intelligence/kim-hammer/citation-locker", label: "Citation locker" },
  { href: "/admin/intelligence/kim-hammer/ai-suggestion-sandbox", label: "AI suggestion sandbox" },
  { href: "/admin/intelligence/kim-hammer/export-control-center", label: "Export control center" },
  { href: "/admin/intelligence/kim-hammer/narrative-state", label: "Narrative state" },
  { href: "/admin/intelligence/kim-hammer/geographic-narrative-intelligence", label: "Geographic narrative" },
  { href: "/admin/intelligence/kim-hammer/county-briefings", label: "County briefings (NSI-5)" },
  { href: "/admin/intelligence/kim-hammer/narrative-usage-analytics", label: "Usage analytics" },
  { href: "/admin/intelligence/strategy-alignment", label: "Strategy alignment" },
  { href: "/admin/intelligence/kim-hammer/intelligence-gaps", label: "Intelligence gaps" },
  { href: "/admin/intelligence/kim-hammer/public-debate-evidence", label: "Public debate evidence" },
  { href: "/admin/intelligence/kim-hammer/debate-packet-export", label: "Debate packet export" },
  { href: "/admin/intelligence/kim-hammer/kh4-agent-tools", label: "KH-4 agent tools" },
  { href: "/admin/intelligence/kim-hammer/attack-surface", label: "Attack surface" },
  { href: "/admin/intelligence/kim-hammer/narrative-drift-monitor", label: "Narrative drift monitor" },
];

export function EvidenceCommandDashboard({
  analytics,
  reviewStatusCounts,
  taskStatusCounts,
  tierDistribution,
  safetyBlockerIds,
  safetyBlockerDescriptions,
  exportFilterLabel,
  copilotLabel,
  recommendedActions,
  geographicSummary,
  usageSummary,
  strategicSummary,
  countyBriefingSummary,
  operationalSummary,
  nsi7Summary,
  nsi11Summary,
  nsi12Summary,
  nsi13Summary,
}: EvidenceCommandDashboardProps) {
  return (
    <>
      <section className="mb-6 flex flex-wrap gap-2 text-xs">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded border border-kelly-text/15 bg-white px-3 py-1.5 font-semibold text-kelly-navy hover:bg-kelly-page"
          >
            {link.label}
          </Link>
        ))}
      </section>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">Export-ready</p>
          <p className="mt-1 font-heading text-3xl font-bold text-emerald-800">{analytics.exportReadyCount}</p>
          <p className="mt-1 text-emerald-900/80">Approved for debate packet export</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Needs review</p>
          <p className="mt-1 font-heading text-3xl font-bold text-amber-800">{analytics.reviewNeededCount}</p>
          <p className="mt-1 text-amber-900/80">Human review or caution tier</p>
        </div>
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-3 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-900">Blocked</p>
          <p className="mt-1 font-heading text-3xl font-bold text-rose-800">{analytics.blockedCount}</p>
          <p className="mt-1 text-rose-900/80">Do not use externally</p>
        </div>
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-3 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-900">Retrieval work needed</p>
          <p className="mt-1 font-heading text-3xl font-bold text-sky-800">{analytics.retrievalWorkNeededCount}</p>
          <p className="mt-1 text-sky-900/80">{analytics.activeRetrievalCount} in progress</p>
        </div>
        <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-3 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-900">AI suggestions</p>
          <p className="mt-1 font-heading text-3xl font-bold text-violet-800">{analytics.copilotAgentCount}</p>
          <p className="mt-1 text-violet-900/80">Non-publishable until reviewed</p>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Next operator actions</h2>
          <div className="mt-3 space-y-3 text-kelly-muted leading-relaxed">
            {recommendedActions.map((action) => (
              <p key={action}>{action}</p>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-kelly-navy/15 bg-kelly-page p-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Export-ready summary</h2>
          <p className="mt-2 text-kelly-muted">{exportFilterLabel}</p>
          <p className="mt-2 font-semibold text-kelly-navy">{analytics.exportReadyCount} claim(s) pass all gates</p>
          {analytics.exportReadyClaimIds.length > 0 ? (
            <ul className="mt-2 list-inside list-disc text-kelly-muted">
              {analytics.exportReadyClaimIds.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          ) : null}
          <Link
            href="/admin/intelligence/kim-hammer/debate-packet-export"
            className="mt-3 inline-block rounded border border-kelly-navy/20 bg-white px-3 py-1.5 font-semibold text-kelly-navy"
          >
            Open debate packet export →
          </Link>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Review bottleneck summary</h2>
          <ul className="mt-2 space-y-1 text-kelly-muted">
            <li className="flex justify-between gap-3">
              <span>Claims needing review (governance)</span>
              <span className="font-semibold text-kelly-navy">{analytics.reviewNeededCount}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Review status: NEEDS_REVIEW</span>
              <span className="font-semibold text-kelly-navy">{reviewStatusCounts.NEEDS_REVIEW}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Review bottleneck score</span>
              <span className="font-semibold text-kelly-navy">{analytics.reviewBottleneckCount}</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Task status analytics</h2>
          <ul className="mt-2 space-y-1 text-kelly-muted">
            {(Object.entries(taskStatusCounts) as [KimHammerRetrievalTaskStatus, number][])
              .filter(([, count]) => count > 0)
              .map(([status, count]) => (
                <li key={status} className="flex justify-between gap-3">
                  <span>{taskStatusLabels[status]}</span>
                  <span className="font-semibold text-kelly-navy">{count}</span>
                </li>
              ))}
          </ul>
          <Link
            href="/admin/intelligence/kim-hammer/intelligence-gaps"
            className="mt-3 inline-block font-semibold text-kelly-navy underline"
          >
            Open intelligence gaps queue
          </Link>
        </div>

        <div className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Safety blocker summary</h2>
          <p className="mt-1 text-kelly-muted">{safetyBlockerIds.length} active blocker rule(s) triggered</p>
          {safetyBlockerDescriptions.length === 0 ? (
            <p className="mt-2 text-kelly-muted">No publication-safety blockers currently fired.</p>
          ) : (
            <ul className="mt-2 list-inside list-disc text-kelly-muted">
              {safetyBlockerDescriptions.map((rule) => (
                <li key={rule.id}>
                  <span className="font-semibold text-kelly-navy">{rule.id}</span>: {rule.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Source-risk indicators</h2>
          <ul className="mt-2 space-y-1 text-kelly-muted">
            <li className="flex justify-between gap-3">
              <span>Partial citations</span>
              <span className="font-semibold text-kelly-navy">{analytics.partialCitationCount}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Medium / high legal risk</span>
              <span className="font-semibold text-kelly-navy">{analytics.mediumHighRiskCount}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Retrieval tasks NOT_READY externally</span>
              <span className="font-semibold text-kelly-navy">{analytics.notReadyTaskCount}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Retrieval tasks NEEDS_CONTEXT</span>
              <span className="font-semibold text-kelly-navy">{analytics.needsContextTaskCount}</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Publication tier distribution</h2>
          <ul className="mt-2 space-y-1 text-kelly-muted">
            {(Object.entries(tierDistribution) as [KimHammerPublicationTier, number][]).map(([tier, count]) => (
              <li key={tier} className="flex justify-between gap-3">
                <span>{tierLabels[tier]}</span>
                <span className="font-semibold text-kelly-navy">{count}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/admin/intelligence/kim-hammer/public-debate-evidence"
            className="mt-3 inline-block font-semibold text-kelly-navy underline"
          >
            Open public debate evidence board
          </Link>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-amber-300/40 bg-amber-50 p-4 text-xs text-amber-950">
        <h2 className="text-sm font-bold uppercase tracking-wider">Copilot suggestions / agent readiness</h2>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-amber-900/80">
          AI suggestions — non-publishable
        </p>
        <p className="mt-2">{copilotLabel}</p>
        <Link
          href="/admin/intelligence/kim-hammer/kh4-agent-tools"
          className="mt-3 inline-block rounded border border-amber-900/20 bg-white px-3 py-1.5 font-semibold text-amber-950"
        >
          Open KH-4 agent tools registry →
        </Link>
      </section>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Review status counts</h2>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-kelly-muted">
          {(Object.entries(reviewStatusCounts) as [KimHammerReviewStatusCountKey, number][])
            .filter(([, count]) => count > 0)
            .map(([status, count]) => (
              <li key={status} className="flex justify-between gap-3 rounded border border-kelly-text/10 bg-kelly-page px-2 py-1">
                <span>{reviewStatusLabels[status]}</span>
                <span className="font-semibold text-kelly-navy">{count}</span>
              </li>
            ))}
        </ul>
      </section>

      {geographicSummary ? (
        <section className="mb-6 rounded-xl border border-sky-300/40 bg-sky-50 p-4 text-xs text-sky-950">
          <h2 className="text-sm font-bold uppercase tracking-wider">Geographic narrative intelligence</h2>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-sky-900/80">
            County overlays — read-only composition
          </p>
          <ul className="mt-2 space-y-1">
            <li className="flex justify-between gap-3">
              <span>Counties tracked</span>
              <span className="font-semibold">{geographicSummary.countyCount}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Blocked county-narrative cells</span>
              <span className="font-semibold">{geographicSummary.blockedCells}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Underdeveloped county-narrative cells</span>
              <span className="font-semibold">{geographicSummary.underdevelopedCells}</span>
            </li>
          </ul>
          {geographicSummary.topRisks.length > 0 ? (
            <div className="mt-3">
              <h3 className="font-bold uppercase tracking-wider text-[10px] text-sky-900/80">Top geographic risk signals</h3>
              <ul className="mt-1 space-y-1">
                {geographicSummary.topRisks.map((risk) => (
                  <li key={`${risk.countyId}-${risk.signal}`} className="rounded border border-sky-900/10 bg-white px-2 py-1">
                    <span className="font-semibold">{risk.countyName}</span>: {risk.signal}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <Link
            href="/admin/intelligence/kim-hammer/geographic-narrative-intelligence"
            className="mt-3 inline-block rounded border border-sky-900/20 bg-white px-3 py-1.5 font-semibold text-sky-950"
          >
            Open geographic narrative intelligence →
          </Link>
        </section>
      ) : null}

      {usageSummary ? (
        <section className="mb-6 rounded-xl border border-indigo-300/40 bg-indigo-50 p-4 text-xs text-indigo-950">
          <h2 className="text-sm font-bold uppercase tracking-wider">Narrative usage & export fatigue</h2>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-900/80">
            NSI-3 deployment intelligence — read-only
          </p>
          <ul className="mt-2 space-y-1">
            <li className="flex justify-between gap-3">
              <span>Narratives tracked</span>
              <span className="font-semibold">{usageSummary.narrativeCount}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Fragile deployments</span>
              <span className="font-semibold">{usageSummary.fragileCount}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Overexposed / stale</span>
              <span className="font-semibold">{usageSummary.overexposedCount}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Underutilized</span>
              <span className="font-semibold">{usageSummary.underutilizedCount}</span>
            </li>
          </ul>
          {usageSummary.topFatigueWarnings.length > 0 ? (
            <div className="mt-3">
              <h3 className="font-bold uppercase tracking-wider text-[10px] text-indigo-900/80">Top fatigue warnings</h3>
              <ul className="mt-1 space-y-1">
                {usageSummary.topFatigueWarnings.map((warning) => (
                  <li key={warning.narrativeId} className="rounded border border-indigo-900/10 bg-white px-2 py-1">
                    <span className="font-semibold">{warning.narrativeTitle}</span>: {warning.signal}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {usageSummary.underutilizedAlerts.length > 0 ? (
            <div className="mt-3">
              <h3 className="font-bold uppercase tracking-wider text-[10px] text-indigo-900/80">Underutilized narratives</h3>
              <ul className="mt-1 space-y-1">
                {usageSummary.underutilizedAlerts.map((alert) => (
                  <li key={alert.narrativeId} className="rounded border border-indigo-900/10 bg-white px-2 py-1">
                    <span className="font-semibold">{alert.narrativeTitle}</span>: {alert.signal}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="mt-3 text-[10px] text-indigo-900/80">
            Sync readiness: {usageSummary.synchronizationReadinessSummary.readinessLabel} (
            {usageSummary.synchronizationReadinessSummary.integratedSourceCount} LIVE /{" "}
            {usageSummary.synchronizationReadinessSummary.mappedSourceCount} mapped)
          </p>
          <Link
            href="/admin/intelligence/kim-hammer/narrative-usage-analytics"
            className="mt-3 inline-block rounded border border-indigo-900/20 bg-white px-3 py-1.5 font-semibold text-indigo-950"
          >
            Open narrative usage analytics →
          </Link>
        </section>
      ) : null}

      {strategicSummary ? (
        <section className="mb-6 rounded-xl border border-purple-300/40 bg-purple-50 p-4 text-xs text-purple-950">
          <h2 className="text-sm font-bold uppercase tracking-wider">Strategic doctrine alignment</h2>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-purple-900/80">
            SDI-1 composition — read-only
          </p>
          <ul className="mt-2 space-y-1">
            <li className="flex justify-between gap-3">
              <span>Doctrine assets mapped</span>
              <span className="font-semibold">{strategicSummary.doctrineCount}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Priority / aligned narratives</span>
              <span className="font-semibold">{strategicSummary.priorityCount}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Tense deployments</span>
              <span className="font-semibold">{strategicSummary.tenseCount}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Fragile / contradictory</span>
              <span className="font-semibold">{strategicSummary.fragileCount}</span>
            </li>
          </ul>
          {strategicSummary.topStrategicTensions.length > 0 ? (
            <div className="mt-3">
              <h3 className="font-bold uppercase tracking-wider text-[10px] text-purple-900/80">Top strategic tensions</h3>
              <ul className="mt-1 space-y-1">
                {strategicSummary.topStrategicTensions.map((tension) => (
                  <li key={tension.narrativeId} className="rounded border border-purple-900/10 bg-white px-2 py-1">
                    <span className="font-semibold">{tension.narrativeTitle}</span>: {tension.signal}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {strategicSummary.philosophyAlerts.length > 0 ? (
            <div className="mt-3">
              <h3 className="font-bold uppercase tracking-wider text-[10px] text-purple-900/80">Philosophy consistency alerts</h3>
              <ul className="mt-1 space-y-1">
                {strategicSummary.philosophyAlerts.map((alert) => (
                  <li key={`${alert.doctrineId}-${alert.severity}`} className="rounded border border-purple-900/10 bg-white px-2 py-1">
                    {alert.signal}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {strategicSummary.priorityDoctrineAreas.length > 0 ? (
            <p className="mt-3 text-[10px] text-purple-900/80">
              Campaign priorities: {strategicSummary.priorityDoctrineAreas.map((row) => row.title).join(" · ")}
            </p>
          ) : null}
          <Link
            href="/admin/intelligence/strategy-alignment"
            className="mt-3 inline-block rounded border border-purple-900/20 bg-white px-3 py-1.5 font-semibold text-purple-950"
          >
            Open strategy alignment command →
          </Link>
        </section>
      ) : null}

      {countyBriefingSummary ? (
        <section className="mb-6 rounded-xl border border-emerald-300/40 bg-emerald-50 p-4 text-xs text-emerald-950">
          <h2 className="text-sm font-bold uppercase tracking-wider">County briefing intelligence</h2>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-900/80">
            NSI-5 — read-only local strategic composition
          </p>
          <ul className="mt-2 space-y-1">
            <li className="flex justify-between gap-3">
              <span>Counties/regions tracked</span>
              <span className="font-semibold">{countyBriefingSummary.countyCount}</span>
            </li>
          </ul>
          {countyBriefingSummary.highestRiskNarratives.length > 0 ? (
            <div className="mt-3">
              <h3 className="font-bold uppercase tracking-wider text-[10px] text-emerald-900/80">Highest-risk county narratives</h3>
              <ul className="mt-1 space-y-1">
                {countyBriefingSummary.highestRiskNarratives.map((row) => (
                  <li key={`${row.countyId}-${row.narrativeTitle}`} className="rounded border border-emerald-900/10 bg-white px-2 py-1">
                    <Link href={`/admin/intelligence/kim-hammer/counties/${encodeURIComponent(row.countyId)}`} className="font-semibold underline">
                      {row.countyName}
                    </Link>
                    {" · "}
                    {row.narrativeTitle}: {row.signal}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {countyBriefingSummary.blockedCountyBriefings.length > 0 ? (
            <div className="mt-3">
              <h3 className="font-bold uppercase tracking-wider text-[10px] text-rose-900/80">Counties with blocked narratives</h3>
              <ul className="mt-1 space-y-1">
                {countyBriefingSummary.blockedCountyBriefings.map((row) => (
                  <li key={row.countyId} className="rounded border border-rose-900/10 bg-white px-2 py-1">
                    {row.countyName}: {row.blockedCount} blocked
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {countyBriefingSummary.strongestExportOpportunities.length > 0 ? (
            <div className="mt-3">
              <h3 className="font-bold uppercase tracking-wider text-[10px] text-emerald-900/80">Strongest export-ready opportunities</h3>
              <ul className="mt-1 space-y-1">
                {countyBriefingSummary.strongestExportOpportunities.map((row) => (
                  <li key={row.countyId} className="rounded border border-emerald-900/10 bg-white px-2 py-1">
                    {row.countyName}: {row.exportReadyCount} export-ready point(s)
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {countyBriefingSummary.countiesNeedingResearch.length > 0 ? (
            <div className="mt-3">
              <h3 className="font-bold uppercase tracking-wider text-[10px] text-amber-900/80">Counties needing research</h3>
              <ul className="mt-1 space-y-1">
                {countyBriefingSummary.countiesNeedingResearch.map((row) => (
                  <li key={row.countyId} className="rounded border border-amber-900/10 bg-white px-2 py-1">
                    {row.countyName}: {row.openResearchCount} open item(s)
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <Link
            href="/admin/intelligence/kim-hammer/county-briefings"
            className="mt-3 inline-block rounded border border-emerald-900/20 bg-white px-3 py-1.5 font-semibold text-emerald-950"
          >
            Open county briefing index →
          </Link>
        </section>
      ) : null}

      {operationalSummary ? (
        <section className="mb-6 rounded-xl border border-violet-300/40 bg-violet-50 p-4 text-xs text-violet-950">
          <h2 className="text-sm font-bold uppercase tracking-wider">Operational environment intelligence</h2>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-violet-900/80">
            NSI-6 aggregate adapters — {operationalSummary.liveAdapterCount}/{operationalSummary.adapterCount} LIVE
          </p>
          {operationalSummary.structurallyFragileCounties.length > 0 ? (
            <div className="mt-3">
              <h3 className="font-bold uppercase tracking-wider text-[10px] text-rose-900/80">Structurally fragile counties</h3>
              <ul className="mt-1 space-y-1">
                {operationalSummary.structurallyFragileCounties.map((row) => (
                  <li key={row.countyId} className="rounded border border-rose-900/10 bg-white px-2 py-1">
                    {row.countyName}: {row.signal}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {operationalSummary.turnoutVolatileCounties.length > 0 ? (
            <div className="mt-3">
              <h3 className="font-bold uppercase tracking-wider text-[10px] text-violet-900/80">Turnout volatility</h3>
              <ul className="mt-1 space-y-1">
                {operationalSummary.turnoutVolatileCounties.map((row) => (
                  <li key={row.countyId} className="rounded border border-violet-900/10 bg-white px-2 py-1">
                    {row.countyName}: {row.signal}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {operationalSummary.mediaSaturationWarnings.length > 0 ? (
            <div className="mt-3">
              <h3 className="font-bold uppercase tracking-wider text-[10px] text-amber-900/80">Media saturation warnings</h3>
              <ul className="mt-1 space-y-1">
                {operationalSummary.mediaSaturationWarnings.map((row) => (
                  <li key={row.countyId} className="rounded border border-amber-900/10 bg-white px-2 py-1">
                    {row.countyName}: {row.signal}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {operationalSummary.countyOpportunityRankings.length > 0 ? (
            <p className="mt-3 text-[10px] text-violet-900/80">
              Top opportunities: {operationalSummary.countyOpportunityRankings.map((row) => row.countyName).join(", ")}
            </p>
          ) : null}
        </section>
      ) : null}

      {nsi13Summary ? (
        <section className="mb-6 rounded-xl border border-teal-300/40 bg-teal-50 p-4 text-xs text-teal-950">
          <h2 className="text-sm font-bold uppercase tracking-wider">NSI-13 · Longitudinal memory alerts</h2>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-teal-900/80">
            Read-only historical synthesis — INTERNAL · no autonomous mutation
          </p>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="font-bold uppercase tracking-wider text-[10px]">Narrative fatigue · export fatigue</h3>
              <ul className="mt-1 list-inside list-disc">
                {[...nsi13Summary.narrativeFatigueAlerts, ...nsi13Summary.exportFatigueAlerts].map((line) => (
                  <li key={line.slice(0, 48)}>{line}</li>
                ))}
              </ul>
              <h3 className="mt-3 font-bold uppercase tracking-wider text-[10px]">Citation aging alerts</h3>
              <ul className="mt-1 list-inside list-disc">
                {nsi13Summary.citationAgingAlerts.length > 0 ? nsi13Summary.citationAgingAlerts.map((line) => <li key={line}>{line}</li>) : <li>None flagged.</li>}
              </ul>
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-wider text-[10px]">Debate recurrence · recurring attacks</h3>
              <ul className="mt-1 list-inside list-disc">
                {[...nsi13Summary.debateRecurrenceWarnings, ...nsi13Summary.recurringAttackSummaries].map((line) => (
                  <li key={line.slice(0, 48)}>{line}</li>
                ))}
              </ul>
              <h3 className="mt-3 font-bold uppercase tracking-wider text-[10px]">County drift · doctrine inconsistency</h3>
              <ul className="mt-1 list-inside list-disc">
                {[...nsi13Summary.countyDriftWarnings, ...nsi13Summary.doctrineInconsistencyWarnings].map((line) => (
                  <li key={line.slice(0, 48)}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-3">
            <Link href={nsi13Summary.intelligenceMemoryHref} className="rounded border border-teal-900/20 bg-white px-2 py-1 font-semibold">
              Intelligence memory dashboard
            </Link>
          </div>
        </section>
      ) : null}

      {nsi12Summary ? (
        <section className="mb-6 rounded-xl border border-purple-300/40 bg-purple-50 p-4 text-xs text-purple-950">
          <h2 className="text-sm font-bold uppercase tracking-wider">NSI-12 · LLM draft review queue</h2>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-purple-900/80">
            {nsi12Summary.pendingDraftCount} pending · No export/publish — human review required
          </p>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="font-bold uppercase tracking-wider text-[10px]">Draft backlogs</h3>
              <ul className="mt-1 list-inside list-disc">
                <li>Debate drafts: {nsi12Summary.debateDraftBacklog}</li>
                <li>Writing drafts: {nsi12Summary.writingDraftBacklog}</li>
                <li>Citation-risk drafts: {nsi12Summary.citationRiskDraftCount}</li>
                <li>Unsupported-claim alerts: {nsi12Summary.unsupportedClaimDraftCount}</li>
              </ul>
              <h3 className="mt-3 font-bold uppercase tracking-wider text-[10px]">Recommended review actions</h3>
              <ul className="mt-1 list-inside list-disc">
                {nsi12Summary.reviewPriorities.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-wider text-[10px]">Unsupported-claim / unsafe draft alerts</h3>
              <ul className="mt-1 list-inside list-disc">
                {nsi12Summary.unsafeWarnings.length > 0 ? nsi12Summary.unsafeWarnings.map((line) => <li key={line}>{line}</li>) : <li>None flagged.</li>}
              </ul>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={nsi12Summary.llmReviewQueueHref} className="rounded border border-purple-900/20 bg-white px-2 py-1 font-semibold">
              LLM review queue
            </Link>
          </div>
        </section>
      ) : null}

      {nsi11Summary ? (
        <section className="mb-6 rounded-xl border border-violet-300/40 bg-violet-50 p-4 text-xs text-violet-950">
          <h2 className="text-sm font-bold uppercase tracking-wider">NSI-11 · AI copilot suite (governed)</h2>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-violet-900/80">
            {nsi11Summary.aiToolCount} registered tools · INTERNAL_DRAFT · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED
          </p>
          {nsi11Summary.aiCopilotRecommendedRuns.length > 0 ? (
            <div className="mt-3">
              <h3 className="font-bold uppercase tracking-wider text-[10px]">Recommended copilot runs</h3>
              <ul className="mt-1 list-inside list-disc">
                {nsi11Summary.aiCopilotRecommendedRuns.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="font-bold uppercase tracking-wider text-[10px]">Opposition research next actions</h3>
              <ul className="mt-1 list-inside list-disc">
                {nsi11Summary.oppositionResearchNextActions.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <h3 className="mt-3 font-bold uppercase tracking-wider text-[10px]">Citation improvement priorities</h3>
              <ul className="mt-1 list-inside list-disc">
                {nsi11Summary.citationImprovementPriorities.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-wider text-[10px]">Debate prep tool suggestions</h3>
              <ul className="mt-1 list-inside list-disc">
                {nsi11Summary.debatePrepNextActions.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <h3 className="mt-3 font-bold uppercase tracking-wider text-[10px]">Media intelligence priorities</h3>
              <ul className="mt-1 list-inside list-disc">
                {nsi11Summary.mediaMonitoringPriorities.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
          {nsi11Summary.publicMeetingWatchlistGaps.length > 0 ? (
            <div className="mt-3">
              <h3 className="font-bold uppercase tracking-wider text-[10px]">Public meeting watchlist gaps</h3>
              <ul className="mt-1 list-inside list-disc">
                {nsi11Summary.publicMeetingWatchlistGaps.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {nsi11Summary.briefingPaperGaps.length > 0 ? (
            <div className="mt-3">
              <h3 className="font-bold uppercase tracking-wider text-[10px]">Top briefing paper gaps</h3>
              <ul className="mt-1 list-inside list-disc">
                {nsi11Summary.briefingPaperGaps.map((row) => (
                  <li key={row.href}>
                    <Link href={row.href} className="font-semibold underline">
                      {row.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={nsi11Summary.aiToolsHref} className="rounded border border-violet-900/20 bg-white px-2 py-1 font-semibold">
              AI tools dashboard
            </Link>
            <Link href={nsi11Summary.oppositionCopilotHref} className="rounded border border-violet-900/20 bg-white px-2 py-1 font-semibold">
              Opposition copilot
            </Link>
            <Link href={nsi11Summary.debateWorkbenchHref} className="rounded border border-violet-900/20 bg-white px-2 py-1 font-semibold">
              Debate AI workbench
            </Link>
            <Link href={nsi11Summary.briefingPapersHref} className="rounded border border-violet-900/20 bg-white px-2 py-1 font-semibold">
              Briefing papers
            </Link>
          </div>
        </section>
      ) : null}

      {nsi7Summary ? (
        <section className="mb-6 rounded-xl border border-indigo-300/40 bg-indigo-50 p-4 text-xs text-indigo-950">
          <h2 className="text-sm font-bold uppercase tracking-wider">NSI-7 · Strategic intelligence & media readiness</h2>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-900/80">
            Registration yield (anecdotal): {nsi7Summary.expectedSupportYield.toLocaleString()} expected support votes
          </p>
          <p className="mt-1">{nsi7Summary.registrationNote}</p>
          {nsi7Summary.targetPathwayGaps.length > 0 ? (
            <div className="mt-3">
              <h3 className="font-bold uppercase tracking-wider text-[10px]">Target pathway gaps</h3>
              <ul className="mt-1 list-inside list-disc">
                {nsi7Summary.targetPathwayGaps.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {nsi7Summary.mediaGaps.length > 0 ? (
            <div className="mt-3">
              <h3 className="font-bold uppercase tracking-wider text-[10px]">Media monitoring gaps</h3>
              <ul className="mt-1 list-inside list-disc">
                {nsi7Summary.mediaGaps.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={nsi7Summary.morningBriefHref} className="rounded border border-indigo-900/20 bg-white px-2 py-1 font-semibold">
              Morning brief
            </Link>
            <Link href={nsi7Summary.writingToolboxHref} className="rounded border border-indigo-900/20 bg-white px-2 py-1 font-semibold">
              Writing toolbox
            </Link>
            <Link href={nsi7Summary.targetPathwayHref} className="rounded border border-indigo-900/20 bg-white px-2 py-1 font-semibold">
              Target pathway
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );
}
