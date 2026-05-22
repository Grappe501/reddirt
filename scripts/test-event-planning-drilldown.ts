/**
 * Sprint 6 — event planning drilldown smoke (DB layer).
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCampaignEventsWorkbench } from "../src/lib/campaign-events/load-workbench-events";
import {
  generatePackList,
  generateRunOfShow,
  buildCandidateBrief,
  buildCampaignManagerBrief,
  scoreEventPlanningReadiness,
} from "../src/lib/campaign-events/event-planning/event-planning-helpers";
import { loadEventPlanning, saveEventPlanning } from "../src/lib/campaign-events/event-planning/event-planning-persist";
import { loadCalendarEventDrilldown, serializeCalendarRows } from "../src/lib/campaign-events/load-campaign-calendar-events";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

async function main() {
  const { rows } = await loadCampaignEventsWorkbench({ period: "2026-03" });
  if (!rows.length) {
    console.error("No March rows");
    process.exit(1);
  }
  const recordId = rows[0]!.recordId;
  const loaded = await loadCalendarEventDrilldown(recordId);
  if (!loaded) {
    console.error("Drilldown load failed");
    process.exit(1);
  }
  const [row] = serializeCalendarRows([loaded.row]);

  let planning = await loadEventPlanning(recordId);
  const ros = generateRunOfShow(row);
  planning = { ...planning, runOfShow: ros, packList: generatePackList(row) };
  planning.candidateBrief = buildCandidateBrief(row, planning);
  const readiness = scoreEventPlanningReadiness(row, planning);
  planning.cmBrief = buildCampaignManagerBrief(row, planning, readiness);
  await saveEventPlanning(recordId, planning);

  const reloaded = await loadEventPlanning(recordId);
  console.log("Event planning drilldown test");
  console.log("  recordId:", recordId);
  console.log("  runOfShow rows:", reloaded.runOfShow.length);
  console.log("  packList items:", reloaded.packList.length);
  console.log("  candidate brief:", Boolean(reloaded.candidateBrief.summary));
  console.log("  readiness:", readiness.scorePercent, readiness.bandLabel);

  const ok =
    reloaded.runOfShow.length >= 3 &&
    reloaded.packList.length >= 8 &&
    reloaded.candidateBrief.summary.length > 10;

  if (!ok) {
    console.error("FAIL");
    process.exit(1);
  }
  console.log("OK — planning persists on factCard._eventPlanning");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
