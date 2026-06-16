import { TravelLedgerCard, TravelLedgerNav, TravelLedgerPageHeader } from "../components";
import { loadAuditLog, loadLedgerItems } from "@/lib/travel-ledger/storage";

export const dynamic = "force-dynamic";

export default async function TravelLedgerAuditPage() {
  const [items, auditLog] = await Promise.all([loadLedgerItems(), loadAuditLog()]);
  const exceptions = items.filter((item) => item.auditIssues.length || item.reviewStatus === "needs_more_info" || item.reviewStatus === "needs_location");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <TravelLedgerPageHeader
        eyebrow="Audit packet"
        title="Campaign mileage reimbursement support file"
        description="Campaign Manager staff view with reimbursement totals, exceptions, review notes, and audit trail entries."
      />
      <TravelLedgerNav />
      <section className="grid gap-4 md:grid-cols-3">
        <TravelLedgerCard eyebrow="Ledger items" title={String(items.length)}>Total reimbursement records in the fallback ledger.</TravelLedgerCard>
        <TravelLedgerCard eyebrow="Exceptions" title={String(exceptions.length)}>Items with missing city, more-info status, or audit issues.</TravelLedgerCard>
        <TravelLedgerCard eyebrow="Audit log" title={String(auditLog.length)}>Recorded wizard/manual actions.</TravelLedgerCard>
      </section>
      <TravelLedgerCard eyebrow="Recent actions" title="Audit trail">
        <div className="grid gap-3">
          {auditLog.slice(0, 25).map((entry) => (
            <article key={entry.id} className="rounded-lg border border-kelly-text/10 bg-kelly-wash px-3 py-2">
              <p className="font-semibold text-kelly-text">{entry.action.replaceAll("_", " ")}</p>
              <p>{entry.createdAt} by {entry.actor}</p>
              {entry.note ? <p>{entry.note}</p> : null}
            </article>
          ))}
          {!auditLog.length ? <p>No audit entries yet. Start the wizard or add a manual trip.</p> : null}
        </div>
      </TravelLedgerCard>
    </div>
  );
}
