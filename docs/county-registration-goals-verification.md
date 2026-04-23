# County registration goals — verification (GOALS-VERIFY-1) (RedDirt)

**Packet:** **GOALS-VERIFY-1** — trace **where** county voter registration **targets** live, **whether** an original **spreadsheet** is in-repo, and **what** to treat as **source of truth** for the next decomposition packet.

**Evidence date:** 2026-04-23 — inspection of `prisma/schema.prisma`, `src/lib/voter-file/*`, `src/app/admin/*`, `prisma/seed.ts`, and repo-wide search for `xlsx` / `csv` / `registrationGoal` / `countyGoal`. **No** Prisma schema changes in this packet.

---

## 1. WHAT WE FOUND

### 1.1 Spreadsheet or document source

| Question | Result |
|----------|--------|
| Is the **original** county voter registration goals **spreadsheet** committed **anywhere in this repository**? | **Not found.** There are **no** `.xlsx`, `.xls`, or goal-specific `.csv` data files under `RedDirt/`. (Glob and extension search; voter import expects **SOS** voter **CSV/TXT** — not goal targets.) |
| Could a goals spreadsheet live in **DB-backed uploads**? | **Possible in production data only, not in git.** The app has **`ComplianceDocument`** (admin PDF/image/spreadsheet retention; metadata `title` / `description` / `fileName`) and **`OwnedMediaAsset`** (DAM; creative assets). **Neither** is tied to `CountyCampaignStats` in Prisma. There is **no** migration or seed that loads county goals from an uploaded file. **Repository content** does **not** include a pre-loaded goals workbook. |
| **Scripts** that mention spreadsheets | `scripts/ingest-campaign-files-core.ts` uses `xlsx` to **extract text** from campaign file ingests (RAG/audit-style). **Not** used to populate `registrationGoal` / `countyGoal`. `package.json` includes `xlsx` for that pipeline, **not** for county goal import. |
| **Seed / demo** data | `prisma/seed.ts` sets **synthetic** `registrationGoal` / `countyGoal` (formula `5000 + i * 500`) for demo counties — **not** an import from an external master spreadsheet file in-repo. |

**Conclusion (Part A):** The **canonical original goals spreadsheet** is **not** present in the **RedDirt** repo as a file artifact. Registered targets are **stored as integers** on **`CountyCampaignStats`** and **mirrored** to **`CountyVoterMetrics.countyGoal`** by ETL. Any physical spreadsheet would be **out-of-band** (operations) unless staff later **uploaded** it to **`ComplianceDocument`** with descriptive metadata (not queryable from this packet without a live DB search).

### 1.2 Exact DB fields (Part B)

| Model | Field | Type (Prisma) | Role |
|-------|--------|---------------|------|
| **`CountyCampaignStats`** | `registrationGoal` | `Int?` | **Authoritative** campaign-entered (or admin-seeded) **county registration target**. Unique per `countyId`. |
| **`CountyVoterMetrics`** | `countyGoal` | `Int?` | **Denormalized copy** of `registrationGoal` for the **voter file snapshot** row, used with `progressPercent` and rollups. Written by `recomputeAllCountyVoterMetricsForSnapshot`. |
| (related, not a second “goal” definition) | `CountyVoterMetrics` `progressPercent` | `Float?` | **Derived** from `newRegistrationsSinceBaseline` / goal when goal &gt; 0, in the same recompute. |

**No other Prisma fields** in `schema.prisma` were found that store a **county registration goal** (search: `registrationGoal`, `countyGoal`). Fundraising / budget docs refer to **other** KPI types (`FundraisingKpiKey` in `fundraising.ts`) — **not** county reg targets on `County`.

---

## 2. CURRENT SOURCE OF TRUTH

- **Treat `CountyCampaignStats.registrationGoal` as the source of truth** for “what the campaign set as this county’s registration goal.”
- **Why:** It is the field **updated by admin** (`saveCountyCommandPageAction` in `county-admin-actions.ts`) and **read** as the **input** in `recomputeAllCountyVoterMetricsForSnapshot` (`recompute-county-voter-metrics.ts`), which then **copies** the value into `CountyVoterMetrics.countyGoal` and recomputes `progressPercent`.
- **`CountyVoterMetrics.countyGoal` is operational / reporting** for a **specific snapshot** — it should **match** `registrationGoal` after a successful recompute. If recompute has not run, UI may still show `stats.registrationGoal` via fallback (`CountyCommandExperience`: `vm?.countyGoal ?? stats?.registrationGoal`).

