/**
 * Netlify public-hub build: move App Router *route* files out of heavy trees so
 * `next build` does not compile those pages into ___netlify-server-handler.
 * Keep `src/app/election-plan` — kgrappe.netlify.app must serve the portal.
 * Leave `*-actions.ts` and other modules in place — Next still typechecks
 * components that import them (see ApprovalPackageScaffold).
 * CI workspace only — not a repo move.
 */
const fs = require("node:fs");
const path = require("node:path");

const STASH_ROOT = ".netlify-build-stash";

const APP_STASH_DIRS = [
  "src/app/volunteers",
  "src/app/campaign-events",
  "src/app/commit",
  "src/app/county-briefings",
  "src/app/kelly",
  "src/app/onboarding",
  "src/app/organizing-intelligence",
  "src/app/relational",
  "src/app/admin/(board)",
];

const API_KEEP = new Set(["forms", "election-plan"]);

/** App Router files that create routes / pages. Everything else stays for typecheck. */
const ROUTE_FILE_RE =
  /^(page|layout|route|default|loading|error|not-found|template|forbidden|unauthorized|opengraph-image|twitter-image|icon|apple-icon)\.(tsx|ts|jsx|js|mdx)$/i;

function isNetlifyBuild() {
  return Boolean(process.env.NETLIFY || process.env.NETLIFY_BUILD_BASE);
}

function isRouteFileName(name) {
  return ROUTE_FILE_RE.test(name);
}

function stashRouteFilesUnder(cwd, rel) {
  const srcRoot = path.join(cwd, rel);
  if (!fs.existsSync(srcRoot)) return 0;
  let n = 0;
  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(abs);
        continue;
      }
      if (!ent.isFile() || !isRouteFileName(ent.name)) continue;
      const relFile = path.relative(cwd, abs).split(path.sep).join("/");
      const dest = path.join(cwd, STASH_ROOT, relFile);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.renameSync(abs, dest);
      console.log(`>>> public-hub: stashed ${relFile}`);
      n += 1;
    }
  }
  walk(srcRoot);
  return n;
}

function stashApiDir(cwd, rel, destName) {
  const src = path.join(cwd, rel);
  if (!fs.existsSync(src)) return 0;
  const dest = path.join(cwd, STASH_ROOT, destName);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.renameSync(src, dest);
  console.log(`>>> public-hub: stashed ${rel}`);
  return 1;
}

function stashPublicHubAppDirs(cwd = process.cwd()) {
  fs.mkdirSync(path.join(cwd, STASH_ROOT), { recursive: true });
  let n = 0;
  for (const rel of APP_STASH_DIRS) {
    n += stashRouteFilesUnder(cwd, rel);
  }
  const apiRoot = path.join(cwd, "src/app/api");
  if (fs.existsSync(apiRoot)) {
    for (const ent of fs.readdirSync(apiRoot, { withFileTypes: true })) {
      if (!ent.isDirectory() || API_KEEP.has(ent.name)) continue;
      n += stashApiDir(cwd, path.join("src/app/api", ent.name), `api-${ent.name}`);
    }
  }
  return n;
}

if (require.main === module) {
  if (!isNetlifyBuild()) {
    console.log(">>> skip public-hub stash (not Netlify)");
    process.exit(0);
  }
  const n = stashPublicHubAppDirs();
  console.log(`>>> public-hub: stashed ${n} route/API files so Next does not compile them into Lambda`);
}

module.exports = {
  stashPublicHubAppDirs,
  APP_STASH_DIRS,
  API_KEEP,
  STASH_ROOT,
  isRouteFileName,
};
