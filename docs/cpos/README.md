# Campaign Presentation OS (CPOS)

**Lane:** `H:\SOSWebsite\RedDirt` only.  
**Packet:** **CPOS-FOUNDATION-1** (Phase 1 — no implementation assumptions).  
**Status:** **Pass 02 IA complete** — kickoff **2026-06-28 tonight**. Implementation slices **CPOS-1+** ready to start. **No meeting UI shipped yet.**

CPOS is a **major Campaign OS division**: manifest-driven live presentations that sync presenter and audience, embed Campaign OS demos, wire volunteer journeys, and accumulate institutional meeting memory.

**First ship target:** Kelly SOS **team kickoff meeting** — implemented as **manifest `kickoff-2026`** on the shared engine, not a one-off page.

---

## Read order (new thread)

1. [`CPOS_MASTER_BUILD_BIBLE.md`](./CPOS_MASTER_BUILD_BIBLE.md) — constitution (engines, philosophy, guardrails).
2. [`CPOS_DESIGN_PASS_02_INFORMATION_ARCHITECTURE.md`](./CPOS_DESIGN_PASS_02_INFORMATION_ARCHITECTURE.md) — **routes, files, components, schemas, tonight slice**.
3. [`021-MEETING-MANIFEST-SPEC.md`](./021-MEETING-MANIFEST-SPEC.md) + [`data/cpos/manifests/kickoff-2026.yaml`](../../data/cpos/manifests/kickoff-2026.yaml).
4. [`030-MASTER-TRACEABILITY-MATRIX.md`](./030-MASTER-TRACEABILITY-MATRIX.md).
5. [`CPOS_DESIGN_PASS_01_ERNIE_CONVERSATION.md`](./CPOS_DESIGN_PASS_01_ERNIE_CONVERSATION.md) — differentiators + decisions (locked in Pass 02).

**Cross-ref:** [`../unified-campaign-engine-foundation.md`](../unified-campaign-engine-foundation.md) · [`../MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md`](../MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md) · [`../POWER_OF_5_RELATIONAL_ORGANIZING_SYSTEM_PLAN.md`](../POWER_OF_5_RELATIONAL_ORGANIZING_SYSTEM_PLAN.md) · [`../campaign-events/ORCHESTRATION_BUILD_ROADMAP.md`](../campaign-events/ORCHESTRATION_BUILD_ROADMAP.md) (Phase 8 presentation polish) · Election Plan routes under `src/app/election-plan/`.

---

## Four design phases (Ernie frame — adopted)

| Phase | Focus | Gate to next phase |
|-------|--------|-------------------|
| **1 — Foundation** | What CPOS *is*; engines; guardrails; differentiators | Steve + Ernie sign **constitution** + resolved **Pass 1 decisions** |
| **2 — Information architecture** | Every route, component, JSON object, directory | Traceability matrix complete; schemas draft-validated |
| **3 — UX Bible** | Presenter feel, audience feel, motion, late-join, mobile | UX acceptance criteria for kickoff manifest |
| **4 — Build slices** | Incremental implementation packets | Per-slice `npm run check` green |

---

## Documentation registry (~30 docs)

Status: **Planned** until Phase 2/3 authors fill them. Do not implement from stubs alone.

| ID | Doc | Phase | Status |
|----|-----|-------|--------|
| 000 | Constitution (in Master Bible) | 1 | **Draft** |
| 021 | Meeting Manifest Specification | 2 | **Draft** |
| 030 | Master Traceability Matrix | 2 | **Draft** |
| Pass 02 | Information Architecture | 2 | **Complete** |
| 001 | Vision | 1 | Planned |
| 002 | System Architecture | 2 | Planned |
| 003 | Meeting Engine | 2 | Planned |
| 004 | Timeline Engine | 2 | Planned |
| 005 | Presenter Console | 3 | Planned |
| 006 | Audience Experience | 3 | Planned |
| 007 | Storytelling Framework | 1/3 | Planned |
| 008 | Animation Standards | 3 | Planned |
| 009 | Media Engine | 2 | Planned |
| 010 | Demo Engine | 2 | Planned |
| 011 | Presentation Views | 2 | Planned |
| 012 | Interaction Engine | 2 | Planned |
| 013 | Volunteer Journey | 2 | Planned |
| 014 | Analytics | 2 | Planned |
| 015 | Meeting Builder | 4 | Planned |
| 016 | Component Library | 3 | Planned |
| 017 | Accessibility | 3 | Planned |
| 018 | Performance | 2 | Planned |
| 019 | State Management | 2 | Planned |
| 020 | JSON Schemas | 2 | Planned |
| 021 | Meeting Manifest Specification | 2 | **Priority** (blocks coding) |
| 022 | Chapter Specification | 2 | Planned |
| 023 | Cue Specification | 2 | Planned |
| 024 | Timing Specification | 2 | Planned |
| 025 | Animation Timing Standards | 3 | Planned |
| 026 | Presenter Notes Format | 2 | Planned |
| 027 | Campaign Integration Points | 2 | Planned |
| 028 | Election Plan Integration | 2 | Planned |
| 029 | Future ACU Integration | 4 | Planned |
| 030 | Master Traceability Matrix | 2 | Planned |

**Future code homes (Phase 2 — not created yet):**

- `docs/cpos/` — specifications (this tree).
- `data/cpos/manifests/` — meeting YAML/JSON (kickoff first).
- `src/lib/cpos/` — engines, manifest compiler, session protocol.
- `src/components/cpos/` — audience + presenter UI.
- `src/app/election-plan/team-kickoff/` — audience + presenter routes (IA locked).

---

## Hard constraints (all phases)

- **RedDirt lane only** — no `sos-public`, AJAX, PhatLip, countyWorkbench code edits without integration packet.
- **No deletes** of existing routes; CPOS adds surfaces.
- **No real PII** in manifests, fixtures, or smoke tests.
- **No secret values** in docs, manifests, or logs.
- **Queue-first volunteer data** — interactions suggest profile updates; humans or governed automation confirm.
- **Presentation mode** for demos must not expose admin-only data to anonymous audience links without explicit auth policy.
