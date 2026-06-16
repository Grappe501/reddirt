import { buildCommunityWorkbenchRegistry } from "@/lib/election-plan/community-workbench/build-registry";
import { communityWorkbenchEventHref } from "@/lib/election-plan/community-workbench/event-links";
import { communityWorkbenchHref, communityWorkbenchHubHref } from "@/lib/election-plan/community-workbench/links";
import {
  GRASSROOTS_GUITAR_STRINGS_EVENT,
  PILOT_EVENT_SEEDS,
  type PilotEventSeed,
} from "@/lib/election-plan/community-workbench/pilot-event-seeds";
import type { CommunityWorkbenchKind } from "@prisma/client";
import { BUDGET_SUPPORTING_DOCUMENTS } from "@/lib/election-plan/budget-documents-registry";
import { battlefieldClusterHref } from "@/lib/election-plan/battlefield-links";
import type { ElectionPlanWorkbenchSnapshot } from "@/lib/election-plan/types";
import type {
  AdminElectionPlanCatalog,
  AdminElectionPlanLink,
  AdminElectionPlanSection,
} from "@/lib/election-plan/admin-election-plan-catalog-types";
import { EXECUTIVE_BOOK_CHAPTERS } from "@/lib/election-plan/executiveBookChapters";
import { fieldEventWorksheetHref, fieldOperationalCalendarHref } from "@/lib/election-plan/field-calendar-links";
import { forwardMotionStopHref } from "@/lib/election-plan/forward-motion-links";
import { getCountyPartyProfiles } from "@/lib/election-plan/load-county-party-intelligence";
import { buildLanesDrillDown } from "@/lib/election-plan/load-lanes-drill-down";
import { getMeetingAccountability } from "@/lib/election-plan/load-meeting-accountability";
import { getArkansasCampuses } from "@/lib/election-plan/load-movement-infrastructure";
import { getVolunteerAcademy } from "@/lib/election-plan/load-volunteer-academy";
import { academyHowItHelpsHref, academyTrainingRoleHref } from "@/lib/election-plan/load-volunteer-onboarding";
import { KELLY_SOS_PLATFORM } from "@/lib/election-plan/kelly-sos-platform";
import { countyPlaybookHref, cityLocationBriefHref } from "@/lib/election-plan/location-links";
import { lanesClusterHref, lanesCountyHref } from "@/lib/election-plan/lanes-drill-down-links";

const WAR_ROOM_TAB_GROUPS = [
  {
    label: "Command Center",
    tabs: [
      { id: "warRoom", label: "Executive War Room" },
      { id: "executiveBook", label: "Executive Book" },
      { id: "weeklyDashboard", label: "Weekly Dashboard" },
      { id: "fieldCalendar", label: "Field Calendar" },
      { id: "weekPlans", label: "Week Plans" },
      { id: "timeline", label: "20-Week Timeline" },
      { id: "presenceMap", label: "Coverage Reality" },
      { id: "coalitionCommand", label: "Coalition Command" },
      { id: "sherwoodVictory", label: "Sherwood Victory" },
      { id: "socialResume", label: "Social Resume" },
    ],
  },
  {
    label: "Strategy & Playbooks",
    tabs: [
      { id: "executive", label: "Executive Mission" },
      { id: "howWeWin", label: "How We Win" },
      { id: "fourLanes", label: "Four Lanes" },
      { id: "battlefield", label: "Arkansas Battlefield" },
      { id: "cities", label: "Priority Cities" },
      { id: "countyPlaybooks", label: "County Playbooks" },
      { id: "volunteerLeadership", label: "Volunteer Leadership" },
      { id: "endorsements", label: "Endorsements" },
      { id: "forwardMotion", label: "Forward Motion" },
      { id: "movementInfrastructure", label: "Movement Infrastructure" },
    ],
  },
] as const;

