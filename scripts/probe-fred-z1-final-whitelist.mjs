import { readFileSync, writeFileSync } from "node:fs";

function loadKey() {
  const t = readFileSync(".env", "utf8");
  const m = t.match(/^FRED_API_KEY=(.+)$/m);
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
}

const key = loadKey();
const headers = { Authorization: `Bearer ${key}` };

const exactTitles = new Set([
  "Households and Nonprofit Organizations; Net Worth, Level",
  "Households and Nonprofit Organizations; Corporate Equities; Asset, Level",
  "Households and Nonprofit Organizations; Total Liabilities, Level",
  "Households and Nonprofit Organizations; Consumer Credit; Liability, Level",
  "Households and Nonprofit Organizations; Debt Securities and Loans; Liability, Level",
  "Households and Nonprofit Organizations; One-to-Four-Family Residential Mortgages; Liability, Level",
  "Households and Nonprofit Organizations; Total Currency and Deposits Including Money Market Fund Shares; Asset, Level",
  "Households and Nonprofit Organizations; Proprietors' Equity in Noncorporate Business; Asset, Level",
  "Nonfinancial Corporate Business; Debt Securities; Liability, Level",
  "Nonfinancial Corporate Business; Corporate Equities; Liability, Level",
  "Nonfinancial Corporate Business; Net Worth, Level",
  "Corporate Farm Business; Net Worth, Level",
  "Noncorporate Farm Business; Net Worth, Level",
  "Noncorporate Farm Business; Proprietors' Equity in Noncorporate Business, Level",
]);

const found = new Map();
let cursor = null;
let pages = 0;
while (pages < 150) {
  const url = new URL("https://api.stlouisfed.org/fred/v2/release/observations");
  url.searchParams.set("release_id", "52");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "50000");
  if (cursor) url.searchParams.set("next_cursor", cursor);
  const r = await fetch(url, { headers });
  const p = await r.json();
  pages += 1;
  if (r.status !== 200) {
    console.log(JSON.stringify({ ok: false, status: r.status, pages }));
    process.exit(2);
  }
  for (const s of p.series || []) {
    const title = String(s.title || "").trim();
    if (!exactTitles.has(title)) continue;
    const prev = found.get(title);
    const prefer =
      !prev ||
      (/^Quarterly/i.test(s.frequency) && !/^Quarterly/i.test(prev.frequency));
    if (prefer) {
      found.set(title, {
        series_id: s.series_id,
        title,
        frequency: s.frequency,
        units: s.units,
        obs: (s.observations || []).length,
        first: s.observations?.[0]?.date,
        last: s.observations?.at(-1)?.date,
      });
    }
  }
  if (!p.has_more) break;
  cursor = p.next_cursor;
}

const selected = [...found.values()];
writeFileSync(
  ".local/temp/fred_z1_final_whitelist.json",
  JSON.stringify({ pages, selected, missing: [...exactTitles].filter((t) => !found.has(t)) }, null, 2),
);
console.log(
  JSON.stringify(
    {
      pages,
      selectedCount: selected.length,
      selected,
      missing: [...exactTitles].filter((t) => !found.has(t)),
    },
    null,
    2,
  ),
);
