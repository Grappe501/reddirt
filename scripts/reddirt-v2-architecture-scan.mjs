#!/usr/bin/env node
/**
 * REDDIRT-V2-ARCH-REGISTRY — read-only architecture scanner
 *
 * Guarantees:
 * - Only reads from repo sources (docs, develop_notes, src, prisma, package.json, scripts).
 * - Optional: lists workspace parent siblings (names only) for boundary reporting — never writes there.
 * - Writes at most ONE artifact: data/architecture/reddirt_v2_arch_scan_snapshot.json
 *
 * Forbidden (enforced): no unlink/rmdir/rename; no writes outside data/architecture/.
 *
 * Usage: node scripts/reddirt-v2-architecture-scan.mjs
 *        node scripts/reddirt-v2-architecture-scan.mjs --stdout-only   (no JSON file write)
 */

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REDDIRT_ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(REDDIRT_ROOT, "data", "architecture");
const OUT_FILE = path.join(OUT_DIR, "reddirt_v2_arch_scan_snapshot.json");
const WORKSPACE_PARENT = path.resolve(REDDIRT_ROOT, "..");

const ALLOWED_WRITE_PREFIX = path.normalize(OUT_DIR + path.sep);
const READ_ROOTS_REL = ["docs", "develop_notes", "src", "prisma", "scripts"];
const MAX_FILES_PER_ROOT = 4000;
const MAX_FILE_BYTES = 512 * 1024;

const args = process.argv.slice(2);
const stdoutOnly = args.includes("--stdout-only");

/** @param {string} abs */
function isUnderDir(abs, dir) {
  const n = path.normalize(abs);
  const d = path.normalize(dir + path.sep);
  return n === dir || n.startsWith(d);
}

/**
 * @param {string} rootAbs
 * @param {string[]} exts
 */
async function collectFiles(rootAbs, exts) {
  const out = [];
  async function walk(dir) {
    if (out.length >= MAX_FILES_PER_ROOT) return;
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (out.length >= MAX_FILES_PER_ROOT) break;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === "node_modules" || e.name === ".next" || e.name === "dist") continue;
        await walk(full);
      } else if (e.isFile()) {
        const ext = path.extname(e.name).toLowerCase();
        if (exts.length && !exts.includes(ext)) continue;
        out.push(full);
      }
    }
  }
  await walk(rootAbs);
  return out;
}

async function hashFile(abs) {
  const buf = await fs.readFile(abs);
  const slice = buf.length > MAX_FILE_BYTES ? buf.subarray(0, MAX_FILE_BYTES) : buf;
  return crypto.createHash("sha256").update(slice).digest("hex");
}

async function listWorkspaceSiblings() {
  let names = [];
  try {
    names = await fs.readdir(WORKSPACE_PARENT);
  } catch (e) {
    return { error: String(e), names: [] };
  }
  return {
    error: null,
    names: names.sort(),
    resolvedParent: WORKSPACE_PARENT,
    reddirtFolderName: path.basename(REDDIRT_ROOT),
  };
}

async function main() {
  const readOnlyProof = {
    scannerId: "reddirt-v2-architecture-scan.mjs",
    writesAttemptedOnSourceTrees: false,
    allowedOutputPath: OUT_FILE,
    stdoutOnly,
    rules: [
      "No fs.writeFile outside data/architecture/",
      "No unlink, rename, or rmdir",
      "Source trees are read-only (readdir + readFile only)",
    ],
  };

  const docExts = [".md", ".mdx", ".json", ".yml", ".yaml"];
  const inventory = [];

  for (const rel of READ_ROOTS_REL) {
    const abs = path.join(REDDIRT_ROOT, rel);
    try {
      await fs.access(abs);
    } catch {
      inventory.push({ root: rel, skipped: true, reason: "missing" });
      continue;
    }
    const exts =
      rel === "docs" || rel === "develop_notes"
        ? docExts
        : [".ts", ".tsx", ".prisma", ".mjs", ".js", ".md", ".json"];
    const files = await collectFiles(abs, exts);
    const sample = [];
    for (const f of files.slice(0, 25)) {
      try {
        const st = await fs.stat(f);
        const h = await hashFile(f);
        sample.push({
          path: path.relative(REDDIRT_ROOT, f).replace(/\\/g, "/"),
          bytes: st.size,
          sha256Prefix: h.slice(0, 16),
        });
      } catch {
        /* skip */
      }
    }
    inventory.push({
      root: rel,
      filesDiscoveredCapped: files.length,
      walkCap: MAX_FILES_PER_ROOT,
      sample,
    });
  }

  const siblings = await listWorkspaceSiblings();

  const snapshot = {
    packet: "REDDIRT-V2-ARCH-REGISTRY-1.0-scan",
    generatedAt: new Date().toISOString(),
    reddirtRoot: REDDIRT_ROOT.replace(/\\/g, "/"),
    readOnlyProof,
    inventorySample: inventory,
    workspaceSiblings: siblings,
  };

  const json = JSON.stringify(snapshot, null, 2);

  if (stdoutOnly) {
    console.log(json);
    return;
  }

  if (!isUnderDir(OUT_FILE, OUT_DIR)) {
    throw new Error("Output path escaped allowlist");
  }
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, json, "utf8");

  console.log("REDDIRT-V2-ARCH-SCAN — OK");
  console.log("  read-only proof: no writes to src/, prisma/, docs/ (except snapshot path)");
  console.log("  wrote:", path.relative(REDDIRT_ROOT, OUT_FILE));
  console.log("  siblings listed:", siblings.names?.length ?? 0, "entries under workspace parent");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
