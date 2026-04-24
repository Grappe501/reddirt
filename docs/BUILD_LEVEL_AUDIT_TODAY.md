# Build level audit — today’s pathway (BLUEPRINT-AUDIT-LEVEL-PATH-1)

**Packet:** **BLUEPRINT-AUDIT-LEVEL-PATH-1**  
**File:** `docs/BUILD_LEVEL_AUDIT_TODAY.md`  
**Purpose:** Single **read** for **today’s** build progression: division levels, blockers, what may advance **safely**, and **ordered** **next** packets. **Docs-only** audit — not a substitute for `prisma/schema.prisma` or live operator verification.

**Authoritative rails:** [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) · [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md) · [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) · [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md) · [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md) · [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md).

**COUNTY-INTEL-2 (implemented, 2026-04-24):** **`censusAcsBls`** on **profile**, **`aggregate-dropoff`**, **`registration-kpis`**, **`county-win-strategy`**, **`pope-briefing-bundle`**, **admin** **`/admin/county-intelligence`**, static **`emit:pope-county-intel`** → **`H:\SOSWebsite\dist-county-briefings\pope\`**, **zip** **`H:\SOSWebsite\pope-county-intelligence-briefing-site.zip`**, **`ingest:county-demographics`** (CSV) + **`data/county-intelligence/*`**, **`docs/registration-50k-plan.md`**. **Schema (migration, apply per env):** `CountyPublicDemographics` **JSON** fields, **`CountyRegistrationSnapshot`**, **`CountyStrategyKpi`**. **No** **individual** **targeting** on **static** **(aggregate** **only**); **person-level** **priority** **tables** **removed** from **`/admin/county-profiles`**. **Next:** **COUNTY-INTEL-3/4/5** per registry.

**COUNTY-PROFILE-ENGINE-1 (implemented, 2026-04-24):** reusable **`src/lib/campaign-engine/county-political-profile.ts`** + **`county-profiles/pope-county.ts`**; operator **`/admin/county-profiles`**, public **`/county-briefings/pope`**, static **`H:\SOSWebsite\dist-county-briefings\pope\`**, **zip** **`H:\SOSWebsite\pope-county-political-profile-site.zip`**, emitter **`scripts/emit-pope-county-profile-json.ts`**. FIPS/ name fallbacks for **`Election*`** when **County** **row** is **unmapped**; **relational** / **Power of Five** in **engagement** **plan**; **next:** **COUNTY-PROFILE-2** (map) · **COUNTY-PROFILE-3** (volunteer **action** **planner**). **No** **party** **fabrication**; **narrative** about **GOP/L** **dynamics** = **public-reporting-needed**.

**POPE-BRIEF-SITE-1 (implemented, 2026-04-24):** static Netlify-briefing drop at repo root **`H:\SOSWebsite\dist-pope-briefing\`** (HTML/CSS/JS + `data/briefing-data.json`) and packaged as **`H:\SOSWebsite\pope-county-kelly-briefing-site.zip`**. Uses election audit **`COMPLETE`**, **Pope** turnout rows from canonical SOS JSON **paths**, **Wikipedia-**ingest **population** **only** (ACS **unfilled** in **static** **packet**), and **Hammer** bill **rows** as **title-metadata** **from** **`arkleg-hammer-ingest-summary.dryrun.json`**. **No** **DB** **mutation**, **no** **external** **publish** **automation** **by** **this** **packet** — **POPE-BRIEF-SITE-2** **can** **add** **live** **read-only** **aggregates** **/** **ACS** **import**.

