/**
 * Phase 16 P3 — drill queue checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildCandidateCommandHomeFeed } from "../src/lib/intelligence/v4/candidateCommandHome";
import {
  assertPhase16P3Bar,
  computePhase16P3Progress,
  DRILL_QUEUE_HUB_HREF,
} from "../src/lib/intelligence/v4/phase16P3Closure";
import {
  countDrillQueuesAtBar,
  countStandardQueueCardsAtBar,
  drillQueueCardMeetsPhase16P3Bar,
  drillQueueMeetsPhase16P3Bar,
  getDrillQueueCardOverlay,
  getDrillQueueOverlay,
} from "../src/lib/intelligence/v4/phase16P3DrillQueueDepth";
import {
  buildDrillQueueSummary,
  DRILL_QUEUE_IDS,
  getDrillQueueCards,
  listDrillQueues,
  PHASE16_P3_QUEUE_TOTAL,
  PHASE16_P3_STANDARD_QUEUE_CARD_TOTAL,
} from "../src/lib/intelligence/v4/phase16P3DrillQueue";
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
  const queues = listDrillQueues();
  assert.ok(queues.length === PHASE16_P3_QUEUE_TOTAL, `queues ${queues.length}`);

  const queueBar = countDrillQueuesAtBar();
  assert.ok(queueBar.atBar === queueBar.total, `queue overlays ${queueBar.atBar}/${queueBar.total}`);

  for (const queueId of DRILL_QUEUE_IDS) {
    const overlay = getDrillQueueOverlay(queueId);
    assert.ok(overlay && drillQueueMeetsPhase16P3Bar(overlay), queueId);
    const cards = getDrillQueueCards(queueId);
    assert.ok(cards.length > 0, `${queueId} cards`);
    assert.ok(cards.every((c) => c.href.startsWith("/admin/intelligence")), `${queueId} hrefs`);
    assert.ok(cards.every((c) => c.claimsGate.length > 0), `${queueId} claims gates`);
  }

  const standardCards = getDrillQueueCards("standard-tonight");
  assert.ok(standardCards.length === PHASE16_P3_STANDARD_QUEUE_CARD_TOTAL, `standard ${standardCards.length}`);

  const cardBar = countStandardQueueCardsAtBar();
  assert.ok(cardBar.atBar === cardBar.total, `standard cards ${cardBar.atBar}/${cardBar.total}`);

  for (const card of standardCards) {
    const overlay = getDrillQueueCardOverlay("standard-tonight", card.cardId);
    assert.ok(overlay && drillQueueCardMeetsPhase16P3Bar(overlay), card.cardId);
    if (card.stageSafeBlocked) {
      assert.ok(card.speakLine === null, `${card.cardId} blocked speak line`);
    } else {
      assert.ok(card.speakLine && card.speakLine.length > 0, `${card.cardId} speak line`);
    }
  }

  const mixedTypes = new Set(standardCards.map((c) => c.cardType));
  assert.ok(mixedTypes.has("sos-speak-order") && mixedTypes.has("trap-pivot"), "mixed card types");

  const summary = buildDrillQueueSummary();
  assert.ok(summary.tonightReminder.length > 0, "tonight reminder");
  assert.ok(summary.hubHref === DRILL_QUEUE_HUB_HREF, "hub href");

  const feed = buildCandidateCommandHomeFeed();
  assert.ok(feed.drillQueue?.tonightReminder, "home strip");
  assert.ok(feed.drillQueue.hubHref === DRILL_QUEUE_HUB_HREF, "home hub href");

  const candidateHrefs = flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map(
    (l) => l.href,
  );
  assert.ok(candidateHrefs.includes(DRILL_QUEUE_HUB_HREF), "rehearse nav hub");
  assert.ok(!candidateHrefs.includes("/admin/intelligence/sos-debate-questions"), "SOS bank via drill cards");
  assert.ok(candidateHrefs.length <= PHASE15_P0_MAX_CANDIDATE_LINKS, `nav ${candidateHrefs.length}`);

  const progress = computePhase16P3Progress();
  assert.ok(progress.hubInCandidateNav, "nav");
  assert.ok(progress.commandHomeWired, "command home");
  assert.ok(progress.fieldBookReady, "field book");
  assert.ok(progress.canonReady, "canon");
  assert.ok(progress.migrationRouteBound, "migration");

  const exitBar = assertPhase16P3Bar();
  assert.ok(exitBar.ok, exitBar.message);

  assert.ok(getFieldBookArticle("drill-queue-command"), "field book");
  assert.ok(resolveCanonBinding(DRILL_QUEUE_HUB_HREF), "canon");

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === DRILL_QUEUE_HUB_HREF),
    "migration hub",
  );

  assertRouteExists(DRILL_QUEUE_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-16-p3-upgrade");

  console.log("test-phase16-p3-drill-queue: OK");
  console.log(
    `  queues: ${progress.queuesAtBar}/${progress.queueTotal} · standard: ${progress.standardCardsAtBar}/${progress.standardCardTotal} cards · nav: ${candidateHrefs.length} links · overall: ${progress.overallPct}%`,
  );
}

main();
