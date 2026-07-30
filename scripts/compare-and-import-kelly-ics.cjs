/**
 * Compare two Kelly Google ICS exports, seed Evidence calendar-presence from the newer one,
 * and preserve prior Confirmed/city/county overlays when date+summary still match.
 *
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs node scripts/compare-and-import-kelly-ics.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const TEMP = path.join(ROOT, "..", ".local", "temp", "kelly-calendar");
const OLD_ICS = path.join(TEMP, "basic-2026-07-29-1244.ics");
const NEW_ICS = path.join(TEMP, "basic-2026-07-29-2225.ics");
const CSV = path.join(ROOT, "..", ".local", "temp", "kelly-calendar-extract.csv");
const PRESENCE = path.join(ROOT, "data", "campaign-media", "calendar-presence.json");
const REPORT = path.join(TEMP, "ics-compare-report.json");
const SEED = path.join(ROOT, "scripts", "seed-calendar-presence.cjs");

function parseIcsEvents(icsPath) {
  let raw = fs.readFileSync(icsPath, "utf8");
  raw = raw.replace(/\r?\n[ \t]/g, "");
  const blocks = raw.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? [];
  const getField = (text, name) => {
    const m = text.match(new RegExp(`(?:^|\\n)${name}(?:;[^:]*)?:(.*)`));
    return m ? m[1].trim().replace(/\\n/g, " ").replace(/\\,/g, ",") : "";
  };
  const events = [];
  for (const block of blocks) {
    const summary = getField(block, "SUMMARY");
    const location = getField(block, "LOCATION");
    const status = getField(block, "STATUS");
    const uid = getField(block, "UID");
    const dtstart = getField(block, "DTSTART");
    let date = dtstart;
    if (/^\d{8}$/.test(dtstart)) {
      date = `${dtstart.slice(0, 4)}-${dtstart.slice(4, 6)}-${dtstart.slice(6, 8)} (all-day)`;
    } else if (/^\d{8}T\d{6}Z$/.test(dtstart)) {
      date = `${dtstart.slice(0, 4)}-${dtstart.slice(4, 6)}-${dtstart.slice(6, 8)} ${dtstart.slice(9, 11)}:${dtstart.slice(11, 13)} CT`;
    } else if (/^\d{8}T\d{6}$/.test(dtstart)) {
      date = `${dtstart.slice(0, 4)}-${dtstart.slice(4, 6)}-${dtstart.slice(6, 8)} ${dtstart.slice(9, 11)}:${dtstart.slice(11, 13)} (local)`;
    }
    events.push({
      key: `${date}|${summary}`,
      uid,
      date,
      summary,
      location,
      status: status || "",
    });
  }
  return events;
}

function writeCsv(events, csvPath) {
  const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const lines = ["Date,Summary,Location,Status"];
  for (const e of events) {
    lines.push([e.date, e.summary, e.location, e.status].map(esc).join(","));
  }
  fs.mkdirSync(path.dirname(csvPath), { recursive: true });
  fs.writeFileSync(csvPath, `${lines.join("\n")}\n`, "utf8");
}

function loadPresence() {
  if (!fs.existsSync(PRESENCE)) return { rows: [] };
  try {
    return JSON.parse(fs.readFileSync(PRESENCE, "utf8"));
  } catch {
    return { rows: [] };
  }
}

function mergeConfirmations(priorRows, nextRows) {
  const byKey = new Map();
  for (const r of priorRows || []) {
    byKey.set(`${r.date}|${r.summary}`, r);
  }
  let carried = 0;
  const merged = nextRows.map((r) => {
    const prev = byKey.get(`${r.date}|${r.summary}`);
    if (!prev) return r;
    const next = { ...r };
    if (prev.city && prev.city !== "Unknown") next.city = prev.city;
    if (prev.county && prev.county !== "Unknown") next.county = prev.county;
    if (
      prev.status === "Confirmed" ||
      prev.status === "Exclude" ||
      prev.status === "Unknown"
    ) {
      // Keep operator status when still relevant; Confirmed only if geo still present
      if (prev.status === "Confirmed" && (next.county || prev.county)) {
        next.status = "Confirmed";
        if (!next.county && prev.county) next.county = prev.county;
        if (!next.city && prev.city) next.city = prev.city;
      } else if (prev.status === "Exclude") {
        next.status = "Exclude";
      } else if (prev.status === "Unknown") {
        next.status = "Unknown";
      }
    }
    if (prev.status !== next.status || prev.city !== next.city || prev.county !== next.county) {
      carried += 1;
    } else if (prev.city || prev.county || prev.status !== "Needs confirm") {
      carried += 1;
    }
    return next;
  });
  return { merged, carried };
}

function countyHints(summary) {
  const s = String(summary || "");
  const hits = [];
  const re = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+County\b/g;
  let m;
  while ((m = re.exec(s))) hits.push(`${m[1]} County`);
  return hits;
}

function main() {
  if (!fs.existsSync(NEW_ICS)) {
    console.error(`Missing new ICS: ${NEW_ICS}`);
    process.exit(1);
  }
  const newer = parseIcsEvents(NEW_ICS);
  const older = fs.existsSync(OLD_ICS) ? parseIcsEvents(OLD_ICS) : [];

  const oldKeys = new Set(older.map((e) => e.key));
  const newKeys = new Set(newer.map((e) => e.key));
  const added = newer.filter((e) => !oldKeys.has(e.key));
  const removed = older.filter((e) => !newKeys.has(e.key));

  const prior = loadPresence();
  writeCsv(newer, CSV);

  const seed = spawnSync(process.execPath, [SEED], { cwd: ROOT, encoding: "utf8" });
  if (seed.status !== 0) {
    console.error(seed.stderr || seed.stdout || "seed failed");
    process.exit(1);
  }

  const seeded = loadPresence();
  const { merged, carried } = mergeConfirmations(prior.rows, seeded.rows);
  const store = {
    version: 1,
    updatedAt: new Date().toISOString(),
    sourceNote: `Imported ICS ${path.basename(NEW_ICS)} (Google export) · confirmations merged from prior presence store`,
    rows: merged,
  };
  fs.writeFileSync(PRESENCE, `${JSON.stringify(store, null, 2)}\n`, "utf8");

  const countiesInAdded = [...new Set(added.flatMap((e) => countyHints(e.summary)))].sort();
  const countiesInNewFeed = [
    ...new Set(newer.flatMap((e) => countyHints(e.summary))),
  ].sort();

  const report = {
    ok: true,
    googleApiSync: {
      attempted: true,
      ok: false,
      note:
        "calendar:google:sync-kelly blocked — Kelly Tentative/Confirmed CalendarSource lanes missing / no OAuth refresh_token; ensure needs KELLY_GOOGLE_ANCHOR_CALENDAR_SOURCE_ID. Used ICS export as truth instead.",
    },
    olderIcs: { path: OLD_ICS, events: older.length },
    newerIcs: { path: NEW_ICS, events: newer.length },
    delta: {
      addedCount: added.length,
      removedCount: removed.length,
      addedSample: added.slice(0, 40).map((e) => ({ date: e.date, summary: e.summary, location: e.location })),
      removedSample: removed.slice(0, 20).map((e) => ({ date: e.date, summary: e.summary })),
      countyHintsInAdded: countiesInAdded,
      countyHintsInFullNewFeed: countiesInNewFeed,
    },
    presence: {
      rows: merged.length,
      carriedOperatorFields: carried,
      needsConfirm: merged.filter((r) => r.status === "Needs confirm").length,
      confirmed: merged.filter((r) => r.status === "Confirmed").length,
      exclude: merged.filter((r) => r.status === "Exclude").length,
    },
    seedStdout: (seed.stdout || "").trim(),
  };

  fs.writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
  console.log(`Wrote report ${REPORT}`);
  console.log(`Updated ${PRESENCE}`);
}

main();
