"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { updateKimHammerRetrievalTask } from "@/lib/opposition/kimHammerTaskWorkflow";
import type {
  KimHammerRetrievalTaskStatus,
  KimHammerTaskPriority,
} from "@/lib/opposition/types/kimHammerEvidence";

const TASK_CHANGED_BY_ROUTE =
  "admin/intelligence/kim-hammer/task-actions#updateKimHammerRetrievalTaskAction";

const TASK_REVALIDATE_PATHS = [
  "/admin/intelligence/kim-hammer",
  "/admin/intelligence/kim-hammer/evidence-command",
  "/admin/intelligence/kim-hammer/intelligence-gaps",
  "/admin/intelligence/kim-hammer/research-gaps",
];

function revalidateKimHammerTaskSurfaces() {
  for (const routePath of TASK_REVALIDATE_PATHS) {
    revalidatePath(routePath);
  }
}

export async function updateKimHammerRetrievalTaskAction(input: {
  taskId: string;
  operator: string;
  nextStatus?: KimHammerRetrievalTaskStatus;
  owner?: string;
  priority?: KimHammerTaskPriority;
  dueDate?: string | null;
  completionNotes?: string;
  reviewRequired?: boolean;
  producedEvidenceLink?: string;
}) {
  await requireAdminAction();

  const result = updateKimHammerRetrievalTask({
    ...input,
    changedByRoute: TASK_CHANGED_BY_ROUTE,
  });

  if (result.ok) {
    revalidateKimHammerTaskSurfaces();
  }

  return result;
}
