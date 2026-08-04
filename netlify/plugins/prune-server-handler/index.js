const {
  pruneNetlifyServerHandler,
  formatOversizeMessage,
  shouldFailDeploy,
  MAX_MB,
  DEPLOY_FAIL_MB,
} = require("../../../scripts/prune-netlify-server-handler.cjs");

/**
 * Netlify lifecycle (critical):
 *   build command → plugins onBuild → Functions bundling → plugins onPostBuild → deploy
 *
 * @netlify/plugin-nextjs creates ___netlify-server-handler in onBuild.
 * Functions bundling then zips that handler for upload.
 * Pruning only in onPostBuild is TOO LATE — deploy uploads the pre-prune zip (>250 MB)
 * while our directory measurement looks fine. So we prune in onBuild (after Next) and
 * again in onPostBuild as a safety pass.
 */
async function runPrune(utils, phase) {
  const result = pruneNetlifyServerHandler(process.cwd());
  if (result.skipped) {
    // onBuild: Next may not have written the handler yet if plugin order is wrong.
    // onPostBuild: missing handler is always fatal.
    if (phase === "onPostBuild") {
      await utils.build.failBuild(
        "___netlify-server-handler not found after build — @netlify/plugin-nextjs must run first in netlify.toml. " +
          "Ensure [[plugins]] package = \"@netlify/plugin-nextjs\" is the first plugin entry (unpinned, not in package.json). " +
          "Disable any UI-pinned old @netlify/plugin-nextjs in Netlify Build plugins. Clear cache and redeploy.",
      );
    } else {
      console.log(`>>> prune-server-handler (${phase}): handler not found yet — skipping`);
    }
    return;
  }

  const measuredMb = Math.max(result.afterMb, result.deployMb);
  console.log(
    `>>> prune-server-handler (${phase}): ${result.beforeMb.toFixed(1)} → ${result.afterMb.toFixed(1)} MB staging, ` +
      `${result.deployMb.toFixed(1)} MB deploy-estimate, ${result.removed.length} paths removed` +
      `${result.manifestPatched ? ", manifest patched (no ** glob)" : ""} (fail > ${DEPLOY_FAIL_MB} MB, cap ${MAX_MB} MB)`,
  );
  utils.status.show({
    title: `Prune server handler (${phase})`,
    summary: `${result.beforeMb.toFixed(1)} → ${result.afterMb.toFixed(1)} MB (${measuredMb.toFixed(1)} MB measured, ${result.removed.length} paths${result.manifestPatched ? ", manifest exclusions" : ""}; fail>${DEPLOY_FAIL_MB} cap ${MAX_MB} MB)`,
  });

  if (shouldFailDeploy(result)) {
    await utils.build.failBuild(formatOversizeMessage(result));
  }
}

/** Runs after Next onBuild (netlify.toml lists nextjs first) and before Functions bundling. */
exports.onBuild = async ({ utils }) => {
  await runPrune(utils, "onBuild");
};

/** Safety pass after bundling / publishStaticDir — catches re-inflation. */
exports.onPostBuild = async ({ utils }) => {
  await runPrune(utils, "onPostBuild");
};
