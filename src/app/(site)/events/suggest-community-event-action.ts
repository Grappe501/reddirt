"use server";

import { revalidatePath } from "next/cache";
import { FestivalIngestReviewStatus, FestivalSourceChannel } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { suggestCommunityEventSchema } from "@/lib/forms/schemas";
import { parseArkansasLocalDateTime } from "@/lib/time/arkansas-tz";
import { prisma } from "@/lib/db";

export type SuggestCommunityEventResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function suggestCommunityEventAction(
  _prev: SuggestCommunityEventResult | null,
  formData: FormData,
): Promise<SuggestCommunityEventResult> {
  const raw = {
    eventName: String(formData.get("eventName") ?? "").trim(),
    shortDescription: String(formData.get("shortDescription") ?? "").trim() || undefined,
    startDate: String(formData.get("startDate") ?? "").trim(),
    startTime: String(formData.get("startTime") ?? "").trim(),
    endDate: String(formData.get("endDate") ?? "").trim(),
    endTime: String(formData.get("endTime") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim() || undefined,
    countyId: String(formData.get("countyId") ?? "").trim() || undefined,
    venueName: String(formData.get("venueName") ?? "").trim() || undefined,
    infoUrl: String(formData.get("infoUrl") ?? "").trim() || undefined,
    submitterName: String(formData.get("submitterName") ?? "").trim(),
    submitterEmail: String(formData.get("submitterEmail") ?? "").trim(),
    website: String(formData.get("website") ?? ""),
  };

  const parsed = suggestCommunityEventSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const p = i.path[0];
      if (typeof p === "string" && !fieldErrors[p]) fieldErrors[p] = i.message;
      else if (i.path.length === 0 && !fieldErrors.infoUrl) fieldErrors.infoUrl = i.message;
    }
    return { ok: false, error: "Check the form and try again.", fieldErrors };
  }

  const d = parsed.data;
  const startAt = parseArkansasLocalDateTime(d.startDate, d.startTime);
  const endAt = parseArkansasLocalDateTime(d.endDate, d.endTime);
  if (endAt.getTime() < startAt.getTime()) {
    return { ok: false, error: "End must be on or after start.", fieldErrors: { endTime: "End must be on or after start (Central time)." } };
  }

  if (d.countyId) {
    const c = await prisma.county.findUnique({ where: { id: d.countyId }, select: { id: true } });
    if (!c) {
      return { ok: false, error: "Invalid county selected.", fieldErrors: { countyId: "Pick a valid county or leave blank." } };
    }
  }

  await prisma.arkansasFestivalIngest.create({
    data: {
      name: d.eventName,
      shortDescription: d.shortDescription || null,
      startAt,
      endAt,
      city: d.city || null,
      countyId: d.countyId || null,
      venueName: d.venueName || null,
      sourceUrl: `sos:public-form:${randomUUID()}`,
      sourceChannel: FestivalSourceChannel.PUBLIC_FORM,
      submitterName: d.submitterName,
      submitterEmail: d.submitterEmail,
      submitterInfoUrl: d.infoUrl || null,
      reviewStatus: FestivalIngestReviewStatus.PENDING_REVIEW,
      isVisibleOnSite: false,
      rawPayload: { source: "movement_events_page", submittedAt: new Date().toISOString() },
    },
  });

  revalidatePath("/admin/workbench");
  revalidatePath("/admin/workbench/festivals");
  revalidatePath("/admin/events/community-suggestions");
  revalidatePath("/admin/events");
  revalidatePath("/events");

  redirect("/events?ok=suggest#suggest");
}
