"use server";

import { revalidatePath } from "next/cache";

import { loadEmailDrafts, saveEmailDrafts } from "@/lib/email/email-staged-store";
import { sendApprovedEmailBatch, sendTestEmail } from "@/lib/email/sendgrid-client";
import type { EmailCampaignDraftStatus } from "@/lib/email/email-campaign-types";

const PATH = "/admin/calendar-command-center/email";

async function updateDraftStatus(draftId: string, status: EmailCampaignDraftStatus, humanApprovedBy?: string) {
  const drafts = await loadEmailDrafts();
  const next = drafts.map((draft) =>
    draft.id === draftId
      ? {
          ...draft,
          status,
          humanApprovedBy: humanApprovedBy ?? draft.humanApprovedBy,
        }
      : draft,
  );
  await saveEmailDrafts(next);
  revalidatePath(PATH);
}

export async function approveEmailDraftForTest(formData: FormData) {
  const draftId = String(formData.get("draftId") ?? "");
  if (!draftId) return;
  await updateDraftStatus(draftId, "approved_for_test", "admin_command_center");
}

export async function approveEmailDraftForLive(formData: FormData) {
  const draftId = String(formData.get("draftId") ?? "");
  if (!draftId) return;
  await updateDraftStatus(draftId, "approved_for_live", "admin_command_center");
}

export async function cancelEmailDraft(formData: FormData) {
  const draftId = String(formData.get("draftId") ?? "");
  if (!draftId) return;
  await updateDraftStatus(draftId, "cancelled", "admin_command_center");
}

export async function sendEmailDraftTest(formData: FormData) {
  const draftId = String(formData.get("draftId") ?? "");
  const recipients = String(formData.get("testRecipients") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!draftId || recipients.length === 0) return;
  const result = await sendTestEmail(draftId, recipients);
  if (result.ok) await updateDraftStatus(draftId, "test_sent", "admin_command_center");
  revalidatePath(PATH);
}

export async function sendEmailDraftLiveBatch(formData: FormData) {
  const draftId = String(formData.get("draftId") ?? "");
  const limit = Number(formData.get("limit") ?? "25");
  if (!draftId || !Number.isFinite(limit)) return;
  await sendApprovedEmailBatch(draftId, limit);
  revalidatePath(PATH);
}
