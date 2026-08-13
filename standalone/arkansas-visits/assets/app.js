(function () {
  const K = window.KellyVisits;
  const state = {
    data: null,
    editorAvailable: false,
    mode: "pending",
    countyFilter: "",
  };

  function groupStops(stops, newestFirst) {
    const map = new Map();
    for (const s of stops) {
      const k = K.monthKey(s.date);
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
      return `<p class="empty">${K.escapeHtml(empty)}</p>`;
    }
    return groupStops(stops, newestFirst)
      .map(([ym, rows]) => {
        const items = rows
          .map((stop) => {
            const pending = !stop.counties || stop.counties.length === 0;
            const chips = pending
              ? `<span class="pending-badge">County assignment pending</span>`
              : `<ul class="chips" aria-label="Counties">${stop.counties
                  .map((c) => `<li><span>${K.escapeHtml(c)}</span></li>`)
                  .join("")}</ul>`;
            return `<li class="${pending ? "pending" : ""}">
              <a class="stop-card" href="${K.stopHref(stop.id)}">
                <div class="stop-row">
                  <div>
                    <p class="stop-date">${K.escapeHtml(K.formatStopDate(stop.date))}</p>
                    <h4 class="stop-title">${K.escapeHtml(stop.title)}</h4>
                    ${stop.city ? `<p class="stop-city">${K.escapeHtml(stop.city)}</p>` : ""}
                  </div>
                  <div class="stop-meta">
                    ${chips}
                    <span class="btn-edit-affordance">${
                      state.editorAvailable ? "Edit stop" : "View details"
                    }</span>
                  </div>
                </div>
              </a>
            </li>`;
          })
          .join("");
        return `<section class="month-block" aria-labelledby="m-${ym}">
          <h3 id="m-${ym}">${K.escapeHtml(K.monthLabel(ym))}<span>(${rows.length})</span></h3>
          <ol class="stop-list">${items}</ol>
        </section>`;
      })
      .join("");
  }

  function bindExplorer() {
    const data = state.data;
    const results = document.getElementById("stop-results");
    const select = document.getElementById("county-filter");
    const tabs = [...document.querySelectorAll(".tabs button[data-mode]")];

    function refresh() {
      state.countyFilter = select.value;
      let base;
      if (state.mode === "completed") base = data.completed;
      else if (state.mode === "upcoming") base = data.upcoming;
      else if (state.mode === "pending") base = K.pendingStops(data);
      else base = K.allPublicStops(data);

      base =
        state.mode === "upcoming"
          ? [...base].sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))
          : [...base].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));

      if (state.countyFilter) {
        base = base.filter((s) => (s.counties || []).includes(state.countyFilter));
      }

      const empty =
        state.mode === "upcoming"
          ? "No upcoming public stops match this filter."
          : state.mode === "pending"
            ? "No stops need attention — every public stop has a county."
            : "No public stops match this filter.";

      results.innerHTML = renderStops(base, state.mode !== "upcoming", empty);
    }

    tabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.mode = btn.getAttribute("data-mode");
        tabs.forEach((t) => t.setAttribute("aria-selected", String(t === btn)));
        refresh();
      });
    });
    select.addEventListener("change", refresh);
    refresh();
  }

  function mount(data) {
    state.data = data;
    const root = document.getElementById("app");
    const s = data.summary;
    const math = K.countyMath(s);
    const pendingCount = K.pendingStops(data).length;
    const site = (data.siteUrl || K.MAIN).replace(/\/$/, "");

    // Default to needs attention when there are pending stops
    if (pendingCount === 0 && state.mode === "pending") state.mode = "completed";

    root.innerHTML = `
      <section class="hero brand-hero" aria-labelledby="hero-title">
        <div class="hero-inner">
          <p class="eyebrow">Kelly Across Arkansas · Campaign ledger</p>
          <h1 id="hero-title">Showing up in every corner of the state</h1>
          <p class="hero-sub">
            ${
              state.editorAvailable
                ? "Click any stop to open its detail page — edit counties, add places you also visited, and keep the ledger honest."
                : "Click any stop for details. Totals update from the campaign travel ledger across all 75 counties."
            }
          </p>
          <div class="cta-row">
            <a class="btn btn-primary" href="#explorer-title">Browse stops</a>
            <a class="btn btn-outline" href="${site}/events/request">Invite Kelly</a>
          </div>
        </div>
      </section>

      ${
        state.editorAvailable
          ? `<section class="band workspace-bar" aria-label="Workspace">
        <div class="wrap workspace-inner">
          <span class="workspace-pill">Local editor</span>
          <p class="workspace-copy">Edits save into the campaign ledger on this machine.</p>
          <a class="btn btn-navy btn-small" href="/stop.html?id=new">Add stop</a>
        </div>
      </section>`
          : ""
      }

      <section class="band" aria-labelledby="county-calc-title">
        <div class="wrap">
          <h2 id="county-calc-title">Counties visited vs not visited</h2>
          <p class="lede">Calculated from completed public stops in the ledger — ${math.total} Arkansas counties.</p>
          <ul class="stats calc-stats">
            <li class="stat-visited">
              <p class="label">Visited</p>
              <p class="value">${math.visited}</p>
              <p class="hint">${s.percentVisited}% of Arkansas</p>
            </li>
            <li class="stat-not-visited">
              <p class="label">Not yet visited</p>
              <p class="value">${math.notVisited}</p>
              <p class="hint">${math.total} − ${math.visited} completed</p>
            </li>
            <li class="stat-scheduled">
              <p class="label">Scheduled only</p>
              <p class="value">${math.scheduled}</p>
              <p class="hint">On calendar, not completed yet</p>
            </li>
            <li class="stat-attention">
              <p class="label">Needs attention</p>
              <p class="value">${s.needsReviewCount}</p>
              <p class="hint">Missing county / needs review</p>
            </li>
          </ul>
          ${
            pendingCount > 0
              ? `<div class="needs-attention-banner" role="status">
                   <div>
                     <strong>${pendingCount} stop${pendingCount === 1 ? "" : "s"} need attention</strong>
                     <p>Open a stop to assign counties or split multi-place trips.</p>
                   </div>
                   <button type="button" class="btn btn-navy btn-small" id="jump-needs-attention">Review needs attention</button>
                 </div>`
              : ""
          }
        </div>
      </section>

      <section class="band alt" aria-labelledby="counties-title">
        <div class="wrap">
          <h2 id="counties-title">All 75 counties</h2>
          <p class="lede">Navy = visited · Gold = scheduled only · Light = not yet documented.</p>
          <div class="legend">
            <span><i class="swatch visited" aria-hidden="true"></i>Visited (${math.visited})</span>
            <span><i class="swatch scheduled" aria-hidden="true"></i>Scheduled (${math.scheduled})</span>
            <span><i class="swatch undocumented" aria-hidden="true"></i>Not visited (${math.undocumented})</span>
          </div>
          <ul class="county-grid" id="county-grid" aria-label="Arkansas counties by visit status"></ul>
        </div>
      </section>

      <section class="band" aria-labelledby="explorer-title">
        <div class="wrap mid">
          <div class="toolbar">
            <div>
              <h2 id="explorer-title">Campaign stops</h2>
              <p class="lede">Click a stop for its drill-down page.</p>
            </div>
            <div class="toolbar-controls">
              <div class="tabs" role="tablist" aria-label="Stop list mode">
                <button type="button" role="tab" data-mode="pending" class="tab-attention" aria-selected="${
                  state.mode === "pending"
                }">Needs attention (${pendingCount})</button>
                <button type="button" role="tab" data-mode="completed" aria-selected="${
                  state.mode === "completed"
                }">Completed (${data.completed.length})</button>
                <button type="button" role="tab" data-mode="upcoming" aria-selected="${
                  state.mode === "upcoming"
                }">Upcoming (${data.upcoming.length})</button>
                <button type="button" role="tab" data-mode="all" aria-selected="${
                  state.mode === "all"
                }">All public (${data.completed.length + data.upcoming.length})</button>
              </div>
              <label>
                <span class="sr-only">Filter by county</span>
                <select id="county-filter">
                  <option value="">All counties</option>
                  ${data.counties
                    .map(
                      (c) =>
                        `<option value="${K.escapeHtml(c)}" ${
                          state.countyFilter === c ? "selected" : ""
                        }>${K.escapeHtml(c)}</option>`,
                    )
                    .join("")}
                </select>
              </label>
            </div>
          </div>
          <div id="stop-results"></div>
        </div>
      </section>
    `;

    const jumpNeeds = document.getElementById("jump-needs-attention");
    if (jumpNeeds) {
      jumpNeeds.addEventListener("click", () => {
        state.mode = "pending";
        mount(state.data);
        document.getElementById("explorer-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    const grid = document.getElementById("county-grid");
    const rows = [
      ...s.buckets.visited.map((name) => ({ name, bucket: "visited" })),
      ...s.buckets.scheduled.map((name) => ({ name, bucket: "scheduled" })),
      ...s.buckets.undocumented.map((name) => ({ name, bucket: "undocumented" })),
    ].sort((a, b) => a.name.localeCompare(b.name));
    grid.innerHTML = rows
      .map((r) => `<li class="${r.bucket}">${K.escapeHtml(r.name)}</li>`)
      .join("");

    bindExplorer();
    root.setAttribute("aria-busy", "false");
  }

  async function boot() {
    state.editorAvailable = await K.checkEditor();
    state.data = await K.loadPayload(state.editorAvailable);
    mount(state.data);
  }

  boot().catch((err) => {
    const root = document.getElementById("app");
    root.innerHTML = `<p class="error-banner">${K.escapeHtml(err.message || String(err))}</p>`;
    root.setAttribute("aria-busy", "false");
  });
})();
