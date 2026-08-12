import { readFileSync, writeFileSync } from "node:fs";

function loadKey() {
  const t = readFileSync(".env", "utf8");
  const m = t.match(/^FRED_API_KEY=(.+)$/m);
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
}

const key = loadKey();
const headers = { Authorization: `Bearer ${key}` };
const needles = [
  /Households and Nonprofit Organizations; Net Worth/i,
  /Households and Nonprofit Organizations; Corporate Equities; Asset/i,
  /Households and Nonprofit Organizations; Total Liabilities/i,
  /Households and Nonprofit Organizations; Home Mortgages/i,
  /Households and Nonprofit Organizations; Consumer Credit/i,
  /Nonfinancial Corporate Business; Debt Securities; Liability/i,
  /Nonfinancial Corporate Business; Corporate Equities; Liability/i,
  /Proprietors' Equity in Noncorporate Business/i,
  /Noncorporate Farm Business; Net Worth/i,
  /Households and Nonprofit Organizations; One-to-Four-Family Residential Mortgages/i,
];

const hits = [];
let cursor = null;
let pages = 0;
while (pages < 120) {
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
    const title = String(s.title || "");
    if (/DISCONTINUED/i.test(title)) continue;
    if (!needles.some((re) => re.test(title))) continue;
    if (!/Level/i.test(title)) continue;
    if (/Transactions|Revaluation|Other Changes/i.test(title)) continue;
    hits.push({
      id: s.series_id,
      title,
      freq: s.frequency,
      units: s.units,
      obs: (s.observations || []).length,
      last: s.observations?.at(-1)?.date,
    });
  }
  if (!p.has_more) break;
  cursor = p.next_cursor;
}

// Prefer quarterly BOGZ1FL* level series
const byTitle = new Map();
for (const h of hits) {
  const keyT = h.title.replace(/\s+/g, " ").trim();
  const prev = byTitle.get(keyT);
  const score = (h.freq.startsWith("Quarterly") ? 2 : 0) + (h.id.includes("FL") ? 1 : 0);
  const prevScore = prev
    ? (prev.freq.startsWith("Quarterly") ? 2 : 0) + (prev.id.includes("FL") ? 1 : 0)
    : -1;
  if (!prev || score > prevScore) byTitle.set(keyT, h);
}

const selected = [...byTitle.values()].sort((a, b) => a.title.localeCompare(b.title));
writeFileSync(
  ".local/temp/fred_z1_loose_hits.json",
  JSON.stringify({ pages, hitCount: hits.length, selected }, null, 2),
);
console.log(JSON.stringify({ pages, hitCount: hits.length, selectedCount: selected.length, selected }, null, 2));
