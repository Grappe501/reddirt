/**
 * Emits `dist-county-briefings/pope/` JSON + static HTML (aggregate-only, public-safe).
 * Run: npx tsx scripts/emit-pope-county-intel-site.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildPopeIntelBriefingBundle, KELLY_HOME, KELLY_VOLUNTEER } from "../src/lib/campaign-engine/pope-briefing-bundle";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const OUT = join(__dirname, "../../dist-county-briefings/pope");

// Shared nav for subpages (pages/*.html) — home uses homeNav() below
const NAV = (active: string) => `
        <nav class="nav-bar" aria-label="Primary">
          <a href="../index.html" data-nav="home" class="${active === "home" ? "is-active" : ""}">Home</a>
          <a href="how-we-win.html" data-nav="hww" class="${active === "hww" ? "is-active" : ""}">How we win</a>
          <a href="registration-50k.html" data-nav="r50" class="${active === "r50" ? "is-active" : ""}">50K registration</a>
          <a href="turnout-dropoff.html" data-nav="td" class="${active === "td" ? "is-active" : ""}">Turnout drop-off</a>
          <a href="county-demographics.html" data-nav="cd" class="${active === "cd" ? "is-active" : ""}">Demographics</a>
          <a href="plurality-libertarian.html" data-nav="pl" class="${active === "pl" ? "is-active" : ""}">Plurality</a>
          <a href="hammer-record.html" data-nav="ha" class="${active === "ha" ? "is-active" : ""}">Hammer record</a>
          <a href="campaign-plan.html" data-nav="cp" class="${active === "cp" ? "is-active" : ""}">Campaign plan</a>
          <a href="get-involved.html" data-nav="gi" class="${active === "gi" ? "is-active" : ""}">Get involved</a>
          <a href="sources.html" data-nav="so" class="${active === "so" ? "is-active" : ""}">Sources</a>
        </nav>`;

const FOOT = `</main>
    <footer class="site-footer no-print">
      <p>Planning briefing. Aggregate data only. <a href="${KELLY_HOME}">kellygrappe.com</a> · <a href="${KELLY_VOLUNTEER}">Volunteer</a></p>
      <p id="generated-at" class="small"></p>
    </footer>
    <script src="../assets/app.js"></script>
  </body>
</html>`;

function homeNav() {
  return `
        <nav class="nav-bar" aria-label="Primary">
          <a href="index.html" data-nav="home" class="is-active">Home</a>
          <a href="pages/how-we-win.html" data-nav="hww">How we win</a>
          <a href="pages/registration-50k.html" data-nav="r50">50K registration</a>
          <a href="pages/turnout-dropoff.html" data-nav="td">Turnout drop-off</a>
          <a href="pages/county-demographics.html" data-nav="cd">Demographics</a>
          <a href="pages/plurality-libertarian.html" data-nav="pl">Plurality</a>
          <a href="pages/hammer-record.html" data-nav="ha">Hammer record</a>
          <a href="pages/campaign-plan.html" data-nav="cp">Campaign plan</a>
          <a href="pages/get-involved.html" data-nav="gi">Get involved</a>
          <a href="pages/sources.html" data-nav="so">Sources</a>
        </nav>
        <a class="btn btn-cta" href="${KELLY_VOLUNTEER}">Volunteer on kellygrappe.com</a>`;
}

async function main() {
  const b = await buildPopeIntelBriefingBundle();
  const jsonOut = {
    ...b.profile,
    intelPacket: b.packet,
    aggregateDropoff: b.aggregateDropoff,
    registrationKpis: b.registrationKpis,
    howWeWin: b.howWeWin,
    hammer: b.hammer,
    fileSupplement: b.fileSupplement,
    siteSearch: b.siteSearch,
    links: b.links,
    generatedAt: b.generatedAt,
  };

  mkdirSync(join(OUT, "data"), { recursive: true });
  mkdirSync(join(OUT, "pages"), { recursive: true });
  mkdirSync(join(OUT, "assets"), { recursive: true });
  const jsonPath = join(OUT, "data/pope-county-profile.json");
  writeFileSync(jsonPath, JSON.stringify(jsonOut, null, 2), "utf8");

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pope County — Kelly Grappe for Secretary of State</title>
    <link rel="stylesheet" href="assets/styles.css" />
  </head>
  <body data-page="home">
    <header class="site-header">
      <div class="site-header__inner">
        <p class="motto" id="top">Pope County political profile</p>
        <h1 class="site-title">Kelly Grappe for Secretary of State</h1>
        <p class="site-sub">People over politics</p>
        <p class="site-sub" style="font-size:0.95rem;opacity:0.9">This campaign has a plan. Public site: <a href="${KELLY_HOME}">www.kellygrappe.com</a></p>
        <p class="disclaimer" role="note">
          Planning briefing. Some figures require verification. <strong>Aggregate</strong> county analysis only — no individual targeting on this static drop.
        </p>
        <p class="disclaimer">We are in the middle of a full website overhaul. The current site remains the public front door; the team engine we are building behind it will help county teams coordinate research, volunteer work, voter registration, training, talking points, and GOTV.</p>
        <div class="toolbar no-print">
          <label for="site-search">Search</label>
          <input type="search" id="site-search" placeholder="2+ characters" />
          <button type="button" class="btn" id="print-page">Print</button>
        </div>
        <div class="search-results" id="site-search-results"></div>
        ${homeNav()}
      </div>
    </header>
    <main class="page-wrap">
      <section class="hero">
        <h1>Pope County</h1>
        <p class="lede">Use the navigation for aggregate turnout, registration goals, demographics status, opposition research (title-level), and how we win — without any individual voter lists.</p>
        <p class="lede">Every <strong>Get involved / Volunteer</strong> control points to <a href="${KELLY_VOLUNTEER}">kellygrappe.com’s volunteer page</a> — this static drop does not host intake.</p>
      </section>
      <div class="card-grid">
        <article class="card"><h2>Win # (anchor, DB)</h2><p>Majority model uses the latest general turnout row. Check JSON for current numbers after ingest.</p></article>
        <article class="card"><h2>50K statewide</h2><p>See Registration 50K for nonpartisan civic participation framing and county share math when file totals exist.</p></article>
        <article class="card"><h2>How we win</h2><p>Turnout, registration, coalitions, volunteers — <a href="pages/how-we-win.html">How we win</a>.</p></article>
      </div>
    </main>
    <footer class="site-footer no-print">
      <p><a href="${KELLY_HOME}">kellygrappe.com</a> · <a href="${KELLY_VOLUNTEER}">Volunteer</a></p>
      <p id="generated-at" class="small"></p>
    </footer>
    <script src="assets/app.js"></script>
  </body>
</html>`;
  writeFileSync(join(OUT, "index.html"), indexHtml, "utf8");

  const pages: { name: string; page: string; body: string; t: string; sub: string }[] = [
    {
      name: "how-we-win.html",
      page: "hww",
      t: "How we win — Pope",
      sub: "Strategy (aggregate only)",
      body: `<section><h2>Turnout opportunity</h2><p>${b.howWeWin.turnoutOpportunity}</p>
      <h2>Registration opportunity</h2><p>${b.howWeWin.registrationOpportunity}</p>
      <h2>Coalition opportunity</h2><p>${b.howWeWin.coalitionOpportunity}</p>
      <h2>Volunteer opportunity</h2><p>${b.howWeWin.volunteerOpportunity}</p>
      <h2>Message frame</h2><p>${b.howWeWin.messageFrame}</p>
      <h2>This week (county + individuals)</h2><ul>${b.howWeWin.next7Days.map((x) => `<li>${x}</li>`).join("")}</ul>
      <p class="disclaimer"><strong>Guardrail:</strong> ${b.howWeWin.noIndividualTargeting}</p>
      <a class="btn btn-cta" href="${KELLY_VOLUNTEER}">Volunteer</a></section>`,
    },
    {
      name: "registration-50k.html",
      page: "r50",
      t: "50,000 new registrations (statewide goal)",
      sub: "Civic participation",
      body: `<section>
      <p>Statewide goal: <strong>50,000</strong> — progress in DB when <code>CountyCampaignStats</code> is filled: observed ${b.registrationKpis.statewide50k.observedNetNew ?? "—"} (planning sum).</p>
      <p>County share (Pope) when data exists: implied contribution ≈ <strong>${b.registrationKpis.countyShare.impliedCountyContribution ?? "—"}</strong> (proportional model — ${b.registrationKpis.countyShare.missingDataNotes[0] ?? "verify"}).</p>
      <h2>Nonpartisan framing</h2><p>Registration assistance where lawful is about democracy access — not party preference. The full 50K plan text lives in the RedDirt repo as <code>docs/registration-50k-plan.md</code> (for staff).</p>
      <a class="btn btn-cta" href="${KELLY_VOLUNTEER}">Volunteer to help register voters</a>
      </section>`,
    },
    {
      name: "turnout-dropoff.html",
      page: "td",
      t: "Turnout & drop-off (aggregate)",
      sub: "Pope County",
      body: `<section>
      <p><strong>Pres. vs mid general:</strong> ${b.aggregateDropoff.presVsMidGeneral.narrative} Gap (pts): ${b.aggregateDropoff.presVsMidGeneral.gapPoints ?? "—"}</p>
      <p><strong>General vs primary:</strong> ${b.aggregateDropoff.generalVsPrimary.narrative}</p>
      <p><strong>Primary vs runoff:</strong> ${b.aggregateDropoff.primaryVsRunoff.narrative}</p>
      <h2>Engagement gap (precinct clusters)</h2><ul>${b.aggregateDropoff.engagementGapZones.map((z) => `<li><strong>${z.label}</strong> — ${z.note}</li>`).join("")}</ul>
      </section>`,
    },
    {
      name: "county-demographics.html",
      page: "cd",
      t: "County demographics (ACS / Census / BLS)",
      sub: "Pope",
      body: `<section>
      <p>Population: <strong>${b.profile.censusAcsBls.censusPopulation ?? "—"}</strong> · Median income: <strong>${b.profile.censusAcsBls.acsMedianIncome ?? "—"}</strong> · Poverty%: <strong>${b.profile.censusAcsBls.acsPovertyRate ?? "—"}</strong></p>
      <p>Unemployment% (BLS/ACS if loaded): <strong>${b.profile.censusAcsBls.blsUnemployment ?? "—"}</strong></p>
      <p class="disclaimer">Missing data warnings: ${(b.profile.censusAcsBls.missingDataWarnings || []).join(" ") || "None beyond normal gaps."}</p>
      <a class="btn btn-cta" href="${KELLY_VOLUNTEER}">Get involved</a>
      </section>`,
    },
    {
      name: "plurality-libertarian.html",
      page: "pl",
      t: "Plurality & a three-way race",
      sub: "No change to the mission",
      body: `<section><p>${b.profile.pluralityModel.threeWayNarrative}</p>
      <p>We still run to build a <strong>majority-capable</strong> coalition; plurality math is a planning overlay when multiple candidates are on the ballot. Verify 2026 rules for the specific office.</p>
      <a class="btn btn-cta" href="${KELLY_VOLUNTEER}">Join the team</a></section>`,
    },
    {
      name: "hammer-record.html",
      page: "ha",
      t: "Hammer — title / metadata (verify Arkleg)",
      sub: "Opposition research",
      body: (() => {
        let h = `<section><p class="disclaimer"><strong>${b.hammer.researchNote}</strong></p>`;
        for (const [k, v] of Object.entries(b.hammer.categories)) {
          h += `<h2>${k}</h2><ul>`;
          for (const row of v.slice(0, 12)) {
            h += `<li><strong>${row.billNumber}</strong> (${row.session}): ${row.title.slice(0, 200)}</li>`;
          }
          h += `</ul>`;
        }
        h += `</section>`;
        return h;
      })(),
    },
    {
      name: "get-involved.html",
      page: "gi",
      t: "Get involved",
      sub: "All roads lead to kellygrappe.com",
      body: `<section><ul>
        <li>Visit <a href="${KELLY_HOME}">kellygrappe.com</a></li>
        <li>Volunteer, coalition, host conversations — <a href="${KELLY_VOLUNTEER}">volunteer form</a></li>
        <li>Help register voters, verify public data, train leaders, bring five people in</li>
      </ul>
      <a class="btn btn-cta" href="${KELLY_VOLUNTEER}">Open volunteer form</a>
      </section>`,
    },
    {
      name: "campaign-plan.html",
      page: "cp",
      t: "Campaign plan — manual now, engine next",
      sub: "Systems-minded",
      body: `<section>
      <h2>Now</h2><ul>
        <li>County leaders coordinate lists; volunteers report contacts in approved tools</li>
        <li>Manual research review; local meetings; candidate briefings</li>
        <li>Hand-built <strong>aggregate</strong> targeting only for public materials</li>
      </ul>
      <h2>Team engine (launch)</h2><ul>
        <li>County dashboards, registration KPIs, training paths, contact-plan review, volunteer queues, research library, talking point updates, approval-based messaging</li>
      </ul>
      <a class="btn btn-cta" href="${KELLY_VOLUNTEER}">Sign up to volunteer</a>
      </section>`,
    },
    {
      name: "sources.html",
      page: "so",
      t: "Sources & limitations",
      sub: "Verification",
      body: `<section><ul>
        <li>Election result tables (RedDirt / DATA-4)</li>
        <li>arkleg-hammer-ingest-summary (dry run) for bill titles</li>
        <li>Census/ACS when imported via <code>ingest:county-demographics</code></li>
      </ul>
      <p class="disclaimer">No private voter or contact exports in this zip.</p>
      <a class="btn btn-cta" href="${KELLY_VOLUNTEER}">Volunteer</a>
      </section>`,
    },
  ];

  for (const p of pages) {
    const start = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${p.t}</title>
    <link rel="stylesheet" href="../assets/styles.css" />
  </head>
  <body data-page="${p.page}">
    <header class="site-header">
      <div class="site-header__inner">
        <p class="motto">Kelly Grappe for Secretary of State</p>
        <h1 class="site-title">${p.t}</h1>
        <p class="site-sub">People over politics</p>
        <p class="disclaimer">Website overhaul: <a href="${KELLY_HOME}">kellygrappe.com</a> is the public front door.</p>
        <div class="toolbar no-print">
          <label for="site-search">Search</label>
          <input type="search" id="site-search" placeholder="2+ characters" />
          <button type="button" class="btn" id="print-page">Print</button>
        </div>
        <div class="search-results" id="site-search-results"></div>
        ${NAV(p.page)}
        <a class="btn btn-cta" href="${KELLY_VOLUNTEER}">Volunteer on kellygrappe.com</a>
      </div>
    </header>
    <main class="page-wrap">`;
    writeFileSync(join(OUT, "pages", p.name), `${start}
${p.body}
${FOOT}`, "utf8");
  }

  // copy or write app.js (updated path for data)
  const appJs = `(() => {
  const pathPrefix = (function () {
    const p = window.location.pathname || "";
    if (p.indexOf("/pages/") >= 0) return "../";
    return "./";
  })();
  const DATA_URL = pathPrefix + "data/pope-county-profile.json";
  function getPageId() { return document.body.getAttribute("data-page") || "home"; }
  function setActiveNav() {
    const id = getPageId();
    document.querySelectorAll(".nav-bar a").forEach(function (a) {
      if (a.getAttribute("data-nav") === id) { a.classList.add("is-active"); a.setAttribute("aria-current", "page"); }
    });
  }
  var cache = null;
  function loadData() { if (cache) return Promise.resolve(cache);
    return fetch(DATA_URL).then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json(); }).then(d => { cache = d; return d; });
  }
  function initSearch() {
    const input = document.getElementById("site-search");
    const box = document.getElementById("site-search-results");
    if (!input || !box) return;
    function render(needle, d) {
      box.innerHTML = "";
      if (!needle || needle.length < 2) { box.classList.remove("is-open"); return; }
      var n = needle.toLowerCase();
      var out = [];
      (d.siteSearch && d.siteSearch.entries || []).forEach(e => { if (((e.title||"")+(e.keywords||"")+(e.href||"")).toLowerCase().indexOf(n) >= 0) out.push(e); });
      (d.oppositionHighlights || []).forEach(b => { if ((b.billNumber+" "+b.title).toLowerCase().indexOf(n) >= 0) out.push({ href: "pages/hammer-record.html", title: b.billNumber + " — " + (b.title||"").slice(0,80) }); });
      if (out.length === 0) { box.textContent = "No results."; box.classList.add("is-open"); return; }
      out.slice(0, 20).forEach(e => { var a = document.createElement("a");
        var h = e.href || "#";
        if (pathPrefix === "../" && h.indexOf("pages/") === 0) h = h.replace(/^pages\//, "");
        else h = pathPrefix + h;
        a.href = h; a.textContent = e.title; box.appendChild(a);
      });
      box.classList.add("is-open");
    }
    input.addEventListener("input", function () { loadData().then(d => render(input.value.trim(), d)); });
  }
  function initAt() { var el = document.getElementById("generated-at"); if (!el) return; loadData().then(d => { el.textContent = "Data: " + new Date(d.generatedAt).toLocaleString(); }); }
  function initPrint() { var b = document.getElementById("print-page"); if (b) b.addEventListener("click", function () { window.print(); }); }
  function run() { setActiveNav(); initSearch(); initAt(); initPrint(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();`;
  writeFileSync(join(OUT, "assets/app.js"), appJs, "utf8");

  const dep = new Date().toISOString();
  writeFileSync(
    join(OUT, "README_DEPLOY.txt"),
    `Pope County intelligence briefing (COUNTY-INTEL-2)
Drag folder contents to Netlify (or any static host).
Generated: ${dep}
- Public-safe: aggregate county analysis only, no PII, no person-level targeting
- Excludes: .env, node_modules, private exports
- CTAs: volunteer links point to ${KELLY_VOLUNTEER}
Data: data/pope-county-profile.json
`,
    "utf8"
  );

  console.log("Wrote", jsonPath, "and static site under", OUT);
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
