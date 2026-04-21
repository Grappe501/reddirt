import {
  type CampaignEvent,
  CampaignTaskStatus,
  type Prisma,
  WorkflowRunStatus,
  WorkflowTemplateTrigger,
} from "@prisma/client";
import { prisma } from "@/lib/db";

function interpolate(
  tpl: string,
  event: Pick<CampaignEvent, "title" | "locationName" | "slug" | "startAt">
): string {
  return tpl
    .replace(/\{\{event\.title\}\}/g, event.title)
    .replace(/\{\{event\.location\}\}/g, event.locationName ?? "")
    .replace(/\{\{event\.locationName\}\}/g, event.locationName ?? "")
    .replace(/\{\{event\.slug\}\}/g, event.slug)
    .replace(/\{\{event\.startAt\}\}/g, event.startAt.toISOString());
}

/**
 * If template has `configJson.eventTypes`, require event.type to be listed.
 */
function templateMatchesEvent(
  config: Prisma.JsonValue,
  event: Pick<CampaignEvent, "eventType">
): boolean {
  if (!config || typeof config !== "object" || Array.isArray(config)) return true;
  const c = config as { eventTypes?: string[] };
  if (c.eventTypes && c.eventTypes.length > 0) {
    return c.eventTypes.includes(event.eventType);
  }
  return true;
}

/**
 * After an event is created, run all active templates for `EVENT_CREATED`.
 */
export async function runEventCreatedWorkflows(eventId: string): Promise<void> {
  const event = await prisma.campaignEvent.findUnique({ where: { id: eventId } });
  if (!event) return;

  const templates = await prisma.workflowTemplate.findMany({
    where: { isActive: true, triggerType: WorkflowTemplateTrigger.EVENT_CREATED },
    include: { tasks: { orderBy: { offsetMinutes: "asc" } } },
  });

  for (const template of templates) {
    if (!templateMatchesEvent(template.configJson, event)) continue;

    const existingRun = await prisma.workflowRun.findUnique({
      where: {
        workflowTemplateId_triggerSourceType_triggerSourceId: {
          workflowTemplateId: template.id,
          triggerSourceType: "CampaignEvent",
          triggerSourceId: event.id,
        },
      },
    });
    if (existingRun) continue;

    const run = await prisma.workflowRun.create({
      data: {
        workflowTemplateId: template.id,
        triggerType: WorkflowTemplateTrigger.EVENT_CREATED,
        triggerSourceType: "CampaignEvent",
        triggerSourceId: event.id,
        status: WorkflowRunStatus.RUNNING,
        contextJson: { eventId: event.id, templateKey: template.key } as Prisma.InputJsonValue,
      },
    });

    const startMs = event.startAt.getTime();
    for (const step of template.tasks) {
      const due = new Date(startMs + step.offsetMinutes * 60_000);
      const title = interpolate(step.titleTemplate, event);
      const description = step.descriptionTemplate ? interpolate(step.descriptionTemplate, event) : null;
      await prisma.campaignTask.create({
        data: {
          title,
          description,
          taskType: step.taskType,
          status: CampaignTaskStatus.TODO,
          priority: step.priority,
          dueAt: due,
          eventId: event.id,
          workflowRunId: run.id,
          assignedRole: step.roleTarget ?? null,
        },
      });
    }

    await prisma.workflowRun.update({
      where: { id: run.id },
      data: { status: WorkflowRunStatus.COMPLETED, completedAt: new Date() },
    });
  }
}

/**
 * After a signup is created, run `EVENT_SIGNUP_CREATED` templates.
 */
export async function runEventSignupWorkflows(signupId: string): Promise<void> {
  const signup = await prisma.eventSignup.findUnique({
    where: { id: signupId },
    include: { event: true },
  });
  if (!signup) return;
  const event = signup.event;

  const templates = await prisma.workflowTemplate.findMany({
    where: { isActive: true, triggerType: WorkflowTemplateTrigger.EVENT_SIGNUP_CREATED },
    include: { tasks: { orderBy: { offsetMinutes: "asc" } } },
  });

  for (const template of templates) {
    if (!templateMatchesEvent(template.configJson, event)) continue;

    const existingRun = await prisma.workflowRun.findUnique({
      where: {
        workflowTemplateId_triggerSourceType_triggerSourceId: {
          workflowTemplateId: template.id,
          triggerSourceType: "EventSignup",
          triggerSourceId: signup.id,
        },
      },
    });
    if (existingRun) continue;

    const run = await prisma.workflowRun.create({
      data: {
        workflowTemplateId: template.id,
        triggerType: WorkflowTemplateTrigger.EVENT_SIGNUP_CREATED,
        triggerSourceType: "EventSignup",
        triggerSourceId: signup.id,
        status: WorkflowRunStatus.RUNNING,
        contextJson: { signupId: signup.id, eventId: event.id } as Prisma.InputJsonValue,
      },
    });

    const regMs = signup.createdAt.getTime();
    const displayEvent = { ...event, title: `${event.title} — ${signup.firstName} ${signup.lastName}` };
    for (const step of template.tasks) {
      // Signup workflows: offset minutes from **registration time** (not event start).
      const due = new Date(regMs + step.offsetMinutes * 60_000);
      const titleT = interpolate(step.titleTemplate, displayEvent);
      const description = step.descriptionTemplate
        ? interpolate(step.descriptionTemplate, displayEvent)
        : `Signup: ${signup.email}`;

      await prisma.campaignTask.create({
        data: {
          title: titleT,
          description,
          taskType: step.taskType,
          status: CampaignTaskStatus.TODO,
          priority: step.priority,
          dueAt: due,
          eventId: event.id,
          workflowRunId: run.id,
          countyId: signup.countyId ?? event.countyId,
          assignedRole: step.roleTarget ?? null,
        },
      });
    }

    await prisma.workflowRun.update({
      where: { id: run.id },
      data: { status: WorkflowRunStatus.COMPLETED, completedAt: new Date() },
    });
  }
}
