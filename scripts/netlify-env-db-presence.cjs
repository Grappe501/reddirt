/**
 * Summarize whether DB-related Netlify env keys exist and are non-empty (no values printed).
 * Usage: node scripts/netlify-env-db-presence.cjs --site <siteId>
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function resolveAuthToken() {
  const fromEnv = process.env.NETLIFY_AUTH_TOKEN?.trim();
  if (fromEnv) return fromEnv;
  const configPaths = [
    path.join(os.homedir(), ".config", "netlify", "config.json"),
    path.join(os.homedir(), ".netlify", "config.json"),
    path.join(process.env.APPDATA ?? "", "netlify", "Config", "config.json"),
  ].filter(Boolean);
  for (const configPath of configPaths) {
    const config = readJson(configPath);
    const users = config?.users;
    if (!users || typeof users !== "object") continue;
    for (const user of Object.values(users)) {
      const token = user?.auth?.token?.trim();
      if (token) return token;
    }
  }
  return null;
}

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}

const WANT = ["DATABASE_URL", "DIRECT_URL", "NETLIFY_DATABASE_URL", "DATABASE_URL_UNPOOLED"];

async function summarize(siteId, token) {
  const headers = { Authorization: `Bearer ${token}` };
  const site = await (await fetch(`https://api.netlify.com/api/v1/sites/${siteId}`, { headers })).json();
  const rows = await (
    await fetch(`https://api.netlify.com/api/v1/accounts/${site.account_id}/env?site_id=${siteId}`, {
      headers,
    })
  ).json();
  if (!Array.isArray(rows)) {
    return { site: site.name, error: "bad_env_payload" };
  }
  return {
    site: site.name,
    count: rows.length,
    db: WANT.map((k) => {
      const r = rows.find((x) => x.key === k);
      if (!r) return { key: k, present: false };
      const vals = r.values || [];
      return {
        key: k,
        present: true,
        contexts: vals.map((v) => v.context),
        nonempty: vals.some((v) => v.value && String(v.value).trim().length > 0),
        scopes: r.scopes,
      };
    }),
  };
}

async function main() {
  const token = resolveAuthToken();
  if (!token) {
    console.error("no_token");
    process.exit(2);
  }
  const site = arg("--site");
  const sites = site
    ? [site]
    : ["e952be4a-3291-492c-9ba2-f31fd23cdede", "addb3880-18e6-45f8-af9e-24b24e3d8e27"];
  const out = [];
  for (const id of sites) {
    out.push(await summarize(id, token));
  }
  console.log(JSON.stringify(out, null, 2));
}

main().catch(() => {
  console.error("failed");
  process.exit(1);
});
