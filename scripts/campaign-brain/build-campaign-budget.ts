/**
 * PROJECTED CAMPAIGN BUDGET FRAMEWORK — planning budget for fundraising goals.
 * Not final accounting. Not guaranteed donor projections.
 *
 * Usage: npm run campaign-brain:budget:build
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_DATA, BRAIN_ROOT, readJson } from "./lib/inputs";

const OUT_DOCS = path.join(BRAIN_ROOT, "budget");
const OUT_DATA = path.join(BRAIN_DATA, "budget");
const SOURCE = path.join(OUT_DATA, "campaign-budget-assumptions.source.json");
const REFERENCE_DATE = "2026-06-15";
const ELECTION_DAY = "2026-11-03";

const PASS = "CAMPAIGN-BUDGET-FRAMEWORK-1.2";

const DISCLAIMER =
  "Planning budget framework only — not final accounting, not guaranteed fundraising, not donor-facing claims.";

const WORKING_RANGE = { low: 225_000, high: 250_000 };
const AGGRESSIVE_RANGE = { low: 300_000, high: 350_000 };

type Assumptions = {
  version: number;
  referenceDate: string;
  electionDay: string;
  campaignPeriod: { start: string; end: string };
  fixedAssumptions: {
    fuelAllowancePerMonth: number;
    foodPerTravelDay: number;
    lodgingPerNight: number;
    tShirtUnit: number;
    yardSignUnit: number;
    kellyReplacementSalaryPerMonth: number;
  };
  salary: { monthlyAmount: number; monthsBudgeted: number; total: number; monthsLabel: string };
  placeholders: Record<string, { status: string; note?: string; unitPlaceholder?: number }>;
  fieldMaterialsScenarios: { yardSigns: number[]; tShirts: number[] };
  postcardPrograms: Record<string, { goalQuantity: number; printStatus: string; postageStatus: string }>;
  sherwoodRevenueAssumptions: {
    vipTablePrice: number;
    vipTableGoal: number;
    showTicketPrice: number;
    foodTicketPrice: number;
    donationDrinkTicketPrice: number;
  };
  fundraisingScenarios: Record<
    string,
    { label: string; description: string; materialsTier: string }
  >;
  mediaAndOutreach?: {
    monthsBudgeted: number;
    monthly: Record<string, number>;
    monthlyTotal: number;
    campaignTotal: number;
    bareCampaignTotal?: number;
    aggressiveCampaignTotal: number;
    note?: string;
  };
  communityActivationAndSwag?: {
    perImmersionVisit: number;
    knownImmersionCorridors?: string[];
    scenarios: {
      conservative: { immersions: number; total: number };
      expected: { immersions: number; total: number };
      aggressive: { immersions: number; total: number };
    };
    note?: string;
  };
  complianceReporting?: {
    complianceConsultantMonthly: number;
    monthsBudgeted: number;
    campaignTotal: number;
    note?: string;
  };
  countyEventSponsorships?: {
    scenarios: { conservative: number; expected: number; aggressive: number };
    note?: string;
  };
  digitalAdvertising?: {
    doctrine?: string;
    strategyPrinciples?: string[];
    monthlySchedule?: {
      conservative: Array<{ month: string; label: string; amount: number; focus?: string }>;
      working: Array<{ month: string; label: string; amount: number; focus?: string }>;
      aggressive: Array<{ month: string; label: string; amount: number; focus?: string }>;
    };
    spendAllocation?: Record<string, { percent: number; label: string; examples?: string[] }>;
    campaignTotals: { conservative: number; working: number; aggressive: number };
  };
  digitalContentProduction?: {
    monthlyAmount: number;
    monthsBudgeted: number;
    campaignTotal: number;
    includes?: string[];
    note?: string;
  };
  digitalToolsAndPlatforms?: {
    campaignTotals: { conservative: number; working: number; aggressive: number };
    note?: string;
  };
};

type CalendarEvent = {
  id: string;
  eventName: string;
  date: string;
  dateEnd: string | null;
  eventType?: string;
  county?: string;
  overnightLikely?: boolean;
};

type MonthTravel = {
  month: string;
  label: string;
  fuel: number;
  foodDays: number;
  foodCost: number;
  lodgingNights: number;
  lodgingCost: number;
  total: number;
  eventCount: number;
};

function fmt(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

type FieldStrategyTotals = {
  media: number;
  immersionSwag: number;
  compliance: number;
  countySponsorships: number;
  total: number;
};

function fieldStrategyTotals(assumptions: Assumptions, tier: "conservative" | "expected" | "aggressive"): FieldStrategyTotals {
  const media = assumptions.mediaAndOutreach
    ? tier === "aggressive"
      ? assumptions.mediaAndOutreach.aggressiveCampaignTotal
      : tier === "conservative"
        ? (assumptions.mediaAndOutreach.bareCampaignTotal ?? assumptions.mediaAndOutreach.campaignTotal * 0.75)
        : assumptions.mediaAndOutreach.campaignTotal
    : 0;

  const immersionSwag = assumptions.communityActivationAndSwag?.scenarios[tier === "conservative" ? "conservative" : tier === "aggressive" ? "aggressive" : "expected"].total ?? 0;

  const compliance = assumptions.complianceReporting?.campaignTotal ?? 0;

  const countySponsorships = assumptions.countyEventSponsorships?.scenarios[
    tier === "conservative" ? "conservative" : tier === "aggressive" ? "aggressive" : "expected"
  ] ?? 0;

  return { media, immersionSwag, compliance, countySponsorships, total: media + immersionSwag + compliance + countySponsorships };
}

type DigitalProgramTotals = {
  advertising: number;
  contentProduction: number;
  toolsAndPlatforms: number;
  total: number;
};

function digitalProgramTotals(assumptions: Assumptions, tier: "conservative" | "expected" | "aggressive"): DigitalProgramTotals {
  const key = tier === "expected" ? "working" : tier === "conservative" ? "conservative" : "aggressive";
  const advertising = assumptions.digitalAdvertising?.campaignTotals[key] ?? 0;
  const contentProduction = assumptions.digitalContentProduction?.campaignTotal ?? 0;
  const toolsAndPlatforms = assumptions.digitalToolsAndPlatforms?.campaignTotals[key] ?? 0;
  return { advertising, contentProduction, toolsAndPlatforms, total: advertising + contentProduction + toolsAndPlatforms };
}

function daysInclusive(start: string, end: string): number {
  const s = new Date(`${start}T12:00:00`);
  const e = new Date(`${end}T12:00:00`);
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1);
}

function monthKey(ymd: string): string {
  return ymd.slice(0, 7);
}

function monthsInCampaign(): string[] {
  return ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"];
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function estimateTravelFromEvents(
  events: CalendarEvent[],
  assumptions: Assumptions,
  lodgingMultiplier: number,
  foodDayMultiplier: number,
): { months: MonthTravel[]; totals: { fuel: number; food: number; lodging: number; total: number; foodDays: number; lodgingNights: number } } {
  const byMonth = new Map<string, { foodDays: number; lodgingNights: number; eventCount: number }>();
  for (const key of monthsInCampaign()) {
    byMonth.set(key, { foodDays: 0, lodgingNights: 0, eventCount: 0 });
  }

  for (const ev of events) {
    if (ev.date < REFERENCE_DATE || ev.date > ELECTION_DAY) continue;
    const end = ev.dateEnd && ev.dateEnd <= ELECTION_DAY ? ev.dateEnd : ev.date;
    const spanDays = daysInclusive(ev.date, end);
    const isImmersion = ev.eventType === "immersion" || ev.overnightLikely === true;
    const isMultiDay = end !== ev.date;

    let lodgingNights = 0;
    let foodDays = 0;

    if (isMultiDay) {
      lodgingNights = Math.max(0, spanDays - 1);
      foodDays = spanDays;
    } else if (isImmersion || ev.eventType === "debate" || ev.eventType === "fair") {
      lodgingNights = 1;
      foodDays = 1;
    } else if (ev.eventType === "gotv" && isMultiDay) {
      lodgingNights = Math.max(0, spanDays - 1);
      foodDays = Math.min(spanDays, 5);
    } else {
      foodDays = 1;
    }

    lodgingNights = Math.round(lodgingNights * lodgingMultiplier);
    foodDays = Math.round(foodDays * foodDayMultiplier);

    const mk = monthKey(ev.date);
    const bucket = byMonth.get(mk);
    if (bucket) {
      bucket.foodDays += foodDays;
      bucket.lodgingNights += lodgingNights;
      bucket.eventCount += 1;
    }
  }

  const months: MonthTravel[] = [];
  let fuelT = 0;
  let foodT = 0;
  let lodgingT = 0;
  let foodDaysT = 0;
  let lodgingNightsT = 0;

  for (const key of monthsInCampaign()) {
    const b = byMonth.get(key)!;
    const fuel = key === "2026-06" ? assumptions.fixedAssumptions.fuelAllowancePerMonth : assumptions.fixedAssumptions.fuelAllowancePerMonth;
    const partialFuel = key === "2026-06" ? Math.round(fuel * (16 / 30)) : key === "2026-11" ? Math.round(fuel * (3 / 30)) : fuel;
    const foodCost = b.foodDays * assumptions.fixedAssumptions.foodPerTravelDay;
    const lodgingCost = b.lodgingNights * assumptions.fixedAssumptions.lodgingPerNight;
    const total = partialFuel + foodCost + lodgingCost;

    months.push({
      month: key,
      label: monthLabel(key),
      fuel: partialFuel,
      foodDays: b.foodDays,
      foodCost,
      lodgingNights: b.lodgingNights,
      lodgingCost,
      total,
      eventCount: b.eventCount,
    });

    fuelT += partialFuel;
    foodT += foodCost;
    lodgingT += lodgingCost;
    foodDaysT += b.foodDays;
    lodgingNightsT += b.lodgingNights;
  }

  return {
    months,
    totals: { fuel: fuelT, food: foodT, lodging: lodgingT, total: fuelT + foodT + lodgingT, foodDays: foodDaysT, lodgingNights: lodgingNightsT },
  };
}

function loadCalendarEvents(): {
  locked: CalendarEvent[];
  proposed: CalendarEvent[];
  scheduled: CalendarEvent[];
} {
  const locked =
    readJson<{ events?: CalendarEvent[] }>(path.join(BRAIN_DATA, "locked-events-steve.json"))?.events ?? [];

  const proposedV2 =
    readJson<{ proposedBlocksV2?: Array<{
      id: string;
      label: string;
      startDate: string;
      endDate: string;
      overnightLikely?: boolean;
      countiesNew?: string[];
    }> }>(path.join(BRAIN_ROOT, "calendar-fill/proposed-calendar-fill-v2.json"))?.proposedBlocksV2 ?? [];

  const proposed: CalendarEvent[] = proposedV2.map((b) => ({
    id: b.id,
    eventName: b.label,
    date: b.startDate,
    dateEnd: b.endDate !== b.startDate ? b.endDate : null,
    eventType: "corridor_block",
    county: [...(b.countiesNew ?? [])].join(" · "),
    overnightLikely: b.overnightLikely,
  }));

  const queue =
    readJson<{ stops?: Array<{ eventId: string; eventName: string; date: string; county: string }> }>(
      path.join(BRAIN_DATA, "upcoming-stops-activation-queue.json"),
    )?.stops ?? [];

  const lockedIds = new Set(locked.map((e) => e.id));
  const scheduled: CalendarEvent[] = queue
    .filter((s) => s.date >= REFERENCE_DATE && s.date <= ELECTION_DAY && !lockedIds.has(s.eventId))
    .map((s) => ({
      id: s.eventId,
      eventName: s.eventName,
      date: s.date,
      dateEnd: null,
      eventType: "opportunity",
      county: s.county,
    }));

  return { locked, proposed, scheduled };
}

function materialsTable(unit: number, quantities: number[]): string {
  return `| Quantity | Unit | Total |\n|----------|-----:|------:|\n${quantities.map((q) => `| ${q.toLocaleString()} | ${fmt(unit)} | **${fmt(q * unit)}** |`).join("\n")}`;
}

function buildFrameworkMd(assumptions: Assumptions, summary: Record<string, unknown>): string {
  return `# Campaign Budget Framework

> ${DISCLAIMER}

**Reference date:** ${REFERENCE_DATE} · **Election Day:** ${ELECTION_DAY}

## Purpose

This is the first projected campaign budget for Kelly Grappe for Secretary of State — from now through Election Day. It supports **fundraising goal-setting**, not final accounting.

## Known fixed assumptions

| Item | Amount | Notes |
|------|-------:|-------|
| Fuel allowance | ${fmt(assumptions.fixedAssumptions.fuelAllowancePerMonth)}/month | Planning baseline |
| Food (travel) | ${fmt(assumptions.fixedAssumptions.foodPerTravelDay)}/day | Steve + Kelly on travel days |
| Lodging | ${fmt(assumptions.fixedAssumptions.lodgingPerNight)}/night | |
| T-shirts | ${fmt(assumptions.fixedAssumptions.tShirtUnit)} each | |
| Yard signs | ${fmt(assumptions.fixedAssumptions.yardSignUnit)} each | |
| Kelly replacement salary | ${fmt(assumptions.fixedAssumptions.kellyReplacementSalaryPerMonth)}/month | Leave-of-absence from work |

## Salary — highest priority line item

Kelly cannot campaign full-time without leave-of-absence replacement income.

| | |
|---|---|
| Monthly | ${fmt(assumptions.salary.monthlyAmount)} |
| Months | ${assumptions.salary.monthsBudgeted} (${assumptions.salary.monthsLabel}) |
| **Total salary need** | **${fmt(assumptions.salary.total)}** |

## Budget categories

| Category | Document | Status |
|----------|----------|--------|
| Travel | [TRAVEL-BUDGET.md](./TRAVEL-BUDGET.md) | Modeled from locked calendar + scenarios |
| Field materials | [FIELD-MATERIALS-BUDGET.md](./FIELD-MATERIALS-BUDGET.md) | Known unit costs · sign/shirt scenarios |
| Postcards & mail | [POSTCARD-AND-MAIL-BUDGET.md](./POSTCARD-AND-MAIL-BUDGET.md) | Quantities from People Power · print/postage needs quote |
| Sherwood 60% | [SHERWOOD-60-BUDGET.md](./SHERWOOD-60-BUDGET.md) | Revenue model + cost placeholders |
| Volunteer leadership | [VOLUNTEER-LEADERSHIP-BUDGET.md](./VOLUNTEER-LEADERSHIP-BUDGET.md) | June 28 launch · July retreat |
| Media & outreach | [MEDIA-OUTREACH-BUDGET.md](./MEDIA-OUTREACH-BUDGET.md) | **Modeled** — rural newspaper/radio · campus · community ads |
| Community activation & swag | [COMMUNITY-ACTIVATION-SWAG-BUDGET.md](./COMMUNITY-ACTIVATION-SWAG-BUDGET.md) | **Modeled** — $500/immersion visit |
| Compliance & reporting | [COMPLIANCE-BUDGET.md](./COMPLIANCE-BUDGET.md) | **Modeled** — $750/month hard expense |
| County event sponsorships | [COUNTY-SPONSORSHIPS-BUDGET.md](./COUNTY-SPONSORSHIPS-BUDGET.md) | **Modeled** — fairs · forums · civic events |
| Digital advertising | [DIGITAL-ADVERTISING-BUDGET.md](./DIGITAL-ADVERTISING-BUDGET.md) | **Modeled** — field force multiplier · $30K working |
| Digital content production | [DIGITAL-CONTENT-PRODUCTION-BUDGET.md](./DIGITAL-CONTENT-PRODUCTION-BUDGET.md) | **Modeled** — $500/mo production |
| Communications (tools) | [COMMUNICATIONS-BUDGET.md](./COMMUNICATIONS-BUDGET.md) | Email · Mobilize · SMS platforms |
| Fundraising goals | [FUNDRAISING-GOAL-MODEL.md](./FUNDRAISING-GOAL-MODEL.md) | Scenario targets — not guarantees |

## Scenario totals (planning)

| Scenario | Total projected need |
|----------|---------------------:|
| Bare minimum | ${fmt(summary.bareMinimumTotal as number)} |
| Working campaign | ${fmt(summary.workingCampaignTotal as number)} (${fmt(WORKING_RANGE.low)}–${fmt(WORKING_RANGE.high)} range) |
| Aggressive statewide | ${fmt(summary.aggressiveStatewideTotal as number)} (${fmt(AGGRESSIVE_RANGE.low)}–${fmt(AGGRESSIVE_RANGE.high)} range) |

## Plan artifacts used

- Election Plan / 20-week plan (\`data/election-plan/twenty-week-plan.json\`)
- Locked events (\`data/campaign-brain/locked-events-steve.json\`) — ${summary.lockedEventCount} events
- Calendar Fill Phase C proposed blocks — ${summary.proposedBlockCount} blocks
- Executive Field Calendar / upcoming stops queue
- People Power / postcards field (\`data/campaign-brain/postcards-field.json\`)
- Sherwood 60% operation (\`data/campaign-brain/win-sherwood-operation.json\`)
- Forward Motion · Motion & Storytelling · GOTV framework

## Unknowns

All line items marked **needs_quote** in \`campaign-budget-assumptions.json\` require vendor quotes before committing budget numbers.

## Rebuild

\`\`\`bash
npm run campaign-brain:budget:build
\`\`\`
`;
}

function buildTravelMd(
  assumptions: Assumptions,
  locked: CalendarEvent[],
  proposed: CalendarEvent[],
  scheduled: CalendarEvent[],
): string {
  const conservative = estimateTravelFromEvents(locked, assumptions, 0.75, 0.85);
  const expected = estimateTravelFromEvents([...locked, ...proposed], assumptions, 1, 1);
  const aggressive = estimateTravelFromEvents([...locked, ...proposed, ...scheduled.slice(0, 40)], assumptions, 1.15, 1.2);

  const table = (months: MonthTravel[]) =>
    `| Month | Events | Fuel | Food days | Food | Lodging nights | Lodging | **Total** |
|-------|-------:|-----:|----------:|-----:|---------------:|--------:|----------:|
${months.map((m) => `| ${m.label} | ${m.eventCount} | ${fmt(m.fuel)} | ${m.foodDays} | ${fmt(m.foodCost)} | ${m.lodgingNights} | ${fmt(m.lodgingCost)} | **${fmt(m.total)}** |`).join("\n")}`;

  return `# Travel Budget

> ${DISCLAIMER} · Modeled from locked events + proposed Phase C blocks + scheduled opportunities.

## Fixed rates

| Rate | Amount |
|------|-------:|
| Fuel | ${fmt(assumptions.fixedAssumptions.fuelAllowancePerMonth)}/month |
| Food | ${fmt(assumptions.fixedAssumptions.foodPerTravelDay)}/travel day (Steve + Kelly) |
| Lodging | ${fmt(assumptions.fixedAssumptions.lodgingPerNight)}/night |

## Source calendar

| Source | Count |
|--------|------:|
| Locked backbone events | ${locked.length} |
| Phase C proposed blocks | ${proposed.length} |
| Scheduled opportunities (aggressive only) | ${Math.min(40, scheduled.length)} of ${scheduled.length} |

## Conservative — locked events only

Lodging discounted 25% · food days discounted 15% (more day trips assumed).

${table(conservative.months)}

| | |
|---|---:|
| Total fuel | ${fmt(conservative.totals.fuel)} |
| Total food (${conservative.totals.foodDays} days) | ${fmt(conservative.totals.food)} |
| Total lodging (${conservative.totals.lodgingNights} nights) | ${fmt(conservative.totals.lodging)} |
| **Conservative travel total** | **${fmt(conservative.totals.total)}** |

## Expected — locked + Phase C proposed blocks

${table(expected.months)}

| | |
|---|---:|
| **Expected travel total** | **${fmt(expected.totals.total)}** |

## Aggressive — locked + proposed + top scheduled opportunities

${table(aggressive.months)}

| | |
|---|---:|
| **Aggressive travel total** | **${fmt(aggressive.totals.total)}** |

## Leadership note

Travel alone could run **${fmt(conservative.totals.total)}–${fmt(aggressive.totals.total)}+** through Election Day once fuel, meals, lodging, and immersion trips are counted — before materials, mail, Sherwood production, or salary.

Immersion trips (Benton, Greene, Union, Sebastian, early voting window) drive lodging nights. Verify actual overnight plans with Steve before locking travel cash flow.
`;
}

function buildFieldMaterialsMd(assumptions: Assumptions): string {
  const signUnit = assumptions.fixedAssumptions.yardSignUnit;
  const shirtUnit = assumptions.fixedAssumptions.tShirtUnit;

  return `# Field Materials Budget

> ${DISCLAIMER}

## Known unit costs

| Item | Unit |
|------|-----:|
| Yard signs | ${fmt(signUnit)} |
| T-shirts | ${fmt(shirtUnit)} |

## Yard sign scenarios

${materialsTable(signUnit, assumptions.fieldMaterialsScenarios.yardSigns)}

**Example:** 1,000 signs × ${fmt(signUnit)} = **${fmt(1000 * signUnit)}**

## T-shirt scenarios

${materialsTable(shirtUnit, assumptions.fieldMaterialsScenarios.tShirts)}

**Example:** 1,000 shirts × ${fmt(shirtUnit)} = **${fmt(1000 * shirtUnit)}**

**Combined example:** 1,000 shirts + 1,000 signs = **${fmt(1000 * signUnit + 1000 * shirtUnit)}** before postage, banners, fans, literature, or event costs.

## Additional materials — needs quote

| Item | Status |
|------|--------|
| Buttons | needs_quote (placeholder ${fmt(assumptions.placeholders.buttons?.unitPlaceholder ?? 0.75)}/unit) |
| Flags | needs_quote |
| Fans | needs_quote |
| Stickers | needs_quote (placeholder ${fmt(assumptions.placeholders.stickers?.unitPlaceholder ?? 0.5)}/unit) |
| Banners | needs_quote |
| Tablecloths | needs_quote |
| Clipboards | needs_quote |
| Tents | needs_quote |
| Literature / push cards / door hangers | needs_quote |

## Tier totals for fundraising model

| Tier | Signs | Shirts | Known subtotal |
|------|------:|-------:|---------------:|
| Low | 500 | 250 | ${fmt(500 * signUnit + 250 * shirtUnit)} |
| Mid | 1,000 | 500 | ${fmt(1000 * signUnit + 500 * shirtUnit)} |
| High | 2,000 | 1,000 | ${fmt(2000 * signUnit + 1000 * shirtUnit)} |
| Stretch | 3,000 | 2,000 | ${fmt(3000 * signUnit + 2000 * shirtUnit)} |
`;
}

function buildPostcardMd(assumptions: Assumptions): string {
  const programs = Object.entries(assumptions.postcardPrograms);
  const totalPieces = programs.reduce((s, [, p]) => s + p.goalQuantity, 0);

  return `# Postcard & Mail Budget

> ${DISCLAIMER} · Quantities from People Power / GOTV framework. Unit costs **needs_quote**.

## Programs

| Program | Goal quantity | Print | Postage |
|---------|-------------:|-------|---------|
${programs.map(([k, p]) => `| ${k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())} | ${p.goalQuantity.toLocaleString()} | ${p.printStatus} | ${p.postageStatus} |`).join("\n")}

**Total planned pieces (all programs):** ${totalPieces.toLocaleString()}

## Cost model placeholders

Do not use these in donor materials until quoted.

| Assumption | Low placeholder | Mid placeholder | High placeholder |
|------------|----------------:|----------------:|-----------------:|
| Print per piece | $0.12 | $0.18 | $0.25 |
| Postage per piece | $0.35 | $0.40 | $0.55 |
| **Combined per piece** | **$0.47** | **$0.58** | **$0.80** |

## Scenario totals (all programs combined)

| Scenario | Per piece | Total (${totalPieces.toLocaleString()} pieces) |
|----------|----------:|-----------------------------------------------:|
| Low | $0.47 | ${fmt(totalPieces * 0.47)} |
| Mid | $0.58 | ${fmt(totalPieces * 0.58)} |
| High | $0.80 | ${fmt(totalPieces * 0.8)} |

## Postcard writing parties

| Item | Status |
|------|--------|
| Venue / food | needs_quote |
| Supplies (pens, tables) | needs_quote |
| Volunteer coordination | in-kind / staff time |

## Mailers & door hangers

Direct mail production, mailhouse, and list rental: **needs_quote** — see placeholders in \`campaign-budget-assumptions.json\`.
`;
}

function buildSherwoodMd(assumptions: Assumptions): string {
  const s = assumptions.sherwoodRevenueAssumptions;
  const sherwood = readJson<{ tracking?: { vipTablesGoal?: number } }>(
    path.join(BRAIN_DATA, "win-sherwood-operation.json"),
  );
  const vipGoal = sherwood?.tracking?.vipTablesGoal ?? s.vipTableGoal;

  const revenueConservative = vipGoal * 0.5 * s.vipTablePrice + 200 * s.showTicketPrice + 150 * s.foodTicketPrice;
  const revenueExpected = vipGoal * 0.75 * s.vipTablePrice + 400 * s.showTicketPrice + 300 * s.foodTicketPrice + 200 * s.donationDrinkTicketPrice;
  const revenueAggressive = vipGoal * s.vipTablePrice + 600 * s.showTicketPrice + 500 * s.foodTicketPrice + 400 * s.donationDrinkTicketPrice;

  const costLow = 15000;
  const costMid = 25000;
  const costHigh = 40000;

  return `# Sherwood 60% Budget

> ${DISCLAIMER} · Revenue scenarios are **projections**, not guarantees. Costs marked needs_quote until vendor bids land.

**Goal:** Win Sherwood outright with 60%+ · Central Arkansas GOTV kickoff momentum event.

## Revenue assumptions (from win-sherwood-operation.json)

| Stream | Price | Notes |
|--------|------:|-------|
| VIP tables | ${fmt(s.vipTablePrice)} | ${vipGoal} table goal · 8 people + dinner + show + shirts |
| Show tickets | ${fmt(s.showTicketPrice)} | |
| Food tickets | ${fmt(s.foodTicketPrice)} | |
| Drink-ticket donation | ${fmt(s.donationDrinkTicketPrice)} | Legally reviewed before use |

## Revenue scenarios (projected — not guaranteed)

| Scenario | VIP tables | General attendance | **Projected gross** |
|----------|------------|-------------------|--------------------:|
| Conservative | ${Math.round(vipGoal * 0.5)} sold | modest | ${fmt(revenueConservative)} |
| Expected | ${Math.round(vipGoal * 0.75)} sold | strong | ${fmt(revenueExpected)} |
| Aggressive | ${vipGoal} sold | capacity push | ${fmt(revenueAggressive)} |

## Cost categories — needs quote

| Category | Status |
|----------|--------|
| Venue | needs_quote |
| Stage / sound | needs_quote |
| Performers | needs_quote |
| Security | needs_quote |
| Alcohol compliance | needs_quote |
| Food vendors | needs_quote |
| Shirts (VIP + volunteer) | partial — ${fmt(assumptions.fixedAssumptions.tShirtUnit)}/unit known |
| Signage | partial — ${fmt(assumptions.fixedAssumptions.yardSignUnit)}/sign known |
| Insurance | needs_quote |
| Permits | needs_quote |
| Volunteer supplies | needs_quote |
| Promotion / graphics | needs_quote |

## Cost placeholders for planning

| Scenario | Planned cost | Net (revenue − cost) |
|----------|-------------:|---------------------:|
| Low cost / conservative revenue | ${fmt(costLow)} | ${fmt(revenueConservative - costLow)} |
| Mid cost / expected revenue | ${fmt(costMid)} | ${fmt(revenueExpected - costMid)} |
| High cost / aggressive revenue | ${fmt(costHigh)} | ${fmt(revenueAggressive - costHigh)} |

**Break-even (expected revenue):** roughly ${fmt(revenueExpected)} gross requires cost control under ${fmt(revenueExpected)}.

Sherwood should be modeled as **net fundraising contribution** in the overall campaign budget, not gross revenue alone.
`;
}

function buildVolunteerMd(assumptions: Assumptions): string {
  const pp = readJson<{
    volunteerLeadership?: { foundingTeamGoal?: number; foundingTeamCurrent?: number };
  }>(path.join(BRAIN_DATA, "people-power-network.json"));

  return `# Volunteer Leadership Budget

> ${DISCLAIMER}

## Founding team target

| | |
|---|---:|
| Founding leaders goal | ${pp?.volunteerLeadership?.foundingTeamGoal ?? 20} |
| Current confirmed | ${pp?.volunteerLeadership?.foundingTeamCurrent ?? 0} |

## June 28 — Volunteer Leadership Launch (Zoom)

| Item | Status | Planning note |
|------|--------|---------------|
| Zoom / platform | needs_quote | May be in-kind |
| Invite list printing | needs_quote | Founding volunteer invite list ready |
| Follow-up materials | needs_quote | County captain packets |
| Shirts (early team) | ${fmt(250 * assumptions.fixedAssumptions.tShirtUnit)} | 250 × ${fmt(assumptions.fixedAssumptions.tShirtUnit)} if ordered |
| Signs (county kits) | ${fmt(100 * assumptions.fixedAssumptions.yardSignUnit)} | 100 × ${fmt(assumptions.fixedAssumptions.yardSignUnit)} starter |

## July 26 — Forevermost Farms retreat

Locked window: volunteer leadership retreat Jun 28 – Jul 6 (Forevermost Farms · Rose Bud).

| Item | Status |
|------|--------|
| Food / catering | needs_quote |
| Printing (training binders) | needs_quote |
| Shirts | ${fmt(assumptions.fixedAssumptions.tShirtUnit)}/unit · quantity TBD |
| Signs | ${fmt(assumptions.fixedAssumptions.yardSignUnit)}/unit · quantity TBD |
| Postcards (recruitment) | see POSTCARD-AND-MAIL-BUDGET.md |
| Phone bank tools | needs_quote |

## Phone bank tools

See \`data/campaign-brain/phone-banks-field.json\` — platform subscription **needs_quote**.

## Planning allowance (placeholder)

| Tier | Amount |
|------|-------:|
| Minimum | ${fmt(2500)} |
| Working | ${fmt(6000)} |
| Full program | ${fmt(12000)} |
`;
}

function buildCommunicationsMd(assumptions: Assumptions): string {
  const tools = assumptions.digitalToolsAndPlatforms;
  const digital = assumptions.digitalAdvertising;
  return `# Communications Budget

> ${DISCLAIMER} · Platform tools only — **ad spend is modeled separately** in [DIGITAL-ADVERTISING-BUDGET.md](./DIGITAL-ADVERTISING-BUDGET.md).

## Digital doctrine

${digital?.doctrine ?? "Digital is a force multiplier for field operations — not a replacement for them."}

County-targeted visit promotion, storytelling boosts, and volunteer recruitment ads are budgeted in the **digital advertising** line item — not here.

## Platform & tools (modeled)

| Scenario | Email · Mobilize · SMS · website tools |
|----------|---------------------------------------:|
| Conservative | ${fmt(tools?.campaignTotals.conservative ?? 6000)} |
| Working | ${fmt(tools?.campaignTotals.working ?? 9000)} |
| Aggressive | ${fmt(tools?.campaignTotals.aggressive ?? 12000)} |

${tools?.note ?? ""}

## Remaining needs_quote

| Category | Status |
|----------|--------|
| Press release distribution | needs_quote |
| Substack paid tier | needs_quote |
| Advanced SMS / P2P texting scale | needs_quote |

## Related modeled budgets

| Document | Purpose |
|----------|---------|
| [DIGITAL-ADVERTISING-BUDGET.md](./DIGITAL-ADVERTISING-BUDGET.md) | County-targeted ads · visit promotion · storytelling · GOTV push |
| [DIGITAL-CONTENT-PRODUCTION-BUDGET.md](./DIGITAL-CONTENT-PRODUCTION-BUDGET.md) | Reels · graphics · forum clips · testimonial videos |
| [MEDIA-OUTREACH-BUDGET.md](./MEDIA-OUTREACH-BUDGET.md) | Rural newspaper · rural radio · campus · community print |
`;
}

function buildDigitalAdvertisingMd(assumptions: Assumptions): string {
  const d = assumptions.digitalAdvertising;
  if (!d) return "# Digital Advertising Budget\n\n> No modeled assumptions.\n";

  const scheduleTable = (tier: "working" | "aggressive" | "conservative", title: string) => {
    const rows = d.monthlySchedule?.[tier] ?? [];
    return `### ${title}

| Month | Budget | Focus |
|-------|-------:|-------|
${rows.map((r) => `| ${r.label} | ${fmt(r.amount)} | ${r.focus ?? "—"} |`).join("\n")}
| **Total** | **${fmt(d.campaignTotals[tier])}** | |`;
  };

  const allocation = d.spendAllocation
    ? Object.values(d.spendAllocation)
        .map(
          (a) =>
            `### ${a.percent}% — ${a.label}\n\n${(a.examples ?? []).map((e) => `- ${e}`).join("\n")}`,
        )
        .join("\n\n")
    : "";

  return `# Digital Advertising Budget

> ${DISCLAIMER} · **Modeled assumptions** — force multiplier for field operations, not broad statewide FB/Google.

## Doctrine

${d.doctrine ?? ""}

${(d.strategyPrinciples ?? []).map((p) => `- ${p}`).join("\n")}

**Do not budget this like a typical statewide campaign.** Most statewide campaigns spend heavily on broad Facebook and Google advertising. That does not match this strategy.

---

## Monthly schedule — working scenario

${scheduleTable("working", "Working digital budget ($30,000)")}

---

## Aggressive scenario (if fundraising improves)

${scheduleTable("aggressive", "Aggressive digital budget ($47,500)")}

Allows meaningful saturation in the Top 40 cities.

---

## Conservative scenario

${scheduleTable("conservative", "Conservative digital budget ($16,500)")}

---

## How to spend it

${allocation}

---

## Leadership note

Save major **direct candidate persuasion** spending for the final 30–45 days. Early months prioritize **visit promotion** and **local storytelling** — geographically targeted, highly efficient.
`;
}

function buildDigitalContentProductionMd(assumptions: Assumptions): string {
  const p = assumptions.digitalContentProduction;
  if (!p) return "# Digital Content Production Budget\n\n> No modeled assumptions.\n";

  return `# Digital Content Production Budget

> ${DISCLAIMER} · **Production — not ad spend.**

${p.note ?? ""}

The campaign's strategy depends on appearing to be everywhere. **Content production is as important as ad placement.**

| | |
|---|---:|
| Monthly | ${fmt(p.monthlyAmount)} |
| Months | ${p.monthsBudgeted} |
| **Campaign total** | **${fmt(p.campaignTotal)}** |

## Includes

${(p.includes ?? []).map((i) => `- ${i}`).join("\n")}

Production supports Forward Motion · Motion & Storytelling · county visit content · forum clips · volunteer testimonials.
`;
}

function buildMediaOutreachMd(assumptions: Assumptions): string {
  const m = assumptions.mediaAndOutreach;
  if (!m) return "# Media & Outreach Budget\n\n> No modeled assumptions in source file.\n";

  const rows = Object.entries(m.monthly)
    .map(([k, v]) => {
      const label = k
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (c) => c.toUpperCase())
        .replace(/Advertising/g, " advertising");
      return `| ${label} | ${fmt(v)}/month | ${fmt(v * m.monthsBudgeted)} |`;
    })
    .join("\n");

  return `# Media & Outreach Budget

> ${DISCLAIMER} · **Modeled assumptions** — core field strategy, not placeholder.

${m.note ?? ""}

## Monthly assumptions

| Category | Monthly | ${m.monthsBudgeted}-month total |
|----------|--------:|------------------:|
${rows}
| **Total media & outreach** | **${fmt(m.monthlyTotal)}/month** | **${fmt(m.campaignTotal)}** |

## Scenario totals

| Scenario | Monthly | Campaign total | Notes |
|----------|--------:|---------------:|-------|
| Working (modest) | ${fmt(m.monthlyTotal)} | ${fmt(m.campaignTotal)} | Jun–Aug baseline |
| Aggressive | ${fmt(m.aggressiveCampaignTotal / m.monthsBudgeted)} avg | ${fmt(m.aggressiveCampaignTotal)} | May double Sep–Oct if traction builds |

## Leadership note

This is intentionally modest. If the campaign starts seeing traction, rural media could easily **double in September and October** — plan contingency in the ${fmt(WORKING_RANGE.low)}–${fmt(WORKING_RANGE.high)} working range.
`;
}

function buildCommunityActivationMd(assumptions: Assumptions): string {
  const c = assumptions.communityActivationAndSwag;
  if (!c) return "# Community Activation & Swag Budget\n\n> No modeled assumptions.\n";

  const corridors = (c.knownImmersionCorridors ?? []).map((x) => `- ${x}`).join("\n");

  return `# Community Activation & Swag Budget

> ${DISCLAIMER} · **Modeled assumptions** — $${c.perImmersionVisit} swag per immersion visit.

${c.note ?? ""}

## Per-visit planning line item

| Item | Amount |
|------|-------:|
| Swag budget per immersion visit | **${fmt(c.perImmersionVisit)}** |

Includes: local shirts · giveaways · fans · buttons · stickers · booth items · local sponsor materials.

## Immersion scenarios

| Scenario | Immersions | Total |
|----------|----------:|------:|
| Conservative | ${c.scenarios.conservative.immersions} | ${fmt(c.scenarios.conservative.total)} |
| Expected | ${c.scenarios.expected.immersions} | ${fmt(c.scenarios.expected.total)} |
| Aggressive | ${c.scenarios.aggressive.immersions} | ${fmt(c.scenarios.aggressive.total)} |

## Known immersion corridors (planning)

${corridors}

Verify actual immersion count against Executive Field Calendar before locking cash flow.
`;
}

function buildComplianceMd(assumptions: Assumptions): string {
  const c = assumptions.complianceReporting;
  if (!c) return "# Compliance Budget\n\n> No modeled assumptions.\n";

  return `# Compliance & Reporting Budget

> ${DISCLAIMER} · **Hard monthly expense** — not optional.

${c.note ?? ""}

| Category | Monthly | ${c.monthsBudgeted}-month total |
|----------|--------:|------------------:|
| Compliance / reporting consultant | ${fmt(c.complianceConsultantMonthly)} | **${fmt(c.campaignTotal)}** |

Treat similarly to accounting and filing costs. Leadership should budget **${fmt(c.complianceConsultantMonthly)}/month** through Election Day regardless of scenario tier.
`;
}

function buildCountySponsorshipsMd(assumptions: Assumptions): string {
  const s = assumptions.countyEventSponsorships;
  if (!s) return "# County Event Sponsorships Budget\n\n> No modeled assumptions.\n";

  return `# County Event Sponsorships Budget

> ${DISCLAIMER} · **Modeled assumptions** — relationship-building spend across 75 counties.

${s.note ?? ""}

Small **$100–$500** sponsorships accumulate quickly. These are often among the highest relationship-building expenditures in rural Arkansas.

## Scenarios

| Scenario | Budget |
|----------|-------:|
| Conservative | ${fmt(s.scenarios.conservative)} |
| Expected | ${fmt(s.scenarios.expected)} |
| Aggressive | ${fmt(s.scenarios.aggressive)} |

## Typical uses

- County fairs · festivals · parades
- Democratic dinners · Juneteenth events
- Local civic events · candidate forums
- Table fees · booth fees · program ads
`;
}

function buildFundraisingMd(
  assumptions: Assumptions,
  summary: Record<string, unknown>,
): string {
  const salary = assumptions.salary.total;
  const travelExpected = summary.travelExpected as number;
  const materialsMid = summary.materialsMid as number;
  const volunteerMid = 6000;
  const postcardMid = summary.postcardMid as number;
  const sherwoodNetMid = summary.sherwoodNetMid as number;
  const opsPlaceholder = 15000;
  const media = summary.mediaOutreachTotal as number;
  const immersion = summary.immersionSwagTotal as number;
  const compliance = summary.complianceTotal as number;
  const sponsorships = summary.countySponsorshipsTotal as number;
  const fieldStrategy = summary.fieldStrategyTotal as number;
  const digitalAds = summary.digitalAdvertisingTotal as number;
  const digitalProduction = summary.digitalContentProductionTotal as number;
  const digitalTools = summary.digitalToolsTotal as number;
  const digitalProgram = summary.digitalProgramTotal as number;

  const bare = summary.bareMinimumTotal as number;
  const working = summary.workingCampaignTotal as number;
  const aggressive = summary.aggressiveStatewideTotal as number;

  return `# Fundraising Goal Model

> ${DISCLAIMER} · **These are planning targets, not guarantees.** Do not use as donor promises.

## Kelly replacement salary — non-negotiable baseline

| | |
|---|---:|
| ${fmt(assumptions.salary.monthlyAmount)}/month × ${assumptions.salary.monthsBudgeted} months | **${fmt(salary)}** |

Without this, Kelly cannot take leave from work to campaign full-time.

## Scenario summary

| Scenario | Projected total need | Planning range | ~Monthly burn (6 mo) |
|----------|---------------------:|---------------:|---------------------:|
| **Bare minimum** | ${fmt(bare)} | — | ${fmt(Math.round(bare / 6))} |
| **Working campaign** | ${fmt(working)} | ${fmt(WORKING_RANGE.low)}–${fmt(WORKING_RANGE.high)} | ${fmt(Math.round(working / 6))} |
| **Aggressive statewide** | ${fmt(aggressive)} | ${fmt(AGGRESSIVE_RANGE.low)}–${fmt(AGGRESSIVE_RANGE.high)} | ${fmt(Math.round(aggressive / 6))} |

> **Leadership note:** The campaign's realistic operating target is **${fmt(WORKING_RANGE.low)}–${fmt(WORKING_RANGE.high)}** through Election Day — statewide travel, immersion visits, signs, shirts, postcards, rural media, Sherwood, coalition work, volunteer leadership, Power of 5 organizing, and a steadily increasing **digital program** that culminates in a heavy Top 40 city push during the final month. Aggressive statewide target: **${fmt(AGGRESSIVE_RANGE.low)}**.

## Breakdown — working campaign (illustrative)

| Category | Amount |
|----------|-------:|
| Kelly replacement salary | ${fmt(salary)} |
| Travel (expected) | ${fmt(travelExpected)} |
| Field materials (mid) | ${fmt(materialsMid)} |
| Postcards & mail (50% of mid scenario) | ${fmt(Math.round(postcardMid * 0.5))} |
| Volunteer leadership | ${fmt(volunteerMid)} |
| **Digital advertising (field force multiplier)** | **${fmt(digitalAds)}** |
| **Digital content production ($500/mo)** | **${fmt(digitalProduction)}** |
| Digital tools & platforms | ${fmt(digitalTools)} |
| **Media & outreach (rural print/radio)** | **${fmt(media)}** |
| **Immersion swag (15 visits × $500)** | **${fmt(immersion)}** |
| **Compliance / reporting ($750/mo)** | **${fmt(compliance)}** |
| **County event sponsorships** | **${fmt(sponsorships)}** |
| Operations / contingency | ${fmt(opsPlaceholder)} |
| Sherwood net contribution (expected − mid cost) | −${fmt(sherwoodNetMid)} |
| **Field strategy subtotal** | **${fmt(fieldStrategy)}** |
| **Digital program subtotal** | **${fmt(digitalProgram)}** |
| **Working total** | **${fmt(working)}** |

## Monthly burn target (working scenario)

Leadership should plan to raise roughly **${fmt(Math.round(working / 6))}/month** through Election Day — including Kelly's salary, field strategy, and the digital force-multiplier program.

## Digital doctrine

Digital is a **force multiplier for field operations** — not a replacement for them. Do not budget like a typical statewide campaign. See [DIGITAL-ADVERTISING-BUDGET.md](./DIGITAL-ADVERTISING-BUDGET.md).

## Sherwood contribution

Model Sherwood as **net** fundraising after costs — see [SHERWOOD-60-BUDGET.md](./SHERWOOD-60-BUDGET.md). Mid scenario net: ~${fmt(sherwoodNetMid)} projected (not guaranteed).

## Donor structure (planning — not commitments)

| Stream | Working-scenario planning target |
|--------|--------------------------------:|
| Major donors / finance committee | ${fmt(Math.round(working * 0.4))} |
| Sherwood net | ${fmt(sherwoodNetMid)} |
| VIP tables + events | ${fmt(Math.round(working * 0.15))} |
| Recurring small-dollar (monthly) | ${fmt(Math.round(working * 0.1))} |
| Late push / match (Sep–Oct) | ${fmt(Math.round(working * 0.2))} |

## What this does NOT include

- Large paid TV (not in current plan)
- Broad statewide Facebook/Google saturation (not this strategy)
- Guaranteed endorsement costs
- Legal defense contingencies
- Final vendor quotes for print, postage, Sherwood production

Rebuild: \`npm run campaign-brain:budget:build\`
`;
}

function buildExecutiveBookBudgetChapter(summary: Record<string, number | string>): string {
  const s = summary as Record<string, number>;
  return `# Campaign Budget & Fundraising Targets

> ${PASS} · **Chapter 7 — Leadership fundraising planning**

**These are planning targets, not guaranteed costs or guaranteed fundraising outcomes.** Modeled line items cover rural media, immersion swag, compliance, county sponsorships, and a **field-aligned digital program** — not broad statewide FB/Google saturation.

Kelly cannot campaign full-time without leave-of-absence replacement income. **Salary is the non-negotiable floor.**

---

## Leadership guidance

> Plan around a **working budget of ${fmt(WORKING_RANGE.low)}–${fmt(WORKING_RANGE.high)}** through Election Day — statewide travel, immersion visits, signs, shirts, postcards, rural media, Sherwood, coalition work, volunteer leadership, Power of 5 organizing, and a steadily increasing digital program culminating in a heavy Top 40 city push during the final month. **Aggressive statewide target: ${fmt(AGGRESSIVE_RANGE.low)}.**

**Digital doctrine:** Social media amplifies physical presence — it does not replace field operations. Save major persuasion spending for the final 30–45 days.

Once September arrives, the campaign will almost certainly add additional signs, shirts, radio, forum sponsorships, newspaper ads, GOTV printing, travel, and volunteer materials — budget contingency accordingly.

---

## Salary floor — highest priority

| | |
|---|---:|
| Kelly replacement salary | **${fmt(s.salaryTotal)}** |
| Monthly | ${fmt(s.salaryMonthly)} × 6 months (Jun–Nov 2026) |
| Purpose | Leave-of-absence from work so Kelly can campaign full-time |

---

## Modeled field strategy

| Category | Working scenario |
|----------|-----------------:|
| Media & outreach ($4,000/mo) | ${fmt(s.mediaOutreachTotal ?? 24000)} |
| Immersion swag (15 × $500) | ${fmt(s.immersionSwagTotal ?? 7500)} |
| Compliance ($750/mo × 6) | ${fmt(s.complianceTotal ?? 4500)} |
| County event sponsorships | ${fmt(s.countySponsorshipsTotal ?? 7500)} |
| **Field strategy subtotal** | **${fmt(s.fieldStrategyTotal ?? 43500)}** |

---

## Modeled digital program

| Category | Working scenario |
|----------|-----------------:|
| Digital advertising (county-targeted) | ${fmt(s.digitalAdvertisingTotal ?? 30000)} |
| Digital content production ($500/mo) | ${fmt(s.digitalContentProductionTotal ?? 3000)} |
| Digital tools & platforms | ${fmt(s.digitalToolsTotal ?? 9000)} |
| **Digital program subtotal** | **${fmt(s.digitalProgramTotal ?? 42000)}** |

### Working digital ad schedule

| Month | Budget | Focus |
|-------|-------:|-------|
| June | $1,000 | Visit promotion · Sherwood · volunteer launch |
| July | $2,000 | Immersion amplification |
| August | $4,000 | Top 40 cities |
| September | $8,000 | Persuasion season |
| October | $15,000 | GOTV · early voting · Top 40 push |

**Spend mix:** 40% visit promotion · 25% storytelling · 20% volunteer recruitment · 15% direct persuasion (late race only).

---

## Key planning numbers

| Line item | Amount |
|-----------|-------:|
| Salary floor | ${fmt(s.salaryTotal)} |
| Travel (conservative → aggressive) | ${fmt(s.travelConservative)} → ${fmt(s.travelAggressive)} |
| Materials mid (1,000 signs + 500 shirts) | ${fmt(s.materialsMid)} |
| Postcards/mail mid placeholder | ~${fmt(Math.round(s.postcardMid))} |
| Sherwood expected net (projected) | ~${fmt(s.sherwoodNetMid)} |
| **Bare minimum scenario** | **${fmt(s.bareMinimumTotal)}** |
| **Working campaign scenario** | **${fmt(s.workingCampaignTotal)}** |
| **Working planning range** | **${fmt(WORKING_RANGE.low)}–${fmt(WORKING_RANGE.high)}** |
| **Aggressive statewide scenario** | **${fmt(s.aggressiveStatewideTotal)}** |
| **Aggressive planning range** | **${fmt(AGGRESSIVE_RANGE.low)}–${fmt(AGGRESSIVE_RANGE.high)}** |

---

## Monthly burn (working scenario)

| | |
|---|---:|
| Working campaign total | ${fmt(s.workingCampaignTotal)} |
| Approx. monthly burn (6 months) | **~${fmt(s.monthlyBurnWorking)}** |

Leadership should use the **working campaign** figure and **${fmt(WORKING_RANGE.low)}–${fmt(WORKING_RANGE.high)}** range for finance committee planning.

---

## Scenario summary

| Scenario | Total projected need | ~Monthly burn |
|----------|---------------------:|--------------:|
| Bare minimum | ${fmt(s.bareMinimumTotal)} | ${fmt(s.monthlyBurnBare)} |
| **Working campaign** | **${fmt(s.workingCampaignTotal)}** | **${fmt(s.monthlyBurnWorking)}** |
| Aggressive statewide | ${fmt(s.aggressiveStatewideTotal)} | ${fmt(s.monthlyBurnAggressive)} |

---

## Supporting budget documents

| Document | Location |
|----------|----------|
${[
  ["Framework overview", "campaign-budget-framework"],
  ["Media & outreach", "media-outreach-budget"],
  ["Community activation & swag", "community-activation-swag-budget"],
  ["Compliance", "compliance-budget"],
  ["County sponsorships", "county-sponsorships-budget"],
  ["Digital advertising", "digital-advertising-budget"],
  ["Digital content production", "digital-content-production-budget"],
  ["Travel", "travel-budget"],
  ["Field materials", "field-materials-budget"],
  ["Postcards & mail", "postcard-and-mail-budget"],
  ["Sherwood 60%", "sherwood-60-budget"],
  ["Fundraising model", "fundraising-goal-model"],
]
  .map(
    ([title, slug]) =>
      `| ${title} | [Open document](/election-plan/executive-book/budget/documents/${slug}) |`,
  )
  .join("\n")}

---

## Hard rules

- Do not present these numbers as guaranteed fundraising outcomes
- Do not use in donor materials without finance committee review
- Replace remaining **needs_quote** placeholders with vendor quotes before committing spend

Rebuild: \`npm run campaign-brain:budget:build\` · Shareable chapter: \`/election-plan/executive-book/budget\`
`;
}

function main() {
  mkdirSync(OUT_DOCS, { recursive: true });
  mkdirSync(OUT_DATA, { recursive: true });

  const assumptions = readJson<Assumptions>(SOURCE);
  if (!assumptions) throw new Error(`Missing ${SOURCE}`);

  const { locked, proposed, scheduled } = loadCalendarEvents();
  const travelConservative = estimateTravelFromEvents(locked, assumptions, 0.75, 0.85);
  const travelExpected = estimateTravelFromEvents([...locked, ...proposed], assumptions, 1, 1);
  const travelAggressive = estimateTravelFromEvents(
    [...locked, ...proposed, ...scheduled.slice(0, 40)],
    assumptions,
    1.15,
    1.2,
  );

  const signUnit = assumptions.fixedAssumptions.yardSignUnit;
  const shirtUnit = assumptions.fixedAssumptions.tShirtUnit;
  const materialsLow = 500 * signUnit + 250 * shirtUnit;
  const materialsMid = 1000 * signUnit + 500 * shirtUnit;
  const materialsHigh = 2000 * signUnit + 1000 * shirtUnit;

  const totalPostcardPieces = Object.values(assumptions.postcardPrograms).reduce((s, p) => s + p.goalQuantity, 0);
  const postcardMid = totalPostcardPieces * 0.58;

  const sherwood = assumptions.sherwoodRevenueAssumptions;
  const vipGoal = sherwood.vipTableGoal;
  const revenueExpected =
    vipGoal * 0.75 * sherwood.vipTablePrice +
    400 * sherwood.showTicketPrice +
    300 * sherwood.foodTicketPrice +
    200 * sherwood.donationDrinkTicketPrice;
  const sherwoodNetMid = revenueExpected - 25000;

  const fieldBare = fieldStrategyTotals(assumptions, "conservative");
  const fieldExpected = fieldStrategyTotals(assumptions, "expected");
  const fieldAggressive = fieldStrategyTotals(assumptions, "aggressive");

  const opsPlaceholder = 15000;
  const digitalBare = digitalProgramTotals(assumptions, "conservative");
  const digitalExpected = digitalProgramTotals(assumptions, "expected");
  const digitalAggressive = digitalProgramTotals(assumptions, "aggressive");

  const bareMinimumTotal =
    assumptions.salary.total +
    travelConservative.totals.total +
    materialsLow +
    2500 +
    6000 +
    5000 +
    fieldBare.total +
    digitalBare.total;
  const workingCampaignTotal =
    assumptions.salary.total +
    travelExpected.totals.total +
    materialsMid +
    6000 +
    postcardMid * 0.5 +
    opsPlaceholder -
    sherwoodNetMid +
    fieldExpected.total +
    digitalExpected.total;
  const aggressiveStatewideTotal =
    assumptions.salary.total +
    travelAggressive.totals.total +
    materialsHigh +
    12000 +
    postcardMid +
    opsPlaceholder * 2 -
    sherwoodNetMid +
    fieldAggressive.total +
    digitalAggressive.total;

  const generatedAt = new Date().toISOString();

  const summary = {
    generatedAt,
    pass: PASS,
    disclaimer: DISCLAIMER,
    referenceDate: REFERENCE_DATE,
    electionDay: ELECTION_DAY,
    lockedEventCount: locked.length,
    proposedBlockCount: proposed.length,
    scheduledOpportunityCount: scheduled.length,
    salaryTotal: assumptions.salary.total,
    salaryMonthly: assumptions.salary.monthlyAmount,
    travelConservative: travelConservative.totals.total,
    travelExpected: travelExpected.totals.total,
    travelAggressive: travelAggressive.totals.total,
    materialsLow,
    materialsMid,
    materialsHigh,
    postcardMid,
    sherwoodNetMid,
    mediaOutreachTotal: fieldExpected.media,
    immersionSwagTotal: fieldExpected.immersionSwag,
    complianceTotal: fieldExpected.compliance,
    countySponsorshipsTotal: fieldExpected.countySponsorships,
    fieldStrategyTotal: fieldExpected.total,
    digitalAdvertisingTotal: digitalExpected.advertising,
    digitalContentProductionTotal: digitalExpected.contentProduction,
    digitalToolsTotal: digitalExpected.toolsAndPlatforms,
    digitalProgramTotal: digitalExpected.total,
    priorWorkingCampaignTotal: 211053,
    bareMinimumTotal,
    workingCampaignTotal,
    aggressiveStatewideTotal,
    workingCampaignRangeLow: WORKING_RANGE.low,
    workingCampaignRangeHigh: WORKING_RANGE.high,
    aggressiveRangeLow: AGGRESSIVE_RANGE.low,
    aggressiveRangeHigh: AGGRESSIVE_RANGE.high,
    monthlyBurnWorking: Math.round(workingCampaignTotal / 6),
    monthlyBurnBare: Math.round(bareMinimumTotal / 6),
    monthlyBurnAggressive: Math.round(aggressiveStatewideTotal / 6),
  };

  const assumptionsOut = {
    ...assumptions,
    generatedAt,
    computed: {
      travel: {
        conservative: travelConservative.totals,
        expected: travelExpected.totals,
        aggressive: travelAggressive.totals,
        monthlyBreakdown: {
          conservative: travelConservative.months,
          expected: travelExpected.months,
          aggressive: travelAggressive.months,
        },
      },
      materials: { low: materialsLow, mid: materialsMid, high: materialsHigh },
      postcardMidEstimate: postcardMid,
      sherwoodNetMidEstimate: sherwoodNetMid,
      fieldStrategy: {
        conservative: fieldBare,
        expected: fieldExpected,
        aggressive: fieldAggressive,
      },
      digitalProgram: {
        conservative: digitalBare,
        expected: digitalExpected,
        aggressive: digitalAggressive,
      },
      scenarios: {
        bareMinimumTotal,
        workingCampaignTotal,
        aggressiveStatewideTotal,
      },
    },
  };

  writeFileSync(path.join(OUT_DATA, "campaign-budget-assumptions.json"), JSON.stringify(assumptionsOut, null, 2));
  writeFileSync(path.join(OUT_DATA, "budget-summary.json"), JSON.stringify(summary, null, 2));
  writeFileSync(path.join(OUT_DATA, "travel-budget.json"), JSON.stringify(travelExpected, null, 2));

  writeFileSync(path.join(OUT_DOCS, "CAMPAIGN-BUDGET-FRAMEWORK.md"), buildFrameworkMd(assumptions, summary));
  writeFileSync(path.join(OUT_DOCS, "TRAVEL-BUDGET.md"), buildTravelMd(assumptions, locked, proposed, scheduled));
  writeFileSync(path.join(OUT_DOCS, "FIELD-MATERIALS-BUDGET.md"), buildFieldMaterialsMd(assumptions));
  writeFileSync(path.join(OUT_DOCS, "POSTCARD-AND-MAIL-BUDGET.md"), buildPostcardMd(assumptions));
  writeFileSync(path.join(OUT_DOCS, "SHERWOOD-60-BUDGET.md"), buildSherwoodMd(assumptions));
  writeFileSync(path.join(OUT_DOCS, "VOLUNTEER-LEADERSHIP-BUDGET.md"), buildVolunteerMd(assumptions));
  writeFileSync(path.join(OUT_DOCS, "DIGITAL-ADVERTISING-BUDGET.md"), buildDigitalAdvertisingMd(assumptions));
  writeFileSync(path.join(OUT_DOCS, "DIGITAL-CONTENT-PRODUCTION-BUDGET.md"), buildDigitalContentProductionMd(assumptions));
  writeFileSync(path.join(OUT_DOCS, "COMMUNICATIONS-BUDGET.md"), buildCommunicationsMd(assumptions));
  writeFileSync(path.join(OUT_DOCS, "MEDIA-OUTREACH-BUDGET.md"), buildMediaOutreachMd(assumptions));
  writeFileSync(path.join(OUT_DOCS, "COMMUNITY-ACTIVATION-SWAG-BUDGET.md"), buildCommunityActivationMd(assumptions));
  writeFileSync(path.join(OUT_DOCS, "COMPLIANCE-BUDGET.md"), buildComplianceMd(assumptions));
  writeFileSync(path.join(OUT_DOCS, "COUNTY-SPONSORSHIPS-BUDGET.md"), buildCountySponsorshipsMd(assumptions));
  writeFileSync(path.join(OUT_DOCS, "FUNDRAISING-GOAL-MODEL.md"), buildFundraisingMd(assumptions, summary));

  const execBookDir = path.join(process.cwd(), "docs/strategic-plan/plurality-victory-plan/executive-book-v1");
  mkdirSync(execBookDir, { recursive: true });
  writeFileSync(
    path.join(execBookDir, "06-CAMPAIGN-BUDGET-AND-FUNDRAISING-TARGETS.md"),
    buildExecutiveBookBudgetChapter(summary as Record<string, number | string>),
  );

  console.log(
    `Campaign budget framework: salary ${fmt(assumptions.salary.total)} · travel ${fmt(travelConservative.totals.total)}–${fmt(travelAggressive.totals.total)} · working scenario ${fmt(workingCampaignTotal)}`,
  );
}

main();
