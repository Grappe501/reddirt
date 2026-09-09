import type { LegislativeBehaviorProfile, LegislativeOutlierView, LegislativeVoteEvidence } from "./contracts";

export function buildLegislativeOutlierViews(
  votes: LegislativeVoteEvidence[],
  profile: LegislativeBehaviorProfile,
): LegislativeOutlierView[] {
  const againstGop = votes.filter((vote) => vote.classes.includes("VOTED_AGAINST_REPUBLICAN_MAJORITY") || vote.classes.includes("VOTED_AGAINST_PARTY"));
  const againstAdmin = votes.filter((vote) => vote.classes.includes("VOTED_AGAINST_DOCUMENTED_ADMINISTRATION"));
  const withDems = votes.filter((vote) => {
    const rYea = vote.partySplit.republicanYea;
    const rNay = vote.partySplit.republicanNay;
    if (rYea == null || rNay == null || vote.actorVote === "UNKNOWN") return false;
    const gopMajority = rYea > rNay ? "YEA" : rNay > rYea ? "NAY" : "UNKNOWN";
    return gopMajority !== "UNKNOWN" && vote.actorVote !== gopMajority && vote.classes.includes("VOTED_AGAINST_REPUBLICAN_MAJORITY");
  });
  const bipartisan = votes.filter((vote) => vote.classes.includes("BIPARTISAN_MAJORITY"));
  const highlyPartisanGop = votes.filter(
    (vote) => vote.classes.includes("HIGHLY_PARTISAN") && vote.classes.includes("VOTED_WITH_REPUBLICAN_MAJORITY"),
  );
  const defectionIssues = profile.issueAlignment
    .filter((row) => row.partyAlignment.rate != null && row.voteCount >= 3)
    .sort((a, b) => (a.partyAlignment.rate ?? 1) - (b.partyAlignment.rate ?? 1))
    .slice(0, 5);
  const alignedIssues = profile.issueAlignment
    .filter((row) => row.partyAlignment.rate != null && row.voteCount >= 3)
    .sort((a, b) => (b.partyAlignment.rate ?? 0) - (a.partyAlignment.rate ?? 0))
    .slice(0, 5);

  return [
    {
      id: "AGAINST_REPUBLICAN_POSITION",
      voteIds: againstGop.map((vote) => vote.voteId),
      notes: "Votes against documented Republican/party position. Unknown party position excluded.",
    },
    {
      id: "AGAINST_DOCUMENTED_ADMINISTRATION",
      voteIds: againstAdmin.map((vote) => vote.voteId),
      notes: "Requires an explicit administration/president position on the source record.",
    },
    {
      id: "WITH_DEMOCRATS_AGAINST_MOST_REPUBLICANS",
      voteIds: withDems.map((vote) => vote.voteId),
      notes: "Actor vote opposes the Republican majority when GOP Yea/Nay counts exist.",
    },
    {
      id: "STRONG_BIPARTISAN",
      voteIds: bipartisan.map((vote) => vote.voteId),
      notes: "Both parties supported the winning side at >= 40%.",
    },
    {
      id: "HIGHLY_PARTISAN_REPUBLICAN_MAJORITY",
      voteIds: highlyPartisanGop.map((vote) => vote.voteId),
      notes: "Highly partisan rule plus Hill with the Republican majority.",
    },
    {
      id: "HIGHEST_DEFECTION_ISSUES",
      voteIds: defectionIssues.flatMap((row) =>
        votes.filter((vote) => vote.issueTags.includes(row.issue) && vote.classes.includes("VOTED_AGAINST_PARTY")).map((vote) => vote.voteId),
      ),
      notes: `Issues with lowest party-alignment among issues with at least 3 known-position votes: ${defectionIssues.map((row) => row.issue).join(", ") || "none"}.`,
    },
    {
      id: "MOST_ALIGNED_ISSUES",
      voteIds: alignedIssues.flatMap((row) =>
        votes.filter((vote) => vote.issueTags.includes(row.issue) && vote.classes.includes("VOTED_WITH_PARTY")).map((vote) => vote.voteId),
      ),
      notes: `Issues with highest party-alignment among issues with at least 3 known-position votes: ${alignedIssues.map((row) => row.issue).join(", ") || "none"}.`,
    },
  ];
}
