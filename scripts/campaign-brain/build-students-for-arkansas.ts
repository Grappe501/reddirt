/**
 * Kelly Grappe Students for Arkansas — statewide student movement program.
 *
 * Usage: npm run campaign-brain:students-for-arkansas:build
 */

import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_DATA, BRAIN_ROOT, readJson } from "./lib/inputs";

const SFA_DATA = path.join(BRAIN_DATA, "students-for-arkansas");
const SFA_DOCS = path.join(BRAIN_ROOT, "students-for-arkansas");
const EXEC_BOOK = path.join(process.cwd(), "docs/strategic-plan/plurality-victory-plan/executive-book-v1");
const PP_VOL = path.join(BRAIN_ROOT, "people-power/volunteer-network");
const PASS = "STUDENTS-FOR-ARKANSAS-1.0";
const LABOR_DAY = "2026-09-07";
const OCTOBER_GATE = "2026-10-01";
const ELECTION_DAY = "2026-11-03";

const CAMPUS_ROLES = [
  "Campus Chair",
  "Voter Registration Director",
  "Events Director",
  "Volunteer Director",
  "Communications Director",
  "Fundraising Director",
];

const INTERNSHIP_TRACKS = [
  { id: "field", label: "Field Organizing", activities: ["Events", "Meet-and-greets", "Volunteer recruitment", "County immersions"] },
  { id: "digital", label: "Digital Media", activities: ["Reels", "TikTok", "Instagram", "Photography"] },
  { id: "research", label: "Research", activities: ["Campus issues", "Student voter participation", "Local community research"] },
  { id: "communications", label: "Communications", activities: ["Press releases", "Substack stories", "Newsletter support"] },
  { id: "events", label: "Event Operations", activities: ["Mobilize", "Check-in systems", "Volunteer management"] },
];

const MILESTONES = {
  laborDay: {
    label: "By Labor Day",
    date: LABOR_DAY,
    coChairs: 5,
    campusLeaders: 25,
    studentVolunteers: 100,
    voterRegistrations: 500,
  },
  october: {
    label: "By October 1",
    date: OCTOBER_GATE,
    activeCampuses: 10,
    studentVolunteers: 250,
    voterRegistrations: 2500,
  },
  electionDay: {
    label: "Election Day",
    date: ELECTION_DAY,
    studentVolunteers: 500,
    voterRegistrations: 5000,
    mediaMarkets: "Student presence in every major media market",
  },
};

const MONTHLY_REQUIREMENTS = [
  "One voter registration event",
  "One volunteer recruitment event",
  "One community service project",
  "One fundraising event",
];

const SEMESTER_REQUIREMENTS = [
  "One Kelly campus event",
  "One debate watch event",
  "One candidate forum",
  "One GOTV event",
];

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

