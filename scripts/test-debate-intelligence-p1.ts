/**
 * P1 debate data gate — full bill narratives, expanded likely arguments, quote/clip archive.
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { loadDebateIntelligenceV4Packet } from "../src/lib/intelligence/v4/debateIntelligenceV4";
import { loadOppositionArchiveRollup } from "../src/lib/opposition/oppositionBriefConfidence";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function main() {
  const v4 = loadDebateIntelligenceV4Packet();
  const archive = loadOppositionArchiveRollup();
  const nar = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../data/opposition/kim-hammer-election-record-legislative-narratives.json"),
      "utf8",
    ),
  ) as { billCount: number; bills: unknown[] };

  console.log("Debate intelligence P1");
  console.log("  narratives:", v4.billNarratives.length, "/", v4.hub.totalBills);
  console.log("  likely arguments:", v4.likelyArguments.length);
  console.log("  rebuttal cards:", v4.rebuttalPlaybook.length);
  console.log("  archive quotes:", archive.directQuoteCount, "usable:", archive.usableQuoteCount);
  console.log("  archive clips:", archive.directClipCount, "+ ref", archive.referenceClipCount);
  console.log("  retrieval partial:", archive.retrievalTasksPartial, "/", archive.retrievalTasksTotal);
  console.log("  narrative file billCount:", nar.billCount);

  const ok =
    v4.hub.totalBills >= 29 &&
    v4.billNarratives.length >= 29 &&
    nar.billCount >= 29 &&
    v4.likelyArguments.length >= 6 &&
    v4.rebuttalPlaybook.length >= 9 &&
    archive.directQuoteCount >= 4 &&
    archive.usableQuoteCount >= 1 &&
    archive.directClipCount >= 1;

  if (!ok) {
    console.error("FAIL — P1 debate data gate");
    process.exit(1);
  }
  console.log("OK — P1 debate data pass");
}

main();
