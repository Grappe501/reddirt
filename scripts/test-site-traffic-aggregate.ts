import assert from "node:assert/strict";
import { aggregateSiteTraffic, trafficBriefInput } from "../src/lib/analytics/site-traffic-aggregate";
import {
  buildSiteTrafficIntelligence,
  trafficIntelligenceBriefInput,
} from "../src/lib/analytics/site-traffic-intelligence";
import { sanitizeAnalyticsPath, sanitizeAnalyticsPayload } from "../src/lib/analytics/sanitize-payload";
import { classifyTrafficSource } from "../src/lib/analytics/traffic-source";
import {
  classifyContentSection,
  classifyDeviceFromUserAgent,
  countySlugFromPath,
  isCampaignAnalyticsPath,
  isPublicConversionHref,
} from "../src/lib/analytics/visitor-signals";

const t0 = new Date("2026-09-12T12:00:00.000Z");
const t1 = new Date("2026-09-12T12:01:00.000Z");
const t2 = new Date("2026-09-12T12:02:00.000Z");
const tLater = new Date("2026-09-12T12:40:00.000Z");

const snapshot = aggregateSiteTraffic(
  [
    {
      name: "page_view",
      path: "/admin/site-analytics",
      sessionId: "staff",
      createdAt: t0,
      payload: { pathname: "/admin/site-analytics" },
    },
    {
      name: "page_view",
      path: "/",
      sessionId: "visitor-a",
      createdAt: t0,
      payload: {
        pathname: "/",
        referrer: "facebook.com/",
        utm_source: "facebook",
        utm_campaign: "trail",
        device: "phone",
      },
    },
    {
      name: "page_view",
      path: "/from-the-road",
      sessionId: "visitor-a",
      createdAt: t1,
      payload: { pathname: "/from-the-road", device: "phone" },
    },
    {
      name: "page_view",
      path: "/fec-max-donors",
      sessionId: "research",
      createdAt: t2,
      payload: { pathname: "/fec-max-donors", referrer: "google.com/" },
    },
    {
      name: "page_view",
      path: "/events",
      sessionId: "visitor-b",
      createdAt: t2,
      payload: { pathname: "/events", ip: "203.0.113.10" },
    },
    {
      name: "page_view",
      path: "/about",
      sessionId: "search-c",
      createdAt: t2,
      payload: { pathname: "/about", referrer: "www.google.com/", device: "desktop" },
    },
    {
      name: "page_view",
      path: "/counties/pulaski-county",
      sessionId: "visitor-a",
      createdAt: tLater,
      payload: { pathname: "/counties/pulaski-county", device: "phone" },
    },
    {
      name: "form_start",
      path: "/get-involved",
      sessionId: "visitor-b",
      createdAt: t2,
      payload: { formType: "volunteer" },
    },
    {
      name: "form_complete",
      path: "/get-involved",
      sessionId: "visitor-b",
      createdAt: t2,
      payload: { formType: "volunteer" },
    },
    {
      name: "cta_click",
      path: "/",
      sessionId: "visitor-a",
      createdAt: t1,
      payload: { label: "Volunteer", href: "/get-involved" },
    },
    {
      name: "engage",
      path: "/",
      sessionId: "visitor-a",
      createdAt: t1,
      payload: { pathname: "/" },
    },
  ],
  7,
);

