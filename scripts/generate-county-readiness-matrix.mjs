import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const csvPath = path.join(repoRoot, "../countyWorkbench/reports/dashboard-v2/dashboard-v2-county-coverage.csv");
const csv = fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/);
const hdr = csv[0].split(",");
const coverage = csv.slice(1).map((line) => {
  const cols = line.split(",");
  return Object.fromEntries(hdr.map((h, i) => [h, cols[i]]));
});
const covByShort = new Map(coverage.map((r) => [r.countySlug, r]));

const audit = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "data/audit/county-memory-readiness-table.json"), "utf8"),
);
const auditBySlug = new Map(audit.rows.map((r) => [r.countySlug, r]));

const khOverlay = new Set(["pulaski", "washington", "benton", "sebastian", "craighead"]);
const v2Slugs = new Set(["pope", "pulaski", "faulkner"]);
const nextBuild = new Set(["benton", "washington"]);

function shortFromRegistrySlug(slug) {
  return slug.replace(/-county$/, "");
}

const registrySrc = fs.readFileSync(
  path.join(repoRoot, "src/lib/county/arkansas-county-registry.ts"),
  "utf8",
);
const names = [...registrySrc.matchAll(/displayName: "([^"]+)"/g)].map((m) => m[1]);
function slugFromDisplayName(displayName) {
  const base = displayName
    .replace(/\s+County$/i, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-county`;
}
const slugs = names.map(slugFromDisplayName);

const lines = [
  "# County Workbench — 75 County Readiness Matrix",
  "",
  "**Generated:** 2026-05-31 (BURT audit pass)",
  "**Lane:** RedDirt/",
  "",
  "## Legend",
  "",
  "| Column | Meaning |",
  "|--------|---------|",
  "| Dashboard | v2 briefing shell, next-build queue, or command scaffold only |",
  "| Brief | NSI Kim Hammer overlay, public OIS placeholder, or none |",
  "| Registration goal source | **Canonical DB** = `CountyCampaignStats.registrationGoal`; **Proxy** = workbench adapter vote-share estimate mislabeled as reg goal |",
  "| Vote target | `kelly-win-target-scenario-v1.json` (all 75; reg_goal flagged missing) |",
  "| Data quality | countyWorkbench CSV completion % + memory audit confidence |",
  "| AI recommendation | Can county copilot produce actionable plan today? |",
  "| Events | Event workbench county cards wired (read-only) |",
  "| Field plan | Relational/Power of 5 progress wired to real counts? |",
  "| Public brief readiness | County public messaging brief tier (PUBLIC_BRIEF_READY / INTERNAL_MESSAGE_SOURCE_ONLY / FIELD_PLANNING_ONLY / SHELL_ONLY) |",
  "| Deployment | Safe to treat as production field truth? |",
  "",
  "## Canonical goal confirmation",
  "",
  "**`CountyCampaignStats.registrationGoal` is the locked canonical field** per `docs/county-registration-goals-verification.md` (GOALS-VERIFY-1). Admin write path: `/admin/counties/[slug]`.",
  "",
  "**Split-brain warning:** `county-workbench-adapter.ts` exposes `targetDemVotesStatewide50` as `registrationGoal` with `goalSource: planning-estimate`. Intelligence dashboards (`/admin/county-intelligence`, AI command center, event cards) read the **proxy**, not Prisma. **Do not overwrite goals in this audit.**",
  "",
  "## Matrix (all 75 counties)",
  "",
  "| County | Dashboard status | Brief status | Registration goal source | Vote target source | Data quality | AI recommendation readiness | Event/calendar readiness | Field plan readiness | Public brief readiness | Biggest blocker | Deployment status |",
  "|--------|------------------|--------------|--------------------------|-------------------|--------------|----------------------------|-------------------------|---------------------|------------------------|-----------------|-------------------|",
];

for (let i = 0; i < slugs.length; i++) {
  const slug = slugs[i];
  const name = names[i] || slug;
  const short = shortFromRegistrySlug(slug);
  const cov = covByShort.get(short) || {};
  const mem = auditBySlug.get(slug) || {};
  const pct = cov.completionPercent || "5";
  const depth = cov.workbenchDepth || "shell";
  const full = depth === "full";

  let dash = `Command scaffold (\`/counties/${slug}\`)`;
  if (v2Slugs.has(short)) dash = `Dashboard v2 live (\`/county-briefings/${short}/v2\`)`;
  else if (nextBuild.has(short)) dash = "Next-build queue (command + OIS placeholder)";

  let brief = "Public OIS placeholder only";
  if (khOverlay.has(short)) brief = "NSI Kim Hammer overlay + public OIS";
  else if (short === "pope") brief = "Pope v2 briefing + prototype dashboard";

  const regSrc = full
    ? "Sync path: reg goal null; vote proxy separate — enrich via CountyCampaignStats"
    : "Sync path: reg goal null; vote proxy only — NOT registration goal";
  const vote = "kelly-win-target-scenario-v1.json";
  const dq = full
    ? `${pct}% workbench (full profile); memory confidence ${mem.confidenceScore || 10}/100`
    : `${pct}% shell; memory MISSING (10/100)`;

  let ai = "Low — generic statewide rollup only";
  if (khOverlay.has(short)) ai = "Medium — NSI overlay narratives; citations incomplete";
  else if (full) ai = "Low-Medium — workbench KPI shell; proxy goals";
  if (v2Slugs.has(short)) {
    ai = ai.startsWith("Medium —")
      ? "Medium-High — NSI overlay narratives; citations incomplete"
      : "Medium-High — v2 dashboard + workbench KPI; proxy goals";
    if (short === "pope") ai = "Medium-High — gold prototype dashboard; proxy goals";
  }

  const events = "Read-only event county cards wired";
  const field = full
    ? "Proxy Power of 5 goal; relational counts schema-ready, not in adapter"
    : "Proxy goals only; no field memory";

  let blocker = "No full workbench profile; institutional memory empty";
  if (!full && khOverlay.has(short))
    blocker = "Overlay exists but local clerk/media sourcing incomplete";
  if (full && !v2Slugs.has(short))
    blocker = "Full profile but no v2 dashboard; proxy goal split-brain";
  if (v2Slugs.has(short)) {
    blocker =
      short === "pope"
        ? "Gold prototype — not yet replicated statewide"
        : "v2 live but registration goal backfill unverified";
  }

  let deploy = "Scaffold only — not field-truth";
  if (v2Slugs.has(short))
    deploy = "Internal/training deploy OK; do not treat goals as canonical without DB verify";
  if (khOverlay.has(short) && !v2Slugs.has(short))
    deploy = "Internal intel only — NEEDS_REVIEW overlays";

  let publicBriefReadiness = "SHELL_ONLY";
  if (depth === "shell" && Number(pct) <= 5) publicBriefReadiness = "SHELL_ONLY";
  else if (v2Slugs.has(short) || (depth === "full" && cov.hasCountyProfile === "true") || khOverlay.has(short))
    publicBriefReadiness = "INTERNAL_MESSAGE_SOURCE_ONLY";
  else if (depth === "full") publicBriefReadiness = "FIELD_PLANNING_ONLY";
  // PUBLIC_BRIEF_READY intentionally 0 — requires evidence + canonical goal + human approval

  lines.push(
    `| ${name} | ${dash} | ${brief} | ${regSrc} | ${vote} | ${dq} | ${ai} | ${events} | ${field} | ${publicBriefReadiness} | ${blocker} | ${deploy} |`,
  );
}

lines.push(
  "",
  "## Rollup counts",
  "",
  "| Metric | Count |",
  "|--------|-------|",
  "| Counties with Dashboard v2 | 3 (Pope, Pulaski, Faulkner) |",
  "| Counties queued next-build | 2 (Benton, Washington) |",
  "| Counties with full workbench profile | 6 |",
  "| Counties with Kim Hammer NSI overlay | 5 (+ statewide) |",
  "| Counties with institutional memory populated | 0 |",
  "| Counties safe as production field-truth | 0 |",
  "| Counties PUBLIC_BRIEF_READY | 0 (by design until evidence + human approval) |",
  "| Counties INTERNAL_MESSAGE_SOURCE_ONLY | 6 |",
  "| Counties SHELL_ONLY | ~69 |",
  "",
  "## Evidence files",
  "",
  "- Registry: `src/lib/county/arkansas-county-registry.ts`",
  "- Dashboard tiers: `src/lib/county/county-intelligence-catalog.ts`",
  "- Workbench bridge: `src/lib/agents/county-intelligence/county-workbench-adapter.ts`",
  "- Coverage CSV: `countyWorkbench/reports/dashboard-v2/dashboard-v2-county-coverage.csv`",
  "- Memory audit: `data/audit/county-memory-readiness-table.json`",
  "- KH overlays: `data/opposition/kim-hammer-profile/kim-hammer-geographic-narrative-overlays.json`",
  "",
);

const outPath = path.join(repoRoot, "docs/intelligence/COUNTY_WORKBENCH_75_COUNTY_READINESS_MATRIX.md");
fs.writeFileSync(outPath, lines.join("\n"));
console.log(`Wrote ${slugs.length} rows to ${outPath}`);
