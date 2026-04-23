# Volunteer Progression Engine (VPE) — gamification foundation (GAME-1) (RedDirt)

**Packet GAME-1 (Part A).** Defines the **Volunteer Progression Engine**: a structured layer for **identity**, **momentum**, and **earned capability** on top of real organizing work—not cosmetic points. **Documentation only:** no UI, no Prisma migrations in this packet.

**Cross-ref:** [`relational-organizing-foundation.md`](./relational-organizing-foundation.md) (REL-1) · [`relational-kpi-foundation.md`](./relational-kpi-foundation.md) · [`pod-system-foundation.md`](./pod-system-foundation.md) · [`field-structure-foundation.md`](./field-structure-foundation.md) · [`position-system-foundation.md`](./position-system-foundation.md) · [`talent-intelligence-foundation.md`](./talent-intelligence-foundation.md) (TALENT-1) · [`volunteer-leveling-system.md`](./volunteer-leveling-system.md) · [`volunteer-xp-model.md`](./volunteer-xp-model.md) · [`volunteer-unlock-system.md`](./volunteer-unlock-system.md) · [`volunteer-identity-evolution.md`](./volunteer-identity-evolution.md) · [`gamification-ai-assist.md`](./gamification-ai-assist.md)

---

## 1. North star

| Pillar | Meaning |
|--------|---------|
| **Volunteers are building something, not completing tasks** | Progress reflects **network depth**, **trusted conversations**, and **leadership that multiplies others**—not checkbox throughput. Tasks and assignments are **instruments** for building durable organizing capacity. |
| **Progression is tied to real-world impact** | Every measurable advance maps to **registration awareness**, **commitment**, **recruitment**, **field coverage**, or **county-relevant outcomes** described in REL-1 KPIs and DATA-1 honesty rules. Vanity metrics that do not change voter contact or organizer capacity are out of scope. |
| **The system must feel meaningful, not gimmicky** | Language and rewards reinforce **identity as an organizer** and **stewardship of relationships**. There are no “streaks for streaks’ sake,” no loot-box framing, and no leaderboards that pit volunteers against each other in ways that erode trust networks. |

---

## 2. Core concepts

| Concept | Definition |
|---------|------------|
| **XP (experience)** | **Campaign experience**: a normalized ledger of **verified or honestly self-attested** organizing actions (see [`volunteer-xp-model.md`](./volunteer-xp-model.md)). XP is not currency; it is a **trace of value-creating activity** aligned with REL-1 KPIs. |
| **Levels / tiers** | **Named stages** of organizer maturity (e.g. New Volunteer → Regional Leader in [`volunteer-leveling-system.md`](./volunteer-leveling-system.md)). Levels combine **thresholds** (XP, demonstrated behaviors, optional human affirmation) with **unlocks**. Tiers may group levels for reporting without doubling identity complexity. |
| **Roles vs progression** | **Roles** (ROLE-1: positions, seats, assignments) are **organizational authority and accountability**. **Progression** is **earned organizer identity and capability** within or across roles. A volunteer may hold a seat while still “leveling” as a relational organizer; conversely, high progression does not imply a seat without human staffing decisions (TALENT-1: humans decide trust expansion). |
| **Achievements** | **Named milestones** that **explain** what happened (e.g. “Core 5 complete,” “First POD recruit,” “County registration helper—10 confirmed matches”). Achievements are **memorable narrative hooks**, not random collectibles; each maps to explicit KPIs or leadership behaviors. |
| **Unlocks** | **Concrete changes in what the system allows**—templates, scripts, capacity limits, training modules, assignment powers, visibility (see [`volunteer-unlock-system.md`](./volunteer-unlock-system.md)). Unlocks reward **trust and competence**, not time-on-site. |
| **Momentum** | **Recency-weighted continuity** of value-creating actions: staying in relationship with one’s network, following up on commitments, showing up for field moments. Momentum informs **coaching and suggestions**, not punishment; it is distinct from manipulative “urgency.” |

---

## 3. Principles

1. **No fake points** — XP entries require a **defensible event** (log row, REL-2 contact state change, task completion, staff attestation where needed). No awarding XP for page views or empty clicks.
2. **No meaningless badges** — Badges/achievements **teach** what good organizing looks like and **correlate** to REL-1 / county narratives; if an achievement cannot be explained to a county lead in one sentence, it does not ship.
3. **Every action must map to campaign value** — Each XP source ties to **relational depth**, **electorate understanding**, **turnout/registration support**, **volunteer multiplication**, or **operational reliability** (see shared rails in [`shared-rails-matrix.md`](./shared-rails-matrix.md)).
4. **Progression must align with leadership growth** — Level-ups **unlock** coaching others, assigning work, seeing rollups, and leading PODs—capabilities that match **increased responsibility**, not cosmetic rank.
5. **The system must reinforce relational organizing** — Progress celebrates **named relationships** and **human conversations** (REL-1), not anonymous bulk actions; FIELD and seat structures provide **place and accountability** for that work.

