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
import { buildTripContext } from "@/lib/travel-ledger/ai/trip-resolution-autopilot/build-trip-context";
import { classifyCampaignTrip } from "@/lib/travel-ledger/ai/trip-resolution-autopilot/campaign-trip-classifier";
import { computeReadiness } from "@/lib/travel-ledger/ai/trip-resolution-autopilot/autopilot-readiness-score";
import { extractTitleCity } from "@/lib/travel-ledger/ai/trip-resolution-autopilot/title-city-extractor";
import { extractTitlePurpose } from "@/lib/travel-ledger/ai/trip-resolution-autopilot/title-purpose-extractor";
import { selectNextQuestion } from "@/lib/travel-ledger/ai/trip-resolution-autopilot/next-question-selector";
import { getWizardSession, loadLedgerItems } from "@/lib/travel-ledger/storage";
import type { TravelLedgerItem } from "@/lib/travel-ledger/types";

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
  const canReviewCurrentItem = Boolean(item && isCampaignTravel && hasCity);
  const autopilot = item ? buildWizardAutopilotHint(item, items) : null;

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
            {autopilot?.readiness ? <StatusPill>AI: {autopilot.readiness.replaceAll("_", " ")}</StatusPill> : null}
          </section>

          {autopilot ? (
            <TravelLedgerCard eyebrow="AI prepares item" title={autopilot.headline} tone="highlight">
              <p>{autopilot.body}</p>
              <p className="mt-2 text-xs text-kelly-text/60">Next question: {autopilot.question}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {autopilot.city ? (
                  <form action={saveWizardItemPatchAction.bind(null, session.id, item.id)}>
                    <input type="hidden" name="classification" value="campaign_travel" />
                    <input type="hidden" name="businessPurpose" value={autopilot.businessPurpose || item.businessPurpose} />
                    <input type="hidden" name="reviewerNote" value={item.reviewerNote ?? ""} />
                    <input type="hidden" name="commitIntent" value="city" />
                    <input type="hidden" name="city1" value={autopilot.city} />
                    <input type="hidden" name="state1" value={autopilot.state ?? "AR"} />
                    <PrimaryAdminAction type="submit">Yes, continue</PrimaryAdminAction>
                  </form>
                ) : null}
                <PrimaryAdminAction href="#city-input" variant="secondary">Change city</PrimaryAdminAction>
                <form action={answerCampaignTripQuestionAction.bind(null, session.id, item.id)}>
                  <input type="hidden" name="denyReason" value="not campaign-related" />
                  <PrimaryAdminAction type="submit" name="decision" value="denied" variant="danger">Not a campaign trip</PrimaryAdminAction>
                </form>
              </div>
            </TravelLedgerCard>
          ) : null}

          {canReviewCurrentItem ? (
            <section className="flex flex-wrap items-center gap-2 rounded-2xl border border-kelly-navy/15 bg-kelly-wash p-4">
              <p className="basis-full font-body text-sm font-semibold text-kelly-navy">
                Ready to move forward? Use these buttons anytime after city/mileage are set.
              </p>
              <form action={approveWizardItemAction.bind(null, session.id, item.id)}><PrimaryAdminAction type="submit">Approve & Next</PrimaryAdminAction></form>
              <form action={skipWizardItemAction.bind(null, session.id, item.id)}><PrimaryAdminAction type="submit" variant="secondary">Save and next</PrimaryAdminAction></form>
              <form action={markWizardItemNeedsMoreInfoAction.bind(null, session.id, item.id)}><PrimaryAdminAction type="submit" variant="quiet">Needs more info</PrimaryAdminAction></form>
            </section>
          ) : null}

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
              <div id="city-input" />
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
                  <div className="flex flex-wrap gap-2">
                    <PrimaryAdminAction type="submit" variant="secondary">Save Mileage Override</PrimaryAdminAction>
                    <PrimaryAdminAction type="submit" name="commitIntent" value="mileage-next">Save Mileage & Next</PrimaryAdminAction>
                  </div>
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
                  <div className="flex flex-wrap gap-2">
                    <PrimaryAdminAction type="submit" variant="secondary">Save Purpose / Notes</PrimaryAdminAction>
                    <PrimaryAdminAction type="submit" name="commitIntent" value="purpose-next">Save Purpose & Next</PrimaryAdminAction>
                  </div>
                </form>
              </TravelLedgerCard>
            </section>
          ) : null}

          {canReviewCurrentItem ? (
            <>
              <ApprovalSummary item={item} />
              <section className="flex flex-wrap gap-2 rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
                <p className="basis-full font-body text-sm text-kelly-text/75">
                  Done with this stop? Approve, mark it for follow-up, deny it, or save and move to the next item.
                </p>
                <form action={approveWizardItemAction.bind(null, session.id, item.id)}><PrimaryAdminAction type="submit">Approve & Next</PrimaryAdminAction></form>
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

function buildWizardAutopilotHint(item: TravelLedgerItem, items: TravelLedgerItem[]) {
  if (item.hasManualChanges && item.travelCities.length) return null;
  const context = buildTripContext(item, items);
  const titleCityMatch = extractTitleCity(context.title);
  const purposeExtraction = extractTitlePurpose(context.title, titleCityMatch);
  const classification = classifyCampaignTrip({
    title: context.title,
    titleCityMatch,
    purposeExtraction,
    duplicateRisk: context.duplicateCandidates.length > 0,
  });
  const readiness = computeReadiness({ classification, titleCityMatch, purposeExtraction });
  const nextQuestion = selectNextQuestion({ titleCityMatch, purposeExtraction, classification });
  const city = titleCityMatch.city;
  const state = titleCityMatch.state ?? "AR";
  const headline = city
    ? titleCityMatch.confidence === "high"
      ? `I found ${city} in the event title.`
      : `I think this should be ${city}.`
    : "I could not find a city in the title.";
  const body = city
    ? titleCityMatch.confidence === "high"
      ? `I used ${city}, ${state} for mileage. Source: ${titleCityMatch.source}.`
      : `I matched "${titleCityMatch.matchedText ?? context.title}" to ${city}, ${state}. Please confirm before approval.`
    : "What city did Kelly travel to? The wizard will ask for one city only.";
  return {
    city,
    state,
    headline,
    body,
    question: nextQuestion.question,
    readiness,
    businessPurpose: purposeExtraction.businessPurpose,
  };
}

function savedMessage(saved: string) {
  if (saved === "campaign") return "Campaign travel saved. City is the next required answer.";
  if (saved === "city") return "City saved. Mileage recalculated.";
  if (saved === "mileage") return "Mileage override saved. Reimbursement recalculated and approval reset.";
  if (saved === "mileage-next") return "Mileage saved. Moving to the next wizard item.";
  if (saved === "purpose") return "Purpose saved. Approval summary updated.";
  if (saved === "purpose-next") return "Purpose saved. Moving to the next wizard item.";
  if (saved === "approved") return "Trip approved and moved to invoice-ready review.";
  if (saved === "denied") return "Item denied and excluded from invoice.";
  if (saved === "skipped") return "Item saved and skipped for now. Moving to the next wizard item.";
  return "Changes saved.";
}
