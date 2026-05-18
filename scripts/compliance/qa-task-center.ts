import { buildComplianceTasks } from "../../src/lib/compliance/tasks/build-compliance-tasks";

async function main() {
  const tasks = await buildComplianceTasks();
  if (!Array.isArray(tasks)) throw new Error("Task center did not return an array.");
  if (tasks.some((task) => !task.id || !task.type || !task.priority || !task.status)) throw new Error("Task shape invalid.");
  console.log(JSON.stringify({ status: "ok", taskCount: tasks.length, urgent: tasks.filter((task) => task.priority === "urgent").length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
