import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { loadKellyAdversarialMirror, getKellyMirrorTriggerWord } from "../src/lib/intelligence/kellyAdversarialMirror";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function main() {
  const mirror = loadKellyAdversarialMirror(path.join(__dirname, ".."));
  assert(mirror, "mirror json loads");
  assert(mirror.researchDossier.findings.length >= 10, "research findings");
  assert(mirror.hammerRedTeam.attackVectors.length >= 4, "hammer vectors");
  assert(mirror.packoRedTeam.attackVectors.length >= 2, "packo vectors");
  assert(mirror.counterPlaybook.responses.length >= 5, "counter responses");
  assert(mirror.buildPlan.phases.length >= 3, "build phases");
  assert(getKellyMirrorTriggerWord() === "quorum", "trigger word");

  const needsResearch = mirror.researchDossier.findings.filter((f) => f.verificationStatus === "NEEDS_RESEARCH");
  assert(needsResearch.some((f) => f.id === "kg-criminal-civil-records"), "criminal search queued");

  console.log("Kelly adversarial mirror test PASS");
  console.log("  findings:", mirror.researchDossier.findings.length);
  console.log("  trigger:", getKellyMirrorTriggerWord());
}

main();
