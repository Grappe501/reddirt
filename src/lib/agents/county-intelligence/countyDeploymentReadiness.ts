import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import type { CountyReadinessClassification, CountyDeploymentReadiness } from "./county-kpi-types";
import {
  listCountyWorkbenchCounties,
  loadCountyKpis,
} from "./county-workbench-adapter";
import type { CanonicalRegistrationGoalRow } from "@/lib/campaign-engine/county-registration-goal-read";

const V2 = new Set(["pope", "pulaski", "faulkner"]);
const NEXT_BUILD = new Set(["benton", "washington"]);
const KH_OVERLAY = new Set(["pulaski", "washington", "benton", "sebastian", "craighead"]);
const FULL = new Set(["pope", "pulaski", "faulkner", "garland", "jefferson", "saline"]);

function classify(
  workbenchSlug: string,
  depth: "full" | "shell",
  completion: number,
  hasProfile: boolean,
  canonical: CanonicalRegistrationGoalRow | null | undefined,
): CountyDeploymentReadiness {
  if (depth === "shell" && completion <= 5 && !hasProfile) return "SHELL_ONLY";
  if (V2.has(workbenchSlug) || (depth === "full" && hasProfile)) return "INTERNAL_PLANNING_ONLY";
  if (canonical?.canonicalRegistrationGoalStatus === "live" && depth === "full") {
    return "INTERNAL_PLANNING_ONLY";
  }
  if (KH_OVERLAY.has(workbenchSlug)) return "INTERNAL_PLANNING_ONLY";
  return "SHELL_ONLY";
}

export function buildCountyReadinessClassifications(
  canonicalMap: Map<string, CanonicalRegistrationGoalRow> = new Map(),
): CountyReadinessClassification[] {
  const coverage = listCountyWorkbenchCounties();
  const bySlug = new Map(coverage.map((c) => [c.countySlug, c]));

  return ARKANSAS_COUNTY_REGISTRY.map((reg) => {
    const short = reg.slug.replace(/-county$/, "");
    const row = bySlug.get(short);
    const kpi = loadCountyKpis(short);
    const canonical = canonicalMap.get(reg.slug);
    const deployment = classify(
      short,
      row?.workbenchDepth ?? "shell",
      row?.completionPercent ?? 5,
      row?.hasCountyProfile ?? false,
      canonical,
    );

    let dashboardStatus = `Command scaffold (/counties/${reg.slug})`;
    if (V2.has(short)) dashboardStatus = `Dashboard v2 (/county-briefings/${short}/v2)`;
    else if (NEXT_BUILD.has(short)) dashboardStatus = "Next-build queue";

    let briefStatus = "Public OIS placeholder";
    if (KH_OVERLAY.has(short)) briefStatus = "NSI Kim Hammer overlay";
    if (short === "pope") briefStatus = "Pope v2 briefing + prototype";

    const goalSourceStatus = canonical?.canonicalRegistrationGoalStatus === "live"
      ? `Canonical DB: ${canonical.canonicalRegistrationGoal?.toLocaleString()}`
      : kpi?.planningVoteTargetProxy != null
        ? `Vote target proxy only (${kpi.planningVoteTargetProxy.toLocaleString()}) — reg goal unset`
        : "Unverified";

    const humanVerify = [
      deployment === "SHELL_ONLY" ? "Do not deploy field plan — shell county only" : "",
      canonical?.canonicalRegistrationGoal == null ? "Verify registration goal in admin before field ops" : "",
      row?.workbenchDepth === "shell" ? "Complete countyWorkbench profile intake" : "",
      !KH_OVERLAY.has(short) ? "No county-specific opposition overlay — use statewide only" : "",
    ].filter(Boolean);

    return {
      countySlug: reg.slug,
      countyName: reg.displayName,
      deploymentReadiness: deployment,
      dashboardStatus,
      briefStatus,
      dataQuality: row ? `${row.completionPercent}% · ${row.workbenchDepth}` : "unknown",
      goalSourceStatus,
      eventCalendarReadiness: "Read-only event cards wired",
      fieldPlanReadiness:
        FULL.has(short) ? "Partial — proxy PO5; relational counts not in adapter" : "Shell — no field memory",
      aiRecommendationReadiness:
        deployment === "SHELL_ONLY"
          ? "Low — generic rollup only"
          : KH_OVERLAY.has(short)
            ? "Medium — overlay with citation gaps"
            : "Low-Medium — workbench KPI only",
      biggestBlocker:
        deployment === "SHELL_ONLY"
          ? "Shell profile + empty institutional memory"
          : canonical?.canonicalRegistrationGoal == null
            ? "Canonical registration goal not set"
            : "Not validated for production field truth",
      humanVerifyBeforeDeploy: humanVerify,
    };
  });
}

export async function buildCountyReadinessClassificationsAsync(): Promise<CountyReadinessClassification[]> {
  const { loadCanonicalRegistrationGoalsBySlug } = await import(
    "@/lib/campaign-engine/county-registration-goal-read"
  );
  const map = await loadCanonicalRegistrationGoalsBySlug();
  return buildCountyReadinessClassifications(map);
}

export function summarizeCountyReadinessRollup(rows: CountyReadinessClassification[]) {
  const counts: Record<CountyDeploymentReadiness, number> = {
    DEPLOYMENT_READY: 0,
    INTERNAL_PLANNING_ONLY: 0,
    SHELL_ONLY: 0,
    BLOCKED: 0,
  };
  for (const r of rows) counts[r.deploymentReadiness]++;
  return counts;
}

/** Agent-safe county plan sentence — never claims readiness we do not have. */
export function countyAgentPlanSentence(row: CountyReadinessClassification): string {
  return `${row.countyName}: ${row.deploymentReadiness}. We know: ${row.dataQuality}, ${row.briefStatus}. We do not know: canonical goal (${row.goalSourceStatus}). Human must verify: ${row.humanVerifyBeforeDeploy[0] ?? "admin goal + local validators"} before field deployment.`;
}
