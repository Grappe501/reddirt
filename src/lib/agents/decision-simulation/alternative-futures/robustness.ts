import {
  ALTERNATIVE_FUTURES,
  ALTERNATIVE_FUTURES_VERSION,
  ALTERNATIVE_FUTURE_IDS,
  type AlternativeFutureId,
  type RobustnessAcrossFutures,
} from "./contracts";

export type RobustnessMember = {
  ordinal: number;
  futureId?: AlternativeFutureId;
  frame?: string;
  error?: string;
};

export function scoreRobustnessAcrossFutures(members: RobustnessMember[]): RobustnessAcrossFutures {
  const completed = members.filter((member) => !member.error);
  const lanes = ALTERNATIVE_FUTURE_IDS.map((futureId) => {
    const subset = completed.filter((member) => member.futureId === futureId);
    const frames = new Map<string, number>();
    for (const member of subset) {
      const frame = member.frame || "Unspecified";
      frames.set(frame, (frames.get(frame) ?? 0) + 1);
    }
    const ranked = [...frames.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const modal = ranked[0];
    const modalFrame = modal?.[0] ?? null;
    const modalCount = modal?.[1] ?? 0;
    const modalShare = subset.length ? modalCount / subset.length : null;
    const typical = subset.find((member) => (member.frame || "Unspecified") === modalFrame) ?? subset[0];
    return {
      futureId,
      label: ALTERNATIVE_FUTURES.find((item) => item.id === futureId)?.label ?? futureId,
      runCount: subset.length,
      modalFrame,
      modalShare,
      withinLaneAgreement: modalShare,
      frames: ranked.slice(0, 3).map(([frame, count]) => ({
        frame,
        count,
        share: subset.length ? count / subset.length : 0,
      })),
      representativeOrdinal: typical?.ordinal ?? null,
      representativeIsModal: Boolean(typical && modalFrame && (typical.frame || "Unspecified") === modalFrame),
      legislativeNotes: [],
    };
  });
  const populated = lanes.filter((lane) => lane.runCount > 0);
  const modalFrames = populated.map((lane) => lane.modalFrame).filter((value): value is string => Boolean(value));
  let agreement: number | null = null;
  if (modalFrames.length >= 2) {
    let pairs = 0;
    let same = 0;
    for (let i = 0; i < modalFrames.length; i += 1) {
      for (let j = i + 1; j < modalFrames.length; j += 1) {
        pairs += 1;
        if (modalFrames[i] === modalFrames[j]) same += 1;
      }
    }
    agreement = pairs ? same / pairs : null;
  }
  return {
    version: ALTERNATIVE_FUTURES_VERSION,
    requiredFutures: ALTERNATIVE_FUTURE_IDS.length,
    futuresWithRuns: populated.length,
    coverage: populated.length / ALTERNATIVE_FUTURE_IDS.length,
    lanes,
    crossFutureFrameAgreement: agreement,
    robustnessScore: populated.length < 2 ? null : agreement,
    methodology:
      "Robustness is measured across named futures, not as likelihood inside one linear conversation. Coverage is futures-with-runs / 6. Cross-future frame agreement is pairwise identity of each future's modal counterparty frame. A high agreement score means the opening produced similar first responses across futures; a low score means the opening is fragile to future-type. This is not a win-probability.",
    uncertainty: [
      "One-run jobs can only cover EXPECTED.",
      "Six or more runs are required before every named future has at least one sample.",
      "A 6-run job has n=1 per lane. 100/1,000 jobs measure within-lane stability of the first response.",
      "Vote history can change plausibility notes; it does not determine the branch.",
    ],
  };
}
