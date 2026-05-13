import "server-only";

import {
  CalendarSourceType,
  CampaignEvent,
  CampaignEventStatus,
  EventWorkflowState,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  KELLY_GOOGLE_CONFIRMED_SOURCE_LABEL,
  KELLY_GOOGLE_TENTATIVE_SOURCE_LABEL,
} from "@/lib/calendar/kelly-google-calendar-constants";

export type KellyGoogleCalendarLane = "TENTATIVE" | "CONFIRMED";

function hasOauth(s: { oauthJson: unknown }) {
  const o = (s.oauthJson ?? {}) as { refresh_token?: string };
  return Boolean(o.refresh_token);
}

/** Route internal Kelly-linked campaign events to Tentative vs Confirmed Google calendars. */
export function getKellyCalendarLaneForCampaignEvent(
  event: Pick<CampaignEvent, "eventWorkflowState" | "isPublicOnWebsite" | "status">,
): KellyGoogleCalendarLane {
  if (event.status === CampaignEventStatus.CANCELLED || event.eventWorkflowState === EventWorkflowState.CANCELED) {
    return "CONFIRMED";
  }
  if (event.eventWorkflowState === EventWorkflowState.PUBLISHED && event.isPublicOnWebsite) {
    return "CONFIRMED";
  }
  switch (event.eventWorkflowState) {
    case EventWorkflowState.DRAFT:
    case EventWorkflowState.PENDING_APPROVAL:
      return "TENTATIVE";
    case EventWorkflowState.APPROVED:
    case EventWorkflowState.COMPLETED:
      return "CONFIRMED";
    case EventWorkflowState.PUBLISHED:
      return "CONFIRMED";
    default:
      return "TENTATIVE";
  }
}

export async function findKellyTentativeCalendarSource() {
  return prisma.calendarSource.findFirst({
    where: {
      label: KELLY_GOOGLE_TENTATIVE_SOURCE_LABEL,
      sourceType: CalendarSourceType.KELLY_GOOGLE_TENTATIVE,
      provider: "GOOGLE",
      isActive: true,
    },
  });
}

export async function findKellyConfirmedCalendarSource() {
  return prisma.calendarSource.findFirst({
    where: {
      label: KELLY_GOOGLE_CONFIRMED_SOURCE_LABEL,
      sourceType: CalendarSourceType.KELLY_GOOGLE_CONFIRMED,
      provider: "GOOGLE",
      isActive: true,
    },
  });
}

/**
 * Picks the Kelly Tentative or Confirmed `CalendarSource` for outbound Google writes.
 * Returns null if lanes are not provisioned or OAuth is missing.
 */
export async function selectKellyOutboundCalendarSource(
  event: Pick<CampaignEvent, "eventWorkflowState" | "isPublicOnWebsite" | "status">,
): Promise<{ source: NonNullable<Awaited<ReturnType<typeof findKellyTentativeCalendarSource>>>; lane: KellyGoogleCalendarLane } | null> {
  const tentative = await findKellyTentativeCalendarSource();
  const confirmed = await findKellyConfirmedCalendarSource();
  if (!tentative || !confirmed) return null;
  if (!hasOauth(tentative) || !hasOauth(confirmed)) return null;
  if (!tentative.syncEnabled || !confirmed.syncEnabled) return null;

  const lane = getKellyCalendarLaneForCampaignEvent(event);
  const source = lane === "CONFIRMED" ? confirmed : tentative;
  return { source, lane };
}
