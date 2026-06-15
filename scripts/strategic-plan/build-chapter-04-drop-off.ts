/**
 * Generate Chapter 4 county Democratic drop-off markdown files from official SOS history.
 *
 * Usage (from RedDirt/):
 *   npm run strategic-plan:chapter-04:build
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_COUNTY_REGISTRY } from "../../src/lib/county/arkansas-county-registry";
import type { CountyElectionHistoryRow } from "../../src/lib/election-targets/win-target-types";

const ROOT = process.cwd();
const HISTORY_PATH = path.join(ROOT, "data/election/arkansas-county-election-history.normalized.json");
const OUT_DIR = path.join(
  ROOT,
  "docs/strategic-plan/plurality-victory-plan/part-ii-electoral-math/chapter-04-democratic-drop-off",
);
const SUMMARY_PATH = path.join(OUT_DIR, "statewide-drop-off-summary.json");

type HopeTier = "High" | "Moderate" | "Building" | "Limited";

type CountyDropOff = {
  county: string;
  slug: string;
  fips: string;
  presPeak: number;
  midtermFloor: number;
  rawLoss: number;
  pctLoss: number;
  recovery25: number;
  recovery50: number;
  recovery75: number;
  hopeIndex: number;
  hopeTier: HopeTier;
  rank: number;
};

function shortCountyName(displayName: string): string {
  return displayName.replace(/\s+County$/i, "").trim();
}

function fmt(n: number | undefined): string {
  if (n === undefined || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US");
}

function pct(n: number, d: number): string {
  if (!d) return "—";
  return `${((n / d) * 100).toFixed(1)}%`;
}

function hopeTier(score: number): HopeTier {
  if (score >= 75) return "High";
  if (score >= 50) return "Moderate";
  if (score >= 25) return "Building";
  return "Limited";
}

function electionRow(
  label: string,
  dem: number | undefined,
  rep: number | undefined,
  total: number | undefined,
): string {
  return `| ${label} | ${fmt(dem)} | ${fmt(rep)} | ${fmt(total)} |`;
}

function buildCountyMarkdown(reg: (typeof ARKANSAS_COUNTY_REGISTRY)[number], d: CountyDropOff, h: CountyElectionHistoryRow): string {
  const county = d.county;
  const pres2024 = h.presidential2024DemVotes ?? 0;
  const narrative =
    d.rawLoss > 0
      ? `Democratic presidential turnout (${fmt(h.presidential2024DemVotes)} in 2024) exceeded Democratic midterm turnout (${fmt(h.sos2022DemVotes)} in 2022 SOS) by **${fmt(d.rawLoss)} votes** (${pct(d.rawLoss, pres2024)} of the 2024 presidential Democratic vote).\n\n` +
        `Recovering **25%** = **${fmt(d.recovery25)} votes**.\n\n` +
        `Recovering **50%** = **${fmt(d.recovery50)} votes**.\n\n` +
        `Recovering **75%** = **${fmt(d.recovery75)} votes**.`
      : `This county's 2022 midterm Democratic vote (${fmt(h.sos2022DemVotes)}) meets or exceeds the 2024 presidential Democratic vote (${fmt(h.presidential2024DemVotes)}). Lane 2 recovery is limited; focus retention (Lane 1) and expansion (Lanes 3–4).`;

  return `# ${county} County — Democratic Drop-Off Analysis

> **Status:** Generated from official SOS data
> **Document:** Arkansas Plurality Victory Plan
> **Classification:** CONFIDENTIAL CAMPAIGN DOCUMENT
> **Part:** II — The Electoral Math
> **Chapter:** 4
> **County:** ${county}
> **FIPS:** ${d.fips}
> **Hope Index:** ${d.hopeIndex}/100 (${d.hopeTier}) — statewide rank **#${d.rank}** of 75

---

## Core message

> We do not need to persuade everyone. We need to bring our own people back.

---

## Historical vote table

| Election | Democratic Vote | Republican Vote | Total |
| -------- | --------------- | ----------------- | ----- |
${electionRow("2016 Presidential", h.presidential2016DemVotes, h.presidential2016RepVotes, h.presidential2016TotalVotes)}
${electionRow("2018 Midterm (SOS)", h.sos2018DemVotes, h.sos2018RepVotes, h.sos2018TotalVotes)}
${electionRow("2020 Presidential", h.presidential2020DemVotes, h.presidential2020RepVotes, h.presidential2020TotalVotes)}
${electionRow("2022 Midterm (SOS)", h.sos2022DemVotes, h.sos2022RepVotes, h.sos2022TotalVotes)}
${electionRow("2024 Presidential", h.presidential2024DemVotes, h.presidential2024RepVotes, h.presidential2024TotalVotes)}

*Midterm rows use Secretary of State — the closest statewide down-ballot comparable across cycles.*

---

## Democratic drop-off analysis

| Metric | Value |
| ------ | ----: |
| Presidential Democratic Peak (2016/2020/2024 max) | ${fmt(d.presPeak)} |
| Midterm Democratic Floor (2018/2022 SOS min) | ${fmt(d.midtermFloor)} |
| Raw vote loss (2024 Presidential − 2022 Midterm) | ${fmt(d.rawLoss)} |
| Percentage loss (vs 2024 presidential D) | ${pct(d.rawLoss, h.presidential2024DemVotes ?? 0)} |

---

## Recovery opportunity (Lane 2)

${narrative}

---

## Hope Index

| Field | Value |
| ----- | ----: |
| Score | **${d.hopeIndex}**/100 |
| Tier | **${d.hopeTier}** |
| Statewide rank | **#${d.rank}** of 75 |
| Recovery at 50% | ${fmt(d.recovery50)} votes |

