import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { classifyVote, normalizeVoteChoice, asNumber } from "./classify";
import type { LegislativeVoteEvidence, VoteChoice } from "./contracts";
import { classifyIssueTags } from "./taxonomy";

function firstString(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}

function firstChoice(record: Record<string, unknown>, keys: string[]): VoteChoice {
  for (const key of keys) {
    if (key in record) return normalizeVoteChoice(record[key]);
  }
  return "UNKNOWN";
}

function labelsOf(record: Record<string, unknown>): string[] {
  const raw = record.originalTopicLabels ?? record.topics ?? record.tags ?? record.issueTags ?? record.subjects;
  if (Array.isArray(raw)) return raw.map((item) => String(item)).filter(Boolean);
  if (typeof raw === "string" && raw.trim()) return raw.split(/[|,;]/).map((item) => item.trim()).filter(Boolean);
  return [];
}

export function normalizeSourceVote(record: Record<string, unknown>, index: number): LegislativeVoteEvidence {
  const billTitle = firstString(record, ["billTitle", "bill_title", "title", "voteTitle", "question_text"]);
  const question = firstString(record, ["question", "vote_question", "voteQuestion"]);
  const originalTopicLabels = labelsOf(record);
  const vote: LegislativeVoteEvidence = {
    voteId:
      firstString(record, ["voteId", "vote_id", "id", "rollCallId"]) ??
      `${firstString(record, ["congress"]) ?? "x"}-${firstString(record, ["rollCallNumber", "roll_call", "rollCall"]) ?? index}`,
    rollCallNumber: firstString(record, ["rollCallNumber", "roll_call", "rollCall", "roll_call_number"]),
    congress: asNumber(record.congress ?? record.congressNumber),
    session: asNumber(record.session ?? record.sessionNumber),
    voteDate: firstString(record, ["voteDate", "vote_date", "date", "datetime"]),
    billNumber: firstString(record, ["billNumber", "bill_number", "bill", "legislation"]),
    billTitle,
    originalTopicLabels,
    question,
    actorVote: firstChoice(record, ["actorVote", "memberVote", "hillVote", "vote", "position", "cast"]),
    result: firstString(record, ["result", "voteResult"]),
    partyPosition: firstChoice(record, ["partyPosition", "party_position", "gopPosition", "republicanPosition"]),
    presidentPosition: firstChoice(record, [
      "presidentPosition",
      "president_position",
      "administrationPosition",
      "trumpPosition",
      "whiteHousePosition",
    ]),
    leadershipPosition: firstChoice(record, ["leadershipPosition", "leadership_position", "speakerPosition"]),
    republicanMajorityPosition: firstChoice(record, [
      "republicanMajorityPosition",
      "republican_majority",
      "gopMajorityPosition",
    ]),
    issueTags: classifyIssueTags([billTitle, question, ...originalTopicLabels].filter(Boolean).join(" "), originalTopicLabels),
    sourceUrl: firstString(record, ["sourceUrl", "source_url", "url", "clerkUrl", "congressUrl"]),
    sourceAuthority: firstString(record, ["sourceAuthority", "source_authority", "authority", "source"]),
    confidence: "MEDIUM",
    classes: [],
    partySplit: {
      republicanYea: asNumber(record.republicanYea ?? record.gopYea ?? record.rYea),
      republicanNay: asNumber(record.republicanNay ?? record.gopNay ?? record.rNay),
      democraticYea: asNumber(record.democraticYea ?? record.demYea ?? record.dYea),
      democraticNay: asNumber(record.democraticNay ?? record.demNay ?? record.dNay),
      totalYea: asNumber(record.totalYea ?? record.yea ?? record.ayes),
      totalNay: asNumber(record.totalNay ?? record.nay ?? record.noes),
    },
  };
  if (vote.republicanMajorityPosition === "UNKNOWN") {
    const rYea = vote.partySplit.republicanYea;
    const rNay = vote.partySplit.republicanNay;
    if (rYea != null && rNay != null && rYea !== rNay) {
      vote.republicanMajorityPosition = rYea > rNay ? "YEA" : "NAY";
    }
  }
  vote.classes = classifyVote(vote);
  if (!vote.sourceUrl) vote.confidence = "LOW";
  if (vote.partyPosition === "UNKNOWN" && vote.presidentPosition === "UNKNOWN") vote.confidence = "LOW";
  return vote;
}

function parseCsv(text: string): Record<string, unknown>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""));
    const record: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      record[header] = cells[index] ?? "";
    });
    return record;
  });
}

function extractRecords(parsed: unknown): Record<string, unknown>[] {
  if (Array.isArray(parsed)) return parsed.filter((item) => item && typeof item === "object") as Record<string, unknown>[];
  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    for (const key of ["votes", "records", "items", "rollCalls", "data"]) {
      if (Array.isArray(obj[key])) return extractRecords(obj[key]);
    }
  }
  return [];
}

function collectFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") out.push(...collectFiles(full));
    else if (entry.isFile() && /\.(json|csv)$/i.test(entry.name) && !/package-lock|tsconfig/i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

export function loadVotesFromCorpus(dir: string | null): LegislativeVoteEvidence[] {
  if (!dir || !existsSync(dir) || !statSync(dir).isDirectory()) return [];
  const votes: LegislativeVoteEvidence[] = [];
  for (const file of collectFiles(dir)) {
    const raw = readFileSync(file, "utf8");
    const records = file.toLowerCase().endsWith(".csv") ? parseCsv(raw) : extractRecords(JSON.parse(raw));
    records.forEach((record, index) => votes.push(normalizeSourceVote(record, votes.length + index)));
  }
  return votes;
}

export function uniqueVoteErrors(votes: LegislativeVoteEvidence[]): string[] {
  const ids = new Set<string>();
  const roll = new Set<string>();
  const errors: string[] = [];
  for (const vote of votes) {
    if (ids.has(vote.voteId)) errors.push(`duplicate voteId ${vote.voteId}`);
    ids.add(vote.voteId);
    if (vote.congress && vote.rollCallNumber) {
      const key = `${vote.congress}-${vote.session ?? 0}-${vote.rollCallNumber}`;
      if (roll.has(key)) errors.push(`duplicate roll call ${key}`);
      roll.add(key);
    }
  }
  return errors;
}
