/**
 * Phase 15 P0+P1 — Candidate command experience checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  buildCandidateCommandNavSections,
  candidateNavHasBuilderInfra,
  countCandidateCommandNavLinks,
} from "../src/lib/intelligence/v4/candidateCommandNav";
import { buildCandidateCommandHomeFeed } from "../src/lib/intelligence/v4/candidateCommandHome";
import {
  assertPhase15P0P1Bar,
  computePhase15P0P1Progress,
  CANDIDATE_COMMAND_HOME_HREF,
} from "../src/lib/intelligence/v4/phase15Closure";
import { assertPhase15P0Bar } from "../src/lib/intelligence/v4/phase15P0Closure";
import { assertPhase15P1Bar } from "../src/lib/intelligence/v4/phase15P1Closure";
import {
  isBuilderInfraHref,
  PHASE15_P0_MAX_CANDIDATE_LINKS,
  PHASE15_P0_MAX_LINKS_PER_SECTION,
  PHASE15_P0_MAX_SECTIONS,
} from "../src/lib/intelligence/v4/phase15CandidateCommandDepth";

const APP_ROOT = path.join(process.cwd(), "src/app/admin/(board)/intelligence");

function assertRouteExists(routePath: string) {
  const rel = routePath.replace(/^\/admin\/intelligence\/?/, "");
  const segments = rel.split("/").filter(Boolean);
  let dir = APP_ROOT;
  for (const seg of segments) {
    const dynamic = fs.readdirSync(dir, { withFileTypes: true }).find((d) => d.isDirectory() && d.name.startsWith("["));
    if (dynamic) {
      dir = path.join(dir, dynamic.name);
      continue;
    }
    dir = path.join(dir, seg);
  }
  assert.ok(fs.existsSync(path.join(dir, "page.tsx")), `Missing page: ${routePath}`);
}

function main() {
  const sections = buildCandidateCommandNavSections("CANDIDATE");
  const linkCount = countCandidateCommandNavLinks(sections);

  assert.ok(sections.length === PHASE15_P0_MAX_SECTIONS, `sections ${sections.length}`);
  assert.ok(linkCount <= PHASE15_P0_MAX_CANDIDATE_LINKS, `links ${linkCount}`);
  assert.ok(sections.every((s) => s.links.length <= PHASE15_P0_MAX_LINKS_PER_SECTION), "section cap");
  assert.ok(!candidateNavHasBuilderInfra(sections), "builder infra hidden");

  for (const sec of sections) {
    for (const link of sec.links) {
      assert.ok(!isBuilderInfraHref(link.href), `builder leak: ${link.href}`);
    }
  }

  const p0 = assertPhase15P0Bar();
  assert.ok(p0.ok, p0.message);

  const feed = buildCandidateCommandHomeFeed();
  assert.ok(feed.homeHref === CANDIDATE_COMMAND_HOME_HREF, "home href");
  assert.ok(feed.safeTonight.length >= 1, "safe lines");
  assert.ok(feed.blockedTonight.length >= 1, "blocked lines");
  assert.ok(feed.todayFocus.length >= 3, "today focus");
  assert.ok(feed.claimsSummary.total > 0, "claims wired");

  const p1 = assertPhase15P1Bar();
  assert.ok(p1.ok, p1.message);

  const progress = computePhase15P0P1Progress();
  assert.ok(progress.overallPct >= 90, `overall ${progress.overallPct}%`);

  const bar = assertPhase15P0P1Bar();
  assert.ok(bar.ok, bar.message);

  assertRouteExists(CANDIDATE_COMMAND_HOME_HREF);
  assertRouteExists("/admin/intelligence/phase-15-p0-p1-upgrade");

  console.log("test-phase15-p0-p1-candidate-command: OK");
  console.log(
    `  nav: ${sections.length} sections · ${linkCount} links · builder hidden · home ${feed.readinessPct}% · safe ${feed.safeTonight.length} · blocked ${feed.blockedTonight.length}`,
  );
}

main();
