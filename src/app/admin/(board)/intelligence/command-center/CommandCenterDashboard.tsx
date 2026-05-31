"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { IntelligenceCommandCenterSnapshot } from "@/lib/intelligence/commandCenter/types";
import { COMMAND_CENTER_ROLES } from "@/lib/intelligence/commandCenter/types";
import { filterActionsForRole } from "@/lib/intelligence/commandCenter/filterActionsForRole";
function ReadinessBar({ label, score, href }: { label: string; score: number; href?: string }) {
  const tone = score >= 75 ? "bg-emerald-600" : score >= 50 ? "bg-amber-500" : "bg-rose-600";
  const inner = (
    <div className="rounded-lg border border-kelly-text/10 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">{label}</p>
        <span className="font-heading text-lg font-bold text-kelly-navy">{score}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-kelly-text/10">
        <div className={`h-2 rounded-full ${tone}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block transition hover:border-kelly-navy/30">
        {inner}
      </Link>
    );
  }
  return inner;
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "risk" | "warn" | "ok" }) {
  const cls =
    tone === "risk"
      ? "border-rose-300 bg-rose-50 text-rose-950"
      : tone === "warn"
        ? "border-amber-300 bg-amber-50 text-amber-950"
        : tone === "ok"
          ? "border-emerald-300 bg-emerald-50 text-emerald-950"
          : "border-kelly-text/15 bg-kelly-page text-kelly-muted";
  return (
    <span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}>
      {children}
    </span>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-xs text-kelly-subtle">None flagged.</p>;
  return (
    <ul className="list-inside list-disc space-y-1 text-xs text-kelly-muted">
      {items.map((item) => (
        <li key={item.slice(0, 80)}>{item}</li>
      ))}
    </ul>
  );
}

export function CommandCenterDashboard({ snapshot }: { snapshot: IntelligenceCommandCenterSnapshot }) {
  const [role, setRole] = useState<(typeof COMMAND_CENTER_ROLES)[number]>("All");
  const filteredActions = useMemo(
    () => filterActionsForRole(snapshot.actionQueueTop, role),
    [snapshot.actionQueueTop, role],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl border-2 border-kelly-navy/25 bg-kelly-navy/5 p-4">
        <div className="flex flex-wrap gap-2">
          {snapshot.governanceBanner.map((label) => (
            <Badge key={label} tone="warn">
              {label}
            </Badge>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-kelly-muted">
          Recommendation only. Human action required. This page composes existing NSI systems — it does not execute
          workflows, publish content, or mutate claims.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Today&apos;s intelligence snapshot</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {snapshot.readinessCards.map((card) => (
            <ReadinessBar key={card.id} label={card.label} score={card.score} href={card.href} />
          ))}
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="rounded-lg border border-kelly-text/10 bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Highest risk</p>
            <p className="mt-1 text-sm font-semibold text-kelly-text">{snapshot.scenarioWatch.topRiskTitle}</p>
            <p className="mt-1 text-xs text-kelly-muted">{snapshot.scenarioWatch.topRiskSignal}</p>
          </div>
          <div className="rounded-lg border border-kelly-text/10 bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Human review backlog</p>
            <p className="mt-1 font-heading text-2xl font-bold text-kelly-navy">
              {snapshot.reviewBacklog.llmDraftPending + snapshot.reviewBacklog.humanActionRecommended}
            </p>
            <p className="text-xs text-kelly-muted">LLM drafts + recommended actions (not yet accepted)</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">What changed</h2>
          <p className="mt-1 text-[10px] text-kelly-subtle">Live signals — not a persisted historical diff (NSI-17).</p>
          <ul className="mt-3 space-y-2 text-xs">
            {snapshot.changeSignals.map((signal) => (
              <li key={`${signal.label}-${signal.detail.slice(0, 40)}`} className="rounded border border-kelly-text/5 p-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-kelly-text">{signal.label}</span>
                  {signal.isSnapshot ? <Badge>Snapshot</Badge> : <Badge tone="ok">Audit event</Badge>}
                </div>
                <p className="mt-1 text-kelly-muted">{signal.detail}</p>
                <p className="mt-1 text-[10px] text-kelly-subtle">{signal.source}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-amber-200/60 bg-amber-50/40 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-950">Human review queue</h2>
          <p className="mt-1 text-xs text-amber-900/80">Human review required on every item below.</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="font-bold text-amber-950">LLM drafts pending</dt>
              <dd className="text-2xl font-bold">{snapshot.reviewBacklog.llmDraftPending}</dd>
            </div>
            <div>
              <dt className="font-bold text-amber-950">Actions recommended</dt>
              <dd className="text-2xl font-bold">{snapshot.reviewBacklog.humanActionRecommended}</dd>
            </div>
            <div>
              <dt className="font-bold text-amber-950">Citation warnings</dt>
              <dd className="text-2xl font-bold">{snapshot.reviewBacklog.citationWarnings}</dd>
            </div>
            <div>
              <dt className="font-bold text-amber-950">Blocked public use</dt>
              <dd className="text-2xl font-bold">{snapshot.reviewBacklog.blockedPublicUse}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs font-semibold text-amber-950">Top priority: {snapshot.reviewBacklog.topReviewItem}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link href={snapshot.sourceLinks.llmReview} className="rounded border px-2 py-1 text-xs font-semibold text-kelly-navy">
              LLM review queue
            </Link>
            <Link href={snapshot.sourceLinks.actionQueue} className="rounded border px-2 py-1 text-xs font-semibold text-kelly-navy">
              Action queue
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-teal-200/50 bg-teal-50/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-teal-950">Action queue (NSI-15)</h2>
          <div className="flex flex-wrap gap-1">
            {COMMAND_CENTER_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  role === r ? "border-teal-800 bg-teal-800 text-white" : "border-teal-300 bg-white text-teal-900"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-1 text-xs text-teal-900/80">Recommendation only — status changes do not execute underlying work.</p>
        <div className="mt-3 grid gap-2">
          {filteredActions.length === 0 ? (
            <p className="text-xs text-teal-900">No actions for this role filter.</p>
          ) : (
            filteredActions.slice(0, 8).map((action) => (
              <div key={action.actionId} className="rounded border border-teal-200/60 bg-white/80 p-2 text-xs">
                <div className="flex flex-wrap gap-2">
                  <Badge tone={action.riskLevel === "CRITICAL" ? "risk" : "warn"}>{action.priority}</Badge>
                  <Badge>{action.recommendedOwnerRole}</Badge>
                  <Badge>{action.status}</Badge>
                </div>
                <p className="mt-1 font-semibold text-kelly-text">{action.title}</p>
                <p className="text-kelly-muted">{action.recommendedNextStep}</p>
              </div>
            ))
          )}
        </div>
        <p className="mt-2 text-[10px]">
          Urgent: {snapshot.actionQueue.urgentCount} · Blocked: {snapshot.actionQueue.blockedCount} · High opportunity:{" "}
          {snapshot.actionQueue.highOpportunityCount}
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Evidence & claims control</h2>
          <p className="mt-2 text-xs text-kelly-muted">{snapshot.evidence.exportReadyUnchangedNote}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="font-bold">Export-ready</dt>
              <dd className="text-xl font-bold text-emerald-700">{snapshot.evidence.exportReadyClaims}</dd>
            </div>
            <div>
              <dt className="font-bold">Review needed</dt>
              <dd className="text-xl font-bold">{snapshot.evidence.reviewNeededClaims}</dd>
            </div>
            <div>
              <dt className="font-bold">Blocked claims</dt>
              <dd className="text-xl font-bold text-rose-700">{snapshot.evidence.blockedClaims}</dd>
            </div>
            <div>
              <dt className="font-bold">Total claims</dt>
              <dd className="text-xl font-bold">{snapshot.evidence.totalClaims}</dd>
            </div>
          </dl>
          <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-kelly-subtle">Citation / claim warnings</h3>
          <BulletList items={snapshot.evidence.citationProblems} />
          <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-kelly-subtle">Public-use blocked</h3>
          <BulletList items={snapshot.evidence.publicUseBlocked} />
          <Link href={snapshot.sourceLinks.evidenceCommand} className="mt-2 inline-block text-xs font-semibold underline">
            Open Evidence Command →
          </Link>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Scenario & forecast watch</h2>
          <p className="mt-1 text-xs text-kelly-muted">
            {snapshot.scenarioWatch.totalScenarios} active scenario models · assumption-based, not election prediction.
          </p>
          <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-kelly-subtle">Assumptions needing calibration</h3>
          <BulletList items={snapshot.scenarioWatch.assumptionCalibration} />
          <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-kelly-subtle">Human review points</h3>
          <BulletList items={snapshot.scenarioWatch.reviewPoints} />
          <Link href={snapshot.scenarioWatch.href} className="mt-2 inline-block text-xs font-semibold underline">
            Open scenario simulation →
          </Link>
        </div>
      </section>

      <section className="rounded-xl border-2 border-kelly-navy/20 bg-gradient-to-br from-kelly-navy/5 to-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">War room strip</h2>
        <p className="mt-1 text-xs text-kelly-muted">Opposition · debate · rapid response — prep only, not publish.</p>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Opponent intelligence</p>
            <p className="mt-1 text-xs">{snapshot.warRoom.opponentStatus}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Debate readiness</p>
            <ReadinessBar label="Debate posture" score={snapshot.warRoom.debateReadinessScore} href={snapshot.warRoom.hrefs.debateCommand} />
            <BulletList items={snapshot.warRoom.debateWeakAreas} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Rapid response</p>
            <ReadinessBar label="Response readiness" score={snapshot.warRoom.rapidResponseReadiness} href={snapshot.warRoom.hrefs.mediaIntake} />
            <BulletList items={snapshot.warRoom.rapidResponseSignals} />
          </div>
        </div>
        <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-rose-800">High-risk language / attack lines (governed)</h3>
        <BulletList items={snapshot.warRoom.attackLineWarnings} />
        <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-kelly-subtle">Required before any response</h3>
        <BulletList items={snapshot.warRoom.approvalBeforeResponse} />
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href={snapshot.warRoom.hrefs.evidenceCommand} className="rounded border px-2 py-1 font-semibold">
            Evidence Command
          </Link>
          <Link href={snapshot.warRoom.hrefs.debatePrep} className="rounded border px-2 py-1 font-semibold">
            Debate prep
          </Link>
          <Link href={snapshot.warRoom.hrefs.mediaIntake} className="rounded border px-2 py-1 font-semibold">
            Media intake
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Campaign leadership focus</h2>
          <BulletList items={snapshot.leadershipFocus} />
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Kelly / candidate prep focus</h2>
          <BulletList items={snapshot.kellyFocus} />
        </div>
      </section>

      <section className="rounded-xl border border-violet-200/60 bg-violet-50/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-violet-950">Institutional memory (NSI-17)</h2>
          <Link href={snapshot.institutionalMemory.href} className="rounded border border-violet-800/30 bg-white px-2 py-1 text-xs font-bold text-violet-900">
            Campaign Memory →
          </Link>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <ReadinessBar label="Memory health" score={snapshot.institutionalMemory.memoryHealthScore} href={snapshot.institutionalMemory.href} />
          <div className="rounded-lg border border-violet-200/50 bg-white p-3 text-xs text-violet-950">
            <p className="font-bold uppercase tracking-wider text-[10px]">Weekly reflection</p>
            <p className="mt-1">
              {snapshot.institutionalMemory.weeklyReflectionStatus.lastWeekLabel
                ? `Last: ${snapshot.institutionalMemory.weeklyReflectionStatus.lastWeekLabel}`
                : "No reflection saved yet"}
              {snapshot.institutionalMemory.weeklyReflectionStatus.daysSinceLastReflection != null
                ? ` · ${snapshot.institutionalMemory.weeklyReflectionStatus.daysSinceLastReflection}d ago`
                : ""}
            </p>
            <p className="mt-1 text-violet-800">{snapshot.institutionalMemory.memoryHealthDetail}</p>
          </div>
        </div>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-900">Recent decisions</h3>
            <BulletList items={snapshot.institutionalMemory.recentDecisionTitles} />
          </div>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-900">Recent lessons</h3>
            <BulletList items={snapshot.institutionalMemory.recentLessonTitles} />
          </div>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-900">Recent recommendations</h3>
            <BulletList items={snapshot.institutionalMemory.recentRecommendationTitles} />
          </div>
        </div>
        <h3 className="mt-3 text-[10px] font-bold uppercase tracking-wider text-violet-900">Emerging patterns</h3>
        <BulletList items={snapshot.institutionalMemory.topPatterns} />
        <h3 className="mt-2 text-[10px] font-bold uppercase tracking-wider text-violet-900">Emerging lessons</h3>
        <BulletList items={snapshot.institutionalMemory.emergingLessons} />
      </section>

      <section className="rounded-xl border-2 border-violet-800/30 bg-violet-50/30 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Weekly intelligence packet</h2>
            {snapshot.weeklyPacket.status === "live" ? (
              <p className="mt-1 text-[10px] text-violet-900">
                {snapshot.weeklyPacket.packetId} · {snapshot.weeklyPacket.generatedAt ? new Date(snapshot.weeklyPacket.generatedAt).toLocaleString() : "—"} ·{" "}
                {snapshot.weeklyPacket.generatedBy}
              </p>
            ) : null}
          </div>
          <Badge tone="warn">INTERNAL_DRAFT · NON_PUBLISHABLE</Badge>
        </div>
        <p className="mt-2 text-xs text-kelly-muted">{snapshot.weeklyPacket.message}</p>
        {snapshot.weeklyPacket.status === "live" ? (
          <>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Source systems used</p>
            <BulletList items={snapshot.weeklyPacket.sourceSystemsUsed ?? []} />
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-900">Top priorities</h3>
                <BulletList items={snapshot.weeklyPacket.topIntelligencePriorities ?? []} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-900">County risks</h3>
                <BulletList items={snapshot.weeklyPacket.countyRisks ?? []} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-900">Debate readiness movement</h3>
                <BulletList items={snapshot.weeklyPacket.debateReadinessMovement ?? []} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-900">Opposition research gaps</h3>
                <BulletList items={snapshot.weeklyPacket.oppositionResearchGaps ?? []} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-900">Recommended human actions</h3>
                <BulletList items={snapshot.weeklyPacket.recommendedHumanActions ?? []} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-rose-800">Unresolved claim risks</h3>
                <BulletList items={snapshot.weeklyPacket.unresolvedClaimRisks ?? []} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">Messaging opportunities (internal)</h3>
                <BulletList items={snapshot.weeklyPacket.messagingOpportunities ?? []} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Not verified / needs human review</h3>
                <BulletList items={snapshot.weeklyPacket.notVerifiedNeedsHumanReview ?? []} />
              </div>
            </div>
            <p className="mt-3 text-[10px] text-kelly-subtle">{snapshot.weeklyPacket.confidenceSummary}</p>
            <h3 className="mt-3 text-[10px] font-bold uppercase tracking-wider text-amber-900">Governance warnings</h3>
            <BulletList items={snapshot.weeklyPacket.governanceWarnings ?? []} />
          </>
        ) : null}
        <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Human-triggered only · does not send or publish</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {snapshot.weeklyPacket.relatedHrefs.map((href) => (
            <Link key={href} href={href} className="rounded border border-kelly-navy/30 bg-white px-3 py-2 text-xs font-semibold text-kelly-navy">
              {href.replace("/admin/intelligence/", "")}
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-kelly-text/10 bg-white p-3 text-[10px] text-kelly-subtle">
        <p>
          Composed at {snapshot.generatedAt} · Brain snapshot {snapshot.brain.generatedAt} · Export-ready claims:{" "}
          {snapshot.evidence.exportReadyClaims} (unchanged by this page).
        </p>
      </section>
    </div>
  );
}
