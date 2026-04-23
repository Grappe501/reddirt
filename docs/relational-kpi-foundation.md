# Relational organizing — KPIs & goals (REL-1) (RedDirt)

**Packet REL-1 (Part E).** Volunteer-level metrics and **county roll-up** story for ROE—**no** new queries or tables in this packet.

**Cross-ref:** [`relational-organizing-foundation.md`](./relational-organizing-foundation.md) · [`pod-system-foundation.md`](./pod-system-foundation.md) · [`county-registration-goals-verification.md`](./county-registration-goals-verification.md) · [`data-targeting-foundation.md`](./data-targeting-foundation.md)

---

## 1. Volunteer-level KPIs

| KPI | Definition | Honesty notes |
|-----|------------|----------------|
| **Relationships added** | Count of relational contact rows owned by volunteer (future `RelationalContact`); today **not** queryable without REL-2. | Exclude deleted/archived when implemented. |
| **Confirmed registered (matched)** | Contacts with **confirmed** `matchedVoterRecordId` and file-backed “on roll” interpretation. | Not SOS-certified unless ops workflow says so. |
| **Unregistered identified** | Contacts explicitly tagged **not registered** / no file match with **intent to help register**. | Separate from **voter file new registrations** metric. |
| **Contacts reached** | Count where `contactStatus` ∈ {`REACHED`, `COMMITTED`, …} or last-contact timestamp set. | Define “reached” in SOP to avoid vanity counts. |
| **Commitments to vote** | Subset of contacts with `contactStatus = COMMITTED` (or future enum). | Self-reported; no legal guarantee. |

**Core 5 KPI:** Track separately—**coverage** of the five vs total contacts added—to reinforce Power-of-5 discipline.

---

## 2. County roll-up

**Intent:** Aggregate **all volunteers** whose **home county** (or assigned field county) resolves to the same **`County`** row.

1. **Sum** volunteer-level metrics (relationships, reached, commitments, matched voters).
2. **Compare** to **`CountyCampaignStats.registrationGoal`** as **context**—“organizing surface area”—not as a strict equality unless definitions align (e.g. “new registrations attributed to relational program” requires attribution pipeline).
3. **Show contribution toward goal** — Use **transparent** language: e.g. “N volunteers report M contacts in county; file shows R matched voters” vs “we closed X% of registration gap” (only if attribution is real).

**Double-count:** Multiple volunteers reporting the same contact inflates numbers—disclose or dedupe in REL-3.

---

## 3. Campaign-level roll-up

- Sum counties or use statewide volunteer totals; pair with **`CountyVoterMetrics`** / import cadence so **data** and **organizing** stories don’t contradict.

---

## 4. What exists today (Apr 2026)

- **County goals:** `CountyCampaignStats.registrationGoal`, mirror `CountyVoterMetrics.countyGoal`.
- **Volunteer profile:** no per-volunteer relational counters in Prisma.
- **`Commitment`:** could log coarse milestones in `metadata`—**not** a substitute for REL-2 KPI queries.

---

*Last updated: Packet REL-1.*
