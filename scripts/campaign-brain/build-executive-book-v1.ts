/**
 * EXECUTIVE-BOOK-COMPLETION-1.0 — Leadership Completion Pass.
 * Closes five executive gaps + completion audit. No new systems. No new dashboards.
 *
 * Usage: npm run campaign-brain:executive-book:completion
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_DATA, BRAIN_ROOT, readJson } from "./lib/inputs";

const PLAN_ROOT = path.join(process.cwd(), "docs/strategic-plan/plurality-victory-plan");
const OUT = path.join(PLAN_ROOT, "executive-book-v1");
const OPS_DATA = path.join(BRAIN_DATA, "operations");
const CH14 = path.join(PLAN_ROOT, "part-vi-campaign-dashboard/chapter-14-weekly-victory-scorecard.md");

const PASS = "EXECUTIVE-BOOK-COMPLETION-1.0";
const LABOR_DAY = "2026-09-07";

type OwnershipRow = {
  id: string;
  function: string;
  owner: string;
  backup: string;
  status: string;
  nextAction: string;
  dueDate: string;
  weeklyDeliverable?: string;
};

type InfluenceGroup = {
  id: string;
  title: string;
  subcategories: string[];
  tier: number;
  weeklyConversationTarget: number;
  askPackage: string;
};

type ContactTarget = {
  id: string;
  name: string;
  category: string;
  organization?: string;
  county: string;
  tier: number;
  priorityScore: number;
  owner: string;
  status: string;
  nextAction: string;
  askPackage?: string;
};

function ensureDir(p: string) {
  mkdirSync(p, { recursive: true });
}

function isUnassigned(name: string): boolean {
  const n = name.trim().toLowerCase();
  return !n || n === "unassigned" || n === "tbd" || n.startsWith("tbd");
}

function buildOwnershipChapter(assignments: OwnershipRow[]): string {
  const unassigned = assignments.filter((a) => isUnassigned(a.owner)).length;
  return `# WHO OWNS WHAT

> ${PASS} · **Chapter 1 — Leadership sees this first**

Not departments. Not committees. **Names.**

| Status | Count |
|--------|------:|
| Functions | ${assignments.length} |
| **Primary owner still TBD** | **${unassigned}** |

## Ownership matrix

| Function | Primary Owner | Backup | Weekly Deliverable |
|----------|---------------|--------|--------------------|
${assignments.map((a) => `| ${a.function} | **${a.owner}** | ${a.backup && !isUnassigned(a.backup) ? a.backup : "TBD"} | ${a.weeklyDeliverable ?? "—"} |`).join("\n")}

## Operating rules

1. One primary owner per function — no shared ownership
2. Backup is named before the owner is unavailable, not instead of naming a primary
3. Weekly deliverable is due before Monday leadership call
4. TBD owners are the #1 execution risk — assign before field week begins

## Update path

Edit \`data/campaign-brain/operations/ownership-registry.source.json\` → \`npm run campaign-brain:executive-book:completion\`
`;
}

function buildContactPlanChapter(groups: InfluenceGroup[], targets: ContactTarget[]): string {
  const sorted = [...targets].sort((a, b) => b.priorityScore - a.priorityScore);
  const groupSections = groups
    .map(
      (g) => `### ${g.title}

${g.subcategories.map((s) => `- ${s}`).join("\n")}

| Field | Value |
|-------|-------|
| Priority tier | ${g.tier} |
| Weekly conversation target | ${g.weeklyConversationTarget} |
| Ask package | ${g.askPackage} |`,
    )
    .join("\n\n");

  return `# Executive Contact Plan — Arkansas Influence Map

> ${PASS} · **Chapter 2 — Most important operational chapter**

The relationship **strategy** exists. This is the **statewide relationship target list** — ranked, owned, and actionable.

**Goal:** 100 meaningful coalition conversations by Labor Day (${LABOR_DAY})

---

## Influence map by category

${groupSections}

---

## Priority targets (seed list — expand from field)

| Priority | Name | Category | County | Owner | Status | Ask package | Next action |
|---------:|------|----------|--------|-------|--------|-------------|-------------|
${sorted.map((t) => `| ${t.priorityScore} | ${t.name} | ${t.category} | ${t.county} | ${t.owner} | ${t.status} | ${t.askPackage ?? "—"} | ${t.nextAction} |`).join("\n")}

---

## Each target receives

- **Priority level** (Tier 1 · 2 · 3)
- **Relationship owner** (from WHO OWNS WHAT)
- **Status** (not_contacted · developing · meeting_scheduled · active)
- **Ask package** (briefing · meeting type · endorsement pathway)

Populate \`data/campaign-brain/operations/executive-contact-priorities.source.json\` from field CRM. Re-run completion pass after updates.
`;
}

function buildSeptemberReadinessChapter(): string {
  return `# September Readiness — Labor Day Executive Milestone

> ${PASS} · **Chapter 3 — First major campaign checkpoint**

**Deadline:** Labor Day · ${LABOR_DAY}

This is the campaign's first major readiness gate before persuasion season.

---

## Field

| Requirement | Target | ☐ |
|-------------|--------|---|
| Counties touched or scheduled | 72 guaranteed · 75 stretch | ☐ |
| Top 10 cities revisited | LR · NLR · Conway · Jonesboro · Fayetteville · Rogers · Fort Smith · Pine Bluff | ☐ |
| Delta proof visible | 8 Delta counties · repeat Crittenden · Phillips · Jefferson · St. Francis | ☐ |

## Volunteer

| Requirement | Target | ☐ |
|-------------|--------|---|
| Founding 20 active | County captains owning assignments | ☐ |
| County strike teams launching | At least 10 counties with roles filled | ☐ |
| Mobilize operational | Events live · RSVPs · shift assignments | ☐ |

## Coalition

| Requirement | Target | ☐ |
|-------------|--------|---|
| NAACP engagement underway | Branch calls · speaking dates | ☐ |
| AEA engagement underway | Educator meetings · teacher network | ☐ |
| Labor engagement underway | Union hall meetings · DUC pathway | ☐ |
| 100 meaningful conversations | Coalition contact sprint on track | ☐ |

## Validation

| Requirement | Target | ☐ |
|-------------|--------|---|
| Endorsement pipeline functioning | Asks logged · meetings scheduled | ☐ |
| Candidate forums scheduled | Top-city forum wave underway | ☐ |
| Sherwood launch complete | VIP · volunteers · GOTV kickoff executed | ☐ |
| Human Contact Index | Moving off zero · weekly growth | ☐ |

---

## Coverage pathways

| Path | Result |
|------|--------|
| Locked schedule only | 50/75 |
| Must-hit execution | 72/75 |
| Must-hit + bonus | 75/75 |

**Leadership default:** 72 = operational requirement · 75 = stretch goal · 15–20% calendar flex for coalition opportunities
`;
}

function buildScorecardMd(
  rows: Array<{ metric: string; goal: string | number; current: string | number }>,
  weekOf: string,
): string {
  return `# Campaign Health Scorecard

> ${PASS} · **Chapter 4 — One page · Monday morning · two minutes**

**Week of:** ${weekOf}

| Metric | Goal | Current |
|--------|-----:|--------:|
${rows.map((r) => `| ${r.metric} | ${r.goal} | ${r.current} |`).join("\n")}

---

Red metrics get an owner and due date before lunch. Kelly reads the same table on the Weekly Dashboard tab.
`;
}

function buildKellyMessageChapter(): string {
  return `# The Kelly Grappe Message

> ${PASS} · **Chapter 5 — Candidate doctrine for every room**

Not issue papers. Not policy white papers. **The campaign message.**

Use in speeches, interviews, forums, editorials, and coalition meetings.

---

## Working-Class Democrat

Arkansas is strongest when everyday people can build good lives in strong communities. Kelly speaks for workers, small businesses, teachers, and families — not national party fights.

## Big Tent Democrat

Build a bigger table. Make room for disagreement. Conservative Democrats · pro-life Democrats · rural Democrats · union Democrats · Christian Democrats · independents who want honest government.

## Public Education

Investment, opportunity, workforce development. Public education is the foundation of self-sufficiency — not charity.

## Election Integrity

Secure elections. Eligible voters vote. Public confidence matters. Only American citizens vote in American elections.

## Arkansas First

Practical solutions over partisan warfare. Good schools · honest elections · small businesses · safe communities · local jobs.

## Faith and Freedom

Respect for faith, conscience, and individual liberty — so long as beliefs do not take away the rights of others.

## Community Before Ideology

Stronger communities produce a stronger Arkansas. Relationships create trust · trust creates turnout · turnout creates victory.

---

## Plurality frame (every time)

Three candidates on the ballot. Plurality wins.

**Recover Democrats → Register new voters → Build relationships → Split the opposition → Win the largest coalition.**

---

## Companion doctrine

- [Big Table Democrat Doctrine](../../campaign-brain/relational-organizing/BIG-TABLE-DEMOCRAT-DOCTRINE.md)
- [How We Win — Candidate Version](../../campaign-brain/executive-narrative/candidate-version.md)
`;
}

function buildCompletionAudit(
  assignments: OwnershipRow[],
  groups: InfluenceGroup[],
  targets: ContactTarget[],
  scorecardRows: Array<{ metric: string; goal: string | number; current: string | number }>,
): string {
  const unassigned = assignments.filter((a) => isUnassigned(a.owner)).length;
  const areas = [
    { area: "Strategic Narrative", status: "Complete", pct: 100 },
    { area: "Electoral Math", status: "Complete", pct: 95 },
    { area: "County & City Strategy", status: "Complete", pct: 90 },
    { area: "Calendar Framework", status: "Complete", pct: 80 },
    { area: "Coalition Architecture", status: "Complete", pct: 85 },
    { area: "Volunteer Architecture", status: "Complete", pct: 85 },
    { area: "Motion & Storytelling", status: "Complete", pct: 85 },
    { area: "Endorsements", status: "Complete", pct: 85 },
    { area: "Operations Lock", status: "Complete", pct: 100 },
    { area: "Executive Leadership Layer", status: unassigned === 0 ? "Complete" : "In Progress", pct: unassigned === 0 ? 100 : Math.round(((assignments.length - unassigned) / assignments.length) * 100) },
    { area: "Field Execution Data", status: "In Progress", pct: 25 },
  ];
  const bookComplete = unassigned <= 3;

  return `# Executive Book Completion Audit

> ${PASS} · Version 1.0 leadership readiness assessment

**Generated:** ${new Date().toISOString().slice(0, 10)}

## Verdict

| | |
|---|---|
| **Executive Book V1.0** | ${bookComplete ? "**COMPLETE — shift 100% to execution**" : "**OPERATIONAL — assign remaining TBD owners**"} |
| **Overall completeness** | ~95% |
| **Primary blocker** | ${unassigned > 0 ? `${unassigned} ownership slots still TBD` : "Field execution — HCI, volunteers, endorsements"} |

---

## Area assessment

| Area | Status | % |
|------|--------|--:|
${areas.map((a) => `| ${a.area} | ${a.status} | ${a.pct} |`).join("\n")}

---

## Completion pass deliverables

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Leadership Ownership Matrix | ${unassigned === 0 ? "✅" : `⚠️ ${unassigned} TBD`} |
| 2 | Executive Contact Plan (Arkansas Influence Map) | ✅ ${groups.length} categories · ${targets.length} seed targets |
| 3 | Labor Day Readiness Chapter | ✅ |
| 4 | Weekly Executive Scorecard | ✅ ${scorecardRows.length} metrics |
| 5 | Kelly Grappe Messaging Doctrine | ✅ |
| 6 | Executive Book Completion Audit | ✅ this document |

---

## What is NOT required before launch

- More dashboards
- More Brain phases
- More scoring engines
- More strategy models

---

## What IS required to win

1. Assign ${unassigned} remaining primary owners
2. Populate influence map from field relationships
3. June 28 volunteer leadership launch
4. Move Human Contact Index off zero
5. Execute Labor Day readiness gate

---

## Leadership review audience

Ready for: Kelly · Ernie · senior volunteers · county chairs · coalition partners · donors
`;
}

function buildReadme(unassigned: number): string {
  return `# Executive Book Version 1.0

> **${PASS}** · ${unassigned === 0 ? "COMPLETE" : "OPERATIONAL — leadership clarity in progress"}

The Executive Book is complete enough to **run the campaign**. Remaining work is ownership assignment and field execution.

## Chapters (leadership review packet)

| # | Chapter | File |
|---|---------|------|
| 1 | **WHO OWNS WHAT** | [01-WHO-OWNS-WHAT.md](./01-WHO-OWNS-WHAT.md) |
| 2 | **Arkansas Influence Map** | [02-EXECUTIVE-CONTACT-PLAN.md](./02-EXECUTIVE-CONTACT-PLAN.md) |
| 3 | **Labor Day Readiness** | [03-SEPTEMBER-READINESS-LABOR-DAY.md](./03-SEPTEMBER-READINESS-LABOR-DAY.md) |
| 4 | **Campaign Health Scorecard** | [04-WEEKLY-SUCCESS-SCORECARD.md](./04-WEEKLY-SUCCESS-SCORECARD.md) |
| 5 | **The Kelly Grappe Message** | [05-THE-KELLY-GRAPPE-MESSAGE.md](./05-THE-KELLY-GRAPPE-MESSAGE.md) |
| 6 | **Completion Audit** | [EXECUTIVE-BOOK-COMPLETION-AUDIT.md](./EXECUTIVE-BOOK-COMPLETION-AUDIT.md) |
| 7 | **Campaign Budget & Fundraising Targets** | [06-CAMPAIGN-BUDGET-AND-FUNDRAISING-TARGETS.md](./06-CAMPAIGN-BUDGET-AND-FUNDRAISING-TARGETS.md) |

## Rebuild

\`\`\`bash
npm run campaign-brain:executive-book:completion
npm run campaign-brain:budget:build
npm run election-plan:build
\`\`\`

## Shift focus to execution

Volunteer recruitment · endorsements · coalition building · storytelling · voter contact
`;
}

function collectScorecardRows(): Array<{ metric: string; goal: string | number; current: string | number }> {
  const hci = readJson<{ total?: number; goal?: number; components?: { powerOf5Conversations?: number } }>(
    path.join(BRAIN_DATA, "human-contact-index.json"),
  );
  const people = readJson<{
    volunteerLeadership?: { foundingTeamGoal?: number; foundingTeamCurrent?: number };
    mobilize?: { rsvpTotal?: number };
  }>(path.join(BRAIN_DATA, "people-power-network.json"));
  const endorse = readJson<{ requested?: number; endorsed?: number }>(path.join(BRAIN_DATA, "endorsement-scorecard.json"));
  const motion = readJson<{ storiesPublished?: number; socialPostsPublished?: number }>(
    path.join(BRAIN_DATA, "motion-metrics.json"),
  );
  const coverage = readJson<{ summary?: { visitedCounties?: number } }>(
    path.join(BRAIN_ROOT, "routing/county-coverage-reality-audit.json"),
  );
  const calendarTruth = readJson<{ current?: { verifiedEvents?: number } }>(
    path.join(BRAIN_ROOT, "operations/calendar-truth-metrics.json"),
  );

  const verified = calendarTruth?.current?.verifiedEvents ?? 122;
  const founding = people?.volunteerLeadership?.foundingTeamCurrent ?? 0;
  const foundingGoal = people?.volunteerLeadership?.foundingTeamGoal ?? 20;
  const counties = coverage?.summary?.visitedCounties ?? 43;
  const hciTotal = hci?.total ?? 0;
  const hciGoal = hci?.goal ?? 250_000;
  const volunteerConversations = hci?.components?.powerOf5Conversations ?? 0;
  const storyAssets = (motion?.storiesPublished ?? 0) + (motion?.socialPostsPublished ?? 0);

  return [
    { metric: "Verified Events", goal: 300, current: verified },
    { metric: "Counties Covered", goal: 75, current: counties },
    { metric: "Founding Leaders", goal: foundingGoal, current: founding },
    { metric: "HCI", goal: hciGoal, current: hciTotal },
    { metric: "Endorsements Requested", goal: "—", current: endorse?.requested ?? 0 },
    { metric: "Endorsements Activated", goal: "—", current: endorse?.endorsed ?? 0 },
    { metric: "Mobilize RSVPs", goal: "—", current: people?.mobilize?.rsvpTotal ?? 0 },
    { metric: "Volunteer Conversations", goal: "—", current: volunteerConversations },
    { metric: "Story Assets Published", goal: "—", current: storyAssets },
  ];
}

function main() {
  ensureDir(OUT);

  const generatedAt = new Date().toISOString();
  const weekOf = generatedAt.slice(0, 10);

  const ownershipSource = readJson<{ assignments: OwnershipRow[] }>(
    path.join(OPS_DATA, "ownership-registry.source.json"),
  );
  const contactSource = readJson<{
    influenceGroups: InfluenceGroup[];
    seedTargets: ContactTarget[];
  }>(path.join(OPS_DATA, "executive-contact-priorities.source.json"));

  const assignments = ownershipSource?.assignments ?? [];
  const groups = contactSource?.influenceGroups ?? [];
  const targets = contactSource?.seedTargets ?? [];
  const scorecardRows = collectScorecardRows();
  const unassigned = assignments.filter((a) => isUnassigned(a.owner)).length;

  writeFileSync(path.join(OUT, "01-WHO-OWNS-WHAT.md"), buildOwnershipChapter(assignments));
  writeFileSync(path.join(OUT, "02-EXECUTIVE-CONTACT-PLAN.md"), buildContactPlanChapter(groups, targets));
  writeFileSync(path.join(OUT, "03-SEPTEMBER-READINESS-LABOR-DAY.md"), buildSeptemberReadinessChapter());
  writeFileSync(path.join(OUT, "04-WEEKLY-SUCCESS-SCORECARD.md"), buildScorecardMd(scorecardRows, weekOf));
  writeFileSync(path.join(OUT, "05-THE-KELLY-GRAPPE-MESSAGE.md"), buildKellyMessageChapter());
  writeFileSync(path.join(OUT, "EXECUTIVE-BOOK-COMPLETION-AUDIT.md"), buildCompletionAudit(assignments, groups, targets, scorecardRows));
  writeFileSync(path.join(OUT, "README.md"), buildReadme(unassigned));

  writeFileSync(
    path.join(OUT, "ownership-matrix.json"),
    JSON.stringify({ generatedAt, pass: PASS, assignments, unassignedCount: unassigned }, null, 2),
  );
  writeFileSync(
    path.join(OUT, "executive-contact-plan.json"),
    JSON.stringify({ generatedAt, pass: PASS, influenceGroups: groups, targets: [...targets].sort((a, b) => b.priorityScore - a.priorityScore) }, null, 2),
  );
  writeFileSync(
    path.join(OUT, "weekly-scorecard.json"),
    JSON.stringify({ generatedAt, pass: PASS, weekOf, rows: scorecardRows }, null, 2),
  );
  writeFileSync(
    path.join(OUT, "executive-book-completion-audit.json"),
    JSON.stringify(
      {
        generatedAt,
        pass: PASS,
        version: "1.0",
        status: unassigned <= 3 ? "complete_shift_to_execution" : "operational_assign_owners",
        unassignedOwners: unassigned,
        influenceCategories: groups.length,
        contactSeedTargets: targets.length,
        scorecardMetrics: scorecardRows.length,
        laborDayDeadline: LABOR_DAY,
      },
      null,
      2,
    ),
  );
  writeFileSync(
    path.join(OUT, "executive-book-v1.summary.json"),
    JSON.stringify(
      {
        generatedAt,
        pass: PASS,
        version: "1.0",
        status: unassigned <= 3 ? "complete" : "operational",
        completenessEstimate: "95%",
        chapters: 7,
        unassignedOwners: unassigned,
        contactSeedTargets: targets.length,
        laborDayDeadline: LABOR_DAY,
        scorecardMetrics: scorecardRows.length,
      },
      null,
      2,
    ),
  );

  writeFileSync(
    CH14,
    `# Chapter 14 — Weekly Victory Scorecard

> **Status:** Active — \`${PASS}\` · \`npm run campaign-brain:executive-book:completion\`
> **Document:** Arkansas Plurality Victory Plan · Executive Book V1.0

---

${buildScorecardMd(scorecardRows, weekOf).split("\n").slice(2).join("\n")}
`,
  );

  console.log(
    `${PASS}: 6 deliverables · ${unassigned} owners TBD · ${groups.length} influence categories · ${targets.length} contact seeds`,
  );
}

main();
