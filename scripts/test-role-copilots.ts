import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import {
  getRoleCopilot,
  listRoleCopilotIds,
} from "../src/lib/agents/role-copilots/role-copilot-registry";
import {
  buildRoleCopilotBrief,
  buildRoleFirstTasks,
  recommendRoleCopilot,
} from "../src/lib/agents/role-copilots/role-copilot-engine";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function main() {
  const ids = listRoleCopilotIds();
  const rec = recommendRoleCopilot({ helpingWith: "treasurer reimbursement", experience: "some" });
  const brief = buildRoleCopilotBrief("treasurer");
  const tasks = buildRoleFirstTasks("treasurer", 2, "beginner");
  const ok =
    ids.length === 15 &&
    !!getRoleCopilot("operator") &&
    rec.role === "treasurer" &&
    brief.mission.length > 10 &&
    tasks.length >= 2;
  console.log("Role copilots:", ids.length, "recommend:", rec.role, "tasks:", tasks.length);
  if (!ok) {
    console.error("FAIL");
    process.exit(1);
  }
  console.log("PASS");
}

main();
