#!/usr/bin/env node
/**
 * After `netlify build` (or local plugin output), prints deploy-relevant size of
 * `___netlify-server-handler` (follows symlinks like Netlify upload).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const candidates = [
  path.join(root, ".netlify", "functions-internal", "___netlify-server-handler"),
  path.join(root, ".netlify", "functions", "___netlify-server-handler"),
];

const seen = new Set();

function dirSizeBytes(dir) {
  let resolved;
  try {
    resolved = fs.realpathSync(dir);
  } catch {
    return 0;
  }
  if (seen.has(resolved)) return 0;
  seen.add(resolved);

  let total = 0;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return 0;
  }
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      try {
        total += dirSizeBytes(fs.realpathSync(abs));
      } catch {
        /* skip */
      }
      continue;
    }
    if (entry.isDirectory()) total += dirSizeBytes(abs);
    else if (entry.isFile()) {
      try {
        total += fs.statSync(abs).size;
      } catch {
        /* skip */
      }
    }
  }
  return total;
}

const handlerDir = candidates.find((p) => fs.existsSync(p));
if (!handlerDir) {
  console.error(
    "No ___netlify-server-handler directory found. Run from RedDirt root after `netlify build`."
  );
  console.error("Checked:\n" + candidates.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}

const bytes = dirSizeBytes(handlerDir);
const mb = bytes / (1024 * 1024);
const limitMb = 250;
const failMb = 245;
const status = mb <= failMb ? "OK" : mb <= limitMb ? "WARN" : "OVER_LIMIT";

console.log(`Handler: ${handlerDir}`);
console.log(`Deploy size (symlinks followed): ${mb.toFixed(2)} MB (${status}; fail > ${failMb} MB, Netlify cap ${limitMb} MB)`);

if (status === "OVER_LIMIT") process.exit(2);
