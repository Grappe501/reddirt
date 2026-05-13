/**
 * Build raw Arkansas county fair candidates (DB + local JSON + per-county query templates).
 * Does not write Prisma. Respectful defaults: no bulk HTTP; optional DB read only.
 *
 *   npm run fairs:arkansas:scrape
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ArkansasCountyFairRawRecord } from "../../src/lib/fairs/arkansas-county-fair-types";
import { prisma } from "../../src/lib/db";
import type { FestivalSourceChannel } from "@prisma/client";
import { loadRedDirtEnv } from "../load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..", "..");
const OUT_DIR = path.join(REPO, "data", "calendar-command-center");
const RAW = path.join(OUT_DIR, "arkansas-county-fairs-2026.raw.json");

loadRedDirtEnv(REPO);

function slug(s: string) {
  return createHash("sha256").update(s).digest("hex").slice(0, 20);
}

function mapChannel(ch: FestivalSourceChannel): ArkansasCountyFairRawRecord["sourceType"] {
  switch (ch) {
    case "FACEBOOK":
      return "facebook";
    case "PUBLIC_FORM":
    case "MANUAL":
      return "manual";
    case "RSS":
    case "WEB":
    case "GOOGLE":
    case "INSTAGRAM":
    case "OTHER":
    default:
      return "burt_database";
  }
}

function fairQueryTemplates(county: string): string[] {
  const c = county.trim();
  return [
    `https://www.google.com/search?q=${encodeURIComponent(`${c} County Fair Arkansas 2026`)}`,
    `https://www.google.com/search?q=${encodeURIComponent(`${c} County Fair Association Arkansas`)}`,
    `https://www.google.com/search?q=${encodeURIComponent(`${c} County Fairgrounds Arkansas`)}`,
    `https://www.google.com/search?q=${encodeURIComponent(`${c} 4-H fair Arkansas 2026`)}`,
    `https://www.google.com/search?q=${encodeURIComponent(`${c} Extension county fair Arkansas`)}`,
    `https://www.google.com/search?q=${encodeURIComponent(`${c} District Fair Arkansas`)}`,
  ];
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const countiesFile = path.join(OUT_DIR, "arkansas-counties-75.json");
  const counties = JSON.parse(readFileSync(countiesFile, "utf8")) as { counties: string[] };
  const list = counties.counties;

  const raw: ArkansasCountyFairRawRecord[] = [];
  const seen = new Set<string>();

  function push(r: ArkansasCountyFairRawRecord) {
    const k = `${r.county}|${r.fairName ?? ""}|${r.startAtIso ?? ""}|${r.sourceUrl ?? ""}`;
    const id = slug(k);
    if (seen.has(id)) return;
    seen.add(id);
    raw.push(r);
  }

  try {
    const festivals = await prisma.arkansasFestivalIngest.findMany({
      where: {
        OR: [
          { name: { contains: "fair", mode: "insensitive" } },
          { name: { contains: "4-H", mode: "insensitive" } },
          { name: { contains: "4H", mode: "insensitive" } },
          { name: { contains: "livestock", mode: "insensitive" } },
          { name: { contains: "rodeo", mode: "insensitive" } },
          { shortDescription: { contains: "fair", mode: "insensitive" } },
        ],
        startAt: { gte: new Date("2024-01-01"), lte: new Date("2027-12-31") },
      },
      include: { county: { select: { displayName: true } } },
      take: 800,
      orderBy: { startAt: "asc" },
    });

    for (const f of festivals) {
      const county = f.county?.displayName?.trim() || "";
      push({
        county: county || "Unknown",
        fairName: f.name,
        startAtIso: f.startAt.toISOString(),
        endAtIso: f.endAt.toISOString(),
        sourceUrl: f.sourceUrl,
        sourceType: mapChannel(f.sourceChannel),
        sourceLineage: ["ArkansasFestivalIngest", f.ingestRunId ? `ingestRun:${f.ingestRunId}` : "ingestRun:none"],
        ingestId: f.id,
        sourceChannel: f.sourceChannel,
        notes: f.shortDescription ?? undefined,
        latitude: f.latitude ?? undefined,
        longitude: f.longitude ?? undefined,
      });
    }
  } catch (e) {
    console.error("[fairs:scrape] prisma read failed (expected if DB unreachable):", e instanceof Error ? e.message : e);
  }

  const festivalLeadsPath = path.join(OUT_DIR, "festival-leads.verified.json");
  try {
    const leads = JSON.parse(readFileSync(festivalLeadsPath, "utf8")) as {
      county?: string;
      eventName?: string;
      date?: string;
      source?: string;
      reconcileStatus?: string;
    }[];
    for (const L of leads) {
      const nm = (L.eventName ?? "").toLowerCase();
      const hit =
        nm.includes("fair") ||
        nm.includes("4-h") ||
        nm.includes("4h") ||
        nm.includes("livestock") ||
        nm.includes("rodeo") ||
        nm.includes("carnival") ||
        nm.includes("demolition") ||
        nm.includes("pageant");
      if (!hit) continue;
      const county = (L.county ?? "").trim() || "Unknown";
      push({
        county,
        fairName: L.eventName,
        startAtIso: L.date ? new Date(`${L.date}T12:00:00`).toISOString() : undefined,
        sourceUrl: L.source,
        sourceType: L.source?.toLowerCase().includes("wikipedia") ? "tourism_calendar" : "newspaper",
        sourceLineage: ["festival-leads.verified.json", L.reconcileStatus ?? "unknown"],
        notes: `reconcileStatus=${L.reconcileStatus ?? ""}`,
      });
    }
  } catch {
    /* optional file */
  }

  for (const county of list) {
    const hasCounty = raw.some((r) => r.county === county && r.ingestId);
    if (hasCounty) continue;
    const hasLead = raw.some((r) => r.county === county && r.sourceLineage[0] === "festival-leads.verified.json");
    if (hasLead) continue;
    push({
      county,
      fairName: `${county} County Fair`,
      sourceType: "manual",
      sourceLineage: ["county_placeholder", "awaiting_official_2026_dates"],
      queryTemplates: fairQueryTemplates(county),
      notes: "No structured fair row yet — use query templates; verify robots.txt before automated fetch.",
    });
  }

  writeFileSync(RAW, JSON.stringify({ generatedAt: new Date().toISOString(), count: raw.length, rows: raw }, null, 2), "utf8");
  console.log(JSON.stringify({ ok: true, out: path.relative(REPO, RAW), rows: raw.length }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
