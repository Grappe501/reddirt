/**
 * SOS three domains — week supplement wiring (Days 1–7).
 */
import assert from "node:assert/strict";

import {
  getSosWeekDayContext,
  listSosWeekPrepDayIds,
  SOS_THREE_DOMAINS_FRAME,
  SOS_WEEK_PREP_DAY_IDS,
} from "../src/lib/election-plan/debate-prep-sos-three-domains-week";
import { DAY8_SOS_DOMAIN_CARDS } from "../src/lib/election-plan/debate-prep-day8-sos-three-domains";

assert.ok(SOS_THREE_DOMAINS_FRAME.includes("business services"));
assert.ok(SOS_THREE_DOMAINS_FRAME.includes("Capitol management"));
assert.equal(SOS_WEEK_PREP_DAY_IDS.length, 7);
assert.equal(listSosWeekPrepDayIds().length, 7);

for (const dayId of SOS_WEEK_PREP_DAY_IDS) {
  const ctx = getSosWeekDayContext(dayId);
  assert.ok(ctx, `context for ${dayId}`);
  assert.equal(ctx!.domainNav.length, 3, `${dayId} has 3 domain nav links`);
  assert.ok(ctx!.tonightTrick.startsWith("Trick"), `${dayId} has trick`);
  assert.ok(ctx!.frameNote.length > 20, `${dayId} has frame note`);
  assert.ok(ctx!.day8PreviewHref.startsWith("/election-plan/"), `${dayId} day8 preview href`);

  for (const nav of ctx!.domainNav) {
    assert.ok(nav.href.startsWith("/election-plan/"), `${dayId} · ${nav.domainId} href`);
    assert.ok(DAY8_SOS_DOMAIN_CARDS.some((c) => c.id === nav.domainId));
  }
}

assert.ok(
  getSosWeekDayContext("day-3-superiority-map")!.spotlightDomainIds.includes("business-services"),
  "Day 3 spotlights business services",
);
assert.ok(
  getSosWeekDayContext("day-7-refine-and-steal-show")!.domainNav.every((n) => n.href.includes("day-7")),
  "Day 7 domain links stay on Day 7 blocks",
);

console.log("test-sos-three-domains-week: OK (7 days, 3 domains each, nav + tricks wired)");
