import {
  CampaignTaskStatus,
  EventWorkflowState,
  WorkflowRunStatus,
  WorkflowTemplateTrigger,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { isEventStageAtOrPast } from "@/lib/calendar/event-workflow-stage-order";

export const EVENT_TRIGGER_SOURCE = "CAMPAIGN_EVENT" as const;

type ApplyOpts = { actorUserId: string | null };

function shouldIncludeTemplateLine(eventWorkflow: EventWorkflowState, minEventStage: EventWorkflowState | null) {
  if (eventWorkflow === EventWorkflowState.CANCELED) return false;
  if (eventWorkflow === EventWorkflowState.COMPLETED) {
    return minEventStage === EventWorkflowState.COMPLETED;
  }
  if (minEventStage === EventWorkflowState.COMPLETED) {
    return false;
  }
  const min = minEventStage ?? EventWorkflowState.DRAFT;
  return isEventStageAtOrPast(eventWorkflow, min);
}

function renderTemplate(
  t: { titleTemplate: string; descriptionTemplate: string | null },
  event: { title: string; startAt: Date }
) {
  const rep = (s: string) =>
    s
      .replaceAll("{{eventTitle}}", event.title)
      .replaceAll("{{date}}", event.startAt.toLocaleDateString());
  return {
    title: rep(t.titleTemplate),
    description: t.descriptionTemplate ? rep(t.descriptionTemplate) : null,
  };
}

function dueFromOffset(startAt: Date, offsetMinutes: number) {
  return new Date(startAt.getTime() + offsetMinutes * 60_000);
}

/**
 * Create or update tasks from a workflow template for a calendar event. Idempotent on `sourceTemplateTaskKey`.
 */
export async function applyEventWorkflowTemplate(eventId: string, workflowTemplateId: string, opts: ApplyOpts) {
  const event = await prisma.campaignEvent.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("Event not found.");
  const tpl = await prisma.workflowTemplate.findUnique({
    where: { id: workflowTemplateId, isActive: true },
    include: { tasks: { orderBy: { taskKey: "asc" } } },
  });
  if (!tpl) throw new Error("Template not found.");

  const run = await prisma.workflowRun.upsert({
    where: {
      workflowTemplateId_triggerSourceType_triggerSourceId: {
        workflowTemplateId: tpl.id,
        triggerSourceType: EVENT_TRIGGER_SOURCE,
        triggerSourceId: eventId,
      },
    },
    create: {
      workflowTemplateId: tpl.id,
      triggerType: WorkflowTemplateTrigger.MANUAL,
      triggerSourceType: EVENT_TRIGGER_SOURCE,
      triggerSourceId: eventId,
      status: WorkflowRunStatus.RUNNING,
      contextJson: { lastAppliedByUserId: opts.actorUserId },
    },
    update: {
      status: WorkflowRunStatus.RUNNING,
      errorMessage: null,
      contextJson: { lastAppliedByUserId: opts.actorUserId } as object,
    },
  });

  const lines = tpl.tasks.filter((l) => shouldIncludeTemplateLine(event.eventWorkflowState, l.minEventStage));
  const created: { id: string; taskKey: string }[] = [];

  for (const line of lines) {
    const { title, description } = renderTemplate(line, event);
    const dueAt = dueFromOffset(event.startAt, line.offsetMinutes);
    const existing = await prisma.campaignTask.findFirst({
      where: { eventId, sourceTemplateTaskKey: line.taskKey },
    });
    if (existing) {
      if (existing.status === CampaignTaskStatus.DONE) {
        continue;
      }
      await prisma.campaignTask.update({
        where: { id: existing.id },
        data: {
          title,
          description,
          taskType: line.taskType,
          priority: line.priority,
          dueAt,
          blocksReadiness: line.blocksReadiness,
          assignedRole: line.roleTarget,
          workflowRunId: run.id,
          completionNotes: existing.completionNotes,
        },
      });
      created.push({ id: existing.id, taskKey: line.taskKey });
    } else {
      const t = await prisma.campaignTask.create({
        data: {
          eventId,
          title,
          description,
          taskType: line.taskType,
          priority: line.priority,
          status: CampaignTaskStatus.TODO,
          dueAt,
          blocksReadiness: line.blocksReadiness,
          sourceTemplateTaskKey: line.taskKey,
          assignedRole: line.roleTarget,
          countyId: event.countyId,
          workflowRunId: run.id,
          createdByUserId: opts.actorUserId,
        },
      });
      created.push({ id: t.id, taskKey: line.taskKey });
    }
  }

  for (const line of lines) {
    if (!line.dependsOnTaskKey) continue;
    const child = await prisma.campaignTask.findFirst({
      where: { eventId, sourceTemplateTaskKey: line.taskKey },
    });
    const parent = await prisma.campaignTask.findFirst({
      where: { eventId, sourceTemplateTaskKey: line.dependsOnTaskKey },
    });
    if (child && parent) {
      await prisma.campaignTask.update({
        where: { id: child.id },
        data: { parentTaskId: parent.id },
      });
    }
  }

  return { workflowRunId: run.id, taskCount: created.length };
}

export async function reapplyEventWorkflowsForEvent(eventId: string, opts: ApplyOpts) {
  const runs = await prisma.workflowRun.findMany({
    where: { triggerSourceType: EVENT_TRIGGER_SOURCE, triggerSourceId: eventId },
  });
  for (const r of runs) {
    await applyEventWorkflowTemplate(eventId, r.workflowTemplateId, opts);
  }
}

export async function cancelOpenTasksForEvent(eventId: string) {
  await prisma.campaignTask.updateMany({
    where: {
      eventId,
      status: { in: [CampaignTaskStatus.TODO, CampaignTaskStatus.IN_PROGRESS, CampaignTaskStatus.BLOCKED] },
    },
    data: { status: CampaignTaskStatus.CANCELLED },
  });
  await prisma.workflowRun.updateMany({
    where: { triggerSourceType: EVENT_TRIGGER_SOURCE, triggerSourceId: eventId, status: WorkflowRunStatus.RUNNING },
    data: { status: WorkflowRunStatus.CANCELLED, completedAt: new Date() },
  });
}

/**
 * For completed events, activate follow-up / recap template lines only.
 */
export async function ensureCompletedStageTasks(eventId: string, opts: ApplyOpts) {
  await reapplyEventWorkflowsForEvent(eventId, opts);
}
