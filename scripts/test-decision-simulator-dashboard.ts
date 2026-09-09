import { readFileSync } from "node:fs";

const page = readFileSync("src/app/admin/decision-simulator/page.tsx", "utf8");
const client = readFileSync("src/components/admin/decision-simulator/DecisionSimulatorClient.tsx", "utf8");
const route = readFileSync("src/app/api/admin/decision-simulator/run/route.ts", "utf8");

const checks: Array<[string, boolean]> = [
  ["admin dashboard route exists", page.includes("DecisionSimulatorClient")],
  ["run presets include 1/10/100/1000", ["1, 10, 100, 1000"].every((value) => client.includes(value))],
  ["million-run ceiling visible", client.includes("1_000_000") || client.includes("1,000,000")],
  ["opening correspondence input exists", client.includes("Opening correspondence")],
  ["counterparty input exists", client.includes("Counterparty")],
  ["decision picture exists", client.includes("Decision picture")],
  ["representative paths rendered", client.includes("Representative path")],
  ["live execution API exists", route.includes("runDecisionSimulationEnsemble")],
  ["larger jobs are planned, not faked", route.includes("plan.requestedRuns > 10") && route.includes('execution: "PLANNED"')],
  ["admin API auth enforced", route.includes("assertAdminApi")],
  ["API rate limiting enforced", route.includes("rateLimit")],
  ["OpenAI key absent from client", !client.includes("OPENAI_API_KEY")],
  ["no send/post behavior", !route.includes("sendEmail") && !route.includes("publishPost")],
];

console.log("Decision Simulator dashboard preview gate");
for (const [label, ok] of checks) console.log(`  ${ok ? "PASS" : "FAIL"} — ${label}`);
if (checks.some(([, ok]) => !ok)) process.exit(1);
console.log("OK — dashboard preview structural gate passed");
