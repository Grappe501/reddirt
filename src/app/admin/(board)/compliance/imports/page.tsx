import { ComplianceCard, ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../components";

export default function ComplianceImportsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Compliance imports"
        title="Import staging"
        description="Choose a source to analyze. Pass 1 detects and stages data only; it does not create final contribution, expenditure, or reconciliation records."
      />
      <ComplianceNav />
      <StorageModeNotice />
      <section className="grid gap-4 md:grid-cols-2">
        <ComplianceCard title="GoodChange CSV" href="/admin/compliance/imports/goodchange">
          Analyze fundraising exports for donor identity, amount, fee, net, refund, recurring, and missing compliance fields.
        </ComplianceCard>
        <ComplianceCard title="Bank CSV" href="/admin/compliance/imports/bank">
          Analyze monthly bank exports for dates, memo text, debit/credit columns, balance, check numbers, deposits, fees, and transfers.
        </ComplianceCard>
      </section>
    </div>
  );
}
