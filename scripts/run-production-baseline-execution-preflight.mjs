/**
 * Safe preflight: URL presence + shape only (never prints DATABASE_URL / DIRECT_URL).
 * Loads execution packet + approval gates. No Prisma migrate / resolve / push / reset.
 * Runs `npx prisma validate` (schema file only).
 * REDDIRT-PRODUCTION-BASELINE-EXECUTION-PACKET-1.0
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-PRODUCTION-BASELINE-EXECUTION-PACKET-1.0";
const PACKET = path.join(ROOT, "data/production-baseline-execution-packet.json");
const GATES = path.join(ROOT, "data/production-baseline-approval-gates.json");
const OUT = path.join(ROOT, "data/production-baseline-execution-preflight.json");

function urlShapeValid(name, value) {
  if (!value || typeof value !== "string") return { ok: false, detail: `${name} missing or not string` };
  const t = value.trim();
  if (t.length < 24) return { ok: false, detail: `${name} too short` };
  if (!/^postgres(ql)?:\/\//i.test(t)) return { ok: false, detail: `${name} must start with postgres:// or postgresql://` };
  if (!t.includes("@")) return { ok: false, detail: `${name} expected @ host part` };
  if (/YOUR_|PLACEHOLDER|CHANGEME|example\.com\/fake/i.test(t)) return { ok: false, detail: `${name} looks like placeholder` };
  return { ok: true, detail: "ok" };
}

function main() {
  const warnings = [];
  const generatedAt = new Date().toISOString();

  if (!fs.existsSync(PACKET)) {
    const payload = {
      schemaVersion: "1.0",
      slice: SLICE,
      generatedAt,
      mode: "safe_preflight_no_db_mutation",
      databaseUrlPresent: false,
      directUrlPresent: false,
      databaseUrlShapeValid: false,
      directUrlShapeValid: false,
      secretsPrinted: false,
      productionMutationAttempted: false,
      readyForManualExecution: false,
      reason: "Missing data/production-baseline-execution-packet.json — run build script first.",
      warnings: ["Run: node scripts/build-production-baseline-execution-packet.mjs"],
    };
    fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), "utf8");
    console.error("FAIL run-production-baseline-execution-preflight.mjs — no packet");
    process.exit(1);
  }

  const packet = JSON.parse(fs.readFileSync(PACKET, "utf8"));
  const gates = fs.existsSync(GATES) ? JSON.parse(fs.readFileSync(GATES, "utf8")) : null;

  const du = process.env.DATABASE_URL;
  const dir = process.env.DIRECT_URL;
  const databaseUrlPresent = !!(du && String(du).trim());
  const directUrlPresent = !!(dir && String(dir).trim());

  const su = urlShapeValid("DATABASE_URL", du);
  const sd = urlShapeValid("DIRECT_URL", dir);
  if (!su.ok) warnings.push(su.detail);
  if (!sd.ok) warnings.push(sd.detail);

  let gatesPending = false;
  if (gates?.gates?.length) {
    gatesPending = gates.gates.every((x) => x.status === "pending");
    if (!gatesPending) warnings.push("Not all approval gates are status pending.");
  } else {
    warnings.push("Missing or empty approval gates.");
  }

  const liveSend = packet.emailCommandCenterProofPlan?.liveSendApproved === true;
  if (liveSend) warnings.push("liveSendApproved must be false.");

  const mutFalse = packet.productionMutationExecutedByThisPacket === false;
  if (!mutFalse) warnings.push("productionMutationExecutedByThisPacket must be false.");

  const blocked = packet.executionPacketStatus === "blocked_missing_required_artifact";
  if (blocked) warnings.push("Packet is blocked_missing_required_artifact — not ready.");

  const pv = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", ["prisma", "validate"], {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
  });
  const prismaValidateOk = pv.status === 0;
  if (!prismaValidateOk) warnings.push(`prisma validate failed: ${(pv.stderr || pv.stdout || "").slice(0, 200)}`);

  const readyForManualExecution =
    !blocked &&
    databaseUrlPresent &&
    directUrlPresent &&
    su.ok &&
    sd.ok &&
    gatesPending &&
    !liveSend &&
    mutFalse &&
    prismaValidateOk;

  const reason = readyForManualExecution
    ? "Preflight OK for manual execution review (operator still needs Steve approval + gates)."
    : warnings.length
      ? warnings.join(" ")
      : "Preflight incomplete.";

  const payload = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "safe_preflight_no_db_mutation",
    databaseUrlPresent,
    directUrlPresent,
    databaseUrlShapeValid: su.ok,
    directUrlShapeValid: sd.ok,
    secretsPrinted: false,
    productionMutationAttempted: false,
    readyForManualExecution,
    reason,
    warnings,
    prismaValidateOk,
    executionPacketStatus: packet.executionPacketStatus || null,
  };
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), "utf8");

  console.log("=== run-production-baseline-execution-preflight.mjs ===");
  console.log(readyForManualExecution ? "PASS (readyForManualExecution: true)" : "FAIL or blocked");
  console.log(" secretsPrinted: false (DATABASE_URL / DIRECT_URL never logged)");
  console.log(" ", path.relative(ROOT, OUT));
  if (!readyForManualExecution) process.exit(1);
}

main();
