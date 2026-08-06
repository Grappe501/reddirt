(function () {
  const MAIN = "https://kgrappe.netlify.app";

  function formatStopDate(iso) {
    const [y, m, d] = String(iso || "").split("-").map(Number);
    if (!y || !m || !d) return iso;
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "America/Chicago",
    }).format(new Date(Date.UTC(y, m - 1, d, 12)));
  }

  function monthKey(iso) {
    return String(iso).slice(0, 7);
  }

  function monthLabel(ym) {
    const [y, m] = ym.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "America/Chicago",
    }).format(new Date(Date.UTC(y, m - 1, 1, 12)));
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function groupStops(stops, newestFirst) {
    const map = new Map();
    for (const s of stops) {
      const k = monthKey(s.date);
      const arr = map.get(k) || [];
      arr.push(s);
      map.set(k, arr);
    }
    return [...map.entries()].sort((a, b) =>
      newestFirst ? b[0].localeCompare(a[0]) : a[0].localeCompare(b[0]),
    );
  }

  function renderStops(stops, newestFirst, empty) {
    if (!stops.length) {
      return `<p class="empty">${escapeHtml(empty)}</p>`;
    }
    return groupStops(stops, newestFirst)
      .map(([ym, rows]) => {
        const items = rows
          .map((stop) => {
            const pending = !stop.counties || stop.counties.length === 0;
            const chips = pending
              ? `<span class="pending-badge">County assignment pending</span>`
              : `<ul class="chips" aria-label="Counties">${stop.counties
                  .map((c) => `<li><span>${escapeHtml(c)}</span></li>`)
                  .join("")}</ul>`;
            return `<li class="${pending ? "pending" : ""}">
              <div class="stop-row">
                <div>
                  <p class="stop-date">${escapeHtml(formatStopDate(stop.date))}</p>
                  <h4 class="stop-title">${escapeHtml(stop.title)}</h4>
                  ${stop.city ? `<p class="stop-city">${escapeHtml(stop.city)}</p>` : ""}
                </div>
                <div>${chips}</div>
              </div>
            </li>`;
          })
          .join("");
        return `<section class="month-block" aria-labelledby="m-${ym}">
          <h3 id="m-${ym}">${escapeHtml(monthLabel(ym))}<span>(${rows.length})</span></h3>
          <ol class="stop-list">${items}</ol>
        </section>`;
      })
      .join("");
  }

  function mount(data) {
    const root = document.getElementById("app");
    const s = data.summary;
    const site = (data.siteUrl || MAIN).replace(/\/$/, "");

    root.innerHTML = `
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-inner">
          <p class="eyebrow">Kelly Across Arkansas</p>
          <h1 id="hero-title">Showing up in every corner of the state</h1>
          <p class="hero-sub">
            Kelly listens in person, travels county to county, and is building a campaign rooted in the whole of Arkansas.
            ${s.visitedCounties} counties visited so far · ${s.scheduledStopCount} public stops still ahead through Election Day season.
          </p>
          <div class="cta-row">
            <a class="btn btn-primary" href="${site}/events/request">Invite Kelly</a>
            <a class="btn btn-outline" href="${site}/arkansas">County presence</a>
          </div>
        </div>
      </section>

      <section class="band" aria-labelledby="summary-title">
        <div class="wrap">
          <h2 id="summary-title">Statewide progress</h2>
          <p class="lede">Totals update from the campaign stop ledger — not hardcoded claims.</p>
          <ul class="stats">
            <li>
              <p class="label">Counties visited</p>
              <p class="value">${s.visitedCounties} of ${s.totalCounties}</p>
              <p class="hint">${s.percentVisited}% of Arkansas</p>
            </li>
            <li>
              <p class="label">Completed stops</p>
              <p class="value">${s.completedStopCount}</p>
              <p class="hint">Published past visits</p>
            </li>
            <li>
              <p class="label">Upcoming stops</p>
              <p class="value">${s.scheduledStopCount}</p>
              <p class="hint">Through November 3, 2026</p>
            </li>
            <li>
              <p class="label">County assignments pending</p>
              <p class="value">${s.needsReviewCount}</p>
              <p class="hint">Needs a county review</p>
            </li>
          </ul>
        </div>
      </section>

      <section class="band alt" aria-labelledby="counties-title">
        <div class="wrap">
          <h2 id="counties-title">All 75 counties</h2>
          <p class="lede">A county counts as visited once a completed public stop lists it. Scheduled stops show separately until completed.</p>
          <div class="legend">
            <span><i class="swatch visited" aria-hidden="true"></i>Visited (${s.buckets.visited.length})</span>
            <span><i class="swatch scheduled" aria-hidden="true"></i>Scheduled (${s.buckets.scheduled.length})</span>
            <span><i class="swatch undocumented" aria-hidden="true"></i>Not yet documented (${s.buckets.undocumented.length})</span>
          </div>
          <ul class="county-grid" id="county-grid" aria-label="Arkansas counties by visit status"></ul>
        </div>
      </section>

      <section class="band" aria-labelledby="explorer-title">
        <div class="wrap mid">
          <div class="toolbar">
            <div>
              <h2 id="explorer-title">Campaign stops</h2>
              <p class="lede">Filter by completed or upcoming, and optionally by county.</p>
            </div>
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
              <div class="tabs" role="tablist" aria-label="Stop list mode">
                <button type="button" role="tab" data-mode="completed" aria-selected="true">Completed (${data.completed.length})</button>
                <button type="button" role="tab" data-mode="upcoming" aria-selected="false">Upcoming (${data.upcoming.length})</button>
                <button type="button" role="tab" data-mode="all" aria-selected="false">All public (${data.completed.length + data.upcoming.length})</button>
              </div>
              <label>
                <span class="sr-only">Filter by county</span>
                <select id="county-filter">
                  <option value="">All counties</option>
                  ${data.counties.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("")}
                </select>
              </label>
            </div>
          </div>
          <div id="stop-results"></div>
        </div>
      </section>

      <section class="band alt">
        <div class="wrap narrow">
          <div class="invite">
            <h2>Invite Kelly to your community</h2>
            <p class="lede">Follow the trail across Arkansas, invite Kelly to listen in your county, or join the campaign so more communities are part of this work.</p>
            <div class="cta-row">
              <a class="btn btn-navy" href="${site}/events/request">Invite Kelly</a>
              <a class="btn btn-ghost" href="${site}/get-involved">Join the campaign</a>
              <a class="btn btn-ghost" href="${site}/events">Campaign calendar</a>
            </div>
          </div>
          <p class="related">
            Related:
            <a href="${site}/arkansas">Arkansas presence</a> ·
            <a href="${site}/events">Events</a> ·
            <a href="${site}/about/journey">Journey photos</a>
          </p>
        </div>
      </section>
    `;

    const grid = document.getElementById("county-grid");
    const rows = [
      ...s.buckets.visited.map((name) => ({ name, bucket: "visited" })),
      ...s.buckets.scheduled.map((name) => ({ name, bucket: "scheduled" })),
      ...s.buckets.undocumented.map((name) => ({ name, bucket: "undocumented" })),
    ].sort((a, b) => a.name.localeCompare(b.name));
    grid.innerHTML = rows
      .map((r) => `<li class="${r.bucket}">${escapeHtml(r.name)}</li>`)
      .join("");

    let mode = "completed";
    const results = document.getElementById("stop-results");
    const select = document.getElementById("county-filter");
    const tabs = [...root.querySelectorAll('.tabs button[data-mode]')];

    function refresh() {
      const county = select.value;
      let base =
        mode === "completed"
          ? data.completed
          : mode === "upcoming"
            ? data.upcoming
            : [...data.completed, ...data.upcoming];
      base =
        mode === "upcoming"
          ? [...base].sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))
          : [...base].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
      if (county) base = base.filter((s) => s.counties.includes(county));
      results.innerHTML = renderStops(
        base,
        mode !== "upcoming",
        mode === "upcoming"
          ? "No upcoming public stops match this filter."
          : "No public stops match this filter.",
      );
    }

    tabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        mode = btn.getAttribute("data-mode");
        tabs.forEach((t) => t.setAttribute("aria-selected", String(t === btn)));
        refresh();
      });
    });
    select.addEventListener("change", refresh);
    refresh();
    root.setAttribute("aria-busy", "false");
  }

  fetch("./data/public-visits.json", { cache: "no-cache" })
    .then((r) => {
      if (!r.ok) throw new Error(`Failed to load visit data (${r.status})`);
      return r.json();
    })
    .then(mount)
    .catch((err) => {
      const root = document.getElementById("app");
      root.innerHTML = `<p class="error-banner">${escapeHtml(err.message || String(err))}</p>`;
      root.setAttribute("aria-busy", "false");
    });
})();
