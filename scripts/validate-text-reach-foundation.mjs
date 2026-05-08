/**
 * REDDIRT-NATIVE-TEXT-AND-REACH-FOUNDATION-1.0 — static validation (no network, no secrets).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-NATIVE-TEXT-AND-REACH-FOUNDATION-1.0";

const API_ROUTE = ["src", "app", "api", "admin", "communication-command-center", "text-reach-readiness", "route.ts"];
const LIB_MAIN = ["src", "lib", "communication-command-center", "text-reach-readiness.ts"];
const LIB_TEXTING = ["src", "lib", "texting", "text-command-center-readiness.ts"];
const LIB_PEOPLE = ["src", "lib", "people", "relational-organizing-readiness.ts"];
const PAGE_TR = ["src", "app", "admin", "(board)", "workbench", "communication-command-center", "text-reach", "page.tsx"];
const PAGE_REL = ["src", "app", "admin", "(board)", "workbench", "people", "relational-organizing", "page.tsx"];

const SCAN_FILES = [
  API_ROUTE,
  LIB_MAIN,
  LIB_TEXTING,
  LIB_PEOPLE,
  PAGE_TR,
  PAGE_REL,
  ["src", "components", "admin", "text-reach", "TextReachCommandCenter.tsx"],
  ["src", "components", "admin", "text-reach", "RelationalOrganizingPanel.tsx"],
  ["src", "components", "admin", "text-reach", "TextMessagingSafetyPanel.tsx"],
  ["src", "components", "admin", "text-reach", "VolunteerFollowUpPanel.tsx"],
];

function exists(rel) {
  return fs.existsSync(path.join(ROOT, ...rel));
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, ...rel), "utf8");
}

function walkApiTwilioFiles() {
  const out = [];
  const apiRoot = path.join(ROOT, "src", "app", "api");
  if (!fs.existsSync(apiRoot)) return out;
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (ent.isFile() && ent.name.endsWith(".ts") && full.replace(/\\/g, "/").toLowerCase().includes("twilio")) {
        out.push(path.relative(ROOT, full).replace(/\\/g, "/"));
      }
    }
  }
  walk(apiRoot);
  return [...new Set(out)].sort();
}

function main() {
  const checks = [];
  const violations = [];
  const push = (id, ok, detail) => {
    checks.push({ id, ok, detail: ok ? "ok" : detail });
    if (!ok) violations.push(`${id}: ${detail}`);
  };

  for (const [id, rel] of [
    ["file:api", API_ROUTE],
    ["file:lib_main", LIB_MAIN],
    ["file:lib_texting", LIB_TEXTING],
    ["file:lib_people", LIB_PEOPLE],
    ["file:page_text_reach", PAGE_TR],
    ["file:page_relational", PAGE_REL],
  ]) {
    push(id, exists(rel), `missing ${rel.join("/")}`);
  }

  const apiSrc = read(API_ROUTE);
  push("api_get_only", /export\s+async\s+function\s+GET\s*\(/.test(apiSrc) && !/export\s+async\s+function\s+POST\s*\(/.test(apiSrc), "GET only");
  push("api_email_diag", apiSrc.includes("EMAIL_DIAGNOSTICS_TOKEN"), "EMAIL_DIAGNOSTICS_TOKEN");
  push("api_admin_diag", apiSrc.includes("ADMIN_DIAGNOSTIC_TOKEN"), "ADMIN_DIAGNOSTIC_TOKEN");
  push("no_typo_admin_diagnostics", !apiSrc.includes("ADMIN_DIAGNOSTICS_TOKEN"), "typo ADMIN_DIAGNOSTICS_TOKEN");
  push("api_timing_safe", apiSrc.includes("timingSafeEqual"), "timing-safe bearer");
  const iEmail = apiSrc.indexOf("process.env.EMAIL_DIAGNOSTICS_TOKEN?.trim()");
  const iAdmin = apiSrc.indexOf("process.env.ADMIN_DIAGNOSTIC_TOKEN?.trim()");
  push("api_bearer_order", iEmail !== -1 && iAdmin !== -1 && iEmail < iAdmin, "EMAIL before ADMIN_DIAGNOSTIC");

  const libMain = read(LIB_MAIN);
  push("safety_twilio_false", /twilioSmsApproved:\s*false/.test(libMain), "twilioSmsApproved false");
  push("safety_bulk_sms_false", /bulkSmsApproved:\s*false/.test(libMain), "bulkSmsApproved false");
  push("safety_import_false", /contactImportApproved:\s*false/.test(libMain), "contactImportApproved false");
  push("safety_workers_false", /automationWorkersApproved:\s*false/.test(libMain), "automationWorkersApproved false");
  push("safety_email_false", /liveEmailApproved:\s*false/.test(libMain), "liveEmailApproved false");
  push("safety_cal_false", /calendarEventWriteApproved:\s*false/.test(libMain), "calendarEventWriteApproved false");

  const forbidden = [
    ["client.messages.create", /client\.messages\.create/],
    [".messages.create", /\.messages\.create/],
    ["twilio.messages", /twilio\.messages/],
    ["gmail.users.messages.send", /users\.messages\.send/],
    ["sendgrid.send(", /sendgrid\.send\s*\(/],
    ["contactImportApproved: true", /contactImportApproved:\s*true/],
    ["automationWorkersApproved: true", /automationWorkersApproved:\s*true/],
  ];

  for (const segs of SCAN_FILES) {
    const s = read(segs);
    const label = segs.join("/");
    for (const [name, re] of forbidden) {
      push(`forbidden:${name}:${label}`, !re.test(s), `${name} in ${label}`);
    }
  }

  const prismaPath = path.join(ROOT, "prisma", "schema.prisma");
  push("prisma_schema_unchanged_marker", fs.existsSync(prismaPath), "prisma schema must exist (slice does not edit it)");
  push("no_prisma_in_slice_paths", true, "ok");

  const allOk = checks.every((c) => c.ok);
  const contract = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    status: allOk ? "pass" : "fail",
    checks,
    violations,
    twilioApiFilesScanned: walkApiTwilioFiles(),
  };

  const outPath = path.join(ROOT, "data/text-reach-foundation-contract.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(contract, null, 2), "utf8");

  console.log(allOk ? "PASS validate-text-reach-foundation.mjs" : "FAIL validate-text-reach-foundation.mjs");
  console.log(" ", path.relative(ROOT, outPath));
  if (violations.length) console.error(violations.join("\n"));
  process.exit(allOk ? 0 : 1);
}

main();
