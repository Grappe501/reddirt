process.env.NETLIFY = "true";

import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { getSurfaceGuide } from "../src/lib/intelligence/v4/debateOperatorNarratives";
import { getTrapLaneDrillDown } from "../src/lib/intelligence/v4/trapLaneDrillDowns";
import { getSosDebateQuestionDrillDown } from "../src/lib/intelligence/v4/sosDebateQuestionBank";
import { getPrepSectionDrillDown } from "../src/lib/intelligence/v4/debatePrepSectionDrillDowns";
import { DEBATE_DEPTH_TOPICS } from "../src/lib/intelligence/v4/debateDepthTopics";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function main() {
  const hub = getSurfaceGuide("hub");
  assert(hub?.whatToExpectPlain, "hub whatToExpectPlain");
  assert((hub?.howHeWillAttack?.length ?? 0) >= 3, "hub attacks");
  assert((hub?.ifYouGetHungUp?.length ?? 0) >= 2, "hub stuck");

  const culture = getTrapLaneDrillDown("culture-war-escalation");
  assert(culture?.encounterDepth?.cultureWarDefense?.length, "culture trap depth");
  assert(culture!.rebuttalScripts.length >= 2, "culture rebuttals");

  const sos = getSosDebateQuestionDrillDown("civic-education-unity-accountability");
  assert(sos?.encounterDepth?.whatToExpectPlain, "sos encounter depth");

  const prep = getPrepSectionDrillDown("strategy");
  assert(prep?.encounterDepth?.ifYouGetHungUp?.length, "prep encounter depth");

  assert(DEBATE_DEPTH_TOPICS.length >= 5, "depth topics");

  console.log("Debate plain-language depth test PASS");
}

main();
