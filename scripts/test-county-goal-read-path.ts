/**
 * Validates county goal split-brain fix — no proxy written as registration goal in sync KPI path.
 */
import { loadCountyKpis, resetCountyWorkbenchAdapterCache } from "../src/lib/agents/county-intelligence/county-workbench-adapter";

resetCountyWorkbenchAdapterCache();

function main() {
  const pulaski = loadCountyKpis("pulaski");
  const pope = loadCountyKpis("pope");

  console.log("County goal read-path validation");

  const checks = [
    {
      name: "registrationGoal null in sync path (no proxy alias)",
      ok: pulaski != null && pulaski.registrationGoal === null,
    },
    {
      name: "planningVoteTargetProxy set separately",
      ok: pulaski != null && pulaski.planningVoteTargetProxy != null && pulaski.planningVoteTargetProxy > 0,
    },
    {
      name: "planningVoteTargetSource labeled",
      ok: pulaski?.planningVoteTargetSource === "arkansasStateAlignedTargets2022",
    },
    {
      name: "canonicalRegistrationGoal null until async enrich",
      ok: pulaski?.canonicalRegistrationGoal === null,
    },
    {
      name: "canonical status unverified in sync",
      ok: pulaski?.canonicalRegistrationGoalStatus === "unverified_sync_context",
    },
    {
      name: "notes warn vote target is not reg goal",
      ok: Boolean(pulaski?.notes.some((n) => /NOT a registration goal/i.test(n))),
    },
    {
      name: "no false registration on shell county",
      ok: pope != null && pope.registrationGoal === null,
    },
    {
      name: "deploymentReadiness classified",
      ok: pulaski?.deploymentReadiness != null,
    },
  ];

  for (const c of checks) {
    console.log(`  ${c.ok ? "PASS" : "FAIL"}: ${c.name}`);
  }

  const allOk = checks.every((c) => c.ok);
  if (!allOk) {
    console.error("FAIL — goal split-brain validation");
    process.exit(1);
  }
  console.log("OK — sync path does not alias vote proxy as registrationGoal");
}

main();
