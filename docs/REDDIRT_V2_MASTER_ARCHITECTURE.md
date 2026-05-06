# RedDirt V2 — Master architecture doctrine

## Title and status

| Field | Value |
|-------|--------|
| **Document** | RedDirt V2 — Master architecture doctrine |
| **Packet** | **REDDIRT-V2-ARCH-REGISTRY-1.0** |
| **Lane** | `RedDirt/` only |
| **Status** | **Active doctrine** — planning and architecture truth for humans and agents; **not** a substitute for `src/**` or Prisma for runtime behavior |
| **Machine registry** | [`data/architecture/reddirt_v2_layer_registry.json`](../data/architecture/reddirt_v2_layer_registry.json) (`schemaVersion` **1.0**, twelve `layers[].key` entries) |
| **External system matrix** | [`data/architecture/reddirt_v2_external_system_review_matrix.json`](../data/architecture/reddirt_v2_external_system_review_matrix.json) |
| **Cursor roadmap seed** | [`data/architecture/reddirt_v2_cursor_roadmap_seed.json`](../data/architecture/reddirt_v2_cursor_roadmap_seed.json) |
| **Source of truth policy** | [`REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md`](./REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md) |
| **Consolidation review policy** | [`REDDIRT_V2_CONSOLIDATION_REVIEW_POLICY.md`](./REDDIRT_V2_CONSOLIDATION_REVIEW_POLICY.md) |
| **Registry execution report** | [`develop_notes/REDDIRT_V2_ARCH_REGISTRY_1_0_REPORT.md`](../develop_notes/REDDIRT_V2_ARCH_REGISTRY_1_0_REPORT.md) |
| **Read-only scan snapshot** | [`data/architecture/reddirt_v2_arch_scan_snapshot.json`](../data/architecture/reddirt_v2_arch_scan_snapshot.json) — regenerate: `node scripts/reddirt-v2-architecture-scan.mjs` |
| **Registry validator** | `node scripts/validate-v2-arch-registry.mjs` |

**Companion narrative (Comms V2 vision):** [`email-command-center-v2-master-blueprint.md`](./email-command-center-v2-master-blueprint.md) · [`email-command-center-v2-agent-planning-harness.md`](./email-command-center-v2-agent-planning-harness.md)  
**Division continuity:** [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) · [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md) · [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md) · [`system-division-map.md`](./system-division-map.md)

---

## What RedDirt V2 is

**RedDirt V2** is the evolution of the **RedDirt campaign operating system** from a collection of strong subsystems into a **governed, documented, machine-mapped** statewide OS: comms, memory, operations, scheduling, audience intelligence, automation, analytics, content, compliance, self-build discipline, and deployment honesty—**under explicit human approval** for anything that touches voters, money, sends, or production data.

V2 adds **architecture registry artifacts** (`reddirt_v2_layer_registry.json`, external matrix, roadmap seed) so **future Cursor packets** can state which **layer** they touch, which **paths** are allowed, and which **proofs** are required—without improvising scope.

ECC (Email Command Center) remains a ** flagship** subsystem inside RedDirt; V2 layers **cross-cut** the whole app, not only email.

---

## What RedDirt V2 is not

- **Not** permission to merge sibling apps (`sos-public`, `ajax`, `phatlip`, `countyWorkbench`, ACU lanes) into `RedDirt/` or vice versa **without** Steve-approved integration packets.  
- **Not** autonomous campaign control: no blind sends, no silent automation activation, no worker/cron “helpfulness” that bypasses review.  
- **Not** a replacement for **counsel**, **finance sign-off**, or **hosted DB verification** narratives in docs.  
- **Not** a claim that **local Docker green** equals **Kelly-Grappe-App hosted** production readiness.  
- **Not** an instruction to put **Prisma, `/admin`, voter-file tooling, or ingest pipelines** on the **public** website boundary.

---

## Core operating philosophy

1. **Queue-first** for sensitive and outbound-adjacent workflows.  
2. **AI-assisted, human-governed** — recommendations and drafts are advisory until humans and doctrine say otherwise.  
3. **Source-grounded** — claims and “memory” outputs must be traceable to approved sources; inference labeled as inference.  
4. **Governance is infrastructure** — no-send posture, scans, ledgers, and readiness UIs are first-class.  
5. **Honest readiness** — labels like *operator-proven* or *hosted-ready* require **evidence**, not marketing copy.  
6. **Slice discipline** — work ships as **named packets** with allowed paths, forbidden paths, and checks (see roadmap seed phases).  
7. **Public boundary hygiene** — RedDirt informs the public site; it does not **become** the public app (see **Public website interface boundary** below).

---

## V2 layer map

The machine registry defines **twelve** `layers[].key` values. They align conceptually with the **A–H** narrative in [`email-command-center-v2-master-blueprint.md`](./email-command-center-v2-master-blueprint.md) but use **stable slugs** for JSON and tooling.

