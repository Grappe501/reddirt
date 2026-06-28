# CPOS — Zoom Transport & Future Phase Roadmap

**Status:** Notes captured **2026-06-28** (team kickoff eve).  
**Intent:** House strategic direction for post-kickoff CPOS versions. **Not** a build spec for tonight.  
**Lane:** `RedDirt/` only.

---

## Guardrail for tonight (Phase 1)

Do **not** deepen Zoom integration before campaign launch. Tonight:

```
Zoom (video transport)

        +

CPOS (story, timing, demos, polls shell)

        ↓

People watch Zoom

        ↓

Open CPOS beside it (phone / second tab)

        ↓

Participate
```

Shipped for kickoff: manifest-driven audience + presenter routes, polling session API, counties demo launcher. Zoom stays external; CPOS is the companion surface.

**Operator URLs (production):**

| Role | URL |
|------|-----|
| Login | `https://kgrappe.netlify.app/election-plan/login?next=/election-plan/team-kickoff` |
| Audience | `https://kgrappe.netlify.app/election-plan/team-kickoff` |
| Presenter | `https://kgrappe.netlify.app/election-plan/team-kickoff/presenter` |
| Counties demo | `https://kgrappe.netlify.app/election-plan/counties?presentation=true&cpos=1` |

**Tonight limitations (acceptable):**

- Session sync via **polling** v1; may lag across serverless instances — presenter advance + audience refresh if needed.
- Polls **local-only** tonight (not persisted to WorkflowIntake).
- No Zoom SDK embed, no webhooks, no single `/live` entry yet.
- **Chapter 0 (6:00 PM):** Roll Call Roulette — CPOS shows networking instructions + small YouTube PIP (volume slider). Set `NEXT_PUBLIC_CPOS_KICKOFF_YOUTUBE_VIDEO_ID` in Netlify **Builds** scope to your ~10 min reel; falls back to `NEXT_PUBLIC_FOREVERMOST_HEIFER_YOUTUBE_VIDEO_ID` if unset. Attendees shrink Zoom self-view per on-screen tips.

**Deploy notes (2026-06-28):** Netlify build required splitting client-safe `demo-url.ts` and `server-only` on manifest/session modules (`fs` bundling). Lambda deploy can fail on legacy compat mode if `FEATURE_FLAGS` counts toward 4 KB env cap — see `docs/NETLIFY_FIRST_DEPLOY.md` §6 and `npm run netlify:unpin-nextjs-runtime`.

---

## Strategic frame — CPOS as control center

CPOS should become a **signature RedDirt feature**: the campaign’s presentation operating system. Zoom (and later other providers) act as **video transport**, not the product.

```
CPOS
│
├── Story
├── Timing
├── Dashboards
├── Polls
├── Questions
├── Volunteer selection
├── Meeting notes
├── Demo launcher
├── Analytics
└── Zoom  ← transport slot (not the whole product)
```

Zoom is one service inside CPOS, not a replacement for CPOS.

---

## Phased roadmap (Ernie / Steve alignment)

### Phase 1 — Tonight (kickoff companion)

**Mode:** Zoom + CPOS side-by-side.  
**Build slice:** CPOS-1 through CPOS-4 (manifest `kickoff-2026`, presenter console, audience chapters, counties demo).  
**Realtime:** Polling only; abstract transport for later Supabase or webhooks.

### Phase 2 — One-click live entry

Instead of “here’s the Zoom link,” people visit:

```
campaign.kellygrappe.com/live
```

Pre-meeting lobby:

```
═══════════════════════
Weekly Campaign Meeting
Meeting begins in 03:17
[Join Meeting]
═══════════════════════
```

They never hunt for Zoom. CPOS owns the front door; Zoom (or another transport) opens behind one button.

### Phase 3 — Shared chapter state (no refresh)

When Steve advances to Chapter 7, everyone’s CPOS screen updates. Requires durable realtime (Supabase Realtime, SSE, or equivalent) — not polling across cold Lambdas.

### Phase 4 — Smart questions (not Zoom chat)

Inside CPOS: **Ask Kelly**. Questions become searchable, votable, taggable, categorized, answered later, saved forever. Institutional meeting memory.

### Phase 5 — Live polling

Example:

```
Where do you want to volunteer?
○ Youth  ○ Events  ○ Social  ○ Field  ○ Data
```

Presenter immediately sees aggregated counts. Tonight’s polls are a shell; Phase 5 wires persistence and presenter dashboard.

### Phase 6 — Volunteer routing

Person chooses Field → Pulaski → Power of Five → Workflow → county lead notified → volunteer profile updated → training suggested → future meetings personalized. No paper. Queue-first; governed automation confirms profile writes.

### Phase 7 — Meeting companion (demo launcher)

