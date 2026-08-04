/**
 * Strip ___netlify-server-handler before Netlify deploy upload (250 MB unzipped cap).
 * Runs in plugin onPostBuild after @netlify/plugin-nextjs repackages the handler.
 */
const fs = require("node:fs");
const path = require("node:path");

const HANDLER_DIRS = [
  ".netlify/functions-internal/___netlify-server-handler",
  ".netlify/functions/___netlify-server-handler",
];

const OPPOSITION_DEBATE_LAUNCH = "opposition_debate";
const KELLY_SOS_LAUNCH = "kelly_sos";

const TOP_LEVEL_DIR_PRUNE = [
  ".git",
  ".next/cache",
  ".next/static",
  ".next/diagnostics",
  ".next/types",
  ".tmp-heic-preview",
  "data/calendar-command-center",
  "data/owned-campaign-media",
  "public",
  ".netlify",
  "docs",
  "src",
  "prisma",
  "scripts",
  "canvases",
  "campaign-system-manual",
  "Volunteer Presentation",
  "develop_notes",
  "field-structure",
  "reports",
  "county-vault",
  "campaign-media",
  "out",
  "backups",
  ".github",
  ".vscode",
];

/** Drop large non-launch data trees (opposition JSON stays). */
const LAUNCH_DATA_DIR_PRUNE = [
  "data/county-workbench",
  "data/campaign-events",
  "data/compliance",
  "data/election",
  "data/simulations",
  "data/intelligence/briefs",
  "data/intelligence/backups",
  "data/campaign-brain/city-intelligence-profiles.json",
  "data/campaign-brain/kelly-voter-audience-models.json",
  "data/campaign-brain/media-outreach",
  "data/campaign-brain/fairs-festivals",
  "data/campaign-brain/calendar-settlement",
  "data/campaign-brain/county-coverage",
  "data/campaign-brain/executive-book",
  "data/campaign-brain/operations-lock",
];

const LAUNCH_ADMIN_TOP_KEEP = new Set(["login", "(board)", "opposition"]);
const LAUNCH_BOARD_KEEP = new Set(["intelligence"]);
/**
 * kelly_sos_ops on Netlify — whitelist only boards needed for live ops.
 * Everything else under admin/(board) is dropped so ___netlify-server-handler stays under 250 MB.
 */
/**
 * kelly_sos_ops on Netlify — minimal board set for Day-3 volunteer intake + login.
 * Intelligence / campaign-events / evidence trees push ___netlify-server-handler over 250 MB.
 */
const KELLY_OPS_NETLIFY_BOARD_KEEP = new Set([
  "workbench",
  "election-plan",
  "settings",
  "volunteers",
  "asks",
  "my-work",
]);
/** Default admin API keep (opposition launch). Netlify kelly_sos_ops overrides below. */
const LAUNCH_API_ADMIN_KEEP = new Set(["intelligence", "opposition"]);
const KELLY_OPS_API_ADMIN_KEEP = new Set(["volunteers", "workbench"]);
/** Kelly SOS production — keep public site + election-plan portal (force-dynamic). */
const LAUNCH_APP_TOP_KEEP = new Set([
  "admin",
  "election-plan",
  "(site)",
  "volunteers",
  "onboarding",
  "dashboard",
]);
const LAUNCH_API_TOP_KEEP = new Set(["admin", "election-plan", "forms", "search"]);

/** Standalone copy lands the whole repo in the handler — keep only these top-level names. */
const LAUNCH_HANDLER_ROOT_KEEP = new Set([
  ".next",
  "node_modules",
  "data",
  "docs",
  "package.json",
]);

/**
 * @netlify/plugin-nextjs writes includedFiles: ["**"] which re-globs the site root into the
 * upload zip after prune. Replace with exclusions only (no "**") so deploy uploads the pruned
 * handler directory without pulling Volunteer Presentation / full node_modules / data back in.
 */
