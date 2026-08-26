import { CampaignTaskStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { readTaskPackageMetadata } from "@/lib/campaign-ops/task-packages";
import { LAUNCH_OPERATIONS_VERSION, type OperationsWorkstream } from "@/lib/campaign-ops/launch-operations";

const PREFIX = `campaign-ops-v${LAUNCH_OPERATIONS_VERSION}:`;

export type EventInformationGateItem = {
  key: string;
  label: string;
  complete: boolean;
  detail?: string;
};

export type EventPmTaskView = {
  id: string;
  title: string;
  status: CampaignTaskStatus;
  priority: string;
  dueAt: Date | null;
  assignedUserId: string | null;
  assignedUserLabel: string | null;
  assignedRole: string | null;
  blocksReadiness: boolean;
  workstream: OperationsWorkstream;
  blueprintKey: string;
  packageState: string;
  dependencyTaskIds: string[];
  dependencyBlockers: number;
  overdue: boolean;
  unclaimed: boolean;
  submittedForReview: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function launchMeta(value: unknown): { workstream: OperationsWorkstream; blueprintKey: string } | null {
  if (!isRecord(value) || !isRecord(value.launchOperations)) return null;
  const raw = value.launchOperations;
  const workstream = raw.workstream;
  const blueprintKey = raw.blueprintKey;
  if ((workstream !== "PROJECT_MANAGEMENT" && workstream !== "COMMUNICATIONS" && workstream !== "EVENT_OPERATIONS") || typeof blueprintKey !== "string") return null;
  return { workstream, blueprintKey };
}

export function buildInformationGate(event: {
  title: string;
  startAt: Date;
  endAt: Date;
  countyId: string | null;
  city: string | null;
  locationName: string | null;
  address: string | null;
  ownerUserId: string | null;
  campaignIntent: string | null;
  internalSummary: string | null;
}): EventInformationGateItem[] {
  return [
    { key: "title", label: "Event title", complete: Boolean(event.title.trim()) },
    { key: "time", label: "Start and end time", complete: event.startAt instanceof Date && event.endAt instanceof Date && event.endAt > event.startAt },
    { key: "county", label: "County", complete: Boolean(event.countyId) },
    { key: "city", label: "City / town", complete: Boolean(event.city?.trim()) },
    { key: "venue", label: "Venue / location name", complete: Boolean(event.locationName?.trim()) },
    { key: "address", label: "Street address", complete: Boolean(event.address?.trim()) },
    { key: "pm", label: "Event Project Manager", complete: Boolean(event.ownerUserId), detail: "Uses the canonical CampaignEvent owner for beta." },
    { key: "purpose", label: "Why we are going", complete: Boolean(event.campaignIntent?.trim() || event.internalSummary?.trim()), detail: "Campaign intent or internal summary supplies the operational purpose." },
  ];
}

function percent(done: number, total: number) {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export async function getEventPmCommandCenter(eventId: string) {
  const event = await prisma.campaignEvent.findUnique({
    where: { id: eventId },
    include: {
      county: { select: { displayName: true } },
      ownerUser: { select: { id: true, name: true, email: true } },
      tasks: {
        where: { sourceTemplateTaskKey: { startsWith: PREFIX } },
        orderBy: [{ dueAt: "asc" }, { createdAt: "asc" }],
        include: { assignee: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!event) return null;

  const taskIds = event.tasks.map((task) => task.id);
  const statusRows = taskIds.length
    ? await prisma.campaignTask.findMany({ where: { id: { in: taskIds } }, select: { id: true, status: true } })
    : [];
  const statusById = new Map(statusRows.map((row) => [row.id, row.status]));
  const now = new Date();

  const tasks: EventPmTaskView[] = event.tasks.flatMap((task) => {
    const meta = launchMeta(task.opsMetadataJson);
    const pkg = readTaskPackageMetadata(task.opsMetadataJson);
    if (!meta || !pkg) return [];
    const dependencyBlockers = pkg.dependencyTaskIds.filter((id) => statusById.get(id) !== CampaignTaskStatus.DONE).length;
    const assignedUserLabel = task.assignee?.name || task.assignee?.email || null;
    return [{
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueAt: task.dueAt,
      assignedUserId: task.assignedUserId,
      assignedUserLabel,
      assignedRole: task.assignedRole,
      blocksReadiness: task.blocksReadiness,
      workstream: meta.workstream,
      blueprintKey: meta.blueprintKey,
      packageState: pkg.state,
      dependencyTaskIds: pkg.dependencyTaskIds,
      dependencyBlockers,
      overdue: Boolean(task.dueAt && task.dueAt < now && task.status !== CampaignTaskStatus.DONE && task.status !== CampaignTaskStatus.CANCELLED),
      unclaimed: !task.assignedUserId && pkg.state === "OPEN",
      submittedForReview: pkg.state === "SUBMITTED",
    }];
  });

  const informationGate = buildInformationGate(event);
  const missingInformation = informationGate.filter((item) => !item.complete);
  const workstreams = (["PROJECT_MANAGEMENT", "COMMUNICATIONS", "EVENT_OPERATIONS"] as OperationsWorkstream[]).map((workstream) => {
    const rows = tasks.filter((task) => task.workstream === workstream);
    const done = rows.filter((task) => task.status === CampaignTaskStatus.DONE).length;
    const blockers = rows.filter((task) => task.blocksReadiness && task.status !== CampaignTaskStatus.DONE).length;
    return { workstream, total: rows.length, done, percent: percent(done, rows.length), blockers };
  });
  const done = tasks.filter((task) => task.status === CampaignTaskStatus.DONE).length;

  return {
    event,
    tasks,
    informationGate,
    missingInformation,
    workstreams,
    summary: {
      total: tasks.length,
      done,
      percent: percent(done, tasks.length),
      unclaimed: tasks.filter((task) => task.unclaimed).length,
      overdue: tasks.filter((task) => task.overdue).length,
      blocked: tasks.filter((task) => task.dependencyBlockers > 0 || task.status === CampaignTaskStatus.BLOCKED).length,
      submitted: tasks.filter((task) => task.submittedForReview).length,
      readinessBlockers: tasks.filter((task) => task.blocksReadiness && task.status !== CampaignTaskStatus.DONE).length,
      missingInformation: missingInformation.length,
    },
  };
}

export async function listEventPmPortfolio(take = 100) {
  const events = await prisma.campaignEvent.findMany({
    where: { isTravelLeg: false, status: { not: "CANCELED" }, startAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, tasks: { some: { sourceTemplateTaskKey: { startsWith: PREFIX } } } },
    orderBy: { startAt: "asc" },
    take,
    select: { id: true, title: true, startAt: true, city: true, ownerUser: { select: { name: true, email: true } } },
  });
  const results = [];
  for (const event of events) {
    const center = await getEventPmCommandCenter(event.id);
    if (!center) continue;
    results.push({
      id: event.id,
      title: event.title,
      startAt: event.startAt,
      city: event.city,
      pm: event.ownerUser?.name || event.ownerUser?.email || null,
      ...center.summary,
    });
  }
  return results;
}
