"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import {
  addHumanActionNotes,
  archiveHumanAction,
  assignHumanActionOwner,
  updateHumanActionStatus,
} from "@/lib/intelligence/humanActionQueueWorkflow";
import type { HumanActionStatus } from "@/lib/intelligence/types/humanActionQueue";

const CHANGED_BY_ROUTE = "admin/intelligence/action-queue/action-actions";

const REVALIDATE_PATHS = [
  "/admin/intelligence/action-queue",
  "/admin/intelligence/morning-brief",
  "/admin/intelligence/kim-hammer/evidence-command",
  "/admin/intelligence/kim-hammer/audit-log",
  "/admin/intelligence",
];

function revalidateActionQueueSurfaces() {
  for (const routePath of REVALIDATE_PATHS) {
    revalidatePath(routePath);
  }
}

export async function updateHumanActionStatusAction(input: {
  actionId: string;
  operator: string;
  nextStatus: HumanActionStatus;
  notes?: string;
}) {
  await requireAdminAction();
  const result = updateHumanActionStatus({
    ...input,
    changedByRoute: CHANGED_BY_ROUTE,
  });
  if (result.ok) revalidateActionQueueSurfaces();
  return result;
}

export async function assignHumanActionOwnerAction(input: {
  actionId: string;
  operator: string;
  owner: string;
  notes?: string;
}) {
  await requireAdminAction();
  const result = assignHumanActionOwner({
    ...input,
    changedByRoute: CHANGED_BY_ROUTE,
  });
  if (result.ok) revalidateActionQueueSurfaces();
  return result;
}

export async function addHumanActionNotesAction(input: {
  actionId: string;
  operator: string;
  notes: string;
}) {
  await requireAdminAction();
  const result = addHumanActionNotes({
    ...input,
    changedByRoute: CHANGED_BY_ROUTE,
  });
  if (result.ok) revalidateActionQueueSurfaces();
  return result;
}

export async function archiveHumanActionAction(input: {
  actionId: string;
  operator: string;
  notes?: string;
}) {
  await requireAdminAction();
  const result = archiveHumanAction({
    ...input,
    changedByRoute: CHANGED_BY_ROUTE,
  });
  if (result.ok) revalidateActionQueueSurfaces();
  return result;
}
