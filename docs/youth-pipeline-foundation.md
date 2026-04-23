# Youth pipeline — foundation (YOUTH-1) (RedDirt)

**YOUTH-1** defines a **governed, honest** way to talk about **young supporters** in the same **rails** as **ROLE-1** positions, **TALENT-1** advisory development, and **comms** — **no** productized “youth app,” **no** hidden scoring, **no** auto-promotion from signals alone.

**Code (types only):** `src/lib/campaign-engine/youth.ts` · **Cross-ref:** [`talent-intelligence-foundation.md`](./talent-intelligence-foundation.md) · [`compliance-governance-foundation.md`](./compliance-governance-foundation.md) · [`position-system-foundation.md`](./position-system-foundation.md) · [`field-structure-foundation.md`](./field-structure-foundation.md)

---

## 1. Youth entry roles (conceptual; map to positions later)

| Role | Intent |
|------|--------|
| **Youth Volunteer** | **Entry:** time-bound tasks, events, content help; high supervision, clear ask. |
| **Youth Organizer** | **Builds** small teams / peers; needs **mentor** alignment and **county/field** context when used (`FieldAssignment` **future**). |
| **Youth Leader** | **Visible, accountable** surface **only** with **adult** campaign oversight; never treated as a substitute for **legal** or **safety** sign-off. |

These are **naming** and **governance** guides until dedicated `PositionId` values or tags exist in a later packet.

---

## 2. Progression model (documentation — not a state machine in DB)

1. **Interest** → **Orientation** (expectations, code of conduct, comms rules).
2. **Participation** (tasks, shifts, content under review).
3. **Responsibility expansion** (organizer) **only** with **adult** validation.
4. **Sustained leadership** (leader) as **rare, explicit** campaign decision.

---

## 3. Training stages (conceptual)

- **Tier 0 — Safety & consent:** digital hygiene, no unsupervised PII; escalation paths; **COPA/FERPA-style** awareness without claiming legal compliance from software.
- **Tier 1 — Field / event:** check-in, buddy system, de-escalation basics.
- **Tier 2 — Comms & content:** **queue-first** posture; **no** unreviewed public posting as **youth** **without** staff approval path.

*Implementation is a future TALENT / training content packet; YOUTH-1 is vocabulary.*

---

## 4. Safety / governance (non-negotiables)

- **Youth are not a workaround** for **send**, **VAN**, or **compliance** rules.
- **Chaperoning / one-to-one** contact policies are **operational SOPs**, not encoded here.
- **All outbound** sensitive paths remain subject to **email workflow** and **comms** policy — **YOUTH-1** does not grant exceptions.

---

## 5. Communication style differences (for staff + future AI)

- Shorter, **specific** asks; **avoid** dense legal or fundraising jargon in **first-touch** copy.
- **Peer-led tone** is allowed in **drafts**; **adult** review before anything **public-facing** or **broadcast-scale**.

---

## 6. Connection to the position system

- Long term: **Youth** roles align as **leaves or overlays** on **Field** and **Volunteer** branches (`field_director` → `volunteer_coordinator` → `county_regional_coordinator` **pattern** in `src/lib/campaign-engine/positions.ts`).
- **YOUTH-1** does not add `PositionId` enum values; a later packet can extend **`POSITION_TREE`** with explicit youth seats if the campaign adopts them.

---

*Last updated: Packet YOUTH-1.*
