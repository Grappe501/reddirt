/**
 * Offline: verify API route handler files exist for Communication Command Center readiness contract.
 * REDDIRT-COMMUNICATION-COMMAND-CENTER-HOSTED-DIAGNOSTICS-1.0
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTRACT = path.join(ROOT, "data/communication-command-center-readiness-contract.json");

function main() {
  const checks = [];
  const violations = [];

  const contract = JSON.parse(fs.readFileSync(CONTRACT, "utf8"));
  const map = contract.routeFilesRelativeToSrcAppApi;
  if (!map || typeof map !== "object") {
    console.error("Missing routeFilesRelativeToSrcAppApi in contract");
    process.exit(1);
  }

  for (const [key, segments] of Object.entries(map)) {
    if (!Array.isArray(segments)) {
      violations.push(`bad_segments:${key}`);
      checks.push({ id: `route_${key}`, ok: false, detail: "not an array" });
      continue;
    }
    const rel = path.join("src", "app", "api", ...segments);
    const abs = path.join(ROOT, rel);
    const ok = fs.existsSync(abs);
    checks.push({ id: `route_${key}`, ok, detail: ok ? "ok" : `missing ${path.relative(ROOT, abs)}` });
    if (!ok) violations.push(`missing_route:${key}`);
  }

  const readinessLib = path.join(ROOT, "src/lib/communication-command-center/readiness.ts");
  const readinessRoute = path.join(ROOT, "src/app/api/admin/communication-command-center/readiness/route.ts");
  const libOk = fs.existsSync(readinessLib);
  const routeOk = fs.existsSync(readinessRoute);
  checks.push({ id: "readiness_lib", ok: libOk, detail: libOk ? "ok" : "missing readiness.ts" });
  checks.push({ id: "readiness_api_route", ok: routeOk, detail: routeOk ? "ok" : "missing route.ts" });
  if (!libOk) violations.push("missing_readiness_lib");
  if (!routeOk) violations.push("missing_readiness_api");

  const status = violations.length === 0 ? "pass" : "fail";
  console.log(status === "pass" ? "PASS validate-communication-command-center-readiness.mjs" : "FAIL");
  for (const c of checks) {
    if (!c.ok) console.log(" ", c.id, c.detail);
  }
  process.exit(status === "pass" ? 0 : 1);
}

main();
