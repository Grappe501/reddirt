import type {
  EventTaskPackage,
  EventTaskPackageActor,
  EventTaskPackageEvidence,
  EventTaskPackagePriority,
  EventTaskPackageStatus,
  EventTaskPackageTransition,
} from "./event-planning-types";

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowIso(now?: string): string {
  return now ?? new Date().toISOString();
}

function assertTransition(current: EventTaskPackageStatus, allowed: EventTaskPackageStatus[], action: string) {
  if (!allowed.includes(current)) {
    throw new Error(`Cannot ${action} task package while status is ${current}.`);
  }
}

function historyEntry(
  action: EventTaskPackageTransition["action"],
  fromStatus: EventTaskPackageStatus | null,
  toStatus: EventTaskPackageStatus,
  actor: EventTaskPackageActor,
  note: string | undefined,
  at: string,
): EventTaskPackageTransition {
  return {
    id: id("task-history"),
    action,
    fromStatus,
    toStatus,
    actorUserId: actor.userId,
    actorLabel: actor.label,
    note: note?.trim() || undefined,
    at,
  };
}

export type CreateEventTaskPackageInput = {
  title: string;
  description?: string;
  instructions?: string[];
  assignedRole?: string;
  priority?: EventTaskPackagePriority;
  dueAt?: string;
  blocksReadiness?: boolean;
};

export function createEventTaskPackage(
  input: CreateEventTaskPackageInput,
  actor: EventTaskPackageActor,
  now?: string,
): EventTaskPackage {
  const title = input.title.trim();
  if (!title) throw new Error("Task package title is required.");
  const at = nowIso(now);
  const status: EventTaskPackageStatus = "OPEN";
  return {
    id: id("event-task"),
    title,
    description: input.description?.trim() || "",
    instructions: (input.instructions ?? []).map((step) => step.trim()).filter(Boolean),
    assignedRole: input.assignedRole?.trim() || "",
    priority: input.priority ?? "MEDIUM",
    dueAt: input.dueAt,
    blocksReadiness: input.blocksReadiness ?? false,
    status,
    evidence: [],
    history: [historyEntry("CREATED", null, status, actor, undefined, at)],
    createdAt: at,
    updatedAt: at,
  };
}

export function claimEventTaskPackage(
  task: EventTaskPackage,
  actor: EventTaskPackageActor,
  now?: string,
): EventTaskPackage {
  assertTransition(task.status, ["OPEN"], "claim");
  const at = nowIso(now);
  return {
    ...task,
    status: "CLAIMED",
    claimedByUserId: actor.userId,
    claimedByLabel: actor.label,
    claimedAt: at,
    updatedAt: at,
    history: [...task.history, historyEntry("CLAIMED", task.status, "CLAIMED", actor, undefined, at)],
  };
}

export function startEventTaskPackage(
  task: EventTaskPackage,
  actor: EventTaskPackageActor,
  note?: string,
  now?: string,
): EventTaskPackage {
  assertTransition(task.status, ["CLAIMED", "CHANGES_REQUESTED"], "start");
  if (task.claimedByUserId && task.claimedByUserId !== actor.userId) {
    throw new Error("Only the volunteer who claimed this task package can start it.");
  }
  const at = nowIso(now);
  return {
    ...task,
    status: "IN_PROGRESS",
    startedAt: task.startedAt ?? at,
    updatedAt: at,
    history: [...task.history, historyEntry("STARTED", task.status, "IN_PROGRESS", actor, note, at)],
  };
}

export function addEventTaskEvidence(
  task: EventTaskPackage,
  input: Omit<EventTaskPackageEvidence, "id" | "addedAt">,
  actor: EventTaskPackageActor,
  now?: string,
): EventTaskPackage {
  assertTransition(task.status, ["CLAIMED", "IN_PROGRESS", "CHANGES_REQUESTED"], "add evidence to");
  const url = input.url.trim();
  const note = input.note?.trim() || "";
  if (!url && !note) throw new Error("Evidence requires a URL or note.");
  const at = nowIso(now);
  const evidence: EventTaskPackageEvidence = {
    id: id("task-proof"),
    label: input.label?.trim() || "Proof / deliverable",
    url,
    note,
    addedAt: at,
  };
  return {
    ...task,
    evidence: [...task.evidence, evidence],
    updatedAt: at,
    history: [...task.history, historyEntry("EVIDENCE_ADDED", task.status, task.status, actor, evidence.label, at)],
  };
}

export function submitEventTaskPackage(
  task: EventTaskPackage,
  actor: EventTaskPackageActor,
  submissionNote: string,
  now?: string,
): EventTaskPackage {
  assertTransition(task.status, ["IN_PROGRESS", "CHANGES_REQUESTED"], "submit");
  if (task.claimedByUserId && task.claimedByUserId !== actor.userId) {
    throw new Error("Only the volunteer who claimed this task package can submit it.");
  }
  const note = submissionNote.trim();
  if (!note && task.evidence.length === 0) {
    throw new Error("Submission requires a completion note or proof.");
  }
  const at = nowIso(now);
  return {
    ...task,
    status: "SUBMITTED",
    submissionNote: note,
    submittedAt: at,
    updatedAt: at,
    history: [...task.history, historyEntry("SUBMITTED", task.status, "SUBMITTED", actor, note || undefined, at)],
  };
}

export function requestEventTaskChanges(
  task: EventTaskPackage,
  actor: EventTaskPackageActor,
  note: string,
  now?: string,
): EventTaskPackage {
  assertTransition(task.status, ["SUBMITTED"], "request changes for");
  const changeNote = note.trim();
  if (!changeNote) throw new Error("A change request must explain what needs to change.");
  const at = nowIso(now);
  return {
    ...task,
    status: "CHANGES_REQUESTED",
    verificationNote: changeNote,
    verifiedAt: undefined,
    verifiedByUserId: undefined,
    verifiedByLabel: undefined,
    updatedAt: at,
    history: [...task.history, historyEntry("CHANGES_REQUESTED", task.status, "CHANGES_REQUESTED", actor, changeNote, at)],
  };
}

export function verifyEventTaskPackage(
  task: EventTaskPackage,
  actor: EventTaskPackageActor,
  note?: string,
  now?: string,
): EventTaskPackage {
  assertTransition(task.status, ["SUBMITTED"], "verify");
  const at = nowIso(now);
  return {
    ...task,
    status: "VERIFIED",
    verificationNote: note?.trim() || "",
    verifiedAt: at,
    verifiedByUserId: actor.userId,
    verifiedByLabel: actor.label,
    updatedAt: at,
    history: [...task.history, historyEntry("VERIFIED", task.status, "VERIFIED", actor, note, at)],
  };
}

export function eventTaskPackageProgress(tasks: EventTaskPackage[]) {
  const total = tasks.length;
  const verified = tasks.filter((task) => task.status === "VERIFIED").length;
  const submitted = tasks.filter((task) => task.status === "SUBMITTED").length;
  const blocked = tasks.filter((task) => task.blocksReadiness && task.status !== "VERIFIED");
  return {
    total,
    verified,
    submitted,
    open: tasks.filter((task) => task.status === "OPEN").length,
    active: tasks.filter((task) => ["CLAIMED", "IN_PROGRESS", "CHANGES_REQUESTED"].includes(task.status)).length,
    percentVerified: total === 0 ? 100 : Math.round((verified / total) * 100),
    readinessBlockers: blocked.map((task) => task.title),
  };
}
