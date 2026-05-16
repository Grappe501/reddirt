import Link from "next/link";
import { StatusPill, TravelLedgerCard, TravelLedgerNav, TravelLedgerPageHeader, formatMoney } from "../components";
import { loadLedgerItems } from "@/lib/travel-ledger/storage";

export const dynamic = "force-dynamic";

export default async function TravelLedgerReviewPage() {
  const items = await loadLedgerItems();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <TravelLedgerPageHeader
        eyebrow="Advanced Ledger View"
        title="Travel ledger search, filters, and edge-case review"
        description="Batch review and audit view for reimbursement items. The normal workflow starts in the guided wizard."
      />
      <TravelLedgerNav />
      <TravelLedgerCard eyebrow="Ledger items" title={`${items.length} reimbursement items`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left font-body text-sm">
            <thead className="text-xs uppercase tracking-wider text-kelly-text/50">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Trip</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Miles</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Route</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-kelly-text/10">
                  <td className="px-3 py-3">{item.date}</td>
                  <td className="px-3 py-3">
                    <Link className="font-semibold text-kelly-navy underline underline-offset-2" href={`/admin/travel-ledger/trips/${item.id}/edit`}>
                      {item.sourceTitles.join(" | ") || "Untitled item"}
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      <StatusPill>{item.reviewStatus.replaceAll("_", " ")}</StatusPill>
                      <StatusPill>{item.approvalStatus.replaceAll("_", " ")}</StatusPill>
                    </div>
                  </td>
                  <td className="px-3 py-3">{item.totalReimbursableMiles.toFixed(1)}</td>
                  <td className="px-3 py-3">{formatMoney(item.reimbursementAmount)}</td>
                  <td className="px-3 py-3">{item.routeText || "City needed"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TravelLedgerCard>
    </div>
  );
}
