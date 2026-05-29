import Link from "next/link";
import { buildMorningBriefingPaper } from "@/lib/intelligence/strategicBriefingPaperEngine";
import { summarizeCampaignIntelligenceState, recommendIntelligenceGatheringPriorities } from "@/lib/intelligence/intelligenceBrainCoordinator";
import {
  getMorningBriefActionQueueSection,
  syncHumanActionQueue,
} from "@/lib/intelligence/strategicDecisionSupport";
import { computeStatewideRegistrationRollup } from "@/lib/intelligence/voterRegistrationTargetModel";
import { StrategicBriefingDrilldownPanel } from "../StrategicBriefingDrilldownPanel";

export const dynamic = "force-dynamic";

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-xs text-kelly-subtle">None flagged.</p>;
  return (
    <ul className="list-inside list-disc text-xs text-kelly-muted">
      {items.map((item) => (
        <li key={item.slice(0, 64)}>{item}</li>
      ))}
    </ul>
  );
}

export default async function MorningBriefPage() {
  const paper = buildMorningBriefingPaper();
  const brain = summarizeCampaignIntelligenceState();
  const priorities = recommendIntelligenceGatheringPriorities();
  const registration = computeStatewideRegistrationRollup();
  syncHumanActionQueue();
  const actionQueue = getMorningBriefActionQueueSection();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">
          NSI-7 · Morning Intelligence Brief
        </p>
        <h1 className="font-heading text-2xl font-bold">Campaign Intelligence Command — Daily Brief</h1>
        <p className="mt-2 max-w-4xl font-body text-sm leading-relaxed text-kelly-muted">
          Governed composition for leadership review. Not autonomous publishing. All outputs NON_PUBLISHABLE until human review.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Intelligence hub
          </Link>
          <Link href="/admin/intelligence/strategic-target-pathway" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Target pathway
          </Link>
          <Link href="/admin/intelligence/writing-toolbox" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Writing toolbox
          </Link>
          <Link href="/admin/intelligence/media-intake" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Media intake (NSI-8)
          </Link>
        </div>
      </header>

      <section className="mb-6 rounded-xl border border-kelly-navy/20 bg-kelly-navy/5 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Top 5 — leadership needs to know</h2>
        <BulletList items={brain.topLeadershipItems} />
      </section>

      <section className="mb-6 rounded-xl border border-teal-200/50 bg-teal-50/40 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-teal-950">NSI-15 · Today&apos;s human action queue</h2>
        <p className="mt-1 text-xs text-teal-900/80">
          Recommendation only. Human action required. Status updates do not execute underlying workflows.
        </p>
        <div className="mt-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-950">Top 5 actions</h3>
          <BulletList items={actionQueue.topFive.map((row) => `${row.title} — ${row.recommendedNextStep.slice(0, 100)}`)} />
        </div>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-950">Candidate prep</h3>
            <BulletList items={actionQueue.candidatePrep.map((row) => row.title)} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-teal-950">Debate prep</h3>
            <BulletList items={actionQueue.debatePrep.map((row) => row.title)} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-teal-950">Research</h3>
            <BulletList items={actionQueue.research.map((row) => row.title)} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-950">Field / volunteer</h3>
            <BulletList items={actionQueue.fieldVolunteer.map((row) => row.title)} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-teal-950">Media monitoring</h3>
            <BulletList items={actionQueue.mediaMonitoring.map((row) => row.title)} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-teal-950">Blocked by citation weakness</h3>
            <BulletList items={actionQueue.blockedByCitation.map((row) => row.title)} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-teal-950">High-risk scenarios</h3>
            <BulletList items={actionQueue.highRiskScenarios.map((row) => row.title)} />
          </div>
        </div>
        <p className="mt-3 text-[10px] text-teal-900">
          <Link href="/admin/intelligence/action-queue" className="font-semibold underline">
            Open full action queue →
          </Link>
        </p>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/40 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-950">Strongest ready narratives</h2>
          <ul className="mt-2 text-xs text-emerald-950">
            {brain.strongestNarratives.map((row) => (
              <li key={row.narrativeId}>{row.title}: {row.signal.slice(0, 100)}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-rose-200/50 bg-rose-50/40 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-rose-950">Weakest / blocked narratives</h2>
          <ul className="mt-2 text-xs text-rose-950">
            {[...brain.weakestNarratives, ...brain.blockedNarratives].map((row) => (
              <li key={row.narrativeId}>{row.title}: {row.signal.slice(0, 100)}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">County alerts</h2>
          <BulletList items={brain.countyRisks.map((r) => `${r.countyName}: ${r.signal}`)} />
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Media monitoring gaps</h2>
          <BulletList items={brain.mediaIntakeReadiness.gaps} />
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Pathway-to-win gaps</h2>
          <BulletList items={brain.targetPathwayMissingData} />
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Registration assumptions (anecdotal)</h2>
          <BulletList items={[
            registration.assumptions.notes,
            `Expected support yield: ${registration.expectedSupportVotes.toLocaleString()} from ${registration.statewideRegistrationGoal.toLocaleString()} registrations.`,
            ...brain.registrationGoalGaps,
          ]} />
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Citation risks</h2>
          <BulletList items={brain.citationProblems} />
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Open retrieval priorities</h2>
          <BulletList items={priorities} />
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Debate prep priorities</h2>
          <BulletList items={brain.debatePrepPriorities} />
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-orange-200/50 bg-orange-50/40 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-orange-950">NSI-8 · Media intake awaiting review</h2>
        <p className="mt-1 text-xs text-orange-900/80">
          {brain.mediaIntakeSummary.pendingReviewCount} findings pending · Findings are not claims and are non-publishable until reviewed.
        </p>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-950">Top relevant items</h3>
            <BulletList items={brain.topPendingMediaFindings.map((row) => `[${row.relevanceScore}] ${row.title.slice(0, 100)}`)} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-950">Intake warnings & coverage gaps</h3>
            <BulletList items={[...brain.mediaIntakeWarnings, ...brain.mediaIntakeSummary.sourceCoverageGaps]} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-orange-950">Suggested research follow-ups</h3>
          <BulletList items={brain.mediaReviewPriorities} />
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-sky-200/50 bg-sky-50/40 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-sky-950">NSI-9 · Arkansas source coverage snapshot</h2>
        <p className="mt-1 text-xs text-sky-900/80">
          {brain.manualReviewBurden} sources require manual review · {brain.fetchApprovedSourceSummary.length} fetch-approved
        </p>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-950">Top source gaps</h3>
            <BulletList items={brain.sourceCoverageWarnings} />
            <BulletList items={brain.missingRegionCoverage.map((r) => `Region gap: ${r}`)} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-950">Sources ready for future intake</h3>
            <BulletList items={brain.publicMediaDiscoveryPriorities.slice(0, 4)} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-sky-950">Fetch-approved today</h3>
            <BulletList items={brain.fetchApprovedSourceSummary} />
          </div>
        </div>
        <p className="mt-3 text-[10px] text-sky-900">
          <Link href="/admin/intelligence/media-intake" className="font-semibold underline">
            Open media intake registry →
          </Link>
        </p>
      </section>

      <section className="mb-6 rounded-xl border border-indigo-200/50 bg-indigo-50/40 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950">NSI-9B · Border media coverage warnings</h2>
        <p className="mt-1 text-xs text-indigo-900/80">
          {brain.borderMediaCoverageWarnings.length} edge warnings · {Object.keys(brain.borderManualReviewBurdenByMarket).length} cross-state markets with manual review burden
        </p>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950">Border media coverage warnings</h3>
            <BulletList items={brain.borderMediaCoverageWarnings} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-indigo-950">Cross-state source gaps</h3>
            <BulletList items={brain.crossStateSourceGaps} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950">Edge county media alerts</h3>
            <BulletList items={brain.edgeCountyMediaAlerts} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-indigo-950">Local paper priority notes</h3>
            <BulletList items={brain.localPaperPriorityNotes} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950">Manual-review workload by media market</h3>
          <BulletList
            items={Object.entries(brain.borderManualReviewBurdenByMarket).map(
              ([market, count]) => `${market}: ${count} cross-state source(s)`,
            )}
          />
        </div>
        <div className="mt-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950">Border monitoring priorities</h3>
          <BulletList items={brain.borderMonitoringPriorities} />
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-teal-200/50 bg-teal-50/40 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-teal-950">NSI-10 · Scheduled intake & promotion backlog</h2>
        <p className="mt-1 text-xs text-teal-900/80">
          {brain.scheduledIntakeReadiness.fetchEligibleCount} fetch-eligible ·{" "}
          {brain.scheduledIntakeReadiness.blockedFeedCount} blocked · Last run new findings:{" "}
          {brain.newFindingsFromLastRun}
        </p>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-950">Intake run summary</h3>
            <BulletList
              items={
                brain.lastIntakeRunSummary.lastRun
                  ? [
                      `Mode: ${brain.lastIntakeRunSummary.lastRun.mode}`,
                      `Fetched: ${brain.lastIntakeRunSummary.lastRun.fetchedSourceCount} · Skipped: ${brain.lastIntakeRunSummary.lastRun.skippedSourceCount}`,
                      `New: ${brain.lastIntakeRunSummary.lastRun.newFindingCount} · Duplicates: ${brain.lastIntakeRunSummary.lastRun.duplicateFindingCount}`,
                    ]
                  : ["No intake runs logged yet — dry-run default."]
              }
            />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-teal-950">Feed approval blockers</h3>
            <BulletList items={brain.feedApprovalBlockers} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-950">Promotion backlog</h3>
            <BulletList
              items={[
                `${brain.promotionQueueSummary.taskDraftCount} task draft(s) · ${brain.promotionQueueSummary.citationCandidateCount} citation candidate(s)`,
                `${brain.promotionQueueSummary.promotionEventCount} promotion event(s) logged`,
              ]}
            />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-teal-950">Media-derived citation candidates</h3>
            <BulletList items={brain.citationCandidateBacklog.length > 0 ? brain.citationCandidateBacklog : ["None yet"]} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-teal-950">Media-derived task drafts</h3>
            <BulletList items={brain.taskDraftBacklog.length > 0 ? brain.taskDraftBacklog : ["None yet"]} />
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-violet-200/50 bg-violet-50/40 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-violet-950">NSI-11 · AI copilot internal draft insights</h2>
        <p className="mt-1 text-xs font-semibold text-violet-900/90">
          DO NOT USE PUBLICLY YET — all AI outputs are INTERNAL_DRAFT · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED.
        </p>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-950">Internal draft insights</h3>
            <BulletList items={brain.aiCopilotInternalDraftInsights.length > 0 ? brain.aiCopilotInternalDraftInsights : ["No draft insights generated yet — run copilot tools."]} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-violet-950">Recommended copilot runs</h3>
            <BulletList items={brain.aiCopilotRecommendedRuns} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-950">Top opposition research opportunities</h3>
            <BulletList items={brain.oppositionResearchNextActions} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-violet-950">Top debate prep gaps</h3>
            <BulletList items={brain.debatePrepNextActions} />
          </div>
        </div>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-950">Top media review priorities</h3>
            <BulletList items={brain.mediaMonitoringPriorities} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-950">Public meeting watchlist gaps</h3>
            <BulletList items={brain.publicMeetingWatchlistGaps.length > 0 ? brain.publicMeetingWatchlistGaps : ["No watchlist gaps flagged."]} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-violet-950">Writing opportunities (internal only)</h3>
          <BulletList items={brain.writingOpportunitiesExtended.slice(0, 4)} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence/ai-tools" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            AI tools dashboard
          </Link>
          <Link href="/admin/intelligence/kim-hammer/ai-opposition-copilot" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Opposition copilot
          </Link>
          <Link href="/admin/intelligence/kim-hammer/debate-ai-workbench" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Debate AI workbench
          </Link>
          <Link href="/admin/intelligence/briefing-papers" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Briefing papers
          </Link>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-purple-200/50 bg-purple-50/40 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-purple-950">NSI-12 · LLM draft queue summary</h2>
        <p className="mt-1 text-xs font-semibold text-purple-900/90">
          DO NOT USE PUBLICLY YET — all drafts require human review before any promotion workflow.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border border-purple-200/50 bg-white p-3 text-xs">
            <p className="font-bold text-purple-950">Pending drafts</p>
            <p className="text-lg font-bold">{brain.llmDraftQueueSummary.pendingCount}</p>
          </div>
          <div className="rounded border border-rose-200/50 bg-white p-3 text-xs">
            <p className="font-bold text-rose-950">High-risk drafts</p>
            <p className="text-lg font-bold">{brain.llmDraftQueueSummary.highRiskCount}</p>
          </div>
          <div className="rounded border border-amber-200/50 bg-white p-3 text-xs">
            <p className="font-bold text-amber-950">Needs citations</p>
            <p className="text-lg font-bold">{brain.llmDraftQueueSummary.needsCitationCount}</p>
          </div>
          <div className="rounded border border-violet-200/50 bg-white p-3 text-xs">
            <p className="font-bold text-violet-950">Hallucination warnings</p>
            <p className="text-lg font-bold">{brain.llmDraftQueueSummary.hallucinationWarningCount}</p>
          </div>
        </div>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-950">Top draft opportunities</h3>
            <BulletList items={brain.llmTopDraftOpportunities.length > 0 ? brain.llmTopDraftOpportunities : ["Run copilot tools to populate queue."]} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-purple-950">Review queue priorities</h3>
            <BulletList items={brain.llmDraftReviewPriorities} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-950">Unsafe draft warnings</h3>
            <BulletList items={brain.llmUnsafeDraftWarnings.length > 0 ? brain.llmUnsafeDraftWarnings : ["None flagged."]} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-purple-950">Drafts by category</h3>
            <BulletList
              items={Object.entries(brain.llmDraftQueueSummary.byCategory).map(([cat, count]) => `${cat}: ${count}`)}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence/llm-review-queue" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            LLM review queue
          </Link>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-teal-200/50 bg-teal-50/40 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-teal-950">NSI-13 · Longitudinal intelligence signals</h2>
        <p className="mt-1 text-xs text-teal-900/80">Historically-aware read-only memory — no autonomous strategy mutation.</p>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-950">Strengthening narratives</h3>
            <BulletList items={brain.memoryStrengtheningNarratives.length > 0 ? brain.memoryStrengtheningNarratives : ["None flagged."]} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-teal-950">Weakening narratives</h3>
            <BulletList items={brain.memoryWeakeningNarratives} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-teal-950">Overused arguments</h3>
            <BulletList items={brain.memoryOverusedArguments.length > 0 ? brain.memoryOverusedArguments : ["None flagged."]} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-950">Stale citations</h3>
            <BulletList items={brain.memoryStaleCitations.length > 0 ? brain.memoryStaleCitations.slice(0, 4) : ["None flagged."]} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-teal-950">County drift warnings</h3>
            <BulletList items={brain.memoryCountyDriftWarnings.slice(0, 4)} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-teal-950">Doctrine drift warnings</h3>
            <BulletList items={brain.memoryDoctrineDriftWarnings.slice(0, 4)} />
          </div>
        </div>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-950">Recurring debate traps</h3>
            <BulletList items={brain.memoryDebateTraps.slice(0, 4)} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-950">Opponent message escalation · media cycles</h3>
            <BulletList items={[...brain.memoryOpponentEscalation.slice(0, 2), ...brain.memoryMediaCycleChanges.slice(0, 2)]} />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence/intelligence-memory" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Intelligence memory dashboard
          </Link>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-violet-200/50 bg-violet-50/40 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-violet-950">NSI-14 · Scenario watchlist</h2>
        <p className="mt-1 text-xs text-violet-900/80">
          Governed scenario modeling — SCENARIO_MODEL · INTERNAL_ONLY · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED.
        </p>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-950">Top 5 risk scenarios</h3>
            <BulletList items={brain.scenarioTopRisks.length > 0 ? brain.scenarioTopRisks : ["None flagged."]} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-violet-950">Debate traps</h3>
            <BulletList items={brain.scenarioDebateTraps.length > 0 ? brain.scenarioDebateTraps.slice(0, 4) : ["None flagged."]} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-violet-950">Registration pathway risks</h3>
            <BulletList items={brain.scenarioRegistrationPathwayRisks.slice(0, 4)} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-950">Top 5 opportunity scenarios</h3>
            <BulletList items={brain.scenarioTopOpportunities.length > 0 ? brain.scenarioTopOpportunities : ["None flagged."]} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-violet-950">County reaction warnings</h3>
            <BulletList items={brain.scenarioCountyReactionWarnings.slice(0, 4)} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-violet-950">Media escalation warnings</h3>
            <BulletList items={brain.scenarioMediaEscalationWarnings.slice(0, 4)} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-violet-950">Evidence blockers</h3>
            <BulletList items={brain.scenarioEvidenceBlockers.length > 0 ? brain.scenarioEvidenceBlockers.slice(0, 4) : ["None flagged."]} />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence/scenario-simulation" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Scenario simulation dashboard
          </Link>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Writing opportunities</h2>
          <BulletList items={brain.writingOpportunities} />
        </div>
        <div className="rounded-xl border border-amber-300/50 bg-amber-50 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-950">What not to say today</h2>
          <BulletList items={brain.whatNotToSayToday} />
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Executive summary</h2>
        <BulletList items={paper.executiveSummary} />
        <h3 className="mt-4 text-xs font-bold uppercase tracking-wider text-kelly-navy">What changed</h3>
        <BulletList items={paper.whatChanged} />
        <h3 className="mt-4 text-xs font-bold uppercase tracking-wider text-kelly-navy">Why it matters</h3>
        <BulletList items={paper.whyItMatters} />
      </section>

      <StrategicBriefingDrilldownPanel paper={paper} />
    </div>
  );
}