---

## 3. DATA FLOW (Part C)

1. **Origin (likely):** Campaign planning (spreadsheet or memo **outside** this repo) → **manual entry** in **admin** county editor, or **synthetic** values from **`prisma/seed.ts`** in dev.
2. **Into DB — write paths:**
   - **Admin UI:** `src/app/admin/counties/[slug]/page.tsx` (form field `registrationGoal`) → `saveCountyCommandPageAction` → `prisma.countyCampaignStats.update` / `create` with `registrationGoal`.
   - **Seed:** `prisma/seed.ts` → `countyCampaignStats` + `countyVoterMetrics` (demo).
3. **Voter file import** (`run-voter-file-import.ts` → `recomputeAllCountyVoterMetricsForSnapshot`): does **not** read goals from the voter file; it **uses existing** `CountyCampaignStats.registrationGoal` to fill **`CountyVoterMetrics.countyGoal`** and pipeline counters on `CountyCampaignStats` (`newRegistrationsSinceBaseline`, `dataPipelineSource: "sos_voter_file"`, etc.).
4. **Read / display:**
   - **Public:** `getCountyPageSnapshot` → `getLatestCountyVoterMetrics` + county with `campaignStats` → `CountyCommandExperience` (goal + progress).
   - **Read helpers:** `src/lib/voter-file/queries.ts` — `getLatestCountyVoterMetrics` (for latest **complete** snapshot).
5. **Evidence goals were “sent to counties”:** **Not found in app code.** There is **no** email template, `CommunicationSend`, or script in-repo that **exports** or **emails** per-county registration goals. **Public county pages** **do** display goals when populated — that is a form of **public** publication, not evidence of a **private** county-packet **distribution** without checking production comms history.

**Uncertainty:** If goals were **emailed** outside this app, that would not appear in the repo.

---

## 4. GAPS (Part D)

| Gap | Implication |
|-----|-------------|
| **No committed master spreadsheet** | Reconciliation with an external workbook requires **manual** comparison or a **one-off import** (not in-repo today). |
| **No volunteer-level goal model** | `VolunteerProfile` has **no** quota; only **`CountyCampaignStats.volunteerTarget` / `volunteerCount`** at county level (see `data-targeting-foundation.md`). |
| **No precinct-level registration goal** | `VoterRecord.precinct` is optional string; no precinct goal table. |
| **Duplicate display fields** | Operators must know **`registrationGoal`** is canonical; **`countyGoal`** is snapshot-scoped **mirror** for progress math. |
| **ComplianceDocument / DAM** | Could **hold** a scan of a goals sheet but **not** linked to `County` in schema — would be **attestation** only. |

---

## 5. NEXT BUILD STEP (Part E / packet suggestion)

- **Proposed next packet: GOALS-BREAKDOWN-1** (or **VOL-GOAL-1**): decompose **county** `registrationGoal` into **volunteer-** or **field-unit-** level targets, using existing **`FieldUnit` / `FieldAssignment`** and/or new **convention** on `Commitment.metadata` or `CampaignTask` — with explicit **schema** or **governance** choice (out of scope for GOALS-VERIFY-1).
- **Dependencies:** confirm **`CountyCampaignStats.registrationGoal`** is fully backfilled in production; run voter recompute so **`CountyVoterMetrics`** aligns.

---

## 6. REPO INSPECTION ANSWERS (Part F)

1. **Original spreadsheet in repo?** **No** committed file found; only **int** fields and **text** processing utilities (`xlsx` for generic ingest).
2. **Models/fields:** **`CountyCampaignStats.registrationGoal`**, **`CountyVoterMetrics.countyGoal`** (plus derived **`progressPercent`**).
3. **Source of truth now:** **`CountyCampaignStats.registrationGoal`** (admin + seed; ETL **reads** it to populate metrics).
4. **Distributed to counties?** **Public site** can show goals on **`/counties/[slug]`**; **no** in-repo **email/export** flow for “county packet” distribution.
5. **Missing for volunteer breakdown:** per-volunteer **quota** / **assignment** to a **sub-allocation** of the county goal; **Field-1** gives geography **structure** but **not** numeric splits.
6. **Next packet:** **County goal → volunteer / sub-unit decomposition** (see §5) after product confirms allocation rules.

---

*GOALS-VERIFY-1 — verification only; read-only code: `src/lib/campaign-engine/county-goals.ts`.*
