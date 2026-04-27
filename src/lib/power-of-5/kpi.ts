/**
 * Power of 5 — shared KPI math for county, region, and state organizing dashboards.
 * Pure functions only: no I/O, no PII. Callers label source (demo vs derived) in payloads.
 */

const DEFAULT_DECIMALS = 1;

function roundPct(value: number, decimals: number = DEFAULT_DECIMALS): number {
  if (!Number.isFinite(value)) return 0;
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export type CoverageInput = {
  /** Units with active presence (e.g. Power Teams stood up). */
  activeUnits: number;
  /** Planning or model target (e.g. county/region team goal). */
  targetUnits: number;
};

export type ActivationInput = {
  activated: number;
  invited: number;
};

export type TeamCompletionInput = {
  completeTeams: number;
  /** Teams formed / stood up (denominator). */
  formedTeams: number;
};

export type GrowthRateInput = {
  current: number;
  previous: number;
};

/**
 * Coverage as a percent of target: `activeUnits / targetUnits × 100`, capped at 100.
 * If `targetUnits <= 0`, returns 0.
 */
export function calculateCoverage(input: CoverageInput): number {
  const active = clamp(input.activeUnits, 0, Number.MAX_SAFE_INTEGER);
  const target = input.targetUnits;
  if (!Number.isFinite(target) || target <= 0) return 0;
  return roundPct(clamp((active / target) * 100, 0, 100));
}

/**
 * Activation rate: `activated / invited × 100`, capped at 100.
 * If `invited <= 0`, returns 0 (undefined rate — caller may label as demo).
 */
export function calculateActivation(input: ActivationInput): number {
  const invited = input.invited;
  const activated = clamp(input.activated, 0, Number.MAX_SAFE_INTEGER);
  if (!Number.isFinite(invited) || invited <= 0) return 0;
  return roundPct(clamp((activated / invited) * 100, 0, 100));
}

/**
 * Team completion: `completeTeams / formedTeams × 100`, capped at 100.
 * If `formedTeams <= 0`, returns 0.
 */
export function calculateTeamCompletion(input: TeamCompletionInput): number {
  const formed = input.formedTeams;
  const complete = clamp(input.completeTeams, 0, Number.MAX_SAFE_INTEGER);
  if (!Number.isFinite(formed) || formed <= 0) return 0;
  return roundPct(clamp((complete / formed) * 100, 0, 100));
}

/**
 * Period-over-period growth: `(current − previous) / previous × 100`.
 * If `previous <= 0`, returns 0 (no meaningful baseline).
 */
export function calculateGrowthRate(input: GrowthRateInput): number {
  const prev = input.previous;
  const cur = input.current;
  if (!Number.isFinite(prev) || !Number.isFinite(cur) || prev <= 0) return 0;
  return roundPct(((cur - prev) / prev) * 100);
}
