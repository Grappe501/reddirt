import {
  ADMINISTRATION_POSITION_RULE,
  PARTISAN_METHODOLOGY,
  type FactualVoteClass,
  type LegislativeVoteEvidence,
  type VoteChoice,
} from "./contracts";

export { ADMINISTRATION_POSITION_RULE, PARTISAN_METHODOLOGY };

const YEA = new Set(["YEA", "AYE", "YES", "Y", "1", "TRUE"]);
const NAY = new Set(["NAY", "NO", "N", "0", "FALSE"]);
const PRESENT = new Set(["PRESENT", "P"]);
const NOT_VOTING = new Set(["NOT VOTING", "NOT_VOTING", "NV", "ABSENT"]);

export function normalizeVoteChoice(value: unknown): VoteChoice {
  if (value == null || value === "") return "UNKNOWN";
  const raw = String(value).trim().toUpperCase().replace(/[_-]+/g, " ");
  if (YEA.has(raw)) return "YEA";
  if (NAY.has(raw)) return "NAY";
  if (PRESENT.has(raw)) return "PRESENT";
  if (NOT_VOTING.has(raw) || raw === "NOT VOTING") return "NOT_VOTING";
  if (raw === "UNKNOWN") return "UNKNOWN";
  return "UNKNOWN";
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function questionType(question: string | null): FactualVoteClass[] {
  if (!question) return ["SUBSTANTIVE"];
  const q = question.toLowerCase();
  const classes: FactualVoteClass[] = [];
  if (/nominat|confirm/.test(q)) classes.push("NOMINATION");
  if (/amendment/.test(q)) classes.push("AMENDMENT");
  if (/\bmotion\b/.test(q)) classes.push("MOTION");
  if (/on passage|final passage|\bpassage\b/.test(q)) classes.push("FINAL_PASSAGE");
  if (/previous question|motion to table|recommit|suspend the rules|adjourn|ordering the previous|agreeing to the resolution/.test(q)) {
    classes.push("PROCEDURAL");
  }
  if (!classes.includes("PROCEDURAL")) classes.push("SUBSTANTIVE");
  return classes;
}

function winningSide(totalYea: number | null, totalNay: number | null): VoteChoice {
  if (totalYea == null || totalNay == null) return "UNKNOWN";
  if (totalYea === totalNay) return "UNKNOWN";
  return totalYea > totalNay ? "YEA" : "NAY";
}

function supportRate(support: number | null, oppose: number | null): number | null {
  if (support == null || oppose == null) return null;
  const denom = support + oppose;
  if (denom <= 0) return null;
  return support / denom;
}

export function classifyVote(vote: LegislativeVoteEvidence): FactualVoteClass[] {
  const classes = new Set<FactualVoteClass>(questionType(vote.question));
  if (vote.actorVote !== "UNKNOWN" && vote.partyPosition !== "UNKNOWN") {
    classes.add(vote.actorVote === vote.partyPosition ? "VOTED_WITH_PARTY" : "VOTED_AGAINST_PARTY");
  }
  if (vote.actorVote !== "UNKNOWN" && vote.republicanMajorityPosition !== "UNKNOWN") {
    classes.add(
      vote.actorVote === vote.republicanMajorityPosition
        ? "VOTED_WITH_REPUBLICAN_MAJORITY"
        : "VOTED_AGAINST_REPUBLICAN_MAJORITY",
    );
  }
  if (vote.actorVote !== "UNKNOWN" && vote.presidentPosition !== "UNKNOWN") {
    classes.add(
      vote.actorVote === vote.presidentPosition
        ? "VOTED_WITH_DOCUMENTED_ADMINISTRATION"
        : "VOTED_AGAINST_DOCUMENTED_ADMINISTRATION",
    );
  }

  const { republicanYea, republicanNay, democraticYea, democraticNay, totalYea, totalNay } = vote.partySplit;
  const win = winningSide(totalYea, totalNay);
  if (totalYea != null && totalNay != null) {
    const share = totalYea / (totalYea + totalNay);
    if (share >= 0.995 || share <= 0.005) classes.add("UNANIMOUS");
    else if (share >= 0.95 || share <= 0.05) classes.add("NEAR_UNANIMOUS");
    const winnerShare = win === "YEA" ? share : 1 - share;
    if (winnerShare > 0.5 && winnerShare <= 0.55) classes.add("NARROW_PARTISAN");
  }

  const rWin = win === "YEA" ? supportRate(republicanYea, republicanNay) : supportRate(republicanNay, republicanYea);
  const dWin = win === "YEA" ? supportRate(democraticYea, democraticNay) : supportRate(democraticNay, democraticYea);
  if (rWin != null && dWin != null) {
    if (rWin >= 0.4 && dWin >= 0.4) classes.add("BIPARTISAN_MAJORITY");
    const majority = Math.max(rWin, dWin);
    const minority = Math.min(rWin, dWin);
    if (majority >= 0.8 && minority < 0.2) classes.add("HIGHLY_PARTISAN");
  }

  return [...classes];
}

export function rate(numerator: number, denominator: number, methodology: string) {
  return {
    numerator,
    denominator,
    rate: denominator > 0 ? numerator / denominator : null,
    methodology,
  };
}

export function asNumber(value: unknown): number | null {
  return numberOrNull(value);
}
