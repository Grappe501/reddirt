"use server";

import { revalidatePath } from "next/cache";
import { CampaignTaskPriority, CampaignTaskStatus, CampaignTaskType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { applyEventWorkflowTemplate, reapplyEventWorkflowsForEvent } from "@/lib/calendar/event-task-engine";

function str(f: FormData, k: string) {
  return String(f.get(k) ?? "").trim();
}

function pickTaskType(raw: string): CampaignTaskType {
  const u = Object.values(CampaignTaskType).find((v) => v === raw);
  return u ?? CampaignTaskType.OTHER;
}

function pickPriority(raw: string): CampaignTaskPriority {
  const u = Object.values(CampaignTaskPriority).find((v) => v === raw);
  return u ?? CampaignTaskPriority.MEDIUM;
}

export async function applyEventWorkflowTemplateAction(formData: FormData) {
  await requireAdminAction();
  const eventId = str(formData, "eventId");
  const templateId = str(formData, "templateId");
  if (!eventId || !templateId) return;
  const actor = await getAdminActorUserId();
  try {
    await applyEventWorkflowTemplate(eventId, templateId, { actorUserId: actor });
  } catch (e) {
    console.error(e);
  }
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/admin/events");
  revalidatePath("/admin/workbench");
}

export async function reapplyEventWorkflowsAction(formData: FormData) {
  await requireAdminAction();
  const eventId = str(formData, "eventId");
  if (!eventId) return;
  const actor = await getAdminActorUserId();
  try {
    await reapplyEventWorkflowsForEvent(eventId, { actorUserId: actor });
  } catch (e) {
    console.error(e);
  }
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/admin/events");
  revalidatePath("/admin/workbench");
}

export async function createEventQuickTaskAction(formData: FormData) {
  await requireAdminAction();
  const eventId = str(formData, "eventId");
  const title = str(formData, "title");
  if (!eventId || !title) return;
  const ev = await prisma.campaignEvent.findUnique({ where: { id: eventId } });
  if (!ev) return;
  const actor = await getAdminActorUserId();
  const offsetMin = Number(str(formData, "dueOffsetMinutes")) || 0;
  const dueAt = new Date(ev.startAt.getTime() + offsetMin * 60_000);
  const blocks = formData.get("blocksReadiness") === "on";
  await prisma.campaignTask.create({
    data: {
      eventId,
      title,
      taskType: pickTaskType(str(formData, "taskType")),
      priority: pickPriority(str(formData, "priority")),
      status: CampaignTaskStatus.TODO,
      dueAt,
      blocksReadiness: blocks,
      countyId: ev.countyId,
      createdByUserId: actor,
    },
  });
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/admin/events");
  revalidatePath("/admin/workbench");
}

export async function assignEventTaskAction(formData: FormData) {
  await requireAdminAction();
  const taskId = str(formData, "taskId");
  const userRaw = str(formData, "assignedUserId");
  if (!taskId) return;
  const assignedUserId = userRaw && userRaw !== "__none" ? userRaw : null;
  await prisma.campaignTask.update({
    where: { id: taskId },
    data: { assignedUserId },
  });
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/admin/events");
  revalidatePath("/admin/workbench");
}

export async function completeEventTaskAction(formData: FormData) {
  await requireAdminAction();
  const taskId = str(formData, "taskId");
  if (!taskId) return;
  await prisma.campaignTask.update({
    where: { id: taskId },
    data: { status: CampaignTaskStatus.DONE, completedAt: new Date() },
  });
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/admin/events");
  revalidatePath("/admin/workbench");
}
