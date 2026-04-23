# Delegation and coverage — foundation (SEAT-1) (RedDirt)

This doc **pairs** with [`position-seating-foundation.md`](./position-seating-foundation.md): **why** *coverage visibility* matters in a system that may scale from **one** person to **thousands**, and what **words** we use for **delegation** *without* implying **automated** routing in the current repo.

**Cross-ref:** [`campaign-manager-orchestration-map.md`](./campaign-manager-orchestration-map.md) · [`position-workbench-foundation.md`](./position-workbench-foundation.md) · `src/lib/campaign-engine/seating.ts` · `src/app/admin/(board)/workbench/seats/page.tsx`

---

## 1. Why coverage matters

- At **1 person**, the **org chart** is a **narrative**; **seats** can all point at one **user** for **planning** or stay **synthetic** vacant.
- As the **team** grows, **gaps** (vacant **director** seats, **nested** vacants) are **operational** **risk** even when **UWR-1** still **routes** on **user assignment** to objects.
- A **read-only coverage map** answers: **who** is the **named** **owner** in **each** `PositionId` slot, **where** are **vacancies**, and **where** should **orchestrators** look first — **without** a second “truth” for **task** **ownership**.

---

## 2. Delegation model (vocabulary)

| Term | Meaning |
|------|--------|
| **Filled seat** | `PositionSeat` has a `userId` and effective status `FILLED`, `ACTING`, or `SHADOW` (with user). |
| **Vacant seat** | No `userId` or `VACANT` / synthetic absent row. **Does not** mean “no work exists” in the domain. |
| **Inherited work** (concept) — **Not** a join table. When a sub-seat is vacant, the **org** still **has** the same **UWR-1** rows; the **narrative** is that the **parent** (e.g. CM) **absorbs** **visibility** **duty** in tooltips and workbench **copy** (see roll-up in `seating.ts`). **No** automatic **inherit** of `assignedToUserId`. |
| **Delegated work** (future) — **Actual** `assignedToUserId` / queue moves remain **ASSIGN-1** and **product**; SEAT-1 **names** the **seat** so **delegation** is **plannable**. |
| **Acting coverage** | `PositionSeatStatus.ACTING` + optional `actingForPositionKey` for **who** is being **covered** (human-entered, **not** automated). |
| **AI** vs **human** on staffing | **TALENT-1** may **suggest**; **SEAT-1** **records** what **humans** set on **`PositionSeat`**. **No** AI **writes** in SEAT-1. |

---

## 3. Campaign Manager view (minimum data)

What **CM** should **eventually** see (SEAT-1 **implements** a **subset** as **read-only** numbers + table):

- **Filled** and **vacant** seats in the **tree** (entire `POSITION_TREE` in `/admin/workbench/seats`).
- **High-load** seats — **not** in DB in SEAT-1; **documented** as **future** (workload from **UWR-1** counts or task metrics). **Not** promised in the coverage page today.
- **Shadow / trainee** — **Yes**, via `SHADOW` **status** when a **user** is **seated** that way.
- **Risky** **unfilled** **departments** — **Heuristic** only: **vacant** seat with at least one **vacant** **child** (see `getVacantSeatsWithUnfilledSubtrees`); **not** a business rules engine.

---

## 4. First real uses (immediate value)

- **Personalized workbench** — When **`userId`** is set, the **workbench** can show “**filled by** …” and future **TALENT** / **AI** can key off **`(userId, positionKey)`** **honestly** (see `personalized-workbench.ts` and position detail page).
- **Coverage map** — `/admin/workbench/seats` (links to **position** workbenches). **No** fake **occupants**.
- **Future position inbox narrowing** — Can filter “items **assigned to** the **occupant**” **in a** **later** packet; **UWR-1** already has **per-user** functions.
- **Talent / training targeting** — **SHADOW** + **user** = **unambiguous** **pair** for **training** rail **without** **permissions** **logic**.

*Last updated: Packet SEAT-1.*
