/**
 * INGEST-OPS-2 — scan likely source folders; write markdown inventory (no DB, no imports of app code).
 *
 * Usage (from RedDirt/):
 *   npm run ingest:inventory
 *   INGEST_INVENTORY_ROOTS="C:\\a;C:\\b" npm run ingest:inventory
 *
 * Default roots: parent folder's "campaign information for ingestion" (monorepo layout), plus
 * INGEST_INVENTORY_ROOTS if set (semicolon-separated on Windows, or also supports colon if no drive letters conflict).
 * Writes: docs/INGEST_INVENTORY_GENERATED.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const outFile = path.join(repoRoot, "docs", "INGEST_INVENTORY_GENERATED.md");

const MAX_FILES = 5000;
const SKIP_NAMES = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "out",
  ".turbo",
]);

function defaultRoots() {
  const roots = [];
  const sib = path.join(repoRoot, "..", "campaign information for ingestion");
  roots.push(sib);
  return roots;
}

function envRoots() {
  const raw = process.env.INGEST_INVENTORY_ROOTS;
  if (!raw || !raw.trim()) return [];
  return raw
    .split(/[;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((p) => path.resolve(p));
}

function collectFiles(root) {
  const out = [];
  const stack = [root];
  while (stack.length && out.length < MAX_FILES) {
    const dir = stack.pop();
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      if (SKIP_NAMES.has(ent.name)) continue;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        stack.push(full);
      } else if (ent.isFile()) {
        out.push(full);
        if (out.length >= MAX_FILES) break;
      }
    }
  }
  return out;
}

function norm(s) {
  return s.toLowerCase();
}

/**
 * @param {string} fullPath
 */
function classifyDomain(fullPath) {
  const ext = path.extname(fullPath).toLowerCase();
  const p = norm(fullPath.replace(/\\/g, "/"));
  if (p.includes("electionresult") || p.includes("/election/") || p.endsWith(".json")) {
    if (p.includes("election") || p.includes("result")) return "election";
  }
  if (p.includes("election") && p.includes("result")) return "election";
  if (p.match(/202[0-9]_|general|primary|preferential/)) {
    if (p.endsWith(".json")) return "election";
  }
  if (p.includes("volunteer") || p.includes("signup") || p.includes("field")) return "volunteer";
  if (p.includes("financial") || p.includes("budget") || p.includes("fec") || p.includes("contribution"))
    return "financial";
  if (p.includes("county") && !p.includes("country")) return "county";
  if (p.includes("comms") || p.includes("email") || p.includes("messaging")) return "communications";
  if (
    p.includes("research") ||
    p.includes("briefing") ||
    p.includes("strategy") ||
    p.includes("playbook")
  )
    return "research";
  if (p.includes("compliance") || p.includes("ethics") || p.includes("handbook")) return "compliance";
  if (ext === ".json" && p.includes("election")) return "election";
  return "unknown";
}

/**
 * @param {string} domain
 * @param {string} ext
 */
function ingestPathNote(domain, ext) {
  if (domain === "election" && ext === ".json")
    return "`npm run ingest:election-results` (after `--dry-run`)";
  if (ext === ".csv" || ext === ".xlsx")
    return "Map in sheet → future parser / manual (no default prod import)";
  if (domain === "county")
    return "`ingest:county-wikipedia` (when applicable) / county content";
  if (domain === "research" || ext === ".pdf" || ext === ".docx")
    return "`ingest:docs` / `ingest:campaign-folder` / brain pipelines (op-driven)";
  if (domain === "volunteer")
    return "`ingest:volunteer-onboarding` / relational (op-driven)";
  return "— (triage) `audit:campaign-ingestion`";
}

/**
 * @param {string} domain
 */
function priority(domain) {
  if (domain === "election") return "P0 (before broad brain)";
  if (domain === "compliance") return "P1 (governance)";
  if (domain === "financial") return "P2 (map before import)";
  if (domain === "volunteer") return "P2";
  if (domain === "county" || domain === "research") return "P3";
  return "P3–P4";
}

/**
 * @param {string} domain
 */
