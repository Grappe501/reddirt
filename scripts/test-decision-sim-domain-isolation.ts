import { readFileSync } from "node:fs";

const nextConfig = readFileSync("next.config.ts", "utf8");
const siteHelper = readFileSync("src/lib/site/decision-sim-site.ts", "utf8");
const stash = readFileSync("scripts/stash-netlify-public-hub-app.cjs", "utf8");
const siteMode = readFileSync("scripts/netlify-site-mode.cjs", "utf8");
const client = readFileSync("src/components/admin/decision-simulator/DecisionSimulatorClient.tsx", "utf8");
const page = readFileSync("src/app/admin/decision-simulator/page.tsx", "utf8");
const home = readFileSync("src/content/home/trust-funnel-home.ts", "utf8");
const jobsRoute = readFileSync("src/app/api/admin/decision-simulator/jobs/route.ts", "utf8");
const runRoute = readFileSync("src/app/api/admin/decision-simulator/run/route.ts", "utf8");
const workRoute = readFileSync("src/app/api/admin/decision-simulator/jobs/[jobId]/work/route.ts", "utf8");
const worker = readFileSync("src/lib/agents/decision-simulation/worker.ts", "utf8");

const campaignMarkers = ["THE PEOPLE RULE", "Meet Kelly"];

function assert(ok: boolean, label: string) {
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${label}`);
  if (!ok) throw new Error(label);
}

console.log("Decision Simulator domain isolation");

assert(siteHelper.includes("NEXT_PUBLIC_DECISION_SIM_SITE") && siteHelper.includes('site === "dec-sim"'), "dec-sim detection is flag/site-name gated");
assert(nextConfig.includes("decisionSimSite") && nextConfig.includes('destination: "/admin/decision-simulator"'), "/ redirects to simulator only when decisionSimSite");
assert(!nextConfig.includes("kgrappe.netlify.app") || !/kgrappe[\s\S]{0,80}decision-simulator/.test(nextConfig), "no hostname condition redirects kgrappe to the simulator");
assert(nextConfig.includes("macroscopicLifeSite") && nextConfig.includes("decisionSimSite"), "kgrappe campaign routing remains the default when dec-sim flag is off");

assert(stash.includes("DEC_SIM_STASH_DIRS") && stash.includes('src/app/(site)'), "dec-sim stashes the campaign public hub");
assert(stash.includes('src/app/admin/decision-simulator') && stash.includes("src/app/admin/login"), "dec-sim keeps simulator and login");
assert(siteMode.includes("dec-sim"), "site-mode helper recognizes dec-sim");

assert(page.includes("DecisionSimulatorClient") && client.includes("Decision Simulator"), "Decision Simulator page contains Decision Simulator");
assert(client.includes("Model the next six moves before you act."), "product subtext is present");

for (const marker of campaignMarkers) {
  assert(!client.includes(marker), `dec-sim dashboard must not contain ${marker}`);
  assert(home.includes(marker), `campaign homepage copy still owns ${marker}`);
}
assert(!client.includes("Donate") || !/nav[\s\S]{0,40}Donate/.test(client), "dec-sim dashboard is not the campaign Donate surface");
assert(!client.includes("Meet Kelly"), "dec-sim dashboard does not render Meet Kelly");

assert(jobsRoute.includes("assertAdminApi") && jobsRoute.includes("rateLimit"), "jobs API is admin-protected and rate-limited");
assert(runRoute.includes("assertAdminApi"), "legacy run API remains admin-protected");
assert(workRoute.includes("isDecisionSimWorkerAuthorized") && workRoute.includes("assertAdminApi"), "worker route requires worker header or admin");
assert(!jobsRoute.includes("sendEmail") && !runRoute.includes("sendEmail") && !worker.includes("publishPost"), "no send/post functionality");
assert(!client.includes("OPENAI_API_KEY"), "OpenAI key absent from client");

console.log("OK — dec-sim domain isolation gate passed");