| Registry `key` | Doctrine summary |
|------------------|-------------------|
| `communications_intelligence` | Queue, Message Studio, Gmail metadata paths, SendGrid foundations, governed send doctrine |
| `campaign_memory` | SearchChunk, manifests, retrieval readiness, opposition/county intel under governance |
| `operational_intelligence` | Workbench, UWR, Daily console, task intelligence metadata |
| `scheduling_intelligence` | Calendar workbench, sync, planning APIs — tentative holds and governance later |
| `audience_relationship_intelligence` | Profiles, audiences, GOTV read surfaces, relational consumers |
| `automation_intelligence` | Policy evaluation, shells — activation only via explicit future packets |
| `analytics_deliverability_intelligence` | Readiness, drilldowns, health cards — no new provider send APIs from analytics builders |
| `owned_media_content_intelligence` | Author Studio, content boards, owned media — feeds narrative, not queue replacement |
| `compliance_governance_safety` | No-send scan, send execution rails, audit posture |
| `self_build_intelligence` | AUTO_BUILD protocol, nightly preflight, scanners, validators |
| `deployment_environment_readiness` | Hosted DB gates, Netlify constraints, local vs hosted honesty |
| `public_site_interface_boundary` | Doctrine for `sos-public` vs RedDirt — **not** a build order for the public repo |

---

## Communications intelligence

**Intent:** Turn communications work into **structured, reviewable** operator workflows with **traceable** tooling (queue, Message Studio, Gmail review, SendGrid surfaces, editorial desk, send governance).

