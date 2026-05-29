# NSI-16 Design Exploration — Three Candidate Versions

**Status:** Exploration only — no build authorized in this pass  
**Audit date:** 2026-05-29  
**Steve’s stated intent (post NSI-15):** Campaign Operations Command Center + Daily Operator Workflow

---

## Recommendation preview

**Lead with Option A**, infused with selective elements from B and C:

- **Option A** solves the real operator pain today (fragmented dashboards).
- **Option B** capabilities belong as **background analyzers** feeding A — not a separate autonomous analyst product.
- **Option C** rhetoric is attractive but risks governance drift unless tightly scoped to “prep, not publish.”

---

## Option A — Executive Intelligence Directorate

### Concept

A single **Campaign CEO / Campaign Manager command center** that answers, every morning and on demand:

1. What changed since yesterday?  
2. What matters today?  
3. What is blocked?  
4. What is ready for human use (but not public)?  
5. Who should do what?  
6. What must **not** be used publicly yet?

### Core surfaces (one route)

**Proposed route:** `/admin/intelligence/command-center` (or `/admin/intelligence/operations`)

| Zone | Sources composed |
| ---- | ---------------- |
| **Delta strip** | NSI-13 memory + audit browser highlights + new intake |
| **Situation summary** | `intelligenceBrainCoordinator` executive slice |
| **Priority actions** | NSI-15 top urgent + blocked |
| **Scenario watch** | NSI-14 highest risk + debate traps |
| **Evidence health** | Citation aging + export-ready count |
| **Media watch** | NSI-8/9/10 pending + border markets |
| **Draft backlog** | NSI-12 pending review count |
| **County flash** | NSI-5 counties with elevated risk/opportunity |
| **Debate / rapid prep** | NSI-14 + debate memory + trap list |
| **Weekly packet export** | Governed PDF/Markdown bundle (human-triggered) |

### Operator roles served

Campaign manager, research director, comms director, debate prep lead, field director — each gets a **role-filtered tab** on the same page (not a new app).

### Governance

- All zones read-only except links into existing workflows (action queue status, LLM review, citation locker).
- Banner on every zone: **RECOMMENDATION_ONLY · HUMAN_ACTION_REQUIRED · NON_PUBLISHABLE**.
- No new mutation paths — composition only.

### Pros

- Fastest path to “true OS” feel  
- Reuses 100% of NSI-1–15 investment  
- Lowest governance risk  
- Matches Steve’s NSI-16 script literally  

### Cons

- Less “flashy AI” than Option B/C  
- Requires disciplined information architecture to avoid another cluttered page  

### Estimated effort

**Medium** (2–3 focused passes): layout + composer API + role tabs + weekly packet generator hook.

---

## Option B — Autonomous Intelligence Analyst

### Concept

A background **analyst agent** that continuously synthesizes patterns across opposition, media, counties, volunteers, fundraising, and doctrine — surfacing **anomalies and trends** without executing actions.

### Capabilities envisioned

| Analyzer | Input domains |
| -------- | ------------- |
| Narrative trend detector | NSI-1/3/13 |
| Opponent message tracker | Media + opposition |
| County synthesis engine | NSI-5/6/2 |
| Volunteer signal integrator | Power of 5 / field ops (aggregate) |
| Fundraising intel bridge | Compliance/treasurer (aggregate) |
| Media narrative classifier | NSI-8–10 |

### Output

- Daily **Analyst Memo** (INTERNAL)  
- Trend cards pushed to NSI-15 as recommendations  
- Optional LLM narrative summary (NSI-12 queue)  

### Pros

- Feels like hiring a staff analyst  
- Reduces manual cross-dashboard hunting  
- Strong foundation for future automation **recommendations**  

### Cons

- **High scope creep** — touches finance, field, comms lanes  
- Risk of “autonomous analyst” language encouraging trust without verification  
- Cold-start and hallucination risk if LLM-heavy  
- Duplicates much of `intelligenceBrainCoordinator` unless merged  

### Governance requirements (if ever built)

