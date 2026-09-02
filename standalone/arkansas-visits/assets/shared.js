/**
 * Shared helpers for Kelly Across Arkansas standalone list + stop pages.
 */
(function (global) {
  const MAIN = "https://kgrappe.netlify.app";

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatStopDate(iso) {
    const [y, m, d] = String(iso || "").split("-").map(Number);
    if (!y || !m || !d) return iso || "";
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

  function allPublicStops(data) {
    return [...(data.completed || []), ...(data.upcoming || [])];
  }

  function pendingStops(data) {
    return allPublicStops(data).filter(
      (s) => !s.counties || s.counties.length === 0 || s.status === "needs-review",
    );
  }

  function countyMath(summary) {
    const total = summary.totalCounties || 75;
    const visited = summary.visitedCounties || 0;
    const scheduled = (summary.buckets && summary.buckets.scheduled
      ? summary.buckets.scheduled.length
      : 0) || 0;
    const notVisited = Math.max(0, total - visited);
    const undocumented =
      (summary.buckets && summary.buckets.undocumented
        ? summary.buckets.undocumented.length
        : notVisited - scheduled) || Math.max(0, notVisited - scheduled);
    return { total, visited, scheduled, notVisited, undocumented };
  }

  function stopHref(id) {
    if (!id || id === "new") return "/stop.html?id=new";
    // Query-string routing is reliable for every listed stop (static + editor server).
    return `/stop.html?id=${encodeURIComponent(id)}`;
  }

  async function checkEditor() {
    try {
      const r = await fetch("/api/health", { cache: "no-store" });
      if (!r.ok) return false;
      const j = await r.json();
      return Boolean(j.editor);
    } catch {
      return false;
    }
  }

  async function loadPayload(editorAvailable) {
    if (editorAvailable) {
      try {
        const r = await fetch("/api/stops", { cache: "no-store" });
        if (r.ok) return r.json();
      } catch {
        /* fall through */
      }
    }
    if (global.__KELLY_VISITS__) return global.__KELLY_VISITS__;
    const r = await fetch("/data/public-visits.json", { cache: "no-cache" });
    if (!r.ok) throw new Error(`Failed to load visit data (${r.status})`);
    return r.json();
  }

  async function fetchPendingAttachments() {
    const r = await fetch("/api/pending-attachments", { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || `Pending attachments failed (${r.status})`);
    return j;
  }

  async function fetchStop(id) {
    const r = await fetch(`/api/stops/${encodeURIComponent(id)}`, { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || `Stop not found (${r.status})`);
    return j.stop;
  }

  function countyChecklistHtml(selected, counties) {
    const set = new Set(selected || []);
    return `<div class="county-check-grid" role="group" aria-label="Counties">
      ${counties
        .map((c) => {
          const id = `county-${c.replace(/\s+/g, "-")}`;
          return `<label class="county-check" for="${escapeHtml(id)}">
            <input type="checkbox" id="${escapeHtml(id)}" name="counties" value="${escapeHtml(c)}" ${
              set.has(c) ? "checked" : ""
            } />
            <span>${escapeHtml(c)}</span>
          </label>`;
        })
        .join("")}
    </div>`;
  }

  function wireCountySearch(root) {
    const search = root.querySelector("#county-search");
    if (!search) return;
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      root.querySelectorAll(".county-check").forEach((lab) => {
        const name = lab.querySelector("span").textContent.toLowerCase();
        lab.hidden = Boolean(q) && !name.includes(q);
      });
    });
  }

  global.KellyVisits = {
    MAIN,
    escapeHtml,
    formatStopDate,
    monthKey,
    monthLabel,
    allPublicStops,
    pendingStops,
    countyMath,
    stopHref,
    checkEditor,
    loadPayload,
    fetchStop,
    fetchPendingAttachments,
    countyChecklistHtml,
    wireCountySearch,
  };
})(window);
