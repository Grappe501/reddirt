import { PrimaryAdminAction, StorageModeBadge, TravelLedgerCard, TravelLedgerNav, TravelLedgerPageHeader } from "../components";
import { getTravelLedgerStorageStatus, buildInvoices } from "@/lib/travel-ledger/storage";

export const dynamic = "force-dynamic";

const requiredDocuments = [
  "Official invoice",
  "Official ledger",
  "Audit packet",
  "Internal calculation report",
  "Exceptions report",
  "Odometer continuity report",
  "Missing city report",
];

export default async function TravelLedgerDocumentsPage() {
  const [storage, invoices] = await Promise.all([getTravelLedgerStorageStatus(), buildInvoices()]);
  const months = invoices.length ? invoices.map((invoice) => invoice.month) : ["No approved month yet"];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <TravelLedgerPageHeader
        eyebrow="Documents"
        title="Final output center"
        description="Open, export, and print the official invoice, official ledger, audit packet, internal calculation report, exceptions, odometer continuity, and missing city reports."
        actions={<PrimaryAdminAction href="/admin/travel-ledger/wizard" variant="secondary">Return to Wizard</PrimaryAdminAction>}
      />
      <TravelLedgerNav />
      <StorageModeBadge mode={storage.mode} />
      <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.06] p-4 font-body text-sm text-kelly-text/80">
        <p><strong>Official invoice and ledger:</strong> total reimbursable miles only.</p>
        <p><strong>Internal reports:</strong> base miles, drive-around miles, overrides, notes, and exceptions stay in admin-only review screens.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {months.map((month) => (
          <TravelLedgerCard key={month} eyebrow="Monthly packet" title={month}>
            <ul className="grid gap-2">
              {requiredDocuments.map((document) => (
                <li key={document} className="flex items-center justify-between rounded-lg border border-kelly-text/10 bg-kelly-wash px-3 py-2">
                  <span>{document}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-kelly-subtle">{invoices.length ? "draft" : "waiting"}</span>
                </li>
              ))}
            </ul>
          </TravelLedgerCard>
        ))}
      </section>
    </div>
  );
}
