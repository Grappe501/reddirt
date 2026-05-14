import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Prisma } from "@prisma/client";

import { prisma } from "../../src/lib/db";
import { buildDefaultCampaignMaterialsInventory } from "../../src/lib/calendar/campaign-materials-inventory";
import { buildEventStaffingPlan } from "../../src/lib/calendar/build-event-staffing-plan";
import type { EventCoveragePlansFile } from "../../src/lib/calendar/event-coverage-types";
import type { EventStaffAssignmentsFile, EventStaffingPlansFile } from "../../src/lib/calendar/event-staffing-types";
import { loadRedDirtEnv } from "../load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..", "..");
const DATA_DIR = path.join(REPO, "data/calendar-command-center");
const COVERAGE = path.join(DATA_DIR, "event-coverage-plans.staged.json");

loadRedDirtEnv(REPO);

type EventMeta = {
  campaignEventId: string;
  title: string;
  startAt: Date | null;
  locationName: string | null;
};

function readCoverage(): EventCoveragePlansFile {
  return JSON.parse(readFileSync(COVERAGE, "utf8")) as EventCoveragePlansFile;
}

function stats(plans: EventStaffingPlansFile["plans"]): EventStaffingPlansFile["stats"] {
  return {
    total: plans.length,
    needsVolunteerLead: plans.filter((p) => p.status === "needs_volunteer_lead").length,
    needsCallout: plans.filter((p) => p.status === "needs_callout" || p.staffingGap > 0).length,
    fullyStaffed: plans.filter((p) => p.status === "fully_staffed").length,
    totalStaffingGap: plans.reduce((sum, p) => sum + p.staffingGap, 0),
  };
}

async function main() {
  const coverage = readCoverage();
  const eventRows = await prisma.$queryRaw<EventMeta[]>(Prisma.sql`
    SELECT id AS "campaignEventId", title, "startAt", "locationName"
    FROM public."CampaignEvent"
  `);
  const metaById = new Map(eventRows.map((row) => [row.campaignEventId, row]));
  const plans = coverage.plans.map((plan) => buildEventStaffingPlan(plan, metaById.get(plan.campaignEventId)));
  const generatedAt = new Date().toISOString();
  const file: EventStaffingPlansFile = {
    version: 1,
    generatedAt,
    source: "event_coverage_plans",
    stats: stats(plans),
    plans,
  };
  const assignmentsFile: EventStaffAssignmentsFile = {
    version: 1,
    generatedAt,
    source: "event_staffing_plans",
    assignments: plans.flatMap((plan) => plan.assignedVolunteers),
  };
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(path.join(DATA_DIR, "event-staffing-plans.staged.json"), JSON.stringify(file, null, 2), "utf8");
  await writeFile(path.join(DATA_DIR, "event-staff-assignments.staged.json"), JSON.stringify(assignmentsFile, null, 2), "utf8");
  await writeFile(path.join(DATA_DIR, "campaign-materials-inventory.json"), JSON.stringify(buildDefaultCampaignMaterialsInventory(generatedAt), null, 2), "utf8");
  console.log(JSON.stringify({ ok: true, ...file.stats, out: "data/calendar-command-center/event-staffing-plans.staged.json" }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
