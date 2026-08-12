/**
 * Presence-only probe for RCIP credential names. Never prints values.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseEnv(filePath) {
  if (!existsSync(filePath)) return {};
  const out = {};
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const m = t.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/s);
    if (!m) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    )
      val = val.slice(1, -1);
    out[m[1]] = val;
  }
  return out;
}

function usable(value) {
  if (!value?.trim()) return false;
  const v = value.trim();
  if (v.length < 8) return false;
  if (/your_?.*api_?key/i.test(v)) return false;
  if (/<.*>/.test(v)) return false;
  if (/^(changeme|todo|replace|xxx|placeholder)$/i.test(v)) return false;
  return true;
}

const names = [
  "GOOGLE_CIVIC_API_KEY",
  "NEWSAPI_API_KEY",
  "CONGRESS_GOV_API_KEY",
  "OPENSTATES_API_KEY",
  "API_DOT_GOV_KEY",
  "SOCRATA_APP_TOKEN",
  "OPENFEC_API_KEY",
  "FRED_API_KEY",
  "NASS_API_KEY",
  "EIA_API_KEY",
  "CENSUS_API_KEY",
  "BLS_API_KEY",
];

const merged = {
  ...parseEnv(path.join(repoRoot, ".env")),
  ...parseEnv(path.join(repoRoot, ".env.local")),
};

const report = {};
for (const name of names) {
  const v = process.env[name] || merged[name] || "";
  report[name] = usable(v) ? `SET_USABLE_LEN_${v.trim().length}` : v ? "PRESENT_UNUSABLE" : "MISSING";
}

console.log(JSON.stringify({ repo: repoRoot, keys: report }, null, 2));
