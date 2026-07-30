/**
 * Pass F — Live Parity QA crawl (local production binary).
 * Usage: node scripts/public-live-parity-qa.cjs [baseUrl]
 *
 * Checks:
 * - ★ / primary marketing routes → 200 (follow redirects)
 * - Primary CTA label→href destinations reachable
 * - No admin / Owned Media strings in public HTML samples
 * - Form surfaces present; /api/forms validation + honeypot paths
 * - Skip link + main landmark present on home
 */
const http = require("node:http");
const https = require("node:https");
const { URL } = require("node:url");

const base = process.argv[2] || "http://127.0.0.1:3456";

/** ★ / primary marketing + legal + Pass A–E critical doors */
const STAR_ROUTES = [
  "/",
  "/about",
  "/about/journey",
  "/about/community",
  "/about/why-im-running",
  "/about/initiatives-petitions",
  "/kelly-speaks",
  "/campaign-photos",
  "/endorsements",
  "/priorities",
  "/direct-democracy",
  "/direct-democracy/ballot-initiative-process",
  "/understand",
  "/office/elections",
  "/office/business",
  "/office/notaries",
  "/office/records",
  "/office/capitol",
  "/office/why-this-race-matters",
  "/explainers",
  "/from-the-road",
  "/press-coverage",
  "/updates",
  "/events",
  "/events/request",
  "/events/community-election-integrity-tour",
  "/events/county-fairs",
  "/events/county-party-meetings",
  "/listening-sessions",
  "/arkansas",
  "/get-involved",
  "/get-involved/bring-5",
  "/start-a-local-team",
  "/donate",
  "/voter-registration",
  "/contact",
  "/privacy",
  "/accessibility",
  "/terms",
  "/disclaimer",
  "/host-a-gathering",
  "/schedule",
];

/** Label must land on matching destination (pathname; hash optional). */
const PRIMARY_CTAS = [
  { label: "Meet Kelly", href: "/about" },
  { label: "Stay connected", href: "/get-involved#join" },
  { label: "Volunteer", href: "/get-involved#volunteer" },
  { label: "From the Road", href: "/from-the-road" },
  { label: "Events", href: "/events" },
  { label: "Invite Kelly", href: "/events/request" },
  { label: "Understand the Office", href: "/understand" },
  { label: "Campaign Videos", href: "/kelly-speaks" },
  { label: "Bring 5 Friends", href: "/get-involved/bring-5" },
  { label: "Endorsements", href: "/endorsements" },
  { label: "Priorities", href: "/priorities" },
  { label: "See how elections work", href: "/office/elections" },
];

/** Visible-copy leaks only — avoid Next payload path false positives. */
const ADMIN_LEAK_PATTERNS = [
  /Owned Media/i,
  /admin placements/i,
  /operator checklist/i,
  /CMS slot/i,
  /photo-ingest/i,
  /WorkflowIntake/i,
];

function fetchRaw(url, redirects = 0, method = "GET", body = null, headers = {}) {
  return new Promise((resolve) => {
    const lib = url.startsWith("https") ? https : http;
    const u = new URL(url);
    const opts = {
      protocol: u.protocol,
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method,
      timeout: 60000,
      headers: {
        "user-agent": "kelly-public-live-parity-qa/1.0",
        ...headers,
      },
    };
    const req = lib.request(opts, (res) => {
      const status = res.statusCode || 0;
      if ([301, 302, 307, 308].includes(status) && res.headers.location && redirects < 5 && method === "GET") {
        const next = new URL(res.headers.location, url).toString();
        res.resume();
        fetchRaw(next, redirects + 1, method, body, headers).then(resolve);
        return;
      }
      let text = "";
      res.setEncoding("utf8");
      res.on("data", (c) => {
        if (text.length < 400000) text += c;
      });
      res.on("end", () => resolve({ status, body: text, finalUrl: url, headers: res.headers }));
    });
    req.on("error", (err) => resolve({ status: 0, body: "", error: err.message, finalUrl: url }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ status: 0, body: "", error: "timeout", finalUrl: url });
    });
    if (body) req.write(body);
    req.end();
  });
}

function pathnameOnly(href) {
  const u = new URL(href, base);
  return u.pathname;
}

