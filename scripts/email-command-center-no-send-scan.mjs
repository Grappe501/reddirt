#!/usr/bin/env node
/**
 * EMAIL-COMMAND-CENTER-LAUNCH-HARDENING-1.0 — heuristic no-send sanity scan.
 * NOT a security proof. Does NOT print secrets (line excerpts truncated + URI-like spans redacted).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const ECC_APP = path.join(ROOT, "src", "app", "admin", "(board)", "workbench", "email-command-center");
const GOVERNANCE = path.join(ROOT, "src", "lib", "email-workflow", "governance.ts");
const SEND_EXEC_VIEW = path.join(
  ROOT,
  "src",
  "components",
  "admin",
  "email-command-center",
  "SendExecutionGovernanceView.tsx",
);
const SEND_EXEC_PAGE = path.join(ROOT, "src", "app", "admin", "(board)", "workbench", "email-command-center", "send-execution", "page.tsx");

const EXT = new Set([".ts", ".tsx", ".js", ".mjs", ".jsx"]);

const SENDGRID_ENV_ALLOW_PREFIXES = [
  "src/lib/sendgrid/",
  "src/app/api/sendgrid/",
  "src/lib/email-command-center/sendgrid-foundation",
];

/** Known non-ECC execution / integration seams — warnings OK here */
const INTEGRATION_PREFIXES = [
  "src/lib/integrations/gmail/",
  "src/lib/integrations/sendgrid/",
  "src/lib/comms-workbench/",
];

function normRel(p) {
  return p.split(path.sep).join("/");
}

function isEccPath(rel) {
  const n = normRel(rel);
  return (
    n.startsWith("src/components/admin/email-command-center/") ||
    n.startsWith("src/app/admin/(board)/workbench/email-command-center/") ||
    n.startsWith("src/lib/email-command-center/")
  );
}

function isIntegrationPath(rel) {
  const n = normRel(rel);
  return INTEGRATION_PREFIXES.some((p) => n.startsWith(p));
}

function allowedSendgridEnv(rel) {
  const n = normRel(rel);
  return SENDGRID_ENV_ALLOW_PREFIXES.some((p) => n.startsWith(p));
}

function excerpt(s) {
  const t = s.trim().slice(0, 120);
  return t.replace(/postgres(ql)?:\/\/[^\s'"]+/gi, "postgres://…").replace(/SG\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "SG.…");
}

function walkFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (name.name === "node_modules" || name.name === ".next" || name.name === "dist" || name.name.startsWith("."))
      continue;
    const full = path.join(dir, name.name);
    if (name.isDirectory()) walkFiles(full, out);
    else if (EXT.has(path.extname(name.name))) out.push(full);
  }
  return out;
}

/** @type {{ rel: string; ln: number; kind: string; line: string; tier: "ecc" | "integration" }[]} */
const hits = [];

function record(rel, ln, kind, line, tier) {
  hits.push({ rel: normRel(rel), ln, kind, line: excerpt(line), tier });
}

