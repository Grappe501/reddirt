import { ComplianceCard, ComplianceNav, CompliancePageHeader } from "../../components";

export default function MobileReceiptPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-2">
      <CompliancePageHeader eyebrow="Mobile receipt" title="Snap Receipt" description="Use the receipt wizard camera upload, then complete human review before staging." />
      <ComplianceNav />
      <ComplianceCard title="Open Receipt Wizard" href="/admin/compliance/receipts/new">
        Camera upload, manual fallback, tip question, payment method, and business purpose capture.
      </ComplianceCard>
      <ComplianceCard title="What happens next">
        Staff verifies the extraction, candidate/treasurer approval is recorded, and the expense waits for bank reconciliation.
      </ComplianceCard>
    </div>
  );
}
