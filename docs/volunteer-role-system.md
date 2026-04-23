# Volunteer role system — culture roles ↔ positions (VOL-CORE-1) (RedDirt)

**Packet VOL-CORE-1 (Part B).** Maps **movement-facing volunteer titles** to **ROLE-1 `PositionId`** and **FIELD-1** coverage. These roles are **not** GAME-1 progression levels; they are **organizational jobs** (often **seated** via SEAT-1). **Docs only**—no schema.

**Cross-ref:** [`volunteer-philosophy-foundation.md`](./volunteer-philosophy-foundation.md) · [`position-system-foundation.md`](./position-system-foundation.md) · [`workbench-job-definitions.md`](./workbench-job-definitions.md) · `src/lib/campaign-engine/positions.ts` · [`field-structure-foundation.md`](./field-structure-foundation.md) · [`pod-system-foundation.md`](./pod-system-foundation.md) · [`relational-organizing-foundation.md`](./relational-organizing-foundation.md) · [`volunteer-progression-foundation.md`](./volunteer-progression-foundation.md)

---

## 1. Mapping rules

1. **Every row** below names a **`PositionId` anchor** from `positions.ts`. **Program labels** (e.g. “County Captain — Voter Registration”) are **human display** overlays—**VOL-CORE-2** may add `PositionSeat` notes or metadata conventions.
2. **Volunteers** who are **not** staff often appear as **`volunteer_general`** under **`volunteer_coordinator`**, while **county-scoped leaders** align with **`county_regional_coordinator`** or **`field_organizer`** depending on whether they **own geography** vs **execute** locally.
3. **GAME-1** describes **capability**; this doc describes **accountability**. A **County Captain** should typically be **Organizer+** in GAME-1 terms, but **seat assignment** is authoritative for **who** is captain.

---

## 2. Role catalog

### 2.1 County Captain (Voter Registration)

| Dimension | Definition |
|-----------|------------|
| **Responsibilities** | **Own** voter-registration organizing outcomes for a **county** (or defined slice): recruit and support volunteers, tie local work to **`CountyCampaignStats.registrationGoal`** narrative honestly, escalate data/file issues, coordinate with field and comms for **approved** materials. |
| **Primary `PositionId`** | **`county_regional_coordinator`** — use **program label** “County Captain (Voter Registration)” and **`FieldAssignment`** to a **COUNTY**-type `FieldUnit` (or mapped county). |
| **REL-1** | Champions **relational** program: Power of 5 adoption, POD check-ins, **quality** contact logging (future REL-2); county rollups in [`relational-kpi-foundation.md`](./relational-kpi-foundation.md). |
| **FIELD** | **`FieldAssignment`**: `fieldUnitId` + `positionId: county_regional_coordinator` + `userId` / `positionSeatId`; links captain to **operational geography** ([`field-structure-foundation.md`](./field-structure-foundation.md)). |
| **GAME-1** | Expect **County Contributor**–class progression for **full** captains; **not** required for **interim** or **acting** coverage—**human** staffing wins. Unlocks **county insights** align with [`volunteer-unlock-system.md`](./volunteer-unlock-system.md). |

### 2.2 Power-of-5 Evangelist

| Dimension | Definition |
|-----------|------------|
| **Responsibilities** | **Teach and multiply** the Core 5 model: help new volunteers name their five, run trainings or huddles, **pair** people with POD leaders, keep **relational discipline** from becoming a bulk list exercise. |
| **Primary `PositionId`** | **`field_organizer`** (reports under **`county_regional_coordinator`** in tree) **or** staff **`volunteer_coordinator`** when **cross-county** evangelism—pick **one** primary seat for accountability per person. |
| **REL-1** | **Core** to ROE: translates POD doc into **practice**; metrics on **how many** volunteers achieve Core 5 coverage vs raw contact count. |
| **FIELD** | Usually **`FieldAssignment`** within the county(ies) of focus; may span counties only with **Field Director** alignment. |
| **GAME-1** | Strong fit for **Network Builder** / **Team Leader** progression (mentoring XP); **achievements** around Core 5 completion of **others**. |

