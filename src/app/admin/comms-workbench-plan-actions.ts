"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CommunicationPlanStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import {
  createCommunicationPlanFromCampaignEventSchema,
  createCommunicationPlanFromCampaignTaskSchema,
  createCommunicationPlanFromSocialContentItemSchema,
  createCommunicationPlanFromWorkflowIntakeSchema,
  createCommunicationPlanSchema,
} from "@/lib/comms-workbench/plan-create-schemas";

export type CreateCommunicationPlanResult =
  | { ok: true; communicationPlanId: string }
  | { ok: false; error: string };

const SOURCES = {
  INTAKE: "WORKFLOW_INTAKE" as const,
  TASK: "CAMPAIGN_TASK" as const,
  EVENT: "CAMPAIGN_EVENT" as const,
  SOCIAL: "SOCIAL_CONTENT" as const,
};

function revalidateComms(communicationPlanId?: string) {
  revalidatePath("/admin/workbench/comms");
  revalidatePath("/admin/workbench/comms/plans");
  if (communicationPlanId) {
    revalidatePath(`/admin/workbench/comms/plans/${communicationPlanId}`);
  }
}

function errRedirectPath(base: string, error: string) {
  const p = new URLSearchParams();
  p.set("error", error.slice(0, 500));
  return `${base}?${p.toString()}`;
}

async function assertUserOptional(
  id: string | null | undefined,
  field: "Owner" | "Requester"
): Promise<CreateCommunicationPlanResult | null> {
  if (!id) return null;
  const u = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!u) {
    return { ok: false, error: `${field} user not found.` };
  }
  return null;
}

/**
 * General create: optional **one** of intake/task/event/social FKs, validated.
 * `sourceType` is set automatically to match the selected FK; any extra `sourceType` field in the
 * form is ignored so provenance strings stay consistent with Packet 2/3 mappers.
 */
