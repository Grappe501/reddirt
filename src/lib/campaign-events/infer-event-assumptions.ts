import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import type { CampaignEventLedgerEventStatus } from "@prisma/client";
import { buildApprovalContext } from "@/lib/calendar/build-approval-context";
import { normCountyKey } from "@/lib/calendar/build-approval-context";
import { findCityAliasMatches } from "@/lib/travel-ledger/ai/trip-resolution-autopilot/city-county-alias-memory";
import { extractTitleCity } from "@/lib/travel-ledger/ai/trip-resolution-autopilot/title-city-extractor";
import { classifyCampaignEvent } from "./classify-event";
import { detectEventConflicts, type EventConflictBadge } from "./conflicts";
import { resolveDefaultTravelOrigin } from "./travel-origin";
import { evaluateWorkHoursWarning } from "./work-schedule";
import type { CampaignEventFactCardData } from "./fact-card-data";
import { CAMPAIGN_EVENT_REIMBURSEMENT_RATE_USD_PER_MILE } from "./constants";
import { buildInitialFactCard } from "./persistence/map-calendar-to-record";

export type EventNature =
  | "campaign"
  | "public"
  | "personal"
  | "virtual"
  | "duplicate"
  | "hold";

export type AssumptionConfidence = "high" | "medium" | "low";

export type FieldAssumption = {
  field: string;
  label: string;
  value: string;
  confidence: AssumptionConfidence;
  source: string;
};

export type HouseMeetGreetIntelligence = {
  crossAisleOutreach: boolean;
  crossAisleReason: string;
  relaxedSetup: string;
  zoomOptional: boolean;
  recurringPotential: boolean;
  minimalVolunteers: boolean;
  softHostGuidance: string;
  relationshipPriority: string;
};

export type EventAiInference = {
  assumptions: FieldAssumption[];
  prefill: CampaignEventFactCardData;
  eventNature: EventNature;
  eventNatureReason: string;
  missingRequired: string[];
  conflicts: EventConflictBadge[];
  workHoursWarning: ReturnType<typeof evaluateWorkHoursWarning>;
  travelOriginLabel: string;
  travelDestinationCity?: string;
  likelyAudience?: string;
  likelyStaffingNeed?: string;
  materialsChecklist?: string;
  setupNeeds?: string;
  intelligenceNotes: string[];
  houseMeetGreet?: HouseMeetGreetIntelligence;
};

const COUNTY_SEAT_NAMES: Record<string, string> = {
  pulaski: "Pulaski",
  white: "White",
  faulkner: "Faulkner",
};

function inferCounty(item: CampaignCalendarItem, city?: string): string | undefined {
  if (item.county?.trim()) return item.county.trim();
  const key = normCountyKey(item.county);
  if (key && COUNTY_SEAT_NAMES[key]) return COUNTY_SEAT_NAMES[key];
  if (city) {
    const matches = findCityAliasMatches(city);
    const county = matches.find((m) => m.entry.county)?.entry.county;
    if (county) return `${county} County`;
  }
  return undefined;
}

function inferEventNature(item: CampaignCalendarItem, classification: string): { nature: EventNature; reason: string } {
  if (item.calendarStatus === "declined") return { nature: "hold", reason: "Calendar status is declined." };
  if (/duplicate|conflict/i.test(item.title)) return { nature: "duplicate", reason: "Title suggests duplicate/conflict row." };
  if (item.eventType === "virtual_statewide" || /zoom|virtual/i.test(item.title)) {
    return { nature: "virtual", reason: "Virtual / statewide event pattern." };
  }
  if (item.eventType === "personal_admin" || /personal|admin|work from/i.test(item.title)) {
    return { nature: "personal", reason: "Personal or admin calendar type." };
  }
  if (item.publishStatus === "published" || item.publishStatus === "ready_for_public_review") {
    return { nature: "public", reason: "Publish status suggests public-facing event." };
  }
  if (classification === "house_meet_greet" || item.eventType === "campaign_event" || item.eventType === "community_event") {
    return { nature: "campaign", reason: "Campaign/community event classification." };
  }
  return { nature: "campaign", reason: "Default campaign operations review." };
}

