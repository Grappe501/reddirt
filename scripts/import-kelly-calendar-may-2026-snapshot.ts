/**
 * One-time / repeatable import: May 1–2, 2026 events visible on Kelly Grappe’s Google Calendar
 * week view (Apr 26 – May 2) screenshot. Upserts by stable slug, publishes public-facing rows to
 * /campaign-calendar, creates CampaignManager tasks to fill TBDs. Does not cover May 3+ (not in source).
 *
 *   npx tsx scripts/import-kelly-calendar-may-2026-snapshot.ts
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CampaignEventStatus,
  CampaignEventType,
  CampaignEventVisibility,
  CampaignTaskPriority,
  CampaignTaskStatus,
  CampaignTaskType,
  EventWorkflowState,
} from "@prisma/client";
import { prisma } from "../src/lib/db";
import { loadRedDirtEnv } from "./load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

const TZ_NOTE = "America/Chicago (CDT in May)";

const TASK_PREFIX = "[May 2026 calendar import]";

type UpsertEvent = {
  slug: string;
  title: string;
  startAt: Date;
  endAt: Date;
  eventType: CampaignEventType;
  countySlug: string | null;
  locationName: string | null;
  address: string | null;
  publicSummary: string | null;
  description: string | null;
  internalSummary: string | null;
  /** If false, staff-only; still listed in /admin/events */
  publishToWebsite: boolean;
  notes: string | null;
};

const EVENTS: UpsertEvent[] = [
  {
    slug: "jacksonville-win-event-2026-04-30",
    title: "Jacksonville win event",
    // 6:00 PM – 8:00 PM CDT Apr 30, 2026 (week-of–Apr-26 Google Calendar view; reconcile if another view differs)
    startAt: new Date("2026-04-30T23:00:00.000Z"),
    endAt: new Date("2026-05-01T01:00:00.000Z"),
    eventType: CampaignEventType.APPEARANCE,
    countySlug: "pulaski-county",
    locationName: "Jacksonville, AR (venue TBD)",
    address: null,
    publicSummary:
      "Campaign appearance — exact venue, staging, and public talking points to be confirmed from Kelly’s master calendar and field lead.",
    description:
      "Imported from personal calendar (label: “Jacksonville win event”, Thu Apr 30 2026, 6–8pm Central).",
    internalSummary: "Source: Kelly Grappe Google Calendar snapshot (week of Apr 26 – May 2, 2026).",
    publishToWebsite: true,
    notes: "Confirm address, parking, and host organization before comms go out.",
  },
  {
    slug: "armadillo-festival-hamburg-2026-05-02",
    title: "Armadillo Festival — Hamburg (festival day)",
    // All day May 2 in Central (multi-day festival; calendar showed all-day on Sat May 2)
    startAt: new Date("2026-05-02T05:00:00.000Z"),
    endAt: new Date("2026-05-03T04:59:59.999Z"),
    eventType: CampaignEventType.FESTIVAL,
    countySlug: "ashley-county",
    locationName: "Hamburg, AR (festival site TBD)",
    address: "Hamburg, AR",
    publicSummary:
      "Regional festival day — see Ashley County / festival organizers for 2026 footprint. Campaign presence and schedule TBD.",
    description:
      "Calendar title: “Armadillo festival Hamburg from K”. Overlaps known Armadillo Festival date span (incl. May 2).",
    internalSummary: "Source: Kelly Grappe Google Calendar (all-day Sat May 2, 2026).",
    publishToWebsite: true,
    notes: "Reconcile with existing festival listing data and field plan.",
  },
  {
    slug: "cotter-trout-fest-evening-2026-05-02",
    title: "Cotter Trout Festival — evening",
    // 8:00 PM – 9:00 PM CDT May 2, 2026
    startAt: new Date("2026-05-03T01:00:00.000Z"),
    endAt: new Date("2026-05-03T02:00:00.000Z"),
    eventType: CampaignEventType.FESTIVAL,
    countySlug: "baxter-county",
    locationName: "Cotter, AR (venue TBD)",
    address: "Cotter, AR",
    publicSummary:
      "Evening block during Cotter Trout Festival week — which stage or neighborhood TBD. Confirm with host / chamber.",
    description:
      "Imported from calendar: “Cotter trout fest” 8:00–9:00pm Central May 2, 2026.",
    internalSummary: "Source: Kelly Grappe Google Calendar snapshot.",
    publishToWebsite: true,
    notes: "Festival is multi-day; this task ties to the specific 1h evening block on the personal calendar.",
  },
  {
    slug: "wff-calendar-hold-2026-05-01",
    title: "wff (calendar hold — confirm)",
    // 7:00 AM – 8:00 AM CDT May 1, 2026
    startAt: new Date("2026-05-01T12:00:00.000Z"),
    endAt: new Date("2026-05-01T13:00:00.000Z"),
    eventType: CampaignEventType.MEETING,
    countySlug: null,
    locationName: null,
    address: null,
    publicSummary: null,
    description: "Personal calendar label only — do not market until expanded.",
    internalSummary:
      "“wff” unknown abbreviation (possible weekly field / personal). Not published to the public campaign calendar until clarified.",
    publishToWebsite: false,
    notes: "Decode acronym, add county + venue if this becomes a public-facing commitment.",
  },
];

