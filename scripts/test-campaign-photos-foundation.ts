/**
 * Smoke tests — campaign photo registry foundation (empty until uploads).
 * Run: npm run agents:test-campaign-photos
 */

import assert from "node:assert/strict";
import {
  assertCampaignPhotoRegistryInvariants,
  CAMPAIGN_PHOTO_REGISTRY,
  listCampaignPhotosByCounty,
  listHeroCandidates,
  listPublishedCampaignPhotos,
} from "../src/content/media/campaign-photo-registry";
import { UNKNOWN } from "../src/content/media/campaign-photo-types";

assertCampaignPhotoRegistryInvariants();
assert.equal(CAMPAIGN_PHOTO_REGISTRY.length, 0);
assert.equal(listPublishedCampaignPhotos().length, 0);
assert.equal(listHeroCandidates().length, 0);
assert.equal(listCampaignPhotosByCounty("Greene").length, 0);
assert.equal(UNKNOWN, "Unknown");

console.log("Campaign photo registry foundation checks passed (empty registry).");
