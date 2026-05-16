import { PrimaryAdminAction, TravelLedgerCard, TravelLedgerNav, TravelLedgerPageHeader, formatMoney } from "../components";
import { buildInvoices } from "@/lib/travel-ledger/storage";

export const dynamic = "force-dynamic";

export default async function TravelLedgerInvoicesPage() {
  const invoices = await buildInvoices();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <TravelLedgerPageHeader
        eyebrow="Monthly invoices"
        title="Official reimbursement invoices"
        description="Review monthly invoices from Kelly Grappe to Kelly Grappe for Secretary of State. Official invoice output shows total miles only."
        actions={<PrimaryAdminAction href="/admin/travel-ledger/documents" variant="secondary">Open Documents</PrimaryAdminAction>}
      />
      <TravelLedgerNav />
      {invoices.length ? (
        <section className="grid gap-4 md:grid-cols-2">
          {invoices.map((invoice) => (
            <TravelLedgerCard key={invoice.id} eyebrow={invoice.invoiceNumber} title={formatMoney(invoice.totalAmountDue)}>
              <p>Status: {invoice.status}</p>
              <p>{invoice.totalTrips} approved trips</p>
              <p>{invoice.totalApprovedMiles.toFixed(1)} approved miles</p>
              <p className="mt-3 rounded-lg border border-kelly-text/10 bg-kelly-wash px-3 py-2">
                Invoice guard: internal base miles and drive-around calculations are hidden from official invoice output.
              </p>
            </TravelLedgerCard>
          ))}
        </section>
      ) : (
        <TravelLedgerCard eyebrow="No invoice yet" title="Approve trips to generate invoices">
          The invoice center is wired to admin-approved ledger items. Approve at least one trip in the wizard or review queue.
        </TravelLedgerCard>
      )}
    </div>
  );
}
