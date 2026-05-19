import { ComplianceCard, ComplianceNav, CompliancePageHeader } from "../components";
import { loadStagedMoneyMovements } from "@/lib/compliance/money/money-movement-storage";

export const dynamic = "force-dynamic";

export default async function ChecksPage() {
  const checks = (await loadStagedMoneyMovements()).filter((movement) => movement.category === "contribution_check");
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Checks"
        title="Check Contribution Intake"
        description="Stage check contributions for donor completeness, duplicate risk, deposit batching, and bank reconciliation."
      />
      <ComplianceNav />
      <section className="grid gap-4 md:grid-cols-3">
        <ComplianceCard title="New Check Contribution" href="/admin/compliance/checks/new">Enter contributor, check, donor, and deposit details.</ComplianceCard>
        <ComplianceCard title="SOS copy board (April checks)" href="/admin/compliance/checks/sos-entry">
          Extract check fields and copy one-by-one into Arkansas SOS individual entry.
        </ComplianceCard>
        <ComplianceCard title="Review Checks" href="/admin/compliance/checks/review">{checks.length} staged check contribution(s).</ComplianceCard>
        <ComplianceCard title="Bank Reconciliation" href="/admin/compliance/reconciliation">Match check deposits to bank CSV credits later.</ComplianceCard>
      </section>
    </div>
  );
}
