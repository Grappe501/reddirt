/**
 * Phase 16 P8 — live event mode checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildCandidateCommandHomeFeed } from "../src/lib/intelligence/v4/candidateCommandHome";
import {
  assertPhase16P8Bar,
  computePhase16P8Progress,
  LIVE_EVENT_HUB_HREF,
} from "../src/lib/intelligence/v4/phase16P8Closure";
import {
  LIVE_EVENT_FIELD_IDS,
  countLiveEventFieldsAtBar,
  liveEventFieldMeetsPhase16P8Bar,
  getLiveEventFieldOverlay,
} from "../src/lib/intelligence/v4/phase16P8LiveEventDepth";
import {
  ACCA_PANEL_EVENT_ID,
  buildLiveEventDayOfPlan,
  buildLiveEventSummary,
  computeAccaPanelCountdown,
  filterStageSafeRunOfShowSteps,
  isLiveEventModeActive,
  PHASE16_P8_LIVE_FIELD_TOTAL,
  selectShortestSafeRunOfShowSteps,
} from "../src/lib/intelligence/v4/phase16P8LiveEventMode";
import { getDefaultRunOfShowSteps } from "../src/lib/intelligence/v4/phase16P0SessionLauncher";
import { getRunOfShowStepsForPreset } from "../src/lib/intelligence/v4/phase16P1RunOfShow";
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
  const prevEnv = process.env.NEXT_PUBLIC_SRE_LIVE_EVENT;
  const prevAudience = process.env.NEXT_PUBLIC_DEBATE_PRIMARY_AUDIENCE;
  process.env.NEXT_PUBLIC_SRE_LIVE_EVENT = ACCA_PANEL_EVENT_ID;
  process.env.NEXT_PUBLIC_DEBATE_PRIMARY_AUDIENCE = "general_debate";

  try {
    assert.ok(PHASE16_P8_LIVE_FIELD_TOTAL === 5, "field total");
    assert.ok(isLiveEventModeActive(), "live mode with env");

    const countdown = computeAccaPanelCountdown(new Date("2026-06-10T12:00:00-05:00"));
    assert.ok(countdown.daysRemaining >= 1, "countdown days");
    assert.ok(!countdown.isPast, "not past");

    const dayOfCountdown = computeAccaPanelCountdown(new Date("2026-06-11T08:00:00-05:00"));
    assert.ok(dayOfCountdown.isDayOf, "day-of detect");

    const safeSteps = selectShortestSafeRunOfShowSteps([
      getDefaultRunOfShowSteps("acca-panel"),
      getRunOfShowStepsForPreset("quick-15"),
    ]);
    assert.ok(safeSteps.length > 0, "shortest safe path");
    assert.ok(
      filterStageSafeRunOfShowSteps(safeSteps).length === safeSteps.length,
      "all steps stage-safe",
    );

    const plan = buildLiveEventDayOfPlan();
    assert.ok(plan.stageSafeOnly, "day-of plan safe");
    assert.ok(plan.stepCount > 0, "day-of steps");

    const dayOfPlan = buildLiveEventDayOfPlan(new Date("2026-06-11T08:00:00-05:00"));
    assert.ok(dayOfPlan.totalMinutes <= 20, "compressed day-of");
    assert.ok(dayOfPlan.stepCount === 2, "day-of step count");

    const fieldBar = countLiveEventFieldsAtBar();
    assert.ok(fieldBar.atBar === fieldBar.total, `fields ${fieldBar.atBar}/${fieldBar.total}`);

    for (const fieldId of LIVE_EVENT_FIELD_IDS) {
      const overlay = getLiveEventFieldOverlay(fieldId);
      assert.ok(overlay && liveEventFieldMeetsPhase16P8Bar(overlay), fieldId);
    }

    const summary = buildLiveEventSummary();
    assert.ok(summary.tonightReminder.length > 0, "tonight reminder");
    assert.ok(summary.hubHref === LIVE_EVENT_HUB_HREF, "hub href");
    assert.ok(summary.modeActive, "summary active");

    const feed = buildCandidateCommandHomeFeed();
    assert.ok(feed.liveEvent?.tonightReminder, "home strip");

    const candidateHrefs = flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map(
      (l) => l.href,
    );
    assert.ok(candidateHrefs.includes(LIVE_EVENT_HUB_HREF), "home nav hub");
    assert.ok(!candidateHrefs.includes("/admin/intelligence/cce-closure"), "cce via command home");
    assert.ok(candidateHrefs.length <= PHASE15_P0_MAX_CANDIDATE_LINKS, `nav ${candidateHrefs.length}`);

    const progress = computePhase16P8Progress();
    assert.ok(progress.hubInCandidateNav, "nav");
    assert.ok(progress.commandHomeWired, "command home");
    assert.ok(progress.fieldBookReady, "field book");
    assert.ok(progress.canonReady, "canon");
    assert.ok(progress.migrationRouteBound, "migration");
    assert.ok(progress.dayOfPlanSafe, "day-of plan");

    const exitBar = assertPhase16P8Bar();
    assert.ok(exitBar.ok, exitBar.message);

    assert.ok(getFieldBookArticle("live-event-command"), "field book");
    assert.ok(resolveCanonBinding(LIVE_EVENT_HUB_HREF), "canon");

    const bridge = validateStrategyMigrationBridge();
    assert.ok(bridge.ok, bridge.errors.join("; "));

    assert.ok(
      listStrategyMigrationRoutes().some((r) => r.intelligenceHref === LIVE_EVENT_HUB_HREF),
      "migration hub",
    );

    assertRouteExists(LIVE_EVENT_HUB_HREF);
    assertRouteExists("/admin/intelligence/phase-16-p8-upgrade");

    console.log("test-phase16-p8-live-event: OK");
    console.log(
      `  fields: ${progress.fieldsAtBar}/${progress.fieldTotal} · day-of: ${plan.totalMinutes}min safe · nav: ${candidateHrefs.length} links · overall: ${progress.overallPct}%`,
    );
  } finally {
    if (prevEnv === undefined) delete process.env.NEXT_PUBLIC_SRE_LIVE_EVENT;
    else process.env.NEXT_PUBLIC_SRE_LIVE_EVENT = prevEnv;
    if (prevAudience === undefined) delete process.env.NEXT_PUBLIC_DEBATE_PRIMARY_AUDIENCE;
    else process.env.NEXT_PUBLIC_DEBATE_PRIMARY_AUDIENCE = prevAudience;
  }
}

main();