- Must remain **read-only** with explicit provenance per insight  
- Every insight → citation or adapter ID  
- No cross-lane writes without integration packet approval  

### Estimated effort

**High** (4–6 passes) if built standalone; **Low–Medium** if folded into Option A as “Analyst Memo” section.

---

## Option C — Strategic War Room AI

### Concept

Real-time **battle tracking** UI: opponent moves, narrative warfare map, debate prep status, counter-message **prep** (not publish), scenario watch, election forecast placeholders.

### War room modules

| Module | Function |
| ------ | -------- |
| Battle board | Timeline of opponent + media events |
| Narrative warfare map | NSI-1/2/3 geographic heat |
| Debate prep status | Traps, rebuttals, export-ready gaps |
| Counter-message prep | Writing toolbox + LLM drafts (gated) |
| Rapid response queue | NSI-15 urgent + media intake |
| Scenario theater | NSI-14 live board |
| Forecast wall | Turnout/scenario probabilities (future) |

### Pros

- Highest emotional impact for leadership  
- Aligns with “campaign war room” vision  
- Strong debate season utility  

### Cons

- **“Real-time”** implies infra (websockets, feeds, alerts) not yet present  
- “Counter-message generation” naming scares compliance — must rebrand **Counter-message PREP**  
- Election forecasting module could invite unsourced predictions  
- Most expensive UI/UX pass  

### Governance

- War room = **prep cockpit**, not launch panel  
- Separate **RED** zone for anything not export-ready  
- Forecast wall must label **ASSUMPTION / NOT PREDICTION** until models exist  

### Estimated effort

**High** (5–7 passes) for full vision; **Medium** for “war room lite” embedded in Option A.

---

## Side-by-side comparison

| Criterion | Option A | Option B | Option C |
| --------- | -------- | -------- | -------- |
| Operator value (30 days) | ★★★★★ | ★★★☆☆ | ★★★★☆ |
| Governance risk | Low | Medium | Medium–High |
| Reuse of NSI-1–15 | Maximum | High | High |
| Net new infra | Low | Medium | High |
| Debate season readiness | High | Medium | Very High |
| Daily habit formation | Highest | Medium | Medium |
| Build time | 2–3 passes | 4–6 passes | 5–7 passes |

---

## Burt’s recommended NSI-16 definition

**NSI-16: Campaign Operations Command Center (Option A+)**

### Single sentence

> Unify Morning Brief, Action Queue, Evidence Command summary, Scenario Watch, Media Intake status, LLM Review backlog, County flash alerts, Debate prep status, and Target Pathway gaps into one **role-aware daily command center** with a governed weekly intelligence packet export.

### Explicit non-goals for NSI-16

- No autonomous publishing  
- No new claim/citation/task mutation  
- No voter microtargeting  
- No probabilistic election predictions (placeholder only)  
- No replacement of specialized workbenches — **hub, not swap**  

### Optional A+ modules (from B/C)

| Module | Origin | Priority |
| ------ | ------ | -------- |
| Analyst Memo (deterministic) | Option B | P1 |
| Battle timeline strip | Option C | P2 |
| Role tabs (Research / Debate / Field / Comms) | Option A | P1 |
| Weekly intelligence packet | Option A | P1 |
| Forecast placeholder panel | Option C | P3 (stub only) |

---

## Acceptance criteria (for future NSI-16 build)

1. One route loads in <5s on warm Netlify (cold path documented).  
2. All sections sourced from existing engines — no duplicate business logic.  
3. NSI-15 actions surfaced with deep links to workflow routes.  
4. `agents:test-*` suite extended for command center composition.  
5. Export-ready claim count unchanged by page load (read-only proof).  
6. Leadership can answer “what do we do today?” without opening 6 tabs.

---

## Decision requested from Steve

Pick primary framing:

- [ ] **A** — Executive Intelligence Directorate (recommended)  
- [ ] **B** — Autonomous Analyst (background memo only)  
- [ ] **C** — Strategic War Room (lite embedded in A)  
- [ ] **A+** — Command center + analyst memo + war-room timeline (recommended default)

No code until selection is recorded in execution board.
