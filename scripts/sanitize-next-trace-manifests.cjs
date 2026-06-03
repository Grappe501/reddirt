#!/usr/bin/env node
/**
 * Remove absolute paths and npm cache entries from .next server NFT manifests so
 * Netlify's server handler does not bundle H: drive / .local/npm-cache blobs.
 */
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = process.cwd();
const serverDir = path.join(repoRoot, ".next", "server");

function isForbiddenPath(absOrRel) {
  const hay = absOrRel.replace(/\\/g, "/");
  return (
    /npm-cache/i.test(hay) ||
    /_cacache/i.test(hay) ||
    /\/\.local\//i.test(hay) ||
    /^[a-zA-Z]:\//.test(hay)
  );
}

function isUnderRepo(absPath) {
  const resolved = path.resolve(absPath);
  const root = path.resolve(repoRoot);
  return resolved === root || resolved.startsWith(`${root}${path.sep}`);
}

function walkNft(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) walkNft(abs, out);
    else if (ent.name.endsWith(".nft.json")) out.push(abs);
  }
  return out;
}

let filesStripped = 0;
let manifestsTouched = 0;

for (const nftPath of walkNft(serverDir)) {
  const json = JSON.parse(fs.readFileSync(nftPath, "utf8"));
  const nftDir = path.dirname(nftPath);
  const before = (json.files ?? []).length;
  const kept = [];

  for (const rel of json.files ?? []) {
    if (isForbiddenPath(rel)) {
      filesStripped += 1;
      continue;
    }
    const abs = path.isAbsolute(rel) ? rel : path.join(nftDir, rel);
    if (isForbiddenPath(abs) || !isUnderRepo(abs)) {
      filesStripped += 1;
      continue;
    }
    kept.push(rel);
  }

  if (kept.length !== before) {
    json.files = kept;
    fs.writeFileSync(nftPath, `${JSON.stringify(json)}\n`);
    manifestsTouched += 1;
  }
}

console.log(
  `>>> sanitize NFT manifests: ${manifestsTouched} files updated, ${filesStripped} forbidden paths removed`,
);
