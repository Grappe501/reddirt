/** Election Day 2026-11-03 — planning countdown for Mission Brief HUD. */
const ELECTION_YMD = "2026-11-03";

export function electionCountdown(asOf = new Date()): { daysRemaining: number; label: string; electionYmd: string } {
  const [y, m, d] = ELECTION_YMD.split("-").map(Number);
  const election = new Date(y, m - 1, d);
  const diff = Math.ceil((election.getTime() - asOf.getTime()) / 86_400_000);
  const daysRemaining = Math.max(0, diff);
  return {
    daysRemaining,
    label: daysRemaining === 0 ? "Election Day" : `${daysRemaining} days to Election Day`,
    electionYmd: ELECTION_YMD,
  };
}
