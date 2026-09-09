import { isHillAlignedWithParty, scorePartisanship } from "./partisanship";

export type VoteValue = "Yea" | "Nay" | "Present" | "Not Voting";

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
  sources: Array<{ label: string; url: string; sourceType: string; primary?: boolean }>;
}

export function normalizeRollCall(raw: RawRollCall) {
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