function inferLikelyAudience(item: CampaignCalendarItem, classification: string): string | undefined {
  if (classification === "house_meet_greet") {
    return "Neighbors, independents, and cross-aisle guests — relationship-first";
  }
  if (item.eventType === "county_party_meeting") return "County party activists and local leaders";
  if (item.eventType === "fair_festival") return "General public / festival foot traffic";
  if (item.eventType === "fundraiser") return "Donors and high-intent supporters";
  if (/student|campus|young/i.test(item.title)) return "Students and younger voters";
  if (/senior|retire/i.test(item.title)) return "Older adults / community seniors";
  const drill = item.drillDown as { audienceNotes?: string } | undefined;
  return drill?.audienceNotes?.trim();
}

function inferStaffingNeed(classification: string, volunteerGuess: boolean): string {
  if (classification === "house_meet_greet") return "Minimal — host-led; candidate + 0–1 staff";
  if (volunteerGuess) return "Likely 2–6 volunteers for setup and sign-in";
  return "Confirm with campaign manager";
}

function inferMaterialsChecklist(classification: string, tableGuess: boolean, fundraiseGuess: boolean): string {
  const parts: string[] = [];
  if (tableGuess || classification === "fair_festival") {
    parts.push("Table", "literature", "yard signs", "QR/donation card");
  }
  if (fundraiseGuess) parts.push("Donor cards", "compliance signage");
  if (classification === "house_meet_greet") {
    parts.push("Light refreshments optional", "Name tags optional", "No heavy booth kit");
  }
  return parts.length ? parts.join(" · ") : "Confirm materials with event type";
}

function inferSetupNeeds(classification: string, item: CampaignCalendarItem): string {
  if (classification === "house_meet_greet") {
    return "Low-stress arrival; host handles room — 15–20 min soft setup max";
  }
  if (/setup|arrive|doors/i.test(item.notes ?? "")) return item.notes!.trim();
  if (item.eventType === "fair_festival") return "Early arrival for tabling setup";
  return "Standard campaign arrival 30–45 min before start";
}

function inferHouseMeetGreetIntelligence(item: CampaignCalendarItem): HouseMeetGreetIntelligence {
  const hay = [item.title, item.notes].filter(Boolean).join(" ");
  const crossAisle =
    /independent|non-?democrat|bipartisan|cross-?aisle|neighbor/i.test(hay) || true;
  return {
    crossAisleOutreach: crossAisle,
    crossAisleReason: crossAisle
      ? "House gatherings are prime relationship-building with independents and non-Democrats."
      : "Encourage host to invite a mixed neighbor list.",
    relaxedSetup: "Host-led home environment — avoid heavy campaign production",
    zoomOptional: /zoom|virtual|hybrid/i.test(hay),
    recurringPotential: /weekly|monthly|recurring|series/i.test(hay),
    minimalVolunteers: true,
    softHostGuidance: "Coach host on warm intros, not debate; candidate listens first",
    relationshipPriority: "Trust and follow-up over turnout metrics",
  };
}

function inferHostOrganization(item: CampaignCalendarItem): string | undefined {
  const host = item.drillDown?.host?.trim();
  if (host) return host;
  const m = item.title.match(/\bhost(?:ed)?\s+by\s+(.+?)(?:\s*[-–|]|$)/i);
  return m?.[1]?.trim();
}

function inferVenue(item: CampaignCalendarItem): string | undefined {
  return item.location?.split(";")[0]?.trim() || item.drillDown?.anchorClassification?.trim();
}

function yesNoMaybe(condition: boolean, reason: string): { value: string; confidence: AssumptionConfidence } {
  return condition
    ? { value: "Likely yes", confidence: "medium" }
    : { value: "Unknown", confidence: "low" };
}

