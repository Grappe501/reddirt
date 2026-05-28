import Link from "next/link";
import { loadMediaSourceRegistry } from "@/lib/intelligence/publicMediaMonitor";
import {
  loadApprovedMediaSources,
  loadPublicMediaIntakeQueue,
  summarizeMediaIntakeQueue,
} from "@/lib/intelligence/publicMediaIntake";
import { summarizeMediaMonitoringReadiness } from "@/lib/intelligence/publicMediaMonitor";
import {
  loadArkansasMediaSourceRegistry,
  summarizeCoverageGaps,
  summarizeSourceCoverage,
} from "@/lib/intelligence/mediaSourceDiscovery";
import {
  computeMediaCoverageGaps,
  resolveCountyMediaMarketProfile,
  summarizeBorderMediaCoverage,
  summarizeManualReviewBurden,
} from "@/lib/intelligence/mediaMarketIntelligence";
import { summarizeFeedApprovalReadiness } from "@/lib/intelligence/mediaFeedApprovalGate";
import { summarizeScheduledIntakeRun } from "@/lib/intelligence/scheduledPublicMediaIntake";
import { MediaIntakeDashboard } from "./MediaIntakeDashboard";

export const dynamic = "force-dynamic";

export default async function MediaIntakePage() {
  const summary = summarizeMediaIntakeQueue();
  const queue = loadPublicMediaIntakeQueue();
  const approved = loadApprovedMediaSources();
  const registry = loadMediaSourceRegistry();
  const readiness = summarizeMediaMonitoringReadiness();
  const sourceCoverage = summarizeSourceCoverage();
  const coverageGaps = summarizeCoverageGaps();
  const fullRegistry = loadArkansasMediaSourceRegistry();
  const borderCoverage = summarizeBorderMediaCoverage();
  const borderGaps = computeMediaCoverageGaps();
  const manualReviewByMarket = summarizeManualReviewBurden().byMarket;
  const feedApproval = summarizeFeedApprovalReadiness();
  const { lastRun: lastIntakeRun } = summarizeScheduledIntakeRun();

  const edgeCountyIds = ["pulaski", "benton", "washington", "sebastian", "craighead", "crittenden", "miller", "union", "mississippi", "lee"];
  const edgeCountyOptions = edgeCountyIds
    .map((countyId) => {
      const profile = resolveCountyMediaMarketProfile(countyId);
      if (!profile) return null;
      return { countyId, countyName: profile.countyName, primaryMarket: profile.primaryMediaMarket };
    })
    .filter((row): row is { countyId: string; countyName: string; primaryMarket: string } => Boolean(row));

  const allSourceIds = registry.sources.map((row) => ({
    sourceId: row.sourceId,
    name: row.name,
    approvedForFetch: Boolean((row as { approvedForFetch?: boolean }).approvedForFetch),
  }));

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">
          NSI-8 / NSI-9 / NSI-9B / NSI-10 · Public Media Intake
        </p>
        <h1 className="font-heading text-2xl font-bold">Media Intake Review Queue</h1>
        <p className="mt-2 max-w-4xl font-body text-sm leading-relaxed text-kelly-muted">
          Governed public media intake — every finding starts NEEDS_REVIEW, NON_PUBLISHABLE, NOT_A_CLAIM.
          Findings are not claims and are non-publishable until reviewed.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Intelligence hub
          </Link>
          <Link href="/admin/intelligence/morning-brief" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Morning brief
          </Link>
          <Link href="/admin/intelligence/kim-hammer/audit-log" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Audit log
          </Link>
        </div>
      </header>

      <MediaIntakeDashboard
        summary={summary}
        findings={queue.findings}
        sources={approved}
        allSourceIds={allSourceIds}
        readinessGaps={[...readiness.gaps, ...summary.sourceCoverageGaps]}
        sourceCoverage={sourceCoverage}
        coverageGaps={coverageGaps}
        registrySources={fullRegistry.sources}
        borderCoverage={borderCoverage}
        borderGaps={borderGaps}
        manualReviewByMarket={manualReviewByMarket}
        edgeCountyOptions={edgeCountyOptions}
        feedApproval={feedApproval}
        lastIntakeRun={lastIntakeRun}
      />
    </div>
  );
}
