import { getCampaignEventBriefingBySlug } from "@/lib/calendar/load-campaign-event-briefing";
import { fieldEventWorksheetHref } from "@/lib/election-plan/field-calendar-links";
import {
  slugifyForwardMotionStop,
  type ForwardMotionStop,
} from "@/lib/election-plan/forward-motion-links";
import {
  buildPromotionItems,
  buildPromotionTimeline,
  computeStopReadiness,
} from "@/lib/election-plan/forward-motion-readiness";
import type { StopCommandCenterView } from "@/lib/election-plan/forward-motion-stop-types";
import type { ExecutiveCalendarEntry } from "@/lib/election-plan/field-event-worksheet-storage";
import { buildCityLocationBrief } from "@/lib/election-plan/load-city-location-brief";
import { getCountyByName, getCitiesInCounty } from "@/lib/election-plan/load-county";
import {
  buildCitySlugLookup,
  resolveCitySlug,
} from "@/lib/election-plan/location-calendar-integration";
import { cityLocationBriefHref, countyPlaybookHref } from "@/lib/election-plan/location-links";
import type { ElectionPlanWorkbenchSnapshot } from "@/lib/election-plan/types";

const COALITION_TARGETS = [
  {
    id: "naacp",
    label: "NAACP",
    owner: "Kelly + county chair",
    invitePrompt: "Branch president, WIN committee chairs, civic engagement leads",
  },
  {
    id: "labor",
    label: "Labor",
    owner: "Steve + county labor liaison",
    invitePrompt: "Local union stewards, teachers union, public-sector locals with members in county",
  },
  {
    id: "aea",
    label: "AEA",
    owner: "Kelly + educator network",
    invitePrompt: "Building reps, retired educators, school-board allies in host county",
  },
  {
    id: "faith",
    label: "Faith",
    owner: "County faith liaison",
    invitePrompt: "Pastors open to nonpartisan voter engagement, community service partners",
  },
  {
    id: "hispanic",
    label: "Hispanic",
    owner: "Jasmine",
    invitePrompt: "Bilingual community leaders, business owners, cultural organizations",
  },
  {
    id: "muslim",
    label: "Muslim",
    owner: "Ali / Ebrahim",
    invitePrompt: "Mosque community liaisons, interfaith council contacts",
  },
  {
    id: "elected",
    label: "Elected Officials",
    owner: "Kelly + scheduler",
    invitePrompt: "Current and former officials who should receive personal invitations",
  },
] as const;

const STORY_TARGETS_BEFORE = [
  { id: "business", label: "Local business", phase: "before" as const },
  { id: "teacher", label: "Local teacher", phase: "before" as const },
  { id: "veteran", label: "Veteran", phase: "before" as const },
  { id: "student", label: "Student", phase: "before" as const },
  { id: "farmer", label: "Farmer", phase: "before" as const },
  { id: "volunteer", label: "Volunteer", phase: "before" as const },
];

const CONTENT_REQUIRED_AFTER = [
  { id: "reel", label: "Reel", phase: "after" as const },
  { id: "album", label: "Photo album", phase: "after" as const },
  { id: "substack", label: "Substack story", phase: "after" as const },
  { id: "spotlight", label: "Business spotlight", phase: "after" as const },
  { id: "next-stop", label: "Upcoming stop post", phase: "after" as const },
];

const HOUSE_PARTY_FORMATS = [
  { id: "breakfast", label: "Breakfast meetups" },
  { id: "coffee", label: "Coffee meetings" },
  { id: "lunch", label: "Lunch meetings" },
  { id: "meet-greet", label: "Meet & greets" },
  { id: "house-party", label: "House parties" },
  { id: "fundraiser", label: "Fundraisers" },
  { id: "civic", label: "Civic club meetings" },
  { id: "after-hours", label: "After-hours gatherings" },
];

