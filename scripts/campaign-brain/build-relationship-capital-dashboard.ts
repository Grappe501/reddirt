/**
 * Relationship Capital — fifth execution engine (underneath Four Lanes).
 *
 * Usage: npm run campaign-brain:relational:build
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_DATA, BRAIN_ROOT, fmt, ARKANSAS_COUNTY_REGISTRY, shortCountyName } from "./lib/inputs";

const OUT = path.join(BRAIN_ROOT, "relational-organizing");

type CountGoal = { deployed?: number; completed?: number; sent?: number; active?: number; goal: number };
type ProgramRow = { completed?: number; scheduled?: number; active?: number; planned?: number; goal: number };

type RelationshipAssetsFile = {
  version: number;
  doctrine?: string;
  statewide: {
    signs: CountGoal;
    shirts: CountGoal;
    buttons: CountGoal;
    flags: CountGoal;
  };
  programs: {
    houseParties: ProgramRow;
    civicClubMeetings: ProgramRow;
    faithEvents: ProgramRow;
    postcardTeams: ProgramRow;
  };
  relationshipCapital: Record<string, number>;
  phoneBanks: Record<string, CountGoal>;
  postcardPrograms: Record<string, { sent: number; goal: number }>;
  localShirtEditions: Array<{
    edition: string;
    city: string;
    county: string;
    vendor: string;
    deployed: number;
    goal: number;
  }>;
  byCounty: Record<
    string,
    {
      signs?: number;
      shirts?: number;
      buttons?: number;
      flags?: number;
      churchesVisited?: number;
      civicClubsVisited?: number;
      houseParties?: number;
    }
  >;
};

function pct(current: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.round((current / goal) * 1000) / 10;
}

function loadAssets(): RelationshipAssetsFile {
  const p = path.join(BRAIN_DATA, "relationship-assets.json");
  if (!existsSync(p)) throw new Error("Missing relationship-assets.json");
  return JSON.parse(readFileSync(p, "utf8")) as RelationshipAssetsFile;
}

function ensureCountyRows(data: RelationshipAssetsFile): RelationshipAssetsFile {
  const byCounty = { ...data.byCounty };
  for (const reg of ARKANSAS_COUNTY_REGISTRY) {
    const county = shortCountyName(reg.displayName);
    if (!byCounty[county]) {
      byCounty[county] = {
        signs: 0,
        shirts: 0,
        buttons: 0,
        flags: 0,
        churchesVisited: 0,
        civicClubsVisited: 0,
        houseParties: 0,
      };
    }
  }
  return { ...data, byCounty };
}

function main() {
  mkdirSync(OUT, { recursive: true });
  const raw = ensureCountyRows(loadAssets());
  const s = raw.statewide;
  const rc = raw.relationshipCapital;
  const p = raw.programs;

  const assetRows = [
    { name: "Yard signs", current: s.signs.deployed ?? 0, goal: s.signs.goal },
    { name: "Shirts", current: s.shirts.deployed ?? 0, goal: s.shirts.goal },
    { name: "Buttons", current: s.buttons.deployed ?? 0, goal: s.buttons.goal },
    { name: "Flags", current: s.flags.deployed ?? 0, goal: s.flags.goal },
  ];

  const programRows = [
    {
      name: "House parties",
      completed: p.houseParties.completed ?? 0,
      scheduled: p.houseParties.scheduled ?? 0,
      goal: p.houseParties.goal,
    },
    {
      name: "Civic club meetings",
      completed: p.civicClubMeetings.completed ?? 0,
      scheduled: p.civicClubMeetings.scheduled ?? 0,
      goal: p.civicClubMeetings.goal,
    },
    {
      name: "Faith events",
      completed: p.faithEvents.completed ?? 0,
      scheduled: p.faithEvents.scheduled ?? 0,
      goal: p.faithEvents.goal,
    },
    {
      name: "Postcard teams",
      completed: p.postcardTeams.active ?? 0,
      scheduled: p.postcardTeams.planned ?? 0,
      goal: p.postcardTeams.goal,
    },
  ];

  const capitalMetrics = [
    { key: "signsDeployed", label: "Signs deployed", value: s.signs.deployed ?? 0, goal: s.signs.goal },
    { key: "shirtsDistributed", label: "Shirts distributed", value: s.shirts.deployed ?? 0, goal: s.shirts.goal },
    { key: "buttonsDistributed", label: "Buttons distributed", value: s.buttons.deployed ?? 0, goal: s.buttons.goal },
    { key: "flagsDistributed", label: "Flags distributed", value: s.flags.deployed ?? 0, goal: s.flags.goal },
    { key: "housePartiesHeld", label: "House parties held", value: p.houseParties.completed ?? 0, goal: p.houseParties.goal },
    { key: "civicClubsVisited", label: "Civic clubs visited", value: rc.civicClubsVisited ?? 0, goal: p.civicClubMeetings.goal },
    { key: "churchesVisited", label: "Churches visited", value: rc.churchesVisited ?? 0, goal: p.faithEvents.goal },
    { key: "localBusinessesHighlighted", label: "Local businesses highlighted", value: rc.localBusinessesHighlighted ?? 0, goal: 200 },
    { key: "postcardsWritten", label: "Postcards written", value: rc.postcardsWritten ?? 0, goal: 40000 },
    { key: "phoneCallsCompleted", label: "Phone calls completed", value: rc.phoneCallsCompleted ?? 0, goal: 27000 },
    { key: "canvassDoorsKnocked", label: "Canvass doors knocked", value: rc.canvassDoorsKnocked ?? 0, goal: 50000 },
  ];

  const capitalIndex = Math.round(
    capitalMetrics.reduce((sum, m) => sum + Math.min(100, pct(m.value, m.goal)), 0) / capitalMetrics.length,
  );

  const countyDistribution = Object.entries(raw.byCounty)
    .map(([county, row]) => ({
      county,
      signs: row.signs ?? 0,
      shirts: row.shirts ?? 0,
      buttons: row.buttons ?? 0,
      flags: row.flags ?? 0,
      total: (row.signs ?? 0) + (row.shirts ?? 0) + (row.buttons ?? 0) + (row.flags ?? 0),
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  const output = {
    generatedAt: new Date().toISOString(),
    engine: "Relational Organizing Engine",
    role: "Fifth execution engine — mechanism through which Four Lanes move",
    doctrine: raw.doctrine,
    relationshipCapitalIndex: capitalIndex,
    assets: assetRows.map((r) => ({ ...r, completionPct: pct(r.current, r.goal) })),
    programs: programRows,
    relationshipCapital: capitalMetrics.map((m) => ({ ...m, completionPct: pct(m.value, m.goal) })),
    phoneBanks: Object.entries(raw.phoneBanks).map(([type, row]) => ({
      type,
      completed: row.completed ?? 0,
      goal: row.goal,
      completionPct: pct(row.completed ?? 0, row.goal),
    })),
    postcardPrograms: Object.entries(raw.postcardPrograms).map(([type, row]) => ({
      type,
      sent: row.sent,
      goal: row.goal,
      completionPct: pct(row.sent, row.goal),
    })),
    localShirtEditions: raw.localShirtEditions,
    countyDistribution,
  };

  writeFileSync(path.join(OUT, "relationship-capital.json"), JSON.stringify(output, null, 2), "utf8");

  const md = `# Relationship Capital Dashboard

> **Fifth execution engine** — underneath the Four Lanes. All lanes depend on human relationships.

**Relationship Capital Index:** ${capitalIndex}/100

Doctrine: *${raw.doctrine}*

Companion: [Four Lanes Dashboard](../strategic-plan/plurality-victory-plan/command-center/four-lanes-dashboard.md)

Update source: [\`relationship-assets.json\`](../../data/campaign-brain/relationship-assets.json)

---

## Theory

| Four Lanes measure | Relationship Capital measures |
| ---------------- | ----------------------------- |
| Votes to retain · reactivate · register · convert | **Trust assets** that make lane work possible |

> Relationships create trust. Trust creates turnout. Turnout creates victory.

---

## Physical assets

| Asset | Deployed | Goal | Completion |
| ----- | -------: | ---: | ---------: |
${assetRows.map((r) => `| ${r.name} | ${fmt(r.current)} | ${fmt(r.goal)} | ${pct(r.current, r.goal)}% |`).join("\n")}

---

## Programs

| Program | Completed / Active | Scheduled / Planned | Goal |
| ------- | -----------------: | ------------------: | ---: |
${programRows.map((r) => `| ${r.name} | ${r.completed} | ${r.scheduled} | ${r.goal} |`).join("\n")}

---

## Relationship Capital (rollup)

| Metric | Current | Goal | Completion |
| ------ | ------: | ---: | ---------: |
${capitalMetrics.map((m) => `| ${m.label} | ${fmt(m.value)} | ${fmt(m.goal)} | ${pct(m.value, m.goal)}% |`).join("\n")}

---

## Phone banks

| Type | Completed | Goal |
| ---- | --------: | ---: |
${output.phoneBanks.map((r) => `| ${r.type.replace(/([A-Z])/g, " $1").trim()} | ${fmt(r.completed)} | ${fmt(r.goal)} |`).join("\n")}

---

## Postcard programs

| Program | Sent | Goal |
| ------- | ---: | ---: |
${output.postcardPrograms.map((r) => `| ${r.type.replace(/([A-Z])/g, " $1").trim()} | ${fmt(r.sent)} | ${fmt(r.goal)} |`).join("\n")}

---

## Local shirt editions

| Edition | County | Vendor | Deployed | Goal |
| ------- | ------ | ------ | -------: | ---: |
${raw.localShirtEditions.map((e) => `| ${e.edition} | ${e.county} | ${e.vendor || "— assign local printer"} | ${e.deployed} | ${e.goal} |`).join("\n")}

*Strategy:* [local-shirt-strategy.md](./local-shirt-strategy.md)

---

## County distribution (assets deployed)

${countyDistribution.length ? countyDistribution.slice(0, 15).map((c) => `- **${c.county}** — ${c.signs} signs · ${c.shirts} shirts · ${c.buttons} buttons · ${c.flags} flags`).join("\n") : "- No county-level data yet — update \`byCounty\` in relationship-assets.json"}

*Full data:* [\`relationship-capital.json\`](./relationship-capital.json)
`;

  writeFileSync(path.join(OUT, "relationship-capital-dashboard.md"), md, "utf8");
  writeFileSync(
    path.join(OUT, "relationship-assets-dashboard.md"),
    md.replace("# Relationship Capital Dashboard", "# Relationship Assets Dashboard"),
    "utf8",
  );

  // eslint-disable-next-line no-console
  console.log(`Relationship Capital: index ${capitalIndex}/100 · ${assetRows.reduce((s, r) => s + r.current, 0)} physical assets logged.`);
}

main();
