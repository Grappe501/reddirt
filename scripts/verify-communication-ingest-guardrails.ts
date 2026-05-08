/**
 * Lightweight guardrail scan for communication intelligence ingest slice.
 * Run: npm run communication-ingest:guardrails
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (p.endsWith(".ts") || p.endsWith(".tsx")) out.push(p);
  }
  return out;
}

function read(p: string) {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

let failed = false;
function warn(msg: string) {
  console.warn(`[WARN] ${msg}`);
}
function err(msg: string) {
  console.error(`[FAIL] ${msg}`);
  failed = true;
}

const files = walk(SRC);
const commFiles = files.filter((f) => f.includes("communication") || f.includes("ingest-service") || f.includes("gmail-ingest"));

const body = commFiles.map((f) => read(f)).join("\n");

if (/EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM\s*[=:]\s*true/.test(body)) {
  err("EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM must not be set true in communication ingest paths.");
}

if (/twilio|Twilio/i.test(body) && /send/i.test(body)) {
  warn("Twilio/send mention in communication ingest paths — verify manually.");
}

if (/events\.(insert|patch|update)\s*\(/.test(body)) {
  err("Google Calendar write API calls should not appear in communication ingest paths.");
}

if (!/approvedForAudienceUse:\s*false/.test(read(join(ROOT, "src/lib/communications/ingest-service.ts")))) {
  warn("ingest-service.ts should default approvedForAudienceUse false on signals.");
}

if (failed) process.exit(1);
console.log("communication-ingest guardrails: OK (heuristic scan)");
