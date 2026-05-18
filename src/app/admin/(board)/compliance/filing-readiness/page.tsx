import { ComplianceCard, ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../components";
import { buildFilingReadinessReport } from "@/lib/compliance/filing-readiness/build-filing-readiness-report";
import { evaluateFilingHardGates } from "@/lib/compliance/filing-readiness/hard-gates";
import { gradeFilingReadiness } from "@/lib/compliance/filing-readiness/filing-readiness-grade";

export const dynamic = "force-dynamic";

export default async function FilingReadinessPage() {
  const [report, hardGates] = await Promise.all([buildFilingReadinessReport(), evaluateFilingHardGates()]);
  const grade = gradeFilingReadiness(hardGates);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Filing readiness"
        title="Are we ready to file?"
        description="A red/yellow/green staging report for staff review. This is not legal certification and always requires human approval."
      />
      <ComplianceNav />
      <StorageModeNotice />
      <ComplianceCard title={`Overall status: ${report.overallStatus} · Hard gates: ${grade.status}`}>
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
