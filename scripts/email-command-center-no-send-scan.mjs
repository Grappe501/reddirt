#!/usr/bin/env node
/**
 * EMAIL-COMMAND-CENTER-LAUNCH-HARDENING-1.0 — heuristic no-send sanity scan.
 * Does NOT print secrets. Does NOT prove security. Warnings only.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const ECC_APP = path.join(ROOT, "src", "app", "admin", "(board)", "workbench", "email-command-center");
const GOVERNANCE = path.join(ROOT, "src", "lib", "email-workflow", "governance.ts");

const EXT = new Set([".ts", ".tsx", ".js", ".mjs", ".jsx"]);

/** process.env.SENDGRID_API_KEY reads allowed only in foundation + webhook + sendgrid lib */
const SENDGRID_ENV_ALLOW_PREFIXES = [
  "src/lib/sendgrid/",
  "src/app/api/sendgrid/",
  "src/lib/email-command-center/sendgrid-foundation",
];

const SENDGRID_ENV_NOTE_PREFIXES = [
  { prefix: "src/lib/integrations/sendgrid/", note: "integrations send path — not ECC; verify not wired from Command Center UI" },
  { prefix: "src/lib/comms-workbench/", note: "comms workbench send stack — separate from ECC no-send doctrine" },
  { prefix: "src/components/admin/email-command-center/", note: "ECC UI may reference env name as string only — verify no raw key access" },
  { prefix: "src/lib/integrations/gmail/", note: "Gmail API integration — may contain messages.send" },
];

function normRel(p) {
  return p.split(path.sep).join("/");
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

function allowedSendgridEnv(rel) {
  const n = normRel(rel);
  return SENDGRID_ENV_ALLOW_PREFIXES.some((p) => n.startsWith(p) || n.includes(p));
}

function warningsForFile(rel, text) {
  const lines = text.split(/\r?\n/);
  const w = [];
  const n = normRel(rel);

  lines.forEach((line, i) => {
    const ln = i + 1;
    if (line.includes("//") && line.trim().startsWith("//")) return;

    if (line.includes("process.env.SENDGRID_API_KEY")) {
      if (!allowedSendgridEnv(rel)) {
        w.push({ ln, msg: `process.env.SENDGRID_API_KEY outside allowlisted foundation/webhook paths (${n})` });
      }
    }

    if (/\busers\.messages\.send\b/.test(line) || /\bmessages\.send\s*\(/.test(line)) {
      w.push({ ln, msg: `Possible Gmail send API usage (${n})` });
    }

  });

  if (n.endsWith("governance.ts")) {
    if (!/EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM\s*=\s*false\b/.test(text)) {
      w.push({ ln: 0, msg: `governance.ts must keep EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM = false` });
    }
    if (/\bEMAIL_WORKFLOW_CAN_SEND_FROM_ITEM\s*=\s*true\b/.test(text)) {
      w.push({ ln: 0, msg: `EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM must not be set to true` });
    }
  }

  return w;
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
        if (depth < 6) walk(full, depth + 1);
      }
    }
  };
  walk(ECC_APP, 0);
  return w;
}

console.log("email-command-center-no-send-scan — heuristic warnings only\nROOT:", normRel(path.relative(process.cwd(), ROOT)) || ".");

const files = walkFiles(SRC);
let total = 0;
let fileWarnings = 0;

for (const abs of files) {
  let text;
  try {
    const st = fs.statSync(abs);
    if (st.size > 800_000) continue;
    text = fs.readFileSync(abs, "utf8");
  } catch {
    continue;
  }
  const rel = normRel(path.relative(ROOT, abs));
  const ws = warningsForFile(rel, text);
  if (ws.length) {
    fileWarnings++;
    console.log(`\n[${rel}]`);
    for (const { ln, msg } of ws) {
      console.log(`  ${ln ? `L${ln}: ` : ""}${msg}`);
    }
  }
  total++;
}

const routeNotes = scanEccAppRoutes();
if (routeNotes.length) {
  console.log("\n[ECC app route structure]");
  routeNotes.forEach((r) => console.log(`  ${r}`));
}

// Expected informational lines for operators reviewing scan output
console.log("\n--- Notes (not warnings) ---");
SENDGRID_ENV_NOTE_PREFIXES.forEach(({ prefix, note }) => {
  console.log(`  ${prefix}: ${note}`);
});

console.log(`\nScanned ${total} source files under src/. Files with warnings: ${fileWarnings}.`);
if (!fs.existsSync(GOVERNANCE)) {
  console.warn("MISSING:", normRel(path.relative(ROOT, GOVERNANCE)));
  process.exitCode = 1;
} else {
  const g = fs.readFileSync(GOVERNANCE, "utf8");
  if (!/EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM\s*=\s*false\b/.test(g)) {
    console.error("FAIL: governance.ts must export EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM = false");
    process.exitCode = 1;
  } else {
    console.log("OK: EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM is false in governance.ts");
  }
}
