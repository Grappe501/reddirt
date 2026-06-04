import type { SosDebateQuestionDrillDown } from "@/lib/intelligence/v4/sosDebateQuestionTypes";

export type OpponentResponseRound = {
  round: number;
  speaker: "Hammer" | "Packo" | "Moderator";
  likelyLine: string;
  tonalNote: string;
  kellyResponse: string;
  backupEvidence: string;
  leadOrRebut: "respond" | "rebut" | "lead";
};

export type ResponseRoundPlan = {
  questionId: string;
  narrativeStrategy: string;
  rounds: OpponentResponseRound[];
  adversityMoves: string[];
  noviceChecklist: string[];
  expertCrossExam: string[];
};

function leadPhrase(category: string): OpponentResponseRound["leadOrRebut"] {
  if (category.includes("direct-democracy")) return "lead";
  if (category.includes("experience")) return "rebut";
  return "respond";
}

export function buildSosQuestionResponseRounds(drill: SosDebateQuestionDrillDown): ResponseRoundPlan {
  const hammer1 = drill.whatHammerLikelySays[0] ?? "Check my record on election integrity.";
  const hammer2 = drill.whatHammerLikelySays[1] ?? "I have been consistent — writing the laws that secure Arkansas.";
  const hammer3 = drill.rebuttalIfHammerAttacks[0]?.hammerLikelyLine ?? "You are not ready to run elections.";
  const packo1 = drill.whatPackoMayAdd[0] ?? "Both parties have failed voters — we need real reform.";
  const packo2 = drill.whatPackoMayAdd[1] ?? "Experience in activism is not SOS administration.";

  const round2Kelly =
    drill.speakOrderDrills.find((s) => s.position === 2)?.freshAddition ??
    drill.directAnswer60s.split(".").slice(0, 2).join(".") + ".";

  const round3Kelly =
    drill.speakOrderDrills.find((s) => s.position === 3)?.closingBeat ??
    drill.agreeButNeverOnlyAgree;

  return {
    questionId: drill.questionId,
    narrativeStrategy: drill.agreeButNeverOnlyAgree,
    rounds: [
      {
        round: 1,
        speaker: "Moderator",
        likelyLine: drill.moderatorLikelyPhrasings[0] ?? drill.title,
        tonalNote: "Neutral — answer the question asked, not the trap inside it.",
        kellyResponse: drill.directAnswer30s,
        backupEvidence: drill.researchBasis.slice(0, 160),
        leadOrRebut: "respond",
      },
      {
        round: 1,
        speaker: "Hammer",
        likelyLine: hammer1,
        tonalNote: "Senator cadence — bill numbers, integrity branding.",
        kellyResponse: drill.rebuttalIfHammerAttacks[0]
          ? `${drill.rebuttalIfHammerAttacks[0].agree} ${drill.rebuttalIfHammerAttacks[0].contrast} ${drill.rebuttalIfHammerAttacks[0].bridge}`
          : round2Kelly,
        backupEvidence: drill.relatedActs.length
          ? `Acts: ${drill.relatedActs.join(", ")} — verify on Arkleg`
          : "SOS service frame — no unsourced fraud claims",
        leadOrRebut: leadPhrase(drill.category),
      },
      {
        round: 2,
        speaker: "Hammer",
        likelyLine: hammer2,
        tonalNote: "Doubles down or pivots to 2020 / experience.",
        kellyResponse: round2Kelly,
        backupEvidence: drill.trapLaneHref ?? "/admin/intelligence/trap-lanes",
        leadOrRebut: "rebut",
      },
      {
        round: 2,
        speaker: "Packo",
        likelyLine: packo1,
        tonalNote: "Reform contrast — may agree with Kelly on access, attack major parties.",
        kellyResponse:
          "Dr. Pakko and I both want voters heard — my job is administering elections in all 75 counties every day, not performing outrage.",
        backupEvidence: "Three-way rule: respect Pakko, contrast Hammer record",
        leadOrRebut: "respond",
      },
      {
        round: 3,
        speaker: "Hammer",
        likelyLine: hammer3,
        tonalNote: "Personal readiness attack or pile-on if Kelly stumbled.",
        kellyResponse: round3Kelly,
        backupEvidence: drill.claimsGate,
        leadOrRebut: "lead",
      },
      {
        round: 3,
        speaker: "Packo",
        likelyLine: packo2,
        tonalNote: "May question Kelly neutrality on petitions.",
        kellyResponse:
          "Lawful participation and transparent rules — SOS serves every voter and every lawful petition drive equally.",
        backupEvidence: "Kelly petition history — own civics, separate SOS administrator role",
        leadOrRebut: "rebut",
      },
    ],
    adversityMoves: [
      ...drill.rebuttalIfYouArePileOnTarget,
      "If moderator cuts you off: one sentence safe line from directAnswer30s, then stop.",
      "If crowd cheers an attack: lower voice, pivot to county clerks.",
      drill.bodyLanguageAndTone,
    ],
    noviceChecklist: [
      `Read direct 30s answer aloud 3 times: "${drill.directAnswer30s.slice(0, 80)}…"`,
      "Know one Hammer line you expect — do not look surprised.",
      "Never end on 'I agree' — add fresh line from speak-order drill.",
      `Claims gate: ${drill.claimsGate}`,
    ],
    expertCrossExam: [
      ...drill.researchRefs.map((r) => `Source: ${r.source} — ${r.note}`),
      ...drill.rebuttalIfHammerAttacks.map(
        (s) => `Trigger "${s.trigger}" → Agree: ${s.agree} | Contrast: ${s.contrast}`,
      ),
      ...drill.sampleScripts.map((s) => `${s.label} (${s.duration}): ${s.text.slice(0, 120)}…`),
    ],
  };
}
