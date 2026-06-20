/**
 * Phase 16 P3 — Speak-order drill queue (SOS + trap lanes as sequential cards).
 * Server boundary: import drill queue builders from server routes only — client-safe symbols live in phase16P3DrillQueueShared.ts.
 */

import { evaluateStageSafeContent } from "@/lib/intelligence/v4/phase15StageSafeFilter";
import { buildForumDrillQueueCards, countForumDrillQueueCards, forumRehearsalTonightReminder } from "@/lib/intelligence/v4/forumTranscriptRehearsalCards";
import {
  buildWorldClassDressQueueCards,
  countWorldClassDressQueueCards,
} from "@/lib/intelligence/v4/debatePrepWorldClassDressCards";
import {
  DRILL_QUEUE_HUB_HREF,
  EP_DRILL_QUEUE_HUB_HREF,
  DRILL_QUEUE_IDS,
  resolveDrillQueueCardIndex,
  type DrillQueueCard,
  type DrillQueueCardType,
  type DrillQueueId,
  type DrillQueueSummary,
} from "@/lib/intelligence/v4/phase16P3DrillQueueShared";
import { getSosDebateQuestionDrillDown } from "@/lib/intelligence/v4/sosDebateQuestionBank";
import { getTrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { shouldSkipHumanActionQueueSyncOnRequest } from "@/lib/intelligence/intelligenceLaunchMode";

export {
  buildDrillQueueLaunchHref,
  drillQueueCardTypeLabel,
  DRILL_QUEUE_HUB_HREF,
  EP_DRILL_QUEUE_HUB_HREF,
  DRILL_QUEUE_IDS,
  resolveDrillQueueCardIndex,
  resolveDrillQueueIdClient,
  type DrillQueueCard,
  type DrillQueueCardType,
  type DrillQueueId,
  type DrillQueueSummary,
} from "@/lib/intelligence/v4/phase16P3DrillQueueShared";

export const PHASE16_P3_QUEUE_TOTAL = 5;
export const PHASE16_P3_STANDARD_QUEUE_CARD_TOTAL = 6;

export type DrillQueue = {
  queueId: DrillQueueId;
  title: string;
  description: string;
  kellyRule: string;
  launchHref: string;
  cardCount: number;
  estimatedMinutes: number;
};

type CardSpec =
  | { kind: "sos"; questionId: string; minutes: number }
  | { kind: "trap"; laneId: string; minutes: number };

const QUEUE_CARD_SPECS: Record<Exclude<DrillQueueId, "forum-acca-tonight" | "world-class-dress">, CardSpec[]> = {
  "standard-tonight": [
    { kind: "trap", laneId: "county-champion", minutes: 7 },
    { kind: "sos", questionId: "integrity-vs-access", minutes: 5 },
    { kind: "trap", laneId: "integrity-without-participation", minutes: 7 },
    { kind: "sos", questionId: "county-clerks-unfunded-mandates", minutes: 5 },
    { kind: "trap", laneId: "2021-vs-2025-pivot", minutes: 6 },
    { kind: "sos", questionId: "cvsgf-county-funding-ledger", minutes: 5 },
  ],
  "sos-speak-order": [
    { kind: "sos", questionId: "integrity-vs-access", minutes: 5 },
    { kind: "sos", questionId: "voter-turnout-registration", minutes: 5 },
    { kind: "sos", questionId: "county-clerks-unfunded-mandates", minutes: 6 },
    { kind: "sos", questionId: "acca-clerk-panel-partnership", minutes: 6 },
    { kind: "sos", questionId: "hammer-2021-package-burden", minutes: 6 },
  ],
  "trap-pivot": [
    { kind: "trap", laneId: "county-champion", minutes: 7 },
    { kind: "trap", laneId: "integrity-without-participation", minutes: 7 },
    { kind: "trap", laneId: "2021-vs-2025-pivot", minutes: 6 },
    { kind: "trap", laneId: "fraud-data-dare", minutes: 6 },
  ],
};

const QUEUE_META: Record<
  DrillQueueId,
  Omit<DrillQueue, "cardCount" | "estimatedMinutes">
> = {
  "standard-tonight": {
    queueId: "standard-tonight",
    title: "Standard tonight queue",
    description: "Alternating trap pivots and SOS speak-order cards — default rehearsal loop.",
    kellyRule: "Run cards in order — one line at a time, never browse the full SOS bank mid-drill.",
    launchHref: `${DRILL_QUEUE_HUB_HREF}?queue=standard-tonight`,
  },
  "sos-speak-order": {
    queueId: "sos-speak-order",
    title: "SOS speak-order queue",
    description: "Five moderator-style questions — position-1 opening lines with stage-safe gates.",
    kellyRule: "Speak-order drills only — rehearse opening beat, fresh addition, and closing beat per card.",
    launchHref: `${DRILL_QUEUE_HUB_HREF}?queue=sos-speak-order`,
  },
  "trap-pivot": {
    queueId: "trap-pivot",
    title: "Trap pivot queue",
    description: "Four trap lanes — opponent signal, setup timing, and pivot script per card.",
    kellyRule: "Trap lanes are chess — rehearse pivot when Hammer bites, one-sentence bridge if he does not.",
    launchHref: `${DRILL_QUEUE_HUB_HREF}?queue=trap-pivot`,
  },
  "forum-acca-tonight": {
    queueId: "forum-acca-tonight",
    title: "Forum ACCA tonight",
    description:
      "Capitalize moves, mock moderator block, and predicted questions from ACCA Mountain View transcript analysis.",
    kellyRule: "Forum-derived only — verify quotes in claims gate; do not invent new Hammer/Pakko lines.",
    launchHref: `${EP_DRILL_QUEUE_HUB_HREF}?queue=forum-acca-tonight`,
  },
  "world-class-dress": {
    queueId: "world-class-dress",
    title: "World-class dress rehearsal",
    description:
      "90-min full simulation — opening, smart trap lanes, SOS bank, forum capitalize, closing. Day 6 stress inoculation.",
    kellyRule: "Full dress only — staff plays Hammer and Pakko; log weak segments in debrief.",
    launchHref: `${EP_DRILL_QUEUE_HUB_HREF}?queue=world-class-dress`,
  },
};

function buildSosCard(spec: Extract<CardSpec, { kind: "sos" }>, order: number): DrillQueueCard | undefined {
  const drill = getSosDebateQuestionDrillDown(spec.questionId);
  if (!drill) return undefined;
  const speakDrill = drill.speakOrderDrills[0];
  const decision = evaluateStageSafeContent(drill.claimsGate, "candidate");
  const speakLine = decision.blocked ? null : speakDrill?.openingLine ?? drill.directAnswer30s;
  return {
    cardId: `sos-${spec.questionId}`,
    order,
    cardType: "sos-speak-order",
    title: drill.title,
    prompt: speakDrill?.strategy ?? drill.whyModeratorsAsk,
    speakLine,
    claimsGate: drill.claimsGate,
    stageSafeBlocked: decision.blocked,
    href: `/admin/intelligence/sos-debate-questions/${spec.questionId}`,
    kellyBeat: speakDrill
      ? `Position ${speakDrill.position}: ${speakDrill.closingBeat}`
      : drill.agreeButNeverOnlyAgree,
    durationMinutes: spec.minutes,
    durationLabel: `${spec.minutes} min`,
  };
}

function buildTrapCard(spec: Extract<CardSpec, { kind: "trap" }>, order: number): DrillQueueCard | undefined {
  const lane = getTrapLaneDrillDown(spec.laneId);
  if (!lane) return undefined;
  const decision = evaluateStageSafeContent(lane.claimsGate, "candidate");
  const pivotLine = lane.kellyPivotDeep || lane.rebuttalScripts[0]?.contrast || lane.summary;
  const speakLine = decision.blocked ? null : pivotLine;
  return {
    cardId: `trap-${spec.laneId}`,
    order,
    cardType: "trap-pivot",
    title: lane.title,
    prompt: lane.whatToExpectHammerToSay[0] ?? lane.summary,
    speakLine,
    claimsGate: lane.claimsGate,
    stageSafeBlocked: decision.blocked,
    href: `/admin/intelligence/trap-lanes/${spec.laneId}`,
    kellyBeat: lane.setupMoves[0] ?? "Rehearse setup question, then pivot — never end on agree alone.",
    durationMinutes: spec.minutes,
    durationLabel: `${spec.minutes} min`,
  };
}

function buildCard(spec: CardSpec, order: number): DrillQueueCard | undefined {
  return spec.kind === "sos" ? buildSosCard(spec, order) : buildTrapCard(spec, order);
}

export function getDrillQueueCards(queueId: DrillQueueId): DrillQueueCard[] {
  if (queueId === "forum-acca-tonight") {
    return buildForumDrillQueueCards();
  }
  if (queueId === "world-class-dress") {
    return buildWorldClassDressQueueCards();
  }
  const specs = QUEUE_CARD_SPECS[queueId] ?? [];
  return specs
    .map((spec, index) => buildCard(spec, index + 1))
    .filter((c): c is DrillQueueCard => Boolean(c));
}

export function getDrillQueue(queueId: DrillQueueId): DrillQueue | undefined {
  if (queueId === "forum-acca-tonight" && countForumDrillQueueCards() === 0) {
    return undefined;
  }
  if (queueId === "world-class-dress" && countWorldClassDressQueueCards() === 0) {
    return undefined;
  }
  const meta = QUEUE_META[queueId];
  if (!meta) return undefined;
  const cards = getDrillQueueCards(queueId);
  const estimatedMinutes = cards.reduce((s, c) => s + c.durationMinutes, 0);
  return { ...meta, cardCount: cards.length, estimatedMinutes };
}

export function listDrillQueues(): DrillQueue[] {
  return DRILL_QUEUE_IDS.map((id) => getDrillQueue(id)).filter((q): q is DrillQueue => Boolean(q));
}

export function resolveDrillQueueId(raw: string | undefined): DrillQueueId {
  if (raw && DRILL_QUEUE_IDS.includes(raw as DrillQueueId)) {
    const id = raw as DrillQueueId;
    if (id === "forum-acca-tonight" && countForumDrillQueueCards() === 0) {
      return countWorldClassDressQueueCards() > 0 ? "world-class-dress" : "standard-tonight";
    }
    if (id === "world-class-dress" && countWorldClassDressQueueCards() === 0) {
      return "standard-tonight";
    }
    return id;
  }
  if (countForumDrillQueueCards() > 0) return "forum-acca-tonight";
  if (countWorldClassDressQueueCards() > 0) return "world-class-dress";
  return "standard-tonight";
}

export function countDrillQueueStageSafeBlocked(cards: DrillQueueCard[]): number {
  return cards.filter((c) => c.stageSafeBlocked).length;
}

export function buildDrillQueueSummary(): DrillQueueSummary {
  const forumCardCount = countForumDrillQueueCards();
  const dressCardCount = countWorldClassDressQueueCards();
  const forumQueueAvailable = forumCardCount > 0;
  const dressQueueAvailable = dressCardCount > 0;
  const defaultQueueId: DrillQueueId = forumQueueAvailable
    ? "forum-acca-tonight"
    : dressQueueAvailable
      ? "world-class-dress"
      : "standard-tonight";
  const forumReminder = forumRehearsalTonightReminder();
  const queueCount =
    PHASE16_P3_QUEUE_TOTAL -
    (forumQueueAvailable ? 0 : 1) -
    (dressQueueAvailable ? 0 : 0);

  if (shouldSkipHumanActionQueueSyncOnRequest()) {
    const defaultCardCount =
      defaultQueueId === "forum-acca-tonight"
        ? forumCardCount
        : defaultQueueId === "world-class-dress"
          ? dressCardCount
          : PHASE16_P3_STANDARD_QUEUE_CARD_TOTAL;
    return {
      hubHref: EP_DRILL_QUEUE_HUB_HREF,
      queueCount: Math.max(3, queueCount),
      defaultQueueId,
      defaultCardCount,
      tonightReminder:
        forumReminder ??
        (dressQueueAvailable
          ? `World-class dress queue live — ${dressCardCount} cards for Day 6 full simulation.`
          : "Run the drill queue — one card at a time, SOS speak-order and trap pivots with stage-safe gates on every line."),
      forumQueueAvailable,
      forumCardCount,
      dressQueueAvailable,
      dressCardCount,
    };
  }

  const defaultQueue = getDrillQueue(defaultQueueId) ?? getDrillQueue("standard-tonight")!;
  return {
    hubHref: EP_DRILL_QUEUE_HUB_HREF,
    queueCount: Math.max(3, queueCount),
    defaultQueueId,
    defaultCardCount: defaultQueue.cardCount,
    tonightReminder:
      forumReminder ??
      (dressQueueAvailable
        ? `World-class dress queue live — ${dressCardCount} cards for Day 6 full simulation.`
        : "Run the drill queue — one card at a time, SOS speak-order and trap pivots with stage-safe gates on every line."),
    forumQueueAvailable,
    forumCardCount,
    dressQueueAvailable,
    dressCardCount,
  };
}
