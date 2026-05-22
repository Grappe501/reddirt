import { formatInTimeZone } from "date-fns-tz";
import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import { buildApprovalContext } from "@/lib/calendar/build-approval-context";
import { extractTitleCity } from "@/lib/travel-ledger/ai/trip-resolution-autopilot/title-city-extractor";
import { classifyCampaignEvent } from "./classify-event";
import { resolveDefaultTravelOrigin } from "./travel-origin";
import { evaluateWorkHoursWarning } from "./work-schedule";
import type {
  AiSuggestionStub,
  CampaignEventLedgerRow,
  FactCardSection,
  FactField,
  FactFieldStatus,
} from "./types";

const TZ = "America/Chicago";

function field(key: string, label: string, value: string | undefined, helper?: string, suggestion?: string): FactField {
  const trimmed = value?.trim();
  let status: FactFieldStatus = trimmed ? "known" : "missing";
  if (!trimmed && suggestion) status = "suggested";
  return {
    key,
    label,
    value: trimmed || suggestion,
    status,
    helper,
    suggestion: status === "suggested" ? suggestion : undefined,
  };
}

function formatTimeRange(item: CampaignCalendarItem): { start: string; end: string } {
  if (item.allDay) return { start: "All day", end: "—" };
  const start = formatInTimeZone(new Date(item.start), TZ, "h:mm a");
  const end = item.end ? formatInTimeZone(new Date(item.end), TZ, "h:mm a") : "—";
  return { start, end };
}

function inferLikelyCity(item: CampaignCalendarItem): { city?: string; source?: string } {
  if (item.city?.trim()) return { city: item.city.trim(), source: "calendar city field" };
  const titleMatch = extractTitleCity(item.title ?? "");
  if (titleMatch.city) return { city: titleMatch.city, source: titleMatch.source };
  const loc = item.location ?? "";
  if (/little rock/i.test(loc)) return { city: "Little Rock", source: "location text" };
  if (/magnolia/i.test(loc)) return { city: "Magnolia", source: "location text" };
  return {};
}

function countMissing(fields: FactField[]): number {
  return fields.filter((f) => f.status === "missing").length;
}

function defaultCollapsed(sectionId: string, classification: string, eventType: string): boolean {
  if (sectionId === "when") return false;
  if (sectionId === "why") return false;
  if (classification === "house_meet_greet") {
    return !["who", "what", "why", "when"].includes(sectionId);
  }
  if (eventType === "virtual_statewide") {
    return ["travel", "run_of_show", "hot_wash", "cost_budget"].includes(sectionId);
  }
  if (eventType === "personal_admin" || eventType === "travel") {
    return !["when", "why"].includes(sectionId);
  }
  return ["run_of_show", "hot_wash", "cost_budget"].includes(sectionId);
}

function buildHouseMeetGreetFields(item: CampaignCalendarItem): FactField[] {
  const dd = item.drillDown;
  return [
    field("host", "Host", dd?.host, "Supporter or community member hosting the gathering."),
    field("host_contact", "Host contact", dd?.contacts, "Phone/email for day-of coordination."),
    field("location_type", "Location type", item.location, "Home, coffee shop, restaurant, backyard, etc."),
    field("expected_attendance", "Expected attendance", undefined, "Rough headcount helps materials and staffing."),
    field("invited_audience", "Invited audience", undefined, "Who is the host encouraged to invite?"),
    field(
      "cross_aisle_inclusion",
      "Non-Democrats / independents included?",
      undefined,
      "Intentionally welcome independents, soft Republicans, and new voices.",
    ),
    field("kelly_attendance", "Kelly attends", undefined, "In person vs campaign Zoom / digital attendance."),
    field("food_theme", "Food / theme", undefined, "Host’s choice: appetizers, coffee, lunch, BBQ, happy hour, etc."),
    field("volunteer_needs", "Volunteer needs", undefined, "Usually low — note if any help is needed."),
    field("fundraising_optional", "Fundraising opportunity", undefined, "Optional donation moment — not required."),
    field("follow_up_contacts", "Follow-up contacts", undefined, "Names to capture for relational follow-up."),
    field("recurring_potential", "Recurring party potential", undefined, "Could this become a monthly local rhythm?"),
  ];
}

