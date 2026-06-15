import fs from "node:fs";
import path from "node:path";

const weeks5to8 = [
  { w: 5, range: "2026-07-13 → 2026-07-19", cluster: "North Central Ozarks Cluster", cities: ["Searcy (White)", "Mountain Home (Baxter)"], mission: "Ozark fairs · Newton · Fulton · White County Fair prep", events: ["Newton County Fair Aug 14", "Fulton County Fair Jul 10", "White County Fair Sep 14"] },
  { w: 6, range: "2026-07-20 → 2026-07-26", cluster: "Hot Springs & Ouachita Cluster", cities: ["Hot Springs (Garland)", "Arkadelphia (Clark)"], mission: "Spa City visibility · Ouachita clerk outreach", events: ["Little River County Fair Aug 17", "Nevada County Fair Sep 10", "Pike County Fair Sep 7"] },
  { w: 7, range: "2026-07-27 → 2026-08-02", cluster: "Southeast Delta Cluster", cities: ["Pine Bluff (Jefferson)", "Stuttgart (Arkansas)"], mission: "Delta base recovery · Lane 2 focus", events: ["Ashley County Fair Sep 4", "Jefferson County outreach"] },
  { w: 8, range: "2026-08-03 → 2026-08-09", cluster: "Southwest Arkansas Cluster", cities: ["Texarkana (Miller)", "El Dorado (Union)"], mission: "Border media · Union County Fair Jul 23", events: ["Lafayette County Fair Aug 31", "Union County Fair Jul 23"] },
];

const skeleton9to20 = [
  { w: 9, range: "2026-08-10 → 2026-08-16", cluster: "Central Arkansas Metro Cluster", cities: ["Little Rock", "Conway"], mission: "Return to base · Lawrence County Fair Aug 10", events: ["Lawrence County Fair", "Pulaski registration drives"] },
  { w: 10, range: "2026-08-17 → 2026-08-23", cluster: "Northwest Arkansas Cluster", cities: ["Fayetteville", "Rogers"], mission: "NWA fair season peak · Benton County Fair Sep 25 prep", events: ["Little River Fair Aug 17", "Randolph County Fair Aug 24"] },
  { w: 11, range: "2026-08-24 → 2026-08-30", cluster: "River Valley Cluster", cities: ["Fort Smith", "Russellville"], mission: "Clerk conferences · Pope county model", events: ["Randolph Fair Aug 24", "Crawford Fair Sep 12 prep"] },
  { w: 12, range: "2026-08-31 → 2026-09-06", cluster: "Northeast Arkansas Cluster", cities: ["Jonesboro", "Paragould"], mission: "NE fair circuit · ASU registration", events: ["Lafayette County Fair Aug 31", "Yell County Fair Sep 7"] },
  { w: 13, range: "2026-09-07 → 2026-09-13", cluster: "North Central Ozarks Cluster", cities: ["Mountain Home", "Searcy"], mission: "Ozark fair peak", events: ["Yell · Pike · Crawford fairs"] },
  { w: 14, range: "2026-09-14 → 2026-09-20", cluster: "Hot Springs & Ouachita Cluster", cities: ["Hot Springs", "Malvern"], mission: "Garland · Hot Spring counties", events: ["White County Fair Sep 14", "Nevada County Fair Sep 10"] },
  { w: 15, range: "2026-09-21 → 2026-09-27", cluster: "Southeast Delta Cluster", cities: ["Pine Bluff", "Helena-West Helena"], mission: "Delta GOTV foundation", events: ["Lonoke County Fair Sep 23", "Clay County Fair Sep 12"] },
  { w: 16, range: "2026-09-28 → 2026-10-04", cluster: "Southwest Arkansas Cluster", cities: ["Texarkana", "El Dorado"], mission: "SW persuasion · fair closeout", events: ["Ashley · Lafayette fairs"] },
  { w: 17, range: "2026-10-05 → 2026-10-11", cluster: "Central Arkansas Metro Cluster", cities: ["Little Rock", "Sherwood"], mission: "Metro GOTV · early vote prep", events: ["Benton County Fair Sep 25", "Chamber · Rotary"] },
  { w: 18, range: "2026-10-12 → 2026-10-18", cluster: "Northwest Arkansas Cluster", cities: ["Springdale", "Bentonville"], mission: "NWA GOTV · student turnout", events: ["Campus · early vote sites"] },
  { w: 19, range: "2026-10-19 → 2026-10-25", cluster: "Statewide GOTV Sprint", cities: ["All clusters"], mission: "Phone banks · postcards · Po5 activation", events: ["No new fairs — turnout operations"] },
  { w: 20, range: "2026-10-26 → 2026-11-03", cluster: "Election Week", cities: ["Statewide"], mission: "Election Day execution · clerk support · final push", events: ["Election Day Nov 3 · poll monitoring · thank-you"] },
];

