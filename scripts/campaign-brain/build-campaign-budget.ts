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

const DISCLAIMER =
  "Planning budget framework only — not final accounting, not guaranteed fundraising, not donor-facing claims.";

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
| Communications | [COMMUNICATIONS-BUDGET.md](./COMMUNICATIONS-BUDGET.md) | Motion · Forward Motion · digital |
| Fundraising goals | [FUNDRAISING-GOAL-MODEL.md](./FUNDRAISING-GOAL-MODEL.md) | Scenario targets — not guarantees |

## Scenario totals (planning)

| Scenario | Total projected need |
|----------|---------------------:|
| Bare minimum | ${fmt(summary.bareMinimumTotal as number)} |
| Working campaign | ${fmt(summary.workingCampaignTotal as number)} |
| Aggressive statewide | ${fmt(summary.aggressiveStatewideTotal as number)} |

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
  return `# Communications Budget

> ${DISCLAIMER} · Motion & Storytelling + Forward Motion activation costs.

## Categories

| Category | Source artifact | Status |
|----------|-----------------|--------|
| Social graphics | Forward Motion queue | needs_quote |
| Video editing | Motion & Storytelling pipeline | needs_quote |
| Boosted posts | Forward Motion / Facebook drafts | needs_quote |
| Local newspaper ads | Coalition / top-city forums | needs_quote |
| Press release tools | Forward Motion | needs_quote |
| Email platform | SendGrid / email command center | needs_quote |
| SMS / phone tools | GOTV + volunteer ops | needs_quote |
| Website maintenance | kgrappe.netlify.app | needs_quote |
| Content production | Story pipeline · Substack | needs_quote |
| Mobilize | mobilize-events.json | needs_quote |
| Substack | substack-stories.json | needs_quote |

## Planning tiers (all placeholders)

| Tier | Monthly burn | Jun–Nov total (6 mo) |
|------|-------------:|---------------------:|
| Minimum | ${fmt(1500)} | ${fmt(9000)} |
| Working | ${fmt(3500)} | ${fmt(21000)} |
| Aggressive | ${fmt(7000)} | ${fmt(42000)} |

These tiers cover graphics, modest digital boost, email/SMS tools, and content support — **not** large paid media buys.
`;
}

function buildFundraisingMd(
  assumptions: Assumptions,
  summary: Record<string, unknown>,
): string {
  const salary = assumptions.salary.total;
  const travelConservative = summary.travelConservative as number;
  const travelExpected = summary.travelExpected as number;
  const travelAggressive = summary.travelAggressive as number;
  const materialsLow = summary.materialsLow as number;
  const materialsMid = summary.materialsMid as number;
  const materialsHigh = summary.materialsHigh as number;
  const commsLow = 9000;
  const commsMid = 21000;
  const commsHigh = 42000;
  const volunteerLow = 2500;
  const volunteerMid = 6000;
  const volunteerHigh = 12000;
  const postcardMid = summary.postcardMid as number;
  const sherwoodNetMid = summary.sherwoodNetMid as number;
  const opsPlaceholder = 15000;

  const bare = salary + travelConservative + materialsLow + volunteerLow + commsLow + 5000;
  const working = salary + travelExpected + materialsMid + volunteerMid + commsMid + postcardMid * 0.5 + opsPlaceholder - sherwoodNetMid;
  const aggressive = salary + travelAggressive + materialsHigh + volunteerHigh + commsHigh + postcardMid + opsPlaceholder * 2 - sherwoodNetMid;

  return `# Fundraising Goal Model

> ${DISCLAIMER} · **These are planning targets, not guarantees.** Do not use as donor promises.

## Kelly replacement salary — non-negotiable baseline

| | |
|---|---:|
| ${fmt(assumptions.salary.monthlyAmount)}/month × ${assumptions.salary.monthsBudgeted} months | **${fmt(salary)}** |

Without this, Kelly cannot take leave from work to campaign full-time.

## Scenario summary

| Scenario | Projected total need | Approx. monthly burn (6 mo) |
|----------|---------------------:|----------------------------:|
| **Bare minimum** | ${fmt(bare)} | ${fmt(Math.round(bare / 6))} |
| **Working campaign** | ${fmt(working)} | ${fmt(Math.round(working / 6))} |
| **Aggressive statewide** | ${fmt(aggressive)} | ${fmt(Math.round(aggressive / 6))} |

## Breakdown — working campaign (illustrative)

| Category | Amount |
|----------|-------:|
| Kelly replacement salary | ${fmt(salary)} |
| Travel (expected) | ${fmt(travelExpected)} |
| Field materials (mid) | ${fmt(materialsMid)} |
| Postcards & mail (50% of mid scenario) | ${fmt(Math.round(postcardMid * 0.5))} |
| Volunteer leadership | ${fmt(volunteerMid)} |
| Communications | ${fmt(commsMid)} |
| Operations / compliance / contingency | ${fmt(opsPlaceholder)} |
| Sherwood net contribution (expected − mid cost) | −${fmt(sherwoodNetMid)} |
| **Working total** | **${fmt(working)}** |

## Monthly burn target (working scenario)

Leadership should plan to raise roughly **${fmt(Math.round(working / 6))}/month** through Election Day to run a working statewide campaign including Kelly's salary.

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

- Large paid TV/radio (not in current plan)
- Guaranteed endorsement costs
- Legal defense contingencies
- Final vendor quotes for print, postage, Sherwood production

Rebuild: \`npm run campaign-brain:budget:build\`
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

  const bareMinimumTotal =
    assumptions.salary.total + travelConservative.totals.total + materialsLow + 2500 + 9000 + 5000;
  const workingCampaignTotal =
    assumptions.salary.total +
    travelExpected.totals.total +
    materialsMid +
    6000 +
    21000 +
    postcardMid * 0.5 +
    15000 -
    sherwoodNetMid;
  const aggressiveStatewideTotal =
    assumptions.salary.total +
    travelAggressive.totals.total +
    materialsHigh +
    12000 +
    42000 +
    postcardMid +
    30000 -
    sherwoodNetMid;

  const generatedAt = new Date().toISOString();

  const summary = {
    generatedAt,
    pass: "CAMPAIGN-BUDGET-FRAMEWORK-1.0",
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
    bareMinimumTotal,
    workingCampaignTotal,
    aggressiveStatewideTotal,
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
  writeFileSync(path.join(OUT_DOCS, "COMMUNICATIONS-BUDGET.md"), buildCommunicationsMd(assumptions));
  writeFileSync(path.join(OUT_DOCS, "FUNDRAISING-GOAL-MODEL.md"), buildFundraisingMd(assumptions, summary));

  console.log(
    `Campaign budget framework: salary ${fmt(assumptions.salary.total)} · travel ${fmt(travelConservative.totals.total)}–${fmt(travelAggressive.totals.total)} · working scenario ${fmt(workingCampaignTotal)}`,
  );
}

main();
