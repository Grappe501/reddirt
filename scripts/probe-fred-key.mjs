/**
 * Presence probe for FRED_API_KEY. Never prints key values.
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

const merged = {
  ...parseEnvFile(path.join(repoRoot, ".env")),
  ...parseEnvFile(path.join(repoRoot, ".env.local")),
};
const key = process.env.FRED_API_KEY || merged.FRED_API_KEY || "";
console.log(
  JSON.stringify(
    {
      FRED_API_KEY: isUsable(key)
        ? `SET_USABLE_LEN_${key.trim().length}`
        : key
          ? "PRESENT_UNUSABLE"
          : "MISSING",
    },
    null,
    2,
  ),
);
