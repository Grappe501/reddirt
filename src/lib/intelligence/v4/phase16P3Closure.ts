/**
 * Phase 16 P3 — Drill queue closure.
 */
import { buildCandidateCommandHomeFeed } from "@/lib/intelligence/v4/candidateCommandHome";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "@/lib/intelligence/v4/candidateCommandNav";
import {
  buildDrillQueueSummary,
  DRILL_QUEUE_HUB_HREF,
  DRILL_QUEUE_IDS,
  getDrillQueueCards,
  PHASE16_P3_QUEUE_TOTAL,
  PHASE16_P3_STANDARD_QUEUE_CARD_TOTAL,
} from "@/lib/intelligence/v4/phase16P3DrillQueue";
import {
  countDrillQueuesAtBar,
  countStandardQueueCardsAtBar,
  drillQueueCardMeetsPhase16P3Bar,
  drillQueueMeetsPhase16P3Bar,
  getDrillQueueCardOverlay,
  getDrillQueueOverlay,
} from "@/lib/intelligence/v4/phase16P3DrillQueueDepth";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";

export type Phase16P3Progress = {
  queueTotal: number;
  queuesAtBar: number;
  standardCardTotal: number;
  standardCardsAtBar: number;
  standardQueueCardCount: number;
  hubInCandidateNav: boolean;
  commandHomeWired: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
  overallPct: number;
};

export function computePhase16P3Progress(): Phase16P3Progress {
  const queueBar = countDrillQueuesAtBar();
  const cardBar = countStandardQueueCardsAtBar();
  const feed = buildCandidateCommandHomeFeed();
  const standardCards = getDrillQueueCards("standard-tonight");

  const candidateHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map((l) => l.href),
  );

  const hubInCandidateNav = candidateHrefs.has(DRILL_QUEUE_HUB_HREF);
  const commandHomeWired = Boolean(feed.drillQueue?.tonightReminder);
  const fieldBookReady = Boolean(getFieldBookArticle("drill-queue-command"));
  const canonReady = Boolean(resolveCanonBinding(DRILL_QUEUE_HUB_HREF));
  const migrationRouteBound = listStrategyMigrationRoutes().some(
    (r) => r.intelligenceHref === DRILL_QUEUE_HUB_HREF,
  );

  const queueScore =
    queueBar.atBar >= PHASE16_P3_QUEUE_TOTAL ? 100 : Math.round((queueBar.atBar / PHASE16_P3_QUEUE_TOTAL) * 100);
  const cardScore =
    cardBar.atBar >= cardBar.total ? 100 : Math.round((cardBar.atBar / Math.max(1, cardBar.total)) * 100);
  const countScore =
    standardCards.length >= PHASE16_P3_STANDARD_QUEUE_CARD_TOTAL ? 100 : 85;
  const wireChecks = [hubInCandidateNav, commandHomeWired, fieldBookReady, canonReady, migrationRouteBound];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((queueScore + cardScore + countScore + wireScore) / 4));

  return {
    queueTotal: queueBar.total,
    queuesAtBar: queueBar.atBar,
    standardCardTotal: cardBar.total,
    standardCardsAtBar: cardBar.atBar,
    standardQueueCardCount: standardCards.length,
    hubInCandidateNav,
    commandHomeWired,
    fieldBookReady,
    canonReady,
    migrationRouteBound,
    overallPct,
  };
}

export type Phase16P3UpgradePassReport = {
  passId: "phase-16-p3-drill-queue";
  title: "Step 16 P3 — Drill queue";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase16P3Progress;
};

export function computePhase16P3UpgradePass(): Phase16P3UpgradePassReport {
  const progress = computePhase16P3Progress();
  return {
    passId: "phase-16-p3-drill-queue",
    title: "Step 16 P3 — Drill queue",
    summary:
      "Sequential speak-order drill queue — SOS questions and trap lanes as one-card-at-a-time drills with stage-safe gates on every line.",
    completionPct: progress.overallPct,
    hubHref: DRILL_QUEUE_HUB_HREF,
    progress,
  };
}

export function assertPhase16P3Bar(): { ok: boolean; message: string } {
  const p = computePhase16P3Progress();
  const issues: string[] = [];
  if (p.queuesAtBar < PHASE16_P3_QUEUE_TOTAL) issues.push(`queues ${p.queuesAtBar}/${PHASE16_P3_QUEUE_TOTAL}`);
  if (p.standardCardsAtBar < p.standardCardTotal) {
    issues.push(`standard cards ${p.standardCardsAtBar}/${p.standardCardTotal}`);
  }
  if (p.standardQueueCardCount < PHASE16_P3_STANDARD_QUEUE_CARD_TOTAL) {
    issues.push(`standard count ${p.standardQueueCardCount}`);
  }
  if (!p.hubInCandidateNav) issues.push("candidate nav");
  if (!p.commandHomeWired) issues.push("command home");
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.migrationRouteBound) issues.push("migration");

  for (const queueId of DRILL_QUEUE_IDS) {
    const o = getDrillQueueOverlay(queueId);
    if (!o || !drillQueueMeetsPhase16P3Bar(o)) issues.push(`overlay ${queueId}`);
  }

  for (const card of getDrillQueueCards("standard-tonight")) {
    const o = getDrillQueueCardOverlay("standard-tonight", card.cardId);
    if (!o || !drillQueueCardMeetsPhase16P3Bar(o)) issues.push(`card ${card.cardId}`);
  }

  if (issues.length === 0) return { ok: true, message: "Phase 16 P3 bar met" };
  return { ok: false, message: issues.slice(0, 6).join("; ") };
}

export { DRILL_QUEUE_HUB_HREF };
