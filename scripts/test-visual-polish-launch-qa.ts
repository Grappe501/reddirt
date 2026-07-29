/**
 * KELLY-PUBLIC-VISUAL-POLISH-AND-LAUNCH-QA-1.0 — chrome + crop + tap-target invariants.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { homepagePhotoObjectPositionClass, listHomepageCampaignPhotos } from "../src/content/media/homepage-campaign-photos";
import {
  trustFunnelCtaNavy,
  trustFunnelCtaOutline,
  trustFunnelCtaOutlineOnDark,
  trustFunnelCtaPrimary,
} from "../src/components/home/trust-funnel/trustFunnelChrome";
import { trustFunnelHomeCopy } from "../src/content/home/trust-funnel-home";

const root = path.join(__dirname, "..");
const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8");

assert.ok(trustFunnelCtaPrimary.includes("bg-kelly-gold"));
assert.ok(trustFunnelCtaNavy.includes("bg-kelly-navy"));
assert.ok(trustFunnelCtaOutline.includes("border-2"));
assert.ok(trustFunnelCtaOutlineOnDark.includes("text-white"));

const finalAction = read("src/components/home/trust-funnel/TrustFunnelFinalActionSection.tsx");
assert.ok(finalAction.includes("trustFunnelCtaPrimary"));
assert.ok(finalAction.includes("trustFunnelCtaOutline"));

const meet = read("src/components/home/trust-funnel/TrustFunnelMeetKellySection.tsx");
assert.ok(meet.includes("homepagePhotoObjectPositionClass"));
assert.ok(meet.includes("trustFunnelCtaNavy"));
assert.ok(meet.includes("copy.beats") || meet.includes("beats.map"), "Meet Kelly uses conversation beats");
assert.ok(meet.includes("principle") || meet.includes("copy.principle"), "Meet Kelly principle line");

const endorsements = read("src/components/home/trust-funnel/TrustFunnelEndorsementsSection.tsx");
assert.ok(endorsements.includes("Earned through listening"), "endorsements empty state intentional framing");
assert.ok(!/No endorsements are listed yet/i.test(trustFunnelHomeCopy.endorsements.emptyState));

const hero = read("src/components/home/trust-funnel/TrustFunnelHero.tsx");
assert.ok(hero.includes("trustFunnelCtaPrimary"), "hero uses shared primary CTA");
assert.ok(hero.includes("trustFunnelCtaOutlineOnDark"), "hero secondary uses dark outline chrome");
assert.ok(hero.includes("min(92svh,740px)"), "mobile hero height polish");

const pillars = read("src/components/home/trust-funnel/TrustFunnelFourPillarsSection.tsx");
assert.ok(pillars.includes("min-h-[48px]"), "pillar explore links 48px");
assert.ok(!pillars.includes("focus-visible:ring-2"), "pillar focus uses outline recipe");

const layout = read("src/app/(site)/layout.tsx");
assert.ok(layout.includes("focus-visible:not-sr-only"), "skip link uses focus-visible");

const footer = read("src/components/layout/SiteFooter.tsx");
assert.ok(footer.includes("min-h-[48px]"), "footer volunteer 48px");

const social = read("src/components/layout/SocialFooterIcons.tsx");
assert.ok(social.includes("h-11 w-11") || social.includes("h-12 w-12"), "social tap targets enlarged");

const button = read("src/components/ui/Button.tsx");
assert.ok(button.includes("shadow-[var(--shadow-soft)]") || button.includes("shadow-soft"));

const tw = read("tailwind.config.ts");
assert.ok(tw.includes("boxShadow") && tw.includes("soft"), "tailwind shadow-soft wired");

const photos = listHomepageCampaignPhotos();
assert.ok(photos.length >= 6);
for (const photo of photos) {
  const pos = homepagePhotoObjectPositionClass(photo);
  assert.ok(pos.startsWith("object-"), `bad object position for ${photo.id}`);
  assert.ok(photo.accessibility.altText.trim().length > 12, `alt too short: ${photo.id}`);
  assert.ok(photo.accessibility.caption.trim().length > 8, `caption too short: ${photo.id}`);
}

const afl = photos.find((p) => p.id.includes("afl-cio"));
if (afl) {
  assert.ok(!/endorsement/i.test(afl.accessibility.caption), "AFL-CIO caption must not claim endorsement");
}

assert.ok(fs.existsSync(path.join(root, "docs/website/PUBLIC_SITE_EDITORIAL_DOCTRINE.md")));

console.log("Visual polish + launch QA chrome checks passed.");
console.log("  photos=", photos.length);