### 2.3 Fundraising Leader

| Dimension | Definition |
|-----------|------------|
| **Responsibilities** | **Volunteer-side** organizing for **donors and events**: house parties, call-time recruitment, small-dollar circles—**always** under **compliance** guardrails ([`talent-intelligence-foundation.md`](./talent-intelligence-foundation.md), FUND-1 docs). |
| **Primary `PositionId`** | **Volunteer lead:** **`volunteer_general`** with **supervision** from **`volunteer_coordinator`**; **compliance** touchpoints escalate to **`finance_director`** / **`compliance_director`** per campaign policy. **No** dedicated `fundraising_volunteer_lead` in `positions.ts` today—**ROLE-2** may add. |
| **REL-1** | **Secondary:** may run **relational** asks among **their** network; **not** the same as voter-registration ROE—keep **consent** and **messaging** separation clear. |
| **FIELD** | Optional **`FieldAssignment`** when fundraising is **county-scoped**; otherwise **regional** under coordinator. |
| **GAME-1** | **Leadership** and **event** XP where logged; **unlock** sensitive fundraising scripts **only** with **comms + finance** approval paths—stricter than generic organizer unlocks. |

### 2.4 Campaign Ambassador

| Dimension | Definition |
|-----------|------------|
| **Responsibilities** | **Public-facing** representative: shares **approved** narrative, recruits at events, routes interested people into **onboarding**, models **calm** leadership tone ([`volunteer-philosophy-foundation.md`](./volunteer-philosophy-foundation.md)). |
| **Primary `PositionId`** | **`volunteer_general`** under **`volunteer_coordinator`**, with **comms alignment** to **`communications_director`** program (not a separate `PositionId`). |
| **REL-1** | **Brings people into** relational program; may hold **own** Core 5; **does not** replace **Evangelist** training depth. |
| **FIELD** | Event- and county-based assignments via **`FieldAssignment`** when local. |
| **GAME-1** | **Recruitment** and **event** XP; progression toward **Organizer** / **Network Builder** when **network** work is real (post–REL-2). |

### 2.5 Event Manager

| Dimension | Definition |
|-----------|------------|
| **Responsibilities** | **Own** event execution: logistics, volunteer staffing, RSVP follow-through, **handoff** to field/comms for messaging—see **`events_manager`** in [`workbench-job-definitions.md`](./workbench-job-definitions.md). |
| **Primary `PositionId`** | **Staff / seated lead:** **`events_manager`** (parent: **`assistant_campaign_manager`**). **Volunteer deputy:** **`volunteer_general`** under **`volunteer_coordinator`** with **explicit** tasking from **`events_manager`**. |
| **REL-1** | Events are **on-ramps** to relationships: capture **follow-up** into ROE, not one-off crowds only. |
| **FIELD** | Events tie to **`CampaignEvent`**, counties, and optionally **`FieldUnit`** for **who** covers **where**. |
| **GAME-1** | **Event participation** XP for volunteers; **Team Leader** if **leading** volunteer crews **with** staff confirmation. |

---

## 3. Summary matrix

| Culture role | `PositionId` anchor | Typical parent |
|--------------|---------------------|----------------|
| County Captain (VR) | `county_regional_coordinator` | `field_director` |
| Power-of-5 Evangelist | `field_organizer` or `volunteer_coordinator` | `county_regional_coordinator` or `field_director` |
| Fundraising Leader | `volunteer_general` (+ coordinator / finance oversight) | `volunteer_coordinator` |
| Campaign Ambassador | `volunteer_general` | `volunteer_coordinator` |
| Event Manager (staff) | `events_manager` | `assistant_campaign_manager` |
| Event lead (volunteer) | `volunteer_general` | `volunteer_coordinator` (tasked by `events_manager`) |

---

*Last updated: Packet VOL-CORE-1 (Part B).*