const STATIC_PORTAL_HUBS: AdminElectionPlanLink[] = [
  { label: "War Room home", href: "/election-plan", keywords: ["command center", "hub"] },
  { label: "Portal search", href: "/election-plan/search", keywords: ["find", "index"] },
  { label: "Operators", href: "/election-plan/operators", keywords: ["auth", "login"] },
  { label: "Community workbench hub", href: "/election-plan/workbenches", keywords: ["local action", "framework"] },
  { label: "Arkansas Battlefield", href: "/election-plan/battlefield", keywords: ["clusters", "vci"] },
  { label: "Priority cities hub", href: "/election-plan/cities", keywords: ["top 40", "location briefs"] },
  { label: "County victory targets", href: "/election-plan/county-victory-targets", keywords: ["75 counties", "percent increase"] },
  { label: "Conversation strategy", href: "/election-plan/conversation-strategy", keywords: ["po5", "doctrine"] },
  { label: "Organization chart", href: "/election-plan/organization", keywords: ["ownership", "roles"] },
  { label: "Leadership hub", href: "/election-plan/leadership", keywords: ["weekly packet", "matrix"] },
  { label: "Leadership · county coverage", href: "/election-plan/leadership/county-coverage" },
  { label: "Leadership · responsibility matrix", href: "/election-plan/leadership/responsibility-matrix" },
  { label: "Leadership · weekly packet", href: "/election-plan/leadership/weekly-packet" },
  { label: "Meeting & accountability", href: "/election-plan/meetings", keywords: ["rhythm", "cadence"] },
  { label: "County party intelligence", href: "/election-plan/county-parties", keywords: ["arkdems", "chairs"] },
  { label: "Immersion missions", href: "/election-plan/immersion-missions" },
  { label: "Intelligence opportunities", href: "/election-plan/intelligence-opportunities" },
  { label: "Event approvals", href: "/election-plan/event-approvals" },
  { label: "Registration goals", href: "/election-plan/registration-goals" },
  { label: "Lanes overview", href: "/election-plan/lanes-overview", keywords: ["four lanes", "drill down"] },
  { label: "Location brief master plan", href: "/election-plan/locations/master-plan" },
  { label: "Big Table doctrine", href: "/election-plan/big-table-doctrine", keywords: ["platform", "philosophy"] },
  { label: "Kelly SOS platform hub", href: "/election-plan/platform", keywords: ["planks", "governing"] },
  { label: "How we win · candidate version", href: "/election-plan/how-we-win/candidate-version" },
  { label: "Direct democracy hub", href: "/election-plan/direct-democracy" },
  { label: "Direct democracy · leadership", href: "/election-plan/direct-democracy/leadership" },
  { label: "Power of 5 command center", href: "/election-plan/power-of-5/command-center", keywords: ["po5"] },
  { label: "Campus network hub", href: "/election-plan/campuses", keywords: ["students", "college"] },
  { label: "Campus captains", href: "/election-plan/campuses/captains" },
  { label: "Freshman week readiness", href: "/election-plan/campuses/freshman-week" },
  { label: "Campaign academy hub", href: "/election-plan/academy", keywords: ["volunteer", "training"] },
  { label: "Academy onboarding", href: "/election-plan/academy/onboarding" },
  { label: "Academy assignments", href: "/election-plan/academy/assignments" },
  { label: "June 28 launch", href: "/election-plan/academy/june-28-launch" },
  { label: "Academy training hub", href: "/election-plan/academy/training" },
  { label: "Executive book hub", href: "/election-plan/executive-book", keywords: ["chapters", "leadership narrative"] },
  { label: "Executive book · budget dashboard", href: "/election-plan/executive-book/budget/dashboard" },
  { label: "Executive book · Labor Day resource gap", href: "/election-plan/executive-book/labor-day/resource-gap" },
  { label: "Forward Motion master plan", href: "/election-plan/forward-motion/master-plan" },
  { label: "Field calendar · operations", href: "/election-plan/field-calendar/operations" },
  { label: "Movement infrastructure · master plan", href: "/election-plan/movement-infrastructure/master-plan" },
  { label: "Movement infrastructure · trust network", href: "/election-plan/movement-infrastructure/trust-network" },
  { label: "Movement infrastructure · story corps", href: "/election-plan/movement-infrastructure/story-corps" },
  { label: "Movement infrastructure · mobilize rules", href: "/election-plan/movement-infrastructure/mobilize-rules" },
  { label: "Movement infrastructure · thank-you doctrine", href: "/election-plan/movement-infrastructure/thank-you-doctrine" },
  { label: "Movement infrastructure · LTE program", href: "/election-plan/movement-infrastructure/lte-program" },
  { label: "Movement infrastructure · Searcy trust pilot", href: "/election-plan/movement-infrastructure/searcy-trust-pilot" },
];

