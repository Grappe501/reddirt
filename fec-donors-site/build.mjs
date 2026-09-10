import { writeFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CYCLE = 2026;
const HISTORICAL_CYCLES = [2024, 2022, 2020, 2018, 2016, 2014];
const CYCLE_START = "2025-01-01";
const OPENFEC_BASE = "https://api.open.fec.gov/v1";

const TABS = [
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
        fecUrl: "https://www.fec.gov/data/candidate/H6AR02286/",
      },
      {
        slug: "hallie-shoffner",
        label: "Hallie Shoffner",
        office: "U.S. Senate",
        candidateId: "S6AR00199",
        committeeId: "C00905471",
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
        fecUrl: "https://www.fec.gov/data/candidate/H6AR04084/",
      },
      {
        slug: "robb-ryerse",
        label: "Robb Ryerse",
        office: "U.S. House AR-03",
        candidateId: "H6AR03128",
        committeeId: "C00908400",
        fecUrl: "https://www.fec.gov/data/candidate/H6AR03128/",
      },
      {
        slug: "terri-green",
        label: "Terri Green",
        office: "U.S. House AR-01",
        candidateId: "H6AR01155",
        committeeId: "C00930800",
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
        fecUrl: "https://www.fec.gov/data/candidate/H4AR02141/",
      },
    ],
  },
];

function loadEnvKey() {
  if (process.env.OPENFEC_API_KEY?.trim()) return process.env.OPENFEC_API_KEY.trim();
  const envPath = path.resolve(ROOT, "..", ".env");
  return readFile(envPath, "utf8")
    .then((text) => {
      const line = text.split(/\r?\n/).find((row) => row.startsWith("OPENFEC_API_KEY="));
      if (!line) return null;
      return line.slice("OPENFEC_API_KEY=".length).trim().replace(/^["']|["']$/g, "");
    })
    .catch(() => null);
}

function titleCaseName(value) {
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

function donorName(row) {
  if (row.contributor_name?.trim()) return titleCaseName(row.contributor_name.trim());
  const parts = [row.contributor_first_name, row.contributor_last_name].filter(Boolean);
  return parts.length ? titleCaseName(parts.join(" ")) : "Unknown donor";
}

function clean(value) {
  const trimmed = value?.trim();
  return trimmed && trimmed !== "N/A" ? trimmed : "";
}

function zip5(value) {
  return (value ?? "").replace(/\D/g, "").slice(0, 5);
}

function donorKey(row) {
  const last = (row.contributor_last_name ?? "").trim().toLowerCase();
  const first = (row.contributor_first_name ?? "").trim().toLowerCase();
  const name = (row.contributor_name ?? `${last}|${first}`).trim().toLowerCase();
  return [name, (row.contributor_state ?? "").trim().toLowerCase(), zip5(row.contributor_zip)].join("|");
}

function isCountable(row, minAmount) {
  if (row.memoed_subtotal) return false;
  if (row.is_individual === false) return false;
  if (row.entity_type && row.entity_type !== "IND") return false;
  return Number(row.contribution_receipt_amount ?? 0) >= minAmount;
}

function isCurrentCycleDate(date) {
  if (!date) return true;
  return date >= CYCLE_START;
}

async function fetchPage(apiKey, committeeId, page, minAmount, period) {
  const params = new URLSearchParams({
    api_key: apiKey,
    committee_id: committeeId,
    two_year_transaction_period: String(period),
    min_amount: String(minAmount),
    is_individual: "true",
    per_page: "100",
    page: String(page),
    sort: "-contribution_receipt_amount",
  });
  const response = await fetch(`${OPENFEC_BASE}/schedules/schedule_a/?${params}`);
  if (!response.ok) throw new Error(`OpenFEC ${response.status} for ${committeeId} cycle ${period}`);
  return response.json();
}

async function fetchCommittee(apiKey, committeeId, minAmount, period) {
  const first = await fetchPage(apiKey, committeeId, 1, minAmount, period);
  const pages = Math.max(1, first.pagination?.pages ?? 1);
  const rows = [...(first.results ?? [])];
  for (let page = 2; page <= pages; page += 1) {
    const next = await fetchPage(apiKey, committeeId, page, minAmount, period);
    rows.push(...(next.results ?? []));
  }
  return rows;
}

function toGift(row, candidate, cycle) {
  return {
    candidateSlug: candidate.slug,
    candidateLabel: candidate.label,
    candidateOffice: candidate.office,
    name: donorName(row),
    city: clean(row.contributor_city),
    state: clean(row.contributor_state).toUpperCase(),
    employer: clean(row.contributor_employer),
    occupation: clean(row.contributor_occupation),
    amount: Number(row.contribution_receipt_amount ?? 0),
    date: row.contribution_receipt_date ?? "",
    election: row.fec_election_type_desc || row.election_type || "",
    filingUrl: row.pdf_url ?? "",
    cycle,
  };
}

function aggregate(gifts, keys) {
  const byKey = new Map();
  gifts.forEach((gift, index) => {
    const key = keys[index] ?? `${gift.name}|${index}`;
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
    if (!existing.candidateSlugs.includes(gift.candidateSlug)) existing.candidateSlugs.push(gift.candidateSlug);
    if (!existing.employer && gift.employer) existing.employer = gift.employer;
    if (!existing.occupation && gift.occupation) existing.occupation = gift.occupation;
    if (!existing.city && gift.city) existing.city = gift.city;
  });
  return [...byKey.values()].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
}

async function buildTab(apiKey, tab) {
  const gifts = [];
  const keys = [];
  const historicalByKey = new Map();

  for (const candidate of tab.candidates) {
    const [currentRows, ...historicalSets] = await Promise.all([
      fetchCommittee(apiKey, candidate.committeeId, tab.minAmount, CYCLE),
      ...HISTORICAL_CYCLES.map((period) =>
        fetchCommittee(apiKey, candidate.committeeId, tab.minAmount, period),
      ),
    ]);

    for (const row of historicalSets.flat()) {
      if (!isCountable(row, tab.minAmount)) continue;
      if (isCurrentCycleDate(row.contribution_receipt_date)) continue;
      const key = `${candidate.slug}|${donorKey(row)}`;
      const list = historicalByKey.get(key) ?? [];
      list.push(toGift(row, candidate, "historical"));
      historicalByKey.set(key, list);
    }

    for (const row of currentRows) {
      if (!isCountable(row, tab.minAmount)) continue;
      if (!isCurrentCycleDate(row.contribution_receipt_date)) continue;
      gifts.push(toGift(row, candidate, "current"));
      keys.push(`${candidate.slug}|${donorKey(row)}`);
    }
  }

  const donors = aggregate(gifts, keys).map((donor) => {
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
    id: tab.id,
    label: tab.label,
    minAmount: tab.minAmount,
    candidates: tab.candidates,
    giftCount: gifts.length,
    donors,
  };
}

const apiKey = await loadEnvKey();
if (!apiKey) {
  console.error("OPENFEC_API_KEY is missing.");
  process.exit(1);
}

const tabs = [];
for (const tab of TABS) {
  console.log(`Fetching ${tab.label}...`);
  tabs.push(await buildTab(apiKey, tab));
}

const payload = {
  cycle: CYCLE,
  generatedAt: new Date().toISOString(),
  tabs,
};

const publicDir = path.join(ROOT, "public");
await mkdir(publicDir, { recursive: true });
await writeFile(path.join(publicDir, "data.json"), JSON.stringify(payload));
console.log(
  `Wrote data.json with ${tabs.map((tab) => `${tab.id}:${tab.donors.length}`).join(", ")}`,
);
