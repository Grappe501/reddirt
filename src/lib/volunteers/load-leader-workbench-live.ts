import type { CountyDashboardKpiItem } from "@/lib/campaign-engine/county-dashboards/types";
import { loadCommunityWorkbenchEvent } from "@/lib/election-plan/community-workbench/load-workbench-event";
import { loadCommunityWorkbench } from "@/lib/election-plan/community-workbench/load-workbench";
import type { CommunityWorkbenchEventRow } from "@/lib/election-plan/community-workbench/types";
import {
  loadFieldEntriesForLocation,
  loadFieldEntriesForOperator,
} from "@/lib/election-plan/field-entry/load-field-entries";
import { getCountyNarrativePacket } from "@/lib/narrative-distribution/packet-builder";
import { resolveLeaderGeographyScope, workbenchSlugsFromScope } from "@/lib/volunteers/leader-scope";
import type { VolunteerLeader } from "@/lib/volunteers/types";

export type LeaderCalendarItem = {
  id: string;
  title: string;
  dateLabel: string;
  status: string;
  href: string;
  workbenchName: string;
};

export type LeaderEventEmbed = {
  title: string;
  status: string;
  leadName: string | null;
  assignmentFilled: number;
  assignmentTotal: number;
  href: string;
  roles: Array<{ role: string; assignee: string }>;
};

export type LeaderMessageSlice = {
  countySlug: string;
  displayName: string;
  coreLine: string;
  messagesHref: string;
};

export type LeaderWorkbenchLiveData = {
  liveKpis: CountyDashboardKpiItem[];
  calendar: LeaderCalendarItem[];
  eventEmbeds: LeaderEventEmbed[];
  messageSlice: LeaderMessageSlice | null;
  operatorEntries: { totalQuantity: number; entryCount: number };
  recordSource: "live" | "empty";
  primaryCountySlug: string | null;
  primaryCitySlug: string | null;
  primaryCountyName: string | null;
};

function formatEventDate(iso: string | null): string {
  if (!iso) return "Date TBD";
  try {
    return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return "Date TBD";
  }
}

function upcomingEventsFromRows(
  events: CommunityWorkbenchEventRow[],
  workbenchSlug: string,
  workbenchName: string,
): LeaderCalendarItem[] {
  const openStatuses = new Set(["idea", "planned", "confirmed"]);
  return events
    .filter((e) => openStatuses.has(e.status))
    .slice(0, 6)
    .map((e) => ({
      id: e.id,
      title: e.title,
      dateLabel: formatEventDate(e.eventDate),
      status: e.status,
      href: `/election-plan/workbenches/${workbenchSlug}#events`,
      workbenchName,
    }));
}

function buildEventEmbed(
  workbenchSlug: string,
  eventSlug: string,
  event: CommunityWorkbenchEventRow,
): LeaderEventEmbed {
  const filled = event.assignments.filter((a) => a.assignee?.trim()).length;
  return {
    title: event.title,
    status: event.status,
    leadName: event.leadName,
    assignmentFilled: filled,
    assignmentTotal: event.assignments.length,
    href: `/election-plan/workbenches/${workbenchSlug}/events/${eventSlug}`,
    roles: event.assignments.slice(0, 6),
  };
}

