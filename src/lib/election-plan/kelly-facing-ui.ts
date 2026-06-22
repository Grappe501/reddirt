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

/** Kelly Day 2 — same linear pathway pattern as Day 1 */
export function isKellyDay2StreamlinedPath(): boolean {
  return KELLY_FACING_ELECTION_PLAN;
}

/** Kelly Day 3 — qualification stack linear pathway */
export function isKellyDay3StreamlinedPath(): boolean {
  return KELLY_FACING_ELECTION_PLAN;
}

/** Kelly Day 4 — forum intelligence lab linear pathway */
export function isKellyDay4StreamlinedPath(): boolean {
  return KELLY_FACING_ELECTION_PLAN;
}

/** Kelly Day 5 — anticipate & capitalize linear pathway */
export function isKellyDay5StreamlinedPath(): boolean {
  return KELLY_FACING_ELECTION_PLAN;
}

/** Kelly Day 6 — full simulation linear pathway */
export function isKellyDay6StreamlinedPath(): boolean {
  return KELLY_FACING_ELECTION_PLAN;
}

export function kellyStudyLeadLabel(): string {
  return KELLY_FACING_ELECTION_PLAN ? "Start here" : "Professor lead";
}

export function showOptionalDeepReference(): boolean {
  return !KELLY_FACING_ELECTION_PLAN;
}
