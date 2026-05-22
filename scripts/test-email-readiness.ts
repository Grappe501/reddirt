import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildEmailProviderReadinessReport } from "../src/lib/campaign-events/communications/email-provider-readiness";
import { discoverContactSources } from "../src/lib/campaign-events/communications/contact-source-discovery";
import { ensureDefaultTemplates, loadCommunicationsStore } from "../src/lib/campaign-events/communications/communications-store";
import { loadCommunicationsBundle } from "../src/lib/campaign-events/communications/load-communications-bundle";
import { SPRINT_COMMUNICATIONS_TOOL_CONTRACTS } from "../src/lib/campaign-events/ai-tools/sprint-communications-tools";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function main() {
  const readiness = buildEmailProviderReadinessReport();
  const sources = discoverContactSources();
  const templates = ensureDefaultTemplates();
  const store = loadCommunicationsStore();
  const bundle = loadCommunicationsBundle();

  console.log("Email readiness test");
  console.log("  sendgrid api:", readiness.sendGrid.apiKeyConfigured);
  console.log("  broadcast:", readiness.sendGrid.broadcastAllowed);
  console.log("  approval send enabled:", readiness.approvalEmail.sendEnabled);
  console.log("  mass blocked:", readiness.safety.massEmailBlocked);
  console.log("  sources:", sources.length);
  console.log("  templates:", templates.length);
  console.log("  tools:", SPRINT_COMMUNICATIONS_TOOL_CONTRACTS.length);
  console.log("  bundle mass:", bundle.massEmailStatus);

  const ok =
    readiness.safety.massEmailBlocked &&
    templates.length >= 6 &&
    sources.length >= 8 &&
    SPRINT_COMMUNICATIONS_TOOL_CONTRACTS.length === 25 &&
    store.version === 1;

  if (!ok) {
    console.error("FAIL");
    process.exit(1);
  }
  console.log("OK — provider readiness, sources, templates, mass send blocked");
}

main();
