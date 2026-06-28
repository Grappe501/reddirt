# CPOS Design Pass 01 — Ernie vision ↔ Burt analysis

**Date:** 2026-06-28  
**Participants:** Ernie (vision, via Steve), Burt (Cursor / implementation constitution)  
**Output:** Agreed frame, **10 differentiators**, decisions needed before Phase 2 IA  
**Constitution:** [`CPOS_MASTER_BUILD_BIBLE.md`](./CPOS_MASTER_BUILD_BIBLE.md)

---

## Pass 01 purpose

Turn Ernie’s CPOS sketch into a **buildable constitution**: platform-first, kickoff-second; engines named; RedDirt seams identified; novelty explicit; open questions short enough for one Steve reply.

---

## Burt’s analysis of Ernie’s frame

### What is exactly right

1. **Subsystem, not page** — Matches how RedDirt already grows (Election Plan, Power of 5, Message Engine, Orchestration). CPOS becomes **Division 12** in the registry when steered — not a sprint hack.
2. **Manifest-driven meetings** — Same pattern as election plan snapshots, opposition intel JSON, brain manifests: **data drives UI**, agents compile slices from spec.
3. **18 engines as boundaries** — Prevents one React page from becoming a god component. Each engine maps to a `src/lib/cpos/*` module with a narrow contract.
4. **Presenter Console ≠ Audience View** — Cognitive load separation is non-negotiable for live events. Screen-share is a failure mode CPOS should replace for *guided* demos.
5. **Demo Engine + Presentation Views** — RedDirt already has `/election-plan` with rich county playbooks. `?presentation=true` is cheaper and more honest than recording Looms that rot.
6. **Soft navigation lock** — Aligns with volunteer philosophy (guidance, not surveillance). Better than iframe prisons.
7. **Volunteer Journey Engine** — Connects to existing rails: `/api/forms`, WorkflowIntake, VolunteerProfile, Power of 5 pipeline language.
8. **Four phases before code** — Matches PROTO-2 progressive build. Phase 1 (this pass) → IA → UX Bible → slices.
9. **Meeting Library** — Institutional memory is the moat. Zoom recordings don’t clone into next year’s kickoff manifest.
10. **30-doc set** — Overkill for humans, perfect for AI self-assembly: each doc = one packet boundary.

### What Burt would refine

| Ernie idea | Refinement |
|------------|------------|
| “Navigation lock” | Rename **Soft Guidance** — never use “lock” in code or UI copy. |
| Timeline schedules every second | Timeline Engine schedules **segments** with targets; sub-second sync is transport concern, not editorial. |
| Presenter Console as separate app | **Separate route + layout**, same Next.js deploy — not a second repo (faster ship). |
| Every EP page gets `?presentation=true` | **Contract + priority list** — v1 one surface; EP has dozens of routes. |
| 18 engines all v1 | **Explicit defer list** in Bible §4 — ship kickoff vertical slice. |
| YAML manifest | YAML for author ergonomics → **compile to JSON** for runtime + Zod (agent-friendly). |
| Live fundraising on wall | **Phase 4+** unless treasurer approves live $ display policy. |
| Meeting Builder drag-drop | **Phase 4** — v1 manifests are hand-edited files + validator CLI. |

### RedDirt ground truth (implementation anchors)

- **Election Plan** already lives at `src/app/election-plan/` with county playbooks, calendar bindings, field entries — ideal first demo target.
- **Forms rail** is `POST /api/forms` → WorkflowIntake (Kelly Day 3 slice) — interest capture should use this, not a new table.
- **Orchestration roadmap** Phase 8 is “Presentation / demo polish” at ~10% — CPOS **supersedes** that phase’s vague scope with a real module.
- **No CPOS code exists yet** — clean lane, no migration debt.
- **Realtime is the main technical unknown** — not chosen in repo today for this use case.

---

## The conversation (Pass 01)

### Ernie → Burt

> Build the platform first. Kickoff is manifest `kickoff-2026`. Manifest drives everything. Presenter and audience are different worlds. Demos are embedded Campaign OS, not external tabs. Interactions feed volunteer journeys. Store every meeting forever.

### Burt → Ernie

**Agreed.** Constitution written. I need five decisions from you and Steve to lock Phase 2 IA:

1. **Zoom relationship** — CPOS runs **alongside** Zoom (audio/video) or replaces it for kickoff?
2. **Join auth** — Public unlisted link, passcode, or login-required for audience?
3. **Kickoff chapter lock** — Is Ernie’s list final? `why → trust → infrastructure → immersion → dashboard_demo → volunteer_roles → closing`
4. **First demo** — County playbook hub vs single county (Pope) vs calendar?
5. **Mobile audience** — Is phone the **primary** audience device for kickoff? (drives UX Bible)