function recommendedPacket(domain) {
  if (domain === "election") return "INGEST-OPS-3 (audit) / ongoing CLI per file";
  if (domain === "financial") return "INGEST-OPS-5 (first governed parser) + finance doc";
  if (domain === "unknown") return "INGEST-OPS-4 (manifest) + triage";
  return "INGEST-OPS-4 + domain-specific doc";
}

function main() {
  const roots = envRoots().length ? envRoots() : defaultRoots();
  const all = [];
  const missing = [];
  for (const r of roots) {
    if (fs.existsSync(r)) {
      for (const f of collectFiles(r)) all.push(f);
    } else {
      missing.push(r);
    }
  }

  const byExt = new Map();
  const rows = [];

  for (const full of all) {
    const rel = full;
    const ext = path.extname(full).toLowerCase() || "(no ext)";
    byExt.set(ext, (byExt.get(ext) || 0) + 1);
    const domain = classifyDomain(full, ext);
    rows.push({
      path: rel,
      ext,
      domain,
      priority: priority(domain),
      ingestPath: ingestPathNote(domain, ext),
      packet: recommendedPacket(domain),
    });
  }

  rows.sort((a, b) => a.path.localeCompare(b.path));

  const when = new Date().toISOString();
  const lines = [];
  lines.push(`# Ingest inventory (generated)`);
  lines.push(``);
  lines.push(`**Generated:** ${when} · **Script:** \`scripts/ingest-inventory.mjs\` · **INGEST-OPS-2**`);
  lines.push(``);
  lines.push(
    `> **Do not edit by hand** — re-run \`npm run ingest:inventory\` from \`RedDirt/\`. See [\`INGEST_STATUS_AND_BACKLOG.md\`](./INGEST_STATUS_AND_BACKLOG.md).`
  );
  lines.push(``);
  lines.push(`## Scan roots`);
  lines.push(``);
  for (const r of roots) {
    const ok = fs.existsSync(r);
    lines.push(`- \`${r}\` — **${ok ? "found" : "MISSING"}**`);
  }
  if (missing.length) {
    lines.push(``);
    lines.push(`**Missing roots:** set \`INGEST_INVENTORY_ROOTS\` to additional paths.`);
  }
  lines.push(``);
  lines.push(`## Summary`);
  lines.push(``);
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|--------|`);
  lines.push(`| Files scanned (capped ${MAX_FILES}) | ${all.length} |`);
  const domainCounts = new Map();
  for (const r of rows) {
    domainCounts.set(r.domain, (domainCounts.get(r.domain) || 0) + 1);
  }
  lines.push(`| Domains (heuristic) | ${[...domainCounts.entries()].map(([k, v]) => `${k}=${v}`).join("; ") || "—"} |`);
  lines.push(``);
  lines.push(`### Extensions`);
  lines.push(``);
  lines.push(`| Extension | Count |`);
  lines.push(`|-----------|--------|`);
  for (const [e, c] of [...byExt.entries()].sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${e} | ${c} |`);
  }
  lines.push(``);
  lines.push(`## File table`);
  lines.push(``);
  if (rows.length === 0) {
    lines.push(`*No files found — check roots or add \`INGEST_INVENTORY_ROOTS\`.*`);
  } else {
    lines.push(
      `| Path | Type | Likely domain | Priority | Ingest path (existing) | Suggested packet |`
    );
    lines.push(`|------|------|---------------|----------|-------------------------|------------------|`);
    for (const r of rows) {
      const pathCell = r.path.replace(/\|/g, "\\|");
      lines.push(
        `| \`${pathCell}\` | ${r.ext} | ${r.domain} | ${r.priority} | ${r.ingestPath} | ${r.packet} |`
      );
    }
  }
  lines.push(``);
  if (all.length >= MAX_FILES) {
    lines.push(`**Warning:** file cap (${MAX_FILES}) reached; extend script if needed.`);
    lines.push(``);
  }

  fs.writeFileSync(outFile, lines.join("\n"), "utf8");
  // eslint-disable-next-line no-console
  console.log(`Wrote ${outFile} (${all.length} files).`);
}

main();
