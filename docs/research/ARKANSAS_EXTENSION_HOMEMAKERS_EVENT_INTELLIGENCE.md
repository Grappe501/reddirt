# Arkansas Extension Homemakers (AEHC / EHC) — event intelligence (tentative)

**Label (required in any export):** **Community calendar intelligence — tentative, verify before outreach.**  
**Not** a Kelly for SOS campaign event list. **Do not** present third-party club meetings as **official** **campaign** events.

**Last updated:** 2026-04-26.

---

## 1. Official program sources (preferred)

| Resource | URL | Use |
|----------|-----|-----|
| EHC / AEHC home (UAEX) | `https://www.uaex.uada.edu/EHC` | **Clubs, program overview** |
| Conferences and Training | `https://www.uaex.uada.edu/life-skills-wellness/extension-homemakers/training.aspx` | **State meeting**, **Spring Workshop**, **District Rallies** dates (2026) |
| 2024 state meeting news (example) | `https://www.uaex.uada.edu/media-resources/news/2024/june2024/06-13-2024-ark-aehc-conference.aspx` | **Format** and **typical** venue pattern |
| 2026 State Mtg **info PDF** (linked from training page) | `https://www.uaex.uada.edu/life-skills-wellness/extension-homemakers/EHC%20State%20Mtg%20Info%20June%202026.pdf` | **Registration** and **hotel** deadlines (verify in PDF) |

**Secondary:** local newspapers (e.g. Hot Springs coverage of 2024 state meeting) — use for **corroboration** only.  
**Tertiary:** **Facebook** — **never** the sole source; mark **low** confidence.

---

## 2. 2026 calendar snapshot (from UAEX training page, **Day 2 scrape** — re-verify on live site)

*UAEX `training.aspx` included (Apr 26, 2026):*

| Event (label on site) | When (as listed) | Where / notes | Confidence | requires_confirmation |
|------------------------|------------------|---------------|------------|------------------------|
| **AEHC State Meeting** | **June 2–4, 2026** | **Wyndham Riverfront Hotel** (Little Rock / North Little Rock riverfront) — per site & PDF link | **high** (official page) | **true** (verify room block & final agenda) |
| **River Valley Food and Fair Judging Training** (related **Spring** / training line not always labeled “Spring Workshop”) | **May 13, 2026**, 9:00 a.m.–12:00 p.m. | **Pope County Farm Bureau Building, Russellville**; registration **deadline** May 11, **fee** $5 | high | true |
| **Spring Workshop** (calendar row) | **March 10–11, 2026** (table on same page) | **Not** detailed in scrape — **must** open current calendar | **medium** | true |
| **District Rally — Ozark** | **Oct 13, 2026** | *Per calendar table* — no venue in scrape | low–medium | true |
| **District Rally — Ouachita** | **Oct 15, 2026** | *Per calendar table* | low–medium | true |
| **District Rally — Delta** | **Oct 20, 2026** | *Per calendar table* | low–medium | true |
| **Ozark Folk Center Retreat** | **Oct 28–30, 2026** | *Per calendar table* | low–medium | true |
| **Milestones** (October rallies) | **Oct 31, 2026** | *Milestone* submissions referenced | low | true |

**Known statewide / recurring names to watch:** “AEHC Spring Workshop,” “AEHC State Meeting,” “District Rallies” (often fall).

---

## 3. Per-county & chapter intelligence

- **Not** systematized in Day 2. **Method:** for outreach, have volunteers check **county extension** pages: `https://www.uaex.uada.edu/` → county office → EHC or **family and consumer sciences** contacts.

**Do not** cold-call as “Kelly campaign” using **stale** Facebook event times.

---

## 4. Data mirror

Structured rows for the engine: `src/content/events/tentativeExternalEvents.ts` (**not** merged into public `events` array in `src/content/events/index.ts` for Day 2 — **internal / planning** only).

---

## 5. Disclaimer (paste for volunteers)

*Arkansas Extension Homemakers and UAEX are independent organizations. This sheet is for **scheduling** only. **Confirm** every date with **county** extension or **EHC** leadership before **attendance** or **invitation** assumptions.*