**Status snapshot (this doc pass):** `npm run ingest:election-audit:json` → **`COMPLETE`** (**13** / **13**, `dbReachable: true`) on **this** **local** **dev** **database** — **election** **gate** **was** **`COMPLETE`** **before** **GOTV-2** **contact-plan** **review** **work** **(verify** **per** **environment** **for** **other** **DBs**). `npm run test:openai-key` → **SUCCESS**. `npm run ingest:brain-manifest` → **refreshed** [`BRAIN_SOURCE_MANIFEST.md`](./BRAIN_SOURCE_MANIFEST.md) (**284** files). **INTEL-2:** [`COMPETITOR_INTELLIGENCE_MANIFEST.md`](./COMPETITOR_INTELLIGENCE_MANIFEST.md) **(docs** **implemented**). **INTEL-3** + **INTEL-4A:** Prisma opposition tables (migration `20260424180000_intel3_opposition_intelligence_schema` **applied** on **this** local dev DB) + `opposition-intelligence.ts` (full create helpers) + read-only **`/admin/intelligence`** + manual JSON **`ingest:opposition-intel`**, `data/intelligence/*` — **no** scraping, **no** bulk unvetted external ingest. **INTEL-4B-1** **started:** **curated** **`opponent-legislative-seed.json`** + **`opponent-video-seed.json`**, **legislative** **and** **official** **video** **prioritized**, **provenance** **warnings** **on** **`ingest:opposition-intel`** **for** **non-DRAFT** **rows** **missing** **URL/path**. **INTEL-4B-2:** **[`intelligence-source-collection-checklist.md`](./intelligence-source-collection-checklist.md)** + **legislative** **seed** **official** **portal** **sources** **only** — **verified** **`billRecords`** **still** **pending** (**no** **fabrication**). **INTEL-4B-3:** **`arkleg-review-shortlist.json`** + **`opponent-legislative-candidates.json`** (**discovery** **only**); **[`arkleg-intelligence-verification-worksheet.md`](./arkleg-intelligence-verification-worksheet.md)**; **`ingest:opposition-intel`** **`--require-approved`** for governed **live** **import**. **INTEL-BRIEF-2:** **`npm run brief:kim-hammer`** → **[`docs/briefs/kim-hammer-candidate-brief-tonight.md`](./briefs/kim-hammer-candidate-brief-tonight.md)** + talk sheet + source JSON/MD — **internal** **briefing** **only**; **verify** **before** **public** **use**. **Verify** **other** **environments** independently.

---

## 1. Executive summary

**Whole-system rollup:** The RedDirt campaign OS is **past “greenfield”** on core rails: **L2** persistence and **L2–L3** operator surfaces dominate; **no** division is **L5**; **GOTV** and **relational** **depth** remain the **highest-leverage** **gaps** relative to **CRITICAL** **priority**.

**Blocking level-up (cross-cutting):**

- **Environment truth:** Election ingest **`COMPLETE`** here does **not** prove **staging/production** — each DB needs `ingest:election-audit:json` or equivalent.
- **Data normalization:** **PRECINCT-1** (precinct string crosswalk) remains **open** — limits clean county/precinct storytelling and some planning math honesty.
- **Governance:** **Finance** / **compliance** and **bulk** **intel** **ingest** stay **approval-** and **parser-** **gated** — no “flip switch” to L4 automation without policy packets.

**What can be built today safely (typical):**

- **Docs / blueprint** sync (this audit, registry, ledger).
- **Read-only** or **review-only** **UI** and **read** **models** that **do** **not** **mutate** **money**, **send** **messages**, or **commit** **migrations** without an explicit packet.
- **INGEST-OPS-4** refresh (`ingest:brain-manifest`, `ingest:inventory`) — **read-only** **disk** **scans**.
- **INTEL-2** [**`COMPETITOR_INTELLIGENCE_MANIFEST.md`**](./COMPETITOR_INTELLIGENCE_MANIFEST.md) **(done** **as** **docs**); **INTEL-3** + **INTEL-4A** **shipped** (schema + migration per env, helpers, admin list, `ingest:opposition-intel`); **INTEL-4B-1** **curated** **seeds** + **stricter** **CLI** **provenance** **warnings**; **INTEL-4B-2** **source** **checklist** + **portal-only** **legislative** **seed** **update**; **FINANCE-1** / **VOL-DATA-1** as **mapping** **docs** until parsers exist; **full** **INTEL-4B** **parsers** / **bulk** **governed** **ingest** when **steered**.
- **GOTV-2** is **already** **shipped** (review-only contact plan); **GOTV-3** **design** or **thin** **read** **helpers** — **not** **assignment** **execution** **without** **packet**.

