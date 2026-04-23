# Volunteer XP / action model (GAME-1) (RedDirt)

**Packet GAME-1 (Part C).** Defines **what generates XP** and how actions tie to **REL-1 KPIs**. Numbers below are **illustrative** until ops calibration; structure is **contract** for future implementation.

**Cross-ref:** [`relational-kpi-foundation.md`](./relational-kpi-foundation.md) · [`volunteer-progression-foundation.md`](./volunteer-progression-foundation.md) · [`volunteer-leveling-system.md`](./volunteer-leveling-system.md) · [`relationship-data-model-foundation.md`](./relationship-data-model-foundation.md)

---

## 1. Principles

- **One event, one primary XP classification** — Avoid double-counting; **multiplier** rules (e.g. leadership bonus) apply in code later, not by duplicate logging.
- **Human-sent comms** — REL-1 / BRAIN-1 posture: XP for **outreach attempts** assumes **human** send or **human** live conversation, not autonomous sends.
- **Honest states** — Match REL-1 KPI honesty: “confirmed registered” follows **confirmed** `matchedVoterRecordId` + ops interpretation, not raw optimism.

---

## 2. REL-1 KPI → XP mapping

| REL-1 KPI (from [`relational-kpi-foundation.md`](./relational-kpi-foundation.md)) | XP-bearing action (concept) | Notes |
|----------------------------------------------------------------------------------|------------------------------|--------|
| **Relationships added** | Create **relational contact** row (REL-2) with minimum viable fields | **Small** base XP; **no** XP for imports without human review if policy forbids. |
| **Confirmed registered (matched)** | Transition contact to **matched + on-roll** interpretation | **Larger** XP; requires **confirmed** match workflow. |
| **Unregistered identified** | Tag **unregistered** + **intent to help register** | **Medium** XP; must be **explicit** state, not “unknown.” |
| **Contacts reached** | Set `contactStatus` / last-contact to **REACHED** (or SOP equivalent) | **Medium** XP; define “reached” in SOP to prevent vanity. |
| **Commitments to vote** | `contactStatus = COMMITTED` (or future enum) | **High** XP; self-reported—optional **staff spot-check** for leaders. |
| **Core 5 KPI** | **Coverage** milestone: all five Core 5 slots **meaningfully** engaged | **Bonus** XP (achievement) on top of per-contact XP. |

---

## 3. Action catalog (XP sources)

Illustrative **base XP bands** (tune later):

| Action | Base XP (illustrative) | KPI / value link |
|--------|------------------------|-------------------|
| **Add relationship** | 5–15 | Relationships added |
| **Confirm voter registration (file-backed)** | 20–40 | Confirmed registered |
| **Identify unregistered + plan to help** | 15–30 | Unregistered identified |
| **Outreach attempt** (logged, human) | 5–10 | Leads to reached |
| **Confirmed conversation** (SOP: two-way) | 15–25 | Contacts reached |
| **Commitment to vote** | 30–50 | Commitments to vote |
| **Event participation** (check-in) | 10–25 | Field + community presence |
| **Recruit new volunteer** (completed onboarding) | 40–80 | Multiplication |
| **Leadership actions** (scoped assign, POD check-in, mentor session) | 15–40 each | Leadership growth; may cap per week |

**Decay / caps:** Optional **weekly soft cap** per action class to limit gaming; **no** public leaderboard required.

---

## 4. FIELD and operational modifiers

| Modifier | Use |
|----------|-----|
| **`FieldAssignment` to high-priority unit** | Small **multiplier** or **bonus** when county goals warrant—**staff-configured**, transparent. |
| **County goal proximity** | Narrative hook only unless attribution is real (per REL-1 roll-up honesty). |
| **Data quality flags** | **Freeze** XP accrual on disputed rows until resolution. |

---

## 5. Anti-patterns (no XP)

- Bulk-imported contacts **without** organizer attestation.
- **Duplicate** contacts across volunteers **without** dedupe strategy (per REL-1 double-count callout).
- **Automated** message sends scored as personal outreach.
- **Clicking** UI with no organizing outcome.

---

## 6. Implementation note (future)

Persist **event types** as enums aligned with this catalog; store **idempotency** key `(volunteerId, contactId, transition, date)` for REL-2 state changes.

---

*Last updated: Packet GAME-1 (Part C).*
