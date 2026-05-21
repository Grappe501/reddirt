/**
 * Agent Intelligence Sprint 3 — runtime dry-run (no sends/writes).
 */
import { runCampaignAgentRuntime } from "../src/lib/agents/runtime/campaign-agent-runtime";
import { loadRuntimeAudit } from "../src/lib/agents/runtime/runtime-audit";

const CASES = [
  "Build April reimbursement memo",
  "Show pending approvals",
  "Why is calendar stale?",
  "Promote this event to Google",
  "Send approval email",
  "What should I do next?",
  "Write host follow-up",
];

function main() {
  console.log("Agent runtime test\n");
  for (const message of CASES) {
    const res = runCampaignAgentRuntime({
      message,
      pathname: "/admin/campaign-manager-dashboard",
      role: "campaign_manager",
      period: "2026-04",
      actor: "test-script",
    });
    console.log("---");
    console.log("Q:", message);
    console.log("Intent:", res.interpretedIntent.task, res.interpretedIntent.riskLevel);
    console.log("Blocked actions:", res.blockedActions.length);
    console.log("Safe steps:", res.safeActions.map((s) => s.title).join(" | "));
    console.log("Primary link:", res.nextLinks[0]?.href);
  }
  console.log("\nAudit entries:", loadRuntimeAudit().length);
  console.log("OK — no email/GCal/financial auto-exec");
}

main();
