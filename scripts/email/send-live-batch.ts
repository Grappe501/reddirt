import { sendApprovedEmailBatch } from "../../src/lib/email/sendgrid-client";

async function main() {
  const draftId = process.argv[2];
  const limit = Number(process.argv[3] ?? "25");
  if (!draftId || !Number.isFinite(limit)) {
    console.error("Usage: CONFIRM_LIVE_EMAIL_SEND=true npm run email:live-batch -- <draft-id> <limit>");
    process.exit(1);
  }
  if (process.env.CONFIRM_LIVE_EMAIL_SEND !== "true") {
    console.error("Blocked: CONFIRM_LIVE_EMAIL_SEND=true is required for live batch sends.");
    process.exit(1);
  }
  const result = await sendApprovedEmailBatch(draftId, limit);
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
