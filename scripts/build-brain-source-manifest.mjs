/**
 * INGEST-OPS-4 — normalized brain/source manifest (read-only scan, no DB, no network).
 *
 * Writes: docs/BRAIN_SOURCE_MANIFEST.md
 *
 * Usage (from RedDirt/):
 *   npm run ingest:brain-manifest
 *   INGEST_INVENTORY_ROOTS="C:\\a;C:\\b" npm run ingest:brain-manifest
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const outFile = path.join(repoRoot, "docs", "BRAIN_SOURCE_MANIFEST.md");

const MAX_FILES = 5000;
const SKIP_NAMES = new Set(["node_modules", ".git", ".next", "dist", "out", ".turbo"]);

/** @param {string} p */
function norm(p) {
  return p.replace(/\\/g, "/").toLowerCase();
}

function defaultRoots() {
  return [path.join(repoRoot, "..", "campaign information for ingestion")];
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

/**
 * @param {string} fullPath
 * @param {string} ext
 */
function classifyDomain(fullPath, ext) {
  const p = norm(fullPath);
  if (
    p.includes("opposition") ||
    p.includes("competitor") ||
    p.includes("adversary") ||
    p.includes("oppo-") ||
    p.includes("/intel/")
  ) {
    return "opposition-intelligence";
  }
  if (p.includes("electionresult") || (p.includes("election") && p.includes("result"))) return "election";
  if (p.includes("/election/")) return "election";
  if (p.match(/202[0-9]_(general|primary|preferential|special)/) && ext === ".json") return "election";
  if (
    p.includes("volunteer") ||
    p.includes("signup") ||
    p.includes("field") ||
    p.includes("power_of_5") ||
    p.includes("arvoter") ||
    p.includes("yard_sign") ||
    p.includes("yard sign")
  )
    return "volunteer";
  if (
    p.includes("financial") ||
    p.includes("budget") ||
    p.includes("fec") ||
    p.includes("contribution") ||
    p.includes("donor") ||
    p.includes("transaction") ||
    p.includes("filing") ||
    p.includes("committee to elect")
  )
    return "financial";
  if (p.includes("county") && !p.includes("country")) return "county";
  if (p.includes("comms") || p.includes("email") || p.includes("messaging")) return "communications";
  if (p.includes("research") || p.includes("briefing") || p.includes("strategy") || p.includes("playbook"))
    return "research";
  if (p.includes("compliance") || p.includes("ethics") || p.includes("handbook")) return "compliance";
  if (ext === ".json" && p.includes("election")) return "election";
  return "unknown";
}

/**
 * @param {string} fullPath
 * @param {string} domain
 */
function subdomainFor(fullPath, domain) {
  const p = norm(fullPath);
  const parts = p.split("/").filter(Boolean);
  const leafFolder = parts.length >= 2 ? parts[parts.length - 2] : "";
  if (domain === "election" && p.includes("electionresult")) return "election-results";
  if (domain === "financial") return "campaign-finance-export";
  if (domain === "volunteer") return "volunteer-field";
  if (domain === "county") return "county-geo";
  if (domain === "communications") return "comms-content";
  if (domain === "research") return "research-briefing";
  if (domain === "compliance") return "compliance-reference";
  if (domain === "opposition-intelligence") return "opposition-public-record";
  if (domain === "unknown") return leafFolder ? `folder:${leafFolder}` : "root-loose";
  return domain;
}

/**
 * @param {string} domain
 * @param {string} ext
 */
function likelyUse(domain, ext) {
  if (domain === "election" && ext === ".json") return "Election tabulation ingest / coverage signals";
  if (domain === "financial") return "Disclosure / donor-transaction mapping (governed)";
  if (domain === "volunteer") return "Field lists, onboarding, relational ops";
  if (domain === "county") return "County narrative / geography assets";
  if (domain === "communications") return "Messaging, drafts, press";
  if (domain === "research") return "Strategy / briefing / playbook text";
  if (domain === "compliance") return "Ethics / handbook / policy reference";
  if (domain === "opposition-intelligence") return "Public-record competitor intel (provenance required)";
  return "Triage";
}

/**
 * @param {string} domain
 * @param {string} ext
 * @param {string} pnorm
 */
function ingestPriority(domain, ext, pnorm) {
  if (domain === "election" && ext === ".json") return "P0";
  if (domain === "compliance") return "P1";
  if (domain === "financial") return "P2";
  if (domain === "volunteer") return "P2";
  if (domain === "opposition-intelligence") return "P2";
  if (domain === "county" || domain === "research") return "P3";
  if (domain === "communications") return "P3";
  return "P3–P4";
}

/**
 * @param {string} domain
 * @param {string} ext
 * @param {string} pnorm
 */
function ingestStatus(domain, ext, pnorm) {
  if (domain === "election" && ext === ".json" && pnorm.includes("electionresults")) return "election_cli_ready";
  if (domain === "financial" && (ext === ".csv" || ext === ".xlsx")) return "blocked_sensitive";
  if (ext === ".crdownload") return "quarantine_incomplete";
  return "inventory_only";
}

/**
 * @param {string} domain
 * @param {string} ingestStatusVal
 */
function provenanceRequired(domain, ingestStatusVal) {
  if (ingestStatusVal === "quarantine_incomplete") return "n/a";
  if (domain === "financial" || domain === "opposition-intelligence" || domain === "communications")
    return "yes";
  if (domain === "compliance" || domain === "research") return "if_published";
  return "no";
}

/**
 * @param {string} domain
 * @param {string} ext
 */
function recommendedParser(domain, ext) {
  if (domain === "election" && ext === ".json") return "`npm run ingest:election-results` (after `--dry-run`)";
  if (domain === "financial") return "None approved — FINANCE-1 / governed finance packet";
  if (domain === "opposition-intelligence") return "INTEL-2 competitor manifest + manual provenance";
  if (domain === "county") return "`ingest:county-wikipedia` / county content (when applicable)";
  if (domain === "volunteer" && (ext === ".xlsx" || ext === ".csv")) return "VOL-DATA-1 / future volunteer parser";
  if (ext === ".csv" || ext === ".xlsx") return "INGEST-OPS-5 (first governed non-election parser) or manual";
  if (ext === ".docx" || ext === ".pdf") return "`ingest:docs` / `ingest-campaign-folder` (op-driven)";
  if (ext === ".crdownload") return "None — complete or delete download";
  return "`ingest:inventory` triage / INGEST-OPS-5";
}

/**
 * @param {string} domain
 * @param {string} ingestStatusVal
 */
function nextPacket(domain, ingestStatusVal) {
  if (ingestStatusVal === "election_cli_ready") return "INGEST-OPS-3 (verify) / per-file election CLI";
  if (ingestStatusVal === "blocked_sensitive") return "FINANCE-1";
  if (domain === "opposition-intelligence") return "INTEL-2";
  if (domain === "volunteer") return "VOL-DATA-1";
  if (domain === "unknown") return "INGEST-OPS-5 + triage";
  return "INGEST-OPS-5";
}

/**
 * @param {string} cell
 */
function mdCell(cell) {
  return String(cell).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
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

  const rows = [];
  let idx = 0;
  for (const full of all.sort((a, b) => a.localeCompare(b))) {
    idx += 1;
    const fileName = path.basename(full);
    const ext = path.extname(full).toLowerCase() || "(no ext)";
    const domain = classifyDomain(full, ext);
    const pnorm = norm(full);
    const subdomain = subdomainFor(full, domain);
    const likely = likelyUse(domain, ext);
    const ingestPriorityVal = ingestPriority(domain, ext, pnorm);
    const ingestStatusVal = ingestStatus(domain, ext, pnorm);
    const prov = provenanceRequired(domain, ingestStatusVal);
    const parser = recommendedParser(domain, ext);
    const packet = nextPacket(domain, ingestStatusVal);
    const manifestId = `BRAIN-${String(idx).padStart(5, "0")}`;
    const notes =
      ingestStatusVal === "quarantine_incomplete"
        ? "Incomplete browser download — not a final asset."
        : domain === "financial"
          ? "Do not bulk RAG finance exports without policy."
          : "";

    rows.push({
      manifestId,
      sourcePath: full,
      fileName,
      fileType: ext,
      domain,
      subdomain,
      likelyUse: likely,
      ingestPriority: ingestPriorityVal,
      ingestStatus: ingestStatusVal,
      provenanceRequired: prov,
      recommendedParser: parser,
      nextPacket: packet,
      notes,
    });
  }

  const when = new Date().toISOString();
  const lines = [];

  lines.push(`# Brain / source manifest (INGEST-OPS-4)`);
  lines.push(``);
  lines.push(
    `**Purpose:** Normalized **file-level** inventory of the campaign brain / source tree (read-only scan). **No** DB access, **no** network, **no** moves. Cross-link per-folder writeups under [\`docs/source-ingest/\`](./source-ingest/).`
  );
  lines.push(``);
  lines.push(
    `**Hard gate:** \`npm run ingest:election-audit:json\` → **\`COMPLETE\`** before treating brain ingest expansion as unblocked for an environment ([\`ELECTION_INGEST_AUDIT.md\`](./ELECTION_INGEST_AUDIT.md)).`
  );
  lines.push(``);
  lines.push(`**Generated:** ${when} · **Script:** \`scripts/build-brain-source-manifest.mjs\` · **Regenerate:** \`npm run ingest:brain-manifest\` from \`RedDirt/\`.`);
  lines.push(``);
  lines.push(
    `**Related:** [\`INGEST_STATUS_AND_BACKLOG.md\`](./INGEST_STATUS_AND_BACKLOG.md) **§2.6–2.8** · heuristic scan [\`INGEST_INVENTORY_GENERATED.md\`](./INGEST_INVENTORY_GENERATED.md) (\`npm run ingest:inventory\`).`
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
    lines.push(`**Missing roots:** set \`INGEST_INVENTORY_ROOTS\` for additional paths.`);
  }
  lines.push(``);
  lines.push(`## Summary`);
  lines.push(``);
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|------:|`);
  lines.push(`| Files scanned (cap ${MAX_FILES}) | ${all.length} |`);
  const byDomain = new Map();
  for (const r of rows) {
    byDomain.set(r.domain, (byDomain.get(r.domain) || 0) + 1);
  }
  lines.push(
    `| Domains (heuristic) | ${[...byDomain.entries()].map(([k, v]) => `${k}=${v}`).join("; ")} |`
  );
  lines.push(``);
  lines.push(`## Next safe ingest paths (blueprint)`);
  lines.push(``);
  lines.push(`| Packet | Role |`);
  lines.push(`|--------|------|`);
  lines.push(`| **INGEST-OPS-5** | First governed **non-election** parser (single file family; dry-run / review). |`);
  lines.push(`| **INTEL-2** | Competitor / **opposition-intelligence** source manifest (public record only). |`);
  lines.push(`| **FINANCE-1** | Campaign **finance** source mapping + policy (no raw bulk RAG). |`);
  lines.push(`| **VOL-DATA-1** | **Volunteer** list / field spreadsheet import mapping (PII review). |`);
  lines.push(``);
  lines.push(`## Normalized manifest table`);
  lines.push(``);
  lines.push(
    `> Domains: election · financial · volunteer · county · communications · research · compliance · opposition-intelligence · unknown. Fields are **heuristic** from path/extension — not legal classification.`
  );
  lines.push(``);

  if (rows.length === 0) {
    lines.push(`*No files found — check roots or set \`INGEST_INVENTORY_ROOTS\`.*`);
  } else {
    lines.push(
      `| manifestId | sourcePath | fileName | fileType | domain | subdomain | likelyUse | ingestPriority | ingestStatus | provenanceRequired | recommendedParser | nextPacket | notes |`
    );
    lines.push(
      `|------------|------------|----------|----------|--------|-----------|-----------|----------------|--------------|-------------------|-------------------|------------|-------|`
    );
    for (const r of rows) {
      lines.push(
        `| ${mdCell(r.manifestId)} | \`${mdCell(r.sourcePath)}\` | ${mdCell(r.fileName)} | ${mdCell(r.fileType)} | ${mdCell(r.domain)} | ${mdCell(r.subdomain)} | ${mdCell(r.likelyUse)} | ${mdCell(r.ingestPriority)} | ${mdCell(r.ingestStatus)} | ${mdCell(r.provenanceRequired)} | ${mdCell(r.recommendedParser)} | ${mdCell(r.nextPacket)} | ${mdCell(r.notes)} |`
      );
    }
  }

  lines.push(``);
  lines.push(`## Per-folder manifest index (human-maintained)`);
  lines.push(``);
  lines.push(
    `| Manifest | Folder (under ingest root) | Last updated | Notes |`
  );
  lines.push(`|----------|----------------------------|--------------|-------|`);
  lines.push(
    `| [\`source-ingest/zine-content-20260421t210959z-manifest.md\`](./source-ingest/zine-content-20260421t210959z-manifest.md) | \`Zine content-20260421T210959Z-3-001\` | 2026-04-24 | **1× DOCX** zine; **briefing** / **\`--comms\`** |`
  );
  lines.push(
    `| [\`source-ingest/website-photos-20260421t211003z-manifest.md\`](./source-ingest/website-photos-20260421t211003z-manifest.md) | \`Website photos-20260421T211003Z-3-001\` | 2026-04-24 | **32** media files |`
  );
  lines.push(
    `| [\`source-ingest/trainings-20260421t211007z-manifest.md\`](./source-ingest/trainings-20260421t211007z-manifest.md) | \`Trainings-20260421T211007Z-3-001\` | 2026-04-24 | **72** files; **\`--community-training\`** |`
  );
  lines.push(
    `| [\`source-ingest/saved-from-chrome-20260421t211011z-manifest.md\`](./source-ingest/saved-from-chrome-20260421t211011z-manifest.md) | \`Saved from Chrome-20260421T211011Z-3-001\` | 2026-04-24 | **1× PDF** AR election laws |`
  );
  lines.push(
    `| [\`source-ingest/messaging-20260421t211017z-manifest.md\`](./source-ingest/messaging-20260421t211017z-manifest.md) | \`Messaging -20260421T211017Z-3-001\` | 2026-04-24 | **1× DOCX**; **\`--comms\`** |`
  );
  lines.push(
    `| [\`source-ingest/march-filing-details-20260421t211053z-manifest.md\`](./source-ingest/march-filing-details-20260421t211053z-manifest.md) | \`March Filing Details-20260421T211053Z-3-001\` | 2026-04-24 | **blocked_sensitive** |`
  );
  lines.push(
    `| [\`source-ingest/february-filing-details-20260421t211056z-manifest.md\`](./source-ingest/february-filing-details-20260421t211056z-manifest.md) | \`February Filing Details-20260421T211056Z-3-001\` | 2026-04-24 | committee **CSV+XLSX** |`
  );
  lines.push(
    `| [\`source-ingest/election-results-manifest.md\`](./source-ingest/election-results-manifest.md) | \`electionResults\` | 2026-04-24 | **13× JSON** ingested + handbook PDF |`
  );
  lines.push(
    `| [\`source-ingest/editorials-20260421t211104z-manifest.md\`](./source-ingest/editorials-20260421t211104z-manifest.md) | \`Editorials-20260421T211104Z-3-001\` | 2026-04-24 | **2× DOCX** |`
  );
  lines.push(
    `| [\`source-ingest/community-support-training-20260421t211114z-manifest.md\`](./source-ingest/community-support-training-20260421t211114z-manifest.md) | \`Community Support Training-20260421T211114Z-3-001\` | 2026-04-24 | **2× DOCX** training |`
  );
  lines.push(
    `| [\`source-ingest/comms-20260421t211118z-manifest.md\`](./source-ingest/comms-20260421t211118z-manifest.md) | \`Comms-20260421T211118Z-3-001\` | 2026-04-24 | **11** files |`
  );
  lines.push(
    `| [\`source-ingest/briefing-docs-20260421t211122z-manifest.md\`](./source-ingest/briefing-docs-20260421t211122z-manifest.md) | \`Briefing Docs-20260421T211122Z-3-001\` | 2026-04-24 | **3× DOCX** |`
  );
  lines.push(
    `| [\`source-ingest/26pmonro-proof4-manifest.md\`](./source-ingest/26pmonro-proof4-manifest.md) | \`26PMONRO_PROOF4\` | 2026-04-24 | **3× PDF** proofs |`
  );
  lines.push(
    `| [\`source-ingest/pending-active-folder-manifest.md\`](./source-ingest/pending-active-folder-manifest.md) | *(pick list)* | 2026-04-24 | folder queue |`
  );
  lines.push(
    `| [\`source-ingest/root-loose-files-manifest.md\`](./source-ingest/root-loose-files-manifest.md) | *(ingest root loose only)* | 2026-04-23 | **72** files |`
  );
  lines.push(``);
  lines.push(
    `**Naming:** \`docs/source-ingest/<safe-folder-name>-manifest.md\`. **Safety:** No production writes from the scanner; PII/finance/compliance paths require human provenance and review before any live ingest.`
  );
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
