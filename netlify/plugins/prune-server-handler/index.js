const {
  pruneNetlifyServerHandler,
  formatOversizeMessage,
  shouldFailDeploy,
  MAX_MB,
  DEPLOY_FAIL_MB,
} = require("../../../scripts/prune-netlify-server-handler.cjs");
// DEPLOY_FAIL_MB used in console log for deploy-log visibility.

/**
 * onPostBuild runs after @netlify/plugin-nextjs onBuild packages ___netlify-server-handler
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
  console.log(
    `>>> prune-server-handler: ${result.beforeMb.toFixed(1)} → ${result.afterMb.toFixed(1)} MB staging, ` +
      `${result.deployMb.toFixed(1)} MB deploy-estimate, ${result.removed.length} paths removed` +
      `${result.manifestPatched ? ", manifest patched (no ** glob)" : ""} (fail > ${DEPLOY_FAIL_MB} MB, cap ${MAX_MB} MB)`,
  );
  utils.status.show({
    title: "Prune server handler (pre-deploy)",
    summary: `${result.beforeMb.toFixed(1)} → ${result.afterMb.toFixed(1)} MB (${measuredMb.toFixed(1)} MB measured, ${result.removed.length} paths${result.manifestPatched ? ", manifest exclusions" : ""}; fail>${DEPLOY_FAIL_MB} cap ${MAX_MB} MB)`,
  });

  if (shouldFailDeploy(result)) {
    await utils.build.failBuild(formatOversizeMessage(result));
  }
};
