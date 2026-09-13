"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { WorkflowActionKind, WorkflowIntakeStatus } from "@prisma/client";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { sanitizeIntakeNote } from "@/lib/analytics/site-traffic-alert-rules";
import { prisma } from "@/lib/db";

const STATUSES = {
  IN_REVIEW: "IN_REVIEW",
  AWAITING_INFO: "AWAITING_INFO",
  CONVERTED: "CONVERTED",
} as const satisfies Record<string, WorkflowIntakeStatus>;

function trim(fd: FormData, key: string): string {
  const value = fd.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function intakePath(id: string, notice: string): string {
  return `/admin/site-analytics/intake/${id}?notice=${notice}`;
}

export async function updateVisitorIntakeAction(formData: FormData): Promise<void> {
  await requireAdminAction();
  const actorUserId = await getAdminActorUserId();
  const id = trim(formData, "intakeId");
  const statusRaw = trim(formData, "status");
  const note = sanitizeIntakeNote(trim(formData, "note"));
  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(id)) redirect("/admin/site-analytics?days=1");

  const row = await prisma.workflowIntake.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!row) redirect("/admin/site-analytics?days=1");

  const nextStatus = statusRaw && statusRaw in STATUSES ? STATUSES[statusRaw as keyof typeof STATUSES] : null;
  if (!nextStatus && !note) redirect(intakePath(id, "empty"));

  if (nextStatus && nextStatus !== row.status) {
    await prisma.workflowIntake.update({ where: { id }, data: { status: nextStatus } });
    await prisma.workflowAction.create({
      data: {
        workflowIntakeId: id,
        actorUserId,
        kind: "STATUS_CHANGE",
        fromStatus: row.status,
        toStatus: nextStatus,
        summary: note || `Marked ${nextStatus.replaceAll("_", " ").toLowerCase()} from the visitor desk.`,
        metadata: { packet: "VISITOR_DESK_INTAKE" },
      },
    });
  } else if (note) {
    await prisma.workflowAction.create({
      data: {
        workflowIntakeId: id,
        actorUserId,
        kind: WorkflowActionKind.NOTE,
        summary: note,
        metadata: { packet: "VISITOR_DESK_INTAKE" },
      },
    });
  }

  revalidatePath(`/admin/site-analytics/intake/${id}`);
  revalidatePath("/admin/site-analytics");
  redirect(intakePath(id, nextStatus ? "saved" : "noted"));
}
