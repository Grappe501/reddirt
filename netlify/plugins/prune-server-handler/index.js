const { pruneNetlifyServerHandler, formatOversizeMessage, MAX_MB } = require("../../../scripts/prune-netlify-server-handler.cjs");

/** Runs after @netlify/plugin-nextjs; also pruned in netlify-build.sh before function zip when possible. */
exports.onPostBuild = async ({ utils }) => {
  const result = pruneNetlifyServerHandler(process.cwd());
  if (result.skipped) {
    utils.status.show({ title: "Prune server handler", summary: "Handler dir not found — skip" });
    return;
  }

  utils.status.show({
    title: "Prune server handler",
    summary: `${result.beforeMb.toFixed(1)} MB → ${result.afterMb.toFixed(1)} MB (${result.removed.length} paths removed)`,
  });

  if (result.afterMb > MAX_MB) {
    await utils.build.failBuild(formatOversizeMessage(result));
  }
};
