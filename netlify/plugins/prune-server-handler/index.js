const {
  pruneNetlifyServerHandler,
  formatOversizeMessage,
  shouldFailDeploy,
  MAX_MB,
} = require("../../../scripts/prune-netlify-server-handler.cjs");

/**
 * Runs after @netlify/plugin-nextjs repackages the handler.
 * Fails only when the deploy zip (if present) or staging dir still exceeds 250 MB.
 */
exports.onPostBuild = async ({ utils }) => {
  const result = pruneNetlifyServerHandler(process.cwd());
  if (result.skipped) {
    utils.status.show({ title: "Prune server handler", summary: "Handler dir not found — skip" });
    return;
  }

  const zipNote = result.zipMb == null ? "no zip yet" : `zip ${result.zipMb.toFixed(1)} MB`;
  utils.status.show({
    title: "Prune server handler",
    summary: `${result.beforeMb.toFixed(1)} MB → ${result.afterMb.toFixed(1)} MB (${result.removed.length} removed; ${zipNote})`,
  });

  if (shouldFailDeploy(result)) {
    await utils.build.failBuild(formatOversizeMessage(result));
  } else if (result.afterMb > MAX_MB) {
    utils.status.show({
      title: "Prune server handler",
      summary: `Staging ${result.afterMb.toFixed(1)} MB after repackage — deploy zip under ${MAX_MB} MB (${zipNote})`,
    });
  }
};