export async function createCommunicationPlanAction(
  raw: unknown
): Promise<CreateCommunicationPlanResult> {
  await requireAdminAction();
  const parsed = createCommunicationPlanSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;

  if (d.sourceWorkflowIntakeId) {
    const w = await prisma.workflowIntake.findUnique({ where: { id: d.sourceWorkflowIntakeId } });
    if (!w) return { ok: false, error: "Workflow intake not found." };
  }
  if (d.sourceCampaignTaskId) {
    const t = await prisma.campaignTask.findUnique({ where: { id: d.sourceCampaignTaskId } });
    if (!t) return { ok: false, error: "Campaign task not found." };
  }
  if (d.sourceEventId) {
    const e = await prisma.campaignEvent.findUnique({ where: { id: d.sourceEventId } });
    if (!e) return { ok: false, error: "Campaign event not found." };
  }
  if (d.sourceSocialContentItemId) {
    const s = await prisma.socialContentItem.findUnique({ where: { id: d.sourceSocialContentItemId } });
    if (!s) return { ok: false, error: "Social content item not found." };
  }

  const ownerErr = await assertUserOptional(d.ownerUserId, "Owner");
  if (ownerErr) return ownerErr;
  const reqErr = await assertUserOptional(d.requestedByUserId, "Requester");
  if (reqErr) return reqErr;

  const resolvedSourceType =
    d.sourceWorkflowIntakeId != null
      ? SOURCES.INTAKE
      : d.sourceCampaignTaskId != null
        ? SOURCES.TASK
        : d.sourceEventId != null
          ? SOURCES.EVENT
          : d.sourceSocialContentItemId != null
            ? SOURCES.SOCIAL
            : d.sourceType ?? null;

  const metadataJson: Prisma.InputJsonValue = { createdFrom: "direct" };

  try {
    const actor = await getAdminActorUserId();
    const plan = await prisma.communicationPlan.create({
      data: {
        title: d.title,
        objective: d.objective,
        status: CommunicationPlanStatus.DRAFT,
        priority: d.priority ?? undefined,
        summary: d.summary ?? null,
        ownerUserId: d.ownerUserId ?? null,
        requestedByUserId: d.requestedByUserId ?? (actor ? actor : null),
        dueAt: d.dueAt ?? null,
        scheduledAt: d.scheduledAt ?? null,
        sourceType: resolvedSourceType,
        sourceWorkflowIntakeId: d.sourceWorkflowIntakeId ?? null,
        sourceCampaignTaskId: d.sourceCampaignTaskId ?? null,
        sourceEventId: d.sourceEventId ?? null,
        sourceSocialContentItemId: d.sourceSocialContentItemId ?? null,
        metadataJson,
      },
    });
    revalidateComms(plan.id);
    return { ok: true, communicationPlanId: plan.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not create communication plan." };
  }
}

export async function createCommunicationPlanFromWorkflowIntakeAction(
  raw: unknown
): Promise<CreateCommunicationPlanResult> {
  await requireAdminAction();
  const parsed = createCommunicationPlanFromWorkflowIntakeSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const input = parsed.data;
  const intake = await prisma.workflowIntake.findUnique({ where: { id: input.workflowIntakeId } });
  if (!intake) return { ok: false, error: "Workflow intake not found." };

  const title =
    input.title?.trim() ||
    `Comms: ${intake.title?.trim() || "Workflow intake"}`;
  const summary =
    input.summary?.trim() ||
    [intake.status, intake.source].filter(Boolean).join(" · ") ||
    null;

  const metadataJson: Prisma.InputJsonValue = { createdFrom: "workflow_intake" };

  try {
    const actor = await getAdminActorUserId();
    const plan = await prisma.communicationPlan.create({
      data: {
        title,
        objective: input.objective,
        status: CommunicationPlanStatus.DRAFT,
        priority: input.priority ?? undefined,
        summary,
        sourceType: SOURCES.INTAKE,
        sourceWorkflowIntakeId: intake.id,
        dueAt: input.dueAt ?? null,
        scheduledAt: input.scheduledAt ?? null,
        requestedByUserId: actor,
        metadataJson,
      },
    });
    revalidateComms(plan.id);
    return { ok: true, communicationPlanId: plan.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not create communication plan from intake." };
  }
}

export async function createCommunicationPlanFromCampaignTaskAction(
  raw: unknown
): Promise<CreateCommunicationPlanResult> {
  await requireAdminAction();
  const parsed = createCommunicationPlanFromCampaignTaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const input = parsed.data;
  const task = await prisma.campaignTask.findUnique({ where: { id: input.campaignTaskId } });
  if (!task) return { ok: false, error: "Campaign task not found." };

  const title = input.title?.trim() || `Comms: ${task.title}`;
  const summary =
    input.summary?.trim() || (task.description?.trim() || `Task status ${task.status}`);

  const metadataJson: Prisma.InputJsonValue = { createdFrom: "campaign_task" };

  try {
    const actor = await getAdminActorUserId();
    const plan = await prisma.communicationPlan.create({
      data: {
        title,
        objective: input.objective,
        status: CommunicationPlanStatus.DRAFT,
        priority: task.priority,
        summary,
        sourceType: SOURCES.TASK,
        sourceCampaignTaskId: task.id,
        dueAt: input.dueAt ?? null,
        scheduledAt: input.scheduledAt ?? null,
        requestedByUserId: actor,
        metadataJson,
      },
    });
    revalidateComms(plan.id);
    return { ok: true, communicationPlanId: plan.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not create communication plan from task." };
  }
}

export async function createCommunicationPlanFromCampaignEventAction(
  raw: unknown
): Promise<CreateCommunicationPlanResult> {
  await requireAdminAction();
  const parsed = createCommunicationPlanFromCampaignEventSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const input = parsed.data;
  const event = await prisma.campaignEvent.findUnique({ where: { id: input.eventId } });
  if (!event) return { ok: false, error: "Campaign event not found." };

  const start = event.startAt.toISOString().slice(0, 10);
  const title = input.title?.trim() || `Comms: ${event.title}`;
  const summary = input.summary?.trim() || [start, formatEventOneLine(event)].filter(Boolean).join(" · ");

  const metadataJson: Prisma.InputJsonValue = { createdFrom: "campaign_event" };

  try {
    const actor = await getAdminActorUserId();
    const plan = await prisma.communicationPlan.create({
      data: {
        title,
        objective: input.objective,
        status: CommunicationPlanStatus.DRAFT,
        priority: input.priority ?? undefined,
        summary,
        sourceType: SOURCES.EVENT,
        sourceEventId: event.id,
        dueAt: input.dueAt ?? null,
        scheduledAt: input.scheduledAt ?? null,
        requestedByUserId: actor,
        metadataJson,
      },
    });
    revalidateComms(plan.id);
    return { ok: true, communicationPlanId: plan.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not create communication plan from event." };
  }
}

function formatEventOneLine(e: { status: string; eventType: string }): string {
  return [e.status, e.eventType].filter(Boolean).join(" · ");
}

export async function createCommunicationPlanFromSocialContentItemAction(
  raw: unknown
): Promise<CreateCommunicationPlanResult> {
  await requireAdminAction();
  const parsed = createCommunicationPlanFromSocialContentItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const input = parsed.data;
  const item = await prisma.socialContentItem.findUnique({ where: { id: input.socialContentItemId } });
  if (!item) return { ok: false, error: "Social content item not found." };

  const title =
    input.title?.trim() ||
    `Comms: ${item.title?.trim() || "Social work item"}`;
  const summary =
    input.summary?.trim() || `${item.kind} · ${item.status}`;

  const metadataJson: Prisma.InputJsonValue = { createdFrom: "social_content_item" };

  try {
    const actor = await getAdminActorUserId();
    const plan = await prisma.communicationPlan.create({
      data: {
        title,
        objective: input.objective,
        status: CommunicationPlanStatus.DRAFT,
        priority: input.priority ?? undefined,
        summary,
        sourceType: SOURCES.SOCIAL,
        sourceSocialContentItemId: item.id,
        dueAt: input.dueAt ?? null,
        scheduledAt: input.scheduledAt ?? null,
        requestedByUserId: actor,
        metadataJson,
      },
    });
    revalidateComms(plan.id);
    return { ok: true, communicationPlanId: plan.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not create communication plan from social item." };
  }
}

/* —— FormData entry points (redirect on success) —— */

const NEW_PLAN = "/admin/workbench/comms/plans/new";

function q(base: string, extra: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(extra)) {
    if (v) p.set(k, v);
  }
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

export async function submitDirectCommunicationPlanForm(formData: FormData) {
  const res = await createCommunicationPlanAction({
    title: String(formData.get("title") ?? "").trim(),
    objective: String(formData.get("objective") ?? "").trim(),
    priority: String(formData.get("priority") ?? "").trim() || undefined,
    summary: String(formData.get("summary") ?? "").trim() || undefined,
    ownerUserId: String(formData.get("ownerUserId") ?? "").trim() || undefined,
    requestedByUserId: String(formData.get("requestedByUserId") ?? "").trim() || undefined,
    dueAt: String(formData.get("dueAt") ?? "").trim() || undefined,
    scheduledAt: String(formData.get("scheduledAt") ?? "").trim() || undefined,
    sourceType: String(formData.get("sourceType") ?? "").trim() || undefined,
    sourceWorkflowIntakeId: String(formData.get("sourceWorkflowIntakeId") ?? "").trim() || undefined,
    sourceCampaignTaskId: String(formData.get("sourceCampaignTaskId") ?? "").trim() || undefined,
    sourceEventId: String(formData.get("sourceEventId") ?? "").trim() || undefined,
    sourceSocialContentItemId: String(formData.get("sourceSocialContentItemId") ?? "").trim() || undefined,
  });
  if (!res.ok) redirect(errRedirectPath(NEW_PLAN, res.error));
  redirect(`/admin/workbench/comms/plans/${res.communicationPlanId}`);
}

export async function submitIntakeCommunicationPlanForm(formData: FormData) {
  const res = await createCommunicationPlanFromWorkflowIntakeAction({
    workflowIntakeId: String(formData.get("workflowIntakeId") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim() || undefined,
    summary: String(formData.get("summary") ?? "").trim() || undefined,
    objective: String(formData.get("objective") ?? "").trim(),
    priority: String(formData.get("priority") ?? "").trim() || undefined,
    dueAt: String(formData.get("dueAt") ?? "").trim() || undefined,
    scheduledAt: String(formData.get("scheduledAt") ?? "").trim() || undefined,
  });
  const back = q(NEW_PLAN, {
    intakeId: String(formData.get("workflowIntakeId") ?? "").trim() || undefined,
  });
  if (!res.ok) redirect(errRedirectPath(back, res.error));
  redirect(`/admin/workbench/comms/plans/${res.communicationPlanId}`);
}

export async function submitTaskCommunicationPlanForm(formData: FormData) {
  const res = await createCommunicationPlanFromCampaignTaskAction({
    campaignTaskId: String(formData.get("campaignTaskId") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim() || undefined,
    summary: String(formData.get("summary") ?? "").trim() || undefined,
    objective: String(formData.get("objective") ?? "").trim(),
    dueAt: String(formData.get("dueAt") ?? "").trim() || undefined,
    scheduledAt: String(formData.get("scheduledAt") ?? "").trim() || undefined,
  });
  const back = q(NEW_PLAN, {
    taskId: String(formData.get("campaignTaskId") ?? "").trim() || undefined,
  });
  if (!res.ok) redirect(errRedirectPath(back, res.error));
  redirect(`/admin/workbench/comms/plans/${res.communicationPlanId}`);
}

export async function submitEventCommunicationPlanForm(formData: FormData) {
  const res = await createCommunicationPlanFromCampaignEventAction({
    eventId: String(formData.get("eventId") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim() || undefined,
    summary: String(formData.get("summary") ?? "").trim() || undefined,
    objective: String(formData.get("objective") ?? "").trim(),
    priority: String(formData.get("priority") ?? "").trim() || undefined,
    dueAt: String(formData.get("dueAt") ?? "").trim() || undefined,
    scheduledAt: String(formData.get("scheduledAt") ?? "").trim() || undefined,
  });
  const back = q(NEW_PLAN, {
    eventId: String(formData.get("eventId") ?? "").trim() || undefined,
  });
  if (!res.ok) redirect(errRedirectPath(back, res.error));
  redirect(`/admin/workbench/comms/plans/${res.communicationPlanId}`);
}

export async function submitSocialCommunicationPlanForm(formData: FormData) {
  const res = await createCommunicationPlanFromSocialContentItemAction({
    socialContentItemId: String(formData.get("socialContentItemId") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim() || undefined,
    summary: String(formData.get("summary") ?? "").trim() || undefined,
    objective: String(formData.get("objective") ?? "").trim(),
    priority: String(formData.get("priority") ?? "").trim() || undefined,
    dueAt: String(formData.get("dueAt") ?? "").trim() || undefined,
    scheduledAt: String(formData.get("scheduledAt") ?? "").trim() || undefined,
  });
  const back = q(NEW_PLAN, {
    socialItemId: String(formData.get("socialContentItemId") ?? "").trim() || undefined,
  });
  if (!res.ok) redirect(errRedirectPath(back, res.error));
  redirect(`/admin/workbench/comms/plans/${res.communicationPlanId}`);
}
