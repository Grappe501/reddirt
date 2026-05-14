import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { isOpenAIConfigured } from "@/lib/openai/client";
import { travelCalendarDataPresent } from "@/lib/calendar/load-travel-calendar-data";
import { communityOpportunitiesDataPresent, loadWeekendRoutePlansFile } from "@/lib/opportunities/load-community-opportunities-data";
import { loadKellyWinTargetScenarioFile } from "@/lib/election-targets/load-win-target-scenario";
import { loadVolunteerCapacityModelFile } from "@/lib/field-ops/load-volunteer-capacity-model";
import { loadGotvCommitmentAllocationFile } from "@/lib/field-ops/load-gotv-commitment-allocation";
import { buildScheduleReadinessReport, type ScheduleReadinessReport } from "@/lib/kelly-agent/tools/schedule-readiness-tool";

export type CandidateDashboardPreflight = {
  overallStatus: "green" | "yellow" | "red";
  canSendToKellyTonight: boolean;
  recommendedUseMode: "local_staff_only" | "kelly_preview_only" | "kelly_can_use_for_decisions" | "blocked";
  blockers: string[];
  warnings: string[];
  readyFeatures: string[];
  stagedFeatures: string[];
  nextActions: string[];
};

export type CandidateDashboardPreflightFile = CandidateDashboardPreflight & {
  generatedAt: string;
  scheduleReadiness: ScheduleReadinessReport;
};

function existsRel(repoRoot: string, rel: string): boolean {
  return existsSync(path.join(repoRoot, rel));
}

function readJson<T>(repoRoot: string, rel: string): T | null {
  const p = path.join(repoRoot, rel);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as T;
  } catch {
    return null;
  }
}

function hasCapability(repoRoot: string, id: string): boolean {
  const rows = readJson<Array<{ id?: string }>>(repoRoot, "data/agent/kelly-agent-capabilities.json") ?? [];
  return rows.some((r) => r.id === id);
}

