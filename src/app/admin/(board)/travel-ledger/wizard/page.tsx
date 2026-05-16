import Link from "next/link";
import { createWizardSessionAction } from "../actions";
import { PrimaryAdminAction, TravelLedgerCard, TravelLedgerNav, TravelLedgerPageHeader } from "../components";
import { loadWizardSessions } from "@/lib/travel-ledger/storage";

export const dynamic = "force-dynamic";

export default async function TravelLedgerWizardStartPage() {
  const sessions = (await loadWizardSessions()).slice(0, 5);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <TravelLedgerPageHeader
        eyebrow="Start Wizard"
        title="Travel Reimbursement Approval Wizard"
        description="Start with reviewer initials and a date range. The assistant shows one item and one decision at a time."
        actions={<PrimaryAdminAction href="/admin/travel-ledger/trips/new" variant="secondary">Add Missed Trip</PrimaryAdminAction>}
      />
      <TravelLedgerNav />

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <TravelLedgerCard eyebrow="Start review" title="Who is reviewing?">
          <form action={createWizardSessionAction} className="mt-4 grid gap-4">
            <label className="grid gap-1 font-body text-sm font-semibold text-kelly-text">
              Initials
              <input className="rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-normal" name="reviewerInitials" placeholder="ERN" pattern="[A-Za-z]{2,4}" required />
            </label>
            <label className="grid gap-1 font-body text-sm font-semibold text-kelly-text">
              Reviewer name
              <input className="rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-normal" name="reviewerName" placeholder="Optional full name" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 font-body text-sm font-semibold text-kelly-text">
                Start date
                <input className="rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-normal" name="startDate" type="date" defaultValue="2026-03-01" required />
              </label>
              <label className="grid gap-1 font-body text-sm font-semibold text-kelly-text">
                End date
                <input className="rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-normal" name="endDate" type="date" defaultValue="2026-05-15" required />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <PrimaryAdminAction type="submit">Start Review</PrimaryAdminAction>
            </div>
          </form>
        </TravelLedgerCard>
        <TravelLedgerCard eyebrow="Voice optional" title="Manual review remains primary">
          Voice commands can assist later, but no reimbursement action depends on voice. Unsafe actions still require explicit admin
          confirmation in the wizard.
        </TravelLedgerCard>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {sessions.map((session) => (
          <TravelLedgerCard key={session.id} eyebrow={session.status.replaceAll("_", " ")} title={session.title}>
            <p>
              {session.completedItemIds.length} of {session.itemIds.length} completed by {session.reviewerInitials}
            </p>
            <Link className="mt-3 inline-block font-semibold text-kelly-navy underline underline-offset-2" href={`/admin/travel-ledger/wizard/session/${session.id}`}>
              Continue session
            </Link>
          </TravelLedgerCard>
        ))}
      </section>
    </div>
  );
}
