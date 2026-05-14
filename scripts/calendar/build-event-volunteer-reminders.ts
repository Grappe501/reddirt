import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Prisma } from "@prisma/client";

import { prisma } from "../../src/lib/db";
import { buildEventVolunteerReminders } from "../../src/lib/calendar/build-event-volunteer-reminders";
import type { EventCoveragePlansFile } from "../../src/lib/calendar/event-coverage-types";
import type { EventStaffingPlansFile } from "../../src/lib/calendar/event-staffing-types";
import type { EventVolunteerRemindersFile } from "../../src/lib/calendar/event-volunteer-reminder-types";
import { loadRedDirtEnv } from "../load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..", "..");
const DATA_DIR = path.join(REPO, "data/calendar-command-center");

loadRedDirtEnv(REPO);

type EventMeta = { campaignEventId: string; startAt: Date | null; locationName: string | null };

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(path.join(DATA_DIR, file), "utf8")) as T;
}

async function main() {
  const coverage = readJson<EventCoveragePlansFile>("event-coverage-plans.staged.json");
  const staffing = readJson<EventStaffingPlansFile>("event-staffing-plans.staged.json");
  const coverageByEvent = new Map(coverage.plans.map((p) => [p.campaignEventId, p]));
  const metaRows = await prisma.$queryRaw<EventMeta[]>(Prisma.sql`
    SELECT id AS "campaignEventId", "startAt", "locationName"
    FROM public."CampaignEvent"
  `);
  const metaByEvent = new Map(metaRows.map((m) => [m.campaignEventId, m]));
  const reminders = staffing.plans.flatMap((plan) => {
    const coveragePlan = coverageByEvent.get(plan.campaignEventId);
    if (!coveragePlan) return [];
    return buildEventVolunteerReminders(plan, coveragePlan, metaByEvent.get(plan.campaignEventId));
  });
  const file: EventVolunteerRemindersFile = {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: "event_staff_assignments",
    reminders,
  };
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(path.join(DATA_DIR, "event-volunteer-reminders.staged.json"), JSON.stringify(file, null, 2), "utf8");
  console.log(JSON.stringify({ ok: true, reminders: reminders.length, out: "data/calendar-command-center/event-volunteer-reminders.staged.json" }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
