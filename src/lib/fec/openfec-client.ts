const OPENFEC_BASE = "https://api.open.fec.gov/v1";
const CYCLE = 2026;

type OpenFecPagination = {
  count: number;
  page: number;
  pages: number;
  per_page: number;
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
  page: number,
  minAmount: number,
): Promise<OpenFecList<OpenFecScheduleA>> {
  const params = new URLSearchParams({
    api_key: apiKey,
    committee_id: committeeId,
    two_year_transaction_period: String(CYCLE),
    min_amount: String(minAmount),
    is_individual: "true",
    per_page: "100",
    page: String(page),
    sort: "-contribution_receipt_amount",
  });

  const response = await fetch(`${OPENFEC_BASE}/schedules/schedule_a/?${params.toString()}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`OpenFEC returned ${response.status} for committee ${committeeId}`);
  }

  return (await response.json()) as OpenFecList<OpenFecScheduleA>;
}

export async function fetchIndividualReceiptsOverThreshold(
  apiKey: string,
  committeeId: string,
  minAmount: number,
): Promise<OpenFecScheduleA[]> {
  const first = await fetchScheduleAPage(apiKey, committeeId, 1, minAmount);
  const pages = Math.max(1, first.pagination?.pages ?? 1);
  const rows = [...(first.results ?? [])];

  for (let page = 2; page <= pages; page += 1) {
    const next = await fetchScheduleAPage(apiKey, committeeId, page, minAmount);
    rows.push(...(next.results ?? []));
  }

  return rows;
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
