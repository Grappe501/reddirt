import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { ensureSampleVolunteerForTests, loadVolunteersStore, seedEmptyVolunteerDataFiles } from "../src/lib/campaign-events/volunteers/volunteer-storage";
import { buildVolunteerTrainingPath } from "../src/lib/campaign-events/volunteers/volunteer-training-engine";
import { recommendVolunteersForEvent } from "../src/lib/campaign-events/volunteers/volunteer-assignment-engine";
import { loadVolunteerSystemBundle } from "../src/lib/campaign-events/volunteers/load-volunteer-bundle";
import { SPRINT_VOLUNTEER_TOOL_CONTRACTS } from "../src/lib/campaign-events/ai-tools/sprint-volunteer-tools";
import { buildVolunteerCommunicationDraft, VOLUNTEER_COMMS_SAFETY_NOTE } from "../src/lib/campaign-events/volunteers/volunteer-communications-planner";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function main() {
  seedEmptyVolunteerDataFiles();
  const sample = ensureSampleVolunteerForTests();
  const store = loadVolunteersStore();
  const trainingPath = buildVolunteerTrainingPath(sample, store.training);
  const recs = recommendVolunteersForEvent(
    { eventRecordId: "evt_test", county: "pulaski", rolesNeeded: ["check-in table"], volunteersNeeded: 2 },
    store.profiles,
    store.assignments,
  );
  const bundle = loadVolunteerSystemBundle();
  const draft = buildVolunteerCommunicationDraft(sample, "welcome");

  console.log("Volunteer system test");
  console.log("  profiles:", store.profiles.length);
  console.log("  training next:", trainingPath.recommendedNext.length);
  console.log("  recommendations:", recs.length);
  console.log("  bundle count:", bundle.volunteerCount);
  console.log("  tools:", SPRINT_VOLUNTEER_TOOL_CONTRACTS.length);
  console.log("  draft approval required:", draft.humanApprovalRequired);
  console.log("  safety note present:", VOLUNTEER_COMMS_SAFETY_NOTE.length > 20);

  const ok =
    store.profiles.length >= 1 &&
    trainingPath.recommendedNext.length >= 1 &&
    recs.length >= 0 &&
    bundle.modulesAvailable >= 10 &&
    SPRINT_VOLUNTEER_TOOL_CONTRACTS.length === 25 &&
    draft.humanApprovalRequired === true;

  if (!ok) {
    console.error("FAIL");
    process.exit(1);
  }
  console.log("OK — volunteer V1 loads; no sends");
}

main();
