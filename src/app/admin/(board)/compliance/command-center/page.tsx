import Link from "next/link";
import {
  ComplianceActionButton,
  ComplianceCard,
  ComplianceMetricCard,
  ComplianceNav,
  CompliancePageHeader,
  ComplianceStatusBadge,
  ComplianceWarningPanel,
  StorageModeNotice,
} from "../components";
import { buildComplianceBrainSnapshot, buildComplianceNextActions, buildComplianceRiskReport } from "@/lib/compliance/ai/brain/build-compliance-brain";

export const dynamic = "force-dynamic";

export default async function ComplianceAiCommandCenterPage() {
  const snapshot = await buildComplianceBrainSnapshot();
  const nextActions = buildComplianceNextActions(snapshot);
  const risks = buildComplianceRiskReport(snapshot).filter((r) => r.severity === "critical" || r.severity === "high").slice(0, 6);
  const launchTone =
    snapshot.launchReadiness.overall === "launch_ready" ? "green" : snapshot.launchReadiness.overall === "rehearsal_ready" ? "yellow" : "red";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-12 pt-6">
      <CompliancePageHeader
        eyebrow="AI operating brain"
        title="Compliance command center"
        description="Source-backed launch status, risks, and next actions. No donor names or private task data on this page. Regenerate: npm run compliance:ai-brain"
        actions={
          <ComplianceActionButton href="/admin/compliance/filing-readiness" label="Can we file?" />
        }
      />
      <ComplianceNav />
      <StorageModeNotice />
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ComplianceMetricCard label="Launch readiness" value={`${snapshot.launchReadiness.launchReadinessScore}%`} tone={launchTone} />
        <ComplianceMetricCard label="Filing" value={snapshot.filing.overall} tone={snapshot.filing.overall === "green" ? "green" : snapshot.filing.overall === "yellow" ? "yellow" : "red"} />
        <ComplianceMetricCard label="Open queue" value={snapshot.queue.openItems} tone={snapshot.queue.openItems ? "yellow" : "green"} />
        <ComplianceMetricCard label="Batch eligible" value={snapshot.queue.batchEligible} tone={snapshot.queue.batchEligible ? "green" : "neutral"} />
        <ComplianceMetricCard label="Rule review items" value={snapshot.queue.ruleReviewItems} tone={snapshot.queue.ruleReviewItems ? "yellow" : "green"} />
        <ComplianceMetricCard label="Filing blockers" value={snapshot.filing.blockerCount} tone={snapshot.filing.blockerCount ? "red" : "green"} />
        <ComplianceMetricCard label="Bank CSV" value={snapshot.source.bankCsv} tone={snapshot.source.bankCsv === "present" ? "green" : "red"} />
        <ComplianceMetricCard label="Storage" value={snapshot.storage.mode} tone={snapshot.storage.ready ? "green" : "yellow"} />
      </section>
      <ComplianceWarningPanel title="Next human action" tone="amber">
        <p className="text-sm">{snapshot.recommendedNextHumanAction}</p>
        <p className="mt-2 text-xs text-slate-600">AI: {snapshot.recommendedNextAiAction}</p>
      </ComplianceWarningPanel>
      <section className="flex flex-wrap gap-2">
        <ComplianceStatusBadge label={`Commit ${snapshot.commitBase}`} tone="neutral" />
        <ComplianceStatusBadge label={`DB ${snapshot.dbMigration.migrated ? "migrated" : "json"}`} tone="neutral" />
        <ComplianceStatusBadge label={`Rules ${snapshot.rules.unverifiedTopicCount} unverified`} tone={snapshot.rules.unverifiedTopicCount ? "yellow" : "green"} />
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <ComplianceCard title="Top next actions">
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            {nextActions.slice(0, 8).map((a) => (
              <li key={a.id}>
                <span className="font-semibold">{a.title}</span> — {a.owner}
                {a.href ? (
                  <>
                    {" "}
                    <Link href={a.href} className="text-[#0f2744] underline">
                      open
                    </Link>
                  </>
                ) : null}
              </li>
            ))}
          </ol>
        </ComplianceCard>
        <ComplianceCard title="Top risks">
          <ul className="list-disc space-y-2 pl-5 text-sm">
            {risks.map((r) => (
              <li key={r.id}>
                <span className="font-mono text-xs uppercase">{r.severity}</span> {r.title}
              </li>
            ))}
          </ul>
        </ComplianceCard>
      </div>
      <ComplianceCard title="Source status (April26)">
        <ul className="grid gap-1 text-sm sm:grid-cols-2">
          <li>Folder: {snapshot.source.april26FolderExists ? "yes" : "no"}</li>
          <li>GoodChange: {snapshot.source.goodChangeCsv}</li>
          <li>Bank: {snapshot.source.bankCsv}</li>
          <li>Receipts: {snapshot.source.receiptImages}</li>
          <li>Checks: {snapshot.source.checkImages}</li>
          <li>Recon blockers: {snapshot.source.reconciliationBlockers}</li>
        </ul>
        <ComplianceActionButton href="/admin/compliance/april26" label="April26 desk" variant="secondary" />
      </ComplianceCard>
      <ComplianceCard title="Filing blockers (summary)">
        <ul className="space-y-2 text-sm">
          {snapshot.filing.blockers.slice(0, 8).map((b) => (
            <li key={b.id}>
              <Link href={b.href} className="font-semibold text-[#0f2744] underline">
                {b.label}
              </Link>{" "}
              — {b.severity} · {b.greenCondition}
            </li>
          ))}
        </ul>
      </ComplianceCard>
      <ComplianceCard title="Key pages">
        <div className="flex flex-wrap gap-2">
          {[
            ["/admin/compliance/approval", "Approval"],
            ["/admin/compliance/approval/april-2026-compliance-review", "April queue"],
            ["/admin/compliance/approval/batch", "Batch readiness"],
            ["/admin/compliance/reconciliation", "Reconciliation"],
            ["/admin/compliance/rules", "Rules"],
            ["/admin/compliance/settings#storage-setup", "Storage"],
            ["/admin/compliance/tasks", "Tasks"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold hover:bg-slate-50">
              {label}
            </Link>
          ))}
        </div>
      </ComplianceCard>
      <ComplianceCard title="AI brain outputs (local, gitignored JSON)">
        <p className="text-sm text-slate-600">
          <code>data/compliance/ai/brain-snapshot.json</code> · <code>next-actions.json</code> · <code>risk-report.json</code> ·{" "}
          <code>launch-readiness.json</code>
        </p>
        <p className="mt-2 text-sm">
          Brief: <code>docs/compliance/COMPLIANCE_AI_BRAIN_BRIEF.md</code> · State:{" "}
          <code>docs/compliance/COMPLIANCE_STATE_OF_BUILD.md</code>
        </p>
      </ComplianceCard>
      <ComplianceWarningPanel title="Unsafe — never automate" tone="red">
        <ul className="mt-2 list-disc pl-5 text-sm">
          {snapshot.unsafeActions.map((u) => (
            <li key={u}>{u.replace(/_/g, " ")}</li>
          ))}
        </ul>
      </ComplianceWarningPanel>
    </div>
  );
}
