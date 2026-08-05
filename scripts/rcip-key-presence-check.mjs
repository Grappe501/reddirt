/**
 * RCIP audit helper — reports key presence without printing values.
 * H:-only. Does not write secrets.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function load(p) {
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, "utf8").split("\n")) {
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

const env = { ...load(join(root, ".env")), ...load(join(root, ".env.local")) };
const keys = [
  "CENSUS_API_KEY",
  "BLS_API_KEY",
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
];

for (const k of keys) {
  const v = env[k];
  if (!v) {
    console.log(`[MISSING] ${k}`);
    continue;
  }
  const looksLocal = /127\.0\.0\.1|localhost/.test(v);
  const looksPooler = /pooler\.|pgbouncer/i.test(v);
  const looksSupabase = /supabase\.co|supabase\.com/i.test(v);
  console.log(
    `[SET] ${k} len=${v.length} local=${looksLocal} pooler=${looksPooler} supabase_host=${looksSupabase}`
  );
}
