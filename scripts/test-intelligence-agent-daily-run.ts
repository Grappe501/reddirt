/**
 * Daily intelligence agent orchestrator smoke test.
 */
import { runDailyIntelligenceAgentPass } from "../src/lib/intelligence/intelligenceAgentOrchestrator";
import { computeDebateReadinessScores } from "../src/lib/opposition/debateReadinessSignals";
import { buildDebateFilmRoomState } from "../src/lib/opposition/debateFilmRoom";
import { buildCountyReadinessClassifications } from "../src/lib/agents/county-intelligence/countyDeploymentReadiness";

function main() {
  const packet = runDailyIntelligenceAgentPass({ syncActionQueue: false });
  const scores = computeDebateReadinessScores();
  const film = buildDebateFilmRoomState();
  const counties = buildCountyReadinessClassifications();

  console.log("Intelligence agent daily run validation");
  console.log("  runId:", packet.runId);
  console.log("  top priorities:", packet.topPriorities.length);
  console.log("  debate overall:", packet.debateReadinessOverall);
  console.log("  counties classified:", counties.length);
  console.log("  film room items:", film.items.length);

  const checks = [
    packet.publicationSafety === "NON_PUBLISHABLE",
    packet.humanReviewRequired === true,
    packet.topPriorities.length >= 3,
    packet.governanceWarnings.length >= 2,
    scores.length === 10,
    scores.every((s) => s.whyThisScore.length > 5),
    scores.every((s) => s.computedFrom.length >= 1),
    !scores.some((s) => s.id === "overall" && !s.whyThisScore.includes("Mean of")),
    film.items.length >= 1,
    film.coverageGaps.length >= 1,
    counties.length === 75,
    packet.brainAnswers.whatCanWeSaySafely.length >= 1,
    packet.publicBriefReadinessRollup.SHELL_ONLY >= 1,
    packet.topResearchGapsBlockingPublicMessaging.length >= 5,
  ];

  const ok = checks.every(Boolean);
  if (!ok) {
    console.error("FAIL — agent daily run validation");
    process.exit(1);
  }
  console.log("OK — daily orchestrator deterministic packet");
}

main();
