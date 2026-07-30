/**
 * Silent Netlify env clone (names + scopes only in logs; never prints values).
 * Usage: node scripts/clone-netlify-env-silent.cjs --from <siteId> --to <siteId>
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

async function main() {
  const fromId = arg("--from");
  const toId = arg("--to");
  if (!fromId || !toId) {
    console.error("Usage: node scripts/clone-netlify-env-silent.cjs --from <siteId> --to <siteId>");
    process.exit(2);
  }
  const token = resolveAuthToken();
  if (!token) {
    console.error("No Netlify auth token found");
    process.exit(2);
  }
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const siteRes = await fetch(`https://api.netlify.com/api/v1/sites/${fromId}`, { headers });
  if (!siteRes.ok) {
    console.error("getSite failed", siteRes.status);
    process.exit(1);
  }
  const site = await siteRes.json();
  const accountId = site.account_id;

  const envRes = await fetch(
    `https://api.netlify.com/api/v1/accounts/${accountId}/env?site_id=${fromId}`,
    { headers },
  );
  if (!envRes.ok) {
    console.error("getEnvVars failed", envRes.status);
    process.exit(1);
  }
  const rows = await envRes.json();
  if (!Array.isArray(rows)) {
    console.error("unexpected env payload");
    process.exit(1);
  }

  console.log(`source_vars=${rows.length}`);
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    const key = row.key;
    const values = Array.isArray(row.values) ? row.values : [];
    if (!key || values.length === 0) {
      skipped += 1;
      continue;
    }
    const body = {
      key,
      scopes: row.scopes,
      is_secret: Boolean(row.is_secret),
      values: values.map((v) => ({
        value: v.value,
        context: v.context,
        context_parameter: v.context_parameter,
      })),
    };

    const createRes = await fetch(
      `https://api.netlify.com/api/v1/accounts/${accountId}/env?site_id=${toId}`,
      { method: "POST", headers, body: JSON.stringify([body]) },
    );
    if (createRes.ok) {
      created += 1;
      continue;
    }
    // Already exists → update
    if (createRes.status === 422 || createRes.status === 400) {
      const upd = await fetch(
        `https://api.netlify.com/api/v1/accounts/${accountId}/env/${encodeURIComponent(key)}?site_id=${toId}`,
        { method: "PUT", headers, body: JSON.stringify(body) },
      );
      if (upd.ok) {
        updated += 1;
      } else {
        failed += 1;
        console.error(`fail_key=${key} status=${upd.status}`);
      }
      continue;
    }
    failed += 1;
    console.error(`fail_key=${key} status=${createRes.status}`);
  }

  const verify = await fetch(
    `https://api.netlify.com/api/v1/accounts/${accountId}/env?site_id=${toId}`,
    { headers },
  );
  const dest = verify.ok ? await verify.json() : [];
  console.log(
    JSON.stringify({
      created,
      updated,
      skipped,
      failed,
      dest_count: Array.isArray(dest) ? dest.length : -1,
    }),
  );
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("clone_failed");
  process.exit(1);
});
