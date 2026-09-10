import {
  FEC_CYCLE,
  FEC_HISTORICAL_CYCLES,
  donorDisplayName,
  fetchIndividualReceiptsOverThreshold,
  getOpenFecApiKey,
  isCountableIndividualGift,
  isCurrentCycleDate,
  type OpenFecScheduleA,
} from "./openfec-client";

export type FecCandidate = {
  slug: string;
  label: string;
  office: string;
  candidateId: string;
  committeeId: string;
  committeeName: string;
  fecUrl: string;
};

export type FecDonorTabId = "jones-shoffner" | "russell-ryerse-green" | "french-hill";

export type FecDonorTab = {
  id: FecDonorTabId;
  label: string;
  minAmount: number;
  candidates: FecCandidate[];
};

export const FEC_DONOR_TABS: FecDonorTab[] = [
  {
    id: "jones-shoffner",
    label: "Jones & Shoffner",
    minAmount: 3000,
    candidates: [
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
    ],
  },
  {
    id: "russell-ryerse-green",
    label: "Russell, Ryerse & Green",
    minAmount: 3000,
    candidates: [
      {
        slug: "james-russell",
        label: "James Russell",
        office: "U.S. House AR-04",
        candidateId: "H6AR04084",
        committeeId: "C00924621",
        committeeName: "James Russell for Arkansas",
        fecUrl: "https://www.fec.gov/data/candidate/H6AR04084/",
      },
      {
        slug: "robb-ryerse",
        label: "Robb Ryerse",
        office: "U.S. House AR-03",
        candidateId: "H6AR03128",
        committeeId: "C00908400",
        committeeName: "Robb for Congress",
        fecUrl: "https://www.fec.gov/data/candidate/H6AR03128/",
      },
      {
        slug: "terri-green",
        label: "Terri Green",
        office: "U.S. House AR-01",
        candidateId: "H6AR01155",
        committeeId: "C00930800",
        committeeName: "Terri Green Election Campaign Committee",
        fecUrl: "https://www.fec.gov/data/candidate/H6AR01155/",
      },
    ],
  },
  {
    id: "french-hill",
    label: "French Hill",
    minAmount: 2000,
    candidates: [
      {
        slug: "french-hill",
        label: "French Hill",
        office: "U.S. House AR-02",
        candidateId: "H4AR02141",
        committeeId: "C00551275",
        committeeName: "French Hill for Arkansas",
        fecUrl: "https://www.fec.gov/data/candidate/H4AR02141/",
      },
    ],
  },
];

export const ARKANSAS_2026_FEC_CANDIDATES = FEC_DONOR_TABS.flatMap((tab) => tab.candidates);

export type MaxDonorGift = {
  candidateSlug: string;
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
  cycle: "current" | "historical";
};

