/**
 * First-pass routing: ISO weeks, Kelly overlaps, audit markdown.
 * Overwrites normalized JSON + CSV with isoWeekKey + kellyCalendarConflictIds.
 *
 *   npm run fairs:arkansas:plan
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ArkansasCountyFairRow } from "../../src/lib/fairs/arkansas-county-fair-types";
import type { CampaignCalendarItem } from "../../src/lib/calendar/campaign-calendar-item";
import { loadRedDirtEnv } from "../load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..", "..");
const OUT_DIR = path.join(REPO, "data", "calendar-command-center");
const DOCS = path.join(REPO, "docs", "calendar-command-center");
const NORM = path.join(OUT_DIR, "arkansas-county-fairs-2026.normalized.json");
const CSV = path.join(OUT_DIR, "arkansas-county-fairs-2026.csv");
const CAL = path.join(OUT_DIR, "calendar-items.normalized.json");
const COUNTIES = path.join(OUT_DIR, "arkansas-counties-75.json");
const AUDIT = path.join(DOCS, "ARKANSAS_COUNTY_FAIR_AUDIT.md");

loadRedDirtEnv(REPO);

function isoWeekKey(ymd?: string): string | undefined {
  if (!ymd) return undefined;
  const d = new Date(`${ymd}T12:00:00`);
  if (Number.isNaN(d.getTime())) return undefined;
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.getTime();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  const week1 = target.getTime();
  const w = 1 + Math.ceil((firstThursday - week1) / 604800000);
  return `${d.getFullYear()}-W${String(w).padStart(2, "0")}`;
}

function itemRange(it: CampaignCalendarItem): { start: string; end: string } {
  const s = it.start.slice(0, 10);
  const e = it.end ? it.end.slice(0, 10) : s;
  return { start: s, end: e };
}

function overlaps(a0: string, a1: string, b0: string, b1: string): boolean {
  const A0 = new Date(`${a0}T00:00:00`).getTime();
  const A1 = new Date(`${a1}T23:59:59`).getTime();
  const B0 = new Date(`${b0}T00:00:00`).getTime();
  const B1 = new Date(`${b1}T23:59:59`).getTime();
  return A0 <= B1 && B0 <= A1;
}

function loadKellyItems(): CampaignCalendarItem[] {
  try {
    return JSON.parse(readFileSync(CAL, "utf8")) as CampaignCalendarItem[];
  } catch {
    return [];
  }
}

function scoreMustAttend(r: ArkansasCountyFairRow): number {
  let s = 0;
  if (r.campaignValue === "must_attend") s += 100;
  if (r.campaignValue === "high_value") s += 60;
  if (r.campaignValue === "combine_with_nearby") s += 35;
  s += r.confidence * 20;
  if (r.verificationStatus === "verified_2026") s += 25;
  if (r.verificationStatus === "likely_2026") s += 12;
  return s;
}

function toCsv(rows: ArkansasCountyFairRow[]): string {
  const headers = [
    "id",
    "county",
    "fairName",
    "startDate",
    "endDate",
    "isoWeekKey",
    "verificationStatus",
    "confidence",
    "campaignValue",
    "recommendedCoverage",
    "routeCluster",
    "kellyCalendarConflictIds",
    "sourceUrl",
    "notes",
  ];
  const esc = (v: string | number | undefined) => {
    if (v === undefined || v === null) return "";
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        esc(r.id),
        esc(r.county),
        esc(r.fairName),
        esc(r.startDate),
        esc(r.endDate),
        esc(r.isoWeekKey),
        esc(r.verificationStatus),
        esc(r.confidence),
        esc(r.campaignValue),
        esc(r.recommendedCoverage),
        esc(r.routeCluster),
        esc(r.kellyCalendarConflictIds?.join(";")),
        esc(r.sourceUrl),
        esc(r.notes),
      ].join(","),
    );
  }
  return lines.join("\n");
}

function main() {
  mkdirSync(DOCS, { recursive: true });
  const doc = JSON.parse(readFileSync(NORM, "utf8")) as { rows: ArkansasCountyFairRow[] };
  const rows = doc.rows;
  const kelly = loadKellyItems();

  for (const r of rows) {
    r.isoWeekKey = isoWeekKey(r.startDate ?? r.bestCandidateDate);
    const cty = r.county.trim();
    const s0 = r.startDate ?? r.bestCandidateDate;
    const s1 = r.endDate ?? r.startDate ?? r.bestCandidateDate;
    const conflicts: string[] = [];
    if (s0 && s1) {
      for (const it of kelly) {
        const ic = (it.county ?? "").trim();
        if (!ic || ic.toLowerCase() !== cty.toLowerCase()) continue;
        const { start, end } = itemRange(it);
        if (overlaps(s0, s1, start, end)) conflicts.push(it.id);
      }
    }
    r.kellyCalendarConflictIds = conflicts.length ? conflicts : undefined;
  }

  const counties75 = JSON.parse(readFileSync(COUNTIES, "utf8")) as { counties: string[] };
  const covered = new Set(rows.map((r) => r.county.trim()));
  const missingFair = counties75.counties.filter((c) => !covered.has(c));

  const top25 = [...rows].sort((a, b) => scoreMustAttend(b) - scoreMustAttend(a)).slice(0, 25);
  const unverified = rows.filter((r) => r.verificationStatus === "date_not_posted" || r.verificationStatus === "needs_confirmation");
  const nextCalls = unverified
    .filter((r) => r.county && r.fairName)
    .slice(0, 40)
    .map(
      (r) =>
        `- **${r.county}** — ${r.fairName}: confirm 2026 dates (${r.sourceUrl ?? "use raw query templates"}).`,
    );

  const overlapLines = rows
    .filter((r) => (r.kellyCalendarConflictIds?.length ?? 0) > 0)
    .slice(0, 50)
    .map(
      (r) =>
        `- **${r.county}** ${r.startDate ?? "?"} — ${r.fairName} — Kelly ids: ${(r.kellyCalendarConflictIds ?? []).join(", ")}`,
    );

  const tableLines = rows
    .slice(0, 80)
    .map(
      (r) =>
        `| ${r.county} | ${r.fairName.replace(/\|/g, "/")} | ${r.startDate ?? "—"} | ${r.verificationStatus} | ${r.confidence.toFixed(2)} | ${r.campaignValue} | ${(r.routeCluster ?? "").split("/")[0]?.trim() ?? "—"} | ${r.kellyCalendarConflictIds?.length ?? 0} |`,
    );

  const mdParts = [
    "# Arkansas county fair audit (2026) — first pass",
    "",
    `Generated: **${new Date().toISOString()}** — data files under \`data/calendar-command-center/\`. **No Prisma writes.**`,
    "",
    "## Summary",
    "",
    "| Metric | Count |",
    "|--------|------:|",
    `| Normalized fair rows | ${rows.length} |`,
    `| 75-county list with ≥1 row | ${counties75.counties.length - missingFair.length} |`,
    `| Unverified / needs date | ${unverified.length} |`,
    `| Kelly calendar overlap rows | ${rows.filter((r) => (r.kellyCalendarConflictIds?.length ?? 0) > 0).length} |`,
    "",
    "## Top 25 (heuristic score)",
    "",
    ...top25.map((r, i) => `${i + 1}. **${r.county}** — ${r.fairName} — ${r.campaignValue} / ${r.verificationStatus} / ${r.routeCluster ?? "—"}`),
    "",
    "## Missing county rows",
    "",
    missingFair.length ? missingFair.map((c) => `- ${c}`).join("\n") : "_None._",
    "",
    "## Kelly conflicts",
    "",
    overlapLines.length ? overlapLines.join("\n") : "_No overlaps._",
    "",
    "## Next calls (sample)",
    "",
    ...nextCalls,
    "",
    "## Table excerpt",
    "",
    "| County | Fair | Start | Verification | Conf | Campaign | Cluster | Conflicts |",
    "|--------|------|-------|--------------|------|----------|---------|-----------|",
    ...tableLines,
    "",
    "_See JSON/CSV for full rows._",
  ];

  writeFileSync(AUDIT, mdParts.join("\n"), "utf8");
  writeFileSync(NORM, JSON.stringify({ generatedAt: new Date().toISOString(), count: rows.length, rows }, null, 2), "utf8");
  writeFileSync(CSV, toCsv(rows), "utf8");

  console.log(
    JSON.stringify(
      {
        ok: true,
        audit: path.relative(REPO, AUDIT),
        kellyOverlapRows: rows.filter((r) => (r.kellyCalendarConflictIds?.length ?? 0) > 0).length,
        missingCountyRows: missingFair.length,
      },
      null,
      2,
    ),
  );
}

main();
