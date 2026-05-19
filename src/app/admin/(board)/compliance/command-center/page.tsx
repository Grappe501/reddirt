import Link from "next/link";
import {
  ComplianceCard,
  ComplianceMetricCard,
  ComplianceNav,
  CompliancePageHeader,
  ComplianceStatusBadge,
  ComplianceWarningPanel,
  StorageModeNotice,
} from "../components";
import {
  ComplianceDoThisNext,
  CompliancePhaseIndicator,
  ComplianceProgressByArea,
  ComplianceRouteCardGrid,
  ComplianceStatusLanguage,
  ComplianceWhatThisMeans,
  type LaunchStatusLabel,
} from "../compliance-ux";
import { buildComplianceExpertBundle } from "@/lib/compliance/ai/expert/build-compliance-expert";
import { buildComplianceUxAudit } from "@/lib/compliance/ai/expert/build-ux-audit";
import { buildApril26ImportStatus } from "@/lib/compliance/imports/april26-import-status";
import { buildBankReconciliationRehearsal } from "@/lib/compliance/imports/bank-reconciliation-rehearsal";
import { buildBankCsvOperatorGuide } from "@/lib/compliance/imports/bank-csv-operator-state";

export const dynamic = "force-dynamic";

function launchLabel(overall: string): LaunchStatusLabel {
  if (overall === "launch_ready") return "launch_ready";
  if (overall === "rehearsal_ready") return "rehearsal_ready";
  return "not_ready";
}

