import "server-only";

import type { CampaignEvent } from "@prisma/client";
import { EventWorkflowState } from "@prisma/client";
import { prisma } from "@/lib/db";
import { computeKellyGoogleContentHash } from "@/lib/calendar/kelly-google-content-hash";
import { pushCampaignEventToGoogle } from "@/lib/calendar/google-sync-engine";
import {
  getKellyCalendarLaneForCampaignEvent,
  selectKellyOutboundCalendarSource,
  type KellyGoogleCalendarLane,
} from "@/lib/calendar/kelly-google-calendar-policy";

export { computeKellyGoogleContentHash } from "@/lib/calendar/kelly-google-content-hash";

function buildKellyGoogleDescription(
  ev: Pick<
    CampaignEvent,
    | "id"
    | "title"
    | "startAt"
    | "endAt"
    | "timezone"
    | "locationName"
    | "eventWorkflowState"
    | "description"
    | "publicSummary"
  >,
  lane: KellyGoogleCalendarLane,
  countyName: string | null,
): string {
  const when = `${ev.startAt.toLocaleString("en-US", { timeZone: ev.timezone })} – ${ev.endAt.toLocaleString("en-US", { timeZone: ev.timezone })} (${ev.timezone})`;
  const safeBody = (ev.publicSummary ?? ev.description ?? "").trim().slice(0, 4000);
  const lines = [
    ev.title,
    "",
    `When: ${when}`,
    ev.locationName ? `Where: ${ev.locationName}` : null,
    countyName ? `County: ${countyName}` : null,
    `Status: ${ev.eventWorkflowState}`,
    safeBody ? "" : null,
    safeBody || null,
    "",
    `— RedDirt-managed · lane ${lane} · sync v2 · campaign event ${ev.id}`,
    "Do not add phone numbers or persuasion notes to this description.",
  ].filter((l) => l !== null) as string[];
  return lines.join("\n");
}

async function resolveCountyName(countyId: string | null): Promise<string | null> {
  if (!countyId) return null;
  const c = await prisma.county.findUnique({ where: { id: countyId }, select: { displayName: true } });
  return c?.displayName ?? null;
}

/**
 * Pushes a Kelly-linked `CampaignEvent` to the correct Tentative/Confirmed Google calendar with private extended props.
 * Falls back to legacy `pushCampaignEventToGoogle` when public-site publishing or Kelly lanes are unavailable.
 */
export async function syncKellyCampaignEventToGoogle(campaignEventId: string, actorUserId: string | null) {
  const event = await prisma.campaignEvent.findUnique({
    where: { id: campaignEventId },
    include: { county: { select: { displayName: true } } },
  });
  if (!event) throw new Error("CampaignEvent not found");

  if (event.eventWorkflowState === EventWorkflowState.PUBLISHED && event.isPublicOnWebsite) {
    await pushCampaignEventToGoogle(campaignEventId, actorUserId);
    return { ok: true as const, mode: "public_rail" as const };
  }

  const pair = await selectKellyOutboundCalendarSource(event);
  if (!pair) {
    await pushCampaignEventToGoogle(campaignEventId, actorUserId);
    return { ok: true as const, mode: "legacy_rail" as const };
  }

  const promo = await prisma.kellyCalendarPromotion.findFirst({
    where: { campaignEventId },
    select: { calendarItemId: true },
  });
  const calendarItemId = promo?.calendarItemId ?? "";
  const lane = getKellyCalendarLaneForCampaignEvent(event);
  const hash = computeKellyGoogleContentHash(event);
  const countyName = event.county?.displayName ?? (await resolveCountyName(event.countyId));
  const description = buildKellyGoogleDescription(event, lane, countyName);

  await pushCampaignEventToGoogle(campaignEventId, actorUserId, {
    forceCalendarSource: pair.source,
    googleBodyExtras: {
      description,
      extendedProperties: {
        private: {
          reddirtCampaignEventId: event.id,
          reddirtCalendarItemId: calendarItemId,
          calendarLane: lane,
          sourceSystem: "reddirt",
          contentHash: hash,
          syncVersion: "2",
        },
      },
    },
  });
  return { ok: true as const, mode: "kelly_lane" as const, lane };
}

export async function syncKellyCampaignEventToGoogleSafe(campaignEventId: string, actorUserId: string | null) {
  try {
    return await syncKellyCampaignEventToGoogle(campaignEventId, actorUserId);
  } catch {
    return { ok: false as const };
  }
}
