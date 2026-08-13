/**
 * Public message invariants after Kelly Grappe Website Master Direction.
 * Candidate-approved copy supersedes prior word-count psychology caps.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { aboutLaunchCopy } from "../src/content/about/about-launch";
import { acrossArkansasJourneyCopy } from "../src/content/about/across-arkansas-journey";
import { trustFunnelHomeCopy } from "../src/content/home/trust-funnel-home";

const root = path.join(__dirname, "..");
const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8");

assert.ok(fs.existsSync(path.join(root, "docs/website/PUBLIC_MESSAGE_PRECISION_AUDIT.md")));
assert.ok(fs.existsSync(path.join(root, "docs/website/PUBLIC_CORE_MESSAGE_MAP.md")));

assert.equal(trustFunnelHomeCopy.hero.brand, "THE PEOPLE RULE.");
assert.equal(trustFunnelHomeCopy.hero.ctas[0].label, "Meet Kelly");
assert.equal(trustFunnelHomeCopy.hero.ctas[1].label, "See My Plan");
assert.equal(trustFunnelHomeCopy.hero.ctas[1].href, "/priorities");
assert.equal(trustFunnelHomeCopy.approvedHome.planCards.cards.length, 7);
assert.ok(trustFunnelHomeCopy.approvedHome.arkansasElections.title.includes("Arkansas Runs Arkansas Elections"));

assert.ok(trustFunnelHomeCopy.finalAction.ctas.join);
assert.ok(trustFunnelHomeCopy.finalAction.ctas.volunteer);
assert.ok(trustFunnelHomeCopy.finalAction.ctas.priorities);
assert.ok(!("about" in trustFunnelHomeCopy.finalAction.ctas));
assert.ok(trustFunnelHomeCopy.acrossArkansas.presenceLabel);

const aboutPage = read("src/app/(site)/about/page.tsx");
assert.ok(aboutPage.includes("c.family"), "about uses family section");
assert.ok(aboutPage.includes("c.rural"), "about uses rural Arkansas section");
assert.ok(aboutPage.includes("c.experienceCta"), "about links to public experience");
assert.ok(!aboutPage.includes("c.herStory"), "memoir herStory removed from page");

assert.ok(aboutLaunchCopy.opening.body.length >= 6);
assert.ok(aboutLaunchCopy.family.paragraphs.length >= 2);
assert.ok(aboutLaunchCopy.rural.paragraphs.length >= 2);

const journeyIntro = acrossArkansasJourneyCopy.intro.trim().split(/\s+/).filter(Boolean).length;
assert.ok(journeyIntro >= 75 && journeyIntro <= 130, `journey intro words=${journeyIntro}`);
assert.deepEqual(
  [...acrossArkansasJourneyCopy.evidenceVerbs],
  ["Listened", "Learned", "Visited", "Spoke", "Engaged"],
  "Journey evidence sequence is protected",
);
assert.ok(fs.existsSync(path.join(root, "docs/website/EVIDENCE_ENGINE.md")));
assert.ok(fs.existsSync(path.join(root, "docs/website/OPERATION_ARKANSAS.md")));

const registry = read("src/content/media/campaign-photo-registry.ts");
const aflcioBlock = registry.slice(
  registry.indexOf('id: "afl-cio-pre-event-networking-20260629"'),
  registry.indexOf('id: "mena-polk-meet-greet-20260411"'),
);
assert.ok(!/earned the organization.?s endorsement/i.test(aflcioBlock), "AFL-CIO caption must not claim endorsement");

console.log("Master-direction public copy checks passed.");
