/**
 * Safe preflight: loads additive execution packet + gates. Never prints DATABASE_URL / DIRECT_URL values.
 * Runs npx prisma validate (schema only). Does not run prisma db execute / migrate / push / reset.
 * REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0";
const PACKET = path.join(ROOT, "data/additive-schema-production-execution-packet.json");
const GATES = path.join(ROOT, "data/additive-schema-production-approval-gates.json");
const OUT = path.join(ROOT, "data/additive-schema-production-preflight.json");

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
  const generatedAt = new Date().toISOString();
  const warnings = [];

  if (!fs.existsSync(PACKET)) {
    const payload = {
      schemaVersion: "1.0",
      slice: SLICE,
      generatedAt,
      mode: "safe_preflight_no_db_mutation",
      secretsPrinted: false,
      productionMutationAttempted: false,
      readyForPreflight: false,
      reason: "Missing data/additive-schema-production-execution-packet.json — run build script first.",
    };
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), "utf8");
    console.error("FAIL run-additive-schema-production-preflight.mjs — no packet");
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
    gatesPending = gates.gates.every((x) => x.status === "pending" || x.status === "blocked");
    if (!gatesPending) warnings.push("approval gates: unexpected status mix.");
  } else {
    warnings.push("missing or empty data/additive-schema-production-approval-gates.json");
  }

  const mutFalse = packet.productionMutationExecutedByThisPacket === false;
  if (!mutFalse) warnings.push("productionMutationExecutedByThisPacket must be false.");

  const blocked = packet.executionPacketStatus && String(packet.executionPacketStatus).startsWith("blocked");
  if (blocked) warnings.push("Packet status is blocked — clone proof or validation must be green before operator execution.");

  const pv = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", ["prisma", "validate"], {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
  });
  const prismaValidateOk = pv.status === 0;
  if (!prismaValidateOk) warnings.push(`prisma validate: ${(pv.stderr || pv.stdout || "").slice(0, 200)}`);

  const readyForPreflight =
    mutFalse &&
    prismaValidateOk &&
    databaseUrlPresent &&
    directUrlPresent &&
    su.ok &&
    sd.ok &&
    !!gates?.gates?.length;

  const payload = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "safe_preflight_no_db_mutation",
    secretsPrinted: false,
    productionMutationAttempted: false,
    databaseUrlPresent,
    directUrlPresent,
    databaseUrlShapeValid: su.ok,
    directUrlShapeValid: sd.ok,
    prismaValidateOk,
    gatesLoaded: !!gates,
    gatesPendingOrBlocked: gatesPending,
    packetBlocked: blocked,
    packetReadyForExecutionPacket: packet.eligibility?.readyForProductionExecutionPacket === true,
    readyForPreflight,
    warnings,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), "utf8");

  console.log("=== run-additive-schema-production-preflight.mjs ===");
  console.log("Report:", path.relative(ROOT, OUT));
  console.log(readyForPreflight ? "PASS preflight (lane checks)" : "WARN preflight — see packet status / warnings");
  process.exit(0);
}

main();
