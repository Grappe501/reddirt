import { ComplianceCard, ComplianceNav, CompliancePageHeader } from "../../components";
import { loadStagedMoneyMovements } from "@/lib/compliance/money/money-movement-storage";

export const dynamic = "force-dynamic";

export default async function CheckReviewPage() {
  const checks = (await loadStagedMoneyMovements()).filter((movement) => movement.category === "contribution_check");
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Check review"
        title="Staged Check Contributions"
        description="Review donor fields, check number, deposit status, and bank match readiness before ledger conversion."
      />
      <ComplianceNav />
      <section className="grid gap-4 md:grid-cols-3">
        <ComplianceCard title="Needs review">{checks.filter((item) => item.reviewStatus === "needs_review").length} item(s)</ComplianceCard>
        <ComplianceCard title="Missing donor info">{checks.filter((item) => item.documentationStatus === "missing_donor_info").length} item(s)</ComplianceCard>
        <ComplianceCard title="Pending deposit match">{checks.filter((item) => !item.bankTransactionId).length} item(s)</ComplianceCard>
      </section>
      <section className="grid gap-3">
        {checks.map((item) => (
          <article key={item.id} className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4 font-body text-sm text-kelly-text/75">
            <p className="font-semibold text-kelly-text">{item.name ?? "Unnamed contributor"} · ${item.amount.toFixed(2)} · check {item.checkNumber ?? "missing"}</p>
            <p className="mt-1">{item.warnings.join(" ") || "Ready for review."}</p>
          </article>
        ))}
        {!checks.length ? <p className="font-body text-sm text-kelly-muted">No staged check contributions yet.</p> : null}
      </section>
    </div>
  );
}
