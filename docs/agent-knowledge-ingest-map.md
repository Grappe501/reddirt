# Agent — knowledge ingest map (SKILL-1) (RedDirt)

This is the **concrete** **checklist** of **what** must be **ingested** (or **authored** in-repo) so a **governed** **campaign** **agent** can act **reliably** **across** the skill domains in `docs/agent-skill-framework.md`. It **does** **not** replace **legal** or **compliance** **review**; it **informs** **RAG** **pipelines** (`SearchChunk` / `npm run ingest` paths) and **authoritative** **markdown** in `src/content/`, `docs/`, and **brand/philosophy** layers.

**Cross-ref:** `docs/agent-skill-framework.md` · [`compliance-agent-ingest-map.md`](./compliance-agent-ingest-map.md) (COMP-1 — **SOPs,** deadlines, **channel** **rules) **· [`compliance-document-ingest-foundation.md`](./compliance-document-ingest-foundation.md) (COMP-2 — **admin** **uploads) **· [`campaign-policy-foundation.md`](./campaign-policy-foundation.md) (POLICY-1) · [`budget-agent-ingest-map.md`](./budget-agent-ingest-map.md) (BUDGET-1) · [`federal-state-coordination-foundation.md`](./federal-state-coordination-foundation.md) · [`fundraising-agent-ingest-map.md`](./fundraising-agent-ingest-map.md) (FUND-1) · `docs/ai-agent-brain-map.md` · `scripts` / `ingest-campaign-brain` (as used in this repo)

---

## 1. Ingest priority tiers

| Tier | Meaning | Examples |
|------|---------|------------|
| **T1 (must, soon)** | Without these, the agent will **conflict** with **reality** or **brand** on **frequent** tasks | **Mission**+**values** pack, **governance** **boundary** one-pager, **approved** **messaging** **pillars** for 2026 race, **queue-first** and **E-1** SOP, **voter** **help** **facts** with **citations** |
| **T2 (high leverage next)** | Unlocks **multi-surface** quality (comms, field, training) | **Per-county** **talking** **points** (skeleton), **event** runbooks, **volunteer** **ramp** scripts, **opposition** **monitoring** playbooks (non-defamatory), **TALENT** path hints |
| **T3 (specialist / later)** | Nice-to-have; **deeper** **archives** | Historical **internal** **retros**, **opposition** book **depth**, **all** **county** **club** rosters, **long** **Q&A** **corpus** for edge cases |

*Matching code constants:* `KnowledgeIngestTier` in `src/lib/campaign-engine/skills.ts`.

---

## 2. Knowledge categories (and gaps)

The table **summarizes** “why / form / already partial? / unlocks / **scope**.” `IngestScope` values: `global` | `department` | `county` | `user` (not RBAC; describes **intended** **audience** of the **text**).

