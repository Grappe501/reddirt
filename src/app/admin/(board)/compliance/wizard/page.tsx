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
  ["Can we file?", "/admin/compliance/filing-readiness", "Check red/yellow/green readiness, rule gaps, bank blockers, and human approval status."],
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
      <section className="rounded-2xl border border-amber-700/20 bg-amber-50 p-4 font-body text-sm text-amber-950">
        Start with the record type in front of you. Every path saves a staged record first; approval, reconciliation, and filing certification stay human actions.
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {options.map(([title, href, description]) => (
          <ComplianceCard key={href} title={title} href={href}>{description}</ComplianceCard>
        ))}
      </section>
    </div>
  );
}