const MANIFEST_INCLUDED_EXCLUSIONS = [
  "!.git/**",
  "!.next/cache/**",
  "!.next/static/**",
  "!.next/diagnostics/**",
  "!.next/types/**",
  "!node_modules/@googleapis/**",
  "!node_modules/googleapis/**",
  "!node_modules/google-auth-library/**",
  "!node_modules/twilio/**",
  "!node_modules/mammoth/**",
  "!node_modules/xlsx/**",
  "!node_modules/pdf-parse/**",
  "!node_modules/typescript/**",
  "!node_modules/webpack/**",
  "!node_modules/next/**",
  "!node_modules/@img/**",
  "!node_modules/sharp/**",
  "!data/**",
  "!docs/**",
  "!.env",
  "!.env.*",
  "!**/.env",
  "!**/.env.*",
  "!public/**",
  "!docs/kelly-grappe-sos-strategic-plan-manual/**",
  "!campaign-system-manual/**",
  "!src/**",
  "!prisma/**",
  "!scripts/**",
  "!canvases/**",
  "!Volunteer Presentation/**",
  "!Volunteer Presentation",
  "!develop_notes/**",
  "!field-structure/**",
  "!reports/**",
  "!county-vault/**",
  "!campaign-media/**",
  "!out/**",
  "!backups/**",
  "!.github/**",
  "!.vscode/**",
  "!.local/**",
  "!**/.local/**",
  "!**/npm-cache/**",
  "!**/_cacache/**",
];

/** Pre-rendered public segments — drop from Lambda; pages render on demand. */
const LAUNCH_PUBLIC_SERVER_DIRS = [
  ".next/server/app/(site)/events",
  ".next/server/app/(site)/stories",
  ".next/server/app/(site)/resources",
  ".next/server/app/(site)/editorial",
  ".next/server/app/(site)/explainers",
  ".next/server/app/(site)/local-organizing",
  ".next/server/app/(site)/about",
  ".next/server/app/(site)/office",
  ".next/server/app/(site)/dashboard",
  ".next/server/app/(site)/counties",
  ".next/server/app/(site)/volunteer",
  ".next/server/app/(site)/from-the-road",
  ".next/server/app/(site)/messages",
  ".next/server/app/(site)/endorsements",
  ".next/server/app/(site)/priorities",
  ".next/server/app/(site)/understand",
  ".next/server/app/(site)/listening-sessions",
  ".next/server/app/(site)/kelly-speaks",
  ".next/server/app/(site)/county-briefings",
  ".next/server/app/(site)/start-a-local-team",
  ".next/server/app/(site)/bring-5",
  ".next/server/app/(site)/get-involved/bring-5",
  ".next/server/app/(site)/campaign-trail",
  ".next/server/app/(site)/updates",
  ".next/server/app/(site)/watch",
  ".next/server/app/(site)/conversations",
  ".next/server/app/(site)/organizing-intelligence",
  ".next/server/app/election-plan/(portal)/debate-prep",
  ".next/server/app/election-plan/(portal)/executive-book",
  ".next/server/app/election-plan/(portal)/battlefield",
  ".next/server/app/election-plan/(portal)/counties",
  ".next/server/app/election-plan/(portal)/cities",
  ".next/server/app/election-plan/(portal)/war-room",
  ".next/server/app/admin/opposition",
  ".next/server/app/admin/(board)/intelligence",
  ".next/server/app/admin/(board)/evidence-workbench",
  ".next/server/app/admin/(board)/campaign-events",
  ".next/server/app/admin/(board)/campaign-calendar",
  ".next/server/app/admin/(board)/compliance",
];

const LAUNCH_NODE_MODULES_DIRS = [
  "node_modules/@googleapis",
  "node_modules/google-auth-library",
  "node_modules/googleapis",
  "node_modules/twilio",
  "node_modules/mammoth",
  "node_modules/xlsx",
  "node_modules/pdf-parse",
  "node_modules/typescript",
  "node_modules/webpack",
];