export default async function ComplianceAiCommandCenterPage() {
  const [{ brain, expert, progress, operatorCoach }, april26, rehearsal] = await Promise.all([
    buildComplianceExpertBundle(),
    buildApril26ImportStatus(),
    buildBankReconciliationRehearsal(),
  ]);
  const bankGuide = buildBankCsvOperatorGuide(april26.bankReadiness, {
    unmatchedBank: rehearsal.unmatchedBank.length,
    ambiguous: rehearsal.ambiguous.length,
    highConfidence: rehearsal.highConfidence.length,
  });
  const ux = buildComplianceUxAudit();
  const topAction = expert.top5Now[0];
  const whyNotReady = brain.launchReadiness.checklist.filter((c) => !c.passed && c.requiredForLaunch).map((c) => c.label);
  const launchStatus = launchLabel(expert.launchOverall);
  const filingTone = brain.filing.overall === "green" ? "green" : brain.filing.overall === "yellow" ? "yellow" : "red";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-12 pt-6">
      <CompliancePageHeader
        eyebrow="Mission control"
        title="Compliance command center"
        description="Your home base for campaign compliance. Plain language first — technical detail in expandable sections. No donor names on this page."
        actions={
          <Link href="/admin/compliance/filing-readiness" className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-[#0f2744]">
            Can we file?
          </Link>
        }
      />
      <ComplianceNav />
      <StorageModeNotice />

      <ComplianceStatusLanguage status={launchStatus} score={expert.launchReadinessScore} whyNotReady={whyNotReady} />

      {topAction ? (
        <ComplianceDoThisNext
          title={topAction.title}
          description={topAction.description}
          href={topAction.href ?? "/admin/compliance/april26"}
          actionLabel="Start this step"
          secondaryHref="/admin/compliance/approval/april-2026-compliance-review"
          secondaryLabel="Open April queue"
        />
      ) : null}

      <CompliancePhaseIndicator currentPhase={brain.source.bankCsv === "missing" ? 1 : brain.filing.overall === "red" ? 5 : 8} />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ComplianceMetricCard label="Overall completion" value={`${progress.overallPercentComplete}%`} tone={progress.overallPercentComplete >= 70 ? "yellow" : "red"} />
        <ComplianceMetricCard label="Filing" value={brain.filing.overall} tone={filingTone} />
        <ComplianceMetricCard label="Open queue" value={brain.queue.openItems} tone={brain.queue.openItems ? "yellow" : "green"} />
        <ComplianceMetricCard label="QA score" value={brain.launchReadiness.qaFullScore ?? "—"} tone={brain.launchReadiness.qaFullStatus ?? "neutral"} />
        <ComplianceMetricCard label="Batch eligible" value={brain.queue.batchEligible} tone="neutral" />
        <ComplianceMetricCard label="Rule review" value={brain.queue.ruleReviewItems} tone={brain.queue.ruleReviewItems ? "yellow" : "green"} />
        <ComplianceMetricCard label="Bank CSV" value={brain.source.bankCsv} tone={brain.source.bankCsv === "present" ? "green" : "red"} />
        <ComplianceMetricCard label="Storage" value={brain.storage.mode} tone={brain.storage.ready ? "green" : "yellow"} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ComplianceCard title="Progress by area (lowest first)">
          <ComplianceProgressByArea areas={progress.areas.map((a) => ({ area: a.area, percentComplete: a.percentComplete, status: a.status }))} />
          <p className="mt-3 text-xs text-slate-500">Full matrix: docs/compliance/COMPLIANCE_PROGRESS_MATRIX.md</p>
        </ComplianceCard>
        <ComplianceCard title="AI operator coach">
          <p className="text-sm">{operatorCoach.summary}</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
            {operatorCoach.steps.slice(0, 4).map((s) => (
              <li key={s.step}>
                <span className="font-semibold">{s.title}</span> — {s.why}
                {s.href ? (
                  <>
                    {" "}
                    <Link href={s.href} className="underline">
                      open
                    </Link>
                  </>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-slate-500">Regenerate coaches: npm run compliance:ai-expert</p>
        </ComplianceCard>
      </div>

      <ComplianceWhatThisMeans title="What filing red means">
        <p>
          Filing <strong>red</strong> means the system will not treat the committee as ready to export a filing package. QA scripts can still pass while status stays red — that is intentional honesty.
        </p>
        <p className="mt-2">
          {brain.filing.blockerCount} blocker(s) must meet each green condition on the filing readiness page. Human sign-off is always required; this is not legal certification.
        </p>
      </ComplianceWhatThisMeans>

      <ComplianceCard title={`Bank CSV — ${bankGuide.state.replace(/_/g, " ")}`}>
        <p className="text-sm font-semibold">{bankGuide.headline}</p>
        <p className="mt-1 text-sm text-slate-600">{bankGuide.nextAction}</p>
        <Link href={bankGuide.href} className="mt-2 inline-block text-sm font-bold text-[#0f2744] underline">
          April26 desk
        </Link>
      </ComplianceCard>

      <ComplianceCard title="Top blockers (plain English)">
        <ul className="space-y-3 text-sm">
          {expert.blockerExplanations.slice(0, 6).map((b) => (
            <li key={b.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="font-semibold text-[#0f2744]">{b.plainEnglish}</p>
              <p className="mt-1 text-slate-600">{b.whyItBlocks}</p>
              <p className="mt-1 text-xs text-slate-500">Clear by: {b.howToClear}</p>
            </li>
          ))}
        </ul>
      </ComplianceCard>

      <ComplianceCard title="Launch checklist">
        <ul className="space-y-1 text-sm">
          {brain.launchReadiness.checklist.map((c) => (
            <li key={c.id} className="flex items-center gap-2">
              <ComplianceStatusBadge label={c.passed ? "pass" : "fail"} tone={c.passed ? "green" : "red"} />
              {c.label}
            </li>
          ))}
        </ul>
      </ComplianceCard>

      <ComplianceRouteCardGrid
        cards={[
          { href: "/admin/compliance/april26", title: "April26 desk", description: "Sources + bank rehearsal" },
          { href: "/admin/compliance/approval/april-2026-compliance-review", title: "April queue", description: `${brain.queue.openItems} open items` },
          { href: "/admin/compliance/approval/batch", title: "Batch readiness", description: `${brain.queue.batchEligible} eligible` },
          { href: "/admin/compliance/reconciliation", title: "Reconciliation", description: "Match bank to payouts" },
          { href: "/admin/compliance/rules", title: "Rules", description: `${brain.rules.unverifiedTopicCount} topics to review` },
          { href: "/admin/compliance/filing-readiness", title: "Filing readiness", description: `Status ${brain.filing.overall}` },
        ]}
      />

      <ComplianceWarningPanel title="Never automate" tone="red">
        <ul className="list-disc pl-5 text-sm">
          {expert.mustNotDo.slice(0, 6).map((u) => (
            <li key={u}>{u.replace(/_/g, " ")}</li>
          ))}
        </ul>
      </ComplianceWarningPanel>

      <ComplianceWhatThisMeans title="Technical / AI outputs">
        <p className="font-mono text-xs">
          data/compliance/ai/expert-snapshot.json · completion-progress.json · *-coach.json · ux-audit.json
        </p>
        <p className="mt-2 text-xs">Commit {brain.commitBase} · UX audit routes: {ux.routes.length}</p>
        <p className="mt-1 text-xs">npm run compliance:ai-expert · compliance:ai-brain · compliance:ai-thread-handoff</p>
      </ComplianceWhatThisMeans>
    </div>
  );
}
