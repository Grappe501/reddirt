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
      "___netlify-server-handler not found after build — @netlify/plugin-nextjs must run first in netlify.toml. " +
        "Ensure [[plugins]] package = \"@netlify/plugin-nextjs\" is the first plugin entry (unpinned, not in package.json). " +
        "Disable any UI-pinned old @netlify/plugin-nextjs in Netlify Build plugins. Clear cache and redeploy.",
    );
    return;
  }

  const measuredMb = Math.max(result.afterMb, result.deployMb);
  const summary = `${result.beforeMb.toFixed(1)} → ${result.afterMb.toFixed(1)} MB staging / ${result.deployMb.toFixed(1)} MB deploy (${result.removed.length} paths${result.manifestPatched ? ", manifest patched (** + handler basePath)" : ", manifest JSON not found"}; cap ${MAX_MB} MB)`;
  // Always print to build log so operators can see size even when status UI is collapsed.
  console.log(`>>> prune-server-handler: ${summary}`);
  utils.status.show({
    title: "Prune server handler (pre-deploy)",
    summary,
  });

  if (shouldFailDeploy(result)) {
    await utils.build.failBuild(formatOversizeMessage(result));
  }
};
