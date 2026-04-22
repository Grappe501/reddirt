import {
  CampaignTaskStatus,
  EventReadinessStatus,
  type CampaignEvent,
  type CampaignTask,
} from "@prisma/client";

export type ReadinessBreakdown = {
  comms: number; // 0-1
  staffing: number;
  prep: number;
  followUp: number;
};

function rScore(s: EventReadinessStatus | undefined) {
  if (s == null) return 0.5;
  if (s === "READY" || s === "N_A") return 1;
  if (s === "IN_PROGRESS" || s === "UNKNOWN") return 0.5;
  if (s === "AT_RISK" || s === "NOT_STARTED") return 0.2;
  return 0.5;
}

const OPEN: CampaignTaskStatus[] = [CampaignTaskStatus.TODO, CampaignTaskStatus.IN_PROGRESS, CampaignTaskStatus.BLOCKED];

export function isTaskOpen(t: { status: CampaignTaskStatus }): boolean {
  return OPEN.includes(t.status);
}

export function computeEventExecutionReadiness(input: {
  event: Pick<
    CampaignEvent,
    | "commsReadiness"
    | "staffingReadiness"
    | "prepReadiness"
    | "followupReadiness"
    | "id"
  >;
  tasks: Array<
    Pick<
      CampaignTask,
      | "id"
      | "status"
      | "dueAt"
      | "blocksReadiness"
      | "taskType"
      | "title"
      | "eventId"
      | "sourceTemplateTaskKey"
      | "priority"
    >
  >;
  now?: Date;
}): {
  score0to100: number;
  label: "Ready" | "At risk" | "Blocked" | "N/A";
  badgeClass: string;
  breakdown: ReadinessBreakdown;
  blockingTasks: (typeof input.tasks)[number][];
  overdueTasks: (typeof input.tasks)[number][];
  blockerCount: number;
  overdueCount: number;
  nextRequiredAction: string | null;
} {
  const now = input.now ?? new Date();
  const tasks = input.tasks.filter((t) => t.eventId === input.event.id);
  const open = tasks.filter(isTaskOpen);
  const blocking = open.filter((t) => t.blocksReadiness);
  const overdue = open.filter((t) => t.dueAt && t.dueAt < now);
  const breakdown: ReadinessBreakdown = {
    comms: rScore(input.event.commsReadiness),
    staffing: rScore(input.event.staffingReadiness),
    prep: rScore(input.event.prepReadiness),
    followUp: rScore(input.event.followupReadiness),
  };
  const taskPenalty = Math.min(0.4, (blocking.length * 0.08 + overdue.length * 0.04));
  const lane = (Object.values(breakdown).reduce((a, b) => a + b, 0) / 4) * (1 - taskPenalty);
  const score0to100 = Math.max(0, Math.min(100, Math.round(lane * 100)));

  const sortNext = [...open].sort((a, b) => {
    const ad = a.dueAt?.getTime() ?? Infinity;
    const bd = b.dueAt?.getTime() ?? Infinity;
    if (ad !== bd) return ad - bd;
    if (a.blocksReadiness !== b.blocksReadiness) return a.blocksReadiness ? -1 : 1;
    return 0;
  });
  const next = sortNext[0];
  let nextRequiredAction: string | null = null;
  if (blocking.length) {
    nextRequiredAction = `Unblock: ${blocking[0]!.title}`;
  } else if (overdue.length) {
    nextRequiredAction = `Overdue: ${overdue[0]!.title}`;
  } else if (next) {
    nextRequiredAction = `Next: ${next.title}${next.dueAt ? ` (due ${next.dueAt.toLocaleString()})` : ""}`;
  } else {
    const weak = (["comms", "staffing", "prep", "followUp"] as const)
      .map((k) => {
        const key =
          k === "comms"
            ? "commsReadiness"
            : k === "staffing"
              ? "staffingReadiness"
              : k === "prep"
                ? "prepReadiness"
                : "followupReadiness";
        return { k, v: input.event[key] };
      })
      .filter((x) => x.v !== "READY" && x.v !== "N_A");
    if (weak[0]) nextRequiredAction = `Tighten ${weak[0].k} lane (marked ${String(weak[0].v)})`;
  }

  const label: "Ready" | "At risk" | "Blocked" | "N/A" =
    blocking.length > 0 ? "Blocked" : score0to100 >= 78 ? "Ready" : score0to100 >= 50 ? "At risk" : "N/A";
  const badgeClass =
    label === "Blocked"
      ? "border-rose-800/40 bg-rose-50/90 text-rose-950"
      : label === "Ready"
        ? "border-field-green/50 bg-field-green/15 text-field-green/95"
        : label === "At risk"
          ? "border-amber-800/40 bg-amber-50/90 text-amber-950"
          : "border-deep-soil/20 bg-deep-soil/10 text-deep-soil/80";

  return {
    score0to100,
    label,
    badgeClass,
    breakdown,
    blockingTasks: blocking,
    overdueTasks: overdue,
    blockerCount: blocking.length,
    overdueCount: overdue.length,
    nextRequiredAction,
  };
}
