import { createManualTripAction } from "../../actions";
import { PrimaryAdminAction, TravelLedgerCard, TravelLedgerNav, TravelLedgerPageHeader } from "../../components";

export const dynamic = "force-dynamic";

export default function NewTravelLedgerTripPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <TravelLedgerPageHeader
        eyebrow="Manual trip entry"
        title="Add a missed reimbursement trip"
        description="Add calendar gaps, worked-from-home/no-mileage days, Little Rock work days, or missed campaign travel without entering exact addresses."
      />
      <TravelLedgerNav />
      <TravelLedgerCard eyebrow="Manual missed trip" title="Trip details">
        <form action={createManualTripAction} className="mt-4 grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 font-body text-sm font-semibold text-kelly-text">
              Date
              <input className="rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-normal" name="date" type="date" defaultValue="2026-05-15" required />
            </label>
            <label className="grid gap-1 font-body text-sm font-semibold text-kelly-text">
              Reviewer initials
              <input className="rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-normal" name="reviewerInitials" pattern="[A-Za-z]{2,4}" placeholder="ERN" required />
            </label>
          </div>
          <label className="grid gap-1 font-body text-sm font-semibold text-kelly-text">
            Title
            <input className="rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-normal" name="title" placeholder="County campaign meeting" required />
          </label>
          <label className="grid gap-1 font-body text-sm font-semibold text-kelly-text">
            Campaign travel?
            <select className="rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-normal" name="isCampaignTravel" defaultValue="yes">
              <option value="yes">Yes, campaign travel</option>
              <option value="no">No, no reimbursable travel</option>
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 font-body text-sm font-semibold text-kelly-text">
              City
              <input className="rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-normal" name="city1" placeholder="Little Rock" />
            </label>
            <label className="grid gap-1 font-body text-sm font-semibold text-kelly-text">
              State
              <input className="rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-normal" name="state1" defaultValue="AR" />
            </label>
          </div>
          <label className="grid gap-1 font-body text-sm font-semibold text-kelly-text">
            Business purpose
            <textarea className="min-h-24 rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-normal" name="businessPurpose" placeholder="Campaign meeting, county event, volunteer training..." required />
          </label>
          <label className="grid gap-1 font-body text-sm font-semibold text-kelly-text">
            Notes
            <textarea className="min-h-20 rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-normal" name="notes" />
          </label>
          <PrimaryAdminAction type="submit">Create Manual Trip</PrimaryAdminAction>
        </form>
      </TravelLedgerCard>
    </div>
  );
}