const ADMIN_BRIDGE_LINKS: AdminElectionPlanLink[] = [
  { label: "Admin county ops bridge", href: "/admin/counties", keywords: ["county admin"] },
  { label: "Admin county intelligence", href: "/admin/county-intelligence" },
  { label: "Path to Victory (admin)", href: "/admin/mission-brief" },
  { label: "Victory Board", href: "/admin/victory-board" },
  { label: "Campaign calendar", href: "/admin/campaign-calendar/month?month=2026-03" },
  { label: "Volunteer command center", href: "/admin/volunteers" },
  { label: "Relational CRM", href: "/admin/relational-contacts" },
  { label: "Organizing intelligence (admin placeholder)", href: "/admin/organizing-intelligence" },
];

function kindLabel(kind: CommunityWorkbenchKind): string {
  if (kind === "media") return "Social Media OS";
  if (kind === "communications") return "Communications Hub";
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function formatPilotEventDateLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function parentCityLabel(workbenchSlug: string): string {
  return workbenchSlug.charAt(0).toUpperCase() + workbenchSlug.slice(1);
}

function buildPilotEventAdminLink(seed: PilotEventSeed): AdminElectionPlanLink {
  const dateLabel = formatPilotEventDateLabel(seed.eventDateIso);
  const parent = parentCityLabel(seed.workbenchSlug);
  return {
    label: `${seed.title} · Event workbench`,
    href: communityWorkbenchEventHref(seed.workbenchSlug, seed.eventSlug),
    detail: `Parent: ${parent} · Goal: $${seed.profitGoal.toLocaleString()} profit · Date: ${dateLabel} · Not city leadership`,
    variant: "event-workbench",
    keywords: [
      seed.eventSlug,
      seed.workbenchSlug,
      "event workbench",
      "grassroots",
      "guitar strings",
      "pilot",
      parent.toLowerCase(),
      dateLabel,
      "$20000",
      "profit",
    ],
    related: [
      {
        label: `${parent} city workbench (leadership separate)`,
        href: communityWorkbenchHref(seed.workbenchSlug),
      },
      {
        label: `${parent} community events list`,
        href: `/election-plan/workbenches/${seed.workbenchSlug}#events`,
      },
    ],
  };
}

function buildSmokeTestQuickLinks(): AdminElectionPlanLink[] {
  const gAndG = GRASSROOTS_GUITAR_STRINGS_EVENT;
  const gAndGDate = formatPilotEventDateLabel(gAndG.eventDateIso);
  return [
    {
      label: "Faulkner County · county playbook",
      href: countyPlaybookHref("faulkner"),
      variant: "county-playbook",
      keywords: ["faulkner", "county", "smoke"],
    },
    {
      label: "Jacksonville · City workbench (primary pilot)",
      href: communityWorkbenchHref("jacksonville"),
      detail: "Primary city pilot — municipal / petition-leader focus",
      variant: "city-workbench",
      keywords: ["jacksonville", "city", "pilot", "smoke"],
      related: [{ label: "Pulaski county playbook", href: countyPlaybookHref("pulaski") }],
    },
    {
      label: "Sherwood · City workbench (optional — city leadership)",
      href: communityWorkbenchHref("sherwood"),
      detail: "City campaign plan & OPEN city leadership — not G&G event chairs",
      variant: "city-workbench",
      keywords: ["sherwood", "city", "smoke"],
      related: [
        { label: "Sherwood community events", href: "/election-plan/workbenches/sherwood#events" },
        buildPilotEventAdminLink(gAndG),
      ],
    },
    {
      label: "Sherwood · Community events (anchor)",
      href: "/election-plan/workbenches/sherwood#events",
      detail: "Jump to events block — link through to Grassroots & Guitar Strings event workbench",
      keywords: ["sherwood", "events", "smoke", "anchor"],
      related: [buildPilotEventAdminLink(gAndG)],
    },
    {
      ...buildPilotEventAdminLink(gAndG),
      label: `Grassroots & Guitar Strings · Event workbench · ${gAndGDate}`,
      detail: `Event workbench · Parent: Sherwood · Goal: $${gAndG.profitGoal.toLocaleString()} profit · Date: ${gAndGDate} · Not Sherwood city leadership`,
    },
  ];
}

function workbenchRelatedLinks(slug: string, countySlug: string | null, citySlug: string | null): AdminElectionPlanLink[] {
  const related: AdminElectionPlanLink[] = [
    { label: "Capture", href: `/election-plan/workbenches/${slug}/capture` },
    { label: "Contacts", href: `/election-plan/workbenches/${slug}/contacts` },
  ];
  if (citySlug) {
    related.push({ label: "City brief", href: cityLocationBriefHref(citySlug) });
  }
  if (countySlug) {
    related.push({ label: "County playbook", href: countyPlaybookHref(countySlug) });
    related.push({ label: "Admin county", href: `/admin/counties/${countySlug}` });
  }
  return related;
}

function countLinks(sections: AdminElectionPlanSection[]): number {
  let n = 0;
  for (const section of sections) {
    for (const link of section.links) {
      n += 1;
      n += link.related?.length ?? 0;
    }
  }
  return n;
}

/** Script-safe — pass snapshot from disk or server loader. */
export function buildAdminElectionPlanCatalogFromSnapshot(
  data: ElectionPlanWorkbenchSnapshot,
): AdminElectionPlanCatalog {
  const registry = buildCommunityWorkbenchRegistry();
  const lanes = buildLanesDrillDown(data);
  const campuses = getArkansasCampuses();
  const academy = getVolunteerAcademy();
  const meetings = getMeetingAccountability().meetings;
  const countyParties = getCountyPartyProfiles();

  const warRoomLinks: AdminElectionPlanLink[] = WAR_ROOM_TAB_GROUPS.flatMap((group) =>
    group.tabs.map((tab) => ({
      label: `${group.label} · ${tab.label}`,
      href: `/election-plan?tab=${tab.id}`,
      keywords: [tab.id, group.label.toLowerCase(), "war room", "tab"],
    })),
  );

  const workbenchKindHubs: AdminElectionPlanLink[] = (
    ["city", "campus", "program", "coalition", "media", "communications"] as const
  ).map((kind) => ({
    label: `${kindLabel(kind)} workbenches (filtered hub)`,
    href: `${communityWorkbenchHubHref()}?kind=${kind}`,
    keywords: [kind, "filter"],
  }));

  const workbenchLinks: AdminElectionPlanLink[] = registry.map((wb) => ({
    label: `${wb.name} · ${kindLabel(wb.kind)} workbench`,
    href: communityWorkbenchHref(wb.slug),
    keywords: [wb.slug, wb.kind, wb.tagline ?? "", wb.countySlug ?? ""].filter(Boolean),
    related: workbenchRelatedLinks(wb.slug, wb.countySlug, wb.citySlug),
  }));

  const eventWorkbenchLinks: AdminElectionPlanLink[] = PILOT_EVENT_SEEDS.map(buildPilotEventAdminLink);

  const countyLinks: AdminElectionPlanLink[] = data.counties.map((county) => ({
    label: `${county.county} · county playbook`,
    href: countyPlaybookHref(county.slug),
    keywords: [county.slug, county.county, county.tier, "county"],
    related: [
      { label: "Admin county", href: `/admin/counties/${county.slug}` },
      { label: "County party", href: `/election-plan/county-parties/${county.slug}` },
    ],
  }));

  const cityLinks: AdminElectionPlanLink[] = data.cities.map((city) => {
    const wb = registry.find((w) => w.citySlug === city.slug || w.slug === city.slug);
    const related: AdminElectionPlanLink[] = [];
    if (wb) {
      related.push({ label: "Community workbench", href: communityWorkbenchHref(wb.slug) });
    }
    const county = data.counties.find((c) => c.county === city.county);
    if (county) {
      related.push({ label: "County playbook", href: countyPlaybookHref(county.slug) });
    }
    return {
      label: `${city.name} · city brief`,
      href: cityLocationBriefHref(city.slug),
      keywords: [city.slug, city.name, city.county, city.influenceCategory],
      related,
    };
  });

  const campusLinks: AdminElectionPlanLink[] = campuses.map((campus) => ({
    label: `${campus.shortName} · campus`,
    href: `/election-plan/campuses/${campus.slug}`,
    keywords: [campus.slug, campus.name, campus.city, campus.county, "campus"],
    related: registry.some((w) => w.slug === campus.slug)
      ? [{ label: "Campus workbench", href: communityWorkbenchHref(campus.slug) }]
      : undefined,
  }));

  const clusterLinks: AdminElectionPlanLink[] = lanes.clusters.flatMap((cluster) => {
    const clusterLink: AdminElectionPlanLink = {
      label: `${cluster.name} · battlefield cluster`,
      href: battlefieldClusterHref(cluster.id),
      keywords: [cluster.id, cluster.name, "battlefield", "cluster"],
      related: [
        { label: "Lanes drill-down", href: lanesClusterHref(cluster.id) },
        ...cluster.counties.slice(0, 5).map((c) => ({
          label: `${c.county} (lanes)`,
          href: lanesCountyHref(cluster.id, c.slug),
        })),
      ],
    };
    return [clusterLink];
  });

  const forwardMotionLinks: AdminElectionPlanLink[] = data.forwardMotion.stops.map((stop) => ({
    label: `Forward Motion · ${stop.eventName}`,
    href: forwardMotionStopHref(stop.eventId),
    keywords: [stop.eventId, stop.eventName, stop.county, "forward motion"],
    related: stop.county
      ? [
          {
            label: "County playbook",
            href: countyPlaybookHref(
              data.counties.find((c) => c.county === stop.county)?.slug ?? stop.county.toLowerCase().replace(/\s+/g, "-"),
            ),
          },
        ]
      : undefined,
  }));

  const fieldCalendarLinks: AdminElectionPlanLink[] = data.executiveCalendar.entries.map((entry) => ({
    label: `Field worksheet · ${entry.label}`,
    href: fieldEventWorksheetHref(entry.id),
    keywords: [entry.id, entry.label, entry.county, entry.city ?? "", entry.category],
    related: [
      { label: "Field calendar tab", href: "/election-plan?tab=fieldCalendar" },
      { label: "Operations calendar", href: fieldOperationalCalendarHref() },
    ],
  }));

  const executiveBookLinks: AdminElectionPlanLink[] = EXECUTIVE_BOOK_CHAPTERS.map((chapter) => ({
    label: `Executive Book Ch. ${chapter.number} · ${chapter.title}`,
    href: chapter.href,
    keywords: [chapter.slug, chapter.title, "executive book"],
  }));

  const budgetDocLinks: AdminElectionPlanLink[] = BUDGET_SUPPORTING_DOCUMENTS.map((doc) => ({
    label: `Budget doc · ${doc.title}`,
    href: `/election-plan/executive-book/budget/documents/${doc.slug}`,
    keywords: [doc.slug, doc.title, "budget"],
  }));

  const platformLinks: AdminElectionPlanLink[] = KELLY_SOS_PLATFORM.planks.map((plank) => ({
    label: `Platform plank · ${plank.title}`,
    href: `/election-plan/platform/${plank.slug}`,
    keywords: [plank.slug, plank.title, "platform", "sos"],
  }));

  const academyLinks: AdminElectionPlanLink[] = academy.positions.flatMap((position) => [
    {
      label: `Academy role · ${position.title}`,
      href: `/election-plan/academy/${position.slug}`,
      keywords: [position.slug, position.title, position.category, "academy"],
      related: [
        { label: "How it helps", href: academyHowItHelpsHref(position.slug) },
        { label: "Training packet", href: academyTrainingRoleHref(position.slug) },
      ],
    },
  ]);

  const meetingLinks: AdminElectionPlanLink[] = meetings.map((meeting) => ({
    label: `Meeting · ${meeting.title}`,
    href: meeting.href,
    keywords: [meeting.id, meeting.title, meeting.day, "accountability"],
  }));

  const countyPartyLinks: AdminElectionPlanLink[] = countyParties.map((profile) => ({
    label: `${profile.county} · county party profile`,
    href: `/election-plan/county-parties/${profile.slug}`,
    keywords: [profile.slug, profile.county, "arkdems", "party"],
    related: [{ label: "County playbook", href: countyPlaybookHref(profile.slug) }],
  }));

  const smokeTestLinks = buildSmokeTestQuickLinks();

  const sections: AdminElectionPlanSection[] = [
    {
      id: "smoke-test",
      title: "Smoke test quick links",
      description:
        "Steve doorway — verify these open in the election-plan portal. G&G is an event workbench on Sherwood, not city leadership.",
      pinned: true,
      links: smokeTestLinks,
    },
    {
      id: "entry",
      title: "Portal entry & search",
      description: "Start here — war room home, operator auth, and portal-wide search.",
      links: STATIC_PORTAL_HUBS.filter((l) =>
        ["/election-plan", "/election-plan/search", "/election-plan/operators", "/election-plan/workbenches"].includes(l.href),
      ),
    },
    {
      id: "war-room-tabs",
      title: "War Room tabs",
      description: "Every command-center and strategy tab on the main war room — links preserve ?tab= routing.",
      links: warRoomLinks,
    },
    {
      id: "portal-modules",
      title: "Portal modules & playbooks",
      description: "Static election-plan routes — doctrine, movement infrastructure, leadership, academy hubs, and more.",
      links: STATIC_PORTAL_HUBS.filter(
        (l) =>
          !["/election-plan", "/election-plan/search", "/election-plan/operators", "/election-plan/workbenches"].includes(
            l.href,
          ),
      ),
    },
    {
      id: "workbench-kinds",
      title: "Community workbench filters",
      description: "Filtered hub views by workbench kind — city, campus, program, coalition, media, communications.",
      links: workbenchKindHubs,
    },
    {
      id: "workbenches",
      title: "Community workbenches",
      description: "Every registry workbench with capture, contacts, city brief, and county playbook cross-links where applicable.",
      links: workbenchLinks,
    },
    {
      id: "event-workbenches",
      title: "Event workbenches",
      description: "Event leadership shells — separate from city/community leadership (e.g. Grassroots & Guitar Strings).",
      links: eventWorkbenchLinks,
    },
    {
      id: "counties",
      title: "County playbooks (75)",
      description: "Election-plan county intelligence — each links to admin county ops and county party profile.",
      links: countyLinks,
    },
    {
      id: "cities",
      title: "Priority city briefs",
      description: "Location briefs with workbench and county cross-links when mapped.",
      links: cityLinks,
    },
    {
      id: "campuses",
      title: "Campus network",
      description: "Arkansas campus pages from movement infrastructure registry.",
      links: campusLinks,
    },
    {
      id: "battlefield",
      title: "Battlefield & lanes drill-down",
      description: "Nine battlefield clusters plus lanes-overview county drill paths.",
      links: clusterLinks,
    },
    {
      id: "forward-motion",
      title: "Forward Motion stops",
      description: data.forwardMotion.stops.length
        ? "Live activation queue stops from election-plan snapshot."
        : "No stops loaded — run npm run election-plan:build to populate forward-motion links.",
      links:
        forwardMotionLinks.length > 0
          ? forwardMotionLinks
          : [{ label: "Forward Motion hub (war room tab)", href: "/election-plan?tab=forwardMotion" }],
    },
    {
      id: "field-calendar",
      title: "Field calendar worksheets",
      description: data.executiveCalendar.entries.length
        ? `${data.executiveCalendar.entries.length} executive calendar entries with per-event worksheets.`
        : "No calendar entries loaded — run npm run election-plan:build for live field calendar links.",
      links:
        fieldCalendarLinks.length > 0
          ? fieldCalendarLinks
          : [
              { label: "Field calendar tab", href: "/election-plan?tab=fieldCalendar" },
              { label: "Operations calendar", href: fieldOperationalCalendarHref() },
            ],
    },
    {
      id: "executive-book",
      title: "Executive Book",
      description: "All shareable leadership chapters plus budget supporting documents.",
      links: [...executiveBookLinks, ...budgetDocLinks],
    },
    {
      id: "platform",
      title: "Kelly SOS platform planks",
      description: "Governing platform deep dives built from Big Table doctrine.",
      links: platformLinks,
    },
    {
      id: "academy",
      title: "Campaign academy roles",
      description: "Volunteer position shells with how-it-helps and training packet links.",
      links: academyLinks,
    },
    {
      id: "meetings",
      title: "Meeting & accountability",
      description: "Weekly meeting rhythms with detail pages.",
      links: [{ label: "Meetings hub", href: "/election-plan/meetings" }, ...meetingLinks],
    },
    {
      id: "county-parties",
      title: "County party intelligence",
      description: "ArkDems-sourced county party profiles and meeting candidates.",
      links: [{ label: "County parties hub", href: "/election-plan/county-parties" }, ...countyPartyLinks],
    },
    {
      id: "admin-bridge",
      title: "Admin cross-links",
      description: "Campaign Manager routes that complement election-plan portal views.",
      links: ADMIN_BRIDGE_LINKS,
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    smokeTestLinks,
    stats: {
      totalLinks: countLinks(sections),
      sectionCount: sections.length,
      workbenchCount: registry.length,
      countyCount: data.counties.length,
      cityCount: data.cities.length,
      campusCount: campuses.length,
    },
    sections,
  };
}