const dir = "docs/strategic-plan/plurality-victory-plan/part-iv-twenty-week-execution/chapter-10-twenty-weeks-to-victory/weeks";
const plan = { version: 1, generatedAt: new Date().toISOString(), weeks: [] };

for (const x of [...weeks5to8, ...skeleton9to20]) {
  const pad = String(x.w).padStart(2, "0");
  const body = `# Week ${pad} — ${x.cluster.replace(" Cluster", "")}

> **Range:** ${x.range}  
> **Status:** FRAMEWORK — cluster · cities · mission assigned; detail as Calendar Truth matures  
> **Document:** Arkansas Plurality Victory Plan · Part IV

---

## Week Focus

${x.mission}

---

## Primary Cluster

**${x.cluster}**

---

## Cities

${x.cities.map((c) => `- ${c}`).join("\n")}

---

## County Targets

Assign county captains in cluster counties · primary missions from county playbooks · Lane focus per playbook tier.

---

## Events

${x.events.map((e) => `- ${e}`).join("\n")}

---

## Volunteer Objectives

- County strike team coverage in cluster
- Power of 5 conversations (weekly target: 200+)
- Phone bank / postcard session (1+ per cluster county)

---

## Coalition Objectives

- 2+ endorsement meetings in cluster
- Faith + clerk touchpoints per county playbook

---

## Fundraising Objectives

- House party or VIP event in cluster (1)
- Donor thank-you cadence maintained

---

## Storytelling Objectives

- 1+ Substack story from cluster
- Social proof from local validators

---

## Metrics

| Metric | Target |
| ------ | -----: |
| Kelly/surrogate stops | 3+ |
| Stories captured | 1 |
| Po5 conversations | 200 |
| Registration forms | 250 |
`;
  fs.writeFileSync(path.join(dir, `week-${pad}.md`), body);
  plan.weeks.push({
    weekNumber: x.w,
    range: x.range,
    status: x.w <= 8 ? "framework" : "skeleton",
    cluster: x.cluster,
    cities: x.cities,
    focus: x.mission,
    events: x.events,
  });
}

// Weeks 1-4 for JSON
const w14 = [
  { w: 1, range: "2026-06-15 → 2026-06-21", cluster: "Central Arkansas Metro Cluster", cities: ["Little Rock", "North Little Rock", "Sherwood"], focus: "Central Metro launch · Sherwood prep · June 28 volunteer launch", status: "operational" },
  { w: 2, range: "2026-06-22 → 2026-06-28", cluster: "Northwest Arkansas Cluster", cities: ["Fayetteville", "Springdale"], focus: "NWA · June 28 volunteer launch · Benton Fair prep", status: "operational" },
  { w: 3, range: "2026-06-29 → 2026-07-05", cluster: "River Valley Cluster", cities: ["Fort Smith", "Russellville"], focus: "River Valley · July 4 corridor · clerk outreach", status: "operational" },
  { w: 4, range: "2026-07-06 → 2026-07-12", cluster: "Northeast Arkansas Cluster", cities: ["Jonesboro", "Paragould"], focus: "NE fair circuit · Jonesboro hub", status: "operational" },
];
plan.weeks = [...w14.map((x) => ({ weekNumber: x.w, range: x.range, status: x.status, cluster: x.cluster, cities: x.cities, focus: x.focus, events: [] })), ...plan.weeks];

fs.writeFileSync("data/election-plan/twenty-week-plan.json", JSON.stringify(plan, null, 2));
console.log("Done:", plan.weeks.length, "weeks");
