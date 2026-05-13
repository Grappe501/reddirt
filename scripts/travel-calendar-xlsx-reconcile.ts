/**
 * Parse Kelly travel workbook, reconcile with Prisma (when DATABASE_URL is available),
 * and emit normalized JSON for the Campaign Calendar Command Center.
 *
 *   npx tsx scripts/travel-calendar-xlsx-reconcile.ts [path-to-xlsx]
 *
 * Defaults to the standard Downloads filename on Windows when arg omitted.
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";
import { toDate } from "date-fns-tz";
import type {
  CampaignCalendarItem,
  CountyMeetingTentativeRow,
  CountyPrioritySnapshotRow,
  FestivalLeadVerifiedRow,
} from "../src/lib/calendar/campaign-calendar-item";
import { loadRedDirtEnv } from "./load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..");
loadRedDirtEnv(REPO);

const TZ = "America/Chicago";
const DEFAULT_WIN_XLSX = path.join(
  "C:",
  "Users",
  "User",
  "Downloads",
  "Kelly_Grappe_Travel_Calendar_to_July_4_2026.xlsx",
);
const OUT_DIR = path.join(REPO, "data", "calendar-command-center");

function ymdFromCell(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const mo = m[1]!.padStart(2, "0");
    const da = m[2]!.padStart(2, "0");
    return `${m[3]}-${mo}-${da}`;
  }
  return null;
}

function parseHm(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "number") {
    const total = Math.round(raw * 24 * 60);
    const h = Math.floor(total / 60) % 24;
    const mi = total % 60;
    return `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
  }
  const s = String(raw).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!m) return null;
  return `${String(Number(m[1])).padStart(2, "0")}:${m[2]}`;
}

function chicagoIso(ymd: string, hm: string | null, allDay: boolean): string {
  if (allDay || !hm) {
    const d = toDate(`${ymd}T12:00:00`, { timeZone: TZ });
    return d.toISOString();
  }
  const d = toDate(`${ymd}T${hm}:00`, { timeZone: TZ });
  return d.toISOString();
}

function normTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleScore(a: string, b: string): number {
  const A = normTitle(a);
  const B = normTitle(b);
  if (!A || !B) return 0;
  if (A === B) return 1;
  if (A.includes(B.slice(0, 14)) || B.includes(A.slice(0, 14))) return 0.88;
  const aw = A.split(" ").filter((w) => w.length > 3);
  if (!aw.length) return 0;
  let hit = 0;
  for (const w of aw) {
    if (B.includes(w)) hit++;
  }
  return hit / aw.length;
}

function mapSheetTypeToEventType(
  t: string,
): CampaignCalendarItem["eventType"] {
  const s = t.toLowerCase();
  if (s.includes("virtual") || s.includes("statewide")) return "virtual_statewide";
  if (s.includes("fair") || s.includes("festival")) return "fair_festival";
  if (s.includes("party") || s.includes("county meeting")) return "county_party_meeting";
  if (s.includes("fundraiser")) return "fundraiser";
  if (s.includes("press") || s.includes("media")) return "media";
  if (s.includes("travel") || s.includes("drive")) return "travel";
  if (s.includes("overnight")) return "overnight";
  if (s.includes("personal") || s.includes("admin")) return "personal_admin";
  if (s.includes("campaign")) return "campaign_event";
  return "community_event";
}

function mapStatus(raw: string): CampaignCalendarItem["calendarStatus"] {
  const u = raw.toUpperCase();
  if (u.includes("CONFLICT")) return "conflict";
  if (u.includes("DECLIN") || u.includes("DROP")) return "declined";
  if (u.includes("VERIFY") || u.includes("TBD")) return "needs_verification";
  if (u.includes("RECOMMEND") || u.includes("PROPOSE")) return "recommended";
  if (u.includes("TENT")) return "tentative";
  if (u.includes("CONFIRM") || u.includes("KEEP")) return "confirmed";
  return "needs_verification";
}

function slugId(prefix: string, key: string): string {
  const h = normTitle(key).replace(/\s+/g, "-").slice(0, 80);
  return `${prefix}-${h || "row"}`;
}

type CountyLite = { id: string; slug: string; displayName: string };

function resolveCounty(counties: CountyLite[], label: unknown): string | undefined {
  if (label == null) return undefined;
  const raw = String(label).trim();
  if (!raw) return undefined;
  const strip = raw.toLowerCase().replace(/\s+county\s*$/i, "").trim();
  for (const c of counties) {
    const dn = c.displayName.toLowerCase().replace(/\s+county\s*$/i, "").trim();
    if (dn === strip || c.displayName.toLowerCase() === raw.toLowerCase()) return c.displayName;
  }
  if (strip.length > 2) {
    for (const c of counties) {
      if (c.displayName.toLowerCase().includes(strip)) return c.displayName;
    }
  }
  return raw;
}

const ABUNDANT = new Set([
  "pulaski",
  "saline",
  "faulkner",
  "washington",
  "benton",
  "craighead",
]);

function isAbundantCounty(name?: string): boolean {
  if (!name) return false;
  const n = name.toLowerCase().replace(/\s+county\s*$/i, "").trim();
  return ABUNDANT.has(n);
}

function chicagoYmdFromIso(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

async function tryPrisma(): Promise<{
  counties: CountyLite[];
  events: Array<{
    id: string;
    title: string;
    startAt: Date;
    endAt: Date;
    countyId: string | null;
    county: { displayName: string } | null;
    googleEventId: string | null;
  }>;
  festivals: Array<{
    id: string;
    name: string;
    startAt: Date;
    endAt: Date;
    countyId: string | null;
    county: { displayName: string } | null;
    sourceUrl: string;
  }>;
  googleRows: Array<{ id: string; googleEventId: string; summary: string | null; startAt: Date | null }>;
  connected: boolean;
  error?: string;
}> {
  if (!process.env.DATABASE_URL) {
    return { counties: [], events: [], festivals: [], googleRows: [], connected: false, error: "DATABASE_URL unset" };
  }
  const { PrismaClient, CampaignEventStatus } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const since = new Date("2025-11-01T00:00:00.000Z");
    const until = new Date("2026-07-05T23:59:59.999Z");
    const [counties, events, festivals, googleRows] = await Promise.all([
      prisma.county.findMany({ select: { id: true, slug: true, displayName: true }, orderBy: { displayName: "asc" } }),
      prisma.campaignEvent.findMany({
        where: { startAt: { gte: since, lte: until }, status: { not: CampaignEventStatus.CANCELLED } },
        select: {
          id: true,
          title: true,
          startAt: true,
          endAt: true,
          countyId: true,
          county: { select: { displayName: true } },
          googleEventId: true,
        },
      }),
      prisma.arkansasFestivalIngest.findMany({
        where: { startAt: { lte: until }, endAt: { gte: since } },
        select: {
          id: true,
          name: true,
          startAt: true,
          endAt: true,
          countyId: true,
          county: { select: { displayName: true } },
          sourceUrl: true,
        },
      }),
      prisma.googleCalendarEventRecord.findMany({
        where: { startAt: { gte: since, lte: until } },
        select: { id: true, googleEventId: true, summary: true, startAt: true },
        take: 5000,
      }),
    ]);
    return { counties, events, festivals, googleRows, connected: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { counties: [], events: [], festivals: [], googleRows: [], connected: false, error: msg };
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

function bestEventMatch(
  events: Awaited<ReturnType<typeof tryPrisma>>["events"],
  ymd: string,
  title: string,
  uid: string,
): { id: string; score: number; reason: string } | null {
  let best: { id: string; score: number; reason: string } | null = null;
  const dayKey = (d: Date) =>
    d.toLocaleDateString("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  for (const ev of events) {
    if (uid && ev.googleEventId && ev.googleEventId === uid) {
      return { id: ev.id, score: 1, reason: "googleEventId match" };
    }
    if (dayKey(ev.startAt) !== ymd) continue;
    const sc = titleScore(ev.title, title);
    if (sc >= 0.45 && (!best || sc > best.score)) {
      best = { id: ev.id, score: sc, reason: `title+date score ${sc.toFixed(2)}` };
    }
  }
  return best;
}

function bestFestivalMatch(
  festivals: Awaited<ReturnType<typeof tryPrisma>>["festivals"],
  name: string,
  countyLabel: string | undefined,
  ymd: string | null,
): { id: string; score: number } | null {
  let best: { id: string; score: number } | null = null;
  const dayKey = (d: Date) =>
    d.toLocaleDateString("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  for (const f of festivals) {
    let sc = titleScore(f.name, name);
    if (countyLabel && f.county?.displayName) {
      const c1 = countyLabel.toLowerCase();
      const c2 = f.county.displayName.toLowerCase();
      if (c1.includes(c2.slice(0, 6)) || c2.includes(c1.replace(/\s+county/i, "").slice(0, 6))) {
        sc += 0.15;
      } else {
        sc *= 0.6;
      }
    }
    if (ymd) {
      const fk = dayKey(f.startAt);
      if (fk !== ymd) {
        const d0 = new Date(`${ymd}T12:00:00Z`).getTime();
        const diff = Math.abs(f.startAt.getTime() - d0) / 86400000;
        if (diff > 3) sc *= 0.5;
      }
    }
    if (sc > (best?.score ?? 0)) best = { id: f.id, score: Math.min(1, sc) };
  }
  return best && best.score >= 0.35 ? best : null;
}

async function main() {
  const arg = process.argv[2]?.trim();
  const xlsxPath = arg && existsSync(arg) ? arg : existsSync(DEFAULT_WIN_XLSX) ? DEFAULT_WIN_XLSX : arg;
  if (!xlsxPath || !existsSync(xlsxPath)) {
    console.error("Missing workbook. Pass path to Kelly_Grappe_Travel_Calendar_to_July_4_2026.xlsx");
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const wb = XLSX.readFile(xlsxPath, { cellDates: true });

  const readRows = (name: string): Record<string, unknown>[] => {
    const sh = wb.Sheets[name];
    if (!sh) return [];
    return XLSX.utils.sheet_to_json<Record<string, unknown>>(sh, { defval: "" });
  };

  const recRows = readRows("Recommended Calendar");
  const priRows = readRows("County Priorities");
  const calRows = readRows("Calendar Import");
  const festRows = readRows("Festival Leads");
  const meetRows = readRows("County Meetings");

  const db = await tryPrisma();
  const items: CampaignCalendarItem[] = [];
    const festivalOut: FestivalLeadVerifiedRow[] = [];
    const meetingOut: CountyMeetingTentativeRow[] = [];
    const priorityRows: CountyPrioritySnapshotRow[] = [];

    for (const r of priRows) {
      const county = String(r["County"] ?? "").trim();
      if (!county) continue;
      const tierRaw = String(r["Tier"] ?? "");
      let recommendedTier: CampaignCalendarItem["priorityTier"];
      if (tierRaw.includes("Tier 1")) recommendedTier = "Tier 1";
      else if (tierRaw.includes("Tier 2")) recommendedTier = "Tier 2";
      else recommendedTier = "Backseat filler";
      priorityRows.push({
        county,
        strategicClass: String(r["Strategic class"] ?? "") || undefined,
        pastTouchesSinceNov1: Number(r["Past campaign touches since Nov 1"] ?? 0) || 0,
        lastTouch: String(r["Last touch"] ?? "") || undefined,
        scheduledFutureAnchors: Number(r["Scheduled future anchors"] ?? 0) || 0,
        nextScheduledAnchor: String(r["Next scheduled anchor"] ?? "") || undefined,
        priorityScore: Number(r["Priority score"] ?? 0) || undefined,
        tier: tierRaw || undefined,
        notes: String(r["Notes"] ?? "") || undefined,
        underTouched: (Number(r["Past campaign touches since Nov 1"] ?? 0) || 0) <= 1,
        fewOpportunities: /fewer|few\s+obvious/i.test(String(r["Notes"] ?? "")),
        recommendedTierLabel: recommendedTier,
      });
    }

    for (const r of recRows) {
      const ymd = ymdFromCell(r["Date"]);
      if (!ymd) continue;
      const title =
        String(r["Anchor"] ?? "").trim() ||
        String(r["Base / Movement"] ?? "").trim() ||
        "Recommended block";
      const county = resolveCounty(db.counties, r["County / Region"]);
      const overnight = String(r["Overnight"] ?? "").trim();
      const statusRaw = String(r["Status"] ?? "");
      items.push({
        id: slugId("rec", `${ymd}-${title}`),
        source: "spreadsheet",
        title,
        start: chicagoIso(ymd, "09:00", true),
        end: chicagoIso(ymd, "20:00", true),
        allDay: true,
        county,
        location: String(r["Add-ons / Notes"] ?? "") || undefined,
        eventType: mapSheetTypeToEventType(String(r["Base / Movement"] ?? "")),
        calendarStatus: mapStatus(statusRaw),
        publishStatus: "private_admin_only",
        countyTouchCounts: !/personal|constraint|lr work/i.test(String(r["Base / Movement"] ?? "")),
        overnightRequired: /yes|two|second night/i.test(overnight),
        overnightCity: overnight && overnight.length < 120 ? overnight : undefined,
        verificationConfidence: 0.55,
        notes: [String(r["Base / Movement"] ?? ""), String(r["Add-ons / Notes"] ?? "")]
          .filter(Boolean)
          .join(" — ") || undefined,
        drillDown: {
          anchorClassification: String(r["Anchor"] ?? "") || undefined,
          travelRequirement: String(r["Base / Movement"] ?? "") || undefined,
          spreadsheetTab: "Recommended Calendar",
        },
      });
    }

    const calAudit: Array<Record<string, unknown>> = [];

    for (let i = 0; i < calRows.length; i++) {
      const r = calRows[i]!;
      const ymd = ymdFromCell(r["Date"]);
      if (!ymd) continue;
      const title = String(r["Summary"] ?? "").trim() || "(no title)";
      const startHm = parseHm(r["Start"]);
      const endHm = parseHm(r["End"]);
      const counted = String(r["Counted as county touch"] ?? "").toLowerCase().startsWith("y");
      const typeStr = String(r["Type"] ?? "");
      const uid = String(r["UID"] ?? "").trim();
      const inferred = String(r["Inferred county"] ?? "").trim();
      const county = resolveCounty(db.counties, inferred || undefined) ?? (inferred || undefined);
      const statusRaw = String(r["Status"] ?? "");
      const loc = String(r["Location"] ?? "").trim();

      const startIso = chicagoIso(ymd, startHm, !startHm);
      const endIso = endHm ? chicagoIso(ymd, endHm, false) : undefined;

      const evMatch = db.connected ? bestEventMatch(db.events, ymd, title, uid) : null;
      const conf = evMatch ? Math.min(1, 0.55 + evMatch.score * 0.45) : uid ? 0.5 : 0.42;

      items.push({
        id: uid ? `gcal-${uid.slice(0, 48)}` : slugId("cal", `${ymd}-${i}-${title}`),
        source: "google_calendar",
        sourceId: uid || undefined,
        title,
        start: startIso,
        end: endIso,
        allDay: !startHm,
        county,
        location: loc || undefined,
        eventType: mapSheetTypeToEventType(typeStr),
        calendarStatus: mapStatus(statusRaw),
        publishStatus: "private_admin_only",
        countyTouchCounts: counted,
        verificationConfidence: conf,
        notes: typeStr || undefined,
        drillDown: {
          spreadsheetTab: "Calendar Import",
          rowHint: `row ${i + 2}`,
          matchedDb: evMatch
            ? { kind: "CampaignEvent", id: evMatch.id, matchReason: evMatch.reason }
            : undefined,
        },
      });

      calAudit.push({
        ymd,
        title,
        uid,
        inferredCounty: inferred,
        resolvedCounty: county ?? "",
        countedAsTouch: counted,
        matchedCampaignEventId: evMatch?.id ?? null,
        matchConfidence: conf,
        needsHumanReview: !evMatch || conf < 0.72,
      });
    }

    for (let i = 0; i < festRows.length; i++) {
      const r = festRows[i]!;
      const ymd = ymdFromCell(r["Date"]);
      const name = String(r["Event / lead"] ?? "").trim();
      if (!name) continue;
      const countyLabel = String(r["County"] ?? "").trim();
      const county = resolveCounty(db.counties, countyLabel) ?? countyLabel;
      const notes = String(r["Status / verification notes"] ?? "").trim();
      const fm = db.connected ? bestFestivalMatch(db.festivals, name, county, ymd) : null;
      let reconcileStatus: FestivalLeadVerifiedRow["reconcileStatus"] = "needs_confirmation";
      if (fm && fm.score >= 0.55) reconcileStatus = "verified_in_burt_db";
      else if (/wikipedia|web|supplement/i.test(String(r["Source"] ?? ""))) reconcileStatus = "web_supplemental_lead";
      else if (/past in current window|proof/i.test(notes)) reconcileStatus = "calendar_only_lead";
      if (/not campaign|skip/i.test(notes)) reconcileStatus = "not_campaign_relevant";

      festivalOut.push({
        id: slugId("fest", `${ymd ?? "nodate"}-${name}`),
        date: ymd ?? undefined,
        eventName: name,
        county,
        source: String(r["Source"] ?? "") || undefined,
        spreadsheetNotes: notes || undefined,
        reconcileStatus,
        matchedFestivalIngestId: fm?.id,
        matchConfidence: fm?.score,
      });
    }

    for (const r of meetRows) {
      const county = String(r["County"] ?? "").trim();
      if (!county) continue;
      meetingOut.push({
        county,
        meetingStatus: String(r["Meeting status"] ?? "") || undefined,
        observedCalendarNotes: String(r["Observed Kelly calendar county-party/civic meetings"] ?? "") || undefined,
        calendarPriority: String(r["Calendar priority"] ?? "") || undefined,
        tentativeMonthlyDate: String(r["Tentative monthly date to fill"] ?? "") || undefined,
        sourceNextAction: String(r["Source / next action"] ?? "") || undefined,
        meetingCadence: undefined,
        nextMeetingBeforeJuly4: undefined,
        location: undefined,
        contactSource: "DPA county parties directory + direct county confirmation (manual next step)",
        confidence: 0.25,
        kellyAttendance: "undecided",
        verification: "tentative_placeholder",
      });
    }

    /** ---- Conflicts: overlapping timed items same day ---- */
    const timed = items.filter((x) => !x.allDay && x.end);
    const conflictIds = new Set<string>();
    for (let i = 0; i < timed.length; i++) {
      for (let j = i + 1; j < timed.length; j++) {
        const a = timed[i]!;
        const b = timed[j]!;
        if (chicagoYmdFromIso(a.start) !== chicagoYmdFromIso(b.start)) continue;
        const as = new Date(a.start).getTime();
        const ae = new Date(a.end!).getTime();
        const bs = new Date(b.start).getTime();
        const be = new Date(b.end!).getTime();
        if (as < be && bs < ae) {
          conflictIds.add(a.id);
          conflictIds.add(b.id);
        }
      }
    }
    for (const it of items) {
      if (conflictIds.has(it.id) && it.calendarStatus !== "declined") {
        it.calendarStatus = "conflict";
        it.drillDown = {
          ...it.drillDown,
          rowHint: [it.drillDown?.rowHint, "overlap detected with another timed item"].filter(Boolean).join(" | "),
        };
      }
    }

    /** ---- Tuesday Little Rock constraint flag (heuristic) ---- */
    for (const it of items) {
      const wd = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(new Date(it.start));
      if (wd === "Tue" && it.county && !/pulaski|little rock|lr\b/i.test(it.county + (it.title ?? ""))) {
        it.drillDown = {
          ...it.drillDown,
          rowHint: [it.drillDown?.rowHint, "Tuesday travel outside Pulaski/Little Rock — verify vs LR work constraint"]
            .filter(Boolean)
            .join(" | "),
        };
      }
    }

    /** ---- County touch rollup since 2025-11-01 from Calendar Import ---- */
    const touchByCounty = new Map<string, { touches: number; lastYmd: string | null }>();
    for (const r of calRows) {
      const ymd = ymdFromCell(r["Date"]);
      if (!ymd || ymd < "2025-11-01") continue;
      const counted = String(r["Counted as county touch"] ?? "").toLowerCase().startsWith("y");
      if (!counted) continue;
      const inferred = String(r["Inferred county"] ?? "").trim();
      const c = resolveCounty(db.counties, inferred) ?? inferred;
      if (!c) continue;
      const cur = touchByCounty.get(c) ?? { touches: 0, lastYmd: null };
      cur.touches += 1;
      if (!cur.lastYmd || ymd > cur.lastYmd) cur.lastYmd = ymd;
      touchByCounty.set(c, cur);
    }

    const top15 = [...priorityRows]
      .sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0))
      .filter((r) => !isAbundantCounty(r.county) || (r.tier ?? "").includes("Tier 1"))
      .slice(0, 15);

    const matchedCal = calAudit.filter((x) => x.matchedCampaignEventId).length;
    const unmatchedCal = calAudit.length - matchedCal;

    const report = [
      `# Campaign calendar DB audit (generated ${new Date().toISOString()})`,
      ``,
      `## Workbook`,
      `- Path: ${xlsxPath}`,
      `- Calendar Import rows processed: ${calAudit.length}`,
      ``,
      `## Prisma connectivity`,
      `- Connected: ${db.connected}`,
      db.error
        ? `- Note: ${db.error}\n- If the error mentions missing columns, local DATABASE_URL likely lags the Prisma schema; align migrations or point at Kelly-Grappe-App read replica for reconcile.`
        : "",
      `- Counties loaded: ${db.counties.length}`,
      `- CampaignEvent in window: ${db.events.length}`,
      `- ArkansasFestivalIngest in window: ${db.festivals.length}`,
      `- GoogleCalendarEventRecord sample: ${db.googleRows.length}`,
      ``,
      `## Calendar Import reconciliation`,
      `- Rows with CampaignEvent match: ${matchedCal}`,
      `- Rows without confident match: ${unmatchedCal}`,
      ``,
      `## Festival leads`,
      `- verified_in_burt_db: ${festivalOut.filter((f) => f.reconcileStatus === "verified_in_burt_db").length}`,
      `- needs_confirmation / other: ${festivalOut.filter((f) => f.reconcileStatus !== "verified_in_burt_db").length}`,
      ``,
      `## County meetings`,
      `- Tentative placeholder rows emitted: ${meetingOut.length} (DPA scrape + county confirmation still required)`,
      ``,
      `## Top 15 counties (spreadsheet priority, de-emphasizing abundant-opportunity fillers except Tier 1)`,
      ...top15.map((r, i) => `${i + 1}. ${r.county} — score ${r.priorityScore ?? "n/a"} — ${r.tier ?? ""}`),
      ``,
      `## Outputs`,
      `- ${path.join(OUT_DIR, "calendar-items.normalized.json")}`,
      `- ${path.join(OUT_DIR, "county-priority-snapshot.json")}`,
      `- ${path.join(OUT_DIR, "festival-leads.verified.json")}`,
      `- ${path.join(OUT_DIR, "county-meetings.tentative.json")}`,
    ]
      .filter(Boolean)
      .join("\n");

    writeFileSync(path.join(OUT_DIR, "calendar-items.normalized.json"), JSON.stringify(items, null, 2), "utf8");
    writeFileSync(path.join(OUT_DIR, "county-priority-snapshot.json"), JSON.stringify(priorityRows, null, 2), "utf8");
    writeFileSync(path.join(OUT_DIR, "festival-leads.verified.json"), JSON.stringify(festivalOut, null, 2), "utf8");
    writeFileSync(path.join(OUT_DIR, "county-meetings.tentative.json"), JSON.stringify(meetingOut, null, 2), "utf8");
    writeFileSync(
      path.join(OUT_DIR, "calendar-import-reconcile-audit.json"),
      JSON.stringify(calAudit, null, 2),
      "utf8",
    );
    writeFileSync(path.join(OUT_DIR, "county-touch-summary.json"), JSON.stringify([...touchByCounty.entries()], null, 2), "utf8");

    const docsDir = path.join(REPO, "docs", "calendar-command-center");
    mkdirSync(docsDir, { recursive: true });
    writeFileSync(path.join(docsDir, "DB_AUDIT_REPORT.md"), report, "utf8");

  console.log(report);
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
