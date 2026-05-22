import type { CalendarSurfaceRow } from "../load-campaign-calendar-events";
import type {
  CampaignManagerBrief,
  CandidateBrief,
  EventContacts,
  EventPlanningData,
  PlanningReadinessResult,
  RunOfShowRow,
  VolunteerPlan,
} from "./event-planning-types";
import { defaultPackList, emptyVolunteerPlan } from "./event-planning-defaults";

function newRowId() {
  return `ros-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function generateRunOfShow(row: CalendarSurfaceRow): RunOfShowRow[] {
  const fc = row.factCard;
  const city = fc.where.city ?? row.likelyCity ?? "venue";
  const venue = fc.where.venueName ?? row.calendar.location ?? city;
  const arrival = fc.when.arrivalTime ?? row.timeLabel;
  const setup = fc.when.setupTime ?? "30 min before start";
  const depart = fc.when.departureTime ?? "After event wrap";
  const host = fc.who.hostName ?? "Host";
  const cm = fc.who.campaignPointPerson ?? "Campaign manager";
  const candidate = "Kelly Grappe";

  return [
    {
      id: newRowId(),
      time: arrival,
      action: "Arrive / site check",
      owner: cm,
      location: venue,
      materials: "Signage, literature",
      notes: "Confirm room or table placement",
      status: "planned",
    },
    {
      id: newRowId(),
      time: setup,
      action: "Setup table & materials",
      owner: "Volunteers",
      location: venue,
      materials: fc.what.marketingTable ? "Table, banner, QR" : "Table kit",
      notes: "",
      status: "planned",
    },
    {
      id: newRowId(),
      time: row.timeLabel,
      action: fc.what.speakingSlot ? "Speaking / program" : "Main program",
      owner: candidate,
      location: venue,
      materials: fc.what.speakingSlot ?? "Remarks",
      notes: fc.what.candidateRole ?? "",
      status: "planned",
    },
    {
      id: newRowId(),
      time: depart,
      action: "Breakdown & departure",
      owner: cm,
      location: venue,
      materials: "Pack out all campaign materials",
      notes: `Thank ${host}`,
      status: "planned",
    },
  ];
}

export function detectRunOfShowGaps(rows: RunOfShowRow[]): string[] {
  const gaps: string[] = [];
  if (rows.length === 0) gaps.push("No run-of-show rows yet");
  for (const r of rows) {
    if (!r.time?.trim()) gaps.push("Row missing time");
    if (!r.action?.trim()) gaps.push("Row missing action");
    if (!r.owner?.trim()) gaps.push("Row missing owner");
  }
  return [...new Set(gaps)];
}

export function generatePackList(row: CalendarSurfaceRow): EventPlanningData["packList"] {
  const list = defaultPackList();
  const fc = row.factCard.what;
  const mark = (key: string, status: "needed" | "not_needed", notes?: string) => {
    const item = list.find((i) => i.key === key);
    if (item) {
      item.status = status;
      if (notes) item.notes = notes;
    }
  };
  if (fc.literature?.trim()) mark("literature", "needed", fc.literature);
  if (fc.yardSigns?.trim()) mark("signs", "needed", fc.yardSigns);
  if (fc.banner?.trim()) mark("banner", "needed", fc.banner);
  if (fc.marketingTable?.trim()) mark("tablecloth", "needed", "Table setup");
  if (fc.donationQrForms?.trim()) mark("donation_qr", "needed", fc.donationQrForms);
  if (fc.volunteerSignupSheets?.trim()) mark("volunteer_signup", "needed");
  if (fc.speakingSlot?.trim()) mark("speech_notes", "needed", fc.speakingSlot);
  if (!fc.marketingTable?.trim()) mark("tablecloth", "not_needed");
  if (row.classification === "virtual") {
    for (const i of list) {
      if (["signs", "banner", "tablecloth", "weather_gear"].includes(i.key)) i.status = "not_needed";
    }
  }
  return list;
}

export function estimateVolunteerPlan(row: CalendarSurfaceRow): VolunteerPlan {
  const fc = row.factCard.who;
  const type = row.factCard.why.eventType ?? row.classificationLabel;
  const isHouse = /house|meet|greet|coffee/i.test(type + row.calendar.title);
  const isLarge = /rally|festival|fair|parade/i.test(type + row.calendar.title);
  return {
    volunteersNeeded: fc.volunteersNeeded ?? (isHouse ? "2–4 helpers" : isLarge ? "6+ recommended" : "3–5 recommended"),
    numberNeeded: fc.volunteerCount ?? (isLarge ? "6" : isHouse ? "3" : "4"),
    roles: isHouse
      ? "Greeter, food setup, literature table"
      : "Check-in, literature, signage, photographer (optional)",
    volunteerCaptain: fc.campaignPointPerson ?? "",
    arrivalTime: row.factCard.when.volunteerArrivalTime ?? row.factCard.when.setupTime ?? "",
    meetupLocation: row.factCard.where.venueName ?? row.likelyCity ?? "",
    reminderStatus: "draft_reminder_list",
  };
}

export function detectContactGaps(contacts: EventContacts, row: CalendarSurfaceRow): string[] {
  const gaps: string[] = [];
  const host = contacts.host?.trim() || row.factCard.who.hostName?.trim();
  if (!host) gaps.push("Host contact missing");
  if (!contacts.campaignPointPerson?.trim() && !row.factCard.who.campaignPointPerson?.trim()) {
    gaps.push("Campaign point person missing");
  }
  if (!contacts.venue?.trim() && !row.factCard.where.venueName?.trim() && !row.likelyCity?.trim()) {
    gaps.push("Venue / location missing");
  }
  if (!contacts.emergencyContact?.trim()) gaps.push("Emergency contact not set");
  return gaps;
}

export function buildCandidateBrief(row: CalendarSurfaceRow, planning: EventPlanningData): CandidateBrief {
  const fc = row.factCard;
  const ros = planning.runOfShow.map((r) => `${r.time}: ${r.action}`).join("\n");
  return {
    summary: `${row.calendar.title} on ${row.dateYmd} in ${row.likelyCity ?? fc.where.city ?? "TBD"}. ${fc.why.campaignPurpose ?? "Campaign visibility and voter contact."}`,
    talkingPoints: [
      fc.why.campaignPurpose,
      fc.why.strategicObjective,
      fc.what.speakingSlot,
      "Thank hosts and local leaders",
      "Invite attendees to stay engaged (sign up / volunteer)",
    ]
      .filter(Boolean)
      .join("\n• "),
    peopleToKnow: [fc.who.hostName, fc.who.hostOrganization, fc.who.campaignPointPerson].filter(Boolean).join(" · ") || "Confirm on site",
    strategicPurpose: fc.why.campaignPurpose ?? fc.why.eventType ?? row.classificationLabel,
    travelNotes: row.travelLine,
    timingNotes: ros || [fc.when.arrivalTime, fc.when.setupTime, row.timeLabel, fc.when.departureTime].filter(Boolean).join(" → "),
    risks: planning.cmBrief.risks || "Review weather, parking, and press posture before departure.",
    generatedAt: new Date().toISOString(),
  };
}

export function buildCampaignManagerBrief(
  row: CalendarSurfaceRow,
  planning: EventPlanningData,
  readiness: PlanningReadinessResult,
): CampaignManagerBrief {
  const missing = [
    ...readiness.missing,
    ...detectRunOfShowGaps(planning.runOfShow),
    ...detectContactGaps(planning.contacts, row),
  ];
  return {
    logisticsSummary: `${row.calendar.title} · ${row.dateYmd} · ${row.likelyCity ?? "city TBD"} · Approval: ${row.decisionLabel ?? "pending"}`,
    missingItems: missing.length ? missing.join("; ") : "Core planning fields look complete.",
    ownerAssignments: planning.runOfShow.map((r) => `${r.time} ${r.action} → ${r.owner || "assign owner"}`).join("\n") || "Generate run of show first.",
    deadlines: `Event day ${row.dateYmd}. Confirm materials 48h prior. Volunteer reminder 24h prior.`,
    risks: readiness.blockers.join("; ") || "No critical blockers flagged.",
    nextActions: readiness.nextRecommendations.join("\n"),
    generatedAt: new Date().toISOString(),
  };
}

export function scoreEventPlanningReadiness(
  row: CalendarSurfaceRow,
  planning: EventPlanningData,
): PlanningReadinessResult {
  const blockers: string[] = [];
  const missing: string[] = [];
  let earned = 0;
  const max = 100;

  if (row.factCard.who.hostName?.trim() || planning.contacts.host?.trim()) earned += 12;
  else missing.push("host");

  if (row.likelyCity?.trim() && row.county?.trim()) earned += 12;
  else missing.push("city/county");

  if (row.factCard.when.arrivalTime?.trim() || planning.runOfShow.length) earned += 10;
  else missing.push("arrival/time");

  if (planning.runOfShow.length >= 3) earned += 18;
  else blockers.push("Run of show needs at least 3 rows");

  const packNeeded = planning.packList.filter((p) => p.status === "needed");
  if (packNeeded.length === 0) earned += 10;
  else if (packNeeded.every((p) => p.status === "packed" || Boolean(p.notes?.trim()))) earned += 10;
  else missing.push("materials pack");

  if (planning.volunteerPlan.volunteersNeeded?.trim()) earned += 10;
  else missing.push("volunteer plan");

  if (planning.contacts.campaignPointPerson?.trim() || row.factCard.who.campaignPointPerson?.trim()) earned += 8;
  else missing.push("point person");

  if (planning.candidateBrief.summary?.trim()) earned += 15;
  else missing.push("candidate brief");

  if (planning.cmBrief.logisticsSummary?.trim()) earned += 15;
  else missing.push("CM brief");

  const scorePercent = Math.min(100, Math.round((earned / max) * 100));
  const bandLabel =
    scorePercent >= 85 ? "Ready to execute" : scorePercent >= 60 ? "Nearly ready" : scorePercent >= 35 ? "In progress" : "Just started";

  const nextRecommendations = logisticsNextActions(row, planning, missing, blockers);

  return { scorePercent, bandLabel, blockers, missing, nextRecommendations };
}

export function scanEventRisks(row: CalendarSurfaceRow, planning: EventPlanningData): string[] {
  const risks: string[] = [];
  if (row.hasConflictWarning) risks.push("Schedule conflict flagged");
  if (row.hasWorkHoursWarning) risks.push("Work-hours warning");
  if (!row.rawDecision || row.rawDecision === "hold") risks.push("Travel/approval decision not finalized");
  if (row.calendarTruthStatus === "stale" || row.calendarTruthStatus === "missing_google") {
    risks.push("Calendar sync stale or missing");
  }
  risks.push(...outdoorWeatherRisk(row));
  if (planning.runOfShow.length < 2) risks.push("Thin run of show");
  return [...new Set(risks)];
}

export function outdoorWeatherRisk(row: CalendarSurfaceRow): string[] {
  const t = `${row.calendar.title} ${row.factCard.why.eventType} ${row.calendar.location}`.toLowerCase();
  if (/outdoor|parade|fair|festival|park|rally/i.test(t)) {
    return ["Outdoor event — confirm weather, shade, and hydration plan"];
  }
  return [];
}

export function logisticsNextActions(
  row: CalendarSurfaceRow,
  planning: EventPlanningData,
  missing: string[],
  blockers: string[],
): string[] {
  const actions: string[] = [];
  if (planning.runOfShow.length === 0) actions.push("Generate run of show");
  if (missing.includes("host")) actions.push("Confirm host name and phone");
  if (missing.includes("city/county")) actions.push("Set city and county on fact card");
  if (!planning.candidateBrief.summary?.trim()) actions.push("Generate candidate brief");
  if (!planning.cmBrief.logisticsSummary?.trim()) actions.push("Generate campaign manager brief");
  if (blockers.length) actions.push("Resolve planning blockers before event day");
  if (row.rawDecision !== "approved" && row.roundTripMiles) actions.push("Complete travel approval in review wizard");
  if (actions.length === 0) actions.push("Print one-page execution sheet (browser print from drilldown)");
  return actions;
}

export function suggestOwnerAssignments(planning: EventPlanningData): string {
  return planning.runOfShow
    .map((r, i) => `${i + 1}. ${r.action || "Step"} → ${r.owner?.trim() || "(assign)"}`)
    .join("\n");
}

export function planHouseMeetGreet(row: CalendarSurfaceRow): string[] {
  return [
    "Confirm host address and parking",
    "Keep group small; designate greeter",
    "Literature + signup at entry",
    "Candidate remarks under 10 minutes unless host requests longer",
    "Thank host on camera if media present",
  ];
}

export function planSpeakingEvent(row: CalendarSurfaceRow): string[] {
  return [
    "Confirm sound / mic and speaking order",
    "Prepare intro for candidate",
    "Bring backup remarks and county-specific line",
    `Arrival ${row.factCard.when.arrivalTime ?? "early"} for walk-through`,
  ];
}

export function planFundraiserEvent(row: CalendarSurfaceRow): string[] {
  const lines = [
    "Confirm donation compliance signage",
    "Designate treasurer point for cash/check questions",
    "QR + signup sheets on table",
  ];
  if (row.factCard.why.fundraisingOpportunity?.trim()) {
    lines.push(`Fundraising angle: ${row.factCard.why.fundraisingOpportunity}`);
  }
  return lines;
}

export function seedContactsFromFactCard(row: CalendarSurfaceRow): EventContacts {
  const f = row.factCard;
  return {
    host: f.who.hostName ?? "",
    hostPhone: f.who.hostPhone ?? "",
    venue: f.where.venueName ?? row.calendar.location ?? "",
    campaignPointPerson: f.who.campaignPointPerson ?? "",
    volunteerCaptain: "",
    candidateHandler: "Kelly Grappe",
    mediaContact: "",
    emergencyContact: "",
  };
}

export function mergePlanningFromRow(row: CalendarSurfaceRow, existing: EventPlanningData): EventPlanningData {
  const contacts = { ...seedContactsFromFactCard(row), ...existing.contacts };
  const volunteerPlan = {
    ...estimateVolunteerPlan(row),
    ...existing.volunteerPlan,
  };
  if (!existing.volunteerPlan.volunteersNeeded && row.factCard.who.volunteersNeeded) {
    volunteerPlan.volunteersNeeded = row.factCard.who.volunteersNeeded;
  }
  return { ...existing, contacts, volunteerPlan };
}
