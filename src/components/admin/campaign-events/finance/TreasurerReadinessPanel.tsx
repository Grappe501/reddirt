import type { CampaignFinanceSnapshot } from "@/lib/campaign-events/finance/load-campaign-finance-snapshot";

export function TreasurerReadinessPanel({ snapshot }: { snapshot: CampaignFinanceSnapshot }) {
  const exportReady = snapshot.pendingApprovals === 0 && snapshot.missingMileage === 0 && snapshot.exceptionCount < 3;
  return (
    <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-slate">Treasurer readiness</p>
      <p className={`mt-2 font-heading text-lg font-bold ${exportReady ? "text-emerald-900" : "text-amber-900"}`}>
        {exportReady ? "Export-ready (operator verify)" : "Gaps remain before export"}
      </p>
      <ul className="mt-3 space-y-1 font-body text-xs text-kelly-text/70">
        <li>Unresolved reimbursements: {snapshot.pendingApprovals} pending travel approval(s)</li>
        <li>Receipt gaps: {snapshot.pendingReceipts} pending document(s)</li>
        <li>Report quality: {snapshot.exceptionCount} exception flag(s)</li>
      </ul>
    </section>
  );
}
