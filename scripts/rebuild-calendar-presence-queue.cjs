/**
 * Rebuild Evidence calendar-presence queue from Kelly ICS:
 * ALL events on/after sinceDate (default 2025-11-01), for operator location confirm.
 * Preserves prior city/county/places/status/notes when date+summary match.
 *
 *   node scripts/run-with-h-drive-env.cjs node scripts/rebuild-calendar-presence-queue.cjs
 *   node scripts/run-with-h-drive-env.cjs node scripts/rebuild-calendar-presence-queue.cjs --ics "H:/path/to.ics"
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_ICS = path.join(
  ROOT,
  "..",
  ".local",
  "temp",
  "kelly-calendar",
  "basic-2026-07-29-2225.ics",
);
const OUT = path.join(ROOT, "data", "campaign-media", "calendar-presence.json");
const SINCE = "2025-11-01";

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return null;
}

function calendarRowId(date, summary) {
  const raw = `${date}|${summary}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) hash = (hash * 31 + raw.charCodeAt(i)) | 0;
  return `cal_${Math.abs(hash).toString(36)}_${raw.length}`;
}

function sanitizeLocation(loc) {
  if (!loc) return "";
  if (/^https?:\/\//i.test(loc) || /^virtual/i.test(loc)) return "";
  return String(loc).replace(/\\n/g, " ").trim();
}

function isVirtualOnly(summary, location) {
  const s = String(summary || "").toLowerCase();
  const loc = String(location || "");
  if (/^https?:\/\//i.test(loc) || /zoom\.us|meet\.google|teams\.microsoft/i.test(loc)) return true;
  if (/\b(zoom|virtual|teams call|team call|huddle)\b/i.test(s) && !sanitizeLocation(loc)) return true;
  return false;
}

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
    const locationRaw = getField(block, "LOCATION");
    const status = getField(block, "STATUS");
    const dtstart = getField(block, "DTSTART");
    let date = dtstart;
    let isoDay = "";
    if (/^\d{8}$/.test(dtstart)) {
      isoDay = `${dtstart.slice(0, 4)}-${dtstart.slice(4, 6)}-${dtstart.slice(6, 8)}`;
      date = `${isoDay} (all-day)`;
    } else if (/^\d{8}T\d{6}Z$/.test(dtstart)) {
      isoDay = `${dtstart.slice(0, 4)}-${dtstart.slice(4, 6)}-${dtstart.slice(6, 8)}`;
      date = `${isoDay} ${dtstart.slice(9, 11)}:${dtstart.slice(11, 13)} CT`;
    } else if (/^\d{8}T\d{6}$/.test(dtstart)) {
      isoDay = `${dtstart.slice(0, 4)}-${dtstart.slice(4, 6)}-${dtstart.slice(6, 8)}`;
      date = `${isoDay} ${dtstart.slice(9, 11)}:${dtstart.slice(11, 13)} (local)`;
    } else {
      const m = String(dtstart).match(/(\d{4}-\d{2}-\d{2})/);
      isoDay = m ? m[1] : "";
      date = dtstart;
    }
    events.push({
      isoDay,
      date,
      summary,
      locationRaw,
      location: sanitizeLocation(locationRaw),
      icsStatus: status || "",
      virtualOnly: isVirtualOnly(summary, locationRaw),
    });
  }
  return events;
}

function loadPrior() {
  if (!fs.existsSync(OUT)) return { rows: [] };
  try {
    return JSON.parse(fs.readFileSync(OUT, "utf8"));
  } catch {
    return { rows: [] };
  }
}

function main() {
  const icsPath = argValue("--ics") || DEFAULT_ICS;
  const since = argValue("--since") || SINCE;
  if (!fs.existsSync(icsPath)) {
    console.error(`ICS not found: ${icsPath}`);
    process.exit(1);
  }

  const prior = loadPrior();
  const priorByKey = new Map(
    (prior.rows || []).map((r) => [`${r.date}|${r.summary}`, r]),
  );

  const all = parseIcsEvents(icsPath);
  const filtered = all.filter((e) => e.isoDay && e.isoDay >= since);
  const seen = new Set();
  const rows = [];

  for (const e of filtered) {
    const key = `${e.date}|${e.summary}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const prev = priorByKey.get(key);
    const places =
      Array.isArray(prev?.places) && prev.places.length
        ? prev.places.map((p) => ({
            city: String(p.city || "").trim(),
            county: String(p.county || "").trim(),
            venue: p.venue ? String(p.venue).trim() : undefined,
            note: p.note ? String(p.note).trim() : undefined,
          }))
        : prev?.city || prev?.county
          ? [{ city: prev.city || "", county: prev.county || "" }]
          : [];

    const primary = places[0] || { city: "", county: "" };
    let status = prev?.status || "Needs confirm";
    // Soft default: brand-new virtual-only rows start Exclude (operator can still open All/Exclude)
    if (!prev && e.virtualOnly) status = "Exclude";

    rows.push({
      id: prev?.id || calendarRowId(e.date, e.summary),
      date: e.date,
      summary: e.summary,
      location: e.location,
      city: primary.city || "",
      county: primary.county || "",
      status,
      hasPhysicalLocation: Boolean(e.location),
      places: places.length ? places : undefined,
      notes: prev?.notes || "",
      icsStatus: e.icsStatus || undefined,
    });
  }

  rows.sort(
    (a, b) => String(a.date).localeCompare(String(b.date)) || String(a.summary).localeCompare(String(b.summary)),
  );

  const store = {
    version: 1,
    updatedAt: new Date().toISOString(),
    sourceNote: `Full queue since ${since} from ${path.basename(icsPath)} — confirm every event location (multi-place OK)`,
    sinceDate: since,
    rows,
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify(store, null, 2)}\n`, "utf8");

  const needs = rows.filter((r) => r.status === "Needs confirm").length;
  const confirmed = rows.filter((r) => r.status === "Confirmed").length;
  const excl = rows.filter((r) => r.status === "Exclude").length;
  const unknown = rows.filter((r) => r.status === "Unknown").length;
  const withPlaces = rows.filter((r) => (r.places || []).length > 1).length;

  console.log(
    JSON.stringify(
      {
        ok: true,
        icsPath,
        since,
        icsEventsTotal: all.length,
        queuedSince: rows.length,
        needsConfirm: needs,
        confirmed,
        exclude: excl,
        unknown,
        multiPlaceRows: withPlaces,
        out: OUT,
      },
      null,
      2,
    ),
  );
}

main();
