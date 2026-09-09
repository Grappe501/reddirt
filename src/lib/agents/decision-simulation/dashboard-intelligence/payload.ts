import { buildDashboardScorecard, type DashboardMember, type DashboardScorecard } from "./scorecard";
import {
  buildBranchExplorer,
  normalizeDashboardMember,
  primarySequence,
  selectDashboardMembers,
  type DashboardMemberInput,
  type SequenceLane,
  type SequenceMove,
} from "./sequence";
import { recommendOpeningRevision, type OpeningRevision } from "./revision";

export type DashboardIntelligencePayload = {
  version: "dashboard-intelligence-1.0";
  members: DashboardMember[];
  opening: string;
  dominantFrame: string | null;
  scorecard: DashboardScorecard | null;
  sequence: SequenceMove[];
  branches: SequenceLane[];
  revision: OpeningRevision;
};

export function buildDashboardIntelligencePayload(input: {
  members: DashboardMemberInput[];
  opening: string;
  modelConfidence: number | null;
  outlierRate: number | null;
  robustnessScore: number | null;
  dominantFrame: string | null;
  strongestCounter: string | null;
  expectedFrame: string | null;
  hostileFrame: string | null;
}): DashboardIntelligencePayload {
  const members = selectDashboardMembers(input.members.map(normalizeDashboardMember));
  const scorecard =
    members.length > 0
      ? buildDashboardScorecard({
          members,
          modelConfidence: input.modelConfidence,
          outlierRate: input.outlierRate,
          robustnessScore: input.robustnessScore,
          dominantFrame: input.dominantFrame,
          strongestCounter: input.strongestCounter,
        })
      : null;
  return {
    version: "dashboard-intelligence-1.0",
    members,
    opening: input.opening,
    dominantFrame: input.dominantFrame,
    scorecard,
    sequence: primarySequence(members, input.opening),
    branches: buildBranchExplorer(members),
    revision: recommendOpeningRevision({
      opening: input.opening,
      expectedFrame: input.expectedFrame,
      hostileFrame: input.hostileFrame,
      robustnessScore: input.robustnessScore,
    }),
  };
}
