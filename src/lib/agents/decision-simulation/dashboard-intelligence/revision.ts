export type OpeningRevision = {
  sourceState: "HYPOTHESIS";
  text: string;
  rationale: string;
};

export function recommendOpeningRevision(input: {
  opening: string;
  expectedFrame: string | null;
  hostileFrame: string | null;
  robustnessScore: number | null;
}): OpeningRevision {
  const opening = input.opening.trim() || "(no opening pasted)";
  if (input.hostileFrame && input.expectedFrame && input.hostileFrame !== input.expectedFrame) {
    return {
      sourceState: "HYPOTHESIS",
      text: `${opening}\n\n[HYPOTHESIS addition — not a quote, not sent] Address the hostile-lane frame "${input.hostileFrame}" with one documented public fact. Do not invent a vote or private statement.`,
      rationale: `EXPECTED frame "${input.expectedFrame}" differs from HOSTILE frame "${input.hostileFrame}". The addition is a robustness check, not a persuasion script.`,
    };
  }
  if (input.robustnessScore != null && input.robustnessScore >= 0.67) {
    return {
      sourceState: "HYPOTHESIS",
      text: opening,
      rationale: "Cross-future first responses are relatively stable. Tighten the existing ask; do not add new unsourced claims.",
    };
  }
  return {
    sourceState: "HYPOTHESIS",
    text: opening,
    rationale: "Not enough disagreement signal to propose a rewrite. Keep the pasted artifact and attach missing evidence instead of inventing language.",
  };
}
