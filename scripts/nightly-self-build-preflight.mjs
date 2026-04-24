#!/usr/bin/env node
/**
 * AUTO-BUILD-2: deterministic preflight for nightly self-build.
 * No network, no DB, no sends — only reads protocol docs and writes a handoff file.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const docsDir = path.join(root, "docs");
const outDir = path.join(root, ".nightly-self-build");

const requiredDocs = [
  { label: "AUTO_BUILD_PROTOCOL", file: "AUTO_BUILD_PROTOCOL.md" },
  { label: "BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT", file: "BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md" },
  { label: "DIVISION_MASTER_REGISTRY", file: "DIVISION_MASTER_REGISTRY.md" },
];

const optionalProjectMap = path.join(docsDir, "PROJECT_MASTER_MAP.md");

function parseFirstRecommendedPacket(text) {
  const marker = "## 16. Recommended next packets";
  const i = text.indexOf(marker);
  if (i === -1) {
    return null;
  }
  const after = text.slice(i);
  const m = after.match(/^\d+\.\s+\*\*([^*]+)\*\*/m);
  return m ? m[1].trim() : null;
}

function nowIso() {
  return new Date().toISOString();
}

function run() {
  const found = [];
  const missing = [];

  for (const d of requiredDocs) {
    const p = path.join(docsDir, d.file);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      found.push(d.file);
    } else {
      missing.push(d.file);
    }
  }

  if (missing.length) {
    console.error("nightly-self-build-preflight: missing required docs:", missing.join(", "));
    process.exit(1);
  }

  let suggestedPacket = "See docs/PROJECT_MASTER_MAP.md §16 (file not found or not parsed).";
  if (fs.existsSync(optionalProjectMap)) {
    const pm = fs.readFileSync(optionalProjectMap, "utf8");
    const first = parseFirstRecommendedPacket(pm);
    if (first) {
      suggestedPacket = first;
    }
  }

  fs.mkdirSync(outDir, { recursive: true });

  const day = new Date();
  const y = day.getUTCFullYear();
  const mo = String(day.getUTCMonth() + 1).padStart(2, "0");
  const da = String(day.getUTCDate()).padStart(2, "0");
  const outName = `nightly-self-build-${y}-${mo}-${da}.md`;
  const outPath = path.join(outDir, outName);

  const body = `# Nightly self-build handoff (AUTO-BUILD-2)

- **Generated (UTC):** ${nowIso()}
- **Runner:** preflight only (\`scripts/nightly-self-build-preflight.mjs\`)
- **No autonomous production action was taken** — this file is documentation and verification, not a deploy, send, or data write.

## Protocol docs found (required)

${found.map((f) => `- \`docs/${f}\` ✓`).join("\n")}

## Approved self-build posture (reminder)

Per **AUTO-BUILD-1** / **AUTO-BUILD-2**: controlled overnight **verification**; not autonomous campaign control. Eligible work remains low-risk (docs, tests, read-only UI, read helpers) per \`docs/AUTO_BUILD_PROTOCOL.md\`.

## Hard stops (reminder — do not bypass)

Auth/security changes, schema migrations (unless explicitly assigned to the cycle), outbound actions, conflicting docs, failed typecheck after reasonable fix, or scope beyond one primary division + doc sync — **escalate to a human** (see \`docs/AUTO_BUILD_PROTOCOL.md\` §6).

## Suggested next packet (best-effort from master map)

First numbered item under **§16 Recommended next packets** in \`PROJECT_MASTER_MAP.md\` (if parseable): **${suggestedPacket}**

## What this nightly job does *not* do

- No deploy, no \`prisma migrate\`, no push to \`main\`, no emails/messages, no external campaign APIs, no production data writes, no voter scoring or classification.

---

*AUTO-BUILD-2 — nightly schedule layer; artifact path: \`.nightly-self-build/${outName}\`*
`;

  fs.writeFileSync(outPath, body, "utf8");
  console.log("nightly-self-build-preflight: wrote", outPath);
  process.exit(0);
}

run();
