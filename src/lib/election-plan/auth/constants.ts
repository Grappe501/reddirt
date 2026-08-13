export const ELECTION_PLAN_SESSION_COOKIE = "reddirt_election_plan_session";

/**
 * TEMP DEMO: password gates off for /election-plan and operator sub-boards.
 * Flip to `false` (and keep ELECTION_PLAN_PASSWORD / VOLUNTEER_HUB_PASSWORD set) to restore.
 * Env override: ELECTION_PLAN_OPEN_ACCESS=true also opens access.
 */
export const ELECTION_PLAN_AUTH_BYPASS = true;

export function isElectionPlanAuthBypassed(): boolean {
  if (ELECTION_PLAN_AUTH_BYPASS) return true;
  const env = process.env.ELECTION_PLAN_OPEN_ACCESS?.trim().toLowerCase();
  return env === "1" || env === "true" || env === "yes";
}
