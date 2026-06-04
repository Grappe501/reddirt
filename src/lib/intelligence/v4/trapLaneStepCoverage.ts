import type { TrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDownTypes";

export type TrapCoverageStep = {
  stepNumber: number;
  phase: string;
  candidateAction: string;
  staffAction: string;
  successSignal: string;
  failureRecovery: string;
  educationLevel: "novice" | "intermediate" | "expert";
};

export type TrapLaneStepCoverage = {
  laneId: string;
  overview: string;
  steps: TrapCoverageStep[];
  offensivePlaybook: string[];
  defensivePlaybook: string[];
};

export function buildTrapLaneStepCoverage(drill: TrapLaneDrillDown): TrapLaneStepCoverage {
  const trapName = drill.title;
  return {
    laneId: drill.laneId,
    overview: `${trapName}: ${drill.baitPsychology}`,
    steps: [
      {
        stepNumber: 1,
        phase: "Scout (T-48h)",
        candidateAction: "Read narrative overview once; identify one setup question you can ask naturally.",
        staffAction: "Verify related acts on Arkleg; log claims ledger entries for any act numbers.",
        successSignal: "Kelly can state trap purpose in one sentence without notes.",
        failureRecovery: "Use hub theme matrix row instead — same pattern, different bill.",
        educationLevel: "novice",
      },
      {
        stepNumber: 2,
        phase: "Rehearse setup (T-24h)",
        candidateAction: `Practice setup: "${drill.setupMoves[0] ?? "Ask fair implementation question."}"`,
        staffAction: "Staff plays Hammer bait lines from whatToExpectHammerToSay list.",
        successSignal: "Setup delivered in under 12 seconds; calm tone.",
        failureRecovery: drill.ifHeDoesNotBite[0] ?? "Take pivot anyway in one sentence and move on.",
        educationLevel: "novice",
      },
      {
        stepNumber: 3,
        phase: "Live — bait window",
        candidateAction: "Eyes on moderator; hands still; voice drops half level when asking setup.",
        staffAction: "Watch for whenHeBitesSignals; do not signal candidate from floor.",
        successSignal: drill.whenHeBitesSignals[0] ?? "Hammer cites record without county funding detail.",
        failureRecovery: drill.ifHeDoesNotBite.join(" ") || "Deliver kellyPivotDeep without waiting for bite.",
        educationLevel: "intermediate",
      },
      {
        stepNumber: 4,
        phase: "Live — pivot",
        candidateAction: drill.kellyPivotDeep,
        staffAction: "Timer — pivot must finish under 45s.",
        successSignal: "Pivot ends on SOS service or county frame, not personal attack.",
        failureRecovery: "Use shortest rebuttal script from drill.rebuttalScripts[0] if pivot runs long.",
        educationLevel: "intermediate",
      },
      {
        stepNumber: 5,
        phase: "Second response round",
        candidateAction:
          drill.rebuttalScripts[0]
            ? `${drill.rebuttalScripts[0].agree} → ${drill.rebuttalScripts[0].contrast}`
            : "Agree on narrow fact; add one verified act + county burden.",
        staffAction: "Prep backup zinger only if claims gate clears.",
        successSignal: "Hammer repeats bait without new evidence — you hold frame.",
        failureRecovery: drill.mistakesFirstTimersMake[0] ?? "Do not escalate tone — shorter answer wins.",
        educationLevel: "expert",
      },
      {
        stepNumber: 6,
        phase: "Third round / spin room",
        candidateAction: "Repeat act anchor + county line only — no new claims.",
        staffAction: "Claims check before any social clip from this exchange.",
        successSignal: "Press repeats your county frame in recap question.",
        failureRecovery: "Redirect to claims-verified talking points only.",
        educationLevel: "expert",
      },
    ],
    offensivePlaybook: [
      drill.debateOffensiveUse,
      ...drill.whatToLookForOffensive,
      ...(drill.setupMoves.length > 1 ? [`Alternate setup: ${drill.setupMoves[1]}`] : []),
    ],
    defensivePlaybook: [
      drill.debateDefensiveUse,
      ...drill.whatToLookForDefensive,
      drill.bodyLanguageAndTone,
      ...drill.mistakesFirstTimersMake.map((m) => `Avoid: ${m}`),
    ],
  };
}
