import {
  CURRENT_CONGRESS,
  PARTISAN_METHODOLOGY,
  VOTE_INTELLIGENCE_AS_OF,
  type LegislativeTemporalSlice,
  type LegislativeVoteEvidence,
  type VoteTemporalWindowId,
} from "./contracts";
import { rate } from "./classify";

const WINDOWS: VoteTemporalWindowId[] = [
  "ALL_TIME_AVAILABLE",
  "CURRENT_CONGRESS",
  "LAST_24_MONTHS",
  "LAST_12_MONTHS",
  "LAST_90_DAYS",
];

function inWindow(vote: LegislativeVoteEvidence, window: VoteTemporalWindowId): boolean {
  if (window === "ALL_TIME_AVAILABLE") return true;
  if (window === "CURRENT_CONGRESS") return vote.congress === CURRENT_CONGRESS;
  if (!vote.voteDate) return false;
  const days = (Date.parse(`${VOTE_INTELLIGENCE_AS_OF}T12:00:00.000Z`) - Date.parse(vote.voteDate)) / 86_400_000;
  if (!Number.isFinite(days)) return false;
  if (window === "LAST_24_MONTHS") return days <= 730;
  if (window === "LAST_12_MONTHS") return days <= 365;
  return days <= 90;
}

export function temporalSlices(votes: LegislativeVoteEvidence[]): LegislativeTemporalSlice[] {
  return WINDOWS.map((window) => {
    const subset = votes.filter((vote) => inWindow(vote, window));
    const partyKnown = subset.filter((vote) => vote.classes.includes("VOTED_WITH_PARTY") || vote.classes.includes("VOTED_AGAINST_PARTY"));
    const adminKnown = subset.filter(
      (vote) =>
        vote.classes.includes("VOTED_WITH_DOCUMENTED_ADMINISTRATION") ||
        vote.classes.includes("VOTED_AGAINST_DOCUMENTED_ADMINISTRATION"),
    );
    return {
      window,
      voteCount: subset.length,
      partyAlignment: rate(
        partyKnown.filter((vote) => vote.classes.includes("VOTED_WITH_PARTY")).length,
        partyKnown.length,
        "Windowed party-alignment among votes with a documented party position.",
      ),
      documentedAdminAlignment: rate(
        adminKnown.filter((vote) => vote.classes.includes("VOTED_WITH_DOCUMENTED_ADMINISTRATION")).length,
        adminKnown.length,
        "Windowed administration-alignment only where a source states the administration position.",
      ),
      bipartisanRate: rate(subset.filter((vote) => vote.classes.includes("BIPARTISAN_MAJORITY")).length, subset.length, "Windowed bipartisan-majority share."),
      highlyPartisanRate: rate(subset.filter((vote) => vote.classes.includes("HIGHLY_PARTISAN")).length, subset.length, PARTISAN_METHODOLOGY),
    };
  });
}
