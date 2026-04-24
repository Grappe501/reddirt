# Source ingest manifest — **folder pick list** (no active scan)

**Packet:** SOURCE-INGEST-FOLDER-TEMPLATE  
**Root:** `H:\SOSWebsite\campaign information for ingestion`  
**Scanned subtree:** *none* in **this** file — use for **choosing** the next folder. **Completed example:** [`26pmonro-proof4-manifest.md`](./26pmonro-proof4-manifest.md) (`26PMONRO_PROOF4`).

**Hard gate (this run):** `npm run ingest:election-audit:json` → **`status: COMPLETE`** (`ingestedCount: 13`, `missingCount: 0`). Gate **passed**; folder selection **missing**.

**Dry-run ingest:** *skipped* — no target folder / files classified.

---

## Candidate top-level folders (pick one, re-run packet)

| folder_name |
|-------------|
| `26PMONRO_PROOF4` |
| `Briefing Docs-20260421T211122Z-3-001` |
| `Comms-20260421T211118Z-3-001` |
| `Community Support Training-20260421T211114Z-3-001` |
| `Editorials-20260421T211104Z-3-001` |
| `electionResults` |
| `February Filing Details-20260421T211056Z-3-001` |
| `Kellymedia` |
| `March Filing Details-20260421T211053Z-3-001` |
| `Messaging -20260421T211017Z-3-001` |
| `Saved from Chrome-20260421T211011Z-3-001` |
| `Trainings-20260421T211007Z-3-001` |
| `Website photos-20260421T211003Z-3-001` |
| `Zine content-20260421T210959Z-3-001` |

**Note:** `electionResults` is **already** covered by [`ELECTION_INGEST_AUDIT.md`](../ELECTION_INGEST_AUDIT.md) for JSON tabulation; use this template for **non-election** brain/source trees unless you are auditing a **new** file type there.

---

## File inventory (empty until ACTIVE FOLDER is set)

| file_path | file_name | ext | size_bytes | modified_iso | likely_domain | recommended_parser | ingest_readiness | provenance_needed | notes |
|-----------|-----------|-----|------------|--------------|---------------|-------------------|------------------|-------------------|-------|
| — | — | — | — | — | — | — | **blocked** | — | Replace this manifest with `docs/source-ingest/<slug>-manifest.md` after scanning the chosen folder. |

---

## Parser backlog (when populated)

- *No recommendations until a folder is scanned.*
