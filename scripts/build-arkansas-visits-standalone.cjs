/**
 * Build a static standalone Kelly Across Arkansas site from the visit ledger.
 * Output: standalone/arkansas-visits/ (no Next / no Lambda — under 250 MB deploy).
 *
 * Usage: npm run visits:standalone
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "standalone", "arkansas-visits");
const dataDir = path.join(outDir, "data");
const tsxCli = path.join(root, "node_modules", "tsx", "dist", "cli.mjs");

function loadPublicPayload() {
  const code = `
import { ARKANSAS_COUNTIES } from "./src/data/kelly-county-visits/arkansas-counties.ts";
import {
  displayTitle,
  getCompletedPublicStops,
  getUpcomingPublicStops,
  getVisitSummary,
} from "./src/data/kelly-county-visits/selectors.ts";

function slim(stop) {
  return {
    id: stop.id,
    date: stop.date,
    endDate: stop.endDate || null,
    title: displayTitle(stop),
    city: stop.city || null,
    counties: stop.counties,
    status: stop.status,
  };
}

const summary = getVisitSummary();
const payload = {
  generatedAt: new Date().toISOString(),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://kgrappe.netlify.app",
  summary: {
    visitedCounties: summary.visitedCounties,
    totalCounties: summary.totalCounties,
    percentVisited: summary.percentVisited,
    completedStopCount: summary.completedStopCount,
    scheduledStopCount: summary.scheduledStopCount,
    needsReviewCount: summary.needsReviewCount,
    buckets: summary.buckets,
  },
  counties: [...ARKANSAS_COUNTIES],
  completed: getCompletedPublicStops().map(slim),
  upcoming: getUpcomingPublicStops().map(slim),
};
console.log(JSON.stringify(payload));
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

fs.mkdirSync(dataDir, { recursive: true });
const payload = loadPublicPayload();
const outFile = path.join(dataDir, "public-visits.json");
fs.writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(
  `>>> arkansas-visits standalone: ${payload.completed.length} completed, ${payload.upcoming.length} upcoming → ${path.relative(root, outFile)}`,
);
console.log(`>>> publish folder: ${path.relative(root, outDir)}`);
