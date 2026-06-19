/**
 * v8 — World-class full dress rehearsal drill queue (90-min simulation).
 */
import "server-only";

import { EP_DEBATE_PREP_WAR_ROOM_HREF } from "@/lib/election-plan/debate-prep-links";
import { pickSmartTrapLane } from "@/lib/election-plan/debatePrepSmartTrapLane";
import type { DrillQueueCard } from "@/lib/intelligence/v4/phase16P3DrillQueueShared";
import { buildForumDrillQueueCards } from "@/lib/intelligence/v4/forumTranscriptRehearsalCards";
import { loadForumTranscriptIntel } from "@/lib/intelligence/v4/forumTranscriptIntel";
import { evaluateStageSafeContent } from "@/lib/intelligence/v4/phase15StageSafeFilter";
import { getSosDebateQuestionDrillDown } from "@/lib/intelligence/v4/sosDebateQuestionBank";
import { getTrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDowns";

const DRESS_SOS_IDS = [
  "integrity-vs-access",
  "county-clerks-unfunded-mandates",
  "voter-turnout-registration",
  "acca-clerk-panel-partnership",
  "hammer-2021-package-burden",
] as const;

const DRESS_TRAP_IDS = ["county-champion", "integrity-without-participation", "2021-vs-2025-pivot"] as const;

function buildTrapDressCard(laneId: string, order: number, minutes: number): DrillQueueCard | undefined {
  const lane = getTrapLaneDrillDown(laneId);
  if (!lane) return undefined;
  const decision = evaluateStageSafeContent(lane.claimsGate, "candidate");
  const pivotLine = lane.kellyPivotDeep || lane.rebuttalScripts[0]?.contrast || lane.summary;
  return {
    cardId: `dress-trap-${laneId}`,
    order,
    cardType: "trap-pivot",
    title: `Dress · ${lane.title}`,
    prompt: lane.whatToExpectHammerToSay[0] ?? lane.summary,
    speakLine: decision.blocked ? null : pivotLine,
    claimsGate: lane.claimsGate,
    stageSafeBlocked: decision.blocked,
    href: `/election-plan/debate-prep/trap-lanes/${laneId}`,
    kellyBeat: "Full dress — timed pivot, stop talking after bridge.",
    durationMinutes: minutes,
    durationLabel: `${minutes} min`,
  };
}

function buildSosDressCard(questionId: string, order: number, minutes: number): DrillQueueCard | undefined {
  const drill = getSosDebateQuestionDrillDown(questionId);
  if (!drill) return undefined;
  const speakDrill = drill.speakOrderDrills[0];
  const decision = evaluateStageSafeContent(drill.claimsGate, "candidate");
  const speakLine = decision.blocked ? null : speakDrill?.openingLine ?? drill.directAnswer30s;
  return {
    cardId: `dress-sos-${questionId}`,
    order,
    cardType: "sos-speak-order",
    title: `Dress · ${drill.title}`,
    prompt: speakDrill?.strategy ?? drill.whyModeratorsAsk,
    speakLine,
    claimsGate: drill.claimsGate,
    stageSafeBlocked: decision.blocked,
    href: `/election-plan/debate-prep/rehearsal?queue=sos-speak-order`,
    kellyBeat: speakDrill ? `Position ${speakDrill.position}: ${speakDrill.closingBeat}` : drill.agreeButNeverOnlyAgree,
    durationMinutes: minutes,
    durationLabel: `${minutes} min`,
  };
}

/** Full 90-min dress rehearsal — opening, traps, SOS bank, forum beats, closing. */
export function buildWorldClassDressQueueCards(): DrillQueueCard[] {
  const intel = loadForumTranscriptIntel();
  const smartTrap = pickSmartTrapLane(intel);
  const trapIds = [smartTrap, ...DRESS_TRAP_IDS.filter((id) => id !== smartTrap)].slice(0, 3);

  const cards: DrillQueueCard[] = [];
  let order = 1;

  cards.push({
    cardId: "dress-opening",
    order: order++,
    cardType: "sos-speak-order",
    title: "Dress · opening unity spine",
    prompt: "Moderator: Opening statements — sixty seconds each.",
    speakLine:
      "I'm Kelly Grappe. I'm running to run the office — a service desk for seventy-five counties that educates and unites.",
    claimsGate: "Master frame — verify with staff before broadcast.",
    stageSafeBlocked: false,
    href: EP_DEBATE_PREP_WAR_ROOM_HREF,
    kellyBeat: "Memorized opening — one breath pause before county line. Do not speed up if Hammer interrupts.",
    durationMinutes: 6,
    durationLabel: "6 min",
  });

  for (const laneId of trapIds) {
    const card = buildTrapDressCard(laneId, order++, 8);
    if (card) cards.push(card);
  }

  for (const qId of DRESS_SOS_IDS) {
    const card = buildSosDressCard(qId, order++, 6);
    if (card) cards.push(card);
  }

  if (intel.ready) {
    for (const [i, move] of intel.capitalizeMoves.slice(0, 3).entries()) {
      cards.push({
        cardId: `dress-forum-${i}`,
        order: order++,
        cardType: "forum-capitalize",
        title: `Dress · capitalize · ${move.trigger.slice(0, 48)}…`,
        prompt: move.trigger,
        speakLine: move.kellyLine,
        claimsGate: "Forum-derived — claims gate before stage.",
        stageSafeBlocked: false,
        href: "/election-plan/debate-prep/forum-lab",
        kellyBeat: move.why,
        durationMinutes: 5,
        durationLabel: "5 min",
      });
    }
  }

  cards.push({
    cardId: "dress-closing",
    order: order++,
    cardType: "sos-speak-order",
    title: "Dress · closing quotable",
    prompt: "Moderator: Final thoughts — thirty seconds.",
    speakLine:
      "Compare records, compare readiness, compare who will show up for clerks. That is Kelly Grappe.",
    claimsGate: "Closing frame — staff verify before stage.",
    stageSafeBlocked: false,
    href: EP_DEBATE_PREP_WAR_ROOM_HREF,
    kellyBeat: "One quotable line. Half-beat pause. Smile only on unity bridge.",
    durationMinutes: 5,
    durationLabel: "5 min",
  });

  const forumCards = intel.ready ? buildForumDrillQueueCards().slice(0, 2) : [];
  const merged = [...cards, ...forumCards.map((c) => ({ ...c, cardId: `dress-${c.cardId}` }))];

  return merged.map((c, idx) => ({ ...c, order: idx + 1 }));
}

export function countWorldClassDressQueueCards(): number {
  const intel = loadForumTranscriptIntel();
  let count = 10;
  if (intel.ready) {
    count += Math.min(3, intel.capitalizeMoves.length);
    count += Math.min(2, intel.capitalizeMoves.length > 0 ? 2 : 0);
  }
  return count;
}