export function inferEventAssumptions(
  item: CampaignCalendarItem,
  allCalendar: CampaignCalendarItem[],
  eventStatus: CampaignEventLedgerEventStatus,
): EventAiInference {
  const { label, classification, reason: classReason } = classifyCampaignEvent(item);
  const { nature, reason: natureReason } = inferEventNature(item, classification);
  const titleCity = extractTitleCity(item.title ?? "");
  const city = item.city?.trim() || titleCity.city || undefined;
  const county = inferCounty(item, city);
  const travelOrigin = resolveDefaultTravelOrigin(item);
  const workHours = evaluateWorkHoursWarning(item);
  const conflicts = detectEventConflicts(item, allCalendar, eventStatus);
  const approval = buildApprovalContext(item, allCalendar);

  const prefill = buildInitialFactCard(item);
  prefill.why.eventType = label;
  prefill.why.campaignPurpose = item.notes?.trim() || prefill.why.campaignPurpose;
  prefill.where.city = city;
  prefill.where.county = county;
  prefill.where.venueName = inferVenue(item) ?? prefill.where.venueName;
  prefill.who.hostName = item.drillDown?.host ?? prefill.who.hostName;
  prefill.who.hostOrganization = inferHostOrganization(item);
  prefill.who.campaignPointPerson = item.drillDown?.adminLocalGuide?.displayName;
  prefill.what.candidateRole = item.drillDown?.kellyRole ?? (nature === "campaign" ? "Attend / represent campaign" : undefined);
  if (nature === "virtual") prefill.who.kellyAttendanceMode = "zoom";
  else if (nature === "personal") prefill.who.kellyAttendanceMode = "not_attending";

  const speakingGuess = /speak|remarks|keynote|panel/i.test(item.title);
  if (speakingGuess) {
    prefill.what.speakingSlot = "Likely speaking role";
    prefill.what.speakingTime = "Confirm with host";
  }

  const tableGuess =
    item.eventType === "fair_festival" ||
    item.eventType === "community_event" ||
    /tabl|fair|festival|booth/i.test(item.title);
  const volunteerGuess =
    classification === "house_meet_greet" ||
    item.eventType === "campaign_event" ||
    /canvass|volunteer|huddle/i.test(item.title);
  const fundraiseGuess = item.eventType === "fundraiser" || /fundrais|donor/i.test(item.title);

  if (tableGuess) prefill.what.marketingTable = "Likely needed";
  if (classification === "house_meet_greet") {
    prefill.who.volunteersNeeded = "Minimal — host handles most";
    prefill.why.campaignPurpose = prefill.why.campaignPurpose || "Relationship-building house gathering";
    prefill.why.targetAudience = inferLikelyAudience(item, classification);
    prefill.what.candidateRole = "Listen, thank host, brief remarks if offered";
    prefill.when.setupTime = prefill.when.setupTime || "15–20 min before guests";
  } else if (volunteerGuess) {
    prefill.who.volunteersNeeded = "May be needed — confirm";
  }
  if (fundraiseGuess) prefill.why.fundraisingOpportunity = "Possible fundraising moment";

  const likelyAudience = inferLikelyAudience(item, classification);
  const likelyStaffingNeed = inferStaffingNeed(classification, volunteerGuess);
  const materialsChecklist = inferMaterialsChecklist(classification, tableGuess, fundraiseGuess);
  const setupNeeds = inferSetupNeeds(classification, item);
  if (likelyAudience) prefill.why.targetAudience = likelyAudience;
  if (materialsChecklist) prefill.what.materialsNeeded = materialsChecklist;

  prefill.travel.assumedOriginCity = travelOrigin.originCity;
  prefill.travel.assumedDestinationCity = city;
  prefill.travel.travelStartPointLabel = travelOrigin.originLabel;
  prefill.travel.travelEndPointLabel = city ? `${city}, AR` : undefined;
  prefill.travel.travelTimeMinutes = approval.estimatedDriveMinutes;
  prefill.travel.reimbursementRate = CAMPAIGN_EVENT_REIMBURSEMENT_RATE_USD_PER_MILE;

  const assumptions: FieldAssumption[] = [
    { field: "city", label: "City", value: city ?? "Unknown", confidence: city ? titleCity.confidence === "high" ? "high" : "medium" : "low", source: city ? titleCity.source : "needs human" },
    { field: "county", label: "County", value: county ?? "Unknown", confidence: county ? "medium" : "low", source: item.county ? "calendar county" : "city alias" },
    { field: "eventType", label: "Event type", value: label, confidence: "high", source: classReason },
    { field: "eventNature", label: "Nature", value: nature, confidence: "medium", source: natureReason },
    { field: "venue", label: "Venue", value: inferVenue(item) ?? "Unknown", confidence: inferVenue(item) ? "medium" : "low", source: "location / title" },
    { field: "hostOrganization", label: "Host org", value: inferHostOrganization(item) ?? "Unknown", confidence: inferHostOrganization(item) ? "medium" : "low", source: "drillDown / title" },
    { field: "travelOrigin", label: "Travel origin", value: travelOrigin.originLabel, confidence: "high", source: travelOrigin.rule },
    { field: "travelDestination", label: "Destination", value: city ?? "TBD", confidence: city ? "medium" : "low", source: "city inference" },
    {
      field: "marketingTable",
      label: "Marketing table",
      value: yesNoMaybe(tableGuess, "event type").value,
      confidence: yesNoMaybe(tableGuess, "event type").confidence,
      source: "event pattern",
    },
    {
      field: "volunteers",
      label: "Volunteers",
      value: yesNoMaybe(volunteerGuess, "event pattern").value,
      confidence: yesNoMaybe(volunteerGuess, "event pattern").confidence,
      source: "event pattern",
    },
    {
      field: "fundraising",
      label: "Fundraising",
      value: yesNoMaybe(fundraiseGuess, "event pattern").value,
      confidence: yesNoMaybe(fundraiseGuess, "event pattern").confidence,
      source: "event pattern",
    },
    {
      field: "audience",
      label: "Likely audience",
      value: likelyAudience ?? "Unknown",
      confidence: likelyAudience ? "medium" : "low",
      source: "event type / title",
    },
    {
      field: "staffing",
      label: "Staffing need",
      value: likelyStaffingNeed,
      confidence: "medium",
      source: "event pattern",
    },
    {
      field: "materials",
      label: "Materials checklist",
      value: materialsChecklist,
      confidence: "medium",
      source: "event pattern",
    },
    {
      field: "setup",
      label: "Setup needs",
      value: setupNeeds,
      confidence: classification === "house_meet_greet" ? "high" : "medium",
      source: "event type",
    },
  ];

  const intelligenceNotes: string[] = [];
  if (workHours.show) intelligenceNotes.push(workHours.detail);
  if (approval.estimatedDriveMinutes) {
    intelligenceNotes.push(`Estimated drive ~${approval.estimatedDriveMinutes} min (approval context).`);
  }
  if (classification === "house_meet_greet") {
    intelligenceNotes.push("Prioritize relationship quality over crowd size.");
  }

  const houseMeetGreet =
    classification === "house_meet_greet" ? inferHouseMeetGreetIntelligence(item) : undefined;

  if (houseMeetGreet?.crossAisleOutreach) {
    assumptions.push({
      field: "cross_aisle",
      label: "Cross-aisle outreach",
      value: "Opportunity",
      confidence: "high",
      source: houseMeetGreet.crossAisleReason,
    });
  }

  const missingRequired: string[] = [];
  if (!city) missingRequired.push("City for travel and local context");
  if (!prefill.why.campaignPurpose) missingRequired.push("Campaign purpose");
  if (!prefill.where.venueName && nature === "campaign") missingRequired.push("Venue name");
  if (!prefill.who.hostName && classification === "house_meet_greet") missingRequired.push("Host name");
  if (nature === "campaign" && !prefill.what.candidateRole) missingRequired.push("Candidate role");
  if (workHours.show) missingRequired.push("Work-hours override confirmation");
  if (conflicts.length) missingRequired.push("Resolve schedule conflicts");

  return {
    assumptions,
    prefill,
    eventNature: nature,
    eventNatureReason: natureReason,
    missingRequired,
    conflicts,
    workHoursWarning: workHours,
    travelOriginLabel: travelOrigin.originLabel,
    travelDestinationCity: city,
    likelyAudience,
    likelyStaffingNeed,
    materialsChecklist,
    setupNeeds,
    intelligenceNotes,
    houseMeetGreet,
  };
}