Kelly: “Let’s look at the county playbooks.” Every attendee sees **Open County Playbooks** → tap → presentation view → **Return to Meeting** one tap. Extends tonight’s counties demo pattern to all manifest-linked Campaign OS surfaces.

### Phase 8 — Live notes

CPOS generates meeting notes automatically. End of meeting: what happened, action items, county goals, next week’s meeting. Ties to MESSAGE / institutional memory engines.

### Phase 9 — Live timeline

Top bar for everyone:

```
6:32 · Current: Power of Five · Next: House Parties
```

Everybody knows where they are in the manifest without asking the presenter.

### Phase 10 — Campaign television

Not Zoom. Not PowerPoint. Not screen share alone. Integrated **campaign broadcast platform**: Kelly speaks, CPOS tells the story, dashboards appear, polls, interaction, assignments, training, questions — one place.

---

## CPOS-11 — Live Broadcast Layer (add to roadmap)

Sits **above** Zoom; does not replace CPOS core. Multi-provider abstraction:

| Provider | Role |
|----------|------|
| Zoom | First transport (Meeting SDK + REST + webhooks) |
| Google Meet | Alternate transport |
| Microsoft Teams | Alternate transport |
| YouTube Live | Simulcast / overflow |
| Vimeo Live | Simulcast / overflow |
| Future WebRTC / self-hosted | Independence from SaaS video |

CPOS never becomes dependent on a single video platform. Changing provider or simulcasting does not require rewriting story, timing, polls, or volunteer routing.

---

## Where Zoom APIs fit (long-term, not tonight)

Zoom supports integration at several layers. Use when Phase 2+ needs programmatic meeting lifecycle — not before launch crunch.

| Capability | Use in CPOS |
|------------|-------------|
| **Meeting SDK** | Embed Zoom inside CPOS / `/live` instead of sending users to the Zoom client only. [Meeting SDK docs](https://developers.zoom.us/docs/meeting-sdk/) |
| **REST APIs** | Create/update meetings, retrieve meeting info, scheduling automation. [API reference](https://developers.zoom.us/docs/api/) |
| **Webhooks** | CPOS reacts to start/end/join — e.g. waiting room → live, meeting end → post-meeting summary + volunteer sign-up. [Webhooks docs](https://developers.zoom.us/docs/api/webhooks/) |

**Example webhook flows (future):**

- Meeting starts → CPOS switches lobby from “Waiting” to “Live Meeting.”
- Meeting ends → CPOS shows post-meeting summary, volunteer sign-up, action items.

---

## Traceability hooks

| Phase | Likely slice IDs | Depends on |
|-------|------------------|------------|
| 1 | CPOS-1–4 | Manifest spec, election-plan auth |
| 2 | CPOS-5 `/live` lobby | DNS, optional Zoom REST |
| 3 | CPOS-6 realtime session | Supabase or dedicated sync service |
| 4 | CPOS-7 questions engine | WorkflowIntake / MESSAGE |
| 5 | CPOS-8 live polls | Session store + analytics |
| 6 | CPOS-9 volunteer routing | Power of Five, county leads, WorkflowIntake |
| 7 | CPOS-10 companion launcher | Presentation mode across Election Plan |
| 8 | CPOS-11 notes (naming collision — see broadcast layer) | AI summarization policy |
| 9 | CPOS-12 live timeline | Manifest + session sync |
| 10 | CPOS-13 broadcast UX | CPOS-11 transport abstraction |
| Transport | **CPOS-11 Live Broadcast Layer** | Provider adapters |

Update [`030-MASTER-TRACEABILITY-MATRIX.md`](./030-MASTER-TRACEABILITY-MATRIX.md) when slices are formally opened.

---

## Related docs

- [`CPOS_MASTER_BUILD_BIBLE.md`](./CPOS_MASTER_BUILD_BIBLE.md) — constitution
- [`CPOS_DESIGN_PASS_01_ERNIE_CONVERSATION.md`](./CPOS_DESIGN_PASS_01_ERNIE_CONVERSATION.md) — differentiators
- [`021-MEETING-MANIFEST-SPEC.md`](./021-MEETING-MANIFEST-SPEC.md) — manifest contract
- [`../NETLIFY_FIRST_DEPLOY.md`](../NETLIFY_FIRST_DEPLOY.md) — production deploy / Lambda env
- Manifest: [`data/cpos/manifests/kickoff-2026.yaml`](../../data/cpos/manifests/kickoff-2026.yaml)

---

## Conversation provenance

Captured from kickoff prep thread (2026-06-28): deploy fixes (`fs` / `server-only`, Netlify Lambda env), operator runbook, and Ernie/Steve phased vision (Zoom as transport, CPOS as control center, phases 1–10, multi-provider broadcast layer). Tonight stays Phase 1 only.
