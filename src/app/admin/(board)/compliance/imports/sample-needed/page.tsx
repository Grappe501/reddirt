import { ComplianceCard, ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../../components";
import { loadBankAnalyses, loadGoodChangeAnalyses } from "@/lib/compliance/storage";

export const dynamic = "force-dynamic";

const checklist = [
  "GoodChange export CSV (full column set)",
  "Bank statement CSV (debit/credit/memo conventions)",
  "Five sanitized sample rows from each (no real PII in repo)",
  "Payout/deposit IDs and processor fee/gross/net behavior",
  "Refund and recurring field examples",
  "Bank memo, debit, credit, and balance column mapping",
];

export default async function ComplianceSampleNeededPage() {
  const [goodChange, bank] = await Promise.all([loadGoodChangeAnalyses(), loadBankAnalyses()]);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Imports"
        title="Sample data needed"
        description="Real GoodChange and bank CSV samples unlock reconciliation tuning. Do not commit live donor or account data."
      />
      <ComplianceNav />
      <StorageModeNotice />
      <ComplianceCard title="Status">
        <p>GoodChange analyzed batches: {goodChange.length}</p>
        <p>Bank analyzed batches: {bank.length}</p>
        <p className="mt-2 font-semibold text-amber-900">Until real samples are uploaded, match confidence and fee behavior remain provisional.</p>
      </ComplianceCard>
      <ComplianceCard title="Checklist">
        <ul className="list-disc pl-5">
          {checklist.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </ComplianceCard>
    </div>
  );
}
