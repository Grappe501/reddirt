export type Side = "Yea" | "Nay" | "Split" | "Unknown";

export interface PartySplitInput {
  republicanYea: number;
  republicanNay: number;
  democratYea: number;
  democratNay: number;
}

export interface PartisanshipResult {
  republicanMajorityPosition: Side;
  democratMajorityPosition: Side;
  republicanUnityPct: number | null;
  democratUnityPct: number | null;
  partiesOpposed: boolean;
  highPartisanship: boolean;
  partisanshipScore: number | null;
}

const pct = (part: number, total: number) => (total > 0 ? part / total : null);

function majority(yea: number, nay: number): Side {
  if (yea === 0 && nay === 0) return "Unknown";
  if (yea === nay) return "Split";
  return yea > nay ? "Yea" : "Nay";
}

function unity(yea: number, nay: number): number | null {
  const total = yea + nay;
  if (!total) return null;
  return Math.max(yea, nay) / total;
}

export function scorePartisanship(input: PartySplitInput): PartisanshipResult {
  const republicanMajorityPosition = majority(input.republicanYea, input.republicanNay);
  const democratMajorityPosition = majority(input.democratYea, input.democratNay);
  const republicanUnityPct = unity(input.republicanYea, input.republicanNay);
  const democratUnityPct = unity(input.democratYea, input.democratNay);

  const partiesOpposed =
    (republicanMajorityPosition === "Yea" && democratMajorityPosition === "Nay") ||
    (republicanMajorityPosition === "Nay" && democratMajorityPosition === "Yea");

  const highPartisanship = Boolean(
    partiesOpposed &&
      republicanUnityPct !== null &&
      democratUnityPct !== null &&
      republicanUnityPct >= 0.9 &&
      democratUnityPct >= 0.9,
  );

  const partisanshipScore =
    republicanUnityPct !== null && democratUnityPct !== null && partiesOpposed
      ? Math.round(((republicanUnityPct + democratUnityPct) / 2) * 1000) / 10
      : null;

  return {
    republicanMajorityPosition,
    democratMajorityPosition,
    republicanUnityPct: republicanUnityPct === null ? null : Math.round(republicanUnityPct * 1000) / 10,
    democratUnityPct: democratUnityPct === null ? null : Math.round(democratUnityPct * 1000) / 10,
    partiesOpposed,
    highPartisanship,
    partisanshipScore,
  };
}

export function isHillAlignedWithParty(hillVote: string, partyPosition: Side): boolean | null {
  if (partyPosition !== "Yea" && partyPosition !== "Nay") return null;
  if (hillVote !== "Yea" && hillVote !== "Nay") return null;
  return hillVote === partyPosition;
}