function buildExecutiveChapter(summary: Record<string, unknown>): string {
  const coChairs = summary.foundingCoChairs as Array<Record<string, unknown>>;
  const metrics = summary.metrics as Record<string, number>;
  const targets = summary.milestones as typeof MILESTONES;

  return `# Kelly Grappe Students for Arkansas

> ${PASS} · **Executive Book Chapter 9 — Youth leadership pipeline**

18–24 year-olds are one of the few groups where a **relatively small investment** can produce a large number of new voters, volunteers, content creators, and future campaign leaders.

The goal is not simply campus outreach. The goal is a **statewide student movement that survives beyond Election Day**.

---

## Mission

Build a student-led statewide organization that:

- Registers students to vote
- Educates students about elections
- Increases turnout among 18–24 year-olds
- Creates future civic leaders
- Builds long-term relationships on Arkansas campuses
- Serves as a leadership pipeline for the campaign

---

## Founding co-chairs

| Role | Name | Status | Lead focus |
|------|------|--------|------------|
${coChairs
  .map(
    (c) =>
      `| ${c.title} | ${c.name ?? "**OPEN**"} | ${c.status} | ${c.leadCampus ?? "—"} |`,
  )
  .join("\n")}

**Confirmed:** Chance Bradford (HBCU) · Xav McLennon (Central Arkansas) · **3 co-chair seats open**

---

## Campus Captain Program

Every campus chapter includes:

${CAMPUS_ROLES.map((r) => `- **${r}**`).join("\n")}

---

## Summer internship program

${INTERNSHIP_TRACKS.map((t) => `- **${t.label}** — ${t.activities.join(" · ")}`).join("\n")}

---

## Fall campus plan

### Freshman Week Blitz

Target every major campus — registration tables · volunteer signups · merchandise · event invitations · leadership recruitment.

**Goal:** Every freshman should have the opportunity to meet a Kelly volunteer.

### Campus speaking tour

Campus teams schedule Kelly visits: civic forums · SOS discussions · leadership panels · registration events · community service.

---

## Fundraising program

Student-led events: pizza nights · cookouts · coffee events · music nights · yard games · tailgates.

**Revenue sharing:** **15%** fundraising commission returned to campus chapter for materials, supplies, events, and membership growth.

---

## Chapter requirements

**Monthly:** ${MONTHLY_REQUIREMENTS.join(" · ")}

**Semester:** ${SEMESTER_REQUIREMENTS.join(" · ")}

---

## Power of 5 integration

Every student leader recruits five. Every volunteer recruits five. Every event attendee is asked to recruit five.

A chapter of **20 leaders** can become **100 active volunteers · 500 supporters · thousands of student contacts** without large financial investment.

---

## Leadership targets (live)

| Milestone | Co-chairs | Leaders | Volunteers | Registrations |
|-----------|----------:|--------:|-----------:|--------------:|
| ${targets.laborDay.label} | ${targets.laborDay.coChairs} | ${targets.laborDay.campusLeaders} | ${targets.laborDay.studentVolunteers} | ${fmt(targets.laborDay.voterRegistrations)} |
| ${targets.october.label} | — | — | ${targets.october.studentVolunteers} | ${fmt(targets.october.voterRegistrations)} |
| ${targets.electionDay.label} | — | — | ${targets.electionDay.studentVolunteers}+ | ${fmt(targets.electionDay.voterRegistrations)}+ |

### Current progress

| Metric | Current |
|--------|--------:|
| Co-chairs confirmed | ${metrics.coChairsConfirmed} / ${metrics.coChairsGoal} |
| Campus leaders | ${metrics.campusLeaders} / ${metrics.campusLeadersLaborDayGoal} |
| Student volunteers | ${metrics.studentVolunteers} |
| Voter registrations | ${metrics.voterRegistrations} |
| Active campuses | ${metrics.activeCampuses} / ${metrics.activeCampusesOctoberGoal} |
| Campuses in inventory | ${metrics.campusesInInventory} |

---

## Integration

| System | Connection |
|--------|------------|
| People Power Network | Campus chapters · Mobilize · volunteer pipeline |
| June 28 Founding Call | Students for Arkansas launch segment |
| Power of 5 | Student leader → five → network multiplication |
| Citizen Voices Network | Young Arkansas Voices content category |
| GOTV (Chapter 10) | Student volunteers deploy at Election Day |

---

## Rebuild

\`\`\`bash
npm run campaign-brain:students-for-arkansas:build
npm run election-plan:build
\`\`\`

Shareable chapter: \`/election-plan/executive-book/students-for-arkansas\`
`;
}

function buildOperatingManual(summary: Record<string, unknown>): string {
  return `# Kelly Grappe Students for Arkansas

> ${PASS} · **Statewide student movement — not just campus outreach**

${buildExecutiveChapter(summary).replace(/^# Kelly Grappe Students for Arkansas\n\n> ${PASS} · \*\*Executive Book Chapter 9[^*]+\*\*\n\n[^#]+---\n\n/, "")}`;
}