export async function runCandidateDashboardPreflight(opts: { repoRoot?: string; weekMondayYmd?: string } = {}): Promise<CandidateDashboardPreflightFile> {
  const repoRoot = opts.repoRoot ?? process.cwd();
  const blockers: string[] = [];
  const warnings: string[] = [];
  const readyFeatures: string[] = [];
  const stagedFeatures: string[] = [];
  const nextActions: string[] = [];

  const routes = [
    ["Kelly cockpit", "src/app/admin/(board)/calendar-command-center/kelly/page.tsx"],
    ["Week View", "src/app/admin/(board)/calendar-command-center/week/page.tsx"],
    ["GOTV page", "src/app/admin/(board)/calendar-command-center/gotv/page.tsx"],
    ["Field Ops page", "src/app/admin/(board)/calendar-command-center/field-ops/page.tsx"],
    ["Build Status page", "src/app/admin/(board)/calendar-command-center/build-status/page.tsx"],
    ["Commit card", "src/app/commit/page.tsx"],
  ] as const;

  for (const [label, rel] of routes) {
    if (existsRel(repoRoot, rel)) readyFeatures.push(`${label} route exists`);
    else blockers.push(`${label} route missing`);
  }

  if (travelCalendarDataPresent()) readyFeatures.push("Calendar items JSON present");
  else blockers.push("Calendar items JSON missing");

  const plans = loadWeekendRoutePlansFile();
  if (plans?.plans?.length) readyFeatures.push(`Weekend route plans present (${plans.plans.length})`);
  else warnings.push("Weekend route plans missing or empty");

  if (loadKellyWinTargetScenarioFile(repoRoot)) stagedFeatures.push("Win target scenario file-staged");
  else warnings.push("Win target scenario missing");

  if (loadGotvCommitmentAllocationFile(repoRoot)) stagedFeatures.push("GOTV allocation file-staged");
  else warnings.push("GOTV allocation missing");

  if (loadVolunteerCapacityModelFile(repoRoot)) stagedFeatures.push("Volunteer capacity / field ops model file-staged");
  else warnings.push("Volunteer capacity model missing");

  if (existsRel(repoRoot, "data/agent/kelly-agent-capabilities.json")) readyFeatures.push("Agent capabilities ledger present");
  else blockers.push("Agent capabilities ledger missing");

  if (existsRel(repoRoot, "data/field-ops/automation-recommendations.staged.json")) stagedFeatures.push("Automation recommendation queue staged");
  else warnings.push("Automation recommendation queue missing");

  if (communityOpportunitiesDataPresent()) readyFeatures.push("Community opportunities file present");
  else warnings.push("Community opportunities file missing");

  if (isOpenAIConfigured()) readyFeatures.push("OPENAI_API_KEY configured");
  else warnings.push("OPENAI_API_KEY not configured; deterministic fallbacks must be used");
  readyFeatures.push("Schedule settlement deterministic fallback available");
  if (existsRel(repoRoot, "src/app/api/admin/kelly-agent/schedule-settlement/route.ts")) readyFeatures.push("Schedule settlement endpoint exists");
  else blockers.push("Schedule settlement endpoint missing");

  const toolChecks = [
    ["win_targets", "src/lib/kelly-agent/tools/win-target-tool.ts"],
    ["volunteer_capacity", "src/lib/kelly-agent/tools/volunteer-capacity-tool.ts"],
    ["event_success_playbook", "src/lib/kelly-agent/tools/event-success-playbook-tool.ts"],
    ["schedule_readiness", "src/lib/kelly-agent/tools/schedule-readiness-tool.ts"],
    ["candidate_dashboard_preflight", "src/lib/kelly-agent/tools/candidate-dashboard-preflight-tool.ts"],
  ] as const;
  for (const [label, rel] of toolChecks) {
    if (existsRel(repoRoot, rel)) readyFeatures.push(`Kelly agent tool wired: ${label}`);
    else blockers.push(`Kelly agent tool missing: ${label}`);
  }
  if (loadGotvCommitmentAllocationFile(repoRoot)) readyFeatures.push("Kelly agent source available: GOTV allocation");

  const migrationDocPath = path.join(repoRoot, "docs/calendar-command-center/V2_CLOSEOUT.md");
  if (existsSync(migrationDocPath)) {
    const migrationDoc = readFileSync(migrationDocPath, "utf8");
    if (migrationDoc.includes("20260518210000_kelly_calendar_cockpit")) {
      warnings.push("DB-backed cockpit features still marked blocked by migration repair doc");
    }
  } else {
    warnings.push("V2 closeout migration doc missing");
  }
  stagedFeatures.push("Schedule settlement decisions write to staged JSON");
  stagedFeatures.push("Automation recommendations are staged; no SendGrid/Twilio connection");
  readyFeatures.push("No SMS/email send path added by this slice");
  readyFeatures.push("No Google Calendar write path added by this slice");

  const scheduleReadiness = await buildScheduleReadinessReport(opts.weekMondayYmd);
  if (scheduleReadiness.missingCriticalData.length) {
    blockers.push(...scheduleReadiness.missingCriticalData.map((x) => `Schedule readiness missing: ${x}`));
  }
  if (scheduleReadiness.highRiskItems.length) warnings.push(...scheduleReadiness.highRiskItems.slice(0, 5));

  if (!hasCapability(repoRoot, "candidate_dashboard_preflight_v1")) warnings.push("Capability ledger missing candidate_dashboard_preflight_v1");

  if (blockers.length) {
    nextActions.push("Resolve blockers before sending the dashboard to Kelly.");
  }
  if (warnings.length) {
    nextActions.push("Use as Kelly preview only; staff should narrate staged/blocked items.");
  }
  nextActions.push("Run npm run agent:preflight immediately before sharing the dashboard.");
  nextActions.push("Do not send SMS/email or write Google Calendar from this slice.");

  let overallStatus: CandidateDashboardPreflight["overallStatus"] = "green";
  if (blockers.length) overallStatus = "red";
  else if (warnings.length || stagedFeatures.length) overallStatus = "yellow";

  const recommendedUseMode: CandidateDashboardPreflight["recommendedUseMode"] =
    overallStatus === "red"
      ? "blocked"
      : overallStatus === "green"
        ? "kelly_can_use_for_decisions"
        : "kelly_preview_only";

  return {
    generatedAt: new Date().toISOString(),
    overallStatus,
    canSendToKellyTonight: overallStatus !== "red",
    recommendedUseMode,
    blockers: [...new Set(blockers)],
    warnings: [...new Set(warnings)],
    readyFeatures: [...new Set(readyFeatures)],
    stagedFeatures: [...new Set(stagedFeatures)],
    nextActions: [...new Set(nextActions)],
    scheduleReadiness,
  };
}
