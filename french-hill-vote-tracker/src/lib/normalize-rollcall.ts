import { isHillAlignedWithParty, scorePartisanship } from "./partisanship";
import type { VoteRecord, VoteSource, VoteValue } from "./vote-record";

export type { VoteValue } from "./vote-record";

export interface RawRollCall {
  congress: number;
  rollCall: number;
  date: string;
  measure: string;
  question?: string;
  issueArea?: string;
  hillVote: VoteValue;
  republicanYea: number;
  republicanNay: number;
  democratYea: number;
  democratNay: number;
  sources: VoteSource[];
}

export function normalizeRollCall(raw: RawRollCall): VoteRecord {
  const partisan = scorePartisanship(raw);
  const hillAlignedWithGop = isHillAlignedWithParty(raw.hillVote, partisan.republicanMajorityPosition);
  const partyBreak = hillAlignedWithGop === null ? false : !hillAlignedWithGop;

  return {
    ...raw,
    partyMajorityPosition: partisan.republicanMajorityPosition,
    democratMajorityPosition: partisan.democratMajorityPosition,
    republicanUnityPct: partisan.republicanUnityPct,
    democratUnityPct: partisan.democratUnityPct,
    partiesOpposed: partisan.partiesOpposed,
    highPartisanship: partisan.highPartisanship,
    partisanshipScore: partisan.partisanshipScore,
    hillAlignedWithGop,
    partyBreak,
    trumpPosition: "No documented position",
    trumpAligned: null,
    trumpBreak: false,
    doubleBreak: false,
    highlyPartisanGopAlignment: Boolean(partisan.highPartisanship && hillAlignedWithGop),
    highlyPartisanTrumpAlignment: false,
    highlyPartisanDoubleAlignment: false,
    classificationConfidence: "high",
  };
}
