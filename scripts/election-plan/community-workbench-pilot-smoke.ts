/**
 * Community Workbench v1.3 — Jacksonville city + Grassroots & Guitar Strings event pilot smoke
 * Run: npm run election-plan:community-workbench:pilot-smoke
 */
import { loadPilotValidationSnapshot } from "../../src/lib/election-plan/community-workbench/load-pilot-status";
import { getEventPilotSmokePath, getPilotSmokePath } from "../../src/lib/election-plan/community-workbench/pilot-smoke-paths";

async function main() {
  const snapshot = await loadPilotValidationSnapshot();
  let failed = 0;

  console.log("Community Workbench pilot smoke status\n");
  console.log("Primary gate: Jacksonville city + Grassroots & Guitar Strings event\n");

  for (const pilot of snapshot.pilots) {
    const path =
      pilot.kind === "event" && pilot.eventSlug
        ? getEventPilotSmokePath(pilot.eventSlug)
        : getPilotSmokePath(pilot.slug);
    console.log(`=== ${pilot.name} (${pilot.kind}) ===`);
    console.log(path?.intro ?? pilot.context);
    console.log("");

    for (const step of pilot.steps) {
      console.log(`${step.pass ? "PASS" : "PENDING"} — ${step.label}`);
      if (step.detail) console.log(`         ${step.detail}`);
      if (!step.pass) failed += 1;
    }

    if (path) {
      console.log(`\nManual path: ${path.steps.length} documented steps — docs/COMMUNITY_WORKBENCH_V1_3_PILOT.md`);
    }
    console.log("");
  }

  if (snapshot.optionalCityPilot) {
    console.log(`=== ${snapshot.optionalCityPilot.name} (optional — not gated) ===`);
    for (const step of snapshot.optionalCityPilot.steps) {
      console.log(`${step.pass ? "PASS" : "PENDING"} — ${step.label}`);
      if (!step.pass) console.log("         (optional — does not block primary gate)");
    }
    console.log("");
  }

  console.log(`Open defects: ${snapshot.openDefectCount}`);
  console.log(`Primary pilot paths all pass: ${snapshot.pilotsAllPass ? "yes" : "no"}`);
  console.log("");

  if (snapshot.pilotsAllPass) {
    console.log("Pilot smoke (DB auto-checks): ALL PASS — ready for live field sign-off");
    return;
  }

  console.log("Pilot smoke (DB auto-checks): INCOMPLETE — complete steps in production UI");
  console.log("Start: /election-plan/workbenches/jacksonville");
  console.log("Event: /election-plan/workbenches/sherwood/events/grassroots-and-guitar-strings");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