assert.equal(snapshot.pageViews, 5);
assert.equal(snapshot.visitors, 3);
assert.equal(snapshot.sessions, 4);
assert.equal(snapshot.singlePageSessions, 3);
assert.equal(snapshot.formStarts, 1);
assert.equal(snapshot.formCompletes, 1);
assert.equal(snapshot.ctaClicks, 1);
assert.equal(snapshot.pages[0]?.path, "/");
assert.equal(snapshot.pages.find((p) => p.path === "/from-the-road")?.hits, 1);
assert.equal(snapshot.referrers[0]?.referrer, "facebook.com/");
assert.equal(snapshot.campaigns[0]?.campaign, "facebook / trail");
assert.equal(snapshot.counties[0]?.label, "pulaski-county");
assert.ok(snapshot.sections.some((row) => row.label === "From the Road"));
assert.ok(snapshot.devices.some((row) => row.label === "phone"));
assert.deepEqual(snapshot.paths[0]?.steps, ["/", "/from-the-road"]);
assert.equal(snapshot.funnel[3]?.count, 1);
assert.ok(!snapshot.pages.some((p) => p.path.startsWith("/fec-max-donors")));
assert.equal(snapshot.seo.sessions, 1);
assert.equal(snapshot.seo.landings[0]?.path, "/about");
assert.ok(snapshot.channels.some((row) => row.id === "search" && row.sessions === 1));
assert.ok(snapshot.channels.some((row) => row.id === "social" && row.sessions === 1));
assert.ok(snapshot.journeys.length >= 4);
assert.ok(snapshot.analysis.length >= 2);
assert.ok(snapshot.transitions.some((row) => row.from === "/" && row.to === "/from-the-road"));
assert.ok(snapshot.pageIntel.some((row) => row.path === "/" && row.landings >= 1));
assert.ok(snapshot.depth.some((row) => row.label === "2 pages" && row.sessions >= 1));
assert.ok(snapshot.sourceLandings.some((row) => row.landing === "/"));
assert.ok(snapshot.newVisitors >= 1);
assert.ok(snapshot.hypotheses.length >= 1);
assert.ok(snapshot.landingGrades.some((row) => row.path === "/"));
assert.ok(snapshot.pathClusters.some((row) => row.pattern.includes("/from-the-road")));
assert.equal(classifyTrafficSource({ referrer: "www.google.com/" }).channel, "search");
assert.equal(isCampaignAnalyticsPath("/fec-max-donors"), false);
assert.equal(isCampaignAnalyticsPath("/from-the-road"), true);

const brief = trafficBriefInput(snapshot);
assert.doesNotMatch(brief, /203\.0\.113/);
assert.doesNotMatch(brief, /visitor-a/);
assert.doesNotMatch(brief, /staff/);
assert.doesNotMatch(brief, /search-c/);
assert.doesNotMatch(brief, /research/);

assert.equal(sanitizeAnalyticsPath("/events?utm_source=x"), "/events");
assert.equal(sanitizeAnalyticsPath("https://evil.example/"), undefined);
const cleaned = sanitizeAnalyticsPayload({
  pathname: "/donate",
  referrer: "m.facebook.com/",
  ip: "203.0.113.10",
  email: "neighbor@example.com",
  extra: "drop-me",
  device: "phone",
  locale: "en-US",
  utm_content: "header",
});
assert.deepEqual(cleaned, {
  pathname: "/donate",
  referrer: "m.facebook.com/",
  device: "phone",
  locale: "en-US",
  utm_content: "header",
});
assert.equal("ip" in cleaned, false);

assert.equal(classifyDeviceFromUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"), "phone");
assert.equal(classifyDeviceFromUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120"), "desktop");
assert.equal(classifyContentSection("/from-the-road"), "from_the_road");
assert.equal(countySlugFromPath("/counties/pulaski-county"), "pulaski-county");
assert.equal(isPublicConversionHref("/donate"), true);
assert.equal(isPublicConversionHref("/about"), false);

const intel = buildSiteTrafficIntelligence(snapshot);
assert.ok(intel.healthScore > 0);
assert.notEqual(intel.mood, "quiet");
assert.ok(intel.countyNames.includes("Pulaski County"));
assert.ok(intel.formConversionRate != null && intel.formConversionRate > 0);
assert.ok(intel.leaks.every((row) => row.page.startsWith("/")));
const intelBrief = trafficIntelligenceBriefInput(snapshot, intel);
assert.doesNotMatch(intelBrief, /203\.0\.113/);
assert.doesNotMatch(intelBrief, /visitor-a/);
assert.match(intelBrief, /Pulaski County/);

const quiet = buildSiteTrafficIntelligence({
  ...snapshot,
  pageViews: 0,
  visitors: 0,
  sessions: 0,
  pages: [],
  landingPages: [],
  exitPages: [],
  daysSeries: snapshot.daysSeries.map((row) => ({ ...row, pageViews: 0, sessions: 0, visitors: 0 })),
});
assert.equal(quiet.mood, "quiet");
assert.equal(quiet.healthScore, 0);

console.log("test-site-traffic-aggregate ok");
