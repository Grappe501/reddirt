import {
  ComplianceCard,
  ComplianceMetricCard,
  ComplianceNav,
  CompliancePageHeader,
  ComplianceStatusBadge,
  ComplianceWarningPanel,
  StorageModeNotice,
} from "../components";
import { buildFilingReadinessReport } from "@/lib/compliance/filing-readiness/build-filing-readiness-report";
import { evaluateFilingHardGates } from "@/lib/compliance/filing-readiness/hard-gates";
import { gradeFilingReadiness } from "@/lib/compliance/filing-readiness/filing-readiness-grade";

export const dynamic = "force-dynamic";

export default async function FilingReadinessPage() {
  const [report, hardGates] = await Promise.all([buildFilingReadinessReport(), evaluateFilingHardGates()]);
  const grade = gradeFilingReadiness(hardGates);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-6">
      <CompliancePageHeader
        eyebrow="Filing readiness"
        title="Are we ready to file?"
        description="A red/yellow/green staging report for staff review. This is not legal certification and always requires human approval."
      />
      <ComplianceNav />
      <ComplianceCard eyebrow="Approval" title="Lightning Approval Workbench" href="/admin/compliance/approval">
        Review AI-prepared compliance records one at a time, verify evidence, approve, reject, or request more information.
      </ComplianceCard>
      <StorageModeNotice />
      <section className="grid gap-4 md:grid-cols-3">
        <ComplianceMetricCard label="Overall" value={report.overallStatus} tone={report.overallStatus} />
        <ComplianceMetricCard label="Hard gates" value={`${grade.passedGates}/${grade.totalGates}`} tone={grade.status} />
        <ComplianceMetricCard label="Blockers" value={report.blockers.length} tone={report.blockers.length ? "red" : "green"} />
      </section>
      {report.blockers.length ? (
        <ComplianceWarningPanel title="Filing blocked" tone="red">
          <ul className="mt-2 list-disc pl-5">
            {report.blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        </ComplianceWarningPanel>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <ComplianceStatusBadge label="Human review required" tone="yellow" />
        {!report.ruleCoverage.complete ? <ComplianceStatusBadge label="Rule gaps" tone="red" /> : <ComplianceStatusBadge label="Rules complete" tone="green" />}
      </div>
      <ComplianceCard title={`${grade.label}`}>
        <p>Human review required: {report.humanReviewRequired ? "yes" : "no"}</p>
        <p>Rule coverage complete: {report.ruleCoverage.complete ? "yes" : "no"}</p>
        <p>Hard gate score: {grade.score}/100 — {grade.label}</p>
        <p>{report.overallStatus === "green" && grade.status === "green" ? "System checks passed — ready for compliance officer review (not legal certification)." : "Resolve blocked gates or enter authorized overrides with initials and reason before export."}</p>
      </ComplianceCard>
      <section className="grid gap-4 md:grid-cols-2">
        {hardGates.map((gate) => (
          <ComplianceCard key={gate.id} title={gate.label}>
            <p>Status: <strong>{gate.status}</strong>{gate.blocking ? " (blocking)" : ""}</p>
            <p>{gate.explanation}</p>
            {gate.overrideInitials ? (
              <p className="mt-2 rounded-lg border border-amber-700/30 bg-amber-50 p-2 text-amber-950">
                Override by {gate.overrideInitials}: {gate.overrideReason}
              </p>
            ) : null}
          </ComplianceCard>
        ))}
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {report.sections.map((section) => (
          <ComplianceCard key={section.id} title={section.label}>
            <p>Status: <strong>{section.status}</strong></p>
            <p>{section.summary}</p>
            {typeof section.count === "number" ? <p>Count: {section.count}</p> : null}
            {typeof section.amount === "number" ? <p>Amount: ${section.amount.toFixed(2)}</p> : null}
            {section.nextAction ? <p className="mt-2">Next: {section.nextAction}</p> : null}
          </ComplianceCard>
        ))}
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <ComplianceCard title="Blockers">
          {report.blockers.length ? report.blockers.map((blocker) => <p key={blocker}>{blocker}</p>) : "None"}
        </ComplianceCard>
        <ComplianceCard title="Warnings">
          {report.warnings.length ? report.warnings.map((warning) => <p key={warning}>{warning}</p>) : "None"}
        </ComplianceCard>
      </section>
    </div>
  );
}
