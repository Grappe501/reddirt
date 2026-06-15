import { readFileSync } from "node:fs";
import path from "node:path";

import {
  type CampaignEventBriefing,
  type CampaignEventBriefingSnapshot,
  BRIEFING_PENDING,
} from "@/lib/calendar/campaign-event-briefing-types";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";

const BRIEFINGS_PATH = path.join(
  process.cwd(),
  "data/calendar-command-center/campaign-event-briefings.snapshot.json",
);

let cached: CampaignEventBriefingSnapshot | null = null;

function loadSnapshot(): CampaignEventBriefingSnapshot | null {
  if (cached) return cached;
  try {
    cached = JSON.parse(readFileSync(BRIEFINGS_PATH, "utf8")) as CampaignEventBriefingSnapshot;
    return cached;
  } catch {
    return null;
  }
}

export function getCampaignEventBriefingBySlug(slug: string): CampaignEventBriefing | null {
  const snap = loadSnapshot();
  return snap?.briefings[slug] ?? null;
}

/** Minimal briefing when only a published Prisma event exists (no exec-calendar row). */
export function buildFallbackBriefingFromPublicEvent(e: PublicCampaignEvent): CampaignEventBriefing {
  return {
    slug: e.slug,
    eventId: e.id,
    calendarCategory: "published",
    verificationStatus: "Published on website",

    who: {
      audience: null,
      host: null,
      organizers: null,
      expectedAttendance: null,
    },
    what: {
      title: e.title,
      eventType: e.eventTypeLabel,
      eventTypeEnum: e.eventType,
      description: e.publicSummary,
    },
    when: {
      startAt: e.startAt.toISOString(),
      endAt: e.endAt.toISOString(),
      timezone: e.timezone,
      timeKnown: true,
      dateEnd: null,
    },
    where: {
      venue: e.locationName,
      address: e.address,
      city: e.locationName,
      county: e.county?.displayName ?? null,
      countySlug: e.county?.slug ?? null,
    },
    why: {
      campaignRationale: e.publicSummary,
      strategicGoal: null,
      laneFocus: ["Four-lane plurality strategy"],
    },
    campaignGoal: {
      primary: "Build visibility and voter contact at this published stop.",
      successMetrics: ["Po5 conversations", "Volunteer signups", "Story captured"],
      volunteerAsk: "Sign up via Mobilize when shifts are posted.",
      registrationGoal: e.county ? "See county registration goal on election plan" : null,
    },
    onlineIntel: {
      lastResearched: null,
      sources: [],
      officialSiteNotes: null,
    },
    localContact: {
      name: null,
      role: null,
      phone: null,
      email: null,
      notes: BRIEFING_PENDING,
    },
    trip: {
      travelClass: null,
      driveMinutes: null,
      overnight: null,
      lodging: null,
      departureBase: "Sherwood / Central Arkansas",
      companions: null,
      outsideEventPlans: [],
    },
    runOfShow: [
      { time: "Day of", activity: "Execute per published schedule", owner: "Kelly + field team", notes: null },
    ],
    kelly: {
      role: "Candidate presence · conversations · remarks as scheduled",
      visibility: "Public",
      assignment: "Published event",
      talkingPoints: ["People over Politics", "Fair elections · accessible government"],
      boothOrStage: null,
    },
    logistics: {
      parking: BRIEFING_PENDING,
      loadIn: null,
      avNeeds: null,
      merchAndSignage: "Standard field kit",
      dressCode: "Business casual",
    },
    volunteer: {
      lead: null,
      shifts: [],
      mobilizeNotes: "Check Mobilize for published shifts.",
    },
    story: {
      capturePlan: "Same-day social · Substack if warranted",
      substackAngle: null,
      socialHooks: [],
    },
    openItems: ["Enrich this briefing in campaign-event-briefings.overrides.json"],
    dataGaps: ["Local contact", "Run of show", "Trip / lodging"],
    internalNotes: null,
  };
}

export function resolveCampaignEventBriefing(
  slug: string,
  publicEvent: PublicCampaignEvent | null,
): CampaignEventBriefing | null {
  const built = getCampaignEventBriefingBySlug(slug);
  if (built) return built;
  if (publicEvent) return buildFallbackBriefingFromPublicEvent(publicEvent);
  return null;
}
