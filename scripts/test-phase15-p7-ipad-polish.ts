/**
 * Phase 15 P7 — iPad polish checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildCandidateCommandHomeFeed } from "../src/lib/intelligence/v4/candidateCommandHome";
import {
  assertPhase15P7Bar,
  computePhase15P7Progress,
  IPAD_POLISH_HUB_HREF,
} from "../src/lib/intelligence/v4/phase15P7Closure";
import {
  countIpadSectionsAtBar,
  getIpadSectionPolishOverlay,
  ipadSectionMeetsPhase15P7Bar,
} from "../src/lib/intelligence/v4/phase15P7IpadPolishDepth";
import {
  buildIpadPolishSummary,
  listIpadBottomNavTabs,
  listIpadCceSections,
  PHASE15_P7_IPAD_SECTION_TOTAL,
  resolveIpadActiveSectionId,
} from "../src/lib/intelligence/v4/phase15P7IpadPolish";
import { CANDIDATE_IPAD_DEPLOY_HINT, CANDIDATE_IPAD_PRIMARY_NAV, CANDIDATE_IPAD_PROFILE } from "../src/lib/intelligence/candidateIpadMode";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "../src/lib/intelligence/v4/candidateCommandNav";
import { PHASE15_P0_MAX_CANDIDATE_LINKS } from "../src/lib/intelligence/v4/phase15CandidateCommandDepth";
import { getFieldBookArticle } from "../src/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "../src/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes, validateStrategyMigrationBridge } from "../src/lib/intelligence/v4/strategyMigrationBridge";

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
  const tabs = listIpadBottomNavTabs("CANDIDATE");
  assert.ok(tabs.length === PHASE15_P7_IPAD_SECTION_TOTAL, `tabs ${tabs.length}`);
  assert.ok(CANDIDATE_IPAD_PRIMARY_NAV.length === PHASE15_P7_IPAD_SECTION_TOTAL, "primary nav aligned");

  const sections = listIpadCceSections("CANDIDATE");
  assert.ok(sections.length === PHASE15_P7_IPAD_SECTION_TOTAL, `sections ${sections.length}`);

  const bar = countIpadSectionsAtBar();
  assert.ok(bar.atBar === bar.total, `overlays ${bar.atBar}/${bar.total}`);

  for (const tab of tabs) {
    const overlay = getIpadSectionPolishOverlay(tab.sectionId);
    assert.ok(overlay && ipadSectionMeetsPhase15P7Bar(overlay), tab.sectionId);
    assert.ok(tab.linkCount >= 3, `${tab.sectionId} links`);
  }

  assert.equal(CANDIDATE_IPAD_PROFILE.maxContentWidthPx, 820);
  assert.ok(CANDIDATE_IPAD_DEPLOY_HINT.includes("NEXT_PUBLIC_CANDIDATE_IPAD_MODE"));

  assert.equal(resolveIpadActiveSectionId("/admin/intelligence/drill-queue"), "rehearse");
  assert.equal(resolveIpadActiveSectionId("/admin/intelligence/stage-safe-filter"), "safety");

  const summary = buildIpadPolishSummary();
  assert.ok(summary.tonightReminder.length > 0, "tonight reminder");
  assert.ok(summary.hubHref === IPAD_POLISH_HUB_HREF, "hub href");

  const feed = buildCandidateCommandHomeFeed();
  assert.ok(feed.ipadPolish?.tonightReminder, "home strip");
  assert.ok(feed.ipadPolish.hubHref === IPAD_POLISH_HUB_HREF, "home hub href");

  const progress = computePhase15P7Progress();
  assert.ok(progress.hubInCandidateNav, "nav");
  assert.ok(progress.commandHomeWired, "command home");
  assert.ok(progress.shellUsesFiveSections, "five tabs");
  assert.ok(progress.fieldBookReady, "field book");
  assert.ok(progress.canonReady, "canon");
  assert.ok(progress.migrationRouteBound, "migration");

  const navLinks = flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).length;
  assert.ok(navLinks <= PHASE15_P0_MAX_CANDIDATE_LINKS, `nav ${navLinks}`);

  const exitBar = assertPhase15P7Bar();
  assert.ok(exitBar.ok, exitBar.message);

  assert.ok(getFieldBookArticle("ipad-polish-command"), "field book");
  assert.ok(resolveCanonBinding(IPAD_POLISH_HUB_HREF), "canon");

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === IPAD_POLISH_HUB_HREF),
    "migration hub",
  );

  assertRouteExists(IPAD_POLISH_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-15-p7-upgrade");

  console.log("test-phase15-p7-ipad-polish: OK");
  console.log(
    `  sections: ${progress.sectionsAtBar}/${progress.sectionTotal} · tabs: ${progress.bottomNavTabs} · nav: ${navLinks} links · overall: ${progress.overallPct}%`,
  );
}

main();
