# Recommended next build sequence (BLUEPRINT-LOCK-1) (RedDirt)

**Packet BLUEPRINT-LOCK-1 (Part F).** **Balanced** sequence to **lift weak integrations**, **connect existing assets**, and **avoid** comms-only overbuild. **Not** a commitment—**prioritization** for alignment.

**Inputs:** [`system-maturity-map.md`](./system-maturity-map.md), [`system-integration-map.md`](./system-integration-map.md), [`goals-system-status.md`](./goals-system-status.md), [`shared-rails-matrix.md`](./shared-rails-matrix.md).

---

## 1. Principles

1. **One integration seam per packet** where possible—**prove** data flows before thick UI.
2. **Field + identity before relational vanity**—don’t ship “dashboards” without **queryable** rows.
3. **Reuse** `User`, `County`, `FieldAssignment`, open-work—**don’t** fork queues.
4. **Comms** work **after** **truth** links when the feature is **organizing**-shaped, not **operator**-shaped.

---

## 2. Recommended packets (next 3–5)

### Packet 1 — **FIELD-GEO-2** (name flexible): `FieldUnit` ↔ `County` seam

- **Lifts:** Field / Organizing **behind** Communications; unblocks honest county captain + goals narrative.
- **Deliverable example:** optional `countyId` on `FieldUnit` **or** documented **slug** join + admin validation; **no** full GIS.
- **Avoids:** Building another county dashboard without fixing the **double geography** problem.

### Packet 2 — **REL-2** (minimal): `RelationalContact` + owner FK

- **Lifts:** Weakest **integration** spine (REL → KPIs → county story).
- **Deliverable:** Prisma model + **minimal** admin list or import-safe create; **human** voter match path per REL-1.
- **Avoids:** Full volunteer social app; REACH parity.

### Packet 3 — **UWR-2** or **ASSIGN-2b**: more sources + optional `positionId` stub

- **Lifts:** Campaign Manager **orchestration** to match **comms** depth; reduces operator scavenger hunt.
- **Deliverable:** Add **one** high-value source to unified list **or** add **optional** `positionId` / metadata on **one** work type **with** migration discipline.
- **Avoids:** Auto-router complexity—**read** first.

### Packet 4 — **GOALS-WIRE-1** (small): use `county-goals.ts` + field rollup story

- **Lifts:** **Dead** read helper and **goals visibility** on workbench/CM cards **without** new math.
- **Deliverable:** Call `listCountyRegistrationGoals` from **one** operator surface; document **FieldUnit** context when present.
- **Avoids:** Volunteer allocation math (separate packet if needed).

### Packet 5 — **VOL-CORE-2** (thin) **or** **GAME-2** (ledger)—pick **one** after REL-2

- **VOL-CORE-2:** volunteer home **shell**: path selection + “my county” + link to first action **if** REL-2 exists.
- **GAME-2:** **only** if ops **demand** progression **and** REL-2 events exist—else **fake** XP risk.

**Do not start both** in the same sprint without **separate** owners.

---

## 3. Explicit deprioritization (short term)

- **New** comms **execution** features **without** **REL-2** or **field↔county** seam—unless **pure** operator efficiency (email workflow) with **no** organizing claims.
- **Talent UI** before **observation** contract (TALENT-2) is scoped.
- **Youth** execution before **chaperone/governance** SOP is pinned.

---

## 4. Success criteria for “launch readiness” chunk

- [ ] **County** goals **visible** where operators work (not only public site).
- [ ] **Field** coverage **joins** to **`County`** without folklore.
- [ ] **Relational** rows **queryable** for at least one **pilot** county.
- [ ] **Open work** covers **≥1** additional incoming source **or** **position** metadata on **≥1** queue type.

---

*Last updated: Packet BLUEPRINT-LOCK-1 (Part F).*
