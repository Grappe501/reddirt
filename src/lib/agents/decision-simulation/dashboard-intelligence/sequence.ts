import { ALTERNATIVE_FUTURE_IDS, type AlternativeFutureId } from "../alternative-futures/contracts";
import { futureOf, type DashboardMember } from "./scorecard";

export type SequenceMove = {
  moveNumber: number;
  side: string;
  message: string;
  predictedFrame?: string;
  rationaleSummary?: string;
};

export type SequenceLane = {
  futureId: AlternativeFutureId;
  ordinal: number | null;
  frame: string | null;
  moves: SequenceMove[];
};

export type DashboardMemberInput = DashboardMember & {
  result?: { run?: { moves?: SequenceMove[] }; executiveSummary?: string };
};

export function normalizeDashboardMember(member: DashboardMemberInput): DashboardMember {
  const moves = member.moves ?? member.result?.run?.moves;
  return {
    ordinal: member.ordinal,
    futureId: futureOf(member),
    frame: member.frame ?? moves?.find((move) => move.moveNumber === 1)?.predictedFrame,
    final: member.final ?? moves?.find((move) => move.moveNumber === 6)?.message,
    confidence: member.confidence,
    executiveSummary: member.executiveSummary ?? member.result?.executiveSummary,
    error: member.error,
    moves: moves?.map((move) => ({
      moveNumber: move.moveNumber,
      side: move.side,
      message: move.message,
      predictedFrame: move.predictedFrame,
      rationaleSummary: move.rationaleSummary,
    })),
  };
}

export function selectDashboardMembers(members: DashboardMember[], limit = 24): DashboardMember[] {
  const normalized = members.map(normalizeDashboardMember);
  const picks: DashboardMember[] = [];
  for (const futureId of ALTERNATIVE_FUTURE_IDS) {
    const hit = normalized.find((member) => !member.error && futureOf(member) === futureId && member.moves?.length);
    if (hit) picks.push(hit);
  }
  for (const member of normalized) {
    if (picks.length >= limit) break;
    if (!member.error && member.moves?.length && !picks.some((pick) => pick.ordinal === member.ordinal)) {
      picks.push(member);
    }
  }
  return picks;
}

export function buildBranchExplorer(members: DashboardMember[]): SequenceLane[] {
  const selected = selectDashboardMembers(members);
  return ALTERNATIVE_FUTURE_IDS.map((futureId) => {
    const member = selected.find((item) => futureOf(item) === futureId) ?? null;
    return {
      futureId,
      ordinal: member?.ordinal ?? null,
      frame: member?.frame ?? null,
      moves: member?.moves ?? [],
    };
  });
}

export function primarySequence(members: DashboardMember[], opening: string): SequenceMove[] {
  const expected = buildBranchExplorer(members).find((lane) => lane.futureId === "EXPECTED" && lane.moves.length);
  const fallback = selectDashboardMembers(members)[0];
  const moves = expected?.moves ?? fallback?.moves ?? [];
  return [
    { moveNumber: 0, side: "OPERATOR", message: opening, predictedFrame: "OPENING" },
    ...moves.filter((move) => move.moveNumber >= 1 && move.moveNumber <= 6),
  ];
}
