# Ask Kelly · Manual of Everything — Access plan

**Purpose:** Align Dixie / Ask Kelly training on **approved manual knowledge** while keeping **campaign-system-manual** from leaking through public-facing retrieval or unattended ingestion.

**Scope:** RedDirt lane. No migrations assumed; behavior is documented for engineering + ops.

---

## 1. Current status (audit snapshot)

### `campaign-system-manual/` (~250+ markdown files)

- **Location:** Repo root sibling to `docs/` — **not** under `docs/`, therefore **not** picked up by `loadAllDocChunks` (which walks only `RedDirt/docs/**`).
- **Shape (representative):**
  - `workflows/` — lifecycle, onboarding pipelines, task queues, message distribution, field reporting, etc.
  - `roles/` — per-role READMEs (candidate, campaign manager, voter-file-data-steward, finance-lead, …).
  - `playbooks/roles/` — extended role playbooks (many specialties).
  - `web-presentation/` — IA, routes, visual design notes for a web manual.
- **Risk profile:** Contains **operational detail**, **RACI-style** expectations, and references to **data-heavy** work (voter file, finance, compliance). Treat as **staff / internal** unless a section is explicitly excerpted and reviewed for a **candidate- or volunteer-safe** audience.

### `docs/ask-kelly-public/` (ingested with `docs/**/*.md`)

- **Files (current):** `candidate-onboarding-and-safe-updates.md`, `dixie-voice-portal.md`.
- **Use:** **Public-safe** copy for `POST /api/assistant` RAG (`isAskKellyPublicSafeChunkPath` allows `docs/ask-kelly-public/...`).
- **Candidate training:** Yes, for **public** behavior explanations (drafts, saves, Dixie etiquette).

### `docs/ask-kelly-training/` · `docs/ask-kelly-admin/` (proposed)

- **Purpose:** Holds **reviewed** markdown destined for **`SearchChunk`** via standard `npm run ingest`, but **not** for the **public** allowlist unless explicitly copied into `docs/ask-kelly-public/`.
- **Default today:** Paths like `docs/ask-kelly-training/foo.md` are ingested as chunk paths prefixed `docs/ask-kelly-training/...`. They remain **out** of public Ask Kelly answers until `searchChunksForAskKelly` (or a future **admin-authenticated** assistant route) gains a **separate**, explicit allowlist — **do not widen public filters in the same change as corpus creation.**

### `scripts/ingest-docs.ts`

- Loads **all** markdown under **`docs/`** (`loadAllDocChunks`), plus structured site chunks, opposition intel chunks (labeled unverified), and route seeds — then **`deleteMany`** on `SearchChunk` and rebuilds IDs.
- **Destructive:** Full re-ingest replaces the chunk table; schedule with ops.
- **Does not** ingest `campaign-system-manual/` wholesale.

### `src/lib/openai/search.ts` + `src/app/api/assistant/route.ts`

- Public Ask Kelly uses **`searchChunksForAskKelly`**, which **filters** to `route:`, `brief:`, and `docs/ask-kelly-public/...` only (plus explicit denies for `intel:`, `external:`, etc.).
- **Internal manuals** must not be relied on for **public** answers without that filter; **do not** remove or relax without a dedicated security pass.

---

## 2. What Dixie can access today

| Surface | Access |
|--------|--------|
| **Dixie (admin UI)** | Browser speech → **local review box** on Candidate onboarding; no automatic API to campaign manual. |
| **Ask Kelly (public `/api/assistant`)** | System guide + **allowlisted** `SearchChunk` paths only (`docs/ask-kelly-public/`, routes, briefs). |
| **`campaign-system-manual` via RAG** | **No** unless manually excerpted into `docs/ask-kelly-public/` or a **future admin-only** retrieval path with its own allowlist. |

---

## 3. What is not chunked (from manual tree)

- **Entire** `campaign-system-manual/` directory (different root than `docs/`).
- **Unreviewed** internal playbooks — must not be bulk-copied into `docs/ask-kelly-public/` for public retrieval.

---

## 4. Safe corpus strategy

1. **`docs/ask-kelly-public/`** — Only material that is safe if a visitor-facing answer cites it (onboarding etiquette, Dixie privacy, save flows). **Human review before merge.**
2. **`docs/ask-kelly-training/`** — **Admin-safe, candidate-oriented** training maps: what to learn first, what dashboards do, what is staged — **no** raw voter/donor rows, **no** opposition research, **no** sealed strategy. Ingest for **future** admin-grounded guide; **not** public RAG today.
3. **`docs/ask-kelly-admin/`** (optional, later) — Staff-oriented supplements (SOP hints) with tighter ACL when an **admin Assistant** ships; same ingestion mechanism, separate route allowlist when implemented.

**Never for public RAG**

- Wholesale `campaign-system-manual/`.
- Opposition intel chunks (already labeled; denied for public Ask Kelly paths).
- Voter-file / donor / treasury narrative except aggregate, policy-reviewed copy.

---

## 5. Proposed folders

| Folder | Audience | Public RAG (today) | Ingest (`docs/`) |
|--------|-----------|---------------------|-------------------|
| `docs/ask-kelly-public/` | Voters / public guide | ✅ Allowed by filter | ✅ |
| `docs/ask-kelly-training/` | Kelly + trusted admins | ❌ Until route change | ✅ When files exist |
| `docs/ask-kelly-admin/` | Staff (future) | ❌ | ✅ When files exist |

**Future allowlist (document only — not implemented in V2.14):** e.g. `docs/ask-kelly-training/` + `docs/ask-kelly-admin/` for an **authenticated** `/api/assistant/admin` or similar, with **no** PII tools.

---

## 6. Ingest command

From **`RedDirt/`** (where `package.json` lives):

```bash
npm run ingest
```

**Requires:** `DATABASE_URL`, and ideally `OPENAI_API_KEY` (otherwise keyword-only / empty embeddings per script warnings).

**Note:** This run **replaces** all `SearchChunk` rows (see script). Coordinate with Steve for production timing.

---

## 7. Risks

| Risk | Mitigation |
|------|------------|
| Accidental public exposure of internal manual text | Keep public path allowlist **strict**; only put reviewed copy in `docs/ask-kelly-public/`. |
| Confusing “ingested” with “visible to Kelly in Ask Kelly” | UI + docs: public site uses **filtered** retrieval only. |
| Full ingest downtime / rebuild | Schedule `npm run ingest`; avoid parallel untested writes. |
| PII in training drafts | Review `docs/ask-kelly-training/` like external comms; no row-level data. |

---

## 8. References (code)

- `src/lib/openai/search.ts` — `isAskKellyPublicSafeChunkPath`, `searchChunksForAskKelly`
- `src/app/api/assistant/route.ts` — public assistant
- `scripts/ingest-docs.ts` — ingest entrypoint
- `src/lib/content/loadDocs.ts` — `docs/**` only
