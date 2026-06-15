/**
 * Load and normalize captured progress + event outcomes.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_COUNTY_REGISTRY } from "../../../src/lib/county/arkansas-county-registry";
import { OPPORTUNITY_CLUSTERS } from "../../strategic-plan/data/opportunity-clusters";
import { readJson, shortCountyName, loadDropOffTotals, loadOpportunityCounties, BRAIN_DATA } from "./inputs";
import type { CapturedProgressFile, EventOutcomeRecord } from "./feedback-types";

const OUTCOMES_PATH = path.join(BRAIN_DATA, "event-outcomes.json");

export function defaultCapturedProgress(): CapturedProgressFile {
  const dropOff = loadDropOffTotals();
  const opp = loadOpportunityCounties();
  const l4goal = Math.round(opp.reduce((s, c) => s + c.republicanConversionPotential, 0));

  const byCounty: CapturedProgressFile["byCounty"] = {};
  for (const reg of ARKANSAS_COUNTY_REGISTRY) {
    const county = shortCountyName(reg.displayName);
    byCounty[county] = { capturedVci: 0, byLane: { lane2: 0, lane3: 0, lane4: 0 } };
  }

  const byCluster: CapturedProgressFile["byCluster"] = {};
  for (const c of OPPORTUNITY_CLUSTERS) {
    byCluster[c.id] = { capturedVci: 0 };
  }

  return {
    version: 2,
    note: "Update after field events. Lane captures roll up to capturedVci. Re-run campaign-brain:build.",
    statewide: {
      byLane: {
        lane1: { captured: 0, goal: 325_814 },
        lane2: { captured: 0, goal: dropOff.recovery50Total, potential: dropOff.rawDropOff },
        lane3: { captured: 0, goal: 50_000 },
        lane4: { captured: 0, goal: l4goal },
      },
    },
    byCounty,
    byCluster,
  };
}

export function loadCapturedProgressV2(): CapturedProgressFile {
  const p = path.join(BRAIN_DATA, "captured-progress.json");
  const raw = readJson<Partial<CapturedProgressFile>>(p);
  const defaults = defaultCapturedProgress();

  if (!raw || raw.version !== 2) {
    return defaults;
  }

  for (const reg of ARKANSAS_COUNTY_REGISTRY) {
    const county = shortCountyName(reg.displayName);
    if (!raw.byCounty?.[county]) {
      raw.byCounty = raw.byCounty ?? {};
      raw.byCounty[county] = defaults.byCounty[county];
    }
  }
  for (const c of OPPORTUNITY_CLUSTERS) {
    if (!raw.byCluster?.[c.id]) {
      raw.byCluster = raw.byCluster ?? {};
      raw.byCluster[c.id] = { capturedVci: 0 };
    }
  }

  return {
    ...defaults,
    ...raw,
    statewide: { ...defaults.statewide, ...raw.statewide, byLane: { ...defaults.statewide.byLane, ...raw.statewide?.byLane } },
    byCounty: { ...defaults.byCounty, ...raw.byCounty },
    byCluster: { ...defaults.byCluster, ...raw.byCluster },
  };
}

export function loadEventOutcomes(): EventOutcomeRecord[] {
  const data = readJson<{ outcomes: EventOutcomeRecord[] }>(OUTCOMES_PATH);
  return data?.outcomes ?? [];
}

export function saveCapturedProgressIfMissing(data: CapturedProgressFile): void {
  const p = path.join(BRAIN_DATA, "captured-progress.json");
  if (!existsSync(p)) {
    writeFileSync(p, JSON.stringify(data, null, 2), "utf8");
  }
}

export function rollupLaneCaptureFromOutcomes(outcomes: EventOutcomeRecord[]): {
  lane2: number;
  lane3: number;
  lane4: number;
} {
  let lane2 = 0;
  let lane3 = 0;
  let lane4 = 0;
  for (const o of outcomes) {
    if (!o.attended) continue;
    lane3 += o.registrationFormsCompleted ?? 0;
    lane2 += Math.round((o.newContacts ?? 0) * 0.15);
    if (o.clerkRelationshipAdvanced) lane4 += 50;
    lane4 += (o.faithLeadersEngaged ?? 0) * 5;
  }
  return { lane2, lane3, lane4 };
}
