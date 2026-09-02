(function () {
  const K = window.KellyVisits;
  const state = {
    editorAvailable: false,
    payload: null,
    stop: null,
    isNew: false,
    saving: false,
    pendingAttachments: [],
  };

  function parseStopId() {
    const q = new URLSearchParams(window.location.search);
    const qid = q.get("id");
    if (qid === "new") return { id: null, isNew: true };
    if (qid) return { id: qid, isNew: false };

    const path = window.location.pathname || "";
    const m = path.match(/^\/stop\/(.+)$/);
    if (m) {
      const id = decodeURIComponent(m[1].replace(/\/$/, ""));
      if (id && id !== "new") return { id, isNew: false };
      if (id === "new") return { id: null, isNew: true };
    }
    // Missing id on stop.html → treat as new
    if (/stop\.html$/i.test(path) || path.endsWith("/stop") || path.endsWith("/stop/")) {
      return { id: null, isNew: true };
    }
    return { id: null, isNew: true };
  }

  function sameDayStops(date, excludeId) {
    if (!date || !state.payload) return [];
    return K.allPublicStops(state.payload).filter((s) => s.date === date && s.id !== excludeId);
  }

  function blankStop() {
    return {
      id: null,
      date: new Date().toISOString().slice(0, 10),
      endDate: null,
      title: "",
      publicTitle: null,
      city: null,
      counties: [],
      status: "completed",
      includeOnPublicPage: true,
      confidence: "confirmed",
      notes: "",
      sourceType: "manual",
    };
  }

  function relatedFrom(stop) {
    return {
      ...blankStop(),
      date: stop.date,
      title: `${stop.title} (additional stop)`,
      status: stop.status === "scheduled" ? "scheduled" : "completed",
      includeOnPublicPage: true,
      notes: stop.id ? `Related to ${stop.id}` : "",
    };
  }

  function render(stop) {
    const root = document.getElementById("app");
    const math = K.countyMath(state.payload.summary);
    const related = state.isNew ? [] : sameDayStops(stop.date, stop.id);
    const title = state.isNew ? "Add a new stop" : stop.publicTitle || stop.title || "Stop details";

    document.title = `${title} | Kelly Across Arkansas`;

    root.innerHTML = `
      <section class="stop-hero">
        <div class="wrap mid">
          <p class="eyebrow">${state.isNew ? "New ledger stop" : "Stop detail"}</p>
          <h1>${K.escapeHtml(title)}</h1>
          <p class="hero-sub">
            ${
              state.isNew
                ? "Create a stop for a place you visited that was missing from the calendar."
                : `${K.escapeHtml(K.formatStopDate(stop.date))}${
                    stop.city ? ` · ${K.escapeHtml(stop.city)}` : ""
                  }`
            }
          </p>
          <div class="calc-strip" aria-label="County progress">
            <span><strong>${math.visited}</strong> visited</span>
            <span><strong>${math.notVisited}</strong> not visited</span>
            <span><strong>${math.total}</strong> total</span>
          </div>
        </div>
      </section>

      <section class="band">
        <div class="wrap mid detail-grid">
          <form id="stop-form" class="detail-card">
            <h2>${
              state.isNew
                ? "Stop details"
                : state.editorAvailable
                  ? "Edit this stop"
                  : "Stop details"
            }</h2>
            <p class="lede">
              ${
                state.editorAvailable
                  ? "Changes write to the campaign ledger and refresh county totals."
                  : "Public view of this campaign stop. Staff edit the ledger locally, then republish."
              }
            </p>
            ${
              state.isNew && state.pendingAttachments.length
                ? `<p class="modal-note"><strong>Attach queue:</strong> ${state.pendingAttachments
                    .map((item) => {
                      const places = [
                        ...(item.match?.cities || []),
                        ...(item.match?.counties || []),
                      ].join(" / ");
                      return `${K.escapeHtml(item.title)}${places ? ` (${K.escapeHtml(places)})` : ""}`;
                    })
                    .join("; ")}. Matching city or county on this new stop will attach ${
                    state.pendingAttachments.length === 1 ? "it" : "them"
                  } automatically.</p>`
                : ""
            }
            ${
              stop.id
                ? `<p class="modal-note">Ledger id: <code>${K.escapeHtml(stop.id)}</code></p>`
                : ""
            }

            <div class="field-row">
              <label class="field">
                <span>Date</span>
                <input name="date" type="date" required value="${K.escapeHtml(stop.date || "")}" />
              </label>
              <label class="field">
                <span>End date (optional)</span>
                <input name="endDate" type="date" value="${K.escapeHtml(stop.endDate || "")}" />
              </label>
            </div>

            <label class="field">
              <span>Calendar / original title</span>
              <input name="title" type="text" required value="${K.escapeHtml(stop.title || "")}" />
            </label>

            <label class="field">
              <span>Public title (optional cleaner heading)</span>
              <input name="publicTitle" type="text" value="${K.escapeHtml(stop.publicTitle || "")}" />
            </label>

            <label class="field">
              <span>City / location clue</span>
              <input name="city" type="text" value="${K.escapeHtml(stop.city || "")}" placeholder="Optional" />
            </label>

            <div class="field-row">
              <label class="field">
                <span>Status</span>
                <select name="status">
                  <option value="completed" ${stop.status === "completed" ? "selected" : ""}>Completed</option>
                  <option value="scheduled" ${stop.status === "scheduled" ? "selected" : ""}>Upcoming / scheduled</option>
                  <option value="needs-review" ${stop.status === "needs-review" ? "selected" : ""}>Needs review</option>
                  <option value="private" ${stop.status === "private" ? "selected" : ""}>Private (hide)</option>
                </select>
              </label>
              <label class="field">
                <span>Confidence</span>
                <select name="confidence">
                  <option value="confirmed" ${stop.confidence === "confirmed" ? "selected" : ""}>Confirmed</option>
                  <option value="likely" ${stop.confidence === "likely" ? "selected" : ""}>Likely</option>
                  <option value="uncertain" ${stop.confidence === "uncertain" ? "selected" : ""}>Uncertain</option>
                </select>
              </label>
            </div>

            <label class="field check-inline">
              <input name="includeOnPublicPage" type="checkbox" ${
                stop.includeOnPublicPage !== false ? "checked" : ""
              } />
              <span>Show on public page</span>
            </label>

            <fieldset class="field">
              <legend>Counties visited on this stop <span class="hint-inline">(check all that apply)</span></legend>
              <input type="search" id="county-search" placeholder="Filter counties…" autocomplete="off" />
              ${K.countyChecklistHtml(stop.counties || [], state.payload.counties)}
            </fieldset>

            <label class="field">
              <span>Internal notes / more details</span>
              <textarea name="notes" rows="4" placeholder="What else happened, who hosted, conflicts to resolve…">${K.escapeHtml(
                stop.notes || "",
              )}</textarea>
            </label>

            <p class="form-error" id="save-error" hidden></p>
            <div class="modal-actions">
              <a class="btn btn-ghost" href="/">Back to all stops</a>
              ${
                state.editorAvailable
                  ? `<div class="modal-actions-right">
                <button type="submit" class="btn btn-navy" id="save-btn">${
                  state.isNew ? "Create stop" : "Save changes"
                }</button>
              </div>`
                  : ""
              }
            </div>
          </form>

          <aside class="detail-side">
            <div class="detail-card">
              <h2>County math</h2>
              <ul class="side-stats">
                <li><span>Visited</span><strong>${math.visited}</strong></li>
                <li><span>Not visited</span><strong>${math.notVisited}</strong></li>
                <li><span>Scheduled only</span><strong>${math.scheduled}</strong></li>
                <li><span>Undocumented</span><strong>${math.undocumented}</strong></li>
              </ul>
              <p class="lede">A county counts as visited once any completed public stop lists it.</p>
            </div>

            ${
              !state.isNew && state.editorAvailable
                ? `<div class="detail-card">
                     <h2>Went more places?</h2>
                     <p class="lede">If this calendar row undercounted the trip, add another stop for the extra county or event.</p>
                     <button type="button" class="btn btn-navy" id="add-related-btn">Add related stop</button>
                   </div>`
                : ""
            }

            ${
              related.length
                ? `<div class="detail-card">
                     <h2>Other stops on ${K.escapeHtml(K.formatStopDate(stop.date))}</h2>
                     <ul class="related-list">
                       ${related
                         .map(
                           (s) => `<li>
                             <a href="${K.stopHref(s.id)}">${K.escapeHtml(s.title)}</a>
                             <span>${
                               s.counties && s.counties.length
                                 ? K.escapeHtml(s.counties.join(", "))
                                 : "County pending"
                             }</span>
                           </li>`,
                         )
                         .join("")}
                     </ul>
                   </div>`
                : ""
            }
          </aside>
        </div>
      </section>
    `;

    K.wireCountySearch(root);

    const form = document.getElementById("stop-form");
    if (state.editorAvailable) {
      form.addEventListener("submit", onSave);
    } else {
      form.querySelectorAll("input, select, textarea").forEach((el) => {
        el.disabled = true;
      });
    }

    const relatedBtn = document.getElementById("add-related-btn");
    if (relatedBtn) {
      relatedBtn.addEventListener("click", () => {
        window.location.href = `/stop.html?id=new&from=${encodeURIComponent(stop.id)}`;
      });
    }

    root.setAttribute("aria-busy", "false");
  }

  function readForm(form) {
    return {
      date: form.date.value,
      endDate: form.endDate.value || null,
      title: form.title.value.trim(),
      publicTitle: form.publicTitle.value.trim() || null,
      city: form.city.value.trim() || null,
      status: form.status.value,
      confidence: form.confidence.value,
      includeOnPublicPage: form.includeOnPublicPage.checked,
      counties: [...form.querySelectorAll('input[name="counties"]:checked')].map((el) => el.value),
      notes: form.notes.value.trim() || null,
    };
  }

  async function onSave(e) {
    e.preventDefault();
    if (state.saving) return;
    const form = e.currentTarget;
    const errEl = document.getElementById("save-error");
    const saveBtn = document.getElementById("save-btn");
    errEl.hidden = true;
    const body = readForm(form);

    // Re-check editor right before save so listed stops stay editable after server restart
    state.editorAvailable = await K.checkEditor();
    if (!state.editorAvailable) {
      errEl.textContent =
        "Editor API is offline. From H:\\SOSWebsite\\RedDirt run: npm run visits:edit";
      errEl.hidden = false;
      return;
    }

    state.saving = true;
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving…";

    try {
      let res;
      if (state.isNew) {
        res = await fetch("/api/stops", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...body,
            notes: body.notes || "Added via stop detail page",
          }),
        });
      } else {
        res = await fetch(`/api/stops/${encodeURIComponent(state.stop.id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `Save failed (${res.status})`);
      if (json.payload) {
        state.payload = json.payload;
        window.__KELLY_VISITS__ = json.payload;
      }
      if (state.isNew && json.stop?.id) {
        window.location.href = K.stopHref(json.stop.id);
        return;
      }
      state.stop = json.stop;
      state.isNew = false;
      render(state.stop);
    } catch (err) {
      errEl.textContent = err.message || String(err);
      errEl.hidden = false;
      saveBtn.disabled = false;
      saveBtn.textContent = state.isNew ? "Create stop" : "Save changes";
    } finally {
      state.saving = false;
    }
  }

  async function loadEditableStop(id) {
    // Prefer full ledger record so every listed stop can be edited with notes/confidence.
    try {
      return await K.fetchStop(id);
    } catch (err) {
      const slim = K.allPublicStops(state.payload).find((s) => s.id === id);
      if (!slim) throw err;
      return {
        ...slim,
        endDate: slim.endDate || null,
        publicTitle: null,
        includeOnPublicPage: true,
        confidence: slim.status === "needs-review" ? "uncertain" : "likely",
        notes: null,
        sourceType: null,
      };
    }
  }

  async function boot() {
    const parsed = parseStopId();
    state.isNew = parsed.isNew;
    state.editorAvailable = await K.checkEditor();
    // Retry once — sandbox / slow start can miss the first health check
    if (!state.editorAvailable) {
      await new Promise((r) => setTimeout(r, 400));
      state.editorAvailable = await K.checkEditor();
    }
    state.payload = await K.loadPayload(state.editorAvailable);
    if (state.editorAvailable) {
      try {
        const q = await K.fetchPendingAttachments();
        state.pendingAttachments = q.open || [];
      } catch {
        state.pendingAttachments = [];
      }
    }

    if (state.isNew) {
      const fromId = new URLSearchParams(window.location.search).get("from");
      if (fromId) {
        try {
          const from = await loadEditableStop(fromId);
          state.stop = relatedFrom(from);
        } catch {
          state.stop = blankStop();
        }
      } else {
        state.stop = blankStop();
      }
      render(state.stop);
      return;
    }

    state.stop = await loadEditableStop(parsed.id);
    render(state.stop);
  }

  boot().catch((err) => {
    const root = document.getElementById("app");
    root.innerHTML = `<p class="error-banner">${K.escapeHtml(err.message || String(err))} <a href="/">Back to all stops</a></p>`;
    root.setAttribute("aria-busy", "false");
  });
})();
