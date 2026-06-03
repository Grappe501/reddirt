const {
  pruneNetlifyServerHandler,
  formatOversizeMessage,
  shouldFailDeploy,
  MAX_MB,
  DEPLOY_FAIL_MB,
} = require("../../../scripts/prune-netlify-server-handler.cjs");

async function runPrune(utils, label) {
  const result = pruneNetlifyServerHandler(process.cwd());
  if (result.skipped) {
    utils.status.show({
      title: `Prune server handler (${label})`,
      summary: "Handler dir not found — skip",
    });
    return;
  }

  utils.status.show({
    title: `Prune server handler (${label})`,
    summary: `${result.beforeMb.toFixed(1)} → ${result.afterMb.toFixed(1)} MB staging, ${result.deployMb.toFixed(1)} MB deploy (${result.removed.length} paths; fail > ${DEPLOY_FAIL_MB} MB, cap ${MAX_MB} MB)`,
  });

  if (shouldFailDeploy(result)) {
    await utils.build.failBuild(formatOversizeMessage(result));
  }
}

/**
 * onPostBuild runs after @netlify/plugin-nextjs repackages the handler and before deploy upload.
 * onEnd runs again immediately before deploy in case the Next plugin re-staged artifacts.
 */
exports.onPostBuild = async ({ utils }) => {
  await runPrune(utils, "post-build");
};

exports.onEnd = async ({ utils }) => {
  await runPrune(utils, "pre-deploy");
};
