/**
 * KELLY-HOMEPAGE-PHOTOS-SLICE-2.0 invariants.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  HOMEPAGE_CAMPAIGN_PHOTO_IDS,
  HOMEPAGE_HERO_PHOTO_ID,
  HOMEPAGE_MEET_KELLY_PHOTO_ID,
  getHomepageHeroPhoto,
  getHomepageMeetKellyPhoto,
  homepagePhotoCountyHref,
  listHomepageCampaignPhotos,
} from "../src/content/media/homepage-campaign-photos";
import { CAMPAIGN_PHOTO_REGISTRY, getCampaignPhotoById } from "../src/content/media/campaign-photo-registry";

const root = path.join(__dirname, "..");
const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8");

const page = read("src/app/(site)/page.tsx");
const wireframe = read("src/components/home/HomeTrustFunnelWireframe.tsx");

assert.ok(wireframe.includes("TrustFunnelCampaignPhotosSection"), "photo band must mount");
assert.ok(wireframe.includes("getHomepageMeetKellyPhoto"), "Meet Kelly still selector wired");
assert.ok(!/from\s+["']@\/lib\/content\/homepage-merge["']/.test(page), "admin merge unused on /");
assert.ok(!wireframe.includes("Shorts"), "no Shorts on wireframe");
assert.equal(HOMEPAGE_HERO_PHOTO_ID, null, "no HERO still claimed for homepage hero");
assert.equal(getHomepageHeroPhoto(), null);

const curated = listHomepageCampaignPhotos();
assert.ok(curated.length >= 6 && curated.length <= 10, `curated count ${curated.length} must be 6–10`);
assert.equal(curated.length, HOMEPAGE_CAMPAIGN_PHOTO_IDS.length);

for (const id of HOMEPAGE_CAMPAIGN_PHOTO_IDS) {
  const p = getCampaignPhotoById(id);
  assert.ok(p, `missing registry id ${id}`);
  assert.equal(p!.heroLevel, "FEATURE");
  assert.equal(p!.campaign.homepageCandidate, true);
  assert.ok(p!.accessibility.altText.trim());
  assert.ok(p!.accessibility.caption.trim());
}

const candidates = CAMPAIGN_PHOTO_REGISTRY.filter((p) => p.campaign.homepageCandidate);
assert.equal(candidates.length, HOMEPAGE_CAMPAIGN_PHOTO_IDS.length, "only curated IDs are homepageCandidate");

const afl = getCampaignPhotoById("afl-cio-pre-event-networking-20260629")!;
assert.equal(afl.campaign.county, "Unknown");
assert.equal(homepagePhotoCountyHref(afl), null, "AFL-CIO must not attach to a county");

const mena = getCampaignPhotoById("mena-polk-meet-greet-20260411")!;
assert.equal(mena.campaign.city, "Mena");
assert.equal(mena.campaign.county, "Polk");
assert.equal(homepagePhotoCountyHref(mena), "/counties/polk");

const meet = getHomepageMeetKellyPhoto();
assert.ok(meet);
assert.equal(meet!.id, HOMEPAGE_MEET_KELLY_PHOTO_ID);

console.log("Homepage photos Slice 2 checks passed.");
console.log("  curated=", curated.map((p) => p.id).join(", "));
