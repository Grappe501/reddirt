/**
 * Demand-first Z.1 (release 52) series discovery for CC Pass 10 release densify.
 * Auth: Authorization Bearer (FRED v2). No secrets logged.
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function loadKey(repoRoot) {
  const envPath = resolve(repoRoot, ".env");
  if (!existsSync(envPath)) return "";
  const text = readFileSync(envPath, "utf8");
  const m = text.match(/^FRED_API_KEY=(.+)$/m);
  if (!m) return "";
  return m[1].trim().replace(/^["']|["']$/g, "");
}

const key = loadKey(process.cwd());
if (!key) {
  console.log(JSON.stringify({ ok: false, reason: "no_key" }));
  process.exit(1);
}

/** Title must match one of these (case-insensitive substring) AND not DISCONTINUED. */
const want = [
  {
    id: "hh_net_worth_level",
    re: /^Households and Nonprofit Organizations; Net Worth; Level$/i,
  },
  {
    id: "hh_corporate_equities_asset",
    re: /^Households and Nonprofit Organizations; Corporate Equities; Asset, Level$/i,
  },
  {
    id: "hh_total_liabilities",
    re: /^Households and Nonprofit Organizations; Total Liabilities, Level$/i,
  },
  {
    id: "hh_home_mortgages",
    re: /^Households and Nonprofit Organizations; Home Mortgages; Liability, Level$/i,
  },
  {
    id: "hh_consumer_credit",
    re: /^Households and Nonprofit Organizations; Consumer Credit; Liability, Level$/i,
  },
  {
    id: "hh_deposits",
    re: /^Households and Nonprofit Organizations; Total Currency and Deposits Including Money Market Fund Shares; Asset, Level$/i,
  },
  {
    id: "nfc_debt_securities_liab",
    re: /^Nonfinancial Corporate Business; Debt Securities; Liability, Level$/i,
  },
  {
    id: "nfc_corporate_equities_liab",
    re: /^Nonfinancial Corporate Business; Corporate Equities; Liability, Level$/i,
  },
  {
    id: "nfc_net_worth_level",
    re: /^Nonfinancial Corporate Business; Net Worth, Level$/i,
  },
  {
    id: "farm_business_net_worth",
    re: /^(Corporate Farm Business|Noncorporate Farm Business|Domestic Farm Business).*Net Worth.*Level$/i,
  },
  {
    id: "hh_proprietors_equity",
    re: /^Households and Nonprofit Organizations; Proprietors' Equity in Noncorporate Business; Asset, Level$/i,
  },
];

const found = {};
for (const w of want) found[w.id] = [];

const headers = { Authorization: `Bearer ${key}` };
let cursor = null;
let pages = 0;
let seriesSeen = 0;
const maxPages = 80;

while (pages < maxPages) {
  const url = new URL("https://api.stlouisfed.org/fred/v2/release/observations");
  url.searchParams.set("release_id", "52");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "50000");
  if (cursor) url.searchParams.set("next_cursor", cursor);
  const r = await fetch(url, { headers });
  const parsed = await r.json();
  pages += 1;
  if (r.status !== 200) {
    console.log(JSON.stringify({ ok: false, status: r.status, page: pages }));
    process.exit(2);
  }
  for (const s of parsed.series || []) {
    seriesSeen += 1;
    const title = String(s.title || "");
    if (/DISCONTINUED/i.test(title)) continue;
    // Prefer quarterly level series when both exist
    for (const w of want) {
      if (w.re.test(title)) {
        found[w.id].push({
          series_id: s.series_id,
          title,
          frequency: s.frequency,
          units: s.units,
          obs: (s.observations || []).length,
          first: s.observations?.[0]?.date,
          last: s.observations?.[s.observations.length - 1]?.date,
        });
      }
    }
  }
  if (!parsed.has_more) break;
  cursor = parsed.next_cursor;
}

function pick(list) {
  if (!list.length) return null;
  const q = list.find((x) => /^Quarterly/i.test(x.frequency));
  return q || list[0];
}

const selected = {};
for (const w of want) {
  selected[w.id] = pick(found[w.id]);
}

const outPath = resolve(process.cwd(), ".local/temp/fred_z1_whitelist_candidates.json");
writeFileSync(
  outPath,
  JSON.stringify({ pages, seriesSeen, found, selected }, null, 2),
  "utf8",
);

console.log(
  JSON.stringify(
    {
      ok: true,
      pages,
      seriesSeen,
      selected,
      outPath,
    },
    null,
    2,
  ),
);
