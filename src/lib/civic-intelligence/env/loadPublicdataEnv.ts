import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function parseEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) return {};
  const out: Record<string, string> = {};
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

const PUBLICDATA_KEY_NAMES = new Set([
  "CENSUS_API_KEY",
  "BLS_API_KEY",
  "EIA_API_KEY",
  "FRED_API_KEY",
  "GOOGLE_CIVIC_API_KEY",
  "CONGRESS_GOV_API_KEY",
  "OPENFEC_API_KEY",
  "OPENSTATES_API_KEY",
  "API_DOT_GOV_KEY",
  "NASS_API_KEY",
  "USDA_NASS_API_KEY",
  "NEWSAPI_API_KEY",
  "SOCRATA_APP_TOKEN",
]);

/**
 * Load .env / .env.local into process.env.
 * Default: do not overwrite already-set values.
 * Exception: for known public-data API keys, replace parent-shell
 * placeholders (e.g. angle-bracket stubs) with usable file values.
 * Note: API_DOT_GOV_KEY is not a Census substitute.
 */
export function loadPublicdataEnv(repoRoot: string): void {
  const merged = {
    ...parseEnvFile(path.join(repoRoot, ".env")),
    ...parseEnvFile(path.join(repoRoot, ".env.local")),
  };
  for (const [k, v] of Object.entries(merged)) {
    const current = process.env[k];
    const missing = current == null || current === "";
    const replacePlaceholder =
      PUBLICDATA_KEY_NAMES.has(k) && !isUsableApiKey(current);
    if (missing || replacePlaceholder) {
      process.env[k] = v;
    }
  }
}

export function isUsableApiKey(value: string | undefined): boolean {
  if (!value?.trim()) return false;
  const v = value.trim();
  if (v.length < 8) return false;
  if (/your_?.*api_?key/i.test(v)) return false;
  if (/<.*>/.test(v)) return false;
  if (/^(changeme|todo|replace|xxx|placeholder)$/i.test(v)) return false;
  return true;
}
