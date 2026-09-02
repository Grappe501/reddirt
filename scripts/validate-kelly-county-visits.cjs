/**
 * Data integrity checks for Kelly Across Arkansas visit ledger.
 * Loads data via tsx -e (reliable on Windows).
 */
const { spawnSync } = require("child_process");
const path = require("path");

const TODAY = process.env.KELLY_VISITS_AS_OF?.trim() || new Date().toISOString().slice(0, 10);
const WINDOW_START = "2025-11-01";
const WINDOW_END = "2026-11-03";
const root = path.resolve(__dirname, "..");
const tsxCli = path.join(root, "node_modules", "tsx", "dist", "cli.mjs");

function loadViaTsx(mode) {
  const code =
    mode === "review"
      ? `
import { kellyCampaignStops } from "./src/data/kelly-county-visits/kelly-county-visits.ts";
import { getVisitSummary, getPublicStops, getCompletedPublicStops, getUpcomingPublicStops } from "./src/data/kelly-county-visits/selectors.ts";
const summary = getVisitSummary();
const pub = getPublicStops();
const unresolved = pub.filter((s) => s.status === "needs-review" || s.counties.length === 0);
const excl = kellyCampaignStops.filter((s) => !s.includeOnPublicPage);
const by = {};
for (const s of excl) by[s.status] = (by[s.status] || 0) + 1;
console.log(JSON.stringify({ summary, completed: getCompletedPublicStops().length, scheduled: getUpcomingPublicStops().length, unresolved, excludedByStatus: by, total: kellyCampaignStops.length, public: pub.length }));
`
      : `
import { kellyCampaignStops } from "./src/data/kelly-county-visits/kelly-county-visits.ts";
import { ARKANSAS_COUNTIES } from "./src/data/kelly-county-visits/arkansas-counties.ts";
console.log(JSON.stringify({ stops: kellyCampaignStops, counties: ARKANSAS_COUNTIES }));
`;
  const r = spawnSync(process.execPath, [tsxCli, "-e", code], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      TEMP: "H:\\SOSWebsite\\.local-ops\\tmp",
      TMP: "H:\\SOSWebsite\\.local-ops\\tmp",
    },
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    process.exit(1);
  }
  const line = (r.stdout || "").trim().split("\n").filter(Boolean).pop();
  return JSON.parse(line);
}

if (process.argv.includes("--review-json")) {
  console.log(JSON.stringify(loadViaTsx("review")));
  process.exit(0);
}

const { stops, counties } = loadViaTsx("validate");
const countySet = new Set(counties);
const errors = [];
const ids = new Set();
const publicKeys = new Map();
const PUBLIC_BAD = new Set(["virtual", "private", "declined", "canceled", "duplicate"]);
const SENSITIVE =
  /(https?:\/\/|zoom\.us|password|passwd|@gmail\.|@yahoo\.|\b\d{3}[-.]?\d{3}[-.]?\d{4}\b)/i;

function normTitle(t) {
  return String(t || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

for (const s of stops) {
  if (!s.id || typeof s.id !== "string") errors.push(`Missing id`);
  else if (ids.has(s.id)) errors.push(`Duplicate id: ${s.id}`);
  else ids.add(s.id);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.date || "")) errors.push(`${s.id}: invalid date ${s.date}`);
  if (s.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(s.endDate))
    errors.push(`${s.id}: invalid endDate ${s.endDate}`);

  if (!Array.isArray(s.counties)) errors.push(`${s.id}: counties must be an array`);
  else for (const c of s.counties) if (!countySet.has(c)) errors.push(`${s.id}: unknown county "${c}"`);

  if (s.includeOnPublicPage) {
    if (PUBLIC_BAD.has(s.status))
      errors.push(`${s.id}: public record has non-public status "${s.status}"`);
    if (s.date < WINDOW_START || s.date > WINDOW_END)
      errors.push(`${s.id}: public date ${s.date} outside window`);
    if (s.status === "completed" && s.date > TODAY)
      errors.push(`${s.id}: completed date ${s.date} is after today (${TODAY})`);
    if (s.status === "scheduled" && s.date < TODAY)
      errors.push(`${s.id}: scheduled date ${s.date} is before today (${TODAY})`);
    const blob = `${s.title || ""} ${s.publicTitle || ""} ${s.city || ""}`;
    if (SENSITIVE.test(blob)) errors.push(`${s.id}: sensitive pattern in public fields`);
    const key = `${s.date}|${normTitle(s.publicTitle || s.title)}`;
    if (publicKeys.has(key) && !String(s.notes || "").includes("allow-duplicate-public"))
      errors.push(`${s.id}: duplicate public date+title with ${publicKeys.get(key)}`);
    else publicKeys.set(key, s.id);
  }
}

if (errors.length) {
  console.error(`visits:validate FAILED (${errors.length} issue(s))`);
  for (const e of errors.slice(0, 80)) console.error(" -", e);
  if (errors.length > 80) console.error(` … and ${errors.length - 80} more`);
  process.exit(1);
}

const { openItems, loadQueue } = require("./pending-visit-attachments.cjs");
const pendingOpen = openItems(loadQueue());

const pub = stops.filter((s) => s.includeOnPublicPage);
console.log(
  JSON.stringify(
    {
      ok: true,
      today: TODAY,
      total: stops.length,
      public: pub.length,
      completed: pub.filter((s) => s.status === "completed").length,
      scheduled: pub.filter((s) => s.status === "scheduled").length,
      needsReview: pub.filter((s) => s.status === "needs-review" || s.counties.length === 0).length,
      openAttachments: pendingOpen.map((item) => item.id),
    },
    null,
    2,
  ),
);
