import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { countTrainingModules, getTrainingModule } from "../src/lib/agents/training/training-module-registry";
import { getRoleTrainingPath, buildTrainingPathForAvailableTime } from "../src/lib/agents/training/training-path-builder";
import {
  markModuleCompleted,
  getTrainingProgress,
  upsertTrainingProgress,
} from "../src/lib/agents/training/training-progress-store";
import { getUnlockedDashboardModules } from "../src/lib/agents/training/training-unlock-engine";
import { completeRoleOnboardingV2 } from "../src/lib/agents/onboarding/role-onboarding-engine";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
loadRedDirtEnv(root);

function main() {
  const count = countTrainingModules();
  const pathDef = getRoleTrainingPath("campaign_manager", "beginner");
  const timePath = buildTrainingPathForAvailableTime("intern", 30);
  const opId = "test_op_training";
  upsertTrainingProgress({ operatorId: opId, role: "intern", completedModuleIds: [], startedModuleIds: [] }, root);
  markModuleCompleted(opId, "intern", "tr-intern-basics-101", root);
  const prog = getTrainingProgress(opId, root);
  const unlocked = getUnlockedDashboardModules(prog?.completedModuleIds ?? []);
  const onboard = completeRoleOnboardingV2(
    {
      who: "Test",
      helpingWith: "events",
      experience: "none",
      availableHoursPerWeek: 4,
      techComfort: "low",
      shouldDo: [],
      shouldNot: [],
    },
    "new_admin",
  );

  const ok =
    count >= 35 &&
    pathDef.moduleIds.length >= 3 &&
    timePath.moduleIds.length >= 1 &&
    (prog?.completedModuleIds.includes("tr-intern-basics-101") ?? false) &&
    onboard.trainingPath.moduleIds.length >= 1 &&
    !!getTrainingModule("tr-os-navigation-101");

  console.log("Training modules:", count, "path:", pathDef.moduleIds.length, "unlocks:", unlocked.length);
  if (!ok) {
    console.error("FAIL");
    process.exit(1);
  }
  console.log("PASS");
}

main();
