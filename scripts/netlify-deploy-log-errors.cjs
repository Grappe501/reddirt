/**
 * Fetch a Netlify deploy log and print only error-ish lines (no secrets expected).
 * Usage: node scripts/netlify-deploy-log-errors.cjs --deploy <deployId>
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
  const deployId = arg("--deploy");
  if (!deployId) {
    console.error("Usage: node scripts/netlify-deploy-log-errors.cjs --deploy <deployId>");
    process.exit(2);
  }
  const token = resolveAuthToken();
  if (!token) {
    console.error("no_token");
    process.exit(2);
  }
  const headers = { Authorization: `Bearer ${token}` };
  const urls = [
    `https://api.netlify.com/api/v1/deploys/${deployId}/log`,
    `https://api.netlify.com/api/v1/deploys/${deployId}`,
  ];
  const dRes = await fetch(urls[1], { headers });
  const deploy = await dRes.json();
  console.log(
    JSON.stringify({
      state: deploy.state,
      error_message: deploy.error_message,
      plugin_state: deploy.plugin_state,
      build_id: deploy.build_id,
      created_at: deploy.created_at,
      updated_at: deploy.updated_at,
    }),
  );

  const candidates = [
    urls[0],
    `https://api.netlify.com/api/v1/deploys/${deployId}/log?raw_log=true`,
    `https://app.netlify.com/access-control/bb-api/api/v1/deploys/${deployId}/log`,
  ];
  if (deploy.build_id) {
    candidates.push(`https://api.netlify.com/api/v1/builds/${deploy.build_id}/log`);
    candidates.push(
      `https://api.netlify.com/api/v1/deploys/${deployId}/files/.netlify/netlify.toml`,
    );
  }

  // Trailing summary fields sometimes include last lines
  if (deploy.summary?.messages?.length) {
    console.log("summary_messages", JSON.stringify(deploy.summary.messages).slice(0, 2000));
  }

  let text = "";
  for (const u of candidates) {
    const logRes = await fetch(u, { headers });
    const body = await logRes.text();
    console.log(`try_log status=${logRes.status} len=${body.length} url=${u.split("?")[0]}`);
    if (logRes.ok && body && body !== "Not Found" && body.length > 20) {
      text = body;
      break;
    }
  }

  if (!text && deploy.build_id) {
    const bRes = await fetch(`https://api.netlify.com/api/v1/builds/${deploy.build_id}`, {
      headers,
    });
    const build = await bRes.json();
    console.log(
      JSON.stringify({
        build_error: build.error,
        build_done: build.done,
        build_sha: build.sha,
        build_keys: Object.keys(build),
      }),
    );
  }
  // Netlify sometimes returns JSON { data: [...] } for logs
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      text = parsed
        .map((row) => (typeof row === "string" ? row : row?.message || JSON.stringify(row)))
        .join("\n");
    } else if (Array.isArray(parsed?.data)) {
      text = parsed.data
        .map((row) => (typeof row === "string" ? row : row?.message || ""))
        .join("\n");
    }
  } catch {
    // plain text log
  }
  const lines = text.split(/\r?\n/);
  const re =
    /error|Error|failed|Failed|DATABASE|Prisma|npm ERR|ENOENT|Invalid AWS|handler|exit code|Module not|TypeError|missing|Cannot|fatal|EACCES|env/i;
  const hit = lines.filter((l) => re.test(l) && !/NETLIFY_DATABASE_URL|password|secret|token=/i.test(l));
  console.log(`total_lines=${lines.length} hit_lines=${hit.length}`);
  console.log(hit.slice(-80).join("\n"));
  if (hit.length === 0) {
    console.log("---tail---");
    console.log(text.slice(-3500));
  }
}

main().catch(() => {
  console.error("log_fetch_failed");
  process.exit(1);
});
