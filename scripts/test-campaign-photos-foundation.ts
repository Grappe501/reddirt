/**
 * Smoke tests — campaign photo registry foundation.
 * Run: npm run agents:test-campaign-photos
 */

import assert from "node:assert/strict";
import {
  assertCampaignPhotoRegistryInvariants,
  CAMPAIGN_PHOTO_REGISTRY,
  getCampaignPhotoById,
  listCampaignPhotosByCounty,
  listFeatureCandidates,
  listHeroCandidates,
  listPublishedCampaignPhotos,
} from "../src/content/media/campaign-photo-registry";
import { UNKNOWN } from "../src/content/media/campaign-photo-types";

assertCampaignPhotoRegistryInvariants();
assert.ok(CAMPAIGN_PHOTO_REGISTRY.length >= 1);
assert.equal(listPublishedCampaignPhotos().length, 0);

const afl = getCampaignPhotoById("afl-cio-pre-event-networking-20260629");
assert.ok(afl);
assert.equal(afl!.heroLevel, "FEATURE");
assert.equal(afl!.publicationStatus, "DRAFT");
assert.equal(afl!.campaign.county, UNKNOWN);
assert.equal(afl!.campaign.city, UNKNOWN);
assert.ok(afl!.campaign.organizations.includes("Arkansas AFL-CIO"));
assert.ok(afl!.campaign.peopleVisible.includes("Kelly Grappe"));
assert.ok(afl!.accessibility.altText.length > 20);
assert.ok(afl!.accessibility.caption.includes("AFL-CIO"));
assert.equal(listCampaignPhotosByCounty("Greene").length, 0);
assert.ok(listCampaignPhotosByCounty("Polk").some((p) => p.id === "mena-polk-meet-greet-20260411"));
assert.ok(listCampaignPhotosByCounty("polk county").length >= 1);
const mena = getCampaignPhotoById("mena-polk-meet-greet-20260411");
assert.ok(mena);
assert.equal(mena!.campaign.city, "Mena");
assert.equal(mena!.campaign.county, "Polk");
assert.equal(mena!.heroLevel, "FEATURE");
assert.ok(listFeatureCandidates().some((p) => p.id === afl!.id));
assert.ok(listFeatureCandidates().some((p) => p.id === mena!.id));
assert.equal(listHeroCandidates().length, 0);

console.log("Campaign photo registry checks passed.");
