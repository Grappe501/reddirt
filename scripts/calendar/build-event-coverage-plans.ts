import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Prisma } from "@prisma/client";

import { prisma } from "../../src/lib/db";
import { buildEventCoveragePlan } from "../../src/lib/calendar/build-event-coverage-plan";
import type { CampaignEventCoveragePlan, EventCoveragePlansFile } from "../../src/lib/calendar/event-coverage-types";
import { loadRedDirtEnv } from "../load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..", "..");
const OUT = path.join(REPO, "data/calendar-command-center/event-coverage-plans.staged.json");

loadRedDirtEnv(REPO);

type EventRow = {
  id: string;
  title: string;
  eventType: string | null;
  eventWorkflowState: string | null;
  status: string | null;
  county: string | null;
  city: string | null;
  locationName: string | null;
  startAt: Date | null;
  commsStateJson: unknown;
};

function stats(plans: CampaignEventCoveragePlan[]): EventCoveragePlansFile["stats"] {
  return {
    total: plans.length,
    needsLocalCoverage: plans.filter((p) => !p.coverageMode.startsWith("kelly_attends") && !["not_covering", "cancelled"].includes(p.status)).length,
    needsVolunteerLead: plans.filter((p) => p.volunteerLeadNeeded && !p.volunteerLeadName).length,
    needsTablePermission: plans.filter((p) => p.tableNeeded && p.tableStatus === "needs_permission").length,
    ready: plans.filter((p) => p.status === "ready" || p.status === "covered").length,
    notCovering: plans.filter((p) => p.status === "not_covering").length,
    materials: {
      pushCards: plans.reduce((sum, p) => sum + p.materials.pushCards, 0),
      fans: plans.reduce((sum, p) => sum + p.materials.fans, 0),
      shirts: plans.reduce((sum, p) => sum + p.shirtsNeeded, 0),
      brandedMints: plans.reduce((sum, p) => sum + p.materials.brandedMints, 0),
      fourFootTablecloths: plans.reduce((sum, p) => sum + p.materials.fourFootTablecloths, 0),
      pullUpBanners: plans.reduce((sum, p) => sum + p.materials.pullUpBanners, 0),
      signupSheets: plans.reduce((sum, p) => sum + (p.materials.signupSheets ?? 0), 0),
      clipboards: plans.reduce((sum, p) => sum + (p.materials.clipboards ?? 0), 0),
      pens: plans.reduce((sum, p) => sum + (p.materials.pens ?? 0), 0),
      qrCodeCards: plans.reduce((sum, p) => sum + (p.materials.qrCodeCards ?? 0), 0),
      yardSigns: plans.reduce((sum, p) => sum + (p.materials.yardSigns ?? 0), 0),
      voterRegistrationForms: plans.reduce((sum, p) => sum + (p.materials.voterRegistrationForms ?? 0), 0),
    },
  };
}

async function main() {
  const rows = await prisma.$queryRaw<EventRow[]>(Prisma.sql`
    SELECT
      e.id,
      e.title,
      e."eventType"::text AS "eventType",
      e."eventWorkflowState"::text AS "eventWorkflowState",
      e.status::text AS status,
      c.name AS county,
      NULL::text AS city,
      e."locationName",
      e."startAt",
      e."commsStateJson"
    FROM public."CampaignEvent" e
    LEFT JOIN public.counties c ON c.id::text = e."countyId"
    ORDER BY e."startAt" ASC NULLS LAST, e.title ASC
  `);
  const plans = rows.map(buildEventCoveragePlan);
  const file: EventCoveragePlansFile = {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: "campaign_event_db",
    stats: stats(plans),
    plans,
  };
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(file, null, 2), "utf8");
  console.log(JSON.stringify({ ok: true, ...file.stats, out: path.relative(REPO, OUT) }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
