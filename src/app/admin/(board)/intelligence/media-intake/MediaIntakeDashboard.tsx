"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  MediaFindingReviewStatus,
  MediaIntakeQueueSummary,
  PublicMediaIntakeFinding,
} from "@/lib/intelligence/publicMediaIntake";
import type { ApprovedMediaSource } from "@/lib/intelligence/publicMediaIntake";
import type { CoverageGapSummary, SourceCoverageSummary } from "@/lib/intelligence/mediaSourceDiscovery";
import type { MediaSourceRecord } from "@/lib/intelligence/publicMediaMonitor";
import type {
  BorderMediaCoverageSummary,
  MediaCoverageGap,
} from "@/lib/intelligence/types/mediaMarketIntelligence";
import {
  dismissMediaFindingAction,
  markMediaFindingNeedsMoreReviewAction,
  promoteFindingToCitationCandidateAction,
  promoteFindingToTaskDraftAction,
  runDryRunIntakeAction,
  updateMediaFindingReviewAction,
} from "./media-intake-actions";
import type { summarizeFeedApprovalReadiness } from "@/lib/intelligence/mediaFeedApprovalGate";
import type { PublicMediaIntakeRunEntry } from "@/lib/intelligence/scheduledPublicMediaIntake";

type RegistrySourceRow = MediaSourceRecord & {
  mediaMarket?: string;
  homeMarket?: string;
  state?: string;
  arkansasBorderCountiesInfluenced?: string[];
  monitoringPriority?: string;
  approvedForFetch?: boolean;
  verificationMethod?: string;
};

type MediaIntakeDashboardProps = {
  summary: MediaIntakeQueueSummary;
  findings: PublicMediaIntakeFinding[];
  sources: ApprovedMediaSource[];
  allSourceIds: Array<{ sourceId: string; name: string; approvedForFetch: boolean }>;
  readinessGaps: string[];
  sourceCoverage: SourceCoverageSummary;
  coverageGaps: CoverageGapSummary;
  registrySources: RegistrySourceRow[];
  borderCoverage: BorderMediaCoverageSummary;
  borderGaps: MediaCoverageGap[];
  manualReviewByMarket: Record<string, number>;
  edgeCountyOptions: Array<{ countyId: string; countyName: string; primaryMarket: string }>;
  feedApproval: ReturnType<typeof summarizeFeedApprovalReadiness>;
  lastIntakeRun: PublicMediaIntakeRunEntry | null;
};

const reviewStatuses: Array<MediaFindingReviewStatus | "ALL"> = [
  "ALL",
  "NEEDS_REVIEW",
  "IN_REVIEW",
  "ACCEPTED_FOR_RESEARCH",
  "ROUTED_TO_TASK",
  "ROUTED_TO_CITATION_CANDIDATE",
  "DISMISSED",
  "ARCHIVED",
];

const PROMOTABLE_STATUSES = new Set<MediaFindingReviewStatus>([
  "NEEDS_REVIEW",
  "IN_REVIEW",
  "ACCEPTED_FOR_RESEARCH",
]);

