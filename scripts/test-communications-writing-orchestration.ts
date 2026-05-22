import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { routeCampaignWriting } from "../src/lib/communications/writing-orchestration/campaign-writing-router";
import { buildCommunicationSequence } from "../src/lib/communications/sequences/communication-sequence-builder";
import { adaptCountyMessaging } from "../src/lib/communications/writing-orchestration/county-message-adapter";
import { resetCountyWorkbenchAdapterCache } from "../src/lib/agents/county-intelligence/county-workbench-adapter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));
resetCountyWorkbenchAdapterCache();

function main() {
  const draft = routeCampaignWriting({
    audience: "volunteer",
    purpose: "welcome",
    displayName: "Test Volunteer",
    trustLevel: "new",
  });
  const seq = buildCommunicationSequence("volunteer_onboarding", "Test cohort");
  const county = adaptCountyMessaging("pulaski");

  console.log("Writing orchestration test");
  console.log("  subject:", draft.subject.slice(0, 40));
  console.log("  human gate:", draft.humanApprovalRequired);
  console.log("  warnings:", draft.warnings.length);
  console.log("  sequence steps:", seq.steps.length);
  console.log("  county angle:", county?.angle.slice(0, 40) ?? "n/a");

  const ok =
    draft.humanApprovalRequired === true &&
    draft.body.includes("draft") &&
    seq.steps.every((s) => s.humanReviewRequired) &&
    draft.warnings.some((w) => w.includes("approval") || w.includes("Mass") || w.includes("draft"));

  if (!ok) {
    console.error("FAIL");
    process.exit(1);
  }
  console.log("OK — writing router, sequences, county adapter (no auto-send)");
}

main();