### Ernie → Burt (anticipated positions for next pass)

> Alongside Zoom for kickoff. Unlisted link + optional passcode. Chapter list is right. County playbook **hub** first. Mobile matters — many volunteers on phones.

*Burt: If Steve confirms, Pass 02 IA assumes these defaults.*

### Burt → Ernie

On **realtime**, three options ranked for RedDirt:

| Option | Pros | Cons |
|--------|------|------|
| **A. Supabase Realtime** | Already in stack docs; channel per session | Needs hosted DB + RLS design |
| **B. PartyKit / edge room** | Built for session sync | New dependency + deploy |
| **C. Polling fallback** | No new infra; 2–3s lag | Feels less “live” |

**Recommendation:** A for production path, C for CPOS-3/4 dev shells until session URL exists. Presenter advance must work on C so we’re not blocked.

### Ernie → Burt

> Don’t let realtime block story and demo work. Soft guidance over lock. Analytics from day one even if simple event log.

### Burt → Ernie

Logged in Bible §11 and slice order. CPOS-8 is analytics events before Meeting Builder.

---

## Ten differentiating factors (novelty stack)

These are the **product and technical moat** — not marketing fluff. Each maps to an engine and a doc packet.

### 1. Manifest-Native Meeting Compiler

**What:** Meetings are validated manifests compiled to runtime plans — never hardcoded React routes per meeting.  
**Why novel:** Webinar tools use slide decks; campaign ops tools use dashboards — neither compiles **live meeting + demo + intake** from one file.  
**Build:** Zod schemas, `npm run cpos:validate-manifest`, compiler to session plan.  
**Engine:** Meeting Engine + Library.

### 2. Semantic Session Bus (not screen share)

**What:** Audience follows **chapter id, demo key, interaction phase** — not presenter’s pixels.  
**Why novel:** Eliminates tab chaos while respecting volunteer agency on demos.  
**Build:** `MeetingSessionState` + fan-out; presenter/audience subscribe.  
**Engine:** Meeting Engine.

### 3. Embedded Campaign OS Demo Universe

**What:** Any approved surface becomes a meeting chapter via Presentation View + auto-return.  
**Why novel:** Demos stay **live product**, not stale screenshots — rare in political tech.  
**Build:** Demo Engine + Presentation Views on EP v1.  
**Engine:** Demo Engine, Presentation Views, Launcher.

### 4. Story Arc Engine (narrative metadata)

**What:** Chapters carry `arc`, `emotionalBeat`, `memoryHook` — UI pacing follows story, not slide index.  
**Why novel:** Replaces PowerPoint narrative with **campaign story grammar** baked into data.  
**Build:** Story Engine metadata on chapters; Audience View templates per beat type.  
**Engine:** Story Engine, Chapter Engine.

### 5. Private Cue Layer

**What:** Time-synced presenter prompts invisible to audience (“mention Winthrop Rockefeller”).  
**Why novel:** Teleprompter + director notes integrated into campaign OS, not a second doc.  
**Build:** Cue Engine + Presenter Console panel.  
**Engine:** Cue Engine.

### 6. Live Volunteer Journey Wiring

**What:** Poll / lane pick in meeting → profile hints → suggested training → intake → county signal in one provenance chain.  
**Why novel:** Event platforms capture leads; CPOS captures **journey state inside the OS**.  
**Build:** Journey Engine + `/api/forms` + metadata namespace.  
**Engine:** Volunteer Journey Engine, Interaction Engine.

### 7. Soft Guidance Navigation

**What:** “Now viewing: County Playbooks” + gentle return — exploration allowed, thread recoverable.  
**Why novel:** Respectful UX for adults volunteering — neither locked nor abandoned.  
**Build:** Navigation soft layer component + session query on return URL.  
**Engine:** Navigation (soft), Demo Engine.

### 8. Live Campaign Truth Beats

**What:** Manifest declares static mythic numbers; engine injects **honest live** aggregates when available (county coverage, stops).  
**Why novel:** Rally energy with **database-backed** credibility — not fake dashboards.  
**Build:** Live Metrics Engine read models from truth snapshot / EP.  
**Engine:** Live Metrics Engine.

### 9. Meeting Intelligence Loop

**What:** Chapter dwell, demo opens, role selections feed analytics export and future talent/intel rails.  
**Why novel:** Turns every training into **structured learning signal** for the campaign brain.  
**Build:** Event log + export API + admin summary (later).  
**Engine:** Meeting Analytics.

### 10. Institutional Presentation Library

