import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Prisma } from "@prisma/client";

import { prisma } from "../../src/lib/db";
import { loadRedDirtEnv } from "../load-red-dirt-env";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/agent/agent-missing-data-report-latest.json");
const DOC = path.join(ROOT, "docs/agent/AGENT_MISSING_DATA_REPORT.md");

loadRedDirtEnv(ROOT);

type Missing = {
  area: "county" | "calendar" | "google" | "volunteer" | "materials" | "media" | "win_target" | "coverage" | "field_ops";
  severity: "low" | "medium" | "high";
  item: string;
  recommendedFix: string;
};

function readJson<T>(rel: string): T | null {
  const file = path.join(ROOT, rel);
  if (!existsSync(file)) return null;
  try { return JSON.parse(readFileSync(file, "utf8")) as T; } catch { return null; }
}

function add(list: Missing[], area: Missing["area"], severity: Missing["severity"], item: string, recommendedFix: string) {
  list.push({ area, severity, item, recommendedFix });
}

async function main() {
  const generatedAt = new Date().toISOString();
  const missing: Missing[] = [];
  const win = readJson<{ counties?: unknown[] }>("data/election/kelly-win-target-scenario-v1.json");
  const gotv = readJson<{ counties?: Array<Record<string, unknown>> }>("data/field-ops/gotv-commitment-allocation-v1.json");
  const capacity = readJson<{ counties?: Array<Record<string, unknown>> }>("data/field-ops/volunteer-capacity-model-v1.json");
  const coverage = readJson<{ plans?: Array<Record<string, unknown>>; stats?: Record<string, number> }>("data/calendar-command-center/event-coverage-plans.staged.json");
  const staffing = readJson<{ plans?: Array<Record<string, unknown>>; stats?: Record<string, number> }>("data/calendar-command-center/event-staffing-plans.staged.json");
  const materials = readJson<{ items?: Record<string, { onHandKnown?: boolean; onHand?: number | null }> }>("data/calendar-command-center/campaign-materials-inventory.json");

  if (!win?.counties?.length) add(missing, "win_target", "high", "Win target scenario missing or empty", "Run npm run election:targets:build and import official SOS-grade data.");
  if (!gotv?.counties?.length) add(missing, "field_ops", "high", "GOTV allocation missing or empty", "Run npm run fieldops:gotv-allocation:build.");
  if (!capacity?.counties?.length) add(missing, "volunteer", "high", "Volunteer capacity model missing or empty", "Run npm run fieldops:volunteer-capacity:build.");
  for (const [key, item] of Object.entries(materials?.items ?? {})) {
    if (!item.onHandKnown) add(missing, "materials", key === "branded_mints" ? "high" : "medium", `Unknown on-hand inventory: ${key}`, "Count inventory and update campaign-materials-inventory.json.");
  }
  if ((coverage?.stats?.needsVolunteerLead ?? 0) > 0) add(missing, "coverage", "high", `${coverage?.stats?.needsVolunteerLead} events missing volunteer lead`, "Assign volunteer leads or create approved callout queue.");
  if ((coverage?.stats?.needsTablePermission ?? 0) > 0) add(missing, "coverage", "high", `${coverage?.stats?.needsTablePermission} events missing table permission`, "Staff table-permission calls and update coverage plan status.");
  if ((staffing?.stats?.needsCallout ?? 0) > 0) add(missing, "volunteer", "high", `${staffing?.stats?.needsCallout} events need callout`, "Review and approve staged volunteer callout drafts.");
  if (!existsSync(path.join(ROOT, "data/media"))) add(missing, "media", "medium", "Media metadata folder missing", "Create media/event metadata index before using media retrieval in public-facing copy.");
  if (!existsSync(path.join(ROOT, "data/calendar-command-center/campus-football-ehc-aea-context.json"))) {
    add(missing, "calendar", "medium", "Campus/football/EHC/AEA context missing", "Add source data for campus, football, EHC, and AEA event rules.");
  }

  try {
    const [row] = await prisma.$queryRaw<Array<{ withoutCounty: number; missingLocation: number }>>(Prisma.sql`
      SELECT
        (count(*) - count("countyId"))::int AS "withoutCounty",
        count(*) FILTER (WHERE "locationName" IS NULL OR trim("locationName") = '')::int AS "missingLocation"
      FROM public."CampaignEvent"
    `);
    if ((row?.withoutCounty ?? 0) > 0) add(missing, "calendar", "high", `${row!.withoutCounty} CampaignEvents missing county link`, "Run county relink review queue; do not auto-link ambiguous rows.");
    if ((row?.missingLocation ?? 0) > 0) add(missing, "calendar", "medium", `${row!.missingLocation} CampaignEvents missing location`, "Add location enrichment/review pass.");
  } catch {
    add(missing, "calendar", "medium", "CampaignEvent DB missing/unavailable", "Check DATABASE_URL and calendar DB health.");
  }

  if (!process.env.KELLY_GOOGLE_ANCHOR_CALENDAR_SOURCE_ID) {
    add(missing, "google", "high", "Google OAuth anchor source missing", "Create/select CalendarSource with refresh token, then run Google lane smoke test.");
  }

  const report = {
    generatedAt,
    total: missing.length,
    high: missing.filter((m) => m.severity === "high").length,
    medium: missing.filter((m) => m.severity === "medium").length,
    low: missing.filter((m) => m.severity === "low").length,
    missingData: missing,
  };
  await mkdir(path.dirname(OUT), { recursive: true });
  await mkdir(path.dirname(DOC), { recursive: true });
  await writeFile(OUT, JSON.stringify(report, null, 2), "utf8");
  await writeFile(DOC, toMarkdown(report), "utf8");
  console.log(JSON.stringify(report, null, 2));
  await prisma.$disconnect();
}

function toMarkdown(report: { generatedAt: string; missingData: Missing[] }): string {
  return [
    "# Agent Missing Data Report",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    ...report.missingData.map((m, i) => `${i + 1}. **${m.severity.toUpperCase()} / ${m.area}**: ${m.item}\n   Fix: ${m.recommendedFix}`),
    "",
  ].join("\n");
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
