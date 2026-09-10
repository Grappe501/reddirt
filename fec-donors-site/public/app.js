const money = (value) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

function downloadCsv(donors, filename) {
  const lines = [
    ["Name", "City", "State", "Employer", "Occupation", "2026 cycle", "Historical", "Gifts", "Candidates", "Last date"].join(","),
    ...donors.map((donor) =>
      [
        donor.name,
        donor.city,
        donor.state,
        donor.employer,
        donor.occupation,
        donor.total,
        donor.historicalTotal ?? 0,
        donor.giftCount,
        [...new Set(donor.gifts.map((gift) => gift.candidateLabel))].join(" + "),
        donor.lastDate,
      ]
        .map(csvEscape)
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function compactMoney(value) {
  if (value == null) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "–" : "";
  if (abs >= 1000000) return `${sign}$${(abs / 1000000).toFixed(2)}M`;
  if (abs >= 1000) return `${sign}$${Math.round(abs / 1000)}K`;
  return `${sign}$${Math.round(abs)}`;
}

function renderNetWorth(report, personId) {
  const person = report.people.find((item) => item.id === personId) || report.people[0];
  const comparable = person.rows.filter((row) => row.series === "opensecrets" && row.midpoint != null);
  const max = Math.max(...comparable.map((row) => Math.abs(row.midpoint)), 1);
  const lede = document.getElementById("lede");
  if (lede) {
    lede.textContent =
      "House and Senate filings use ranges, not one number. Before-office rows are candidate disclosures and, for Hill, the 2014 Delta Trust sale. OpenSecrets, Quiver, and Reuters are different methods and should not be read as one line.";
  }

  return `
    <div class="tabs">
      ${report.people
        .map(
          (item) =>
            `<button type="button" data-person="${item.id}" class="${item.id === person.id ? "active" : ""}">${item.name}</button>`,
        )
        .join("")}
    </div>
    <p class="note">${person.office} · in office since ${person.inOfficeSince}. ${person.beforeNote}</p>
    <ul class="links">
      ${person.links.map((link) => `<li><a href="${link.href}" target="_blank" rel="noreferrer">${link.label}</a></li>`).join("")}
    </ul>
    <dl class="stats">
      ${person.highlights.map((item) => `<div class="stat"><dt>${item.label}</dt><dd>${item.value}</dd></div>`).join("")}
    </dl>
    <p class="note">${report.disclaimer}</p>
    <h2 class="kicker" style="margin-top:28px">Before taking office</h2>
    <div class="pre-list">
      ${person.preOffice
        .map(
          (item) => `<article class="pre-card">
            <h3>${item.year} · ${item.item}</h3>
            <p>${item.detail} <a href="${item.href}" target="_blank" rel="noreferrer">${item.source}</a></p>
          </article>`,
        )
        .join("")}
    </div>
    ${
      comparable.length
        ? `<h2 class="kicker" style="margin-top:28px">OpenSecrets midpoints only</h2>
           <div class="bars">
             ${comparable
               .map((row) => {
                 const width = Math.max(4, Math.round((Math.abs(row.midpoint) / max) * 100));
                 return `<div class="bar-row"><span class="bar-label">${row.year}</span><div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div><span class="bar-value">${compactMoney(row.midpoint)}</span></div>`;
               })
               .join("")}
           </div>
           <p class="note">Same OpenSecrets method only. Later Quiver prints are not on this bar.</p>`
        : ""
    }
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Year</th><th>Period</th><th>Estimate</th><th>Range</th><th>Source</th></tr>
        </thead>
        <tbody>
          ${person.rows
            .map(
              (row) => `<tr>
                <td>${row.year}</td>
                <td>${row.period}</td>
                <td>${row.estimate}</td>
                <td>${row.range}</td>
                <td><a href="${row.href}" target="_blank" rel="noreferrer">${row.source}</a></td>
              </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function scopeDonor(donor, slug) {
  if (!slug) return donor;
  const gifts = donor.gifts.filter((gift) => gift.candidateSlug === slug);
  const historicalGifts = (donor.historicalGifts ?? []).filter((gift) => gift.candidateSlug === slug);
  return {
    ...donor,
    gifts,
    historicalGifts,
    giftCount: gifts.length,
    total: gifts.reduce((sum, gift) => sum + gift.amount, 0),
    historicalTotal: historicalGifts.reduce((sum, gift) => sum + gift.amount, 0),
    candidateSlugs: [slug],
  };
}

function donorViews(data) {
  const views = [];
  for (const tab of data.tabs) {
    if (tab.id === "jones-shoffner" || tab.source === "arkansas-ethics") {
      for (const candidate of tab.candidates) {
        views.push({
          id: candidate.slug,
          label: candidate.label,
          minAmount: tab.minAmount,
          tab,
          slug: candidate.slug,
        });
      }
    }
    views.push({
      id: tab.id,
      label: tab.label,
      minAmount: tab.minAmount,
      tab,
      slug: null,
    });
  }
  return views;
}

function render(data, netWorth) {
  const root = document.getElementById("app");
  let section = location.hash === "#net-worth" ? "net-worth" : "donors";
  let personId = netWorth.people[0]?.id;
  const views = donorViews(data);
  let viewId = views[0]?.id;
  let filter = "all";
  let query = "";
  let openKey = "";

  const paint = () => {
    if (section === "net-worth") {
      location.hash = "net-worth";
      root.innerHTML = `
        <div class="section-tabs chips">
          <button type="button" data-section="donors">Donors</button>
          <button type="button" data-section="net-worth" class="active">Net worth</button>
        </div>
        ${renderNetWorth(netWorth, personId)}
      `;
      root.querySelectorAll("[data-section]").forEach((button) => {
        button.addEventListener("click", () => {
          section = button.getAttribute("data-section");
          paint();
        });
      });
      root.querySelectorAll("[data-person]").forEach((button) => {
        button.addEventListener("click", () => {
          personId = button.getAttribute("data-person");
          paint();
        });
      });
      return;
    }

    location.hash = "donors";
    const view = views.find((item) => item.id === viewId) || views[0];
    const tab = view.tab;
    const lede = document.getElementById("lede");
    if (lede) {
      lede.textContent =
        tab.source === "arkansas-ethics"
          ? "Named $1,000+ gifts from the official Arkansas ethics 2026 contribution download. Statewide candidates file here, not with the FEC. Street addresses are omitted. Historical state years are not in this first pull."
          : "Itemized individual receipts from OpenFEC for the 2026 cycle only (January 2025–present). Jones, Shoffner, Russell, Ryerse, and Green use a $3,000 threshold. French Hill is a separate tab at $2,000. Historical giving is in its own column and is not mixed into the 2026 totals. Memo duplicates are removed.";
    }
    const scoped = tab.donors
      .filter((donor) => !view.slug || donor.candidateSlugs.includes(view.slug))
      .map((donor) => scopeDonor(donor, view.slug));
    const visible = scoped.filter((donor) => {
      if (filter === "multi" && donor.candidateSlugs.length < 2) return false;
      if (filter !== "all" && filter !== "multi" && !donor.candidateSlugs.includes(filter)) return false;
      if (!query.trim()) return true;
      return [donor.name, donor.city, donor.state, donor.employer, donor.occupation]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase());
    });
    const listCandidates = view.slug ? tab.candidates.filter((item) => item.slug === view.slug) : tab.candidates;

    root.innerHTML = `
      <div class="section-tabs chips">
        <button type="button" data-section="donors" class="active">Donors</button>
        <button type="button" data-section="net-worth">Net worth</button>
      </div>
      <div class="tabs">
        ${views
          .map(
            (item) =>
              `<button type="button" data-view="${item.id}" class="${item.id === view.id ? "active" : ""}">${item.label} ${money(item.minAmount)}+</button>`,
          )
          .join("")}
      </div>
      <ul class="links">
        ${listCandidates
          .map((candidate) => `<li><a href="${candidate.fecUrl}" target="_blank" rel="noreferrer">${candidate.label} · ${candidate.office}</a></li>`)
          .join("")}
      </ul>
      <dl class="stats">
        <div class="stat"><dt>Donors</dt><dd>${scoped.length}</dd></div>
        ${
          view.slug
            ? `<div class="stat"><dt>2026 cycle</dt><dd>${money(scoped.reduce((sum, donor) => sum + donor.total, 0))}</dd></div>`
            : tab.candidates
                .map(
                  (candidate) =>
                    `<div class="stat"><dt>${candidate.label}</dt><dd>${tab.donors.filter((donor) => donor.candidateSlugs.includes(candidate.slug)).length}</dd></div>`,
                )
                .join("")
        }
        ${
          !view.slug && tab.candidates.length > 1
            ? `<div class="stat"><dt>Gave to more than one</dt><dd>${tab.donors.filter((donor) => donor.candidateSlugs.length > 1).length}</dd></div>`
            : ""
        }
      </dl>
      <p class="note">${view.slug ? `${visible.length} ${view.label} donors` : `${tab.giftCount} countable 2026-cycle gifts`} · refreshed ${new Date(data.generatedAt).toLocaleString()}</p>
      <div class="toolbar">
        <div class="search">
          <label for="q">Search the list</label>
          <input id="q" type="search" value="${query.replaceAll('"', "&quot;")}" placeholder="Name, city, employer…" />
        </div>
        <button type="button" id="csv">Download CSV</button>
      </div>
      ${
        !view.slug && tab.candidates.length > 1
          ? `<div class="chips">
              <button type="button" data-filter="all" class="${filter === "all" ? "active" : ""}">All donors</button>
              ${tab.candidates
                .map(
                  (candidate) =>
                    `<button type="button" data-filter="${candidate.slug}" class="${filter === candidate.slug ? "active" : ""}">${candidate.label}</button>`,
                )
                .join("")}
              <button type="button" data-filter="multi" class="${filter === "multi" ? "active" : ""}">Gave to more than one</button>
            </div>`
          : ""
      }
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Donor</th><th>City</th><th>Employer</th><th>Candidate</th><th class="num">2026 cycle</th><th class="num">Historical</th></tr>
          </thead>
          <tbody>
            ${
              visible.length === 0
                ? `<tr><td class="empty" colspan="6">No donors at this threshold in the current filings.</td></tr>`
                : visible
                    .map((donor) => {
                      const candidates = [...new Set(donor.gifts.map((gift) => gift.candidateLabel))].join(" + ");
                      const giftLine = (gift) =>
                        `<li class="gift">${gift.date || "undated"} · ${money(gift.amount)} · ${gift.election || "election n/a"} · ${gift.candidateLabel}${gift.filingUrl ? ` · <a href="${gift.filingUrl}" target="_blank" rel="noreferrer">${tab.source === "arkansas-ethics" ? "Ethics search" : "FEC image"}</a>` : ""}</li>`;
                      const historicalGifts = donor.historicalGifts ?? [];
                      const gifts =
                        openKey === donor.key
                          ? `<p class="gift-head">2026 cycle</p><ul>${donor.gifts.map(giftLine).join("")}</ul>${
                              historicalGifts.length
                                ? `<p class="gift-head">Earlier cycles</p><ul>${historicalGifts.map(giftLine).join("")}</ul>`
                                : ""
                            }`
                          : "";
                      return `<tr>
                        <td class="name">
                          <button type="button" data-open="${donor.key}">${donor.name}</button>
                          ${donor.occupation ? `<p class="occ">${donor.occupation}</p>` : ""}
                          ${gifts}
                        </td>
                        <td>${[donor.city, donor.state].filter(Boolean).join(", ")}</td>
                        <td>${donor.employer || "—"}</td>
                        <td>${candidates}</td>
                        <td class="num">${money(donor.total)}</td>
                        <td class="num">${donor.historicalTotal > 0 ? money(donor.historicalTotal) : "—"}</td>
                      </tr>`;
                    })
                    .join("")
            }
          </tbody>
        </table>
      </div>
    `;

    root.querySelectorAll("[data-section]").forEach((button) => {
      button.addEventListener("click", () => {
        section = button.getAttribute("data-section");
        paint();
      });
    });
    root.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => {
        viewId = button.getAttribute("data-view");
        filter = "all";
        query = "";
        openKey = "";
        paint();
      });
    });
    root.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        filter = button.getAttribute("data-filter");
        paint();
      });
    });
    root.querySelectorAll("[data-open]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.getAttribute("data-open");
        openKey = openKey === key ? "" : key;
        paint();
      });
    });
    const input = root.querySelector("#q");
    input?.addEventListener("input", (event) => {
      query = event.target.value;
    });
    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") paint();
    });
    input?.addEventListener("search", () => paint());
    root.querySelector("#csv")?.addEventListener("click", () =>
      downloadCsv(visible, `${tab.source === "arkansas-ethics" ? "ar-ethics" : "fec"}-donors-${view.id}-2026.csv`),
    );
  };

  paint();
}

Promise.all([
  fetch("./data.json").then((response) => {
    if (!response.ok) throw new Error("Donor data is not ready yet.");
    return response.json();
  }),
  fetch("./statewide.json").then((response) => (response.ok ? response.json() : { tabs: [] })),
  fetch("./net-worth.json").then((response) => {
    if (!response.ok) throw new Error("Net-worth data is not ready yet.");
    return response.json();
  }),
])
  .then(([data, statewide, netWorth]) => {
    data.tabs = [...(data.tabs || []), ...(statewide.tabs || [])];
    render(data, netWorth);
  })
  .catch((error) => {
    document.getElementById("app").textContent = error.message;
  });
