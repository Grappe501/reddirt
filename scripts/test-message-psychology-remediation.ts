/**
 * KELLY-PUBLIC-MESSAGE-PSYCHOLOGY-REMEDIATION-1.0 — message precision invariants.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { aboutLaunchCopy } from "../src/content/about/about-launch";
import { acrossArkansasJourneyCopy } from "../src/content/about/across-arkansas-journey";
import { trustFunnelHomeCopy } from "../src/content/home/trust-funnel-home";

const root = path.join(__dirname, "..");
const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8");

function wordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

assert.ok(fs.existsSync(path.join(root, "docs/website/PUBLIC_MESSAGE_PRECISION_AUDIT.md")));
assert.ok(fs.existsSync(path.join(root, "docs/website/PUBLIC_CORE_MESSAGE_MAP.md")));

const heroWords = wordCount(trustFunnelHomeCopy.hero.body);
assert.ok(heroWords >= 25 && heroWords <= 45, `hero body words=${heroWords}`);

const meetWords = wordCount(
  [trustFunnelHomeCopy.meetKelly.intro, trustFunnelHomeCopy.meetKelly.body, trustFunnelHomeCopy.meetKelly.values].join(
    " ",
  ),
);
assert.ok(meetWords >= 150 && meetWords <= 220, `meet kelly words=${meetWords}`);
assert.equal(trustFunnelHomeCopy.meetKelly.cta, "Read About Kelly’s Experience");

const videoIntro = wordCount(trustFunnelHomeCopy.primaryMessage.introduction);
assert.ok(videoIntro >= 25 && videoIntro <= 60, `primary video intro words=${videoIntro}`);

assert.ok(!/across the (entire )?state/i.test(trustFunnelHomeCopy.acrossArkansas.intro));
assert.ok(!/all 75 counties/i.test(trustFunnelHomeCopy.acrossArkansas.intro));
assert.ok(!/momentum/i.test(trustFunnelHomeCopy.acrossArkansas.videoIntroduction));

assert.ok(trustFunnelHomeCopy.finalAction.ctas.join);
assert.ok(trustFunnelHomeCopy.finalAction.ctas.volunteer);
assert.ok(trustFunnelHomeCopy.finalAction.ctas.priorities);
assert.ok(!("about" in trustFunnelHomeCopy.finalAction.ctas));

const aboutPage = read("src/app/(site)/about/page.tsx");
assert.ok(aboutPage.includes("c.experience"), "about uses experience section");
assert.ok(aboutPage.includes("c.bringToOffice"), "about uses bring-to-office");
assert.ok(!aboutPage.includes("c.herStory"), "memoir herStory removed from page");
assert.ok(!aboutPage.includes("c.values"), "soft values block replaced");

const openingWords = wordCount(aboutLaunchCopy.opening.body.join(" "));
assert.ok(openingWords >= 100 && openingWords <= 140, `about opening words=${openingWords}`);

const aboutFull = wordCount(
  [
    aboutLaunchCopy.opening.body.join(" "),
    aboutLaunchCopy.experience.intro,
    ...aboutLaunchCopy.experience.items.map((i) => i.body),
    ...aboutLaunchCopy.whySos.body,
    ...aboutLaunchCopy.leadership.items.map((i) => `${i.title} ${i.body}`),
    aboutLaunchCopy.acrossArkansas.intro,
    ...aboutLaunchCopy.bringToOffice.items.map((i) => `${i.title} ${i.body}`),
    aboutLaunchCopy.closing.body,
  ].join(" "),
);
assert.ok(aboutFull >= 700 && aboutFull <= 1100, `about full words=${aboutFull}`);

const journeyIntro = wordCount(acrossArkansasJourneyCopy.intro);
assert.ok(journeyIntro >= 75 && journeyIntro <= 130, `journey intro words=${journeyIntro}`);

const registry = read("src/content/media/campaign-photo-registry.ts");
const aflcioBlock = registry.slice(
  registry.indexOf('id: "afl-cio-pre-event-networking-20260629"'),
  registry.indexOf('id: "mena-polk-meet-greet-20260411"'),
);
assert.ok(!/earned the organization.?s endorsement/i.test(aflcioBlock), "AFL-CIO caption must not claim endorsement");

console.log("Message psychology remediation checks passed.");
console.log("  heroWords=", heroWords);
console.log("  meetWords=", meetWords);
console.log("  aboutOpening=", openingWords, "aboutFull=", aboutFull);
console.log("  journeyIntro=", journeyIntro);
