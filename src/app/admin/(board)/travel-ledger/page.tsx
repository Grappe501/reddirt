import {
  PrimaryAdminAction,
  StorageModeBadge,
  TravelLedgerCard,
  TravelLedgerNav,
  TravelLedgerPageHeader,
  formatMoney,
} from "./components";
import { getTravelLedgerStorageStatus } from "@/lib/travel-ledger/storage";
import { getTravelLedgerDashboard } from "@/lib/travel-ledger/workflow";

export const dynamic = "force-dynamic";

export default async function TravelLedgerLandingPage() {
  const [storage, dashboard] = await Promise.all([getTravelLedgerStorageStatus(), getTravelLedgerDashboard()]);
  const lastSession = dashboard.sessions[0];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <TravelLedgerPageHeader
        eyebrow="Admin subsystem"
        title="Travel Ledger / Reimbursement Wizard"
        description="Review campaign travel, calculate mileage, approve reimbursement items, and generate invoices inside the RedDirt admin dashboard."
        actions={
          <>
            <PrimaryAdminAction href="/admin/travel-ledger/wizard">Start Wizard</PrimaryAdminAction>
            <PrimaryAdminAction href="/admin/travel-ledger/trips/new" variant="secondary">
              Add Missed Trip
            </PrimaryAdminAction>
          </>
        }
      />
      <TravelLedgerNav />
      <StorageModeBadge mode={storage.mode} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TravelLedgerCard eyebrow="Items needing review" title={String(dashboard.itemsNeedingReview)}>
          AI-guided review starts with campaign-trip confirmation, then city and mileage.
        </TravelLedgerCard>
        <TravelLedgerCard eyebrow="Ready to approve" title={String(dashboard.readyToApprove)}>
          Trips with enough facts for reimbursement approval.
        </TravelLedgerCard>
        <TravelLedgerCard eyebrow="Approved miles" title={dashboard.approvedMiles.toFixed(1)}>
          Official invoices show total reimbursable miles only.
        </TravelLedgerCard>
        <TravelLedgerCard eyebrow="Approved amount" title={formatMoney(dashboard.approvedAmount)}>
          Internal calculations remain in review and audit views.
        </TravelLedgerCard>
      </section>

      <section className="rounded-3xl border border-kelly-navy/20 bg-kelly-navy/[0.06] p-6">
        <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-kelly-slate">Workflow</p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-text">
          Start Review {"->"} Answer one question {"->"} Save City & Calculate {"->"} Approve or deny {"->"} Final documents
        </h2>
        <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/75">
          Manual workflow is complete without voice. Voice controls are exposed through admin-only API stubs and can be expanded after
          ElevenLabs keys are configured in RedDirt/Netlify env.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <PrimaryAdminAction href="/admin/travel-ledger/wizard">Start guided review</PrimaryAdminAction>
          {lastSession?.currentItemId ? (
            <PrimaryAdminAction href={`/admin/travel-ledger/wizard/session/${lastSession.id}`} variant="secondary">
              Continue Last Session
            </PrimaryAdminAction>
          ) : null}
          <PrimaryAdminAction href="/admin/travel-ledger/documents" variant="quiet">
            Open final output center
          </PrimaryAdminAction>
        </div>
      </section>
    </div>
  );
}
