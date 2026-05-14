import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/agent/kelly-agent-tool-suite-latest.json");
const DOC = path.join(ROOT, "docs/agent/KELLY_AGENT_TOOL_SUITE_REPORT.md");

type Status = "green" | "yellow" | "red";

const STEPS = [
  "agent:capabilities:validate",
  "agent:knowledge-index",
  "agent:readiness",
  "election:targets:build",
  "fieldops:volunteer-capacity:build",
  "fieldops:gotv-allocation:build",
  "calendar:coverage:build",
  "calendar:county-link-audit",
  "calendar:staffing:build",
  "calendar:callouts:build",
  "calendar:reminders:build",
  "agent:tools:audit",
  "agent:calendar-intel",
  "agent:ops-intel",
  "agent:missing-data",
  "typecheck",
] as const;

const CRITICAL = new Set(["agent:capabilities:validate", "agent:readiness", "typecheck"]);

function packageScripts(): Record<string, string> {
  return JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8")).scripts ?? {};
}

function readJson<T>(rel: string): T | null {
  const file = path.join(ROOT, rel);
  if (!existsSync(file)) return null;
  try { return JSON.parse(readFileSync(file, "utf8")) as T; } catch { return null; }
}

function run(script: string): Promise<{ script: string; status: "ok" | "missing_script" | "failed"; startedAt: string; finishedAt: string; error?: string }> {
  const startedAt = new Date().toISOString();
  const scripts = packageScripts();
  if (!scripts[script]) {
    return Promise.resolve({ script, status: "missing_script", startedAt, finishedAt: new Date().toISOString(), error: "script not defined in package.json" });
  }
  return new Promise((resolve) => {
    const child = spawn("npm", ["run", script], { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" });
    child.on("error", (err) => resolve({ script, status: "failed", startedAt, finishedAt: new Date().toISOString(), error: err.message }));
    child.on("exit", (code) => resolve({
      script,
      status: code === 0 ? "ok" : "failed",
      startedAt,
      finishedAt: new Date().toISOString(),
      error: code === 0 ? undefined : `exit code ${code ?? "unknown"}`,
    }));
  });
}

async function git(args: string[]): Promise<string | undefined> {
  return new Promise((resolve) => {
    const child = spawn("git", args, { cwd: ROOT, shell: process.platform === "win32" });
    let out = "";
    child.stdout?.on("data", (d) => { out += String(d); });
    child.on("exit", (code) => resolve(code === 0 ? out.trim() : undefined));
    child.on("error", () => resolve(undefined));
  });
}

async function main() {
  const toolHealth = [];
  let criticalFailed = false;
  for (const script of STEPS) {
    const result = await run(script);
    toolHealth.push({
      toolName: script,
      exists: result.status !== "missing_script",
      status: result.status === "ok" ? "ok" : result.status === "missing_script" ? "missing" : CRITICAL.has(script) ? "failed" : "warning",
      lastRun: result.finishedAt,
      error: result.error,
    });
    if (CRITICAL.has(script) && result.status !== "ok") criticalFailed = true;
  }

  const generatedAt = new Date().toISOString();
  const branch = await git(["rev-parse", "--abbrev-ref", "HEAD"]);
  const commit = await git(["rev-parse", "--short", "HEAD"]);
  const preflight = readJson<{ overallStatus: Status; recommendedUseMode?: string; blockers?: string[]; warnings?: string[] }>("data/agent/candidate-dashboard-preflight-latest.json");
  const capsRaw = readJson<Array<Record<string, unknown>>>("data/agent/kelly-agent-capabilities.json") ?? [];
  const validation = readJson<{ warnings?: string[]; errors?: string[] }>("data/agent/kelly-agent-capabilities-validation.json");
  const calendar = readJson<Record<string, any>>("data/agent/calendar-intelligence-report-latest.json");
  const ops = readJson<Record<string, any>>("data/agent/operations-intelligence-report-latest.json");
  const missing = readJson<{ missingData?: Array<Record<string, string>> }>("data/agent/agent-missing-data-report-latest.json");

  const capabilities = capsRaw.map((cap) => ({
    id: String(cap.id),
    name: String(cap.name),
    category: String(cap.category),
    status: (cap.status ?? "missing") as string,
    humanOverrideRequired: Boolean(cap.humanOverrideRequired),
    inputSources: Array.isArray(cap.inputSources) ? cap.inputSources : [],
    outputUsedBy: Array.isArray(cap.outputUsedBy) ? cap.outputUsedBy : [],
    health: validation?.errors?.some((e) => e.includes(String(cap.id))) ? "red" : validation?.warnings?.some((w) => w.includes(String(cap.id))) ? "yellow" : "green",
    notes: String(cap.description ?? ""),
  }));

  const statusCounts = Object.fromEntries(["live", "db_backed", "file_staged", "blocked", "missing"].map((s) => [s, capabilities.filter((c) => c.status === s).length]));
  const highMissing = (missing?.missingData ?? []).filter((m) => m.severity === "high");
  const blockers = [
    ...(preflight?.blockers ?? []),
    ...(calendar?.googleSyncBlockers ?? []),
    ...highMissing.slice(0, 3).map((m) => String(m.item)),
  ];
  const overallStatus: Status = criticalFailed ? "red" : blockers.length || preflight?.overallStatus === "yellow" ? "yellow" : "green";
  const nextRecommendedBuilds = buildRecommendations(calendar, missing);

  const report = {
    generatedAt,
    branch,
    commit,
    overallStatus,
    dashboardReadiness: {
      status: preflight?.overallStatus ?? "yellow",
      canKellyUseTonight: preflight?.recommendedUseMode !== "do_not_use",
      canUseForRealDecisions: preflight?.recommendedUseMode === "kelly_can_use_for_decisions",
      blockers: preflight?.blockers ?? [],
      warnings: preflight?.warnings ?? [],
    },
    capabilities,
    toolHealth,
    calendarIntelligence: {
      campaignEventsTotal: calendar?.campaignEvents?.total,
      campaignEventsWithCounty: calendar?.campaignEvents?.withCounty,
      campaignEventsWithoutCounty: calendar?.campaignEvents?.withoutCounty,
      coveragePlansTotal: calendar?.coverage?.total,
      eventsNeedingLocalCoverage: calendar?.coverage?.needingLocalCoverage,
      eventsNeedingVolunteerLead: calendar?.coverage?.needingVolunteerLead,
      eventsNeedingTablePermission: calendar?.coverage?.needingTablePermission,
      scheduleConflicts: calendar?.scheduleConflicts,
      googleSyncReady: Boolean(calendar?.googleSyncReady),
      googleSyncBlockers: calendar?.googleSyncBlockers ?? [],
    },
    operationsIntelligence: ops ?? {},
    missingData: missing?.missingData ?? [],
    nextRecommendedBuilds,
  };

  await mkdir(path.dirname(OUT), { recursive: true });
  await mkdir(path.dirname(DOC), { recursive: true });
  await writeFile(OUT, JSON.stringify(report, null, 2), "utf8");
  await writeFile(DOC, toMarkdown(report), "utf8");
  printSummary(report, statusCounts);
  if (criticalFailed) process.exit(1);
}

function buildRecommendations(calendar: Record<string, any> | null, missing: { missingData?: Array<Record<string, string>> } | null) {
  const out = [
    { priority: 1, title: "Google lane smoke test", reason: "Google sync readiness is blocked until an OAuth anchor and lane sources are verified.", expectedImpact: "Moves calendar from preview-only toward live DB-to-Google operations.", filesToTouch: ["scripts/google-calendar/*", "data/agent/calendar-intelligence-report-latest.json"] },
    { priority: 2, title: "County relink review queue", reason: `${calendar?.campaignEvents?.withoutCounty ?? 0} CampaignEvents still lack county links.`, expectedImpact: "Improves routing, coverage assignments, county vault memory, and field operations planning.", filesToTouch: ["scripts/calendar/audit-campaign-event-county-links.ts", "data/calendar-command-center/county-link-review.staged.json"] },
    { priority: 3, title: "Staff approval workflow for callouts/reminders", reason: "Callouts and reminders are staged but not reviewable with approval status changes.", expectedImpact: "Lets staff safely move from drafts to approved sends later without autonomous outreach.", filesToTouch: ["src/app/admin/(board)/calendar-command-center/event/[id]/page.tsx", "src/lib/calendar/event-volunteer-callout-types.ts"] },
    { priority: 4, title: "Materials inventory allocation check", reason: "Tablecloth and banner uses exceed known physical inventory unless reused across dates.", expectedImpact: "Prevents overpromising event kits and clarifies pack logistics.", filesToTouch: ["data/calendar-command-center/campaign-materials-inventory.json", "scripts/calendar/build-event-staffing-plans.ts"] },
    { priority: 5, title: "Media/event folder readiness", reason: "Agent media and county memory lanes need file/folder completeness checks.", expectedImpact: "Makes post-event photo/note capture retrievable for county memory.", filesToTouch: ["scripts/agent/report-agent-missing-data.ts", "data/media/"] },
  ];
  if (missing?.missingData?.length) return out;
  return out.slice(0, 3);
}

function toMarkdown(report: any): string {
  return [
    "# Kelly Agent Tool Suite Report",
    "",
    `Generated: ${report.generatedAt}`,
    `Overall: **${String(report.overallStatus).toUpperCase()}**`,
    "",
    "## Top Blockers",
    ...(report.dashboardReadiness.blockers.length ? report.dashboardReadiness.blockers : report.calendarIntelligence.googleSyncBlockers).slice(0, 8).map((b: string) => `- ${b}`),
    "",
    "## Top Missing Data",
    ...report.missingData.slice(0, 10).map((m: any) => `- **${m.severity} / ${m.area}**: ${m.item}`),
    "",
    "## Next Recommended Builds",
    ...report.nextRecommendedBuilds.map((b: any) => `${b.priority}. ${b.title}: ${b.expectedImpact}`),
    "",
  ].join("\n");
}

function printSummary(report: any, counts: Record<string, number>) {
  console.log("\nKelly Agent Tool Suite Complete\n");
  console.log(`Overall: ${String(report.overallStatus).toUpperCase()}`);
  console.log(`Capabilities: ${report.capabilities.length} total`);
  console.log(`Live: ${counts.live ?? 0}`);
  console.log(`DB-backed: ${counts.db_backed ?? 0}`);
  console.log(`File-staged: ${counts.file_staged ?? 0}`);
  console.log(`Blocked: ${counts.blocked ?? 0}`);
  console.log("\nTop blockers:");
  const blockers = [...report.dashboardReadiness.blockers, ...report.calendarIntelligence.googleSyncBlockers, ...report.missingData.filter((m: any) => m.severity === "high").map((m: any) => m.item)].slice(0, 3);
  blockers.forEach((b, i) => console.log(`${i + 1}. ${b}`));
  console.log("\nNext recommended builds:");
  report.nextRecommendedBuilds.slice(0, 3).forEach((b: any) => console.log(`${b.priority}. ${b.title}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