/** Physical copies only — do not copy `next` (adds dev maps/webpack; already in handler trace). */
const MINIMAL_NODE_MODULES = [
  ".prisma",
  "@prisma/client",
  "@next/env",
  "react",
  "react-dom",
];

const FILE_PRUNE = [
  "node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node",
  "node_modules/next/dist/server/capsize-font-metrics.json",
  "node_modules/.prisma/client/index.d.ts",
  "node_modules/@prisma/client/index.d.ts",
  "node_modules/.prisma/client/runtime/query_engine_bg.postgresql.wasm",
  "node_modules/@prisma/client/runtime/query_engine_bg.postgresql.wasm",
  "node_modules/.prisma/client/query_engine-windows.dll.node",
  "node_modules/.prisma/client/query_engine_bg.postgresql.wasm",
];

const DIR_PRUNE_AFTER_MATERIALIZE = [
  "node_modules/next/dist/compiled/webpack",
  "node_modules/next/dist/compiled/next-devtools",
];

const MAX_MB = 250;
/** Fail before Netlify upload if deploy-size estimate exceeds this (margin for zip/included_files drift). */
const DEPLOY_FAIL_MB = 200;

function isNetlifyBuild() {
  return Boolean(process.env.NETLIFY || process.env.NETLIFY_BUILD_BASE);
}

function isOppositionDebateLaunch() {
  return process.env.NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE === OPPOSITION_DEBATE_LAUNCH;
}

function isKellySosLaunch() {
  const mode = process.env.NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE;
  return !mode || mode === KELLY_SOS_LAUNCH || mode === "kelly_sos_ops";
}

/** Aggressive handler shrink on every Netlify deploy (250 MB unzipped upload cap). */
function shouldRunAggressiveLaunchPrune() {
  return isNetlifyBuild() || isOppositionDebateLaunch();
}

function exists(target) {
  try {
    fs.accessSync(target);
    return true;
  } catch {
    return false;
  }
}

function isSymlink(target) {
  try {
    return fs.lstatSync(target).isSymbolicLink();
  } catch {
    return false;
  }
}

function rmrf(target) {
  if (!exists(target)) return false;
  fs.rmSync(target, { recursive: true, force: true });
  return true;
}

function cpDir(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  /** Do not dereference — npm cacache blobs must not be copied into the handler. */
  fs.cpSync(src, dest, { recursive: true, dereference: false });
}

function isForbiddenBundlePath(absOrRel) {
  const hay = String(absOrRel).replace(/\\/g, "/");
  return (
    /npm-cache/i.test(hay) ||
    /_cacache/i.test(hay) ||
    /\/\.local\//i.test(hay) ||
    /^[a-zA-Z]:\//.test(hay)
  );
}

/** Drop npm-cache / drive-letter paths that must never ship in the Lambda. */
function removeForbiddenBundlePaths(treeRoot) {
  const removed = [];
  if (!exists(treeRoot)) return removed;

  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const abs = path.join(dir, ent.name);
      const rel = path.relative(treeRoot, abs);
      if (isForbiddenBundlePath(rel) || isForbiddenBundlePath(abs) || /^[A-Za-z]:$/.test(ent.name)) {
        if (rmrf(abs)) removed.push(rel || ent.name);
        continue;
      }
      if (ent.isSymbolicLink()) {
        let target = "";
        try {
          target = fs.readlinkSync(abs);
        } catch {
          fs.rmSync(abs, { force: true });
          removed.push(rel);
          continue;
        }
        if (isForbiddenBundlePath(target)) {
          fs.rmSync(abs, { force: true });
          removed.push(rel);
          continue;
        }
      }
      if (ent.isDirectory()) walk(abs);
    }
  }

  walk(treeRoot);
  return removed;
}

