const {
  pruneNetlifyServerHandler,
  formatOversizeMessage,
  shouldFailDeploy,
  MAX_MB,
  DEPLOY_FAIL_MB,
} = require("../../../scripts/prune-netlify-server-handler.cjs");

/**
 * onPostBuild runs after @netlify/plugin-nextjs packages ___netlify-server-handler
 * and before deploy upload. Do not use onEnd + failBuild (deploy already started).
 */
exports.onPostBuild = async ({ utils }) => {
  const result = pruneNetlifyServerHandler(process.cwd());
  if (result.skipped) {
    utils.status.show({ title: "Prune server handler", summary: "Handler dir not found — skip" });
    return;
  }

  utils.status.show({
    title: "Prune server handler (pre-deploy)",
    summary: `${result.beforeMb.toFixed(1)} → ${result.afterMb.toFixed(1)} MB staging, ${result.deployMb.toFixed(1)} MB deploy (${result.removed.length} paths; fail > ${DEPLOY_FAIL_MB} MB, cap ${MAX_MB} MB)`,
  });

  if (shouldFailDeploy(result)) {
    await utils.build.failBuild(formatOversizeMessage(result));
  }
};