function buildSections(
  item: CampaignCalendarItem,
  classification: string,
  likelyCity?: string,
  approval?: ReturnType<typeof buildApprovalContext>,
  travelOrigin?: ReturnType<typeof resolveDefaultTravelOrigin>,
): FactCardSection[] {
  const times = formatTimeRange(item);
  const dd = item.drillDown;
  const isHouse = classification === "house_meet_greet";
  const mapsQuery = likelyCity ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${likelyCity}, AR`)}` : undefined;

  const whenFields: FactField[] = [
    field("date", "Date", String(item.start).slice(0, 10)),
    field("start_time", "Start time", times.start),
    field("end_time", "End time", times.end),
    field("arrival_time", "Arrival time", undefined, "When should Kelly or staff arrive?"),
    field("setup_time", "Setup time", undefined, "Table, signs, AV setup window."),
    field("departure_time", "Departure time", undefined, "When can the team leave?"),
    field("volunteer_arrival", "Volunteer arrival", undefined, "Meetup time/place for volunteers."),
  ];

  const whereFields: FactField[] = [
    field("venue_name", "Venue name", item.location?.split(";")[0]?.trim(), "Building or host property name."),
    field("address", "Address", undefined, "Street address when known — does not block mileage estimate."),
    field("city", "City", likelyCity ?? item.city, "City-level is enough for travel reimbursement."),
    field("county", "County", item.county),
    field("state", "State", "AR"),
    field("parking", "Parking", undefined, "Where to park / unload materials."),
    field("room_location", "Room / table / booth", undefined, "Specific room or tabling spot."),
    field("maps_link", "Maps link", mapsQuery, "Open in maps when city or address is confirmed."),
  ];

  const whyFields: FactField[] = [
    field("campaign_purpose", "Campaign purpose", item.notes ?? dd?.anchorClassification),
    field("event_type", "Event type", classification.replaceAll("_", " ")),
    field("strategic_objective", "Strategic objective", undefined, "What win does this advance?"),
    field("target_audience", "Target audience", undefined, "Who should leave glad they came?"),
    field("county_priority", "County priority", item.priorityTier, "Workbook tier when assigned."),
    field("voter_contact_value", "Voter contact value", item.countyTouchCounts ? "County touch counts" : undefined),
    field("fundraising_value", "Fundraising value", item.eventType === "fundraiser" ? "Primary fundraiser" : undefined),
    field("relationship_value", "Relationship-building", isHouse ? "Cross-aisle welcoming room" : undefined),
  ];

  const whoFields: FactField[] = isHouse
    ? buildHouseMeetGreetFields(item)
    : [
        field("host", "Host", dd?.host),
        field("host_organization", "Host organization", undefined),
        field("host_phone_email", "Host phone / email", dd?.contacts),
        field("campaign_point_person", "Campaign point person", dd?.adminLocalGuide?.displayName, dd?.adminLocalGuide?.phone),
        field("candidate_attending", "Candidate attending?", undefined, "Kelly in person, Zoom, or surrogate?"),
        field("staff_attending", "Staff attending", undefined),
        field("volunteers_needed", "Volunteers needed?", undefined),
        field("volunteer_count", "Number of volunteers", undefined),
        field("volunteer_meetup", "Volunteer meetup", undefined, "Time and place for volunteer rally point."),
        field("vips_expected", "VIPs / donors / press", undefined),
      ];

  const whatFields: FactField[] = [
    field("candidate_role", "Candidate role", dd?.kellyRole, "Speaking, listening, tabling only, etc."),
    field("speaking_slot", "Speaking slot?", undefined),
    field("speaking_time", "Speaking time", undefined),
    field("marketing_table", "Marketing table?", undefined),
    field("materials", "Materials needed", undefined, "Literature, QR, signup sheets."),
    field("yard_signs", "Yard signs", undefined),
    field("literature", "Literature", undefined),
    field("banner", "Banner", undefined),
    field("donation_forms", "Donation QR / forms", undefined),
    field("volunteer_signup", "Volunteer signup sheets", undefined),
    field("press_materials", "Press materials", undefined),
    field("attire", "Special attire", undefined),
    field("weather_plan", "Weather plan", undefined),
  ];

  const howFields: FactField[] = [
    field("travel_method", "Travel method", item.eventType === "virtual_statewide" ? "Virtual — no drive" : "Vehicle"),
    field("route_notes", "Route notes", dd?.travelRequirement),
    field("parking_plan", "Parking plan", undefined),
    field("setup_plan", "Setup plan", undefined),
    field("staffing_plan", "Staffing plan", undefined),
    field("donation_process", "Donation process", undefined),
    field("check_in_process", "Check-in process", undefined),
    field("accessibility", "Accessibility notes", undefined),
    field("weather_security", "Weather / security", undefined),
  ];

  const travelFields: FactField[] = [
    field("origin", "Default travel origin", travelOrigin?.originLabel, travelOrigin?.note),
    field("destination_city", "Destination city", likelyCity, "City-level mileage is sufficient."),
    field(
      "estimated_miles",
      "Estimated miles (one-way ref.)",
      approval?.estimatedDistanceMiles != null ? String(approval.estimatedDistanceMiles) : undefined,
      "Round-trip reimbursement uses travel-ledger rules when approved.",
    ),
    field("full_address_optional", "Full address (optional)", undefined, "Store when known; never block estimates."),
    field("reimbursement_status", "Reimbursement", undefined, "Links to travel-ledger after review — not auto-posted."),
  ];

  const costFields: FactField[] = [
    field("mileage", "Estimated mileage reimbursement", undefined, "Future: sync from approved travel-ledger row."),
    field("printing", "Printing", undefined),
    field("signs_materials", "Signs / materials", undefined),
    field("food_beverage", "Food / beverage", undefined),
    field("venue_cost", "Venue cost", undefined),
    field("lodging_meals", "Lodging / meals / parking", undefined),
    field("receipts", "Receipts", undefined, "Compliance receipt intake — separate from this card."),
    field("financial_transaction", "FinancialTransaction link", undefined, "Future FIN-1 bridge — not built this pass."),
  ];

  const runOfShowPlaceholders = [
    { label: "Timeline row", hint: "Time · action · owner · location" },
    { label: "Materials", hint: "Pack list per beat" },
    { label: "Contacts", hint: "Day-of phone tree" },
    { label: "Maps", hint: "Parking + room pin" },
  ];

  const hotWashPlaceholders = [
    { label: "Attendance", hint: "Actual vs expected" },
    { label: "What worked", hint: "Repeatable patterns" },
    { label: "Follow-up tasks", hint: "CRM / relational queue" },
    { label: "AI pattern notes", hint: "Advisory only — never overwrites facts" },
  ];

  const sectionDefs: Array<Omit<FactCardSection, "fields"> & { fields: FactField[] }> = [
    {
      id: "when",
      title: "When",
      helper: "Schedule anchors — arrival and setup are often the first gaps to close.",
      defaultCollapsed: defaultCollapsed("when", classification, item.eventType),
      fields: whenFields,
    },
    {
      id: "where",
      title: "Where",
      helper: "Venue and geography. City is enough for mileage; street address is a plus.",
      defaultCollapsed: defaultCollapsed("where", classification, item.eventType),
      fields: whereFields,
    },
    {
      id: "why",
      title: "Why",
      helper: "Strategic intent — keeps the team aligned on purpose before logistics.",
      defaultCollapsed: defaultCollapsed("why", classification, item.eventType),
      fields: whyFields,
    },
    {
      id: "who",
      title: isHouse ? "Who — House Meet & Greet" : "Who",
      helper: isHouse
        ? "Supporter-hosted, low-stress room. Encourage cross-aisle invites; Kelly may attend in person or via campaign Zoom."
        : "People map: hosts, staff, volunteers, and expected guests.",
      defaultCollapsed: defaultCollapsed("who", classification, item.eventType),
      fields: whoFields,
      emphasis: isHouse ? "house_meet_greet" : undefined,
    },
    {
      id: "what",
      title: "What",
      helper: "Deliverables on site: role, materials, and candidate presence mode.",
      defaultCollapsed: defaultCollapsed("what", classification, item.eventType),
      fields: whatFields,
    },
    {
      id: "how",
      title: "How",
      helper: "Execution: travel, setup, donations, accessibility, and safety.",
      defaultCollapsed: defaultCollapsed("how", classification, item.eventType),
      fields: howFields,
    },
    {
      id: "travel",
      title: "Travel",
      helper: "Mileage section only — receipts and ledger posting live under Cost/Budget.",
      defaultCollapsed: defaultCollapsed("travel", classification, item.eventType),
      fields: travelFields,
    },
    {
      id: "cost_budget",
      title: "Cost / Budget",
      helper: "Placeholders for spend categories; FIN-1 and receipts connect later.",
      defaultCollapsed: defaultCollapsed("cost_budget", classification, item.eventType),
      fields: costFields,
    },
    {
      id: "run_of_show",
      title: "Run of Show",
      helper: "Drilldown timeline — add rows after the event is confirmed.",
      defaultCollapsed: defaultCollapsed("run_of_show", classification, item.eventType),
      fields: [],
      placeholderRows: runOfShowPlaceholders,
    },
    {
      id: "hot_wash",
      title: "Hot Wash / Follow-Up",
      helper: "Post-event capture — attendance, lessons, and follow-ups.",
      defaultCollapsed: defaultCollapsed("hot_wash", classification, item.eventType),
      fields: [
        field("attendance", "Attendance", undefined),
        field("what_worked", "What worked", undefined),
        field("what_failed", "What did not work", undefined),
        field("donor_conversations", "Donor / prospect conversations", undefined),
        field("volunteer_signups", "Volunteer signups", undefined),
        field("yard_sign_requests", "Yard sign requests", undefined),
        field("follow_up_tasks", "Follow-up tasks", undefined),
        field("lessons", "Lessons learned", undefined),
      ],
      placeholderRows: hotWashPlaceholders,
    },
  ];

  return sectionDefs;
}

