/**
 * Assert zip-it includes only the pruned handler directory from the site root.
 * A bare "**" re-inflates ___netlify-server-handler past 250 MB.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  patchServerHandlerManifest,
  buildPatchedHandlerManifest,
  applyServerHandlerIncludeGlobs,
  HANDLER_SITE_INCLUDE_GLOBS,
} = require("./prune-netlify-server-handler.cjs");
const { APP_STASH_DIRS, API_KEEP } = require("./stash-netlify-public-hub-app.cjs");

const tmpRoot = path.join(__dirname, "..", ".local", "temp");
fs.mkdirSync(tmpRoot, { recursive: true });
const tmp = fs.mkdtempSync(path.join(tmpRoot, "prune-handler-manifest-"));
const handlerDir = path.join(tmp, ".netlify", "functions-internal", "___netlify-server-handler");
fs.mkdirSync(handlerDir, { recursive: true });
const manifestPath = path.join(handlerDir, "___netlify-server-handler.json");
fs.writeFileSync(
  manifestPath,
  `${JSON.stringify({
    config: {
      name: "Next.js Server Handler",
      nodeBundler: "none",
      includedFiles: ["**"],
      includedFilesBasePath: handlerDir,
    },
    version: 1,
  })}\n`,
);

const patched = patchServerHandlerManifest(tmp);
assert.equal(patched, true, "must patch OpenNext JSON inside the handler directory");

const json = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
assert.equal(json.config.nodeBundler, "none");
assert.equal(json.config.includedFilesBasePath, tmp);
assert.deepEqual(json.config.includedFiles, HANDLER_SITE_INCLUDE_GLOBS);
assert.equal(HANDLER_SITE_INCLUDE_GLOBS.length, 1);
assert.equal(
  HANDLER_SITE_INCLUDE_GLOBS[0],
  ".netlify/functions-internal/___netlify-server-handler/**",
);
assert.ok(!json.config.includedFiles.includes("**"), "bare ** would zip the site root");

const rebuilt = buildPatchedHandlerManifest(
  { config: { includedFiles: ["**", "src/**", "!data/**"] }, version: 1 },
  { handlerRoot: handlerDir, cwd: tmp },
);
assert.deepEqual(rebuilt.config.includedFiles, HANDLER_SITE_INCLUDE_GLOBS);
assert.equal(rebuilt.config.includedFilesBasePath, tmp);

const netlifyConfig = { functions: { "___netlify-server-handler": { node_bundler: "esbuild" } } };
applyServerHandlerIncludeGlobs(netlifyConfig);
assert.equal(netlifyConfig.functions["___netlify-server-handler"].node_bundler, "none");
assert.deepEqual(
  netlifyConfig.functions["___netlify-server-handler"].included_files,
  HANDLER_SITE_INCLUDE_GLOBS,
);

fs.rmSync(tmp, { recursive: true, force: true });
assert.ok(APP_STASH_DIRS.includes("src/app/election-plan"));
assert.ok(APP_STASH_DIRS.includes("src/app/admin/(board)"));
assert.ok(API_KEEP.has("forms"));
console.log("ok prune-netlify-handler-manifest");
