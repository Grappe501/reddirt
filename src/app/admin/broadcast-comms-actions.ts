"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CommunicationCampaignChannel,
  CommunicationCampaignStatus,
  CommunicationCampaignType,
  CommunicationChannel,
  CommunicationTemplateType,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import type { AudienceDefinition } from "@/lib/comms/audience-definition";
import { defaultAudienceDefinition } from "@/lib/comms/audience-definition";
import { canSendForEventCampaign } from "@/lib/comms/event-campaign-gate";
import { resolveAudience } from "@/lib/comms/audience-resolve";
import { processCommsCampaignBatch, seedCampaignRecipients } from "@/lib/comms/campaign-processor";
import { sendEmailAndRecord } from "@/lib/integrations/sendgrid/send-email";
import { sendSmsAndRecord } from "@/lib/integrations/twilio/send-sms";
import { findOrCreateThreadForBroadcast } from "@/lib/comms/campaign-thread";
import { draftOutboundMessage } from "@/lib/comms/ai";

function jsonDef(raw: string): AudienceDefinition {
  try {
    const o = JSON.parse(raw) as AudienceDefinition;
    return { ...defaultAudienceDefinition(), ...o };
  } catch {
    return defaultAudienceDefinition();
  }
}

export async function previewBroadcastAudienceAction(formData: FormData) {
  await requireAdminAction();
  const raw = String(formData.get("audienceJson") ?? "{}");
  const channel = String(formData.get("channel") ?? "MIXED") as CommunicationCampaignChannel;
  const def = jsonDef(raw);
  const { rows, afterDedupe, suppressedCount } = await resolveAudience(def, channel);
  return {
    ok: true as const,
    total: afterDedupe,
    suppressed: suppressedCount,
    sample: rows.slice(0, 12).map((r) => ({
      channel: r.channel,
      email: r.email,
      phone: r.phone,
      suppressed: r.suppressed,
    })),
  };
}

export async function createBroadcastCampaignAction(formData: FormData) {
  await requireAdminAction();
  const actor = await getAdminActorUserId();
  const name = String(formData.get("name") ?? "").trim() || "Untitled broadcast";
  const channel = (String(formData.get("channel") ?? "MIXED") as CommunicationCampaignChannel) || "MIXED";
  const campaignType = (String(formData.get("campaignType") ?? "BROADCAST") as CommunicationCampaignType) || "BROADCAST";
  const bodyText = String(formData.get("bodyText") ?? "").trim();
  const subjectText = String(formData.get("subjectText") ?? "").trim() || null;
  const templateId = String(formData.get("templateId") ?? "").trim() || null;
  const audienceSegmentId = String(formData.get("audienceSegmentId") ?? "").trim() || null;
  const eventId = String(formData.get("eventId") ?? "").trim() || null;
  const audienceJson = String(formData.get("audienceJson") ?? "{}");
  if (eventId) {
    const ev = await prisma.campaignEvent.findUnique({ where: { id: eventId } });
    if (ev) {
      const g = canSendForEventCampaign(ev, campaignType);
      if (!g.ok) {
        redirect(`/admin/workbench/comms/broadcasts/new?error=${encodeURIComponent(g.reason)}`);
      }
    }
  }
  const c = await prisma.communicationCampaign.create({
    data: {
      name,
      channel,
      campaignType,
      bodyText: bodyText || null,
      subjectText,
      templateId: templateId || undefined,
      audienceSegmentId: audienceSegmentId || undefined,
      eventId: eventId || undefined,
      audienceDefinitionJson: jsonDef(audienceJson) as object,
      status: CommunicationCampaignStatus.DRAFT,
      createdByUserId: actor ?? undefined,
    },
  });
  revalidatePath("/admin/workbench/comms/broadcasts");
  redirect(`/admin/workbench/comms/broadcasts/${c.id}`);
}

export async function updateBroadcastCampaignAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const name = String(formData.get("name") ?? "").trim();
  const bodyText = String(formData.get("bodyText") ?? "").trim();
  const subjectText = String(formData.get("subjectText") ?? "").trim() || null;
  const audienceJson = String(formData.get("audienceJson") ?? "{}");
  const templateId = String(formData.get("templateId") ?? "").trim() || null;
  const eventId = String(formData.get("eventId") ?? "").trim() || null;
  const campaignType = String(formData.get("campaignType") ?? "BROADCAST") as CommunicationCampaignType;
  if (eventId) {
    const ev = await prisma.campaignEvent.findUnique({ where: { id: eventId } });
    if (ev) {
      const g = canSendForEventCampaign(ev, campaignType);
      if (!g.ok) {
        revalidatePath(`/admin/workbench/comms/broadcasts/${id}`);
        return;
      }
    }
  }
  await prisma.communicationCampaign.update({
    where: { id },
    data: {
      name: name || undefined,
      bodyText: bodyText || null,
      subjectText,
      templateId: templateId || null,
      eventId: eventId || null,
      audienceDefinitionJson: jsonDef(audienceJson) as object,
      campaignType,
    },
  });
  revalidatePath("/admin/workbench/comms/broadcasts");
  revalidatePath(`/admin/workbench/comms/broadcasts/${id}`);
}

export async function submitBroadcastForApprovalAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await prisma.communicationCampaign.update({
    where: { id },
    data: { status: CommunicationCampaignStatus.APPROVAL_NEEDED },
  });
  revalidatePath("/admin/workbench/comms/broadcasts");
  revalidatePath(`/admin/workbench/comms/broadcasts/${id}`);
}

