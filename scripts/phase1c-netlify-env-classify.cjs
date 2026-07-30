/**
 * Safe Netlify / local DB target classification for Phase 1C (no secrets printed).
 * Compares host family + db name only.
 */
const fs = require("node:fs");
const path = require("node:path");

function classifyUrl(raw, label) {
  if (!raw || !String(raw).trim()) {
    return { label, present: false };
  }
  try {
    const u = new URL(String(raw).replace(/^postgresql:\/\//, "postgres://"));
    const host = u.hostname || "";
    const port = u.port || "";
    const db = (u.pathname || "").replace(/^\//, "") || "(none)";
    let family = "other";
    if (host.includes("pooler.supabase.com")) family = "supabase_session_or_transaction_pooler";
    else if (host.includes("supabase.co") || host.includes("supabase.com")) family = "supabase_direct_or_api";
    else if (host === "localhost" || host === "127.0.0.1") family = "local";
    return {
      label,
      present: true,
      hostClass: host.includes("supabase")
        ? host.replace(/^[^.]+/, "(project-ref)")
        : host.replace(/[a-f0-9]{8,}/gi, "(redacted)"),
      hostFamily: family,
      port,
      databaseName: db,
      usesPooler: host.includes("pooler"),
    };
  } catch {
    return { label, present: true, parseError: true };
  }
}

function loadDotEnv() {
  const p = path.join(process.cwd(), ".env");
  if (!fs.existsSync(p)) return {};
  const out = {};
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

const env = { ...loadDotEnv(), ...process.env };
const localDb = classifyUrl(env.DATABASE_URL, "local.DATABASE_URL");
const localDirect = classifyUrl(env.DIRECT_URL, "local.DIRECT_URL");

let netlify = { available: false, note: "netlify CLI not queried in this script by default" };
try {
  const { execSync } = require("node:child_process");
  const raw = execSync("npx netlify env:list --json", {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 60000,
  });
  const parsed = JSON.parse(raw);
  // netlify env:list --json shapes vary; collect keys only + classify if values present
  const keys = Array.isArray(parsed)
    ? parsed.map((e) => e.key || e)
    : Object.keys(parsed || {});
  const getVal = (k) => {
    if (Array.isArray(parsed)) {
      const hit = parsed.find((e) => e.key === k);
      return hit?.value ?? hit?.values?.production ?? null;
    }
    return parsed[k] ?? null;
  };
  netlify = {
    available: true,
    hasDatabaseUrl: keys.includes("DATABASE_URL") || Boolean(getVal("DATABASE_URL")),
    hasDirectUrl: keys.includes("DIRECT_URL") || Boolean(getVal("DIRECT_URL")),
    database: classifyUrl(getVal("DATABASE_URL"), "netlify.DATABASE_URL"),
    direct: classifyUrl(getVal("DIRECT_URL"), "netlify.DIRECT_URL"),
  };
} catch (e) {
  netlify = {
    available: false,
    note: e instanceof Error ? e.message.split("\n")[0] : String(e),
  };
}

const sameFamily =
  localDb.present &&
  netlify.available &&
  netlify.database?.present &&
  localDb.hostFamily === netlify.database.hostFamily &&
  localDb.databaseName === netlify.database.databaseName;

console.log(
  JSON.stringify(
    {
      local: { database: localDb, direct: localDirect, sameAsDirectHostFamily: localDb.hostFamily === localDirect.hostFamily },
      netlify,
      sameDatabaseFamilyLocalVsNetlify: sameFamily,
      recommendation:
        !netlify.available
          ? "Confirm Netlify env in UI; do not change vars without operator approval"
          : sameFamily
            ? "Local and Netlify appear same DB family — safe to redeploy after parity"
            : "Local vs Netlify family mismatch or incomplete — operator review before env changes",
    },
    null,
    2,
  ),
);
