/** Election Plan portal — candidate-facing surface (minimize staff / platform chrome). */
export const KELLY_FACING_ELECTION_PLAN = true;

export function showOperatorGuides(): boolean {
  return !KELLY_FACING_ELECTION_PLAN;
}

export function showPlatformMeta(): boolean {
  return !KELLY_FACING_ELECTION_PLAN;
}

export function showFullDebatePrepSubnav(): boolean {
  return !KELLY_FACING_ELECTION_PLAN;
}

/** Kelly Day 1 — linear pathway, not concept rabbit holes */
export function isKellyDay1StreamlinedPath(): boolean {
  return KELLY_FACING_ELECTION_PLAN;
}

export function kellyStudyLeadLabel(): string {
  return KELLY_FACING_ELECTION_PLAN ? "Start here" : "Professor lead";
}

export function showOptionalDeepReference(): boolean {
  return !KELLY_FACING_ELECTION_PLAN;
}
