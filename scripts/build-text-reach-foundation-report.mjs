/**
 * REDDIRT-NATIVE-TEXT-AND-REACH-FOUNDATION-1.0 — capability maps + report (no network).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-NATIVE-TEXT-AND-REACH-FOUNDATION-1.0";
const CONTRACT = path.join(ROOT, "data/text-reach-foundation-contract.json");
const OUT_MAP_TEXT = path.join(ROOT, "data/native-text-command-center-capability-map.json");
const OUT_MAP_REL = path.join(ROOT, "data/relational-organizing-capability-map.json");
const OUT_REPORT = path.join(ROOT, "data/text-reach-foundation-report.json");
const OUT_QUEUE = path.join(ROOT, "data/text-reach-next-build-queue.json");
const OUT_MD = path.join(ROOT, "develop_notes/REDDIRT_NATIVE_TEXT_AND_REACH_FOUNDATION_1_0_REPORT.md");

function readSchema() {
  const p = path.join(ROOT, "prisma", "schema.prisma");
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf8");
}

function modelExists(schema, name) {
  try {
    return new RegExp(`^model\\s+${name}\\s+\\{`, "m").test(schema);
  } catch {
    return false;
  }
}

function grepFiles(dir, pattern, exts = [".ts", ".tsx"]) {
  const hits = [];
  if (!fs.existsSync(dir)) return hits;
  function walk(d) {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === "node_modules" || ent.name === ".next") continue;
        walk(full);
      } else if (exts.some((e) => ent.name.endsWith(e))) {
        let src;
        try {
          src = fs.readFileSync(full, "utf8");
        } catch {
          continue;
        }
        if (pattern.test(src)) hits.push(path.relative(ROOT, full).replace(/\\/g, "/"));
      }
    }
  }
  walk(dir);
  return [...new Set(hits)].slice(0, 40);
}

function listTwilioWebhookRoutes() {
  const api = path.join(ROOT, "src", "app", "api");
  const out = [];
  if (!fs.existsSync(api)) return out;
  function walk(d) {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (ent.name === "route.ts" && full.replace(/\\/g, "/").toLowerCase().includes("twilio")) {
        out.push(path.relative(ROOT, full).replace(/\\/g, "/"));
      }
    }
  }
  walk(api);
  return out.sort();
}

function buildNativeTextMap(schema) {
  const webhookRoutesFound = listTwilioWebhookRoutes();
  const sendHits = grepFiles(path.join(ROOT, "src"), /\.messages\.create|client\.messages\.create/);
  const sendRoutesFound = sendHits.filter((p) => p.includes("/api/") || p.includes("send-sms"));
  const prefs = path.join(ROOT, "src", "lib", "comms", "preferences.ts");
  let stopHelpHandlingDetected = false;
  try {
    if (fs.existsSync(prefs)) {
      const s = fs.readFileSync(prefs, "utf8");
      stopHelpHandlingDetected = s.includes("handleTwilioOptOutKeywords") || (s.includes("STOP") && s.includes("twilioOptOutState"));
    }
  } catch {
    /* ignore */
  }

  const commTables = [
    "CommunicationMessage",
    "CommunicationThread",
    "CommunicationSend",
    "CommunicationRecipient",
    "CommunicationRecipientEvent",
    "ContactPreference",
  ];
  const communicationTables = Object.fromEntries(commTables.map((t) => [t, modelExists(schema, t)]));

  const recommendedNextSteps = [];
  if (!communicationTables.CommunicationMessage) recommendedNextSteps.push("Ensure CommunicationMessage model exists for text threads.");
  if (webhookRoutesFound.length === 0) recommendedNextSteps.push("Add Twilio webhook route under src/app/api/webhooks/twilio.");
  if (!stopHelpHandlingDetected) recommendedNextSteps.push("Implement STOP/HELP handling before any outbound SMS approval.");
  if (sendHits.length > 0) recommendedNextSteps.push("Review send paths — outbound SMS remains gated until headquarters approves.");

  return {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    twilio: {
      webhookRoutesFound,
      sendRoutesFound: sendHits.slice(0, 25),
      sendFunctionsDetected: sendHits.length > 0,
      smsSendApproved: false,
      stopHelpHandlingDetected,
      recommendedNextSteps,
    },
    communicationTables,
    safety: {
      twilioSmsApproved: false,
      bulkSendApproved: false,
      contactImportApproved: false,
      automationWorkersApproved: false,
    },
  };
}