---

## 4. Repo inspection (GAME-1) — questions answered

Grounded in `prisma/schema.prisma`, [`database-table-inventory.md`](./database-table-inventory.md), [`volunteer-data-gap-analysis.md`](./volunteer-data-gap-analysis.md), REL-1 docs, FIELD-1, ROLE-1, TALENT-1, and `src/lib/campaign-engine/`.

### 4.1 What existing models could track XP-like behavior?

| Model / area | Relevance |
|--------------|-----------|
| **`Commitment`** (`type`, `metadata` JSON) | **Ad hoc** per-user milestones; could log structured commitment types (e.g. `ROE_CONTACT_REACHED`) if schemas are validated—**not** a full XP ledger today. |
| **`CampaignTask`** | **Completion** and **timeliness** are observable labor units; map to “operational reliability” XP if policy defines which task categories count. |
| **`EventSignup` / `VolunteerProfile.eventSignups`** | **Participation** events for event-attendance XP. |
| **`FieldAssignment` + `FieldUnit`** | **Geographic / program** attachment for county- or unit-scoped bonuses and unlock rules. |
| **`PositionSeat` / positions** | **Role context** for unlocks (“can assign work” is a seat/position concern, not only XP). |
| **Future `RelationalContact` (REL-2)** | **Primary** source for relationship, reach, commitment, and match KPIs that should drive most ROE XP. |
| **`Submission` / forms** | **Onboarding** and **intent** signals; use sparingly for XP to avoid form spam—prefer confirmed organizing events. |

### 4.2 What existing data could already be used for progress tracking?

- **Task completion counts**, **overdue patterns** (TALENT-1 signals).
- **Event signups** and attendance if reconciled with check-in workflow (gap: unified “hours served” not on `VolunteerProfile` per volunteer gap analysis).
- **`FieldAssignment`** for “serves county X / unit Y.”
- **`VolunteerProfile.leadershipInterest`** as a **binary** intent flag—not a ladder.
- **Comms / queue** participation where the volunteer is a **`QueueTargetVolunteer`** or recipient—useful for **engagement**, not automatically for ROE XP without SOP.

### 4.3 What parts of the system already resemble progression?

- **TALENT-1** (`talent.ts`, `training.ts`): **advisory** development, **observation** categories, **no auto-promotion**—same **human-finality** boundary VPE must respect.
- **ROLE-1 / SEAT-1**: **positions and seats** as **formal** steps in responsibility; VPE **unlocks** should align when a volunteer is **staffed** vs merely **eligible**.
- **ASSIGN-1 / open work**: **assignment** as the **operational** spine; progression can gate **who may assign** or **what work appears** in “for me” views (future product).
- **REL-1 KPI doc**: **already defines** the **honest** metrics progression should amplify once REL-2 exists.

### 4.4 What is missing for real gamification?

- **No `RelationalContact`** (or equivalent)—**no** durable per-volunteer network to score ROE actions in DB.
- **No `VolunteerProfile` progression fields** (level, XP totals, unlock flags)—by design not added in GAME-1.
- **No append-only “organizing event” or XP ledger**—would be needed to avoid double-counting and to audit claims.
- **No volunteer-facing ROE or progression UI**—docs only through GAME-1.
- **Deduping / attribution** for “same contact, two volunteers” (called out in REL-1 KPI doc) unresolved.

### 4.5 What would be easiest to implement first?

1. **Document-backed XP catalog** (this packet + [`volunteer-xp-model.md`](./volunteer-xp-model.md)) agreed with ops.
2. **Pilot on `Commitment.metadata` or a small set of `CampaignTask` categories**—minimal schema surface if events already exist.
3. **Read-only “progress summary” for admins** (future GAME-2) aggregating tasks + events + field assignment—before any volunteer-facing UI.
4. After **REL-2**, migrate **primary** XP sourcing to relational row transitions.

### 4.6 What should GAME-2 include?

- **Schema proposal**: optional `VolunteerProgressionState` and/or `OrganizingEvent` ledger; enums for **action types**; idempotency keys.
- **Admin UI**: progression audit, manual adjustment with reason, export.
- **Integration contracts**: REL-2 hooks, FIELD-1 scope, position-based unlock enforcement in `assignment.ts` / open-work read model.
- **AI assist registration** in `ai-brain.ts` / provenance for VPE suggestions (see [`gamification-ai-assist.md`](./gamification-ai-assist.md)).
- **Policy**: anti-gaming, appeal flow, and **parity** with TALENT-1 (no automated promotion).

---

*Last updated: Packet GAME-1 (Part A + repo inspection).*
