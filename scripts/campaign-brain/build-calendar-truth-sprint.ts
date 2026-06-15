/**
 * CAMPAIGN PHASE SPRINT 01 — Operation Calendar Truth Acceleration
 *
 * Execution readiness only. No strategy. No scoring. No Phase 9.
 *
 * Usage: npm run campaign-brain:sprint:calendar-truth
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { buildEventVerificationMap } from "./lib/build-verification-map";
import { verificationSummary } from "./lib/event-verification";
import {
  ARKANSAS_COUNTY_REGISTRY,
  BRAIN_DATA,
  BRAIN_ROOT,
  loadCommunityEvents,
  loadOpportunityCounties,
  readJson,
  shortCountyName,
} from "./lib/inputs";

const WORKBENCH = path.join(BRAIN_ROOT, "operations/calendar-truth-workbench");
const FIELD = path.join(BRAIN_ROOT, "field");
const GOV = path.join(BRAIN_ROOT, "governance");
const MEASUREMENT = path.join(BRAIN_ROOT, "measurement");

type CountyOwnerRow = {
  county: string;
  owner: string;
  email: string;
  phone: string;
  status: "unassigned" | "assigned" | "active";
};

type VerificationSnapshot = {
  date: string;
  verifiedEvents: number;
  tentativeEvents: number;
  missingEvents: number;
  countyOwnersAssigned: number;
};

function weekStart(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00.000Z`);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

function ensureCountyOwners(): CountyOwnerRow[] {
  const p = path.join(BRAIN_DATA, "county-contact-owners.json");
  const existing = readJson<{ version?: number; counties?: CountyOwnerRow[]; owners?: Record<string, string> }>(p);

  const rows: CountyOwnerRow[] = [];
  for (const reg of ARKANSAS_COUNTY_REGISTRY) {
    const county = shortCountyName(reg.displayName);
    const fromV2 = existing?.counties?.find((c) => c.county === county);
    const legacyOwner = existing?.owners?.[county];
    rows.push(
      fromV2 ?? {
        county,
        owner: legacyOwner ?? "",
        email: "",
        phone: "",
        status: legacyOwner?.trim() ? "assigned" : "unassigned",
      },
    );
  }

  writeFileSync(
    p,
    JSON.stringify(
      {
        version: 2,
        note: "Assign verification owner per county. status: unassigned | assigned | active. Re-run campaign-brain:build after edits.",
        counties: rows,
      },
      null,
      2,
    ),
    "utf8",
  );
  return rows;
}

function loadOverrides(): Record<string, Record<string, unknown>> {
  return readJson<{ overrides: Record<string, Record<string, unknown>> }>(
    path.join(BRAIN_DATA, "event-verification-overrides.json"),
  )?.overrides ?? {};
}

function workbenchTable(
  events: Array<{
    eventId: string;
    title: string;
    county: string;
    status: string;
    date: string;
    tier?: string;
  }>,
  overrides: Record<string, Record<string, unknown>>,
): string {
  if (!events.length) return "_No events in this category._\n";

  const header = `| Status | Event | County | Tier | Date | Source URL | Contact | Phone | Email | Attendance | Vendor deadline | Verified date | Verified by | Event ID |
| ------ | ----- | ------ | ---- | ---- | ----------- | ------- | ----- | ----- | ---------- | -------------- | ------------- | ----------- | -------- |`;

  const rows = events
    .sort((a, b) => (a.tier ?? "Z").localeCompare(b.tier ?? "Z") || a.county.localeCompare(b.county))
    .map((e) => {
      const o = overrides[e.eventId] ?? {};
      const status = (o.status as string) ?? e.status;
      const date = (o.date as string) ?? e.date ?? "—";
      const contact = (o.contactPerson as string) ?? "—";
      const phone = (o.contactPhone as string) ?? "—";
      const email = (o.contactEmail as string) ?? "—";
      const url = (o.sourceUrl as string) ?? "—";
      const att = o.estimatedAttendance ?? "—";
      const vendor = (o.vendorDeadline as string) ?? "—";
      const vDate = (o.verifiedAt as string) ?? "—";
      const vBy = (o.verifiedBy as string) ?? "—";
      const title = e.title.length > 40 ? `${e.title.slice(0, 40)}…` : e.title;
      return `| ${status} | ${title} | ${e.county} | ${e.tier ?? "—"} | ${date} | ${url} | ${contact} | ${phone} | ${email} | ${att} | ${vendor} | ${vDate} | ${vBy} | \`${e.eventId.slice(0, 18)}…\` |`;
    });

  return `${header}\n${rows.join("\n")}\n`;
}

function writeWorkbenchFiles() {
  const events = loadCommunityEvents();
  const { byEventId } = buildEventVerificationMap();
  const overrides = loadOverrides();
  const oppMap = new Map(loadOpportunityCounties().map((c) => [c.county, c.tier]));

  const enrich = (filter: (type: string) => boolean) =>
    events
      .filter((e) => filter(e.type))
      .map((e) => {
        const v = byEventId.get(e.id);
        const o = overrides[e.id];
        return {
          eventId: e.id,
          title: e.title,
          county: e.county,
          status: (o?.status as string) ?? v?.status ?? "missing",
          date: (o?.date as string) ?? v?.eventDate ?? "",
          tier: oppMap.get(e.county),
        };
      });

  const files = [
    {
      name: "county-fairs-verification.md",
      title: "County Fairs Verification — Team A",
      events: enrich((t) => t === "county_fair"),
    },
    {
      name: "festival-verification.md",
      title: "Festival Verification — Team B",
      events: enrich((t) => t === "festival"),
    },
    {
      name: "faith-events-verification.md",
      title: "Faith Events Verification — Team C",
      events: enrich((t) => t === "faith" || t === "church"),
    },
    {
      name: "county-clerk-events-verification.md",
      title: "County Clerk Events Verification — Team D",
      events: enrich((t) => t === "county_clerk" || t === "clerk"),
    },
  ];

  for (const f of files) {
    const verified = f.events.filter((e) => e.status === "verified").length;
    writeFileSync(
      path.join(WORKBENCH, f.name),
      `# ${f.title}

> Operation Calendar Truth · ${f.events.length} events · ${verified} verified

Update digital record: [\`event-verification-overrides.json\`](../../../data/campaign-brain/event-verification-overrides.json)

Then: \`npm run campaign-brain:build\`

---

${workbenchTable(f.events, overrides)}

---

## Status key

| Status | Meaning |
| ------ | ------- |
| verified | Date confirmed |
| tentative | Expected, not confirmed |
| historical | Last year's date only |
| missing | No usable date |
`,
      "utf8",
    );
  }

  writeFileSync(
    path.join(WORKBENCH, "README.md"),
    `# Calendar Truth Workbench

> Sprint 01 — verify events · reduce uncertainty · feed the Brain

| Workbench | Team | Events |
| --------- | ---- | -----: |
| [County fairs](./county-fairs-verification.md) | A | 75 |
| [Festivals](./festival-verification.md) | B | — |
| [Faith events](./faith-events-verification.md) | C | — |
| [County clerk events](./county-clerk-events-verification.md) | D | — |

**Digital update:** [\`event-verification-overrides.json\`](../../data/campaign-brain/event-verification-overrides.json)

**Sprint brief:** [SPRINT-01-CALENDAR-TRUTH.md](../SPRINT-01-CALENDAR-TRUTH.md)
`,
    "utf8",
  );
}

function appendVerificationSnapshot(verified: number, tentative: number, missing: number, ownersAssigned: number) {
  const p = path.join(BRAIN_DATA, "verification-velocity-snapshots.json");
  const today = new Date().toISOString().slice(0, 10);
  const data = existsSync(p)
    ? (JSON.parse(readFileSync(p, "utf8")) as { snapshots: VerificationSnapshot[] })
    : { snapshots: [] };

  const last = data.snapshots[data.snapshots.length - 1];
  if (!last || last.date !== today) {
    data.snapshots.push({ date: today, verifiedEvents: verified, tentativeEvents: tentative, missingEvents: missing, countyOwnersAssigned: ownersAssigned });
  } else {
    data.snapshots[data.snapshots.length - 1] = {
      date: today,
      verifiedEvents: verified,
      tentativeEvents: tentative,
      missingEvents: missing,
      countyOwnersAssigned: ownersAssigned,
    };
  }
  writeFileSync(p, JSON.stringify(data, null, 2), "utf8");
  return data.snapshots;
}

function projectedCompletionDate(verified: number, goal: number, snapshots: VerificationSnapshot[]): string {
  if (verified >= goal) return "Achieved";
  const thisWeek = weekStart(new Date().toISOString());
  const lastWeekStart = new Date(`${thisWeek}T12:00:00.000Z`);
  lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 7);
  const lastWeekKey = lastWeekStart.toISOString().slice(0, 10);

  const thisSnap = snapshots.filter((s) => weekStart(s.date) === thisWeek).pop();
  const lastSnap = snapshots.filter((s) => weekStart(s.date) === lastWeekKey).pop();
  if (!thisSnap || !lastSnap) return "Insufficient velocity data — log daily snapshots via campaign-brain:build";

  const weeklyGain = thisSnap.verifiedEvents - lastSnap.verifiedEvents;
  if (weeklyGain <= 0) return "Stalled — increase verification sprint capacity";

  const remaining = goal - verified;
  const weeksNeeded = Math.ceil(remaining / weeklyGain);
  const proj = new Date();
  proj.setUTCDate(proj.getUTCDate() + weeksNeeded * 7);
  return proj.toISOString().slice(0, 10);
}

function writeCountyOwnerDashboard(counties: CountyOwnerRow[]) {
  const assigned = counties.filter((c) => c.status !== "unassigned" && c.owner.trim()).length;
  const unassigned = counties.length - assigned;
  const pct = Math.round((assigned / counties.length) * 1000) / 10;

  writeFileSync(
    path.join(GOV, "county-owner-assignment-dashboard.md"),
    `# County Owner Assignment Dashboard

> Sprint 01 — every county needs a verification owner

Updated: ${new Date().toISOString().slice(0, 10)}

| Metric | Value |
| ------ | ----: |
| Assigned | **${assigned}** |
| Unassigned | ${unassigned} |
| Coverage | **${pct}%** |
| Goal | 75/75 (100%) |

---

## Unassigned counties

${counties
  .filter((c) => c.status === "unassigned" || !c.owner.trim())
  .map((c) => `- **${c.county}**`)
  .join("\n")}

---

## Assigned counties

${counties
  .filter((c) => c.owner.trim())
  .map((c) => `- **${c.county}** — ${c.owner}${c.email ? ` · ${c.email}` : ""}`)
  .join("\n") || "- None yet"}

---

Edit: [\`county-contact-owners.json\`](../../data/campaign-brain/county-contact-owners.json)
`,
    "utf8",
  );
}

function writeFieldForms() {
  mkdirSync(FIELD, { recursive: true });

  const footer = `
---

**Submit:** Copy values into JSON files · \`npm run campaign-brain:build\`

| Data | File |
| ---- | ---- |
| Event outcome | [\`event-outcomes.json\`](../../data/campaign-brain/event-outcomes.json) |
| County visit | [\`county-visit-log.json\`](../../data/campaign-brain/county-visit-log.json) |
| Verification | [\`event-verification-overrides.json\`](../../data/campaign-brain/event-verification-overrides.json) |
`;

  writeFileSync(
    path.join(FIELD, "event-outcome-form.md"),
    `# Event Outcome Form — 5 minutes

Structured data only. No narrative required.

| Field | Value |
| ----- | ----- |
| Event ID | |
| Event title | |
| County | |
| Event date | |
| Attended? (Y/N) | |
| Estimated attendance | |
| New contacts | |
| Volunteer signups | |
| Registrations completed | |
| Faith leaders engaged | |
| Clerk relationship advanced? (Y/N) | |
| Donations generated ($) | |
| Earned media mentions (count or URLs) | |
| Recorded by | |
| Recorded at | |
${footer}`,
    "utf8",
  );

  writeFileSync(
    path.join(FIELD, "county-visit-form.md"),
    `# County Visit Form — 5 minutes

| Field | Value |
| ----- | ----- |
| County | |
| Date | |
| Assignee (Kelly / Surrogate / County team) | |
| Contact type (kelly_visit / surrogate / clerk / faith / volunteer) | |
| Event ID (if applicable) | |
| Local business highlighted (name) | |
| Notes | |
${footer}`,
    "utf8",
  );

  writeFileSync(
    path.join(FIELD, "faith-engagement-form.md"),
    `# Faith Engagement Form — 5 minutes

Read first: [Big Table Doctrine](../relational-organizing/BIG-TABLE-DEMOCRAT-DOCTRINE.md)

| Field | Value |
| ----- | ----- |
| County | |
| Date | |
| Faith leader name | |
| Organization / church | |
| Event or meeting type | |
| Follow-up needed? (Y/N) | |
| Logged in event-outcomes? (Y/N) | |
${footer}`,
    "utf8",
  );

  writeFileSync(
    path.join(FIELD, "clerk-meeting-form.md"),
    `# Clerk Meeting Form — 5 minutes

| Field | Value |
| ----- | ----- |
| County | |
| Date | |
| Clerk name | |
| Meeting type (conference / training / election / other) | |
| Relationship advanced? (Y/N) | |
| Follow-up date | |
| Notes | |
${footer}`,
    "utf8",
  );

  writeFileSync(
    path.join(FIELD, "README.md"),
    `# Field Reporting — 5-Minute Forms

> After every event. Structured data only.

| Form | Use |
| ---- | --- |
| [Event outcome](./event-outcome-form.md) | Any attended event |
| [County visit](./county-visit-form.md) | Travel / presence log |
| [Faith engagement](./faith-engagement-form.md) | Pastor / faith leader contact |
| [Clerk meeting](./clerk-meeting-form.md) | Clerk relationship tracking |

Friday: submit forms → update JSON → \`npm run campaign-brain:build\`
`,
    "utf8",
  );
}

function writeRelationshipScorecard() {
  const assets = readJson<{
    statewide: Record<string, { deployed?: number; goal: number }>;
    programs: Record<string, { completed?: number; scheduled?: number; goal: number }>;
    relationshipCapital: Record<string, number>;
  }>(path.join(BRAIN_DATA, "relationship-assets.json"));

  if (!assets) return;

  const s = assets.statewide;
  const rc = assets.relationshipCapital;
  const p = assets.programs;

  writeFileSync(
    path.join(MEASUREMENT, "relationship-capital-scorecard.md"),
    `# Relationship Capital Scorecard

> Sprint 01 — physical manifestations of trust · update [\`relationship-assets.json\`](../../data/campaign-brain/relationship-assets.json)

Updated: ${new Date().toISOString().slice(0, 10)}

## Physical assets

| Asset | Deployed | Goal |
| ----- | -------: | ---: |
| Signs | ${s.signs?.deployed ?? 0} | ${s.signs?.goal ?? 0} |
| Shirts | ${s.shirts?.deployed ?? 0} | ${s.shirts?.goal ?? 0} |
| Buttons | ${s.buttons?.deployed ?? 0} | ${s.buttons?.goal ?? 0} |
| Flags | ${s.flags?.deployed ?? 0} | ${s.flags?.goal ?? 0} |

## Programs

| Program | Completed | Scheduled | Goal |
| ------- | --------: | --------: | ---: |
| House parties | ${p.houseParties?.completed ?? 0} | ${p.houseParties?.scheduled ?? 0} | ${p.houseParties?.goal ?? 0} |
| Civic club meetings | ${p.civicClubMeetings?.completed ?? 0} | ${p.civicClubMeetings?.scheduled ?? 0} | ${p.civicClubMeetings?.goal ?? 0} |
| Faith events | ${p.faithEvents?.completed ?? 0} | ${p.faithEvents?.scheduled ?? 0} | ${p.faithEvents?.goal ?? 0} |

## Relationship capital rollup

| Metric | Current |
| ------ | ------: |
| Churches visited | ${rc.churchesVisited ?? 0} |
| Civic clubs visited | ${rc.civicClubsVisited ?? 0} |
| Local businesses highlighted | ${rc.localBusinessesHighlighted ?? 0} |
| Postcards written | ${rc.postcardsWritten ?? 0} |
| Phone calls completed | ${rc.phoneCallsCompleted ?? 0} |
| Doors knocked | ${rc.canvassDoorsKnocked ?? 0} |

Full dashboard: [relationship-capital-dashboard.md](../relational-organizing/relationship-capital-dashboard.md)
`,
    "utf8",
  );
}

function main() {
  mkdirSync(WORKBENCH, { recursive: true });

  const counties = ensureCountyOwners();
  writeWorkbenchFiles();
  writeFieldForms();
  writeRelationshipScorecard();
  writeCountyOwnerDashboard(counties);

  const { records } = buildEventVerificationMap();
  const summary = verificationSummary(records);
  const assigned = counties.filter((c) => c.owner.trim()).length;
  const snapshots = appendVerificationSnapshot(summary.verified, summary.tentative, summary.missing, assigned);

  const thisWeek = weekStart(new Date().toISOString());
  const lastWeekDate = new Date(`${thisWeek}T12:00:00.000Z`);
  lastWeekDate.setUTCDate(lastWeekDate.getUTCDate() - 7);
  const lastWeek = weekStart(lastWeekDate.toISOString());

  const thisWeekSnaps = snapshots.filter((s) => weekStart(s.date) === thisWeek);
  const lastWeekSnaps = snapshots.filter((s) => weekStart(s.date) === lastWeek);
  const verifiedThisWeek = thisWeekSnaps.length ? thisWeekSnaps[thisWeekSnaps.length - 1].verifiedEvents : summary.verified;
  const verifiedLastWeek = lastWeekSnaps.length ? lastWeekSnaps[lastWeekSnaps.length - 1].verifiedEvents : 0;

  const velocityPath = path.join(BRAIN_DATA, "verification-velocity.json");
  writeFileSync(
    velocityPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        verifiedThisWeek,
        verifiedLastWeek,
        weeklyDelta: verifiedThisWeek - verifiedLastWeek,
        projectedCompletionDate300: projectedCompletionDate(summary.verified, 300, snapshots),
        goal: 300,
        currentVerified: summary.verified,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(
    `Sprint 01 Calendar Truth: ${summary.verified} verified · ${assigned}/75 county owners · workbench + field forms ready.`,
  );
}

main();