function scanLinePatterns(rel, line, ln) {
  const n = normRel(rel);
  const ecc = isEccPath(rel);
  const integ = isIntegrationPath(rel);

  if (/\bEMAIL_WORKFLOW_CAN_SEND_FROM_ITEM\s*=\s*true\b/.test(line)) {
    record(rel, ln, "EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM = true", line, ecc ? "ecc" : "integration");
  }
  if (/gmail\.users\.messages\.send/.test(line) || /\busers\.messages\.send\b/.test(line)) {
    record(rel, ln, "Gmail users.messages.send", line, ecc ? "ecc" : "integration");
  } else if (/\bmessages\.send\s*\(/.test(line)) {
    record(rel, ln, "messages.send(", line, ecc ? "ecc" : "integration");
  }
  if (/\bsgMail\.send\s*\(/.test(line)) {
    record(rel, ln, "sgMail.send(", line, ecc ? "ecc" : "integration");
  }
  if (/\bsendgrid\.send\s*\(/.test(line)) {
    record(rel, ln, "sendgrid.send(", line, ecc ? "ecc" : "integration");
  }
  if (/\bmailService\.send\s*\(/.test(line)) {
    record(rel, ln, "mailService.send(", line, ecc ? "ecc" : "integration");
  }

  if (line.includes("process.env.SENDGRID_API_KEY")) {
    if (!allowedSendgridEnv(rel)) {
      record(rel, ln, "process.env.SENDGRID_API_KEY (outside allowlist)", line, ecc ? "ecc" : "integration");
    }
  }

  // send-execution route must not call provider send APIs
  if (n === normRel(path.relative(ROOT, SEND_EXEC_VIEW)) || n === normRel(path.relative(ROOT, SEND_EXEC_PAGE))) {
    if (/\bsgMail\.|\bsendgrid\.send\s*\(|\bgmail\.users\.messages\.send/.test(line)) {
      record(rel, ln, "Provider send API under send-execution surface", line, "ecc");
    }
  }
}

function scanEccAppRoutes() {
  const w = [];
  if (!fs.existsSync(ECC_APP)) return w;
  const walk = (dir, depth) => {
    for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, name.name);
      if (name.isDirectory()) {
        if (name.name === "send" && depth > 0) {
          w.push(`Unexpected directory "send" under ECC app: ${normRel(path.relative(ROOT, full))}`);
        }
        if (depth < 8) walk(full, depth + 1);
      }
    }
  };
  walk(ECC_APP, 0);
  return w;
}

console.log("email-command-center-no-send-scan — sanity check only (not a proof)\nROOT:", normRel(path.relative(process.cwd(), ROOT)) || ".");

const files = walkFiles(SRC);
let total = 0;

for (const abs of files) {
  let text;
  try {
    const st = fs.statSync(abs);
    if (st.size > 800_000) continue;
    text = fs.readFileSync(abs, "utf8");
  } catch {
    continue;
  }
  const rel = path.relative(ROOT, abs);
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    scanLinePatterns(rel, line, i + 1);
  });

  const n = normRel(rel);
  if (n.endsWith("governance.ts")) {
    if (!/EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM\s*=\s*false\b/.test(text)) {
      hits.push({ rel: n, ln: 0, kind: "governance must export EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM = false", line: "", tier: "ecc" });
    }
  }
  total++;
}

const eccHits = hits.filter((h) => h.tier === "ecc");
const integHits = hits.filter((h) => h.tier === "integration");

if (eccHits.length) {
  console.log("\n--- ECC / email-command-center lane (review required) ---");
  for (const h of eccHits) {
    console.log(`${h.rel}:${h.ln || "?"}  [${h.kind}]`);
    if (h.line) console.log(`  > ${h.line}`);
  }
}

if (integHits.length) {
  console.log("\n--- Integration / comms (expected baseline warnings) ---");
  for (const h of integHits) {
    console.log(`${h.rel}:${h.ln}  [${h.kind}]`);
    if (h.line) console.log(`  > ${h.line}`);
  }
}

const routeNotes = scanEccAppRoutes();
if (routeNotes.length) {
  console.log("\n[ECC app route structure]");
  routeNotes.forEach((r) => console.log(`  ${r}`));
}

console.log(`\nScanned ${total} files under src/.`);

let result = "PASS";
let exitCode = 0;

if (!fs.existsSync(GOVERNANCE)) {
  console.error("FAIL: missing governance.ts");
  result = "FAIL";
  exitCode = 1;
} else {
  const g = fs.readFileSync(GOVERNANCE, "utf8");
  if (!/EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM\s*=\s*false\b/.test(g)) {
    console.error("FAIL: EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM must be false in governance.ts");
    result = "FAIL";
    exitCode = 1;
  }
}

if (eccHits.length) {
  result = "FAIL";
  exitCode = 1;
} else if (integHits.length) {
  result = "WARN";
}

console.log(`\nRESULT: ${result}`);
console.log(
  integHits.length && !eccHits.length
    ? "(WARN = integration/comms baseline only — ECC paths clean.)"
    : eccHits.length
      ? "(FAIL = fix ECC lane before treating launch as hardened.)"
      : "(PASS = ECC paths clean; governance constant OK.)",
);

process.exitCode = exitCode;
