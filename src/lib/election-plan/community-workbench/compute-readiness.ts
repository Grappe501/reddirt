import { COMMUNITY_INTEL_SECTIONS, COMMUNITY_LEADERSHIP_ROLES } from "./constants";
import { computeEventReadinessPct } from "./event-readiness";
import type { CommunityReadinessDimension, CommunityWorkbenchView } from "./types";

type ReadinessInput = Pick<
  CommunityWorkbenchView,
  "leadership" | "missions" | "events" | "relationships" | "intel" | "committees" | "fieldEntry"
>;

/** Readiness from record presence only — no planning JSON denominators (Principle 1). */
export function computeCommunityReadiness(input: ReadinessInput): {
  dimensions: CommunityReadinessDimension[];
  overallPct: number;
} {
  const leadershipFilled = input.leadership.filter((r) => r.personName?.trim()).length;
  const leadershipPct = Math.round((leadershipFilled / COMMUNITY_LEADERSHIP_ROLES.length) * 100);

  const volunteerQty =
    input.fieldEntry.rollups.find((r) => r.category === "volunteer")?.totalQuantity ?? 0;
  const volunteerPct = volunteerQty > 0 ? 100 : 0;

  const eventsPct = computeEventReadinessPct(input.events);

  const relationshipsPct = input.relationships.length > 0 ? 100 : 0;

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
