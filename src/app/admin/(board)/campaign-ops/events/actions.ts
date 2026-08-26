"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { prisma } from "@/lib/db";

export async function assignEventProjectManagerAction(formData: FormData) {
  await requireAdminAction();
  const eventId = String(formData.get("eventId") ?? "").trim();
  const ownerUserId = String(formData.get("ownerUserId") ?? "").trim() || null;
  if (!eventId) throw new Error("eventId is required");
  if (ownerUserId) {
    const exists = await prisma.user.findUnique({ where: { id: ownerUserId }, select: { id: true } });
    if (!exists) throw new Error("Selected project manager does not exist");
  }
  await prisma.campaignEvent.update({ where: { id: eventId }, data: { ownerUserId } });
  revalidatePath("/admin/campaign-ops/events");
  revalidatePath(`/admin/campaign-ops/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}`);
}