const STUB_COUNTIES: Array<{
  slug: string;
  fips: string;
  displayName: string;
  regionLabel: string;
  sortOrder: number;
}> = [
  {
    slug: "ashley-county",
    fips: "05001",
    displayName: "Ashley County",
    regionLabel: "South",
    sortOrder: 200,
  },
  {
    slug: "baxter-county",
    fips: "05005",
    displayName: "Baxter County",
    regionLabel: "North Central",
    sortOrder: 201,
  },
];

/** Ensures event counties exist when DB was seeded with only a demo subset. */
async function ensureStubCounties() {
  for (const s of STUB_COUNTIES) {
    await prisma.county.upsert({
      where: { slug: s.slug },
      create: {
        slug: s.slug,
        fips: s.fips,
        displayName: s.displayName,
        regionLabel: s.regionLabel,
        sortOrder: s.sortOrder,
        showOnStatewideMap: true,
        published: false,
      },
      update: { displayName: s.displayName, regionLabel: s.regionLabel },
    });
  }
}

async function countyIdFor(slug: string | null): Promise<string | null> {
  if (!slug) return null;
  const c = await prisma.county.findUnique({ where: { slug }, select: { id: true } });
  return c?.id ?? null;
}

async function ensureTask(
  eventId: string,
  title: string,
  description: string,
  dueAt: Date
): Promise<"created" | "exists"> {
  const existing = await prisma.campaignTask.findFirst({
    where: { eventId, title },
  });
  if (existing) return "exists";
  await prisma.campaignTask.create({
    data: {
      title,
      description,
      eventId,
      status: CampaignTaskStatus.TODO,
      taskType: CampaignTaskType.ADMIN,
      priority: CampaignTaskPriority.MEDIUM,
      dueAt,
    },
  });
  return "created";
}

async function ensureUmbrellaTask(): Promise<"created" | "exists"> {
  const title = `${TASK_PREFIX} Reconcile full May 2026 beyond May 2 (source was one week’s calendar view only)`;
  const existing = await prisma.campaignTask.findFirst({ where: { title } });
  if (existing) return "exists";
  const due = new Date("2026-04-30T12:00:00.000Z");
  await prisma.campaignTask.create({
    data: {
      title,
      description:
        "The import snapshot only covered Sun Apr 26 – Sat May 2, 2026. Scrub the rest of **May 2026** on the campaign master Google calendar and add or promote any events not yet in CampaignOS.",
      status: CampaignTaskStatus.TODO,
      taskType: CampaignTaskType.ADMIN,
      priority: CampaignTaskPriority.HIGH,
      dueAt: due,
    },
  });
  return "created";
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    // eslint-disable-next-line no-console
    console.error("DATABASE_URL required");
    process.exit(1);
  }

  await ensureStubCounties();

  const out: { slug: string; id: string; public: boolean; task: string }[] = [];

  for (const ev of EVENTS) {
    const countyId = await countyIdFor(ev.countySlug);
    if (ev.countySlug && !countyId) {
      // eslint-disable-next-line no-console
      console.warn(`County not found: ${ev.countySlug} — create county or import without county for`, ev.slug);
    }

    const published = ev.publishToWebsite;
    const row = await prisma.campaignEvent.upsert({
      where: { slug: ev.slug },
      create: {
        slug: ev.slug,
        title: ev.title,
        description: ev.description,
        eventType: ev.eventType,
        status: CampaignEventStatus.SCHEDULED,
        visibility: published ? CampaignEventVisibility.PUBLIC_STAFF : CampaignEventVisibility.INTERNAL,
        countyId: countyId ?? null,
        locationName: ev.locationName,
        address: ev.address,
        startAt: ev.startAt,
        endAt: ev.endAt,
        timezone: "America/Chicago",
        notes: ev.notes,
        eventWorkflowState: published ? EventWorkflowState.PUBLISHED : EventWorkflowState.APPROVED,
        isPublicOnWebsite: published,
        publicSummary: ev.publicSummary,
        internalSummary: ev.internalSummary,
        submittedForReviewAt: published ? new Date() : null,
        approvedAt: new Date(),
      },
      update: {
        title: ev.title,
        description: ev.description,
        eventType: ev.eventType,
        status: CampaignEventStatus.SCHEDULED,
        visibility: published ? CampaignEventVisibility.PUBLIC_STAFF : CampaignEventVisibility.INTERNAL,
        countyId: countyId ?? null,
        locationName: ev.locationName,
        address: ev.address,
        startAt: ev.startAt,
        endAt: ev.endAt,
        notes: ev.notes,
        eventWorkflowState: published ? EventWorkflowState.PUBLISHED : EventWorkflowState.APPROVED,
        isPublicOnWebsite: published,
        publicSummary: ev.publicSummary,
        internalSummary: ev.internalSummary,
      },
    });

    const taskTitle = `${TASK_PREFIX} Fill in venue, address, and public copy: ${ev.title}`;
    const taskBody = [
      `Time zone: ${TZ_NOTE}.`,
      ev.notes || "",
      "Import batch: May 1–2, 2026 (Kelly Grappe calendar snapshot).",
    ]
      .filter(Boolean)
      .join(" ");

    const taskDue = new Date(row.startAt.getTime() - 3 * 24 * 60 * 60 * 1000);
    const t = await ensureTask(row.id, taskTitle, taskBody, taskDue);
    out.push({ slug: ev.slug, id: row.id, public: published, task: t });
  }

  const umb = await ensureUmbrellaTask();

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ok: true, events: out, umbrellaTask: umb }, null, 2));
  await prisma.$disconnect();
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