function shouldPruneDirName(name, relFromHandler) {
  if (name === "public" || name === "calendar-command-center" || name === "owned-campaign-media") return true;
  if (name === ".netlify" || name === ".tmp-heic-preview") return true;
  if (name === "typescript" && relFromHandler.includes(`${path.sep}node_modules${path.sep}`)) return true;
  if (/linuxmusl/i.test(name) || /sharp-libvips-linuxmusl/i.test(name)) return true;
  if (name === "amphtml-validator" && relFromHandler.includes("next/dist/compiled")) return true;
  return false;
}

function removeOutboundSymlinks(handlerRoot) {
  const root = fs.realpathSync(handlerRoot);
  const removed = [];
  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const abs = path.join(dir, ent.name);
      if (ent.isSymbolicLink()) {
        let target;
        try {
          target = fs.realpathSync(abs);
        } catch {
          fs.rmSync(abs, { force: true });
          removed.push(path.relative(handlerRoot, abs));
          continue;
        }
        if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
          fs.rmSync(abs, { force: true });
          removed.push(path.relative(handlerRoot, abs));
        }
      } else if (ent.isDirectory()) {
        walk(abs);
      }
    }
  }
  walk(root);
  return removed;
}

function pruneLaunchAdminServer(
  treeRoot,
  boardKeep = LAUNCH_BOARD_KEEP,
  apiAdminKeep = LAUNCH_API_ADMIN_KEEP,
) {
  const removed = [];
  const adminRoot = path.join(treeRoot, ".next/server/app/admin");
  if (exists(adminRoot)) {
    for (const ent of fs.readdirSync(adminRoot, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      if (LAUNCH_ADMIN_TOP_KEEP.has(ent.name)) continue;
      const rel = path.join(".next/server/app/admin", ent.name);
      if (rmrf(path.join(treeRoot, rel))) removed.push(rel);
    }
  }

  const boardRoot = path.join(treeRoot, ".next/server/app/admin/(board)");
  if (exists(boardRoot)) {
    for (const ent of fs.readdirSync(boardRoot, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      if (boardKeep.has(ent.name)) continue;
      const rel = path.join(".next/server/app/admin/(board)", ent.name);
      if (rmrf(path.join(treeRoot, rel))) removed.push(rel);
    }
  }

  const apiAdminRoot = path.join(treeRoot, ".next/server/app/api/admin");
  if (exists(apiAdminRoot)) {
    for (const ent of fs.readdirSync(apiAdminRoot, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      if (apiAdminKeep.has(ent.name)) continue;
      const rel = path.join(".next/server/app/api/admin", ent.name);
      if (rmrf(path.join(treeRoot, rel))) removed.push(rel);
    }
  }

  return removed;
}

/** Drop Windows tmp engines, type defs, and non-Linux Prisma binaries from the handler copy. */
function prunePrismaClientBloat(handlerRoot) {
  const removed = [];
  const clientDir = path.join(handlerRoot, "node_modules/.prisma/client");
  if (!exists(clientDir)) return removed;
  let entries;
  try {
    entries = fs.readdirSync(clientDir, { withFileTypes: true });
  } catch {
    return removed;
  }
  for (const ent of entries) {
    if (!ent.isFile()) continue;
    const name = ent.name;
    const drop =
      /\.tmp/i.test(name) ||
      /\.d\.ts$/i.test(name) ||
      /windows/i.test(name) ||
      /darwin/i.test(name) ||
      /\.wasm$/i.test(name) ||
      /openssl-1\.0/i.test(name);
    if (!drop) continue;
    const rel = path.join("node_modules/.prisma/client", name);
    try {
      fs.rmSync(path.join(handlerRoot, rel), { force: true });
      removed.push(rel);
    } catch {
      /* skip */
    }
  }
  return removed;
}

function pruneLaunchData(treeRoot) {
  const removed = [];
  for (const rel of LAUNCH_DATA_DIR_PRUNE) {
    if (rmrf(path.join(treeRoot, rel))) removed.push(rel);
  }
  // Netlify: drop remaining data trees (public SSR must not rely on multi‑GB disk payloads).
  if (isNetlifyBuild()) {
    const dataRoot = path.join(treeRoot, "data");
    if (exists(dataRoot)) {
      for (const ent of fs.readdirSync(dataRoot, { withFileTypes: true })) {
        const rel = path.join("data", ent.name);
        if (rmrf(path.join(treeRoot, rel))) removed.push(rel);
      }
    }
  }
  return removed;
}

/** Keep only opposition dossiers — Kim Hammer loaders read docs/opposition/*.md at runtime. */
function pruneLaunchDocs(treeRoot) {
  const removed = [];
  const docsRoot = path.join(treeRoot, "docs");
  if (!exists(docsRoot)) return removed;
  for (const ent of fs.readdirSync(docsRoot, { withFileTypes: true })) {
    if (ent.name === "opposition") continue;
    const rel = path.join("docs", ent.name);
    if (rmrf(path.join(treeRoot, rel))) removed.push(rel);
  }
  return removed;
}

function deleteAllSymlinks(treeRoot) {
  const removed = [];
  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const abs = path.join(dir, ent.name);
      if (ent.isSymbolicLink()) {
        fs.rmSync(abs, { force: true });
        removed.push(path.relative(treeRoot, abs));
        continue;
      }
      if (ent.isDirectory()) walk(abs);
    }
  }
  walk(treeRoot);
  return removed;
}

function pruneLaunchHandlerRoot(handlerRoot) {
  const removed = [];
  let entries;
  try {
    entries = fs.readdirSync(handlerRoot, { withFileTypes: true });
  } catch {
    return removed;
  }
  for (const ent of entries) {
    if (!ent.isDirectory() && !ent.isFile()) continue;
    if (LAUNCH_HANDLER_ROOT_KEEP.has(ent.name)) {
      if (ent.name === "data") removed.push(...pruneLaunchData(handlerRoot));
      if (ent.name === "docs") removed.push(...pruneLaunchDocs(handlerRoot));
      continue;
    }
    const rel = ent.name;
    if (rmrf(path.join(handlerRoot, rel))) removed.push(rel);
  }
  return removed;
}

function pruneLaunchAppAndApi(
  handlerRoot,
  opts = {
    stripAdminBoards: true,
    boardKeep: LAUNCH_BOARD_KEEP,
    apiAdminKeep: LAUNCH_API_ADMIN_KEEP,
  },
) {
  const removed = [];
  const appRoot = path.join(handlerRoot, ".next/server/app");
  if (!exists(appRoot)) return removed;
  const apiAdminKeep = opts.apiAdminKeep ?? LAUNCH_API_ADMIN_KEEP;

  for (const ent of fs.readdirSync(appRoot, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    if (LAUNCH_APP_TOP_KEEP.has(ent.name)) {
      if (ent.name === "admin" && opts.stripAdminBoards) {
        removed.push(
          ...pruneLaunchAdminServer(
            handlerRoot,
            opts.boardKeep ?? LAUNCH_BOARD_KEEP,
            apiAdminKeep,
          ),
        );
      }
      continue;
    }
    const rel = path.join(".next/server/app", ent.name);
    if (rmrf(path.join(handlerRoot, rel))) removed.push(rel);
  }

  const apiRoot = path.join(appRoot, "api");
  if (exists(apiRoot)) {
    for (const ent of fs.readdirSync(apiRoot, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      if (LAUNCH_API_TOP_KEEP.has(ent.name)) {
        if (ent.name === "admin") {
          const adminApi = path.join(apiRoot, "admin");
          if (exists(adminApi)) {
            for (const child of fs.readdirSync(adminApi, { withFileTypes: true })) {
              if (!child.isDirectory()) continue;
              if (apiAdminKeep.has(child.name)) continue;
              const rel = path.join(".next/server/app/api/admin", child.name);
              if (rmrf(path.join(handlerRoot, rel))) removed.push(rel);
            }
          }
        }
        continue;
      }
      const rel = path.join(".next/server/app/api", ent.name);
      if (rmrf(path.join(handlerRoot, rel))) removed.push(rel);
    }
  }

  return removed;
}

function patchServerHandlerManifest(cwd) {
  const manifestPath = path.join(cwd, ".netlify/functions-internal/___netlify-server-handler.json");
  if (!exists(manifestPath)) return false;
  const json = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (!json.config) return false;
  // Do not prefix with "**" — that re-includes the whole site root at upload time.
  json.config.includedFiles = [...MANIFEST_INCLUDED_EXCLUSIONS];
  fs.writeFileSync(manifestPath, `${JSON.stringify(json)}\n`);
  return true;
}

function materializeMinimalNodeModules(handlerRoot, repoRoot) {
  const destNm = path.join(handlerRoot, "node_modules");
  const srcNm = path.join(repoRoot, "node_modules");
  if (!exists(srcNm)) return [];

  const copied = [];
  if (exists(destNm)) rmrf(destNm);
  fs.mkdirSync(destNm, { recursive: true });

  const minimalList = (() => {
    let list = MINIMAL_NODE_MODULES;
    // Netlify Image CDN covers /_next/image — sharp + libvips blow the 250 MB unzipped cap.
    if (isNetlifyBuild() || isOppositionDebateLaunch()) {
      list = list.filter((rel) => !rel.includes("sharp") && !rel.startsWith("@img/"));
    }
    return list;
  })();

  for (const rel of minimalList) {
    const src = path.join(srcNm, ...rel.split("/"));
    const dest = path.join(destNm, ...rel.split("/"));
    if (!exists(src)) continue;
    rmrf(dest);
    cpDir(src, dest);
    copied.push(`node_modules/${rel}`);
  }
  return copied;
}

/** Drop dev/source-map bloat Netlify must not upload (saves ~50+ MB). */
function stripDevArtifacts(handlerRoot) {
  const removed = [];
  for (const rel of DIR_PRUNE_AFTER_MATERIALIZE) {
    if (rmrf(path.join(handlerRoot, rel))) removed.push(rel);
  }

  const root = fs.realpathSync(handlerRoot);
  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const abs = path.join(dir, ent.name);
      const rel = path.relative(handlerRoot, abs);
      if (ent.isSymbolicLink()) continue;
      if (ent.isDirectory()) {
        walk(abs);
        continue;
      }
      if (!ent.isFile()) continue;
      const drop =
        /\.map$/i.test(ent.name) ||
        /\.d\.ts$/i.test(ent.name) ||
        /development/i.test(ent.name) ||
        /\.dev\./i.test(rel) ||
        /devtools/i.test(rel) ||
        /turbo-experimental/i.test(rel);
      if (drop) {
        try {
          fs.rmSync(abs, { force: true });
          removed.push(rel);
        } catch {
          /* skip */
        }
      }
    }
  }
  walk(root);
  return [...new Set(removed)];
}

function dirSizeBytes(rootDir, followSymlinks = false) {
  const root = fs.realpathSync(rootDir);
  let total = 0;
  function walk(dir) {
    let resolvedDir;
    try {
      resolvedDir = followSymlinks ? fs.realpathSync(dir) : dir;
    } catch {
      return;
    }
    if (!followSymlinks) {
      if (resolvedDir !== root && !resolvedDir.startsWith(`${root}${path.sep}`)) return;
    }

    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const abs = path.join(dir, ent.name);
      if (ent.isSymbolicLink() && followSymlinks) {
        try {
          walk(fs.realpathSync(abs));
        } catch {
          /* skip */
        }
        continue;
      }
      if (ent.isDirectory()) {
        if (!followSymlinks) {
          let linkTarget;
          try {
            linkTarget = fs.realpathSync(abs);
          } catch {
            continue;
          }
          if (linkTarget !== abs && !linkTarget.startsWith(`${root}${path.sep}`) && linkTarget !== root) {
            continue;
          }
        }
        walk(abs);
      } else if (ent.isFile()) {
        try {
          total += fs.statSync(abs).size;
        } catch {
          /* skip */
        }
      }
    }
  }
  walk(root);
  return total;
}

