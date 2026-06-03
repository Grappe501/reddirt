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

const TOP_LEVEL_DIR_PRUNE = [
  ".git",
  ".next/cache",
  ".tmp-heic-preview",
  "data/calendar-command-center",
  "data/owned-campaign-media",
  "public",
  ".netlify",
  "docs",
];

const LAUNCH_ADMIN_SERVER_DIRS = [
  ".next/server/app/admin/(board)/workbench",
  ".next/server/app/admin/(board)/compliance",
  ".next/server/app/admin/(board)/campaign-events",
  ".next/server/app/admin/(board)/calendar-command-center",
  ".next/server/app/admin/(board)/campaign-calendar",
  ".next/server/app/admin/(board)/communications",
  ".next/server/app/admin/ai-command-center",
  ".next/server/app/admin/ask-kelly",
  ".next/server/app/admin/campaign-manager-dashboard",
  ".next/server/app/admin/candidate-dashboard",
  ".next/server/app/admin/travel-ledger",
  ".next/server/app/admin/volunteers",
  ".next/server/app/admin/owned-media",
  ".next/server/app/admin/onboarding",
  ".next/server/app/admin/(board)/campaign-strategy",
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

const MINIMAL_NODE_MODULES = [
  ".prisma",
  "@prisma/client",
  "@img/sharp-libvips-linux-x64",
  "@img/sharp-linux-x64",
  "sharp",
  "openai",
  "@next/env",
];

const FILE_PRUNE = [
  "node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node",
  "node_modules/next/dist/server/capsize-font-metrics.json",
];

const MAX_MB = 250;

function isOppositionDebateLaunch() {
  return process.env.NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE === OPPOSITION_DEBATE_LAUNCH;
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
  fs.cpSync(src, dest, { recursive: true, dereference: true });
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

function materializeMinimalNodeModules(handlerRoot, repoRoot) {
  const destNm = path.join(handlerRoot, "node_modules");
  const srcNm = path.join(repoRoot, "node_modules");
  if (!exists(srcNm)) return [];

  const copied = [];
  if (exists(destNm)) {
    if (isSymlink(destNm) || dirSizeBytesFollowSymlinks(destNm) > 80 * 1024 * 1024) {
      rmrf(destNm);
    }
  }
  if (!exists(destNm)) fs.mkdirSync(destNm, { recursive: true });

  for (const rel of MINIMAL_NODE_MODULES) {
    const src = path.join(srcNm, ...rel.split("/"));
    const dest = path.join(destNm, ...rel.split("/"));
    if (!exists(src)) continue;
    rmrf(dest);
    cpDir(src, dest);
    copied.push(`node_modules/${rel}`);
  }
  return copied;
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
  const removed = removeOutboundSymlinks(handlerRoot);

  for (const rel of TOP_LEVEL_DIR_PRUNE) {
    if (rmrf(path.join(handlerRoot, rel))) removed.push(rel);
  }

  if (isOppositionDebateLaunch()) {
    for (const rel of [...LAUNCH_ADMIN_SERVER_DIRS, ...LAUNCH_PUBLIC_SERVER_DIRS]) {
      if (rmrf(path.join(handlerRoot, rel))) removed.push(rel);
    }
    for (const rel of LAUNCH_NODE_MODULES_DIRS) {
      if (rmrf(path.join(handlerRoot, rel))) removed.push(rel);
    }
    removed.push(...materializeMinimalNodeModules(handlerRoot, repoRoot));
  }

  for (const rel of FILE_PRUNE) {
    const abs = path.join(handlerRoot, rel);
    if (exists(abs)) {
      fs.rmSync(abs, { force: true });
      removed.push(rel);
    }
  }

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
  const handlers = HANDLER_DIRS.map((d) => path.join(cwd, d)).filter(exists);
  if (handlers.length === 0) {
    return { skipped: true, handler: null, beforeMb: 0, afterMb: 0, deployMb: 0, removed: [] };
  }

  let beforeMb = 0;
  let afterMb = 0;
  let deployMb = 0;
  const removed = [];
  for (const handler of handlers) {
    beforeMb += dirSizeBytes(handler) / (1024 * 1024);
    removed.push(...pruneHandler(handler, cwd));
    afterMb += dirSizeBytes(handler) / (1024 * 1024);
    deployMb += dirSizeBytesFollowSymlinks(handler) / (1024 * 1024);
  }

  return {
    skipped: false,
    handler: handlers[0],
    beforeMb,
    afterMb,
    deployMb,
    removed: [...new Set(removed)],
  };
}

function formatOversizeMessage(result) {
  const top = largestFiles(result.handler)
    .map((row) => `  ${(row.size / (1024 * 1024)).toFixed(2)} MB  ${row.rel}`)
    .join("\n");
  const launchNote = isOppositionDebateLaunch() ? "\nLaunch mode: opposition_debate." : "";
  return (
    `___netlify-server-handler deploy size is ${result.deployMb.toFixed(1)} MB (Netlify unzipped limit ${MAX_MB} MB).` +
    ` Staging tree: ${result.afterMb.toFixed(1)} MB.${launchNote}\nLargest files:\n${top}`
  );
}

function shouldFailDeploy(result) {
  return !result.skipped && result.deployMb > MAX_MB;
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
  MAX_MB,
};