**AJAX Organizing Hub (Discord):** **Removed** from **active** **RedDirt** **build** **path** — **external** / **separate** **project** (see **Division table** and registry). **Historical** **mentions** in docs remain; **do** **not** **prioritize** **Discord** **integration** **in** **this** **repo’s** **queue**.

---

## 2. Division level table

| Division | Current level | Target next | Current evidence | Blocker | Today’s possible action | Recommended packet |
|----------|---------------|------------|------------------|---------|-------------------------|-------------------|
| **Data / Ingest** | **L2** (strong) | **L2+** stable contracts | Election JSON **CLI** + **`ElectionResultSource`**; **INGEST-OPS-4** manifest script; **BRAIN-STORAGE-1** runbook | **PRECINCT-1**; **other** **envs** may lag **canonical** **13** | Per-DB **`ingest:election-audit:json`**; refresh **`ingest:brain-manifest`**; **INGEST-OPS-5** when steered | **INGEST-OPS-5** (governed parser) · **PRECINCT-1** (when steered) |
| **Relational organizing** | **L2–L3** (partial) | **L3** | **REL-2** + **REL-3** **`/relational`**; touch logging | County **cross-volunteer** **rollups**; **merge** **workflow** | **Read-only** **rollup** **preview**; **docs** for **dedupe** **policy** | **REL-3** **hardening** / county rollups (packet per registry) |
| **Volunteer / Field** | **L2–L3** (partial) | **L3** | **REL-3** organizer UX; **FieldUnit** seams | Full **VOL-CORE** journey uneven | **Docs**; **read** **panels**; **no** **scope** **creep** **without** **steering** | **VOL-CORE-2** / field GEO (per registry) |
| **GOTV** | **L2** | **L3** (assignment handoff) | **GOTV-1** read model; **GOTV-2** **`/admin/gotv`** **review-only** | **GOTV-3** **not** **shipped**; **election** **gate** **must** **hold** **for** **execution** **automation** | **Design** **GOTV-3**; **validate** **contact** **plan** **preview** **on** **real** **DB** | **GOTV-3** **planning** (docs + thin code when packeted) |
| **Comms / Email** | **L2–L3** (partial) | **L3** | E-1/E-2 **queue** **patterns** | **Policy** **for** **auto-send** | **Queue** **triage** **docs**; **no** **blind** **send** **automation** | **COMMS** **depth** per steering |
| **Workbench / Operator** | **L2–L3** (partial) | **L3** | **UWR**, **CM** **bands**, **positions** | **Unified** **command** **story** **still** **partial** | **Read-only** **panels**; **ledger** **sync** **docs** | **WB-CORE** / **CM-2** **consumers** |
| **Campaign intelligence / Opposition intelligence** | **L1–L2** | **L2+** **pipelines** / **analysis** | **INTEL-OPS-1**; **INTEL-2** [`COMPETITOR_INTELLIGENCE_MANIFEST.md`](./COMPETITOR_INTELLIGENCE_MANIFEST.md); **INTEL-3** + **INTEL-4A** **tables** + helpers + `ingest:opposition-intel`; **INTEL-4B-1** **curated** **seeds**; **INGEST-OPS-4** | **Bulk** **unvetted** **INTEL** **ingest** **gated**; **full** **INTEL-4B** **parsers** **not** **shipped** | **Verified** **cited** **rows** **in** **seeds**; **INTEL-4B** **governed** **import** **/ parsers** | **INTEL-4B** |
| **Content / Author Studio** | **L1–L2** | **L2** | Scattered **routes** / **owned** **media** | **Unified** **author** **product** **missing** | **Governance** **alignment** **with** **comms** | **Content** packet when steered |
| **Finance / Compliance** | **L1** (guarded) | **L2** | **BudgetPlan**, **FinancialTransaction**, **ComplianceDocument** | **No** **bulk** **governed** **import** **CLI** **in** **repo** | **FINANCE-1** **mapping** **doc** **only** | **FINANCE-1** |
| **AJAX Organizing Hub** | **—** (**DROPPED**) | **N/A** (external) | **Historical** **Discord** **refs** in docs | **Out** **of** **RedDirt** **active** **build** | **None** **in** **this** **repo** — track **elsewhere** | *External project* |
| **Build protocol / Automation** | **L2** | **L2–L3** | **PROTO-2**, **AUTO-BUILD-1/2**, nightly **preflight** **workflow** | **Self-build** **must** **not** **bypass** **gates** | **Sync** **blueprint** **docs**; **tighten** **queue** **against** **this** **audit** | **AUTO-BUILD-1** **queue** **updates** |

