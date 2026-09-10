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

function render(data) {
  const root = document.getElementById("app");
  let tabId = data.tabs[0]?.id;
  let filter = "all";
  let query = "";
  let openKey = "";

  const paint = () => {
    const tab = data.tabs.find((item) => item.id === tabId) || data.tabs[0];
    const visible = tab.donors.filter((donor) => {
      if (filter === "multi" && donor.candidateSlugs.length < 2) return false;
      if (filter !== "all" && filter !== "multi" && !donor.candidateSlugs.includes(filter)) return false;
      if (!query.trim()) return true;
      return [donor.name, donor.city, donor.state, donor.employer, donor.occupation]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase());
    });

    root.innerHTML = `
      <div class="tabs">
        ${data.tabs
          .map(
            (item) =>
              `<button type="button" data-tab="${item.id}" class="${item.id === tab.id ? "active" : ""}">${item.label} ${money(item.minAmount)}+</button>`,
          )
          .join("")}
      </div>
      <ul class="links">
        ${tab.candidates
          .map((candidate) => `<li><a href="${candidate.fecUrl}" target="_blank" rel="noreferrer">${candidate.label} · ${candidate.office}</a></li>`)
          .join("")}
      </ul>
      <dl class="stats">
        <div class="stat"><dt>Donors</dt><dd>${tab.donors.length}</dd></div>
        ${tab.candidates
          .map(
            (candidate) =>
              `<div class="stat"><dt>${candidate.label}</dt><dd>${tab.donors.filter((donor) => donor.candidateSlugs.includes(candidate.slug)).length}</dd></div>`,
          )
          .join("")}
      </dl>
      <p class="note">${tab.giftCount} countable 2026-cycle gifts · refreshed ${new Date(data.generatedAt).toLocaleString()}</p>
      <div class="toolbar">
        <div class="search">
          <label for="q">Search the list</label>
          <input id="q" type="search" value="${query.replaceAll('"', "&quot;")}" placeholder="Name, city, employer…" />
        </div>
        <button type="button" id="csv">Download CSV</button>
      </div>
      ${
        tab.candidates.length > 1
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
                ? `<tr><td class="empty" colspan="6">No donors at this threshold in the current FEC filings.</td></tr>`
                : visible
                    .map((donor) => {
                      const candidates = [...new Set(donor.gifts.map((gift) => gift.candidateLabel))].join(" + ");
                      const giftLine = (gift) =>
                        `<li class="gift">${gift.date || "undated"} · ${money(gift.amount)} · ${gift.election || "election n/a"} · ${gift.candidateLabel}${gift.filingUrl ? ` · <a href="${gift.filingUrl}" target="_blank" rel="noreferrer">FEC image</a>` : ""}</li>`;
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

    root.querySelectorAll("[data-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        tabId = button.getAttribute("data-tab");
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
    root.querySelector("#csv")?.addEventListener("click", () => downloadCsv(visible, `fec-donors-${tab.id}-2026.csv`));
  };

  paint();
}

fetch("./data.json")
  .then((response) => {
    if (!response.ok) throw new Error("Donor data is not ready yet.");
    return response.json();
  })
  .then(render)
  .catch((error) => {
    document.getElementById("app").textContent = error.message;
  });