function buildRelationalMap(schema) {
  const keys = [
    "RelationalContact",
    "VoterInteraction",
    "VoterVotePlan",
    "VolunteerProfile",
    "Commitment",
    "Person",
    "ContactPreference",
    "EmailContactProfile",
  ];
  const peopleGraph = Object.fromEntries(keys.map((k) => [k, modelExists(schema, k)]));

  const manualRelationshipEntryReady =
    peopleGraph.RelationalContact === true && peopleGraph.VolunteerProfile === true;
  const volunteerFollowUpReady = peopleGraph.Commitment === true && peopleGraph.VolunteerProfile === true;
  const voterContactOutcomeReady =
    peopleGraph.VoterInteraction === true || peopleGraph.VoterVotePlan === true;
  const countyAssignmentReady = peopleGraph.VolunteerProfile === true;

  const recommendedNextSteps = [];
  if (!peopleGraph.RelationalContact) recommendedNextSteps.push("Add or migrate RelationalContact for Reach-style ties.");
  if (!peopleGraph.VolunteerProfile) recommendedNextSteps.push("Ensure VolunteerProfile exists for volunteer identity.");
  if (!manualRelationshipEntryReady) recommendedNextSteps.push("Wire manual relationship entry UI after tables are trusted.");

  return {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    peopleGraph,
    readiness: {
      manualRelationshipEntryReady,
      volunteerFollowUpReady,
      voterContactOutcomeReady,
      countyAssignmentReady,
    },
    recommendedNextSteps,
  };
}