function buildJune28Brief(summary: Record<string, unknown>): string {
  const coChairs = summary.foundingCoChairs as Array<Record<string, unknown>>;
  return `# June 28 Founding Volunteer Call — Students for Arkansas Segment

> For the **June 28 · 6 PM · Zoom** Volunteer Leadership Launch

## Segment purpose (10–15 minutes)

Introduce **Kelly Grappe Students for Arkansas** as a major People Power pillar — not a side project.

## Key message

18–24 year-olds are one of the highest-ROI investments in the campaign: new voters · volunteers · content creators · future leaders.

## Founding co-chairs to recognize

${coChairs
  .filter((c) => c.status === "confirmed")
  .map((c) => `- **${c.name}** — ${c.title}`)
  .join("\n")}

## Open seats to recruit on the call

${coChairs
  .filter((c) => c.status === "open")
  .map((c) => `- ${c.title} — target: ${c.leadCampus}`)
  .join("\n")}

## Ask on the call

1. Who knows a student leader on an Arkansas campus?
2. Who can connect us to a campus advisor or student government president?
3. Who will host a **Power of 5** conversation with five students this month?

## Labor Day targets

- 5 co-chairs · 25 campus leaders · 100 student volunteers · 500 registrations

Data: \`data/campaign-brain/students-for-arkansas/students-for-arkansas.json\`
`;
}

function buildVolunteerLeadershipAugment(pp: {
  volunteerLeadership?: { foundingTeamGoal?: number; foundingTeamCurrent?: number; launchCall?: Record<string, string> };
}): string {
  const launch = pp?.volunteerLeadership?.launchCall;
  return `# Volunteer Leadership Network

## June 28 Launch Call

| | |
| --- | --- |
| **Date** | June 28, 2026 |
| **Time** | 6 PM Central |
| **Format** | Zoom |
| **Founding team goal** | **${pp?.volunteerLeadership?.foundingTeamGoal ?? 20} volunteers** |
| **Current** | ${pp?.volunteerLeadership?.foundingTeamCurrent ?? 0} / ${pp?.volunteerLeadership?.foundingTeamGoal ?? 20} |
| **Purpose** | Launch Volunteer Leadership Network **+ Students for Arkansas** |

### Students for Arkansas segment

See [June 28 Students Brief](../students-for-arkansas/JUNE-28-LAUNCH-BRIEF.md) · Executive Book [Chapter 9](../../../strategic-plan/plurality-victory-plan/executive-book-v1/08-STUDENTS-FOR-ARKANSAS.md)

---

## Kelly Grappe Students for Arkansas

Major People Power pillar — campus chapters · internships · Freshman Week Blitz · Power of 5 student network.

| | |
| --- | --- |
| **Program** | Kelly Grappe Students for Arkansas |
| **Co-chairs confirmed** | Chance Bradford (HBCU) · Xav McLennon (Central AR) |
| **Labor Day target** | 5 co-chairs · 25 leaders · 100 volunteers · 500 registrations |
| **Manual** | [STUDENTS-FOR-ARKANSAS.md](../students-for-arkansas/STUDENTS-FOR-ARKANSAS.md) |

---

## July Retreat — Forevermost Farms

Build ownership · relationships · leadership training · Power of 5 launch · county mission assignments · **student co-chair onboarding**

---

## Monthly Leadership Calls

| | |
| --- | --- |
| **Schedule** | Last Sunday of each month · 6 PM |
| **Format** | Statewide Zoom |

Track: attendance · counties represented · volunteer growth · **campus chapter growth** · action assignments

Data: [\`people-power-network.json\`](../../../data/campaign-brain/people-power-network.json) · [\`students-for-arkansas.json\`](../../../data/campaign-brain/students-for-arkansas/students-for-arkansas.json)
`;
}

