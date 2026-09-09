/**
 * Assert zip-it includes only the pruned handler directory from the site root.
 * A bare "**" re-inflates ___netlify-server-handler past 250 MB.
 */
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const {
  patchServerHandlerManifest,
  buildPatchedHandlerManifest,
  applyServerHandlerIncludeGlobs,
  HANDLER_SITE_INCLUDE_GLOBS,
  LAUNCH_APP_TOP_KEEP,
  LAUNCH_API_TOP_KEEP,
} = require("./prune-netlify-server-handler.cjs");
const {
  APP_STASH_DIRS,
  KGRAPPE_STASH_DIRS,
  DEC_SIM_STASH_DIRS,
  MACROSCOPIC_LIFE_STASH_DIRS,
  APP_STASH_KEEP_PREFIXES,
  API_KEEP,
  API_NESTED_KEEP,
  stashPublicHubAppDirs,
  isRouteFileName,
  STASH_ROOT,
} = require("./stash-netlify-public-hub-app.cjs");

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
assert.ok(KGRAPPE_STASH_DIRS.includes("src/app/(macroscopic-life)"), "kgrappe must stash Book One");
assert.ok(!MACROSCOPIC_LIFE_STASH_DIRS.includes("src/app/(macroscopic-life)"), "ML site must compile Book One");
assert.ok(MACROSCOPIC_LIFE_STASH_DIRS.includes("src/app/(site)"), "ML site must stash the campaign public hub");
assert.ok(DEC_SIM_STASH_DIRS.includes("src/app/(site)"), "dec-sim must stash the campaign public hub");
assert.ok(DEC_SIM_STASH_DIRS.includes("src/app/admin"), "dec-sim stashes admin except kept prefixes");
assert.ok(!DEC_SIM_STASH_DIRS.includes("src/app/admin/decision-simulator"));
assert.ok(MACROSCOPIC_LIFE_STASH_DIRS.includes("src/app/election-plan"), "ML site must stash election-plan");
assert.ok(!APP_STASH_DIRS.includes("src/app/election-plan"), "election-plan must ship on kgrappe.netlify.app");
assert.ok(APP_STASH_DIRS.includes("src/app/(macroscopic-life)"), "Macroscopic Life must stay off the public-hub Lambda");
assert.ok(APP_STASH_DIRS.includes("src/app/admin/(board)"));
assert.ok(APP_STASH_KEEP_PREFIXES.includes("src/app/admin/(board)/talent-foundry"));
assert.ok(API_KEEP.has("forms"));
assert.ok(API_KEEP.has("election-plan"));
assert.ok(API_NESTED_KEEP.get("admin")?.has("decision-simulator"));
assert.ok(LAUNCH_APP_TOP_KEEP.has("election-plan"));
assert.ok(LAUNCH_API_TOP_KEEP.has("election-plan"));
assert.ok(isRouteFileName("page.tsx"));
assert.ok(isRouteFileName("route.ts"));
assert.ok(!isRouteFileName("approval-email-actions.ts"));

const stashTmp = fs.mkdtempSync(path.join(tmpRoot, "public-hub-stash-"));
const ml = path.join(stashTmp, "src/app/(macroscopic-life)/macroscopic-life");
const board = path.join(stashTmp, "src/app/admin/(board)/campaign-events");
const tf = path.join(stashTmp, "src/app/admin/(board)/talent-foundry");
const simApi = path.join(stashTmp, "src/app/api/admin/decision-simulator");
const otherAdminApi = path.join(stashTmp, "src/app/api/admin/email-diagnostics");
fs.mkdirSync(ml, { recursive: true });
fs.mkdirSync(board, { recursive: true });
fs.mkdirSync(tf, { recursive: true });
fs.mkdirSync(simApi, { recursive: true });
fs.mkdirSync(otherAdminApi, { recursive: true });
fs.writeFileSync(path.join(simApi, "route.ts"), "export function POST() {}\n");
fs.writeFileSync(path.join(otherAdminApi, "route.ts"), "export function GET() {}\n");
fs.writeFileSync(path.join(ml, "page.tsx"), "export default function Page() { return null; }\n");
fs.writeFileSync(path.join(ml, "layout.tsx"), "export default function Layout({ children }) { return children; }\n");
fs.writeFileSync(path.join(board, "page.tsx"), "export default function Page() { return null; }\n");
fs.writeFileSync(path.join(board, "approval-email-actions.ts"), "export async function loadApprovalPackageBundleAction() {}\n");
fs.writeFileSync(path.join(tf, "page.tsx"), "export default function Page() { return null; }\n");
fs.writeFileSync(path.join(tf, "layout.tsx"), "export default function Layout({ children }) { return children; }\n");
const stashed = stashPublicHubAppDirs(stashTmp);
assert.ok(stashed >= 1);
assert.ok(!fs.existsSync(path.join(board, "page.tsx")), "route page must be stashed");
assert.ok(
  fs.existsSync(path.join(board, "approval-email-actions.ts")),
  "server actions must stay for typecheck",
);
assert.ok(fs.existsSync(path.join(stashTmp, STASH_ROOT, "src/app/admin/(board)/campaign-events/page.tsx")));
assert.ok(fs.existsSync(path.join(tf, "page.tsx")), "talent-foundry page must stay on the public hub");
assert.ok(fs.existsSync(path.join(tf, "layout.tsx")), "talent-foundry layout must stay on the public hub");
assert.ok(!fs.existsSync(path.join(stashTmp, STASH_ROOT, "src/app/admin/(board)/talent-foundry/page.tsx")));
assert.ok(!fs.existsSync(path.join(ml, "page.tsx")), "macroscopic-life page must be stashed off the public hub");
assert.ok(fs.existsSync(path.join(stashTmp, STASH_ROOT, "src/app/(macroscopic-life)/macroscopic-life/page.tsx")));
assert.ok(fs.existsSync(path.join(simApi, "route.ts")), "decision-simulator API must stay on the public hub");
assert.ok(!fs.existsSync(path.join(otherAdminApi, "route.ts")), "other admin APIs must be stashed");
fs.rmSync(stashTmp, { recursive: true, force: true });

const decSimMode = execFileSync(
  process.execPath,
  [
    "-e",
    'process.env.SITE_NAME="dec-sim"; const m=require("./stash-netlify-public-hub-app.cjs"); if (!m.APP_STASH_DIRS.includes("src/app/(site)")) process.exit(1); if (!m.APP_STASH_KEEP_PREFIXES.includes("src/app/admin/decision-simulator")) process.exit(2); if (m.API_KEEP.size !== 0) process.exit(3);',
  ],
  { cwd: __dirname },
);
assert.equal(decSimMode.status ?? 0, 0);
console.log("ok prune-netlify-handler-manifest");
