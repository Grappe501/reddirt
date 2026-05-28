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
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {recommendedActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
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
    </>
  );
}
