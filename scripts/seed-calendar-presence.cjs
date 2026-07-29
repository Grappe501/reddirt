/**
 * Seed data/campaign-media/calendar-presence.json from CSV extract or confirmation markdown tables.
 * Usage (from RedDirt): node scripts/seed-calendar-presence.cjs
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "data/campaign-media/calendar-presence.json");
const CSV = path.join(ROOT, "..", ".local/temp/kelly-calendar-extract.csv");
const MD = path.join(ROOT, "docs/website/CALENDAR_PRESENCE_CONFIRMATION.md");

function calendarRowId(date, summary) {
  const raw = `${date}|${summary}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) hash = (hash * 31 + raw.charCodeAt(i)) | 0;
  return `cal_${Math.abs(hash).toString(36)}_${raw.length}`;
}

function isExcludeSummary(s) {
  const x = String(s || "").toLowerCase();
  const patterns = [
    "the hub",
    "campaign huddle",
    "kelly's campaign huddle",
    "party huddle",
    "family christmas",
    "personal block",
    "unavailable",
    "pawpaw",
    "busy",
    "work from hospital",
    "mother's day",
    "dusty appt",
    "call judy",
    "call jg",
    "dass + kelly",
    "early voting begins",
    "primary election day",
    "election day",
    "placeholder hot springs",
    "ms magazine interview",
    "pick up karrabi",
    "don henry arrive",
    "leave for horseshoe",
    "come home from",
    "steve unavailable",
  ];
  return patterns.some((p) => x.includes(p));
}

function isGeographyFacing(summary, placeLoc) {
  if (placeLoc) return true;
  if (isExcludeSummary(summary)) return false;
  return /county|russellville|jonesboro|jacksonville|mena|fulton|stone|saline|faulkner|sebastian|pulaski|hot springs|heber|conway|fayetteville|springdale|fort smith|ft\.?\s*smith|camden|cross |white county|van buren|sherwood|argenta|gillett|gillette|st\.?\s*joe|eureka|washington|jonquil|morrilton|little rock|pine bluff|texarkana|benton|searcy|paragould|mountain|harrison|batesville|arkadelphia|hope|magnolia|el dorado|malvern|cabot|bryant|maumelle|newport|stuttgart|yellville|berryville|cave city|horseshoe|bella vista|rector|immersion|forum|pie auction|coon supper|koffee|fish fry|town hall|homecoming|fundraiser|visit|candidate|festival|fair|watermelon|peach|balloon|comic con|air show|goat fest|moonshine|festiville|juneteenth|liberty day|pink tomato|homemakers|chamber|naacp|pastor|church|picnic|canvass|hq opening|speaking|dems|dem party|clerk/i.test(
    summary,
  );
}

function sanitizeLocation(loc) {
  if (!loc) return "";
  if (/^https?:\/\//i.test(loc) || /^virtual/i.test(loc)) return "";
  return String(loc).replace(/\\n/g, " ").trim();
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.replace(/^"|"$/g, ""));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = [];
    let cur = "";
    let inQ = false;
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '"') {
        if (inQ && line[j + 1] === '"') {
          cur += '"';
          j++;
        } else inQ = !inQ;
      } else if (ch === "," && !inQ) {
        cols.push(cur);
        cur = "";
      } else cur += ch;
    }
    cols.push(cur);
    const obj = {};
    header.forEach((h, idx) => {
      obj[h] = cols[idx] ?? "";
    });
    rows.push(obj);
  }
  return rows;
}

function parseMdTables(md) {
  const rows = [];
  const lines = md.split(/\r?\n/);
  let inTable = false;
  let headers = [];
  for (const line of lines) {
    if (!line.startsWith("|")) {
      inTable = false;
      continue;
    }
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.every((c) => /^-+$/.test(c))) continue;
    if (cells[0] === "Date" || cells.includes("Summary")) {
      inTable = true;
      headers = cells;
      continue;
    }
    if (!inTable || headers.length === 0) continue;
    if (headers.includes("Reason")) {
      // exclude shortlist
      const date = cells[0] || "";
      const summary = cells[1] || "";
      if (!date || !summary) continue;
      rows.push({
        date,
        summary,
        location: "",
        city: "",
        county: "",
        status: "Exclude",
        hasPhysicalLocation: false,
      });
      continue;
    }
    const date = cells[0] || "";
    const summary = cells[1] || "";
    const location = cells[2] || "";
    const city = cells[3] || "";
    const county = cells[4] || "";
    const status = cells[5] || "Needs confirm";
    if (!date || !summary) continue;
    rows.push({
      date,
      summary,
      location,
      city,
      county,
      status: status.includes("Exclude") ? "Exclude" : status.includes("Confirmed") ? "Confirmed" : status.includes("Unknown") ? "Unknown" : "Needs confirm",
      hasPhysicalLocation: Boolean(location.trim()),
    });
  }
  return rows;
}

function fromCsv(csvRows) {
  const out = [];
  const seen = new Set();
  for (const r of csvRows) {
    const date = r.Date || "";
    const summary = r.Summary || "";
    const rawLoc = r.Location || "";
    const isUrl = /^https?:\/\//i.test(rawLoc) || /^virtual/i.test(rawLoc);
    const location = sanitizeLocation(rawLoc);
    const exclude = isExcludeSummary(summary) || isUrl;
    const geo = isGeographyFacing(summary, location);
    if (!geo && !exclude) continue;
    const status = exclude && !location ? "Exclude" : "Needs confirm";
    if (!(geo || location) && status !== "Exclude") continue;
    if (status === "Exclude" && !geo && !location) {
      // still include excludes that matched exclude patterns from full feed via geo false
    }
    const key = `${date}|${summary}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (status === "Exclude" && !location && !geo) {
      out.push({
        id: calendarRowId(date, summary),
        date,
        summary,
        location: "",
        city: "",
        county: "",
        status: "Exclude",
        hasPhysicalLocation: false,
      });
      continue;
    }
    if (geo || location) {
      out.push({
        id: calendarRowId(date, summary),
        date,
        summary,
        location,
        city: "",
        county: "",
        status: exclude && !location ? "Exclude" : "Needs confirm",
        hasPhysicalLocation: Boolean(location),
      });
    }
  }
  // Also add pure excludes from CSV
  for (const r of csvRows) {
    const date = r.Date || "";
    const summary = r.Summary || "";
    const rawLoc = r.Location || "";
    const isUrl = /^https?:\/\//i.test(rawLoc) || /^virtual/i.test(rawLoc);
    if (!(isExcludeSummary(summary) || isUrl)) continue;
    const key = `${date}|${summary}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: calendarRowId(date, summary),
      date,
      summary,
      location: "",
      city: "",
      county: "",
      status: "Exclude",
      hasPhysicalLocation: false,
    });
  }
  return out.sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.summary).localeCompare(String(b.summary)));
}

function main() {
  let rows = [];
  let sourceNote = "";
  if (fs.existsSync(CSV)) {
    const csvText = fs.readFileSync(CSV, "utf8");
    rows = fromCsv(parseCsv(csvText));
    sourceNote = "Seeded from H:/SOSWebsite/.local/temp/kelly-calendar-extract.csv";
  } else if (fs.existsSync(MD)) {
    rows = parseMdTables(fs.readFileSync(MD, "utf8")).map((r) => ({
      id: calendarRowId(r.date, r.summary),
      ...r,
    }));
    // dedupe
    const seen = new Set();
    rows = rows.filter((r) => {
      const k = `${r.date}|${r.summary}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    sourceNote = "Seeded from docs/website/CALENDAR_PRESENCE_CONFIRMATION.md";
  } else {
    console.error("No CSV or confirmation MD found to seed from.");
    process.exit(1);
  }

  const store = {
    version: 1,
    updatedAt: new Date().toISOString(),
    sourceNote,
    rows,
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  const confirmed = rows.filter((r) => r.status === "Confirmed").length;
  const needs = rows.filter((r) => r.status === "Needs confirm").length;
  const excl = rows.filter((r) => r.status === "Exclude").length;
  console.log(`Wrote ${OUT}`);
  console.log(`Rows: ${rows.length} (Needs confirm ${needs}, Confirmed ${confirmed}, Exclude ${excl})`);
}

main();
