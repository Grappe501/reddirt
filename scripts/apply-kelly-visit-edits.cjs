/**
 * Apply staff edits to the canonical Kelly county-visit ledger (.ts).
 * Used by the local arkansas-visits editor server.
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const ledgerPath = path.join(
  root,
  "src",
  "data",
  "kelly-county-visits",
  "kelly-county-visits.ts",
);

const VALID_STATUSES = new Set([
  "completed",
  "scheduled",
  "needs-review",
  "canceled",
  "declined",
  "virtual",
  "private",
  "duplicate",
]);

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readLedger() {
  return fs.readFileSync(ledgerPath, "utf8");
}

function writeLedger(text) {
  fs.writeFileSync(ledgerPath, text, "utf8");
}

function findStopRange(text, id) {
  const needle = `id: "${id}"`;
  const idIdx = text.indexOf(needle);
  if (idIdx < 0) return null;

  let start = idIdx;
  while (start > 0 && text[start] !== "{") start -= 1;
  if (text[start] !== "{") return null;

  // Walk back over whitespace/newline so we include leading indentation of "{"
  let absStart = start;
  while (absStart > 0 && (text[absStart - 1] === " " || text[absStart - 1] === "\t")) {
    absStart -= 1;
  }

  let depth = 0;
  let end = start;
  for (; end < text.length; end += 1) {
    const ch = text[end];
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        end += 1; // include closing }
        if (text[end] === ",") end += 1;
        return { start: absStart, end, idIdx };
      }
    }
  }
  return null;
}

function getField(block, name) {
  const re = new RegExp(`\\b${escapeRegExp(name)}:\\s*("(?:\\\\.|[^"\\\\])*"|\\[[\\s\\S]*?\\]|true|false)`, "m");
  const m = block.match(re);
  if (!m) return undefined;
  const raw = m[1];
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw.startsWith("[")) {
    try {
      return JSON.parse(raw.replace(/'/g, '"'));
    } catch {
      const inner = raw.slice(1, -1).trim();
      if (!inner) return [];
      return [...inner.matchAll(/"((?:\\.|[^"\\])*)"/g)].map((x) => x[1]);
    }
  }
  return JSON.parse(raw);
}

function setStringField(block, name, value) {
  const re = new RegExp(`(\\b${escapeRegExp(name)}:\\s*)"(?:\\\\.|[^"\\\\])*"`);
  if (re.test(block)) {
    return block.replace(re, `$1${JSON.stringify(value)}`);
  }
  // Insert after id line
  return block.replace(
    /(\bid:\s*"[^"]*",\s*\n)/,
    `$1    ${name}: ${JSON.stringify(value)},\n`,
  );
}

function setBooleanField(block, name, value) {
  const re = new RegExp(`(\\b${escapeRegExp(name)}:\\s*)(true|false)`);
  if (re.test(block)) {
    return block.replace(re, `$1${value ? "true" : "false"}`);
  }
  return block.replace(
    /(\bid:\s*"[^"]*",\s*\n)/,
    `$1    ${name}: ${value ? "true" : "false"},\n`,
  );
}

function setCountiesField(block, counties) {
  const rendered =
    !counties || counties.length === 0
      ? "[]"
      : `[${counties.map((c) => JSON.stringify(c)).join(", ")}]`;
  const re = /\bcounties:\s*\[[\s\S]*?\]/;
  if (re.test(block)) {
    return block.replace(re, `counties: ${rendered}`);
  }
  return block.replace(/(\bid:\s*"[^"]*",\s*\n)/, `$1    counties: ${rendered},\n`);
}

function removeField(block, name) {
  return block.replace(
    new RegExp(`\\n\\s*${escapeRegExp(name)}:\\s*(?:"(?:\\\\.|[^"\\\\])*"|\\[[\\s\\S]*?\\]|true|false),?`, "m"),
    "",
  );
}

function normalizePatch(patch, existing) {
  const out = { ...patch };
  if (out.counties != null) {
    if (!Array.isArray(out.counties)) {
      throw new Error("counties must be an array of county names");
    }
    out.counties = out.counties.map((c) => String(c).trim()).filter(Boolean);
  }
  if (out.status != null && !VALID_STATUSES.has(out.status)) {
    throw new Error(`Invalid status: ${out.status}`);
  }
  if (out.date != null && !/^\d{4}-\d{2}-\d{2}$/.test(out.date)) {
    throw new Error("date must be YYYY-MM-DD");
  }

  const counties = out.counties != null ? out.counties : existing.counties || [];
  const date = out.date != null ? out.date : existing.date;
  let status = out.status != null ? out.status : existing.status;

  // Filling counties on a pending/needs-review public stop → confirmed completed/scheduled
  if (
    counties.length > 0 &&
    (existing.status === "needs-review" || (existing.counties || []).length === 0)
  ) {
    if (out.status == null || out.status === "needs-review") {
      const asOf = process.env.KELLY_VISITS_AS_OF?.trim() || new Date().toISOString().slice(0, 10);
      status = date <= asOf ? "completed" : "scheduled";
    }
    out.confidence = out.confidence || "confirmed";
  }

  out.status = status;
  return out;
}

function applyFieldUpdates(block, patch) {
  let next = block;
  if (patch.date != null) next = setStringField(next, "date", patch.date);
  if (patch.endDate !== undefined) {
    if (patch.endDate == null || String(patch.endDate).trim() === "") {
      next = removeField(next, "endDate");
    } else {
      next = setStringField(next, "endDate", String(patch.endDate).trim());
    }
  }
  if (patch.title != null) next = setStringField(next, "title", patch.title);
  if (patch.publicTitle !== undefined) {
    if (patch.publicTitle == null || String(patch.publicTitle).trim() === "") {
      next = removeField(next, "publicTitle");
    } else {
      next = setStringField(next, "publicTitle", String(patch.publicTitle).trim());
    }
  }
  if (patch.city !== undefined) {
    if (patch.city == null || String(patch.city).trim() === "") {
      next = removeField(next, "city");
    } else {
      next = setStringField(next, "city", String(patch.city).trim());
    }
  }
  if (patch.counties != null) next = setCountiesField(next, patch.counties);
  if (patch.status != null) next = setStringField(next, "status", patch.status);
  if (patch.includeOnPublicPage != null) {
    next = setBooleanField(next, "includeOnPublicPage", Boolean(patch.includeOnPublicPage));
  }
  if (patch.confidence != null) next = setStringField(next, "confidence", patch.confidence);
  if (patch.notes !== undefined) {
    if (patch.notes == null || String(patch.notes).trim() === "") {
      next = removeField(next, "notes");
    } else {
      next = setStringField(next, "notes", String(patch.notes).trim());
    }
  }
  if (patch.sourceType != null) next = setStringField(next, "sourceType", patch.sourceType);
  return next;
}

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "stop";
}

function formatNewStop(stop) {
  const lines = [
    "  {",
    `    id: ${JSON.stringify(stop.id)},`,
    `    date: ${JSON.stringify(stop.date)},`,
    `    title: ${JSON.stringify(stop.title)},`,
  ];
  if (stop.city) lines.push(`    city: ${JSON.stringify(stop.city)},`);
  if (stop.endDate) lines.push(`    endDate: ${JSON.stringify(stop.endDate)},`);
  if (stop.publicTitle) lines.push(`    publicTitle: ${JSON.stringify(stop.publicTitle)},`);
  const counties =
    !stop.counties || stop.counties.length === 0
      ? "[]"
      : `[${stop.counties.map((c) => JSON.stringify(c)).join(", ")}]`;
  lines.push(`    counties: ${counties},`);
  lines.push(`    status: ${JSON.stringify(stop.status)},`);
  lines.push(`    includeOnPublicPage: ${stop.includeOnPublicPage ? "true" : "false"},`);
  lines.push(`    confidence: ${JSON.stringify(stop.confidence || "confirmed")},`);
  if (stop.notes) lines.push(`    notes: ${JSON.stringify(stop.notes)},`);
  lines.push(`    sourceType: ${JSON.stringify(stop.sourceType || "manual")},`);
  lines.push("  },");
  return `${lines.join("\n")}\n`;
}

function updateStop(id, patch) {
  const text = readLedger();
  const range = findStopRange(text, id);
  if (!range) {
    const err = new Error(`Stop not found: ${id}`);
    err.code = "NOT_FOUND";
    throw err;
  }
  const block = text.slice(range.start, range.end);
  const existing = {
    id,
    date: getField(block, "date"),
    title: getField(block, "title"),
    city: getField(block, "city"),
    counties: getField(block, "counties") || [],
    status: getField(block, "status"),
    includeOnPublicPage: getField(block, "includeOnPublicPage"),
    confidence: getField(block, "confidence"),
  };
  const normalized = normalizePatch(patch, existing);
  let updated = applyFieldUpdates(block, normalized);
  // Ensure trailing comma after block
  if (!updated.trimEnd().endsWith(",")) {
    updated = `${updated.replace(/\s*$/, "")},\n`;
  } else if (!updated.endsWith("\n")) {
    updated = `${updated}\n`;
  }

  const next = text.slice(0, range.start) + updated + text.slice(range.end);
  writeLedger(next);
  return { id, ...existing, ...normalized };
}

function addStop(input) {
  if (!input || !input.date || !input.title) {
    throw new Error("New stops require date and title");
  }
  const text = readLedger();
  const id =
    input.id ||
    `manual-${input.date}-${slugify(input.title)}-${Date.now().toString(36).slice(-4)}`;
  if (findStopRange(text, id)) {
    const err = new Error(`Stop id already exists: ${id}`);
    err.code = "CONFLICT";
    throw err;
  }

  const asOf = process.env.KELLY_VISITS_AS_OF?.trim() || new Date().toISOString().slice(0, 10);
  const counties = Array.isArray(input.counties)
    ? input.counties.map((c) => String(c).trim()).filter(Boolean)
    : [];
  let status = input.status;
  if (!status || !VALID_STATUSES.has(status)) {
    status = counties.length === 0 ? "needs-review" : input.date <= asOf ? "completed" : "scheduled";
  }

  const stop = {
    id,
    date: input.date,
    title: String(input.title).trim(),
    city: input.city ? String(input.city).trim() : undefined,
    counties,
    status,
    includeOnPublicPage: input.includeOnPublicPage !== false,
    confidence: input.confidence || (counties.length ? "confirmed" : "uncertain"),
    notes: input.notes || "Added via local arkansas-visits editor",
    sourceType: "manual",
  };

  const insertAt = text.lastIndexOf("\n];");
  if (insertAt < 0) throw new Error("Could not locate end of kellyCampaignStops array");

  let before = text.slice(0, insertAt).replace(/\s+$/, "");
  // Last array element may omit a trailing comma; required once we append another stop.
  if (!before.endsWith(",")) {
    if (!before.endsWith("}")) {
      throw new Error("Unexpected ledger ending before array close");
    }
    before = `${before},`;
  }

  const block = formatNewStop(stop);
  const next = `${before}\n${block}${text.slice(insertAt)}`;
  writeLedger(next);
  return stop;
}

function getStop(id) {
  const text = readLedger();
  const range = findStopRange(text, id);
  if (!range) return null;
  const block = text.slice(range.start, range.end);
  return {
    id,
    date: getField(block, "date"),
    endDate: getField(block, "endDate") || null,
    title: getField(block, "title"),
    publicTitle: getField(block, "publicTitle") || null,
    city: getField(block, "city") || null,
    counties: getField(block, "counties") || [],
    status: getField(block, "status"),
    includeOnPublicPage: getField(block, "includeOnPublicPage"),
    confidence: getField(block, "confidence"),
    notes: getField(block, "notes") || null,
    sourceType: getField(block, "sourceType") || null,
  };
}

module.exports = {
  ledgerPath,
  updateStop,
  addStop,
  getStop,
  findStopRange,
  readLedger,
};
