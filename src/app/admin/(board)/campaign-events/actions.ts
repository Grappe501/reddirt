"use server";

import { revalidatePath } from "next/cache";
import { saveFactCardSection } from "@/lib/campaign-events/persistence/records";
import { loadEventReviewBundle } from "@/lib/campaign-events/persistence/review-bundle";
import {
  applyReviewDecision,
  persistReviewForm,
  saveEmailDraftToRecord,
} from "@/lib/campaign-events/persistence/review-persistence";
import { buildEmailDraft } from "@/lib/campaign-events/email-draft-builder";
import type { EditableFactSectionId } from "@/lib/campaign-events/constants";
import type { EventReviewFormState } from "@/lib/campaign-events/review-form";
import type { CampaignEventDecision, EmailDraftType } from "@/lib/campaign-events/review-meta";
import { factCardToReviewForm, reviewFormToFactCard } from "@/lib/campaign-events/review-form";

import { appendCommunicationNote, type EventCommunicationNoteType } from "@/lib/campaign-events/event-communication";
import { parseFactCardEnvelope, serializeFactCardEnvelope } from "@/lib/campaign-events/fact-card-envelope";
import { getRecordById } from "@/lib/campaign-events/persistence/records";
import { prisma } from "@/lib/db";

const CAMPAIGN_EVENT_PATHS = [
  "/admin/campaign-events/march-2026",
  "/admin/campaign-events/workbench",
  "/admin/campaign-calendar",
  "/admin/campaign-events",
] as const;

function revalidateCampaignEventSurfaces() {
  for (const p of CAMPAIGN_EVENT_PATHS) revalidatePath(p, "layout");
}

export async function saveCampaignEventFactSectionAction(
  recordId: string,
  sectionId: EditableFactSectionId,
  patch: Record<string, string | undefined>,
) {
  await saveFactCardSection(recordId, sectionId, patch);
  revalidateCampaignEventSurfaces();
  return { ok: true as const };
}

export async function getEventReviewBundleAction(recordId: string) {
  const bundle = await loadEventReviewBundle(recordId);
  return JSON.parse(JSON.stringify(bundle)) as typeof bundle;
}

export async function saveEventReviewAction(
  recordId: string,
  form: EventReviewFormState,
  mode: "recalculate" | "draft",
) {
  await persistReviewForm(recordId, form, {
    recalculate: mode === "recalculate",
    draft: mode === "draft",
    actor: "admin",
  });
  revalidateCampaignEventSurfaces();
  return { ok: true as const };
}

export async function resetEventReviewToAiAction(recordId: string) {
  const bundle = await loadEventReviewBundle(recordId);
  const aiForm = mergeAiOnlyForm(bundle);
  await persistReviewForm(recordId, aiForm, { recalculate: true, actor: "admin" });
  revalidateCampaignEventSurfaces();
  return { ok: true as const, form: aiForm };
}

function mergeAiOnlyForm(bundle: Awaited<ReturnType<typeof loadEventReviewBundle>>): EventReviewFormState {
  return factCardToReviewForm(bundle.inference.prefill, "", bundle.snapshot.reviewStatus, bundle.snapshot.eventStatus);
}

export async function applyEventReviewDecisionAction(
  recordId: string,
  decision: CampaignEventDecision,
  note?: string,
) {
  await applyReviewDecision(recordId, decision, { note, actor: "admin" });
  revalidateCampaignEventSurfaces();
  return { ok: true as const };
}

export async function addEventCommunicationNoteAction(
  recordId: string,
  noteType: EventCommunicationNoteType,
  body: string,
  author?: string,
) {
  const record = await getRecordById(recordId);
  if (!record) throw new Error("Record not found");
  const envelope = parseFactCardEnvelope(record.factCard);
  envelope.communication = appendCommunicationNote(envelope.communication, {
    author: author ?? "Operator",
    noteType,
    body,
  });
  await prisma.campaignEventLedgerRecord.update({
    where: { id: recordId },
    data: { factCard: serializeFactCardEnvelope(envelope) as object },
  });
  revalidateCampaignEventSurfaces();
  revalidatePath(`/admin/campaign-events/${recordId}`);
  return { ok: true as const };
}

export async function buildEmailDraftAction(
  recordId: string,
  type: EmailDraftType,
  form: EventReviewFormState,
) {
  const bundle = await loadEventReviewBundle(recordId);
  const factCard = reviewFormToFactCard(form);
  const draft = buildEmailDraft({
    type,
    calendar: bundle.calendar,
    factCard,
    missingChecklist: bundle.inference.missingRequired,
    to: factCard.who.hostEmail,
  });
  await saveEmailDraftToRecord(recordId, draft);
  revalidateCampaignEventSurfaces();
  return { ok: true as const, draft };
}