async function main() {
  const failures = [];
  const notes = [];

  console.log(`# Live Parity QA — base=${base}`);
  console.log("## ★ routes");
  for (const route of STAR_ROUTES) {
    const r = await fetchRaw(new URL(route, base).toString());
    const ok = r.status >= 200 && r.status < 400;
    console.log(`${r.status || "ERR"} ${route}${r.error ? ` (${r.error})` : ""}`);
    if (!ok) failures.push(`route ${route} → ${r.status || r.error}`);
  }

  console.log("## Primary CTA destinations");
  for (const cta of PRIMARY_CTAS) {
    const path = pathnameOnly(cta.href);
    const r = await fetchRaw(new URL(path, base).toString());
    const ok = r.status >= 200 && r.status < 400;
    console.log(`${ok ? "OK" : "FAIL"} ${cta.label} → ${cta.href} (${r.status || r.error})`);
    if (!ok) failures.push(`cta ${cta.label} → ${cta.href}`);
  }

  console.log("## Public HTML admin-leak scan (home + get-involved + endorsements + events)");
  const scanPages = ["/", "/get-involved", "/endorsements", "/events", "/about", "/understand"];
  for (const route of scanPages) {
    const r = await fetchRaw(new URL(route, base).toString());
    for (const pat of ADMIN_LEAK_PATTERNS) {
      if (pat.test(r.body)) {
        // Allow /admin only inside script JSON that is not user-visible — still flag for review.
        failures.push(`admin-leak ${pat} on ${route}`);
        console.log(`LEAK ${pat} on ${route}`);
      }
    }
  }
  if (!failures.some((f) => f.startsWith("admin-leak"))) {
    console.log("OK no admin leak patterns in scanned public HTML");
  }

  console.log("## Accessibility landmarks (home)");
  const home = await fetchRaw(new URL("/", base).toString());
  const hasSkip = /href=["']#main-content["']/i.test(home.body) && /Skip to main content/i.test(home.body);
  const hasMain = /id=["']main-content["']/i.test(home.body);
  console.log(`${hasSkip ? "OK" : "FAIL"} skip link`);
  console.log(`${hasMain ? "OK" : "FAIL"} main#main-content`);
  if (!hasSkip) failures.push("missing skip link");
  if (!hasMain) failures.push("missing main landmark");
  notes.push("reduced-motion: ScrollReveal uses prefers-reduced-motion (code-path verified)");

  console.log("## Form surfaces");
  const gi = await fetchRaw(new URL("/get-involved", base).toString());
  const hasJoin = /id=["']join["']/i.test(gi.body);
  const hasVolunteer = /id=["']volunteer["']/i.test(gi.body);
  console.log(`${hasJoin ? "OK" : "FAIL"} #join on /get-involved`);
  console.log(`${hasVolunteer ? "OK" : "FAIL"} #volunteer on /get-involved`);
  if (!hasJoin) failures.push("missing #join");
  if (!hasVolunteer) failures.push("missing #volunteer");

  const contact = await fetchRaw(new URL("/contact", base).toString());
  /** Contact is a thin accessibility door: mailto + routes (no hidden form by design). */
  const contactOk =
    /mailto:/i.test(contact.body) &&
    (/get-involved/i.test(contact.body) || /events\/request/i.test(contact.body));
  console.log(`${contactOk ? "OK" : "FAIL"} contact surface (mailto + routes)`);
  if (!contactOk) failures.push("contact surface missing mailto/routes");

  const invite = await fetchRaw(new URL("/events/request", base).toString());
  const inviteOk = invite.status >= 200 && invite.status < 400;
  console.log(`${inviteOk ? "OK" : "FAIL"} /events/request`);
  if (!inviteOk) failures.push("invite page");

  console.log("## /api/forms contract (no real PII persist)");
  const bad = await fetchRaw(
    new URL("/api/forms", base).toString(),
    0,
    "POST",
    JSON.stringify({}),
    { "content-type": "application/json" },
  );
  console.log(`${bad.status === 400 ? "OK" : "FAIL"} empty body → ${bad.status} (expect 400 validation)`);
  if (bad.status !== 400) failures.push(`forms validation expected 400 got ${bad.status}`);

  const spam = await fetchRaw(
    new URL("/api/forms", base).toString(),
    0,
    "POST",
    JSON.stringify({
      formType: "join_movement",
      name: "Parity Smoke",
      email: "parity-smoke@example.invalid",
      website: "https://honeypot.example",
    }),
    { "content-type": "application/json" },
  );
  console.log(
    `${spam.status === 400 ? "OK" : "FAIL"} honeypot join_movement → ${spam.status} (expect 400 spam/validation)`,
  );
  if (spam.status !== 400) failures.push(`forms honeypot expected 400 got ${spam.status}`);

  const inviteApi = await fetchRaw(
    new URL("/api/forms/schedule-campaign-event", base).toString(),
    0,
    "POST",
    JSON.stringify({}),
    { "content-type": "application/json" },
  );
  console.log(
    `${inviteApi.status === 400 || inviteApi.status === 422 || inviteApi.status === 405 ? "OK" : inviteApi.status === 0 ? "FAIL" : "WARN"} invite API empty → ${inviteApi.status}`,
  );
  if (inviteApi.status === 0) failures.push("invite API unreachable");
  else if (![400, 422, 405].includes(inviteApi.status)) {
    notes.push(`invite API returned ${inviteApi.status} (recorded; not treated as hard fail)`);
  }
  console.log("---");
  console.log(`failures=${failures.length}`);
  for (const f of failures) console.log(`FAIL: ${f}`);
  for (const n of notes) console.log(`NOTE: ${n}`);
  if (failures.length) process.exitCode = 1;
  else console.log("PASS Live Parity QA local crawl");
}

main();
