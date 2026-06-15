/**
 * PHASE 12 — Motion & Storytelling Engine
 *
 * The Arkansas Presence Strategy — visible statewide motion, not social media volume.
 * No vote models. No new strategy architecture.
 *
 * Usage: npm run campaign-brain:motion:build
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_COUNTY_REGISTRY } from "../../src/lib/county/arkansas-county-registry";
import { BRAIN_DATA, BRAIN_ROOT, readJson } from "./lib/inputs";
import type {
  ArkansasPresenceCounty,
  MotionMetrics,
  PresenceStop,
  PresenceStopsFile,
  StoryCategoryId,
} from "./lib/motion-presence-types";

const MOTION = path.join(BRAIN_ROOT, "motion-and-storytelling");
const ARCHIVE_DIR = path.join(MOTION, "county-visit-archive");
const SOCIAL = path.join(BRAIN_ROOT, "social-media");
const STOPS_FILE = path.join(BRAIN_DATA, "presence-stops.json");

const STORY_CATEGORIES: Array<{ id: StoryCategoryId; label: string; goal: number }> = [
  { id: "local_business", label: "Local Business Spotlight", goal: 200 },
  { id: "teacher", label: "Teacher Spotlight", goal: 75 },
  { id: "student", label: "Student Spotlight", goal: 50 },
  { id: "veteran", label: "Veteran Spotlight", goal: 75 },
  { id: "volunteer", label: "Volunteer Spotlight", goal: 100 },
  { id: "faith_leader", label: "Faith Leader Spotlight", goal: 75 },
  { id: "community_organization", label: "Community Organization Spotlight", goal: 150 },
  { id: "arkansas_success", label: "Arkansas Success Story", goal: 150 },
  { id: "arkansas_challenge", label: "Arkansas Challenge Story", goal: 100 },
];

const LEGACY_CATEGORY_MAP: Record<string, StoryCategoryId> = {
  arkansas_story: "community_organization",
  community_spotlight: "community_organization",
  arkansas_problem: "arkansas_challenge",
  arkansas_hope: "arkansas_success",
};

const CONTENT_PYRAMID = [
  { level: 1, label: "15-second vertical video", timing: "Same day", key: "verticalVideo" as const },
  { level: 2, label: "Photo carousel", timing: "Same day", key: "photoCarousel" as const },
  { level: 3, label: "Local spotlight story", timing: "Next day", key: "localStory" as const },
  { level: 4, label: "Substack article", timing: "Within week", key: "substack" as const },
  { level: 5, label: "Email recap", timing: "Weekly", key: "emailRecap" as const },
];

const STORY_WORKFLOW = [
  "Campaign Brain",
  "Mobilize",
  "Event",
  "Content Capture",
  "Story Publication",
  "Email",
  "Social",
  "Community Sharing",
  "Volunteer Recruitment",
];

const WEEKLY_CADENCE = [
  { day: "Monday", activity: "Live stop — vertical video same day" },
  { day: "Tuesday", activity: "Story from Monday — local angle" },
  { day: "Wednesday", activity: "Another angle from Monday stop" },
  { day: "Thursday", activity: "Local business spotlight" },
  { day: "Friday", activity: "Weekend event teaser" },
  { day: "Saturday", activity: "Live event — carousel + clip" },
  { day: "Sunday", activity: "Weekly recap email + Substack if ready" },
];

const COUNTIES_TOTAL = ARKANSAS_COUNTY_REGISTRY.length;

function normalizeCategory(raw?: string): StoryCategoryId {
  if (!raw) return "community_organization";
  if (raw in LEGACY_CATEGORY_MAP) return LEGACY_CATEGORY_MAP[raw]!;
  if (STORY_CATEGORIES.some((c) => c.id === raw)) return raw as StoryCategoryId;
  return "community_organization";
}

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T12:00:00`);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86_400_000));
}

function loadStops(): PresenceStop[] {
  if (!existsSync(STOPS_FILE)) {
    writeFileSync(
      STOPS_FILE,
      JSON.stringify(
        {
          version: 1,
          note: "Field log — one row per stop. npm run campaign-brain:motion:build → motion-and-storytelling/",
          stops: [],
        },
        null,
        2,
      ),
      "utf8",
    );
    return [];
  }
  const raw = readJson<PresenceStopsFile>(STOPS_FILE);
  return raw?.stops ?? [];
}

function aggregateMetrics(stops: PresenceStop[]): MotionMetrics {
  const counties = new Set<string>();
  const cities = new Set<string>();
  const countiesWithStories = new Set<string>();
  const citiesWithStories = new Set<string>();
  let miles = 0;
  let pyramidSlots = 0;
  let pyramidDone = 0;

  let storiesPublished = 0;
  let storiesPending = 0;
  let storiesShared = 0;
  let substackPublished = 0;
  let videosPublished = 0;
  let socialPosts = 0;
  let localBusinesses = 0;
  let churches = 0;
  let schools = 0;
  let faithOrgs = 0;
  let clerkOffices = 0;
  let festivals = 0;
  let sports = 0;
  let mediaMentions = 0;
  let peopleSpotlighted = 0;

  for (const stop of stops) {
    if (stop.county) counties.add(stop.county);
    if (stop.city) cities.add(`${stop.city}|${stop.county}`);
    miles += stop.milesFromPrevious ?? 0;

    const published = stop.storyPublished || stop.substackPublished;
    if (published) {
      storiesPublished++;
      if (stop.county) countiesWithStories.add(stop.county);
      if (stop.city) citiesWithStories.add(`${stop.city}|${stop.county}`);
    } else {
      storiesPending++;
    }

    storiesShared += stop.storiesShared ?? (stop.socialPostsPublished > 0 ? 1 : 0);
    if (stop.substackPublished) substackPublished++;
    if (stop.video || stop.contentPyramid?.verticalVideo) videosPublished++;
    socialPosts += stop.socialPostsPublished ?? 0;
    if (stop.mediaCoverage) mediaMentions++;

    const cat = normalizeCategory(stop.storyCategory);
    if (cat === "local_business" || stop.type === "business") localBusinesses++;
    if (stop.type === "church") {
      churches++;
      faithOrgs++;
    }
    if (stop.type === "school") schools++;
    if (stop.type === "clerk_office") clerkOffices++;
    if (stop.type === "festival" || stop.type === "county_fair") festivals++;
    if (stop.type === "sports") sports++;
    if (["teacher", "student", "veteran", "volunteer", "faith_leader"].includes(cat)) {
      peopleSpotlighted++;
    }

    const p = stop.contentPyramid;
    if (p) {
      for (const key of ["verticalVideo", "photoCarousel", "localStory", "substack", "emailRecap"] as const) {
        pyramidSlots++;
        if (p[key]) pyramidDone++;
      }
    }
  }

  const contentPyramidCompletionPct =
    pyramidSlots > 0 ? Math.round((pyramidDone / pyramidSlots) * 1000) / 10 : 0;

  const arkansasPresenceScore = Math.round(
    (counties.size / COUNTIES_TOTAL) * 40 +
      Math.min(cities.size / 150, 1) * 20 +
      Math.min(stops.length / 100, 1) * 25 +
      Math.min(miles / 10_000, 1) * 15,
  );

  const septemberPersuasionReadiness = Math.round(
    (countiesWithStories.size / COUNTIES_TOTAL) * 25 +
      Math.min(videosPublished / 50, 1) * 15 +
      Math.min(storiesPublished / 100, 1) * 25 +
      Math.min(substackPublished / 30, 1) * 10 +
      Math.min(storiesShared / 50, 1) * 10 +
      arkansasPresenceScore * 0.15,
  );

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    countiesVisited: counties.size,
    countiesTotal: COUNTIES_TOTAL,
    citiesVisited: cities.size,
    stopsCompleted: stops.length,
    milesTraveled: Math.round(miles),
    eventsAttended: stops.length,
    storiesPublished,
    storiesPending,
    storiesShared,
    countiesWithStories: countiesWithStories.size,
    citiesWithStories: citiesWithStories.size,
    substackPublished,
    videosPublished,
    socialPostsPublished: socialPosts,
    localBusinessesHighlighted: localBusinesses,
    churchesHighlighted: churches,
    schoolsHighlighted: schools,
    faithOrganizationsVisited: faithOrgs,
    clerkOfficesVisited: clerkOffices,
    festivalsAttended: festivals,
    sportsEventsAttended: sports,
    mediaMentions,
    peopleSpotlighted,
    contentPyramidCompletionPct,
    arkansasPresenceScore,
    septemberPersuasionReadiness,
  };
}

function buildArkansasPresenceMap(stops: PresenceStop[]): ArkansasPresenceCounty[] {
  const byCounty = new Map<
    string,
    { stops: number; lastDate: string | null; stories: number }
  >();
  for (const reg of ARKANSAS_COUNTY_REGISTRY) {
    byCounty.set(reg.displayName, { stops: 0, lastDate: null, stories: 0 });
  }
  for (const stop of stops) {
    const row = byCounty.get(stop.county);
    if (!row) continue;
    row.stops++;
    if (stop.storyPublished || stop.substackPublished) row.stories++;
    if (!row.lastDate || stop.date > row.lastDate) row.lastDate = stop.date;
  }

  return ARKANSAS_COUNTY_REGISTRY.map((reg) => {
    const row = byCounty.get(reg.displayName)!;
    let coverageStatus: ArkansasPresenceCounty["coverageStatus"] = "not_visited";
    if (row.stories > 0) coverageStatus = "story_published";
    else if (row.stops > 0) coverageStatus = "visited";

    let relationshipStatus: ArkansasPresenceCounty["relationshipStatus"] = "none";
    if (row.stops >= 2 || row.stories > 0) relationshipStatus = "established";
    else if (row.stops === 1) relationshipStatus = "building";

    return {
      county: reg.displayName,
      slug: reg.slug,
      visitCount: row.stops,
      lastVisitDate: row.lastDate,
      daysSinceLastVisit: daysSince(row.lastDate),
      coverageStatus,
      relationshipStatus,
      storiesPublished: row.stories,
    };
  });
}

function buildCountyMapForElection(presenceMap: ArkansasPresenceCounty[]) {
  return presenceMap.map((c) => ({
    county: c.county,
    visited: c.visitCount > 0,
    stops: c.visitCount,
    lastDate: c.lastVisitDate,
    daysSinceLastVisit: c.daysSinceLastVisit,
    coverageStatus: c.coverageStatus,
    relationshipStatus: c.relationshipStatus,
  }));
}

function buildStoryPipelineStats(stops: PresenceStop[]) {
  const byCounty: Record<string, { pending: number; published: number; shared: number }> = {};
  for (const stop of stops) {
    const key = stop.county || "Unknown";
    if (!byCounty[key]) byCounty[key] = { pending: 0, published: 0, shared: 0 };
    if (stop.storyPublished || stop.substackPublished) byCounty[key].published++;
    else byCounty[key].pending++;
    if ((stop.storiesShared ?? 0) > 0 || stop.socialPostsPublished > 0) byCounty[key].shared++;
  }
  return {
    pending: stops.filter((s) => !s.storyPublished && !s.substackPublished).length,
    published: stops.filter((s) => s.storyPublished || s.substackPublished).length,
    shared: stops.filter((s) => (s.storiesShared ?? 0) > 0 || s.socialPostsPublished > 0).length,
    byCounty: Object.entries(byCounty)
      .map(([county, v]) => ({ county, ...v }))
      .sort((a, b) => b.published - a.published),
  };
}

function writeHub(metrics: MotionMetrics) {
  mkdirSync(MOTION, { recursive: true });
  writeFileSync(
    path.join(MOTION, "PHASE-12-MOTION-STORYTELLING-ENGINE.md"),
    `# Phase 12 — Motion & Storytelling Engine

> **The Arkansas Presence Strategy** · MOTION = MOMENTUM

Updated: ${metrics.generatedAt.slice(0, 10)}

## Mission

Build visibility, storytelling, and presence systems that make the campaign appear **active, growing, and connected** to communities across Arkansas every day.

The objective is not social media. The objective is **visible statewide motion**.

By Election Day, when someone asks *"Has Kelly been to my area?"* the answer should almost always be **yes**.

---

## Headline metrics

| Metric | Current |
| ------ | ------: |
| Arkansas Presence Score | **${metrics.arkansasPresenceScore}%** |
| September Readiness | **${metrics.septemberPersuasionReadiness}%** |
| Counties covered | **${metrics.countiesVisited} / ${metrics.countiesTotal}** |
| Cities covered | ${metrics.citiesVisited} |
| Total stops | ${metrics.stopsCompleted} |
| Stories published | ${metrics.storiesPublished} (${metrics.storiesPending} pending) |

---

## Objectives (10 systems)

| # | System | Output |
| - | ------ | ------ |
| 1 | Arkansas Presence Tracker | [\`presence-dashboard.md\`](./presence-dashboard.md) |
| 2 | Arkansas Presence Map | [\`arkansas-presence-map.json\`](../../../data/campaign-brain/arkansas-presence-map.json) |
| 3 | County Visit Archive | [\`county-visit-archive/\`](./county-visit-archive/) |
| 4 | Story Pipeline | [\`story-pipeline-dashboard.md\`](./story-pipeline-dashboard.md) |
| 5 | Community Story Categories | [\`community-story-categories.md\`](./community-story-categories.md) |
| 6 | Social Media Resume | [\`social-media-resume.md\`](./social-media-resume.md) |
| 7 | Content Inventory | [\`content-library-dashboard.md\`](./content-library-dashboard.md) |
| 8 | Story-First Event Workflow | [\`story-first-event-workflow.md\`](./story-first-event-workflow.md) |
| 9 | Local Algorithm Strategy | [\`local-algorithm-playbook.md\`](./local-algorithm-playbook.md) |
| 10 | September Readiness | [\`september-readiness-dashboard.md\`](./september-readiness-dashboard.md) |

Election plan tab: **Motion & Storytelling** → \`/election-plan\`

---

## Build

\`\`\`bash
npm run campaign-brain:motion:build
npm run campaign-brain:build
npm run election-plan:build
\`\`\`

Field input: [\`presence-stops.json\`](../../../data/campaign-brain/presence-stops.json)
`,
    "utf8",
  );
}

function writePresenceDashboard(metrics: MotionMetrics, presenceMap: ArkansasPresenceCounty[]) {
  const stale = presenceMap
    .filter((c) => c.visitCount > 0 && (c.daysSinceLastVisit ?? 999) > 90)
    .slice(0, 15);

  writeFileSync(
    path.join(MOTION, "presence-dashboard.md"),
    `# Arkansas Presence Dashboard

Updated: ${metrics.generatedAt.slice(0, 10)}

## Metrics

| Metric | Value |
| ------ | ----: |
| **Arkansas Presence Score** | ${metrics.arkansasPresenceScore}% |
| Counties covered | ${metrics.countiesVisited} / ${metrics.countiesTotal} |
| Cities covered | ${metrics.citiesVisited} |
| Total stops | ${metrics.stopsCompleted} |
| Miles traveled | ${metrics.milesTraveled.toLocaleString()} |
| Events attended | ${metrics.eventsAttended} |
| Local businesses visited | ${metrics.localBusinessesHighlighted} |
| Faith organizations visited | ${metrics.faithOrganizationsVisited} |
| County clerk offices visited | ${metrics.clerkOfficesVisited} |
| Schools visited | ${metrics.schoolsHighlighted} |
| Festivals attended | ${metrics.festivalsAttended} |
| Sports events attended | ${metrics.sportsEventsAttended} |

## Days since last visit (counties with 90+ days)

${stale.length ? stale.map((c) => `- **${c.county}** — ${c.daysSinceLastVisit} days (last: ${c.lastVisitDate})`).join("\n") : "_No stale counties yet — or no visits logged._"}

Data: [\`arkansas-presence-map.json\`](../../../data/campaign-brain/arkansas-presence-map.json)
`,
    "utf8",
  );
}

function writeArkansasPresenceMapJson(presenceMap: ArkansasPresenceCounty[], metrics: MotionMetrics) {
  writeFileSync(
    path.join(BRAIN_DATA, "arkansas-presence-map.json"),
    JSON.stringify(
      {
        version: 1,
        generatedAt: metrics.generatedAt,
        arkansasPresenceScore: metrics.arkansasPresenceScore,
        countiesTotal: COUNTIES_TOTAL,
        counties: presenceMap,
      },
      null,
      2,
    ),
    "utf8",
  );
}

function writeCountyVisitArchive(stops: PresenceStop[], countyMap: ReturnType<typeof buildCountyMapForElection>) {
  mkdirSync(ARCHIVE_DIR, { recursive: true });

  const visits = stops.map((s) => ({
    id: s.id,
    date: s.date,
    county: s.county,
    city: s.city,
    event: s.location,
    type: s.type,
    photos: s.photos,
    videos: s.video,
    storyLink: s.storyLink ?? null,
    mobilizeLink: s.mobilizeLink ?? null,
    attendanceEstimate: s.attendanceEstimate ?? null,
    storyPublished: s.storyPublished,
    substackPublished: s.substackPublished,
  }));

  for (const visit of visits) {
    writeFileSync(path.join(ARCHIVE_DIR, `${visit.id}.json`), JSON.stringify(visit, null, 2), "utf8");
  }

  writeFileSync(
    path.join(ARCHIVE_DIR, "index.json"),
    JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), visits }, null, 2),
    "utf8",
  );

  writeFileSync(
    path.join(BRAIN_DATA, "county-visit-archive.json"),
    JSON.stringify(
      { version: 1, generatedAt: new Date().toISOString(), counties: countyMap, stops: visits },
      null,
      2,
    ),
    "utf8",
  );

  writeFileSync(
    path.join(MOTION, "county-visit-archive.md"),
    `# County Visit Archive

Permanent public record of campaign activity.

**${countyMap.filter((c) => c.visited).length} / ${COUNTIES_TOTAL}** counties · **${visits.length}** visits logged.

Each visit: date · county · city · event · photos · videos · story link · Mobilize link · attendance.

Folder: [\`county-visit-archive/\`](./county-visit-archive/) · Index: [\`index.json\`](./county-visit-archive/index.json)
`,
    "utf8",
  );
}

function writeStoryPipelineDashboard(stops: PresenceStop[], pipelineStats: ReturnType<typeof buildStoryPipelineStats>) {
  writeFileSync(
    path.join(BRAIN_DATA, "story-pipeline.json"),
    JSON.stringify(
      {
        version: 1,
        generatedAt: new Date().toISOString(),
        workflow: STORY_WORKFLOW,
        pyramid: CONTENT_PYRAMID,
        cadence: WEEKLY_CADENCE,
        categories: STORY_CATEGORIES,
        stats: pipelineStats,
      },
      null,
      2,
    ),
    "utf8",
  );

  writeFileSync(
    path.join(MOTION, "story-pipeline-dashboard.md"),
    `# Story Pipeline Dashboard

## Workflow (every stop)

${STORY_WORKFLOW.map((s, i) => (i < STORY_WORKFLOW.length - 1 ? `${s} →` : s)).join(" ")}

## Pipeline status

| Metric | Count |
| ------ | ----: |
| Stories pending | ${pipelineStats.pending} |
| Stories published | ${pipelineStats.published} |
| Stories shared | ${pipelineStats.shared} |

## By county

${pipelineStats.byCounty.length ? pipelineStats.byCounty.map((c) => `- **${c.county}** — ${c.published} published · ${c.pending} pending · ${c.shared} shared`).join("\n") : "_No stops logged._"}

## Content pyramid

| Level | Asset | Timing |
| ----- | ----- | ------ |
${CONTENT_PYRAMID.map((l) => `| ${l.level} | ${l.label} | ${l.timing} |`).join("\n")}
`,
    "utf8",
  );
}

function writeCommunityStoryCategories(stops: PresenceStop[]) {
  const counts = STORY_CATEGORIES.map((c) => ({
    ...c,
    count: stops.filter((s) => normalizeCategory(s.storyCategory) === c.id).length,
  }));

  writeFileSync(
    path.join(MOTION, "community-story-categories.md"),
    `# Community Story Categories

Templates — post **stories**, not "Kelly attended event."

${counts.map((c) => `## ${c.label}\n\n**${c.count} / ${c.goal}** · Category id: \`${c.id}\`\n`).join("\n")}

Set \`storyCategory\` on each stop in [\`presence-stops.json\`](../../../data/campaign-brain/presence-stops.json).
`,
    "utf8",
  );
}

function writeSocialMediaResume(metrics: MotionMetrics, stops: PresenceStop[]) {
  const resume = {
    version: 1,
    generatedAt: metrics.generatedAt,
    goal: "1000 Arkansas Stories",
    metrics,
    storyCategories: STORY_CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      count: stops.filter((s) => normalizeCategory(s.storyCategory) === c.id).length,
      goal: c.goal,
    })),
  };

  writeFileSync(path.join(BRAIN_DATA, "social-media-resume.json"), JSON.stringify(resume, null, 2), "utf8");
  writeFileSync(path.join(BRAIN_DATA, "motion-metrics.json"), JSON.stringify(metrics, null, 2), "utf8");

  writeFileSync(
    path.join(MOTION, "social-media-resume.md"),
    `# Social Media Resume

> Leadership view — is the campaign's **public resume** growing?

Updated: ${metrics.generatedAt.slice(0, 10)}

| Metric | Count |
| ------ | ----: |
| Counties represented | **${metrics.countiesVisited} / ${metrics.countiesTotal}** |
| Cities represented | ${metrics.citiesVisited} |
| Stories published | ${metrics.storiesPublished} |
| Videos published | ${metrics.videosPublished} |
| Businesses highlighted | ${metrics.localBusinessesHighlighted} |
| Churches highlighted | ${metrics.churchesHighlighted} |
| Schools highlighted | ${metrics.schoolsHighlighted} |
| People spotlighted | ${metrics.peopleSpotlighted} |
| Media mentions | ${metrics.mediaMentions} |
| Substack posts | ${metrics.substackPublished} |

Also: [\`../social-media/social-media-resume-dashboard.md\`](../social-media/social-media-resume-dashboard.md)
`,
    "utf8",
  );

  mkdirSync(SOCIAL, { recursive: true });
  writeFileSync(
    path.join(SOCIAL, "social-media-resume-dashboard.md"),
    `# Social Media Resume Dashboard

Updated: ${metrics.generatedAt.slice(0, 10)} · Goal: **1000 Arkansas Stories**

| Metric | Count |
| ------ | ----: |
| Counties represented | **${metrics.countiesVisited} / ${metrics.countiesTotal}** |
| Cities represented | ${metrics.citiesVisited} |
| Stories published | ${metrics.storiesPublished} |
| Videos published | ${metrics.videosPublished} |
| Substack posts | ${metrics.substackPublished} |
| Businesses highlighted | ${metrics.localBusinessesHighlighted} |
| Churches highlighted | ${metrics.churchesHighlighted} |
| Schools highlighted | ${metrics.schoolsHighlighted} |
| People spotlighted | ${metrics.peopleSpotlighted} |
| Media mentions | ${metrics.mediaMentions} |

## Categories

${resume.storyCategories.map((c) => `- **${c.label}**: ${c.count} / ${c.goal}`).join("\n")}
`,
    "utf8",
  );
}

function writeContentLibrary(stops: PresenceStop[]) {
  const inventory = {
    verticalVideos: stops.filter((s) => s.video || s.contentPyramid?.verticalVideo).length,
    photos: stops.filter((s) => s.photos || s.contentPyramid?.photoCarousel).length,
    reels: stops.filter((s) => s.video).length,
    substackArticles: stops.filter((s) => s.substackPublished || s.contentPyramid?.substack).length,
    emailStories: stops.filter((s) => s.contentPyramid?.emailRecap).length,
    pressMentions: stops.filter((s) => s.mediaCoverage).length,
    localStories: stops.filter((s) => s.storyPublished || s.contentPyramid?.localStory).length,
  };

  writeFileSync(
    path.join(BRAIN_DATA, "content-inventory.json"),
    JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), inventory }, null, 2),
    "utf8",
  );

  writeFileSync(
    path.join(MOTION, "content-library-dashboard.md"),
    `# Content Library Dashboard

Never run out of content — track all media assets.

| Asset type | Count |
| ---------- | ----: |
| Short vertical videos | ${inventory.verticalVideos} |
| Photos / carousels | ${inventory.photos} |
| Reels | ${inventory.reels} |
| Local spotlight stories | ${inventory.localStories} |
| Substack articles | ${inventory.substackArticles} |
| Email stories | ${inventory.emailStories} |
| Press mentions | ${inventory.pressMentions} |

Data: [\`content-inventory.json\`](../../../data/campaign-brain/content-inventory.json)
`,
    "utf8",
  );
}

function writeStoryFirstEventWorkflow() {
  writeFileSync(
    path.join(MOTION, "story-first-event-workflow.md"),
    `# Story-First Event Workflow

${STORY_WORKFLOW.map((s, i) => `${i + 1}. **${s}**`).join("\n")}

## Detail

1. **Campaign Brain** — event verified, county notified
2. **Mobilize** — event published, volunteers RSVP
3. **Event** — Kelly shows up, listens, builds relationship
4. **Content Capture** — vertical video + photos same day
5. **Story Publication** — local spotlight next day · Substack within week
6. **Email** — weekly recap includes stop
7. **Social** — carousel, clip, community tags
8. **Community Sharing** — local people share their own story
9. **Volunteer Recruitment** — attendees → Power of 5 · strike team

See Phase 11: [\`../people-power/mobilize/mobilize-event-framework.md\`](../people-power/mobilize/mobilize-event-framework.md)
`,
    "utf8",
  );
}

function writeLocalAlgorithmPlaybook() {
  writeFileSync(
    path.join(MOTION, "local-algorithm-playbook.md"),
    `# Local Algorithm Playbook

## Objective

Use community stories to trigger **local sharing**. The campaign becomes discoverable through community pride — not paid reach.

## Focus content on

- Local people (teachers, veterans, volunteers)
- Local businesses (restaurants, farms, shops)
- Local organizations (churches, clubs, NAACP, Extension Homemakers)
- Local schools
- Local events (fairs, festivals, games)

## Tactics

1. Tag local accounts — business, school, organization
2. Lead with **their** story, Kelly second
3. Use geotags and county hashtags sparingly but consistently
4. Encourage subjects to share to their networks
5. Repost community shares (with permission)

## Rule

If the post could run in any state, it is not local enough.
`,
    "utf8",
  );
}

function writeSeptemberReadinessDashboard(metrics: MotionMetrics) {
  writeFileSync(
    path.join(MOTION, "september-readiness-dashboard.md"),
    `# September Readiness Dashboard

**Score: ${metrics.septemberPersuasionReadiness}%**

> If a voter starts paying attention in September, will they see evidence that Kelly has been everywhere?

## Factors tracked

| Factor | Current |
| ------ | ------: |
| Counties represented in stories | ${metrics.countiesWithStories} / ${metrics.countiesTotal} |
| Cities represented in stories | ${metrics.citiesWithStories} |
| Videos published | ${metrics.videosPublished} |
| Community stories published | ${metrics.storiesPublished} |
| Substack posts | ${metrics.substackPublished} |
| Local shares (proxy) | ${metrics.storiesShared} |
| Arkansas Presence Score | ${metrics.arkansasPresenceScore}% |

## Success question

Can leadership answer: *Where have we been? Who have we met? Who have we highlighted? Which counties have stories? Do we appear to be everywhere?*
`,
    "utf8",
  );
}

function main() {
  const stops = loadStops();
  const metrics = aggregateMetrics(stops);
  const presenceMap = buildArkansasPresenceMap(stops);
  const countyMap = buildCountyMapForElection(presenceMap);
  const pipelineStats = buildStoryPipelineStats(stops);

  writeHub(metrics);
  writePresenceDashboard(metrics, presenceMap);
  writeArkansasPresenceMapJson(presenceMap, metrics);
  writeCountyVisitArchive(stops, countyMap);
  writeStoryPipelineDashboard(stops, pipelineStats);
  writeCommunityStoryCategories(stops);
  writeSocialMediaResume(metrics, stops);
  writeContentLibrary(stops);
  writeStoryFirstEventWorkflow();
  writeLocalAlgorithmPlaybook();
  writeSeptemberReadinessDashboard(metrics);

  // eslint-disable-next-line no-console
  console.log(
    `Phase 12 Motion: ${metrics.countiesVisited}/${metrics.countiesTotal} counties · presence ${metrics.arkansasPresenceScore}% · Sept readiness ${metrics.septemberPersuasionReadiness}%`,
  );
}

main();