**Grounded in:** [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md), [`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md), [`email-ai-intelligence-upgrade-closeout.md`](./email-ai-intelligence-upgrade-closeout.md).

**Doctrine:** Provider execution and queue sends stay **gated**; AI panels enrich triage and drafting but **do not** replace approval. ECC routes under `/admin/workbench/email-command-center` and `/admin/workbench/email-queue` are the **primary** comms operator surfaces unless a packet moves that narrative.

---

## Campaign memory / knowledge graph

**Intent:** **Institutional memory** — indexed material, manifests, honest `SearchChunk` / embedding stats, and (when steered) retrieval that **avoids contradictions** with known campaign positions.

**Doctrine:** Ingestion, licensing, and PII boundaries are **separate explicit packets**; the OS must not “helpfully” bulk-ingest third-party or copyrighted corpora. Opposition and county intelligence remain **governed** per existing intel docs.

**Links:** [`BRAIN_SOURCE_MANIFEST.md`](./BRAIN_SOURCE_MANIFEST.md), [`email-ai-campaign-memory-readiness.md`](./email-ai-campaign-memory-readiness.md), [`email-ai-intelligence-architecture-audit.md`](./email-ai-intelligence-architecture-audit.md).

---

## Operational intelligence

**Intent:** **What needs human attention next** across workbench surfaces—Daily console, open work, task intelligence metadata, queue triage—without pretending the system has closed loops it does not have.

**Doctrine:** Task intelligence writes **advisory** metadata (e.g. `metadataJson.emailTaskIntelligence`); **no** auto `CampaignTask` creation or calendar writes from this posture unless a future packet explicitly introduces governed automation there.

---

## Scheduling intelligence

**Intent:** Use existing **calendar infrastructure** (sync engines, workbench calendar UI, planning/suggest APIs) as the base for **tentative holds**, **prep blocks**, and **travel-aware** suggestions—always below human approval for anything that affects principals or public calendars.

**Doctrine:** Calendar mutations and external notifications are **high risk**; ship as small packets with governance gates (see roadmap seed `phase_4_scheduling_intelligence`).

---

## Audience / relationship intelligence

**Intent:** Evidence-first **profiles** and **audiences**, GOTV read models, relational hints—**approve** paths for facts, explicit drafts for audience definitions, no auto-merge into core identity tables.

**Doctrine:** SendGrid contact sync and sends are **not** the same thing; microtargeting depth grows only with **governed** exports and hosted truth.

---

## Automation intelligence

**Intent:** **Policy visibility** and **safe shells**—operators see why automation would or would not fire; workers and cron remain **off** until explicit activation packets.

**Doctrine:** `EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM` and automation activation are **constitutional**-level; architecture docs do not relax them.

---

## Analytics / deliverability intelligence

**Intent:** **Read-only** operator truth—drilldowns, sync health, suppression context, readiness scores—fed from bounded Prisma reads and snapshots, not from new “shadow send” paths.

**Doctrine:** Analytics builders must not introduce **provider send** calls; failures surface as **blocked / degraded** with next actions.

---

## Owned media / content intelligence

**Intent:** **Author Studio**, content boards, and owned media pipelines support **message quality** and **comms**—without collapsing editorial responsibility into automation.

**Doctrine:** Public publication flows go through **human** review; any machine handoff to `sos-public` is **contract-based** (future slices), not implicit bundling.

---

## Compliance / governance / safety

**Intent:** **No-send scan**, send execution doctrine, import gates, finance/compliance adjacency, and **honest** operator manuals.

**Doctrine:** `npm run email:no-send-scan` is a **heuristic** guardrail—WARN on legacy integration files is a **known baseline**, not permission to add new risky callsites under `email-command-center`.

---

## Self-build intelligence

**Intent:** **Controlled** continuation—AUTO_BUILD protocol, nightly preflight, **read-only** architecture scanners, registry validator—so agents can extend the repo **without** silent scope creep.

**Doctrine:** Self-build **never** bypasses migrations policy, secrets rules, or outbound execution gates.

---

## Deployment / environment readiness

**Intent:** **Kelly-Grappe-App / Supabase** and Netlify constraints are **first-class**—local success does not imply hosted canonical DB.

**Doctrine:** `DATABASE_URL` / `DIRECT_URL` proof chains are **operator-owned**; the ledger **Deployment** row stays capped until evidence exists.

---

## Public website interface boundary

**`sos-public/`** is the **clean public campaign website boundary** for the Kelly Grappe for Arkansas Secretary of State public site.

**Current contents are placeholder and may be fully redesigned.**

**RedDirt must not be merged into `sos-public`.**

**`sos-public` must not import `RedDirt/src/**`.**

**RedDirt may provide reviewed content, data, and strategy through explicit contracts in future slices** (e.g. export formats, handoff schemas, human-in-the-loop publish checklists)—not through runtime coupling, shared Prisma, or hidden admin surfaces on the public app.

For machine-enforced defaults on sibling folders, see [`reddirt_v2_external_system_review_matrix.json`](../data/architecture/reddirt_v2_external_system_review_matrix.json) and layer `public_site_interface_boundary` in the registry JSON.

---

## Readiness and proof doctrine

| Label | Meaning |
|-------|---------|
| **Local / code present** | Implemented in repo; may still be **blocked** for production use. |
| **Hosted-ready** | **Evidence** that hosted `DATABASE_URL` / migrations / gates succeeded on the **intended** Supabase project—not loopback. |
| **Operator-proven** | A human has executed the documented chain (e.g. test send, import commit) on the target environment and recorded outcome. |
| **Execution-gated** | Code paths may exist; **doctrine** forbids or constrains execution until gates pass. |

**Proof artifacts** belong in the relevant packet docs and ledgers—never substitute narrative for **migrate status**, **no-send scan**, or **contact-import gate** output.

---

## Future Cursor packet doctrine

Future packets should:

1. **Name the layer(s)** from the registry they affect (`communications_intelligence`, …).  
2. **Declare `allowedPaths` / `forbiddenPaths`** (see [`reddirt_v2_cursor_roadmap_seed.json`](../data/architecture/reddirt_v2_cursor_roadmap_seed.json) for seed patterns).  
3. **List `proofRequired`** (`npm run typecheck`, `npm run check`, `npm run email:no-send-scan`, hosted gates, operator logs).  
4. **Update** [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) / [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md) when **division reality** moves; ECC work also updates [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md).  
5. **Run** `node scripts/validate-v2-arch-registry.mjs` when `reddirt_v2_layer_registry.json` changes.

Packets are **sequenced hints** in the roadmap seed, not automatic execution.

---

## Open risks and unresolved decisions

1. **Hosted canonical DB** — Until Kelly-Grappe-App verification completes, imports and production-class upserts remain **high risk** even when local UI works.  
2. **Operator-proven mail** — Governed send code may exist; **proof** of hosted test/broadcast is still a **human** artifact.  
3. **Campaign memory depth** — Retrieval and graph expansion require **ingest/licensing** packets not covered by this doctrine alone.  
4. **Automation activation** — Worker/cron policy when steered must not erode no-send and approval doctrine.  
5. **Workspace-root system maps** — `RedDirt_CampaignOS_SystemMap_*` may be absent on some clones; registry remains valid from **`RedDirt/docs/**`** but drift detection vs root exports is **unresolved**.  
6. **Public handoff contracts** — Exact JSON/Markdown contracts for RedDirt → `sos-public` **content** handoffs are **future** (`REDDIRT-PUBLIC-SITE-INTERFACE-CONTRACT-1.0` seed)—must stay **reviewed** and **explicit**.

---

## Appendix — Read-only architecture scanner

**Script:** [`scripts/reddirt-v2-architecture-scan.mjs`](../scripts/reddirt-v2-architecture-scan.mjs)

- Reads: `docs/`, `develop_notes/`, `src/`, `prisma/`, `scripts/` under `RedDirt/`.  
- Lists workspace parent directory **names only**.  
- Writes **only** `data/architecture/reddirt_v2_arch_scan_snapshot.json` (or `--stdout-only`).  
- **Never** mutates `sos-public` or sibling app sources.

---

*Last updated: **REDDIRT-V2-ARCH-REGISTRY-1.0** — Deliverable D: master architecture doctrine (human-readable).*
