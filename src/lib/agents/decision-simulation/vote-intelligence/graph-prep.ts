import type { EvidenceGraphPrepEdge, LegislativeVoteEvidence } from "./contracts";
import { HILL_VOTE_ACTOR_ID } from "./contracts";

export function prepareLegislativeEvidenceGraphEdges(votes: LegislativeVoteEvidence[]): EvidenceGraphPrepEdge[] {
  const edges: EvidenceGraphPrepEdge[] = [];
  for (const vote of votes) {
    edges.push({ fromType: "ACTOR", fromId: HILL_VOTE_ACTOR_ID, toType: "VOTE", toId: vote.voteId });
    if (vote.billNumber) edges.push({ fromType: "VOTE", fromId: vote.voteId, toType: "BILL", toId: vote.billNumber });
    for (const issue of vote.issueTags) {
      edges.push({ fromType: "VOTE", fromId: vote.voteId, toType: "ISSUE", toId: issue });
    }
    if (vote.partyPosition !== "UNKNOWN") {
      edges.push({
        fromType: "VOTE",
        fromId: vote.voteId,
        toType: "PARTY_POSITION",
        toId: `${vote.voteId}:party:${vote.partyPosition}`,
      });
    }
    if (vote.presidentPosition !== "UNKNOWN") {
      edges.push({
        fromType: "VOTE",
        fromId: vote.voteId,
        toType: "ADMINISTRATION_POSITION",
        toId: `${vote.voteId}:admin:${vote.presidentPosition}`,
      });
    }
  }
  return edges;
}
