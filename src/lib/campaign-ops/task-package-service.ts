import { CampaignTaskStatus, Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import {
  initializeTaskPackageMetadata,
  readTaskPackageMetadata,
  taskPackageCanBeClaimed,
  taskPackageCanBeSubmitted,
  taskPackageCanBeVerified,
  type TaskPackageMetadata,
  type TaskPackageWorksheetValue,
  writeTaskPackageMetadata,
} from "@/lib/campaign-ops/task-packages";

function asJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

async function loadTask(taskId: string) {
  const task = await prisma.campaignTask.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      title: true,
      status: true,
      assignedUserId: true,
      eventId: true,
      opsMetadataJson: true,
      completionNotes: true,
      completedAt: true,
    },
  });
  if (!task) throw new Error("Task not found");
  return task;
}

async function dependencyBlockers(pkg: TaskPackageMetadata): Promise<string[]> {
  if (pkg.dependencyTaskIds.length === 0) return [];
  const rows = await prisma.campaignTask.findMany({
    where: { id: { in: pkg.dependencyTaskIds } },
    select: { id: true, status: true },
  });
  const byId = new Map(rows.map((row) => [row.id, row.status]));
  return pkg.dependencyTaskIds.filter((id) => byId.get(id) !== CampaignTaskStatus.DONE);
}

export async function initializeTaskPackage(input: {
  taskId: string;
  objective?: string | null;
  instructions?: string[];
  acceptanceCriteria?: string[];
  dependencyTaskIds?: string[];
}) {
  const task = await loadTask(input.taskId);
  const existing = readTaskPackageMetadata(task.opsMetadataJson);
  if (existing) return { task, taskPackage: existing, created: false as const };

  const taskPackage = initializeTaskPackageMetadata(input);
  const updated = await prisma.campaignTask.update({
    where: { id: task.id },
    data: { opsMetadataJson: asJson(writeTaskPackageMetadata(task.opsMetadataJson, taskPackage)) },
    select: { id: true, opsMetadataJson: true },
  });
  return { task: updated, taskPackage, created: true as const };
}

export async function claimTaskPackage(taskId: string, userId: string) {
  const task = await loadTask(taskId);
  const pkg = readTaskPackageMetadata(task.opsMetadataJson);
  if (!pkg) throw new Error("Task package has not been initialized");
  if (!taskPackageCanBeClaimed(pkg)) throw new Error(`Task package cannot be claimed from ${pkg.state}`);
  if (pkg.claimedByUserId && pkg.claimedByUserId !== userId) throw new Error("Task package is already claimed");

  const blockers = await dependencyBlockers(pkg);
  if (blockers.length > 0) throw new Error(`Task package is blocked by ${blockers.length} dependency task(s)`);

  const now = new Date().toISOString();
  const next: TaskPackageMetadata = {
    ...pkg,
    state: "CLAIMED",
    claimedByUserId: userId,
    claimedAt: now,
    changesRequestedByUserId: null,
    changesRequestedAt: null,
    changesRequestedNote: null,
  };

  return prisma.campaignTask.update({
    where: { id: taskId },
    data: {
      assignedUserId: task.assignedUserId ?? userId,
      status: task.status === CampaignTaskStatus.TODO ? CampaignTaskStatus.IN_PROGRESS : task.status,
      opsMetadataJson: asJson(writeTaskPackageMetadata(task.opsMetadataJson, next)),
    },
  });
}

export async function saveTaskPackageWorksheet(input: {
  taskId: string;
  actorUserId: string;
  worksheet: Record<string, TaskPackageWorksheetValue>;
}) {
  const task = await loadTask(input.taskId);
  const pkg = readTaskPackageMetadata(task.opsMetadataJson);
  if (!pkg) throw new Error("Task package has not been initialized");
  if (pkg.state === "VERIFIED") throw new Error("Verified task packages are closed");
  if (pkg.claimedByUserId && pkg.claimedByUserId !== input.actorUserId) throw new Error("Task package is claimed by another user");

  const next: TaskPackageMetadata = {
    ...pkg,
    state: pkg.state === "OPEN" ? "IN_PROGRESS" : pkg.state === "CLAIMED" ? "IN_PROGRESS" : pkg.state,
    worksheet: { ...pkg.worksheet, ...input.worksheet },
  };

  return prisma.campaignTask.update({
    where: { id: input.taskId },
    data: {
      assignedUserId: task.assignedUserId ?? input.actorUserId,
      status: task.status === CampaignTaskStatus.TODO ? CampaignTaskStatus.IN_PROGRESS : task.status,
      opsMetadataJson: asJson(writeTaskPackageMetadata(task.opsMetadataJson, next)),
    },
  });
}

