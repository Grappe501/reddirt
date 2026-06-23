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
    await utils.build.failBuild(
      "___netlify-server-handler not found after build — @netlify/plugin-nextjs did not package the server handler. " +
        "Ensure netlify.toml lists [[plugins]] package = \"@netlify/plugin-nextjs\" first (before prune-server-handler). " +
        "Do not pin an old adapter in package.json; clear cache and redeploy.",
    );
    return;
  }

  const measuredMb = Math.max(result.afterMb, result.deployMb);
  utils.status.show({
    title: "Prune server handler (pre-deploy)",
    summary: `${result.beforeMb.toFixed(1)} → ${result.afterMb.toFixed(1)} MB (${measuredMb.toFixed(1)} MB measured, ${result.removed.length} paths${result.manifestPatched ? ", manifest exclusions" : ""}; cap ${MAX_MB} MB)`,
  });

  if (shouldFailDeploy(result)) {
    await utils.build.failBuild(formatOversizeMessage(result));
  }
};
