import { sendTestEmail } from "../../src/lib/email/sendgrid-client";

async function main() {
  const draftId = process.argv[2];
  const recipients = (process.argv[3] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!draftId || recipients.length === 0) {
    console.error("Usage: npm run email:test-send -- <draft-id> <recipient@example.com[,recipient2@example.com]>");
    process.exit(1);
  }
  const result = await sendTestEmail(draftId, recipients);
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
