import { CampaignTaskStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";
import { getVolunteerLeaderRoster, countsInFieldLeaderRoster } from "@/lib/volunteers/leader-roster";
import { loadOperationsFeedbackRollup } from "@/lib/volunteers/load-operations-feedback-rollup";
import { createOpsTaskFromSignal } from "@/lib/volunteers/ops-work-items/create-from-signal";
import { OPEN_OPS_TASK_STATUSES } from "@/lib/volunteers/ops-work-items/signal-task-definitions";
import { isVolunteerIntakeSource } from "@/lib/volunteers/load-volunteer-intake-dashboard";
import { readVolunteerLifecycleStage } from "@/lib/volunteers/volunteer-lifecycle";

import { createAutomationTask } from "./create-automation-task";
import {
  escalationRoleFor,
  OVERDUE_ESCALATION_GRACE_DAYS,
  QUIET_LEADER_DAYS,
  STALE_INTAKE_DAYS,
} from "./definitions";
import { loadLastFieldEntryAtByInitials } from "./load-leader-last-activity";

export type OpsFeedbackLoopRunResult = {
  ranAt: string;
  signalTasksCreated: number;
  quietLeaderTasks: number;
  overdueEscalations: number;
  staleIntakeTasks: number;
  skipped: string[];
  errors: string[];
};

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function autoCreateActionableSignalTasks(): Promise<number> {
  const rollup = await loadOperationsFeedbackRollup();
  let created = 0;

  for (const signal of rollup.signals) {
    if (signal.severity !== "action" || signal.openOpsTask || !signal.taskAssignable) continue;

    const result = await createOpsTaskFromSignal({
      signalId: signal.id,
      count: signal.count,
      tierId: signal.tierId,
      severity: signal.severity,
    });

    if (result.created) created += 1;
  }

  return created;
}

async function createQuietLeader14DayTasks(): Promise<number> {
  const roster = getVolunteerLeaderRoster().filter(countsInFieldLeaderRoster);
  const lastActivity = await loadLastFieldEntryAtByInitials(roster.map((l) => l.initials));
  const cutoff = daysAgo(QUIET_LEADER_DAYS);
  let created = 0;

  for (const leader of roster) {
    const last = lastActivity[leader.initials.toUpperCase()];
    const isQuiet = !last || last < cutoff;
    if (!isQuiet) continue;

    const daysSince = last
      ? Math.floor((Date.now() - last.getTime()) / (24 * 60 * 60 * 1000))
      : QUIET_LEADER_DAYS + 1;

    const result = await createAutomationTask({
      trigger: "quiet_leader_14d",
      signalKey: leader.slug,
      spec: {
        title: `14-day quiet check-in — ${leader.displayName}`,
        description: [
          `${leader.displayName} (${leader.initials}) has no field log activity in ${daysSince}+ days.`,
          "Schedule a coaching touch, review My Five, and assign a first action from leader command.",
        ].join("\n\n"),
        taskType: "FIELD",
        priority: "HIGH",
        assignedRole: "FIELD_DIRECTOR",
        opsSourceType: "leader_gap",
        opsVisibility: "operators",
        dueDays: 3,
        leaderSlug: leader.slug,
        metadata: {
          leaderInitials: leader.initials,
          daysSinceLastFieldLog: daysSince,
        },
      },
    });

    if (result.created) created += 1;
  }

  return created;
}

async function escalateOverdueTasks(): Promise<number> {
  const graceCutoff = daysAgo(OVERDUE_ESCALATION_GRACE_DAYS);
  const overdue = await prisma.campaignTask.findMany({
    where: {
      status: { in: [CampaignTaskStatus.TODO, CampaignTaskStatus.IN_PROGRESS, CampaignTaskStatus.BLOCKED] },
      dueAt: { lt: graceCutoff },
      opsSourceSignalId: { not: { startsWith: "automation:overdue_escalation:" } },
    },
    select: {
      id: true,
      title: true,
      assignedRole: true,
      leaderSlug: true,
      dueAt: true,
      opsSourceSignalId: true,
    },
    take: 50,
    orderBy: { dueAt: "asc" },
  });

  let created = 0;

  for (const task of overdue) {
    const nextRole = escalationRoleFor(task.assignedRole);
    if (!nextRole) continue;

    const existingEsc = await prisma.campaignTask.findFirst({
      where: {
        parentTaskId: task.id,
        opsSourceSignalId: `automation:overdue_escalation:${task.id}`,
        status: { in: [...OPEN_OPS_TASK_STATUSES] },
      },
      select: { id: true },
    });
    if (existingEsc) continue;

    const dueLabel = task.dueAt ? task.dueAt.toLocaleDateString() : "unknown";

    const result = await createAutomationTask({
      trigger: "overdue_escalation",
      signalKey: task.id,
      spec: {
        title: `Escalation: overdue — ${task.title}`,
        description: [
          `Original task was due ${dueLabel} and is still open.`,
          `Escalated from ${task.assignedRole ?? "unassigned"} to ${nextRole}.`,
          "Clear or reassign from My Work or the CM dashboard.",
        ].join("\n\n"),
        taskType: "ADMIN",
        priority: "URGENT",
        assignedRole: nextRole,
        opsSourceType: "lane_ops",
        opsVisibility: nextRole === "CAMPAIGN_MANAGER" ? "admin" : "operators",
        dueDays: 1,
        parentTaskId: task.id,
        leaderSlug: task.leaderSlug,
        metadata: {
          parentTaskId: task.id,
          parentTitle: task.title,
          escalatedFromRole: task.assignedRole,
        },
      },
    });

    if (result.created) created += 1;
  }

  return created;
}

async function createStaleIntakeTasks(): Promise<number> {
  const cutoff = daysAgo(STALE_INTAKE_DAYS);
  const rows = await prisma.workflowIntake.findMany({
    where: {
      status: { in: ["PENDING", "IN_REVIEW", "AWAITING_INFO"] },
      createdAt: { lt: cutoff },
    },
    select: {
      id: true,
      title: true,
      status: true,
      source: true,
      metadata: true,
      createdAt: true,
    },
    take: 40,
    orderBy: { createdAt: "asc" },
  });

  let created = 0;

  for (const row of rows) {
    if (!isVolunteerIntakeSource(row.source)) continue;

    const stage = readVolunteerLifecycleStage(row.metadata, row.status);
    if (stage === "ARCHIVED" || stage === "ACTIVE") continue;

    const daysOpen = Math.floor((Date.now() - row.createdAt.getTime()) / (24 * 60 * 60 * 1000));

    const result = await createAutomationTask({
      trigger: "stale_intake",
      signalKey: row.id,
      spec: {
        title: `Stale intake (${daysOpen}d) — ${row.title}`,
        description: [
          `Volunteer intake has been ${row.status} for ${daysOpen} days.`,
          "Review, place, or decline from the volunteer intake dashboard.",
        ].join("\n\n"),
        taskType: "VOLUNTEER",
        priority: daysOpen >= STALE_INTAKE_DAYS * 2 ? "URGENT" : "HIGH",
        assignedRole: daysOpen >= STALE_INTAKE_DAYS * 2 ? "CAMPAIGN_MANAGER" : "VOLUNTEER_COORDINATOR",
        opsSourceType: "workflow_intake",
        opsVisibility: daysOpen >= STALE_INTAKE_DAYS * 2 ? "admin" : "operators",
        dueDays: 1,
        metadata: {
          workflowIntakeId: row.id,
          daysOpen,
          lifecycleStage: stage,
        },
      },
    });

    if (result.created) created += 1;
  }

  return created;
}

/** Batch runner — makes ladder feedbackReceives executable (Phase 6). */
export async function runOpsFeedbackLoops(): Promise<OpsFeedbackLoopRunResult> {
  const ranAt = new Date().toISOString();
  const skipped: string[] = [];
  const errors: string[] = [];

  if (!isDatabaseConfigured()) {
    return {
      ranAt,
      signalTasksCreated: 0,
      quietLeaderTasks: 0,
      overdueEscalations: 0,
      staleIntakeTasks: 0,
      skipped: ["database_not_configured"],
      errors: [],
    };
  }

  let signalTasksCreated = 0;
  let quietLeaderTasks = 0;
  let overdueEscalations = 0;
  let staleIntakeTasks = 0;

  try {
    signalTasksCreated = await autoCreateActionableSignalTasks();
  } catch (e) {
    errors.push(`signal_tasks: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    quietLeaderTasks = await createQuietLeader14DayTasks();
  } catch (e) {
    errors.push(`quiet_leaders: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    overdueEscalations = await escalateOverdueTasks();
  } catch (e) {
    errors.push(`overdue: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    staleIntakeTasks = await createStaleIntakeTasks();
  } catch (e) {
    errors.push(`stale_intake: ${e instanceof Error ? e.message : String(e)}`);
  }

  if (signalTasksCreated === 0 && quietLeaderTasks === 0 && overdueEscalations === 0 && staleIntakeTasks === 0) {
    skipped.push("nothing_new_to_create");
  }

  return {
    ranAt,
    signalTasksCreated,
    quietLeaderTasks,
    overdueEscalations,
    staleIntakeTasks,
    skipped,
    errors,
  };
}