function FindingCard({
  finding,
  onUpdated,
}: {
  finding: PublicMediaIntakeFinding;
  onUpdated: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [notes, setNotes] = useState(finding.operatorNotes);
  const [message, setMessage] = useState("");
  const canPromote = PROMOTABLE_STATUSES.has(finding.reviewStatus) && !finding.duplicateOf;

  async function handleStatus(nextStatus: MediaFindingReviewStatus) {
    setPending(true);
    setMessage("");
    const result = await updateMediaFindingReviewAction({
      findingId: finding.findingId,
      nextStatus,
      operatorNotes: notes,
    });
    setPending(false);
    if (result.ok) {
      setMessage(`Updated to ${nextStatus}`);
      onUpdated();
    } else {
      setMessage(result.error);
    }
  }

  async function handlePromotion(
    action: "task" | "citation" | "dismiss" | "needsReview" | "archive",
  ) {
    setPending(true);
    setMessage("");
    let result: { ok: boolean; error?: string; targetDraftId?: string | null };
    if (action === "task") {
      result = await promoteFindingToTaskDraftAction({ findingId: finding.findingId, operatorNotes: notes });
    } else if (action === "citation") {
      result = await promoteFindingToCitationCandidateAction({ findingId: finding.findingId, operatorNotes: notes });
    } else if (action === "dismiss") {
      result = await dismissMediaFindingAction({ findingId: finding.findingId, operatorNotes: notes });
    } else if (action === "needsReview") {
      result = await markMediaFindingNeedsMoreReviewAction({ findingId: finding.findingId, operatorNotes: notes });
    } else {
      result = await updateMediaFindingReviewAction({
        findingId: finding.findingId,
        nextStatus: "ARCHIVED",
        operatorNotes: notes,
      });
    }
    setPending(false);
    if (result.ok) {
      const draftNote =
        "targetDraftId" in result && result.targetDraftId
          ? ` Draft: ${result.targetDraftId} (not active until human confirms).`
          : "";
      setMessage(`Promotion recorded.${draftNote}`);
      onUpdated();
    } else {
      setMessage(result.error ?? "Action failed.");
    }
  }

  return (
    <article className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-heading text-sm font-bold text-kelly-navy">{finding.title}</p>
          <p className="mt-1 text-[10px] text-kelly-subtle">
            {finding.sourceName} · {finding.capturedAt} · relevance {finding.relevanceScore}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
            {finding.reviewStatus}
          </span>
          <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-900">
            {finding.publicationSafety}
          </span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-900">
            {finding.claimStatus}
          </span>
        </div>
      </div>

      <p className="mt-2 text-kelly-muted">{finding.summary}</p>

      {finding.duplicateOf ? (
        <p className="mt-2 font-semibold text-amber-800">Duplicate of: {finding.duplicateOf}</p>
      ) : null}

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div>
          <p className="font-semibold text-kelly-navy">Entity links (suggestions)</p>
          <ul className="mt-1 list-inside list-disc text-kelly-muted">
            {finding.possibleBillLinks.map((b) => (
              <li key={b}>{b}</li>
            ))}
            {finding.possibleCountyLinks.map((c) => (
              <li key={c}>{c}</li>
            ))}
            {finding.possibleNarrativeLinks.slice(0, 3).map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-kelly-navy">Routing suggestions</p>
          <ul className="mt-1 list-inside list-disc text-kelly-muted">
            {finding.routingSuggestions.slice(0, 4).map((row) => (
              <li key={row.system}>
                {row.system}: {row.reason.slice(0, 80)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3">
        <label className="font-semibold text-kelly-navy">Operator notes</label>
        <textarea
          className="mt-1 w-full rounded border border-kelly-text/15 p-2 text-xs"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {(["IN_REVIEW", "ACCEPTED_FOR_RESEARCH"] as const).map((status) => (
          <button
            key={status}
            type="button"
            disabled={pending}
            onClick={() => handleStatus(status)}
            className="rounded border border-kelly-navy/20 px-2 py-1 font-semibold text-kelly-navy disabled:opacity-50"
          >
            {status.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      {canPromote ? (
        <div className="mt-3 rounded border border-teal-200/60 bg-teal-50/40 p-3">
          <p className="font-bold uppercase tracking-wider text-teal-950">NSI-10 · Human-initiated promotion</p>
          <p className="mt-1 text-[10px] text-teal-900">
            Draft task is not an active task. Citation candidate is not a governed citation card. Human
            confirmation required. Finding remains non-publishable.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => handlePromotion("task")}
              className="rounded border border-teal-800/30 bg-white px-2 py-1 font-semibold text-teal-950 disabled:opacity-50"
            >
              Promote to retrieval task draft
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => handlePromotion("citation")}
              className="rounded border border-teal-800/30 bg-white px-2 py-1 font-semibold text-teal-950 disabled:opacity-50"
            >
              Promote to citation candidate draft
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => handlePromotion("needsReview")}
              className="rounded border border-teal-800/30 px-2 py-1 font-semibold text-teal-950 disabled:opacity-50"
            >
              Mark needs more review
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => handlePromotion("dismiss")}
              className="rounded border border-teal-800/30 px-2 py-1 font-semibold text-teal-950 disabled:opacity-50"
            >
              Dismiss
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => handlePromotion("archive")}
              className="rounded border border-teal-800/30 px-2 py-1 font-semibold text-teal-950 disabled:opacity-50"
            >
              Archive
            </button>
          </div>
        </div>
      ) : null}
      {message ? <p className="mt-2 text-[10px] text-kelly-subtle">{message}</p> : null}
      <p className="mt-2 text-[10px] italic text-rose-800">
        Findings are not claims and are non-publishable until reviewed.
      </p>
    </article>
  );
}

export function MediaIntakeDashboard({
  summary,
  findings: initialFindings,
  sources,
  allSourceIds,
  readinessGaps,
  sourceCoverage,
  coverageGaps,
  registrySources,
  borderCoverage,
  borderGaps,
  manualReviewByMarket,
  edgeCountyOptions,
  feedApproval,
  lastIntakeRun,
}: MediaIntakeDashboardProps) {
  const [findings, setFindings] = useState(initialFindings);
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<MediaFindingReviewStatus | "ALL">("ALL");
  const [countyFilter, setCountyFilter] = useState("ALL");
  const [topicFilter, setTopicFilter] = useState("ALL");
  const [minRelevance, setMinRelevance] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [marketFilter, setMarketFilter] = useState("ALL");
  const [borderCountyFilter, setBorderCountyFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [lookupCounty, setLookupCounty] = useState(edgeCountyOptions[0]?.countyId ?? "");
  const [runMessage, setRunMessage] = useState("");

  async function handleDryRun() {
    setRunMessage("");
    const result = await runDryRunIntakeAction();
    if (result.ok) {
      setRunMessage(
        `Dry-run complete: ${result.run.fetchedSourceCount} fetched, ${result.run.newFindingCount} new (queue not written).`,
      );
    }
  }

  const sourceTypes = useMemo(
    () => [...new Set(registrySources.map((row) => row.sourceType))].sort(),
    [registrySources],
  );

  const states = useMemo(
    () => [...new Set(registrySources.map((row) => row.state ?? "AR"))].sort(),
    [registrySources],
  );

  const markets = useMemo(
    () =>
      [...new Set(registrySources.map((row) => row.homeMarket ?? row.mediaMarket ?? "unknown"))].sort(),
    [registrySources],
  );

  const lookupProfile = useMemo(
    () => edgeCountyOptions.find((row) => row.countyId === lookupCounty),
    [edgeCountyOptions, lookupCounty],
  );

  const counties = useMemo(
    () => [...new Set(findings.flatMap((row) => row.countiesMentioned))].sort(),
    [findings],
  );
  const topics = useMemo(() => [...new Set(findings.flatMap((row) => row.topics))].sort(), [findings]);

  const filtered = useMemo(
    () =>
      findings.filter((row) => {
        if (sourceFilter !== "ALL" && row.sourceId !== sourceFilter) return false;
        if (statusFilter !== "ALL" && row.reviewStatus !== statusFilter) return false;
        if (countyFilter !== "ALL" && !row.countiesMentioned.includes(countyFilter)) return false;
        if (topicFilter !== "ALL" && !row.topics.includes(topicFilter)) return false;
        if (row.relevanceScore < minRelevance) return false;
        return true;
      }),
    [findings, sourceFilter, statusFilter, countyFilter, topicFilter, minRelevance],
  );

  const filteredRegistry = useMemo(
    () =>
      registrySources.filter((row) => {
        if (categoryFilter !== "ALL" && row.sourceType !== categoryFilter) return false;
        if (stateFilter !== "ALL" && (row.state ?? "AR") !== stateFilter) return false;
        if (marketFilter !== "ALL" && row.homeMarket !== marketFilter && row.mediaMarket !== marketFilter) {
          return false;
        }
        if (borderCountyFilter !== "ALL") {
          const influenced = row.arkansasBorderCountiesInfluenced ?? row.countiesCovered;
          if (!influenced.includes(borderCountyFilter)) return false;
        }
        if (priorityFilter !== "ALL" && row.monitoringPriority !== priorityFilter) return false;
        return true;
      }),
    [registrySources, categoryFilter, stateFilter, marketFilter, borderCountyFilter, priorityFilter],
  );

  return (
    <>
      <section className="mb-6 rounded-xl border border-amber-300/50 bg-amber-50 p-4 text-xs text-amber-950">
        <p className="font-bold uppercase tracking-wider">Governance notice</p>
        <p className="mt-1">
          Findings are not claims and are non-publishable until reviewed. No autonomous claim, citation, task, or export
          creation occurs from this queue.
        </p>
      </section>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border border-kelly-text/10 bg-kelly-page px-3 py-2 text-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Pending review</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.pendingReviewCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-kelly-page px-3 py-2 text-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Total findings</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.totalFindings}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-kelly-page px-3 py-2 text-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Approved sources</p>
          <p className="mt-1 font-heading text-2xl font-bold">{sources.length}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-kelly-page px-3 py-2 text-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Duplicates flagged</p>
          <p className="mt-1 font-heading text-2xl font-bold">{summary.duplicateCount}</p>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-sky-200/50 bg-sky-50/40 p-4 text-xs">
        <p className="font-bold uppercase tracking-wider text-sky-950">NSI-9 · Source coverage summary</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded border border-sky-900/10 bg-white p-2">
            <p className="text-[10px] font-bold uppercase text-sky-900/70">Registered sources</p>
            <p className="text-lg font-bold text-sky-950">{sourceCoverage.totalSources}</p>
          </div>
          <div className="rounded border border-sky-900/10 bg-white p-2">
            <p className="text-[10px] font-bold uppercase text-sky-900/70">Fetch-approved</p>
            <p className="text-lg font-bold text-sky-950">{sourceCoverage.fetchApprovedCount}</p>
          </div>
          <div className="rounded border border-sky-900/10 bg-white p-2">
            <p className="text-[10px] font-bold uppercase text-sky-900/70">Manual review</p>
            <p className="text-lg font-bold text-sky-950">{sourceCoverage.manualReviewCount}</p>
          </div>
          <div className="rounded border border-sky-900/10 bg-white p-2">
            <p className="text-[10px] font-bold uppercase text-sky-900/70">RSS known</p>
            <p className="text-lg font-bold text-sky-950">{sourceCoverage.rssKnownCount}</p>
          </div>
          <div className="rounded border border-sky-900/10 bg-white p-2">
            <p className="text-[10px] font-bold uppercase text-sky-900/70">Unknown robots</p>
            <p className="text-lg font-bold text-sky-950">{sourceCoverage.unknownRobotsCount}</p>
          </div>
        </div>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="font-semibold text-sky-950">County coverage gaps</p>
            <ul className="mt-1 list-inside list-disc text-sky-900">
              {coverageGaps.countiesWithoutSource.map((line) => (
                <li key={line}>{line}</li>
              ))}
              {coverageGaps.countiesWithoutSource.length === 0 ? <li>NSI-5 overlay counties covered.</li> : null}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sky-950">Topic coverage gaps</p>
            <ul className="mt-1 list-inside list-disc text-sky-900">
              {coverageGaps.weakTopics.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
        {coverageGaps.fetchReadyPendingApproval.length > 0 ? (
          <div className="mt-3">
            <p className="font-semibold text-sky-950">RSS probed — pending fetch approval (NSI-10)</p>
            <ul className="mt-1 list-inside list-disc text-sky-900">
              {coverageGaps.fetchReadyPendingApproval.map((line) => (
                <li key={line.slice(0, 48)}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="mb-6 rounded-xl border border-teal-200/50 bg-teal-50/40 p-4 text-xs">
        <p className="font-bold uppercase tracking-wider text-teal-950">NSI-10 · Scheduled intake & feed approval</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded border border-teal-900/10 bg-white p-2">
            <p className="text-[10px] font-bold uppercase text-teal-900/70">Fetch eligible</p>
            <p className="text-lg font-bold text-teal-950">{feedApproval.fetchEligibleCount}</p>
          </div>
          <div className="rounded border border-teal-900/10 bg-white p-2">
            <p className="text-[10px] font-bold uppercase text-teal-900/70">Blocked feeds</p>
            <p className="text-lg font-bold text-teal-950">{feedApproval.blockedFeedCount}</p>
          </div>
          <div className="rounded border border-teal-900/10 bg-white p-2">
            <p className="text-[10px] font-bold uppercase text-teal-900/70">Robots review needed</p>
            <p className="text-lg font-bold text-teal-950">{feedApproval.robotsReviewNeededCount}</p>
          </div>
          <div className="rounded border border-teal-900/10 bg-white p-2">
            <p className="text-[10px] font-bold uppercase text-teal-900/70">Manual-review only</p>
            <p className="text-lg font-bold text-teal-950">{feedApproval.manualReviewOnlyCount}</p>
          </div>
          <div className="rounded border border-teal-900/10 bg-white p-2">
            <p className="text-[10px] font-bold uppercase text-teal-900/70">Last run new findings</p>
            <p className="text-lg font-bold text-teal-950">{lastIntakeRun?.newFindingCount ?? 0}</p>
          </div>
        </div>
        {lastIntakeRun ? (
          <p className="mt-2 text-teal-900">
            Last run: {lastIntakeRun.mode} · {lastIntakeRun.completedAt} · {lastIntakeRun.fetchedSourceCount}{" "}
            fetched · {lastIntakeRun.skippedSourceCount} skipped
          </p>
        ) : (
          <p className="mt-2 text-teal-900">No intake runs logged yet.</p>
        )}
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="font-semibold text-teal-950">Blockers by source (sample)</p>
            <ul className="mt-1 max-h-32 overflow-y-auto list-inside list-disc text-teal-900">
              {feedApproval.blockersBySource.slice(0, 6).map((row) => (
                <li key={row.sourceId}>
                  {row.name}: {row.blockers[0]}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <button
              type="button"
              onClick={handleDryRun}
              className="rounded border border-teal-800/30 bg-white px-3 py-2 font-semibold text-teal-950"
            >
              Run dry-run intake (no queue write)
            </button>
            {runMessage ? <p className="mt-2 text-[10px] text-teal-900">{runMessage}</p> : null}
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-indigo-200/50 bg-indigo-50/40 p-4 text-xs">
        <p className="font-bold uppercase tracking-wider text-indigo-950">NSI-9B · Border media market summary</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded border border-indigo-900/10 bg-white p-2">
            <p className="text-[10px] font-bold uppercase text-indigo-900/70">Markets mapped</p>
            <p className="text-lg font-bold text-indigo-950">{borderCoverage.marketCount}</p>
          </div>
          <div className="rounded border border-indigo-900/10 bg-white p-2">
            <p className="text-[10px] font-bold uppercase text-indigo-900/70">Cross-state sources</p>
            <p className="text-lg font-bold text-indigo-950">{borderCoverage.crossStateSourceCount}</p>
          </div>
          <div className="rounded border border-indigo-900/10 bg-white p-2">
            <p className="text-[10px] font-bold uppercase text-indigo-900/70">Edge counties</p>
            <p className="text-lg font-bold text-indigo-950">{borderCoverage.edgeCountyCount}</p>
          </div>
          <div className="rounded border border-indigo-900/10 bg-white p-2">
            <p className="text-[10px] font-bold uppercase text-indigo-900/70">Fetch-approved (cross-state)</p>
            <p className="text-lg font-bold text-indigo-950">{borderCoverage.fetchApprovedCrossState}</p>
          </div>
          <div className="rounded border border-indigo-900/10 bg-white p-2">
            <p className="text-[10px] font-bold uppercase text-indigo-900/70">Coverage gaps</p>
            <p className="text-lg font-bold text-indigo-950">{borderCoverage.coverageGapCount}</p>
          </div>
        </div>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="font-semibold text-indigo-950">Edge county coverage gaps</p>
            <ul className="mt-1 list-inside list-disc text-indigo-900">
              {borderGaps.slice(0, 6).map((gap) => (
                <li key={`${gap.countyId}-${gap.text.slice(0, 32)}`}>{gap.countyName}: {gap.text}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-indigo-950">Manual-review burden by market</p>
            <ul className="mt-1 list-inside list-disc text-indigo-900">
              {Object.entries(manualReviewByMarket).map(([market, count]) => (
                <li key={market}>{market}: {count} source(s)</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-3">
          <p className="font-semibold text-indigo-950">County → media market lookup</p>
          <select
            className="mt-1 rounded border p-1"
            value={lookupCounty}
            onChange={(e) => setLookupCounty(e.target.value)}
          >
            {edgeCountyOptions.map((row) => (
              <option key={row.countyId} value={row.countyId}>
                {row.countyName}
              </option>
            ))}
          </select>
          {lookupProfile ? (
            <p className="mt-2 text-indigo-900">
              Primary market: <strong>{lookupProfile.primaryMarket}</strong>
            </p>
          ) : null}
        </div>
        <p className="mt-2 text-[10px] italic text-indigo-800">
          Cross-state influence ≠ endorsement. All border findings remain NEEDS_REVIEW / NON_PUBLISHABLE.
        </p>
      </section>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Source registry</h2>
        <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 text-xs">
          <label>
            Category
            <select
              className="mt-1 w-full rounded border p-1"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All categories</option>
              {sourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            State
            <select className="mt-1 w-full rounded border p-1" value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
              <option value="ALL">All states</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label>
            Market
            <select className="mt-1 w-full rounded border p-1" value={marketFilter} onChange={(e) => setMarketFilter(e.target.value)}>
              <option value="ALL">All markets</option>
              {markets.map((market) => (
                <option key={market} value={market}>
                  {market}
                </option>
              ))}
            </select>
          </label>
          <label>
            Border county
            <select
              className="mt-1 w-full rounded border p-1"
              value={borderCountyFilter}
              onChange={(e) => setBorderCountyFilter(e.target.value)}
            >
              <option value="ALL">All counties</option>
              {edgeCountyOptions.map((row) => (
                <option key={row.countyId} value={row.countyId}>
                  {row.countyName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Monitoring priority
            <select
              className="mt-1 w-full rounded border p-1"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All priorities</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </label>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left text-[10px]">
            <thead>
              <tr className="border-b border-kelly-text/10 text-kelly-muted">
                <th className="py-1 pr-2 font-semibold">Name</th>
                <th className="py-1 pr-2 font-semibold">Type</th>
                <th className="py-1 pr-2 font-semibold">State</th>
                <th className="py-1 pr-2 font-semibold">Market</th>
                <th className="py-1 pr-2 font-semibold">RSS</th>
                <th className="py-1 pr-2 font-semibold">Fetch</th>
                <th className="py-1 font-semibold">Method</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistry.map((row) => (
                <tr key={row.sourceId} className="border-b border-kelly-text/5">
                  <td className="py-1 pr-2 font-semibold text-kelly-navy">{row.name}</td>
                  <td className="py-1 pr-2">{row.sourceType}</td>
                  <td className="py-1 pr-2">{row.state ?? "AR"}</td>
                  <td className="py-1 pr-2">{row.homeMarket ?? row.mediaMarket ?? "—"}</td>
                  <td className="py-1 pr-2">{row.rssUrl ? "yes" : "no"}</td>
                  <td className="py-1 pr-2">{row.approvedForFetch ? "APPROVED" : "no"}</td>
                  <td className="py-1">{row.ingestionMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {readinessGaps.length > 0 ? (
        <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Source readiness</h2>
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {readinessGaps.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <ul className="mt-2 text-kelly-muted">
            {allSourceIds.map((row) => (
              <li key={row.sourceId}>
                {row.name} — {row.approvedForFetch ? "APPROVED" : "SKIPPED"}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Filters</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 text-xs">
          <label>
            Source
            <select className="mt-1 w-full rounded border p-1" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
              <option value="ALL">All</option>
              {allSourceIds.map((row) => (
                <option key={row.sourceId} value={row.sourceId}>
                  {row.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select
              className="mt-1 w-full rounded border p-1"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as MediaFindingReviewStatus | "ALL")}
            >
              {reviewStatuses.map((row) => (
                <option key={row} value={row}>
                  {row}
                </option>
              ))}
            </select>
          </label>
          <label>
            County
            <select className="mt-1 w-full rounded border p-1" value={countyFilter} onChange={(e) => setCountyFilter(e.target.value)}>
              <option value="ALL">All</option>
              {counties.map((row) => (
                <option key={row} value={row}>
                  {row}
                </option>
              ))}
            </select>
          </label>
          <label>
            Topic
            <select className="mt-1 w-full rounded border p-1" value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)}>
              <option value="ALL">All</option>
              {topics.map((row) => (
                <option key={row} value={row}>
                  {row}
                </option>
              ))}
            </select>
          </label>
          <label>
            Min relevance
            <input
              type="number"
              className="mt-1 w-full rounded border p-1"
              value={minRelevance}
              min={0}
              onChange={(e) => setMinRelevance(Number(e.target.value))}
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        {filtered.map((finding) => (
          <FindingCard
            key={finding.findingId}
            finding={finding}
            onUpdated={() => setFindings((rows) => [...rows])}
          />
        ))}
        {filtered.length === 0 ? (
          <p className="text-xs text-kelly-subtle">No findings match current filters.</p>
        ) : null}
      </section>

      <p className="mt-4 text-xs">
        <Link href="/admin/intelligence/morning-brief" className="font-semibold text-kelly-navy underline">
          Morning brief
        </Link>
        {" · "}
        <Link href="/admin/intelligence/kim-hammer/audit-log" className="font-semibold text-kelly-navy underline">
          Audit log
        </Link>
      </p>
    </>
  );
}
