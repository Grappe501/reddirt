const {
  pruneNetlifyServerHandler,
  formatOversizeMessage,
  shouldFailDeploy,
  MAX_MB,
} = require("../../../scripts/prune-netlify-server-handler.cjs");

/**
 * onPostBuild runs after @netlify/plugin-nextjs repackages the handler and before deploy upload.
 * This is the last chance to stay under the 250 MB unzipped Lambda cap.
 */
exports.onPostBuild = async ({ utils }) => {
  const result = pruneNetlifyServerHandler(process.cwd());
  if (result.skipped) {
    utils.status.show({ title: "Prune server handler", summary: "Handler dir not found — skip" });
    return;
  }

  utils.status.show({
    title: "Prune server handler (pre-deploy)",
    summary: `${result.beforeMb.toFixed(1)} → ${result.afterMb.toFixed(1)} MB staging, ${result.deployMb.toFixed(1)} MB deploy (${result.removed.length} paths; cap ${MAX_MB} MB)`,
  });

  if (shouldFailDeploy(result)) {
    await utils.build.failBuild(formatOversizeMessage(result));
  }
};
