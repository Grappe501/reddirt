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