---

## 3. Level-up pathway for today (rules)

1. **Election ingest:** If **`ingest:election-audit:json`** is **not** **`COMPLETE`** for the **intended** **DB**, **prioritize** **missing** **JSON** **ingests** (**dry-run** first) before claiming **GOTV** **execution** **or** **intel** **that** **assumes** **full** **tabulation**.
2. **OpenAI / embeddings:** If **`test:openai-key`** **fails**, **do** **not** **schedule** **bulk** **`SearchChunk`** **repair** or **RAG** **expansion** **that** **depends** **on** **embeddings** — fix **env** **first** (**OPENAI-KEY-OPS-1**).
3. **Brain manifest:** After **election** **COMPLETE** (for that env), **refresh** **`ingest:brain-manifest`** (and optionally **`ingest:inventory`**) before **treating** **brain** **folder** **expansion** **as** **unblocked**.
4. **GOTV-2:** **Not** **blocked** **by** **gate** **for** **read**/**review** — **already** **shipped**. **GOTV-3+** **execution** **remains** **governed** **by** **protocol** **and** **explicit** **packets**.
5. **INTEL-2** / **INTEL-3** / **INTEL-4A:** [`COMPETITOR_INTELLIGENCE_MANIFEST.md`](./COMPETITOR_INTELLIGENCE_MANIFEST.md) **(docs)** + **INTEL-3** **schema** / **helpers** / **`/admin/intelligence`** + **`ingest:opposition-intel`** (manual **JSON**; **no** **scraping**); **INTEL-4B+** **follows** **steering**; **automated** **opp** **ingest** **follows** **§6.4** **/** **§6.5** **/** **§6.6** **in** [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md).
6. **Finance:** **FINANCE-1** **stays** **mapping** **and** **policy** **until** **a** **named** **parser** **packet** **exists**.

---

## 4. Critical path (concise chain)

```text
DB migrated (per env)
  → Election ingest COMPLETE (per env — ingest:election-audit:json)
  → OpenAI key valid + SearchChunk/embeddings aligned to OwnedMedia batches (operator repair when needed)
  → Brain manifest normalized (ingest:brain-manifest) + ingest backlog honest (INGEST_STATUS…)
  → GOTV-2 review plan in use; GOTV-3 design toward assignment handoff
  → INTEL-2 competitor source manifest (docs) — see [`COMPETITOR_INTELLIGENCE_MANIFEST.md`](./COMPETITOR_INTELLIGENCE_MANIFEST.md)
  → INTEL-3 schema + helpers (shipped) + INTEL-4A manual JSON CLI (shipped) → INTEL-4B parsers / governed ingest → INTEL-5 analysis / dashboards (steered)
  → FINANCE-1 finance source mapping (governed)
  → VOL-DATA-1 volunteer list mapping (PII-aware)
```

---

## 5. Today’s queue (ordered packets)

**Conditional preamble**

- **If** election **`status` ≠ `COMPLETE`** **for** **target** **DB:** run **`ingest:election-results`** **for** **missing** **files** **only** (**`--dry-run`** first). **Do** **not** **queue** **GOTV** **execution** **automation** **or** **intel** **that** **assumes** **complete** **tabulation** **without** **labeling** **gaps**.
- **If** **`test:openai-key`** **fails:** **stop** **embedding** **repair** / **bulk** **RAG** **until** **key** **is** **fixed**.
- **If** **`ingest:brain-manifest`** **is** **missing** **from** **repo:** **restore** **script** **before** **treating** **INGEST-OPS-4** **as** **implemented** *(currently present: `npm run ingest:brain-manifest`)*.

| Order | Packet | Action |
|-------|--------|--------|
| **1** | **OPENAI-KEY-OPS-1** + **BRAIN-EMBED-1** | **`npm run test:openai-key`**; **`repair:owned-media-embeddings`** **per** **`mediaIngestBatchId`** **when** **chunks** **lag** **(operator)** |
| **2** | **INGEST-OPS-3** verification | **`npm run ingest:election-audit:json`** **per** **environment**; **close** **gaps** **or** **document** **PARTIAL** **honestly** (**not** **BLOCKED** **as** **COMPLETE**) |
| **3** | **INGEST-OPS-4** | **`npm run ingest:brain-manifest`**; optional **`ingest:inventory`** |
| **4** | **GOTV-2** | **Use** **existing** **`/admin/gotv`** **review** **surface**; **gather** **operator** **feedback** **→** **GOTV-3** **spec** |
| **5** | **INTEL-2** | **Complete** — [`COMPETITOR_INTELLIGENCE_MANIFEST.md`](./COMPETITOR_INTELLIGENCE_MANIFEST.md) |
| **5b** | **INTEL-3** | **Complete** — Prisma migration `20260424180000_intel3_opposition_intelligence_schema` + `opposition-intelligence.ts` + **`/admin/intelligence`** |
| **5c** | **INTEL-4B** | **INTEL-4B-1** **in** **progress** — **curated** **legislative** + **video** **JSON** **seeds**, **no** **bulk** **ingest**; **full** **parsers** / **connectors** **when** **steered**; **INTEL-4A** **CLI** **shipped** |
| **5d** | **INTEL-5** | **Analysis** + **dashboard** **layer** (**when** **steered**) |
| **6** | **FINANCE-1** | **Finance** **source** **mapping** **(docs)** — **no** **bulk** **RAG** **of** **raw** **exports** |
| **7** | **VOL-DATA-1** | **Volunteer** **list** / **field** **spreadsheet** **mapping** **(PII** **review)** |

**Local dev note (2026-04-24):** **Packet** **2** **(election** **audit)** **is** **satisfied** **here** (**`COMPLETE`**). **INTEL-2** **manifest** + **INTEL-3** + **INTEL-4A** (**migration** **applied**; **helpers**; **`ingest:opposition-intel`**) **landed** **this** **pass**. **INTEL-4B-1** adds **curated** **opponent** **seed** **files** and **importer** **provenance** **warnings**. **Next** **concrete** **work** **tends** **to** **shift** **to** **verified** **rows** **in** **those** **seeds**, **INGEST-OPS-5**, **full** **INTEL-4B** **parsers**, **FINANCE-1** / **VOL-DATA-1**, **and** **multi-env** **verification**.

---

## 6. Related operational docs

- [`CAMPAIGN_BRAIN_STORAGE_RUNBOOK.md`](./CAMPAIGN_BRAIN_STORAGE_RUNBOOK.md) — **BRAIN-STORAGE-1** governed **folder** **ingest** (**operator**; **not** **required** **for** **this** **audit** **pass**).
- [`BRAIN_SOURCE_MANIFEST.md`](./BRAIN_SOURCE_MANIFEST.md) — normalized **file** **table** (**regenerate** **after** **large** **drops**).
- [`shared-rails-matrix.md`](./shared-rails-matrix.md) — **cross-division** **dependencies**.

---

*Last updated: **BLUEPRINT-AUDIT-LEVEL-PATH-1** — **INTEL-2** [`COMPETITOR_INTELLIGENCE_MANIFEST.md`](./COMPETITOR_INTELLIGENCE_MANIFEST.md) + **INTEL-3** opposition **persistence**; **AJAX** **marked** **external/dropped** **for** **RedDirt** **active** **build**; **election** **+** **OpenAI** **+** **brain** **manifest** **commands** **run** **on** **this** **machine** **for** **snapshot** **only**.*
