# Volunteer identity & profile evolution (GAME-1) (RedDirt)

**Packet GAME-1 (Part E).** Defines how **identity in the system** evolves from **signup** to **leader**: what is **visible**, what **story** the product tells, and how it connects to **`VolunteerProfile`**, future **`RelationalContact`**, and **position/seat** systems. **No schema changes** in this packet.

**Cross-ref:** [`volunteer-progression-foundation.md`](./volunteer-progression-foundation.md) · [`volunteer-data-gap-analysis.md`](./volunteer-data-gap-analysis.md) · [`relationship-data-model-foundation.md`](./relationship-data-model-foundation.md) · [`position-seating-foundation.md`](./position-seating-foundation.md) · [`relational-kpi-foundation.md`](./relational-kpi-foundation.md)

---

## 1. Identity stages (user-facing story)

| Stage | Who they are in-product | Emotional tone |
|-------|-------------------------|----------------|
| **Base profile** | “You’re here; we know your name, interests, and consent.” | Welcoming, low pressure. |
| **Active organizer** | “You’re **building a network** and having real conversations.” | Purposeful, reflective of REL-1. |
| **Leader** | “You **multiply others** and carry accountability for a slice of the field.” | Grounded pride, responsibility—not vanity rank. |

Stages map loosely to levels in [`volunteer-leveling-system.md`](./volunteer-leveling-system.md) but **stage** is **narrative**; **level** is **rules engine** input.

---

## 2. Profile evolution — concrete surfaces (future UI; spec only)

| Surface | New Volunteer | Active organizer | Leader |
|---------|---------------|------------------|--------|
| **“This is your level”** | Level name + **what it means** + next milestone | Same + **path** to Network Builder | **Leadership** milestones + **who you coach** |
| **“This is your network”** | Empty state + **how to add first relationships** (REL-2) | Core 5 / extended counts; **privacy** respecting contacts | Team/POD rollup; **delegation** summary |
| **“This is your impact”** | First actions celebrated (small wins) | REL-1 KPIs personal: reached, commitments, matches | County/regional contribution **where entitled** |
| **Visible progress indicators** | Onboarding checklist; **starter** achievements | XP **as explanation**, not casino points | **Achievements** tied to mentoring and scale |

---

## 3. Tie to `VolunteerProfile` (today)

Current fields (`availability`, `skills`, `leadershipInterest`, relations to comms/events) are **sparse** for progression UI. **GAME-2+** may add structured fields or a sidecar model; until then:

- **Conceptual** mapping: `leadershipInterest` → **hint** for **leader** path suggestions, not automatic level.
- **Skills** text → future structured **capability tags** aligned with TALENT-1.

---

## 4. Tie to future `RelationalContact`

- **Network identity** is **owned** relational rows: the volunteer **sees** their universe through REL-2 queries, not through generic CRM lists.
- **Impact** rolls up from **contact states** defined in [`relational-kpi-foundation.md`](./relational-kpi-foundation.md).
- **Privacy:** volunteers see **their** contacts; county rollups are **aggregated** with double-count disclosure.

---

## 5. Tie to position / seat system

- **Profile card** (future) shows **level** (VPE) and **seats held** (ROLE-1) **side by side**—clearly labeled.
- **Vacant seat** near a volunteer may show **“you’re eligible; talk to …”** when **unlock + TALENT recommendation** align—never auto-place.

---

## 6. Alignment and AI

- User-scoped AI context ([`user-scoped-ai-context-foundation.md`](./user-scoped-ai-context-foundation.md)) should **include** progression stage **only** to improve **coaching tone**, not to manipulate.

---

*Last updated: Packet GAME-1 (Part E).*
