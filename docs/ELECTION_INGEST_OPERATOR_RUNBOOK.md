# Election ingest — operator runbook (INGEST-OPS-3B)

**Purpose:** Run the **read-only** election file ↔ `ElectionResultSource` audit safely, understand **BLOCKED** / **PARTIAL** / **COMPLETE**, and ingest **only** missing JSONs when appropriate. **No** automatic ingest in the audit script. **No** migrations in this path.

**Related:** [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md) · [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md) · `npm run ingest:election-results` (Arkansas JSON)

---

## 1. Purpose

- Confirm which raw election `*.json` files under the campaign `electionResults` folder have a matching `ElectionResultSource` row in the **intended** Postgres.  
- Produce **machine-readable** output for CI or handoff (`ingest:election-audit:json`).  
- Optionally **refresh** the auto sections of [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md) (`ingest:election-audit:doc`).

---

## 2. Preconditions

| Check | Notes |
|-------|--------|
| **Postgres running** | e.g. `npm run dev:db` from `RedDirt/`, or your hosted DB. |
| **`DATABASE_URL` set** | Typically `RedDirt/.env` — the audit script loads that file with a small built-in parser (no `@next/env` dependency for plain `node`). |
| **`electionResults` folder present** | Default: `H:\SOSWebsite\campaign information for ingestion\electionResults` (or set `ELECTION_AUDIT_DIR` to a directory containing the JSONs). |
| **Prisma client** | `npx prisma generate` if the schema was updated (usual post-install). |

If Postgres is **down**, the audit **status** will be **BLOCKED** — that is **expected**; it is **not** an application bug.

---

## 3. Commands (from `RedDirt/`)

| Command | Action |
|---------|--------|
| `npm run ingest:inventory` | Refreshes [`INGEST_INVENTORY_GENERATED.md`](./INGEST_INVENTORY_GENERATED.md) (no DB). Run when the campaign folder tree changes. |
| `npm run ingest:election-audit` | Human-readable list + `status` line; prints DB error hint if **BLOCKED**. |
| `npm run ingest:election-audit:json` | **Single JSON object** to stdout: `status`, `dbReachable`, `ingestedCount`, `missingCount`, `files[]`, `dbError` if any. Per-file `existsInDb` is `true` / `false` or **`"unknown"`** when **BLOCKED**. Exits **0** even when **BLOCKED** (so preflight/CI can still pass). |
| `npm run ingest:election-audit:doc` | Rewrites the **auto** blocks in [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md) (path markers: table, summary, completion). |

**Optional environment (for `ingest:election-audit:doc` handoff):**

- `ELECTION_AUDIT_VERIFIED_AGAINST` — e.g. `local docker reddirt` or production identifier.  
- `ELECTION_AUDIT_OPERATOR` — your initials or name.  
- `ELECTION_AUDIT_NOTES` — one-line context.

---

## 4. How to read `status`

| `status` | Meaning |
|----------|---------|
| **BLOCKED** | Database could not be queried. `existsInDb` for each file is **unknown**; **do not** guess PARTIAL or COMPLETE. |
| **PARTIAL** | DB responded; **at least one** JSON has **no** matching row (`ingestStatus` **missing** for that file). |
| **COMPLETE** | DB responded; **every** scanned file has a matching `ElectionResultSource` row. |

`ingestedCount` and `missingCount` are `null` when **BLOCKED**; otherwise they count matched vs missing files in the **scanned** folder.

---

## 5. Ingesting missing files (only when PARTIAL)

1. **Identify missing** — use `ingest:election-audit:json` and look for `ingestStatus: "missing"`.  
2. **Order:** **newest → oldest** by campaign convention (see queue in [`INGEST_STATUS_AND_BACKLOG.md` §2.4).  
3. **Always dry-run first:**

```text
npm run ingest:election-results -- --dry-run --file "H:\SOSWebsite\campaign information for ingestion\electionResults\<file>.json"
```

4. **Apply** only if counts look reasonable and you are on the **correct** database:

```text
npm run ingest:election-results -- --file "H:\SOSWebsite\campaign information for ingestion\electionResults\<file>.json"
```

5. Re-run `npm run ingest:election-audit:json` until `status` is **COMPLETE** (or you accept **PARTIAL** with a **documented** waiver).

**Missing-file queue:** Treat the list of `missing` files as your only required ingests; do not re-run full-folder imports.

---

## 6. What not to do

- **No blind `--replace`** on rows you have not confirmed (risk of duplicating or wiping the wrong source).  
- **No migrations** as part of “finishing the audit” — migrate only via your normal **deploy** / **dev** process.  
- **No** assuming **COMPLETE** from docs alone if the last run was **BLOCKED**.  
- **GOTV** / Comms / Intelligence **automation** beyond the **Election Ingest Gate** (see [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md)) **until** **COMPLETE** or an **explicit** waiver.  
- **No** `npm run ingest:election-audit:doc` against **production** from an unreviewed machine unless you intend to commit that path’s truth to git.

---

## 7. Handoff format (after the operator runs the audit)

Paste or store:

1. **Output of** `npm run ingest:election-audit:json` (redact `DATABASE_URL` if embedded in any error).  
2. **Completion marker** from [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md) (auto block) after `ingest:election-audit:doc` **or** the manual template in that doc.  
3. **Environment name** (e.g. staging vs local).  
4. **List of any files still missing** (if **PARTIAL**) and the **next** file to run with dry-run.  
5. **Whether** `ingest:inventory` was refreshed (optional).

---

*INGEST-OPS-3B — operator runbook. Election ingest gate and **INGEST-OPS-4** next step are described in [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) and [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md).*