*Hope Index weights recoverable vote pool (2024 pres − 2022 SOS), share of county presidential vote lost, and absolute midterm floor. Higher = more Lane 2 votes available for county leaders to reclaim.*

---

## Field plan hooks

| Field | Target |
| ----- | -----: |
| Lane 2 recovery goal (50%) | ${fmt(d.recovery50)} |
| Lane 2 stretch (75%) | ${fmt(d.recovery75)} |
| Power of 5 conversations | TBD |
| Volunteer targets | TBD |

---

## Data source

- \`data/election/arkansas-county-election-history.normalized.json\`
- Generated: ${new Date().toISOString().slice(0, 10)}
`;
}

function main() {
  const history = JSON.parse(readFileSync(HISTORY_PATH, "utf8")) as {
    rows: CountyElectionHistoryRow[];
  };
  const byCounty = new Map(history.rows.map((r) => [r.county, r]));

  const computed: CountyDropOff[] = [];

  for (const reg of ARKANSAS_COUNTY_REGISTRY) {
    const county = shortCountyName(reg.displayName);
    const h = byCounty.get(county);
    if (!h) {
      console.error(`Missing history for ${county}`);
      process.exit(1);
    }

    const presVotes = [
      h.presidential2016DemVotes ?? 0,
      h.presidential2020DemVotes ?? 0,
      h.presidential2024DemVotes ?? 0,
    ];
    const midVotes = [h.sos2018DemVotes ?? 0, h.sos2022DemVotes ?? 0];

    const presPeak = Math.max(...presVotes);
    const midtermFloor = Math.min(...midVotes.filter((v) => v > 0));
    const pres2024 = h.presidential2024DemVotes ?? 0;
    const mid2022 = h.sos2022DemVotes ?? 0;
    const rawLoss = Math.max(0, pres2024 - mid2022);
    const pctLoss = pres2024 > 0 ? rawLoss / pres2024 : 0;

    computed.push({
      county,
      slug: reg.slug,
      fips: reg.fips,
      presPeak,
      midtermFloor: midtermFloor || mid2022,
      rawLoss,
      pctLoss,
      recovery25: Math.round(rawLoss * 0.25),
      recovery50: Math.round(rawLoss * 0.5),
      recovery75: Math.round(rawLoss * 0.75),
      hopeIndex: 0,
      hopeTier: "Limited",
      rank: 0,
    });
  }

  const maxRecovery50 = Math.max(...computed.map((c) => c.recovery50), 1);
  const maxRawLoss = Math.max(...computed.map((c) => c.rawLoss), 1);

  for (const c of computed) {
    const poolScore = (c.recovery50 / maxRecovery50) * 45;
    const lossShareScore = c.pctLoss * 35;
    const scaleScore = (c.rawLoss / maxRawLoss) * 20;
    c.hopeIndex = Math.round(Math.min(100, poolScore + lossShareScore + scaleScore));
    c.hopeTier = hopeTier(c.hopeIndex);
  }

  computed.sort((a, b) => b.recovery50 - a.recovery50);
  computed.forEach((c, i) => {
    c.rank = i + 1;
  });

  const countiesDir = path.join(OUT_DIR, "counties");
  mkdirSync(countiesDir, { recursive: true });

  for (const reg of ARKANSAS_COUNTY_REGISTRY) {
    const county = shortCountyName(reg.displayName);
    const d = computed.find((c) => c.county === county)!;
    const h = byCounty.get(county)!;
    const outPath = path.join(countiesDir, `${reg.slug}.md`);
    writeFileSync(outPath, buildCountyMarkdown(reg, d, h), "utf8");
  }

  const statewide = {
    generatedAt: new Date().toISOString(),
    comparison: "2024 Presidential D vs 2022 SOS D",
    totals: {
      presidential2024Dem: computed.reduce((s, c) => s + (byCounty.get(c.county)?.presidential2024DemVotes ?? 0), 0),
      midterm2022Dem: computed.reduce((s, c) => s + (byCounty.get(c.county)?.sos2022DemVotes ?? 0), 0),
      rawDropOff: computed.reduce((s, c) => s + c.rawLoss, 0),
      recovery50Total: computed.reduce((s, c) => s + c.recovery50, 0),
      recovery75Total: computed.reduce((s, c) => s + c.recovery75, 0),
    },
    hopeIndexTop10: computed.slice(0, 10).map((c) => ({
      rank: c.rank,
      county: c.county,
      hopeIndex: c.hopeIndex,
      recovery50: c.recovery50,
    })),
    counties: computed.map(({ county, slug, rawLoss, recovery50, recovery75, hopeIndex, hopeTier, rank }) => ({
      county,
      slug,
      rawLoss,
      recovery50,
      recovery75,
      hopeIndex,
      hopeTier,
      rank,
    })),
  };

  writeFileSync(SUMMARY_PATH, JSON.stringify(statewide, null, 2), "utf8");

  // eslint-disable-next-line no-console
  console.log(
    `Wrote 75 county drop-off files + statewide summary. Statewide raw drop-off: ${statewide.totals.rawDropOff.toLocaleString()}; 50% recovery: ${statewide.totals.recovery50Total.toLocaleString()}.`,
  );
}

main();
