import { notFound } from "next/navigation";
import {
  answerCampaignTripQuestionAction,
  approveWizardItemAction,
  denyWizardItemAction,
  markWizardItemNeedsMoreInfoAction,
  saveWizardItemPatchAction,
  skipWizardItemAction,
} from "../../../actions";
import {
  ApprovalSummary,
  PrimaryAdminAction,
  StatusPill,
  TravelLedgerCard,
  TravelLedgerNav,
  TravelLedgerPageHeader,
  formatMoney,
} from "../../../components";
import { getWizardSession, loadLedgerItems } from "@/lib/travel-ledger/storage";

export const dynamic = "force-dynamic";

export default async function TravelLedgerWizardSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { sessionId } = await params;
  const query = await searchParams;
  const session = await getWizardSession(sessionId);
  if (!session) notFound();
  const items = await loadLedgerItems();
  const item = items.find((entry) => entry.id === session.currentItemId) ?? items.find((entry) => session.itemIds.includes(entry.id));
  const index = item ? session.itemIds.indexOf(item.id) + 1 : 0;
  const percent = session.itemIds.length ? Math.round((session.completedItemIds.length / session.itemIds.length) * 100) : 100;
  const isCampaignTravel = item ? ["campaign_travel", "campaign_meeting", "house_party", "county_event"].includes(item.classification) : false;
  const hasCity = Boolean(item?.travelCities.length);
  const hasMileage = Boolean(item && item.totalReimbursableMiles > 0 && hasCity);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <TravelLedgerPageHeader
        eyebrow="Wizard session"
        title={item ? `${item.date} · ${item.sourceTitles.join(" | ") || "Untitled item"}` : "Wizard session complete"}
        description={`Reviewer ${session.reviewerInitials}. ${session.completedItemIds.length} of ${session.itemIds.length} completed (${percent}%).`}
        actions={<PrimaryAdminAction href="/admin/travel-ledger/wizard" variant="secondary">All Sessions</PrimaryAdminAction>}
      />
      <TravelLedgerNav />
      {query.saved ? <section className="rounded-2xl border border-emerald-800/20 bg-emerald-50 px-4 py-3 font-body text-sm text-emerald-950">{savedMessage(query.saved)}</section> : null}

      {!item ? (
        <TravelLedgerCard eyebrow="Complete" title="No remaining items">
          This wizard session has no remaining items in the selected date range.
        </TravelLedgerCard>
      ) : (
        <>
          <section className="flex flex-wrap gap-2">
            <StatusPill>Item {index} of {session.itemIds.length}</StatusPill>
            <StatusPill>{item.reviewStatus.replaceAll("_", " ")}</StatusPill>
            <StatusPill>{item.approvalStatus.replaceAll("_", " ")}</StatusPill>
            <StatusPill>{item.classification.replaceAll("_", " ")}</StatusPill>
          </section>

          {item.classification === "unknown" || item.reviewStatus === "needs_review" ? (
            <TravelLedgerCard eyebrow="AI-guided question" title="Is this a campaign reimbursement trip?" tone="highlight">
              <p>I reviewed this item. Answer this first, then the wizard will ask for city and mileage if it is campaign travel.</p>
              <form action={answerCampaignTripQuestionAction.bind(null, session.id, item.id)} className="mt-4 grid gap-4">
                <label className="grid gap-1 font-body text-sm font-semibold text-kelly-text">
                  Deny / exclude reason
                  <select className="rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-normal" name="denyReason" defaultValue="not campaign-related">
                    <option value="personal">personal</option>
                    <option value="virtual">virtual</option>
                    <option value="duplicate">duplicate</option>
                    <option value="admin/no travel">admin/no travel</option>
                    <option value="not campaign-related">not campaign-related</option>
                    <option value="wrong import">wrong import</option>
                    <option value="other">other</option>
                  </select>
                </label>
                <div className="flex flex-wrap gap-2">
                  <PrimaryAdminAction type="submit" name="decision" value="campaign_travel">Yes, campaign travel</PrimaryAdminAction>
                  <PrimaryAdminAction type="submit" name="decision" value="denied" variant="danger">No, deny/exclude</PrimaryAdminAction>
                  <PrimaryAdminAction type="submit" name="decision" value="virtual" variant="secondary">Virtual / no travel</PrimaryAdminAction>
                  <PrimaryAdminAction type="submit" name="decision" value="personal" variant="secondary">Personal</PrimaryAdminAction>
                  <PrimaryAdminAction type="submit" name="decision" value="duplicate" variant="secondary">Duplicate</PrimaryAdminAction>
                  <PrimaryAdminAction type="submit" name="decision" value="needs_more_info" variant="quiet">Not sure</PrimaryAdminAction>
                </div>
              </form>
            </TravelLedgerCard>
          ) : null}

          {isCampaignTravel && !hasCity ? (
            <TravelLedgerCard eyebrow="Next answer" title="What city did Kelly travel to?">
              <form action={saveWizardItemPatchAction.bind(null, session.id, item.id)} className="mt-4 grid gap-4">
                <input type="hidden" name="classification" value="campaign_travel" />
                <input type="hidden" name="businessPurpose" value={item.businessPurpose} />
                <input type="hidden" name="reviewerNote" value={item.reviewerNote ?? ""} />
                <input type="hidden" name="commitIntent" value="city" />
                <CityFields />
                <PrimaryAdminAction type="submit">Save City & Calculate Mileage</PrimaryAdminAction>
              </form>
            </TravelLedgerCard>
          ) : null}

          {isCampaignTravel && hasCity ? (
            <section className="grid gap-4 lg:grid-cols-2">
              <TravelLedgerCard eyebrow="Mileage calculated" title={`${item.totalReimbursableMiles.toFixed(1)} total reimbursable miles`}>
                <p>{formatMoney(item.reimbursementAmount)} at {formatMoney(item.mileageRate)} per mile.</p>
                <details className="mt-3">
                  <summary className="cursor-pointer font-semibold text-kelly-navy">Show internal calculation</summary>
                  <div className="mt-2 grid gap-2">
                    <p>Route: {item.routeText}</p>
                    <p>Base miles: {item.baseRoundTripMiles.toFixed(1)}</p>
                    <p>Drive-around miles: {item.driveAroundMiles.toFixed(1)}</p>
                  </div>
                </details>
                <form action={saveWizardItemPatchAction.bind(null, session.id, item.id)} className="mt-4 grid gap-3">
                  <input type="hidden" name="classification" value={item.classification} />
                  <input type="hidden" name="businessPurpose" value={item.businessPurpose} />
                  <input type="hidden" name="reviewerNote" value={item.reviewerNote ?? ""} />
                  <input type="hidden" name="commitIntent" value="mileage" />
                  {item.travelCities.map((city, cityIndex) => (
                    <span key={`${city.city}-${cityIndex}`}>
                      <input type="hidden" name={`city${cityIndex + 1}`} value={city.city} />
                      <input type="hidden" name={`state${cityIndex + 1}`} value={city.state} />
                    </span>
                  ))}
                  <label className="grid gap-1 font-body text-sm font-semibold text-kelly-text">
                    Mileage override
                    <input className="rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-normal" name="driveAroundMilesOverride" placeholder="Override drive-around miles" defaultValue={item.driveAroundMilesOverride ?? ""} />
                  </label>
                  <PrimaryAdminAction type="submit" variant="secondary">Save Mileage Override</PrimaryAdminAction>
                </form>
              </TravelLedgerCard>
              <TravelLedgerCard eyebrow="Purpose" title="Campaign purpose">
                <form action={saveWizardItemPatchAction.bind(null, session.id, item.id)} className="grid gap-3">
                  <input type="hidden" name="classification" value={item.classification} />
                  <input type="hidden" name="commitIntent" value="purpose" />
                  {item.travelCities.map((city, cityIndex) => (
                    <span key={`${city.city}-${cityIndex}`}>
                      <input type="hidden" name={`city${cityIndex + 1}`} value={city.city} />
                      <input type="hidden" name={`state${cityIndex + 1}`} value={city.state} />
                    </span>
                  ))}
                  <label className="grid gap-1 font-body text-sm font-semibold text-kelly-text">
                    Purpose
                    <textarea className="min-h-28 rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-normal" name="businessPurpose" defaultValue={item.businessPurpose} />
                  </label>
                  <label className="grid gap-1 font-body text-sm font-semibold text-kelly-text">
                    Reviewer note
                    <textarea className="min-h-20 rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-normal" name="reviewerNote" defaultValue={item.reviewerNote ?? ""} />
                  </label>
                  <PrimaryAdminAction type="submit" variant="secondary">Save Purpose / Notes</PrimaryAdminAction>
                </form>
              </TravelLedgerCard>
            </section>
          ) : null}

          {isCampaignTravel && hasMileage ? (
            <>
              <ApprovalSummary item={item} />
              <section className="flex flex-wrap gap-2 rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
                <form action={approveWizardItemAction.bind(null, session.id, item.id)}><PrimaryAdminAction type="submit">Approve</PrimaryAdminAction></form>
                <form action={markWizardItemNeedsMoreInfoAction.bind(null, session.id, item.id)}><PrimaryAdminAction type="submit" variant="quiet">Needs more info</PrimaryAdminAction></form>
                <form action={denyWizardItemAction.bind(null, session.id, item.id)}><PrimaryAdminAction type="submit" variant="danger">Deny / exclude</PrimaryAdminAction></form>
                <form action={skipWizardItemAction.bind(null, session.id, item.id)}><PrimaryAdminAction type="submit" variant="secondary">Save and next</PrimaryAdminAction></form>
              </section>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}

function CityFields() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1 font-body text-sm font-semibold text-kelly-text">
        City
        <input className="rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-normal" name="city1" placeholder="Prescott" required />
      </label>
      <label className="grid gap-1 font-body text-sm font-semibold text-kelly-text">
        State
        <input className="rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-normal" name="state1" placeholder="AR" defaultValue="AR" required />
      </label>
      <label className="grid gap-1 font-body text-sm font-semibold text-kelly-text">
        City 2
        <input className="rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-normal" name="city2" />
      </label>
      <label className="grid gap-1 font-body text-sm font-semibold text-kelly-text">
        State 2
        <input className="rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-normal" name="state2" defaultValue="AR" />
      </label>
    </div>
  );
}

function savedMessage(saved: string) {
  if (saved === "campaign") return "Campaign travel saved. City is the next required answer.";
  if (saved === "city") return "City saved. Mileage recalculated.";
  if (saved === "mileage") return "Mileage override saved. Reimbursement recalculated and approval reset.";
  if (saved === "purpose") return "Purpose saved. Approval summary updated.";
  if (saved === "approved") return "Trip approved and moved to invoice-ready review.";
  if (saved === "denied") return "Item denied and excluded from invoice.";
  return "Changes saved.";
}
