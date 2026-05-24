/**
 * Email OS Agent Tool Suite smoke test.
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  EMAIL_OS_SUITE_TOOL_COUNT,
  SPRINT_EMAIL_OS_AGENT_TOOL_CONTRACTS,
} from "../src/lib/campaign-events/ai-tools/sprint-email-os-agent-tools";
import {
  getEmailOsSuiteManifest,
  runEmailOsMassSendGuard,
  runEmailOsDraftCritique,
  runEmailOsWritingRouter,
} from "../src/lib/campaign-events/ai-tools/email-os-tool-helpers";
import { routeEmailOsAgentTool } from "../src/lib/campaign-events/ai-tools/email-os-agent-tool-router";
import { resetCountyWorkbenchAdapterCache } from "../src/lib/agents/county-intelligence/county-workbench-adapter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));
resetCountyWorkbenchAdapterCache();

function main() {
  const manifest = getEmailOsSuiteManifest(EMAIL_OS_SUITE_TOOL_COUNT);
  const guard = runEmailOsMassSendGuard(500);
  const draft = runEmailOsDraftCritique({ subject: "Hello", body: "Thank you for volunteering.", preheader: "" });
  const writing = runEmailOsWritingRouter();
  const routed = routeEmailOsAgentTool("mass-send-block-enforcer", { recipientCount: 50 });

  console.log("Email OS agent tool suite test");
  console.log("  tools:", SPRINT_EMAIL_OS_AGENT_TOOL_CONTRACTS.length);
  console.log("  manifest rails:", manifest.rails.length);
  console.log("  mass guard allowed:", guard.allowed);
  console.log("  draft critique overall:", draft.overallSummary?.slice(0, 40) ?? "ok");
  console.log("  writing human gate:", writing.humanApprovalRequired);
  console.log("  router ok:", routed.ok);

  const ids = new Set(SPRINT_EMAIL_OS_AGENT_TOOL_CONTRACTS.map((t) => t.id));
  const dupes = SPRINT_EMAIL_OS_AGENT_TOOL_CONTRACTS.length - ids.size;

  const ok =
    SPRINT_EMAIL_OS_AGENT_TOOL_CONTRACTS.length >= 55 &&
    dupes === 0 &&
    guard.allowed === false &&
    writing.humanApprovalRequired === true &&
    routed.ok === true &&
    manifest.humanControlRules.length >= 3;

  if (!ok) {
    console.error("FAIL", { dupes, guard: guard.allowed });
    process.exit(1);
  }
  console.log("OK — Email OS suite registered, mass blocked, human-gated drafts");
}

main();
