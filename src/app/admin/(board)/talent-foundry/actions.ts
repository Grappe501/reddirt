"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, WorkflowActionKind } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { requireAdminPage } from "@/lib/admin/require-admin";
import { TALENT_FOUNDRY_SOURCE } from "@/lib/forms/schemas";
import {
  AREA_ASSIGNMENTS,
  CONFIRMED_PATHWAYS,
  INTERN_DECISIONS,
  INTERVIEW_STATUSES,
  type AreaAssignmentId,
  type ConfirmedPathway,
  type InternDecision,
  type InterviewStatus,
} from "@/lib/talent-foundry/constants";
import { mergeStaffState, parseStaffState } from "@/lib/talent-foundry/staff-state";

const PATH = "/admin/talent-foundry";

function trim(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function isTfIntake(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return false;
  const m = metadata as Record<string, unknown>;
  if (m.sourceCampaign === TALENT_FOUNDRY_SOURCE) return true;
  return Boolean(
    m.talentFoundry &&
      typeof m.talentFoundry === "object" &&
      !Array.isArray(m.talentFoundry) &&
      (m.talentFoundry as Record<string, unknown>).source === TALENT_FOUNDRY_SOURCE,
  );
}

async function requireTfIntake(id: string) {
  await requireAdminPage();
  if (!id) redirect(`${PATH}?error=id`);
  const row = await prisma.workflowIntake.findUnique({
    where: { id },
    select: { id: true, metadata: true, assignedUserId: true },
  });
  if (!row || !isTfIntake(row.metadata)) redirect(`${PATH}?error=not-found`);
  return row;
}

async function logAction(input: {
  workflowIntakeId: string;
  kind: WorkflowActionKind;
  summary: string;
  metadata?: Record<string, unknown>;
}) {
  const actorUserId = await getAdminActorUserId();
  await prisma.workflowAction.create({
    data: {
      workflowIntakeId: input.workflowIntakeId,
      actorUserId,
      kind: input.kind,
      summary: input.summary,
      metadata: { packet: "TALENT_FOUNDRY_STAFF", ...input.metadata },
    },
  });
}

function bounce(id: string, notice: string) {
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  redirect(`${PATH}/${id}?notice=${notice}`);
}

export async function updateTalentFoundryStaffAction(fd: FormData): Promise<void> {
  const id = trim(fd, "intakeId");
  const row = await requireTfIntake(id);
  const current = parseStaffState(row.metadata);

  const rankRaw = trim(fd, "humanRank");
  const humanRank = rankRaw === "" ? null : Number(rankRaw);
  const safeRank = humanRank != null && Number.isFinite(humanRank) && humanRank >= 1 && humanRank <= 999
    ? Math.floor(humanRank)
    : null;

  const interviewStatus = INTERVIEW_STATUSES.includes(trim(fd, "interviewStatus") as InterviewStatus)
    ? (trim(fd, "interviewStatus") as InterviewStatus)
    : current.interviewStatus;
  const internDecision = INTERN_DECISIONS.includes(trim(fd, "internDecision") as InternDecision)
    ? (trim(fd, "internDecision") as InternDecision)
    : current.internDecision;
  const pathwayRaw = trim(fd, "pathway");
  const pathway = CONFIRMED_PATHWAYS.includes(pathwayRaw as ConfirmedPathway)
    ? (pathwayRaw as ConfirmedPathway)
    : null;
  const interviewer = trim(fd, "interviewer").slice(0, 160);
  const areaAssignment = fd
    .getAll("areaAssignment")
    .filter((v): v is string => typeof v === "string")
    .filter((id): id is AreaAssignmentId => AREA_ASSIGNMENTS.some((a) => a.id === id));

  const metadata = mergeStaffState(row.metadata, {
    humanRank: safeRank,
    interviewStatus,
    interviewer,
    internDecision,
    pathway,
    areaAssignment,
    reviewedAt: current.reviewedAt ?? new Date().toISOString(),
  });

  await prisma.workflowIntake.update({
    where: { id },
    data: { metadata: metadata as Prisma.InputJsonValue },
  });

  const changes: string[] = [];
  if (current.humanRank !== safeRank) changes.push(`rank ${current.humanRank ?? "none"} → ${safeRank ?? "none"}`);
  if (current.interviewStatus !== interviewStatus) changes.push(`interview ${current.interviewStatus} → ${interviewStatus}`);
  if (current.internDecision !== internDecision) changes.push(`intern ${current.internDecision} → ${internDecision}`);
  if (current.pathway !== pathway) changes.push(`pathway ${current.pathway ?? "none"} → ${pathway ?? "none"}`);
  if (current.interviewer !== interviewer && interviewer) changes.push(`interviewer set`);
  if (current.areaAssignment.join(",") !== areaAssignment.join(",")) changes.push("area assignment updated");

  if (changes.length) {
    await logAction({
      workflowIntakeId: id,
      kind: internDecision !== current.internDecision ? WorkflowActionKind.DECISION : WorkflowActionKind.OTHER,
      summary: `Staff update: ${changes.join("; ")}`,
      metadata: { humanRank: safeRank, interviewStatus, internDecision, pathway, areaAssignment },
    });
  }

  bounce(id, "saved");
}

export async function assignTalentFoundryOwnerAction(fd: FormData): Promise<void> {
  const id = trim(fd, "intakeId");
  await requireTfIntake(id);
  const email = trim(fd, "ownerEmail").toLowerCase();
  if (!email) redirect(`${PATH}/${id}?error=owner-email`);

  const owner = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });
  if (!owner) redirect(`${PATH}/${id}?error=owner-not-found`);

  await prisma.workflowIntake.update({
    where: { id },
    data: { assignedUserId: owner.id },
  });
  await logAction({
    workflowIntakeId: id,
    kind: WorkflowActionKind.ASSIGNMENT,
    summary: `Team contact assigned to ${owner.name || owner.email}`,
    metadata: { assignedUserId: owner.id, assignedEmail: owner.email },
  });
  bounce(id, "owner");
}

export async function clearTalentFoundryOwnerAction(fd: FormData): Promise<void> {
  const id = trim(fd, "intakeId");
  await requireTfIntake(id);
  await prisma.workflowIntake.update({
    where: { id },
    data: { assignedUserId: null },
  });
  await logAction({
    workflowIntakeId: id,
    kind: WorkflowActionKind.ASSIGNMENT,
    summary: "Team contact cleared — NEEDS OWNER",
  });
  bounce(id, "owner-cleared");
}

export async function addTalentFoundryNoteAction(fd: FormData): Promise<void> {
  const id = trim(fd, "intakeId");
  await requireTfIntake(id);
  const note = trim(fd, "note").slice(0, 4000);
  if (!note) redirect(`${PATH}/${id}?error=note`);
  await logAction({
    workflowIntakeId: id,
    kind: WorkflowActionKind.NOTE,
    summary: note,
  });
  bounce(id, "note");
}
