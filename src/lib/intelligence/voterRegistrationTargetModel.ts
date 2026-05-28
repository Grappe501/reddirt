import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { GLOBAL_NEW_VOTER_REGISTRATION_GOAL } from "@/lib/campaign-dates";
import { loadKellyWinTargetScenarioFile } from "@/lib/election-targets/load-win-target-scenario";
import { getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";

export const CAMPAIGN_VOTER_REGISTRATION_ASSUMPTIONS_REL =
  "data/intelligence/campaign-voter-registration-assumptions.json";

export type VoterRegistrationAssumptions = {
  version: number;
  registrationTurnoutAssumption: number;
  supportCaptureAssumption: number;
  notes: string;
};

export type RegistrationPathwayRow = {
  countyId: string;
  countyName: string;
  registrySlug: string;
  registrationGoal: number | null;
  expectedVotes: number | null;
  expectedSupportVotes: number | null;
  dataStatus: "PRESENT" | "MISSING" | "STATEWIDE_ONLY";
  confidenceLabel: "NEEDS_VALIDATION";
  warnings: string[];
};

export function loadVoterRegistrationAssumptions(
  repoRoot: string = process.cwd(),
): VoterRegistrationAssumptions {
  const abs = path.join(repoRoot, CAMPAIGN_VOTER_REGISTRATION_ASSUMPTIONS_REL);
  if (!existsSync(abs)) {
    return {
      version: 1,
      registrationTurnoutAssumption: 0.3,
      supportCaptureAssumption: 0.75,
      notes: "Default assumptions — artifact missing.",
    };
  }
  return JSON.parse(readFileSync(abs, "utf8")) as VoterRegistrationAssumptions;
}

export function computeRegistrationExpectedVotes(
  registrations: number,
  repoRoot?: string,
): number {
  const assumptions = loadVoterRegistrationAssumptions(repoRoot);
  return Math.round(registrations * assumptions.registrationTurnoutAssumption);
}

export function computeRegistrationSupportYield(
  expectedVotes: number,
  repoRoot?: string,
): number {
  const assumptions = loadVoterRegistrationAssumptions(repoRoot);
  return Math.round(expectedVotes * assumptions.supportCaptureAssumption);
}

export function computeCountyRegistrationPathway(
  countyId: string,
  registrationGoal: number | null,
  repoRoot: string = process.cwd(),
): RegistrationPathwayRow {
  const registrySlug = countyId === "statewide" ? "statewide" : `${countyId}-county`;
  const registry = countyId === "statewide" ? null : getRegistryCountyBySlug(registrySlug);
  const warnings: string[] = [
    "Assumptions are anecdotal and require field validation before strategic reliance.",
  ];

  if (registrationGoal === null || registrationGoal <= 0) {
    return {
      countyId,
      countyName: registry?.displayName ?? (countyId === "statewide" ? "Statewide" : `${countyId} County`),
      registrySlug,
      registrationGoal: null,
      expectedVotes: null,
      expectedSupportVotes: null,
      dataStatus: "MISSING",
      confidenceLabel: "NEEDS_VALIDATION",
      warnings: [...warnings, "County registration goal not populated in governed sources."],
    };
  }

  const expectedVotes = computeRegistrationExpectedVotes(registrationGoal, repoRoot);
  const expectedSupportVotes = computeRegistrationSupportYield(expectedVotes, repoRoot);

  return {
    countyId,
    countyName: registry?.displayName ?? (countyId === "statewide" ? "Statewide" : `${countyId} County`),
    registrySlug,
    registrationGoal,
    expectedVotes,
    expectedSupportVotes,
    dataStatus: "PRESENT",
    confidenceLabel: "NEEDS_VALIDATION",
    warnings,
  };
}

export function computeStatewideRegistrationRollup(
  repoRoot: string = process.cwd(),
): {
  statewideRegistrationGoal: number;
  expectedVotes: number;
  expectedSupportVotes: number;
  assumptions: VoterRegistrationAssumptions;
  countyRows: RegistrationPathwayRow[];
  missingCountyGoalCount: number;
  winTargetComparison: {
    workingTargetWithCushion: number | null;
    expectedSupportGap: number | null;
    note: string;
  };
} {
  const assumptions = loadVoterRegistrationAssumptions(repoRoot);
  const winScenario = loadKellyWinTargetScenarioFile(repoRoot);
  const regGoalsFile = existsSync(path.join(repoRoot, "data/election/arkansas-voter-registration-goals.normalized.json"))
    ? (JSON.parse(
        readFileSync(path.join(repoRoot, "data/election/arkansas-voter-registration-goals.normalized.json"), "utf8"),
      ) as { rows: Array<{ county: string; goal: number }> })
    : { rows: [] };

  const goalByCounty = new Map(regGoalsFile.rows.map((row) => [row.county, row.goal]));

  const countyRows: RegistrationPathwayRow[] = [];
  if (winScenario) {
    for (const row of winScenario.counties) {
      const countyId = row.county.toLowerCase().replace(/\s+/g, "-");
      const goal = goalByCounty.get(row.county) ?? null;
      countyRows.push(computeCountyRegistrationPathway(countyId, goal, repoRoot));
    }
  }

  const missingCountyGoalCount = countyRows.filter((row) => row.dataStatus === "MISSING").length;
  const statewideRegistrationGoal = GLOBAL_NEW_VOTER_REGISTRATION_GOAL;
  const expectedVotes = computeRegistrationExpectedVotes(statewideRegistrationGoal, repoRoot);
  const expectedSupportVotes = computeRegistrationSupportYield(expectedVotes, repoRoot);

  const workingTarget = winScenario?.statewide.workingTargetWithCushion ?? null;
  const expectedSupportGap =
    workingTarget !== null ? workingTarget - expectedSupportVotes : null;

  return {
    statewideRegistrationGoal,
    expectedVotes,
    expectedSupportVotes,
    assumptions,
    countyRows,
    missingCountyGoalCount,
    winTargetComparison: {
      workingTargetWithCushion: workingTarget,
      expectedSupportGap,
      note:
        workingTarget !== null
          ? "Registration-yield model is illustrative only — does not replace win-target scenario math."
          : "Win-target scenario file missing — cannot compare registration yield to working target.",
    },
  };
}
