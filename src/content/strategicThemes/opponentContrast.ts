/**
 * Name-free contrast language for *approved* public use. Do not attach a surname here
 * without Steve/counsel sign-off in `docs/legal/OPPONENT_CONTRAST_FACT_CHECK_MATRIX.md`.
 * Research: `docs/research/OPPONENT_RECORD_CONTRAST_RESEARCH.md`
 */
export const opponentContrast = {
  /** Generic frames — use only when facts are sourced and vetted. */
  frames: [
    "My opponent will have to defend a public record on initiative rules and how Arkansans access the ballot—voters can read the bills.",
    "This office should protect a fair, understandable path for citizens—not surprise burdens on neighbors gathering signatures.",
  ] as const,
  highRiskProhibited: ["corrupt", "criminal", "stole"] as const,
} as const;
