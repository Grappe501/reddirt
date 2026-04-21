/**
 * Dev / local seed: baseline rows so admin and orchestrator UIs have predictable defaults.
 * Safe to run multiple times (idempotent upserts).
 */
import {
  ContentPlatform,
  CountyContentReviewStatus,
  PlatformConnectionStatus,
  PrismaClient,
  PublicDemographicsSource,
  VoterFileIngestStatus,
} from "@prisma/client";
import { getCampaignRegistrationBaselineUtc } from "../src/config/campaign-registration-baseline";

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
    await prisma.countyCampaignStats.update({
      where: { countyId: c.id },
      data: {
        newRegistrationsSinceBaseline: newSince,
        registrationBaselineDate: baseline,
        dataPipelineSource: "voter_file_snapshot_seed",
        pipelineLastSyncAt: new Date(),
        pipelineError: null,
      },
    });
  }

  console.log("Seed complete: siteSettings, homepageConfig, platformConnection, County + voter file demo rows.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
