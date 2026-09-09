import { readFileSync } from "node:fs";

const page = readFileSync("src/app/admin/decision-simulator/page.tsx", "utf8");
const client = readFileSync("src/components/admin/decision-simulator/DecisionSimulatorClient.tsx", "utf8");
const route = readFileSync("src/app/api/admin/decision-simulator/run/route.ts", "utf8");
const jobs = readFileSync("src/app/api/admin/decision-simulator/jobs/route.ts", "utf8");
const cancel = readFileSync("src/app/api/admin/decision-simulator/jobs/[jobId]/cancel/route.ts", "utf8");

const checks: Array<[string, boolean]> = [
  ["admin dashboard route exists", page.includes("DecisionSimulatorClient")],
  ["run presets include 1/10/100/1000", ["1, 10, 100, 1000"].every((value) => client.includes(value))],
  ["depth labels present", client.includes("QUICK LOOK") || client.includes("Quick look")],
  ["million-run ceiling visible", client.includes("1_000_000") || client.includes("1,000,000")],
  ["opening correspondence input exists", client.includes("Opening move") || client.includes("Opening correspondence")],
  ["counterparty input exists", client.includes("Counterparty")],
  ["actor model selector exists", client.includes("HYPOTHESIS MODEL") && client.includes("Add personality")],
  ["Jones/Hill research pair is defaultable", client.includes("chris-jones-ar02") && client.includes("french-hill-ar02")],
  ["personality intelligence panel exists", client.includes("PersonalityIntelligence")],
  ["cost estimate shown before large runs", /estimated workload/i.test(client) && client.includes("Second confirmation")],
  ["queued launch verbs exist", client.includes("Launch 100-Run Ensemble") || client.includes("depth.runVerb")],
  ["live job progress exists", client.includes("Cancel Job") && client.includes("simulations complete")],
  ["results command center exists", client.includes("Dominant response frame") && (client.includes("Move-by-move consensus") || client.includes("B. Move-by-move consensus"))],
  ["jobs API creates real jobs", jobs.includes("createDecisionSimulationJob") && jobs.includes("kickDecisionSimulationWorker")],
  ["jobs API prefers researched built-in models", jobs.includes("getBuiltInPersonality") && jobs.includes("isUsableActorModel")],
  ["custom personalities travel with the job", client.includes("actorModel") && client.includes("CUSTOM MODEL")],
  ["legacy live path still exists", route.includes("runDecisionSimulationEnsemble")],
  ["cancel API exists", cancel.includes("cancelDecisionSimulationJob")],
  ["admin API auth enforced", jobs.includes("assertAdminApi") && route.includes("assertAdminApi")],
  ["API rate limiting enforced", jobs.includes("rateLimit") && route.includes("rateLimit")],
  ["OpenAI key absent from client", !client.includes("OPENAI_API_KEY")],
  ["no send/post behavior", !route.includes("sendEmail") && !jobs.includes("publishPost")],
];

console.log("Decision Simulator dashboard preview gate");
for (const [label, ok] of checks) console.log(`  ${ok ? "PASS" : "FAIL"} — ${label}`);
if (checks.some(([, ok]) => !ok)) process.exit(1);
console.log("OK — dashboard preview structural gate passed");
