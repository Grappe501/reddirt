import { ComplianceCard, ComplianceNav, CompliancePageHeader } from "../components";

const options = [
  ["Contribution", "/admin/compliance/money", "Use money movement review or choose cash/check/GoodChange below."],
  ["Receipt/expense", "/admin/compliance/receipts/new", "Upload a receipt, verify tip/payment/purpose, and stage an expense."],
  ["Cash contribution", "/admin/compliance/cash/new", "Capture cash amount, donor slip, ID check status, and review flags."],
  ["Check contribution", "/admin/compliance/checks/new", "Stage check donor details, check number, received date, and deposit status."],
  ["Vendor/staff payment", "/admin/compliance/expenses/new", "Stage staff/vendor payments, W-9 warnings, purpose, and receipt requirements."],
  ["Bank CSV", "/admin/compliance/imports/bank", "Analyze monthly bank CSVs for deposits, debits, fees, transfers, and check numbers."],
  ["GoodChange CSV", "/admin/compliance/imports/goodchange", "Analyze contribution exports and stage credit-card contributions/processor fees."],
  ["Not sure", "/admin/compliance/documentation", "Review missing documentation and choose the next guided flow."],
] as const;

export default function ComplianceWizardPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Wizard"
        title="Start Compliance Wizard"
        description="Pick what you are entering. The system will route you to a guided flow and keep legal approval, filing certification, and reconciliation as human actions."
      />
      <ComplianceNav />
      <section className="grid gap-4 md:grid-cols-2">
        {options.map(([title, href, description]) => (
          <ComplianceCard key={href} title={title} href={href}>{description}</ComplianceCard>
        ))}
      </section>
    </div>
  );
}
