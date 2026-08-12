/**
 * Live probe for the RCIP "available keys" batch.
 * Presence + HTTP checks. Never prints secret values.
 *
 * Usage: node scripts/run-with-h-drive-env.cjs node scripts/probe-available-api-keys.mjs
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

const env = {
  ...parseEnv(path.join(repoRoot, ".env")),
  ...parseEnv(path.join(repoRoot, ".env.local")),
};
for (const [k, v] of Object.entries(env)) {
  if (!process.env[k]) process.env[k] = v;
}

const results = [];

function record(name, status, detail) {
  results.push({ name, status, detail });
  console.log(`[${status}] ${name}${detail ? ` — ${detail}` : ""}`);
}

async function probeGoogleCivic(key) {
  const u = new URL("https://www.googleapis.com/civicinfo/v2/representatives");
  u.searchParams.set("address", "Little Rock, AR");
  u.searchParams.set("key", key);
  const res = await fetch(u);
  return { ok: res.status === 200, detail: `HTTP ${res.status}` };
}

async function probeNewsApi(key) {
  const u = new URL("https://newsapi.org/v2/sources");
  u.searchParams.set("apiKey", key);
  const res = await fetch(u);
  const j = await res.json().catch(() => ({}));
  return {
    ok: res.ok && j.status === "ok",
    detail: j.message || j.code || `HTTP ${res.status}`,
  };
}

async function probeCongress(key) {
  const u = new URL("https://api.congress.gov/v3/member");
  u.searchParams.set("limit", "1");
  u.searchParams.set("api_key", key);
  const res = await fetch(u, { headers: { Accept: "application/json" } });
  return { ok: res.status === 200, detail: `HTTP ${res.status}` };
}

async function probeOpenStates(key) {
  const u = new URL("https://v3.openstates.org/jurisdictions");
  u.searchParams.set("per_page", "1");
  const res = await fetch(u, {
    headers: { "X-API-KEY": key, Accept: "application/json" },
  });
  return { ok: res.status === 200, detail: `HTTP ${res.status}` };
}

async function probeApiDotGov(key) {
  // Lightweight api.data.gov consumer sample (NREL solar resource).
  const u = new URL("https://developer.nrel.gov/api/solar/solar_resource/v1.json");
  u.searchParams.set("api_key", key);
  u.searchParams.set("lat", "34.75");
  u.searchParams.set("lon", "-92.29");
  const res = await fetch(u);
  return { ok: res.status === 200, detail: `HTTP ${res.status}` };
}

async function probeSocrata(token) {
  const u = new URL("https://data.cityofchicago.org/resource/v6vf-nfxy.json");
  u.searchParams.set("$limit", "1");
  u.searchParams.set("$$app_token", token);
  const res = await fetch(u);
  return { ok: res.ok, detail: `HTTP ${res.status}` };
}

const probes = [
  {
    name: "GOOGLE_CIVIC_API_KEY",
    run: () => probeGoogleCivic(process.env.GOOGLE_CIVIC_API_KEY),
  },
  {
    name: "NEWSAPI_API_KEY",
    run: () => probeNewsApi(process.env.NEWSAPI_API_KEY),
  },
  {
    name: "CONGRESS_GOV_API_KEY",
    run: () => probeCongress(process.env.CONGRESS_GOV_API_KEY),
  },
  {
    name: "OPENSTATES_API_KEY",
    run: () => probeOpenStates(process.env.OPENSTATES_API_KEY),
  },
  {
    name: "API_DOT_GOV_KEY",
    run: () => probeApiDotGov(process.env.API_DOT_GOV_KEY),
  },
  {
    name: "SOCRATA_APP_TOKEN",
    run: () => probeSocrata(process.env.SOCRATA_APP_TOKEN),
  },
];

for (const p of probes) {
  const value = process.env[p.name];
  if (!usable(value)) {
    record(p.name, "MISSING", "not configured or placeholder");
    continue;
  }
  record(p.name, "PRESENT", `usable length ${value.trim().length}`);
  try {
    const { ok, detail } = await p.run();
    record(`${p.name} live`, ok ? "OK" : "FAIL", detail);
  } catch (e) {
    record(`${p.name} live`, "FAIL", e instanceof Error ? e.message : String(e));
  }
}

const summary = {
  present: results.filter((r) => r.status === "PRESENT").length,
  ok: results.filter((r) => r.status === "OK").length,
  fail: results.filter((r) => r.status === "FAIL").length,
  missing: results.filter((r) => r.status === "MISSING").length,
};

console.log(JSON.stringify({ summary, note: "Values never printed" }, null, 2));
process.exit(summary.fail || summary.missing ? 1 : 0);
