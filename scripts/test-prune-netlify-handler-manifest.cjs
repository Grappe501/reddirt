/**
 * Assert OpenNext handler manifest stays scoped to the handler directory.
 * Site-root exclusion-only included_files re-inflate ___netlify-server-handler past 250 MB.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  patchServerHandlerManifest,
  buildPatchedHandlerManifest,
  MANIFEST_INCLUDED_EXCLUSIONS,
} = require("./prune-netlify-server-handler.cjs");

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
assert.equal(json.config.includedFilesBasePath, handlerDir);
assert.equal(json.config.includedFiles[0], "**", "OpenNext requires ** scoped to the handler dir");
assert.ok(
  json.config.includedFiles.includes("!node_modules/next/**"),
  "handler-relative exclusions remain",
);
assert.ok(
  !json.config.includedFiles.some((p) => p === "**/*" || p === "./**"),
  "no extra site-root globs",
);

const rebuilt = buildPatchedHandlerManifest(
  { config: { includedFiles: ["src/**", "!data/**"] }, version: 1 },
  handlerDir,
);
assert.equal(rebuilt.config.includedFiles[0], "**");
assert.ok(!rebuilt.config.includedFiles.includes("src/**"), "drop site-root positive includes");
assert.ok(rebuilt.config.includedFiles.includes("!data/**"));
assert.ok(MANIFEST_INCLUDED_EXCLUSIONS.every((p) => p.startsWith("!")));

fs.rmSync(tmp, { recursive: true, force: true });
console.log("ok prune-netlify-handler-manifest");
