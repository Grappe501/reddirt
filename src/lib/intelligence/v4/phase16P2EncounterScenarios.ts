/**
 * Phase 16 P2 — Encounter scenario registry (ACCA, three-way, clerk 1:1, purchase).
 */
import { DEMO_MODE_HUB_HREF } from "@/lib/intelligence/v4/phase15P6DemoMode";
import {
  buildRehearsalSession,
  getDefaultRunOfShowSteps,
  REHEARSAL_HUB_HREF,
  type RehearsalEncounterId,
  type RehearsalRunOfShowStep,
} from "@/lib/intelligence/v4/phase16P0SessionLauncher";

export const ENCOUNTERS_HUB_HREF = "/admin/intelligence/encounters";

export const PHASE16_P2_SCENARIO_TOTAL = 4;

export type EncounterScenarioId = RehearsalEncounterId;

export type EncounterScenario = {
  scenarioId: EncounterScenarioId;
  title: string;
  description: string;
  kellyRule: string;
  audienceLabel: string;
  venueLabel: string;
  eventDateLabel: string;
  durationMinutes: number;
  durationLabel: string;
  primaryBindHref: string;
  launchHref: string;
  honestyRule: string;
  stepCount: number;
  stageSafeStepCount: number;
};

const SCENARIO_REGISTRY: Record<
  EncounterScenarioId,
  Omit<EncounterScenario, "durationMinutes" | "durationLabel" | "stepCount" | "stageSafeStepCount">
> = {
  "debate-prep": {
    scenarioId: "debate-prep",
    title: "Three-way debate prep",
    description:
      "Moderated forum with Hammer and Pakko — trap lanes, SOS speak-order, film-room pivots, and claims close.",
    kellyRule: "Start here when the stage is a moderated debate or three-way forum.",
    audienceLabel: "General election voters · debate moderators · livestream audience",
    venueLabel: "Televised debate or multi-candidate forum",
    eventDateLabel: "Tonight · flexible",
    primaryBindHref: "/admin/intelligence/kim-hammer/debate-prep",
    launchHref: `${ENCOUNTERS_HUB_HREF}?scenario=debate-prep`,
    honestyRule:
      "Drill steps inherit evidence honesty badges — NEEDS_REVIEW lines stay research-question framing only.",
  },
  "acca-panel": {
    scenarioId: "acca-panel",
    title: "ACCA summer conference panel",
    description:
      "County-clerk audience at Mountain View — clerk-room vocabulary, pocket pledge, moderated Q&A, and funding trap lane.",
    kellyRule: "Use before any county-clerk audience — claims gate on funding and equipment lines.",
    audienceLabel: "County clerks · election commissioners · quorum court funders",
    venueLabel: "Mountain View · ACCA summer conference",
    eventDateLabel: "Jun 11 · ACCA panel",
    primaryBindHref: "/admin/intelligence/county-clerk-week/acca-summer-conference",
    launchHref: `${ENCOUNTERS_HUB_HREF}?scenario=acca-panel`,
    honestyRule:
      "Clerk-room dollar amounts and equipment claims require VERIFIED badge or staff-verify fallback before stage.",
  },
  "clerk-meeting": {
    scenarioId: "clerk-meeting",
    title: "Clerk 1:1 meeting",
    description:
      "Single county clerk conversation — funding evidence, VVSG vocabulary, one trap pivot, no panel theatrics.",
    kellyRule: "One county clerk conversation — not a panel, not a debate.",
    audienceLabel: "One county clerk or election commissioner",
    venueLabel: "Clerk office · courthouse conference room",
    eventDateLabel: "Scheduled county visit",
    primaryBindHref: "/admin/intelligence/election-funding",
    launchHref: `${ENCOUNTERS_HUB_HREF}?scenario=clerk-meeting`,
    honestyRule:
      "Statutory funding evidence only — no unsourced awards; blocked lines show staff-verify fallback from stage-safe filter.",
  },
  "purchase-walkthrough": {
    scenarioId: "purchase-walkthrough",
    title: "Purchase walkthrough",
    description:
      "Staff-led buyer demo — 15-minute script through command home, trap lane, philosophy, opposition, and iPad deploy.",
    kellyRule: "Staff-led buyer conversation — routes to Phase 15 demo-mode script.",
    audienceLabel: "Campaign buyer · funder · demo audience",
    venueLabel: "Staff demo session · remote or in-person",
    eventDateLabel: "Demo slot · flexible",
    primaryBindHref: DEMO_MODE_HUB_HREF,
    launchHref: `${ENCOUNTERS_HUB_HREF}?scenario=purchase-walkthrough`,
    honestyRule:
      "Demo script surfaces evidence badges on every proof line — buyer sees honesty gate, not unsourced claims.",
  },
};

