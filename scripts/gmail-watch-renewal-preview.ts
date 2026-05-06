/**
 * Runbook: preview which Staff Gmail watches likely need renewal (DB state only).
 * Prefer **`npm run gmail:watch:renewal-check`** (EMAIL-GMAIL-PRODUCTION-WATCH-HARDENING-1.0) for CLI + env summary.
 *
 *   npx tsx scripts/gmail-watch-renewal-preview.ts
 *   GMAIL_WATCH_RENEWAL_EXECUTE=1 npx tsx scripts/gmail-watch-renewal-preview.ts --execute
 *
 * No bodies, no queue writes. `execute` still does not send mail.
 */

import {
  DEFAULT_RENEW_IF_EXPIRES_WITHIN_MS,
  executeGmailWatchRenewalsForUserIds,
  listGmailWatchRenewalCandidates,
} from "../src/lib/gmail/watch-renewal";
import { prisma } from "../src/lib/db";

async function main() {
  const execute = process.argv.includes("--execute");
  if (execute && process.env.GMAIL_WATCH_RENEWAL_EXECUTE !== "1") {
    console.error(
      "Refusing --execute: set GMAIL_WATCH_RENEWAL_EXECUTE=1 to confirm mailbox watch renewals (users.watch only)."
    );
    process.exit(1);
  }

  const lookahead = DEFAULT_RENEW_IF_EXPIRES_WITHIN_MS;
  const candidates = await listGmailWatchRenewalCandidates(lookahead);
  const needs = candidates.filter((c) => c.needsRenewal);

  console.log("Gmail watch renewal preview (no secret values)\n");
  console.log(`Lookahead: ${Math.round(lookahead / 3600000)}h before expiration counts as needs-renewal.`);
  console.log(`Candidates needing renewal: ${needs.length} / ${candidates.length}\n`);

  for (const c of candidates) {
    const mark = c.needsRenewal ? "NEEDS RENEW" : "ok";
    console.log(
      `[${mark}] userId=${c.userId} domain=@${c.sendAsEmailDomainHint ?? "?"} status=${c.displayStatus} reason=${c.reasonSafe}`
    );
  }

  if (execute && needs.length) {
    const ids = needs.map((c) => c.userId);
    const results = await executeGmailWatchRenewalsForUserIds(ids, { execute: true });
    console.log("\n--- execute results ---");
    for (const r of results) {
      console.log(
        `${r.userId}: ${r.ok ? "ok" : "fail"} ${r.code ?? ""} ${r.messageSafe ?? ""}`.trim()
      );
    }
  } else if (execute) {
    console.log("\nExecute requested but no accounts in renewal window.");
  } else {
    console.log("\nPreview only. To run users.watch renewals: GMAIL_WATCH_RENEWAL_EXECUTE=1 ... --execute");
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message.slice(0, 200) : e);
  process.exit(1);
});