function main() {
  mkdirSync(SFA_DATA, { recursive: true });
  mkdirSync(SFA_DOCS, { recursive: true });
  mkdirSync(PP_VOL, { recursive: true });
  mkdirSync(EXEC_BOOK, { recursive: true });

  const leadership = readJson<{ coChairs: Array<Record<string, unknown>> }>(
    path.join(SFA_DATA, "founding-leadership.source.json"),
  );
  const inventory = readJson<{ campuses: Array<Record<string, unknown>> }>(
    path.join(SFA_DATA, "campus-inventory.source.json"),
  );
  const chaptersSource = readJson<{ chapters: Array<Record<string, unknown>> }>(
    path.join(SFA_DATA, "campus-chapters.source.json"),
  );
  const pp = readJson<{ volunteerLeadership?: { foundingTeamGoal?: number; foundingTeamCurrent?: number } }>(
    path.join(BRAIN_DATA, "people-power-network.json"),
  );

  const coChairs = leadership?.coChairs ?? [];
  const campuses = inventory?.campuses ?? [];
  const chapters = chaptersSource?.chapters ?? [];

  const coChairsConfirmed = coChairs.filter((c) => c.status === "confirmed").length;
  const campusLeaders = chapters.reduce((s, c) => s + ((c.leaders as number) ?? 0), 0);
  const studentVolunteers = chapters.reduce((s, c) => s + ((c.volunteers as number) ?? 0), 0);
  const voterRegistrations = chapters.reduce((s, c) => s + ((c.registrations as number) ?? 0), 0);
  const activeCampuses = chapters.filter((c) => c.status === "active").length;

  const generatedAt = new Date().toISOString();

  const summary = {
    generatedAt,
    pass: PASS,
    programName: "Kelly Grappe Students for Arkansas",
    mission:
      "Student-led statewide organization — register · educate · turn out 18–24 year-olds · build civic leaders · campus relationships · leadership pipeline",
    doctrine:
      "Not campus outreach alone — a statewide student movement that survives beyond Election Day",
    laborDayDeadline: LABOR_DAY,
    octoberGate: OCTOBER_GATE,
    electionDay: ELECTION_DAY,
    foundingCoChairs: coChairs,
    coChairsConfirmed,
    coChairsOpen: coChairs.filter((c) => c.status === "open").length,
    campusRoles: CAMPUS_ROLES,
    internshipTracks: INTERNSHIP_TRACKS,
    fundraisingCommissionPercent: 15,
    monthlyRequirements: MONTHLY_REQUIREMENTS,
    semesterRequirements: SEMESTER_REQUIREMENTS,
    milestones: MILESTONES,
    powerOf5Integration:
      "Every student leader recruits five · 20 leaders → 100 volunteers → 500 supporters",
    metrics: {
      coChairsConfirmed,
      coChairsGoal: MILESTONES.laborDay.coChairs,
      campusLeaders,
      campusLeadersLaborDayGoal: MILESTONES.laborDay.campusLeaders,
      studentVolunteers,
      studentVolunteersLaborDayGoal: MILESTONES.laborDay.studentVolunteers,
      voterRegistrations,
      voterRegistrationsLaborDayGoal: MILESTONES.laborDay.voterRegistrations,
      voterRegistrationsOctoberGoal: MILESTONES.october.voterRegistrations,
      voterRegistrationsElectionGoal: MILESTONES.electionDay.voterRegistrations,
      activeCampuses,
      activeCampusesOctoberGoal: MILESTONES.october.activeCampuses,
      campusesInInventory: campuses.length,
    },
  };

  writeFileSync(path.join(SFA_DATA, "students-for-arkansas.json"), JSON.stringify(summary, null, 2));
  writeFileSync(path.join(SFA_DATA, "campus-inventory.json"), JSON.stringify({ generatedAt, pass: PASS, campuses }, null, 2));
  writeFileSync(path.join(SFA_DATA, "campus-chapters.json"), JSON.stringify({ generatedAt, pass: PASS, chapters }, null, 2));
  writeFileSync(path.join(SFA_DATA, "founding-leadership.json"), JSON.stringify({ generatedAt, pass: PASS, coChairs }, null, 2));

  writeFileSync(path.join(SFA_DOCS, "STUDENTS-FOR-ARKANSAS.md"), buildOperatingManual(summary));
  writeFileSync(path.join(SFA_DOCS, "JUNE-28-LAUNCH-BRIEF.md"), buildJune28Brief(summary));
  writeFileSync(path.join(SFA_DOCS, "students-for-arkansas.summary.json"), JSON.stringify(summary, null, 2));

  writeFileSync(path.join(EXEC_BOOK, "08-STUDENTS-FOR-ARKANSAS.md"), buildExecutiveChapter(summary));
  try {
    unlinkSync(path.join(EXEC_BOOK, "09-STUDENTS-FOR-ARKANSAS.md"));
  } catch {
    // noop
  }

  writeFileSync(path.join(PP_VOL, "volunteer-leadership-network.md"), buildVolunteerLeadershipAugment(pp ?? {}));

  console.log(
    `Students for Arkansas: ${coChairsConfirmed}/${coChairs.length} co-chairs · ${campuses.length} campuses · ${activeCampuses} active chapters · Labor Day target ${MILESTONES.laborDay.studentVolunteers} volunteers`,
  );
}

main();
