/**
 * P5 county clerks week — 7-day path, audience mode, Packo scaffold, nav.
 */
import assert from "node:assert/strict";
import {
  COUNTY_CLERK_SEVEN_DAY_PATH,
  getCountyClerkDayPlan,
  totalCountyClerkReadMinutes,
  HAMMER_VS_KELLY_CLERK_MATRIX,
} from "../src/lib/intelligence/v4/countyClerkSevenDayPrepPath";
import { COUNTY_CLERK_EVENT_FRAME } from "../src/lib/intelligence/v4/kellyOpponentContrastPlaybook";
import {
  getDebateWeekPrimaryNavItems,
  COUNTY_CLERK_WEEK_PRIMARY_NAV_ITEMS,
} from "../src/lib/intelligence/debate-week-nav";
import {
  loadMichaelPackoScaffold,
  packoOpenTaskCount,
} from "../src/lib/intelligence/opponents/loadMichaelPackoScaffold";

process.env.NEXT_PUBLIC_DEBATE_PRIMARY_AUDIENCE = "county_clerks";

assert.equal(COUNTY_CLERK_SEVEN_DAY_PATH.length, 7);
assert.ok(totalCountyClerkReadMinutes() > 200);
assert.equal(getCountyClerkDayPlan(6)?.title.includes("live"), true);
assert.ok(HAMMER_VS_KELLY_CLERK_MATRIX.length >= 5);
assert.ok(COUNTY_CLERK_EVENT_FRAME.trapQuestions.length >= 3);

const day6 = getCountyClerkDayPlan(6)!;
assert.ok(day6.kellyReads.some((r) => r.href.includes("county-clerk-week")));

const packo = loadMichaelPackoScaffold();
assert.ok(packo);
assert.equal(packo!.candidateId, "michael-packo");
assert.ok(packoOpenTaskCount(packo!) >= 5);

const nav = getDebateWeekPrimaryNavItems();
assert.equal(nav[0]?.href, "/admin/intelligence/county-clerk-week");
assert.ok(COUNTY_CLERK_WEEK_PRIMARY_NAV_ITEMS.some((i) => i.href.includes("opponents")));

console.log("test-debate-intelligence-county-week: OK");
