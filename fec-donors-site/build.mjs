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
    minAmount: 500,
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
    minAmount: 500,
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
    minAmount: 500,
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

function normalizeToken(value) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function donorKey(row) {
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(apiKey, committeeId, minAmount, period, lastIndexes) {
  const params = new URLSearchParams({
    api_key: apiKey,
    committee_id: committeeId,
    two_year_transaction_period: String(period),
    min_amount: String(minAmount),
    is_individual: "true",
    per_page: "100",
    sort: "-contribution_receipt_amount",
  });
  if (lastIndexes?.last_index) params.set("last_index", lastIndexes.last_index);
  if (lastIndexes?.last_contribution_receipt_amount) {
    params.set("last_contribution_receipt_amount", lastIndexes.last_contribution_receipt_amount);
  }
  if (lastIndexes?.last_contribution_receipt_date) {
    params.set("last_contribution_receipt_date", lastIndexes.last_contribution_receipt_date);
  }

  let lastError = null;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const response = await fetch(`${OPENFEC_BASE}/schedules/schedule_a/?${params}`);
      if (response.ok) return response.json();
      lastError = new Error(`OpenFEC ${response.status} for ${committeeId} cycle ${period}`);
      if (response.status !== 429 && response.status < 500) break;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("OpenFEC network error");
    }
    await sleep(1500 * (attempt + 1));
  }
  throw lastError;
}

function giftKey(gift) {
  return [gift.candidateSlug, gift.date, gift.amount, gift.election, gift.cycle].join("|");
}

async function fetchCommittee(apiKey, committeeId, minAmount, period) {
  const seen = new Set();
  const rows = [];
  let lastIndexes = null;

  for (let page = 0; page < 50; page += 1) {
    const batch = await fetchPage(apiKey, committeeId, minAmount, period, lastIndexes);
    const results = batch.results ?? [];
    if (results.length === 0) break;

    let added = 0;
    for (const row of results) {
      const id =
        row.transaction_id ||
        `${row.contributor_name}|${row.contribution_receipt_date}|${row.contribution_receipt_amount}|${rows.length}`;
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
    const seenGift = existing?.gifts.some((item) => giftKey(item) === giftKey(gift));
    if (existing && seenGift) return;
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
    const currentRows = await fetchCommittee(apiKey, candidate.committeeId, tab.minAmount, CYCLE);
    const historicalSets = [];
    for (const period of HISTORICAL_CYCLES) {
      historicalSets.push(await fetchCommittee(apiKey, candidate.committeeId, tab.minAmount, period));
    }

    for (const row of historicalSets.flat()) {
      if (!isCountable(row, tab.minAmount)) continue;
      if (isCurrentCycleDate(row.contribution_receipt_date)) continue;
      const key = donorKey(row);
      const list = historicalByKey.get(key) ?? [];
      list.push(toGift(row, candidate, "historical"));
      historicalByKey.set(key, list);
    }

    for (const row of currentRows) {
      if (!isCountable(row, tab.minAmount)) continue;
      if (!isCurrentCycleDate(row.contribution_receipt_date)) continue;
      gifts.push(toGift(row, candidate, "current"));
      keys.push(donorKey(row));
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
