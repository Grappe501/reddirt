/**
 * Strip blobs from .netlify/functions-internal/___netlify-server-handler before Netlify zips it.
 * Used from netlify-build.sh (after next build) and the prune-server-handler Netlify plugin.
 */
const fs = require("node:fs");
const path = require("node:path");

const HANDLER_DIRS = [
  ".netlify/functions-internal/___netlify-server-handler",
  ".netlify/functions/___netlify-server-handler",
];

const FUNCTION_ZIP_CANDIDATES = [
  ".netlify/functions/___netlify-server-handler.zip",
  ".netlify/functions-internal/___netlify-server-handler.zip",
];

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

const FILE_PRUNE = [
  "node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node",
  "node_modules/next/dist/server/capsize-font-metrics.json",
];

const MAX_MB = 250;

function exists(target) {
  try {
    fs.accessSync(target);
    return true;
  } catch {
    return false;
  }
}

function rmrf(target) {
  if (!exists(target)) return false;
  fs.rmSync(target, { recursive: true, force: true });
  return true;
}

function shouldPruneDirName(name, relFromHandler) {
  if (name === "public" || name === "calendar-command-center" || name === "owned-campaign-media") return true;
  if (name === ".netlify" || name === ".tmp-heic-preview") return true;
  if (name === "typescript" && relFromHandler.includes(`${path.sep}node_modules${path.sep}`)) return true;
  if (/linuxmusl/i.test(name) || /sharp-libvips-linuxmusl/i.test(name)) return true;
  if (name === "amphtml-validator" && relFromHandler.includes("next/dist/compiled")) return true;
  return false;
}

function pruneHandler(handlerRoot) {
  const removed = [];

  for (const rel of TOP_LEVEL_DIR_PRUNE) {
    if (rmrf(path.join(handlerRoot, rel))) removed.push(rel);
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

function dirSizeBytes(rootDir) {
  const root = fs.realpathSync(rootDir);
  let total = 0;
  function walk(dir) {
    let resolvedDir;
    try {
      resolvedDir = fs.realpathSync(dir);
    } catch {
      return;
    }
    if (resolvedDir !== root && !resolvedDir.startsWith(`${root}${path.sep}`)) return;

    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        let linkTarget;
        try {
          linkTarget = fs.realpathSync(abs);
        } catch {
          continue;
        }
        if (linkTarget !== abs && !linkTarget.startsWith(`${root}${path.sep}`) && linkTarget !== root) {
          continue;
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

function largestFiles(handlerRoot, limit = 12) {
  const root = fs.realpathSync(handlerRoot);
  const rows = [];
  function walk(dir) {
    let resolvedDir;
    try {
      resolvedDir = fs.realpathSync(dir);
    } catch {
      return;
    }
    if (resolvedDir !== root && !resolvedDir.startsWith(`${root}${path.sep}`)) return;

    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, ent.name);
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

function measureFunctionZipMb(cwd) {
  for (const rel of FUNCTION_ZIP_CANDIDATES) {
    const abs = path.join(cwd, rel);
    if (exists(abs)) return fs.statSync(abs).size / (1024 * 1024);
  }
  const fnDir = path.join(cwd, ".netlify/functions");
  if (!exists(fnDir)) return null;
  for (const ent of fs.readdirSync(fnDir)) {
    if (!ent.endsWith(".zip") || !ent.includes("netlify-server-handler")) continue;
    return fs.statSync(path.join(fnDir, ent)).size / (1024 * 1024);
  }
  return null;
}

function pruneNetlifyServerHandler(cwd = process.cwd()) {
  const handler = HANDLER_DIRS.map((d) => path.join(cwd, d)).find(exists);
  if (!handler) {
    return { skipped: true, handler: null, beforeMb: 0, afterMb: 0, removed: [], zipMb: null };
  }
  const beforeMb = dirSizeBytes(handler) / (1024 * 1024);
  const removed = pruneHandler(handler);
  const afterMb = dirSizeBytes(handler) / (1024 * 1024);
  const zipMb = measureFunctionZipMb(cwd);
  return { skipped: false, handler, beforeMb, afterMb, removed, zipMb };
}

function formatOversizeMessage(result) {
  const top = largestFiles(result.handler)
    .map((row) => `  ${(row.size / (1024 * 1024)).toFixed(2)} MB  ${row.rel}`)
    .join("\n");
  const zipLine =
    result.zipMb == null ? "" : `\nPackaged function zip: ${result.zipMb.toFixed(1)} MB.`;
  return `___netlify-server-handler staging dir is ${result.afterMb.toFixed(1)} MB after prune (Netlify limit ${MAX_MB} MB).${zipLine}\nLargest files:\n${top}`;
}

function shouldFailDeploy(result) {
  if (result.zipMb != null && result.zipMb <= MAX_MB) return false;
  return result.afterMb > MAX_MB;
}

if (require.main === module) {
  const result = pruneNetlifyServerHandler();
  if (result.skipped) {
    console.log(">>> prune server handler: directory not found yet (skip)");
    process.exit(0);
  }
  const zipNote = result.zipMb == null ? "" : `; zip ${result.zipMb.toFixed(1)} MB`;
  console.log(
    `>>> prune server handler: ${result.beforeMb.toFixed(1)} MB → ${result.afterMb.toFixed(1)} MB (${result.removed.length} paths removed${zipNote})`,
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
