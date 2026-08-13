/**
 * KELLY-HOMEPAGE-POLISH-SLICE-1.0 — structural / a11y invariants for `/`
 * (updated for 48h launch sprint narrative; donate gate + volunteer alignment still apply).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getVolunteerSignupHref } from "../src/config/external-campaign";
import { trustFunnelHomeCopy } from "../src/content/home/trust-funnel-home";

const root = path.join(__dirname, "..");
const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8");

const page = read("src/app/(site)/page.tsx");
const header = read("src/components/layout/SiteHeader.tsx");
const meetKelly = read("src/components/home/trust-funnel/TrustFunnelMeetKellySection.tsx");
const hero = read("src/components/home/trust-funnel/TrustFunnelHero.tsx");
const wireframe = read("src/components/home/HomeTrustFunnelWireframe.tsx");

assert.ok(page.includes("HomeTrustFunnelWireframe"), "homepage must mount trust-funnel wireframe");
assert.ok(
  !/from\s+["']@\/components\/home\/HomeExperience["']/.test(page) && !page.includes("<HomeExperience"),
  "homepage must not remount HomeExperience",
);
assert.ok(
  !/from\s+["']@\/lib\/content\/homepage-merge["']/.test(page) && !page.includes("getMergedHomepageConfig("),
  "admin homepage merge must stay unused on /",
);
assert.ok(
  page.includes("NEXT_PUBLIC_HOME_DONATE_FLOATING_GATE") && page.includes("isHomeDonateFloatingGateEnabled"),
  "donate floating gate must be env-gated off by default",
);

assert.ok(header.includes("getVolunteerSignupHref"), "header Volunteer must use getVolunteerSignupHref");
assert.ok(!header.includes("getJoinCampaignHref"), "header must not use getJoinCampaignHref for Volunteer");

assert.ok(wireframe.includes("TrustFunnelApprovedBody"), "approved homepage body must mount");
assert.ok(wireframe.includes("TrustFunnelFinalActionSection"), "final action band must mount");
assert.ok(!wireframe.includes("Shorts"), "no Shorts carousel in wireframe");

assert.ok(!meetKelly.includes("ContentPendingBadge"), "Meet Kelly preview must not show draft badge");
assert.equal(
  "pendingNote" in trustFunnelHomeCopy.meetKelly,
  false,
  "meetKelly pendingNote removed for concise home preview",
);

assert.ok(!hero.includes("<video"), "hero must not autoplay video");
assert.ok(hero.includes("copy.brand") || hero.includes("Kelly Grappe") || hero.includes("{copy.brand}"), "hero brand present");
assert.ok(hero.includes('role="group"'), "hero CTAs grouped for a11y");
assert.ok(trustFunnelHomeCopy.hero.ctas.length === 2, "hero limited to two CTAs");

const volunteer = getVolunteerSignupHref();
assert.ok(volunteer.length > 0, "volunteer signup href resolves");
assert.ok(
  volunteer.startsWith("/") || /^https?:\/\//i.test(volunteer),
  "volunteer href must be on-site path or http(s)",
);

console.log("Homepage polish Slice 1 checks passed.");
console.log("  volunteerHref=", volunteer);
console.log("  donateGateDefault=off (NEXT_PUBLIC_HOME_DONATE_FLOATING_GATE!==true)");
