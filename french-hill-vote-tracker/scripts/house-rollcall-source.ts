export const HOUSE_CLERK_BASE = "https://clerk.house.gov";

export type CongressSessionMap = Record<number, { firstYear: number; secondYear: number }>;

export const HILL_MEMBER = {
  bioguideId: "H001072",
  name: "J. French Hill",
  state: "AR",
  district: "2",
  party: "Republican",
} as const;

export function congressFromYear(year: number): number {
  return Math.floor((year - 1789) / 2) + 1;
}

export function clerkYearIndexUrl(year: number): string {
  return `${HOUSE_CLERK_BASE}/evs/${year}/index.asp`;
}

export function clerkVotePageUrl(year: number, rollCall: number): string {
  return `${HOUSE_CLERK_BASE}/Votes/${year}${rollCall}`;
}

export function clerkVoteXmlUrl(year: number, rollCall: number): string {
  const roll = String(rollCall).padStart(3, "0");
  return `${HOUSE_CLERK_BASE}/evs/${year}/roll${roll}.xml`;
}

export function supportedYears(): number[] {
  const years: number[] = [];
  for (let year = 2015; year <= 2026; year += 1) years.push(year);
  return years;
}
