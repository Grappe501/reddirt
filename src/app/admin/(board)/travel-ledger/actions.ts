"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addManualTravelLedgerItem,
  applyRoute,
  createTravelLedgerWizardSession,
  markWizardItem,
  numericFormField,
  parseCitiesFromForm,
  updateTravelLedgerItem,
} from "@/lib/travel-ledger/workflow";
import type { TravelLedgerItem } from "@/lib/travel-ledger/types";

const basePath = "/admin/travel-ledger";

export async function createWizardSessionAction(formData: FormData) {
  const session = await createTravelLedgerWizardSession({
    reviewerInitials: String(formData.get("reviewerInitials") ?? ""),
    reviewerName: String(formData.get("reviewerName") ?? ""),
    startDate: String(formData.get("startDate") ?? ""),
    endDate: String(formData.get("endDate") ?? ""),
  });
  revalidateTravelLedger();
  redirect(session.currentItemId ? `${basePath}/wizard/session/${session.id}` : `${basePath}/wizard`);
}

export async function answerCampaignTripQuestionAction(sessionId: string, itemId: string, formData: FormData) {
  const decision = String(formData.get("decision") ?? "");
  if (decision === "campaign_travel") {
    await updateTravelLedgerItem(
      itemId,
      (item, session) => ({
        ...item,
        classification: "campaign_travel",
        reviewStatus: item.travelCities.length ? "ready_for_approval" : "needs_location",
        reviewerInitials: session?.reviewerInitials,
        reviewerNote: String(formData.get("reviewerNote") ?? item.reviewerNote ?? ""),
        hasManualChanges: true,
      }),
      { sessionId, action: "wizard_item_saved", note: "Campaign travel confirmed." },
    );
    revalidateTravelLedger();
    redirect(`${basePath}/wizard/session/${sessionId}?saved=campaign`);
  }

  if (decision === "needs_more_info") {
    await updateTravelLedgerItem(
      itemId,
      (item) => ({ ...item, reviewStatus: "needs_more_info", approvalStatus: "not_approved" }),
      { sessionId, action: "needs_more_info", note: "Wizard item marked needs more info." },
    );
    await markWizardItem(sessionId, itemId, "needsMoreInfoItemIds");
    revalidateTravelLedger();
    redirect(`${basePath}/wizard/session/${sessionId}?saved=needs-more-info`);
  }

  const classification = ["virtual", "personal", "duplicate"].includes(decision) ? decision : "unknown";
  await updateTravelLedgerItem(
    itemId,
    (item) => ({
      ...item,
      classification: classification as TravelLedgerItem["classification"],
      reviewStatus: "denied",
      approvalStatus: "not_approved",
      reviewerNote: `Denied/excluded: ${String(formData.get("denyReason") ?? (decision || "not campaign-related"))}`,
      hasManualChanges: true,
    }),
    { sessionId, action: "denied", note: "Wizard item denied or excluded." },
  );
  await markWizardItem(sessionId, itemId, "completedItemIds");
  revalidateTravelLedger();
  redirect(`${basePath}/wizard/session/${sessionId}?saved=denied`);
}

export async function saveWizardItemPatchAction(sessionId: string, itemId: string, formData: FormData) {
  const cities = parseCitiesFromForm(formData);
  const commitIntent = String(formData.get("commitIntent") ?? "changes");
  await updateTravelLedgerItem(
    itemId,
    async (item, session) => {
      const routed = cities.length ? await applyRoute(item, cities, numericFormField(formData, "driveAroundMilesOverride")) : item;
      return {
        ...routed,
        classification: (String(formData.get("classification") ?? routed.classification) as TravelLedgerItem["classification"]) || routed.classification,
        businessPurpose: String(formData.get("businessPurpose") ?? routed.businessPurpose),
        reviewerInitials: session?.reviewerInitials ?? routed.reviewerInitials,
        reviewerNote: String(formData.get("reviewerNote") ?? routed.reviewerNote ?? ""),
        driveAroundOverrideReason: String(formData.get("driveAroundOverrideReason") ?? routed.driveAroundOverrideReason ?? ""),
        hasManualChanges: true,
      };
    },
    { sessionId, action: "wizard_item_saved", note: "Wizard item saved and recalculated." },
  );
  revalidateTravelLedger();
  redirect(`${basePath}/wizard/session/${sessionId}?saved=${encodeURIComponent(commitIntent)}`);
}

export async function approveWizardItemAction(sessionId: string, itemId: string) {
  await updateTravelLedgerItem(
    itemId,
    (item, session) => ({
      ...item,
      reviewStatus: item.travelCities.length ? "ready_for_approval" : "needs_location",
      approvalStatus: item.hasManualChanges ? "approved_with_changes" : "approved",
      approvedAt: new Date().toISOString(),
      approvedBy: session?.reviewerInitials || item.reviewerInitials || "admin",
      reviewerInitials: session?.reviewerInitials ?? item.reviewerInitials,
    }),
    { sessionId, action: "approved", note: "Wizard item approved." },
  );
  await markWizardItem(sessionId, itemId, "completedItemIds");
  revalidateTravelLedger();
  redirect(`${basePath}/wizard/session/${sessionId}?saved=approved`);
}

export async function markWizardItemNeedsMoreInfoAction(sessionId: string, itemId: string) {
  await updateTravelLedgerItem(
    itemId,
    (item) => ({ ...item, reviewStatus: "needs_more_info", approvalStatus: "not_approved" }),
    { sessionId, action: "needs_more_info", note: "Wizard item marked needs more info." },
  );
  await markWizardItem(sessionId, itemId, "needsMoreInfoItemIds");
  revalidateTravelLedger();
  redirect(`${basePath}/wizard/session/${sessionId}?saved=needs-more-info`);
}

export async function denyWizardItemAction(sessionId: string, itemId: string) {
  await updateTravelLedgerItem(
    itemId,
    (item) => ({ ...item, reviewStatus: "denied", approvalStatus: "not_approved" }),
    { sessionId, action: "denied", note: "Wizard item denied." },
  );
  await markWizardItem(sessionId, itemId, "completedItemIds");
  revalidateTravelLedger();
  redirect(`${basePath}/wizard/session/${sessionId}?saved=denied`);
}

export async function skipWizardItemAction(sessionId: string, itemId: string) {
  await markWizardItem(sessionId, itemId, "skippedItemIds");
  revalidateTravelLedger();
  redirect(`${basePath}/wizard/session/${sessionId}?saved=skipped`);
}

export async function createManualTripAction(formData: FormData) {
  await addManualTravelLedgerItem({
    date: String(formData.get("date") ?? ""),
    title: String(formData.get("title") ?? ""),
    isCampaignTravel: String(formData.get("isCampaignTravel") ?? "yes") === "yes",
    cities: parseCitiesFromForm(formData),
    businessPurpose: String(formData.get("businessPurpose") ?? ""),
    reviewerInitials: String(formData.get("reviewerInitials") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });
  revalidateTravelLedger();
  redirect(`${basePath}/review?created=manual-trip`);
}

function revalidateTravelLedger() {
  [
    basePath,
    `${basePath}/wizard`,
    `${basePath}/documents`,
    `${basePath}/invoices`,
    `${basePath}/review`,
    `${basePath}/audit`,
    `${basePath}/settings`,
  ].forEach((path) => revalidatePath(path));
}