**What:** Versioned manifests: replay structure, clone for 2028, fork for county monthly meeting.  
**Why novel:** Campaigns restart from zero each cycle — CPOS accumulates **reusable meeting IP**.  
**Build:** `data/cpos/manifests/`, Library engine, clone CLI.  
**Engine:** Presentation Library.

---

## v1 kickoff manifest draft (for Ernie edit)

```yaml
id: kickoff-2026
version: 1
title: Kelly Grappe for SOS — Team Kickoff
meetingType: team_kickoff
estimatedDurationMinutes: 75

chapters:
  - id: lobby
    title: Welcome
    kind: lobby
    targetMinutes: 5
  - id: why
    title: Why We Run
    targetMinutes: 5
    storyBeat: purpose
  - id: trust
    title: Trust the Team
    targetMinutes: 7
    storyBeat: credibility
    cues: [cue_kelly_story, cue_winthrop_rockefeller]
  - id: infrastructure
    title: The Infrastructure
    targetMinutes: 8
    storyBeat: scale
    metrics: [metric_counties, metric_cities, metric_stops]
  - id: immersion
    title: Road Trip Immersion
    targetMinutes: 10
    storyBeat: immersion
    media: immersion_reel
  - id: dashboard_demo
    title: County Playbooks
    targetMinutes: 6
    demo: county_playbook_hub
  - id: volunteer_roles
    title: Find Your Lane
    targetMinutes: 8
    interactions: [poll_lane, interest_capture]
  - id: closing
    title: Call to Action
    targetMinutes: 5
    storyBeat: commitment

demos:
  county_playbook_hub:
    label: County Playbooks
    path: /election-plan/counties
    presentationQuery: { presentation: "true", cpos: "1" }

interactions:
  poll_lane:
    type: poll
    prompt: What lane interests you most?
    options:
      - { id: field, label: Field & events }
      - { id: youth, label: Youth pipeline }
      - { id: comms, label: Comms & content }
      - { id: data, label: Data & research }
      - { id: county, label: County leadership }
  interest_capture:
    type: form
    formKey: volunteer_kickoff_interest
```

**Ernie:** Edit chapter titles, cues, metric keys, poll options — this becomes doc 021 seed.

---

## Open decisions (Steve reply needed)

| # | Question | Burt default if no reply |
|---|----------|--------------------------|
| D1 | Zoom alongside vs replace? | **Alongside** (CPOS = content sync layer) |
| D2 | Audience join auth? | Unlisted URL + optional passcode |
| D3 | Realtime v1 transport? | Supabase path + polling dev fallback |
| D4 | First demo surface? | `/election-plan/counties` hub |
| D5 | Mobile-first audience? | **Yes** — UX Bible leads mobile |
| D6 | Register CPOS as new Division in registry? | **Yes** — Division 12 Presentation OS |
| D7 | Kickoff target date? | Drives slice compression — need date |
| D8 | Recording / replay in v1? | **No** — analytics yes, video replay no |

---

## Pass 02 preview (Information Architecture)

When D1–D8 are resolved, Pass 02 delivers:

- Full route map (`/meeting/[slug]`, `/present`, join flow)
- Component tree (Audience shell, Presenter shell, chapter templates)
- JSON schemas for session state, events, manifest
- Directory layout under `src/lib/cpos/`, `src/components/cpos/`, `data/cpos/`
- Traceability matrix (manifest chapter → component → API → integration)
- Stub files: `021-MEETING-MANIFEST-SPEC.md` filled

**Estimated:** one focused pass after Steve confirms decisions.

---

## Pass 03 preview (UX Bible)

- Presenter emotional arc (calm control, not cockpit overload)
- Audience “wow” = clarity + motion + one CTA per chapter
- Transition timings (e.g. chapter cross-fade 400ms, reduced-motion 0ms)
- Late join: jump to live chapter + optional “what you missed” drawer
- Phone: thumb zone, poll chips, demo opens full-screen sheet
- Accessibility acceptance tests

---

## Ernie ↔ Burt alignment score

| Area | Alignment |
|------|-----------|
| Platform vs one-off | ✅ Full |
| Manifest-driven | ✅ Full |
| 18 engines | ✅ With v1 defer list |
| Demo / presentation views | ✅ Full |
| Volunteer journey | ✅ Full |
| Meeting library | ✅ Full |
| Realtime mechanism | ⚠️ Needs D3 |
| Auth / Zoom | ⚠️ Needs D1–D2 |
| Kickoff date pressure | ⚠️ Needs D7 |

**Pass 01 status:** Constitution drafted. **Not ready to code.** Ready for Steve decisions + Pass 02 IA.
