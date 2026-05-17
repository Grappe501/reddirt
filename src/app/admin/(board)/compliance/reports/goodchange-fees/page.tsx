import { ComplianceCard, ComplianceNav, CompliancePageHeader } from "../../components";
import { loadGoodChangeAnalyses } from "@/lib/compliance/storage";

export const dynamic = "force-dynamic";

export default async function GoodChangeFeesReportPage() {
  const analyses = await loadGoodChangeAnalyses();
  const contributions = analyses.flatMap((analysis) => analysis.stagedContributions);
  const withFees = contributions.filter((item) => (item.feeAmount ?? 0) > 0);
  const missingFeeColumns = analyses.filter((analysis) => !analysis.batch.detectedColumns.some((column) => column.toLowerCase().includes("fee")));
  const totalGross = contributions.reduce((total, item) => total + (item.grossAmount ?? item.amount ?? 0), 0);
  const totalFees = contributions.reduce((total, item) => total + (item.feeAmount ?? 0), 0);
  const totalNet = contributions.reduce((total, item) => total + (item.netAmount ?? item.amount ?? 0), 0);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="GoodChange fees"
        title="Processor Fee Extraction Report"
        description="Shows whether GoodChange imports expose gross, net, fee, refund, chargeback, and deposit matching fields."
      />
      <ComplianceNav />
      <section className="grid gap-4 md:grid-cols-4">
        <ComplianceCard title="Rows with fees">{withFees.length} contribution(s)</ComplianceCard>
        <ComplianceCard title="Gross total">${totalGross.toFixed(2)}</ComplianceCard>
        <ComplianceCard title="Fee total">${totalFees.toFixed(2)}</ComplianceCard>
        <ComplianceCard title="Net total">${totalNet.toFixed(2)}</ComplianceCard>
      </section>
      <ComplianceCard title="AI review prompts">
        Missing fee columns: {missingFeeColumns.length} batch(es). Review gross/net/fee mapping, chargeback/refund rows, and bank deposit mismatches before ledger conversion.
      </ComplianceCard>
    </div>
  );
}
