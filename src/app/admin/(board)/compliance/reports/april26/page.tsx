import Link from "next/link";
import { ComplianceCard, ComplianceNav, CompliancePageHeader, ComplianceWarningPanel } from "../../components";
import { loadApril26Dashboard } from "@/lib/compliance/april26/load-april26-dashboard";
import { buildFilingReadinessReport } from "@/lib/compliance/filing-readiness/build-filing-readiness-report";

export const dynamic = "force-dynamic";

export default async function April26ReportsPage() {
  const [data, filing] = await Promise.all([loadApril26Dashboard(), buildFilingReadinessReport()]);
  const summary = data.summary;

  const reports = [
    { title: "April26 ingest summary", body: summary ? `GoodChange ${summary.goodChangeRows} rows · ${summary.contributionsStaged} contributions · ${summary.expensesStaged} expenses · ${summary.aiChunkCount} AI chunks.` : "Run ingest first." },
    { title: "GoodChange payout expectation report", body: `${data.payoutBatches.length} payout batch(es). Net deposits await bank match until CSV present.` },
    { title: "Contribution review report", body: `${data.aprilMovements.contributions} staged contribution movement(s). Review in Lightning Approval Workbench.` },
    { title: "Expenditure review report", body: `${data.aprilMovements.expenses} staged expense movement(s). Receipt required flags from Ethics workbook.` },
    { title: "Receipt OCR report", body: `${summary?.receiptImageCount ?? data.inventory.receiptImageCount} receipt image(s). Vision ${summary?.visionEnabled ? "ran" : "skipped or pending"}.` },
    { title: "Check image OCR report", body: `${summary?.checkImageCount ?? data.inventory.checkImageCount} check image(s).` },
    { title: "In-kind report", body: `${summary?.inKindImageCount ?? data.inventory.inKindImageCount} in-kind attachment(s).` },
    { title: "Bank CSV missing report", body: data.bankCsvPresent ? "Bank CSV present." : `Missing: ${data.bankCsvPath}` },
    { title: "Reconciliation candidate report", body: `${data.reconciliationCandidates.length} candidate link(s) (all require human approval).` },
    { title: "Approval readiness report", body: `${data.approval.stats.remaining} item(s) remaining in April 2026 queue.` },
    { title: "Filing readiness impact report", body: `Overall filing status: ${filing.overallStatus}. ${filing.blockers.length} blocker(s) on filing readiness dashboard.` },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-6">
      <CompliancePageHeader
        eyebrow="Reports"
        title="April 2026 compliance reports"
        description="Operational reports for April26 ingest. No PII is stored in committed repo files; counts come from local ingest artifacts."
        actions={
          <Link href="/admin/compliance/april26" className="rounded-full bg-[#0f2744] px-4 py-2 text-sm font-bold text-white">
            April26 dashboard
          </Link>
        }
      />
      <ComplianceNav />
      {!data.bankCsvPresent ? (
        <ComplianceWarningPanel title="Bank CSV missing report" tone="red">
          Reconciliation cannot complete until bank-april-2026.csv is added to the April26 folder and ingest is re-run.
        </ComplianceWarningPanel>
      ) : null}
      <section className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <ComplianceCard key={report.title} title={report.title}>
            {report.body}
          </ComplianceCard>
        ))}
      </section>
    </div>
  );
}
