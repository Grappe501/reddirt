# Goals system status — county registration goals (BLUEPRINT-LOCK-1) (RedDirt)

**Packet BLUEPRINT-LOCK-1 (Part D).** **DB-truth** and **code-truth** for **county registration goals**. **No** invented formulas; **no** spreadsheet claims without evidence.

**Authoritative prior audit:** [`county-registration-goals-verification.md`](./county-registration-goals-verification.md) (GOALS-VERIFY-1). **Schema:** `prisma/schema.prisma` — `CountyCampaignStats.registrationGoal`, `CountyVoterMetrics.countyGoal`.

---

## 1. Are county goals present in the DB?

**Yes, as Prisma fields.**

- **`CountyCampaignStats.registrationGoal`** (`Int?`) — **unique** per `countyId`; treated as **campaign-entered source of truth** in GOALS-VERIFY-1.
- **`CountyVoterMetrics.countyGoal`** (`Int?`) — **per voter-file snapshot** row; **populated from** `CountyCampaignStats.registrationGoal` during **`recomputeAllCountyVoterMetricsForSnapshot`** (see `src/lib/voter-file/recompute-county-voter-metrics.ts`, which **selects** `registrationGoal` from related campaign stats and writes **`countyGoal`** on metrics rows).

**What this repo does *not* contain:** a committed **xlsx/csv** “master goals” file in git; seed uses **synthetic** values in `prisma/seed.ts` per verification doc.

---

## 2. Are they actively used anywhere?

**Yes — but not via every documented helper.**

| Path | Role |
|------|------|
| **Admin county command** | `src/app/admin/counties/[slug]/page.tsx` — form field **`registrationGoal`**; `src/app/admin/county-admin-actions.ts` — **`prisma.countyCampaignStats.create/update`** with `registrationGoal`. |
| **Public county page** | `src/components/county/CountyCommandExperience.tsx` — displays `vm?.countyGoal ?? stats?.registrationGoal ?? null` from **`CountyPageSnapshot`**. |
| **Voter metrics recompute** | `recompute-county-voter-metrics.ts` — copies goal from **`CountyCampaignStats`** into **`CountyVoterMetrics.countyGoal`**. |

**`src/lib/campaign-engine/county-goals.ts`:** defines **`listCountyRegistrationGoals`** and **`getCountyRegistrationGoalByCountyId`**. **Repo-wide search (Apr 2026):** **no** `src/` importer **calls** these functions—they are **available but unused** by other modules. Goals are still **active** via admin + public snapshot + recompute paths above.

---

## 3. Are they connected to volunteers?

**No, in the sense of per-volunteer quotas or attribution.**

- **`VolunteerProfile`** has **no** registration-goal or progress fields tied to county targets ([`volunteer-data-gap-analysis.md`](./volunteer-data-gap-analysis.md)).
- **County-level** volunteer targets exist only as **`CountyCampaignStats.volunteerTarget`** / **`volunteerCount`** (campaign stats), **not** per-person allocation in this schema.

**REL-1** docs describe **honest** comparison of relational KPIs to goals; **that comparison is not implemented** as automated queries without REL-2.

---

## 4. Are they connected to field units?

**No FK or enforced link in Prisma between `FieldUnit` / `FieldAssignment` and `CountyCampaignStats`.**

- Goals are keyed by **`countyId`** on **`CountyCampaignStats`** (public **`County`** model).
- **FIELD-1** operational geography is **`FieldUnit`** + **`FieldAssignment`**; **GEO-1** documents that **`FieldUnit`** is **not** FK-linked to **`County`** in v1.

**Implication:** a **county captain** scoped to a **`FieldUnit`** cannot rely on the database alone to **prove** that unit maps to the same **`County`** row as **`registrationGoal`** without **application convention** or a **future** migration.

---

## 5. Are they connected to KPIs?

| KPI layer | Connection |
|-----------|------------|
| **`CountyVoterMetrics`** | **`countyGoal`** is **stored** alongside file-derived counts; **progress** fields on metrics (e.g. **`progressPercent`**) are **pipeline-defined**—this doc does **not** restate the formula; see recompute implementation and UI consumers. |
| **REL-1 relational KPIs** | **Not in DB** as queryable relational aggregates—**documentation only** until REL-2. |
| **GAME-1 XP** | **Not connected** to goals—GAME-1 is **not implemented** in schema. |

---

## 6. If goals feel “incomplete,” what is actually missing?

1. **Operational backfill:** Production DB may need **`CountyCampaignStats`** rows for all active counties; that is **data ops**, not inferred from this repo.
2. **No spreadsheet import path** in code for goals—staff enter via **admin** (or seed). **Re-uploading a spreadsheet** does **nothing** unless **someone** builds an import or **manually** transcribes into admin fields.
3. **No volunteer or field-unit decomposition** of `registrationGoal` in schema.
4. **Unused read helper:** wiring **`county-goals.ts`** into dashboards/workbenches would improve **discoverability** but does not change **source of truth**.

---

*Last updated: Packet BLUEPRINT-LOCK-1 (Part D). Evidence: static repo inspection + GOALS-VERIFY-1.*
