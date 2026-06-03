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

const DIR_PRUNE = [
  ".git",
  ".next/cache",
  ".tmp-heic-preview",
  "data/calendar-command-center",
  "data/owned-campaign-media",
  "public",
];

const FILE_PRUNE = ["node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node"];

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

function dirSizeBytes(dir) {
  let total = 0;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) total += dirSizeBytes(abs);
    else if (ent.isFile()) total += fs.statSync(abs).size;
  }
  return total;
}

function pruneHandler(handlerRoot) {
  const removed = [];
  for (const rel of DIR_PRUNE) {
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
    for (const ent of fs.readdirSync(nm, { withFileTypes: true })) {
      if (ent.name.includes("linuxmusl") || ent.name.includes("sharp-libvips-linuxmusl")) {
        const rel = `node_modules/${ent.name}`;
        if (rmrf(path.join(handlerRoot, rel))) removed.push(rel);
      }
    }
  }
  return removed;
}

function largestFiles(handlerRoot, limit = 12) {
  const rows = [];
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(abs);
      else if (ent.isFile()) rows.push({ rel: path.relative(handlerRoot, abs), size: fs.statSync(abs).size });
    }
  }
  walk(handlerRoot);
  return rows.sort((a, b) => b.size - a.size).slice(0, limit);
}

function pruneNetlifyServerHandler(cwd = process.cwd()) {
  const handler = HANDLER_DIRS.map((d) => path.join(cwd, d)).find(exists);
  if (!handler) {
    return { skipped: true, handler: null, beforeMb: 0, afterMb: 0, removed: [] };
  }
  const beforeMb = dirSizeBytes(handler) / (1024 * 1024);
  const removed = pruneHandler(handler);
  const afterMb = dirSizeBytes(handler) / (1024 * 1024);
  return { skipped: false, handler, beforeMb, afterMb, removed };
}

function formatOversizeMessage(result) {
  const top = largestFiles(result.handler)
    .map((row) => `  ${(row.size / (1024 * 1024)).toFixed(2)} MB  ${row.rel}`)
    .join("\n");
  return `___netlify-server-handler is ${result.afterMb.toFixed(1)} MB after prune (Netlify limit ${MAX_MB} MB).\nLargest files:\n${top}`;
}

if (require.main === module) {
  const result = pruneNetlifyServerHandler();
  if (result.skipped) {
    console.log(">>> prune server handler: directory not found yet (skip)");
    process.exit(0);
  }
  console.log(
    `>>> prune server handler: ${result.beforeMb.toFixed(1)} MB → ${result.afterMb.toFixed(1)} MB (${result.removed.length} paths removed)`,
  );
  if (result.afterMb > MAX_MB) {
    console.error(formatOversizeMessage(result));
    process.exit(2);
  }
}

module.exports = {
  pruneNetlifyServerHandler,
  formatOversizeMessage,
  MAX_MB,
};
