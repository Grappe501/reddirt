/**
 * Normalize raw fair scrape into typed rows + CSV (no Prisma writes).
 *
 *   npm run fairs:arkansas:normalize
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ArkansasCountyFairRow, ArkansasCountyFairRawRecord } from "../../src/lib/fairs/arkansas-county-fair-types";
import { assignRouteClusterForCounty } from "../../src/lib/fairs/arkansas-fair-route-clusters";
import { loadRedDirtEnv } from "../load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..", "..");
const OUT_DIR = path.join(REPO, "data", "calendar-command-center");
const RAW = path.join(OUT_DIR, "arkansas-county-fairs-2026.raw.json");
const NORM = path.join(OUT_DIR, "arkansas-county-fairs-2026.normalized.json");
const CSV = path.join(OUT_DIR, "arkansas-county-fairs-2026.csv");

loadRedDirtEnv(REPO);

function slug(s: string) {
  return createHash("sha256").update(s).digest("hex").slice(0, 24);
}

function yearFromIso(iso?: string): number | null {
  if (!iso) return null;
  const y = new Date(iso).getFullYear();
  return Number.isFinite(y) ? y : null;
}

function deriveVerification(r: ArkansasCountyFairRawRecord): ArkansasCountyFairRow["verificationStatus"] {
  if (r.sourceLineage.includes("awaiting_official_2026_dates")) return "date_not_posted";
  const n = (r.notes ?? "").toLowerCase();
  if (n.includes("reconcilestatus=not_campaign_relevant")) return "not_county_fair";
  if (n.includes("reconcilestatus=duplicate")) return "duplicate";
  if (n.includes("reconcilestatus=needs_confirmation")) return "needs_confirmation";
  const y = yearFromIso(r.startAtIso);
  if (y === 2026) return "verified_2026";
  if (y === 2025) return "date_not_posted";
  if (y === 2027) return "likely_2026";
  if (r.sourceType === "facebook") return "likely_2026";
  if (r.startAtIso) return "needs_confirmation";
  return "date_not_posted";
}

function confidenceFrom(r: ArkansasCountyFairRawRecord, v: ArkansasCountyFairRow["verificationStatus"]): number {
  if (r.ingestId) return v === "verified_2026" ? 0.92 : 0.78;
  if (r.sourceLineage[0] === "festival-leads.verified.json") return 0.55;
  if (v === "date_not_posted") return 0.25;
  return 0.5;
}

type Snap = {
  county: string;
  underTouched?: boolean;
  fewOpportunities?: boolean;
  tier?: string;
  strategicClass?: string;
};

function loadSnapshot(): Map<string, Snap> {
  const p = path.join(OUT_DIR, "county-priority-snapshot.json");
  try {
    const rows = JSON.parse(readFileSync(p, "utf8")) as Snap[];
    const m = new Map<string, Snap>();
    for (const s of rows) m.set(s.county.trim(), s);
    return m;
  } catch {
    return new Map();
  }
}

const CENTRAL_HEAVY = new Set(["Pulaski", "Saline", "Faulkner"]);

function deriveCampaignAndCoverage(
  county: string,
  snap: Map<string, Snap>,
  v: ArkansasCountyFairRow["verificationStatus"],
): Pick<ArkansasCountyFairRow, "campaignValue" | "recommendedCoverage"> {
  const s = snap.get(county.trim());
  const under = Boolean(s?.underTouched);
  const few = Boolean(s?.fewOpportunities);
  const tier1 = (s?.tier ?? "").toLowerCase().includes("tier 1");

  if (v === "not_county_fair" || v === "duplicate") {
    return { campaignValue: "monitor", recommendedCoverage: "staff_only" };
  }
  if (CENTRAL_HEAVY.has(county) && !under) {
    return { campaignValue: "send_local", recommendedCoverage: "local_surrogate" };
  }
  if (under && few && tier1 && v === "verified_2026") {
    return { campaignValue: "must_attend", recommendedCoverage: "kelly_plus_local_host" };
  }
  if (under && (tier1 || few)) {
    return { campaignValue: "high_value", recommendedCoverage: "kelly" };
  }
  if (under) {
    return { campaignValue: "combine_with_nearby", recommendedCoverage: "kelly" };
  }
  return { campaignValue: "monitor", recommendedCoverage: "staff_only" };
}

function bestCandidateWindow(): string {
  return "Prefer: opening night · parade · livestock auction · senior night · family night · pageant · rodeo/demo derby · Saturday PM — confirm on official schedule.";
}

function toCsv(rows: ArkansasCountyFairRow[]): string {
  const headers = [
    "id",
    "county",
    "fairName",
    "startDate",
    "endDate",
    "bestCandidateDate",
    "verificationStatus",
    "confidence",
    "campaignValue",
    "recommendedCoverage",
    "routeCluster",
    "sourceUrl",
    "sourceType",
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
        esc(r.bestCandidateDate),
        esc(r.verificationStatus),
        esc(r.confidence),
        esc(r.campaignValue),
        esc(r.recommendedCoverage),
        esc(r.routeCluster),
        esc(r.sourceUrl),
        esc(r.sourceType),
        esc(r.notes),
      ].join(","),
    );
  }
  return lines.join("\n");
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const rawDoc = JSON.parse(readFileSync(RAW, "utf8")) as { rows: ArkansasCountyFairRawRecord[] };
  const snap = loadSnapshot();

  const out: ArkansasCountyFairRow[] = [];
  const dedupe = new Set<string>();

  for (const r of rawDoc.rows) {
    if (r.county === "_meta") continue;
    const fairName = (r.fairName ?? `${r.county} County Fair`).trim();
    const id = `fair-${slug(`${r.county}|${fairName}|${r.startAtIso ?? "na"}`)}`;
    const dk = `${r.county}|${fairName.toLowerCase()}|${(r.startAtIso ?? "").slice(0, 10)}`;
    if (dedupe.has(dk)) continue;
    dedupe.add(dk);

    const v = deriveVerification(r);
    const { campaignValue, recommendedCoverage } = deriveCampaignAndCoverage(r.county, snap, v);
    const startDate = r.startAtIso ? r.startAtIso.slice(0, 10) : undefined;
    const endDate = r.endAtIso ? r.endAtIso.slice(0, 10) : undefined;

    let distance: number | undefined;
    if (typeof r.latitude === "number" && typeof r.longitude === "number") {
      const roseLat = 35.316;
      const roseLon = -92.252;
      const R = 3958.8;
      const dLat = ((r.latitude - roseLat) * Math.PI) / 180;
      const dLon = ((r.longitude - roseLon) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((roseLat * Math.PI) / 180) * Math.cos((r.latitude * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
      distance = Math.round(2 * R * Math.asin(Math.min(1, Math.sqrt(a))) * 10) / 10;
    }

    out.push({
      id,
      county: r.county.trim(),
      fairName,
      city: undefined,
      venue: undefined,
      address: undefined,
      startDate,
      endDate,
      bestCandidateDate: startDate,
      bestCandidateTimeWindow: bestCandidateWindow(),
      sourceUrl: r.sourceUrl,
      sourceType: r.sourceType,
      verificationStatus: v,
      confidence: confidenceFrom(r, v),
      campaignValue,
      recommendedCoverage,
      routeCluster: assignRouteClusterForCounty(r.county),
      distanceFromRoseBudMiles: distance,
      notes: [r.notes, r.queryTemplates?.length ? `queries:${r.queryTemplates.length}` : ""].filter(Boolean).join(" | "),
    });
  }

  out.sort((a, b) => a.county.localeCompare(b.county) || a.fairName.localeCompare(b.fairName));

  writeFileSync(NORM, JSON.stringify({ generatedAt: new Date().toISOString(), count: out.length, rows: out }, null, 2), "utf8");
  writeFileSync(CSV, toCsv(out), "utf8");
  console.log(JSON.stringify({ ok: true, normalized: path.relative(REPO, NORM), csv: path.relative(REPO, CSV), rows: out.length }, null, 2));
}

try {
  main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
