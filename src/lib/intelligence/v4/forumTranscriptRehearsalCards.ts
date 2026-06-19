/**
 * Forum transcript → drill queue cards and rehearsal steps for tutor/SRE integration.
 */
import { EP_FORUM_TRANSCRIPT_LAB_HREF } from "@/lib/election-plan/debate-prep-links";
import type { DrillQueueCard } from "@/lib/intelligence/v4/phase16P3DrillQueueShared";
import type { RehearsalRunOfShowStep } from "@/lib/intelligence/v4/phase16P0SessionLauncher";
import { loadForumTranscriptIntel } from "@/lib/intelligence/v4/forumTranscriptIntel";

const FORUM_CLAIMS_GATE =
  "Claims-gated — verify Hammer/Pakko quotes and stats in claims ledger before stage.";

/** Build capitalize + moderator-question cards from ACCA forum analysis. */
export function buildForumDrillQueueCards(): DrillQueueCard[] {
  const intel = loadForumTranscriptIntel();
  if (!intel.ready) return [];

  const cards: DrillQueueCard[] = [];
  let order = 1;

  if (intel.mockModeratorBlock?.openingQuestion) {
    cards.push({
      cardId: "forum-mod-opening",
      order: order++,
      cardType: "forum-moderator-q",
      title: "ACCA forum · mock moderator opening",
      prompt: intel.mockModeratorBlock.openingQuestion,
      speakLine: intel.capitalizeMoves[0]?.kellyLine ?? null,
      claimsGate: FORUM_CLAIMS_GATE,
      stageSafeBlocked: false,
      href: EP_FORUM_TRANSCRIPT_LAB_HREF,
      kellyBeat: "Open with clerk-service frame — one verified line, one fresh add, stop.",
      durationMinutes: 6,
      durationLabel: "6 min",
    });
    for (const followUp of intel.mockModeratorBlock.followUps.slice(0, 2)) {
      cards.push({
        cardId: `forum-mod-fu-${order}`,
        order: order++,
        cardType: "forum-moderator-q",
        title: "ACCA forum · moderator follow-up",
        prompt: followUp,
        speakLine: null,
        claimsGate: FORUM_CLAIMS_GATE,
        stageSafeBlocked: false,
        href: EP_FORUM_TRANSCRIPT_LAB_HREF,
        kellyBeat: "Answer moderator only — do not debate Hammer mid-question.",
        durationMinutes: 5,
        durationLabel: "5 min",
      });
    }
  }

  for (const [i, move] of intel.capitalizeMoves.slice(0, 6).entries()) {
    cards.push({
      cardId: `forum-cap-${i}`,
      order: order++,
      cardType: "forum-capitalize",
      title: `Capitalize · ${move.trigger.slice(0, 56)}${move.trigger.length > 56 ? "…" : ""}`,
      prompt: move.trigger,
      speakLine: move.kellyLine,
      claimsGate: FORUM_CLAIMS_GATE,
      stageSafeBlocked: false,
      href: EP_FORUM_TRANSCRIPT_LAB_HREF,
      kellyBeat: move.why,
      durationMinutes: 5,
      durationLabel: "5 min",
    });
  }

  for (const [i, q] of intel.predictedQuestions.slice(0, 4).entries()) {
    if (cards.some((c) => c.prompt === q)) continue;
    cards.push({
      cardId: `forum-pred-q-${i}`,
      order: order++,
      cardType: "forum-moderator-q",
      title: `Predicted debate Q · ${q.slice(0, 48)}…`,
      prompt: q,
      speakLine: null,
      claimsGate: FORUM_CLAIMS_GATE,
      stageSafeBlocked: false,
      href: EP_FORUM_TRANSCRIPT_LAB_HREF,
      kellyBeat: "Three-way speak order — one line for moderator, one for voters, one for clerks.",
      durationMinutes: 5,
      durationLabel: "5 min",
    });
  }

  return cards.map((c, idx) => ({ ...c, order: idx + 1 }));
}

export function countForumDrillQueueCards(): number {
  return buildForumDrillQueueCards().length;
}

/** Prepend forum intel steps to ACCA / debate run-of-show when transcript analysis exists. */
export function enrichRunOfShowWithForumIntel(
  steps: RehearsalRunOfShowStep[],
  encounterId: "debate-prep" | "acca-panel",
): RehearsalRunOfShowStep[] {
  const intel = loadForumTranscriptIntel();
  if (!intel.ready) return steps;

  const forumSteps: RehearsalRunOfShowStep[] =
    encounterId === "acca-panel"
      ? [
          {
            stepId: "forum-capitalize-review",
            order: 0,
            title: "Forum capitalize moves — rehearse top 3",
            durationMinutes: 8,
            durationLabel: "8 min",
            href: EP_FORUM_TRANSCRIPT_LAB_HREF,
            kellyBeat: `Review ${intel.capitalizeMoves.length} ACCA-derived capitalize moves — say each Kelly line twice, claims-gate first.`,
            stageSafeRequired: true,
          },
          {
            stepId: "forum-moderator-block",
            order: 0,
            title: "Mock moderator block (forum deep analysis)",
            durationMinutes: 7,
            durationLabel: "7 min",
            href: EP_FORUM_TRANSCRIPT_LAB_HREF,
            kellyBeat: intel.mockModeratorBlock
              ? `Opening: "${intel.mockModeratorBlock.openingQuestion.slice(0, 80)}…" — timed 90s answers.`
              : "Run predicted debate beats from forum lab — timed 90s answers.",
            stageSafeRequired: true,
          },
        ]
      : [
          {
            stepId: "forum-intel-brief",
            order: 0,
            title: "Forum intel brief — Hammer/Pakko tells",
            durationMinutes: 5,
            durationLabel: "5 min",
            href: EP_FORUM_TRANSCRIPT_LAB_HREF,
            kellyBeat: intel.executiveBrief.slice(0, 200) || "Read forum executive brief before trap drills.",
            stageSafeRequired: false,
          },
          {
            stepId: "forum-capitalize-drill",
            order: 0,
            title: "Forum capitalize drill queue",
            durationMinutes: 10,
            durationLabel: "10 min",
            href: "/election-plan/debate-prep/rehearsal?queue=forum-acca-tonight",
            kellyBeat: "Run forum-acca-tonight queue — capitalize moves from Mountain View panel transcript.",
            stageSafeRequired: true,
          },
        ];

  const merged = [...forumSteps, ...steps].map((s, idx) => ({ ...s, order: idx + 1 }));
  return merged;
}

export function forumRehearsalTonightReminder(): string | null {
  const n = countForumDrillQueueCards();
  if (n === 0) return null;
  return `Forum intel live — run forum-acca-tonight queue (${n} cards) before standard tonight queue.`;
}
