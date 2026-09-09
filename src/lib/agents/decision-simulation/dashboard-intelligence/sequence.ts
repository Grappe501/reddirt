import { ALTERNATIVE_FUTURE_IDS, type AlternativeFutureId, type FutureLaneSummary } from "../alternative-futures/contracts";
import { scoreRobustnessAcrossFutures } from "../alternative-futures/robustness";
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
  runCount: number;
  modalFrame: string | null;
  modalShare: number | null;
  representativeIsModal: boolean;
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

function laneByFuture(members: DashboardMember[]): Map<AlternativeFutureId, FutureLaneSummary> {
  const scored = scoreRobustnessAcrossFutures(
    members.map((member) => ({
      ordinal: member.ordinal,
      futureId: futureOf(member),
      frame: member.frame ?? undefined,
      error: member.error,
    })),
  );
  return new Map(scored.lanes.map((lane) => [lane.futureId, lane]));
}

export function selectDashboardMembers(members: DashboardMember[], limit = 24): DashboardMember[] {
  const normalized = members.map(normalizeDashboardMember);
  const lanes = laneByFuture(normalized);
  const picks: DashboardMember[] = [];
  for (const futureId of ALTERNATIVE_FUTURE_IDS) {
    const wanted = lanes.get(futureId)?.representativeOrdinal;
    const hit =
      normalized.find((member) => !member.error && member.ordinal === wanted && member.moves?.length) ??
      normalized.find((member) => !member.error && futureOf(member) === futureId && member.moves?.length);
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
  const lanes = laneByFuture(members.map(normalizeDashboardMember));
  return ALTERNATIVE_FUTURE_IDS.map((futureId) => {
    const member = selected.find((item) => futureOf(item) === futureId) ?? null;
    const stats = lanes.get(futureId);
    return {
      futureId,
      ordinal: member?.ordinal ?? stats?.representativeOrdinal ?? null,
      frame: member?.frame ?? stats?.modalFrame ?? null,
      moves: member?.moves ?? [],
      runCount: stats?.runCount ?? 0,
      modalFrame: stats?.modalFrame ?? null,
      modalShare: stats?.modalShare ?? null,
      representativeIsModal: Boolean(
        member && stats?.modalFrame && (member.frame || "Unspecified") === stats.modalFrame,
      ),
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