function dirSizeBytesFollowSymlinks(rootDir) {
  return dirSizeBytes(rootDir, true);
}

function pruneHandler(handlerRoot, repoRoot) {
  const removed = removeForbiddenBundlePaths(handlerRoot);
  removed.push(...removeOutboundSymlinks(handlerRoot));
  removed.push(...removeForbiddenBundlePaths(handlerRoot));

  for (const rel of TOP_LEVEL_DIR_PRUNE) {
    if (rmrf(path.join(handlerRoot, rel))) removed.push(rel);
  }

  if (shouldRunAggressiveLaunchPrune()) {
    removed.push(...deleteAllSymlinks(handlerRoot));
    removed.push(...pruneLaunchHandlerRoot(handlerRoot));
    const boardKeep = isOppositionDebateLaunch()
      ? LAUNCH_BOARD_KEEP
      : isNetlifyBuild()
        ? KELLY_OPS_NETLIFY_BOARD_KEEP
        : null;
    const apiAdminKeep = isNetlifyBuild() && !isOppositionDebateLaunch()
      ? KELLY_OPS_API_ADMIN_KEEP
      : LAUNCH_API_ADMIN_KEEP;
    removed.push(
      ...pruneLaunchAppAndApi(handlerRoot, {
        // On Netlify always whitelist admin boards — full ops tree exceeds 250 MB.
        stripAdminBoards: Boolean(boardKeep),
        boardKeep: boardKeep ?? LAUNCH_BOARD_KEEP,
        apiAdminKeep,
      }),
    );
    for (const rel of LAUNCH_PUBLIC_SERVER_DIRS) {
      if (rmrf(path.join(handlerRoot, rel))) removed.push(rel);
    }
    for (const rel of LAUNCH_NODE_MODULES_DIRS) {
      if (rmrf(path.join(handlerRoot, rel))) removed.push(rel);
    }
    removed.push(...materializeMinimalNodeModules(handlerRoot, repoRoot));
    removed.push(...prunePrismaClientBloat(handlerRoot));
    removed.push(...deleteAllSymlinks(handlerRoot));
  }

  for (const rel of FILE_PRUNE) {
    const abs = path.join(handlerRoot, rel);
    if (exists(abs)) {
      fs.rmSync(abs, { force: true });
      removed.push(rel);
    }
  }
  removed.push(...prunePrismaClientBloat(handlerRoot));

  const nm = path.join(handlerRoot, "node_modules");
  if (exists(nm)) {
    const img = path.join(nm, "@img");
    if (exists(img)) {
      for (const ent of fs.readdirSync(img, { withFileTypes: true })) {
        if (/linuxmusl/i.test(ent.name)) {
          const rel = `node_modules/@img/${ent.name}`;
          if (rmrf(path.join(handlerRoot, rel))) removed.push(rel);
        }
      }
    }
    for (const ent of fs.readdirSync(nm, { withFileTypes: true })) {
      if (/linuxmusl/i.test(ent.name)) {
        const rel = `node_modules/${ent.name}`;
        if (rmrf(path.join(handlerRoot, rel))) removed.push(rel);
      }
    }
  }

  const dirQueue = [handlerRoot];
  while (dirQueue.length > 0) {
    const dir = dirQueue.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      const abs = path.join(dir, ent.name);
      const rel = path.relative(handlerRoot, abs);
      if (shouldPruneDirName(ent.name, rel)) {
        if (rmrf(abs)) removed.push(rel);
        continue;
      }
      dirQueue.push(abs);
    }
  }

  removed.push(...stripDevArtifacts(handlerRoot));

  return [...new Set(removed)];
}

