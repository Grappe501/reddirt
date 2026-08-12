/**
 * Presence + live probe for USDA NASS Quick Stats key.
 * Never prints key values.
 *
 * Usage: node scripts/run-with-h-drive-env.cjs node scripts/probe-nass-key.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

function parseEnvFile(filePath) {
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
    ) {
      val = val.slice(1, -1);
    }
    out[m[1]] = val;
  }
  return out;
}

function isUsable(value) {
  if (!value?.trim()) return false;
  const v = value.trim();
  if (v.length < 8) return false;
  if (/your_?.*api_?key/i.test(v)) return false;
  if (/<.*>/.test(v)) return false;
  if (/^(changeme|todo|replace|xxx|placeholder)$/i.test(v)) return false;
  return true;
}

const fileEnv = {
  ...parseEnvFile(path.join(repoRoot, ".env")),
  ...parseEnvFile(path.join(repoRoot, ".env.local")),
};

const candidates = ["NASS_API_KEY", "USDA_NASS_API_KEY"];
const inventory = {
  note: "NASS Quick Stats requires its own key from https://quickstats.nass.usda.gov/api — not API_DOT_GOV_KEY.",
  presence: {},
  probe: null,
};

let key = null;
let keyName = null;
for (const name of candidates) {
  const fromProcess = process.env[name];
  const fromFile = fileEnv[name];
  const usableProcess = isUsable(fromProcess);
  const usableFile = isUsable(fromFile);
  inventory.presence[name] = {
    process_env: usableProcess ? "PRESENT" : fromProcess ? "UNUSABLE" : "ABSENT",
    env_file: usableFile ? "PRESENT" : fromFile ? "UNUSABLE" : "ABSENT",
  };
  if (!key && usableProcess) {
    key = fromProcess.trim();
    keyName = name;
  } else if (!key && usableFile) {
    key = fromFile.trim();
    keyName = name;
  }
}

if (!key) {
  inventory.probe = {
    status: "blocked",
    reason: "No usable NASS_API_KEY / USDA_NASS_API_KEY",
  };
  console.log(JSON.stringify(inventory, null, 2));
  process.exit(2);
}

const url = new URL("https://quickstats.nass.usda.gov/api/get_counts/");
url.searchParams.set("key", key);
url.searchParams.set("source_desc", "CENSUS");
url.searchParams.set("commodity_desc", "FARM OPERATIONS");
url.searchParams.set("short_desc", "FARM OPERATIONS - NUMBER OF OPERATIONS");
url.searchParams.set("domain_desc", "TOTAL");
url.searchParams.set("agg_level_desc", "STATE");
url.searchParams.set("state_alpha", "AR");
url.searchParams.set("year__GE", "2017");

try {
  const res = await fetch(url);
  const text = await res.text();
  let count = null;
  try {
    const j = JSON.parse(text);
    count = j.count != null ? Number(j.count) : null;
  } catch {
    /* ignore */
  }
  const unauthorized = /unauthorized/i.test(text);
  inventory.probe = {
    status: res.ok && !unauthorized && count != null ? "ok" : "fail",
    http: res.status,
    key_name_used: keyName,
    farm_operations_ar_census_count: count,
    unauthorized,
  };
  console.log(JSON.stringify(inventory, null, 2));
  process.exit(inventory.probe.status === "ok" ? 0 : 1);
} catch (err) {
  inventory.probe = {
    status: "fail",
    http: 0,
    key_name_used: keyName,
    message: err instanceof Error ? err.message : String(err),
  };
  console.log(JSON.stringify(inventory, null, 2));
  process.exit(1);
}
