import {
  FEC_CYCLE,
  FEC_MIN_AMOUNT,
  donorDisplayName,
  fetchIndividualReceiptsOverThreshold,
  getOpenFecApiKey,
  isCountableIndividualGift,
  type OpenFecScheduleA,
} from "./openfec-client";

export const ARKANSAS_2026_FEC_CANDIDATES = [
  {
    slug: "chris-jones",
    label: "Chris Jones",
    office: "U.S. House AR-02",
    candidateId: "H6AR02286",
    committeeId: "C00912899",
    committeeName: "The Committee to Elect Chris Jones",
    fecUrl: "https://www.fec.gov/data/candidate/H6AR02286/",
  },
  {
    slug: "hallie-shoffner",
    label: "Hallie Shoffner",
    office: "U.S. Senate",
    candidateId: "S6AR00199",
    committeeId: "C00905471",
    committeeName: "Hallie Shoffner for Arkansas",
    fecUrl: "https://www.fec.gov/data/candidate/S6AR00199/",
  },
] as const;

export type ArkansasFecCandidateSlug = (typeof ARKANSAS_2026_FEC_CANDIDATES)[number]["slug"];

export type MaxDonorGift = {
  candidateSlug: ArkansasFecCandidateSlug;
  candidateLabel: string;
  candidateOffice: string;
  name: string;
  city: string;
  state: string;
  employer: string;
  occupation: string;
  amount: number;
  ytd: number | null;
  date: string;
  election: string;
  filingUrl: string;
};

export type MaxDonor = {
  key: string;
  name: string;
  city: string;
  state: string;
  employer: string;
  occupation: string;
  total: number;
  giftCount: number;
  candidateSlugs: ArkansasFecCandidateSlug[];
  lastDate: string;
  gifts: MaxDonorGift[];
};

export type MaxDonorReport = {
  cycle: number;
  minAmount: number;
  generatedAt: string;
  missingKey: boolean;
  error: string | null;
  giftCount: number;
  donors: MaxDonor[];
};

function clean(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed && trimmed !== "N/A" ? trimmed : "";
}

function zip5(value: string | null | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.slice(0, 5);
}

function donorKey(row: OpenFecScheduleA): string {
  const last = (row.contributor_last_name ?? "").trim().toLowerCase();
  const first = (row.contributor_first_name ?? "").trim().toLowerCase();
  const name = (row.contributor_name ?? `${last}|${first}`).trim().toLowerCase();
  return [name, (row.contributor_state ?? "").trim().toLowerCase(), zip5(row.contributor_zip)].join("|");
}

function toGift(
  row: OpenFecScheduleA,
  candidate: (typeof ARKANSAS_2026_FEC_CANDIDATES)[number],
): MaxDonorGift {
  return {
    candidateSlug: candidate.slug,
    candidateLabel: candidate.label,
    candidateOffice: candidate.office,
    name: donorDisplayName(row),
    city: clean(row.contributor_city),
    state: clean(row.contributor_state).toUpperCase(),
    employer: clean(row.contributor_employer),
    occupation: clean(row.contributor_occupation),
    amount: Number(row.contribution_receipt_amount ?? 0),
    ytd: row.contributor_aggregate_ytd == null ? null : Number(row.contributor_aggregate_ytd),
    date: row.contribution_receipt_date ?? "",
    election: row.fec_election_type_desc || row.election_type || "",
    filingUrl: row.pdf_url ?? "",
  };
}

function aggregateDonors(gifts: MaxDonorGift[], keys: string[]): MaxDonor[] {
  const byKey = new Map<string, MaxDonor>();

  gifts.forEach((gift, index) => {
    const key = keys[index] ?? `${gift.name}|${gift.state}|${index}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, {
        key,
        name: gift.name,
        city: gift.city,
        state: gift.state,
        employer: gift.employer,
        occupation: gift.occupation,
        total: gift.amount,
        giftCount: 1,
        candidateSlugs: [gift.candidateSlug],
        lastDate: gift.date,
        gifts: [gift],
      });
      return;
    }

    existing.total += gift.amount;
    existing.giftCount += 1;
    existing.gifts.push(gift);
    if (gift.date && gift.date > existing.lastDate) existing.lastDate = gift.date;
    if (!existing.candidateSlugs.includes(gift.candidateSlug)) {
      existing.candidateSlugs.push(gift.candidateSlug);
    }
    if (!existing.employer && gift.employer) existing.employer = gift.employer;
    if (!existing.occupation && gift.occupation) existing.occupation = gift.occupation;
    if (!existing.city && gift.city) existing.city = gift.city;
  });

  return [...byKey.values()].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
}

export async function loadArkansas2026MaxDonors(): Promise<MaxDonorReport> {
  const apiKey = getOpenFecApiKey();
  if (!apiKey) {
    return {
      cycle: FEC_CYCLE,
      minAmount: FEC_MIN_AMOUNT,
      generatedAt: new Date().toISOString(),
      missingKey: true,
      error: "OPENFEC_API_KEY is not set.",
      giftCount: 0,
      donors: [],
    };
  }

  try {
    const gifts: MaxDonorGift[] = [];
    const keys: string[] = [];

    for (const candidate of ARKANSAS_2026_FEC_CANDIDATES) {
      const rows = await fetchIndividualReceiptsOverThreshold(apiKey, candidate.committeeId);
      for (const row of rows) {
        if (!isCountableIndividualGift(row)) continue;
        gifts.push(toGift(row, candidate));
        keys.push(`${candidate.slug}|${donorKey(row)}`);
      }
    }

    return {
      cycle: FEC_CYCLE,
      minAmount: FEC_MIN_AMOUNT,
      generatedAt: new Date().toISOString(),
      missingKey: false,
      error: null,
      giftCount: gifts.length,
      donors: aggregateDonors(gifts, keys),
    };
  } catch (error) {
    return {
      cycle: FEC_CYCLE,
      minAmount: FEC_MIN_AMOUNT,
      generatedAt: new Date().toISOString(),
      missingKey: false,
      error: error instanceof Error ? error.message : "OpenFEC request failed.",
      giftCount: 0,
      donors: [],
    };
  }
}
