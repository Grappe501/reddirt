import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { composeCommunicationsIntelligenceContext } from "../src/lib/communications/communications-intelligence-engine";
import { listCommunicationCopilotIds, applyCommunicationsIntelToCopilot } from "../src/lib/communications/communications-copilot-applications";
import { SPRINT_COMMUNICATIONS_INTELLIGENCE_V2_TOOL_CONTRACTS } from "../src/lib/campaign-events/ai-tools/sprint-communications-intelligence-v2-tools";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function main() {
  const ctx = composeCommunicationsIntelligenceContext();
  const lead = applyCommunicationsIntelToCopilot("communications_lead");
  const copilots = listCommunicationCopilotIds();

  console.log("Communications intelligence test");
  console.log("  priorities:", ctx.topPriorities.length);
  console.log("  mass:", ctx.massEmailStatus);
  console.log("  county gaps:", ctx.countyGaps.length);
  console.log("  copilots:", copilots.length);
  console.log("  lead guidance:", lead.operatorGuidance.length);
  console.log("  v2 tools:", SPRINT_COMMUNICATIONS_INTELLIGENCE_V2_TOOL_CONTRACTS.length);

  const ok =
    ctx.massEmailStatus === "blocked" &&
    ctx.topPriorities.length >= 1 &&
    copilots.length === 12 &&
    lead.operatorGuidance.length >= 2 &&
    SPRINT_COMMUNICATIONS_INTELLIGENCE_V2_TOOL_CONTRACTS.length >= 35;

  if (!ok) {
    console.error("FAIL");
    process.exit(1);
  }
  console.log("OK — intelligence context, copilots, mass blocked");
}

main();
