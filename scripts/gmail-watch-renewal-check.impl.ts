/**
 * Implementation for gmail-watch-renewal-check.mjs — safe console output only.
 */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildGmailWatchRenewalPlan,
  getGmailHistoryProcessingSummary,
  getGmailWatchProductionReadiness,
} from "../src/lib/email-command-center/gmail-production-watch";
import { executeGmailWatchRenewalsForUserIds } from "../src/lib/gmail/watch-renewal";
import { prisma } from "../src/lib/db";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
process.chdir(root);
try {
  if (typeof process.loadEnvFile === "function") {
    const envPath = join(root, ".env");
    if (existsSync(envPath)) process.loadEnvFile(envPath);
  }
} catch {
  /* ignore */
}

async function main() {
  const execute = process.argv.includes("--execute");
  const readiness = getGmailWatchProductionReadiness();
  const plan = await buildGmailWatchRenewalPlan();
  const history = await getGmailHistoryProcessingSummary();

  console.log("Gmail watch renewal check — EMAIL-GMAIL-PRODUCTION-WATCH-HARDENING-1.0\n");
  console.log("Mode:", execute ? "EXECUTE (users.watch only — no mail send)" : "DRY-RUN (no Gmail API calls for renewal)\n");

  console.log("--- Env / receiver (names only) ---");
  console.log(`OAuth pipeline configured: ${readiness.oauthPipelineConfigured ? "yes" : "no"}`);
  console.log(`GOOGLE_PUBSUB_TOPIC set: ${readiness.topicConfigured ? "yes" : "no"}`);
  console.log(`Pub/Sub verification token set: ${readiness.verificationTokenConfigured ? "yes" : "no"}`);
  console.log(`POST receiver ready (topic + verifier): ${readiness.pubsubReceiverConfigured ? "yes" : "no"}`);
  if (plan.missingEnvVarNames.length) {
    console.log("Missing or incomplete env (names only):", plan.missingEnvVarNames.join("; "));
  }

  console.log("\n--- History / cursor posture (active Staff Gmail rows) ---");
  console.log(`Active accounts: ${history.activeStaffAccounts}`);
  console.log(`With profile lastHistoryId: ${history.withProfileHistoryId}`);
  console.log(`historyCursorStale: ${history.historyCursorStaleCount}`);
  console.log(`requiresFullSync: ${history.requiresFullSyncCount}`);
  console.log(`Last dry-run 404 (need metadata sync): ${history.lastDryRun404Count}`);
  console.log(`Pub/Sub signal but no profile cursor: ${history.pendingSignalWithoutProfileCursor}`);
  console.log(`Watch expiring within 48h: ${history.watchesExpiringWithin48h}`);

  console.log("\n--- Renewal plan (lookahead " + Math.round(plan.lookaheadMs / 3600000) + "h) ---");
  for (const step of plan.stepsSafe) {
    console.log(` • ${step}`);
  }
  console.log(`\nAccounts flagged needs-renewal: ${plan.accounts.length}`);
  for (const a of plan.accounts) {
    console.log(
      `  userId=${a.userId} domain=@${a.sendAsEmailDomainHint ?? "?"} status=${a.displayStatus} reason=${a.reasonSafe}`,
    );
  }

  if (execute) {
    if (process.env.GMAIL_WATCH_RENEWAL_EXECUTE !== "1") {
      console.error(
        "\nRefusing --execute: set GMAIL_WATCH_RENEWAL_EXECUTE=1 to confirm users.watch renewals (no mail send).",
      );
      process.exit(1);
    }
    const ids = plan.accounts.map((a) => a.userId);
    if (!ids.length) {
      console.log("\nExecute requested but no accounts in renewal window.");
    } else {
      const results = await executeGmailWatchRenewalsForUserIds(ids, { execute: true });
      console.log("\n--- execute results (safe excerpts only) ---");
      for (const r of results) {
        console.log(`${r.userId}: ${r.ok ? "ok" : "fail"} ${r.code ?? ""} ${r.messageSafe ?? ""}`.trim());
      }
    }
  } else {
    console.log("\nDry-run only. To renew: GMAIL_WATCH_RENEWAL_EXECUTE=1 npm run gmail:watch:renewal-check -- --execute");
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message.slice(0, 240) : e);
  process.exit(1);
});