export type MaxDonor = {
  key: string;
  name: string;
  city: string;
  state: string;
  employer: string;
  occupation: string;
  total: number;
  historicalTotal: number;
  giftCount: number;
  candidateSlugs: string[];
  lastDate: string;
  gifts: MaxDonorGift[];
  historicalGifts: MaxDonorGift[];
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

export type FecDonorTabView = FecDonorTab & {
  report: MaxDonorReport;
};

function clean(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed && trimmed !== "N/A" ? trimmed : "";
}

function zip5(value: string | null | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.slice(0, 5);
}

function normalizeToken(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function donorKey(row: OpenFecScheduleA): string {
  let last = normalizeToken(row.contributor_last_name);
  let first = normalizeToken((row.contributor_first_name ?? "").split(/\s+/)[0]);
  const raw = (row.contributor_name ?? "").trim();
  if ((!last || !first) && raw) {
    if (raw.includes(",")) {
      const [family, rest] = raw.split(",");
      last = last || normalizeToken(family);
      first = first || normalizeToken((rest ?? "").trim().split(/\s+/)[0]);
    } else {
      const parts = raw.split(/\s+/).filter(Boolean);
      first = first || normalizeToken(parts[0]);
      last = last || normalizeToken(parts[parts.length - 1]);
    }
  }
  const identity = last && first ? `${last}|${first}` : raw.toLowerCase();
  return [identity, (row.contributor_state ?? "").trim().toLowerCase(), zip5(row.contributor_zip)].join("|");
}

function toGift(
  row: OpenFecScheduleA,
  candidate: FecCandidate,
  cycle: "current" | "historical",
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
    cycle,
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
        historicalTotal: 0,
        giftCount: 1,
        candidateSlugs: [gift.candidateSlug],
        lastDate: gift.date,
        gifts: [gift],
        historicalGifts: [],
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

function emptyReport(minAmount: number, error: string | null, missingKey: boolean): MaxDonorReport {
  return {
    cycle: FEC_CYCLE,
    minAmount,
    generatedAt: new Date().toISOString(),
    missingKey,
    error,
    giftCount: 0,
    donors: [],
  };
}

export async function loadDonorReport(
  candidates: FecCandidate[],
  minAmount: number,
): Promise<MaxDonorReport> {
  const apiKey = getOpenFecApiKey();
  if (!apiKey) {
    return emptyReport(minAmount, "OPENFEC_API_KEY is not set.", true);
  }

  try {
    const gifts: MaxDonorGift[] = [];
    const keys: string[] = [];

    const rowSets = await Promise.all(
      candidates.map(async (candidate) => {
        const [currentRows, ...historicalSets] = await Promise.all([
          fetchIndividualReceiptsOverThreshold(apiKey, candidate.committeeId, minAmount, [FEC_CYCLE]),
          ...FEC_HISTORICAL_CYCLES.map((period) =>
            fetchIndividualReceiptsOverThreshold(apiKey, candidate.committeeId, minAmount, [period]),
          ),
        ]);
        return { candidate, currentRows, historicalRows: historicalSets.flat() };
      }),
    );

    const historicalByKey = new Map<string, MaxDonorGift[]>();
    for (const { candidate, historicalRows } of rowSets) {
      for (const row of historicalRows) {
        if (!isCountableIndividualGift(row, minAmount)) continue;
        if (isCurrentCycleDate(row.contribution_receipt_date)) continue;
        const gift = toGift(row, candidate, "historical");
        const key = donorKey(row);
        const list = historicalByKey.get(key) ?? [];
        list.push(gift);
        historicalByKey.set(key, list);
      }
    }

    for (const { candidate, currentRows } of rowSets) {
      for (const row of currentRows) {
        if (!isCountableIndividualGift(row, minAmount)) continue;
        if (!isCurrentCycleDate(row.contribution_receipt_date)) continue;
        gifts.push(toGift(row, candidate, "current"));
        keys.push(donorKey(row));
      }
    }

    const donors = aggregateDonors(gifts, keys).map((donor) => {
      const historicalGifts = [...(historicalByKey.get(donor.key) ?? [])].sort(
        (a, b) => (b.date || "").localeCompare(a.date || "") || b.amount - a.amount,
      );
      return {
        ...donor,
        historicalGifts,
        historicalTotal: historicalGifts.reduce((sum, gift) => sum + gift.amount, 0),
      };
    });

    return {
      cycle: FEC_CYCLE,
      minAmount,
      generatedAt: new Date().toISOString(),
      missingKey: false,
      error: null,
      giftCount: gifts.length,
      donors,
    };
  } catch (error) {
    return emptyReport(minAmount, error instanceof Error ? error.message : "OpenFEC request failed.", false);
  }
}

export async function loadArkansas2026MaxDonors(): Promise<MaxDonorReport> {
  const tab = FEC_DONOR_TABS[0];
  return loadDonorReport(tab.candidates, tab.minAmount);
}

export async function loadFecDonorTabs(): Promise<FecDonorTabView[]> {
  return Promise.all(
    FEC_DONOR_TABS.map(async (tab) => ({
      ...tab,
      report: await loadDonorReport(tab.candidates, tab.minAmount),
    })),
  );
}