export const ENCOUNTER_SCENARIO_IDS = Object.keys(SCENARIO_REGISTRY) as EncounterScenarioId[];

function enrichScenario(
  base: Omit<EncounterScenario, "durationMinutes" | "durationLabel" | "stepCount" | "stageSafeStepCount">,
  steps: RehearsalRunOfShowStep[],
): EncounterScenario {
  const durationMinutes =
    base.scenarioId === "purchase-walkthrough"
      ? 15
      : steps.reduce((s, step) => s + step.durationMinutes, 0);
  const stageSafeStepCount = steps.filter((s) => s.stageSafeRequired).length;
  return {
    ...base,
    durationMinutes,
    durationLabel: `${durationMinutes} min`,
    stepCount: base.scenarioId === "purchase-walkthrough" ? 7 : steps.length,
    stageSafeStepCount,
  };
}

export function getEncounterScenarioSteps(scenarioId: EncounterScenarioId): RehearsalRunOfShowStep[] {
  if (scenarioId === "purchase-walkthrough") return [];
  return getDefaultRunOfShowSteps(scenarioId);
}

export function getEncounterScenario(scenarioId: EncounterScenarioId): EncounterScenario | undefined {
  const base = SCENARIO_REGISTRY[scenarioId];
  if (!base) return undefined;
  const steps = getEncounterScenarioSteps(scenarioId);
  return enrichScenario(base, steps);
}

export function listEncounterScenarios(): EncounterScenario[] {
  return ENCOUNTER_SCENARIO_IDS.map((id) => getEncounterScenario(id)!);
}

export function resolveEncounterScenarioId(raw: string | undefined): EncounterScenarioId {
  if (raw && ENCOUNTER_SCENARIO_IDS.includes(raw as EncounterScenarioId)) {
    return raw as EncounterScenarioId;
  }
  return "debate-prep";
}

export function getEncounterScenarioSessionHref(scenarioId: EncounterScenarioId): string {
  if (scenarioId === "purchase-walkthrough") return DEMO_MODE_HUB_HREF;
  return `${REHEARSAL_HUB_HREF}?encounter=${scenarioId}`;
}

export function scenarioPrimaryBindMatches(scenarioId: EncounterScenarioId): boolean {
  const scenario = getEncounterScenario(scenarioId);
  if (!scenario) return false;
  return scenario.primaryBindHref.startsWith("/admin/intelligence");
}

export type EncounterScenariosSummary = {
  hubHref: string;
  scenarioCount: number;
  defaultScenarioId: EncounterScenarioId;
  defaultTitle: string;
  accaBindHref: string;
  tonightReminder: string;
};

export function buildEncounterScenariosSummary(): EncounterScenariosSummary {
  const acca = getEncounterScenario("acca-panel")!;
  const defaultScenario = getEncounterScenario("debate-prep")!;
  return {
    hubHref: ENCOUNTERS_HUB_HREF,
    scenarioCount: PHASE16_P2_SCENARIO_TOTAL,
    defaultScenarioId: "debate-prep",
    defaultTitle: defaultScenario.title,
    accaBindHref: acca.primaryBindHref,
    tonightReminder:
      "Pick tonight's encounter scenario — ACCA panel, three-way debate, clerk 1:1, or purchase walkthrough — each binds existing prep depth with evidence honesty gates.",
  };
}

export function buildEncounterScenarioSession(scenarioId: EncounterScenarioId = "debate-prep") {
  return buildRehearsalSession(scenarioId);
}
