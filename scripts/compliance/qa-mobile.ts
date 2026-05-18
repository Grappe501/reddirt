import { buildComplianceExecutiveScore } from "../../src/lib/compliance/scoring/compliance-score";
import { buildComplianceTasks } from "../../src/lib/compliance/tasks/build-compliance-tasks";

async function main() {
  const [score, tasks] = await Promise.all([buildComplianceExecutiveScore(), buildComplianceTasks()]);
  if (score.score < 0 || score.score > 100) throw new Error("Compliance score out of range.");
  if (!["green", "yellow", "red"].includes(score.status)) throw new Error("Compliance score status invalid.");
  console.log(JSON.stringify({ status: "ok", score: score.score, scoreStatus: score.status, mobileTasks: tasks.slice(0, 20).length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
