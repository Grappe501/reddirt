"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { launchEventOperations } from "@/lib/campaign-ops/launch-operations";

const PATH = "/admin/campaign-ops/launch-operations";

export async function launchEventOperationsAction(formData: FormData) {
  await requireAdminAction();
  const eventId = String(formData.get("eventId") ?? "").trim();
  if (!eventId) throw new Error("eventId is required");
  await launchEventOperations({ eventId });
  revalidatePath(PATH);
  revalidatePath("/admin/campaign-ops/task-packages");
  revalidatePath("/admin/tasks");
  revalidatePath("/admin/calendar");
}
