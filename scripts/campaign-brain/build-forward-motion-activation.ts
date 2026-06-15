/**
 * PHASE 13 — Forward Motion Activation System
 *
 * Announces, promotes, activates, and measures upcoming stops — draft/review only.
 * NO live emails, Facebook posts, Mobilize publish, or press distribution.
 *
 * Usage: npm run campaign-brain:forward-motion
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_DATA, BRAIN_ROOT } from "./lib/inputs";
import { buildActivationQueue, daysFromToday, stopsNextWeek } from "./lib/forward-motion-sources";
import type { UpcomingStopActivation, UpcomingStopsQueueFile } from "./lib/forward-motion-types";

const FORWARD = path.join(BRAIN_ROOT, "forward-motion");
const HORIZON_DAYS = 90;
const PRIORITY_DAYS = 21;

function ensureDirs() {
  for (const d of [
    FORWARD,
    path.join(FORWARD, "news-releases"),
    path.join(FORWARD, "news-releases/drafts"),
    path.join(FORWARD, "social-graphics"),
    path.join(FORWARD, "facebook-events"),
    path.join(FORWARD, "mobilize"),
    path.join(FORWARD, "phone-bank-invitations"),
    path.join(FORWARD, "postcards"),
    path.join(FORWARD, "canvass-door-hangers"),
    path.join(FORWARD, "story-capture"),
  ]) {
    mkdirSync(d, { recursive: true });
  }
}

function stopCard(s: UpcomingStopActivation): string {
  return `### ${s.eventName}

| Field | Value |
| ----- | ----- |
| Event | ${s.eventName} |
| County | ${s.county} |
| City | ${s.city} |
| Date | ${s.date} |
| Assignment | ${s.assignment} |
| Score | ${s.effectiveScore} (impact ${s.campaignImpactScore}) |
| Verification | ${s.verificationStatus} |
| Mobilize | ${s.mobilizeStatus} |
| Facebook | ${s.facebookStatus} |
| News Release | ${s.newsReleaseStatus} |
| Graphic | ${s.graphicsStatus} |
| Phone Bank | ${s.phoneBankStatus} |
| Postcard | ${s.postcardStatus} |
| Canvass | ${s.canvassStatus} |
| Door Hanger | ${s.doorHangerStatus} |
| Story Plan | ${s.storyWorkflowStatus} |
| Readiness | ${s.activationReadinessPct}% |
| **Next Action** | ${s.nextAction} |
`;
}

function writeHub(stops: UpcomingStopActivation[]) {
  const nextWeek = stopsNextWeek(stops);
  writeFileSync(
    path.join(FORWARD, "PHASE-13-FORWARD-MOTION-ACTIVATION-SYSTEM.md"),
    `# Phase 13 — Forward Motion Activation System

> **Backward proof** (Phase 12) + **Forward motion** (Phase 13) = perceived statewide momentum.

Updated: ${new Date().toISOString().slice(0, 10)}

## Mission

Build the system that **announces, promotes, activates, and measures** Kelly's upcoming campaign stops.

Every verified stop becomes an activation package:

Campaign Brain event → Mobilize → Facebook → news release → graphics → phone bank → postcards → canvass/door hangers (future) → post-event story workflow

## Hard rules

- **No live emails sent**
- **No live Facebook event publishing**
- **No live Mobilize publishing** unless existing human-approval workflow
- **No automatic press release distribution**
- **No voter-level PII** in generated docs
- **No 20-week schedule lock**
- Everything is **draft / review / activation-ready**

## Why forward motion matters

Arkansas is a relationship state. Voters need to repeatedly encounter evidence Kelly is **showing up in communities like theirs** — including **before** she arrives.

## Queue summary

| Metric | Count |
| ------ | ----: |
| Upcoming stops (${HORIZON_DAYS}d horizon) | ${stops.length} |
| Next 7 days | ${nextWeek.length} |
| Kelly assignment | ${stops.filter((s) => s.assignment === "Kelly").length} |
| Verified | ${stops.filter((s) => s.verificationStatus === "verified").length} |

## Objectives

| # | System | Location |
| - | ------ | -------- |
| 1 | Forward Motion Hub | This file |
| 2 | Activation Queue | [\`upcoming-stops-activation-queue.json\`](../../../data/campaign-brain/upcoming-stops-activation-queue.json) |
| 3 | Weekly Packet | [\`weekly-forward-motion-packet.md\`](./weekly-forward-motion-packet.md) |
| 4 | News Releases | [\`news-releases/\`](./news-releases/) |
| 5 | Social Graphics | [\`social-graphics/\`](./social-graphics/) · [\`social-graphics-request-queue.json\`](../../../data/campaign-brain/social-graphics-request-queue.json) |
| 6 | Facebook Drafts | [\`facebook-events/\`](./facebook-events/) |
| 7 | Mobilize Drafts | [\`mobilize/\`](./mobilize/) |
| 8 | Phone Banks | [\`phone-bank-invitations/\`](./phone-bank-invitations/) |
| 9 | Postcards | [\`postcards/\`](./postcards/) |
| 10 | Canvass / Door Hangers | [\`canvass-door-hangers/\`](./canvass-door-hangers/) |
| 11 | Story Capture | [\`story-capture/\`](./story-capture/) |
| 12 | Election Plan | \`/election-plan\` → **Forward Motion** tab |

## Build

\`\`\`bash
npm run campaign-brain:forward-motion
npm run campaign-brain:build
npm run election-plan:build
\`\`\`
`,
    "utf8",
  );
}

function writeQueue(stops: UpcomingStopActivation[]) {
  const file: UpcomingStopsQueueFile = {
    version: 1,
    generatedAt: new Date().toISOString(),
    note: "Draft/review only — no live publishing. Human approval required for all public release.",
    horizonDays: HORIZON_DAYS,
    priorityWindowDays: PRIORITY_DAYS,
    stops,
  };
  writeFileSync(path.join(BRAIN_DATA, "upcoming-stops-activation-queue.json"), JSON.stringify(file, null, 2), "utf8");
}

function writeWeeklyPacket(stops: UpcomingStopActivation[]) {
  const nextWeek = stopsNextWeek(stops);
  const kelly = nextWeek.filter((s) => s.assignment === "Kelly");
  const surrogate = nextWeek.filter((s) => s.assignment === "Surrogate");
  const county = nextWeek.filter((s) => s.assignment === "County Team");

  const missing = stops
    .filter((s) => daysFromToday(s.date) <= PRIORITY_DAYS)
    .flatMap((s) => {
      const m: string[] = [];
      if (s.mobilizeStatus === "not_started" || s.mobilizeStatus === "draft_needed")
        m.push(`${s.eventName}: Mobilize draft`);
      if (s.facebookStatus === "not_started" || s.facebookStatus === "draft_needed")
        m.push(`${s.eventName}: Facebook draft`);
      if (s.newsReleaseStatus === "not_started" || s.newsReleaseStatus === "draft_needed")
        m.push(`${s.eventName}: News release`);
      if (s.graphicsStatus === "not_started" || s.graphicsStatus === "needed")
        m.push(`${s.eventName}: Graphics request`);
      return m;
    })
    .slice(0, 25);

  writeFileSync(
    path.join(FORWARD, "weekly-forward-motion-packet.md"),
    `# Weekly Forward Motion Packet

Generated: ${new Date().toISOString().slice(0, 10)}

## Summary

| Assignment | Stops next 7 days |
| ---------- | ----------------: |
| Kelly | ${kelly.length} |
| Surrogate | ${surrogate.length} |
| County Team | ${county.length} |

## What must be approved

All public-facing pieces require human approval before release. Nothing in this packet auto-publishes.

## Missing promotion pieces (next ${PRIORITY_DAYS} days)

${missing.length ? missing.map((m) => `- ${m}`).join("\n") : "_None in priority window — or queue empty._"}

---

## Kelly stops next week

${kelly.length ? kelly.map(stopCard).join("\n") : "_No Kelly stops in next 7 days._"}

## Surrogate stops next week

${surrogate.length ? surrogate.map(stopCard).join("\n") : "_None scheduled._"}

## County team stops next week

${county.length ? county.map(stopCard).join("\n") : "_None scheduled._"}
`,
    "utf8",
  );
}

function writeNewsReleaseTemplates() {
  const templates = [
    {
      file: "news-release-template.md",
      body: `# News Release Template

**Approval status:** DRAFT — not for distribution

## Headline

[Candidate name] to visit [County] County [event/community]

## Dateline

[CITY], Ark. — [DATE]

## Opening paragraph

Kelly Grappe, Democratic candidate for Arkansas Secretary of State, will [attend/host/participate in]...

## Why Kelly is visiting

[Local relationship / SOS relevance / voter access theme]

## Local event details

- **What:** 
- **When:** 
- **Where:** 
- **Who:** Open to the public

## Quote

> "..." — Kelly Grappe

## Secretary of State relevance

[Brief tie to office — elections access, business services, transparency]

## Volunteer / attend

[MOBILIZE_LINK_PLACEHOLDER]

## Media contact

[MEDIA_CONTACT_PLACEHOLDER]

## Paid for disclaimer

[PAID_FOR_DISCLAIMER_IF_NEEDED]
`,
    },
    {
      file: "local-media-advisory-template.md",
      body: `# Local Media Advisory Template

**Approval status:** DRAFT

For assignment editors — photo opportunity at [EVENT].

Contact: [MEDIA_CONTACT_PLACEHOLDER]
`,
    },
    {
      file: "county-visit-announcement-template.md",
      body: `# County Visit Announcement Template

Kelly Grappe continues statewide listening tour with stop in [COUNTY] County.

Mobilize: [MOBILIZE_LINK_PLACEHOLDER]
`,
    },
    {
      file: "faith-community-visit-template.md",
      body: `# Faith Community Visit Template

Emphasis: listening, service, non-partisan community presence.

Approval required before faith-community distribution lists.
`,
    },
    {
      file: "festival-appearance-template.md",
      body: `# Festival Appearance Template

Community festival — local business and family angle.

Include festival name, dates, booth/parade details if applicable.
`,
    },
    {
      file: "county-fair-appearance-template.md",
      body: `# County Fair Appearance Template

County fair — agriculture, youth, local pride angles.

Verify fair board contact before release.
`,
    },
  ];
  for (const t of templates) {
    writeFileSync(path.join(FORWARD, "news-releases", t.file), t.body, "utf8");
  }
}

function writeNewsReleaseDrafts(stops: UpcomingStopActivation[]) {
  const eligible = stops
    .filter(
      (s) =>
        (s.verificationStatus === "verified" || s.confidence >= 0.75) &&
        s.effectiveScore >= 45 &&
        daysFromToday(s.date) <= 45,
    )
    .slice(0, 20);

  for (const s of eligible) {
    const slug = s.eventId.replace(/[^a-z0-9-]/gi, "-").slice(0, 60);
    writeFileSync(
      path.join(FORWARD, "news-releases/drafts", `${slug}.md`),
      `# DRAFT — ${s.eventName}

**Approval status:** DRAFT — not for distribution  
**Event ID:** ${s.eventId}  
**Date:** ${s.date}  
**County:** ${s.county} · **City:** ${s.city}

---

## Headline

Kelly Grappe to visit ${s.county.replace(" County", "")} County for ${s.eventName}

## Dateline

${s.city !== "TBD" ? s.city : s.county.replace(" County", "")}, Ark. — ${s.date}

## Opening paragraph

Kelly Grappe, Democratic candidate for Arkansas Secretary of State, will attend ${s.eventName} as part of her statewide campaign to meet Arkansans where they live, work, and gather.

## Why Kelly is visiting

${s.primaryLane}. ${s.cluster} — building relationships before Election Day.

## Local event details

- **Event:** ${s.eventName}
- **Date:** ${s.date}
- **Location:** ${s.city !== "TBD" ? `${s.city}, ${s.county}` : s.county}
- **Assignment:** ${s.assignment}

## Quote from Kelly

> "Arkansas deserves a Secretary of State who shows up in every county — not just during election season. I'm grateful for the invitation to be part of ${s.eventName}."

## Secretary of State relevance

As Secretary of State, Kelly will prioritize secure elections, accessible business services, and transparent government for every Arkansas community.

## Volunteer / attend information

Mobilize link: [MOBILIZE_LINK_PLACEHOLDER]

## Media contact

[MEDIA_CONTACT_PLACEHOLDER]

## Paid for disclaimer

Paid for by Kelly Grappe for Secretary of State
`,
      "utf8",
    );
  }
}

function writeSocialGraphics(stops: UpcomingStopActivation[]) {
  const priority = stops.filter((s) => daysFromToday(s.date) <= PRIORITY_DAYS).slice(0, 40);
  const requests = priority.flatMap((s) => {
    const base = {
      eventId: s.eventId,
      eventName: s.eventName,
      city: s.city,
      county: s.county,
      date: s.date,
      time: "TBD",
      location: s.city !== "TBD" ? `${s.city}, ${s.county}` : s.county,
      callToAction: "RSVP on Mobilize — link TBD",
      brandTone: "Warm · local · proof-of-presence · not attack",
      requiredDisclaimers: "Paid for by Kelly Grappe for Secretary of State",
      status: s.graphicsStatus,
    };
    return [
      { ...base, format: "square_post", dimensions: "1080×1080" },
      { ...base, format: "vertical_story", dimensions: "1080×1920" },
      { ...base, format: "facebook_event_banner", dimensions: "1920×1080" },
    ];
  });

  writeFileSync(
    path.join(BRAIN_DATA, "social-graphics-request-queue.json"),
    JSON.stringify(
      { version: 1, generatedAt: new Date().toISOString(), note: "Production briefs only — no image generation", requests },
      null,
      2,
    ),
    "utf8",
  );

  writeFileSync(
    path.join(FORWARD, "social-graphics", "graphics-request-dashboard.md"),
    `# Social Graphics Request Queue

**${requests.length}** graphic briefs for upcoming stops (next ${PRIORITY_DAYS} days).

Formats per stop: square post · vertical story/reel · Facebook event banner · (future: postcard · door hanger)

Data: [\`social-graphics-request-queue.json\`](../../../data/campaign-brain/social-graphics-request-queue.json)

Do **not** auto-generate images — hand to designer or future automation.
`,
    "utf8",
  );
}

function writeFacebookWorkflow(stops: UpcomingStopActivation[]) {
  const drafts = stops.filter((s) => daysFromToday(s.date) <= PRIORITY_DAYS).slice(0, 30);

  writeFileSync(
    path.join(FORWARD, "facebook-events", "facebook-event-template.md"),
    `# Facebook Event Template

**DRAFT ONLY — no API posting**

- Title: Kelly Grappe — [Event Name] · [City]
- Date/time: [DATE] [TIME]
- Location: [VENUE]
- Description: Local intro · why Kelly · RSVP link · volunteer ask
- Co-host suggestions: County Dems · local business · civic org (with permission)
- Approval status: not_started → draft_needed → drafted → approved → published (manual)
`,
    "utf8",
  );

  writeFileSync(
    path.join(FORWARD, "facebook-events", "facebook-event-copy-bank.md"),
    `# Facebook Event Copy Bank

Reusable snippets — customize per county.

**Invitation:** "Join Kelly in [COUNTY] — [EVENT]. Meet your candidate for Secretary of State."

**Share copy:** "Kelly is coming to [CITY]. Share with neighbors who care about Arkansas elections."

**Volunteer CTA:** "Can you help welcome attendees? RSVP on Mobilize."
`,
    "utf8",
  );

  writeFileSync(
    path.join(FORWARD, "facebook-events", "facebook-event-draft-queue.md"),
    `# Facebook Event Draft Queue

${drafts.length} stops in priority window.

${drafts
  .map(
    (s) => `## ${s.eventName} (${s.date})

- **Title:** Kelly Grappe — ${s.eventName}${s.city !== "TBD" ? ` · ${s.city}` : ""}
- **Status:** ${s.facebookStatus}
- **Description draft:** Kelly Grappe, candidate for Secretary of State, invites you to ${s.eventName} in ${s.county}. [MOBILIZE_LINK]
- **Co-host suggestions:** ${s.county} County Democrats · local chamber · event host
- **Approval:** Required before publish
`,
  )
  .join("\n")}
`,
    "utf8",
  );
}

function writeMobilizeWorkflow(stops: UpcomingStopActivation[]) {
  const drafts = stops.filter((s) => daysFromToday(s.date) <= PRIORITY_DAYS).slice(0, 30);

  writeFileSync(
    path.join(FORWARD, "mobilize", "mobilize-promotion-checklist.md"),
    `# Mobilize Promotion Checklist

Per event — human approval before publish.

- [ ] Event title + date + location verified
- [ ] RSVP goal set
- [ ] Volunteer roles defined (greeter, sign-in, photographer)
- [ ] Reminder schedule (7d · 1d · day-of)
- [ ] Follow-up action assigned
- [ ] Attendance capture plan
- [ ] Link logged in mobilize-events.json
`,
    "utf8",
  );

  writeFileSync(
    path.join(FORWARD, "mobilize", "mobilize-event-copy-bank.md"),
    `# Mobilize Event Copy Bank

**Title pattern:** [County] · [Event Name] with Kelly Grappe

**Description sections:** Why this event · What to expect · Volunteer shifts · Accessibility

See Phase 11: [\`../../people-power/mobilize/mobilize-event-framework.md\`](../../people-power/mobilize/mobilize-event-framework.md)
`,
    "utf8",
  );

  writeFileSync(
    path.join(FORWARD, "mobilize", "mobilize-event-draft-queue.md"),
    `# Mobilize Event Draft Queue

| Date | Event | County | Status | RSVP | Assignment |
| ---- | ----- | ------ | ------ | ---- | ---------- |
${drafts.map((s) => `| ${s.date} | ${s.eventName} | ${s.county} | ${s.mobilizeStatus} | TBD | ${s.assignment} |`).join("\n") || "| — | — | — | — | — | — |"}
`,
    "utf8",
  );
}

function writePhoneBank(stops: UpcomingStopActivation[]) {
  const scripts = [
    {
      file: "phone-bank-invite-script.md",
      body: `# Phone Bank Invite Script

Hi, this is [NAME] with the Kelly Grappe campaign. Kelly is going to be in [COUNTY] on [DATE] for [EVENT]. We'd love for you to join us — can I send you the Mobilize link?

**No voter PII in this doc.** Lists managed separately with compliance review.
`,
    },
    {
      file: "county-missing-democrat-script.md",
      body: `# County Missing Democrat Script

For counties with drop-off recovery targets — invite to meet Kelly locally.

Focus: relationship, not persuasion pressure.
`,
    },
    {
      file: "event-invitation-script.md",
      body: `# Event Invitation Script

Short invite to verified upcoming event. Confirm date/time/location before calling.
`,
    },
    {
      file: "follow-up-script.md",
      body: `# Follow-Up Script

Post-call thank you · Mobilize link · volunteer ask · Power of 5 mention.
`,
    },
  ];
  for (const s of scripts) {
    writeFileSync(path.join(FORWARD, "phone-bank-invitations", s.file), s.body, "utf8");
  }

  const queue = stops
    .filter((s) => daysFromToday(s.date) <= PRIORITY_DAYS && s.phoneBankStatus !== "not_started")
    .slice(0, 25);

  writeFileSync(
    path.join(FORWARD, "phone-bank-invitations", "phone-bank-assignment-queue.md"),
    `# Phone Bank Assignment Queue

| County | Event | Date | List status | Script | Suggested call dates | Call goal | Captain |
| ------ | ----- | ---- | ----------- | ------ | -------------------- | --------- | ------- |
${queue.map((s) => `| ${s.county} | ${s.eventName} | ${s.date} | list_needed | event-invitation | ${daysFromToday(s.date) - 7}d before event | 50 calls | TBD |`).join("\n") || "| — | — | — | — | — | — | — | — |"}
`,
    "utf8",
  );
}

function writePostcards(stops: UpcomingStopActivation[]) {
  const templates = [
    "visit-announcement-postcard-template.md",
    "senior-gotv-postcard-template.md",
    "youth-gotv-postcard-template.md",
    "postcard-writing-party-template.md",
  ];
  for (const t of templates) {
    const title = t.replace(/-/g, " ").replace(".md", "");
    writeFileSync(path.join(FORWARD, "postcards", t), `# ${title}\n\nDraft template — design approval required.\n`, "utf8");
  }

  const queue = stops.filter((s) => daysFromToday(s.date) <= 45).slice(0, 20);
  writeFileSync(
    path.join(FORWARD, "postcards", "postcard-assignment-queue.md"),
    `# Postcard Assignment Queue

| Type | County | Event | Qty goal | Print by | Write by | Mail by | Captain |
| ---- | ------ | ----- | -------- | -------- | -------- | ------- | ------- |
${queue.map((s) => `| visit-announcement | ${s.county} | ${s.eventName} | 200 | T-21d | T-14d | T-10d | TBD |`).join("\n") || "| — | — | — | — | — | — | — | — |"}
`,
    "utf8",
  );
}

function writeCanvassDoorHangers() {
  writeFileSync(
    path.join(FORWARD, "canvass-door-hangers", "future-canvass-layer.md"),
    `# Future Canvass Layer

Status defaults to **future** until campaign explicitly activates canvass operations.

When activated: link upcoming stops to turf prep in field OS — not in this pass.
`,
    "utf8",
  );
  writeFileSync(
    path.join(FORWARD, "canvass-door-hangers", "door-hanger-template-brief.md"),
    `# Door Hanger Template Brief

Future option per high-traffic stop. Design + print + hang workflow TBD.
`,
    "utf8",
  );
  writeFileSync(
    path.join(FORWARD, "canvass-door-hangers", "canvass-prep-checklist.md"),
    `# Canvass Prep Checklist

Future — turf · scripts · volunteer captains · data compliance.
`,
    "utf8",
  );
  writeFileSync(
    path.join(FORWARD, "canvass-door-hangers", "door-hanger-prep-checklist.md"),
    `# Door Hanger Prep Checklist

Future — design approval · print deadline · hang teams · GPS turf (no PII in Brain docs).
`,
    "utf8",
  );
}

function writeStoryCapture(stops: UpcomingStopActivation[]) {
  writeFileSync(
    path.join(FORWARD, "story-capture", "story-capture-template.md"),
    `# Story Capture Template

Per stop — connects Phase 13 forward activation to Phase 12 backward proof.

## Angles

- Local business spotlight
- Community person (teacher, veteran, volunteer)
- Faith / civic organization
- Youth / senior
- County issue / county hope

## Capture checklist

- [ ] 15-second vertical video
- [ ] Photo carousel (3–5 images)
- [ ] Local story draft (next day)
- [ ] Substack placeholder
- [ ] Email recap slot
`,
    "utf8",
  );

  const briefs = stops.filter((s) => daysFromToday(s.date) <= PRIORITY_DAYS).slice(0, 25);
  writeFileSync(
    path.join(FORWARD, "story-capture", "upcoming-stop-story-briefs.md"),
    `# Upcoming Stop Story Briefs

${briefs
  .map(
    (s) => `## ${s.eventName} · ${s.date}

- **Local business angle:** TBD — identify on arrival
- **Community person angle:** TBD
- **Faith/civic angle:** event-dependent
- **County issue angle:** ${s.primaryLane}
- **Photo/video checklist:** vertical clip · carousel · B-roll
- **Substack follow-up:** within 7 days
- **Status:** ${s.storyWorkflowStatus}
`,
  )
  .join("\n")}
`,
    "utf8",
  );
}

function writeForwardMotionSummary(stops: UpcomingStopActivation[]) {
  writeFileSync(
    path.join(BRAIN_DATA, "forward-motion-summary.json"),
    JSON.stringify(
      {
        version: 1,
        generatedAt: new Date().toISOString(),
        heroLine:
          "Showing where Kelly is going next is as important as proving where she has already been.",
        upcomingCount: stops.length,
        nextWeekCount: stopsNextWeek(stops).length,
        priorityWindowCount: stops.filter((s) => daysFromToday(s.date) <= PRIORITY_DAYS).length,
        avgActivationReadiness:
          stops.length > 0
            ? Math.round(stops.reduce((a, s) => a + s.activationReadinessPct, 0) / stops.length)
            : 0,
      },
      null,
      2,
    ),
    "utf8",
  );
}

function main() {
  ensureDirs();
  const stops = buildActivationQueue({ horizonDays: HORIZON_DAYS, priorityWindowDays: PRIORITY_DAYS });

  writeHub(stops);
  writeQueue(stops);
  writeWeeklyPacket(stops);
  writeNewsReleaseTemplates();
  writeNewsReleaseDrafts(stops);
  writeSocialGraphics(stops);
  writeFacebookWorkflow(stops);
  writeMobilizeWorkflow(stops);
  writePhoneBank(stops);
  writePostcards(stops);
  writeCanvassDoorHangers();
  writeStoryCapture(stops);
  writeForwardMotionSummary(stops);

  // eslint-disable-next-line no-console
  console.log(
    `Phase 13 Forward Motion: ${stops.length} upcoming stops · ${stopsNextWeek(stops).length} next week · drafts only`,
  );
}

main();
