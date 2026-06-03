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

/** Runs after @netlify/plugin-nextjs packages ___netlify-server-handler. */
exports.onPostBuild = async ({ utils }) => {
  const root = process.cwd();
  const handler = HANDLER_DIRS.map((d) => path.join(root, d)).find(exists);
  if (!handler) {
    utils.status.show({ title: "Prune server handler", summary: "Handler dir not found — skip" });
    return;
  }

  const beforeMb = dirSizeBytes(handler) / (1024 * 1024);
  const removed = pruneHandler(handler);
  const afterMb = dirSizeBytes(handler) / (1024 * 1024);

  utils.status.show({
    title: "Prune server handler",
    summary: `${beforeMb.toFixed(1)} MB → ${afterMb.toFixed(1)} MB (${removed.length} paths removed)`,
  });

  if (afterMb > 250) {
    const top = largestFiles(handler)
      .map((row) => `  ${(row.size / (1024 * 1024)).toFixed(2)} MB  ${row.rel}`)
      .join("\n");
    return utils.build.fail(
      `___netlify-server-handler is ${afterMb.toFixed(1)} MB after prune (Netlify limit 250 MB).\nLargest files:\n${top}`,
    );
  }
};
