#!/usr/bin/env node
/**
 * After `netlify build` (or local plugin output), prints unzipped size of
 * `___netlify-server-handler` so we can stay under Netlify’s 250 MB Lambda cap.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const candidates = [
  path.join(root, ".netlify", "functions-internal", "___netlify-server-handler"),
  path.join(root, ".netlify", "functions", "___netlify-server-handler"),
];

function dirSizeBytes(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) total += dirSizeBytes(abs);
    else if (entry.isFile()) total += fs.statSync(abs).size;
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
const status = mb <= limitMb ? "OK" : "OVER_LIMIT";

console.log(`Handler: ${handlerDir}`);
console.log(`Unzipped size: ${mb.toFixed(2)} MB (${status}; Netlify cap ${limitMb} MB)`);

if (status === "OVER_LIMIT") process.exit(2);
