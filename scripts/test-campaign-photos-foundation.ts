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

const cave = getCampaignPhotoById("cave-city-watermelon-festival-parade-20260725");
assert.ok(cave);
assert.equal(cave!.campaign.county, "Sharp");
assert.equal(cave!.campaign.city, "Cave City");
assert.ok(listCampaignPhotosByCounty("Sharp").some((p) => p.id === cave!.id));

const peach = getCampaignPhotoById("johnson-county-peach-festival-parade-20260718");
assert.ok(peach);
assert.equal(peach!.campaign.county, "Johnson");
assert.ok(listCampaignPhotosByCounty("Johnson").some((p) => p.id === peach!.id));

const laws = getCampaignPhotoById("election-laws-arkansas-2025-edition-20260723");
assert.ok(laws);
assert.equal(laws!.heroLevel, "SUPPORTING");
assert.equal(laws!.campaign.peopleVisible.length, 0);

assert.ok(CAMPAIGN_PHOTO_REGISTRY.length >= 12);
assert.ok(listFeatureCandidates().length >= 8);

const family = getCampaignPhotoById("personal-family-moment-20260707");
assert.ok(family);
assert.equal(family!.heroLevel, "SUPPORTING");
assert.equal(family!.campaign.featuredPhoto, false);

const bates = getCampaignPhotoById("bates-event-conversation-20260626");
assert.ok(bates);
assert.equal(bates!.campaign.county, UNKNOWN);

assert.ok(CAMPAIGN_PHOTO_REGISTRY.length >= 21);
assert.ok(getCampaignPhotoById("community-meeting-group-portrait-20260716"));

const buttigieg = getCampaignPhotoById("regnat-populus-buttigieg-group-20260626");
assert.ok(buttigieg);
assert.ok(buttigieg!.campaign.peopleVisible.includes("Pete Buttigieg"));
assert.ok(buttigieg!.campaign.peopleVisible.includes("Kelly Grappe"));
assert.equal(buttigieg!.heroLevel, "FEATURE");

assert.ok(getCampaignPhotoById("good-things-grow-tomato-table-20260613"));
assert.ok(getCampaignPhotoById("stone-building-handshake-steps-20260620"));
assert.ok(CAMPAIGN_PHOTO_REGISTRY.length >= 31);

const childTomato = getCampaignPhotoById("county-clerk-tomato-with-child-20260613");
assert.ok(childTomato);
assert.equal(childTomato!.heroLevel, "SUPPORTING");
assert.ok(getCampaignPhotoById("county-clerk-eating-tomato-20260613"));
assert.ok(getCampaignPhotoById("democrats-meeting-listening-20260612"));
assert.ok(CAMPAIGN_PHOTO_REGISTRY.length >= 41);

console.log("Campaign photo registry checks passed.");
