#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const serverDir = path.join(root, ".next", "server");

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, out);
    else if (entry.name.endsWith(".nft.json")) out.push(abs);
  }
  return out;
}

const nftFiles = walk(serverDir);
const byAbs = new Map();
let missing = 0;

for (const nftPath of nftFiles) {
  const json = JSON.parse(fs.readFileSync(nftPath, "utf8"));
  const nftDir = path.dirname(nftPath);
  for (const rel of json.files ?? []) {
    const abs = path.normalize(path.join(nftDir, rel));
    if (byAbs.has(abs)) continue;
    try {
      const size = fs.statSync(abs).size;
      byAbs.set(abs, { rel, size });
    } catch {
      missing += 1;
    }
  }
}

function isTraceNoise(rel, abs) {
  const hay = `${rel} ${abs}`.replace(/\\/g, "/");
  return (
    hay.includes("/.next/cache/") ||
    hay.includes("/cache/webpack/") ||
    hay.includes("owned-campaign-media") ||
    hay.includes("countyWorkbench")
  );
}

let total = 0;
let swc = 0;
let pdf = 0;
let owned = 0;
let noise = 0;
for (const [abs, { rel, size }] of byAbs) {
  if (isTraceNoise(rel, abs)) {
    noise += size;
    continue;
  }
  total += size;
  if (rel.includes("@next/swc") || rel.includes("@swc/core") || abs.includes("@next\\swc") || abs.includes("@swc\\core"))
    swc += size;
  if (rel.includes("pdf-parse") || abs.includes("pdf-parse")) pdf += size;
  if (rel.includes("owned-campaign-media") || abs.includes("owned-campaign-media")) owned += size;
}

const limitMb = 250;
const totalMb = total / (1024 * 1024);

console.log(`Route trace files: ${nftFiles.length}`);
console.log(`Unique traced files (by absolute path): ${byAbs.size} (missing on disk: ${missing})`);
console.log(
  `Union unzipped size (excl. cache/owned-media/countyWorkbench noise): ${totalMb.toFixed(2)} MB (${totalMb <= limitMb ? "OK" : "OVER"} vs ${limitMb} MB cap)`,
);
console.log(`  Ignored trace noise: ${(noise / (1024 * 1024)).toFixed(2)} MB`);
console.log(`  @next/swc + @swc/core: ${(swc / (1024 * 1024)).toFixed(2)} MB`);
console.log(`  pdf-parse: ${(pdf / (1024 * 1024)).toFixed(2)} MB`);
console.log(`  owned-campaign-media: ${(owned / (1024 * 1024)).toFixed(2)} MB`);

const top = [...byAbs.entries()]
  .map(([abs, { rel, size }]) => [rel, size, abs])
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15);

console.log("\nLargest traced files:");
for (const [rel, size] of top) {
  console.log(`  ${(size / (1024 * 1024)).toFixed(2)} MB  ${rel}`);
}

if (totalMb > limitMb) process.exit(2);
