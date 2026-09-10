import { createReadStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = process.env.AR_ETHICS_CSV || "H:/SOSWebsite/.local/temp/ar-ethics-csv/TCON_2026.csv";
const MIN_AMOUNT = 1000;
const ETHICS_CANDIDATE_URL = "https://ethics-disclosures.sos.arkansas.gov/public/cf/publiccandidate";

const TABS = [
  {
    id: "sos-2026",
    label: "SOS 2026",
    minAmount: MIN_AMOUNT,
    source: "arkansas-ethics",
    candidates: [
      { slug: "kelly-grappe", label: "Kelly Grappe", office: "Secretary of State", entityId: "8753", fecUrl: ETHICS_CANDIDATE_URL },
      { slug: "kim-hammer", label: "Kim Hammer", office: "Secretary of State", entityId: "6467", fecUrl: ETHICS_CANDIDATE_URL },
      { slug: "michael-pakko", label: "Michael Pakko", office: "Secretary of State", entityId: "11316", fecUrl: ETHICS_CANDIDATE_URL },
    ],
  },
  {
    id: "governor-2026",
    label: "Governor 2026",
    minAmount: MIN_AMOUNT,
    source: "arkansas-ethics",
    candidates: [
      { slug: "sarah-sanders", label: "Sarah Sanders", office: "Governor", entityId: "1004", fecUrl: ETHICS_CANDIDATE_URL },
      { slug: "fred-love", label: "Fred Love", office: "Governor", entityId: "7490", fecUrl: ETHICS_CANDIDATE_URL },
    ],
  },
];

const ENTITY_TO_CANDIDATE = new Map(
  TABS.flatMap((tab) => tab.candidates.map((candidate) => [candidate.entityId, { tab, candidate }])),
);

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function parseAmount(value) {
  return Number(String(value || "").replace(/[$,]/g, "")) || 0;
}

function toIsoDate(value) {
  const match = String(value || "").trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return "";
  return `${match[3]}-${match[1].padStart(2, "0")}-${match[2].padStart(2, "0")}`;
}

function parseCityState(address) {
  const parts = String(address || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return { city: "", state: "", zip: "" };
  const last = parts[parts.length - 1];
  const match = last.match(/^([A-Za-z]{2})\s+(\d{5})(?:-\d{4})?$/);
  if (match) {
    return {
      city: parts.length > 1 ? parts[parts.length - 2] : "",
      state: match[1].toUpperCase(),
      zip: match[2],
    };
  }
  return { city: last, state: "", zip: "" };
}

function normalizeToken(value) {
  return (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
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

function donorIdentity(name) {
  const raw = String(name || "").trim();
  if (!raw) return { display: "Unnamed donor", key: "unnamed" };
  if (raw.includes(",")) {
    const [family, rest] = raw.split(",");
    const first = (rest || "").trim().split(/\s+/)[0] || "";
    return {
      display: titleCaseName(`${first} ${family}`.trim()),
      key: `${normalizeToken(family)}|${normalizeToken(first)}`,
    };
  }
  return { display: titleCaseName(raw), key: normalizeToken(raw) };
}

function giftKey(gift) {
  return [gift.candidateSlug, gift.date, gift.amount, gift.election, gift.transactionId].join("|");
}

async function readRows(filePath) {
  const stream = createReadStream(filePath, { encoding: "utf8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });
  let headers = null;
  const rows = [];
  const seen = new Set();

  for await (const line of rl) {
    if (!headers) {
      headers = parseCsvLine(line);
      continue;
    }
    const cols = parseCsvLine(line);
    if (cols.length < 16) continue;
    const mapped = ENTITY_TO_CANDIDATE.get(cols[0]);
    if (!mapped) continue;
    const amount = parseAmount(cols[12]);
    if (amount < MIN_AMOUNT) continue;
    const sourceName = (cols[6] || "").trim();
    if (!sourceName) continue;
    const transactionId = (cols[14] || "").trim();
    const dedupe = transactionId || `${cols[0]}|${sourceName}|${cols[11]}|${amount}`;
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);
    const place = parseCityState(cols[7] || "");
    const identity = donorIdentity(sourceName);
    rows.push({
      ...mapped,
      identity,
      city: place.city,
      state: place.state,
      zip: place.zip,
      employer: (cols[8] || "").trim(),
      occupation: (cols[9] || "").trim() || (cols[10] || "").trim(),
      sourceType: (cols[5] || "").trim(),
      amount,
      date: toIsoDate(cols[11]),
      election: (cols[15] || "").trim(),
      transactionId,
    });
  }
  return rows;
}

function aggregateTab(tab, rows) {
  const byKey = new Map();
  let giftCount = 0;
  for (const row of rows) {
    if (row.tab.id !== tab.id) continue;
    const gift = {
      candidateSlug: row.candidate.slug,
      candidateLabel: row.candidate.label,
      candidateOffice: row.candidate.office,
      name: row.identity.display,
      city: row.city,
      state: row.state,
      employer: row.employer,
      occupation: row.occupation,
      amount: row.amount,
      date: row.date,
      election: row.election || row.sourceType,
      filingUrl: ETHICS_CANDIDATE_URL,
      cycle: "current",
      transactionId: row.transactionId,
    };
    const key = [row.identity.key, row.state.toLowerCase(), row.zip].join("|");
    const existing = byKey.get(key);
    if (existing?.gifts.some((item) => giftKey(item) === giftKey(gift))) continue;
    giftCount += 1;
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
      continue;
    }
    existing.total += gift.amount;
    existing.giftCount += 1;
    existing.gifts.push(gift);
    if (gift.date && gift.date > existing.lastDate) existing.lastDate = gift.date;
    if (!existing.candidateSlugs.includes(gift.candidateSlug)) existing.candidateSlugs.push(gift.candidateSlug);
    if (!existing.employer && gift.employer) existing.employer = gift.employer;
    if (!existing.occupation && gift.occupation) existing.occupation = gift.occupation;
    if (!existing.city && gift.city) existing.city = gift.city;
  }

  return {
    id: tab.id,
    label: tab.label,
    minAmount: tab.minAmount,
    source: tab.source,
    candidates: tab.candidates.map(({ entityId, ...candidate }) => candidate),
    giftCount,
    donors: [...byKey.values()].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name)),
  };
}

const rows = await readRows(CSV_PATH);
const tabs = TABS.map((tab) => aggregateTab(tab, rows));
const payload = {
  cycle: 2026,
  generatedAt: new Date().toISOString(),
  source: "arkansas-ethics",
  tabs,
};

const publicDir = path.join(ROOT, "public");
await mkdir(publicDir, { recursive: true });
await writeFile(path.join(publicDir, "statewide.json"), JSON.stringify(payload));
console.log(
  `Wrote statewide.json ${tabs.map((tab) => `${tab.id}:donors=${tab.donors.length}:gifts=${tab.giftCount}`).join(" ")}`,
);
