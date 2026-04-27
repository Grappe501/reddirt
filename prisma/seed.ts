/**
 * Dev / local seed: baseline rows so admin and orchestrator UIs have predictable defaults.
 * Safe to run multiple times (idempotent upserts).
 */
import {
  CalendarProvider,
  CalendarSourceType,
  CalendarSourceVisibility,
  CampaignEventStatus,
  CampaignEventVisibility,
  EventWorkflowState,
  CampaignTaskPriority,
  CampaignTaskType,
  ContentPlatform,
  CountyContentReviewStatus,
  PlatformConnectionStatus,
  PrismaClient,
  PublicDemographicsSource,
  VoterFileIngestStatus,
  WorkflowTemplateTrigger,
} from "@prisma/client";
import { getCampaignRegistrationBaselineUtc } from "../src/config/campaign-registration-baseline";
import { ARKANSAS_COUNTY_REGISTRY, regionMetaForId } from "../src/lib/county/arkansas-county-registry";
import { seedSlice4WorkflowTemplates } from "./seed-slice4-workflows";

const prisma = new PrismaClient();

const PLATFORM_DEFAULTS: { platform: ContentPlatform; accountName: string }[] = [
  { platform: ContentPlatform.SUBSTACK, accountName: "Substack (RSS)" },
  { platform: ContentPlatform.FACEBOOK, accountName: "Facebook Page" },
  { platform: ContentPlatform.INSTAGRAM, accountName: "Instagram" },
  { platform: ContentPlatform.YOUTUBE, accountName: "YouTube channel" },
];

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });

  await prisma.homepageConfig.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });

  for (const d of PLATFORM_DEFAULTS) {
    await prisma.platformConnection.upsert({
      where: { platform: d.platform },
      create: {
        platform: d.platform,
        status: PlatformConnectionStatus.INACTIVE,
        accountName: d.accountName,
        syncEnabled: false,
      },
      update: { accountName: d.accountName },
    });
  }

  const baseline = getCampaignRegistrationBaselineUtc();
  const demoCounties: Array<{
    slug: string;
    fips: string;
    displayName: string;
    region: string;
    eyebrow: string;
    intro: string;
    lead: { name: string; title: string };
  }> = [
    {
      slug: "pope-county",
      fips: "05115",
      displayName: "Pope County",
      region: "North Central",
      eyebrow: "Russellville, Atkins, and the River Valley",
      intro:
        "Pope County is the first fully wired pilot for county political profiles and the sister county coordination hub. Strong civic anchors and a clear path to field organizing.",
      lead: { name: "TBD", title: "Pope County lead" },
    },
    {
      slug: "pulaski-county",
      fips: "05119",
      displayName: "Pulaski County",
      region: "Central",
      eyebrow: "Little Rock and Central Arkansas",
      intro:
        "Pulaski is Arkansas’s most populous county. Early organizing here helps set the tone statewide.",
      lead: { name: "TBD", title: "Pulaski County lead" },
    },
    {
      slug: "saline-county",
      fips: "05125",
      displayName: "Saline County",
      region: "Central",
      eyebrow: "Benton, Bryant, and the I-30 corridor",
      intro: "A fast-growing corridor between Little Rock and Hot Springs. Good ground for house meetings and field programs.",
      lead: { name: "TBD", title: "Saline County lead" },
    },
    {
      slug: "washington-county",
      fips: "05143",
      displayName: "Washington County",
      region: "Northwest",
      eyebrow: "Fayetteville, Springdale, and NWA",
      intro: "The economic engine of Northwest Arkansas. Strong campus and business communities; partnership-driven organizing works here.",
      lead: { name: "TBD", title: "Washington County lead" },
    },
    {
      slug: "benton-county",
      fips: "05007",
      displayName: "Benton County",
      region: "Northwest",
      eyebrow: "Bentonville, Rogers, and NWA",
      intro: "One of the fastest-growing regions in the country. Deep volunteer networks and strong civic life.",
      lead: { name: "TBD", title: "Benton County lead" },
    },
  ];

  for (let i = 0; i < demoCounties.length; i++) {
    const c = demoCounties[i];
    const county = await prisma.county.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        fips: c.fips,
        displayName: c.displayName,
        regionLabel: c.region,
        sortOrder: i,
        heroEyebrow: c.eyebrow,
        heroIntro: c.intro,
        leadName: c.lead.name,
        leadTitle: c.lead.title,
        featuredEventSlugs: ["listening-session-little-rock"],
        showOnStatewideMap: true,
        published: true,
      },
      update: {
        fips: c.fips,
        displayName: c.displayName,
        regionLabel: c.region,
        heroEyebrow: c.eyebrow,
        heroIntro: c.intro,
        leadName: c.lead.name,
        leadTitle: c.lead.title,
        published: true,
        sortOrder: i,
      },
    });

    await prisma.countyCampaignStats.upsert({
      where: { countyId: county.id },
      create: {
        countyId: county.id,
        registrationGoal: 5000 + i * 500,
        newRegistrationsSinceBaseline: null,
        registrationBaselineDate: baseline,
        volunteerTarget: 200 + i * 20,
        volunteerCount: 12 + i * 3,
        campaignVisits: 2 + i,
        dataPipelineSource: "pending_voter_file_sync",
        reviewStatus: CountyContentReviewStatus.PENDING_REVIEW,
      },
      update: {
        registrationGoal: 5000 + i * 500,
        registrationBaselineDate: baseline,
        volunteerTarget: 200 + i * 20,
        volunteerCount: 12 + i * 3,
        campaignVisits: 2 + i,
        dataPipelineSource: "pending_voter_file_sync",
      },
    });

    await prisma.countyPublicDemographics.upsert({
      where: { countyId: county.id },
      create: {
        countyId: county.id,
        population: 400000 - i * 20000,
        votingAgePopulation: 300000 - i * 15000,
        medianHouseholdIncome: 52000 + i * 2000,
        povertyRatePercent: 12 + i * 0.5,
        bachelorsOrHigherPercent: 28 + i * 1.2,
        laborEmploymentNote: "Placeholders for demo. Replace with Census ACS or verified figures.",
        source: PublicDemographicsSource.CENSUS_ACS,
        sourceDetail: "ACS 5-year (demo) — not verified",
        asOfYear: 2022,
        reviewStatus: CountyContentReviewStatus.PENDING_REVIEW,
      },
      update: {
        sourceDetail: "ACS 5-year (demo) — not verified",
        asOfYear: 2022,
      },
    });
  }

  const seededSlugs = new Set((await prisma.county.findMany({ select: { slug: true } })).map((r) => r.slug));
  for (const reg of ARKANSAS_COUNTY_REGISTRY) {
    if (seededSlugs.has(reg.slug)) continue;
    const short = regionMetaForId(reg.regionId)?.shortLabel ?? null;
    await prisma.county.create({
      data: {
        slug: reg.slug,
        fips: reg.fips,
        displayName: reg.displayName,
        regionLabel: short,
        sortOrder: 200 + reg.sortOrder,
        showOnStatewideMap: true,
        published: true,
      },
    });
  }

  const demoFileHash = "seed:voter-snapshot-2026-04-15";
  const snap = await prisma.voterFileSnapshot.upsert({
    where: { sourceFileHash: demoFileHash },
    create: {
      fileAsOfDate: new Date("2026-04-15T00:00:00.000Z"),
      importedAt: new Date(),
      sourceFilename: "SOS_DEMO_VOTERFILE.txt",
      sourceFileHash: demoFileHash,
      status: VoterFileIngestStatus.COMPLETE,
      rowCountProcessed: 0,
      operatorNotes: "Demo snapshot for UI — replace with real import.",
    },
    update: { status: VoterFileIngestStatus.COMPLETE },
  });

  const allCounties = await prisma.county.findMany({ orderBy: { sortOrder: "asc" } });
  for (let i = 0; i < allCounties.length; i++) {
    const c = allCounties[i];
    const goal = 5000 + i * 500;
    const newSince = 120 + i * 11;
    const progress = goal > 0 ? Math.min(100, (newSince / goal) * 100) : null;
    const approxRegistered = 180_000 - i * 12_000;
    await prisma.countyVoterMetrics.upsert({
      where: {
        countyId_voterFileSnapshotId: { countyId: c.id, voterFileSnapshotId: snap.id },
      },
      create: {
        countyId: c.id,
        countySlug: c.slug,
        voterFileSnapshotId: snap.id,
        asOfDate: snap.fileAsOfDate,
        registrationBaselineDate: baseline,
        totalRegisteredCount: approxRegistered,
        newRegistrationsSinceBaseline: newSince,
        newRegistrationsSincePreviousSnapshot: i === 0 ? 45 : 12,
        droppedSincePreviousSnapshot: 3,
        netChangeSincePreviousSnapshot: (i === 0 ? 45 : 12) - 3,
        countyGoal: goal,
        progressPercent: progress,
        reviewStatus: CountyContentReviewStatus.PENDING_REVIEW,
      },
      update: {
        countySlug: c.slug,
        asOfDate: snap.fileAsOfDate,
        registrationBaselineDate: baseline,
        totalRegisteredCount: approxRegistered,
        newRegistrationsSinceBaseline: newSince,
        countyGoal: goal,
        progressPercent: progress,
      },
    });
    await prisma.countyCampaignStats.upsert({
      where: { countyId: c.id },
      create: {
        countyId: c.id,
        registrationGoal: goal,
        newRegistrationsSinceBaseline: newSince,
        registrationBaselineDate: baseline,
        volunteerTarget: 200 + i * 20,
        volunteerCount: 12 + i * 3,
        campaignVisits: 2 + i,
        dataPipelineSource: "voter_file_snapshot_seed",
        pipelineLastSyncAt: new Date(),
        pipelineError: null,
        reviewStatus: CountyContentReviewStatus.PENDING_REVIEW,
      },
      update: {
        newRegistrationsSinceBaseline: newSince,
        registrationBaselineDate: baseline,
        registrationGoal: goal,
        dataPipelineSource: "voter_file_snapshot_seed",
        pipelineLastSyncAt: new Date(),
        pipelineError: null,
      },
    });
  }

  // --- Operations: workflow templates (idempotent) ---
  const appearance = await prisma.workflowTemplate.upsert({
    where: { key: "candidate_appearance" },
    create: {
      key: "candidate_appearance",
      title: "Candidate appearance / rally prep",
      description: "Comms, field, and volunteer follow-through when a field event is scheduled.",
      triggerType: WorkflowTemplateTrigger.EVENT_CREATED,
      isActive: true,
      configJson: { eventTypes: ["APPEARANCE", "RALLY", "PRESS", "FUNDRAISER", "ORIENTATION"] },
    },
    update: {
      title: "Candidate appearance / rally prep",
      configJson: { eventTypes: ["APPEARANCE", "RALLY", "PRESS", "FUNDRAISER", "ORIENTATION"] },
    },
  });
  await prisma.workflowTemplateTask.deleteMany({ where: { workflowTemplateId: appearance.id } });
  await prisma.workflowTemplateTask.createMany({
    data: [
      {
        workflowTemplateId: appearance.id,
        taskKey: "comms_prep",
        titleTemplate: "Comms prep: talking points for {{event.title}}",
        descriptionTemplate: "Draft/confirm 3 bullets + photo plan before {{event.startAt}}.",
        offsetMinutes: -10080,
        roleTarget: "COMMS_DIRECTOR",
        taskType: CampaignTaskType.COMMS,
        priority: CampaignTaskPriority.HIGH,
        required: true,
      },
      {
        workflowTemplateId: appearance.id,
        taskKey: "field_signage",
        titleTemplate: "Field kit & signage: {{event.title}} @ {{event.locationName}}",
        descriptionTemplate: "Confirm wayfinding + backup printed materials for {{event.title}}.",
        offsetMinutes: -2880,
        roleTarget: "FIELD_DIRECTOR",
        taskType: CampaignTaskType.FIELD,
        priority: CampaignTaskPriority.MEDIUM,
        required: true,
      },
      {
        workflowTemplateId: appearance.id,
        taskKey: "rsvp_ask",
        titleTemplate: "Release RSVP / volunteer ask for {{event.title}}",
        descriptionTemplate: "Coordinate volunteer and supporter RSVP asks tied to the event.",
        offsetMinutes: -1440,
        roleTarget: "VOLUNTEER_COORDINATOR",
        taskType: CampaignTaskType.VOLUNTEER,
        priority: CampaignTaskPriority.MEDIUM,
        required: false,
      },
      {
        workflowTemplateId: appearance.id,
        taskKey: "day_of_capture",
        titleTemplate: "Day-of media capture: {{event.title}}",
        descriptionTemplate: "Assign photographer + social clips at {{event.locationName}}.",
        offsetMinutes: -120,
        roleTarget: "COMMS_DIRECTOR",
        taskType: CampaignTaskType.MEDIA,
        priority: CampaignTaskPriority.HIGH,
        required: true,
      },
    ],
  });

  const signupT = await prisma.workflowTemplate.upsert({
    where: { key: "event_signup" },
    create: {
      key: "event_signup",
      title: "Event signup follow-up",
      description: "Reminders and host tasks when someone registers for an event.",
      triggerType: WorkflowTemplateTrigger.EVENT_SIGNUP_CREATED,
      isActive: true,
      configJson: {},
    },
    update: { title: "Event signup follow-up" },
  });
  await prisma.workflowTemplateTask.deleteMany({ where: { workflowTemplateId: signupT.id } });
  await prisma.workflowTemplateTask.createMany({
    data: [
      {
        workflowTemplateId: signupT.id,
        taskKey: "confirm",
        titleTemplate: "Send confirmation: {{event.title}} registration",
        descriptionTemplate: "Send confirmation and calendar hold for this signup (due shortly after registration).",
        offsetMinutes: 5,
        roleTarget: "EVENT_LEAD",
        taskType: CampaignTaskType.FOLLOW_UP,
        priority: CampaignTaskPriority.MEDIUM,
        required: true,
      },
      {
        workflowTemplateId: signupT.id,
        taskKey: "remind",
        titleTemplate: "24h check-in: {{event.title}}",
        descriptionTemplate: "Text/email the registrant; event is at {{event.startAt}} at {{event.locationName}}.",
        offsetMinutes: 1500,
        roleTarget: "VOLUNTEER_COORDINATOR",
        taskType: CampaignTaskType.FOLLOW_UP,
        priority: CampaignTaskPriority.LOW,
        required: true,
      },
    ],
  });

  await prisma.workflowTemplate.upsert({
    where: { key: "media_mention" },
    create: {
      key: "media_mention",
      title: "Media mention response",
      description: "Clip, amplify, and assign county follow-up (trigger when inbound item is marked reviewed).",
      triggerType: WorkflowTemplateTrigger.MENTION_REVIEWED,
      isActive: true,
      configJson: {},
    },
    update: { title: "Media mention response" },
  });

  await seedSlice4WorkflowTemplates(prisma);

  const slice5Sources: Array<{
    label: string;
    displayName: string;
    sourceType: CalendarSourceType;
    isPublicFacing: boolean;
    externalCalendarId: string;
    color: string;
    syncEnabled: boolean;
  }> = [
    {
      label: "GCal — primary (OAuth)",
      displayName: "Campaign master / internal",
      sourceType: CalendarSourceType.CAMPAIGN_MASTER,
      isPublicFacing: false,
      externalCalendarId: "primary",
      color: "#1a73e8",
      syncEnabled: true,
    },
    {
      label: "S5 — Candidate public (set calendar id)",
      displayName: "Candidate public appearances",
      sourceType: CalendarSourceType.CANDIDATE_PUBLIC_APPEARANCES,
      isPublicFacing: true,
      externalCalendarId: "configure-candidate-public-calendar-id",
      color: "#c5221f",
      syncEnabled: false,
    },
    {
      label: "S5 — Travel & logistics (set id)",
      displayName: "Travel / logistics",
      sourceType: CalendarSourceType.TRAVEL_LOGISTICS,
      isPublicFacing: false,
      externalCalendarId: "configure-travel-calendar-id",
      color: "#f9ab00",
      syncEnabled: false,
    },
    {
      label: "S5 — Internal staff (set id)",
      displayName: "Internal staff planning",
      sourceType: CalendarSourceType.INTERNAL_STAFF_PLANNING,
      isPublicFacing: false,
      externalCalendarId: "configure-internal-staff-calendar-id",
      color: "#5f6368",
      syncEnabled: false,
    },
    {
      label: "S5 — Content & media (set id)",
      displayName: "Content / media",
      sourceType: CalendarSourceType.CONTENT_MEDIA,
      isPublicFacing: false,
      externalCalendarId: "configure-content-media-calendar-id",
      color: "#34a853",
      syncEnabled: false,
    },
    {
      label: "S5 — Personal overlay (set id)",
      displayName: "Personal overlay (permitted)",
      sourceType: CalendarSourceType.PERSONAL_OVERLAY,
      isPublicFacing: false,
      externalCalendarId: "configure-personal-calendar-id",
      color: "#9334e6",
      syncEnabled: false,
    },
  ];
  for (const s of slice5Sources) {
    const ex =
      (await prisma.calendarSource.findFirst({ where: { label: s.label } })) ||
      (s.externalCalendarId === "primary"
        ? await prisma.calendarSource.findFirst({ where: { externalCalendarId: "primary" } })
        : null);
    if (ex) {
      await prisma.calendarSource.update({
        where: { id: ex.id },
        data: {
          label: s.label,
          displayName: s.displayName,
          sourceType: s.sourceType,
          isPublicFacing: s.isPublicFacing,
          color: s.color,
          ...(s.externalCalendarId === "primary" ? {} : { externalCalendarId: s.externalCalendarId }),
        },
      });
    } else {
      await prisma.calendarSource.create({
        data: {
          label: s.label,
          displayName: s.displayName,
          sourceType: s.sourceType,
          isPublicFacing: s.isPublicFacing,
          provider: CalendarProvider.GOOGLE,
          externalCalendarId: s.externalCalendarId,
          visibility: s.isPublicFacing ? CalendarSourceVisibility.PUBLIC_CONNECTOR : CalendarSourceVisibility.STAFF,
          color: s.color,
          syncEnabled: s.syncEnabled,
        },
      });
    }
  }

  // Backfill workflow for existing events created before Calendar HQ (keep scheduled items usable).
  await prisma.campaignEvent.updateMany({
    where: {
      eventWorkflowState: EventWorkflowState.DRAFT,
      status: { in: [CampaignEventStatus.SCHEDULED, CampaignEventStatus.IN_PROGRESS] },
    },
    data: { eventWorkflowState: EventWorkflowState.APPROVED },
  });
  await prisma.campaignEvent.updateMany({
    where: {
      eventWorkflowState: { in: [EventWorkflowState.APPROVED, EventWorkflowState.PUBLISHED] },
      visibility: CampaignEventVisibility.PUBLIC_STAFF,
    },
    data: { isPublicOnWebsite: true, eventWorkflowState: EventWorkflowState.PUBLISHED },
  });

  console.log(
    "Seed complete: siteSettings, homepageConfig, platformConnection, County + voter file demo rows + workflow templates, Slice 4 + Slice 5 calendar sources."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
