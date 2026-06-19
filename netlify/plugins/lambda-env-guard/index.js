const {
  estimateLambdaEnvBytes,
  printNetlifyEnvScopingChecklist,
  getDeployRiskMessage,
} = require("../../../scripts/verify-netlify-lambda-env-budget.cjs");

/**
 * Runs after prune-server-handler (onPostBuild). Surfaces deploy-time Lambda env
 * risk before Netlify uploads ___netlify-server-handler.
 */
exports.onPostBuild = async ({ utils }) => {
  if (!process.env.NETLIFY && !process.env.NETLIFY_BUILD_BASE) return;

  const { total, totalRaw, buildOnlyLeaked, deployEstimate, rows } = estimateLambdaEnvBytes();
  const featureFlags = rows.find((r) => r.key === "FEATURE_FLAGS");
  const risk = getDeployRiskMessage({
    total,
    totalRaw,
    deployEstimate,
    featureFlags,
    rows,
    buildOnlyLeaked,
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
