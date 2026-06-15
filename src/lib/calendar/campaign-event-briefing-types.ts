import type { CampaignEventType } from "@prisma/client";

export type BriefingRunOfShowItem = {
  time: string | null;
  activity: string;
  owner: string | null;
  notes: string | null;
};

export type BriefingSourceRef = {
  label: string;
  url: string | null;
  snippet: string | null;
};

export type CampaignEventBriefing = {
  slug: string;
  eventId: string;
  calendarCategory: "locked" | "scheduled" | "proposed" | "plan" | "published" | "unknown";
  verificationStatus: string | null;

  who: {
    audience: string | null;
    host: string | null;
    organizers: string | null;
    expectedAttendance: string | null;
  };
  what: {
    title: string;
    eventType: string;
    eventTypeEnum: CampaignEventType | null;
    description: string | null;
  };
  when: {
    startAt: string;
    endAt: string;
    timezone: string;
    timeKnown: boolean;
    dateEnd: string | null;
  };
  where: {
    venue: string | null;
    address: string | null;
    city: string | null;
    county: string | null;
    countySlug: string | null;
  };
  why: {
    campaignRationale: string | null;
    strategicGoal: string | null;
    laneFocus: string[];
  };

  campaignGoal: {
    primary: string | null;
    successMetrics: string[];
    volunteerAsk: string | null;
    registrationGoal: string | null;
  };

  onlineIntel: {
    lastResearched: string | null;
    sources: BriefingSourceRef[];
    officialSiteNotes: string | null;
  };

  localContact: {
    name: string | null;
    role: string | null;
    phone: string | null;
    email: string | null;
    notes: string | null;
  };

  trip: {
    travelClass: string | null;
    driveMinutes: number | null;
    overnight: boolean | null;
    lodging: string | null;
    departureBase: string | null;
    companions: string | null;
    outsideEventPlans: string[];
  };

  runOfShow: BriefingRunOfShowItem[];

  kelly: {
    role: string | null;
    visibility: string | null;
    assignment: string | null;
    talkingPoints: string[];
    boothOrStage: string | null;
  };

  logistics: {
    parking: string | null;
    loadIn: string | null;
    avNeeds: string | null;
    merchAndSignage: string | null;
    dressCode: string | null;
  };

  volunteer: {
    lead: string | null;
    shifts: string[];
    mobilizeNotes: string | null;
  };

  story: {
    capturePlan: string | null;
    substackAngle: string | null;
    socialHooks: string[];
  };

  openItems: string[];
  dataGaps: string[];
  internalNotes: string | null;
};

export type CampaignEventBriefingSnapshot = {
  generatedAt: string;
  version: number;
  briefings: Record<string, CampaignEventBriefing>;
};

export const BRIEFING_PENDING = "Pending — add in campaign-event-briefings.overrides.json";