function largestFiles(handlerRoot, limit = 15, followSymlinks = true) {
  const root = fs.realpathSync(handlerRoot);
  const rows = [];
  const seen = new Set();
  function walk(dir) {
    let resolvedDir;
    try {
      resolvedDir = fs.realpathSync(dir);
    } catch {
      return;
    }
    if (seen.has(resolvedDir)) return;
    seen.add(resolvedDir);
    if (resolvedDir !== root && !resolvedDir.startsWith(`${root}${path.sep}`)) return;

    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const abs = path.join(dir, ent.name);
      if (ent.isSymbolicLink() && followSymlinks) {
        try {
          walk(fs.realpathSync(abs));
        } catch {
          /* skip */
        }
        continue;
      }
      if (ent.isDirectory()) walk(abs);
      else if (ent.isFile()) {
        try {
          rows.push({ rel: path.relative(handlerRoot, abs), size: fs.statSync(abs).size });
        } catch {
          /* skip */
        }
      }
    }
  }
  walk(root);
  return rows.sort((a, b) => b.size - a.size).slice(0, limit);
}

function pruneNetlifyServerHandler(cwd = process.cwd()) {
  /** Only mutate the packaged handler — never repo `.next` (breaks @netlify/plugin-nextjs onBuild). */
  const handlers = HANDLER_DIRS.map((d) => path.join(cwd, d)).filter(exists);
  const removed = [];
  if (handlers.length === 0) {
    const skipped = {
      skipped: true,
      handler: null,
      beforeMb: 0,
      afterMb: 0,
      deployMb: 0,
      manifestPatched: false,
      removed: [...new Set(removed)],
    };
    return skipped;
  }

  let beforeMb = 0;
  let afterMb = 0;
  let deployMb = 0;
  for (const handler of handlers) {
    beforeMb += dirSizeBytes(handler) / (1024 * 1024);
    removed.push(...pruneHandler(handler, cwd));
    afterMb += dirSizeBytes(handler) / (1024 * 1024);
    deployMb += dirSizeBytesFollowSymlinks(handler) / (1024 * 1024);
  }

  const manifestPatched = isNetlifyBuild() ? patchServerHandlerManifest(cwd) : false;

  return {
    skipped: false,
    handler: handlers[0],
    beforeMb,
    afterMb,
    deployMb,
    manifestPatched,
    removed: [...new Set(removed)],
  };
}

