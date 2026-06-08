/**
 * AI Debate Prep Tutor orchestrator — session builder, Socratic coach turns, practice critique.
 */
import { getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";
import {
  DEBATE_PREP_TUTOR_COACH_PROMPT,
  DEBATE_PREP_TUTOR_CRITIQUE_PROMPT,
} from "@/lib/openai/prompts";
import { evaluateStageSafeContent } from "@/lib/intelligence/v4/phase15StageSafeFilter";
import {
  getDrillQueueCards,
  type DrillQueueCard,
  type DrillQueueId,
} from "@/lib/intelligence/v4/phase16P3DrillQueue";
import {
  CHECK_MY_RECORD_PLAYBOOK,
  CHECK_MY_RECORD_REHEARSAL_SCRIPT,
} from "@/lib/intelligence/v4/kellyOffensiveNarrativeControl";
import { PACKO_IN_DEBATE_PREP, THREE_WAY_DEBATE_STRATEGY } from "@/lib/intelligence/v4/kellyDebateCoaching";
import {
  getTutorModeConfig,
  getTutorSequenceSteps,
  POLITICAL_DEBATE_COACH_FRAMEWORK,
  type DebatePrepTutorMode,
  type TutorModeConfig,
} from "@/lib/intelligence/v4/debatePrepTutorPackage";

export type TutorCoachTurn = {
  turnIndex: number;
  coachMessage: string;
  socraticQuestion: string | null;
  focusPrinciple: string;
  doThisNext: string;
  timeBoxSeconds: number | null;
};

export type TutorCardSession = {
  card: DrillQueueCard;
  coachTurns: TutorCoachTurn[];
  safeLine: string | null;
  doNotSay: string[];
  politicalTips: string[];
  href: string;
};

export type TutorSession = {
  mode: DebatePrepTutorMode;
  config: TutorModeConfig;
  openingCoachMessage: string;
  panicReminder: string | null;
  cards: TutorCardSession[];
  sequenceSteps: { toolId: string; label: string; why: string }[];
  frameworkPrinciples: typeof POLITICAL_DEBATE_COACH_FRAMEWORK.principles;
  estimatedMinutes: number;
  checkMyRecordBeats?: typeof CHECK_MY_RECORD_PLAYBOOK.deliveryWalkthrough;
};

export type TutorCritiqueResult = {
  overall: "strong" | "needs-work" | "blocked";
  headline: string;
  strengths: string[];
  fixes: string[];
  doNotSay: string[];
  safeLineSuggestion: string | null;
  politicalDebateNote: string;
  stageSafe: "clear" | "verify" | "blocked" | "research";
  timeEstimateSeconds: number | null;
};

function pickCards(queueId: DrillQueueId, cap: number): DrillQueueCard[] {
  return getDrillQueueCards(queueId).slice(0, cap);
}

function politicalTipsForCard(card: DrillQueueCard, focusIds: string[]): string[] {
  const tips: string[] = [];
  for (const p of POLITICAL_DEBATE_COACH_FRAMEWORK.principles) {
    if (!focusIds.includes(p.id)) continue;
    if (card.cardType === "trap-pivot" && p.id === "trap-chess") {
      tips.push(`Trap card: ${p.rule}`);
    } else if (card.cardType === "sos-speak-order" && p.id === "three-way-position") {
      tips.push(`SOS card: ${p.rule}`);
    } else {
      tips.push(p.rule);
    }
  }
  return tips.slice(0, 3);
}

function buildCoachTurns(card: DrillQueueCard, mode: DebatePrepTutorMode, index: number): TutorCoachTurn[] {
  const config = getTutorModeConfig(mode);
  const turns: TutorCoachTurn[] = [];

  turns.push({
    turnIndex: 0,
    coachMessage:
      card.cardType === "trap-pivot"
        ? `Card ${index + 1} — trap pivot. Hammer will likely say something like: "${card.prompt.slice(0, 120)}…" Your job is not to argue yet — listen for the bait.`
        : `Card ${index + 1} — SOS speak-order. Moderators ask this because: ${card.prompt.slice(0, 120)}. Open with one verified line, not a biography.`,
    socraticQuestion: "What is the ONE sentence you say before he finishes talking?",
    focusPrinciple: card.cardType === "trap-pivot" ? "trap-chess" : "three-way-position",
    doThisNext: "Read the prompt once. Do not memorize — recognize the pattern.",
    timeBoxSeconds: mode === "panic-5" ? 60 : 90,
  });

  turns.push({
    turnIndex: 1,
    coachMessage: card.speakLine
      ? `Your stage-safe pivot/opening: "${card.speakLine.slice(0, 200)}${card.speakLine.length > 200 ? "…" : ""}"`
      : "This card is gated — staff must verify before stage. Practice the structure only; do not say specific numbers tonight.",
    socraticQuestion: "Can you say this 20% slower than normal conversation?",
    focusPrinciple: "time-discipline",
    doThisNext: card.speakLine ? "Say it twice out loud. Half-beat pause after any act number." : "Open claims gate with staff.",
    timeBoxSeconds: card.durationMinutes * 60,
  });

  turns.push({
    turnIndex: 2,
    coachMessage: `Kelly beat for this card: ${card.kellyBeat}`,
    socraticQuestion: "Where is your fresh add after any agreement?",
    focusPrinciple: "agree-fresh-add",
    doThisNext: "End with county service or SOS pledge — never end on 'I agree' alone.",
    timeBoxSeconds: 45,
  });

  if (mode === "deep-30") {
    turns.push({
      turnIndex: 3,
      coachMessage: "Practice answer time. Type or say your full answer — I will critique for agree-only closes, unsourced stats, and blocked lines.",
      socraticQuestion: "What would the moderator cut if you had only 30 seconds?",
      focusPrinciple: "time-discipline",
      doThisNext: "Use the practice box below and request coach feedback.",
      timeBoxSeconds: 120,
    });
  }

  return turns;
}

export function buildDebatePrepTutorSession(mode: DebatePrepTutorMode): TutorSession {
  const config = getTutorModeConfig(mode);
  const cards = pickCards(config.queueId, config.cardCap).map((card, i) => {
    const gate = evaluateStageSafeContent(card.claimsGate, "candidate");
    return {
      card,
      coachTurns: buildCoachTurns(card, mode, i),
      safeLine: card.speakLine,
      doNotSay: gate.blocked
        ? ["Do not use gated lines from this card until staff clears claims gate."]
        : [
            "Do not invent act numbers or vote counts.",
            "Do not say opponents hate voters or attack faith/family.",
            "Do not list more than three acts in one breath.",
          ],
      politicalTips: politicalTipsForCard(card, config.politicalFocus),
      href: card.href,
    };
  });

  const sequenceSteps = getTutorSequenceSteps(config.sequenceId);

  return {
    mode,
    config,
    openingCoachMessage: config.coachOpening,
    panicReminder: mode === "panic-5" ? POLITICAL_DEBATE_COACH_FRAMEWORK.panicScript : null,
    cards,
    sequenceSteps,
    frameworkPrinciples: POLITICAL_DEBATE_COACH_FRAMEWORK.principles.filter((p) =>
      config.politicalFocus.includes(p.id),
    ),
    estimatedMinutes: config.minutes,
    checkMyRecordBeats:
      mode === "check-my-record" ? CHECK_MY_RECORD_PLAYBOOK.deliveryWalkthrough : undefined,
  };
}

export function buildCheckMyRecordTutorContent() {
  return {
    playbook: CHECK_MY_RECORD_PLAYBOOK,
    rehearsalScript: CHECK_MY_RECORD_REHEARSAL_SCRIPT,
    packoNote: PACKO_IN_DEBATE_PREP,
    threeWay: THREE_WAY_DEBATE_STRATEGY,
  };
}

function deterministicCritique(
  card: DrillQueueCard,
  practiceAnswer: string,
): TutorCritiqueResult {
  const lower = practiceAnswer.toLowerCase().trim();
  const wordCount = practiceAnswer.split(/\s+/).filter(Boolean).length;
  const strengths: string[] = [];
  const fixes: string[] = [];
  const doNotSay: string[] = [];

  const gate = evaluateStageSafeContent(practiceAnswer, "candidate");

  if (wordCount >= 20 && wordCount <= 120) {
    strengths.push("Length is in a defensible 30–60 second range for a panel answer.");
  } else if (wordCount > 150) {
    fixes.push("Too long for a three-way panel — cut to one act, one harm, one pledge.");
  } else if (wordCount < 15) {
    fixes.push("Too thin — add one verified fact or county frame after your opening.");
  }

  if (/\b(i agree|that's right|he's correct|she's correct)\b/i.test(lower) && !/\b(but|and|however|also|additionally|county|clerk|sos|secretary)\b/i.test(lower.slice(-80))) {
    fixes.push("Political debate trap: you may be closing on agree-only. Add a fresh add — county example, SOS pledge, or verified contrast.");
  }

  if (/\b(act|sb|hb)\s*\d{2,4}\b/i.test(lower) && !/\b(verified|arkleg|checked)\b/i.test(lower)) {
    fixes.push("You cited a bill/act — say 'verified on Arkleg' or drop the number until staff confirms.");
  }

  if (/\b(hate|fraudster|liar|corrupt|stole|cheat)\b/i.test(lower)) {
    doNotSay.push("Avoid motive attacks — sourced contrast on record only.");
  }

  if (/\b(pastor|church|faith|god)\b/i.test(lower)) {
    doNotSay.push("Do not bring faith into record fights — stay on SOS job and clerk harm.");
  }

  if (gate.blocked) {
    doNotSay.push("Your practice answer triggered stage-safe block — remove NEEDS_REVIEW lines.");
  }

  if (card.speakLine && lower.includes(card.speakLine.slice(0, 40).toLowerCase())) {
    strengths.push("You incorporated the coached pivot line — good pattern recognition.");
  }

  if (fixes.length === 0 && doNotSay.length === 0) {
    strengths.push("No agree-only close or obvious blocked language detected.");
  }

  let overall: TutorCritiqueResult["overall"] = "strong";
  if (gate.blocked || doNotSay.length > 1) overall = "blocked";
  else if (fixes.length > 0) overall = "needs-work";

  const stageSafe: TutorCritiqueResult["stageSafe"] = gate.blocked
    ? "blocked"
    : /NEEDS_REVIEW|VERIFY|RESEARCH/i.test(card.claimsGate)
      ? "verify"
      : "clear";

  return {
    overall,
    headline:
      overall === "strong"
        ? "Coach: structure looks stage-ready — verify any numbers with staff."
        : overall === "blocked"
          ? "Coach: stop — blocked language detected. Fix before stage."
          : "Coach: good start — apply fixes below, then say it once more slowly.",
    strengths,
    fixes,
    doNotSay,
    safeLineSuggestion: card.speakLine && !gate.blocked ? card.speakLine : null,
    politicalDebateNote:
      card.cardType === "trap-pivot"
        ? "Trap lanes reward patience — let him bite, pivot once, stop talking."
        : "SOS questions reward clarity — one line for moderator, one for voters, one for clerks.",
    stageSafe,
    timeEstimateSeconds: Math.round(wordCount * 0.45),
  };
}

export async function critiqueTutorPracticeAnswer(
  card: DrillQueueCard,
  practiceAnswer: string,
  topic?: string,
): Promise<TutorCritiqueResult> {
  const deterministic = deterministicCritique(card, practiceAnswer);
  if (!isOpenAIConfigured() || practiceAnswer.trim().length < 20) {
    return deterministic;
  }

  try {
    const client = getOpenAIClient();
    const { model } = getOpenAIConfigFromEnv();
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: DEBATE_PREP_TUTOR_CRITIQUE_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            cardTitle: card.title,
            cardType: card.cardType,
            prompt: card.prompt,
            coachedLine: card.speakLine,
            kellyBeat: card.kellyBeat,
            claimsGate: card.claimsGate,
            practiceAnswer,
            topic: topic ?? card.title,
            deterministicHeadline: deterministic.headline,
          }),
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return deterministic;
    const parsed = JSON.parse(raw) as Partial<TutorCritiqueResult>;
    return {
      ...deterministic,
      headline: parsed.headline ?? deterministic.headline,
      strengths: [...new Set([...(parsed.strengths ?? []), ...deterministic.strengths])].slice(0, 5),
      fixes: [...new Set([...(parsed.fixes ?? []), ...deterministic.fixes])].slice(0, 6),
      doNotSay: [...new Set([...(parsed.doNotSay ?? []), ...deterministic.doNotSay])].slice(0, 5),
      politicalDebateNote: parsed.politicalDebateNote ?? deterministic.politicalDebateNote,
      overall: parsed.overall ?? deterministic.overall,
    };
  } catch {
    return deterministic;
  }
}

export async function generateSocraticCoachMessage(
  card: DrillQueueCard,
  turnIndex: number,
  mode: DebatePrepTutorMode,
): Promise<string> {
  const turns = buildCoachTurns(card, mode, 0);
  const turn = turns[turnIndex] ?? turns[0]!;
  if (!isOpenAIConfigured()) return turn.coachMessage;

  try {
    const client = getOpenAIClient();
    const { model } = getOpenAIConfigFromEnv();
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.35,
      messages: [
        { role: "system", content: DEBATE_PREP_TUTOR_COACH_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            mode,
            cardTitle: card.title,
            cardType: card.cardType,
            prompt: card.prompt,
            speakLine: card.speakLine,
            kellyBeat: card.kellyBeat,
            turnIndex,
            baseMessage: turn.coachMessage,
          }),
        },
      ],
    });
    return completion.choices[0]?.message?.content?.trim() || turn.coachMessage;
  } catch {
    return turn.coachMessage;
  }
}
