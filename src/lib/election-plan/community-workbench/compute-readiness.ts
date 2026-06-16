import {
  COMMUNITY_INTEL_SECTIONS,
  COMMUNITY_KPI_TEMPLATES,
  COMMUNITY_LEADERSHIP_ROLES,
} from "./constants";
import { computeEventReadinessPct, eventKpiCurrent } from "./event-readiness";
import type {
  CommunityReadinessDimension,
  CommunityWorkbenchEventRow,
  CommunityWorkbenchView,
} from "./types";

type ReadinessInput = Pick<
  CommunityWorkbenchView,
  "leadership" | "missions" | "events" | "relationships" | "intel" | "committees" | "fieldEntry"
>;

export function computeCommunityReadiness(input: ReadinessInput): {
  dimensions: CommunityReadinessDimension[];
  overallPct: number;
} {
  const leadershipFilled = input.leadership.filter((r) => r.personName?.trim()).length;
  const leadershipPct = Math.round((leadershipFilled / COMMUNITY_LEADERSHIP_ROLES.length) * 100);

  const volunteerQty =
    input.fieldEntry.rollups.find((r) => r.category === "volunteer")?.totalQuantity ?? 0;
  const volunteerPct = Math.min(100, Math.round((volunteerQty / 25) * 100));

  const eventsPct = computeEventReadinessPct(input.events);

  const relationshipsPct = Math.min(100, Math.round((input.relationships.length / 10) * 100));

  const intelTarget = COMMUNITY_INTEL_SECTIONS.length * 2;
  const dataPct = Math.min(100, Math.round((input.intel.length / intelTarget) * 100));

  const orgPct = Math.min(100, Math.round(((input.committees.length + input.missions.length) / 6) * 100));

  const dimensions: CommunityReadinessDimension[] = [
    { key: "leadership", label: "Leadership", pct: leadershipPct },
    { key: "volunteers", label: "Volunteers", pct: volunteerPct },
    { key: "events", label: "Events", pct: eventsPct },
    { key: "relationships", label: "Relationships", pct: relationshipsPct },
    { key: "data", label: "Data", pct: dataPct },
    { key: "organization", label: "Organization", pct: orgPct },
  ];

  const overallPct = Math.round(dimensions.reduce((s, d) => s + d.pct, 0) / dimensions.length);
  return { dimensions, overallPct };
}

export function kpiMetricsForTemplate(
  templateKey: string,
  fieldRollups: CommunityWorkbenchView["fieldEntry"]["rollups"],
  events: CommunityWorkbenchEventRow[] = [],
): CommunityWorkbenchView["kpiMetrics"] {
  const template = COMMUNITY_KPI_TEMPLATES[templateKey] ?? COMMUNITY_KPI_TEMPLATES.default_city;
  return template.metrics.map((m) => {
    let current: number | undefined;
    if (m.key === "volunteers" || m.key === "hci" || m.key === "conversations") {
      const cat =
        m.key === "volunteers"
          ? "volunteer"
          : m.key === "hci" || m.key === "conversations"
            ? "conversation"
            : null;
      if (cat) {
        current = fieldRollups.find((r) => r.category === cat)?.totalQuantity;
      }
    }
    if (m.key === "events" || m.key === "town_halls" || m.key === "fairs") {
      const fromEvents = eventKpiCurrent(events, m.key);
      if (fromEvents != null) current = fromEvents;
      else current = fieldRollups.find((r) => r.category === "house_party")?.entryCount;
    }
    if (m.key === "town_hall") {
      current = eventKpiCurrent(events, m.key) ?? current;
    }
    if (m.key === "leaders" || m.key === "faith" || m.key === "business") {
      current = fieldRollups.find((r) => r.category === "leader")?.totalQuantity;
    }
    return { ...m, current };
  });
}