export async function addTaskPackageProof(input: {
  taskId: string;
  actorUserId: string;
  label: string;
  url?: string | null;
  note?: string | null;
}) {
  const task = await loadTask(input.taskId);
  const pkg = readTaskPackageMetadata(task.opsMetadataJson);
  if (!pkg) throw new Error("Task package has not been initialized");
  if (pkg.state === "VERIFIED") throw new Error("Verified task packages are closed");

  const proof = {
    id: randomUUID(),
    label: input.label.trim(),
    url: input.url?.trim() || null,
    note: input.note?.trim() || null,
    addedAt: new Date().toISOString(),
    addedByUserId: input.actorUserId,
  };
  if (!proof.label) throw new Error("Proof label is required");

  const next: TaskPackageMetadata = {
    ...pkg,
    state: pkg.state === "OPEN" || pkg.state === "CLAIMED" ? "IN_PROGRESS" : pkg.state,
    proof: [...pkg.proof, proof],
  };

  return prisma.campaignTask.update({
    where: { id: input.taskId },
    data: {
      status: task.status === CampaignTaskStatus.TODO ? CampaignTaskStatus.IN_PROGRESS : task.status,
      opsMetadataJson: asJson(writeTaskPackageMetadata(task.opsMetadataJson, next)),
    },
  });
}

export async function submitTaskPackage(input: {
  taskId: string;
  actorUserId: string;
  note?: string | null;
}) {
  const task = await loadTask(input.taskId);
  const pkg = readTaskPackageMetadata(task.opsMetadataJson);
  if (!pkg) throw new Error("Task package has not been initialized");
  if (!taskPackageCanBeSubmitted(pkg)) throw new Error(`Task package cannot be submitted from ${pkg.state}`);
  if (pkg.claimedByUserId && pkg.claimedByUserId !== input.actorUserId) throw new Error("Task package is claimed by another user");

  const blockers = await dependencyBlockers(pkg);
  if (blockers.length > 0) throw new Error(`Task package is blocked by ${blockers.length} dependency task(s)`);

  const next: TaskPackageMetadata = {
    ...pkg,
    state: "SUBMITTED",
    submittedByUserId: input.actorUserId,
    submittedAt: new Date().toISOString(),
    submissionNote: input.note?.trim() || null,
  };

  return prisma.campaignTask.update({
    where: { id: input.taskId },
    data: {
      status: CampaignTaskStatus.IN_PROGRESS,
      opsMetadataJson: asJson(writeTaskPackageMetadata(task.opsMetadataJson, next)),
    },
  });
}

export async function verifyTaskPackage(input: {
  taskId: string;
  verifierUserId: string;
  note?: string | null;
}) {
  const task = await loadTask(input.taskId);
  const pkg = readTaskPackageMetadata(task.opsMetadataJson);
  if (!pkg) throw new Error("Task package has not been initialized");
  if (!taskPackageCanBeVerified(pkg)) throw new Error(`Task package cannot be verified from ${pkg.state}`);

  const now = new Date();
  const next: TaskPackageMetadata = {
    ...pkg,
    state: "VERIFIED",
    verifiedByUserId: input.verifierUserId,
    verifiedAt: now.toISOString(),
    verificationNote: input.note?.trim() || null,
  };

  return prisma.campaignTask.update({
    where: { id: input.taskId },
    data: {
      status: CampaignTaskStatus.DONE,
      completedAt: now,
      completionNotes: input.note?.trim() || task.completionNotes || "Task package verified",
      opsMetadataJson: asJson(writeTaskPackageMetadata(task.opsMetadataJson, next)),
    },
  });
}

export async function requestTaskPackageChanges(input: {
  taskId: string;
  verifierUserId: string;
  note: string;
}) {
  const task = await loadTask(input.taskId);
  const pkg = readTaskPackageMetadata(task.opsMetadataJson);
  if (!pkg) throw new Error("Task package has not been initialized");
  if (pkg.state !== "SUBMITTED") throw new Error(`Changes can only be requested from SUBMITTED, not ${pkg.state}`);
  const note = input.note.trim();
  if (!note) throw new Error("A change request note is required");

  const next: TaskPackageMetadata = {
    ...pkg,
    state: "CHANGES_REQUESTED",
    changesRequestedByUserId: input.verifierUserId,
    changesRequestedAt: new Date().toISOString(),
    changesRequestedNote: note,
    verifiedByUserId: null,
    verifiedAt: null,
    verificationNote: null,
  };

  return prisma.campaignTask.update({
    where: { id: input.taskId },
    data: {
      status: CampaignTaskStatus.IN_PROGRESS,
      completedAt: null,
      completionNotes: null,
      opsMetadataJson: asJson(writeTaskPackageMetadata(task.opsMetadataJson, next)),
    },
  });
}

export async function listTaskPackages(take = 100) {
  const tasks = await prisma.campaignTask.findMany({
    where: { opsMetadataJson: { not: Prisma.JsonNull } },
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
    take,
    include: {
      event: { select: { id: true, title: true, startAt: true } },
      assignee: { select: { id: true, name: true, email: true } },
    },
  });

  return tasks.flatMap((task) => {
    const taskPackage = readTaskPackageMetadata(task.opsMetadataJson);
    return taskPackage ? [{ ...task, taskPackage }] : [];
  });
}