export async function approveBroadcastCampaignAction(formData: FormData) {
  await requireAdminAction();
  const actor = await getAdminActorUserId();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await prisma.communicationCampaign.update({
    where: { id },
    data: {
      status: CommunicationCampaignStatus.APPROVED,
      approvedByUserId: actor ?? undefined,
    },
  });
  revalidatePath("/admin/workbench/comms/broadcasts");
  revalidatePath(`/admin/workbench/comms/broadcasts/${id}`);
}

export async function queueBroadcastCampaignAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  const sched = String(formData.get("scheduledAt") ?? "").trim();
  const scheduledAt = sched ? new Date(sched) : null;
  if (!id) return;
  const c = await prisma.communicationCampaign.findUnique({ where: { id } });
  if (!c) return;
  if (c.eventId) {
    const ev = await prisma.campaignEvent.findUnique({ where: { id: c.eventId } });
    if (ev) {
      const g = canSendForEventCampaign(ev, c.campaignType);
      if (!g.ok) {
        revalidatePath(`/admin/workbench/comms/broadcasts/${id}`);
        return;
      }
    }
  }
  await prisma.communicationCampaign.update({
    where: { id },
    data: {
      status: CommunicationCampaignStatus.QUEUED,
      scheduledAt: scheduledAt && !Number.isNaN(scheduledAt.getTime()) ? scheduledAt : null,
    },
  });
  await seedCampaignRecipients(id);
  revalidatePath("/admin/workbench/comms/broadcasts");
  revalidatePath(`/admin/workbench/comms/broadcasts/${id}`);
  void processCommsCampaignBatch({ campaignId: id });
}

export async function pauseBroadcastCampaignAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await prisma.communicationCampaign.update({
    where: { id },
    data: { status: CommunicationCampaignStatus.PAUSED, processingLockUntil: null },
  });
  revalidatePath("/admin/workbench/comms/broadcasts");
  revalidatePath(`/admin/workbench/comms/broadcasts/${id}`);
}

export async function cancelBroadcastCampaignAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await prisma.communicationCampaign.update({
    where: { id },
    data: { status: CommunicationCampaignStatus.CANCELED, processingLockUntil: null },
  });
  revalidatePath("/admin/workbench/comms/broadcasts");
  revalidatePath(`/admin/workbench/comms/broadcasts/${id}`);
}

export async function testBroadcastSendAction(formData: FormData) {
  await requireAdminAction();
  const actor = await getAdminActorUserId();
  const testPhone = String(formData.get("testPhone") ?? "").trim();
  const testEmail = String(formData.get("testEmail") ?? "").trim();
  const bodyText = String(formData.get("bodyText") ?? "").trim();
  const subjectText = String(formData.get("subjectText") ?? "").trim() || "Test";
  const mode = String(formData.get("mode") ?? "email");
  if (!bodyText) return;
  const threadId = await findOrCreateThreadForBroadcast({
    userId: null,
    volunteerProfileId: null,
    email: testEmail || null,
    phone: testPhone || null,
    countyId: null,
  });
  if (mode === "sms") {
    if (!testPhone) return;
    const r = await sendSmsAndRecord({ threadId, to: testPhone, body: bodyText, sentByUserId: actor });
    if (!r.ok) return;
    return;
  }
  if (!testEmail) return;
  const r = await sendEmailAndRecord({
    threadId,
    to: testEmail,
    subject: subjectText,
    text: bodyText,
    sentByUserId: actor,
  });
  if (!r.ok) return;
}

export async function aiDraftBroadcastBodyAction(formData: FormData) {
  await requireAdminAction();
  const goal = String(formData.get("goal") ?? "").trim() || "Campaign broadcast to supporters";
  const channel = (String(formData.get("channel") ?? "EMAIL") as "SMS" | "EMAIL") || "EMAIL";
  const out = await draftOutboundMessage({
    channel,
    threadSummary: goal,
    goal,
  });
  if ("error" in out) return { ok: false as const, error: out.error };
  return { ok: true as const, text: out.text };
}

export async function saveAudienceSegmentAction(formData: FormData) {
  await requireAdminAction();
  const actor = await getAdminActorUserId();
  const name = String(formData.get("name") ?? "").trim() || "Segment";
  const audienceJson = String(formData.get("audienceJson") ?? "{}");
  const def = jsonDef(audienceJson);
  const ch = (String(formData.get("channel") ?? "MIXED") as CommunicationCampaignChannel) || "MIXED";
  const { afterDedupe } = await resolveAudience(def, ch);
  await prisma.audienceSegment.create({
    data: {
      name,
      definitionJson: def as object,
      estimatedCount: afterDedupe,
      createdByUserId: actor ?? undefined,
    },
  });
  revalidatePath("/admin/workbench/comms/broadcasts");
}

export async function processBroadcastBatchNowAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await processCommsCampaignBatch({ campaignId: id });
  revalidatePath("/admin/workbench/comms/broadcasts");
  revalidatePath(`/admin/workbench/comms/broadcasts/${id}`);
}

export async function saveCommunicationTemplateAction(formData: FormData) {
  await requireAdminAction();
  const actor = await getAdminActorUserId();
  const name = String(formData.get("name") ?? "").trim() || "Template";
  const channel = (String(formData.get("channel") ?? "EMAIL") as CommunicationChannel) || "EMAIL";
  const bodyTemplate = String(formData.get("bodyTemplate") ?? "").trim();
  const subjectTemplate = String(formData.get("subjectTemplate") ?? "").trim() || null;
  if (!bodyTemplate) return;
  await prisma.communicationTemplate.create({
    data: {
      name,
      channel,
      bodyTemplate,
      subjectTemplate: subjectTemplate,
      templateType: CommunicationTemplateType.BROADCAST,
      createdByUserId: actor ?? undefined,
    },
  });
  revalidatePath("/admin/workbench/comms/broadcasts");
}