export async function loadLeaderWorkbenchLiveData(leader: VolunteerLeader): Promise<LeaderWorkbenchLiveData> {
  const scope = resolveLeaderGeographyScope(leader);
  const slugs = workbenchSlugsFromScope(scope);

  const [workbenches, operatorEntries, countyField, ...eventViews] = await Promise.all([
    Promise.all(slugs.map((slug) => loadCommunityWorkbench(slug))),
    loadFieldEntriesForOperator(leader.initials),
    scope.primaryCountySlug
      ? loadFieldEntriesForLocation({ countySlug: scope.primaryCountySlug, citySlug: scope.primaryCitySlug })
      : Promise.resolve({ entries: [], rollups: [], totalQuantity: 0 }),
    ...scope.events.map((e) => loadCommunityWorkbenchEvent(e.workbenchSlug, e.eventSlug)),
  ]);

  const validWorkbenches = workbenches.filter((w): w is NonNullable<typeof w> => w != null);

  let leadershipFilled = 0;
  let leadershipTotal = 0;
  let relationships = 0;
  let eventsScheduled = 0;
  let fieldLogTotal = 0;
  if (validWorkbenches.length) {
    fieldLogTotal = validWorkbenches.reduce((sum, wb) => sum + wb.fieldEntry.totalQuantity, 0);
  } else {
    fieldLogTotal = countyField.totalQuantity;
  }

  const calendar: LeaderCalendarItem[] = [];

  for (const wb of validWorkbenches) {
    leadershipFilled += wb.leadership.filter((l) => l.personName?.trim()).length;
    leadershipTotal += wb.leadership.length;
    relationships += wb.relationships.length;
    eventsScheduled += wb.events.filter((e) => ["planned", "confirmed", "executed"].includes(e.status)).length;
    calendar.push(...upcomingEventsFromRows(wb.events, wb.slug, wb.name));
  }

  calendar.sort((a, b) => a.dateLabel.localeCompare(b.dateLabel));

  const eventEmbeds: LeaderEventEmbed[] = scope.events
    .map((spec, i) => {
      const view = eventViews[i];
      if (!view) return null;
      return buildEventEmbed(spec.workbenchSlug, spec.eventSlug, view.event);
    })
    .filter((e): e is LeaderEventEmbed => e != null);

  const primaryCounty = leader.connections.find((c) => c.kind === "county");
  const primaryCountyName = primaryCounty?.kind === "county" ? primaryCounty.county : null;

  let messageSlice: LeaderMessageSlice | null = null;
  if (scope.primaryCountySlug) {
    try {
      const packet = getCountyNarrativePacket(scope.primaryCountySlug);
      messageSlice = {
        countySlug: scope.primaryCountySlug,
        displayName: primaryCountyName ? `${primaryCountyName} County` : scope.primaryCountySlug,
        coreLine: packet.coreMessage,
        messagesHref: "/messages",
      };
    } catch {
      if (primaryCountyName) {
        messageSlice = {
          countySlug: scope.primaryCountySlug,
          displayName: `${primaryCountyName} County`,
          coreLine: `County message support for ${primaryCountyName} — open the hub for shareable conversation prompts.`,
          messagesHref: "/messages",
        };
      }
    }
  }

  const liveKpis: CountyDashboardKpiItem[] = [
    {
      label: "Your field entries",
      metric: { value: operatorEntries.totalQuantity, source: "db" },
      actionHint: `${operatorEntries.entryCount} logs tagged ${leader.initials}`,
    },
    {
      label: "Leadership slots filled",
      metric: {
        value: leadershipTotal ? `${leadershipFilled} / ${leadershipTotal}` : leadershipFilled,
        source: "db",
      },
      actionHint: "Community workbench roles with names",
    },
    {
      label: "Local relationships",
      metric: { value: relationships, source: "db" },
      actionHint: "Workbench relationship records",
    },
    {
      label: "Events on calendar",
      metric: { value: eventsScheduled, source: "db" },
      actionHint: "Planned, confirmed, or executed",
    },
    {
      label: "Area field log qty",
      metric: { value: fieldLogTotal, source: "db" },
      actionHint: scope.primaryCountySlug ? `${scope.primaryCountySlug} county rollups` : "Geography rollups",
    },
  ];

  const hasLive =
    operatorEntries.entryCount > 0 ||
    leadershipFilled > 0 ||
    relationships > 0 ||
    eventsScheduled > 0 ||
    fieldLogTotal > 0 ||
    eventEmbeds.length > 0;

  return {
    liveKpis,
    calendar: calendar.slice(0, 8),
    eventEmbeds,
    messageSlice,
    operatorEntries: {
      totalQuantity: operatorEntries.totalQuantity,
      entryCount: operatorEntries.entryCount,
    },
    recordSource: hasLive ? "live" : "empty",
    primaryCountySlug: scope.primaryCountySlug,
    primaryCitySlug: scope.primaryCitySlug,
    primaryCountyName,
  };
}
