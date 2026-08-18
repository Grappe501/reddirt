/**
 * Public-site hardening gate.
 *
 * Run BEFORE further public website copy or calendar changes:
 *   npm run check:public-site
 *
 * This is a recommendation gate, not a content editor. It fails on P0
 * leaks (public pages pointing at dead operator surfaces) and prints
 * every candidate-lock gap so the next pass has a board, not a scavenger hunt.
 *
 * Live crawl is optional: set AUDIT_LIVE=1 to hit kgrappe.netlify.app.
 */
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

/** @typedef {{ sev: "P0" | "P1" | "P2"; id: string; rec: string; where: string }} Finding */

/** @type {Finding[]} */
const findings = [];

function add(sev, id, rec, where) {
  findings.push({ sev, id, rec, where });
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx|js|jsx|md)$/.test(name)) acc.push(full);
  }
  return acc;
}

function rel(file) {
  return path.relative(repoRoot, file).replace(/\\/g, "/");
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

const PUBLIC_ROOTS = [
  "src/config/navigation.ts",
  "src/config/direct-democracy-links.ts",
  "src/config/external-campaign.ts",
  "src/components/home",
  "src/components/layout",
  "src/components/organizing",
  "src/components/forms",
  "src/components/voter",
  "src/components/about",
  "src/content/home",
  "src/content/about",
  "src/content/website",
  "src/content/events",
  "src/lib/volunteer-resources.ts",
  "src/lib/forms/schemas.ts",
  "src/app/(site)",
].map((p) => path.join(repoRoot, p));

const SKIP_DIR_PARTS = [
  `${path.sep}dashboard${path.sep}`,
  `${path.sep}field-playbook${path.sep}`,
  `${path.sep}edit${path.sep}`,
];

function isSkippedPublicOs(file) {
  const n = file.toLowerCase();
  return SKIP_DIR_PARTS.some((part) => n.includes(part.toLowerCase()));
}

const publicFiles = [];
for (const root of PUBLIC_ROOTS) {
  const st = fs.existsSync(root) ? fs.statSync(root) : null;
  if (!st) continue;
  if (st.isFile()) publicFiles.push(root);
  else publicFiles.push(...walk(root));
}

const marketingFiles = publicFiles.filter((f) => !isSkippedPublicOs(f));

const LEAK_PATTERNS = [
  { re: /\/county-briefings\b/, id: "leak-county-briefings", rec: "Remove or redirect public County briefings CTAs. Live /county-briefings is 404." },
  { re: /\/dashboard\/team\b/, id: "leak-dashboard-team", rec: "Do not send public volunteers to /dashboard/team. Demo slugs 500 and are Oklahoma-named." },
  { re: /creek-county-liberty|sapulpa-beacon|drumright-torch|bristow-eagle|VOLUNTEER_OS_DEMO_TEAM_SLUG/, id: "leak-oklahoma-demo", rec: "Oklahoma volunteer-OS demo team slugs must not appear on the Arkansas public site." },
  { re: /\/organizing-intelligence\b/, id: "leak-oi", rec: "Organizing intelligence is not a public destination; keep it off marketing CTAs." },
  { re: /\/volunteer-kickoff\b/, id: "leak-volunteer-kickoff", rec: "Volunteer kickoff deck is internal. Send public CTAs to /get-involved#volunteer." },
  { re: /arkansasyouth\.netlify\.app/, id: "leak-ayc-external", rec: "Do not send public visitors to the Arkansas Youth Coalition microsite. Use /get-involved#volunteer or /voter-registration." },
  { re: /\/dashboard\/community\b/, id: "leak-dashboard-community", rec: "Community dashboards are operator tools — not public volunteer destinations." },
  { re: /href=["'`]\/field-playbook\/[^"'`]+/, id: "leak-playbook-child", rec: "Field playbook child URLs 404 from public volunteer pages. Link only to pages that exist, or to /volunteer/resources." },
];

for (const file of marketingFiles) {
  const text = read(file);
  const where = rel(file);
  for (const row of LEAK_PATTERNS) {
    if (row.re.test(text)) {
      add("P0", row.id, row.rec, where);
    }
  }
  if (/why this gathering exists/i.test(text)) {
    add("P0", "operator-why-gathering", "Operator instruction still on a public surface. Remove it.", where);
  }
  if (/stand up arkansas/i.test(text) && !/redirect\("\/about"\)/.test(text)) {
    add("P0", "standup-public", "Stand Up Arkansas must stay off public marketing copy (Kelly lock).", where);
  }
}

const priorities = read(path.join(repoRoot, "src/content/website/priorities-launch.ts"));
if (!/arkansas law allows for paper ballots/i.test(priorities)) {
  add(
    "P1",
    "paper-ballot-law",
    "Add Kelly's locked sentence: Arkansas law allows for paper ballots. Current Restore Trust copy talks around paper vs machines without saying the law.",
    "src/content/website/priorities-launch.ts"
  );
}

const schemas = read(path.join(repoRoot, "src/lib/forms/schemas.ts"));
if (!/\bpop_up\b|\bpeople_over_politics_popup\b|\bpopup\b/.test(schemas)) {
  add(
    "P1",
    "pop-up-option",
    "Host-a-gathering is missing People Over Politics Pop-Ups. Postcard party exists; POP-Ups do not.",
    "src/lib/forms/schemas.ts"
  );
}

const aboutContent = walk(path.join(repoRoot, "src/content/about"))
  .concat(walk(path.join(repoRoot, "src/content/home")))
  .map(read)
  .join("\n");
if (!/my heart is so full|youth retreat/i.test(aboutContent)) {
  add(
    "P1",
    "youth-retreat-reflections",
    "Kelly's first youth-retreat reflections (and the Friday video) are not on a public page.",
    "src/content/about + From the Road / Campaign Videos"
  );
}

const whyPage = read(path.join(repoRoot, "src/content/about/why-kelly-page.ts"));
if (!/The Arkansas Constitution begins with a promise I believe we have lost sight of/.test(whyPage)) {
  add(
    "P1",
    "why-running-copy",
    "Dedicated /about/why-im-running is still third-person. Kelly's constitution opening lives on Meet Kelly, not on the Why I'm Running page she pointed at.",
    "src/content/about/why-kelly-page.ts"
  );
}

const homePage = read(path.join(repoRoot, "src/app/(site)/page.tsx"));
const homeWire = read(path.join(repoRoot, "src/components/home/HomeTrustFunnelWireframe.tsx"));
if (!/CAMPAIGN_STOP_MILESTONE|campaignStopMilestone/.test(homePage + homeWire)) {
  add(
    "P1",
    "226-not-on-home",
    "226 scheduled stops as of Aug 17 is live on /events but not on the homepage trust funnel. First-time visitors never see the count.",
    "src/components/home/HomeTrustFunnelWireframe.tsx"
  );
}

const eventsPage = read(path.join(repoRoot, "src/app/(site)/events/page.tsx"));
if (!/campaignStopMilestone/.test(eventsPage)) {
  add("P0", "226-missing-events", "Events page must show the locked scheduled-stop count.", "src/app/(site)/events/page.tsx");
}

const vr = read(path.join(repoRoot, "src/components/voter/VoterRegistrationCenter.tsx"));
if (!/voterview\.ar-nova\.org\/VoterView/i.test(vr) && !/officialUrl/.test(vr)) {
  add("P0", "voterview-missing", "Voter registration must link to Arkansas VoterView.", "src/components/voter/VoterRegistrationCenter.tsx");
}

const getInvolved = read(path.join(repoRoot, "src/app/(site)/get-involved/page.tsx"));
if (/\/county-briefings/.test(getInvolved)) {
  add(
    "P0",
    "get-involved-county-briefings",
    "Get Involved has a County briefings button to a 404. Point it at /events or /start-a-local-team instead.",
    "src/app/(site)/get-involved/page.tsx"
  );
}

const localTeam = read(path.join(repoRoot, "src/app/(site)/start-a-local-team/page.tsx"));
if (/\/events\/county-fairs/.test(localTeam)) {
  add(
    "P1",
    "local-team-county-fairs",
    "Start a local team links to /events/county-fairs. Confirm that route exists or point at /events.",
    "src/app/(site)/start-a-local-team/page.tsx"
  );
}

const explainers = read(path.join(repoRoot, "src/app/(site)/explainers/page.tsx"));
if (/Explainers on the way/.test(explainers)) {
  add(
    "P1",
    "explainers-empty-nav",
    "The Office nav includes Explainers, which is an empty 'on the way' page. Unlink it from primary nav until there is a real explainer, or send the item to /understand.",
    "src/config/navigation.ts + src/app/(site)/explainers/page.tsx"
  );
}

const contact = read(path.join(repoRoot, "src/app/(site)/contact/page.tsx"));
if (/Email the campaign/.test(contact) && /getJoinCampaignHref/.test(contact)) {
  add(
    "P2",
    "contact-email-mismatch",
    "Contact primary button says Email the campaign but goes to Stay connected. Use mailto:kelly@kellygrappe.com for that label.",
    "src/app/(site)/contact/page.tsx"
  );
}

const statewide = path.join(repoRoot, "src/components/home/sections/HomeStatewideSection.tsx");
if (fs.existsSync(statewide) && /on the way/.test(read(statewide))) {
  add(
    "P2",
    "statewide-map-on-the-way",
    "Unused homepage statewide section still says the presence map is on the way. Do not remount it until that copy is gone.",
    "src/components/home/sections/HomeStatewideSection.tsx"
  );
}

const nav = read(path.join(repoRoot, "src/config/navigation.ts"));
const NAV_HREFS = [...nav.matchAll(/href:\s*"([^"]+)"/g)].map((m) => m[1]);
const MUST_RESOLVE = NAV_HREFS.filter((h) => h.startsWith("/") && !h.startsWith("/api") && !h.includes("://"));
for (const href of MUST_RESOLVE) {
  const clean = href.split("#")[0].split("?")[0];
  if (!clean || clean === "/") continue;
  const candidates = [
    path.join(repoRoot, "src/app/(site)", clean, "page.tsx"),
    path.join(repoRoot, "src/app/(site)", `${clean}/page.tsx`),
  ];
  const exists = candidates.some((c) => fs.existsSync(c));
  if (!exists && !["/office/elections", "/office/business", "/office/notaries", "/office/records", "/office/capitol", "/office/why-this-race-matters"].includes(clean)) {
    // office/* is a dynamic [slug] route
    const officeSlug = clean.match(/^\/office\/([^/]+)$/);
    const volunteerRes = clean.startsWith("/volunteer/resources/");
    const okDynamic =
      (officeSlug && fs.existsSync(path.join(repoRoot, "src/app/(site)/office/[slug]/page.tsx"))) ||
      (volunteerRes && fs.existsSync(path.join(repoRoot, "src/app/(site)", clean, "page.tsx")));
    if (!okDynamic && !exists) {
      add("P1", `nav-href-${clean}`, `Primary/footer nav points at ${clean} with no matching page.tsx.`, "src/config/navigation.ts");
    }
  }
}

const p0 = findings.filter((f) => f.sev === "P0");
const p1 = findings.filter((f) => f.sev === "P1");
const p2 = findings.filter((f) => f.sev === "P2");

const unique = [];
const seen = new Set();
for (const f of findings) {
  const key = `${f.sev}|${f.id}|${f.rec}`;
  if (seen.has(key)) continue;
  seen.add(key);
  unique.push(f);
}

console.log("Public site hardening — recommendation gate");
console.log("Run this before further public website changes.");
console.log(`P0 ${unique.filter((f) => f.sev === "P0").length}  P1 ${unique.filter((f) => f.sev === "P1").length}  P2 ${unique.filter((f) => f.sev === "P2").length}`);
console.log("");
for (const f of unique) {
  console.log(`[${f.sev}] ${f.id}`);
  console.log(`  ${f.rec}`);
  console.log(`  ${f.where}`);
  console.log("");
}

if (unique.some((f) => f.sev === "P0")) {
  console.error("HARD STOP: fix P0 public-link leaks before adding more public copy or events.");
  process.exit(1);
}

console.log("No P0 leaks. P1/P2 are recommendations — do not ignore them on a candidate pass.");
process.exit(0);
