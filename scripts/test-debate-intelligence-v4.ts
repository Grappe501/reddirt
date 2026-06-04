/**
 * Intelligence v4 packet — v3 + structured opposition profile JSON.
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDebateIntelligenceV4Packet } from "../src/lib/intelligence/v4/debateIntelligenceV4";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function main() {
  const v4 = loadDebateIntelligenceV4Packet();
  console.log("Debate intelligence v4");
  console.log("  version:", v4.version);
  console.log("  bills:", v4.hub.totalBills);
  console.log("  narratives:", v4.billNarratives.length);
  console.log("  v3 prep sections:", v4.debatePrepSections.length);
  console.log("  v4 prep sections:", v4.debatePrepSectionsV4.length);
  console.log("  theme rows:", v4.themeMatrix.length);
  console.log("  timeline rows:", v4.timeline.length);
  console.log("  likely arguments:", v4.likelyArguments.length);
  console.log("  rebuttal cards:", v4.rebuttalPlaybook.length);
  console.log("  archive confidence:", v4.executiveBrief.archiveConfidenceScore);
  console.log("  integrity 2021:", v4.integrity2021?.billNumbers?.length ?? 0);

  const ok =
    v4.version === "4.0" &&
    v4.hub.totalBills >= 18 &&
    v4.debatePrepSections.length === 14 &&
    v4.debatePrepSectionsV4.length === 28 &&
    v4.billNarratives.length >= 5 &&
    v4.themeMatrix.length >= 5 &&
    v4.likelyArguments.length >= 3 &&
    v4.rebuttalPlaybook.length >= 5;

  if (!ok) {
    console.error("FAIL — v4 packet incomplete");
    process.exit(1);
  }
  console.log("OK — v4 opposition research packet ready (2x prep depth)");
}

main();