const ENDORSEMENT_ROLES = [
  { id: "current-official", label: "Current officials" },
  { id: "former-official", label: "Former officials" },
  { id: "union", label: "Union leaders" },
  { id: "naacp", label: "NAACP leaders" },
  { id: "teacher", label: "Teachers" },
  { id: "faith", label: "Faith leaders" },
  { id: "business", label: "Business leaders" },
];

const CAMPUS_SITES = [
  { match: /conway|faulkner|uca/i, campus: "UCA", city: "Conway" },
  { match: /little rock|pulaski|ualr/i, campus: "UALR", city: "Little Rock" },
  { match: /philander|wright/i, campus: "Philander Smith", city: "Little Rock" },
  { match: /jonesboro|state university|a-state|arkansas state/i, campus: "Arkansas State", city: "Jonesboro" },
  { match: /fayetteville|u of a|university of arkansas/i, campus: "UA Fayetteville", city: "Fayetteville" },
  { match: /beebe|asu-beebe/i, campus: "ASU-Beebe", city: "Beebe" },
];

export function findExecutiveCalendarMatch(
  data: ElectionPlanWorkbenchSnapshot,
  stop: ForwardMotionStop,
): ExecutiveCalendarEntry | null {
  const needle = stop.eventName.toLowerCase().slice(0, 14);
  const match = data.executiveCalendar.entries.find((e) => {
    if (e.startDate !== stop.date) return false;
    const hay = e.label.toLowerCase();
    return hay.includes(needle) || stop.eventName.toLowerCase().includes(hay.slice(0, 14));
  });
  return match ?? null;
}

function buildWhyItMatters(
  stop: ForwardMotionStop,
  county: ElectionPlanWorkbenchSnapshot["counties"][number] | null,
): string {
  const countyName = stop.county.replace(/\s+County$/i, "");
  if (!county) {
    return `${countyName} is on the Forward Motion activation queue (${stop.cluster}). This ${stop.eventName} stop supports ${stop.primaryLane.toLowerCase()} and regional visibility ahead of Labor Day.`;
  }
  return `${countyName} County is a ${county.strategicRole.toLowerCase()} in the ${stop.cluster}. This ${stop.eventName} visit supports ${county.primaryMission.toLowerCase()}, ${county.recommendedAction.toLowerCase()}, and Democratic reactivation while building volunteer depth ahead of Labor Day. Tier ${county.tier} · VCI #${county.vciRank}.`;
}

function detectCampus(stop: ForwardMotionStop, cityBriefName?: string) {
  const hay = `${stop.eventName} ${stop.city} ${stop.county} ${cityBriefName ?? ""}`;
  for (const site of CAMPUS_SITES) {
    if (site.match.test(hay)) {
      return {
        campus: site.campus,
        city: site.city,
        captain: null,
        studentRecruitmentGoal: 25,
        registrationGoal: 150,
        freshmanWeekOpportunity: "Table + dorm captains during move-in window",
        fundraiserOpportunity: "Young Democrats / campus org co-host",
        kellyAppearanceStatus: "not_scheduled",
      };
    }
  }
  return null;
}

function briefingSlugForStop(stop: ForwardMotionStop, calendarEntry: ExecutiveCalendarEntry | null): string | null {
  if (calendarEntry) {
    const slug = slugifyForwardMotionStop(calendarEntry.label, calendarEntry.county);
    if (getCampaignEventBriefingBySlug(slug)) return slug;
  }
  const slug = slugifyForwardMotionStop(stop.eventName, stop.county);
  if (getCampaignEventBriefingBySlug(slug)) return slug;
  return null;
}

