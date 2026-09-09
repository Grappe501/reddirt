import type { AlternativeFutureAssignment } from "./contracts";

export function formatAlternativeFuturePrompt(assignment: AlternativeFutureAssignment): string {
  const { futureId, definition } = assignment;
  const silence =
    futureId === "SILENCE"
      ? "Move 1 MUST be non-response, delayed reply, or public silence. Do not invent a speech, vote, or quotation to fill the silence."
      : "";
  return [
    `ALTERNATIVE FUTURE LANE: ${futureId} (${definition.label})`,
    "This run is a first-class future branch. It is not leftover ensemble variance and not a probability mass.",
    `Assumptions: ${definition.assumptions.join(" ")}`,
    definition.operatorNote,
    silence,
    "Score plausibility against supplied writing and legislative evidence. Vote history is not a deterministic prediction.",
    "Do not turn legislative counts into psychological claims or voter-persuasion scripts.",
  ]
    .filter(Boolean)
    .join("\n");
}
