const OPENFEC_BASE = "https://api.open.fec.gov/v1";
const CYCLE = 2026;
const HISTORICAL_CYCLES = [2024, 2022, 2020, 2018, 2016, 2014];
const CYCLE_START = "2025-01-01";

type OpenFecLastIndexes = {
  last_index?: string;
  last_contribution_receipt_amount?: string;
  last_contribution_receipt_date?: string;
};

type OpenFecPagination = {
  count: number;
  page: number;
  pages: number;
  per_page: number;
  last_indexes?: OpenFecLastIndexes | null;
};

type OpenFecList<T> = {
  results: T[];
  pagination: OpenFecPagination;
};

export type OpenFecScheduleA = {
  contributor_name: string | null;
  contributor_first_name: string | null;
  contributor_last_name: string | null;
  contributor_city: string | null;
  contributor_state: string | null;
  contributor_employer: string | null;
  contributor_occupation: string | null;
  contributor_zip: string | null;
  contributor_aggregate_ytd: number | null;
  contribution_receipt_amount: number | null;
  contribution_receipt_date: string | null;
  fec_election_type_desc: string | null;
  election_type: string | null;
  is_individual: boolean | null;
  memoed_subtotal: boolean | null;
  entity_type: string | null;
  pdf_url: string | null;
  committee_id: string | null;
  transaction_id: string | null;
};

export function getOpenFecApiKey(): string | null {
  const key = process.env.OPENFEC_API_KEY?.trim();
  return key ? key : null;
}

function formatName(row: OpenFecScheduleA): string {
  if (row.contributor_name?.trim()) return titleCaseName(row.contributor_name.trim());
  const parts = [row.contributor_first_name, row.contributor_last_name].filter(Boolean);
  return parts.length ? titleCaseName(parts.join(" ")) : "Unknown donor";
}

function titleCaseName(value: string): string {
  return value
    .toLowerCase()
    .split(/(\s+|, )/)
    .map((part) => {
      if (part === ", " || /^\s+$/.test(part)) return part;
      if (!part) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join("");
}

async function fetchScheduleAPage(
  apiKey: string,
  committeeId: string,
  minAmount: number,
  periods: number[],
  lastIndexes?: OpenFecLastIndexes | null,
): Promise<OpenFecList<OpenFecScheduleA>> {
  const params = new URLSearchParams({
    api_key: apiKey,
    committee_id: committeeId,
    min_amount: String(minAmount),
    is_individual: "true",
    per_page: "100",
    sort: "-contribution_receipt_amount",
  });
  for (const period of periods) {
    params.append("two_year_transaction_period", String(period));
  }
  if (lastIndexes?.last_index) params.set("last_index", lastIndexes.last_index);
  if (lastIndexes?.last_contribution_receipt_amount) {
    params.set("last_contribution_receipt_amount", lastIndexes.last_contribution_receipt_amount);
  }
  if (lastIndexes?.last_contribution_receipt_date) {
    params.set("last_contribution_receipt_date", lastIndexes.last_contribution_receipt_date);
  }

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(`${OPENFEC_BASE}/schedules/schedule_a/?${params.toString()}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (response.ok) {
      return (await response.json()) as OpenFecList<OpenFecScheduleA>;
    }
    lastError = new Error(`OpenFEC returned ${response.status} for committee ${committeeId}`);
    if (response.status !== 429 && response.status < 500) break;
    await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)));
  }
  throw lastError ?? new Error(`OpenFEC request failed for committee ${committeeId}`);
}

export async function fetchIndividualReceiptsOverThreshold(
  apiKey: string,
  committeeId: string,
  minAmount: number,
  periods: number[] = [CYCLE],
): Promise<OpenFecScheduleA[]> {
  const seen = new Set<string>();
  const rows: OpenFecScheduleA[] = [];
  let lastIndexes: OpenFecLastIndexes | null = null;

  for (let page = 0; page < 50; page += 1) {
    const batch = await fetchScheduleAPage(apiKey, committeeId, minAmount, periods, lastIndexes);
    const results = batch.results ?? [];
    if (results.length === 0) break;

    let added = 0;
    for (const row of results) {
      const id = row.transaction_id || `${row.contributor_name}|${row.contribution_receipt_date}|${row.contribution_receipt_amount}|${rows.length}`;
      if (seen.has(id)) continue;
      seen.add(id);
      rows.push(row);
      added += 1;
    }

    const next = batch.pagination?.last_indexes ?? null;
    if (added === 0 || results.length < 100 || !next?.last_index) break;
    lastIndexes = next;
  }

  return rows;
}

export function isCurrentCycleDate(date: string | null | undefined): boolean {
  if (!date) return true;
  return date >= CYCLE_START;
}

export function isCountableIndividualGift(row: OpenFecScheduleA, minAmount: number): boolean {
  if (row.memoed_subtotal) return false;
  if (row.is_individual === false) return false;
  if (row.entity_type && row.entity_type !== "IND") return false;
  const amount = Number(row.contribution_receipt_amount ?? 0);
  return amount >= minAmount;
}

export function donorDisplayName(row: OpenFecScheduleA): string {
  return formatName(row);
}

export const FEC_CYCLE = CYCLE;
export const FEC_HISTORICAL_CYCLES = HISTORICAL_CYCLES;