| Category | Why the agent needs it | Likely file forms | Partial repo support? | Unlocks | Scope (typical) |
|----------|------------------------|-------------------|----------------------|---------|-----------------|
| **Vision / mission / values** | **North star** for every draft, reply, and tradeoff | **MD** in `docs/philosophy/`, `docs/narrative/`, `src/content/background/`, or dedicated **RAG** pack | **Yes** (philosophy/brand/vision docs) | `campaign_alignment` | global |
| **Issue briefs & policy** | Stops the model from inventing **position** stances | PDF/MD, **citation**-heavy, **date**-stamped | **Partial** (narrative blocks; not always in `SearchChunk`) | alignment + comms | global |
| **Messaging frameworks** | **Approved** words, **forbidden** claims | Style guide MD, “stop saying X” | **Yes** in brand/philosophy | `communications_messaging` | global; dept for comms sub-layer |
| **SOPs / playbooks** | Consistent **ops** in workbenches | Step lists, **E-1**-aligned triage, **E-2** **override** | **Partial** (scattered; email workflow **intel** in docs) | `email_workflow_judgment`, `orchestration` | global + per-domain |
| **Position expectations (ROLE-1)** | Ground **seat** + **TALENT** in **duties** | `workbench-job-definitions`, future job aids | **Yes** in docs; **RAG** often empty | `volunteer_training`, `orchestration` | per position |
| **Escalation / governance** | **Stop** “model said send” on sensitive paths | ALIGN-1 + `HumanGovernanceBoundary` in **docs** + code comments | **Yes** in types; **RAG** light | `compliance_governance` | global |
| **County / district / maps** | Local proof points; no generic US maps | `County` **objects**, per-county page copy, JSON facts | **Yes** in Prisma + public pages; **RAG** varied | `county_local` | per county |
| **Voter education FAQs** | **Safe** public answers | `platform/` pages, `src/content/background/` | **Partial** | `public_voter_guidance` | global + state/county where customized |
| **Event / scheduling playbooks** | **HQ**-grade runs | Run-of-show, approval ladder | **Partial** (events in product; SOPs not always in RAG) | `scheduling_events` | global + event-type |
| **Volunteer training** | Path from **interested** → **trusted** | TALENT-1 **matrices**, `training.ts` | **Types** in repo; **content** not always ingested | `volunteer_training` | global + per role |
| **Compliance / do-not-cross** | Hard **stop** for finance/PII/401s | **Legal** one-pager, **DNC** policy, PII | **Gaps** in RAG; **rely** on human | `compliance_governance` | global; finance separate |
| **Opp / monitoring** | What we **do** in **rebuttal** vs ignore | `externalMediaMention` SOP, tone rules | **Product** for mentions; RAG for strategy often weak | `research_monitoring` | global + rapid response |
| **Data / file glossary** | No invented **NCO**/field meanings | Data dictionary, metric definitions | **Partial** in voter-file docs | `data_voter_file` | global for schema; op for cadence |
| **Press / media protocols** | Who speaks; **on**-record rules | Comms SOP, **comms** workbench | **Product**; **RAG** often thin | `content_media` | comms + principals |
| **Donor / finance (if applicable)** | **Regulatory** guardrails (high risk) | Finance policy, treasurers’ memo | **Usually external**; **ingest** only with **counsel** | `compliance_governance` (subset) | global; restricted read |
| **Lessons / retros** (optional) | Avoid repeating 2022 mistakes | Debriefs, post-mortem MDs | **Rarely in repo** | **RAG** for culture | user-edited, global if anonymized |

---

## 3. Ingest gaps (concrete, repo-observed)

- **Single “campaign canon”** — Docs exist in **patches**; **RAG** may not have **all** of `docs/philosophy` + `docs/brand` **in** the **same** **index** the assistant uses. **Ingest** **scripts** and **environments** must be run consistently (see `ai-agent-brain-map.md`).
- **Per-queue SOPs** — Email and **comms** have **UIs**; **SOPs** for **E-1** are **not** always **in** the **search** corpus in **one** place.
- **Local org reality** — **Names** and **sponsor** orgs in **counties** are **not** all **in** a **queryable** **table** the agent reads for **RAG** (often in **narrative** only).
- **Opp rebuttal** — **Monitoring** exists; a **narrative** **safety** and **factual** **footnoted** **opp** **book** is **often** **outside** the repo.
- **Volunteer** **content** — **TALENT-1** is **advisory** **types**; **training** **videos** / **quizzes** are not implied.

---

## 4. Recommended ingest order (practical)

1. **T1: Vision/values** + **forbidden-claims** list + **E-1 queue-first** and **E-2** one-page SOP (with links to `EmailWorkflowItem` workbench).  
2. **T1: Voter help** (official dates **with** **sources**) + **governance** boundary sheet (re-read `user-scoped-ai-context` + `alignment`).  
3. **T2: Messaging** pillars + **3** **issue** briefs the candidate will repeat — **cited** **sources** only.  
4. **T2: Per-county** one-pager **template** — fill for **pilot** counties (see `IngestScope.COUNTY`).  
5. **T2: Field** **event** runbook and **festival** **ops** (align with existing festival rails if you use them).  
6. **T3: Opp** and **data** **glossary** as you scale **RAG** **freshness** reviews.

*Each step should* **name** a **SkillDomain** and **IngestScope** in your internal tracker so the **RAG** **manifest** can be versioned (SKILL-1 is **naming** only in code; **you** can use **sheets** or **Linear** for execution).

*Last updated: Packet SKILL-1 (with ASSIGN-2).*
