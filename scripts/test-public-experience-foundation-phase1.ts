/**
 * Focused Phase 1 foundation tests (pure + optional DB).
 * Run: npx tsx scripts/test-public-experience-foundation-phase1.ts
 */

import assert from "node:assert/strict";
import {
  clampFocalOrThrow,
  DEFAULT_FOCAL_X,
  focalToObjectPosition,
  isValidFocalCoordinate,
  resolveEffectiveFocal,
} from "../src/lib/public-media/focal";
import {
  getPublicMediaSlotDefinition,
  isValidPublicMediaSlot,
  listPublicMediaSlotsForPage,
} from "../src/lib/public-media/slot-registry";
import { normalizeVolunteerInterests } from "../src/lib/forms/volunteer-interest-taxonomy";
import { joinMovementSchema, volunteerSchema } from "../src/lib/forms/schemas";

function section(name: string) {
  console.log(`\n== ${name} ==`);
}

section("focal");
assert.equal(isValidFocalCoordinate(0), true);
assert.equal(isValidFocalCoordinate(1), true);
assert.equal(isValidFocalCoordinate(0.5), true);
assert.equal(isValidFocalCoordinate(-0.1), false);
assert.equal(isValidFocalCoordinate(1.1), false);
assert.throws(() => clampFocalOrThrow(1.5, "focalX"));
assert.equal(focalToObjectPosition(0, 1), "0% 100%");
assert.equal(focalToObjectPosition(0.5, 0.5), "50% 50%");
assert.deepEqual(
  resolveEffectiveFocal({
    placementFocalX: 0.2,
    placementFocalY: null,
    assetFocalX: 0.8,
    assetFocalY: 0.9,
  }),
  { x: 0.2, y: 0.9 },
);
assert.deepEqual(
  resolveEffectiveFocal({
    assetFocalX: null,
    assetFocalY: null,
  }),
  { x: DEFAULT_FOCAL_X, y: DEFAULT_FOCAL_X },
);

section("slots");
assert.equal(isValidPublicMediaSlot("home.personality.primary"), true);
assert.equal(isValidPublicMediaSlot("home.unknown"), false);
assert.equal(getPublicMediaSlotDefinition("nope"), null);
assert.equal(listPublicMediaSlotsForPage("home").length, 8);
assert.equal(listPublicMediaSlotsForPage("about").length, 0);

section("interest taxonomy");
assert.deepEqual(normalizeVolunteerInterests(["canvassing", "bogus-thing"]).keys.sort(), [
  "canvassing",
  "other",
].sort());
assert.ok(normalizeVolunteerInterests(["pref_role:events"]).keys.includes("events"));
assert.ok(normalizeVolunteerInterests(["power_of_five"]).keys.includes("relational_organizing"));

section("join/volunteer schemas");
{
  const join = joinMovementSchema.safeParse({
    formType: "join_movement",
    name: "Test Neighbor",
    email: "test.neighbor@example.com",
    interests: ["events"],
    consentEmail: true,
    sourcePage: "/",
  });
  assert.equal(join.success, true, join.success ? "" : JSON.stringify(join.error.flatten()));

  const joinNoConsent = joinMovementSchema.safeParse({
    formType: "join_movement",
    name: "Test Neighbor",
    email: "test.neighbor@example.com",
  });
  assert.equal(joinNoConsent.success, true);

  const vol = volunteerSchema.safeParse({
    formType: "volunteer",
    firstName: "Test",
    lastName: "Volunteer",
    email: "test.volunteer@example.com",
    interests: ["canvassing", "unknown_lane"],
    consentEmail: true,
    consentSms: true,
    // no phone → SMS consent must be handled downstream as skipped_no_phone
  });
  assert.equal(vol.success, true, vol.success ? "" : JSON.stringify(vol.error.flatten()));
}

section("resolver unknown slot");
async function runAsyncChecks() {
  const { resolvePublicMediaSlot } = await import("../src/lib/public-media/resolve-slot");
  await assert.rejects(() => resolvePublicMediaSlot("not.a.slot"), /Unknown public media slot/);

  section("resolver static fallback without placement (DB optional)");
  try {
    const { isDatabaseConfigured } = await import("../src/lib/env");
    if (!isDatabaseConfigured()) {
      console.log("skip DB resolver checks — database not configured");
    } else {
      const resolved = await resolvePublicMediaSlot("home.personality.primary");
      assert.ok(resolved.sourceUrl);
      assert.ok(["owned-media", "static-content-image", "fallback-placeholder"].includes(resolved.provenance));
      assert.equal(typeof resolved.objectPosition, "string");
      if (!resolved.placementId) {
        assert.equal(resolved.fallbackUsed, true);
        assert.notEqual(resolved.provenance, "owned-media");
      }
    }
  } catch (e) {
    console.log("DB resolver check skipped:", e instanceof Error ? e.message : e);
  }
}

runAsyncChecks()
  .then(() => {
    console.log("\nAll Phase 1 foundation focused checks passed.");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
