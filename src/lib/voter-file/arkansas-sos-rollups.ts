/**
 * Arkansas SOS VR.csv / VH.csv helpers for aggregate location rollups.
 * Column layout: SOS statewide export (County name, VoterID, TEXT_RES_CITY, CDE_PARTY, …).
 */
import { resolveRegistryCountyFromLabel } from "@/lib/county/resolve-county-label";
import {
  parseDelimitedLine,
  type ParseSosVoterFileResult,
  parseSosVoterFileContent,
} from "@/lib/voter-file/sos-voter-csv";

export const AR_SOS_VR_COLUMNS = {
  county: "County",
  voterId: "VoterID",
  status: "CDE_REGISTRANT_STATUS",
  city: "TEXT_RES_CITY",
  party: "CDE_PARTY",
  registrationDate: "date_of_registration",
  precinct: "PrecinctName",
} as const;

export type VhElectionColumn = {
  contestKey: string;
  label: string;
  participationIdx: number;
  partyVotedIdx: number | null;
};

export function slugifyPlaceName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function electionPlanCountySlugFromName(countyName: string): string {
  return slugifyPlaceName(countyName.replace(/\s+County$/i, ""));
}

export function normalizePartyCode(raw: string | null | undefined): keyof import("./location-rollups-types").PartyRegistrationCounts | "blank" {
  const p = (raw ?? "").trim().toUpperCase();
  if (!p) return "blank";
  if (p === "D" || p === "DEM" || p === "DEMOCRAT") return "democrat";
  if (p === "R" || p === "REP" || p === "REPUBLICAN") return "republican";
  if (p === "O" || p === "I" || p === "G" || p === "L" || p === "OTHER") return "other";
  return "other";
}

export function normalizePrimaryBallotParty(raw: string | null | undefined): "dem" | "rep" | "other" | null {
  const p = (raw ?? "").trim().toUpperCase();
  if (!p) return null;
  if (p === "D" || p === "DEM") return "dem";
  if (p === "R" || p === "REP") return "rep";
  return "other";
}

export function contestKeyFromParticipationHeader(header: string): string {
  const h = header.trim();
  const compact = h.replace(/\s+/g, "");
  const generalYear = compact.match(/^General(\d{4})$/i);
  if (generalYear) return `${generalYear[1]}_GENERAL`;
  const primaryYear = compact.match(/^Primary(\d{4})$/i);
  if (primaryYear) return `${primaryYear[1]}_PRIMARY`;
  const primaryRunoff = compact.match(/^PrimaryRunoff(\d{4})$/i);
  if (primaryRunoff) return `${primaryRunoff[1]}_PRIMARY_RUNOFF`;

  const spacedPrimary = h.match(/^(\d{4})\s+Primary(\s+Runoff)?$/i);
  if (spacedPrimary) return `${spacedPrimary[1]}_PRIMARY${spacedPrimary[2] ? "_RUNOFF" : ""}`;
  const spacedGeneral = h.match(/^(\d{4})\s+General(\s+Runoff)?$/i);
  if (spacedGeneral) return `${spacedGeneral[1]}_GENERAL${spacedGeneral[2] ? "_RUNOFF" : ""}`;

  return h
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function parseVhElectionColumns(headers: string[]): VhElectionColumn[] {
  const out: VhElectionColumn[] = [];
  for (let i = 0; i < headers.length; i += 1) {
    const label = headers[i]!.trim();
    if (!label || label === "KEY_REGISTRANT" || label === "VoterID") continue;
    if (/CountyVotedIn$|PartyVoted$|HowVoted$|VotedIn$/i.test(label)) continue;

    const partyHeader = `${label}PartyVoted`;
    const partyIdx = headers.findIndex((h) => h.trim() === partyHeader);
    out.push({
      contestKey: contestKeyFromParticipationHeader(label),
      label,
      participationIdx: i,
      partyVotedIdx: partyIdx >= 0 ? partyIdx : null,
    });
  }
  return out;
}

export function detectDelimiter(headerLine: string): string {
  const tabs = (headerLine.match(/\t/g) ?? []).length;
  const commas = (headerLine.match(/,/g) ?? []).length;
  if (tabs > commas) return "\t";
  if (headerLine.includes("|")) return "|";
  return ",";
}

export function parseVrHeaderLine(headerLine: string): { delimiter: string; headers: string[]; index: Map<string, number> } {
  const delimiter = detectDelimiter(headerLine);
  const headers = parseDelimitedLine(headerLine, delimiter).map((h) => h.replace(/^\uFEFF/, "").trim());
  const index = new Map<string, number>();
  for (let i = 0; i < headers.length; i += 1) {
    const key = headers[i]!.toLowerCase();
    if (!index.has(key)) index.set(key, i);
  }
  return { delimiter, headers, index };
}

export function getIndexedCell(cells: string[], index: Map<string, number>, colName: string): string {
  const i = index.get(colName.trim().toLowerCase());
  if (i == null) return "";
  return (cells[i] ?? "").trim().replace(/^"(.*)"$/, "$1");
}

export function resolveCountySlugFromVrCountyCell(countyCell: string): { countySlug: string; countyName: string; fips: string } | null {
  const reg = resolveRegistryCountyFromLabel(countyCell);
  if (!reg) return null;
  return {
    countySlug: electionPlanCountySlugFromName(reg.displayName),
    countyName: reg.displayName.replace(/\s+County$/i, ""),
    fips: reg.fips,
  };
}

/** Re-export generic parser for small fixtures / tests. */
export function parseGenericSosVoterFile(text: string): ParseSosVoterFileResult {
  return parseSosVoterFileContent(text);
}

export const FEATURED_CONTEST_KEYS = [
  "2024_GENERAL",
  "2024_PRIMARY",
  "2022_GENERAL",
  "2022_PRIMARY",
  "2020_GENERAL",
  "2018_GENERAL",
] as const;
