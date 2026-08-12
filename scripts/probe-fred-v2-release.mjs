/**
 * Probe FRED v2 release/observations auth + pagination (no secrets logged).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadKey(repoRoot) {
  const envPath = resolve(repoRoot, ".env");
  if (!existsSync(envPath)) return "";
  const text = readFileSync(envPath, "utf8");
  const m = text.match(/^FRED_API_KEY=(.+)$/m);
  if (!m) return "";
  return m[1].trim().replace(/^["']|["']$/g, "");
}

const repoRoot = process.cwd();
const key = loadKey(repoRoot);
if (!key) {
  console.log(JSON.stringify({ ok: false, reason: "FRED_API_KEY missing" }, null, 2));
  process.exit(1);
}

const base =
  "https://api.stlouisfed.org/fred/v2/release/observations?release_id=52&format=json&limit=50";

async function tryOne(label, url, headers = {}) {
  const r = await fetch(url, { headers });
  const text = await r.text();
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    /* ignore */
  }
  const series = parsed?.series || [];
  const ids = series.slice(0, 5).map((s) => s.series_id);
  console.log(
    JSON.stringify({
      label,
      status: r.status,
      has_more: parsed?.has_more ?? null,
      next_cursor: parsed?.next_cursor ?? null,
      release_name: parsed?.release?.name ?? null,
      series_count: series.length,
      sample_ids: ids,
      error: parsed?.error_message || parsed?.error_code || null,
      head: text.slice(0, 120).replace(/\s+/g, " "),
    }),
  );
  return { status: r.status, parsed };
}

const results = [];
results.push(await tryOne("query_api_key", `${base}&api_key=${encodeURIComponent(key)}`));
results.push(await tryOne("header_api_key", base, { api_key: key }));
results.push(await tryOne("header_x_api_key", base, { "x-api-key": key }));
results.push(await tryOne("header_Authorization", base, { Authorization: `Bearer ${key}` }));

const winner = results.find((r) => r.status === 200 && r.parsed?.series?.length);
if (!winner) {
  console.log(JSON.stringify({ ok: false, reason: "no_auth_style_worked" }));
  process.exit(2);
}

// Keyword scan across a few pages for demand-relevant series
const keywords = [
  /household/i,
  /nonprofit/i,
  /net worth/i,
  /corporate equit/i,
  /debt securities/i,
  /consumer credit/i,
  /nonfinancial corporate/i,
  /proprietors/i,
  /farm/i,
];
const found = new Map();
let cursor = null;
let pages = 0;
const maxPages = 40;
const headers = { Authorization: `Bearer ${key}` };
while (pages < maxPages) {
  const url = new URL("https://api.stlouisfed.org/fred/v2/release/observations");
  url.searchParams.set("release_id", "52");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "20000");
  if (cursor) url.searchParams.set("next_cursor", cursor);
  const r = await fetch(url, { headers });
  const parsed = await r.json();
  pages += 1;
  if (r.status !== 200) {
    console.log(JSON.stringify({ scan_error: true, status: r.status, page: pages }));
    break;
  }
  for (const s of parsed.series || []) {
    const title = String(s.title || "");
    if (keywords.some((re) => re.test(title)) && !/DISCONTINUED/i.test(title)) {
      if (!found.has(s.series_id)) {
        found.set(s.series_id, {
          series_id: s.series_id,
          title,
          frequency: s.frequency,
          units: s.units,
          obs: (s.observations || []).length,
        });
      }
    }
  }
  if (!parsed.has_more) break;
  cursor = parsed.next_cursor;
}

console.log(
  JSON.stringify(
    {
      ok: true,
      pages_scanned: pages,
      keyword_matches: [...found.values()].slice(0, 40),
      match_count: found.size,
    },
    null,
    2,
  ),
);
