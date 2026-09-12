import assert from "node:assert/strict";
import { aggregateSiteTraffic, trafficBriefInput } from "../src/lib/analytics/site-traffic-aggregate";
import { sanitizeAnalyticsPath, sanitizeAnalyticsPayload } from "../src/lib/analytics/sanitize-payload";

const t0 = new Date("2026-09-12T12:00:00.000Z");
const t1 = new Date("2026-09-12T12:01:00.000Z");
const t2 = new Date("2026-09-12T12:02:00.000Z");

const snapshot = aggregateSiteTraffic(
  [
    {
      path: "/admin/site-analytics",
      sessionId: "staff",
      createdAt: t0,
      payload: { pathname: "/admin/site-analytics" },
    },
    {
      path: "/",
      sessionId: "visitor-a",
      createdAt: t0,
      payload: { pathname: "/", referrer: "facebook.com/", utm_source: "facebook", utm_campaign: "trail" },
    },
    {
      path: "/from-the-road",
      sessionId: "visitor-a",
      createdAt: t1,
      payload: { pathname: "/from-the-road" },
    },
    {
      path: "/events",
      sessionId: "visitor-b",
      createdAt: t2,
      payload: { pathname: "/events", ip: "203.0.113.10" },
    },
  ],
  7,
);

assert.equal(snapshot.pageViews, 3);
assert.equal(snapshot.sessions, 2);
assert.equal(snapshot.singlePageSessions, 1);
assert.equal(snapshot.pages[0]?.path, "/");
assert.equal(snapshot.pages.find((p) => p.path === "/from-the-road")?.hits, 1);
assert.equal(snapshot.referrers[0]?.referrer, "facebook.com/");
assert.equal(snapshot.campaigns[0]?.campaign, "facebook / trail");
assert.deepEqual(snapshot.paths[0]?.steps, ["/", "/from-the-road"]);

const brief = trafficBriefInput(snapshot);
assert.doesNotMatch(brief, /203\.0\.113/);
assert.doesNotMatch(brief, /visitor-a/);
assert.doesNotMatch(brief, /staff/);

assert.equal(sanitizeAnalyticsPath("/events?utm_source=x"), "/events");
assert.equal(sanitizeAnalyticsPath("https://evil.example/"), undefined);
const cleaned = sanitizeAnalyticsPayload({
  pathname: "/donate",
  referrer: "m.facebook.com/",
  ip: "203.0.113.10",
  email: "neighbor@example.com",
  extra: "drop-me",
});
assert.deepEqual(cleaned, { pathname: "/donate", referrer: "m.facebook.com/" });
assert.equal("ip" in cleaned, false);

console.log("test-site-traffic-aggregate ok");