function main() {
  if (!fs.existsSync(CONTRACT)) {
    console.error("FAIL run validate-text-reach-foundation.mjs first");
    process.exit(1);
  }
  const contract = JSON.parse(fs.readFileSync(CONTRACT, "utf8"));
  const generatedAt = new Date().toISOString();
  const pass = contract.status === "pass";

  const schema = readSchema();
  const nativeMap = buildNativeTextMap(schema);
  const relMap = buildRelationalMap(schema);

  fs.mkdirSync(path.dirname(OUT_MAP_TEXT), { recursive: true });
  fs.writeFileSync(OUT_MAP_TEXT, JSON.stringify(nativeMap, null, 2), "utf8");
  fs.writeFileSync(OUT_MAP_REL, JSON.stringify(relMap, null, 2), "utf8");

  const filesCreated = [
    "src/lib/communication-command-center/text-reach-readiness.ts",
    "src/lib/texting/text-command-center-readiness.ts",
    "src/lib/people/relational-organizing-readiness.ts",
    "src/app/api/admin/communication-command-center/text-reach-readiness/route.ts",
    "src/app/admin/(board)/workbench/communication-command-center/text-reach/page.tsx",
    "src/app/admin/(board)/workbench/people/relational-organizing/page.tsx",
    "src/components/admin/text-reach/TextReachCommandCenter.tsx",
    "src/components/admin/text-reach/RelationalOrganizingPanel.tsx",
    "src/components/admin/text-reach/TextMessagingSafetyPanel.tsx",
    "src/components/admin/text-reach/VolunteerFollowUpPanel.tsx",
    "scripts/validate-text-reach-foundation.mjs",
    "scripts/build-text-reach-foundation-report.mjs",
    "data/text-reach-foundation-contract.json",
    "data/native-text-command-center-capability-map.json",
    "data/relational-organizing-capability-map.json",
    "data/text-reach-foundation-report.json",
    "data/text-reach-next-build-queue.json",
    "docs/text-reach-foundation.md",
    "docs/native-text-command-center.md",
    "docs/relational-organizing-foundation.md",
    "develop_notes/REDDIRT_NATIVE_TEXT_AND_REACH_FOUNDATION_1_0_REPORT.md",
  ];

  const filesModified = [
    "src/app/admin/(board)/workbench/communication-command-center/readiness/page.tsx",
    "src/components/admin/email-command-center/EmailCommandCenterReadinessView.tsx",
    "docs/communication-command-center-readiness.md",
    "docs/email-command-center-launch-hardening.md",
    "docs/campaign-email-command-center-progress-ledger.md",
    "docs/PROJECT_MASTER_MAP.md",
    "docs/THREAD_HANDOFF_MASTER_MAP.md",
  ];

  const report = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    contractStatus: contract.status,
    summary: pass
      ? "Native Text + Reach foundation slice: readiness API, admin cockpit shell, capability maps, validators pass."
      : "Validation failed — see contract violations.",
    filesCreated,
    filesModified,
    checks: contract.checks ?? [],
    violations: contract.violations ?? [],
    capabilityMaps: {
      nativeText: path.relative(ROOT, OUT_MAP_TEXT),
      relational: path.relative(ROOT, OUT_MAP_REL),
    },
  };

  const queue = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    nextBuildQueue: [
      "REDDIRT-TEXT-COMMAND-CENTER-NO-SEND-COCKPIT-1.0",
      "REDDIRT-REACH-MANUAL-RELATIONSHIP-ENTRY-MVP-1.0",
      "REDDIRT-FOLLOW-UP-QUEUE-MVP-1.0",
      "REDDIRT-TWILIO-WEBHOOK-COMPLIANCE-PROOF-1.0",
    ],
  };

  fs.writeFileSync(OUT_REPORT, JSON.stringify(report, null, 2), "utf8");
  fs.writeFileSync(OUT_QUEUE, JSON.stringify(queue, null, 2), "utf8");

  const md = `# REDDIRT_NATIVE_TEXT_AND_REACH_FOUNDATION_1_0_REPORT

**Lane:** RedDirt only  
**Slice:** \`${SLICE}\`  
**Generated:** ${generatedAt}

## 1. Slice summary

Read-only **Text + Reach foundation**: diagnostics **GET** JSON, admin **Text + Reach** hub, **RedDirt Reach** preview under People, capability JSON maps, validators. **No** SMS send, **no** Twilio activation, **no** contact import, **no** workers, **no** live email, **no** calendar writes, **no** Prisma migrations in this slice.

## 2. Files created

${filesCreated.map((f) => `- \\\`${f}\\\``).join("\n")}

## 3. Files modified

${filesModified.map((f) => `- \\\`${f}\\\``).join("\n")}

## 4. Native Text Command Center foundation

Webhook route inventory, send-path detection (informational), STOP/HELP signal from \`preferences.ts\`, communication table flags from schema scan.

## 5. RedDirt Reach foundation

People-graph model flags from \`schema.prisma\` (conservative); readiness booleans for manual entry and follow-ups.

## 6. Follow-up cockpit foundation

UI shell with empty states; ties to \`EmailWorkflowItem\` / \`CampaignEvent\` in runtime readiness when CCC tables green.

## 7. Safety posture

All approval flags **false** in JSON maps and \`text-reach-readiness\` safety block; no-send posture from governance.

## 8. Capability map

Written to \`data/native-text-command-center-capability-map.json\` and \`data/relational-organizing-capability-map.json\`.

## 9. Checks

Contract: **${contract.status}**. Run \`node scripts/validate-text-reach-foundation.mjs\`.

## 10. What remains blocked

Outbound SMS, bulk texting, large imports, automation workers, live email, calendar writes — until explicit headquarters slices.

## 11. Next recommended slice

${queue.nextBuildQueue.map((x) => `- ${x}`).join("\n")}
`;

  fs.writeFileSync(OUT_MD, md, "utf8");

  console.log("PASS build-text-reach-foundation-report.mjs");
  console.log(" ", path.relative(ROOT, OUT_REPORT));
  process.exit(0);
}

main();