function buildAiStubs(
  item: CampaignCalendarItem,
  classification: string,
  likelyCity?: string,
  classReason?: string,
): AiSuggestionStub[] {
  const stubs: AiSuggestionStub[] = [];
  if (classification !== item.eventType) {
    stubs.push({
      id: "class",
      label: "Suggested classification",
      suggestion: classification.replaceAll("_", " "),
      confidence: "medium",
    });
  }
  if (likelyCity) {
    stubs.push({
      id: "city",
      label: "Suggested city",
      suggestion: likelyCity,
      confidence: "medium",
    });
  }
  if (item.notes?.trim()) {
    stubs.push({
      id: "purpose",
      label: "Suggested purpose",
      suggestion: item.notes.trim().slice(0, 120),
      confidence: "low",
    });
  }
  if (!stubs.length) {
    stubs.push({
      id: "review",
      label: "Review queue",
      suggestion: classReason ?? "Confirm campaign vs personal and add city if travel applies.",
      confidence: "low",
    });
  }
  return stubs;
}

export function buildCampaignEventLedgerRow(
  item: CampaignCalendarItem,
  allCalendarItems: CampaignCalendarItem[],
): CampaignEventLedgerRow {
  const { classification, label, reason } = classifyCampaignEvent(item);
  const { city: likelyCity, source: likelyCitySource } = inferLikelyCity(item);
  const workHours = evaluateWorkHoursWarning(item);
  const travelOrigin = resolveDefaultTravelOrigin(item);
  const approval = buildApprovalContext(item, allCalendarItems);
  const sections = buildSections(item, classification, likelyCity, approval, travelOrigin);
  const missingInfoCount = sections.reduce((sum, section) => sum + countMissing(section.fields), 0);

  return {
    calendar: item,
    dateYmd: String(item.start).slice(0, 10),
    classification,
    classificationLabel: label,
    likelyCity,
    likelyCitySource,
    sourceCalendarId: item.sourceId ?? item.id,
    missingInfoCount,
    workHours,
    travelOrigin,
    sections,
    aiSuggestions: buildAiStubs(item, classification, likelyCity, reason),
  };
}