export function assembleForwardMotionStop(
  data: ElectionPlanWorkbenchSnapshot,
  stop: ForwardMotionStop,
): StopCommandCenterView {
  const county = getCountyByName(data, stop.county);
  const countySlug = county?.slug ?? null;
  const calendarEntry = findExecutiveCalendarMatch(data, stop);
  const cityLookup = buildCitySlugLookup(data.cities);
  const citySlug = resolveCitySlug(stop.city === "TBD" ? null : stop.city, cityLookup);
  const cityRecord = citySlug ? data.cities.find((c) => c.slug === citySlug) : undefined;
  const cityBrief = cityRecord ? buildCityLocationBrief(cityRecord) : null;
  const priorityCities = getCitiesInCounty(data.cities, stop.county.replace(/\s+County$/i, ""));
  const coverage = data.coverageReality.visitedCounties.find(
    (v) => v.county.toLowerCase() === stop.county.replace(/\s+County$/i, "").toLowerCase(),
  );
  const promotionItems = buildPromotionItems({
    mobilizeStatus: stop.mobilizeStatus,
    facebookStatus: stop.facebookStatus,
    newsReleaseStatus: stop.newsReleaseStatus,
    graphicsStatus: stop.graphicsStatus,
    postcardStatus: stop.postcardStatus,
    phoneBankStatus: stop.phoneBankStatus,
    storyWorkflowStatus: stop.storyWorkflowStatus,
  });
  const readiness = computeStopReadiness({
    promotionItems,
    storyStatus: stop.storyWorkflowStatus,
  });
  const briefingSlug = briefingSlugForStop(stop, calendarEntry);
  const briefing = briefingSlug ? getCampaignEventBriefingBySlug(briefingSlug) : null;
  const countyNorm = stop.county.replace(/\s+County$/i, "").toLowerCase();
  const countyEndorsementTargets = data.endorsementAcquisition.pendingTargets.filter(
    (t) => t.county.toLowerCase().includes(countyNorm) || countyNorm.includes(t.county.toLowerCase()),
  );

  return {
    stop,
    stopSlug: slugifyForwardMotionStop(stop.eventName, stop.county),
    calendarEntry,
    fieldWorksheetHref: calendarEntry ? fieldEventWorksheetHref(calendarEntry.id) : null,
    county: county ?? null,
    countySlug,
    countyPlaybookHref: countySlug ? countyPlaybookHref(stop.county, countySlug) : null,
    cityBrief,
    cityBriefHref: citySlug ? cityLocationBriefHref(citySlug) : null,
    priorityCities,
    lastVisitDate: coverage?.lastVisitDate ?? null,
    visitCount: coverage?.visitCount ?? 0,
    whyItMatters: buildWhyItMatters(stop, county ?? null),
    venue: briefing?.where?.venue ?? calendarEntry?.city ?? (stop.city !== "TBD" ? stop.city : null),
    timeLabel: briefing?.when?.timeKnown ? briefing.when.startAt.slice(11, 16) : null,
    attendanceEstimate: briefing?.who?.expectedAttendance ?? null,
    coalitionImportance:
      stop.assignment === "Kelly"
        ? "High — Kelly-attended stop; coalition partners should receive personal outreach."
        : "Medium — surrogate or county team stop; coordinate introductions before promotion goes live.",
    promotionItems,
    promotionTimeline: buildPromotionTimeline(stop.date, data.executiveCalendar.referenceDate),
    coalitionTargets: [...COALITION_TARGETS],
    storyTargets: STORY_TARGETS_BEFORE,
    contentRequired: CONTENT_REQUIRED_AFTER,
    housePartyFormats: HOUSE_PARTY_FORMATS,
    powerOf5Goals: [
      { id: "volunteers", label: "Volunteers", goal: cityBrief?.numericTargets?.volunteers.activeVolunteers ?? 10 },
      { id: "po5-leaders", label: "Power of 5 leaders", goal: cityBrief?.numericTargets?.houseParties.powerOf5Circles ?? 5 },
      { id: "house-parties", label: "House parties", goal: cityBrief?.numericTargets?.houseParties.hosts ?? 4 },
      { id: "endorsement-leads", label: "Endorsement leads", goal: Math.max(2, countyEndorsementTargets.length) },
    ],
    endorsementRoles: ENDORSEMENT_ROLES,
    countyEndorsementTargets,
    campusActivation: detectCampus(stop, cityBrief?.name),
    substackAngle: briefing?.story?.substackAngle ?? null,
    readiness,
    briefingSlug,
  };
}
