/**
 * Phase 15 P8 — Staff backstage guard inventory.
 */
import { STAFF_OPERATIONS_HREF_PREFIXES } from "@/lib/intelligence/v4/staffBackstageRouteGuard";
import { BUILDER_INFRA_HREF_PREFIXES } from "@/lib/intelligence/v4/phase15CandidateCommandDepth";

export const STAFF_BACKSTAGE_HUB_HREF = "/admin/intelligence/staff-backstage";

export const PHASE15_P8_GUARD_CATEGORY_TOTAL = 8;

export type StaffBackstageGuardKind =
  | "phase-upgrade"
  | "build-progress"
  | "chunk-pipeline"
  | "supreme-workbench"
  | "command-center"
  | "agent-tooling"
  | "morning-brief"
  | "strategy-hub";

export type StaffBackstageGuardSurface = {
  surfaceId: string;
  kind: StaffBackstageGuardKind;
  title: string;
  href: string;
  guardReason: string;
  kellyRule: string;
};

const SURFACES: StaffBackstageGuardSurface[] = [
  {
    surfaceId: "phase-upgrade-routes",
    kind: "phase-upgrade",
    title: "Phase upgrade passes",
    href: "/admin/intelligence/phase-15-p0-p1-upgrade",
    guardReason: "Builder exit gates and stack metrics — not candidate destinations.",
    kellyRule: "Kelly never needs phase-*-upgrade URLs; staff uses them for master build sessions.",
  },
  {
    surfaceId: "build-progress-hub",
    kind: "build-progress",
    title: "Build progress",
    href: "/admin/intelligence/build-progress",
    guardReason: "Master intelligence stack tracker with phase completion percentages.",
    kellyRule: "Readiness on command home — not engineering progress dashboards.",
  },
  {
    surfaceId: "chunk-pipeline-hub",
    kind: "chunk-pipeline",
    title: "Field Book chunk pipeline",
    href: "/admin/intelligence/field-book-chunk-promotion",
    guardReason: "P5–P8 promotion pipeline — chunk batches, preview lanes, execution waves.",
    kellyRule: "Field Book excerpts on Safety nav — not promotion operator queues.",
  },
  {
    surfaceId: "supreme-workbench-hub",
    kind: "supreme-workbench",
    title: "Supreme workbench",
    href: "/admin/intelligence/supreme-workbench",
    guardReason: "Full operator dashboard with module nav and build gaps.",
    kellyRule: "Command home compact panel only — full workbench is staff backstage.",
  },
  {
    surfaceId: "command-center-hub",
    kind: "command-center",
    title: "Command center",
    href: "/admin/intelligence/command-center",
    guardReason: "Cross-lane staff orientation — builder and research modules.",
    kellyRule: "Candidate command home replaces cross-lane staff orientation.",
  },
  {
    surfaceId: "agent-tooling-hub",
    kind: "agent-tooling",
    title: "Agent tooling",
    href: "/admin/intelligence/agent-tooling",
    guardReason: "AI copilot prep runs and governed tool registry — staff review required.",
    kellyRule: "iPad AI prep button returns governed outputs — not raw agent tooling hub.",
  },
  {
    surfaceId: "morning-brief-hub",
    kind: "morning-brief",
    title: "Morning brief",
    href: "/admin/intelligence/morning-brief",
    guardReason: "Staff daily digest and action queue — NON_PUBLISHABLE until review.",
    kellyRule: "Kelly reads command home safe/blocked lines — not full morning intelligence digest.",
  },
  {
    surfaceId: "strategy-philosophy-hub",
    kind: "strategy-hub",
    title: "Strategy & philosophy hub",
    href: "/admin/intelligence/strategy-philosophy-hub",
    guardReason: "Full strategy inventory, campaign system manual crosswalk, Phase 10 orchestration.",
    kellyRule: "Top-tier prep and philosophy briefings — not 252-file builder inventory.",
  },
];

export function listStaffBackstageGuardSurfaces(): StaffBackstageGuardSurface[] {
  return SURFACES;
}

export function getStaffBackstageGuardSurface(surfaceId: string): StaffBackstageGuardSurface | undefined {
  return SURFACES.find((s) => s.surfaceId === surfaceId);
}

export function countStaffBackstageGuardPrefixes(): number {
  return BUILDER_INFRA_HREF_PREFIXES.length + STAFF_OPERATIONS_HREF_PREFIXES.length;
}

export type StaffBackstageSummary = {
  hubHref: string;
  guardCategoryCount: number;
  prefixCount: number;
  tonightReminder: string;
};

export function buildStaffBackstageSummary(): StaffBackstageSummary {
  return {
    hubHref: STAFF_BACKSTAGE_HUB_HREF,
    guardCategoryCount: SURFACES.length,
    prefixCount: countStaffBackstageGuardPrefixes(),
    tonightReminder:
      "Staff backstage routes redirect to command home on CANDIDATE and CLERK_WEEK profiles — set NEXT_PUBLIC_INTELLIGENCE_NAV_PROFILE=STAFF for operator access.",
  };
}