function formatOversizeMessage(result) {
  if (result.skipped || !result.handler) {
    return "___netlify-server-handler directory missing after @netlify/plugin-nextjs onBuild.";
  }
  const top = largestFiles(result.handler)
    .map((row) => `  ${(row.size / (1024 * 1024)).toFixed(2)} MB  ${row.rel}`)
    .join("\n");
  const mode = process.env.NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE ?? "default";
  const launchNote = `\nLaunch mode: ${mode}.`;
  return (
    `___netlify-server-handler deploy size is ${result.deployMb.toFixed(1)} MB (Netlify unzipped limit ${MAX_MB} MB).` +
    ` Staging tree: ${result.afterMb.toFixed(1)} MB.${launchNote}\nLargest files:\n${top}`
  );
}

function shouldFailDeploy(result) {
  if (result.skipped) {
    return isNetlifyBuild();
  }
  const measuredMb = Math.max(result.afterMb, result.deployMb);
  return measuredMb > DEPLOY_FAIL_MB;
}

if (require.main === module) {
  const result = pruneNetlifyServerHandler();
  if (result.skipped) {
    console.log(">>> prune server handler: directory not found yet (skip)");
    process.exit(0);
  }
  console.log(
    `>>> prune server handler: ${result.beforeMb.toFixed(1)} MB → ${result.afterMb.toFixed(1)} MB staging, ${result.deployMb.toFixed(1)} MB deploy (${result.removed.length} paths)`,
  );
  if (shouldFailDeploy(result)) {
    console.error(formatOversizeMessage(result));
    process.exit(2);
  }
}

module.exports = {
  pruneNetlifyServerHandler,
  formatOversizeMessage,
  shouldFailDeploy,
  isNetlifyBuild,
  isKellySosLaunch,
  isOppositionDebateLaunch,
  MAX_MB,
  DEPLOY_FAIL_MB,
};
