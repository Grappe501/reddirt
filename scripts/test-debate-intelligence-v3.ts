/**
 * Intelligence v3 packet — JSON + markdown opposition research.
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDebateIntelligenceV3Packet } from "../src/lib/intelligence/v3/debateIntelligenceV3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function main() {
  const v3 = loadDebateIntelligenceV3Packet();
  console.log("Debate intelligence v3");
  console.log("  version:", v3.version);
  console.log("  bills:", v3.hub.totalBills);
  console.log("  narratives:", v3.billNarratives.length);
  console.log("  debate prep sections:", v3.debatePrepSections.length);
  console.log("  debate profile sections:", v3.researchLayers.debateProfile.length);
  console.log("  claims needs research:", v3.hub.claims.needsResearch.length);
  console.log("  opponent modules:", v3.opponentModules.length);

  const ok =
    v3.version === "3.0" &&
    v3.hub.totalBills >= 18 &&
    v3.debatePrepSections.length === 14 &&
    v3.billNarratives.length >= 5 &&
    v3.researchLayers.debateProfile.length >= 1;

  if (!ok) {
    console.error("FAIL — v3 packet incomplete");
    process.exit(1);
  }
  console.log("OK — v3 opposition research packet ready");
}

main();
