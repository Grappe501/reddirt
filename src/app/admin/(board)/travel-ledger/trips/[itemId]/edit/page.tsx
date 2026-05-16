import { notFound } from "next/navigation";
import { TravelLedgerCard, TravelLedgerNav, TravelLedgerPageHeader, formatMoney } from "../../../components";
import { loadLedgerItems } from "@/lib/travel-ledger/storage";

export const dynamic = "force-dynamic";

export default async function EditTravelLedgerTripPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const item = (await loadLedgerItems()).find((entry) => entry.id === itemId);
  if (!item) notFound();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <TravelLedgerPageHeader
        eyebrow="Trip detail"
        title={`${item.date} · ${item.sourceTitles.join(" | ") || "Untitled item"}`}
        description="Read-only detail for this integration pass. Use the wizard to update status, city, mileage, purpose, and approval."
      />
      <TravelLedgerNav />
      <TravelLedgerCard eyebrow="Current record" title={item.routeText || "City needed"}>
        <div className="grid gap-2 sm:grid-cols-2">
          <p><strong>Classification:</strong> {item.classification.replaceAll("_", " ")}</p>
          <p><strong>Review status:</strong> {item.reviewStatus.replaceAll("_", " ")}</p>
          <p><strong>Approval status:</strong> {item.approvalStatus.replaceAll("_", " ")}</p>
          <p><strong>Total miles:</strong> {item.totalReimbursableMiles.toFixed(1)}</p>
          <p><strong>Amount:</strong> {formatMoney(item.reimbursementAmount)}</p>
          <p><strong>Purpose:</strong> {item.businessPurpose}</p>
        </div>
      </TravelLedgerCard>
    </div>
  );
}
