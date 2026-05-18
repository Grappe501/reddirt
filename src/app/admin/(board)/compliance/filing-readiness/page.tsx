import { ComplianceCard, ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../components";
import { buildFilingReadinessReport } from "@/lib/compliance/filing-readiness/build-filing-readiness-report";

export const dynamic = "force-dynamic";

export default async function FilingReadinessPage() {
  const report = await buildFilingReadinessReport();
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Filing readiness"
        title="Are we ready to file?"
        description="A red/yellow/green staging report for staff review. This is not legal certification and always requires human approval."
      />
      <ComplianceNav />
      <StorageModeNotice />
      <ComplianceCard title={`Overall status: ${report.overallStatus}`}>
        <p>Human review required: {report.humanReviewRequired ? "yes" : "no"}</p>
        <p>Rule coverage complete: {report.ruleCoverage.complete ? "yes" : "no"}</p>
        <p>{report.overallStatus === "green" ? "All categories are green, but final filing still requires human review." : "Do not file from this dashboard until red/yellow items are resolved or explicitly overridden by the responsible compliance officer."}</p>
      </ComplianceCard>
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
