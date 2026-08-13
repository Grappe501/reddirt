const {
  pruneNetlifyServerHandler,
  formatOversizeMessage,
  shouldFailDeploy,
  applyServerHandlerIncludeGlobs,
  MAX_MB,
} = require("../../../scripts/prune-netlify-server-handler.cjs");

/**
 * onPostBuild runs after @netlify/plugin-nextjs packages ___netlify-server-handler
 * and before deploy upload. Do not use onEnd + failBuild (deploy already started).
 */
exports.onPostBuild = async ({ utils, netlifyConfig }) => {
  const result = pruneNetlifyServerHandler(process.cwd());
  applyServerHandlerIncludeGlobs(netlifyConfig);
  if (result.skipped) {
    await utils.build.failBuild(
      "___netlify-server-handler not found after build — @netlify/plugin-nextjs must run first in netlify.toml. " +
        "Ensure [[plugins]] package = \"@netlify/plugin-nextjs\" is the first plugin entry (unpinned, not in package.json). " +
        "Disable any UI-pinned old @netlify/plugin-nextjs in Netlify Build plugins. Clear cache and redeploy.",
    );
    return;
  }

  const top = (result.topLevels || [])
    .map((row) => `${row.name}=${row.mb.toFixed(1)}MB`)
    .join(" ");
  const largest = (result.largest || [])
    .slice(0, 8)
    .map((row) => `  ${(row.size / (1024 * 1024)).toFixed(2)} MB  ${row.rel}`)
    .join("\n");
  const summary = `${result.beforeMb.toFixed(1)} → ${result.afterMb.toFixed(1)} MB staging / ${result.deployMb.toFixed(1)} MB deploy (${result.removed.length} paths${result.manifestPatched ? ", manifest patched (handler glob, no **)" : ", manifest JSON not found"}; cap ${MAX_MB} MB)`;
  console.log(`>>> prune-server-handler: ${summary}`);
  if (top) console.log(`>>> prune-server-handler top: ${top}`);
  if (largest) console.log(`>>> prune-server-handler largest:\n${largest}`);
  if (result.symlinkCount) console.log(`>>> prune-server-handler leftover symlinks: ${result.symlinkCount}`);
  utils.status.show({
    title: "Prune server handler (pre-deploy)",
    summary,
  });

  if (shouldFailDeploy(result)) {
    await utils.build.failBuild(formatOversizeMessage(result));
  }
};
