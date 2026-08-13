/**
 * Netlify public-hub build: move heavy App Router trees out of src/app so `next build`
 * does not compile them into ___netlify-server-handler (.next/server/chunks).
 * CI workspace only — not a repo move. Restored never needed; the build image is discarded.
 */
const fs = require("node:fs");
const path = require("node:path");

const STASH_ROOT = ".netlify-build-stash";

const APP_STASH_DIRS = [
  "src/app/election-plan",
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

const API_KEEP = new Set(["forms"]);

function isNetlifyBuild() {
  return Boolean(process.env.NETLIFY || process.env.NETLIFY_BUILD_BASE);
}

function stashDir(cwd, rel, destName) {
  const src = path.join(cwd, rel);
  if (!fs.existsSync(src)) return false;
  const dest = path.join(cwd, STASH_ROOT, destName);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.renameSync(src, dest);
  console.log(`>>> public-hub: stashed ${rel}`);
  return true;
}

function stashPublicHubAppDirs(cwd = process.cwd()) {
  fs.mkdirSync(path.join(cwd, STASH_ROOT), { recursive: true });
  let n = 0;
  for (const rel of APP_STASH_DIRS) {
    const destName = rel.replace(/^src\/app\//, "").replace(/[()]/g, "").replace(/\//g, "-");
    if (stashDir(cwd, rel, destName)) n += 1;
  }
  const apiRoot = path.join(cwd, "src/app/api");
  if (fs.existsSync(apiRoot)) {
    for (const ent of fs.readdirSync(apiRoot, { withFileTypes: true })) {
      if (!ent.isDirectory() || API_KEEP.has(ent.name)) continue;
      if (stashDir(cwd, path.join("src/app/api", ent.name), `api-${ent.name}`)) n += 1;
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
  console.log(`>>> public-hub: stashed ${n} app trees so Next does not compile them into Lambda`);
}

module.exports = { stashPublicHubAppDirs, APP_STASH_DIRS, API_KEEP, STASH_ROOT };
