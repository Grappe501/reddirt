/**
 * Sprint 7 — hot wash intelligence + county memory smoke (DB layer).
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCampaignEventsWorkbench } from "../src/lib/campaign-events/load-workbench-events";
import { loadCalendarEventDrilldown, serializeCalendarRows } from "../src/lib/campaign-events/load-campaign-calendar-events";
import {
  buildHotWashExecutiveSummary,
  extractTopFindings,
  isSuccessfulEvent,
  scaffoldMediaIntelligenceMeta,
} from "../src/lib/campaign-events/hot-wash-intelligence/event-intelligence-helpers";
import { emptyHotWashIntelligence } from "../src/lib/campaign-events/hot-wash-intelligence/hot-wash-intelligence-defaults";
import {
  loadHotWashIntelligence,
  saveHotWashIntelligence,
} from "../src/lib/campaign-events/hot-wash-intelligence/hot-wash-intelligence-persist";
import { runCampaignLearningLoop } from "../src/lib/campaign-events/hot-wash-intelligence/campaign-learning-loop";
import { loadCountyMemory } from "../src/lib/campaign-events/county-memory/county-memory-store";
import { loadBlueprintIndex } from "../src/lib/campaign-events/event-blueprints/blueprint-store";

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

  let intel = await loadHotWashIntelligence(recordId);
  intel = {
    ...emptyHotWashIntelligence(),
    ...intel,
    outcome: {
      ...intel.outcome,
      attendanceEstimate: "42",
      energyScore: "8",
      strategicValue: "High — strong county organizer turnout",
    },
    lessons: { ...intel.lessons, whatWorked: "Host intro, short Q&A", futureRecommendations: "Repeat house party format" },
    countySignals: { ...intel.countySignals, enthusiasm: "Strong", turnoutPotential: "Medium-high" },
  };
  intel.executiveSummary = buildHotWashExecutiveSummary(row, intel);
  intel.topFindings = extractTopFindings(intel);
  await saveHotWashIntelligence(recordId, intel);

  const reloaded = await loadHotWashIntelligence(recordId);
  const loop = await runCampaignLearningLoop(row, reloaded);
  const county = row.county ? await loadCountyMemory(row.county) : null;
  const blueprints = await loadBlueprintIndex();
  const mediaMeta =
    scaffoldMediaIntelligenceMeta({
      id: "test",
      mediaType: "image",
      uploaderName: "Test",
      approvalStatus: "pending",
    } as import("../src/lib/campaign-events/media/hot-wash-media-types").HotWashMediaRecord) ?? {};

  console.log("Hot wash intelligence test");
  console.log("  recordId:", recordId);
  console.log("  executiveSummary:", reloaded.executiveSummary.slice(0, 60) + "…");
  console.log("  topFindings:", reloaded.topFindings.length);
  console.log("  learning loop county:", loop.countyMemoryUpdated);
  console.log("  blueprint created:", loop.blueprintCreated);
  console.log("  county events:", county?.eventCount ?? 0);
  console.log("  blueprints total:", blueprints.blueprints.length);
  console.log("  media meta keys:", Object.keys(mediaMeta).join(", "));

  const ok =
    reloaded.executiveSummary.length > 10 &&
    reloaded.topFindings.length >= 1 &&
    loop.countyMemoryUpdated &&
    "facesCountPlaceholder" in mediaMeta;

  if (!ok) {
    console.error("FAIL");
    process.exit(1);
  }
  console.log("OK — hot wash intelligence persists and learning loop runs");
  console.log("  successful event heuristic:", isSuccessfulEvent(reloaded));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
