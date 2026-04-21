"use server";

import { revalidatePath } from "next/cache";
import {
  CommunicationChannel,
  CommunicationThreadStatus,
  CommsQueueStatus,
  CommunicationActionType,
} from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { normalizeUsPhone } from "@/lib/comms/phone";
import { sendSmsAndRecord } from "@/lib/integrations/twilio/send-sms";
import { sendEmailAndRecord } from "@/lib/integrations/sendgrid/send-email";
import { draftOutboundMessage, rewriteMessage, type AiRewriteTone, summarizeThreadForPrompt } from "@/lib/comms/ai";

function pickStatus(raw: string): CommunicationThreadStatus {
  const u = (raw as CommunicationThreadStatus) || CommunicationThreadStatus.ACTIVE;
  return (Object.values(CommunicationThreadStatus) as string[]).includes(u)
    ? (u as CommunicationThreadStatus)
    : CommunicationThreadStatus.ACTIVE;
}

export async function createCommunicationThreadAction(formData: FormData) {
  await requireAdminAction();
  const phone = String(formData.get("primaryPhone") ?? "").trim();
  const email = String(formData.get("primaryEmail") ?? "").trim();
  const channelRaw = String(formData.get("preferredChannel") ?? "SMS");
  const countyId = String(formData.get("countyId") ?? "").trim() || null;
  if (!phone && !email) redirect("/admin/workbench?error=contact");

  const nPhone = phone ? normalizeUsPhone(phone) : null;
  if (phone && !nPhone) redirect("/admin/workbench?error=phone");

  const t = await prisma.communicationThread.create({
    data: {
      primaryPhone: nPhone,
      primaryEmail: email || null,
      preferredChannel: channelRaw === "EMAIL" ? CommunicationChannel.EMAIL : CommunicationChannel.SMS,
      countyId,
      threadStatus: CommunicationThreadStatus.ACTIVE,
    },
  });
  revalidatePath("/admin/workbench");
  redirect(`/admin/workbench?thread=${encodeURIComponent(t.id)}${countyId ? `&county=${encodeURIComponent(countyId)}` : ""}`);
}

export async function updateCommunicationThreadAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("threadId") ?? "").trim();
  if (!id) return;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const threadStatus = pickStatus(String(formData.get("threadStatus") ?? "ACTIVE"));
  const assignedRoleKey = String(formData.get("assignedRoleKey") ?? "").trim() || null;

  await prisma.communicationThread.update({
    where: { id },
    data: { notes, threadStatus, assignedRoleKey },
  });
  revalidatePath("/admin/workbench");
}

export async function markThreadReadAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("threadId") ?? "").trim();
  if (!id) return;
  const t = await prisma.communicationThread.findUnique({ where: { id } });
  if (!t) return;
  const nextStatus =
    t.threadStatus === CommunicationThreadStatus.NEEDS_REPLY
      ? CommunicationThreadStatus.ACTIVE
      : t.threadStatus;
  await prisma.communicationThread.update({
    where: { id },
    data: { unreadCount: 0, threadStatus: nextStatus },
  });
  revalidatePath("/admin/workbench");
}

export async function sendSmsFromWorkbenchAction(formData: FormData) {
  await requireAdminAction();
  const threadId = String(formData.get("threadId") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!threadId || !body) return { ok: false as const, error: "Thread and message are required." };

  const thread = await prisma.communicationThread.findUnique({ where: { id: threadId } });
  if (!thread) return { ok: false as const, error: "Thread not found." };
  const to = thread.primaryPhone;
  if (!to) return { ok: false as const, error: "Thread has no primary phone; set a phone first." };

  const res = await sendSmsAndRecord({ threadId, to, body, sentByUserId: null });
  revalidatePath("/admin/workbench");
  if (!res.ok) return { ok: false as const, error: res.error };
  return { ok: true as const };
}

export async function sendEmailFromWorkbenchAction(formData: FormData) {
  await requireAdminAction();
  const threadId = String(formData.get("threadId") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!threadId || !body) return { ok: false as const, error: "Thread and message are required." };

  const thread = await prisma.communicationThread.findUnique({ where: { id: threadId } });
  if (!thread) return { ok: false as const, error: "Thread not found." };
  const to = thread.primaryEmail;
  if (!to) return { ok: false as const, error: "Thread has no primary email; set an email first." };
  if (!subject) return { ok: false as const, error: "Subject is required for email." };

  const res = await sendEmailAndRecord({ threadId, to, subject, text: body, sentByUserId: null });
  revalidatePath("/admin/workbench");
  if (!res.ok) return { ok: false as const, error: res.error };
  return { ok: true as const };
}

export async function draftMessageAiAction(formData: FormData) {
  await requireAdminAction();
  const threadId = String(formData.get("threadId") ?? "").trim();
  const channel = (String(formData.get("channel") ?? "SMS") as "SMS" | "EMAIL") || "SMS";
  const goal = String(formData.get("goal") ?? "").trim() || undefined;
  if (!threadId) return { ok: false as const, error: "Thread required." };
  const thread = await prisma.communicationThread.findUnique({
    where: { id: threadId },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 100 } },
  });
  if (!thread) return { ok: false as const, error: "Thread not found." };
  const lines = thread.messages.map(
    (m) => `${m.direction} ${m.channel} ${m.createdAt.toISOString()}\n${m.bodyText}`.slice(0, 2000)
  );
  const threadSummary = await summarizeThreadForPrompt({ lines });
  const out = await draftOutboundMessage({ channel, threadSummary, goal });
  if ("error" in out) return { ok: false as const, error: out.error };
  return { ok: true as const, text: out.text };
}

export async function rewriteMessageAiAction(formData: FormData) {
  await requireAdminAction();
  const body = String(formData.get("body") ?? "").trim();
  const tone = String(formData.get("tone") ?? "concise") as AiRewriteTone;
  if (!body) return { ok: false as const, error: "Text required." };
  const out = await rewriteMessage({ body, tone });
  if ("error" in out) return { ok: false as const, error: out.error };
  return { ok: true as const, text: out.text };
}

export async function createScheduledSmsReminderAction(formData: FormData) {
  await requireAdminAction();
  const threadId = String(formData.get("threadId") ?? "").trim();
  const when = new Date(String(formData.get("scheduledAt") ?? ""));
  if (!threadId || Number.isNaN(when.getTime())) return;
  await prisma.communicationActionQueue.create({
    data: {
      actionType: CommunicationActionType.SEND_REMINDER,
      threadId,
      queueStatus: CommsQueueStatus.PENDING,
      scheduledAt: when,
      payloadJson: { note: "Manual reminder" },
    },
  });
  revalidatePath("/admin/workbench");
}
