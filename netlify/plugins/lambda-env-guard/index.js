const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  estimateLambdaEnvBytes,
  estimateNetlifyApiFunctionEnvBytes,
  detectOpenNextModernHandler,
  detectLegacyLambdaHandler,
  printNetlifyEnvScopingChecklist,
  getDeployRiskMessage,
  LAMBDA_ENV_LIMIT_BYTES,
  FEATURE_FLAGS_TYPICAL_BYTES,
} = require("../../../scripts/verify-netlify-lambda-env-budget.cjs");

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

async function fetchNetlifyFunctionEnvRows() {
  const token = resolveAuthToken();
  const siteId =
    process.env.NETLIFY_SITE_ID?.trim() ||
    readJson(path.join(process.cwd(), ".netlify", "state.json"))?.siteId?.trim();
  if (!token || !siteId) return null;

  const siteRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!siteRes.ok) return null;
  const site = await siteRes.json();

  const envRes = await fetch(
    `https://api.netlify.com/api/v1/accounts/${site.account_id}/env?site_id=${siteId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!envRes.ok) return null;
  const envRows = await envRes.json();
  return Array.isArray(envRows) ? envRows : null;
}

/**
 * Runs after prune-server-handler (onPostBuild). Surfaces deploy-time Lambda env
 * risk before Netlify uploads ___netlify-server-handler.
 */
exports.onPostBuild = async ({ utils }) => {
  if (!process.env.NETLIFY && !process.env.NETLIFY_BUILD_BASE) return;

  let { total, totalRaw, buildOnlyLeaked, deployEstimate, rows } = estimateLambdaEnvBytes();
  const featureFlags = rows.find((r) => r.key === "FEATURE_FLAGS");
  let apiRuntimeBytes = null;

  try {
    const apiRows = await fetchNetlifyFunctionEnvRows();
    if (apiRows) {
      const { runtime, rows: apiRuntimeRows } = estimateNetlifyApiFunctionEnvBytes(apiRows);
      apiRuntimeBytes = runtime;
      if (runtime > total) {
        total = runtime;
        deployEstimate = runtime;
        buildOnlyLeaked = 0;
        rows = apiRuntimeRows.map((r) => ({
          key: r.key,
          bytes: r.bytes,
          excluded: false,
          buildOnly: false,
        }));
      }
      const optionalBytes = apiRuntimeRows
        .filter((r) => r.optional)
        .reduce((sum, r) => sum + r.bytes, 0);
      if (optionalBytes > 0 && runtime + FEATURE_FLAGS_TYPICAL_BYTES > LAMBDA_ENV_LIMIT_BYTES) {
        utils.status.show({
          title: "Lambda deploy env check",
          summary: `Optional runtime vars ~${optionalBytes} B — run npm run netlify:env:scopes:launch-minimal if deploy fails`,
        });
      }
    }
  } catch {
    /* advisory only */
  }

  const cwd = process.cwd();
  const modernHandler = detectOpenNextModernHandler(cwd);
  const legacyHandler = detectLegacyLambdaHandler(cwd);

  const risk = getDeployRiskMessage({
    total,
    totalRaw,
    deployEstimate,
    featureFlags,
    rows,
    buildOnlyLeaked,
    apiRuntimeBytes,
    handlerPackaged: Boolean(modernHandler || legacyHandler),
    modernHandler,
    legacyHandler,
  });

  utils.status.show({
    title: "Lambda deploy env check",
    summary: risk.summary,
  });

  printNetlifyEnvScopingChecklist(rows);

  if (risk.fail && (process.env.NETLIFY || process.env.NETLIFY_BUILD_BASE)) {
    await utils.build.failBuild(risk.message);
  }
};
